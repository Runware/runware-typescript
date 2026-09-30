import type { SDKConfig } from '../src/types/sdk'

import {
  describe,
  it,
  expect,
} from 'bun:test'

import { createServerlessApi } from '../src/serverless'
import { createLogger } from '../src/logger'
import { isRunwareError } from '../src/errors'

type Call = { url: string, init: RequestInit }

type Reply = {
  status: number
  body?: unknown
  headers?: Record<string, string>
}

const jsonResponse = (reply: Reply): Response => ({
  ok: reply.status >= 200 && reply.status < 300,
  status: reply.status,
  statusText: String(reply.status),
  headers: { get: (name: string) => reply.headers?.[name] ?? null },
  json: async () => {
    if (reply.body === undefined) { throw new Error('no body') }
    return reply.body
  },
} as unknown as Response)

const mockFetch = (replies: Reply[]) => {
  const calls: Call[] = []
  const impl = async (url: string, init: RequestInit): Promise<Response> => {
    calls.push({ url, init })
    const reply = replies[calls.length - 1]
    if (!reply) { throw new Error(`unexpected request #${calls.length} to ${url}`) }
    return jsonResponse(reply)
  }
  return { impl, calls }
}

const config = (fetchImpl: unknown, overrides?: Partial<SDKConfig>): SDKConfig => ({
  apiKey: 'test-key',
  wsBaseUrl: 'wss://ws.test.com',
  httpBaseUrl: 'https://api.test.com',
  serverlessBaseUrl: 'https://serverless.test.com',
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
  ...overrides,
})

const task = (over?: Record<string, unknown>) => ({
  id: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
  status: 'completed',
  appId: 'my-app',
  endpointPath: 'generate',
  output: { image: 'abc' },
  error: null,
  createdAt: '2026-09-29T10:00:00Z',
  completedAt: '2026-09-29T10:00:05Z',
  ...over,
})

const body = (call: Call): Record<string, unknown> =>
  JSON.parse(call.init.body as string) as Record<string, unknown>

describe('invoke — routes and body', () => {
  it('posts to invoke-async by default and returns the finished task', async () => {
    const { impl, calls } = mockFetch([{ status: 200, body: task() }])
    const api = createServerlessApi(config(impl))

    const result = await api.invoke({
      appId: 'my-app',
      endpointPath: 'generate',
      payload: { prompt: 'a cat' },
    })

    expect(calls).toHaveLength(1)
    expect(calls[0]!.url).toBe('https://serverless.test.com/v1/apps/my-app/invoke-async/generate')
    expect(calls[0]!.init.method).toBe('POST')
    expect(body(calls[0]!).payload).toEqual({ prompt: 'a cat' })
    expect(result.output).toEqual({ image: 'abc' })
  })

  it('posts to invoke-sync when deliveryMethod is sync', async () => {
    const { impl, calls } = mockFetch([{ status: 200, body: task() }])
    const api = createServerlessApi(config(impl))

    await api.invoke(
      { appId: 'my-app', endpointPath: 'generate' },
      { deliveryMethod: 'sync' },
    )

    expect(calls[0]!.url).toBe('https://serverless.test.com/v1/apps/my-app/invoke-sync/generate')
  })

  it('sends an empty payload when none is given', async () => {
    const { impl, calls } = mockFetch([{ status: 200, body: task() }])
    const api = createServerlessApi(config(impl))

    await api.invoke({ appId: 'my-app', endpointPath: 'generate' })

    expect(body(calls[0]!).payload).toEqual({})
  })

  it('authenticates every call with the API key', async () => {
    const { impl, calls } = mockFetch([{ status: 200, body: task() }])
    const api = createServerlessApi(config(impl))

    await api.invoke({ appId: 'my-app', endpointPath: 'generate' })

    const headers = calls[0]!.init.headers as Record<string, string>
    expect(headers.Authorization).toBe('Bearer test-key')
  })

  it('trims a trailing slash off the configured origin', async () => {
    const { impl, calls } = mockFetch([{ status: 200, body: task() }])
    const api = createServerlessApi(config(impl, { serverlessBaseUrl: 'https://serverless.test.com/' }))

    await api.invoke({ appId: 'my-app', endpointPath: 'generate' })

    expect(calls[0]!.url).toBe('https://serverless.test.com/v1/apps/my-app/invoke-async/generate')
  })
})

