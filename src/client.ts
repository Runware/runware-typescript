import type {
  SDKConfig, RunOptions, StreamOptions, TaskPayload,
} from './types/sdk'
import type { Transport, WebSocketTransport } from './types/transport'
import type {
  SchemaKey,
  SchemaMap,
  ModelResultMap,
  ModelAIR,
  UtilityMap,
  RunParams,
} from './types/task-map'
import type { TextStream } from './types/stream'
import type { Registry } from './registry'

import {
  models,
  architectureTaskTypes,
  modalityTaskTypes,
  operationTaskTypes,
} from './types/task-map'
import { createTextStream } from './stream'
import { createRunwareError, parseApiError } from './errors'
import { validateTasks } from './validate'
import {
  createConfig,
  createBrowserDependencies,
  createNodeDependencies,
  isNodeJS,
} from './config'
import { createTransport } from './transport'
import { createRegistry } from './registry'
import { SCHEMAS_BASE_URL } from './constants'
import { createContentClient, type ContentClient } from './content'

export type RunwareClient = {
  connect: () => Promise<void>
  disconnect: () => Promise<void>
  isConnected: () => boolean

  /**
   * Run an inference task.
   *
   * With an official model — return type auto-inferred:
   *   client.run({ model: 'inworld:tts@2', ... })  → AudioInferenceResult[]
   *
   * With an architecture generic — typed params and results:
   *   client.run<'sdxl'>({ model: '...', positivePrompt: '...' })
   *
   * Without — loose params, untyped result:
   *   client.run({ model: '...', positivePrompt: '...' })
   */
  run: {
    // Inferred from curated model AIR — no generic needed
    <M extends ModelAIR>(
      params: { model: M } & Record<string, unknown>,
      options?: RunOptions,
    ): Promise<ModelResultMap[M][]>

    // Explicit architecture generic
    <S extends SchemaKey>(
      params: SchemaMap[S]['params'],
      options?: RunOptions,
    ): Promise<SchemaMap[S]['result'][]>

    // Untyped fallback
    (
      params: RunParams,
      options?: RunOptions,
    ): Promise<Record<string, unknown>[]>
  }

  /**
   * Stream text inference token-by-token via SSE.
   *
   * Returns a TextStream with:
   *   - `.textStream` — AsyncIterable<string> for text deltas as they arrive
   *   - `.reasoningStream` — AsyncIterable<string> for reasoning deltas
   *   - `.text()` — Promise<string> for the full accumulated text
   *   - `.result()` — Promise<TextStreamResult> for final metadata
   *
   * Options:
   *   - `signal` — AbortSignal to cancel the stream.
   *
   * Usage:
   *   const stream = client.stream({ model: '...', messages: [...] })
   *   for await (const word of stream.textStream) { console.log(word) }
   */
  stream: (
    params: Record<string, unknown>,
    options?: StreamOptions,
  ) => Promise<TextStream>

  /**
   * Force a refresh of the model registry from the remote endpoint.
   * Useful when a day-zero model has been launched and you want it
   * available immediately without waiting for the next TTL cycle.
   */
  refreshRegistry: () => Promise<void>

  /**
   * Poll for the result of a previously submitted async task.
   * Used internally by the SDK during async task execution.
   */
  getResponse: (
    params: UtilityMap['getResponse']['params'],
    options?: RunOptions,
  ) => Promise<UtilityMap['getResponse']['result'][]>

  /**
   * Retrieve the original request and response for a previously executed task.
   * Looks up archived task data by `taskUUID`.
   */
  getTaskDetails: (
    params: UtilityMap['getTaskDetails']['params'],
    options?: RunOptions,
  ) => Promise<UtilityMap['getTaskDetails']['result'][]>

  /**
   * Search for models.
   */
  modelSearch: (
    params: UtilityMap['modelSearch']['params'],
    options?: RunOptions,
  ) => Promise<UtilityMap['modelSearch']['result'][]>

  /**
   * Upload a model.
   */
  modelUpload: (
    params: UtilityMap['modelUpload']['params'],
    options?: RunOptions,
  ) => Promise<UtilityMap['modelUpload']['result'][]>

  /**
   * Upload an image.
   */
  imageUpload: (
    params: UtilityMap['imageUpload']['params'],
    options?: RunOptions,
  ) => Promise<UtilityMap['imageUpload']['result'][]>

  /**
   * Manage account settings.
   */
  accountManagement: (
    params: UtilityMap['accountManagement']['params'],
    options?: RunOptions,
  ) => Promise<UtilityMap['accountManagement']['result'][]>

  /**
   * Public read-only metadata about Runware's curated model catalog —
   * listings, single model details, examples, pricing, capabilities, creators.
   * Backed by the content service, separate from the inference API.
   */
  content: ContentClient
}

