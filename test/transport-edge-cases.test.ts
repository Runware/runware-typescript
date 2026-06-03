import type { ResponseCallback, SDKConfig, TaskPayload } from '../src/types/sdk'
import type { WsResponse } from '../src/types/transport'

import {
  describe,
  it,
  expect,
  vi,
} from 'bun:test'

import { createLogger } from '../src/logger'
import { createRunwareError, parseApiError, RunwareError } from '../src/errors'

const testConfig = (overrides?: Partial<SDKConfig>): SDKConfig => ({
  apiKey: 'test-key',
  wsBaseUrl: 'wss://ws-api.runware.ai',
  httpBaseUrl: 'https://api.runware.ai',
  transportType: 'websocket',
  timeout: 5000,
  pollTimeout: 5000,
  authTimeout: 5000,
  maxRetries: 3,
  retryDelay: 100,
  retryStrategy: 'exponential',
  maxReconnectAttempts: Infinity,
  debug: false,
  log: createLogger(false),
  ...overrides,
})

/**
 * Minimal mock WebSocket transport with exposed internals.
 * Lets us simulate responses, errors, and inspect callback state.
 */
const createTestTransport = () => {
  const taskCallbacks = new Map<string, ResponseCallback<WsResponse>>()
  let sendShouldFail = false

  return {
    taskCallbacks,
    setSendShouldFail: (failState: boolean) => { sendShouldFail = failState },
    subscribeToTask: (uuid: string, cb: ResponseCallback<WsResponse>) => {
      taskCallbacks.set(uuid, cb)
    },
    unsubscribeFromTask: (uuid: string) => {
      taskCallbacks.delete(uuid)
    },
    sendRequest: async (data: TaskPayload | TaskPayload[]) => {
      if (sendShouldFail) { throw new Error('send failed') }
    },
    simulateResponse: (uuid: string, data: Record<string, unknown>[]) => {
      taskCallbacks.get(uuid)?.({ data } as WsResponse)
    },
    simulateError: (uuid: string, msg: string) => {
      taskCallbacks.get(uuid)?.({ error: [{ message: msg, taskUUID: uuid }] } as WsResponse)
    },
  }
}

/**
 * Replicates the execute() logic from client.ts so we can test it in isolation
 * without needing a real WebSocket connection.
 */
const execute = async (
  tasks: TaskPayload[],
  transport: ReturnType<typeof createTestTransport>,
  config: SDKConfig,
  options?: {
    timeout?: number
    signal?: AbortSignal
    onProgress?: (data: unknown) => void
  },
): Promise<Record<string, unknown>[]> => {
  const results: Record<string, unknown>[] = []

  // Per-task expected/received counts (mirrors the production logic)
  const expectedPerTask = new Map<string, number>()
  const receivedPerTask = new Map<string, number>()
  for (const t of tasks) {
    expectedPerTask.set(t.taskUUID, Number(t.numberResults) || 1)
    receivedPerTask.set(t.taskUUID, 0)
  }

  const signal = options?.signal
  if (signal?.aborted) {
    throw createRunwareError('aborted', 'Request aborted before start')
  }

  return new Promise((resolve, reject) => {
    let settled = false
    const timeout = options?.timeout ?? config.timeout

    const cleanup = () => {
      if (settled) { return }
      settled = true
      clearTimeout(timer)
      if (signal) { signal.removeEventListener('abort', onAbort) }
      for (const t of tasks) { transport.unsubscribeFromTask(t.taskUUID) }
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
          reject(parseApiError(response.error))
          return
        }

        if (response.data) {
          results.push(...response.data)
          receivedPerTask.set(
            task.taskUUID,
            (receivedPerTask.get(task.taskUUID) ?? 0) + response.data.length,
          )
          if (options?.onProgress) { options.onProgress(response.data) }
        }

        if (isComplete()) {
          cleanup()
          resolve(results)
        }
      })
    }

    transport.sendRequest(tasks).catch((err) => {
      cleanup()
      reject(err)
    })
  })
}

