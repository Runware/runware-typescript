/**
 * Custom TypeScript type generator for Runware SDK.
 *
 * Reads JSON schemas from @runware/schemas (installed via npm)
 * and emits clean TypeScript interfaces — no intermediate type aliases.
 *
 * Usage: npx tsx scripts/generate-types.ts [schemas-path]
 * Default: node_modules/@runware/schemas/dist
 *
 * Output: src/types/task-map.ts
 */

import {
  readFile,
  readdir,
  writeFile,
  access,
} from 'node:fs/promises'
import { join, basename, resolve } from 'node:path'

const ROOT = resolve(import.meta.dirname, '..')
const DEFAULT_SCHEMAS_PATH = resolve(ROOT, 'node_modules/@runware/schemas/dist')

const readJson = async (path: string) => JSON.parse(await readFile(path, 'utf-8'))

const fileExists = async (path: string) => {
  try { await access(path); return true } catch { return false }
}

const toPascalCase = (s: string) =>
  s.replace(/^3d/, 'ThreeD')
    .replace(/-([a-z0-9])/g, (_, char) => char.toUpperCase())
    .replace(/^([a-z])/, (_, char) => char.toUpperCase())

const schemaToTs = (schema: any, depth = 0): string => {
  if (!schema || typeof schema !== 'object') { return 'unknown' }

  if (schema.const !== undefined) {
    return typeof schema.const === 'string' ? `'${schema.const}'` : String(schema.const)
  }

  if (schema.enum) {
    return schema.enum.map((value: any) => {
      return typeof value === 'string' ? `'${value}'` : String(value)
    }).join(' | ')
  }

  if (schema.oneOf || schema.anyOf) {
    const variants = (schema.oneOf ?? schema.anyOf) as any[]
    const types = [...new Set(variants.map((subSchema: any) => schemaToTs(subSchema, depth)))]
    return types.length === 1 ? types[0] : types.join(' | ')
  }

  if (schema.allOf && !schema.type) {
    const merged = mergeAllOf(schema.allOf)
    return schemaToTs(merged, depth)
  }

  const type = schema.type

  if (type === 'string') { return 'string' }
  if (type === 'number' || type === 'integer') { return 'number' }
  if (type === 'boolean') { return 'boolean' }
  if (type === 'null') { return 'null' }

  if (type === 'array') {
    if (schema.items) {
      const itemType = schemaToTs(schema.items, depth)
      return itemType.includes('|') ? `(${itemType})[]` : `${itemType}[]`
    }
    return 'unknown[]'
  }

  if (type === 'object' || schema.properties) {
    return objectToTs(schema, depth)
  }

  if (Array.isArray(type)) {
    return type.map((typeString: string) => {
      if (typeString === 'string') { return 'string' }
      if (typeString === 'number' || typeString === 'integer') { return 'number' }
      if (typeString === 'boolean') { return 'boolean' }
      if (typeString === 'null') { return 'null' }
      return 'unknown'
    }).join(' | ')
  }

  return 'unknown'
}

const objectToTs = (schema: any, depth: number): string => {
  const props = schema.properties
  if (!props || Object.keys(props).length === 0) {
    return 'Record<string, unknown>'
  }

  const required = new Set<string>(schema.required ?? [])
  const lines: string[] = []

  for (const [key, propSchema] of Object.entries(props) as [string, any][]) {
    if (propSchema.description) {
      lines.push(`/** ${propSchema.description} */`)
    }
    const optional = required.has(key) ? '' : '?'
    const tsType = schemaToTs(propSchema, depth + 1)
    lines.push(`${key}${optional}: ${tsType}`)
  }

  const inner = lines.map((line) => '  ' + line).join('\n')
  return `{\n${inner}\n}`
}

const mergeAllOf = (allOf: any[]): any => {
  const merged: any = { type: 'object', properties: {}, required: [] }
  for (const schema of allOf) {
    if (schema.properties) {
      Object.assign(merged.properties, schema.properties)
    }
    if (schema.required) {
      merged.required.push(...schema.required)
    }
  }
  return merged
}