const generateUUID = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }

  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
    const randomHex = (Math.random() * 16) | 0
    const value = (char === 'x') ? randomHex : (randomHex & 0x3) | 0x8
    return value.toString(16)
  })
}

const normalizeTasks = (
  taskType: string,
  params: Record<string, unknown> | Record<string, unknown>[],
): TaskPayload[] => {
  const items = Array.isArray(params) ? params : [params]
  return items.map((item) => ({
    ...item,
    taskType,
    taskUUID: (item.taskUUID as string) ?? generateUUID(),
  }))
}

/**
 * Resolves the taskType for a given request.
 *
 * Priority:
 * 1. Explicit taskType in params (user override)
 * 2. Model AIR lookup via the registry (remote, falls back to bundled)
 * 3. Schema key lookup via the registry (remote, falls back to bundled)
 * 4. Throw — no silent default
 */
const resolveTaskType = async (
  schemaKey: SchemaKey | undefined,
  params: Record<string, unknown>,
  registry: Registry,
): Promise<string> => {
  if (typeof params.taskType === 'string' && params.taskType.length > 0) {
    return params.taskType
  }

  if (typeof params.model === 'string') {
    const resolved = await registry.getModelTaskType(params.model)
    if (resolved) { return resolved }
  }

  if (schemaKey) {
    const arch = await registry.getArchitectureTaskType(schemaKey)
    if (arch) { return arch }
    const modality = await registry.getModalityTaskType(schemaKey)
    if (modality) { return modality }
  }

  const model = (typeof params.model === 'string') ? params.model : 'undefined'
  throw createRunwareError(
    'unknownModel',
    `Unknown model '${model}'. `
    + 'Pass taskType in params (e.g., { taskType: \'imageInference\' }). '
    + 'The generic in .run<\'image\'>() provides TypeScript types but is erased at runtime. '
    + 'If this is a newly launched model, try client.refreshRegistry() to fetch the latest models.',
  )
}

/**
 * Legacy WebSocket sync path: server holds the connection and pushes the
 * response back on the same socket. Subject to the server's 120s limit.
 * Used when tasks are not flagged async (e.g. user-initiated `getResponse`).
 */
const executeWebSocketSync = async (
  tasks: TaskPayload[],
  transport: WebSocketTransport,
  config: SDKConfig,
  options?: RunOptions,
): Promise<unknown[]> => {
  const signal = options?.signal
  const dispatcher = createItemDispatcher(config, options)
  const results: Record<string, unknown>[] = []

  const expectedPerTask = new Map<string, number>()
  const receivedPerTask = new Map<string, number>()
  for (const task of tasks) {
    expectedPerTask.set(task.taskUUID, Number(task.numberResults) || 1)
    receivedPerTask.set(task.taskUUID, 0)
  }

  return new Promise((resolve, reject) => {
    let settled = false
    const timeout = options?.timeout ?? config.timeout

    const cleanup = () => {
      if (settled) { return }
      settled = true
      clearTimeout(timer)
      if (signal) { signal.removeEventListener('abort', onAbort) }
      for (const task of tasks) { transport.unsubscribeFromTask(task.taskUUID) }
    }

    const timer = setTimeout(() => {
      cleanup()
      reject(createRunwareError('timeout', `Task timed out after ${timeout}ms`))
    }, timeout)

    const onAbort = () => {
      cleanup()
      reject(createRunwareError('aborted', 'Request aborted'))
    }
    if (signal) { signal.addEventListener('abort', onAbort, { once: true }) }

    const isComplete = (): boolean => {
      for (const [uuid, expected] of expectedPerTask) {
        if ((receivedPerTask.get(uuid) ?? 0) < expected) { return false }
      }
      return true
    }

    for (const task of tasks) {
      transport.subscribeToTask(task.taskUUID, (response) => {
        if (settled) { return }

        if (response.error) {
          cleanup()
          reject(parseApiError(response.error, {
            taskType: task.taskType,
            model: task.model as string | undefined,
          }))
          return
        }

        if (response.data) {
          results.push(...response.data)
          receivedPerTask.set(
            task.taskUUID,
            (receivedPerTask.get(task.taskUUID) ?? 0) + response.data.length,
          )
          dispatcher.dispatch(response.data)
        }

        if (isComplete()) {
          cleanup()
          resolve(results)
        }
      })
    }

    transport.sendRequest(tasks).catch((error) => {
      cleanup()
      reject(error)
    })
  })
}

