import type { SDKConfig } from './types/sdk'
import type {
  GetTaskOptions,
  InvokeOptions,
  InvokeParams,
  ServerlessTask,
  TaskStatus,
} from './types/serverless'

import { createRunwareError, isRunwareError } from './errors'
import { userAgent } from './user-agent'
import { calculateRetryDelay } from './utils/retry'
import { generateUUID } from './utils/uuid'

const APP_ID_PATTERN = /^[a-z][a-z0-9-]{4,28}[a-z0-9]$/
const ENDPOINT_PATH_PATTERN = /^[a-z]([a-z0-9-]{0,62}[a-z0-9])?$/
const TASK_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/

const DEFAULT_POLL_INTERVAL_MS = 2000

/**
 * A task id the platform has just accepted can miss the result store for a
 * moment, so `getTask` answers 404 before it answers the task. Polling treats
 * a 404 as transient for this long and only then gives up.
 */
const TASK_NOT_FOUND_GRACE_MS = 30000

/**
 * Floor for a `sync` invocation's per-request timeout. It has to outlast the
 * platform's own wait window, otherwise the client gives up on a request the
 * platform was about to answer, and the answer it was about to give is the
 * accepted task the SDK needs in order to poll.
 */
const SYNC_MIN_TIMEOUT_MS = 300000

const RETRYABLE_STATUS = (status: number): boolean =>
  status === 408 || status === 429 || (status >= 500 && status < 600)

const TERMINAL: ReadonlySet<TaskStatus> = new Set<TaskStatus>(['completed', 'failed'])

export const isTerminal = (status: string): boolean => TERMINAL.has(status as TaskStatus)

const rawCodeForStatus = (status: number): string => {
  switch (status) {
    case 400:
    case 422:
      return 'validationFailed'
    case 401:
      return 'unauthorized'
    case 403:
      return 'forbidden'
    case 404:
      return 'resourceNotFound'
    case 409:
      return 'conflictingState'
    case 402:
      return 'paymentRequired'
    case 413:
      return 'maxRequestSize'
    case 429:
      return 'rateLimitExceeded'
    case 503:
      return 'serviceUnavailable'
    default:
      return 'internalServerError'
  }
}

const validateAppId = (appId: unknown): string => {
  if (typeof appId !== 'string' || appId === '') {
    throw createRunwareError('missingParameter', 'appId is required', { parameter: 'appId' })
  }
  if (!APP_ID_PATTERN.test(appId)) {
    throw createRunwareError(
      'invalidParameter',
      `appId "${appId}" is invalid: use 6 to 30 lowercase characters, starting with a letter and ending with a letter or digit`,
      { parameter: 'appId' },
    )
  }
  return appId
}

const validateEndpointPath = (endpointPath: unknown): string => {
  if (typeof endpointPath !== 'string' || endpointPath === '') {
    throw createRunwareError(
      'missingParameter',
      'endpointPath is required',
      { parameter: 'endpointPath' },
    )
  }
  if (endpointPath.startsWith('/')) {
    const bare = endpointPath.replace(/^\/+/, '')
    const hint = ENDPOINT_PATH_PATTERN.test(bare) ? ` (e.g. "${bare}")` : ''
    throw createRunwareError(
      'invalidParameter',
      `endpointPath "${endpointPath}" must be a bare segment without a leading slash${hint}`,
      { parameter: 'endpointPath' },
    )
  }
  if (!ENDPOINT_PATH_PATTERN.test(endpointPath)) {
    throw createRunwareError(
      'invalidParameter',
      `endpointPath "${endpointPath}" is invalid: use a lowercase segment of 1 to 64 characters (letters, digits, hyphens)`,
      { parameter: 'endpointPath' },
    )
  }
  return endpointPath
}

const validateTaskId = (taskId: unknown): string => {
  if (typeof taskId !== 'string' || !TASK_ID_PATTERN.test(taskId)) {
    throw createRunwareError(
      'invalidParameter',
      `taskId "${String(taskId)}" is invalid: use a lowercase UUID`,
      { parameter: 'taskId' },
    )
  }
  return taskId
}

const resolveTaskId = (taskId: unknown): string =>
  ((taskId === undefined || taskId === null) ? generateUUID() : validateTaskId(taskId))

const parseRetryAfter = (value: string | null): number | undefined => {
  if (!value) { return undefined }
  const seconds = Number(value)
  if (Number.isFinite(seconds) && seconds >= 0) { return seconds }
  const at = Date.parse(value)
  if (Number.isNaN(at)) { return undefined }
  return Math.max(0, Math.ceil((at - Date.now()) / 1000))
}

