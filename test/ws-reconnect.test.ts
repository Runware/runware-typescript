import type { SDKConfig, TaskPayload } from '../src/types/sdk'
import type { WsResponse } from '../src/types/transport'

import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
  spyOn,
} from 'bun:test'

import { createClient } from '../src/index'
import { createLogger } from '../src/logger'
import { parseApiError } from '../src/errors'
import { createWebSocketTransport } from '../src/transport/websocket'

const sleep = async (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const waitFor = async (condition: () => boolean, timeout = 3000) => {
  const start = Date.now()
  while (!condition()) {
    if (Date.now() - start > timeout) { throw new Error('waitFor timed out') }
    await sleep(2)
  }
}

const advance = async (ms: number, step = 100) => {
  for (let elapsed = 0; elapsed < ms; elapsed += step) {
    jest.advanceTimersByTime(step)
    for (let flush = 0; flush < 20; flush++) { await Promise.resolve() }
  }
}

type Frame = Record<string, unknown>
type Deliver = (frame: Frame) => void
type MockSocket = {
  id: number
  readyState: number
  dead: boolean
  onopen: ((event: unknown) => void) | null
  onclose: ((event: unknown) => void) | null
  onmessage: ((event: { data: string }) => void) | null
  onerror: ((event: unknown) => void) | null
  send: (data: string) => void
  close: () => void
}
type TaskHandler = (task: TaskPayload, deliver: Deliver, socket: MockSocket) => void

const createServer = () => {
  const sockets: MockSocket[] = []
  const log: string[] = []
  const received: Array<{ socket: number, task: TaskPayload }> = []
  const state = { down: false, silentSocket: 0, authDelay: 1 }
  let handleTask: TaskHandler = () => {}

  const WebSocket = function () {
    const id = sockets.length + 1
    const socket: MockSocket = {
      id,
      readyState: 0,
      dead: false,
      onopen: null,
      onclose: null,
      onmessage: null,
      onerror: null,
      close: () => {
        if (socket.readyState === 3) { return }
        socket.readyState = 3
        setTimeout(() => socket.onclose?.({}), 0)
      },
      send: (data: string) => {
        if (socket.dead) { return }
        for (const task of JSON.parse(data) as TaskPayload[]) {
          if (task.taskType === 'authentication') {
            log.push(`s${id}:auth`)
            setTimeout(() => {
              log.push(`s${id}:auth-ok`)
              deliver({ data: [{ taskType: 'authentication', connectionSessionUUID: 'session-1' }] })
            }, state.authDelay)
            continue
          }
          if (task.taskType === 'ping') {
            if (state.silentSocket !== id) {
              setTimeout(() => deliver({ data: [{ taskType: 'ping', pong: true }] }), 1)
            }
            continue
          }
          log.push(`s${id}:${task.taskType}`)
          received.push({ socket: id, task })
          handleTask(task, deliver, socket)
        }
      },
    }
    const deliver: Deliver = (frame) => {
      if (socket.dead || socket.readyState !== 1) { return }
      socket.onmessage?.({ data: JSON.stringify(frame) })
    }
    sockets.push(socket)
    setTimeout(() => {
      if (state.down) {
        socket.readyState = 3
        socket.onerror?.({ message: 'network down' })
        socket.onclose?.({})
        return
      }
      socket.readyState = 1
      socket.onopen?.({})
    }, 1)
    return socket
  }

  const drop = () => {
    const socket = sockets[sockets.length - 1]!
    socket.dead = true
    socket.readyState = 3
    setTimeout(() => socket.onclose?.({}), 0)
  }

  return {
    WebSocket: WebSocket as unknown as NonNullable<SDKConfig['dependencies']>['WebSocket'],
    sockets,
    log,
    received,
    state,
    drop,
    onTask: (handler: TaskHandler) => { handleTask = handler },
    sentOn: (taskType: string) => received
      .filter((entry) => entry.task.taskType === taskType)
      .map((entry) => entry.socket),
  }
}

const transportConfig = (server: ReturnType<typeof createServer>): SDKConfig => ({
  apiKey: 'test-key',
  wsBaseUrl: 'wss://ws-api.runware.ai',
  httpBaseUrl: 'https://api.runware.ai',
  serverlessBaseUrl: 'https://serverless.test.com',
  transport: 'websocket',
  timeout: 5000,
  pollTimeout: 5000,
  authTimeout: 5000,
  maxRetries: 3,
  retryDelay: 10,
  retryStrategy: 'exponential',
  maxReconnectAttempts: Infinity,
  debug: false,
  log: createLogger(false),
  dependencies: { WebSocket: server.WebSocket },
})

const conflict = (taskUUID: string): Frame => ({ errors: [{ code: 'conflictTaskUUID', message: 'Conflicting taskUUID', taskUUID }] })

const success = (taskUUID: string): Frame => ({
  data: [{
    taskUUID,
    taskType: 'imageInference',
    status: 'success',
    imageURL: 'https://example.com/img.jpg',
  }],
})

const imageParams = {
  taskType: 'imageInference',
  model: 'civitai:1@1',
  positivePrompt: 'x',
  width: 512,
  height: 512,
}

beforeEach(() => {
  spyOn(Math, 'random').mockReturnValue(0)
})

afterEach(() => {
  jest.restoreAllMocks()
  jest.useRealTimers()
})

describe('WebSocket reconnect', () => {
  it('holds a request sent while reconnecting and sends it after authentication', async () => {
    const server = createServer()
    const transport = createWebSocketTransport(transportConfig(server))
    await transport.connect()

    server.state.authDelay = 20
    server.drop()
    await sleep(0)
    expect(transport.isConnected()).toBe(false)

    await transport.sendRequest({ taskType: 'getResponse', taskUUID: 'task-1' })

    await waitFor(() => server.received.length === 1)
    expect(server.received[0]!.socket).toBe(2)
    expect(server.log.filter((entry) => entry.startsWith('s2'))).toEqual([
      's2:auth', 's2:auth-ok', 's2:getResponse',
    ])
    await transport.disconnect()
  })

  it('sends an unanswered getResponse again after a reconnect', async () => {
    const server = createServer()
    server.onTask((task, deliver, socket) => {
      if (socket.id === 1) { return }
      deliver({ data: [{ taskUUID: task.taskUUID, taskType: 'getResponse', status: 'processing' }] })
    })
    const transport = createWebSocketTransport(transportConfig(server))
    await transport.connect()

    const frames: WsResponse[] = []
    transport.subscribeToTask('task-1', (frame) => { frames.push(frame) })
    await transport.sendRequest({ taskType: 'getResponse', taskUUID: 'task-1' })
    server.drop()

    await waitFor(() => frames.length === 1)
    expect(server.sentOn('getResponse')).toEqual([1, 2])
    expect(frames[0]!.data?.[0]?.status).toBe('processing')
    await transport.disconnect()
  })

  it('treats conflictTaskUUID on a resent async submission as its ACK', async () => {
    const server = createServer()
    server.onTask((task, deliver, socket) => {
      if (socket.id === 1) { return }
      deliver(conflict(task.taskUUID))
    })
    const transport = createWebSocketTransport(transportConfig(server))
    await transport.connect()

    const frames: WsResponse[] = []
    transport.subscribeToTask('task-1', (frame) => { frames.push(frame) })
    await transport.sendRequest({ taskType: 'imageInference', taskUUID: 'task-1', deliveryMethod: 'async' })
    server.drop()

    await waitFor(() => frames.length === 1)
    expect(server.sentOn('imageInference')).toEqual([1, 2])
    expect(frames[0]).toEqual({ data: [{ taskType: 'imageInference', taskUUID: 'task-1' }] })
    await transport.disconnect()
  })

  it('keeps conflictTaskUUID as an error when the request was sent only once', async () => {
    const server = createServer()
    server.onTask((task, deliver) => { deliver(conflict(task.taskUUID)) })
    const transport = createWebSocketTransport(transportConfig(server))
    await transport.connect()

    const frames: WsResponse[] = []
    transport.subscribeToTask('task-1', (frame) => { frames.push(frame) })
    await transport.sendRequest({ taskType: 'imageInference', taskUUID: 'task-1', deliveryMethod: 'async' })

    await waitFor(() => frames.length === 1)
    expect(parseApiError(frames[0]!.error).code).toBe('validation')
    await transport.disconnect()
  })

  it('fails a sync request that may have run instead of sending it twice', async () => {
    const server = createServer()
    const transport = createWebSocketTransport(transportConfig(server))
    await transport.connect()

    const frames: WsResponse[] = []
    transport.subscribeToTask('task-1', (frame) => { frames.push(frame) })
    await transport.sendRequest({ taskType: 'imageInference', taskUUID: 'task-1' })
    server.drop()

    await waitFor(() => frames.length === 1)
    await sleep(20)
    expect(server.sentOn('imageInference')).toEqual([1])
    const error = parseApiError(frames[0]!.error)
    expect(error.code).toBe('connection')
    expect(error.message).toContain('may have been processed')
    await transport.disconnect()
  })

  it('sends a sync request held during the reconnect exactly once', async () => {
    const server = createServer()
    const transport = createWebSocketTransport(transportConfig(server))
    await transport.connect()

    server.drop()
    await sleep(0)
    await transport.sendRequest({ taskType: 'imageInference', taskUUID: 'task-1' })

    await waitFor(() => server.received.length === 1)
    await sleep(20)
    expect(server.sentOn('imageInference')).toEqual([2])
    await transport.disconnect()
  })

  it('still throws when no reconnect is coming', async () => {
    const server = createServer()
    const transport = createWebSocketTransport(transportConfig(server))

    await expect(transport.sendRequest({ taskType: 'getResponse', taskUUID: 'task-1' }))
      .rejects.toThrow('Not connected to WebSocket server')

    await transport.connect()
    await transport.disconnect()
    await expect(transport.sendRequest({ taskType: 'getResponse', taskUUID: 'task-1' }))
      .rejects.toThrow('Not connected to WebSocket server')
  })

  it('releases held requests when the client disconnects during an outage', async () => {
    const server = createServer()
    const transport = createWebSocketTransport(transportConfig(server))
    await transport.connect()

    server.state.down = true
    server.drop()
    await sleep(0)

    const frames: WsResponse[] = []
    transport.subscribeToTask('task-1', (frame) => { frames.push(frame) })
    await transport.sendRequest({ taskType: 'getResponse', taskUUID: 'task-1' })
    await sleep(50)

    await transport.disconnect()
    expect(frames).toHaveLength(1)
    expect(parseApiError(frames[0]!.error).message).toBe('Client disconnected')
    await expect(transport.sendRequest({ taskType: 'getResponse', taskUUID: 'task-2' }))
      .rejects.toThrow('Not connected to WebSocket server')
  })

  it('reconnects once after a silent connection instead of every 30 seconds', async () => {
    jest.useFakeTimers()
    const server = createServer()
    server.state.silentSocket = 1
    const transport = createWebSocketTransport(transportConfig(server))

    const connecting = transport.connect()
    await advance(10, 1)
    await connecting

    await advance(300_000)
    expect(server.sockets).toHaveLength(2)
    expect(transport.isConnected()).toBe(true)

    jest.useRealTimers()
    await transport.disconnect()
  })
})

describe('run() over a dropping connection', () => {
  it('completes when the connection drops before the ACK', async () => {
    const server = createServer()
    server.onTask((task, deliver, socket) => {
      if (task.taskType === 'imageInference' && socket.id === 1) {
        server.drop()
        return
      }
      deliver(task.taskType === 'imageInference' ? conflict(task.taskUUID) : success(task.taskUUID))
    })
    const client = await createClient({
      apiKey: 'test',
      dependencies: { WebSocket: server.WebSocket },
      retryDelay: 10,
      timeout: 3000,
    })
    await client.connect()

    const results = await client.run(imageParams as never)
    expect((results[0] as Record<string, unknown>).imageURL).toBe('https://example.com/img.jpg')
    expect(server.sentOn('imageInference')).toEqual([1, 2])
    await client.disconnect()
  })

  it('completes when the connection is down while a poll is due', async () => {
    const server = createServer()
    server.onTask((task, deliver) => {
      if (task.taskType === 'imageInference') {
        deliver({ data: [{ taskType: 'imageInference', taskUUID: task.taskUUID }] })
        server.state.down = true
        server.drop()
        setTimeout(() => { server.state.down = false }, 1200)
        return
      }
      deliver(success(task.taskUUID))
    })
    const client = await createClient({
      apiKey: 'test',
      dependencies: { WebSocket: server.WebSocket },
      retryDelay: 10,
      timeout: 5000,
    })
    await client.connect()

    const results = await client.run(imageParams as never)
    expect((results[0] as Record<string, unknown>).imageURL).toBe('https://example.com/img.jpg')
    expect(server.sentOn('getResponse').every((socket) => socket > 1)).toBe(true)
    await client.disconnect()
  })

  it('keeps waiting for the ACK while an outage outlasts the ACK window', async () => {
    const server = createServer()
    server.onTask((task, deliver, socket) => {
      if (task.taskType === 'imageInference' && socket.id === 1) {
        server.state.down = true
        server.drop()
        setTimeout(() => { server.state.down = false }, 45_000)
        return
      }
      deliver(task.taskType === 'imageInference' ? conflict(task.taskUUID) : success(task.taskUUID))
    })
    const client = await createClient({
      apiKey: 'test',
      dependencies: { WebSocket: server.WebSocket },
      retryDelay: 10,
    })
    jest.useFakeTimers()
    const connecting = client.connect()
    await advance(10, 1)
    await connecting

    let outcome: unknown
    client.run(imageParams as never).then(
      (results) => { outcome = results },
      (error: Error) => { outcome = error },
    )
    await advance(80_000)

    expect(outcome).toBeArray()
    expect(server.sentOn('imageInference')).toEqual([1, server.sockets.length])

    jest.useRealTimers()
    await client.disconnect()
  })
})