/**
 * Async WebSocket path: server stores results instead of pushing them.
 *
 * Two phases on the same per-task subscription:
 *   1. Send the request, then await the ACK frame. The ACK carries either
 *      "accepted" (empty errors) or a validation error — those errors come
 *      back synchronously on the original subscription before any polling.
 *      If ACK indicates an error, we throw immediately and skip polling.
 *   2. Otherwise enter the polling loop: send `getResponse` (sync delivery
 *      for fast lookup) until each task is complete. Each poll's response is
 *      pushed back on the same taskUUID subscription, which is why we keep
 *      it alive across both phases.
 */
const executeWebSocketAsync = async (
  tasks: TaskPayload[],
  transport: WebSocketTransport,
  config: SDKConfig,
  options?: RunOptions,
): Promise<unknown[]> => {
  const signal = options?.signal
  const dispatcher = createItemDispatcher(config, options)
  const expectedPerTask = new Map<string, number>()
  const resultsPerTask = new Map<string, Record<string, unknown>[]>()
  const tasksByUUID = new Map<string, TaskPayload>()
  for (const task of tasks) {
    expectedPerTask.set(task.taskUUID, Number(task.numberResults) || 1)
    resultsPerTask.set(task.taskUUID, [])
    tasksByUUID.set(task.taskUUID, task)
  }

  type AckResult = { ok: true } | { ok: false, errors: Record<string, unknown>[] }
  type PollResult = { items: Record<string, unknown>[], errors: Record<string, unknown>[] }
  const ackResolvers = new Map<string, (result: AckResult) => void>()
  const ackTimers = new Map<string, ReturnType<typeof setTimeout>>()
  const pendingPolls = new Map<string, (result: PollResult) => void>()

  // Stateful subscription: first frame per task is the ACK (or validation
  // error). Subsequent frames are getResponse poll responses.
  for (const task of tasks) {
    transport.subscribeToTask(task.taskUUID, (response) => {
      // Server sends either `error` (singular) or `errors` (plural).
      // WsResponse only declares the singular form to avoid a wider union upstream.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rawErrors = (response as any).errors ?? response.error
      const errors = rawErrors
        ? (Array.isArray(rawErrors) ? rawErrors : [rawErrors])
        : null

      const ackResolver = ackResolvers.get(task.taskUUID)
      if (ackResolver) {
        ackResolvers.delete(task.taskUUID)
        ackResolver(errors ? { ok: false, errors } : { ok: true })
        return
      }

      const pollResolver = pendingPolls.get(task.taskUUID)
      if (!pollResolver) { return }
      pendingPolls.delete(task.taskUUID)
      pollResolver({ items: response.data ?? [], errors: errors ?? [] })
    })
  }

  const cleanup = () => {
    for (const task of tasks) { transport.unsubscribeFromTask(task.taskUUID) }
    for (const timer of ackTimers.values()) { clearTimeout(timer) }
    ackTimers.clear()
    ackResolvers.clear()
    pendingPolls.clear()
  }

  try {
    // Phase 1: send and wait for the ACK frame (or validation error). ACKs
    // come back in milliseconds — if 30s passes, the server lost the request
    // or the WS context broke (e.g. silent reconnect mid-flight). Don't let
    // the user wait the full `pollTimeout` (20 min) for that.
    const ACK_TIMEOUT_MS = 30_000
    const ackPromises = tasks.map(async (task) => new Promise<AckResult>((resolve, reject) => {
      const timer = setTimeout(() => {
        ackTimers.delete(task.taskUUID)
        if (ackResolvers.has(task.taskUUID)) {
          ackResolvers.delete(task.taskUUID)
          reject(createRunwareError(
            'timeout',
            `ACK not received for task ${task.taskUUID} after ${ACK_TIMEOUT_MS}ms`,
          ))
        }
      }, ACK_TIMEOUT_MS)
      ackTimers.set(task.taskUUID, timer)

      ackResolvers.set(task.taskUUID, (result) => {
        const timer = ackTimers.get(task.taskUUID)
        if (timer) {
          clearTimeout(timer)
          ackTimers.delete(task.taskUUID)
        }
        resolve(result)
      })
    }))
    await transport.sendRequest(tasks)
    const acks = await Promise.all(ackPromises)

    for (let i = 0; i < tasks.length; i++) {
      const ack = acks[i]
      const task = tasks[i]
      if (!ack || !task) { continue } // unreachable: lengths match
      if (!ack.ok) {
        const parsed = parseApiError({ errors: ack.errors }, {
          taskType: task.taskType,
          model: task.model as string | undefined,
        })
        if (!parsed.taskUUID) { parsed.taskUUID = task.taskUUID }
        throw parsed
      }
    }

    // Phase 2: poll getResponse until each task completes.
    // Cadence: first poll at 1000ms (no model finishes faster), second at
    // +500ms (likely done by then), then ×1.5 backoff capped at 10s.
    const pollTimeout = options?.timeout ?? config.pollTimeout
    const startTime = Date.now()
    let delay = 1000
    let pollNumber = 0
    const pending = new Set(tasks.map((task) => task.taskUUID))

    config.log.request(`Polling ${pending.size} async task(s) over WebSocket`)

    while (pending.size > 0) {
      if (signal?.aborted) {
        throw createRunwareError('aborted', 'Request aborted during polling')
      }
      if (Date.now() - startTime >= pollTimeout) {
        throw createRunwareError(
          'timeout',
          `Polling timed out after ${pollTimeout}ms with ${pending.size} task(s) still processing`,
        )
      }

      await interruptibleSleep(delay, signal)

      if (signal?.aborted) {
        throw createRunwareError('aborted', 'Request aborted during polling')
      }

      const uuids = Array.from(pending)
      // Per-poll budget = remaining pollTimeout, capped by config.timeout.
      // Bounds each inner getResponse round-trip so a single hung poll can't
      // block the whole batch past the overall pollTimeout.
      const elapsed = Date.now() - startTime
      const perPollTimeout = Math.max(
        1,
        Math.min(pollTimeout - elapsed, config.timeout),
      )
      const polled = await Promise.all(uuids.map(async (uuid) => {
        const promise = new Promise<PollResult>((resolve) => {
          pendingPolls.set(uuid, resolve)
        })
        await transport.sendRequest([{
          taskType: 'getResponse',
          taskUUID: uuid,
        }])
        let timerId: ReturnType<typeof setTimeout> | undefined
        try {
          const result = await Promise.race([
            promise,
            new Promise<PollResult>((_, reject) => {
              timerId = setTimeout(
                () => reject(createRunwareError(
                  'timeout',
                  `getResponse poll for task ${uuid} timed out after ${perPollTimeout}ms`,
                )),
                perPollTimeout,
              )
            }),
          ])
          return { uuid, result }
        } finally {
          if (timerId) { clearTimeout(timerId) }
          pendingPolls.delete(uuid)
        }
      }))

      for (const { uuid, result } of polled) {
        // Fire callbacks BEFORE throwing — so users see partial outcomes
        // (e.g., 2 of 3 succeeded, 1 errored) via onResult even when we'll
        // reject the overall promise next.
        dispatcher.dispatch(result.items)

        // Two error shapes: a frame-level error (top-level) and per-result
        // errors carried as items with status='error' + embedded `error`.
        const itemErrors = result.items
          .filter((item) => item.status === 'error')
          .map((item) => ({ ...(item.error as Record<string, unknown> ?? {}), taskUUID: uuid }))
        const allErrors = [...result.errors, ...itemErrors]

        if (allErrors.length > 0) {
          const origTask = tasksByUUID.get(uuid)
          const parsed = parseApiError({ errors: allErrors }, {
            taskType: origTask?.taskType,
            model: origTask ? origTask.model as string | undefined : undefined,
          })
          if (!parsed.taskUUID) { parsed.taskUUID = uuid }
          throw parsed
        }

        const successItems = result.items.filter((item) => item.status === 'success')
        resultsPerTask.set(uuid, successItems)

        const expected = expectedPerTask.get(uuid) ?? 1
        if (successItems.length >= expected) {
          pending.delete(uuid)
        }
      }

      pollNumber += 1
      delay = pollNumber === 1 ? 500 : Math.min(delay * 1.5, 10000)
    }
  } finally {
    cleanup()
  }

  // Flatten in input task order
  const results: Record<string, unknown>[] = []
  for (const task of tasks) {
    results.push(...(resultsPerTask.get(task.taskUUID) ?? []))
  }
  return results
}

