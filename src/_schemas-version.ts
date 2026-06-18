/**
 * Pinned schemas bundle version consumed by the type generator.
 *
 * Managed by `scripts/bump-schemas.sh` — run that to advance to the current
 * latest release. Don't edit by hand except when intentionally rolling back to
 * an older pin (historical reference, hotfix branch, debugging a regression).
 *
 * Read at build time only — runtime schema validation hits the live
 * `/resolve/<model>` endpoint and doesn't consult this constant.
 */
export const SCHEMAS_VERSION = '20260618151239'