/**
 * Turns an RFC 9457 problem document into a `RunwareError`. Field-level
 * entries from a 422 are appended to the message, because a validation failure
 * the caller cannot see the fields of is not actionable.
 */
const problemToError = (
  body: unknown,
  status: number,
  retryAfter: number | undefined,
): Error => {
  const problem = (typeof body === 'object' && body !== null)
    ? body as Record<string, unknown>
    : {}

  const detail = typeof problem.detail === 'string' ? problem.detail : undefined
  const title = typeof problem.title === 'string' ? problem.title : undefined
  let message = detail ?? title ?? `HTTP ${status}`

  const fieldErrors = Array.isArray(problem.errors) ? problem.errors : []
  const lines = fieldErrors.flatMap((entry) => {
    if (typeof entry !== 'object' || entry === null) { return [] }
    const item = entry as Record<string, unknown>
    const text = typeof item.detail === 'string' ? item.detail : ''
    if (!text) { return [] }
    const pointer = typeof item.pointer === 'string' ? item.pointer : ''
    return [pointer ? `  ${pointer}: ${text}` : `  ${text}`]
  })
  if (lines.length > 0) {
    message = `${message}\n${lines.join('\n')}`
  }

  const error = createRunwareError(rawCodeForStatus(status), message, { statusCode: status })
  if (typeof problem.type === 'string' && problem.type !== 'about:blank') {
    error.problemType = problem.type
  }
  if (typeof problem.requestId === 'string') {
    error.requestId = problem.requestId
  }
  if (typeof problem.endpointPath === 'string') {
    error.parameter = 'endpointPath'
  }
  if (retryAfter !== undefined) {
    error.retryAfter = retryAfter
  }
  return error
}

const isTaskShape = (body: unknown): body is ServerlessTask =>
  typeof body === 'object'
  && body !== null
  && typeof (body as Record<string, unknown>).id === 'string'
  && typeof (body as Record<string, unknown>).status === 'string'

const toTask = (body: unknown, context: string): ServerlessTask => {
  if (!isTaskShape(body)) {
    throw createRunwareError('parseError', `${context}: the response carried no task`)
  }
  return body
}

const sleep = async (ms: number, signal?: AbortSignal): Promise<void> =>
  new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(createRunwareError('aborted', 'Request aborted'))
      return
    }
    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort)
      resolve()
    }, ms)
    const onAbort = () => {
      clearTimeout(timer)
      reject(createRunwareError('aborted', 'Request aborted'))
    }
    signal?.addEventListener('abort', onAbort, { once: true })
  })

type HttpResult = { status: number, body: unknown }

