import type { SDKConfig, TaskPayload } from '../src/types/sdk'

import {
  describe,
  it,
  expect,
  vi,
} from 'bun:test'

import { createTextStream } from '../src/stream'
import { createLogger } from '../src/logger'

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

const sseStream = (lines: string[]): ReadableStream<Uint8Array> => {
  const encoder = new TextEncoder()
  return new ReadableStream({
    start(controller) {
      for (const line of lines) {
        controller.enqueue(encoder.encode(line))
      }
      controller.close()
    },
  })
}

const mockFetch = (lines: string[]) => vi.fn().mockResolvedValue({
  ok: true,
  body: sseStream(lines),
})

const tasks: TaskPayload[] = [{
  taskType: 'textInference',
  taskUUID: 't1',
  model: 'minimax:m2.7@0',
  messages: [{ role: 'user', content: 'hi' }],
}]

describe('createTextStream', () => {
  it('textStream yields deltas in order', async () => {
    const fetch = mockFetch([
      'data: {"delta":{"text":"Hello"},"taskUUID":"t1"}\n',
      'data: {"delta":{"text":" world"},"taskUUID":"t1"}\n',
      'data: {"finishReason":"stop","taskUUID":"t1"}\n',
      'data: [DONE]\n',
    ])

    const stream = createTextStream(tasks, baseConfig(fetch))
    const received: string[] = []
    for await (const word of stream.textStream) {
      received.push(word)
    }

    expect(received).toEqual(['Hello', ' world'])
  })

  it('text() returns the full accumulated text', async () => {
    const fetch = mockFetch([
      'data: {"delta":{"text":"part1 "},"taskUUID":"t1"}\n',
      'data: {"delta":{"text":"part2"},"taskUUID":"t1"}\n',
      'data: {"finishReason":"stop","taskUUID":"t1"}\n',
      'data: [DONE]\n',
    ])

    const stream = createTextStream(tasks, baseConfig(fetch))
    expect(await stream.text()).toBe('part1 part2')
  })

  it('result() returns final metadata', async () => {
    const fetch = mockFetch([
      'data: {"delta":{"text":"x"},"taskUUID":"t1"}\n', 'data: {"finishReason":"stop","usage":{"promptTokens":3,"completionTokens":1,"totalTokens":4},"cost":0.001,"taskUUID":"t1"}\n', 'data: [DONE]\n',
    ])

    const stream = createTextStream(tasks, baseConfig(fetch))
    const result = await stream.result()

    expect(result.text).toBe('x')
    expect(result.finishReason).toBe('stop')
    expect(result.usage).toEqual({ promptTokens: 3, completionTokens: 1, totalTokens: 4 })
    expect(result.cost).toBe(0.001)
    expect(result.taskUUID).toBe('t1')
  })

  it('reasoningStream yields reasoning deltas separately from text', async () => {
    const fetch = mockFetch([
      'data: {"delta":{"reasoningContent":"thinking..."},"taskUUID":"t1"}\n', 'data: {"delta":{"text":"answer"},"taskUUID":"t1"}\n', 'data: [DONE]\n',
    ])

    const stream = createTextStream(tasks, baseConfig(fetch))
    const reasoning: string[] = []
    const text: string[] = []

    const reasoningTask = (async () => {
      for await (const chunk of stream.reasoningStream) { reasoning.push(chunk) }
    })()
    const textTask = (async () => {
      for await (const chunk of stream.textStream) { text.push(chunk) }
    })()

    await Promise.all([reasoningTask, textTask])

    expect(reasoning).toEqual(['thinking...'])
    expect(text).toEqual(['answer'])
  })

  it('multiple consumers receive the same chunks (broadcasting)', async () => {
    const fetch = mockFetch([
      'data: {"delta":{"text":"a"},"taskUUID":"t1"}\n', 'data: {"delta":{"text":"b"},"taskUUID":"t1"}\n', 'data: [DONE]\n',
    ])

    const stream = createTextStream(tasks, baseConfig(fetch))

    const collected1: string[] = []
    const collected2: string[] = []

    const consume = async (target: string[]) => {
      for await (const word of stream.textStream) { target.push(word) }
    }

    await Promise.all([consume(collected1), consume(collected2)])

    expect(collected1).toEqual(['a', 'b'])
    expect(collected2).toEqual(['a', 'b'])
    expect(fetch).toHaveBeenCalledTimes(1) // single underlying request
  })

  it('onStart runs before fetch is called', async () => {
    const fetch = mockFetch(['data: [DONE]\n'])
    const order: string[] = []

    const stream = createTextStream(
      tasks,
      baseConfig((url: string, opts: RequestInit) => {
        order.push('fetch')
        return (fetch as any)(url, opts)
      }),
      undefined,
      async () => { order.push('onStart') },
    )

    await stream.result()

    expect(order).toEqual(['onStart', 'fetch'])
  })

  it('onStart error propagates and prevents fetch', async () => {
    const fetch = vi.fn()

    const stream = createTextStream(
      tasks,
      baseConfig(fetch),
      undefined,
      async () => { throw new Error('validation failed') },
    )

    await expect(stream.result()).rejects.toThrow('validation failed')
    expect(fetch).not.toHaveBeenCalled()
  })

  it('aborts mid-stream when signal fires', async () => {
    const controller = new AbortController()
    const fetch = vi.fn().mockImplementation(async (_url, opts: RequestInit) => Promise.resolve({
      ok: true,
      body: new ReadableStream({
        async pull(controllerInner) {
          // First chunk arrives, then we wait — caller will abort
          controllerInner.enqueue(new TextEncoder().encode('data: {"delta":{"text":"hi"},"taskUUID":"t1"}\n'))
          await new Promise<void>((resolve, reject) => {
            opts.signal?.addEventListener('abort', () => {
              const err = new Error('aborted')
              err.name = 'AbortError'
              reject(err)
            })
            // never resolve otherwise
          })
        },
      }),
    }))

    const stream = createTextStream(tasks, baseConfig(fetch), controller.signal)
    const received: string[] = []
    const iter = (async () => {
      for await (const word of stream.textStream) {
        received.push(word)
        controller.abort()
      }
    })()

    // Should resolve (loop ends due to abort) — signal-triggered close ends iteration
    await iter.catch(() => {})

    expect(received).toEqual(['hi'])
  })

  it('throws when fetch fails non-OK', async () => {
    const fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
      json: async () => null,
    })

    const stream = createTextStream(tasks, baseConfig(fetch))
    await expect(stream.result()).rejects.toThrow(/SSE request failed/)
  })

  it('removes the abort listener from the external signal on stream completion', async () => {
    // Track listeners with a fake signal whose addEventListener/removeEventListener we monitor
    const listeners = new Set<() => void>()
    const fakeSignal = {
      aborted: false,
      addEventListener: (type: string, listener: () => void) => {
        if (type === 'abort') { listeners.add(listener) }
      },
      removeEventListener: (type: string, listener: () => void) => {
        if (type === 'abort') { listeners.delete(listener) }
      },
    } as unknown as AbortSignal

    const fetch = mockFetch(['data: {"delta":{"text":"x"},"taskUUID":"t1"}\n', 'data: [DONE]\n'])
    const stream = createTextStream(tasks, baseConfig(fetch), fakeSignal)
    await stream.result()

    expect(listeners.size).toBe(0)
  })
})
