import type { SDKConfig, TaskPayload } from './types/sdk'
import type { TextStream, TextStreamChunk, TextStreamResult } from './types/stream'

import { createRunwareError, parseApiError } from './errors'

export type { TextStream, TextStreamChunk, TextStreamResult }

/**
 * Parse a single Server-Sent Events line into a `TextStreamChunk`.
 *
 * Returns:
 *   - a chunk when the line is a valid `data: {...}` JSON payload
 *   - `null` for comments, the `[DONE]` sentinel, or blank lines (caller skips)
 * Throws if the SSE payload contains an `error` / `errors` field — the caller
 * is responsible for propagating that as a `RunwareError` to the consumer.
 *
 * Exported for advanced consumers who implement custom SSE handling. Most
 * users iterate the streams returned by `client.stream()` directly and never
 * need to call this.
 */
export const parseSseLine = (line: string): TextStreamChunk | null => {
  const trimmed = line.trim()

  if (!trimmed || trimmed.startsWith(':')) { return null }
  if (!trimmed.startsWith('data:')) { return null }
  const payload = trimmed.slice(5).trim()

  if (payload === '[DONE]') { return null }

  let json: any
  try {
    json = JSON.parse(payload)
  } catch {
    throw createRunwareError('parseError', `Failed to parse SSE data: ${payload.slice(0, 200)}`)
  }

  if (json.errors) {
    throw parseApiError(json)
  }

  return {
    text: json.delta?.text ?? undefined,
    reasoningContent: json.delta?.reasoningContent ?? undefined,
    finishReason: json.finishReason ?? null,
    usage: json.usage ?? undefined,
    cost: json.cost ?? undefined,
    resultIndex: json.resultIndex ?? undefined,
    taskUUID: json.taskUUID,
  }
}

