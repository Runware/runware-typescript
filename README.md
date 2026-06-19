# Runware SDK

The official Runware SDK for TypeScript and JavaScript. A unified API for image, video, audio, text, and 3D generation — powered by the [Runware inference platform](https://runware.ai).

[Documentation](https://runware.ai/docs) · [npm](https://www.npmjs.com/package/@runware/sdk) · [Report a bug](https://github.com/runware/runware-typescript/issues)

- **One method for everything** — `.run()` handles every model type
- **Schema-driven types** — generated from Runware's canonical JSON schemas, always accurate
- **WebSocket and REST transports** — persistent connections or stateless HTTP
- **LLM streaming via SSE** — token-by-token text generation with `.stream()`
- **Automatic model resolution** — the SDK resolves task types from AIR identifiers
- **Node.js 18+ and browsers** — works everywhere, no polyfills needed

## Installation

```bash
npm install @runware/sdk
```

## Quick Start

Generate an image in five lines:

```typescript
import { createClient } from '@runware/sdk'

const client = await createClient({ apiKey: process.env.RUNWARE_API_KEY ?? 'your-api-key' })
await client.connect() // required for the default WebSocket transport — skip for REST

const images = await client.run({
  model: 'runware:400@1',
  positivePrompt: 'A serene mountain landscape at sunset',
  width: 1024,
  height: 1024,
})

console.log('Image URL:', images[0].imageURL)
```

The SDK automatically resolves `runware:400@1` to the correct task type and generates fully typed responses.

More runnable patterns in [`examples/`](./examples/) — curated models, community fine-tunes, streaming with abort, and the modelSearch → run flow.

## Core Concepts

### One method for everything

Every inference task goes through `.run()`. The SDK determines the task type from the model's AIR identifier:

```typescript
// Image generation
const images = await client.run({
  model: 'runware:400@1',
  positivePrompt: 'Abstract digital art',
  width: 1024,
  height: 1024,
})

// Video generation
const videos = await client.run({
  model: 'google:3@3',
  positivePrompt: 'Ocean waves at sunset',
  width: 1280,
  height: 720,
  duration: 8,
})

// Text inference (LLM)
const responses = await client.run({
  model: 'google:gemma@4-31b',
  messages: [{ role: 'user', content: 'Explain quantum computing' }],
})

// Audio generation (designs a voice from the prompt, then speaks the text)
const audio = await client.run({
  model: 'alibaba:qwen@3-tts-1.7b-voicedesign',
  positivePrompt: 'A calm, friendly young woman with a soft tone',
  speech: { text: 'Hello world', voice: 'design' },
})
```

### Architecture generics for typed params

When you know the model architecture, use a schema generic to get full type safety:

```typescript
const images = await client.run<'sdxl'>({
  model: 'civitai:133005@782002',
  positivePrompt: 'A professional headshot portrait',
  negativePrompt: 'blurry, distorted',
  width: 1024,
  height: 1024,
  steps: 30,
  scheduler: 'DPMSolverMultistep',
  // ^ TypeScript knows every valid param for SDXL
})

// images[0].imageURL — fully typed
```

The SDK ships generics for:

- **Modalities** — `image`, `video`, `audio`, `text`, `3d`
- **Image architectures** — `sdxl`, `sdxl-lcm`, `sdxl-turbo`, `sdxl-hyper`, `sdxl-lightning`, `sdxl-distilled`, `sd-1-5`, `sd-1-5-lcm`, `sd-1-5-hyper`, `sd-1-5-distilled`, `sd-2-1`, `sd3`, `flux-1-dev`, `flux-1-schnell`, `flux-1-kontext-dev`, `pony`, `illustrious`, `noobai`, `z-image`, `z-image-turbo`, `exactly-illustrative`
- **Operations** — `caption`, `caption-image`, `caption-video`, `upscale`, `upscale-image`, `upscale-video`, `remove-background`, `remove-background-image`, `remove-background-video`, `masking`, `controlnet-preprocess`, `prompt-enhance`, `vectorize`, `training`

To discover the full list in your IDE, hover the alias:

```typescript
import type { SchemaKey } from '@runware/sdk'
type AllGenerics = SchemaKey
//   ^? hover to see the union of every valid generic
```

### Community and trained models

For models not built into the SDK (community uploads, fine-tuned models, etc.), the SDK can't resolve the task type automatically. Pass `taskType` explicitly and use the architecture generic for typed params:

```typescript
const images = await client.run<'exactly-illustrative'>({
  model: 'runware:exactly-illustrative@my-trained-style',
  taskType: 'imageInference',
  positivePrompt: 'A lighthouse on a rocky cliff at twilight',
  width: 1024,
  height: 1024,
})
```

- `<'exactly-illustrative'>` — TypeScript types (compile-time only, erased at runtime)
- `taskType` — tells the SDK which API endpoint to use
- Validation (when enabled) automatically picks the right schema for the AIR — no extra option needed

### Curated-model slugs

The registry indexes every curated model under both its AIR (`runware:400@1`) and its slug (`bfl-flux-2-dev`). You can pass either:

```typescript
// Both call the same model.
await client.run({ model: 'runware:400@1', positivePrompt: '...' })
await client.run({ model: 'bfl-flux-2-dev', positivePrompt: '...' })
```

The SDK rewrites slugs to canonical AIRs before sending. Non-curated identifiers (custom fine-tunes, unknown strings) pass through unchanged.

## LLM Streaming

For text models, `.stream()` delivers tokens as they're generated:

```typescript
const stream = await client.stream({
  model: 'google:gemma@4-31b',
  messages: [{ role: 'user', content: 'Tell me a story about a robot' }],
})

// Iterate text deltas as they arrive
for await (const word of stream.textStream) {
  process.stdout.write(word)
}
```

The `.stream()` method returns a `TextStream` object with multiple ways to consume the response:

```typescript
const stream = await client.stream({
  model: 'google:gemma@4-31b',
  messages: [{ role: 'user', content: 'Explain gravity' }],
})

// Iterate text deltas
for await (const word of stream.textStream) {
  process.stdout.write(word)
}

// Iterate reasoning content (for reasoning models)
for await (const thought of stream.reasoningStream) {
  console.log('[thinking]', thought)
}

// Get the full text at once (awaits the entire stream)
const fullText = await stream.text()

// Get the final result with metadata
const result = await stream.result()
console.log(result.text)
console.log(result.finishReason) // 'stop', 'length', etc.
console.log(result.usage)       // { promptTokens, completionTokens, totalTokens }
console.log(result.cost)        // USD cost
```

> **Note:** `stream()` only supports `numberResults: 1`. For multiple completions in one call, use `run()` instead — `stream()` will throw if you pass `numberResults > 1`.

## Transport Options

### WebSocket (default)

Best for applications making multiple requests or needing real-time feedback:

```typescript
const client = await createClient({
  apiKey: process.env.RUNWARE_API_KEY ?? 'your-api-key',
  transport: 'websocket', // default
})

await client.connect()

// Persistent connection — low latency for multiple operations
const images = await client.run({ model: 'runware:400@1', positivePrompt: '...' })
const videos = await client.run({ model: 'google:3@3', positivePrompt: '...', width: 1280, height: 720 })

await client.disconnect()
```

WebSocket connections are automatically recovered on network interruptions. The SDK re-authenticates with the same session UUID, and the server replays any pending results.

Call `client.disconnect()` to close the connection cleanly. This also stops any in-flight reconnect attempts — subsequent `connect()` calls re-enable reconnection.

### REST

Best for serverless functions or simple one-off requests:

```typescript
const client = await createClient({
  apiKey: process.env.RUNWARE_API_KEY ?? 'your-api-key',
  transport: 'rest',
})

// No connect() needed — each request is a standalone HTTP call
const images = await client.run({
  model: 'runware:400@1',
  positivePrompt: 'A landscape painting',
  width: 1024,
  height: 1024,
})
```

## Concurrent Operations

Run multiple tasks simultaneously:

```typescript
const [images, upscaled, caption] = await Promise.all([
  client.run({
    model: 'runware:400@1',
    positivePrompt: 'Abstract art',
    numberResults: 3,
  }),
  client.run<'upscale-image'>({
    model: 'runware:504@1',
    inputs: { image: 'https://example.com/photo.jpg' },
  }),
  client.run<'caption'>({
    model: 'runware:150@2',
    inputs: { image: 'https://example.com/photo.jpg' },
  }),
])
```

## Cancellation

Pass an `AbortSignal` to cancel a request mid-flight. Works for `run()` and `stream()`, on both transports:

> **Heads-up:** abort is client-side only. The server keeps processing the task and **you will be billed for it**. Aborting just stops the SDK from waiting for the result.

```typescript
const controller = new AbortController()

// Cancel after 5 seconds
setTimeout(() => controller.abort(), 5000)

try {
  const images = await client.run({
    model: 'runware:400@1',
    positivePrompt: 'A detailed scene',
  }, { signal: controller.signal })
} catch (error) {
  if (error.code === 'aborted') {
    console.log('Request was cancelled')
  }
}
```

For streams, abort closes the SSE connection cleanly:

```typescript
const stream = await client.stream({
  model: 'google:gemma@4-31b',
  messages: [{ role: 'user', content: 'Tell me a long story' }],
}, { signal: controller.signal })

for await (const word of stream.textStream) {
  process.stdout.write(word)
  if (someCondition) { controller.abort() } // ends the iteration
}
```

## Result and progress callbacks

Two callbacks let you observe a task as it unfolds:

- **`onResult(item)`** — fires once per item the moment it reaches a terminal state (`success` or `error`). For `numberResults > 1`, fires up to N times — one per result as it completes. Useful for streaming results into a UI as they appear.
- **`onProgress(item)`** — fires when an item's `progress` field changes (0-100). Currently only a few long-running models emit this (mostly training); skip it for typical image/video inference.

```typescript
const images = await client.run({
  model: 'google:3@3',
  positivePrompt: 'Ocean waves at sunset',
  width: 1280,
  height: 720,
  numberResults: 3,
}, {
  onResult: (item) => {
    if (item.status === 'success') {
      console.log('ready:', item.imageURL)
    } else {
      console.log('failed:', item.error)
    }
  },
  onProgress: (item) => {
    console.log(`${item.progress}%`)
  },
})
```

Error items fire `onResult` **before** the promise rejects — so when a per-result runtime failure happens (provider hiccup, content moderation flagging one of several outputs, etc.), you still see the successful results via callback before the promise rejects with the failure. Same behaviour on both WebSocket and REST transports. Request-level failures (`validation`, `auth`, `quota`, `rateLimit`) are the exception: they reject at submit time, before any results exist to report.

## Error Handling

All errors thrown by the SDK are `RunwareError` instances with structured fields:

```typescript
import { RunwareError } from '@runware/sdk'

try {
  const images = await client.run({
    model: 'runware:400@1',
    positivePrompt: 'A detailed rendering',
  })
} catch (error) {
  if (error instanceof RunwareError) {
    console.error(error.code)          // 'validation' | 'auth' | 'quota' | ...
    console.error(error.retryable)     // true for provider/timeout/connection/rateLimit/serverError
    console.error(error.message)       // Human-readable description
    console.error(error.parameter)     // Which param caused the error, if any
    console.error(error.documentation) // Link to model / utility / errors docs
  }
}
```

(For serialization-survived errors or cross-realm setups, use the `isRunwareError(error)` helper instead of `instanceof`.)

`code` is a small, stable enum — `validation`, `auth`, `quota`, `rateLimit`, `safety`, `provider`, `timeout`, `notFound`, `serverError`, `connection`, `aborted`, `unknown`. Switch on it for high-level handling. The server's raw error identifier (which has hundreds of values and is unstable) is intentionally not exposed — the `code` enum + `parameter` + `message` cover what you need to react.

```typescript
if (error.code === 'validation') {
  // Show form error, use error.parameter to highlight the field
} else if (error.code === 'quota') {
  // Redirect to billing
} else if (error.retryable) {
  // Backoff and retry
}
```

Validation failures from the optional client-side `validate: true` flag come back as `code: 'validation'`, with an `error.validationErrors` array of AJV error objects.

### Raising your own RunwareError

If you're wrapping the SDK behind another layer and want to surface errors with the same shape, build one with `createRunwareError`:

```typescript
import { createRunwareError } from '@runware/sdk'

throw createRunwareError(
  'invalidParameter',
  'Width must be a multiple of 64',
  { parameter: 'width', taskType: 'imageInference' },
)
```

The constructor derives `code` and the `documentation` URL from the raw code + model/parameter context — same logic the SDK uses internally.

## Configuration

`createClient({...})` accepts an `SDKConfig` object:

| Field | Default | Notes |
|---|---|---|
| `apiKey` | from `RUNWARE_API_KEY` | required |
| `transport` | `'websocket'` | or `'rest'` |
| `httpBaseUrl` | `https://api.runware.ai/v1` | include the version path |
| `wsBaseUrl` | `wss://ws-api.runware.ai/v1` | include the version path |
| `timeout` | `1_200_000` (ms) | per-HTTP-call (one POST, one `getResponse` poll) |
| `pollTimeout` | `1_200_000` (ms) | end-to-end polling budget on either transport |
| `authTimeout` | `15_000` (ms) | WebSocket auth handshake |
| `maxRetries` | `3` | REST retries |
| `retryDelay` | `1_000` (ms) | base backoff |
| `retryStrategy` | `'exponential'` | or `'linear'` |
| `maxReconnectAttempts` | `Infinity` | WebSocket reconnect cap |
| `debug` | `false` | enable structured debug logs |
| `validate` | `false` | enable client-side schema validation |
| `dependencies` | `undefined` | inject a custom `WebSocket` and/or `fetch` |
| `logSink` | `undefined` | pluggable destination for log entries |

### Custom log sink

By default, debug logs go to `console.*`. To send logs to a custom destination (Datadog, Sentry, file, etc.), pass a `logSink`:

```typescript
import { createClient, type LogEntry } from '@runware/sdk'

const client = await createClient({
  apiKey: process.env.RUNWARE_API_KEY ?? 'your-api-key',
  debug: true,
  logSink: (entry: LogEntry) => {
    // entry: { category, message, data?, timestamp }
    myLogger.log(entry.category, entry.message, entry.data)
  },
})
```

### Picking up newly-launched models

New Runware models become usable in your code automatically — no SDK update needed. If you want to force the SDK to pick up a freshly-launched model immediately (instead of waiting for the next background refresh):

```typescript
await client.refreshRegistry()

const images = await client.run({
  model: 'newprovider:1@1',
  positivePrompt: 'A landscape',
})
```

### Async delivery

The SDK sends `deliveryMethod: 'async'` by default for all inference tasks. On both transports, the server stores the result and the SDK polls `getResponse` until the task completes — that's why the same `pollTimeout` config controls behaviour on REST and WebSocket alike (default: 20 minutes).

For long-running tasks like video generation or model training, increase the poll timeout further:

```typescript
const client = await createClient({
  apiKey: process.env.RUNWARE_API_KEY ?? 'your-api-key',
  pollTimeout: 1_800_000, // 30 minutes
})
```

Or per-call via `RunOptions`:

```typescript
const videos = await client.run({
  model: 'google:3@3',
  positivePrompt: 'Ocean waves',
  width: 1280,
  height: 720,
}, { timeout: 600000 })
```

#### Opting into sync delivery

For tasks that complete quickly (text inference, fast image generation, captioning, etc.) you can skip the polling round-trips entirely by setting `deliveryMethod: 'sync'`. The server holds the connection until the result is ready and pushes it back in a single response:

```typescript
const responses = await client.run({
  model: 'google:gemma@4-31b',
  messages: [{ role: 'user', content: 'Hello' }],
  deliveryMethod: 'sync',
})
```

On **WebSocket** this is where the transport's persistent connection actually pays off — one frame in, one frame back, no polling.  
On **REST** it means a single HTTP request with the full result in the response body.

Pick sync when you're confident the task finishes inside the server's connection budget (~120s for WebSocket sync, the HTTP read timeout for REST). For anything longer — video, 3D, large upscale, multi-result batches — stick with the async default so the SDK can poll safely.

### Per-call options

The second argument to `client.run()` / `client.stream()` and the utility methods (`modelSearch`, `modelUpload`, etc.) is a `RunOptions` object — per-call overrides that don't belong on the client itself:

```typescript
await client.run({
  model: 'runware:400@1',
  positivePrompt: 'A landscape',
}, {
  timeout: 600_000,                 // ms — override config.pollTimeout for this call
  signal: controller.signal,        // AbortSignal — cancel this call (see Cancellation)
  onResult: (item) => { ... },      // fires per item as it completes (see Result and progress callbacks)
  onProgress: (item) => { ... },    // fires when an item's progress % changes
  validate: true,                   // override config.validate for this call (see Validation)
})
```

`stream()` accepts the same shape but only uses `signal` and `validate` (no polling means no `timeout`, no per-item callbacks).

## Validation

Enable client-side validation to catch invalid parameters before they reach the API. Install AJV (optional peer dependency):

```bash
npm install ajv
```

Then enable it:

```typescript
const client = await createClient({
  apiKey: process.env.RUNWARE_API_KEY ?? 'your-api-key',
  validate: true,
})

// Throws a RunwareError (code: 'validation') with details before sending
await client.run({
  model: 'runware:400@1',
  positivePrompt: 'A landscape',
  width: -1, // ← caught locally
})
```

The schema for each model is fetched on first use and cached per-process. Works the same for curated models and community fine-tunes — you don't pass anything beyond `validate: true`.

If the schema can't be fetched (network failure, model unknown to the registry, etc.), validation is silently skipped and the server still validates as the source of truth.

Validation errors come back as a `RunwareError` with `code: 'validation'` and the AJV details on `validationErrors`:

```typescript
import { RunwareError } from '@runware/sdk'

try {
  await client.run({ ... })
} catch (error) {
  if (error instanceof RunwareError && error.code === 'validation') {
    console.error(error.taskType)         // 'imageInference'
    console.error(error.validationErrors) // AJV error objects
  }
}
```

Validation can also be toggled **per call** via `RunOptions.validate`, which overrides `config.validate`:

```typescript
// Force validation for just this call, even if config.validate is false
await client.run({ ... }, { validate: true })

// Skip validation for just this call, even if config.validate is true
await client.run({ ... }, { validate: false })
```

Precedence: `options.validate ?? config.validate`.

To force a refresh of cached validators (e.g., after a server-side schema change), call:

```typescript
import { clearValidatorCache } from '@runware/sdk'
clearValidatorCache()
```

## Utility Methods

```typescript
// Search for available models
const models = await client.modelSearch({
  search: 'portrait',
  category: 'checkpoint',
  architecture: 'sdxl',
  limit: 10,
})

// Upload an image for use as input
const uploaded = await client.imageUpload({
  image: 'https://example.com/photo.jpg', // URL, Data URI, or Base64
})

// Get account details
const account = await client.accountManagement({
  operation: 'getDetails',
})

// Retrieve a previously executed task by UUID (archive lookup)
const archived = await client.getTaskDetails({ taskUUID: 'abc-123' })

// Poll for an async task result (used internally by .run() — rarely needed directly)
const result = await client.getResponse({ taskUUID: 'abc-123' })

// Upload a custom model
await client.modelUpload({
  category: 'checkpoint',
  architecture: 'sdxl',
  format: 'safetensors',
  // ...plus model file details
})
```

`getTaskDetails` vs `getResponse`: use `getTaskDetails` for "look up something I ran before" — it queries the task archive. `getResponse` is the polling mechanism the SDK uses internally during async `.run()`; you generally don't need to call it directly.

## Content metadata

`client.content.*` exposes Runware's curated model catalog as read-only metadata — names, AIRs, headlines, capabilities, pricing, examples. Public information, no extra cost.

```typescript
// List curated models, optionally filtered
const models = await client.content.listModels({
  capability: 'io:text-to-image',
  category: 'image',
  creator: 'black-forest-labs',
  search: 'flux',
})

// Single curated model by id
const model = await client.content.getModel('alibaba-z-image-turbo')

// Sample input/output pairs the model can produce
const examples = await client.content.getModelExamples('flux-1-dev')

// Pricing summary and per-configuration examples
const pricing = await client.content.getModelPricing('flux-1-dev')

// Discover the capability taxonomy (io:*, op:*, form:*)
const capabilities = await client.content.listCapabilities()

// Collections (Runware-defined model groupings) with full model objects inlined
const collections = await client.content.listCollections({ category: 'image' })

// Creators with their curated models inlined
const creators = await client.content.listCreators()
const google = await client.content.getCreator('google')

// Pagination — pass paginate: true to get { total, limit, offset, items }
const page = await client.content.listModels({ paginate: true, limit: 25, offset: 0 })
```

`creator`, `capabilities`, and `architecture` on each model are returned as id strings — resolve them against `listCreators`, `listCapabilities`, and the architecture id respectively when you need the human-readable label. Collections and creators are the only endpoints that resolve their inner `models` array to full objects.

## File helpers

`fileToDataURI` encodes a local file or in-memory buffer as a `data:` URI for passing as input:

```typescript
import { fileToDataURI } from '@runware/sdk'
import { readFile } from 'node:fs/promises'

const dataUri = await fileToDataURI(await readFile('photo.jpg'))
await client.imageUpload({ image: dataUri })
```

## Custom dependencies

For testing, proxies, or environments with non-standard runtimes, inject your own `WebSocket` constructor and/or `fetch` implementation:

```typescript
const client = await createClient({
  apiKey: process.env.RUNWARE_API_KEY ?? 'your-api-key',
  dependencies: {
    WebSocket: CustomWebSocketClass,
    fetch: customFetchFunction,
  },
})
```

The SDK works in Node.js 18+ and modern browsers with no polyfills.

## TypeScript

Types are generated from Runware's canonical JSON schemas and ship with the SDK:

```typescript
import type {
  RunwareClient,
  SchemaKey,
  SchemaMap,
  TextStream,
  TextStreamResult,
  RunwareError,
} from '@runware/sdk'

// Schema-driven types — always match the API
type SdxlParams = SchemaMap['sdxl']['params']
type SdxlResult = SchemaMap['sdxl']['result']

// Type-safe run call
const images = await client.run<'sdxl'>({
  model: 'civitai:133005@782002',
  positivePrompt: 'test',
  width: 1024,
  height: 1024,
})

// images is typed as ImageInferenceResult[]
const url: string = images[0].imageURL
```

## License

MIT
