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

// Serverless invocation needs a deployed app to call, which no account has by
// default, so these carry their own gate rather than riding on the API key.
// Point them at one with:
//
//   RUNWARE_SERVERLESS_BASE_URL=... RUNWARE_SERVERLESS_TEST_APP=... \
//   RUNWARE_SERVERLESS_TEST_ENDPOINT=echo bun run test:integration
const serverlessBaseUrl = process.env.RUNWARE_SERVERLESS_BASE_URL
const serverlessApp = process.env.RUNWARE_SERVERLESS_TEST_APP
const serverlessEndpoint = process.env.RUNWARE_SERVERLESS_TEST_ENDPOINT
const serverlessPayload = JSON.parse(process.env.RUNWARE_SERVERLESS_TEST_PAYLOAD ?? '{}') as Record<string, unknown>
const describeServerless = (apiKey && serverlessBaseUrl && serverlessApp && serverlessEndpoint)
  ? describe
  : describe.skip

const serverlessClient = async () => createClient({
  apiKey: apiKey!,
  transport: 'rest',
  serverlessBaseUrl: serverlessBaseUrl!,
})

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
    const client = await createClient({ apiKey: apiKey!, transport: 'websocket' })
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
    const client = await createClient({ apiKey: apiKey!, transport: 'websocket' })
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
    const client = await createClient({ apiKey: apiKey!, transport: 'rest' })
    const images = await client.run(IMAGE_PARAMS)
    expect(images).toHaveLength(1)
    expect(typeof (images[0] as any).imageURL).toBe('string')
  }, 120_000)

  it('numberResults=2 returns two images', async () => {
    const client = await createClient({ apiKey: apiKey!, transport: 'rest' })
    const images = await client.run({ ...IMAGE_PARAMS, numberResults: 2 })
    expect(images).toHaveLength(2)
    for (const img of images) {
      expect(typeof (img as any).imageURL).toBe('string')
    }
  }, 120_000)
})

describeIf('Integration: REST + deliveryMethod=sync', () => {
  it('returns the result in a single response, no polling', async () => {
    const client = await createClient({ apiKey: apiKey!, transport: 'rest' })
    const images = await client.run({ ...IMAGE_PARAMS, deliveryMethod: 'sync' } as any)
    expect(images).toHaveLength(1)
    expect(typeof (images[0] as any).imageURL).toBe('string')
  }, 120_000)
})

describeIf('Integration: WebSocket + deliveryMethod=sync', () => {
  it('receives the pushed result on the same subscription, no polling', async () => {
    const client = await createClient({ apiKey: apiKey!, transport: 'websocket' })
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
    const client = await createClient({ apiKey: apiKey!, transport: 'websocket' })
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
    const client = await createClient({ apiKey: apiKey!, transport: 'websocket' })
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

describeServerless('Integration: serverless invoke', () => {
  it('async delivery polls through to the finished task', async () => {
    const client = await serverlessClient()
    const task = await client.invoke({
      appId: serverlessApp!,
      endpointPath: serverlessEndpoint!,
      payload: serverlessPayload,
    })
    expect(task.status).toBe('completed')
    expect(task.appId).toBe(serverlessApp!)
    expect(task.endpointPath).toBe(serverlessEndpoint!)
  }, 300_000)

  it('sync delivery returns the finished task', async () => {
    const client = await serverlessClient()
    const task = await client.invoke(
      { appId: serverlessApp!, endpointPath: serverlessEndpoint!, payload: serverlessPayload },
      { deliveryMethod: 'sync' },
    )
    expect(task.status).toBe('completed')
  }, 300_000)

  it('wait:false hands back an accepted task getTask can pick up', async () => {
    const client = await serverlessClient()
    const accepted = await client.invoke(
      { appId: serverlessApp!, endpointPath: serverlessEndpoint!, payload: serverlessPayload },
      { wait: false },
    )
    expect(accepted.status).toBe('pending')

    let task = accepted
    for (let i = 0; i < 60; i++) {
      task = await client.getTask(serverlessApp!, accepted.id)
      if (task.status !== 'pending') { break }
      await new Promise((resolve) => { setTimeout(resolve, 2000) })
    }
    expect(task.status).toBe('completed')

    // The same id is answered with the task it already names, so the second
    // call must not start a second run.
    const again = await client.invoke({
      appId: serverlessApp!,
      endpointPath: serverlessEndpoint!,
      payload: serverlessPayload,
      taskId: accepted.id,
    })
    expect(again.id).toBe(accepted.id)
    expect(again.createdAt).toBe(task.createdAt)
  }, 300_000)

  it('an undeclared endpoint rejects before anything is queued', async () => {
    const client = await serverlessClient()
    try {
      await client.invoke({
        appId: serverlessApp!,
        endpointPath: 'does-not-exist',
        payload: {},
      })
      throw new Error('should have thrown')
    } catch (error) {
      if (!isRunwareError(error)) { throw error }
      expect(error.code).toBe('notFound')
      expect(error.statusCode).toBe(404)
      expect(error.parameter).toBe('endpointPath')
    }
  }, 120_000)
})