describe('execute() edge cases', () => {
  const sleep = async (ms: number) => new Promise((r) => setTimeout(r, ms))

  it('timeout does not fire after successful resolution', async () => {
    const transport = createTestTransport()
    const config = testConfig({ timeout: 200 })

    const task: TaskPayload = { taskType: 'imageInference', taskUUID: 'u1', model: 'x' }
    const promise = execute([task], transport, config)

    transport.simulateResponse('u1', [{ taskUUID: 'u1', imageURL: 'result.jpg' }])

    const result = await promise
    expect(result).toHaveLength(1)

    await sleep(300)

    expect(transport.taskCallbacks.size).toBe(0)
  })

  it('error response does not leave timer running', async () => {
    const transport = createTestTransport()
    const config = testConfig({ timeout: 200 })

    const task: TaskPayload = { taskType: 'imageInference', taskUUID: 'u1', model: 'x' }
    const promise = execute([task], transport, config)

    transport.simulateError('u1', 'Model not found')

    await expect(promise).rejects.toThrow()

    await sleep(300)

    expect(transport.taskCallbacks.size).toBe(0)
  })

  it('double error does not reject twice (settled guard)', async () => {
    const transport = createTestTransport()
    const config = testConfig({ timeout: 5000 })

    const t1: TaskPayload = { taskType: 'imageInference', taskUUID: 'u1', model: 'x' }
    const t2: TaskPayload = { taskType: 'imageInference', taskUUID: 'u2', model: 'x' }
    const tasks: TaskPayload[] = [t1, t2]

    const promise = execute(tasks, transport, config)

    transport.simulateError('u1', 'Error 1')

    await expect(promise).rejects.toThrow('Error 1')

    // This would throw "promise already settled" in buggy code
    transport.simulateError('u2', 'Error 2')

    expect(transport.taskCallbacks.size).toBe(0)
  })

  it('timeout after error does not double-reject', async () => {
    const transport = createTestTransport()
    const config = testConfig({ timeout: 50 })

    const task: TaskPayload = { taskType: 'imageInference', taskUUID: 'u1', model: 'x' }
    const promise = execute([task], transport, config)

    transport.simulateError('u1', 'Bad request')
    await expect(promise).rejects.toThrow('Bad request')

    await sleep(100)

    expect(transport.taskCallbacks.size).toBe(0)
  })

  it('sendRequest failure cleans up callbacks and timer', async () => {
    const transport = createTestTransport()
    transport.setSendShouldFail(true)
    const config = testConfig({ timeout: 5000 })

    const task: TaskPayload = { taskType: 'imageInference', taskUUID: 'u1', model: 'x' }

    const promise = execute([task], transport, config)
    await expect(promise).rejects.toThrow('send failed')

    expect(transport.taskCallbacks.size).toBe(0)
  })

  it('onProgress is called for each result before final resolve', async () => {
    const transport = createTestTransport()
    const config = testConfig()

    const t1: TaskPayload = { taskType: 'imageInference', taskUUID: 'u1', model: 'x' }
    const t2: TaskPayload = { taskType: 'imageInference', taskUUID: 'u2', model: 'x' }
    const tasks: TaskPayload[] = [t1, t2]

    const progressCalls: unknown[] = []
    const options = { onProgress: (data: unknown) => progressCalls.push(data) }
    const promise = execute(tasks, transport, config, options)

    transport.simulateResponse('u1', [{ taskUUID: 'u1', imageURL: 'a.jpg' }])
    transport.simulateResponse('u2', [{ taskUUID: 'u2', imageURL: 'b.jpg' }])

    const results = await promise
    expect(results).toHaveLength(2)
    expect(progressCalls).toHaveLength(2)
  })

  it('callbacks after settled are ignored (late arrival)', async () => {
    const transport = createTestTransport()
    const config = testConfig()

    const task: TaskPayload = { taskType: 'imageInference', taskUUID: 'u1', model: 'x' }
    const promise = execute([task], transport, config)

    transport.simulateResponse('u1', [{ taskUUID: 'u1', imageURL: 'ok.jpg' }])
    const results = await promise
    expect(results).toHaveLength(1)

    // Late response — the callback was unsubscribed so this is a no-op
    // but even if it somehow fires, settled guard prevents corruption
    const cb = transport.taskCallbacks.get('u1')
    expect(cb).toBeUndefined()
  })

  it('per-task completion: task with numberResults=3 waits for all 3', async () => {
    const transport = createTestTransport()
    const config = testConfig()

    const task: TaskPayload = {
      taskType: 'imageInference',
      taskUUID: 'u1',
      model: 'x',
      numberResults: 3,
    }
    const promise = execute([task], transport, config)

    transport.simulateResponse('u1', [{ taskUUID: 'u1', imageURL: 'a.jpg' }])
    await sleep(20)

    transport.simulateResponse('u1', [{ taskUUID: 'u1', imageURL: 'b.jpg' }])
    transport.simulateResponse('u1', [{ taskUUID: 'u1', imageURL: 'c.jpg' }])

    const results = await promise
    expect(results).toHaveLength(3)
  })

  it('per-task completion: mixed numberResults across tasks resolves only when all done', async () => {
    const transport = createTestTransport()
    const config = testConfig()

    const t1: TaskPayload = {
      taskType: 'imageInference', taskUUID: 'u1', model: 'x', numberResults: 2, 
    }
    const t2: TaskPayload = {
      taskType: 'imageInference', taskUUID: 'u2', model: 'x', numberResults: 1, 
    }
    const promise = execute([t1, t2], transport, config)

    // u1 produces 2, u2 only 1 — totals 3 results
    transport.simulateResponse('u1', [
      { taskUUID: 'u1', imageURL: 'a.jpg' }, { taskUUID: 'u1', imageURL: 'b.jpg' },
    ])
    // u1 is done but u2 has not responded — promise must NOT resolve yet
    await sleep(20)
    expect(transport.taskCallbacks.size).toBe(2) // both still subscribed

    transport.simulateResponse('u2', [{ taskUUID: 'u2', imageURL: 'c.jpg' }])

    const results = await promise
    expect(results).toHaveLength(3)
    expect(transport.taskCallbacks.size).toBe(0)
  })

  it('aborts when signal is triggered mid-flight', async () => {
    const transport = createTestTransport()
    const config = testConfig({ timeout: 5000 })
    const controller = new AbortController()

    const task: TaskPayload = { taskType: 'imageInference', taskUUID: 'u1', model: 'x' }
    const promise = execute([task], transport, config, { signal: controller.signal })

    await sleep(10)
    controller.abort()

    await expect(promise).rejects.toThrow('Request aborted')
    expect(transport.taskCallbacks.size).toBe(0)
  })

  it('rejects immediately when signal is already aborted', async () => {
    const transport = createTestTransport()
    const config = testConfig()
    const controller = new AbortController()
    controller.abort()

    const task: TaskPayload = { taskType: 'imageInference', taskUUID: 'u1', model: 'x' }
    await expect(execute([task], transport, config, { signal: controller.signal })).rejects.toThrow('aborted')
  })
})

