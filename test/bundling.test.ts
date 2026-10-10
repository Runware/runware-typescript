import { describe, it, expect } from 'bun:test'
import { resolve } from 'node:path'

const ENTRY = resolve(import.meta.dirname, '../src/index.ts')

describe('bundling for non-Node platforms', () => {
  it('ships no Node built-in as a static import specifier', async () => {
    const result = await Bun.build({ entrypoints: [ENTRY], target: 'browser', format: 'esm' })
    expect(result.success).toBe(true)

    const output = await result.outputs[0].text()
    expect(output).not.toMatch(/(import\(\s*|from\s*)["']node:/)
  })
})