describe('invoke — task id', () => {
  it('generates a task id when none is given', async () => {
    const { impl, calls } = mockFetch([{ status: 200, body: task() }])
    const api = createServerlessApi(config(impl))

    await api.invoke({ appId: 'my-app', endpointPath: 'generate' })

    expect(body(calls[0]!).taskId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/)
  })

  it('sends a supplied task id unchanged, so a lost response can be retried', async () => {
    const { impl, calls } = mockFetch([{ status: 200, body: task() }])
    const api = createServerlessApi(config(impl))

    await api.invoke({
      appId: 'my-app',
      endpointPath: 'generate',
      taskId: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
    })

    expect(body(calls[0]!).taskId).toBe('7c9e6679-7425-40de-944b-e07fc1f90ae7')
  })

  it('rejects a task id that is not a lowercase UUID', async () => {
    const { impl, calls } = mockFetch([])
    const api = createServerlessApi(config(impl))

    await expect(api.invoke({
      appId: 'my-app',
      endpointPath: 'generate',
      taskId: 'not-a-uuid',
    })).rejects.toThrow(/lowercase UUID/)
    expect(calls).toHaveLength(0)
  })
})

describe('invoke — local validation', () => {
  it('rejects an endpoint path with a leading slash and suggests the bare one', async () => {
    const { impl, calls } = mockFetch([])
    const api = createServerlessApi(config(impl))

    await expect(api.invoke({ appId: 'my-app', endpointPath: '/generate' }))
      .rejects.toThrow(/without a leading slash \(e\.g\. "generate"\)/)
    expect(calls).toHaveLength(0)
  })

  it('rejects an endpoint path that is not a bare lowercase segment', async () => {
    const { impl } = mockFetch([])
    const api = createServerlessApi(config(impl))

    await expect(api.invoke({ appId: 'my-app', endpointPath: 'Generate Image' }))
      .rejects.toThrow(/lowercase segment/)
  })

  it('rejects an app id that cannot exist', async () => {
    const { impl } = mockFetch([])
    const api = createServerlessApi(config(impl))

    await expect(api.invoke({ appId: 'No', endpointPath: 'generate' }))
      .rejects.toThrow(/appId "No" is invalid/)
  })

  it('names the offending parameter on the error', async () => {
    const { impl } = mockFetch([])
    const api = createServerlessApi(config(impl))

    try {
      await api.invoke({ appId: 'my-app', endpointPath: '/generate' })
      throw new Error('should have thrown')
    } catch (error) {
      expect(isRunwareError(error) && error.parameter).toBe('endpointPath')
    }
  })
})

