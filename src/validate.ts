import type { SDKConfig, TaskPayload } from './types/sdk'

import { SCHEMAS_BASE_URL } from './constants'
import { createRunwareError } from './errors'

type ValidateFunction = {
  (data: unknown): boolean
  errors?: Array<{
    instancePath: string
    schemaPath: string
    keyword: string
    params: Record<string, unknown>
    message?: string
  }> | null
}

type ResolveResponse = {
  requestSchema: Record<string, unknown> | null
  responseSchema: Record<string, unknown> | null
  documentation?: string | null
}

let ajvInstance: any = null
let ajvLoadPromise: Promise<void> | null = null
// Holds the in-flight compile promise for each model. Storing the promise (not
// the resolved validator) lets concurrent first-hits for the same model share a
// single fetch + compile — without this, AJV throws "reference resolves to more
// than one schema" when the same `$id` gets registered into the shared instance
// twice.
const validatorCache = new Map<string, Promise<ValidateFunction | null>>()
// Per-model docs URL base, harvested from the same `/resolve` calls used for
// validation. Used by the error path to enrich `RunwareError.documentation`
// for non-curated models (where the bundled `models` map can't help).
const docsUrlCache = new Map<string, string | null>()

/**
 * Look up the cached documentation URL base for a model. Returns null if the
 * model hasn't been resolved via `/resolve` yet (i.e., `validate: true` never
 * ran for it). Callers should append a `#request-{parameter}` anchor.
 */
export const getDocsUrlForModel = (model: string): string | null =>
  docsUrlCache.get(model) ?? null

const loadAjv = async (): Promise<void> => {
  if (ajvInstance) { return }
  if (!ajvLoadPromise) {
    ajvLoadPromise = (async () => {
      try {
        const ajvModule = 'ajv/dist/2019'
        const ajvMod = await import(ajvModule)
        const Ajv = ajvMod.default
        ajvInstance = new Ajv({ allErrors: true, strict: false, validateFormats: false })
      } catch {
        ajvLoadPromise = null
        throw new Error('Validation requires "ajv". Install it: npm install ajv')
      }
    })()
  }
  await ajvLoadPromise
}

const fetchModelSchema = async (
  air: string,
  config: SDKConfig,
): Promise<Record<string, unknown> | null> => {
  const fetchImpl = config.dependencies?.fetch ?? globalThis.fetch
  if (!fetchImpl) { return null }

  const url = `${SCHEMAS_BASE_URL}/resolve/${encodeURIComponent(air)}`

  try {
    const response = await fetchImpl(url)
    if (response.status === 404) {
      return null
    }
    if (!response.ok) {
      config.log.warn(`Schema resolve failed for ${air}: HTTP ${response.status}`)
      return null
    }
    const data = await response.json() as ResolveResponse
    if (data.documentation) {
      docsUrlCache.set(air, data.documentation)
    }
    return data.requestSchema
  } catch (error) {
    config.log.warn(`Schema resolve error for ${air}`, error)
    return null
  }
}

/**
 * Drop `$id` from every non-root subschema. The `/resolve` payload comes fully
 * dereferenced — every `$ref` is already inlined — so inner `$id`s no longer
 * resolve any reference. They only cause harm: AJV registers each `$id` it
 * encounters into its shared instance, and an inlined sub-schema reused at two
 * call sites carries the same `$id` twice, triggering "reference resolves to
 * more than one schema" at compile time.
 */
const stripInnerIds = (schema: unknown): unknown => {
  const walk = (node: unknown, isRoot: boolean): unknown => {
    if (Array.isArray(node)) {
      return node.map((item) => walk(item, false))
    }
    if (node && typeof node === 'object') {
      const out: Record<string, unknown> = {}
      for (const [key, value] of Object.entries(node as Record<string, unknown>)) {
        if (key === '$id' && !isRoot) { continue }
        out[key] = walk(value, false)
      }
      return out
    }
    return node
  }
  return walk(schema, true)
}

const getValidator = async (
  model: string,
  config: SDKConfig,
): Promise<ValidateFunction | null> => {
  const cached = validatorCache.get(model)
  if (cached) { return cached }

  const promise = (async () => {
    await loadAjv()
    const schema = await fetchModelSchema(model, config)
    if (!schema) { return null }
    const sanitized = stripInnerIds(schema) as Record<string, unknown>
    return ajvInstance.compile(sanitized) as ValidateFunction
  })()

  validatorCache.set(model, promise)
  try {
    return await promise
  } catch (err) {
    validatorCache.delete(model)
    throw err
  }
}

export const validateTasks = async (
  tasks: TaskPayload[],
  config: SDKConfig,
): Promise<void> => {
  for (const task of tasks) {
    const model = (task as any).model
    if (!model) { continue }

    const validator = await getValidator(model, config)
    if (!validator) { continue }

    if (!validator(task)) {
      const errors = validator.errors ?? []
      const first = errors[0]
      const parameter = first?.instancePath
        ? first.instancePath.slice(1).replace(/\//g, '.')
        : undefined
      const summary = errors
        .map((e) => {
          const path = e.instancePath ? e.instancePath.slice(1).replace(/\//g, '.') : ''
          return path ? `${path} ${e.message ?? 'is invalid'}` : (e.message ?? 'is invalid')
        })
        .join('; ')

      throw createRunwareError(
        'validationFailed',
        `Validation failed for ${task.taskType}: ${summary}`,
        {
          taskType: task.taskType,
          taskUUID: task.taskUUID,
          parameter,
          model,
          validationErrors: errors,
        },
      )
    }
  }
}

/**
 * Clear the in-process validator cache. Useful when you know the server-side
 * schemas have changed and want subsequent validate calls to re-fetch fresh
 * schemas without restarting the process.
 */
export const clearValidatorCache = (): void => {
  validatorCache.clear()
  docsUrlCache.clear()
}
