import {
  describe,
  it,
  expect,
} from 'bun:test'

import { createClient } from '../src/index'

const sleep = async (ms: number) => new Promise((r) => setTimeout(r, ms))

/**
 * Mock WebSocket that lets the test play the role of the server.
 * Captures sent payloads and exposes a push() helper that mirrors what
 * the real server would deliver back via `onmessage`.
 */
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
        // Auto-reply to authentication so connect() resolves
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

const findGetResponseUUIDs = (sent: string[]): string[] =>
  sent
    .map((raw) => JSON.parse(raw))
    .flat()
    .filter((task: any) => task.taskType === 'getResponse')
    .map((task: any) => task.taskUUID)

// Push an ACK frame for a submitted async task so the SDK starts polling.
const pushAck = (mock: ReturnType<typeof createMockWebSocket>, taskUUID: string) => {
  mock.push({ data: [{ taskUUID, taskType: 'imageInference' }] })
}

describe('WebSocket async polling (executeWebSocketAsync)', () => {
  it('polls getResponse until status flips to success', async () => {
    const sent: string[] = []
    const mock = createMockWebSocket(sent)

    const client = await createClient({
      apiKey: 'test',
      dependencies: { WebSocket: mock.WebSocket as any },
      retryDelay: 1,
    })
    await client.connect()

    const runPromise = client.run({
      taskType: 'imageInference',
      model: 'civitai:1@1',
      positivePrompt: 'x',
      width: 512,
      height: 512,
    } as any)

    await sleep(50)
    const initialTaskUUID = JSON.parse(sent[1])[0].taskUUID

    // Server ACKs the submit, then SDK starts polling
    pushAck(mock, initialTaskUUID)

    while (findGetResponseUUIDs(sent).length === 0) {
      await sleep(20)
    }

    // First poll: still processing
    mock.push({
      data: [{
        taskUUID: initialTaskUUID,
        taskType: 'imageInference',
        status: 'processing',
      }],
    })

    // Wait for the next poll cycle
    const initialPollCount = findGetResponseUUIDs(sent).length
    while (findGetResponseUUIDs(sent).length === initialPollCount) {
      await sleep(50)
    }

    // Second poll: success
    mock.push({
      data: [{
        taskUUID: initialTaskUUID,
        taskType: 'imageInference',
        status: 'success',
        imageURL: 'https://example.com/img.jpg',
      }],
    })

    const results = await runPromise
    expect(results).toHaveLength(1)
    expect((results[0] as any).imageURL).toBe('https://example.com/img.jpg')

    await client.disconnect()
  })

  it('waits for all numberResults items before resolving', async () => {
    const sent: string[] = []
    const mock = createMockWebSocket(sent)

    const client = await createClient({
      apiKey: 'test',
      dependencies: { WebSocket: mock.WebSocket as any },
      retryDelay: 1,
    })
    await client.connect()

    const runPromise = client.run({
      taskType: 'imageInference',
      model: 'civitai:1@1',
      positivePrompt: 'x',
      width: 512,
      height: 512,
      numberResults: 2,
    } as any)

    await sleep(50)
    const initialTaskUUID = JSON.parse(sent[1])[0].taskUUID
    pushAck(mock, initialTaskUUID)

    while (findGetResponseUUIDs(sent).length === 0) { await sleep(20) }

    // First poll: only 1 of 2 done
    mock.push({
      data: [
        {
          taskUUID: initialTaskUUID, taskType: 'imageInference', status: 'success', imageURL: 'a.jpg',
        },
        { taskUUID: initialTaskUUID, taskType: 'imageInference', status: 'processing' },
      ],
    })

    const firstPollCount = findGetResponseUUIDs(sent).length
    while (findGetResponseUUIDs(sent).length === firstPollCount) { await sleep(50) }

    // Second poll: both done
    mock.push({
      data: [
        {
          taskUUID: initialTaskUUID, taskType: 'imageInference', status: 'success', imageURL: 'a.jpg',
        },
        {
          taskUUID: initialTaskUUID, taskType: 'imageInference', status: 'success', imageURL: 'b.jpg',
        },
      ],
    })

    const results = await runPromise
    expect(results).toHaveLength(2)
    expect((results[0] as any).imageURL).toBe('a.jpg')
    expect((results[1] as any).imageURL).toBe('b.jpg')

    await client.disconnect()
  })

  it('onResult fires once per completed item, onProgress fires on progress changes', async () => {
    const sent: string[] = []
    const mock = createMockWebSocket(sent)

    const results: Record<string, unknown>[] = []
    const progressEvents: Record<string, unknown>[] = []

    const client = await createClient({
      apiKey: 'test',
      dependencies: { WebSocket: mock.WebSocket as any },
      retryDelay: 1,
    })
    await client.connect()

    const runPromise = client.run({
      taskType: 'imageInference',
      model: 'civitai:1@1',
      positivePrompt: 'x',
      width: 512,
      height: 512,
      numberResults: 2,
    } as any, {
      onResult: (item) => { results.push(item) },
      onProgress: (item) => { progressEvents.push(item) },
    })

    await sleep(50)
    const initialTaskUUID = JSON.parse(sent[1])[0].taskUUID
    pushAck(mock, initialTaskUUID)

    while (findGetResponseUUIDs(sent).length === 0) { await sleep(20) }

    // Cycle 1: both processing with progress
    mock.push({
      data: [
        {
          taskUUID: initialTaskUUID, taskType: 'imageInference', status: 'processing', progress: 30, 
        },
        {
          taskUUID: initialTaskUUID, taskType: 'imageInference', status: 'processing', progress: 30, 
        },
      ],
    })

    const c1 = findGetResponseUUIDs(sent).length
    while (findGetResponseUUIDs(sent).length === c1) { await sleep(50) }

    // Cycle 2: both processing, progress changed → onProgress should fire
    mock.push({
      data: [
        {
          taskUUID: initialTaskUUID, taskType: 'imageInference', status: 'processing', progress: 70, 
        },
        {
          taskUUID: initialTaskUUID, taskType: 'imageInference', status: 'processing', progress: 70, 
        },
      ],
    })

    const c2 = findGetResponseUUIDs(sent).length
    while (findGetResponseUUIDs(sent).length === c2) { await sleep(50) }

    // Cycle 3: one done, one still processing (progress unchanged)
    mock.push({
      data: [
        {
          taskUUID: initialTaskUUID, taskType: 'imageInference', status: 'success', imageUUID: 'a', imageURL: 'a.jpg', 
        },
        {
          taskUUID: initialTaskUUID, taskType: 'imageInference', status: 'processing', progress: 70, 
        },
      ],
    })

    const c3 = findGetResponseUUIDs(sent).length
    while (findGetResponseUUIDs(sent).length === c3) { await sleep(50) }

    // Cycle 4: both done
    mock.push({
      data: [
        {
          taskUUID: initialTaskUUID, taskType: 'imageInference', status: 'success', imageUUID: 'a', imageURL: 'a.jpg', 
        },
        {
          taskUUID: initialTaskUUID, taskType: 'imageInference', status: 'success', imageUUID: 'b', imageURL: 'b.jpg', 
        },
      ],
    })

    await runPromise

    // onResult: 2 completions, once each (no duplicate fires for the success
    // item that appeared in two consecutive cycles)
    expect(results).toHaveLength(2)
    expect((results[0] as any).imageURL).toBe('a.jpg')
    expect((results[1] as any).imageURL).toBe('b.jpg')

    // onProgress: fired only when progress changed (cycle 1: 2 items at 30,
    // cycle 2: both moved to 70, cycle 3: only the processing item still at 70
    // = no change for it). So 2 fires at cycle 1 + 2 fires at cycle 2 = 4.
    expect(progressEvents).toHaveLength(4)

    await client.disconnect()
  })

  it('onResult fires for error items before the promise rejects', async () => {
    const sent: string[] = []
    const mock = createMockWebSocket(sent)

    const results: Record<string, unknown>[] = []

    const client = await createClient({
      apiKey: 'test',
      dependencies: { WebSocket: mock.WebSocket as any },
      retryDelay: 1,
    })
    await client.connect()

    const runPromise = client.run({
      taskType: 'imageInference',
      model: 'civitai:1@1',
      positivePrompt: 'x',
      width: 512,
      height: 512,
      numberResults: 2,
    } as any, {onResult: (item) => { results.push(item) }})

    await sleep(50)
    const initialTaskUUID = JSON.parse(sent[1])[0].taskUUID
    pushAck(mock, initialTaskUUID)

    while (findGetResponseUUIDs(sent).length === 0) { await sleep(20) }

    mock.push({
      data: [
        {
          taskUUID: initialTaskUUID, taskType: 'imageInference', status: 'success', imageUUID: 'a', imageURL: 'a.jpg', 
        },
        {
          taskUUID: initialTaskUUID, taskType: 'imageInference', status: 'error', error: { code: 'safety', message: 'Content flagged' }, 
        },
      ],
    })

    await expect(runPromise).rejects.toThrow('Content flagged')

    // Both items dispatched via onResult before the throw
    expect(results).toHaveLength(2)
    expect((results[0] as any).status).toBe('success')
    expect((results[1] as any).status).toBe('error')

    await client.disconnect()
  })

  it('rejects when the server pushes a validation error instead of an ACK', async () => {
    const sent: string[] = []
    const mock = createMockWebSocket(sent)

    const client = await createClient({
      apiKey: 'test',
      dependencies: { WebSocket: mock.WebSocket as any },
      retryDelay: 1,
    })
    await client.connect()

    const runPromise = client.run({
      taskType: 'imageInference',
      model: 'civitai:1@1',
      positivePrompt: '',
      width: 512,
      height: 512,
    } as any)

    await sleep(50)
    const initialTaskUUID = JSON.parse(sent[1])[0].taskUUID

    // Server rejects the submit before any polling — top-level errors[] frame
    mock.push({
      errors: [{
        code: 'invalidPositivePrompt',
        message: 'positivePrompt must be a string between 1 and 10000 chars',
        parameter: 'positivePrompt',
        taskUUID: initialTaskUUID,
      }],
    })

    await expect(runPromise).rejects.toThrow('positivePrompt must be a string')

    // Verify no getResponse poll was ever sent
    expect(findGetResponseUUIDs(sent)).toHaveLength(0)

    await client.disconnect()
  })

  it('rejects when getResponse returns an item with status="error"', async () => {
    const sent: string[] = []
    const mock = createMockWebSocket(sent)

    const client = await createClient({
      apiKey: 'test',
      dependencies: { WebSocket: mock.WebSocket as any },
      retryDelay: 1,
    })
    await client.connect()

    const runPromise = client.run({
      taskType: 'imageInference',
      model: 'civitai:1@1',
      positivePrompt: '',
      width: 512,
      height: 512,
    } as any)

    await sleep(50)
    const initialTaskUUID = JSON.parse(sent[1])[0].taskUUID
    pushAck(mock, initialTaskUUID)

    while (findGetResponseUUIDs(sent).length === 0) { await sleep(20) }

    // Runtime error surfaces via getResponse as status='error' with embedded
    // `error` object — NOT a top-level errors[] array.
    mock.push({
      data: [{
        taskUUID: initialTaskUUID,
        taskType: 'imageInference',
        status: 'error',
        error: {
          code: 'missingPositivePrompt',
          message: 'positivePrompt is required',
        },
      }],
    })

    await expect(runPromise).rejects.toThrow('positivePrompt is required')

    await client.disconnect()
  })

  it('rejects when an error frame arrives mid-poll', async () => {
    const sent: string[] = []
    const mock = createMockWebSocket(sent)

    const client = await createClient({
      apiKey: 'test',
      dependencies: { WebSocket: mock.WebSocket as any },
      retryDelay: 1,
    })
    await client.connect()

    const runPromise = client.run({
      taskType: 'imageInference',
      model: 'civitai:1@1',
      positivePrompt: 'x',
      width: 512,
      height: 512,
    } as any)

    await sleep(50)
    const initialTaskUUID = JSON.parse(sent[1])[0].taskUUID
    pushAck(mock, initialTaskUUID)

    while (findGetResponseUUIDs(sent).length === 0) { await sleep(20) }

    mock.push({
      error: [{
        code: 'safety',
        message: 'Content flagged',
        taskUUID: initialTaskUUID,
      }],
    })

    await expect(runPromise).rejects.toThrow('Content flagged')

    await client.disconnect()
  })
})