describe('invoke — waiting', () => {
  it('polls after a sync wait window expires, and never resubmits', async () => {
    const pending = task({ status: 'pending', output: null, completedAt: null })
    const { impl, calls } = mockFetch([
      { status: 202, body: pending }, { status: 200, body: pending }, { status: 200, body: task() },
    ])
    const api = createServerlessApi(config(impl))

    const result = await api.invoke(
      { appId: 'my-app', endpointPath: 'generate' },
      { deliveryMethod: 'sync', pollInterval: 0 },
    )

    expect(result.status).toBe('completed')
    expect(calls[0]!.url).toContain('/invoke-sync/')
    expect(calls.map((call) => call.init.method)).toEqual(['POST', 'GET', 'GET'])
    expect(calls[1]!.url).toBe('https://serverless.test.com/v1/apps/my-app/tasks/7c9e6679-7425-40de-944b-e07fc1f90ae7')
  })

  it('polls under the app the response names, not the one invoked', async () => {
    const pending = task({
      status: 'pending', appId: 'other-app', output: null, completedAt: null, 
    })
    const { impl, calls } = mockFetch([
      { status: 202, body: pending }, { status: 200, body: task({ appId: 'other-app' }) },
    ])
    const api = createServerlessApi(config(impl))

    await api.invoke({ appId: 'my-app', endpointPath: 'generate' }, { pollInterval: 0 })

    expect(calls[1]!.url).toContain('/v1/apps/other-app/tasks/')
  })

  it('returns the accepted task without polling when wait is false', async () => {
    const { impl, calls } = mockFetch([
      { status: 202, body: task({ status: 'pending', output: null, completedAt: null }) },
    ])
    const api = createServerlessApi(config(impl))

    const result = await api.invoke(
      { appId: 'my-app', endpointPath: 'generate' },
      { wait: false },
    )

    expect(result.status).toBe('pending')
    expect(calls).toHaveLength(1)
  })

  it('sends a task on the async route when wait is false, whatever delivery method was asked for', async () => {
    const { impl, calls } = mockFetch([
      { status: 202, body: task({ status: 'pending', output: null, completedAt: null }) },
    ])
    const api = createServerlessApi(config(impl))

    const result = await api.invoke(
      { appId: 'my-app', endpointPath: 'generate' },
      { deliveryMethod: 'sync', wait: false },
    )

    expect(calls[0]!.url).toBe('https://serverless.test.com/v1/apps/my-app/invoke-async/generate')
    expect(result.status).toBe('pending')
    expect(calls).toHaveLength(1)
  })

  it('returns a failed task rather than throwing, because it is an outcome', async () => {
    const { impl } = mockFetch([
      { status: 200, body: task({ status: 'failed', output: null, error: 'handler raised' }) },
    ])
    const api = createServerlessApi(config(impl))

    const result = await api.invoke({ appId: 'my-app', endpointPath: 'generate' })

    expect(result.status).toBe('failed')
    expect(result.error).toBe('handler raised')
  })

  it('retries a 404 while the accepted task is still reaching the result store', async () => {
    const pending = task({ status: 'pending', output: null, completedAt: null })
    const { impl, calls } = mockFetch([
      { status: 202, body: pending }, { status: 404, body: { type: 'about:blank', title: 'Not Found', status: 404 } }, { status: 200, body: task() },
    ])
    const api = createServerlessApi(config(impl))

    const result = await api.invoke(
      { appId: 'my-app', endpointPath: 'generate' },
      { pollInterval: 0 },
    )

    expect(result.status).toBe('completed')
    expect(calls).toHaveLength(3)
  })

  it('gives up on a task that outlives the poll budget, and says it is still running', async () => {
    const pending = task({ status: 'pending', output: null, completedAt: null })
    const { impl } = mockFetch(Array.from({ length: 40 }, () => ({ status: 200, body: pending })))
    const api = createServerlessApi(config(impl, { pollTimeout: 0 }))

    await expect(api.invoke(
      { appId: 'my-app', endpointPath: 'generate' },
      { pollInterval: 0 },
    )).rejects.toThrow(/still running after 0ms. It was not cancelled/)
  })

  it('stops polling when the signal aborts', async () => {
    const pending = task({ status: 'pending', output: null, completedAt: null })
    const { impl } = mockFetch(Array.from({ length: 40 }, () => ({ status: 200, body: pending })))
    const api = createServerlessApi(config(impl))
    const controller = new AbortController()
    setTimeout(() => controller.abort(), 5)

    await expect(api.invoke(
      { appId: 'my-app', endpointPath: 'generate' },
      { pollInterval: 0.01, signal: controller.signal },
    )).rejects.toThrow(/aborted/i)
  })
})

