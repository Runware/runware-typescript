import {
  describe,
  it,
  expect,
  beforeAll,
} from 'bun:test'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const TASK_MAP_PATH = resolve(import.meta.dirname, '../src/types/task-map.ts')

describe('Generated task-map.ts', () => {
  let content: string

  beforeAll(async () => {
    content = await readFile(TASK_MAP_PATH, 'utf-8')
  })

  it('has the auto-generated header', () => {
    expect(content).toContain('AUTO-GENERATED from schema-map@')
  })

  it('exports SchemaMap type', () => {
    expect(content).toContain('export type SchemaMap')
  })

  it('exports UtilityMap type', () => {
    expect(content).toContain('export type UtilityMap')
  })

  it('exports the three runtime taskType maps (model/architecture/modality)', () => {
    expect(content).toContain('export const models')
    expect(content).toContain('export const architectureTaskTypes')
    expect(content).toContain('export const modalityTaskTypes')
    expect(content).toContain('export const operationTaskTypes')
  })

  it('has sdxl in SchemaMap', () => {
    expect(content).toMatch(/sdxl:\s*\{/)
  })

  it('has video in SchemaMap', () => {
    expect(content).toMatch(/video:\s*\{/)
  })

  it('has no duplicate type declarations', () => {
    const typeDeclarations = content.match(/^export type \w+/gm) ?? []
    const names = typeDeclarations.map((decl) => decl.replace('export type ', ''))
    const duplicates = names.filter((name, i) => names.indexOf(name) !== i)
    expect(duplicates, `Duplicate types found: ${duplicates.join(', ')}`).toEqual([])
  })

  it('has no "unknown | unknown" artifacts', () => {
    expect(content).not.toContain('unknown | unknown')
  })

  it('contains JSDoc comments for params', () => {
    // At least some properties should have JSDoc
    const jsdocCount = (content.match(/\/\*\*.*\*\//g) ?? []).length
    expect(jsdocCount).toBeGreaterThan(10)
  })

  it('has index signatures on inference types', () => {
    expect(content).toContain('[key: string]: unknown')
  })

  it('emits RunParams type', () => {
    expect(content).toContain('export type RunParams')
  })

  it('SchemaMap entries reference existing types', () => {
    // Extract all type references from SchemaMap
    const schemaMapMatch = content.match(/export type SchemaMap = \{([^}]+)\}/s)
    expect(schemaMapMatch).not.toBeNull()

    const entries = schemaMapMatch![1]
    const referencedTypes = [...entries.matchAll(/params: (\w+)/g)].map((match) => match[1])

    for (const typeName of referencedTypes) {
      expect(content, `Referenced type ${typeName} should exist`)
        .toContain(`export type ${typeName}`)
    }
  })
})

