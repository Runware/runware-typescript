/**
 * Coverage for the rule that the SDK never reads the filesystem on its own.
 *
 * Until 1.7.0 every string in the params was checked against the filesystem and
 * replaced with the file's base64 if it happened to name one, which made any
 * caller that forwarded user text into `run()` read local files on request
 * A local file now travels only through `fileToBase64` or `fileToDataURI`,
 * which the caller has to reach for.
 *
 * The case that matters is the one that used to leak: a prompt that is exactly a
 * path to a real file has to arrive at the transport as that path.
 */

import {
  describe, it, expect, vi, afterEach,
} from 'bun:test'

import { mkdtempSync, writeFileSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'

import { createClient, fileToBase64, fileToDataURI } from '../src/index'

const tmpDirs: string[] = []

const makeFile = (name: string, bytes: Buffer): string => {
  const dir = mkdtempSync(join(tmpdir(), 'rw-file-enc-'))
  tmpDirs.push(dir)
  const path = join(dir, name)
  writeFileSync(path, bytes)
  return path
}

afterEach(() => {
  while (tmpDirs.length) { rmSync(tmpDirs.pop()!, { recursive: true, force: true }) }
})

const sentBodyFor = async (params: Record<string, unknown>): Promise<Record<string, unknown>> => {
  const mockFetch = vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => ({ data: [{ taskUUID: 'enc-1', imageURL: 'https://result.jpg' }] }),
  })
  const client = await createClient({
    apiKey: 'test',
    transport: 'rest',
    dependencies: { fetch: mockFetch as any },
  })
  await client.run(params as any)
  return JSON.parse((mockFetch.mock.calls[0]?.[1] as any).body)[0]
}

describe('the SDK does not read the filesystem on its own', () => {
  it('sends a prompt that is a real file path as that path', async () => {
    const path = makeFile('secrets.env', Buffer.from('API_KEY=leaked'))

    const sent = await sentBodyFor({
      taskType: 'imageInference',
      model: 'civitai:1@1',
      positivePrompt: path,
      width: 512,
      height: 512,
      deliveryMethod: 'sync',
    })

    expect(sent.positivePrompt).toBe(path)
    expect(JSON.stringify(sent)).not.toContain(Buffer.from('API_KEY=leaked').toString('base64'))
  })

  it('sends a media parameter that is a real file path as that path', async () => {
    const path = makeFile('seed.jpg', Buffer.from('PNG seed bytes'))

    const sent = await sentBodyFor({
      taskType: 'imageInference',
      model: 'civitai:1@1',
      seedImage: path,
      positivePrompt: 'x',
      width: 512,
      height: 512,
      deliveryMethod: 'sync',
    })

    expect(sent.seedImage).toBe(path)
  })

  it('leaves a nested path untouched', async () => {
    const path = makeFile('nested.txt', Buffer.from('nested bytes'))

    const sent = await sentBodyFor({
      taskType: 'imageInference',
      model: 'civitai:1@1',
      positivePrompt: 'x',
      referenceImages: [path],
      width: 512,
      height: 512,
      deliveryMethod: 'sync',
    })

    expect(sent.referenceImages).toEqual([path])
  })
})

describe('a local file travels only when the caller asks', () => {
  it('fileToBase64 reads a path in Node and gives the raw base64 the wire takes', async () => {
    const path = makeFile('seed.jpg', Buffer.from('PNG seed bytes'))

    expect(await fileToBase64(path)).toBe(Buffer.from('PNG seed bytes').toString('base64'))
  })

  it('fileToDataURI reads a path and takes the MIME from its extension', async () => {
    const path = makeFile('seed.jpg', Buffer.from('PNG seed bytes'))

    expect(await fileToDataURI(path))
      .toBe(`data:image/jpeg;base64,${Buffer.from('PNG seed bytes').toString('base64')}`)
  })

  it('falls back to octet-stream for an extension it does not know', async () => {
    const path = makeFile('weights.safetensors', Buffer.from('bytes'))

    expect(await fileToDataURI(path)).toStartWith('data:application/octet-stream;base64,')
  })

  it('encodes bytes the caller already holds', async () => {
    expect(await fileToBase64(new Uint8Array([1, 2, 3]))).toBe(Buffer.from([1, 2, 3]).toString('base64'))
  })

  it('reaches the transport when the caller encodes first', async () => {
    const path = makeFile('seed.jpg', Buffer.from('PNG seed bytes'))

    const sent = await sentBodyFor({
      taskType: 'imageInference',
      model: 'civitai:1@1',
      seedImage: await fileToBase64(path),
      positivePrompt: 'x',
      width: 512,
      height: 512,
      deliveryMethod: 'sync',
    })

    expect(sent.seedImage).toBe(Buffer.from('PNG seed bytes').toString('base64'))
  })
})
