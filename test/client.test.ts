import type { WebSocketTransport, WsResponse } from '../src/types/transport'
import type { ResponseCallback, TaskPayload } from '../src/types/sdk'
import type { SchemaKey } from '../src/types/task-map'

import {
  describe,
  it,
  expect,
  vi,
} from 'bun:test'

import {
  models,
  architectureTaskTypes,
  modalityTaskTypes,
} from '../src/types/task-map'

const createMockTransport = () => {
  const sentPayloads: TaskPayload[][] = []
  const taskCallbacks = new Map<string, ResponseCallback<WsResponse>>()

  const transport: WebSocketTransport = {
    type: 'websocket',
    connect: vi.fn().mockResolvedValue(undefined),
    disconnect: vi.fn().mockResolvedValue(undefined),
    isConnected: vi.fn().mockReturnValue(true),
    getSessionId: vi.fn().mockReturnValue('test-session'),
    sendRequest: vi.fn(async (data: TaskPayload | TaskPayload[]) => {
      const payload = Array.isArray(data) ? data : [data]
      sentPayloads.push(payload)
    }),
    subscribeToTask: vi.fn((taskUUID: string, callback: ResponseCallback<WsResponse>) => {
      taskCallbacks.set(taskUUID, callback)
    }),
    unsubscribeFromTask: vi.fn((taskUUID: string) => {
      taskCallbacks.delete(taskUUID)
    }),
  }

  return {
    transport,
    sentPayloads,
    simulateResponse: (taskUUID: string, data: Record<string, unknown>[]) => {
      const callback = taskCallbacks.get(taskUUID)
      if (callback) {
        callback({ data } as WsResponse)
      }
    },
    simulateError: (taskUUID: string, errorMessage: string) => {
      const callback = taskCallbacks.get(taskUUID)
      if (callback) {
        callback({ error: [{ message: errorMessage, taskUUID }] } as WsResponse)
      }
    },
    taskCallbacks,
  }
}

describe('normalizeTasks logic', () => {
  const normalizeTasks = (
    taskType: string,
    params: Record<string, unknown> | Record<string, unknown>[],
  ): TaskPayload[] => {
    const items = Array.isArray(params) ? params : [params]
    return items.map((item) => ({
      ...item,
      taskType,
      taskUUID: (item.taskUUID as string) ?? 'test-uuid',
    }))
  }

  it('wraps single params into an array', () => {
    const result = normalizeTasks('imageInference', { model: 'test' })
    expect(result).toHaveLength(1)
    expect(result[0]).toMatchObject({
      model: 'test',
      taskType: 'imageInference',
      taskUUID: 'test-uuid',
    })
  })

  it('preserves existing taskUUID', () => {
    const result = normalizeTasks('imageInference', {
      model: 'test',
      taskUUID: 'my-uuid',
    })
    expect(result[0].taskUUID).toBe('my-uuid')
  })

  it('handles array of params', () => {
    const result = normalizeTasks('imageInference', [{ model: 'a' }, { model: 'b' }])
    expect(result).toHaveLength(2)
    expect(result[0].taskType).toBe('imageInference')
    expect(result[1].taskType).toBe('imageInference')
  })

  it('injects taskType and does not clobber user params', () => {
    const result = normalizeTasks('caption', {
      model: 'test',
      inputs: { image: 'url' },
      customField: 42,
    })
    expect(result[0]).toMatchObject({
      model: 'test',
      inputs: { image: 'url' },
      customField: 42,
      taskType: 'caption',
    })
  })
})

