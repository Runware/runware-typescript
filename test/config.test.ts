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
      transportType: 'rest' as const,
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

  it('uses globalThis.WebSocket when available (Node 21+)', async () => {
    originalWS = (globalThis as any).WebSocket
    const fakeWS = function () {} as unknown
    ;(globalThis as any).WebSocket = fakeWS

    const deps = await createNodeDependencies()
    expect(deps.WebSocket).toBe(fakeWS as never)
  })

  it('falls back to the ws package when globalThis.WebSocket is undefined', async () => {
    originalWS = (globalThis as any).WebSocket
    delete (globalThis as any).WebSocket

    const deps = await createNodeDependencies()
    // ws package is installed as devDep; the function should import it successfully
    expect(deps.WebSocket).toBeDefined()
    expect(typeof deps.WebSocket).toBe('function')
  })
})