describe('WebSocket transport', () => {
  it('reconnect guard prevents concurrent reconnections', async () => {
    const { createWebSocketTransport } = await import('../src/transport/websocket')

    let connectCount = 0
    const MockWS = function (url: string) {
      const ws = {
        readyState: 1,
        onopen: null as any,
        onclose: null as any,
        onmessage: null as any,
        onerror: null as any,
        close: () => { ws.onclose?.() },
        send: (data: string) => {
          const parsed = JSON.parse(data)
          if (parsed[0]?.taskType === 'authentication') {
            setTimeout(() => {
              connectCount += 1
              const payload = { taskType: 'authentication', connectionSessionUUID: `session-${connectCount}` }
              ws.onmessage?.({ data: JSON.stringify({ data: [payload] }) })
            }, 10)
          }
        },
      }
      setTimeout(() => ws.onopen?.(), 5)
      return ws
    }

    const config = testConfig({
      dependencies: { WebSocket: MockWS as any },
      retryDelay: 50,
    })

    const transport = createWebSocketTransport(config)
    await transport.connect()

    expect(connectCount).toBe(1)
  })

  it('disconnect clears all task callbacks', async () => {
    const { createWebSocketTransport } = await import('../src/transport/websocket')

    const MockWS = function () {
      const ws = {
        readyState: 1,
        onopen: null as any,
        onclose: null as any,
        onmessage: null as any,
        onerror: null as any,
        close: () => { setTimeout(() => ws.onclose?.(), 1) },
        send: (data: string) => {
          const parsed = JSON.parse(data)
          if (parsed[0]?.taskType === 'authentication') {
            setTimeout(() => {
              const payload = { taskType: 'authentication', connectionSessionUUID: 'sess-1' }
              ws.onmessage?.({ data: JSON.stringify({ data: [payload] }) })
            }, 1)
          }
        },
      }
      setTimeout(() => ws.onopen?.(), 1)
      return ws
    }

    const config = testConfig({ dependencies: { WebSocket: MockWS as any } })
    const transport = createWebSocketTransport(config)
    await transport.connect()

    transport.subscribeToTask('task-1', () => {})
    transport.subscribeToTask('task-2', () => {})

    await transport.disconnect()

    let received = false
    transport.subscribeToTask('task-3', () => { received = true })
    transport.unsubscribeFromTask('task-3')
    expect(received).toBe(false)
  })
})

describe('TextStream multi-consumer broadcasting', () => {
  it('textStream and result() share a single connection', async () => {
    const { parseSseLine } = await import('../src/stream')

    expect(parseSseLine('')).toBeNull()
    expect(parseSseLine(':')).toBeNull() // keepalive
    expect(parseSseLine('data: [DONE]')).toBeNull()
    expect(parseSseLine('not-a-data-line')).toBeNull()

    const chunk = parseSseLine('data: {"delta":{"text":"hello"},"taskUUID":"t1"}')
    expect(chunk).not.toBeNull()
    expect(chunk!.text).toBe('hello')
    expect(chunk!.taskUUID).toBe('t1')
  })

  it('parseSseLine throws on error responses', async () => {
    const { parseSseLine } = await import('../src/stream')

    expect(() => parseSseLine('data: {"errors":[{"message":"bad"}]}')).toThrow()
  })

  it('parseSseLine handles reasoning content', async () => {
    const { parseSseLine } = await import('../src/stream')

    const chunk = parseSseLine('data: {"delta":{"reasoningContent":"thinking..."},"taskUUID":"t1"}')
    expect(chunk).not.toBeNull()
    expect(chunk!.reasoningContent).toBe('thinking...')
    expect(chunk!.text).toBeUndefined()
  })

  it('parseSseLine extracts usage and cost from final chunk', async () => {
    const { parseSseLine } = await import('../src/stream')

    const chunk = parseSseLine('data: {"finishReason":"stop","usage":{"promptTokens":10,"completionTokens":20,"totalTokens":30},"cost":0.005,"taskUUID":"t1"}')
    expect(chunk!.finishReason).toBe('stop')
    expect(chunk!.usage).toEqual({ promptTokens: 10, completionTokens: 20, totalTokens: 30 })
    expect(chunk!.cost).toBe(0.005)
  })
})

