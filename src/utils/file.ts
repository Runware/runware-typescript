/**
 * Converts a browser File or Blob to a data URI string.
 * Returns a string like `data:image/png;base64,iVBOR...`
 *
 * Works in browsers only (requires FileReader).
 *
 * Usage:
 *   const dataURI = await fileToDataURI(file)
 *   client.run({ seedImage: dataURI, ... })
 */
export const fileToDataURI = async (file: File | Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result)
      } else {
        reject(new Error('FileReader did not return a string'))
      }
    }
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

const MAX_PATH_LEN = 4096
const REMOTE_PREFIXES = ['http://', 'https://', 'data:']

const isNode = (): boolean => (
  typeof process !== 'undefined'
  && typeof process.versions?.node === 'string'
)

/**
 * Recursively walk a params object (objects, arrays, strings) and replace any
 * string that points to an existing local file with its raw base64 contents
 * (no `data:` prefix or MIME type — the server sniffs the real format from the
 * bytes).
 *
 * Node only. In the browser there's no filesystem, so this is a no-op: it
 * returns the value untouched and never imports `node:fs`. URLs, data URIs,
 * UUIDs, prompts, existing base64, numbers, and booleans always pass through —
 * only strings that resolve to a real file on disk are converted.
 */
export const encodeLocalFiles = async (value: unknown): Promise<unknown> => {
  if (!isNode()) { return value }
  const fs = await import('node:fs/promises')

  const encodeString = async (str: string): Promise<string> => {
    if (REMOTE_PREFIXES.some((p) => str.startsWith(p))) { return str }
    if (str.length > MAX_PATH_LEN) { return str }
    try {
      const stat = await fs.stat(str)
      if (!stat.isFile()) { return str }
    } catch {
      return str
    }
    const bytes = await fs.readFile(str)
    return bytes.toString('base64')
  }

  const walk = async (node: unknown): Promise<unknown> => {
    if (typeof node === 'string') { return encodeString(node) }
    if (Array.isArray(node)) { return Promise.all(node.map(walk)) }
    if (node !== null && typeof node === 'object') {
      const entries = await Promise.all(
        Object.entries(node).map(async ([k, v]) => [k, await walk(v)] as const),
      )
      return Object.fromEntries(entries)
    }
    return node
  }

  return walk(value)
}
