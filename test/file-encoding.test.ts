/**
 * Coverage for auto-encoding local file paths to base64 when passed as inputs
 * to client.run(). A string value (recursively, including nested objects and
 * arrays) that points to an existing file on disk is read and replaced with its
 * raw base64 before the request is sent. URLs, data URIs, UUIDs, prompts, and
 * existing base64 pass through untouched. Node only.
 */

import {
  describe, it, expect, vi, afterEach,
} from 'bun:test'

import { mkdtempSync, writeFileSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'

import { createClient } from '../src/index'
import { encodeLocalFiles } from '../src/utils/file'

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

describe('encodeLocalFiles', () => {
  it('encodes an existing file to raw base64 (no data: prefix)', async () => {
    const path = makeFile('a.jpg', Buffer.from([0xff,
      0xd8,
      0xff,
      0xe0]))
    const out = await encodeLocalFiles(path)
    expect(out).toBe(Buffer.from([0xff,
      0xd8,
      0xff,
      0xe0]).toString('base64'))
    expect(out as string).not.toStartWith('data:')
  })

  it('leaves non-existent paths and URLs/UUIDs/data-URIs/prompts untouched', async () => {
    expect(await encodeLocalFiles('./not-a-real-file.jpg')).toBe('./not-a-real-file.jpg')
    expect(await encodeLocalFiles('https://x.com/a.jpg')).toBe('https://x.com/a.jpg')
    expect(await encodeLocalFiles('http://x.com/a.jpg')).toBe('http://x.com/a.jpg')
    expect(await encodeLocalFiles('data:image/png;base64,AAAA')).toBe('data:image/png;base64,AAAA')
    expect(await encodeLocalFiles('a paragraph describing a cat')).toBe('a paragraph describing a cat')
    expect(await encodeLocalFiles('9f3c-uuid-like-1234')).toBe('9f3c-uuid-like-1234')
  })

  it('recurses into nested objects and arrays', async () => {
    const a = makeFile('a.jpg', Buffer.from('AAA'))
    const b = makeFile('b.jpg', Buffer.from('BBB'))
    const out = await encodeLocalFiles({
      inputs: { image: a },
      referenceImages: [b, 'https://x.com/c.jpg'],
      positivePrompt: 'a cat',
      width: 1024,
      flag: true,
    }) as Record<string, any>

    expect(out.inputs.image).toBe(Buffer.from('AAA').toString('base64'))
    expect(out.referenceImages[0]).toBe(Buffer.from('BBB').toString('base64'))
    expect(out.referenceImages[1]).toBe('https://x.com/c.jpg')
    expect(out.positivePrompt).toBe('a cat')
    expect(out.width).toBe(1024)
    expect(out.flag).toBe(true)
  })
})

describe('client.run auto-encodes local file paths', () => {
  it('sends base64 for a local seedImage, passes a URL through', async () => {
    const path = makeFile('seed.jpg', Buffer.from('PNG seed bytes'))
    const responseBody = { data: [{ taskUUID: 'enc-1', imageURL: 'https://result.jpg' }] }
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => responseBody,
    })

    const client = await createClient({
      apiKey: 'test',
      transport: 'rest',
      dependencies: { fetch: mockFetch as any },
    })

    await client.run({
      taskType: 'imageInference',
      model: 'civitai:1@1',
      seedImage: path,
      referenceImages: ['https://x.com/keep.jpg'],
      positivePrompt: 'x',
      width: 512,
      height: 512,
      deliveryMethod: 'sync',
    } as any)

    const sentBody = JSON.parse((mockFetch.mock.calls[0]?.[1] as any).body)
    expect(sentBody[0].seedImage).toBe(Buffer.from('PNG seed bytes').toString('base64'))
    expect(sentBody[0].referenceImages).toEqual(['https://x.com/keep.jpg'])
    expect(sentBody[0].positivePrompt).toBe('x')
  })
})
