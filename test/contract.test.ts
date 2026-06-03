/**
 * Contract tests — load shared JSON fixtures from `repos/schemas/fixtures/`
 * and assert this SDK produces the same outputs as the Python SDK's runner
 * (`repos/python-sdk/tests/test_contract.py`).
 *
 * If a case passes here but fails there (or vice versa), the SDKs have
 * drifted and one of them needs to be fixed.
 *
 * When the schemas repo moves out-of-tree, switch the fixture source to a
 * versioned URL.
 */
import { describe, expect, it } from 'bun:test'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

import {buildDocumentationUrl, deriveCode, parseApiError} from '../src/errors'
import { models as bundledModels } from '../src/types/task-map'

const FIXTURES_DIR = join(__dirname, '..', '..', 'schemas', 'fixtures')
const HAS_FIXTURES = existsSync(FIXTURES_DIR)

const describeIf = HAS_FIXTURES ? describe : describe.skip

const loadFixture = (name: string) => JSON.parse(readFileSync(join(FIXTURES_DIR, name), 'utf-8'))


// ----------------------------------------------------------- derive_error_code

describeIf('contract: derive_error_code', () => {
  if (!HAS_FIXTURES) { return }
  const fixture = loadFixture('derive-error-codes.json')
  for (const c of fixture.cases) {
    it(`${c.raw_code} → ${c.expected_code}`, () => {
      const actual = deriveCode(c.raw_code)
      expect(actual).toBe(c.expected_code)
    })
  }
})


// ----------------------------------------------------------- build_documentation_url

describeIf('contract: build_documentation_url', () => {
  if (!HAS_FIXTURES) { return }
  const fixture = loadFixture('build-documentation-url.json')
  for (const c of fixture.cases) {
    it(c.name, () => {
      // The fixture inlines a `models` map per case. The TS function looks up
      // curated models in the bundled `models` table — swap it for the test.
      const originalEntries = new Map<string, unknown>()
      for (const air of Object.keys(bundledModels)) {
        originalEntries.set(air, (bundledModels as Record<string, unknown>)[air])
      }
      try {
        for (const air of Object.keys(bundledModels)) {
          delete (bundledModels as Record<string, unknown>)[air]
        }
        for (const [air, entry] of Object.entries(c.input.models ?? {})) {
          const typed = entry as { task_type: string, id: string }
          ;(bundledModels as Record<string, unknown>)[air] = {
            taskType: typed.task_type,
            id: typed.id,
          }
        }

        const actual = buildDocumentationUrl(
          c.input.task_type,
          c.input.model,
          c.input.parameter,
          c.input.raw_code,
        )
        // Normalize null vs undefined for cross-SDK comparison.
        const normalized = actual ?? null
        expect(normalized).toBe(c.expected)
      } finally {
        for (const air of Object.keys(bundledModels)) {
          delete (bundledModels as Record<string, unknown>)[air]
        }
        for (const [air, entry] of originalEntries) {
          ;(bundledModels as Record<string, unknown>)[air] = entry
        }
      }
    })
  }
})


// ----------------------------------------------------------- parse_api_error

describeIf('contract: parse_api_error', () => {
  if (!HAS_FIXTURES) { return }
  const fixture = loadFixture('parse-api-error.json')
  for (const c of fixture.cases) {
    it(c.name, () => {
      const err = parseApiError(c.input.raw)
      // Map snake_case fixture keys to camelCase TS field names.
      const map: Record<string, string> = {
        task_uuid: 'taskUUID',
        task_type: 'taskType',
        code: 'code',
        parameter: 'parameter',
        message: 'message',
      }
      for (const [snake, want] of Object.entries(c.expected)) {
        const tsKey = map[snake] ?? snake
        const actual = (err as unknown as Record<string, unknown>)[tsKey]
        expect(actual).toBe(want)
      }
    })
  }
})