describe('resolveTaskType logic', () => {

  const resolveTaskType = (
    schemaKey: SchemaKey | undefined,
    params: Record<string, unknown>,
  ): string => {
    if (typeof params.taskType === 'string') { return params.taskType }
    if (typeof params.model === 'string' && params.model in models) { return models[params.model].taskType }
    if (schemaKey && schemaKey in architectureTaskTypes) { return architectureTaskTypes[schemaKey] }
    if (schemaKey && schemaKey in modalityTaskTypes) { return modalityTaskTypes[schemaKey] }
    const model = typeof params.model === 'string' ? params.model : 'undefined'
    throw new Error(`Unknown model '${model}'.`)
  }

  it('uses explicit taskType from params when provided', () => {
    expect(resolveTaskType(undefined, { taskType: 'caption' }))
      .toBe('caption')
  })

  it('auto-resolves taskType from official model AIR', () => {
    expect(resolveTaskType(undefined, { model: 'runway:1@1' }))
      .toBe('videoInference')
  })

  it('auto-resolves caption model', () => {
    expect(resolveTaskType(undefined, { model: 'runware:150@2' }))
      .toBe('caption')
  })

  it('resolves taskType from architecture map', () => {
    expect(resolveTaskType('sdxl' as SchemaKey, {}))
      .toBe('imageInference')
  })

  it('resolves taskType from modality map', () => {
    expect(resolveTaskType('video' as SchemaKey, {}))
      .toBe('videoInference')
  })

  it('throws for unknown model without taskType or architecture', () => {
    expect(() => resolveTaskType(undefined, { model: 'civitai:123@456' }))
      .toThrow('Unknown model \'civitai:123@456\'')
  })

  it('explicit taskType takes priority over model AIR', () => {
    expect(resolveTaskType(undefined, { model: 'runway:1@1', taskType: 'override' }))
      .toBe('override')
  })

  it('model AIR takes priority over schema key', () => {
    // Even if schemaKey says sdxl (imageInference), the model says video
    expect(resolveTaskType('sdxl' as SchemaKey, { model: 'runway:1@1' }))
      .toBe('videoInference')
  })
})

describe('execute via mock WebSocket transport', () => {
  it('sends tasks and collects results', async () => {
    const { transport, simulateResponse } = createMockTransport()

    const taskUUID = 'uuid-1'
    const tasks: TaskPayload[] = [{
      taskType: 'imageInference',
      taskUUID,
      model: 'test',
      positivePrompt: 'hello',
    }]

    const resultPromise = new Promise<unknown[]>((resolve, reject) => {
      const results: unknown[] = []

      transport.subscribeToTask(taskUUID, (response) => {
        if ((response as any).error) {
          reject(new Error('Task error'))
          return
        }
        if (response.data) {
          results.push(...response.data)
          if (results.length >= 1) { resolve(results) }
        }
      })

      transport.sendRequest(tasks)
    })

    simulateResponse(taskUUID, [{ taskUUID, imageURL: 'https://result.jpg' }])

    const results = await resultPromise
    expect(results).toHaveLength(1)
    expect(results[0]).toMatchObject({ imageURL: 'https://result.jpg' })
  })

  it('handles multiple results from numberResults > 1', async () => {
    const { transport, simulateResponse } = createMockTransport()
    const taskUUID = 'uuid-multi'

    const resultPromise = new Promise<unknown[]>((resolve) => {
      const results: unknown[] = []

      transport.subscribeToTask(taskUUID, (response) => {
        if (response.data) {
          results.push(...response.data)
          if (results.length >= 3) { resolve(results) }
        }
      })

      transport.sendRequest([{
        taskType: 'imageInference',
        taskUUID,
        model: 'test',
        numberResults: 3,
      }])
    })

    simulateResponse(taskUUID, [{ taskUUID, imageURL: 'img1.jpg' }, { taskUUID, imageURL: 'img2.jpg' }])
    simulateResponse(taskUUID, [{ taskUUID, imageURL: 'img3.jpg' }])

    const results = await resultPromise
    expect(results).toHaveLength(3)
  })

  it('handles API errors', async () => {
    const { transport, simulateError } = createMockTransport()
    const taskUUID = 'uuid-err'

    const resultPromise = new Promise<unknown[]>((resolve, reject) => {
      transport.subscribeToTask(taskUUID, (response) => {
        if ((response as any).error) {
          const errors = (response as any).error
          const msg = Array.isArray(errors)
            ? errors.map((err: any) => err.message).join(', ')
            : errors.message
          reject(new Error(msg))
          return
        }
        if (response.data) { resolve(response.data) }
      })

      transport.sendRequest([{ taskType: 'imageInference', taskUUID, model: 'test' }])
    })

    simulateError(taskUUID, 'Insufficient credits')

    await expect(resultPromise).rejects.toThrow('Insufficient credits')
  })

  it('routes responses to correct task by UUID (no race condition)', async () => {
    const { transport, simulateResponse } = createMockTransport()

    const results1: unknown[] = []
    const results2: unknown[] = []

    const p1 = new Promise<void>((resolve) => {
      transport.subscribeToTask('task-a', (response) => {
        if (response.data) {
          results1.push(...response.data)
          resolve()
        }
      })
    })

    const p2 = new Promise<void>((resolve) => {
      transport.subscribeToTask('task-b', (response) => {
        if (response.data) {
          results2.push(...response.data)
          resolve()
        }
      })
    })

    const t1: TaskPayload = { taskType: 'imageInference', taskUUID: 'task-a', model: 'a' }
    const t2: TaskPayload = { taskType: 'imageInference', taskUUID: 'task-b', model: 'b' }
    transport.sendRequest([t1, t2])

    simulateResponse('task-b', [{ taskUUID: 'task-b', imageURL: 'b.jpg' }])
    simulateResponse('task-a', [{ taskUUID: 'task-a', imageURL: 'a.jpg' }])

    await Promise.all([p1, p2])

    expect(results1).toHaveLength(1)
    expect(results1[0]).toMatchObject({ imageURL: 'a.jpg' })
    expect(results2).toHaveLength(1)
    expect(results2[0]).toMatchObject({ imageURL: 'b.jpg' })
  })

  it('unsubscribeFromTask stops routing', () => {
    const { transport, simulateResponse } = createMockTransport()
    const received: unknown[] = []

    transport.subscribeToTask('task-x', (response) => {
      if (response.data) { received.push(...response.data) }
    })

    simulateResponse('task-x', [{ result: 1 }])
    expect(received).toHaveLength(1)

    transport.unsubscribeFromTask('task-x')

    simulateResponse('task-x', [{ result: 2 }])
    expect(received).toHaveLength(1)
  })
})