describe('invoke — problem responses', () => {
  it('maps a 404 onto a notFound error carrying the problem type', async () => {
    const { impl } = mockFetch([{
      status: 404,
      body: {
        type: 'https://docs.runware.ai/serverless/errors#not-found',
        title: 'Not Found',
        status: 404,
        detail: 'No app \'my-app\' exists for the authenticated organization.',
        requestId: 'req-42',
      },
    }])
    const api = createServerlessApi(config(impl))

    try {
      await api.invoke({ appId: 'my-app', endpointPath: 'generate' })
      throw new Error('should have thrown')
    } catch (error) {
      if (!isRunwareError(error)) { throw error }
      expect(error.code).toBe('notFound')
      expect(error.statusCode).toBe(404)
      expect(error.problemType).toBe('https://docs.runware.ai/serverless/errors#not-found')
      expect(error.requestId).toBe('req-42')
      expect(error.message).toContain('No app \'my-app\' exists')
    }
  })

  it('spells out the offending fields of a 422', async () => {
    const { impl } = mockFetch([{
      status: 422,
      body: {
        type: 'https://docs.runware.ai/serverless/errors#validation-error',
        title: 'Unprocessable Entity',
        status: 422,
        detail: 'The request body failed validation.',
        errors: [
          { pointer: '/payload/prompt', detail: 'is required' }, { pointer: '/payload/steps', detail: 'must be at most 50' },
        ],
      },
    }])
    const api = createServerlessApi(config(impl))

    await expect(api.invoke({ appId: 'my-app', endpointPath: 'generate' }))
      .rejects.toThrow(/\/payload\/prompt: is required[\s\S]*\/payload\/steps: must be at most 50/)
  })

  it('carries Retry-After off a capacity refusal', async () => {
    const { impl } = mockFetch([{
      status: 503,
      headers: { 'Retry-After': '30' },
      body: {
        type: 'https://docs.runware.ai/serverless/errors#capacity-unavailable',
        title: 'Service Unavailable',
        status: 503,
        detail: 'No workload is able to serve this app right now.',
      },
    }])
    const api = createServerlessApi(config(impl))

    try {
      await api.invoke({ appId: 'my-app', endpointPath: 'generate' })
      throw new Error('should have thrown')
    } catch (error) {
      if (!isRunwareError(error)) { throw error }
      expect(error.retryAfter).toBe(30)
      expect(error.problemType).toContain('capacity-unavailable')
    }
  })

  it('falls back to the status when the body is not a problem document', async () => {
    const { impl } = mockFetch([{ status: 500 }])
    const api = createServerlessApi(config(impl))

    try {
      await api.invoke({ appId: 'my-app', endpointPath: 'generate' })
      throw new Error('should have thrown')
    } catch (error) {
      if (!isRunwareError(error)) { throw error }
      expect(error.code).toBe('serverError')
      expect(error.message).toBe('HTTP 500')
    }
  })

  it('maps 401 onto an auth error', async () => {
    const { impl } = mockFetch([{
      status: 401,
      body: { type: 'about:blank', title: 'Unauthorized', status: 401 },
    }])
    const api = createServerlessApi(config(impl))

    try {
      await api.invoke({ appId: 'my-app', endpointPath: 'generate' })
      throw new Error('should have thrown')
    } catch (error) {
      expect(isRunwareError(error) && error.code).toBe('auth')
    }
  })
})

describe('invoke — retries', () => {
  it('retries a retryable status, and the task id makes that safe', async () => {
    const { impl, calls } = mockFetch([
      { status: 500, body: { title: 'Internal Server Error', status: 500 } }, { status: 200, body: task() },
    ])
    const api = createServerlessApi(config(impl, { maxRetries: 2 }))

    const result = await api.invoke({
      appId: 'my-app',
      endpointPath: 'generate',
      taskId: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
    })

    expect(result.status).toBe('completed')
    expect(calls).toHaveLength(2)
    expect(body(calls[0]!).taskId).toBe(body(calls[1]!).taskId)
  })

  it('does not retry a request the app itself refused', async () => {
    const { impl, calls } = mockFetch([
      { status: 409, body: { title: 'Conflict', status: 409, detail: 'App is stopped.' } }, { status: 200, body: task() },
    ])
    const api = createServerlessApi(config(impl, { maxRetries: 2 }))

    await expect(api.invoke({ appId: 'my-app', endpointPath: 'generate' })).rejects.toThrow(/App is stopped/)
    expect(calls).toHaveLength(1)
  })
})

describe('getTask', () => {
  it('reads one task by id', async () => {
    const { impl, calls } = mockFetch([{ status: 200, body: task() }])
    const api = createServerlessApi(config(impl))

    const result = await api.getTask('my-app', '7c9e6679-7425-40de-944b-e07fc1f90ae7')

    expect(result.status).toBe('completed')
    expect(calls[0]!.init.method).toBe('GET')
    expect(calls[0]!.url).toBe('https://serverless.test.com/v1/apps/my-app/tasks/7c9e6679-7425-40de-944b-e07fc1f90ae7')
  })

  it('rejects an id that is not a UUID instead of asking the API', async () => {
    const { impl, calls } = mockFetch([])
    const api = createServerlessApi(config(impl))

    await expect(api.getTask('my-app', 'nope')).rejects.toThrow(/lowercase UUID/)
    expect(calls).toHaveLength(0)
  })
})
