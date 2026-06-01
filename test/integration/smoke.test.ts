/**
 * Integration smoke tests against the production Runware API.
 *
 * Gated on the RUNWARE_API_KEY env var. Skipped (not failed) when unset, so
 * default `bun test` runs stay hermetic. Run explicitly with:
 *
 *   RUNWARE_API_KEY=... bun run test:integration
 *
 * Keep this suite tight and use the cheapest/fastest models — these tests
 * cost real credits and depend on a live API.
 */
import {
  describe,
  it,
  expect,
} from 'bun:test'

import { createClient, isRunwareError } from '../../src/index'

const apiKey = process.env.RUNWARE_API_KEY
const describeIf = apiKey ? describe : describe.skip

const IMAGE_MODEL = 'runware:400@2' // Flux 2 Klein 9b — cheap and fast
const TEXT_MODEL = 'google:gemma@4-31b' // cheap and fast

const IMAGE_PARAMS = {
  model: IMAGE_MODEL,
  positivePrompt: 'A serene mountain lake',
  width: 1024,
  height: 1024,
} as const

const TEXT_PARAMS = {
  model: TEXT_MODEL,
  messages: [{ role: 'user', content: 'Reply with exactly: hello' }],
} as const

describeIf('Integration: WebSocket', () => {
  it('numberResults=1 returns one image', async () => {
    const client = await createClient({ apiKey: apiKey!, transportType: 'websocket' })
    await client.connect()
    try {
      const images = await client.run(IMAGE_PARAMS)
      expect(images).toHaveLength(1)
      expect(typeof (images[0] as any).imageURL).toBe('string')
    } finally {
      await client.disconnect()
    }
  }, 120_000)

  it('numberResults=2 returns two images', async () => {
    const client = await createClient({ apiKey: apiKey!, transportType: 'websocket' })
    await client.connect()
    try {
      const images = await client.run({ ...IMAGE_PARAMS, numberResults: 2 })
      expect(images).toHaveLength(2)
      for (const img of images) {
        expect(typeof (img as any).imageURL).toBe('string')
      }
    } finally {
      await client.disconnect()
    }
  }, 120_000)
})

describeIf('Integration: REST', () => {
  it('numberResults=1 returns one image', async () => {
    const client = await createClient({ apiKey: apiKey!, transportType: 'rest' })
    const images = await client.run(IMAGE_PARAMS)
    expect(images).toHaveLength(1)
    expect(typeof (images[0] as any).imageURL).toBe('string')
  }, 120_000)

  it('numberResults=2 returns two images', async () => {
    const client = await createClient({ apiKey: apiKey!, transportType: 'rest' })
    const images = await client.run({ ...IMAGE_PARAMS, numberResults: 2 })
    expect(images).toHaveLength(2)
    for (const img of images) {
      expect(typeof (img as any).imageURL).toBe('string')
    }
  }, 120_000)
})

describeIf('Integration: REST + deliveryMethod=sync', () => {
  it('returns the result in a single response, no polling', async () => {
    const client = await createClient({ apiKey: apiKey!, transportType: 'rest' })
    const images = await client.run({ ...IMAGE_PARAMS, deliveryMethod: 'sync' } as any)
    expect(images).toHaveLength(1)
    expect(typeof (images[0] as any).imageURL).toBe('string')
  }, 120_000)
})

describeIf('Integration: WebSocket + deliveryMethod=sync', () => {
  it('receives the pushed result on the same subscription, no polling', async () => {
    const client = await createClient({ apiKey: apiKey!, transportType: 'websocket' })
    await client.connect()
    try {
      const images = await client.run({ ...IMAGE_PARAMS, deliveryMethod: 'sync' } as any)
      expect(images).toHaveLength(1)
      expect(typeof (images[0] as any).imageURL).toBe('string')
    } finally {
      await client.disconnect()
    }
  }, 120_000)
})

describeIf('Integration: Stream', () => {
  it('numberResults=1 yields text chunks and a final result', async () => {
    const client = await createClient({ apiKey: apiKey! })
    const stream = await client.stream(TEXT_PARAMS)

    let streamed = ''
    for await (const chunk of stream.textStream) { streamed += chunk }
    expect(streamed.length).toBeGreaterThan(0)

    const result = await stream.result()
    expect(result.text).toBe(streamed)
    expect(result.finishReason).not.toBeNull()
  }, 120_000)

})

describeIf('Integration: utilities and errors', () => {
  it('modelSearch finds Civitai checkpoints', async () => {
    const client = await createClient({ apiKey: apiKey!, transportType: 'websocket' })
    await client.connect()
    try {
      const [response] = await client.modelSearch({
        search: 'realistic',
        category: 'checkpoint',
        limit: 3,
      })
      expect(response.results.length).toBeGreaterThan(0)
    } finally {
      await client.disconnect()
    }
  }, 60_000)

  it('invalid params throw a typed RunwareError', async () => {
    const client = await createClient({ apiKey: apiKey!, transportType: 'websocket' })
    await client.connect()
    try {
      await client.run({
        model: IMAGE_MODEL,
        positivePrompt: '',
        width: 1024,
        height: 1024,
      })
      throw new Error('expected validation error from server')
    } catch (err) {
      expect(isRunwareError(err)).toBe(true)
      if (!isRunwareError(err)) { return }
      expect(['validation', 'unknown']).toContain(err.code)
    } finally {
      await client.disconnect()
    }
  }, 60_000)
})