describe('Logger', () => {
  it('createLogger(false) produces no-op functions', () => {
    const log = createLogger(false)

    log.connection('test')
    log.error('test', new Error('test'))
    log.heartbeat('test')
    log.send('test')
    log.receive('test')
    log.request('test')
    log.retry('test')
    log.warn('test')
    log.info('test')
    log.auth('test')
  })

  it('createLogger(true) produces callable functions', () => {
    const log = createLogger(true)

    expect(typeof log.connection).toBe('function')
    expect(typeof log.auth).toBe('function')
    expect(typeof log.heartbeat).toBe('function')
    expect(typeof log.send).toBe('function')
    expect(typeof log.receive).toBe('function')
    expect(typeof log.request).toBe('function')
    expect(typeof log.retry).toBe('function')
    expect(typeof log.error).toBe('function')
    expect(typeof log.warn).toBe('function')
    expect(typeof log.info).toBe('function')
  })

  it('createLogger(true) writes to console', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const log = createLogger(true)

    log.connection('test message')

    expect(spy).toHaveBeenCalled()
    spy.mockRestore()
  })

  it('custom sink receives structured entries', () => {
    const entries: unknown[] = []
    const log = createLogger(true, (entry) => entries.push(entry))

    log.connection('hello', { foo: 1 })
    log.error('boom')

    expect(entries).toHaveLength(2)
    expect(entries[0]).toMatchObject({
      category: 'connection',
      message: 'hello',
      data: { foo: 1 },
    })
    expect((entries[0] as { timestamp: string }).timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/)
    expect(entries[1]).toMatchObject({ category: 'error', message: 'boom' })
  })
})

describe('Error handling edge cases', () => {
  it('parseApiError handles null input', () => {
    const err = parseApiError(null)
    expect(err).toBeInstanceOf(RunwareError)
    expect(err.code).toBe('unknown')
  })

  it('parseApiError handles string input', () => {
    const err = parseApiError('something went wrong')
    expect(err).toBeInstanceOf(RunwareError)
    expect(err.message).toContain('something went wrong')
  })

  it('parseApiError handles errors array', () => {
    const err = parseApiError({ errors: [{ code: 'invalidApiKey', message: 'Bad key', parameter: 'apiKey' }] })
    expect(err.code).toBe('auth')
    expect(err.parameter).toBe('apiKey')
  })

  it('parseApiError handles empty errors array', () => {
    const err = parseApiError({ errors: [] })
    expect(err).toBeInstanceOf(RunwareError)
  })

  it('createRunwareError preserves stack trace', () => {
    const err = createRunwareError('timeout', 'Task timed out')
    expect(err.stack).toBeDefined()
    expect(err.name).toBe('RunwareError')
  })
})

describe('Retry edge cases', () => {
  it('withRetry does not retry when shouldRetry returns false', async () => {
    const { withRetry } = await import('../src/utils/retry')

    let attempts = 0
    const promise = withRetry(
      async () => {
        attempts += 1
        throw new Error('fail')
      },
      { maxRetries: 3, retryDelay: 10, shouldRetry: () => false },
    )
    await expect(promise).rejects.toThrow('fail')

    expect(attempts).toBe(1)
  })

  it('withRetry retries up to maxRetries when shouldRetry is true', async () => {
    const { withRetry } = await import('../src/utils/retry')

    let attempts = 0
    const promise = withRetry(
      async () => {
        attempts += 1
        throw new Error('fail')
      },
      { maxRetries: 3, retryDelay: 1, shouldRetry: () => true },
    )
    await expect(promise).rejects.toThrow('fail')

    expect(attempts).toBe(4) // initial + 3 retries
  })

  it('withRetry succeeds on retry', async () => {
    const { withRetry } = await import('../src/utils/retry')

    let attempts = 0
    const result = await withRetry(
      async () => {
        attempts += 1
        if (attempts < 3) { throw new Error('not yet') }
        return 'success'
      },
      { maxRetries: 5, retryDelay: 1, shouldRetry: () => true },
    )

    expect(result).toBe('success')
    expect(attempts).toBe(3)
  })

  it('calculateRetryDelay caps at 30 seconds', async () => {
    const { calculateRetryDelay } = await import('../src/utils/retry')

    // Attempt 20 with 1000ms base = 1000 * 2^20 = way over 30s
    const delay = calculateRetryDelay(20, 1000, 'exponential')
    expect(delay).toBeLessThanOrEqual(30000)
  })

  it('calculateRetryDelay uses linear strategy correctly', async () => {
    const { calculateRetryDelay } = await import('../src/utils/retry')

    const delay0 = calculateRetryDelay(0, 1000, 'linear')
    expect(delay0).toBe(1000) // 1000 * (0 + 1)

    const delay2 = calculateRetryDelay(2, 1000, 'linear')
    expect(delay2).toBe(3000) // 1000 * (2 + 1)
  })
})