describe('REST transport sendRequest', () => {
  it('sends payload as JSON POST', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: [{ taskUUID: 'r1', imageURL: 'result.jpg' }] }),
    })

    const { createRestTransport } = await import('../src/transport/rest')

    const { createLogger } = await import('../src/logger')

    const transport = createRestTransport({
      apiKey: 'test-key',
      wsBaseUrl: 'wss://ws.test.com',
      httpBaseUrl: 'https://api.test.com',
      transportType: 'rest',
      timeout: 5000,
      pollTimeout: 5000,
      authTimeout: 5000,
      maxRetries: 0,
      retryDelay: 0,
      retryStrategy: 'exponential',
      maxReconnectAttempts: Infinity,
      debug: false,
      log: createLogger(false),
      dependencies: { fetch: mockFetch as unknown as typeof fetch },
    })

    await transport.sendRequest([{
      taskType: 'imageInference',
      taskUUID: 'r1',
      model: 'test-model',
    }])

    expect(mockFetch).toHaveBeenCalledTimes(1)
    const [url, options] = mockFetch.mock.calls[0]
    expect(url).toBe('https://api.test.com')
    expect(options.method).toBe('POST')
    expect(options.headers['Authorization']).toBe('Bearer test-key')
    expect(JSON.parse(options.body)).toEqual([{
      taskType: 'imageInference',
      taskUUID: 'r1',
      model: 'test-model',
    }])
  })

  it('throws on 401 with auth error', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
    })

    const { createRestTransport } = await import('../src/transport/rest')

    const { createLogger } = await import('../src/logger')

    const transport = createRestTransport({
      apiKey: 'bad-key',
      wsBaseUrl: 'wss://ws.test.com',
      httpBaseUrl: 'https://api.test.com',
      transportType: 'rest',
      timeout: 5000,
      pollTimeout: 5000,
      authTimeout: 5000,
      maxRetries: 0,
      retryDelay: 0,
      retryStrategy: 'exponential',
      maxReconnectAttempts: Infinity,
      debug: false,
      log: createLogger(false),
      dependencies: { fetch: mockFetch as unknown as typeof fetch },
    })

    const promise = transport.sendRequest([{ taskType: 'test', taskUUID: 'x', model: 'x' }])
    await expect(promise).rejects.toThrow('Authentication failed')
  })

  it('retries on 503 then succeeds', async () => {
    let calls = 0
    const mockFetch = vi.fn().mockImplementation(async () => {
      calls += 1
      if (calls < 3) {
        return {
          ok: false, status: 503, statusText: 'Service Unavailable', json: async () => null,
        }
      }
      return { ok: true, json: async () => ({ data: [{ taskUUID: 't1', imageURL: 'x.jpg' }] }) }
    })

    const { createRestTransport } = await import('../src/transport/rest')
    const { createLogger } = await import('../src/logger')

    const transport = createRestTransport({
      apiKey: 'k',
      wsBaseUrl: 'wss://ws.test.com',
      httpBaseUrl: 'https://api.test.com',
      transportType: 'rest',
      timeout: 5000,
      pollTimeout: 5000,
      authTimeout: 5000,
      maxRetries: 3,
      retryDelay: 1,
      retryStrategy: 'linear',
      maxReconnectAttempts: Infinity,
      debug: false,
      log: createLogger(false),
      dependencies: { fetch: mockFetch as unknown as typeof fetch },
    })

    const result = await transport.sendRequest([{ taskType: 'imageInference', taskUUID: 't1', model: 'x' }]) as any
    expect(calls).toBe(3)
    expect(result.data[0].imageURL).toBe('x.jpg')
  })

  it('does not retry on 400', async () => {
    let calls = 0
    const mockFetch = vi.fn().mockImplementation(async () => {
      calls += 1
      return {
        ok: false, status: 400, statusText: 'Bad Request', json: async () => null,
      }
    })

    const { createRestTransport } = await import('../src/transport/rest')
    const { createLogger } = await import('../src/logger')

    const transport = createRestTransport({
      apiKey: 'k',
      wsBaseUrl: 'wss://ws.test.com',
      httpBaseUrl: 'https://api.test.com',
      transportType: 'rest',
      timeout: 5000,
      pollTimeout: 5000,
      authTimeout: 5000,
      maxRetries: 3,
      retryDelay: 1,
      retryStrategy: 'linear',
      maxReconnectAttempts: Infinity,
      debug: false,
      log: createLogger(false),
      dependencies: { fetch: mockFetch as unknown as typeof fetch },
    })

    await expect(transport.sendRequest([{ taskType: 'imageInference', taskUUID: 't1', model: 'x' }])).rejects.toThrow('HTTP 400')
    expect(calls).toBe(1)
  })

  it('aborts when external signal fires', async () => {
    const controller = new AbortController()
    const mockFetch = vi.fn().mockImplementation(async (_url, opts) => {
      // Wait until the signal aborts, then throw AbortError like real fetch
      return new Promise((_, reject) => {
        (opts as RequestInit).signal?.addEventListener('abort', () => {
          const err = new Error('aborted')
          err.name = 'AbortError'
          reject(err)
        })
      })
    })

    const { createRestTransport } = await import('../src/transport/rest')
    const { createLogger } = await import('../src/logger')

    const transport = createRestTransport({
      apiKey: 'k',
      wsBaseUrl: 'wss://ws.test.com',
      httpBaseUrl: 'https://api.test.com',
      transportType: 'rest',
      timeout: 5000,
      pollTimeout: 5000,
      authTimeout: 5000,
      maxRetries: 3,
      retryDelay: 1,
      retryStrategy: 'linear',
      maxReconnectAttempts: Infinity,
      debug: false,
      log: createLogger(false),
      dependencies: { fetch: mockFetch as unknown as typeof fetch },
    })

    const promise = transport.sendRequest(
      [{ taskType: 'imageInference', taskUUID: 't1', model: 'x' }],
      { signal: controller.signal },
    )

    setTimeout(() => controller.abort(), 10)

    await expect(promise).rejects.toThrow('Request aborted')
  })
})

