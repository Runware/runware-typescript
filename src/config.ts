import type { SDKConfig, RuntimeDependencies } from './types/sdk'
import type { WebSocketConstructor } from './types/transport'

import { createLogger } from './logger'
import { createRunwareError } from './errors'

export const DEFAULT_CONFIG: Partial<SDKConfig> = {
  transport: 'websocket',
  wsBaseUrl: 'wss://ws-api.runware.ai/v1',
  httpBaseUrl: 'https://api.runware.ai/v1',
  timeout: 1_200_000,
  pollTimeout: 1_200_000,
  authTimeout: 15000,
  maxRetries: 3,
  retryDelay: 1000,
  retryStrategy: 'exponential',
  maxReconnectAttempts: Infinity,
  debug: false,
}

export const createConfig = (config: Partial<SDKConfig>): SDKConfig => {
  if (!config.apiKey) {
    throw createRunwareError('missingApiKey', 'API key is required')
  }

  const merged = { ...DEFAULT_CONFIG, ...config } as SDKConfig
  merged.log = createLogger(merged.debug ?? false, merged.logSink)
  return merged
}

export const createBrowserDependencies = (): RuntimeDependencies => ({
  WebSocket: globalThis.WebSocket as unknown as WebSocketConstructor,
  fetch: globalThis.fetch,
})

export const createNodeDependencies = async (): Promise<RuntimeDependencies> => {
  const nodeDeps: RuntimeDependencies = { fetch: globalThis.fetch }

  // Prefer the `ws` package on Node: it lets us set a `User-Agent` header on
  // the WebSocket handshake (per-connection client identification). Node's
  // native global WebSocket follows the WHATWG `(url, protocols)` constructor
  // and silently drops handshake headers, so fall back to it only when `ws`
  // isn't installed. If neither is available, leave WebSocket undefined —
  // REST-only users don't need it, and the WS transport throws
  // `noWebSocketImpl` itself at connect time when it actually matters.
  try {
    const wsModule = await import('ws')
    nodeDeps.WebSocket = wsModule.default as unknown as WebSocketConstructor
  } catch {
    if (globalThis.WebSocket) {
      nodeDeps.WebSocket = globalThis.WebSocket as unknown as WebSocketConstructor
    }
  }

  return nodeDeps
}

export const isNodeJS = (): boolean => (
  typeof process !== 'undefined'
  && typeof process.versions?.node === 'string'
)
