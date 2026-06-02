import type { SDKConfig, RuntimeDependencies } from './types/sdk'
import type { WebSocketConstructor } from './types/transport'

import { createLogger } from './logger'
import { createRunwareError } from './errors'

export const DEFAULT_CONFIG: Partial<SDKConfig> = {
  transportType: 'websocket',
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

  // Node v21+ has native WebSocket; older versions need the ws package.
  // If `ws` isn't installed, leave WebSocket undefined — REST-only users
  // don't need it, and the WS transport throws `noWebSocketImpl` itself at
  // connect time when it actually matters.
  if (globalThis.WebSocket) {
    nodeDeps.WebSocket = globalThis.WebSocket as unknown as WebSocketConstructor
  } else {
    try {
      const wsModule = await import('ws')
      nodeDeps.WebSocket = wsModule.default as unknown as WebSocketConstructor
    } catch { }
  }

  return nodeDeps
}

export const isNodeJS = (): boolean => (
  typeof process !== 'undefined'
  && typeof process.versions?.node === 'string'
)
