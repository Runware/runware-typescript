import { resolve } from 'node:path'

const ROOT = resolve(import.meta.dir, '..')
const pkg = await Bun.file(resolve(ROOT, 'package.json')).json()
const target = resolve(ROOT, 'src/_version.ts')

const content = `/**
 * SDK version, generated from package.json by scripts/sync-version.ts.
 *
 * Do not edit by hand — it is regenerated on \`build\`. Committed so source and
 * test runs work without a build; kept in sync with package.json at publish
 * time so the User-Agent never reports a stale version.
 */
export const SDK_VERSION = '${pkg.version}'
`

await Bun.write(target, content)
console.log(`Synced SDK_VERSION = ${pkg.version} → src/_version.ts`)
