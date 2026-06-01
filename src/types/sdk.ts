import type { WebSocketConstructor } from './transport'
import type { Logger, LogSink } from '../logger'

export type TransportType = 'websocket' | 'rest'

export type RetryStrategy = 'linear' | 'exponential'

export type RuntimeDependencies = {
  /** Custom WebSocket constructor. Auto-detected on Node 21+ and browsers. */
  WebSocket?: WebSocketConstructor
  /** Custom fetch implementation. Defaults to `globalThis.fetch`. */
  fetch?: typeof fetch
}

export type SDKConfig = {
  /** Runware API key. Required. */
  apiKey: string
  /** WebSocket endpoint, including API version path. Default: `wss://ws-api.runware.ai/v1`. */
  wsBaseUrl: string
  /** REST endpoint, including API version path. Default: `https://api.runware.ai/v1`. */
  httpBaseUrl: string
  /** Transport to use. Default: `websocket`. */
  transportType: TransportType
  /**
   * Per-individual-HTTP-call timeout in ms (one POST or one `getResponse`
   * poll). Default: 1_200_000 (20 min).
   */
  timeout: number
  /**
   * End-to-end polling-loop timeout in ms. SDK gives up after this even if
   * individual polls succeed. Default: 1_200_000 (20 min).
   */
  pollTimeout: number
  /** WebSocket authentication timeout in ms. Default: 15000. */
  authTimeout: number
  /** Max retries on REST transport errors. Default: 3. */
  maxRetries: number
  /** Base delay (ms) for REST retries and WebSocket reconnect backoff. Default: 1000. */
  retryDelay: number
  /** Retry backoff strategy. Default: `exponential`. */
  retryStrategy: RetryStrategy
  /** Max WebSocket reconnect attempts. Default: `Infinity`. */
  maxReconnectAttempts: number
  /** Enable debug logging. Default: false. */
  debug?: boolean
  /** Enable client-side request validation against fetched schemas. Default: false. */
  validate?: boolean
  /** Inject custom runtime dependencies (WebSocket, fetch). */
  dependencies?: RuntimeDependencies
  /** Custom log sink. Defaults to a plain-text sink that writes to `console`. */
  logSink?: LogSink
  /** Internal: populated by `createConfig`. */
  log: Logger
}

export type ResponseCallback<T = unknown> = (response: T) => void

export type RunOptions = {
  /**
   * Called once per item as soon as it reaches a terminal state (success or
   * error). For `numberResults > 1`, fires up to N times — once per result as
   * it completes. Error items fire here before the promise rejects, so you
   * can observe partial outcomes (e.g., 2 of 3 results succeeded).
   */
  onResult?: (item: Record<string, unknown>) => void
  /**
   * Called when an item's `progress` field changes (0-100). Currently only
   * a handful of long-running models emit progress updates (mostly training).
   * Skip this for typical image/video inference — those don't report progress.
   */
  onProgress?: (item: Record<string, unknown>) => void
  /** Per-call timeout override in ms. Falls back to `config.timeout`. */
  timeout?: number
  /** Abort the request mid-flight. */
  signal?: AbortSignal
  /**
   * Per-call client-side validation override. Falls back to `config.validate`.
   * Set to `false` to skip validation on a single call when the client was
   * created with `validate: true`, or to `true` to run validation on a single
   * call when the client was created without it.
   */
  validate?: boolean
}

export type StreamOptions = {
  /** Abort the stream mid-flight. */
  signal?: AbortSignal
  /**
   * Per-call timeout in ms. If the stream doesn't complete in time, it's
   * aborted via the same mechanism as `signal`. Falls back to `config.timeout`.
   */
  timeout?: number
  /**
   * Per-call client-side validation override. Falls back to `config.validate`.
   * Set to `false` to skip validation, or `true` to force it.
   */
  validate?: boolean
}

export type TaskPayload = {
  taskType: string
  taskUUID: string
  [key: string]: unknown
}