const executeWebSocket = async (
  tasks: TaskPayload[],
  transport: WebSocketTransport,
  config: SDKConfig,
  options?: RunOptions,
): Promise<unknown[]> => {
  const isAsync = tasks.some((task) => task.deliveryMethod === 'async')
  return isAsync
    ? executeWebSocketAsync(tasks, transport, config, options)
    : executeWebSocketSync(tasks, transport, config, options)
}

// Accepts multiple polymorphic response shapes (raw array, `{ data: [...] }`,
// or error envelope). Narrowed by Array.isArray checks below.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const toResultsArray = (response: any): Record<string, unknown>[] => {
  if (Array.isArray(response?.data)) { return response.data }
  if (Array.isArray(response)) { return response }
  return [response]
}

/**
 * Tracks per-item state across polling cycles to fire onResult/onProgress
 * exactly once per meaningful change. Items are keyed by (taskUUID, index)
 * because the server returns items in a stable order across polls — index 0
 * in poll 1 is the same item as index 0 in poll 2. If that guarantee ever
 * changes, this dedup breaks silently.
 */
const createItemDispatcher = (config: SDKConfig, options?: RunOptions) => {
  const seenCompleted = new Set<string>()
  const lastProgressByKey = new Map<string, number>()

  const keyFor = (item: Record<string, unknown>, index: number): string =>
    `${item.taskUUID}:${index}`

  // User callback throws shouldn't break our polling loop.
  type ItemCallback = (item: Record<string, unknown>) => void
  const safeCall = (cb: ItemCallback | undefined, item: Record<string, unknown>) => {
    if (!cb) { return }
    try { cb(item) } catch (error) { config.log.warn('User callback threw', error) }
  }

  const dispatch = (items: Record<string, unknown>[]): void => {
    if (!options?.onResult && !options?.onProgress) { return }
    items.forEach((item, idx) => {
      const key = keyFor(item, idx)
      const status = item.status as string | undefined
      if (status === 'success' || status === 'error') {
        if (!seenCompleted.has(key)) {
          seenCompleted.add(key)
          safeCall(options?.onResult, item)
        }
        return
      }
      if (typeof item.progress === 'number') {
        if (lastProgressByKey.get(key) !== item.progress) {
          lastProgressByKey.set(key, item.progress)
          safeCall(options?.onProgress, item)
        }
      }
    })
  }

  return { dispatch }
}

