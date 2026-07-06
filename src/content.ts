/**
 * Content namespace — public read-only metadata about Runware's curated model
 * catalog. Hits the content service directly (no API key required at the
 * service level, but the SDK config still supplies the fetch implementation
 * so consumers can route through proxies / mock for tests).
 *
 * For the inference surface (`run`, `stream`, etc.), use the top-level client
 * methods. This namespace is purely informational.
 */

import { CONTENT_BASE_URL } from './constants'
import { createRunwareError } from './errors'
import type { SDKConfig } from './types/sdk'
import type {
  ModelMetadata,
  CollectionWithModels,
  CreatorWithModels,
  Capability,
  ExampleMetadata,
  PricingModelListItem,
  GuideMetadata,
  PaginatedResponse,
  ListModelsOptions,
  ListCollectionsOptions,
  GetModelExamplesOptions,
} from './types/content'

export type ContentClient = {
  /**
   * List curated models from the Runware catalog. Returns an array by default
   * — pass `paginate: true` to get `{ total, limit, offset, items }`.
   *
   * Common filters: `capability` (e.g. `io:text-to-image`), `category`
   * (`image` | `video` | `audio` | `text` | `3d`), `creator` (creator id).
   */
  listModels: {
    (opts?: ListModelsOptions & { paginate?: false }): Promise<ModelMetadata[]>
    (opts: ListModelsOptions & { paginate: true }): Promise<PaginatedResponse<ModelMetadata>>
  }

  /** Single curated model by id. Returns `null` if not found or not public. */
  getModel: (modelId: string) => Promise<ModelMetadata | null>

  /** Example outputs for a curated model, optionally filtered by capability. */
  getModelExamples: (
    modelId: string,
    opts?: GetModelExamplesOptions,
  ) => Promise<ExampleMetadata[]>

  /** Pricing summary for a single curated model. Null if model has no pricing. */
  getModelPricing: (modelId: string) => Promise<PricingModelListItem | null>

  /** Written guides attached to a curated model. */
  getModelGuides: (modelId: string) => Promise<GuideMetadata[]>

  /**
   * List curated collections (Runware-defined model groupings). Each
   * collection's `models` field is resolved to full ModelMetadata objects.
   */
  listCollections: (opts?: ListCollectionsOptions) => Promise<CollectionWithModels[]>

  /** Single collection by id. Returns `null` if not found. */
  getCollection: (collectionId: string) => Promise<CollectionWithModels | null>

  /** All capability metadata (`io:*`, `op:*`, `form:*` taxonomies). */
  listCapabilities: () => Promise<Capability[]>

  /** All creators, each with their curated models inlined. */
  listCreators: () => Promise<CreatorWithModels[]>

  /** Single creator by id, with their curated models inlined. */
  getCreator: (creatorId: string) => Promise<CreatorWithModels | null>
}

type FetchImpl = typeof fetch

const buildQuery = (params: Record<string, unknown>): string => {
  const entries: string[] = []
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) { continue }
    entries.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
  }
  return entries.length ? `?${entries.join('&')}` : ''
}

const fetchJson = async <T>(
  url: string,
  fetchImpl: FetchImpl,
  treat404AsNull: boolean,
): Promise<T | null> => {
  let response: Response
  try {
    response = await fetchImpl(url)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    throw createRunwareError(
      // Maps to ErrorCode `'connection'`. Matches the Python SDK's code for
      // the same failure mode — keep them aligned so cross-language callers
      // can branch on the same `code` value.
      'connectionFailed',
      `Failed to reach content service: ${message}`,
    )
  }

  if (response.status === 404 && treat404AsNull) {
    return null
  }

  if (!response.ok) {
    throw createRunwareError(
      'httpError',
      `Content service responded ${response.status} for ${url}`,
    )
  }

  return await response.json() as T
}

// Models whose status marks them reachable only through the OpenAI-compatible
// endpoint — not the native Runware API — are hidden from the SDK's model listing
// by default, since the SDK can't run them. A caller can still surface them by
// passing the matching `status` filter explicitly.
const NON_NATIVE_STATUSES = new Set(['openai-compatible'])