const createServerlessApi = (config: SDKConfig) => {
  const origin = config.serverlessBaseUrl.replace(/\/+$/, '')

  const fetchOnce = async (
    url: string,
    init: RequestInit,
    timeoutMs: number,
    signal: AbortSignal | undefined,
  ): Promise<HttpResult> => {
    const fetchImpl = config.dependencies?.fetch ?? globalThis.fetch
    if (!fetchImpl) {
      throw createRunwareError('noFetchImpl', 'Fetch implementation is required for the serverless API')
    }

    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)
    const onAbort = () => controller.abort()
    if (signal) {
      if (signal.aborted) { controller.abort() }
      else { signal.addEventListener('abort', onAbort, { once: true }) }
    }

    try {
      const response = await fetchImpl(url, {
        ...init,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`,
          'User-Agent': userAgent(config.userAgentPrefix),
          ...init.headers,
        },
        signal: controller.signal,
      })

      let body: unknown = null
      try { body = await response.json() } catch { body = null }

      if (!response.ok) {
        throw problemToError(body, response.status, parseRetryAfter(response.headers.get('Retry-After')))
      }

      config.log.receive(JSON.stringify(body))
      return { status: response.status, body }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        if (signal?.aborted) {
          throw createRunwareError('aborted', 'Request aborted')
        }
        throw createRunwareError('timeout', `Serverless request timed out after ${timeoutMs}ms`)
      }
      throw error
    } finally {
      clearTimeout(timer)
      signal?.removeEventListener('abort', onAbort)
    }
  }

  /**
   * Retries transport failures and retryable statuses. Safe on an invocation
   * because every one carries a task id: a retry the platform already saw is
   * answered with the task it started rather than a second one.
   *
   * A response carrying `Retry-After` waits exactly that long. A capacity
   * refusal names a wait the platform expects to need, and backing off for
   * less than it just spends an attempt to be told the same thing.
   */
  const request = async (
    url: string,
    init: RequestInit,
    timeoutMs: number,
    signal: AbortSignal | undefined,
  ): Promise<HttpResult> => {
    let lastError: unknown

    for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
      try {
        return await fetchOnce(url, init, timeoutMs, signal)
      } catch (error) {
        lastError = error

        const retryable = (() => {
          if (isRunwareError(error) && error.code === 'aborted') { return false }
          if (isRunwareError(error) && error.code === 'timeout') { return true }
          if (isRunwareError(error) && error.statusCode !== undefined) {
            return RETRYABLE_STATUS(error.statusCode)
          }
          return error instanceof TypeError
        })()

        if (attempt === config.maxRetries || !retryable) { break }

        const retryAfter = isRunwareError(error) ? error.retryAfter : undefined
        const delay = retryAfter !== undefined
          ? retryAfter * 1000
          : calculateRetryDelay(attempt, config.retryDelay, config.retryStrategy)

        config.log.retry(`Retrying serverless request, attempt ${attempt + 1}/${config.maxRetries} in ${Math.round(delay)}ms`)
        await sleep(delay, signal)
      }
    }

    throw lastError
  }

  const getTask = async (
    appId: string,
    taskId: string,
    options?: GetTaskOptions,
  ): Promise<ServerlessTask> => {
    const app = validateAppId(appId)
    const id = validateTaskId(taskId)
    const result = await request(
      `${origin}/v1/apps/${app}/tasks/${id}`,
      { method: 'GET' },
      options?.timeout ?? config.timeout,
      options?.signal,
    )
    return toTask(result.body, 'getTask')
  }

  /**
   * Polls until the task reaches a terminal state. Never resubmits: the task
   * is already running, and a second invocation would be a second charge.
   */
  const waitForTask = async (
    task: ServerlessTask,
    options: InvokeOptions | undefined,
    startedAt: number,
  ): Promise<ServerlessTask> => {
    const intervalMs = options?.pollInterval !== undefined
      ? options.pollInterval * 1000
      : DEFAULT_POLL_INTERVAL_MS
    const budget = options?.pollTimeout ?? config.pollTimeout
    let notFoundSince: number | undefined
    let current = task

    while (!isTerminal(current.status)) {
      if (Date.now() - startedAt > budget) {
        throw createRunwareError(
          'timeout',
          `Task ${current.id} is still running after ${budget}ms. It was not cancelled: poll getTask("${current.appId}", "${current.id}") to pick it up.`,
          { taskUUID: current.id },
        )
      }

      await sleep(intervalMs, options?.signal)

      try {
        current = await getTask(current.appId, current.id, {
          ...(options?.timeout !== undefined ? { timeout: options.timeout } : {}),
          ...(options?.signal ? { signal: options.signal } : {}),
        })
        notFoundSince = undefined
      } catch (error) {
        if (isRunwareError(error) && error.statusCode === 404) {
          notFoundSince ??= Date.now()
          if (Date.now() - notFoundSince > TASK_NOT_FOUND_GRACE_MS) { throw error }
          continue
        }
        throw error
      }
    }

    return current
  }

  const invoke = async (
    params: InvokeParams,
    options?: InvokeOptions,
  ): Promise<ServerlessTask> => {
    const appId = validateAppId(params.appId)
    const endpointPath = validateEndpointPath(params.endpointPath)
    const taskId = resolveTaskId(params.taskId)
    const wait = options?.wait !== false
    const deliveryMethod = wait ? (options?.deliveryMethod ?? 'async') : 'async'
    const route = deliveryMethod === 'sync' ? 'invoke-sync' : 'invoke-async'

    const configured = options?.timeout ?? config.timeout
    const timeoutMs = deliveryMethod === 'sync'
      ? Math.max(configured, SYNC_MIN_TIMEOUT_MS)
      : configured

    const body = JSON.stringify({ taskId, payload: params.payload ?? {} })
    config.log.send(body)

    const startedAt = Date.now()
    const result = await request(
      `${origin}/v1/apps/${appId}/${route}/${endpointPath}`,
      { method: 'POST', body },
      timeoutMs,
      options?.signal,
    )

    const task = toTask(result.body, `invoke ${endpointPath}`)

    if (!wait || isTerminal(task.status)) {
      return task
    }

    return waitForTask(task, options, startedAt)
  }

  return { invoke, getTask }
}

export type ServerlessApi = ReturnType<typeof createServerlessApi>

export { createServerlessApi }