// Sleep that wakes early on abort — returns even if aborted (caller should
// re-check signal.aborted afterwards).
const interruptibleSleep = async (ms: number, signal?: AbortSignal): Promise<void> =>
  new Promise((resolve) => {
    if (!signal) {
      setTimeout(resolve, ms)
      return
    }
    const timer = setTimeout(() => {
      signal.removeEventListener('abort', onAbort)
      resolve()
    }, ms)
    const onAbort = () => {
      clearTimeout(timer)
      resolve()
    }
    signal.addEventListener('abort', onAbort, { once: true })
  })

/**
 * REST execution: send the request, then poll getResponse for any async tasks.
 * One poll per unique taskUUID per cycle — the server returns the full state
 * (all N items for a numberResults=N task) every time. Expected count comes
 * from `task.numberResults`, not from initial-response slots (the server
 * returns one placeholder per task regardless of numberResults).
 */
const executeRest = async (
  tasks: TaskPayload[],
  transport: Transport,
  config: SDKConfig,
  options?: RunOptions,
): Promise<unknown[]> => {
  const signal = options?.signal

  // REST transport returns Promise<unknown>. Shape depends on sync/async
  // delivery and is narrowed by helpers below.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const response = await transport.sendRequest(tasks, { signal }) as any

  const isAsync = tasks.some((task) => task.deliveryMethod === 'async')
  if (!isAsync) {
    return toResultsArray(response)
  }

  // Async submit returns an ACK or a validation error. If there's an error,
  // surface it now — there's nothing to poll for.
  if (Array.isArray(response?.errors) && response.errors.length > 0) {
    throw parseApiError({ errors: response.errors }, {
      taskType: tasks[0]?.taskType,
      model: tasks[0] ? tasks[0].model as string | undefined : undefined,
    })
  }

  const dispatcher = createItemDispatcher(config, options)

  const expectedPerTask = new Map<string, number>()
  const resultsPerTask = new Map<string, Record<string, unknown>[]>()
  const restTasksByUUID = new Map<string, TaskPayload>()
  for (const task of tasks) {
    expectedPerTask.set(task.taskUUID, Number(task.numberResults) || 1)
    resultsPerTask.set(task.taskUUID, [])
    restTasksByUUID.set(task.taskUUID, task)
  }

  // Cadence: first poll at 1000ms (no model finishes faster), second at
  // +500ms (likely done by then), then ×1.5 backoff capped at 10s.
  const pollTimeout = options?.timeout ?? config.pollTimeout
  const startTime = Date.now()
  let delay = 1000
  let pollNumber = 0
  const pending = new Set(tasks.map((task) => task.taskUUID))

  config.log.request(`Polling ${pending.size} async task(s)`)

  while (pending.size > 0) {
    if (signal?.aborted) {
      throw createRunwareError('aborted', 'Request aborted during polling')
    }
    if (Date.now() - startTime >= pollTimeout) {
      throw createRunwareError(
        'timeout',
        `Polling timed out after ${pollTimeout}ms with ${pending.size} task(s) still processing`,
      )
    }

    await interruptibleSleep(delay, signal)

    if (signal?.aborted) {
      throw createRunwareError('aborted', 'Request aborted during polling')
    }

    const uuids = Array.from(pending)
    // Per-poll budget = remaining pollTimeout, capped by config.timeout.
    // Without this, each inner POST could individually take config.timeout and
    // the batch would exceed the overall pollTimeout by an unbounded amount.
    const elapsed = Date.now() - startTime
    const perPollTimeout = Math.max(
      1,
      Math.min(pollTimeout - elapsed, config.timeout),
    )
    const polled = await Promise.all(uuids.map(async (taskUUID) => {
      const pollTasks = normalizeTasks('getResponse', { taskUUID })
      const pollOptions = { signal, timeout: perPollTimeout }
      const rawResponse = await transport.sendRequest(pollTasks, pollOptions)
      // REST poll response shape varies by terminal state.
      // Narrowed by toResultsArray and error checks downstream.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pollResponse = rawResponse as any
      return { taskUUID, response: pollResponse }
    }))

    for (const { taskUUID, response: pollResponse } of polled) {
      const items: Record<string, unknown>[] = Array.isArray(pollResponse?.data)
        ? pollResponse.data : []
      const topLevelErrors: Record<string, unknown>[] = Array.isArray(pollResponse?.errors)
        ? pollResponse.errors : []
      const itemErrors = items
        .filter((item) => item.status === 'error')
        .map((item) => ({ ...(item.error as Record<string, unknown> ?? {}), taskUUID }))
      const errors = [...topLevelErrors, ...itemErrors]

      // Fire callbacks BEFORE throwing — so users see partial outcomes
      // (e.g., 2 of 3 succeeded, 1 errored) via onResult even when we'll
      // reject the overall promise next.
      dispatcher.dispatch(items)

      // Fail fast on any error for this task. Server returns errors for failed
      // results alongside successful ones; one bad result fails the whole task.
      if (errors.length > 0) {
        const origTask = restTasksByUUID.get(taskUUID)
        const parsed = parseApiError({ errors }, {
          taskType: origTask?.taskType,
          model: origTask ? origTask.model as string | undefined : undefined,
        })
        if (!parsed.taskUUID) { parsed.taskUUID = taskUUID }
        throw parsed
      }

      const successItems = items.filter((item) => item.status === 'success')
      resultsPerTask.set(taskUUID, successItems)

      const expected = expectedPerTask.get(taskUUID) ?? 1
      if (successItems.length >= expected) {
        pending.delete(taskUUID)
      }
    }

    pollNumber += 1
    delay = pollNumber === 1 ? 500 : Math.min(delay * 1.5, 10000)
  }

  const results: Record<string, unknown>[] = []
  for (const task of tasks) {
    results.push(...(resultsPerTask.get(task.taskUUID) ?? []))
  }
  return results
}

