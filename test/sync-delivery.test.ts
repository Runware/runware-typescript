/**
 * Coverage for `client.run({ deliveryMethod: 'sync' })` over both transports.
 *
 * The default delivery is async, which is well-covered elsewhere
 * (rest-polling.test.ts, ws-async-polling.test.ts). The sync path is the
 * one a power-user opts into when they know the task is fast and want to
 * skip the polling round-trips. These tests pin the contract:
 *
 *   - REST + sync: one HTTP call, no getResponse polling
 *   - WS + sync: server push on the subscription, no getResponse polling
 */

import {
  describe, it, expect, vi,
} from 'bun:test'

import { createClient } from '../src/index'

const sleep = async (ms: number) => new Promise((r) => setTimeout(r, ms))

const sampleRunParams = {
  taskType: 'imageInference',
  model: 'civitai:1@1',
  positivePrompt: 'x',
  width: 512,
  height: 512,
  deliveryMethod: 'sync',
} as const

describe('REST + deliveryMethod=sync via client.run', () => {
  it('returns the result from one HTTP call, no getResponse polling', async () => {
    const responseBody = { data: [{ taskUUID: 'sync-1', imageURL: 'https://result.jpg' }] }
    const mockResponse = { ok: true, status: 200, json: async () => responseBody }
    const mockFetch = vi.fn().mockResolvedValue(mockResponse)

    const client = await createClient({
      apiKey: 'test',
      transport: 'rest',
      dependencies: { fetch: mockFetch as any },
    })

    const result = await client.run(sampleRunParams as any)

    expect(result).toHaveLength(1)
    expect(result[0]).toMatchObject({ taskUUID: 'sync-1', imageURL: 'https://result.jpg' })
    expect(mockFetch).toHaveBeenCalledTimes(1)

    const sentBody = JSON.parse((mockFetch.mock.calls[0]?.[1] as any).body)
    expect(sentBody[0].deliveryMethod).toBe('sync')
    expect(sentBody[0].taskType).toBe('imageInference')

    const getResponseCalls = mockFetch.mock.calls.filter((call) => {
      const body = JSON.parse((call[1] as any).body)
      return body.some((t: any) => t.taskType === 'getResponse')
    })
    expect(getResponseCalls).toHaveLength(0)
  })

  it('forwards an error response without entering a polling loop', async () => {
    const errorBody = { errors: [{ code: 'invalidPositivePrompt', message: 'bad prompt', taskUUID: 'sync-2' }] }
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false, status: 400, statusText: 'Bad Request', json: async () => errorBody,
    })

    const client = await createClient({
      apiKey: 'test',
      transport: 'rest',
      dependencies: { fetch: mockFetch as any },
    })

    await expect(client.run(sampleRunParams as any)).rejects.toThrow(/bad prompt/)
    expect(mockFetch).toHaveBeenCalledTimes(1)
  })
})

const createMockWebSocket = (sent: string[]) => {
  let instance: any
  const MockWS = function (this: any) {
    const ws: any = {
      readyState: 1,
      onopen: null,
      onclose: null,
      onmessage: null,
      onerror: null,
      close: () => { ws.onclose?.() },
      send: (data: string) => {
        sent.push(data)
        const parsed = JSON.parse(data)
        if (parsed[0]?.taskType === 'authentication') {
          setTimeout(() => {
            ws.onmessage?.({
              data: JSON.stringify({
                data: [{
                  taskType: 'authentication',
                  connectionSessionUUID: 'sess-1',
                }],
              }),
            })
          }, 1)
        }
      },
    }
    instance = ws
    setTimeout(() => ws.onopen?.(), 1)
    return ws
  }
  return {
    WebSocket: MockWS,
    push: (frame: unknown) => {
      instance.onmessage?.({ data: JSON.stringify(frame) })
    },
    sent,
  }
}

const findTaskTypesSent = (sent: string[]): string[] =>
  sent.map((raw) => JSON.parse(raw)).flat().map((t: any) => t.taskType)

describe('WebSocket + deliveryMethod=sync via client.run', () => {
  it('resolves on a pushed result without sending getResponse', async () => {
    const sent: string[] = []
    const mock = createMockWebSocket(sent)

    const client = await createClient({
      apiKey: 'test',
      dependencies: { WebSocket: mock.WebSocket as any },
      retryDelay: 1,
    })
    await client.connect()

    const runPromise = client.run(sampleRunParams as any)

    // Wait for the submit to flush, then play the server: push the result
    // back on the task's subscription (sync delivery semantics).
    await sleep(50)
    const submittedFrame = JSON.parse(sent[1])
    const taskUUID = submittedFrame[0].taskUUID
    expect(submittedFrame[0].deliveryMethod).toBe('sync')

    mock.push({ data: [{ taskUUID, imageURL: 'https://result.jpg' }] })

    const result = await runPromise

    expect(result).toHaveLength(1)
    expect(result[0]).toMatchObject({ taskUUID, imageURL: 'https://result.jpg' })

    // The hallmark of sync delivery: SDK never sent a getResponse.
    const taskTypes = findTaskTypesSent(sent)
    expect(taskTypes).not.toContain('getResponse')
  })

  it('rejects on an error frame without sending getResponse', async () => {
    const sent: string[] = []
    const mock = createMockWebSocket(sent)

    const client = await createClient({
      apiKey: 'test',
      dependencies: { WebSocket: mock.WebSocket as any },
      retryDelay: 1,
    })
    await client.connect()

    const runPromise = client.run(sampleRunParams as any)

    await sleep(50)
    const taskUUID = JSON.parse(sent[1])[0].taskUUID

    mock.push({ errors: [{ code: 'invalidPositivePrompt', message: 'bad prompt', taskUUID }] })

    await expect(runPromise).rejects.toThrow(/bad prompt/)

    const taskTypes = findTaskTypesSent(sent)
    expect(taskTypes).not.toContain('getResponse')
  })
})
