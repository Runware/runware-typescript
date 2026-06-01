import type { SDKConfig, TransportType } from '../types/sdk'
import type { Transport } from '../types/transport'

import { createWebSocketTransport } from './websocket'
import { createRestTransport } from './rest'

export const createTransport = (type: TransportType | undefined, config: SDKConfig): Transport => {
  if (type === 'websocket') {
    return createWebSocketTransport(config)
  } else if (type === 'rest') {
    return createRestTransport(config)
  } else {
    throw new Error(`Unsupported transport type: ${type}`)
  }
}
