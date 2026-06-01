import {
  describe,
  it,
  expect,
  vi,
} from 'bun:test'

import { createRegistry } from '../src/registry'
import { createLogger } from '../src/logger'

const sleep = async (ms: number) => new Promise((r) => setTimeout(r, ms))

const baseFallback = {
  models: { 'bundled:1@1': { taskType: 'imageInference', id: 'bundled-1' } },
  architectureTaskTypes: { sdxl: 'imageInference' },
  modalityTaskTypes: { image: 'imageInference' },
}

const mockRegistryResponse = (data: any, options: { etag?: string; status?: number } = {}) => ({
  status: options.status ?? 200,
  ok: (options.status ?? 200) < 400,
  headers: {get: (name: string) => (name.toLowerCase() === 'etag' ? options.etag ?? null : null)},
  json: async () => data,
})

describe('createRegistry', () => {
  it('fetches lazily on first lookup', async () => {
    const fetch = vi.fn().mockResolvedValue(mockRegistryResponse({
      version: 'v1',
      models: { 'remote:1@1': { taskType: 'videoInference', id: 'remote-1' } },
      architectureTaskTypes: {}, modalityTaskTypes: {},
    }))

    const registry = createRegistry({
      url: 'https://example.com/registry.json',
      ttl: 60_000,
      fetchImpl: fetch as any,
      log: createLogger(false),
      fallback: baseFallback,
    })

    expect(fetch).not.toHaveBeenCalled()

    const result = await registry.getModelTaskType('remote:1@1')
    expect(result).toBe('videoInference')
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it('reuses cache within TTL — no second fetch', async () => {
    const fetch = vi.fn().mockResolvedValue(mockRegistryResponse({
      version: 'v1',
      models: { 'remote:1@1': { taskType: 'imageInference', id: 'remote-1' } },
      architectureTaskTypes: {}, modalityTaskTypes: {},
    }))

    const registry = createRegistry({
      url: 'https://example.com/registry.json',
      ttl: 60_000,
      fetchImpl: fetch as any,
      log: createLogger(false),
      fallback: baseFallback,
    })

    await registry.getModelTaskType('remote:1@1')
    await registry.getModelTaskType('remote:1@1')
    await registry.getModelTaskType('remote:1@1')

    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it('falls back to bundled data when not in remote registry', async () => {
    const fetch = vi.fn().mockResolvedValue(mockRegistryResponse({
      version: 'v1',
      models: {},
      architectureTaskTypes: {}, modalityTaskTypes: {},
    }))

    const registry = createRegistry({
      url: 'https://example.com/registry.json',
      ttl: 60_000,
      fetchImpl: fetch as any,
      log: createLogger(false),
      fallback: baseFallback,
    })

    expect(await registry.getModelTaskType('bundled:1@1')).toBe('imageInference')
    expect(await registry.getArchitectureTaskType('sdxl')).toBe('imageInference')
  })

  it('falls back to bundled when remote fetch fails', async () => {
    const fetch = vi.fn().mockRejectedValue(new Error('network error'))

    const registry = createRegistry({
      url: 'https://example.com/registry.json',
      ttl: 60_000,
      fetchImpl: fetch as any,
      log: createLogger(false),
      fallback: baseFallback,
    })

    expect(await registry.getModelTaskType('bundled:1@1')).toBe('imageInference')
  })

  it('returns null for models not in either source', async () => {
    const fetch = vi.fn().mockResolvedValue(mockRegistryResponse({
      version: 'v1',
      models: {},
      architectureTaskTypes: {}, modalityTaskTypes: {},
    }))

    const registry = createRegistry({
      url: 'https://example.com/registry.json',
      ttl: 60_000,
      fetchImpl: fetch as any,
      log: createLogger(false),
      fallback: baseFallback,
    })

    expect(await registry.getModelTaskType('totally:unknown@1')).toBeNull()
  })

  it('sends If-None-Match on refresh, handles 304', async () => {
    const fetch = vi.fn()
      .mockResolvedValueOnce(mockRegistryResponse(
        {
          version: 'v1', models: { 'a:1@1': { taskType: 'imageInference', id: 'a-1' } }, architectureTaskTypes: {}, modalityTaskTypes: {}, 
        },
        { etag: '"abc123"' },
      ))
      .mockResolvedValueOnce(mockRegistryResponse(null, { status: 304 }))

    const registry = createRegistry({
      url: 'https://example.com/registry.json',
      ttl: 60_000,
      fetchImpl: fetch as any,
      log: createLogger(false),
      fallback: baseFallback,
    })

    await registry.getModelTaskType('a:1@1')
    expect(fetch).toHaveBeenCalledTimes(1)
    expect(fetch.mock.calls[0][1].headers['If-None-Match']).toBeUndefined()

    await registry.refresh()
    expect(fetch).toHaveBeenCalledTimes(2)
    expect(fetch.mock.calls[1][1].headers['If-None-Match']).toBe('"abc123"')

    // 304 keeps the cache, lookup still works
    expect(await registry.getModelTaskType('a:1@1')).toBe('imageInference')
  })

  it('refresh() bypasses TTL and re-fetches', async () => {
    const fetch = vi.fn()
      .mockResolvedValueOnce(mockRegistryResponse({
        version: 'v1', models: { 'a:1@1': { taskType: 'imageInference', id: 'a-1' } }, architectureTaskTypes: {}, modalityTaskTypes: {},
      }))
      .mockResolvedValueOnce(mockRegistryResponse({
        version: 'v2', models: { 'a:1@1': { taskType: 'imageInference', id: 'a-1' }, 'b:1@1': { taskType: 'videoInference', id: 'b-1' } }, architectureTaskTypes: {}, modalityTaskTypes: {},
      }))

    const registry = createRegistry({
      url: 'https://example.com/registry.json',
      ttl: 60_000,
      fetchImpl: fetch as any,
      log: createLogger(false),
      fallback: baseFallback,
    })

    await registry.getModelTaskType('a:1@1')
    expect(registry.getVersion()).toBe('v1')

    await registry.refresh()
    expect(registry.getVersion()).toBe('v2')
    expect(await registry.getModelTaskType('b:1@1')).toBe('videoInference')
  })

  it('notifyVersion triggers refresh when version differs', async () => {
    let pendingResolve: any = null
    const fetch = vi.fn()
      .mockResolvedValueOnce(mockRegistryResponse({
        version: 'v1', models: {}, architectureTaskTypes: {}, modalityTaskTypes: {},
      }))
      .mockImplementation(async () => {
        // Track second-call timing
        await new Promise<void>((resolve) => { pendingResolve = resolve })
        return mockRegistryResponse({
          version: 'v2', models: { 'new:1@1': { taskType: 'imageInference', id: 'new-1' } }, architectureTaskTypes: {}, modalityTaskTypes: {},
        })
      })

    const registry = createRegistry({
      url: 'https://example.com/registry.json',
      ttl: 60_000,
      fetchImpl: fetch as any,
      log: createLogger(false),
      fallback: baseFallback,
    })

    await registry.getModelTaskType('anything')
    expect(fetch).toHaveBeenCalledTimes(1)

    registry.notifyVersion('v2')
    await sleep(5) // let the fire-and-forget kick off
    expect(fetch).toHaveBeenCalledTimes(2)

    // Same version — no extra fetch
    registry.notifyVersion('v2')
    await sleep(5)
    expect(fetch).toHaveBeenCalledTimes(2)

    pendingResolve?.()
  })

  it('initial fetch timeout falls back to bundled', async () => {
    // Fetch that never resolves
    const fetch = vi.fn().mockImplementation(async () => new Promise(() => {}))

    const registry = createRegistry({
      url: 'https://example.com/registry.json',
      ttl: 60_000,
      fetchImpl: fetch as any,
      log: createLogger(false),
      fallback: baseFallback,
      initialFetchTimeout: 50,
    })

    // Should not hang — times out and uses fallback
    expect(await registry.getModelTaskType('bundled:1@1')).toBe('imageInference')
  })

  it('concurrent first lookups share a single in-flight fetch', async () => {
    let resolveFetch: any = null
    const fetch = vi.fn().mockImplementation(async () => new Promise((resolve) => {
      resolveFetch = resolve
    }))

    const registry = createRegistry({
      url: 'https://example.com/registry.json',
      ttl: 60_000,
      fetchImpl: fetch as any,
      log: createLogger(false),
      fallback: baseFallback,
    })

    const p1 = registry.getModelTaskType('bundled:1@1')
    const p2 = registry.getModelTaskType('bundled:1@1')
    const p3 = registry.getArchitectureTaskType('sdxl')

    await sleep(5)
    expect(fetch).toHaveBeenCalledTimes(1) // single in-flight fetch

    resolveFetch?.(mockRegistryResponse({
      version: 'v1', models: {}, architectureTaskTypes: {}, modalityTaskTypes: {},
    }))

    const [r1, r2, r3] = await Promise.all([p1, p2, p3])
    expect(r1).toBe('imageInference')
    expect(r2).toBe('imageInference')
    expect(r3).toBe('imageInference')
  })

  it('refresh() throws when fetch fails (so day-zero callers can react)', async () => {
    const fetch = vi.fn()
      .mockResolvedValueOnce(mockRegistryResponse({
        version: 'v1', models: { 'a:1@1': { taskType: 'imageInference', id: 'a-1' } }, architectureTaskTypes: {}, modalityTaskTypes: {},
      }))
      .mockRejectedValueOnce(new Error('network down'))

    const registry = createRegistry({
      url: 'https://example.com/registry.json',
      ttl: 60_000,
      fetchImpl: fetch as any,
      log: createLogger(false),
      fallback: baseFallback,
    })

    await registry.getModelTaskType('a:1@1')
    await expect(registry.refresh()).rejects.toThrow('network down')
  })

  it('refresh() throws on non-2xx response', async () => {
    const fetch = vi.fn().mockResolvedValue(mockRegistryResponse(null, { status: 503 }))

    const registry = createRegistry({
      url: 'https://example.com/registry.json',
      ttl: 60_000,
      fetchImpl: fetch as any,
      log: createLogger(false),
      fallback: baseFallback,
    })

    await expect(registry.refresh()).rejects.toThrow(/HTTP 503/)
  })

  it('background refresh failure is logged but does not throw', async () => {
    const fetch = vi.fn()
      .mockResolvedValueOnce(mockRegistryResponse({
        version: 'v1', models: {}, architectureTaskTypes: {}, modalityTaskTypes: {},
      }))
      .mockRejectedValueOnce(new Error('background failure'))

    const registry = createRegistry({
      url: 'https://example.com/registry.json',
      ttl: 20,
      fetchImpl: fetch as any,
      log: createLogger(false),
      fallback: baseFallback,
    })

    await registry.getModelTaskType('bundled:1@1')
    await sleep(40) // past TTL

    // This should not throw even though the background refresh fails
    expect(await registry.getModelTaskType('bundled:1@1')).toBe('imageInference')
  })

  it('triggers background refresh after TTL elapses', async () => {
    let callCount = 0
    const fetch = vi.fn().mockImplementation(async () => {
      callCount += 1
      return mockRegistryResponse({
        version: `v${callCount}`,
        models: { 'a:1@1': { taskType: 'imageInference', id: 'a-1' } },
        architectureTaskTypes: {}, modalityTaskTypes: {},
      })
    })

    const registry = createRegistry({
      url: 'https://example.com/registry.json',
      ttl: 20, // 20ms TTL
      fetchImpl: fetch as any,
      log: createLogger(false),
      fallback: baseFallback,
    })

    await registry.getModelTaskType('a:1@1')
    expect(fetch).toHaveBeenCalledTimes(1)

    await sleep(40) // past TTL
    await registry.getModelTaskType('a:1@1') // triggers background refresh
    await sleep(10) // let the background fetch settle

    expect(fetch).toHaveBeenCalledTimes(2)
  })
})