describe('createClient surface', () => {
  it('exposes both getTaskDetails and getResponse as distinct methods', async () => {
    const { createClient } = await import('../src/index')

    const mockFetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ data: [] }) })
    const client = await createClient({
      apiKey: 'test',
      transportType: 'rest',
      dependencies: { fetch: mockFetch as any },
    })

    expect(typeof client.getTaskDetails).toBe('function')
    expect(typeof client.getResponse).toBe('function')
    expect(client.getTaskDetails).not.toBe(client.getResponse)
  })

  it('getTaskDetails dispatches with taskType=getTaskDetails on the wire', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: [{ taskUUID: 't1', taskType: 'getTaskDetails' }] }),
    })
    const { createClient } = await import('../src/index')

    const client = await createClient({
      apiKey: 'test',
      transportType: 'rest',
      dependencies: { fetch: mockFetch as any },
    })

    await client.getTaskDetails({ taskUUID: 't1' } as any)

    const sentBody = JSON.parse((mockFetch.mock.calls[0]?.[1] as any).body)
    expect(sentBody[0].taskType).toBe('getTaskDetails')
    expect(sentBody[0].taskUUID).toBe('t1')
  })
})

describe('per-poll timeout budget propagation', () => {
  it('REST: each inner poll respects the remaining pollTimeout budget, not config.timeout', async () => {
    let callIndex = 0
    const abortReasons: string[] = []
    const mockFetch = vi.fn().mockImplementation(async (_url, opts: RequestInit) => {
      const body = JSON.parse(opts.body as string)
      callIndex += 1
      // First call is the submit; the rest are polls.
      if (body[0]?.taskType !== 'getResponse') {
        return { ok: true, status: 200, json: async () => ({ data: [{ taskUUID: 't-budget' }] }) }
      }
      // Poll calls hang until their per-poll signal aborts. Without the fix
      // the signal would fire at config.timeout (60s); with the fix it fires
      // at the remaining pollTimeout (~150ms).
      return new Promise((_resolve, reject) => {
        opts.signal?.addEventListener('abort', () => {
          abortReasons.push('aborted')
          const err = new Error('aborted')
          ;(err as any).name = 'AbortError'
          reject(err)
        })
      })
    })

    const { createClient } = await import('../src/index')

    const client = await createClient({
      apiKey: 'test',
      transportType: 'rest',
      timeout: 60000,
      pollTimeout: 150,
      maxRetries: 0,
      dependencies: { fetch: mockFetch as any },
    })

    const start = Date.now()
    await expect(client.run({
      taskType: 'imageInference',
      taskUUID: 't-budget',
      model: 'civitai:1@1',
      positivePrompt: 'x',
      deliveryMethod: 'async',
    } as any)).rejects.toThrow()
    const elapsed = Date.now() - start

    // Without the fix the inner sendRequest would block ~60s before its own
    // timeout aborted. With it, the per-poll budget (≤150ms) trips the abort
    // first and the whole run unwinds well under config.timeout.
    expect(elapsed).toBeLessThan(2000)
    expect(abortReasons.length).toBeGreaterThan(0)
  })
})