const excludeNonNative = <T extends { status?: string }>(models: T[]): T[] =>
  models.filter((model) => !NON_NATIVE_STATUSES.has(model.status ?? ''))

export const createContentClient = (config: SDKConfig): ContentClient => {
  const fetchImpl: FetchImpl = config.dependencies?.fetch ?? globalThis.fetch

  if (!fetchImpl) {
    throw createRunwareError(
      'missingDependency',
      'No fetch implementation available. Provide config.dependencies.fetch.',
    )
  }

  const baseUrl = CONTENT_BASE_URL

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const listModels: any = async (opts: ListModelsOptions = {}) => {
    const query = buildQuery({
      capability: opts.capability,
      status: opts.status,
      category: opts.category,
      creator: opts.creator,
      q: opts.search,
      sort: opts.sort,
      order: opts.order,
      paginate: opts.paginate ? 'true' : undefined,
      limit: opts.limit,
      offset: opts.offset,
    })
    const url = `${baseUrl}/models${query}`
    type Result = ModelMetadata[] | PaginatedResponse<ModelMetadata>
    const result = await fetchJson<Result>(url, fetchImpl, false)

    // An explicit `status` filter is an intentional opt-in, so trust the service
    // result. Otherwise hide non-native (OpenAI-only) models from the listing.
    if (opts.status || result === null) { return result }

    return Array.isArray(result)
      ? excludeNonNative(result)
      : { ...result, items: excludeNonNative(result.items) }
  }

  const getModel = async (modelId: string): Promise<ModelMetadata | null> =>
    fetchJson<ModelMetadata>(`${baseUrl}/models/${encodeURIComponent(modelId)}`, fetchImpl, true)

  const getModelExamples = async (
    modelId: string,
    opts: GetModelExamplesOptions = {},
  ): Promise<ExampleMetadata[]> => {
    const query = buildQuery({ capability: opts.capability })
    const url = `${baseUrl}/models/${encodeURIComponent(modelId)}/examples${query}`
    return (await fetchJson<ExampleMetadata[]>(url, fetchImpl, true)) ?? []
  }

  const getModelPricing = async (modelId: string): Promise<PricingModelListItem | null> =>
    fetchJson<PricingModelListItem>(
      `${baseUrl}/models/${encodeURIComponent(modelId)}/pricing`,
      fetchImpl,
      true,
    )

  const getModelGuides = async (modelId: string): Promise<GuideMetadata[]> =>
    (await fetchJson<GuideMetadata[]>(
      `${baseUrl}/models/${encodeURIComponent(modelId)}/guides`,
      fetchImpl,
      true,
    )) ?? []

  const listCollections = async (opts: ListCollectionsOptions = {}) => {
    const query = buildQuery({ category: opts.category })
    const url = `${baseUrl}/collections${query}`
    return (await fetchJson<CollectionWithModels[]>(url, fetchImpl, false)) ?? []
  }

  const getCollection = async (collectionId: string): Promise<CollectionWithModels | null> =>
    fetchJson<CollectionWithModels>(
      `${baseUrl}/collections/${encodeURIComponent(collectionId)}`,
      fetchImpl,
      true,
    )

  const listCapabilities = async (): Promise<Capability[]> =>
    (await fetchJson<Capability[]>(`${baseUrl}/capabilities`, fetchImpl, false)) ?? []

  const listCreators = async (): Promise<CreatorWithModels[]> =>
    (await fetchJson<CreatorWithModels[]>(`${baseUrl}/creators`, fetchImpl, false)) ?? []

  const getCreator = async (creatorId: string): Promise<CreatorWithModels | null> =>
    fetchJson<CreatorWithModels>(
      `${baseUrl}/creators/${encodeURIComponent(creatorId)}`,
      fetchImpl,
      true,
    )

  return {
    listModels,
    getModel,
    getModelExamples,
    getModelPricing,
    getModelGuides,
    listCollections,
    getCollection,
    listCapabilities,
    listCreators,
    getCreator,
  }
}
