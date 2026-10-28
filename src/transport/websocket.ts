import type { SDKConfig, ResponseCallback, TaskPayload } from '../types/sdk'
import type { ConnectionState, WebSocketTransport, WsResponse } from '../types/transport'

import { createRunwareError, type RunwareError } from '../errors'
import { userAgent } from '../user-agent'

const RECONNECT_DELAY_CAP_MS = 30000
const RECONNECT_JITTER_MS = 1000
const ASYNC_RESEND_MIN_AGE_MS = 1000

const READ_ONLY_TASK_TYPES = new Set([
  'getResponse',
  'getTaskDetails',
  'modelSearch',
  'accountManagement',
])

const canResend = (task: TaskPayload): boolean =>
  READ_ONLY_TASK_TYPES.has(task.taskType) || task.deliveryMethod === 'async'

type InFlightRequest = {
  task: TaskPayload
  sent: boolean
  sentAt: number
  resent: boolean
  resendScheduled: boolean
}

/**
 * Exponential backoff for reconnect. Cap is applied to the base exponent only,
 * with jitter added on top, so simultaneously-reconnecting clients still spread
 * out at the upper bound (otherwise they'd all land on the same 30s tick).
 */
export const computeReconnectDelay = (
  retryDelay: number,
  attempt: number,
  randomFn: () => number = Math.random,
): number => {
  const base = retryDelay * Math.pow(2, attempt - 1)
  const capped = Math.min(base, RECONNECT_DELAY_CAP_MS)
  const jitter = randomFn() * RECONNECT_JITTER_MS
  return capped + jitter
}