/**
 * Dispatch a task to the right transport. Shared prologue handles validation
 * and early-abort checks; transport-specific logic lives in executeWebSocket
 * / executeRest.
 */
const execute = async (
  taskType: string,
  params: Record<string, unknown>,
  transport: Transport,
  config: SDKConfig,
  options?: RunOptions,
): Promise<unknown[]> => {
  const tasks = normalizeTasks(taskType, params)

  if (options?.signal?.aborted) {
    throw createRunwareError('aborted', 'Request aborted before start')
  }

  if (options?.validate ?? config.validate) {
    await validateTasks(tasks, config)
  }

  if (transport.type === 'websocket') {
    return executeWebSocket(tasks, transport as WebSocketTransport, config, options)
  }

  return executeRest(tasks, transport, config, options)
}

type ClientConfig = Partial<SDKConfig> & { apiKey: string }

/**
 * Create a Runware SDK client. Returns a ready-to-use `RunwareClient` with
 * `.run()`, `.stream()`, and utility methods like `.modelSearch()`.
 *
 * The only required field is `apiKey`. Everything else has sensible defaults:
 *   - `transport`: `'websocket'` (use `'rest'` for stateless serverless)
 *   - `timeout`/`pollTimeout`: 20 min (covers video, 3D, large upscale)
 *   - `retry`/`reconnect`: built-in with exponential backoff
 *
 * For WebSocket, call `.connect()` before the first request. For REST it's a
 * no-op (each request is a standalone HTTP call).
 *
 * @example
 *   const client = await createClient({ apiKey: process.env.RUNWARE_API_KEY })
 *   await client.connect()
 *   const images = await client.run({ model: 'runware:101@1', positivePrompt: 'a cat' })
 */