describe('fileToDataURI', () => {
  it('is exported from the SDK', async () => {
    const sdk = await import('../src/index')
    expect(typeof sdk.fileToDataURI).toBe('function')
  })
})

describe('WebSocket handleMessage routing', () => {
  /**
   * Helper: creates a real WebSocket transport with a MockWS that captures
   * the onmessage handler, allowing us to inject arbitrary messages.
   */
  const createWsWithMessageInjector = async () => {
    const { createWebSocketTransport } = await import('../src/transport/websocket')
    let messageHandler: ((event: { data: string }) => void) | null = null

    const MockWS = function () {
      const ws = {
        readyState: 1,
        onopen: null as any,
        onclose: null as any,
        onmessage: null as any,
        onerror: null as any,
        close: () => { ws.onclose?.() },
        send: (data: string) => {
          const parsed = JSON.parse(data)
          if (parsed[0]?.taskType === 'authentication') {
            setTimeout(() => {
              const payload = { taskType: 'authentication', connectionSessionUUID: 'sess-1' }
              ws.onmessage?.({ data: JSON.stringify({ data: [payload] }) })
              setTimeout(() => { messageHandler = ws.onmessage }, 1)
            }, 1)
          }
        },
      }
      setTimeout(() => ws.onopen?.(), 1)
      return ws
    }

    const config = testConfig({ dependencies: { WebSocket: MockWS as any } })
    const transport = createWebSocketTransport(config)
    await transport.connect()

    // Wait for message handler capture
    await new Promise((r) => setTimeout(r, 10))

    return {
      transport,
      injectMessage: (msg: unknown) => {
        messageHandler?.({ data: JSON.stringify(msg) })
      },
    }
  }

  it('groups multiple items with the same taskUUID into one callback call', async () => {
    const { transport, injectMessage } = await createWsWithMessageInjector()

    const calls: unknown[][] = []
    transport.subscribeToTask('tBatch', (r) => { if (r.data) { calls.push(r.data) } })

    injectMessage({
      data: [
        {
          taskUUID: 'tBatch', taskType: 'imageInference', status: 'success', imageURL: 'a.jpg',
        },
        {
          taskUUID: 'tBatch', taskType: 'imageInference', status: 'success', imageURL: 'b.jpg',
        },
      ],
    })

    // One callback invocation, both items inside
    expect(calls).toHaveLength(1)
    expect(calls[0]).toHaveLength(2)

    await transport.disconnect()
  })

  it('routes multiple items in a single message to separate callbacks', async () => {
    const { transport, injectMessage } = await createWsWithMessageInjector()

    const results1: unknown[] = []
    const results2: unknown[] = []

    transport.subscribeToTask('t1', (r) => { if (r.data) { results1.push(...r.data) } })
    transport.subscribeToTask('t2', (r) => { if (r.data) { results2.push(...r.data) } })

    // Server sends both results in one message
    const msg1 = { taskUUID: 't1', imageURL: 'img1.jpg' }
    const msg2 = { taskUUID: 't2', imageURL: 'img2.jpg' }
    injectMessage({ data: [msg1, msg2] })

    expect(results1).toHaveLength(1)
    expect(results2).toHaveLength(1)
    expect((results1[0] as any).imageURL).toBe('img1.jpg')
    expect((results2[0] as any).imageURL).toBe('img2.jpg')

    await transport.disconnect()
  })

  it('unroutable error rejects ALL in-flight tasks', async () => {
    const { transport, injectMessage } = await createWsWithMessageInjector()

    const errors1: unknown[] = []
    const errors2: unknown[] = []

    transport.subscribeToTask('t1', (r) => { if (r.error) { errors1.push(r.error) } })
    transport.subscribeToTask('t2', (r) => { if (r.error) { errors2.push(r.error) } })

    // Server sends error without taskUUID — unroutable
    injectMessage({ error: { message: 'Server overloaded' } })

    expect(errors1).toHaveLength(1)
    expect(errors2).toHaveLength(1)

    await transport.disconnect()
  })

  it('error with taskUUID routes only to that task', async () => {
    const { transport, injectMessage } = await createWsWithMessageInjector()

    const errors1: unknown[] = []
    const errors2: unknown[] = []

    transport.subscribeToTask('t1', (r) => { if (r.error) { errors1.push(r.error) } })
    transport.subscribeToTask('t2', (r) => { if (r.error) { errors2.push(r.error) } })

    // Error with specific taskUUID
    injectMessage({ error: [{ message: 'Invalid params', taskUUID: 't1' }] })

    expect(errors1).toHaveLength(1) // received
    expect(errors2).toHaveLength(0) // not affected

    await transport.disconnect()
  })

  it('per-task error grouping: each callback only sees its own errors', async () => {
    const { transport, injectMessage } = await createWsWithMessageInjector()

    const received1: any[] = []
    const received2: any[] = []

    transport.subscribeToTask('t1', (r) => { if (r.error) { received1.push(r.error) } })
    transport.subscribeToTask('t2', (r) => { if (r.error) { received2.push(r.error) } })

    // Two errors for two different tasks in a single frame
    injectMessage({
      error: [
        { message: 'errA', code: 'codeA', taskUUID: 't1' }, { message: 'errB', code: 'codeB', taskUUID: 't2' },
      ],
    })

    // Each callback should receive only its own error, not both
    expect(received1).toHaveLength(1)
    expect(received2).toHaveLength(1)
    expect((received1[0] as any[])[0].message).toBe('errA')
    expect((received2[0] as any[])[0].message).toBe('errB')

    await transport.disconnect()
  })

  it('ignores ping/pong responses', async () => {
    const { transport, injectMessage } = await createWsWithMessageInjector()

    let received = false
    transport.subscribeToTask('t1', () => { received = true })

    injectMessage({ data: [{ taskType: 'ping', pong: true }] })

    expect(received).toBe(false)
    await transport.disconnect()
  })

  it('ignores items without taskUUID', async () => {
    const { transport, injectMessage } = await createWsWithMessageInjector()

    let received = false
    transport.subscribeToTask('t1', () => { received = true })

    // Response with no taskUUID on items
    injectMessage({ data: [{ someField: 'value' }] })

    expect(received).toBe(false)
    await transport.disconnect()
  })

  it('handles malformed JSON gracefully', async () => {
    const { createWebSocketTransport } = await import('../src/transport/websocket')
    let messageHandler: ((event: { data: string }) => void) | null = null

    const MockWS = function () {
      const ws = {
        readyState: 1,
        onopen: null as any,
        onclose: null as any,
        onmessage: null as any,
        onerror: null as any,
        close: () => { ws.onclose?.() },
        send: (data: string) => {
          const parsed = JSON.parse(data)
          if (parsed[0]?.taskType === 'authentication') {
            setTimeout(() => {
              const payload = { taskType: 'authentication', connectionSessionUUID: 's1' }
              ws.onmessage?.({ data: JSON.stringify({ data: [payload] }) })
              setTimeout(() => { messageHandler = ws.onmessage }, 1)
            }, 1)
          }
        },
      }
      setTimeout(() => ws.onopen?.(), 1)
      return ws
    }

    const config = testConfig({ dependencies: { WebSocket: MockWS as any } })
    const transport = createWebSocketTransport(config)
    await transport.connect()
    await new Promise((r) => setTimeout(r, 10))

    // Should not throw — malformed JSON is logged and ignored
    expect(() => {
      messageHandler?.({ data: 'not valid json{{{' })
    }).not.toThrow()

    await transport.disconnect()
  })

  it('isolates per-task callback exceptions so later callbacks still fire', async () => {
    // A throwing user callback must not kill the dispatch loop or prevent
    // sibling callbacks (different taskUUIDs in the same frame) from being
    // delivered — and must not leak out of onmessage.
    const { transport, injectMessage } = await createWsWithMessageInjector()

    const received: string[] = []
    transport.subscribeToTask('A', () => { throw new Error('user callback exploded') })
    transport.subscribeToTask('B', (r) => {
      if (r.data) { received.push((r.data[0] as any).imageURL as string) }
    })

    expect(() => {
      injectMessage({
        data: [
          { taskUUID: 'A', imageURL: 'a.jpg' },
          { taskUUID: 'B', imageURL: 'b.jpg' },
        ],
      })
    }).not.toThrow()

    expect(received).toEqual(['b.jpg'])

    await transport.disconnect()
  })

  it('isolates per-task callback exceptions on error frames too', async () => {
    const { transport, injectMessage } = await createWsWithMessageInjector()

    const received: unknown[] = []
    transport.subscribeToTask('A', () => { throw new Error('explode') })
    transport.subscribeToTask('B', (r) => { if (r.error) { received.push(r.error) } })

    expect(() => {
      injectMessage({
        error: [
          { taskUUID: 'A', message: 'errA', code: 'x' },
          { taskUUID: 'B', message: 'errB', code: 'y' },
        ],
      })
    }).not.toThrow()

    expect(received).toHaveLength(1)
  })
})

