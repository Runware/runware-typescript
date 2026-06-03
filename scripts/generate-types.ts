/**
 * TypeScript type generator for the Runware SDK.
 *
 * Reads `schema-map.json` from the schemas service — the same bundle the
 * Python generator consumes — and emits `src/types/task-map.ts`.
 *
 * Source resolution order:
 *   1. `RUNWARE_SCHEMA_MAP_PATH` env var (a path to a local JSON file)
 *   2. `https://schemas.runware.ai/releases/<version>/schema-map.json` over HTTPS
 *   3. A local checkout fallback (paired-repo dev setup)
 *
 * Bump the version pin in `src/_schemas-version.ts` to advance the snapshot.
 * Usage:
 *   bun run scripts/generate-types.ts [--strict]
 */

import { existsSync, readFileSync } from 'node:fs'
import { writeFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'

import { SCHEMAS_VERSION } from '../src/_schemas-version'

const ROOT = resolve(import.meta.dirname, '..')
const OUTPUT_PATH = join(ROOT, 'src', 'types', 'task-map.ts')
// Optional local checkout fallback for offline dev. Real usage hits REMOTE_URL.
const LOCAL_FALLBACK = resolve(ROOT, '..', 'schemas', 'dist-worker', 'schema-map.json')
const REMOTE_URL = `https://schemas.runware.ai/releases/${SCHEMAS_VERSION}/schema-map.json`

// Canonical fallbacks for bundles that pre-date the modalities/operations keys.
// Once every published bundle carries those keys, these can be removed.
const FALLBACK_MODALITY_TASK_TYPES: Record<string, string> = {
  image: 'imageInference',
  video: 'videoInference',
  audio: 'audioInference',
  text: 'textInference',
  '3d': '3dInference',
}
const FALLBACK_OPERATION_TASK_TYPES: Record<string, string> = {
  'caption-image': 'caption',
  'controlnet-preprocess': 'controlNetPreprocess',
  masking: 'imageMasking',
  'prompt-enhance': 'promptEnhance',
  'remove-background-image': 'removeBackground',
  training: 'training',
  'upscale-image': 'upscale',
  vectorize: 'vectorize',
}

type Json = Record<string, unknown>

type InferenceEntry = {
  slug: string
  air?: string
  requestSchema?: Json
  responseSchema?: Json | null
}

type UtilityEntry = {
  slug: string
  requestSchema?: Json
  responseSchema?: Json | null
}

type SchemaMap = {
  inference?: InferenceEntry[]
  architectures?: Record<string, Json>
  modalities?: Record<string, Json>
  operations?: Record<string, Json>
  utilities?: UtilityEntry[]
  errors?: Record<string, Json>
}

// --------------------------------------------------------------------- loaders

const loadFromUrl = async (url: string): Promise<SchemaMap> => {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} ${response.statusText}`)
  }
  return (await response.json()) as SchemaMap
}

const loadFromFile = (path: string): SchemaMap =>
  JSON.parse(readFileSync(path, 'utf-8')) as SchemaMap

const loadSchemaMap = async (): Promise<SchemaMap> => {
  const override = process.env.RUNWARE_SCHEMA_MAP_PATH
  if (override) {
    console.log(`Reading schema-map.json from ${override} (override).`)
    return loadFromFile(override)
  }

  try {
    console.log(`Fetching ${REMOTE_URL}`)
    return await loadFromUrl(REMOTE_URL)
  } catch (error) {
    console.warn(`Remote fetch failed (${(error as Error).message}). Falling back to local checkout.`)
  }

  if (existsSync(LOCAL_FALLBACK)) {
    console.log(`Reading ${LOCAL_FALLBACK} (local fallback).`)
    return loadFromFile(LOCAL_FALLBACK)
  }

  throw new Error(`Could not load schema-map. Tried ${REMOTE_URL} and ${LOCAL_FALLBACK}. `
    + 'Set RUNWARE_SCHEMA_MAP_PATH to a local schema-map.json.')
}

// ------------------------------------------------------- JSON schema → TS type

const toPascalCase = (s: string): string =>
  s.replace(/^3d/, 'ThreeD')
    .replace(/-([a-z0-9])/g, (_, ch) => ch.toUpperCase())
    .replace(/^([a-z])/, (_, ch) => ch.toUpperCase())

 
const schemaToTs = (schema: any): string => {
  if (!schema || typeof schema !== 'object') { return 'unknown' }

  if (schema.const !== undefined) {
    return typeof schema.const === 'string' ? `'${schema.const}'` : String(schema.const)
  }
  if (schema.enum) {
     
    const variants = [...new Set(schema.enum.map((v: any) =>
      typeof v === 'string' ? `'${v}'` : String(v)))]
    return variants.join(' | ')
  }
  if (schema.oneOf || schema.anyOf) {
     
    const variants = (schema.oneOf ?? schema.anyOf) as any[]
     
    const types = [...new Set(variants.map((sub: any) => schemaToTs(sub)))]
    return types.length === 1 ? types[0] : types.join(' | ')
  }
  if (schema.allOf && !schema.type) {
    return schemaToTs(mergeAllOf(schema.allOf))
  }

  const type = schema.type

  if (type === 'string') { return 'string' }
  if (type === 'number' || type === 'integer') { return 'number' }
  if (type === 'boolean') { return 'boolean' }
  if (type === 'null') { return 'null' }
  if (type === 'array') {
    if (schema.items) {
      const itemType = schemaToTs(schema.items)
      return itemType.includes('|') ? `(${itemType})[]` : `${itemType}[]`
    }
    return 'unknown[]'
  }
  if (type === 'object' || schema.properties) {
    return objectToTs(schema)
  }
  if (Array.isArray(type)) {
    return type.map((t: string) => {
      if (t === 'string') { return 'string' }
      if (t === 'number' || t === 'integer') { return 'number' }
      if (t === 'boolean') { return 'boolean' }
      if (t === 'null') { return 'null' }
      return 'unknown'
    }).join(' | ')
  }
  return 'unknown'
}

 
const objectToTs = (schema: any): string => {
  const props = schema.properties
  if (!props || Object.keys(props).length === 0) {
    return 'Record<string, unknown>'
  }
  const required = new Set<string>(schema.required ?? [])
  const lines: string[] = []
   
  for (const [key, sub] of Object.entries(props) as [string, any][]) {
    if (sub.description) { lines.push(`/** ${sub.description} */`) }
    const optional = required.has(key) ? '' : '?'
    lines.push(`${key}${optional}: ${schemaToTs(sub)}`)
  }
  return `{\n${lines.map((l) => '  ' + l).join('\n')}\n}`
}

 
const mergeAllOf = (allOf: any[]): any => {
   
  const merged: any = { type: 'object', properties: {}, required: [] }
  for (const sub of allOf) {
    if (sub.properties) { Object.assign(merged.properties, sub.properties) }
    if (sub.required) { merged.required.push(...sub.required) }
  }
  return merged
}

type EmitOpts = {
  stripTaskFields?: boolean
  indexSignature?: boolean
  description?: string
}

const emitType = (name: string, schema: Json | undefined, opts?: EmitOpts): string => {
  const lines: string[] = []

   
  const s: any = schema ?? {}
  if (opts?.description || s.title) {
    lines.push('/**')
    lines.push(` * ${opts?.description ?? s.title}`)
    lines.push(' */')
  }

  const props = { ...(s.properties ?? {}) }
  const required: string[] = [...(s.required ?? [])]

  if (opts?.stripTaskFields !== false) {
    delete props.taskType
    delete props.taskUUID
    for (const f of ['taskType', 'taskUUID']) {
      const idx = required.indexOf(f)
      if (idx !== -1) { required.splice(idx, 1) }
    }
  }

  const requiredSet = new Set(required)
  const propLines: string[] = []
   
  for (const [key, sub] of Object.entries(props) as [string, any][]) {
    if (sub.description) { propLines.push(`  /** ${sub.description} */`) }
    const optional = requiredSet.has(key) ? '' : '?'
    propLines.push(`  ${key}${optional}: ${schemaToTs(sub)}`)
  }
  if (opts?.indexSignature) { propLines.push('  [key: string]: unknown') }

  lines.push(`export type ${name} = {`)
  lines.push(propLines.join('\n'))
  lines.push('}')
  return lines.join('\n')
}

 
const extractTaskType = (schema: any): string | undefined => {
  const tt = schema?.properties?.taskType?.const
  return typeof tt === 'string' ? tt : undefined
}

// ----------------------------------------------------------------- main driver

const main = async () => {
  const strict = process.argv.includes('--strict') || process.env.STRICT === '1'
  const warnings: string[] = []
  const warn = (message: string) => {
    warnings.push(message)
    console.warn(message)
  }

  const schemaMap = await loadSchemaMap()

  type EntryKind = 'architecture' | 'modality' | 'operation'
  type ArchEntry = { key: string, typeName: string, taskType: string, kind: EntryKind }
  const archEntries: ArchEntry[] = []
  const resultMap = new Map<string, string>()
  const utilEntries: Array<{ taskType: string, paramsType: string }> = []

  const output: string[] = []
  output.push(`/**
 * AUTO-GENERATED from schema-map@${SCHEMAS_VERSION} — do not edit manually.
 * Run: bun run scripts/generate-types.ts
 */
`)

  // ----- architectures -----
  const sortedArchitectures = Object.entries(schemaMap.architectures ?? {})
    .sort(([a], [b]) => a.localeCompare(b))
  for (const [key, schema] of sortedArchitectures) {
    const taskType = extractTaskType(schema) ?? 'imageInference'
    const typeName = toPascalCase(key) + 'Params'
    output.push(emitType(typeName, schema, {
      stripTaskFields: true,
      indexSignature: true,
      description: `${key} architecture params.`,
    }))
    output.push('')
    archEntries.push({
      key, typeName, taskType, kind: 'architecture', 
    })
  }

  // ----- modalities -----
  const modalities = schemaMap.modalities ?? {}
  if (Object.keys(modalities).length === 0) {
    warn('schema-map.json carries no `modalities` key — emitting fallback mappings only, no per-modality Params interfaces.')
  }
  for (const [key, schema] of Object.entries(modalities).sort(([a], [b]) => a.localeCompare(b))) {
    const taskType = extractTaskType(schema) ?? FALLBACK_MODALITY_TASK_TYPES[key] ?? key + 'Inference'
    const typeName = toPascalCase(taskType) + 'Params'
    output.push(emitType(typeName, schema, {
      stripTaskFields: true,
      indexSignature: true,
      description: `${toPascalCase(key)} inference params.`,
    }))
    output.push('')
    archEntries.push({
      key, typeName, taskType, kind: 'modality', 
    })
  }

  // ----- operations -----
  const operations = schemaMap.operations ?? {}
  if (Object.keys(operations).length === 0) {
    warn('schema-map.json carries no `operations` key — emitting fallback mappings only, no per-operation Params interfaces.')
  }
  const emittedOpTypeNames = new Set<string>()
  for (const [key, schema] of Object.entries(operations).sort(([a], [b]) => a.localeCompare(b))) {
    const taskType = extractTaskType(schema) ?? FALLBACK_OPERATION_TASK_TYPES[key]
    if (!taskType) {
      warn(`  ⚠ operation '${key}' has no taskType and no fallback`)
      continue
    }
    const typeName = toPascalCase(key) + 'Params'
    if (emittedOpTypeNames.has(typeName)) { continue }
    emittedOpTypeNames.add(typeName)

    output.push(emitType(typeName, schema, {
      stripTaskFields: true,
      indexSignature: true,
      description: `${key} operation params.`,
    }))
    output.push('')
    archEntries.push({
      key, typeName, taskType, kind: 'operation', 
    })
  }

  // ----- utilities -----
  const skipUtils = new Set(['authentication', 'ping'])
  const sortedUtilities = (schemaMap.utilities ?? []).slice()
    .sort((a, b) => a.slug.localeCompare(b.slug))
  for (const entry of sortedUtilities) {
    const taskType = extractTaskType(entry.requestSchema)
    if (!taskType || skipUtils.has(taskType)) { continue }
    const typeName = toPascalCase(taskType) + 'Params'
    output.push(emitType(typeName, entry.requestSchema, { stripTaskFields: true }))
    output.push('')
    utilEntries.push({ taskType, paramsType: typeName })
  }

  // ----- responses (inference + utilities) -----
  // Inference responses skip getResponse too — it's not emitted as a result of
  // inference. Utility responses keep it; the `getResponse` utility carries
  // the canonical result-shape schema we use across all inference responses.
  const seenResult = new Set<string>()
  const skipInferenceResp = new Set(['authentication', 'getResponse', 'ping'])
  const skipUtilityResp = new Set(['authentication', 'ping'])

  for (const entry of schemaMap.inference ?? []) {
    if (!entry.responseSchema) { continue }
    const taskType = extractTaskType(entry.responseSchema)
    if (!taskType || seenResult.has(taskType) || skipInferenceResp.has(taskType)) { continue }
    seenResult.add(taskType)
    const typeName = toPascalCase(taskType) + 'Result'
    output.push(emitType(typeName, entry.responseSchema, { stripTaskFields: false }))
    output.push('')
    resultMap.set(taskType, typeName)
  }
  for (const entry of schemaMap.utilities ?? []) {
    if (!entry.responseSchema) { continue }
    const taskType = extractTaskType(entry.responseSchema)
    if (!taskType || seenResult.has(taskType) || skipUtilityResp.has(taskType)) { continue }
    seenResult.add(taskType)
    const typeName = toPascalCase(taskType) + 'Result'
    output.push(emitType(typeName, entry.responseSchema, { stripTaskFields: false }))
    output.push('')
    resultMap.set(taskType, typeName)
  }

  // ----- error type -----
  const errorSchema = schemaMap.errors?.['error.json']
    ?? Object.values(schemaMap.errors ?? {})[0]
  if (errorSchema) {
    output.push(emitType('ApiError', errorSchema, { stripTaskFields: false }))
    output.push('')
  }

  // ----- curated models -----
  const modelEntries: Array<{ model: string, taskType: string, id: string }> = []
  for (const entry of schemaMap.inference ?? []) {
    if (!entry.air || !entry.requestSchema) { continue }
    const taskType = extractTaskType(entry.requestSchema)
    if (!taskType) { continue }
    modelEntries.push({ model: entry.air, taskType, id: entry.slug })
  }

  // ----- SchemaMap + UtilityMap -----
  const schemaMapLines: string[] = []
  for (const { key, typeName, taskType } of archEntries) {
    const resultType = resultMap.get(taskType)
    if (!resultType) {
      warn(`  ⚠ No result type for '${key}' (taskType: ${taskType})`)
      continue
    }
    const quotedKey = /^\d|[- ]/.test(key) ? `'${key}'` : key
    schemaMapLines.push(`  ${quotedKey}: { params: ${typeName}, result: ${resultType} }`)
  }

  const utilMapLines: string[] = []
  for (const { taskType, paramsType } of utilEntries) {
    const resultType = resultMap.get(taskType)
    if (!resultType) {
      warn(`  ⚠ No result type for utility '${taskType}'`)
      continue
    }
    utilMapLines.push(`  ${taskType}: { params: ${paramsType}, result: ${resultType} }`)
  }

  const schemaMapKeys = new Set(schemaMapLines.map((l) => l.trim().split(':')[0].replace(/'/g, '')))

  // ----- taskType maps -----
  const architectureLines: string[] = []
  const modalityLines: string[] = []
  const operationLines: string[] = []
  const seenKeys = new Set<string>()
  for (const { key, taskType, kind } of archEntries) {
    if (seenKeys.has(key) || !schemaMapKeys.has(key)) { continue }
    seenKeys.add(key)
    const quotedKey = /^\d|[- ]/.test(key) ? `'${key}'` : key
    const line = `  ${quotedKey}: '${taskType}'`
    if (kind === 'modality') { modalityLines.push(line) }
    else if (kind === 'operation') { operationLines.push(line) }
    else { architectureLines.push(line) }
  }

  // Fall back to the canonical maps when the bundle is pre-keyed.
  if (modalityLines.length === 0) {
    for (const [k, v] of Object.entries(FALLBACK_MODALITY_TASK_TYPES)) {
      const quotedKey = /^\d|[- ]/.test(k) ? `'${k}'` : k
      modalityLines.push(`  ${quotedKey}: '${v}'`)
    }
  }
  if (operationLines.length === 0) {
    for (const [k, v] of Object.entries(FALLBACK_OPERATION_TASK_TYPES)) {
      const quotedKey = /^\d|[- ]/.test(k) ? `'${k}'` : k
      operationLines.push(`  ${quotedKey}: '${v}'`)
    }
  }

  // ----- models + ModelResultMap -----
  const modelLines: string[] = []
  const modelResultLines: string[] = []
  const seenModels = new Set<string>()
  const sortedModels = modelEntries.sort((a, b) => a.model.localeCompare(b.model))
  for (const { model, taskType, id } of sortedModels) {
    if (seenModels.has(model)) { continue }
    seenModels.add(model)
    modelLines.push(`  '${model}': { taskType: '${taskType}', id: '${id}' }`)
    const resultType = resultMap.get(taskType)
    if (resultType) { modelResultLines.push(`  '${model}': ${resultType}`) }
  }

  output.push(`
/**
 * Maps schema keys (architecture names, modalities, operations) to their
 * params and result types. Used by \`.run<'sdxl'>()\`, \`.run<'image'>()\`,
 * \`.run<'upscale-image'>()\`, etc.
 */
export type SchemaMap = {
${schemaMapLines.join('\n')}
}

export type SchemaKey = keyof SchemaMap

/** Utility taskTypes → their params and result types. */
export type UtilityMap = {
${utilMapLines.join('\n')}
}

export type UtilityKey = keyof UtilityMap

/**
 * Architecture-slug → API taskType. Used by \`.run()\` when the SDK can identify
 * a community fine-tune by its architecture but not by its model AIR.
 */
export const architectureTaskTypes: Record<string, string> = {
${architectureLines.join(',\n')}
}

/**
 * Top-level modalities (image, video, audio, text, 3d) → API taskType.
 * Loose convenience keys for inference across a modality without committing
 * to a specific architecture.
 */
export const modalityTaskTypes: Record<string, string> = {
${modalityLines.join(',\n')}
}

/**
 * Operation slugs (caption-image, upscale-video, remove-background, etc.) →
 * API taskType. Operations are tasks performed on existing media.
 */
export const operationTaskTypes: Record<string, string> = {
${operationLines.join(',\n')}
}

/**
 * Curated model AIRs → taskType + canonical model ID. Used by \`.run()\` to
 * auto-resolve taskType from \`params.model\`, and by the error layer to build
 * documentation URLs.
 */
export const models: Record<string, { taskType: string, id: string }> = {
${modelLines.join(',\n')}
}

/**
 * Curated model AIRs → result type. Enables automatic return-type narrowing:
 * \`client.run({ model: 'inworld:tts@2' })\` returns \`AudioInferenceResult[]\`
 * without an explicit generic.
 */
export type ModelResultMap = {
${modelResultLines.join('\n')}
}

export type ModelAIR = keyof ModelResultMap

/** Loose params for untyped \`.run()\` calls — model + anything. */
export type RunParams = {
  model: string
  [key: string]: unknown
}
`)

  await writeFile(OUTPUT_PATH, output.join('\n'), 'utf-8')

  const lineCount = output.join('\n').split('\n').length
  console.log(`\n✅ ${OUTPUT_PATH}`)
  console.log(`   ${archEntries.length} schema entries, ${utilEntries.length} utilities, ${lineCount} lines`)

  if (strict && warnings.length > 0) {
    console.error(`\n❌ strict mode: ${warnings.length} warning(s) — failing build`)
    process.exit(1)
  }
}

main().catch((e) => { console.error(e); process.exit(1) })
