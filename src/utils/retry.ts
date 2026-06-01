import type { RetryStrategy } from '../types/sdk'

type RetryOptions = {
  maxRetries: number
  retryDelay: number
  retryStrategy?: RetryStrategy | undefined
  shouldRetry?: ((error: unknown) => boolean) | undefined
  onRetry?: ((error: unknown, attempt: number, delayMs: number) => void) | undefined
  signal?: AbortSignal | undefined
}

export const calculateRetryDelay = (
  attempt: number,
  baseDelay: number,
  strategy: RetryStrategy,
): number => {
  let delay: number
  if (strategy === 'linear') {
    delay = baseDelay * (attempt + 1)
  } else {
    const fullDelay = baseDelay * Math.pow(2, attempt)
    const jitter = Math.random() * 0.3 * fullDelay
    delay = fullDelay + jitter
  }

  return Math.min(delay, 30000)
}

const interruptibleSleep = async (ms: number, signal?: AbortSignal): Promise<void> =>
  new Promise((resolve) => {
    if (!signal) {
      setTimeout(resolve, ms)
      return
    }
    if (signal.aborted) {
      resolve()
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

export const withRetry = async <T>(fn: () => Promise<T>, options: RetryOptions): Promise<T> => {
  const {
    maxRetries,
    retryDelay,
    retryStrategy = 'exponential',
    shouldRetry = () => false,
    onRetry,
    signal,
  } = options

  let lastError: unknown

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error: unknown) {
      lastError = error

      if (attempt === maxRetries || !shouldRetry(error)) {
        break
      }

      const delay = calculateRetryDelay(attempt, retryDelay, retryStrategy)

      if (onRetry) {
        onRetry(error, attempt + 1, delay)
      }

      await interruptibleSleep(delay, signal)

      if (signal?.aborted) { break }
    }
  }

  throw lastError
}
