import type { SDKConfig } from '../src/types/sdk'

import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
} from 'bun:test'

import { createContentClient } from '../src/content'
import { isRunwareError } from '../src/errors'

type FetchCall = { url: string }

const createMockFetch = (response: {
  status?: number
  body?: unknown
  throws?: Error
}) => {
  const calls: FetchCall[] = []
  const fetchImpl = vi.fn(async (url: string) => {
    calls.push({ url })
    if (response.throws) { throw response.throws }
    const status = response.status ?? 200
    return {
      ok: status < 400,
      status,
      json: async () => response.body,
    } as unknown as Response
  })
  return { fetchImpl, calls }
}

// Minimal config — content client only reads dependencies.fetch.
const buildClient = (fetchImpl: ReturnType<typeof createMockFetch>['fetchImpl']) => {
  const fetchAlias = fetchImpl as unknown as typeof globalThis.fetch
  const config = { dependencies: { fetch: fetchAlias } } as unknown as SDKConfig
  return createContentClient(config)
}

describe('createContentClient', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('listModels', () => {
    it('hits /models and returns the array', async () => {
      const { fetchImpl, calls } = createMockFetch({body: [{ air: 'runware:101@1', name: 'FLUX.1 dev' }]})
      const client = buildClient(fetchImpl)
      const result = await client.listModels()
      expect(calls[0]?.url).toBe('https://content.runware.ai/models')
      expect(result).toHaveLength(1)
      // listModels returns `array | paginated` — narrow before indexing.
      expect(Array.isArray(result) && result[0]?.air).toBe('runware:101@1')
    })

    it('forwards filter params to the query string', async () => {
      const { fetchImpl, calls } = createMockFetch({ body: [] })
      const client = buildClient(fetchImpl)
      await client.listModels({
        capability: 'io:text-to-image',
        category: 'image',
        creator: 'google',
        search: 'flux',
        sort: 'releasedAt',
        order: 'desc',
        limit: 25,
        offset: 50,
      })
      const url = new URL(calls[0]?.url ?? '')
      expect(url.searchParams.get('capability')).toBe('io:text-to-image')
      expect(url.searchParams.get('category')).toBe('image')
      expect(url.searchParams.get('creator')).toBe('google')
      expect(url.searchParams.get('q')).toBe('flux')
      expect(url.searchParams.get('sort')).toBe('releasedAt')
      expect(url.searchParams.get('order')).toBe('desc')
      expect(url.searchParams.get('limit')).toBe('25')
      expect(url.searchParams.get('offset')).toBe('50')
    })

    it('encodes paginate=true and returns the paginated envelope', async () => {
      const envelope = {
        total: 100, limit: 20, offset: 0, items: [{ air: 'runware:101@1', name: 'FLUX' }],
      }
      const { fetchImpl, calls } = createMockFetch({ body: envelope })
      const client = buildClient(fetchImpl)
      const result = await client.listModels({ paginate: true })
      const url = new URL(calls[0]?.url ?? '')
      expect(url.searchParams.get('paginate')).toBe('true')
      // toEqual against the literal narrows away ModelMetadata's required fields.
      // Pull out and assert each field individually.
      expect(result.total).toBe(100)
      expect(result.limit).toBe(20)
      expect(result.offset).toBe(0)
      expect(result.items).toHaveLength(1)
      expect(result.items[0]?.air).toBe('runware:101@1')
    })
  })

  describe('getModel', () => {
    it('hits /models/:id with the id URL-encoded', async () => {
      const { fetchImpl, calls } = createMockFetch({body: { air: 'runware:101@1', name: 'FLUX' }})
      const client = buildClient(fetchImpl)
      const result = await client.getModel('flux 1/dev')
      expect(calls[0]?.url).toBe('https://content.runware.ai/models/flux%201%2Fdev')
      expect(result?.air).toBe('runware:101@1')
    })

    it('returns null on 404', async () => {
      const { fetchImpl } = createMockFetch({ status: 404 })
      const client = buildClient(fetchImpl)
      const result = await client.getModel('does-not-exist')
      expect(result).toBeNull()
    })

    it('throws RunwareError on non-404 error status', async () => {
      const { fetchImpl } = createMockFetch({ status: 500 })
      const client = buildClient(fetchImpl)
      try {
        await client.getModel('flux-1-dev')
        throw new Error('expected throw')
      } catch (error) {
        expect(isRunwareError(error)).toBe(true)
      }
    })

    it('throws RunwareError with code=connection when fetch itself rejects', async () => {
      const { fetchImpl } = createMockFetch({ throws: new Error('network down') })
      const client = buildClient(fetchImpl)
      try {
        await client.getModel('flux-1-dev')
        throw new Error('expected throw')
      } catch (error) {
        expect(isRunwareError(error)).toBe(true)
        // Maps to ErrorCode 'connection' — keep aligned with Python SDK so
        // cross-language callers can branch on the same code.
        expect((error as { code: string }).code).toBe('connection')
      }
    })
  })

  describe('createContentClient init guard', () => {
    it('throws if no fetch implementation is available', async () => {
      // Strip globalThis.fetch to simulate an environment without it (older
      // Node, custom workers, certain bundlers). The factory must fail fast
      // rather than at first call.
      const originalFetch = globalThis.fetch
      try {
        // @ts-expect-error — intentionally drop fetch for this test
        delete globalThis.fetch
        const config = { dependencies: {} } as unknown as SDKConfig
        try {
          createContentClient(config)
          throw new Error('expected throw')
        } catch (error) {
          expect(isRunwareError(error)).toBe(true)
        }
      } finally {
        globalThis.fetch = originalFetch
      }
    })
  })

  describe('getModelExamples', () => {
    it('hits /models/:id/examples', async () => {
      const { fetchImpl, calls } = createMockFetch({ body: [] })
      const client = buildClient(fetchImpl)
      await client.getModelExamples('flux-1-dev')
      expect(calls[0]?.url).toBe('https://content.runware.ai/models/flux-1-dev/examples')
    })

    it('forwards capability filter', async () => {
      const { fetchImpl, calls } = createMockFetch({ body: [] })
      const client = buildClient(fetchImpl)
      await client.getModelExamples('flux-1-dev', { capability: 'io:text-to-image' })
      const url = new URL(calls[0]?.url ?? '')
      expect(url.searchParams.get('capability')).toBe('io:text-to-image')
    })

    it('returns empty array on 404 instead of throwing', async () => {
      const { fetchImpl } = createMockFetch({ status: 404 })
      const client = buildClient(fetchImpl)
      const result = await client.getModelExamples('not-found')
      expect(result).toEqual([])
    })
  })

  describe('getModelGuides', () => {
    it('hits /models/:id/guides', async () => {
      const body = [{
        slug: 'g1', title: 'Guide', description: '...', url: 'https://x', 
      }]
      const { fetchImpl, calls } = createMockFetch({ body })
      const client = buildClient(fetchImpl)
      const result = await client.getModelGuides('flux-1-dev')
      expect(calls[0]?.url).toBe('https://content.runware.ai/models/flux-1-dev/guides')
      expect(result[0]?.slug).toBe('g1')
    })

    it('returns empty array on 404 instead of throwing', async () => {
      const { fetchImpl } = createMockFetch({ status: 404 })
      const client = buildClient(fetchImpl)
      const result = await client.getModelGuides('not-found')
      expect(result).toEqual([])
    })
  })

  describe('getModelPricing', () => {
    it('hits /models/:id/pricing', async () => {
      const { fetchImpl, calls } = createMockFetch({body: { air: 'runware:101@1', pricingOverview: '$0.0025/MP' }})
      const client = buildClient(fetchImpl)
      const result = await client.getModelPricing('flux-1-dev')
      expect(calls[0]?.url).toBe('https://content.runware.ai/models/flux-1-dev/pricing')
      expect(result?.pricingOverview).toBe('$0.0025/MP')
    })

    it('returns null on 404', async () => {
      const { fetchImpl } = createMockFetch({ status: 404 })
      const client = buildClient(fetchImpl)
      const result = await client.getModelPricing('no-pricing')
      expect(result).toBeNull()
    })
  })

  describe('listCollections', () => {
    it('forwards category filter', async () => {
      const { fetchImpl, calls } = createMockFetch({ body: [] })
      const client = buildClient(fetchImpl)
      await client.listCollections({ category: 'image' })
      const url = new URL(calls[0]?.url ?? '')
      expect(url.searchParams.get('category')).toBe('image')
    })
  })

  describe('getCollection', () => {
    it('hits /collections/:id and returns the body', async () => {
      const { fetchImpl, calls } = createMockFetch({body: { id: 'best-image', name: 'Best Image', models: [] }})
      const client = buildClient(fetchImpl)
      const result = await client.getCollection('best-image')
      expect(calls[0]?.url).toBe('https://content.runware.ai/collections/best-image')
      expect(result?.id).toBe('best-image')
    })

    it('returns null on 404', async () => {
      const { fetchImpl } = createMockFetch({ status: 404 })
      const client = buildClient(fetchImpl)
      const result = await client.getCollection('does-not-exist')
      expect(result).toBeNull()
    })
  })

  describe('listCapabilities', () => {
    it('returns array of capability objects', async () => {
      const { fetchImpl } = createMockFetch({body: [{ id: 'io:text-to-image', label: 'Text to Image' }]})
      const client = buildClient(fetchImpl)
      const result = await client.listCapabilities()
      expect(result).toHaveLength(1)
      expect(result[0]?.id).toBe('io:text-to-image')
    })
  })

  describe('listCreators', () => {
    it('returns array of creators with their models', async () => {
      const { fetchImpl, calls } = createMockFetch({body: [{ id: 'google', name: 'Google', models: [{ air: 'google:1@1', name: 'Veo' }] }]})
      const client = buildClient(fetchImpl)
      const result = await client.listCreators()
      expect(calls[0]?.url).toBe('https://content.runware.ai/creators')
      expect(result[0]?.id).toBe('google')
      expect(result[0]?.models).toHaveLength(1)
    })
  })

  describe('getCreator', () => {
    it('hits /creators/:id and returns the body', async () => {
      const { fetchImpl, calls } = createMockFetch({body: { id: 'google', name: 'Google', models: [] }})
      const client = buildClient(fetchImpl)
      const result = await client.getCreator('google')
      expect(calls[0]?.url).toBe('https://content.runware.ai/creators/google')
      expect(result?.id).toBe('google')
    })

    it('returns null on 404', async () => {
      const { fetchImpl } = createMockFetch({ status: 404 })
      const client = buildClient(fetchImpl)
      const result = await client.getCreator('mystery-co')
      expect(result).toBeNull()
    })
  })

  describe('special characters in filters', () => {
    it('URL-encodes capability ids that contain colons', async () => {
      const { fetchImpl, calls } = createMockFetch({ body: [] })
      const client = buildClient(fetchImpl)
      await client.listModels({ capability: 'io:text-to-image' })
      // %3A is the URL-encoded colon — the raw URL must include it.
      const raw = calls[0]?.url ?? ''
      expect(raw).toContain('capability=io%3Atext-to-image')
    })
  })
})
