export type TextStreamChunk = {
  /** The text token delta. */
  text?: string
  /** Reasoning content (for reasoning models, arrives before text). */
  reasoningContent?: string
  /** Why the model stopped generating (only on final chunk). */
  finishReason?: 'stop' | 'length' | 'content_filter' | 'tool_calls' | 'tool_use' | 'unknown' | null
  /** Token usage stats (only on final chunk, if includeUsage: true). */
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
  /** Cost in USD (only on final chunk, if includeCost: true). */
  cost?: number
  /** Which result this chunk belongs to (when numberResults > 1). */
  resultIndex?: number
  /** The task UUID. */
  taskUUID: string
}

export type TextStreamResult = {
  /** The full accumulated text. */
  text: string
  /** The full accumulated reasoning content (if any). */
  reasoningContent?: string | undefined
  /** Why the model stopped. */
  finishReason: string | null
  /** Token usage (if includeUsage: true). */
  usage?: TextStreamChunk['usage'] | undefined
  /** Cost in USD (if includeCost: true). */
  cost?: number | undefined
  /** The task UUID. */
  taskUUID: string
}

export type TextStream = {
  /**
   * Get the full accumulated text after the stream completes.
   * Awaitable — consumes the stream.
   */
  text: () => Promise<string>

  /**
   * Async iterable of text deltas only (just strings).
   * Consumes the stream.
   */
  textStream: AsyncIterable<string>

  /**
   * Async iterable of reasoning content deltas (for reasoning models).
   * Consumes the stream.
   */
  reasoningStream: AsyncIterable<string>

  /**
   * Get the final result metadata after the stream completes.
   * Includes full text, finish reason, usage, and cost.
   */
  result: () => Promise<TextStreamResult>
}
