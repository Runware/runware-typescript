// In your app: import { createClient } from '@runware/sdk'
import { createClient } from '../src/index'

const main = async () => {
  // REST transport — no connect()/disconnect() needed; each request is a
  // standalone HTTP call.
  const client = await createClient({
    apiKey: process.env.RUNWARE_API_KEY ?? 'your-api-key',
    transport: 'rest',
  })

  // Curated model AIR → the SDK auto-resolves the taskType and narrows
  // the result type. No generic needed.
  const images = await client.run({
    model: 'runware:400@1', // Flux 2 Dev
    positivePrompt: 'A beautiful sunset over the ocean',
    width: 1024,
    height: 1024,
    numberResults: 2,
  })

  for (const image of images) {
    console.log(image.imageURL)
  }
}

main().catch(console.error)
