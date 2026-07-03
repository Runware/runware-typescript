import { SDK_VERSION } from './_version'
import { SCHEMAS_VERSION } from './_schemas-version'

/**
 * Client identifier for outgoing requests, so Runware can attribute traffic to
 * the SDK, its version, the host runtime, and the schemas snapshot it was built
 * against.
 *
 * Base format: `runware-typescript/<version> (<runtime>) schemas/<schemas-version>`
 *   e.g. `runware-typescript/1.4.1 (node/22.3.0; darwin arm64) schemas/20260623192341`
 *
 * A `prefix` (from `config.userAgentPrefix`) is prepended so wrappers — MCP
 * servers, higher-level apps — identify themselves ahead of the SDK token:
 *   `runware-mcp/1.1.1 runware-typescript/1.4.1 (node/…) schemas/…`
 *
 * Only takes effect where the transport can set an HTTP header — the Node REST
 * calls and the Node WebSocket handshake (via the `ws` package). Browsers forbid
 * setting `User-Agent` on both `fetch` and `WebSocket`, so it is silently
 * dropped there — a known, accepted gap for browser usage.
 */
let base: string | undefined

const baseUserAgent = (): string => {
  if (base !== undefined) { return base }

  const runtime = (typeof process !== 'undefined' && process.versions?.node)
    ? `node/${process.versions.node}; ${process.platform} ${process.arch}`
    : 'browser'

  base = `runware-typescript/${SDK_VERSION} (${runtime}) schemas/${SCHEMAS_VERSION}`
  return base
}

export const userAgent = (prefix?: string): string =>
  (prefix ? `${prefix} ${baseUserAgent()}` : baseUserAgent())
