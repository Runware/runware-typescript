import { describe, it, expect } from 'bun:test'

import { parseSseLine } from '../src/stream'

describe('parseSseLine', () => {
  it('parses a content chunk', () => {
    const line = 'data: {"taskUUID":"abc-123","taskType":"textInference","delta":{"text":"Hello"},"finishReason":null}'
    const chunk = parseSseLine(line)

    expect(chunk).not.toBeNull()
    expect(chunk!.text).toBe('Hello')
    expect(chunk!.finishReason).toBeNull()
    expect(chunk!.taskUUID).toBe('abc-123')
  })

  it('parses a reasoning chunk', () => {
    const line = 'data: {"taskUUID":"abc-123","taskType":"textInference","delta":{"reasoningContent":"Let me think..."}}'
    const chunk = parseSseLine(line)

    expect(chunk).not.toBeNull()
    expect(chunk!.reasoningContent).toBe('Let me think...')
    expect(chunk!.text).toBeUndefined()
  })

  it('parses a final chunk with finishReason', () => {
    const line = 'data: {"taskUUID":"abc-123","taskType":"textInference","delta":{},"finishReason":"stop"}'
    const chunk = parseSseLine(line)

    expect(chunk).not.toBeNull()
    expect(chunk!.finishReason).toBe('stop')
    expect(chunk!.text).toBeUndefined()
  })

  it('parses a final chunk with usage and cost', () => {
    const line = 'data: {"taskUUID":"abc-123","taskType":"textInference","delta":{},"finishReason":"stop","usage":{"promptTokens":10,"completionTokens":5,"totalTokens":15},"cost":0.001}'
    const chunk = parseSseLine(line)

    expect(chunk!.finishReason).toBe('stop')
    expect(chunk!.usage).toEqual({
      promptTokens: 10,
      completionTokens: 5,
      totalTokens: 15,
    })
    expect(chunk!.cost).toBe(0.001)
  })

  it('parses a multi-result chunk with resultIndex', () => {
    const line = 'data: {"taskUUID":"abc-123","taskType":"textInference","resultIndex":1,"delta":{"text":"Hi"},"finishReason":null}'
    const chunk = parseSseLine(line)

    expect(chunk!.resultIndex).toBe(1)
    expect(chunk!.text).toBe('Hi')
  })

  it('returns null for [DONE] sentinel', () => {
    expect(parseSseLine('data: [DONE]')).toBeNull()
  })

  it('returns null for empty lines', () => {
    expect(parseSseLine('')).toBeNull()
    expect(parseSseLine('   ')).toBeNull()
  })

  it('returns null for ping comments', () => {
    expect(parseSseLine(': ping')).toBeNull()
  })

  it('returns null for non-data lines', () => {
    expect(parseSseLine('event: message')).toBeNull()
  })

  it('throws on error response', () => {
    const line = 'data: {"errors":[{"code":"timeoutProvider","message":"The provider timed out.","taskType":"textInference","taskUUID":"abc-123"}]}'

    expect(() => parseSseLine(line)).toThrow('The provider timed out.')
  })
})
