import {
  describe,
  it,
  expect,
  afterEach,
} from 'bun:test'

import {
  createConfig,
  createNodeDependencies,
  DEFAULT_CONFIG,
} from '../src/config'

describe('Configuration module', () => {
  it('should throw an error when apiKey is missing', () => {
    expect(() => createConfig({}))
      .toThrow('API key is required')
  })

  it('should merge user config with defaults', () => {
    const userConfig = {
      apiKey: 'test-key',
      httpBaseUrl: 'https://example.com',
      transport: 'rest' as const,
      debug: true,
    }

    const config = createConfig(userConfig)

    expect(config).toMatchObject({
      ...DEFAULT_CONFIG,
      ...userConfig,
    })
    expect(config.log).toBeDefined()
    expect(typeof config.log.connection).toBe('function')
    expect(typeof config.log.error).toBe('function')
  })
})

describe('createNodeDependencies', () => {
  // Snapshot/restore globalThis.WebSocket between tests
  let originalWS: unknown

  afterEach(() => {
    if (originalWS === undefined) {
      delete (globalThis as any).WebSocket
    } else {
      (globalThis as any).WebSocket = originalWS
    }
  })

  it('prefers the ws package on Node so the handshake can set a User-Agent', async () => {
    originalWS = (globalThis as any).WebSocket
    // Even with a native global present, ws must win: native WebSocket ignores
    // handshake headers, so the client can't be identified over it.
    const fakeWS = function () {} as unknown
    ;(globalThis as any).WebSocket = fakeWS

    const deps = await createNodeDependencies()
    expect(deps.WebSocket).toBeDefined()
    expect(deps.WebSocket).not.toBe(fakeWS as never)
    expect(typeof deps.WebSocket).toBe('function')
  })

  it('resolves the ws package even when native WebSocket is unavailable', async () => {
    originalWS = (globalThis as any).WebSocket
    delete (globalThis as any).WebSocket

    const deps = await createNodeDependencies()
    // ws is a peer dep (installed here as devDep); older Node without a native
    // global still gets a working WebSocket implementation.
    expect(deps.WebSocket).toBeDefined()
    expect(typeof deps.WebSocket).toBe('function')
  })
})
