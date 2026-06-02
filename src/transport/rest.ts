import type { SDKConfig, TaskPayload } from '../types/sdk'
import type { RestTransport, RequestOptions } from '../types/transport'

import { createRunwareError, isRunwareError, parseApiError } from '../errors'
import { withRetry } from '../utils/retry'

type TimeoutError = Error & { isTimeoutError: true }

const createTimeoutError = (message: string): TimeoutError => {
  const error = new Error(message) as TimeoutError
  error.name = 'TimeoutError'
  error.isTimeoutError = true
  return error
}

const isTimeoutError = (error: unknown): error is TimeoutError =>
  error instanceof Error && (error as Partial<TimeoutError>).isTimeoutError === true

const isAbortError = (error: unknown) => (error instanceof Error && error.name === 'AbortError')

const isRetryableStatus = (status: number) =>
  (status === 408 || status === 429 || (status >= 500 && status < 600))

export const createRestTransport = (config: SDKConfig): RestTransport => {
  const customFetch = async (url: string, options: RequestInit): Promise<Response> => {
    const fetchImpl = config.dependencies?.fetch ?? globalThis.fetch
    if (!fetchImpl) {
      throw createRunwareError('noFetchImpl', 'Fetch implementation is required for REST transport')
    }

    return fetchImpl(url, options)
  }

  const sendRequest = async (data: TaskPayload | TaskPayload[], options?: RequestOptions) => {
    const payload = (Array.isArray(data)) ? data : [data]
    const url = config.httpBaseUrl
    const requestTimeout = options?.timeout ?? config.timeout

    try {
      const response = await fetchWithRetry(
        url,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${config.apiKey}`,
          },
          body: JSON.stringify(payload),
        },
        requestTimeout,
        options?.signal,
      )

      return response
    } catch (error: unknown) {
      if (isTimeoutError(error)) {
        throw createRunwareError(
          'timeout',
          `REST request timed out after ${requestTimeout}ms (gave up after ${config.maxRetries + 1} attempts)`,
        )
      }

      throw error
    }
  }

  const fetchWithRetry = async <T>(
    url: string,
    options: RequestInit,
    requestTimeout: number,
    externalSignal: AbortSignal | undefined,
  ): Promise<T> => {
    return withRetry(
      async () => {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), requestTimeout)

        const onExternalAbort = () => controller.abort()
        if (externalSignal) {
          if (externalSignal.aborted) { controller.abort() }
          else { externalSignal.addEventListener('abort', onExternalAbort, { once: true }) }
        }

        try {
          const response = await customFetch(url, {
            ...options,
            signal: controller.signal,
          })

          if (!response.ok) {
            let body: unknown
            try { body = await response.json() } catch { body = null }

            if (body) {
              let context: { taskType?: string, model?: string } | undefined
              try {
                const sent = JSON.parse(options.body as string)
                const firstTask = Array.isArray(sent) ? sent[0] : sent
                if (firstTask) {
                  context = {
                    taskType: firstTask.taskType,
                    model: firstTask.model,
                  }
                }
              } catch { }

              const parsed = parseApiError(body, context)
              parsed.statusCode = response.status
              throw parsed
            }

            if (response.status === 401) {
              throw createRunwareError(
                'invalidApiKey',
                `Authentication failed: invalid API key (HTTP 401 ${response.statusText})`,
                { statusCode: 401 },
              )
            }

            throw createRunwareError(
              'httpError',
              `HTTP ${response.status}: ${response.statusText}`,
              { statusCode: response.status },
            )
          }

          return await response.json() as T
        } catch (error) {
          if (isAbortError(error)) {
            if (externalSignal?.aborted) {
              throw createRunwareError('aborted', 'Request aborted')
            }
            throw createTimeoutError(`Request timed out after ${requestTimeout}ms`)
          }
          throw error
        } finally {
          clearTimeout(timeoutId)
          if (externalSignal) {
            externalSignal.removeEventListener('abort', onExternalAbort)
          }
        }
      },
      {
        maxRetries: config.maxRetries,
        retryDelay: config.retryDelay,
        retryStrategy: config.retryStrategy,
        signal: externalSignal,
        shouldRetry: (error: unknown): boolean => {
          // Don't retry on user-initiated abort
          if (isRunwareError(error) && error.code === 'aborted') { return false }
          // Retry on timeout
          if (isTimeoutError(error)) { return true }
          // Retry on retryable HTTP status (5xx, 429, 408)
          if (isRunwareError(error) && error.statusCode !== undefined) {
            if (isRetryableStatus(error.statusCode)) { return true }
          }
          // Retry on raw network errors (DNS failure, ECONNRESET — fetch throws TypeError)
          if (error instanceof TypeError) { return true }
          return false
        },
        onRetry: (error: unknown, attempt: number, delayMs: number) => {
          const reason = (() => {
            if (isTimeoutError(error)) { return 'timeout' }
            if (isRunwareError(error) && error.statusCode) {
              return `HTTP ${error.statusCode}`
            }
            if (error instanceof TypeError) { return 'network error' }
            return 'unknown'
          })()
          config.log.retry(`Retrying after ${reason}, attempt ${attempt}/${config.maxRetries} in ${Math.round(delayMs)}ms`)
        },
      },
    )
  }

  return { type: 'rest', sendRequest }
}
