// In your app: import { createClient } from '@runware/sdk'
import { createClient } from '../src/index'

const main = async () => {
  const client = await createClient({ apiKey: process.env.RUNWARE_API_KEY ?? 'your-api-key' })

  // Cancel the stream if it takes too long
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 30_000)

  try {
    const textStream = await client.stream(
      {
        model: 'google:gemma@4-31b',
        messages: [{ role: 'user', content: 'Write a 200-word short story about a lighthouse keeper.' }],
      },
      { signal: controller.signal },
    )

    for await (const chunk of textStream.textStream) {
      process.stdout.write(chunk)
    }

    const result = await textStream.result()
    console.log('\n\nFinish reason:', result.finishReason)
  } finally {
    clearTimeout(timer)
  }
}

main().catch(console.error)