const emitType = (
  name: string,
  schema: any,
  opts?: { stripTaskFields?: boolean, indexSignature?: boolean, description?: string },
): string => {
  const lines: string[] = []

  if (opts?.description || schema.title) {
    lines.push('/**')
    lines.push(` * ${opts?.description ?? schema.title}`)
    lines.push(' */')
  }

  const props = { ...(schema.properties ?? {}) }
  const required = [...(schema.required ?? [])]

  if (opts?.stripTaskFields !== false) {
    delete props.taskType
    delete props.taskUUID
    const idx1 = required.indexOf('taskType')
    if (idx1 !== -1) { required.splice(idx1, 1) }
    const idx2 = required.indexOf('taskUUID')
    if (idx2 !== -1) { required.splice(idx2, 1) }
  }

  const requiredSet = new Set(required)
  const propLines: string[] = []

  for (const [key, propSchema] of Object.entries(props) as [string, any][]) {
    if (propSchema.description) {
      propLines.push(`  /** ${propSchema.description} */`)
    }
    const optional = requiredSet.has(key) ? '' : '?'
    const tsType = schemaToTs(propSchema)
    propLines.push(`  ${key}${optional}: ${tsType}`)
  }

  if (opts?.indexSignature) {
    propLines.push('  [key: string]: unknown')
  }

  lines.push(`export type ${name} = {`)
  lines.push(propLines.join('\n'))
  lines.push('}')

  return lines.join('\n')
}

