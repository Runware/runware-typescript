/**
 * Types for the content namespace — metadata about curated models, creators,
 * collections, capabilities, and pricing. These mirror the public response
 * shapes from the content service.
 *
 * Convention: `creator`, `capabilities`, `architecture`, `basedOn` are ids
 * (strings). Resolve them client-side against the appropriate listing method.
 * The exception is `/collections` and `/creators`, whose `models` field is
 * resolved server-side to full ModelMetadata objects (one level only — the
 * inner models' own ids stay as strings).
 */

export type PricingExample = {
  configuration: string
  price: string
  competitorPrice?: string
}

export type ModelMetadata = {
  model: string
  air: string
  name: string
  creator: string
  capabilities: string[]
  architecture?: string
  hosted?: boolean
  status: string
  releasedAt: string
  weight: number
  headline: string
  description: string
  coverImage?: string
  ogImage?: string
  pricingOverview?: string
  pricingExamples?: PricingExample[]
  [extra: string]: unknown
}

export type ArchitectureMetadata = {
  id: string
  name: string
  status: string
  creator?: string
  capabilities?: string[]
  basedOn?: string
  releasedAt?: string
  headline?: string
  description?: string
  coverImage?: string
  ogImage?: string
  [extra: string]: unknown
}

export type Creator = {
  id: string
  name: string
  logo?: string
  headline?: string
  description?: string
  [extra: string]: unknown
}

export type Capability = {
  id: string
  label: string
}

export type CollectionMetadata = {
  id: string
  name: string
  order: number
  headline?: string
  description?: string
  icon?: string
  coverImage?: string
  category: string[]
  models: string[]
  [extra: string]: unknown
}

export type CollectionWithModels = Omit<CollectionMetadata, 'models'> & {
  models: ModelMetadata[]
}

export type CreatorWithModels = Creator & {
  models: ModelMetadata[]
}

export type ExampleMetadata = {
  id: string
  title?: string
  model: string
  capability: string
  asset?: string | null
  request: Record<string, unknown>
  response: Record<string, unknown>
}

export type PricingModelListItem = {
  model: string
  air: string
  name: string
  status: string
  coverImage: string
  releasedAt?: string
  pricingOverview?: string
  pricingExamples?: PricingExample[]
  category: string[]
}

export type GuideMetadata = {
  slug: string
  title: string
  description: string
  date?: string
  url: string
}

export type PaginatedResponse<T> = {
  total: number
  limit: number
  offset: number
  items: T[]
}

export type ListModelsOptions = {
  capability?: string
  status?: string
  category?: string
  creator?: string
  search?: string
  sort?: 'weight' | 'releasedAt' | 'name' | 'creator' | 'popularity' | 'newest' | 'alpha'
  order?: 'asc' | 'desc'
  paginate?: boolean
  limit?: number
  offset?: number
}

export type ListCollectionsOptions = {
  category?: string
}

export type GetModelExamplesOptions = {
  capability?: string
}
