import type { SDKConfig, TaskPayload } from '../src/types/sdk'

import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
} from 'bun:test'

import { validateTasks, clearValidatorCache } from '../src/validate'
import { isRunwareError } from '../src/errors'
import { createLogger } from '../src/logger'

const SDXL_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    taskType: { type: 'string' },
    taskUUID: { type: 'string' },
    model: { type: 'string' },
    positivePrompt: { type: 'string' },
    width: { type: 'integer' },
    height: { type: 'integer' },
  },
  required: ['taskType',
    'taskUUID',
    'model',
    'positivePrompt',
    'width',
    'height'],
}

const mockResolveResponse = (
  schema: Record<string, unknown> | null,
  status = 200,
) => ({
  ok: status < 400,
  status,
  json: async () => ({ requestSchema: schema, responseSchema: null }),
})

const baseConfig = (fetchImpl: unknown): SDKConfig => ({
  apiKey: 'test-key',
  wsBaseUrl: 'wss://ws.test.com',
  httpBaseUrl: 'https://api.test.com',
  transport: 'rest',
  timeout: 5000,
  pollTimeout: 5000,
  authTimeout: 5000,
  maxRetries: 0,
  retryDelay: 0,
  retryStrategy: 'exponential',
  maxReconnectAttempts: Infinity,
  debug: false,
  log: createLogger(false),
  dependencies: { fetch: fetchImpl as typeof fetch },
})