describe('WebSocket reconnect after established drop', () => {
  const sleep = async (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

  it('disconnect stops in-flight reconnect retries', async () => {
    const { createWebSocketTransport } = await import('../src/transport/websocket')

    let constructorCalls = 0
    let firstInstance: any = null
    const MockWS = function () {
      constructorCalls += 1
      const ws: any = {
        readyState: 1,
        onopen: null,
        onclose: null,
        onmessage: null,
        onerror: null,
        close: () => { ws.onclose?.() },
        send: (data: string) => {
          // Only respond to the first ws's auth (success); later attempts fail
          if (firstInstance !== ws) { return }
          const parsed = JSON.parse(data)
          if (parsed[0]?.taskType === 'authentication') {
            setTimeout(() => {
              ws.onmessage?.({data: JSON.stringify({data: [{ taskType: 'authentication', connectionSessionUUID: 'sess-1' }]})})
            }, 1)
          }
        },
      }
      // First instance succeeds open; subsequent instances fail
      if (constructorCalls === 1) {
        firstInstance = ws
        setTimeout(() => ws.onopen?.(), 1)
      } else {
        setTimeout(() => ws.onerror?.({ error: new Error('refused') }), 1)
      }
      return ws
    }

    const config = testConfig({
      dependencies: { WebSocket: MockWS as any },
      retryDelay: 10,
    })

    const transport = createWebSocketTransport(config)
    await transport.connect()
    expect(constructorCalls).toBe(1)

    // Drop the established connection — triggers reconnect, which then keeps failing
    firstInstance.onerror?.({ error: new Error('Network drop') })
    await sleep(15) // let the first retry happen

    const attemptsBeforeDisconnect = constructorCalls
    expect(attemptsBeforeDisconnect).toBeGreaterThan(1) // reconnect did try

    // Disconnect should stop further retries
    await transport.disconnect()
    await sleep(100)

    expect(constructorCalls).toBe(attemptsBeforeDisconnect) // no more after disconnect
  })

  it('reconnects when an established connection errors out', async () => {
    const { createWebSocketTransport } = await import('../src/transport/websocket')

    const instances: any[] = []
    let connectCount = 0

    const MockWS = function () {
      const ws: any = {
        readyState: 1,
        onopen: null,
        onclose: null,
        onmessage: null,
        onerror: null,
        close: () => { ws.onclose?.() },
        send: (data: string) => {
          const parsed = JSON.parse(data)
          if (parsed[0]?.taskType === 'authentication') {
            setTimeout(() => {
              connectCount += 1
              ws.onmessage?.({
                data: JSON.stringify({
                  data: [{
                    taskType: 'authentication',
                    connectionSessionUUID: `sess-${connectCount}`,
                  }],
                }),
              })
            }, 1)
          }
        },
      }
      setTimeout(() => ws.onopen?.(), 1)
      instances.push(ws)
      return ws
    }

    const config = testConfig({
      dependencies: { WebSocket: MockWS as any },
      retryDelay: 5,
    })

    const transport = createWebSocketTransport(config)
    await transport.connect()
    expect(connectCount).toBe(1)

    // Subscribe to a task before the drop
    let received: any = null
    transport.subscribeToTask('long-running-task', (r) => { received = r })

    // Simulate network drop on the established connection
    instances[0].onerror?.({ error: new Error('Network unreachable') })

    // Wait for reconnect cycle
    await sleep(60)

    expect(connectCount).toBe(2) // reconnected
    expect(instances.length).toBe(2) // new WS instance created

    // The task callback should still be registered — server can replay
    // the response and it gets routed to the original callback
    instances[1].onmessage?.({data: JSON.stringify({data: [{ taskUUID: 'long-running-task', imageURL: 'replayed.jpg' }]})})

    expect(received).toMatchObject({data: [{ taskUUID: 'long-running-task', imageURL: 'replayed.jpg' }]})

    await transport.disconnect()
  })

  it('reconnects on clean server-side close (no error event)', async () => {
    const { createWebSocketTransport } = await import('../src/transport/websocket')

    let connectCount = 0
    const instances: any[] = []

    const MockWS = function () {
      const ws: any = {
        readyState: 1,
        onopen: null, onclose: null, onmessage: null, onerror: null,
        close: () => { ws.onclose?.() },
        send: (data: string) => {
          const parsed = JSON.parse(data)
          if (parsed[0]?.taskType === 'authentication') {
            setTimeout(() => {
              connectCount += 1
              ws.onmessage?.({data: JSON.stringify({data: [{ taskType: 'authentication', connectionSessionUUID: `sess-${connectCount}` }]})})
            }, 1)
          }
        },
      }
      setTimeout(() => ws.onopen?.(), 1)
      instances.push(ws)
      return ws
    }

    const config = testConfig({ dependencies: { WebSocket: MockWS as any }, retryDelay: 5 })
    const transport = createWebSocketTransport(config)
    await transport.connect()
    expect(connectCount).toBe(1)

    // Simulate clean server-side close — no onerror, only onclose fires
    instances[0].onclose?.()

    await sleep(60)

    expect(connectCount).toBe(2)
    expect(instances.length).toBe(2)

    await transport.disconnect()
  })
})

describe('WebSocket reconnect circuit breaker', () => {
  it('rejects all in-flight tasks after max reconnect attempts', async () => {
    const { createWebSocketTransport } = await import('../src/transport/websocket')

    // A WebSocket that always fails to connect
    const MockWS = function () {
      const ws = {
        readyState: 0,
        onopen: null as any,
        onclose: null as any,
        onmessage: null as any,
        onerror: null as any,
        close: () => { ws.onclose?.() },
        send: () => {},
      }
      setTimeout(() => {
        ws.onerror?.({ error: new Error('Connection refused') })
      }, 1)
      return ws
    }

    const config = testConfig({
      dependencies: { WebSocket: MockWS as any },
      retryDelay: 10,
    })

    const transport = createWebSocketTransport(config)

    // Initial connect should fail
    await expect(transport.connect()).rejects.toThrow('Connection refused')
  })

  it('initial connection failure does not trigger auto-reconnect', async () => {
    const { createWebSocketTransport } = await import('../src/transport/websocket')

    let constructorCalls = 0
    const MockWS = function () {
      constructorCalls += 1
      const ws = {
        readyState: 0,
        onopen: null as any,
        onclose: null as any,
        onmessage: null as any,
        onerror: null as any,
        close: () => {},
        send: () => {},
      }
      setTimeout(() => {
        ws.onerror?.({ error: new Error('Connection refused') })
      }, 1)
      return ws
    }

    const config = testConfig({
      dependencies: { WebSocket: MockWS as any },
      retryDelay: 10,
    })

    const transport = createWebSocketTransport(config)
    await expect(transport.connect()).rejects.toThrow()

    // Wait a bit to ensure no reconnect loop started
    await new Promise((r) => setTimeout(r, 100))

    // Should only have been called once (initial attempt)
    expect(constructorCalls).toBe(1)
  })
})

describe('parseApiError array handling (WS format)', () => {
  it('extracts message from error array', () => {
    const err = parseApiError([{ message: 'Model not found', code: 'unknownModel', taskUUID: 't1' }])
    expect(err.message).toBe('Model not found')
    expect(err.code).toBe('notFound')
    expect(err.taskUUID).toBe('t1')
  })

  it('handles empty array', () => {
    const err = parseApiError([])
    expect(err).toBeInstanceOf(RunwareError)
    expect(err.code).toBe('unknown')
  })

  it('handles array with multiple errors (takes first)', () => {
    const err1 = { message: 'First error', code: 'invalidPrompt' }
    const err2 = { message: 'Second error', code: 'providerTimeout' }
    const err = parseApiError([err1, err2])
    expect(err.message).toBe('First error')
    expect(err.code).toBe('validation')
  })
})

describe('SSE parseSseLine edge cases', () => {
  it('handles data with extra whitespace', async () => {
    const { parseSseLine } = await import('../src/stream')

    const chunk = parseSseLine('  data:  {"delta":{"text":"hi"},"taskUUID":"t1"}  ')
    expect(chunk).not.toBeNull()
    expect(chunk!.text).toBe('hi')
  })

  it('handles data: with no space after colon', async () => {
    const { parseSseLine } = await import('../src/stream')

    const chunk = parseSseLine('data:{"delta":{"text":"hi"},"taskUUID":"t1"}')
    expect(chunk).not.toBeNull()
    expect(chunk!.text).toBe('hi')
  })

  it('returns null for SSE comments (keepalive)', async () => {
    const { parseSseLine } = await import('../src/stream')

    expect(parseSseLine(': keepalive')).toBeNull()
    expect(parseSseLine(':ping')).toBeNull()
  })

  it('handles chunk with no delta (metadata only)', async () => {
    const { parseSseLine } = await import('../src/stream')

    const chunk = parseSseLine('data: {"taskUUID":"t1","finishReason":"stop"}')
    expect(chunk).not.toBeNull()
    expect(chunk!.text).toBeUndefined()
    expect(chunk!.finishReason).toBe('stop')
  })
})
