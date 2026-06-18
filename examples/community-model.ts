// In your app: import { createClient } from '@runware/sdk'
import { createClient } from '../src/index'

const main = async () => {
  const client = await createClient({
    apiKey: process.env.RUNWARE_API_KEY ?? 'your-api-key',
    transport: 'websocket',
  })

  await client.connect()

  try {
    // Community / fine-tune models live outside the curated registry, so the
    // SDK can't auto-resolve the taskType from the model AIR. Pass `taskType`
    // explicitly. The architecture generic gives you typed params + result,
    // but it's TypeScript-only — erased at runtime.

    // (1) With generic — typed params + result against the architecture schema.
    const typed = await client.run<'sdxl'>({
      taskType: 'imageInference',
      model: 'civitai:133005@782002',
      positivePrompt: 'A beautiful sunset over the ocean',
      width: 1024,
      height: 1024,
    })
    console.log('Typed:', typed[0].imageURL)

    // (2) Loose — no generic. Result type is `Record<string, unknown>[]`.
    // Useful for dynamic requests where you don't know the architecture at
    // compile time.
    const loose = await client.run({
      taskType: 'imageInference',
      model: 'civitai:133005@782002',
      positivePrompt: 'A beautiful sunset over the ocean',
      width: 1024,
      height: 1024,
    })
    console.log('Loose:', loose[0])
  } finally {
    await client.disconnect()
  }
}

main().catch(console.error)