describe('validateTasks', () => {
  beforeEach(() => {
    clearValidatorCache()
  })

  it('passes for a valid task', async () => {
    const fetch = vi.fn().mockResolvedValue(mockResolveResponse(SDXL_SCHEMA))

    const task: TaskPayload = {
      taskType: 'imageInference',
      taskUUID: 'u1',
      model: 'civitai:1@1',
      positivePrompt: 'a landscape',
      width: 1024,
      height: 1024,
    }

    await validateTasks([task], baseConfig(fetch))
    expect(fetch).toHaveBeenCalledTimes(1)
    expect(fetch.mock.calls[0][0]).toBe('https://schemas.runware.ai/resolve/civitai%3A1%401')
  })

  it('throws RunwareError(validationFailed) when a required field is missing', async () => {
    const fetch = vi.fn().mockResolvedValue(mockResolveResponse(SDXL_SCHEMA))

    const task: TaskPayload = {
      taskType: 'imageInference',
      taskUUID: 'u2',
      model: 'civitai:2@1',
      // positivePrompt missing
      width: 1024,
      height: 1024,
    }

    await expect(validateTasks([task], baseConfig(fetch))).rejects.toThrow(/Validation failed/)
  })

  it('throws RunwareError(validationFailed) when type is wrong', async () => {
    const fetch = vi.fn().mockResolvedValue(mockResolveResponse(SDXL_SCHEMA))

    const task: TaskPayload = {
      taskType: 'imageInference',
      taskUUID: 'u3',
      model: 'civitai:3@1',
      positivePrompt: 'ok',
      width: 'not-a-number',
      height: 1024,
    }

    await expect(validateTasks([task], baseConfig(fetch))).rejects.toThrow(/Validation failed/)
  })

  it('skips validation when /resolve returns 404', async () => {
    const fetch = vi.fn().mockResolvedValue(mockResolveResponse(null, 404))

    const task: TaskPayload = {
      taskType: 'imageInference',
      taskUUID: 'u4',
      model: 'unknown:0@0',
      anything: 'goes',
    }

    await validateTasks([task], baseConfig(fetch))
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it('skips validation when the network fails', async () => {
    const fetch = vi.fn().mockRejectedValue(new Error('network down'))

    const task: TaskPayload = {
      taskType: 'imageInference',
      taskUUID: 'u5',
      model: 'something:0@0',
      anything: 'goes',
    }

    // Should not throw — falls through silently, server still validates
    await validateTasks([task], baseConfig(fetch))
  })

  it('skips validation when task has no model field', async () => {
    const fetch = vi.fn()

    const task: TaskPayload = {
      taskType: 'getResponse',
      taskUUID: 'u6',
    }

    await validateTasks([task], baseConfig(fetch))
    expect(fetch).not.toHaveBeenCalled()
  })

  it('caches validators per model across calls', async () => {
    const fetch = vi.fn().mockResolvedValue(mockResolveResponse(SDXL_SCHEMA))

    const valid: TaskPayload = {
      taskType: 'imageInference',
      taskUUID: 'u-valid',
      model: 'civitai:cached@1',
      positivePrompt: 'ok',
      width: 1024,
      height: 1024,
    }

    await validateTasks([valid], baseConfig(fetch))
    await validateTasks([valid], baseConfig(fetch))
    await validateTasks([valid], baseConfig(fetch))

    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it('dedupes concurrent first-hits for the same model into one fetch+compile', async () => {
    const fetch = vi.fn().mockImplementation(async () => {
      await new Promise((resolve) => { setTimeout(resolve, 5) })
      return mockResolveResponse(SDXL_SCHEMA)
    })

    const config = baseConfig(fetch)
    const tasks = Array.from({ length: 10 }, (_, i) => ({
      taskType: 'imageInference',
      taskUUID: `u-concurrent-${i}`,
      model: 'civitai:concurrent@1',
      positivePrompt: 'ok',
      width: 1024,
      height: 1024,
    } as TaskPayload))

    await Promise.all(tasks.map(async (t) => validateTasks([t], config)))

    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it('validates each task in a batch and identifies the failing one', async () => {
    const fetch = vi.fn().mockResolvedValue(mockResolveResponse(SDXL_SCHEMA))

    const valid: TaskPayload = {
      taskType: 'imageInference',
      taskUUID: 'u-valid',
      model: 'civitai:ok@1',
      positivePrompt: 'ok',
      width: 1024,
      height: 1024,
    }
    const invalid: TaskPayload = {
      taskType: 'imageInference',
      taskUUID: 'u-invalid',
      model: 'civitai:bad@1',
      width: 1024,
      height: 1024,
    }

    try {
      await validateTasks([valid, invalid], baseConfig(fetch))
      throw new Error('expected validation to throw')
    } catch (error) {
      expect(isRunwareError(error)).toBe(true)
      if (!isRunwareError(error)) { return }
      expect(error.taskUUID).toBe('u-invalid')
    }
  })
})

describe('validation errors are RunwareError with category=validation', () => {
  it('thrown error has the right shape', async () => {
    const fetch = vi.fn().mockResolvedValue(mockResolveResponse(SDXL_SCHEMA))

    const invalid: TaskPayload = {
      taskType: 'imageInference',
      taskUUID: 'u-bad',
      model: 'civitai:bad@1',
      width: 1024,
      height: 1024,
    }

    try {
      await validateTasks([invalid], baseConfig(fetch))
      throw new Error('expected to throw')
    } catch (err) {
      expect(isRunwareError(err)).toBe(true)
      if (!isRunwareError(err)) { return }
      expect(err.code).toBe('validation')
      expect(err.taskType).toBe('imageInference')
      expect(err.taskUUID).toBe('u-bad')
      expect(err.validationErrors).toBeDefined()
    }
  })
})

describe('clearValidatorCache', () => {
  it('forces re-fetch on next validate call', async () => {
    const fetch = vi.fn().mockResolvedValue(mockResolveResponse(SDXL_SCHEMA))

    const task: TaskPayload = {
      taskType: 'imageInference',
      taskUUID: 'u1',
      model: 'civitai:reset@1',
      positivePrompt: 'ok',
      width: 1024,
      height: 1024,
    }

    await validateTasks([task], baseConfig(fetch))
    expect(fetch).toHaveBeenCalledTimes(1)

    clearValidatorCache()

    await validateTasks([task], baseConfig(fetch))
    expect(fetch).toHaveBeenCalledTimes(2)
  })
})
