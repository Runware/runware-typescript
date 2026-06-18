import type { SDKConfig, TaskPayload } from '../src/types/sdk'
import type { RestTransport } from '../src/types/transport'

import {
  describe,
  it,
  expect,
  vi,
} from 'bun:test'

import { createRestTransport } from '../src/transport/rest'
import { createLogger } from '../src/logger'
import { createRunwareError, parseApiError } from '../src/errors'

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

/**
 * Mirrors `executeRest`'s async polling logic: server returns one placeholder
 * per task regardless of numberResults; expected count comes from the task,
 * not from initial-response slots. Each cycle polls every pending UUID in
 * parallel and assembles the per-task success items.
 */
const pollAsyncTasks = async (
  transport: RestTransport,
  taskInputs: Array<{ taskUUID: string, numberResults?: number }>,
  options: { pollDelay?: number, pollTimeout?: number, signal?: AbortSignal } = {},
): Promise<Record<string, unknown>[]> => {
  const expectedPerTask = new Map<string, number>()
  const resultsPerTask = new Map<string, Record<string, unknown>[]>()
  for (const task of taskInputs) {
    expectedPerTask.set(task.taskUUID, task.numberResults ?? 1)
    resultsPerTask.set(task.taskUUID, [])
  }

  const pollTimeout = options.pollTimeout ?? 5000
  const startTime = Date.now()
  let delay = options.pollDelay ?? 1
  const pending = new Set(taskInputs.map((t) => t.taskUUID))

  while (pending.size > 0) {
    if (options.signal?.aborted) {
      throw createRunwareError('aborted', 'Request aborted during polling')
    }
    if (Date.now() - startTime >= pollTimeout) {
      throw createRunwareError('timeout', 'Polling timed out')
    }
    await new Promise((resolve) => setTimeout(resolve, delay))

    const uuids = Array.from(pending)
    const polled = await Promise.all(uuids.map(async (taskUUID) => {
      const pollTasks: TaskPayload[] = [{ taskType: 'getResponse', taskUUID }]
      const response = await transport.sendRequest(pollTasks) as any
      return { taskUUID, response }
    }))

    for (const { taskUUID, response } of polled) {
      const items: Record<string, unknown>[] = Array.isArray(response?.data)
        ? response.data : []
      const errors: Record<string, unknown>[] = Array.isArray(response?.errors)
        ? response.errors : []

      if (errors.length > 0) {
        const parsed = parseApiError({ errors })
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

    delay = Math.min(delay * 1.5, 10000)
  }

  const results: Record<string, unknown>[] = []
  for (const task of taskInputs) {
    results.push(...(resultsPerTask.get(task.taskUUID) ?? []))
  }
  return results
}

describe('REST polling loop', () => {
  it('polls a single pending task until success', async () => {
    let pollCount = 0
    const fetch = vi.fn().mockImplementation(async (_url, opts: RequestInit) => {
      const body = JSON.parse(opts.body as string)
      if (body[0]?.taskType !== 'getResponse') { throw new Error('unexpected') }
      pollCount += 1
      if (pollCount < 3) {
        return {
          ok: true,
          json: async () => ({ data: [{ status: 'processing', taskUUID: 'u1', progress: pollCount * 30 }] }),
        }
      }
      return {
        ok: true,
        json: async () => ({
          data: [{
            taskType: 'imageInference',
            taskUUID: 'u1',
            status: 'success',
            imageURL: 'final.jpg',
          }],
        }),
      }
    })

    const transport = createRestTransport(baseConfig(fetch))
    const results = await pollAsyncTasks(transport, [{ taskUUID: 'u1' }])

    expect(pollCount).toBe(3)
    expect(results).toHaveLength(1)
    expect((results[0] as any).imageURL).toBe('final.jpg')
  })

  it('polls multiple distinct taskUUIDs in parallel (one request per UUID)', async () => {
    let inFlight = 0
    let peakInFlight = 0
    const fetchedUUIDs: string[] = []

    const fetch = vi.fn().mockImplementation(async (_url, opts: RequestInit) => {
      const body = JSON.parse(opts.body as string)
      if (body[0]?.taskType !== 'getResponse') { throw new Error('unexpected') }
      fetchedUUIDs.push(body[0].taskUUID)

      inFlight += 1
      peakInFlight = Math.max(peakInFlight, inFlight)
      await new Promise((resolve) => setTimeout(resolve, 5))
      inFlight -= 1

      return {
        ok: true,
        json: async () => ({ data: [{ status: 'success', taskUUID: body[0].taskUUID, ok: true }] }),
      }
    })

    const transport = createRestTransport(baseConfig(fetch))
    const results = await pollAsyncTasks(transport, [
      { taskUUID: 'u1' }, { taskUUID: 'u2' }, { taskUUID: 'u3' },
    ])

    expect(results).toHaveLength(3)
    expect(peakInFlight).toBe(3)
    expect(fetchedUUIDs.sort()).toEqual(['u1', 'u2', 'u3'])
  })

  it('numberResults > 1: server returns N items per poll, SDK waits for all to succeed', async () => {
    let pollCount = 0
    const requestedUUIDs: string[] = []

    const fetch = vi.fn().mockImplementation(async (_url, opts: RequestInit) => {
      const body = JSON.parse(opts.body as string)
      if (body[0]?.taskType !== 'getResponse') { throw new Error('unexpected') }
      requestedUUIDs.push(body[0].taskUUID)
      pollCount += 1

      // Cycle 1: 1 of 3 done
      if (pollCount === 1) {
        return {
          ok: true,
          json: async () => ({
            data: [
              { status: 'processing', taskUUID: 'X', progress: 30 }, { status: 'processing', taskUUID: 'X', progress: 70 }, { status: 'success', taskUUID: 'X', imageURL: 'a.jpg' },
            ],
          }),
        }
      }
      // Cycle 2: all 3 done
      return {
        ok: true,
        json: async () => ({
          data: [
            { status: 'success', taskUUID: 'X', imageURL: 'a.jpg' }, { status: 'success', taskUUID: 'X', imageURL: 'b.jpg' }, { status: 'success', taskUUID: 'X', imageURL: 'c.jpg' },
          ],
        }),
      }
    })

    const transport = createRestTransport(baseConfig(fetch))
    const results = await pollAsyncTasks(transport, [{ taskUUID: 'X', numberResults: 3 }])

    expect(results).toHaveLength(3)
    expect(results.every((r) => typeof (r as any).imageURL === 'string')).toBe(true)
    expect(requestedUUIDs).toEqual(['X', 'X'])
  })

  it('batch: multiple tasks with different numberResults complete independently', async () => {
    // Simulate: task A (n=2) finishes in 2 polls; task B (n=3) finishes in 3.
    const aProgress = { polls: 0 }
    const bProgress = { polls: 0 }

    const fetch = vi.fn().mockImplementation(async (_url, opts: RequestInit) => {
      const body = JSON.parse(opts.body as string)
      const uuid = body[0]?.taskUUID

      if (uuid === 'A') {
        aProgress.polls += 1
        if (aProgress.polls === 1) {
          return {
            ok: true,
            json: async () => ({
              data: [
                { status: 'success', taskUUID: 'A', imageURL: 'A1.jpg' }, { status: 'processing', taskUUID: 'A' },
              ],
            }),
          }
        }
        return {
          ok: true,
          json: async () => ({
            data: [
              { status: 'success', taskUUID: 'A', imageURL: 'A1.jpg' }, { status: 'success', taskUUID: 'A', imageURL: 'A2.jpg' },
            ],
          }),
        }
      }

      // uuid === 'B'
      bProgress.polls += 1
      if (bProgress.polls < 3) {
        return {
          ok: true,
          json: async () => ({
            data: [
              { status: 'success', taskUUID: 'B', imageURL: 'B1.jpg' }, { status: 'processing', taskUUID: 'B' }, { status: 'processing', taskUUID: 'B' },
            ],
          }),
        }
      }
      return {
        ok: true,
        json: async () => ({
          data: [
            { status: 'success', taskUUID: 'B', imageURL: 'B1.jpg' }, { status: 'success', taskUUID: 'B', imageURL: 'B2.jpg' }, { status: 'success', taskUUID: 'B', imageURL: 'B3.jpg' },
          ],
        }),
      }
    })

    const transport = createRestTransport(baseConfig(fetch))
    const results = await pollAsyncTasks(transport, [
      { taskUUID: 'A', numberResults: 2 }, { taskUUID: 'B', numberResults: 3 },
    ])

    expect(results).toHaveLength(5)
    expect((results[0] as any).imageURL).toBe('A1.jpg')
    expect((results[1] as any).imageURL).toBe('A2.jpg')
    expect((results[2] as any).imageURL).toBe('B1.jpg')
    expect((results[3] as any).imageURL).toBe('B2.jpg')
    expect((results[4] as any).imageURL).toBe('B3.jpg')
  })

  it('throws when getResponse returns an errors array', async () => {
    const fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: [],
        errors: [{
          code: 'timeoutProvider',
          message: 'Provider timed out',
          taskUUID: 'u1',
        }],
      }),
    })

    const transport = createRestTransport(baseConfig(fetch))
    await expect(pollAsyncTasks(transport, [{ taskUUID: 'u1' }])).rejects.toThrow('Provider timed out')
  })

  it('fails the whole task even when some results succeeded', async () => {
    const fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: [
          { status: 'success', taskUUID: 'X', imageURL: 'a.jpg' }, { status: 'success', taskUUID: 'X', imageURL: 'b.jpg' },
        ],
        errors: [{
          code: 'safety',
          message: 'Content flagged',
          taskUUID: 'X',
        }],
      }),
    })

    const transport = createRestTransport(baseConfig(fetch))
    await expect(pollAsyncTasks(transport, [{ taskUUID: 'X', numberResults: 3 }]))
      .rejects.toThrow('Content flagged')
  })

  it('throws timeout when pollTimeout is exceeded', async () => {
    const fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: [{ status: 'processing', taskUUID: 'u1' }] }),
    })

    const transport = createRestTransport(baseConfig(fetch))
    await expect(pollAsyncTasks(transport, [{ taskUUID: 'u1' }], {
      pollTimeout: 50,
      pollDelay: 10,
    })).rejects.toThrow('Polling timed out')
  })

  it('rejects with aborted when signal fires during polling', async () => {
    const fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: [{ status: 'processing', taskUUID: 'u1' }] }),
    })

    const controller = new AbortController()
    const transport = createRestTransport(baseConfig(fetch))

    setTimeout(() => controller.abort(), 20)

    await expect(pollAsyncTasks(transport, [{ taskUUID: 'u1' }], {
      signal: controller.signal,
      pollDelay: 5,
    })).rejects.toThrow('aborted')
  })

  it('wraps JSON parse failures on 2xx responses in RunwareError', async () => {
    const fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => { throw new SyntaxError('Unexpected token < in JSON at position 0') },
    })

    const transport = createRestTransport(baseConfig(fetch))
    const tasks: TaskPayload[] = [{ taskType: 'imageInference', taskUUID: 'u1' }]

    let caught: unknown
    try {
      await transport.sendRequest(tasks)
    } catch (error) {
      caught = error
    }

    expect(caught).toBeDefined()
    const err = caught as Error & { code?: string, statusCode?: number }
    expect(err.name).toBe('RunwareError')
    expect(err.message).toContain('Failed to parse JSON response')
    expect(err.message).toContain('HTTP 200')
    expect(err.statusCode).toBe(200)
  })
})