describe('utility method dispatch', () => {
  // All utility methods funnel through the same `execute(utilityName, ...)`
  // path. One parameterized test covers the contract: each method puts its
  // canonical taskType into the request body.
  const utilities: Array<[string, string]> = [
    ['modelSearch', 'modelSearch'],
    ['modelUpload', 'modelUpload'],
    ['imageUpload', 'imageUpload'],
    ['accountManagement', 'accountManagement'],
    ['getResponse', 'getResponse'],
    ['getTaskDetails', 'getTaskDetails'],
  ]

  for (const [methodName, expectedTaskType] of utilities) {
    it(`${methodName}() sends taskType=${expectedTaskType}`, async () => {
      const responseBody = { data: [{ taskUUID: 'u1' }] }
      const mockResponse = { ok: true, status: 200, json: async () => responseBody }
      const mockFetch = vi.fn().mockResolvedValue(mockResponse)

      const { createClient } = await import('../src/index')
      const client = await createClient({
        apiKey: 'test',
        transportType: 'rest',
        dependencies: { fetch: mockFetch as any },
      })

      await (client as any)[methodName]({ taskUUID: 'u1' })

      const sentBody = JSON.parse((mockFetch.mock.calls[0]?.[1] as any).body)
      expect(sentBody[0].taskType).toBe(expectedTaskType)
    })
  }
})
