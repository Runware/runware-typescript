import type { SDKConfig, ResponseCallback, TaskPayload } from '../types/sdk'
import type { ConnectionState, WebSocketTransport, WsResponse } from '../types/transport'

import { createRunwareError } from '../errors'

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

  // Per-taskUUID routing prevents concurrent tasks from overwriting callbacks
  const taskCallbacks = new Map<string, ResponseCallback<WsResponse>>()

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

        let delivered = false
        for (const [taskUUID, taskErrors] of errorsByTask) {
          const callback = taskCallbacks.get(taskUUID)
          if (callback) {
            delivered = true
            safeCall(callback, { error: taskErrors } as WsResponse)
          }
        }

        if (unrouted.length > 0 || !delivered) {
          config.log.error('Unroutable WebSocket error', errors)
          for (const [, callback] of taskCallbacks) {
            safeCall(callback, { error: errors } as WsResponse)
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

  const connect = async (): Promise<void> => {
    if (!config.dependencies?.WebSocket) {
      throw createRunwareError('noWebSocketImpl', 'WebSocket implementation is required')
    }

    shouldReconnect = true

    const WebSocketImpl = config.dependencies.WebSocket

    // Close previous socket without clearing taskCallbacks (may still be in-flight)
    if (ws) {
      connectionState.connected = false
      if (pingInterval) {
        clearInterval(pingInterval)
        pingInterval = null
      }
      try {
        if (ws.readyState === 0 || ws.readyState === 1) { ws.close() }
      } catch { }
      ws = null
    }

    return new Promise((resolve, reject) => {
      let settled = false

      try {
        ws = new WebSocketImpl(config.wsBaseUrl)
        // Capture the current socket so handlers can ignore late events from a
        // socket that's already been replaced by connect()/reconnect(). Without
        // this, a stale onclose/onerror could null `ws` after a newer socket
        // was assigned to it, breaking the live connection.
        const thisSocket = ws

        ws.onopen = async () => {
          if (ws !== thisSocket) { return }
          connectionState.connected = true

          try {
            await authenticate()
            setupHeartbeat()
            if (!settled) {
              settled = true
              resolve()
            }
          } catch (error) {
            ws?.close()
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

          // Callbacks survive reconnect so server can replay pending messages
          config.log.connection('Connection closed')

          // A clean server-side close still warrants a reconnect — no `error`
          // event fires for graceful closes, so without this path the
          // connection would silently die. `shouldReconnect` is false during
          // user-initiated disconnect; `isReconnecting` is true when a
          // reconnect is already in flight (e.g., from heartbeat or onerror).
          if (shouldReconnect && !isReconnecting) {
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

  const authenticate = async (): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
      // readyState: 1 = OPEN
      if (!ws || ws.readyState !== 1) {
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
      const originalMessageHandler = ws.onmessage

      // Safe restore: ws may be nulled by a concurrent disconnect/reconnect
      const restoreHandler = () => {
        if (ws) { ws.onmessage = originalMessageHandler }
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
              resolve()
            } else {
              reject(createRunwareError(
                'authFailed',
                'Authentication successful but missing connectionSessionUUID',
              ))
            }

            return
          }

          if (response.error) {
            if (authTimeoutId) {
              clearTimeout(authTimeoutId)
            }

            restoreHandler()

            reject(createRunwareError(
              'authFailed',
              response.error.message ?? 'Authentication failed via API response',
            ))
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

      ws.onmessage = authHandler

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
        ws.send(authMessage)
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
      await connect()
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

      if (reconnectAttempt >= config.maxReconnectAttempts) {
        config.log.error(`Reconnection failed after ${reconnectAttempt} attempts, giving up`)
        isReconnecting = false

        const reconnectError = createRunwareError(
          'reconnectionFailed',
          `Permanently disconnected after ${reconnectAttempt} reconnection attempts`,
        )
        for (const [, callback] of taskCallbacks) {
          safeCall(callback, { error: [reconnectError as unknown as Record<string, unknown>] } as WsResponse)
        }
        taskCallbacks.clear()
        return
      }

      const base = config.retryDelay * Math.pow(2, reconnectAttempt - 1)
      const jitter = Math.random() * 1000
      const delay = Math.min(base + jitter, 30000)
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

  const disconnect = async (): Promise<void> => {
    // Stop any reconnect attempts in flight
    shouldReconnect = false
    if (reconnectTimer) {
      clearTimeout(reconnectTimer)
      reconnectTimer = null
    }

    if (!ws) {
      return Promise.resolve()
    }

    return new Promise((resolve) => {
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

  const sendRequest = async (data: TaskPayload | TaskPayload[]): Promise<void> => {
    if (!connectionState.connected) {
      throw createRunwareError('notConnected', 'Not connected to WebSocket server')
    }

    try {
      const payload = (Array.isArray(data)) ? data : [data]
      const serialized = JSON.stringify(payload)
      config.log.send(JSON.stringify(redactApiKey(payload)))
      ws.send(serialized)

      return Promise.resolve()
    } catch (error) {
      return Promise.reject(error)
    }
  }

  const subscribeToTask = (taskUUID: string, callback: ResponseCallback<WsResponse>): void => {
    taskCallbacks.set(taskUUID, callback)
  }

  const unsubscribeFromTask = (taskUUID: string): void => {
    taskCallbacks.delete(taskUUID)
  }

  const isConnected = (): boolean => {
    return connectionState.connected
  }

  const getSessionId = (): string | undefined => {
    return connectionState.connectionSessionUUID
  }

  return {
    type: 'websocket',
    connect,
    disconnect,
    isConnected,
    getSessionId,
    sendRequest,
    subscribeToTask,
    unsubscribeFromTask,
  }
}
