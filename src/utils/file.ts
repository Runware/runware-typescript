/**
 * Explicit helpers for sending a local file.
 *
 * The SDK never reads the filesystem on its own: a string you pass as a
 * parameter is sent as that string. When you want a file's contents on the
 * wire, you say so by calling one of these.
 */

const MIME_BY_EXTENSION: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
  mp4: 'video/mp4',
  webm: 'video/webm',
  mov: 'video/quicktime',
  mp3: 'audio/mpeg',
  wav: 'audio/wav',
  ogg: 'audio/ogg',
  glb: 'model/gltf-binary',
  pdf: 'application/pdf',
}

const isNode = (): boolean => (
  typeof process !== 'undefined'
  && typeof process.versions?.node === 'string'
)

const mimeFor = (path: string): string => {
  const extension = path.split('.').pop()?.toLowerCase() ?? ''
  return MIME_BY_EXTENSION[extension] ?? 'application/octet-stream'
}

const readBytes = async (source: string | Uint8Array): Promise<Uint8Array> => {
  if (typeof source !== 'string') { return source }
  if (!isNode()) {
    throw new Error('Reading a file by path needs Node; pass a File or Blob in the browser')
  }
  const fs = await import('node:fs/promises')
  return fs.readFile(source)
}

const blobToDataURI = async (blob: File | Blob): Promise<string> => {
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
    reader.readAsDataURL(blob)
  })
}

/**
 * Encode a file as raw base64, with no `data:` prefix and no MIME type. The
 * server reads the real format from the bytes.
 *
 * This is what a media parameter takes most directly:
 *   client.run({ seedImage: await fileToBase64('photo.jpg'), ... })
 */
export const fileToBase64 = async (source: string | Uint8Array | File | Blob): Promise<string> => {
  if (typeof source !== 'string' && !(source instanceof Uint8Array)) {
    const uri = await blobToDataURI(source)
    return uri.slice(uri.indexOf(',') + 1)
  }
  const bytes = await readBytes(source)
  return Buffer.from(bytes).toString('base64')
}

/**
 * Encode a file as a `data:<mime>;base64,...` URI.
 *
 * A path is read in Node, with the MIME taken from its extension. A File or
 * Blob carries its own type and works in the browser as well.
 */
export const fileToDataURI = async (source: string | Uint8Array | File | Blob): Promise<string> => {
  if (typeof source !== 'string' && !(source instanceof Uint8Array)) {
    return blobToDataURI(source)
  }
  const mime = typeof source === 'string' ? mimeFor(source) : 'application/octet-stream'
  const bytes = await readBytes(source)
  return `data:${mime};base64,${Buffer.from(bytes).toString('base64')}`
}