const createChunkIterator = (
  tasks: TaskPayload[],
  config: SDKConfig,
  signal?: AbortSignal,
): AsyncIterable<TextStreamChunk> => {
  const fetchImpl = config.dependencies?.fetch ?? globalThis.fetch
  if (!fetchImpl) {
    throw createRunwareError('noFetchImpl', 'fetch is required for SSE streaming')
  }

  const url = config.httpBaseUrl

  return {
    [Symbol.asyncIterator](): AsyncIterableIterator<TextStreamChunk> {
      let reader: ReadableStreamDefaultReader<Uint8Array> | null = null
      let decoder: TextDecoder | null = null
      let buffer = ''
      let done = false

      const controller = new AbortController()
      let abortListener: (() => void) | null = null

      const cleanupSignal = () => {
        if (signal && abortListener) {
          signal.removeEventListener('abort', abortListener)
          abortListener = null
        }
      }

      const init = async () => {
        if (signal) {
          if (signal.aborted) {
            controller.abort()
          } else {
            abortListener = () => controller.abort()
            signal.addEventListener('abort', abortListener, { once: true })
          }
        }

        const body = JSON.stringify(tasks)
        config.log.send(body)
        const response = await fetchImpl(url, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${config.apiKey}`,
            'Content-Type': 'application/json',
          },
          body,
          signal: controller.signal,
        })

        if (!response.ok) {
          let body: unknown
          try { body = await response.json() } catch { body = null }

          if (body) {
            throw parseApiError(body)
          }

          throw createRunwareError('httpError', `SSE request failed: ${response.status} ${response.statusText}`)
        }

        if (!response.body) {
          throw createRunwareError('streamUnsupported', 'Response body is not readable (streaming not supported)')
        }

        reader = response.body.getReader()
        decoder = new TextDecoder()
      }

      let initPromise: Promise<void> | null = null

      const iterator = {
        [Symbol.asyncIterator]() { return iterator },

        async next(): Promise<IteratorResult<TextStreamChunk>> {
          if (done) { return { done: true, value: undefined } }

          if (!initPromise) {
            initPromise = init()
          }
          await initPromise

          while (true) {
            const newlineIdx = buffer.indexOf('\n')
            if (newlineIdx !== -1) {
              const line = buffer.slice(0, newlineIdx)
              buffer = buffer.slice(newlineIdx + 1)

              try {
                const chunk = parseSseLine(line)
                if (chunk) {
                  return { done: false, value: chunk }
                }
                if (line.trim() === 'data: [DONE]') {
                  done = true
                  reader?.cancel()
                  cleanupSignal()
                  return { done: true, value: undefined }
                }
                continue
              } catch (error) {
                done = true
                reader?.cancel()
                cleanupSignal()
                throw error
              }
            }

            if (!reader || !decoder) {
              done = true
              cleanupSignal()
              return { done: true, value: undefined }
            }

            const { done: streamDone, value } = await reader.read()
            if (streamDone) {
              // Connection interrupted without [DONE] sentinel
              done = true
              cleanupSignal()
              return { done: true, value: undefined }
            }

            buffer += decoder.decode(value, { stream: true })
          }
        },

        async return(): Promise<IteratorResult<TextStreamChunk>> {
          done = true
          reader?.cancel()
          cleanupSignal()
          return { done: true, value: undefined }
        },
      }

      return iterator
    },
  }
}

export const createTextStream = (
  tasks: TaskPayload[],
  config: SDKConfig,
  signal?: AbortSignal,
  onStart?: () => Promise<void>,
): TextStream => {
  // Chunks are buffered and broadcast to all consumers
  const chunks: TextStreamChunk[] = []
  let streamDone = false
  let streamError: unknown = null
  let consumeStarted = false

  const waiters = new Set<() => void>()

  const notifyAll = () => {
    for (const resolve of waiters) { resolve() }
    waiters.clear()
  }

  const waitForChunk = async (): Promise<void> =>
    new Promise<void>((resolve) => { waiters.add(resolve) })

  const startConsuming = async () => {
    if (consumeStarted) { return }
    consumeStarted = true

    try {
      if (onStart) { await onStart() }
      for await (const chunk of createChunkIterator(tasks, config, signal)) {
        config.log.receive(JSON.stringify(chunk))
        chunks.push(chunk)
        notifyAll()
      }
    } catch (error) {
      streamError = error
    } finally {
      streamDone = true
      notifyAll()
    }
  }

  const createConsumer = <T>(
    extract: (chunk: TextStreamChunk) => T | undefined,
  ): AsyncIterable<T> => ({
      async *[Symbol.asyncIterator]() {
        startConsuming()
        let cursor = 0

        while (true) {
          while (cursor < chunks.length) {
            const chunk = chunks[cursor]
            cursor += 1
            if (!chunk) { continue }
            const value = extract(chunk)
            if (value !== undefined) { yield value }
          }

          if (streamDone) {
            if (streamError) { throw streamError }
            return
          }

          await waitForChunk()
        }
      },
    })

  let resultPromise: Promise<TextStreamResult> | null = null

  const getResult = async (): Promise<TextStreamResult> => {
    if (resultPromise) { return resultPromise }

    resultPromise = (async () => {
      startConsuming()
      while (!streamDone) { await waitForChunk() }
      if (streamError) { throw streamError }

      let text = ''
      let reasoningContent = ''
      let finishReason: string | null = null
      let usage: TextStreamChunk['usage'] | undefined
      let cost: number | undefined
      let taskUUID = ''

      for (const chunk of chunks) {
        if (chunk.text) { text += chunk.text }
        if (chunk.reasoningContent) { reasoningContent += chunk.reasoningContent }
        if (chunk.finishReason) { finishReason = chunk.finishReason }
        if (chunk.usage) { usage = chunk.usage }
        if (chunk.cost !== undefined) { cost = chunk.cost }
        if (chunk.taskUUID) { taskUUID = chunk.taskUUID }
      }

      return {
        text,
        reasoningContent: reasoningContent || undefined,
        finishReason,
        usage,
        cost,
        taskUUID,
      }
    })()

    return resultPromise
  }

  return {
    text: async () => (await getResult()).text,
    result: getResult,
    textStream: createConsumer((chunk) => chunk.text),
    reasoningStream: createConsumer((chunk) => chunk.reasoningContent),
  }
}
