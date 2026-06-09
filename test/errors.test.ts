import { describe, it, expect } from 'bun:test'

import { deriveCode, isRetryable } from '../src/errors'

describe('deriveCode', () => {
  // One representative per category — regression catches bucket drift.
  const samples: Array<[string, ReturnType<typeof deriveCode>]> = [
    // validation
    ['invalidPositivePrompt', 'validation'],
    ['invalidPositivePromptLength', 'validation'],
    ['missingPositivePrompt', 'validation'],
    ['missingApiKey', 'auth'], // ApiKey wins over missing*
    ['conflictTaskUUID', 'validation'],
    ['duplicatePreloadModelAIR', 'validation'],
    ['unsupportedParameter', 'validation'],
    ['unsupportedTaskType', 'validation'],
    ['valueTooLarge', 'validation'],
    ['arrayTooSmall', 'validation'],
    ['unknownParameter', 'validation'],
    ['incompatibleParameters', 'validation'],
    ['mismatchProviderSettingsProvider', 'validation'],
    ['modelOwnershipValidationError', 'validation'],
    ['modelAlreadyExists', 'validation'],
    ['maxLycorisModelsExceeded', 'validation'],
    ['validationFailed', 'validation'],

    // auth
    ['invalidApiKey', 'auth'],
    ['missingApiKey', 'auth'],
    ['authenticationFailed', 'auth'],
    ['authFailed', 'auth'],
    ['authTimeout', 'auth'],
    ['unauthorized', 'auth'],
    ['forbidden', 'auth'],
    ['permissionDenied', 'auth'],
    ['insufficientPermissions', 'auth'],
    ['tokenExpired', 'auth'],
    ['accountSuspended', 'auth'],
    ['organizationDisabled', 'auth'],
    ['workspaceSuspended', 'auth'],

    // quota
    ['insufficientCredits', 'quota'],
    ['providerInsufficientCredits', 'quota'],
    ['thirdPartyInsufficientCredits', 'quota'],
    ['quotaExceeded', 'quota'],
    ['paymentRequired', 'quota'],
    ['textInferenceVideoInputInsufficientCredits', 'quota'],

    // rateLimit
    ['rateLimitExceeded', 'rateLimit'],
    ['inferenceRateLimitExceeded', 'rateLimit'],
    ['providerRateLimitExceeded', 'rateLimit'],
    ['inferenceRateLimitRequestTooLarge', 'rateLimit'],

    // safety
    ['contentPolicyViolation', 'safety'],
    ['providerContentPolicyViolation', 'safety'],
    ['sensitiveContentDetected', 'safety'],
    ['nsfwContentDetected', 'safety'],
    ['unsafeContentDetected', 'safety'],
    ['promptBlocked', 'safety'],
    ['imageBlocked', 'safety'],
    ['moderationFailed', 'safety'],

    // provider
    ['providerError', 'provider'],
    ['providerUnavailable', 'provider'],
    ['providerBadGateway', 'provider'],
    ['providerInternalError', 'provider'],
    ['providerUnknownError', 'provider'],
    ['providerAuthenticationFailed', 'provider'], // upstream auth, not user
    ['inferenceError', 'provider'],
    ['processingFailed', 'provider'],
    ['taskFailed', 'provider'],
    ['downloadFailed', 'provider'],
    ['uploadFailed', 'provider'],
    ['noAvailableServer', 'provider'],
    ['modelUnavailable', 'provider'],
    ['modelDisabled', 'provider'],
    ['modelNotReady', 'provider'],

    // timeout
    ['timeout', 'timeout'],
    ['providerTimeout', 'timeout'],
    ['providerGatewayTimeout', 'timeout'],
    ['authTimeout', 'auth'], // auth wins over Timeout (specific check)
    ['webhookTimeout', 'timeout'],

    // notFound
    ['modelNotFound', 'notFound'],
    ['taskNotFound', 'notFound'],
    ['mediaNotFound', 'notFound'],
    ['providerNotFound', 'notFound'],
    ['taskExpired', 'notFound'],
    ['mediaExpired', 'notFound'],
    ['taskCancelled', 'notFound'],
    ['taskFailedOrNotFound', 'notFound'],
    ['unknownModel', 'notFound'],

    // serverError
    ['internalServerError', 'serverError'],
    ['serviceUnavailable', 'serverError'],
    ['serverUnavailable', 'serverError'],
    ['standardError', 'serverError'],
    ['unknownError', 'serverError'],
    ['undefinedError', 'serverError'],
    ['defaultError', 'serverError'],
    ['unrecognizedResponse', 'serverError'],
    ['errorRetrievingAccountManagement', 'serverError'],

    // connection (SDK-only)
    ['connectionFailed', 'connection'],
    ['notConnected', 'connection'],
    ['notOpen', 'connection'],
    ['reconnectionFailed', 'connection'],
    ['disconnected', 'connection'],

    // aborted (SDK-only)
    ['aborted', 'aborted'],

    // unknown fallback
    ['somethingWeird', 'unknown'],
    ['x', 'unknown'],
  ]

  for (const [raw, expected] of samples) {
    it(`maps "${raw}" → ${expected}`, () => {
      expect(deriveCode(raw)).toBe(expected)
    })
  }
})

describe('isRetryable', () => {
  it('is true for the documented retryable categories', () => {
    expect(isRetryable('provider')).toBe(true)
    expect(isRetryable('timeout')).toBe(true)
    expect(isRetryable('connection')).toBe(true)
    expect(isRetryable('rateLimit')).toBe(true)
    expect(isRetryable('serverError')).toBe(true)
  })

  it('is false for non-retryable categories', () => {
    expect(isRetryable('validation')).toBe(false)
    expect(isRetryable('auth')).toBe(false)
    expect(isRetryable('quota')).toBe(false)
    expect(isRetryable('safety')).toBe(false)
    expect(isRetryable('notFound')).toBe(false)
    expect(isRetryable('aborted')).toBe(false)
    expect(isRetryable('unknown')).toBe(false)
  })
})
