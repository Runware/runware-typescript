import type { ResponseCallback, TaskPayload } from './sdk'

export type BaseTransport = {
  type: 'websocket' | 'rest'
}

// Matches both browser WebSocket and ws package
export type WebSocketLike = {
  close(): void
  send(data: string | ArrayBufferLike | Blob | ArrayBufferView): void
  onopen: ((this: WebSocketLike, event: any) => void) | null
  onclose: ((this: WebSocketLike, event: any) => void) | null
  onmessage: ((this: WebSocketLike, event: any) => void) | null
  onerror: ((this: WebSocketLike, event: any) => void) | null
  readyState: number
}

export type WebSocketConstructor = {
  new(url: string, protocols?: string | string[]): WebSocketLike
  readonly CONNECTING: number
  readonly OPEN: number
  readonly CLOSING: number
  readonly CLOSED: number
}

export type ConnectionState = {
  connected: boolean
  connectionSessionUUID?: string
  lastActivity: number
}

export type RequestOptions = {
  timeout?: number | undefined
  signal?: AbortSignal | undefined
  [key: string]: unknown
}

export type WsResponse = {
  data?: Array<Record<string, unknown>>
  error?: Record<string, unknown> | Record<string, unknown>[]
}

export type WebSocketTransport = BaseTransport & {
  type: 'websocket'
  connect: () => Promise<void>
  disconnect: () => Promise<void>
  isConnected: () => boolean
  getSessionId: () => string | undefined
  sendRequest: (data: TaskPayload | TaskPayload[], options?: RequestOptions) => Promise<void>
  subscribeToTask: (taskUUID: string, callback: ResponseCallback<WsResponse>) => void
  unsubscribeFromTask: (taskUUID: string) => void
}

export type RestTransport = BaseTransport & {
  type: 'rest'
  sendRequest: (
    data: TaskPayload | TaskPayload[],
    options?: RequestOptions,
  ) => Promise<unknown>
}

export type Transport = WebSocketTransport | RestTransport