const main = async () => {
  const args = process.argv.slice(2).filter((arg) => !arg.startsWith('--'))
  const strict = process.argv.includes('--strict') || process.env.STRICT === '1'
  const warnings: string[] = []
  const warn = (message: string) => {
    warnings.push(message)
    console.warn(message)
  }

  const schemasPath = args[0] ?? DEFAULT_SCHEMAS_PATH
  const schemasDir = join(schemasPath, 'schemas')

  console.log(`Reading schemas from: ${schemasPath}${strict ? ' (strict mode)' : ''}`)

  const output: string[] = []

  type EntryKind = 'architecture' | 'modality' | 'processing'
  const archEntries: Array<{
    key: string, typeName: string, taskType: string, kind: EntryKind,
  }> = []
  const resultMap = new Map<string, string>()
  const utilEntries: Array<{ taskType: string, paramsType: string }> = []

  output.push(`/**
 * AUTO-GENERATED from @runware/schemas — do not edit manually.
 * Run: npx tsx scripts/generate-types.ts
 */
`)

  console.log('  architectures...')
  const archDir = join(schemasDir, 'requests', 'architectures')
  const archFiles = (await readdir(archDir)).filter((f) => f.endsWith('.json')).sort()

  for (const file of archFiles) {
    const key = basename(file, '.json')
    const schema = await readJson(join(archDir, file))
    const taskType = schema?.properties?.taskType?.const ?? 'imageInference'
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

  console.log('  inference requests...')
  const inferenceFiles: Record<string, string> = {
    image: 'requests/types/image.json',
    video: 'requests/types/video.json',
    audio: 'requests/types/audio.json',
    text: 'requests/types/text.json',
    '3d': 'requests/types/3d.json',
  }

  for (const [name, file] of Object.entries(inferenceFiles)) {
    const path = join(schemasDir, file)
    if (!(await fileExists(path))) { console.warn(`    skip ${file}`); continue }

    const schema = await readJson(path)
    const taskType = schema?.properties?.taskType?.const ?? name + 'Inference'
    const typeName = toPascalCase(name) + 'InferenceParams'

    output.push(emitType(typeName, schema, {
      stripTaskFields: true,
      indexSignature: true,
      description: `${toPascalCase(name)} inference params.`,
    }))
    output.push('')

    archEntries.push({
      key: name, typeName, taskType, kind: 'modality', 
    })
  }

  console.log('  processing requests...')
  const reqTypesDir = join(schemasDir, 'requests', 'types')
  const reqTypeFiles = (await readdir(reqTypesDir)).filter((f) => f.endsWith('.json')).sort()
  const skipReq = new Set([
    'image.json',
    'video.json',
    'audio.json',
    'text.json',
    '3d.json',
  ])
  const emittedProcessing = new Set<string>()

  for (const file of reqTypeFiles) {
    if (skipReq.has(file)) { continue }
    const schema = await readJson(join(reqTypesDir, file))
    const taskType = schema?.properties?.taskType?.const
    if (!taskType || emittedProcessing.has(taskType)) { continue }
    emittedProcessing.add(taskType)

    const typeName = toPascalCase(taskType) + 'Params'
    output.push(emitType(typeName, schema, {
      stripTaskFields: true,
      indexSignature: true,
    }))
    output.push('')

    const key = basename(file, '.json')
    archEntries.push({
      key, typeName, taskType, kind: 'processing',
    })
  }

  console.log('  utility requests...')
  const utilDir = join(schemasDir, 'requests', 'utilities')
  const utilFiles = (await readdir(utilDir)).filter((f) => f.endsWith('.json')).sort()
  const skipUtil = new Set(['authentication.json', 'ping.json'])

  for (const file of utilFiles) {
    if (skipUtil.has(file)) { continue }
    const schema = await readJson(join(utilDir, file))
    const taskType = schema?.properties?.taskType?.const
    if (!taskType) { continue }

    const typeName = toPascalCase(taskType) + 'Params'
    output.push(emitType(typeName, schema, { stripTaskFields: true }))
    output.push('')

    utilEntries.push({ taskType, paramsType: typeName })
  }

  console.log('  responses...')
  const schemaMapPath = join(schemasPath, 'schema-map.json')
  const schemaMap = await readJson(schemaMapPath) as {
    inference: Array<{ slug: string, air: string, requestSchema: any, responseSchema: any }>
    utilities: Array<{ slug: string, requestSchema: any, responseSchema: any }>
  }
  const generated = new Set<string>()

  // Inference response schemas
  for (const entry of schemaMap.inference) {
    if (!entry.responseSchema) { continue }
    const taskType = entry.responseSchema?.properties?.taskType?.const
    if (!taskType || generated.has(taskType)) { continue }
    if (['authentication', 'getResponse', 'ping'].includes(taskType)) { continue }

    generated.add(taskType)
    const typeName = toPascalCase(taskType) + 'Result'
    output.push(emitType(typeName, entry.responseSchema, { stripTaskFields: false }))
    output.push('')
    resultMap.set(taskType, typeName)
  }

  // Utility response schemas
  const skipUtil2 = new Set(['authentication', 'ping'])

  for (const entry of schemaMap.utilities) {
    if (!entry.responseSchema) { continue }
    const taskType = entry.responseSchema?.properties?.taskType?.const
    if (!taskType || generated.has(taskType)) { continue }
    if (skipUtil2.has(taskType)) { continue }

    generated.add(taskType)
    const typeName = toPascalCase(taskType) + 'Result'
    output.push(emitType(typeName, entry.responseSchema, { stripTaskFields: false }))
    output.push('')
    resultMap.set(taskType, typeName)
  }

  const errorPath = join(schemasDir, 'responses', 'errors', 'error.json')
  if (await fileExists(errorPath)) {
    const schema = await readJson(errorPath)
    output.push(emitType('ApiError', schema, { stripTaskFields: false }))
    output.push('')
  }

  console.log('  official models...')
  const modelTaskTypeEntries: Array<{ model: string, taskType: string, id: string }> = []

  const inferenceDir = join(schemasDir, 'requests', 'models')
  if (await fileExists(inferenceDir)) {
    const providers = (await readdir(inferenceDir)).sort()
    for (const provider of providers) {
      const providerDir = join(inferenceDir, provider)
      try {
        const files = (await readdir(providerDir))
          .filter((f) => f.endsWith('.json') && f !== 'index.json')
          .sort()
        for (const file of files) {
          const schema = await readJson(join(providerDir, file))
          const modelAir = schema?.properties?.model?.const
          const taskType = schema?.properties?.taskType?.const
          if (modelAir && taskType) {
            modelTaskTypeEntries.push({ model: modelAir, taskType, id: basename(file, '.json') })
          }
        }
      } catch { /* not a directory */ }
    }
  }

  console.log(`    ${modelTaskTypeEntries.length} official models found`)

  const schemaMapLines: string[] = []

  for (const { key, typeName, taskType } of archEntries) {
    const resultType = resultMap.get(taskType)
    if (!resultType) {
      warn(`  ⚠ No result type for architecture '${key}' (taskType: ${taskType})`)
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

  const architectureLines: string[] = []
  const modalityLines: string[] = []
  const processingLines: string[] = []
  const seenKeys = new Set<string>()

  for (const { key, taskType, kind } of archEntries) {
    if (seenKeys.has(key) || !schemaMapKeys.has(key)) { continue }
    seenKeys.add(key)
    const quotedKey = /^\d|[- ]/.test(key) ? `'${key}'` : key
    const line = `  ${quotedKey}: '${taskType}'`
    if (kind === 'modality') {
      modalityLines.push(line)
    } else if (kind === 'processing') {
      processingLines.push(line)
    } else {
      architectureLines.push(line)
    }
  }

  const modelLines: string[] = []
  const modelResultLines: string[] = []
  const seenModels = new Set<string>()
  const sortedModels = modelTaskTypeEntries.sort((a, b) => a.model.localeCompare(b.model))
  for (const { model, taskType, id } of sortedModels) {
    if (seenModels.has(model)) { continue }
    seenModels.add(model)
    modelLines.push(`  '${model}': { taskType: '${taskType}', id: '${id}' }`)

    const resultType = resultMap.get(taskType)
    if (resultType) {
      modelResultLines.push(`  '${model}': ${resultType}`)
    }
  }

  output.push(`
/**
 * Maps schema keys (architecture names, modalities) to their params and result types.
 * Used as the generic parameter for \`.run<'sdxl'>()\`, \`.run<'video'>()\`, etc.
 */
export type SchemaMap = {
${schemaMapLines.join('\n')}
}

export type SchemaKey = keyof SchemaMap

/**
 * Maps utility taskTypes to their params and result types.
 */
export type UtilityMap = {
${utilMapLines.join('\n')}
}

export type UtilityKey = keyof UtilityMap

/**
 * Maps architecture names (e.g. 'sdxl', 'flux-1-dev') to their API taskType.
 * Used by .run() when the SDK can identify a community fine-tune by its
 * architecture but not by its model AIR.
 */
export const architectureTaskTypes: Record<string, string> = {
${architectureLines.join(',\n')}
}

/**
 * Maps top-level modalities (image, video, audio, text, 3d) to their
 * API taskType. These are SDK convenience keys for loosely-typed inference
 * across a modality without committing to a specific architecture.
 */
export const modalityTaskTypes: Record<string, string> = {
${modalityLines.join(',\n')}
}

/**
 * Maps processing operation slugs (caption-image, upscale-image, etc.)
 * to their API taskType.
 */
export const processingTaskTypes: Record<string, string> = {
${processingLines.join(',\n')}
}

/**
 * Maps official model AIRs to their taskType and canonical model ID.
 * Used by .run() to auto-resolve taskType from params.model, and by the
 * error layer to build documentation URLs.
 * Unknown models (community/uploaded) default to 'imageInference'.
 */
export const models: Record<string, { taskType: string, id: string }> = {
${modelLines.join(',\n')}
}

/**
 * Maps official model AIRs to their result type.
 * Enables automatic return-type narrowing: client.run({ model: 'inworld:tts@2' })
 * returns AudioInferenceResult[] without needing an explicit generic.
 */
export type ModelResultMap = {
${modelResultLines.join('\n')}
}

export type ModelAIR = keyof ModelResultMap

/**
 * Loose params for untyped .run() calls — model + anything.
 */
export type RunParams = {
  model: string
  [key: string]: unknown
}
`)

  const outPath = join(ROOT, 'src', 'types', 'task-map.ts')
  await writeFile(outPath, output.join('\n'), 'utf-8')

  const lineCount = output.join('\n').split('\n').length
  console.log(`\n✅ ${outPath}`)
  console.log(`   ${archEntries.length} schema entries, ${utilEntries.length} utilities, ${lineCount} lines`)

  if (strict && warnings.length > 0) {
    console.error(`\n❌ strict mode: ${warnings.length} warning(s) — failing build`)
    process.exit(1)
  }
}

main().catch((e) => { console.error(e); process.exit(1) })
