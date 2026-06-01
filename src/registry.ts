import type { Logger } from './logger'

export type ModelEntry = { taskType: string, id: string }

export type RegistryData = {
  version: string
  models: Record<string, ModelEntry>
  architectureTaskTypes: Record<string, string>
  modalityTaskTypes: Record<string, string>
}

export type Registry = {
  /** Look up the taskType for a model (AIR or slug). */
  getModelTaskType: (model: string) => Promise<string | null>
  /** Look up the canonical model ID for a model (used to build doc URLs). */
  getModelId: (model: string) => Promise<string | null>
  /**
   * Resolve a model identifier to its canonical AIR. Accepts either an AIR
   * (e.g. "runware:101@1") or a curated-model slug (e.g. "flux-1-dev").
   * Returns null if the identifier doesn't match any known curated model.
   */
  resolveModelAir: (model: string) => Promise<string | null>
  /** Look up the taskType for an architecture (e.g. 'sdxl', 'flux-1-dev'). */
  getArchitectureTaskType: (key: string) => Promise<string | null>
  /** Look up the taskType for a modality (e.g. 'image', 'video'). */
  getModalityTaskType: (key: string) => Promise<string | null>
  /**
   * Force a refresh from the remote endpoint. Throws if the fetch fails so
   * callers (e.g. day-zero workflows) can detect that the new data wasn't
   * actually loaded.
   */
  refresh: () => Promise<void>
  /**
   * Notify the registry that an external version was observed.
   * Triggers a background refresh if it differs from the cached version.
   */
  notifyVersion: (version: string) => void
  /** Currently cached registry version, if any. */
  getVersion: () => string | undefined
}

export type RegistryFallback = {
  models: Record<string, ModelEntry>
  architectureTaskTypes: Record<string, string>
  modalityTaskTypes: Record<string, string>
}

export type RegistryOptions = {
  url: string
  fetchImpl?: typeof fetch
  log: Logger
  fallback: RegistryFallback
  /** Background refresh interval in ms. Internal — not exposed via SDKConfig. */
  ttl?: number
  /** Max time to wait for the initial fetch before falling back. Default 3000ms. */
  initialFetchTimeout?: number
}

const DEFAULT_TTL = 300_000
const DEFAULT_INITIAL_FETCH_TIMEOUT = 3000

