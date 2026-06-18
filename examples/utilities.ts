// In your app: import { createClient } from '@runware/sdk'
import { createClient } from '../src/index'

const main = async () => {
  const client = await createClient({
    apiKey: process.env.RUNWARE_API_KEY ?? 'your-api-key',
    transport: 'websocket',
  })

  await client.connect()

  try {
    const [response] = await client.modelSearch({
      search: 'juggernaut XL',
      category: 'checkpoint',
      limit: 5,
    })

    console.log(`Found ${response.results.length} model(s):`)
    for (const model of response.results) {
      console.log(`  ${model.air} — ${model.name}`)
    }
  } finally {
    await client.disconnect()
  }
}

main().catch(console.error)
