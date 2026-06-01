import {
  describe,
  it,
  expect,
  vi,
} from 'bun:test'

import { calculateRetryDelay, withRetry } from '../src/utils/retry'

describe('calculateRetryDelay', () => {
  it('uses exponential backoff: baseDelay * 2^attempt', () => {
    // Jitter adds 0–30%, so we check the base is correct
    const delay = calculateRetryDelay(0, 1000, 'exponential')
    expect(delay).toBeGreaterThanOrEqual(1000)
    expect(delay).toBeLessThanOrEqual(1300) // 1000 + 30% jitter
  })

  it('doubles on each attempt', () => {
    const d0 = calculateRetryDelay(0, 1000, 'exponential')
    const d1 = calculateRetryDelay(1, 1000, 'exponential')
    expect(d0).toBeGreaterThanOrEqual(1000)
    expect(d1).toBeGreaterThanOrEqual(2000)
    expect(d1).toBeLessThanOrEqual(2600)
  })

  it('uses linear backoff: baseDelay * (attempt + 1)', () => {
    const d0 = calculateRetryDelay(0, 1000, 'linear')
    expect(d0).toBe(1000)

    const d1 = calculateRetryDelay(1, 1000, 'linear')
    expect(d1).toBe(2000)

    const d2 = calculateRetryDelay(2, 1000, 'linear')
    expect(d2).toBe(3000)
  })

  it('caps delay at 30 seconds', () => {
    const delay = calculateRetryDelay(20, 1000, 'exponential')
    expect(delay).toBe(30000)
  })
})

describe('withRetry', () => {
  it('returns immediately on success', async () => {
    const fn = vi.fn().mockResolvedValue('result')

    const result = await withRetry(fn, {
      maxRetries: 3,
      retryDelay: 10,
    })

    expect(result).toBe('result')
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('throws immediately if shouldRetry returns false', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('fail'))

    const promise = withRetry(fn, {
      maxRetries: 3,
      retryDelay: 10,
      shouldRetry: () => false,
    })
    await expect(promise).rejects.toThrow('fail')

    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('retries up to maxRetries when shouldRetry returns true', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('transient'))

    const promise = withRetry(fn, {
      maxRetries: 2,
      retryDelay: 1,
      retryStrategy: 'linear',
      shouldRetry: () => true,
    })
    await expect(promise).rejects.toThrow('transient')

    // 1 initial + 2 retries = 3 total
    expect(fn).toHaveBeenCalledTimes(3)
  })

  it('succeeds on retry after initial failure', async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValue('ok')

    const result = await withRetry(fn, {
      maxRetries: 2,
      retryDelay: 1,
      retryStrategy: 'linear',
      shouldRetry: () => true,
    })

    expect(result).toBe('ok')
    expect(fn).toHaveBeenCalledTimes(2)
  })

  it('calls onRetry callback on each retry', async () => {
    const onRetry = vi.fn()
    const fn = vi.fn()
      .mockRejectedValueOnce(new Error('fail1'))
      .mockRejectedValueOnce(new Error('fail2'))
      .mockResolvedValue('ok')

    await withRetry(fn, {
      maxRetries: 3,
      retryDelay: 1,
      retryStrategy: 'linear',
      shouldRetry: () => true,
      onRetry,
    })

    expect(onRetry).toHaveBeenCalledTimes(2)
    expect(onRetry).toHaveBeenCalledWith(expect.any(Error), 1, expect.any(Number))
    expect(onRetry).toHaveBeenCalledWith(expect.any(Error), 2, expect.any(Number))
  })
})