export const createRegistry = (options: RegistryOptions): Registry => {
  const fetchImpl = options.fetchImpl ?? globalThis.fetch
  const ttl = options.ttl ?? DEFAULT_TTL
  const initialFetchTimeout = options.initialFetchTimeout ?? DEFAULT_INITIAL_FETCH_TIMEOUT

  let cached: RegistryData | null = null
  let etag: string | undefined
  let lastFetchAt = 0
  let inFlightFetch: Promise<void> | null = null
  let initialFetchAttempted = false

  // Slug → AIR index, lazily built from cached + fallback. Used so callers
  // can pass either an AIR (e.g. "runware:101@1") or a slug (e.g. "flux-1-dev")
  // as the model identifier. Slugs only exist for curated models.
  let slugToAir: Map<string, string> | null = null
  let slugIndexSource: RegistryData | null = null

  const getSlugIndex = (): Map<string, string> => {
    if (slugToAir && slugIndexSource === cached) { return slugToAir }
    const index = new Map<string, string>()
    for (const [air, entry] of Object.entries(options.fallback.models)) {
      if (entry.id) { index.set(entry.id, air) }
    }
    if (cached) {
      for (const [air, entry] of Object.entries(cached.models)) {
        if (entry.id) { index.set(entry.id, air) }
      }
    }
    slugToAir = index
    slugIndexSource = cached
    return index
  }

  // Internal fetch: caller decides whether to propagate errors. Background
  // refreshes swallow them; explicit refresh() re-throws.
  const fetchRegistry = async (): Promise<void> => {
    if (!fetchImpl) { return }

    if (inFlightFetch) { return inFlightFetch }

    inFlightFetch = (async () => {
      try {
        const headers: Record<string, string> = {}
        if (etag) { headers['If-None-Match'] = etag }

        const response = await fetchImpl(options.url, { headers })

        if (response.status === 304) {
          options.log.info('Registry not modified (304)')
          lastFetchAt = Date.now()
          return
        }

        if (!response.ok) {
          throw new Error(`Registry fetch failed: HTTP ${response.status}`)
        }

        const data = await response.json() as RegistryData
        cached = data
        etag = response.headers.get('etag') ?? undefined
        lastFetchAt = Date.now()
        options.log.info(`Registry refreshed (version ${data.version})`)
      } finally {
        inFlightFetch = null
      }
    })()

    return inFlightFetch
  }

  // Fire-and-forget refresh for background TTL / notifyVersion paths
  const refreshSilently = (): void => {
    fetchRegistry().catch((error) => {
      options.log.warn('Background registry refresh failed', error)
    })
  }

  /**
   * Ensure the registry has been fetched at least once. After the initial
   * attempt (success or failure), subsequent calls return immediately and rely
   * on cached + fallback data. A background TTL refresh keeps it fresh.
   */
  const ensureInitialized = async (): Promise<void> => {
    if (initialFetchAttempted) { return }
    initialFetchAttempted = true

    // Race the fetch against a timeout so first-call latency stays bounded.
    // Errors in the initial fetch fall through to the bundled fallback.
    const fetchPromise = fetchRegistry().catch((error) => {
      options.log.warn('Initial registry fetch failed, using fallback', error)
    })
    let timeoutId: ReturnType<typeof setTimeout> | null = null
    const timeoutPromise = new Promise<void>((resolve) => {
      timeoutId = setTimeout(() => {
        options.log.warn(`Registry fetch timed out after ${initialFetchTimeout}ms, using fallback`)
        resolve()
      }, initialFetchTimeout)
    })

    await Promise.race([fetchPromise, timeoutPromise])
    if (timeoutId) { clearTimeout(timeoutId) }
  }

  const ensureFresh = async (): Promise<void> => {
    await ensureInitialized()
    if (!cached) { return }
    if (Date.now() - lastFetchAt < ttl) { return }
    // TTL elapsed — kick off background refresh, don't await or propagate errors
    refreshSilently()
  }

  const lookup = async (
    key: string,
    field: 'architectureTaskTypes' | 'modalityTaskTypes',
  ): Promise<string | null> => {
    await ensureFresh()
    if (cached?.[field][key]) { return cached[field][key] }
    if (options.fallback[field][key]) { return options.fallback[field][key] }
    return null
  }

  const resolveModelAir = async (input: string): Promise<string | null> => {
    await ensureFresh()
    // Already an AIR (canonical key in the models map)?
    if (cached?.models[input] || options.fallback.models[input]) { return input }
    // Slug? Convert to canonical AIR.
    return getSlugIndex().get(input) ?? null
  }

  const lookupModel = async (model: string): Promise<ModelEntry | null> => {
    const air = await resolveModelAir(model)
    if (!air) { return null }
    return cached?.models[air] ?? options.fallback.models[air] ?? null
  }

  const getModelTaskType = async (model: string): Promise<string | null> =>
    (await lookupModel(model))?.taskType ?? null

  const getModelId = async (model: string): Promise<string | null> =>
    (await lookupModel(model))?.id ?? null

  const getArchitectureTaskType = async (key: string): Promise<string | null> =>
    lookup(key, 'architectureTaskTypes')

  const getModalityTaskType = async (key: string): Promise<string | null> =>
    lookup(key, 'modalityTaskTypes')

  const refresh = async (): Promise<void> => {
    initialFetchAttempted = true
    await fetchRegistry()
  }

  const notifyVersion = (version: string): void => {
    if (cached?.version === version) { return }
    options.log.info(`Observed new registry version ${version}, refreshing`)
    refreshSilently()
  }

  const getVersion = (): string | undefined => cached?.version

  return {
    getModelTaskType,
    getModelId,
    resolveModelAir,
    getArchitectureTaskType,
    getModalityTaskType,
    refresh,
    notifyVersion,
    getVersion,
  }
}