export const createWebSocketTransport = (config: SDKConfig): WebSocketTransport => {
  // WebSocketLike covers both browser WebSocket and the ws package.
  // Methods/props are accessed dynamically below.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let ws: any = null
  let connectionState: ConnectionState = {
    connected: false,
    lastActivity: Date.now(),
  }
  let pingInterval: ReturnType<typeof setTimeout> | null = null
  let isReconnecting = false
  let reconnectAttempt = 0
  let shouldReconnect = true
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null
  let keyRejection: RunwareError | null = null

  // Per-taskUUID routing prevents concurrent tasks from overwriting callbacks
  const taskCallbacks = new Map<string, ResponseCallback<WsResponse>>()
  const inFlight = new Map<string, InFlightRequest>()

  const setupHeartbeat = () => {
    if (pingInterval) {
      clearInterval(pingInterval)
    }

    pingInterval = setInterval(() => {
      if (!connectionState.connected) {
        return
      }

      try {
        const pingMessage = JSON.stringify([{ taskType: 'ping', ping: true }])
        ws.send(pingMessage)
      } catch (error) {
        config.log.heartbeat('Ping failed, reconnecting', error)
        reconnect()
      }

      // Server drops connections after 120s of inactivity
      const inactivityTime = Date.now() - connectionState.lastActivity
      if (inactivityTime > 100000) {
        config.log.heartbeat(`No activity for ${inactivityTime}ms, reconnecting`)
        reconnect()
      }
    }, 30000)
  }

  // Wrap every per-task callback invocation so a throwing user callback can't
  // kill the dispatch loop (which would prevent later tasks in the same frame
  // from being delivered) or leak as an unhandled exception out of onmessage.
  const safeCall = (cb: ResponseCallback<WsResponse>, frame: WsResponse): void => {
    try {
      cb(frame)
    } catch (error) {
      config.log.error('task callback raised in dispatch', error)
    }
  }

  const handleMessage = (event: { data: string | Buffer | ArrayBuffer | Buffer[] }): void => {
    connectionState.lastActivity = Date.now()

    try {
      const dataString = (typeof event.data === 'string') ? event.data : event.data.toString()
      config.log.receive(dataString)
      const response = JSON.parse(dataString) as WsResponse

      // Server sends either `error` (singular) or `errors` (plural).
      // WsResponse only declares the singular form to avoid a wider union upstream.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rawErrors = (response as any).errors ?? response.error
      if (rawErrors) {
        const errors = (Array.isArray(rawErrors)) ? rawErrors : [rawErrors]

        // Group errors by taskUUID so each callback only sees its own errors,
        // not errors belonging to other tasks in the same frame.
        const errorsByTask = new Map<string, Record<string, unknown>[]>()
        const unrouted: Record<string, unknown>[] = []
        for (const error of errors) {
          const taskUUID = error.taskUUID as string | undefined
          if (taskUUID) {
            const list = errorsByTask.get(taskUUID) ?? []
            list.push(error)
            errorsByTask.set(taskUUID, list)
          } else {
            unrouted.push(error)
          }
        }

        for (const [taskUUID, taskErrors] of errorsByTask) {
          const request = inFlight.get(taskUUID)
          inFlight.delete(taskUUID)
          const callback = taskCallbacks.get(taskUUID)
          if (!callback) {
            config.log.warn(`No callback for taskUUID: ${taskUUID}`, taskErrors)
            continue
          }

          const acceptedResend = request?.resent === true
            && request.task.deliveryMethod === 'async'
            && taskErrors.every((error) => error.code === 'conflictTaskUUID')
          const frame = acceptedResend
            ? { data: [{ taskType: request.task.taskType, taskUUID }] }
            : { error: taskErrors }
          safeCall(callback, frame as WsResponse)
        }

        // A late task error can outlive its subscription after abort or timeout.
        // Only errors without a taskUUID belong to every remaining subscriber.
        if (unrouted.length > 0) {
          config.log.error('Unroutable WebSocket error', unrouted)
          for (const [, callback] of taskCallbacks) {
            safeCall(callback, { error: unrouted } as WsResponse)
          }
        }
        return
      }

      if (!response.data || !Array.isArray(response.data) || response.data.length === 0) {
        config.log.warn('Received message without valid data array', response)
        return
      }

      // Group items by taskUUID so each callback gets the whole batch in one
      // call (server often returns N items in a single frame for numberResults > 1).
      const itemsByTask = new Map<string, Record<string, unknown>[]>()
      for (const item of response.data as Array<Record<string, unknown>>) {
        if (item.taskType === 'ping' && item.pong === true) { continue }

        if (item.taskType === 'authentication') {
          if (item.connectionSessionUUID) {
            connectionState.connectionSessionUUID = item.connectionSessionUUID as string
          }
          continue
        }

        const taskUUID = item.taskUUID as string | undefined
        if (!taskUUID) { continue }

        const list = itemsByTask.get(taskUUID) ?? []
        list.push(item)
        itemsByTask.set(taskUUID, list)
      }

      for (const [taskUUID, items] of itemsByTask) {
        inFlight.delete(taskUUID)
        const callback = taskCallbacks.get(taskUUID)
        if (callback) {
          safeCall(callback, { data: items } as WsResponse)
        } else {
          config.log.warn(`No callback for taskUUID: ${taskUUID}`)
        }
      }
    } catch (error) {
      config.log.error('Failed to parse WebSocket message', error)
    }
  }

  const establishConnection = async (): Promise<void> => {
    if (!config.dependencies?.WebSocket) {
      throw createRunwareError('noWebSocketImpl', 'WebSocket implementation is required')
    }

    shouldReconnect = true

    const WebSocketImpl = config.dependencies.WebSocket

    // Close previous socket without clearing taskCallbacks (may still be in-flight).
    // Detach the module-level ref BEFORE close() so the prior onclose handler
    // sees `ws !== thisSocket` and skips re-entrant reconnect().
    if (ws) {
      const stale = ws
      ws = null
      connectionState.connected = false
      if (pingInterval) {
        clearInterval(pingInterval)
        pingInterval = null
      }
      try {
        if (stale.readyState === 0 || stale.readyState === 1) { stale.close() }
      } catch { }
    }

    return new Promise((resolve, reject) => {
      let settled = false

      try {
        // Pass the client identifier as a handshake header. The `ws` package
        // sends it; native WebSocket (browser / Node global) ignores the third
        // arg, so browser connections simply omit it (accepted gap).
        const wsOptions = { headers: { 'User-Agent': userAgent(config.userAgentPrefix) } }
        ws = new WebSocketImpl(config.wsBaseUrl, [], wsOptions)
        // Capture the current socket so handlers can ignore late events from a
        // socket that's already been replaced by connect()/reconnect(). Without
        // this, a stale onclose/onerror could null `ws` after a newer socket
        // was assigned to it, breaking the live connection.
        const thisSocket = ws

        ws.onopen = async () => {
          if (ws !== thisSocket) { return }

          try {
            await authenticate(thisSocket)
            if (ws !== thisSocket) {
              throw createRunwareError('connectionFailed', 'WebSocket was replaced during authentication')
            }

            connectionState.connected = true
            connectionState.lastActivity = Date.now()
            connectionState.connectedAt = Date.now()
            setupHeartbeat()
            sendInFlight()
            if (!settled) {
              settled = true
              resolve()
            }
          } catch (error) {
            thisSocket.close()
            if (!settled) {
              settled = true
              reject(error)
            }
          }
        }

        ws.onmessage = handleMessage

        ws.onclose = () => {
          if (ws !== thisSocket) { return }

          connectionState.connected = false
          if (pingInterval) {
            clearInterval(pingInterval)
          }
          pingInterval = null
          ws = null

          config.log.connection('Connection closed')

          if (!settled) {
            settled = true
            reject(keyRejection ?? createRunwareError(
              'connectionFailed',
              'WebSocket closed before authentication completed',
            ))
            return
          }

          // A clean server-side close still warrants a reconnect — no `error`
          // event fires for graceful closes, so without this path the
          // connection would silently die. `shouldReconnect` is false during
          // user-initiated disconnect; `isReconnecting` is true when a
          // reconnect is already in flight (e.g., from heartbeat or onerror).
          if (shouldReconnect && !isReconnecting && !keyRejection) {
            reconnect()
          }
        }

        // Event shape differs between browser WebSocket and ws package.
        // Narrowed inline below.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ws.onerror = (errorEvent: any) => {
          if (ws !== thisSocket) { return }

          const error = errorEvent.error ?? errorEvent

          config.log.error('WebSocket error', error)

          if (!settled && !connectionState.connected) {
            settled = true
            reject(createRunwareError(
              'connectionFailed',
              `WebSocket connection failed: ${error?.message ?? 'Unknown error'}`,
            ))
            return
          }

          ws?.close()
          reconnect()
        }
      } catch (error) {
        if (!settled) {
          settled = true
          reject(error)
        }
      }
    })
  }

  const authenticate = async (socket: typeof ws): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
      // readyState: 1 = OPEN
      if (socket.readyState !== 1) {
        return reject(createRunwareError('notOpen', 'WebSocket not open for authentication'))
      }

      const authMessage = JSON.stringify([{
        taskType: 'authentication',
        apiKey: config.apiKey,
        ...((connectionState.connectionSessionUUID)
          ? { connectionSessionUUID: connectionState.connectionSessionUUID }
          : {}),
      }])

      let authTimeoutId: ReturnType<typeof setTimeout> | null = null
      const originalMessageHandler = socket.onmessage

      const restoreHandler = () => {
        socket.onmessage = originalMessageHandler
      }

      const authHandler = (event: { data: string | Buffer | ArrayBuffer | Buffer[] }) => {
        try {
          const dataString = (typeof event.data === 'string') ? event.data : event.data.toString()
          const response = JSON.parse(dataString)

          if (response.data?.[0]?.taskType === 'authentication') {
            if (authTimeoutId) {
              clearTimeout(authTimeoutId)
            }

            restoreHandler()

            if (response.data[0].connectionSessionUUID) {
              connectionState.connectionSessionUUID = response.data[0].connectionSessionUUID
              keyRejection = null
              resolve()
            } else {
              reject(createRunwareError(
                'authFailed',
                'Authentication successful but missing connectionSessionUUID',
              ))
            }

            return
          }

          const rawErrors = response.errors ?? response.error
          if (rawErrors) {
            if (authTimeoutId) {
              clearTimeout(authTimeoutId)
            }

            restoreHandler()

            const firstError = Array.isArray(rawErrors) ? rawErrors[0] : rawErrors
            keyRejection = createRunwareError(
              'authFailed',
              firstError?.message ?? 'Authentication failed via API response',
            )
            reject(keyRejection)
            return
          }

          if (originalMessageHandler) {
            originalMessageHandler(event)
          }
        } catch (parseError) {
          if (originalMessageHandler) {
            originalMessageHandler(event)
          }
        }
      }

      socket.onmessage = authHandler

      authTimeoutId = setTimeout(() => {
        restoreHandler()
        reject(createRunwareError(
          'authTimeout',
          `Authentication timed out after ${config.authTimeout}ms`,
        ))
      }, config.authTimeout)

      try {
        config.log.send(JSON.stringify([{
          taskType: 'authentication',
          apiKey: '[redacted]',
          ...((connectionState.connectionSessionUUID)
            ? { connectionSessionUUID: connectionState.connectionSessionUUID }
            : {}),
        }]))
        socket.send(authMessage)
      } catch (sendError) {
        if (authTimeoutId) {
          clearTimeout(authTimeoutId)
        }

        restoreHandler()

        reject(createRunwareError(
          'sendFailed',
          `Failed to send authentication message: ${sendError}`,
        ))
      }
    })
  }

  const reconnect = async (): Promise<void> => {
    // Don't reconnect if user explicitly disconnected
    if (!shouldReconnect) { return }
    // Guard against concurrent reconnect (heartbeat + onerror can fire together)
    if (isReconnecting) { return }
    isReconnecting = true

    if (ws) {
      try {
        connectionState.connected = false
        if (pingInterval) {
          clearInterval(pingInterval)
          pingInterval = null
        }
        if (ws.readyState === 0 || ws.readyState === 1) {
          ws.close()
        }
        ws = null
      } catch { }
    }

    try {
      await establishConnection()
      // If the user called disconnect() while connect was in flight, undo the connection
      if (!shouldReconnect) {
        isReconnecting = false
        if (ws) {
          try { ws.close() } catch { }
          ws = null
        }
        return
      }
      config.log.connection(`Reconnected with ${taskCallbacks.size} pending task(s)`)
      reconnectAttempt = 0
      isReconnecting = false
    } catch (error) {
      reconnectAttempt += 1

      if (!shouldReconnect) {
        isReconnecting = false
        return
      }

      if (keyRejection) {
        config.log.error('The server rejected the API key on reconnect, giving up', error)
        isReconnecting = false
        const errorFrame: WsResponse = { error: [{ code: 'authFailed', message: keyRejection.message }] }
        for (const [, callback] of taskCallbacks) {
          safeCall(callback, errorFrame)
        }
        taskCallbacks.clear()
        inFlight.clear()
        return
      }

      if (reconnectAttempt >= config.maxReconnectAttempts) {
        config.log.error(`Reconnection failed after ${reconnectAttempt} attempts, giving up`)
        isReconnecting = false

        const reconnectError = createRunwareError(
          'reconnectionFailed',
          `Permanently disconnected after ${reconnectAttempt} reconnection attempts`,
        )
        const errorList = [reconnectError as unknown as Record<string, unknown>]
        const errorFrame: WsResponse = { error: errorList }
        for (const [, callback] of taskCallbacks) {
          safeCall(callback, errorFrame)
        }
        taskCallbacks.clear()
        inFlight.clear()
        return
      }

      const delay = computeReconnectDelay(config.retryDelay, reconnectAttempt)
      const max = (config.maxReconnectAttempts === Infinity) ? '∞' : config.maxReconnectAttempts
      config.log.error(
        `Reconnection failed (attempt ${reconnectAttempt}/${max}),`
        + ` retrying in ${Math.round(delay)}ms`,
        error,
      )

      reconnectTimer = setTimeout(() => {
        reconnectTimer = null
        isReconnecting = false
        reconnect()
      }, delay)
    }
  }

  // Public connect: explicit user calls reset the reconnect counter so the
  // circuit breaker starts fresh. Reconnects call establishConnection
  // directly to preserve the in-flight counter.
  const connect = async (): Promise<void> => {
    reconnectAttempt = 0
    keyRejection = null
    return establishConnection()
  }

  const disconnect = async (): Promise<void> => {
    // Stop any reconnect attempts in flight
    shouldReconnect = false
    if (reconnectTimer) {
      clearTimeout(reconnectTimer)
      reconnectTimer = null
    }

    connectionState.connected = false
    if (pingInterval) {
      clearInterval(pingInterval)
      pingInterval = null
    }

    const disconnectError: WsResponse = { error: [{ code: 'disconnected', message: 'Client disconnected' }] }
    for (const [, callback] of taskCallbacks) {
      safeCall(callback, disconnectError)
    }
    taskCallbacks.clear()
    inFlight.clear()

    if (!ws) {
      return Promise.resolve()
    }

    return new Promise((resolve) => {
      // readyState: 0 = CONNECTING, 1 = OPEN
      if (ws.readyState === 0 || ws.readyState === 1) {
        ws.onclose = () => {
          ws = null
          resolve()
        }
        ws.onerror = () => {
          ws = null
          resolve()
        }
        ws.close()
      } else {
        ws = null
        resolve()
      }
    })
  }

  const redactApiKey = (payload: TaskPayload[]): unknown[] =>
    payload.map((task) => (
      task.taskType === 'authentication' && 'apiKey' in task
        ? { ...task, apiKey: '[redacted]' }
        : task
    ))

  const send = (payload: TaskPayload[]): void => {
    config.log.send(JSON.stringify(redactApiKey(payload)))
    ws.send(JSON.stringify(payload))
  }

  const resendLater = (taskUUID: string): void => {
    const request = inFlight.get(taskUUID)
    if (!request) { return }

    request.resendScheduled = false
    if (!connectionState.connected) { return }

    request.resent = true
    request.sentAt = Date.now()
    send([request.task])
  }

  const sendInFlight = (): void => {
    const pending: TaskPayload[] = []
    for (const [taskUUID, request] of inFlight) {
      if (request.sent && !canResend(request.task)) {
        inFlight.delete(taskUUID)
        const callback = taskCallbacks.get(taskUUID)
        if (callback) {
          safeCall(callback, {
            error: [{
              code: 'connectionLost',
              message: 'Connection lost before the response arrived. The request may have been processed.',
              taskUUID,
            }],
          })
        }
        continue
      }

      const age = Date.now() - request.sentAt
      if (request.sent && request.task.deliveryMethod === 'async' && age < ASYNC_RESEND_MIN_AGE_MS) {
        if (!request.resendScheduled) {
          request.resendScheduled = true
          setTimeout(() => { resendLater(taskUUID) }, ASYNC_RESEND_MIN_AGE_MS - age)
        }
        continue
      }

      if (request.sent) { request.resent = true }
      request.sent = true
      request.sentAt = Date.now()
      pending.push(request.task)
    }

    if (pending.length === 0) { return }
    config.log.connection(`Sending ${pending.length} pending request(s) after reconnect`)
    send(pending)
  }

  const sendRequest = async (data: TaskPayload | TaskPayload[]): Promise<void> => {
    const willReconnect = isReconnecting && shouldReconnect
    if (!connectionState.connected && !willReconnect) {
      throw createRunwareError('notConnected', 'Not connected to WebSocket server')
    }

    const payload = (Array.isArray(data)) ? data : [data]
    for (const task of payload) {
      inFlight.set(task.taskUUID, {
        task,
        sent: connectionState.connected,
        sentAt: Date.now(),
        resent: false,
        resendScheduled: false,
      })
    }

    if (!connectionState.connected) {
      config.log.connection(`Reconnecting, holding ${payload.length} request(s) until the connection is back`)
      return
    }

    send(payload)
  }

  const subscribeToTask = (taskUUID: string, callback: ResponseCallback<WsResponse>): void => {
    taskCallbacks.set(taskUUID, callback)
  }

  const unsubscribeFromTask = (taskUUID: string): void => {
    taskCallbacks.delete(taskUUID)
    inFlight.delete(taskUUID)
  }

  const isConnected = (): boolean => {
    return connectionState.connected
  }

  const getSessionId = (): string | undefined => {
    return connectionState.connectionSessionUUID
  }

  const getConnectedAt = (): number | undefined => {
    return connectionState.connectedAt
  }

  return {
    type: 'websocket',
    connect,
    disconnect,
    isConnected,
    getSessionId,
    getConnectedAt,
    sendRequest,
    subscribeToTask,
    unsubscribeFromTask,
  }
}