export const createClient = async (userConfig: ClientConfig): Promise<RunwareClient> => {
  const deps = isNodeJS()
    ? await createNodeDependencies()
    : createBrowserDependencies()

  const fullConfig = createConfig({
    ...userConfig,
    dependencies: { ...deps, ...userConfig.dependencies },
  })
  const transport = createTransport(fullConfig.transport, fullConfig)

  const registry = createRegistry({
    url: `${SCHEMAS_BASE_URL}/registry.json`,
    fetchImpl: fullConfig.dependencies?.fetch ?? globalThis.fetch,
    log: fullConfig.log,
    // Bundled fallback so the SDK works offline or when the registry is
    // unreachable. Processing types (caption-image, upscale-image, etc.) are
    // merged into the architecture fallback — they're keyed the same way
    // (schema-slug → taskType) and are looked up through the same code path.
    fallback: {
      models,
      architectureTaskTypes: { ...architectureTaskTypes, ...operationTaskTypes },
      modalityTaskTypes,
    },
  })

  const connect = async (): Promise<void> => {
    if (transport.type === 'websocket') {
      await transport.connect()
    }
  }

  const disconnect = async (): Promise<void> => {
    if (transport.type === 'websocket') {
      await transport.disconnect()
    }
  }

  const isConnected = (): boolean => {
    return (transport.type === 'websocket') ? transport.isConnected() : true
  }

  // If the user passed a curated-model slug (e.g. "flux-1-dev") instead of an
  // AIR (e.g. "runware:101@1"), swap it for the canonical AIR before sending —
  // the server only knows the AIR form. Non-curated models, fine-tune AIRs,
  // and unknown identifiers pass through unchanged.
  type ModelParams = Record<string, unknown>
  const normalizeModelParam = async (params: ModelParams): Promise<ModelParams> => {
    if (typeof params.model !== 'string') { return params }
    // Already AIR-shaped? Skip the registry lookup — the server expects AIR and
    // we have nothing to translate. This also keeps the fast path fast for the
    // 99% case where users pass AIRs directly.
    if (params.model.includes(':') && params.model.includes('@')) { return params }
    // Otherwise it might be a curated-model slug. Resolve to the canonical AIR.
    const air = await registry.resolveModelAir(params.model)
    if (!air || air === params.model) { return params }
    return { ...params, model: air }
  }

  const run = async (
    params: Record<string, unknown>,
    options?: RunOptions,
  ): Promise<unknown[]> => {
    const normalized = await normalizeModelParam(params)
    const taskType = await resolveTaskType(undefined, normalized, registry)
    return execute(taskType, { deliveryMethod: 'async', ...normalized }, transport, fullConfig, options)
  }

  const stream = async (
    params: Record<string, unknown>,
    options?: StreamOptions,
  ): Promise<TextStream> => {
    if (typeof params.numberResults === 'number' && params.numberResults > 1) {
      throw createRunwareError(
        'notImplemented',
        'stream() with numberResults > 1 is not supported yet (backend does not emit resultIndex on stream chunks).',
      )
    }
    const normalized = await normalizeModelParam(params)
    const taskType = await resolveTaskType(undefined, normalized, registry)
    const tasks = normalizeTasks(taskType, {
      ...normalized,
      deliveryMethod: 'stream',
    })

    const shouldValidate = options?.validate ?? fullConfig.validate
    const onStart = shouldValidate
      ? async () => validateTasks(tasks, fullConfig)
      : undefined

    // Optional per-call timeout fires via the same abort path as `signal`.
    // Combine the user's signal with a timeout-driven one so the consumer
    // sees a single abort source.
    const timeout = options?.timeout
    let signal = options?.signal
    if (timeout != null) {
      const controller = new AbortController()
      const timer = setTimeout(
        () => controller.abort(createRunwareError('timeout', `Stream timed out after ${timeout}ms`)),
        timeout,
      )
      if (signal) {
        if (signal.aborted) {
          clearTimeout(timer)
          controller.abort(signal.reason)
        } else {
          signal.addEventListener('abort', () => {
            clearTimeout(timer)
            controller.abort(signal!.reason)
          }, { once: true })
        }
      }
      signal = controller.signal
    }

    return createTextStream(tasks, fullConfig, signal, onStart)
  }

  const getResponse = async (
    params: Record<string, unknown>,
    options?: RunOptions,
  ) => execute('getResponse', params, transport, fullConfig, options)

  const getTaskDetails = async (
    params: Record<string, unknown>,
    options?: RunOptions,
  ) => execute('getTaskDetails', params, transport, fullConfig, options)

  const modelSearch = async (
    params: Record<string, unknown>,
    options?: RunOptions,
  ) => execute('modelSearch', params, transport, fullConfig, options)

  const modelUpload = async (
    params: Record<string, unknown>,
    options?: RunOptions,
  ) => execute('modelUpload', params, transport, fullConfig, options)

  const imageUpload = async (
    params: Record<string, unknown>,
    options?: RunOptions,
  ) => execute('imageUpload', params, transport, fullConfig, options)

  const accountManagement = async (
    params: Record<string, unknown>,
    options?: RunOptions,
  ) => execute('accountManagement', params, transport, fullConfig, options)

  const refreshRegistry = async (): Promise<void> => registry.refresh()

  const content = createContentClient(fullConfig)

  return {
    connect,
    disconnect,
    isConnected,
    refreshRegistry,
    run: run as RunwareClient['run'],
    stream: stream as RunwareClient['stream'],
    getResponse: getResponse as RunwareClient['getResponse'],
    getTaskDetails: getTaskDetails as RunwareClient['getTaskDetails'],
    modelSearch: modelSearch as RunwareClient['modelSearch'],
    modelUpload: modelUpload as RunwareClient['modelUpload'],
    imageUpload: imageUpload as RunwareClient['imageUpload'],
    accountManagement: accountManagement as RunwareClient['accountManagement'],
    content,
  }
}
