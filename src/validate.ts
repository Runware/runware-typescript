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

// AJV is loaded via dynamic import (optional peer dep). Its type isn't
// statically known at this scope, so we leave the binding as `any`.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
        // Node ESM requires the `.js` extension on subpath imports. Without
        // it, `await import('ajv/dist/2019')` throws ERR_MODULE_NOT_FOUND
        // (Node helpfully suggests adding `.js`). Bundlers tolerate the
        // extensionless form, so this worked in dev but broke for npm
        // consumers running plain Node ESM.
        const ajvModule = 'ajv/dist/2019.js'
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
    return ajvInstance.compile(schema) as ValidateFunction
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
    const model = task.model as string | undefined
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
