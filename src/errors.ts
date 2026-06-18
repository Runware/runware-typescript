/* eslint-disable no-restricted-syntax --
 * Public-API exception: RunwareError is a class so users can use the JS-idiomatic
 * `err instanceof RunwareError` for narrowing.
 */
import { models } from './types/task-map'
import { getDocsUrlForModel } from './validate'

export type ErrorCode =
  | 'validation'
  | 'auth'
  | 'quota'
  | 'rateLimit'
  | 'safety'
  | 'provider'
  | 'timeout'
  | 'notFound'
  | 'serverError'
  | 'connection'
  | 'aborted'
  | 'unknown'

const DOCS_BASE = 'https://runware.ai/docs'

const UTILITY_DOC_PATHS: Record<string, string> = {
  modelSearch: 'platform/model-search',
  modelUpload: 'platform/model-upload',
  imageUpload: 'platform/image-upload',
  getResponse: 'platform/task-polling',
  accountManagement: 'platform/account-management',
}

const SDK_ERROR_DOC_PATH = 'platform/errors'

const SDK_ONLY_RAW_CODES = new Set([
  'aborted',
  'unknownModel',
  'noFetchImpl',
  'noWebSocketImpl',
  'streamUnsupported',
  'notConnected',
  'notOpen',
  'reconnectionFailed',
  'sendFailed',
  'connectionFailed',
  'missingApiKey',
  'parseError',
])

const SAFETY_CODES = new Set([
  'contentPolicyViolation',
  'providerContentPolicyViolation',
  'sensitiveContentDetected',
  'unsafeContentDetected',
  'nsfwContentDetected',
  'promptBlocked',
  'imageBlocked',
  'moderationFailed',
])

const AUTH_CODES = new Set([
  'unauthorized',
  'forbidden',
  'permissionDenied',
  'insufficientPermissions',
  'authenticationFailed',
  'authFailed',
  'authTimeout',
  'invalidAuthentication',
  'invalidCredentials',
  'missingAuthentication',
  'tokenExpired',
  'tokenInvalid',
  'tokenMissing',
  'tokenRevoked',
  'accountSuspended',
  'accountDisabled',
  'organizationSuspended',
  'organizationDisabled',
  'workspaceSuspended',
  'workspaceDisabled',
])

const SERVER_ERROR_CODES = new Set([
  'internalServerError',
  'serviceUnavailable',
  'serverUnavailable',
  'standardError',
  'unknownError',
  'undefinedError',
  'defaultError',
  'unrecognizedResponse',
  'errorRetrievingAccountManagement',
])

const NOT_FOUND_CODES = new Set([
  'taskCancelled', 'taskFailedOrNotFound', 'unknownModel',
])

const PROVIDER_CODES = new Set([
  'inferenceError',
  'processingFailed',
  'taskFailed',
  'downloadFailed',
  'uploadFailed',
  'noAvailableServer',
  'modelUnavailable',
  'modelDisabled',
  'modelNotReady',
  'mediaStorageFileCouldNotBeMoved',
])

const RETRYABLE_CODES: ReadonlySet<ErrorCode> = new Set([
  'provider',
  'timeout',
  'connection',
  'rateLimit',
  'serverError',
])

export const isRetryable = (code: ErrorCode): boolean => RETRYABLE_CODES.has(code)

/**
 * Maps the raw server-side or SDK-internal identifier into a small, stable
 * enum users can switch on. Server's raw identifier itself is intentionally
 * not exposed on `RunwareError` — the backend catalog is hundreds of strings
 * and unstable. Users get `code` (this enum), `parameter`, and `message` for
 * everything they need to react.
 */
export const deriveCode = (raw: string): ErrorCode => {
  if (raw === 'aborted') { return 'aborted' }
  if (raw === 'connectionFailed' || raw === 'notConnected' || raw === 'notOpen' || raw === 'reconnectionFailed' || raw === 'disconnected') { return 'connection' }

  if (raw.includes('Credits') || raw.includes('Quota') || raw.includes('Balance') || raw === 'quotaExceeded' || raw === 'paymentRequired') { return 'quota' }
  if (raw.includes('RateLimit') || raw === 'rateLimitExceeded') { return 'rateLimit' }

  if (SAFETY_CODES.has(raw)) { return 'safety' }

  if (AUTH_CODES.has(raw) || raw.includes('ApiKey')) { return 'auth' }

  if (raw.includes('Timeout') || raw === 'timeout') { return 'timeout' }

  if (NOT_FOUND_CODES.has(raw) || raw.endsWith('NotFound') || raw.endsWith('Expired')) { return 'notFound' }

  if (SERVER_ERROR_CODES.has(raw)) { return 'serverError' }

  // Provider auth = upstream auth (Runware's keys, not user's). Transient,
  // treat as provider rather than user-facing auth failure.
  if (PROVIDER_CODES.has(raw) || raw.startsWith('provider')) { return 'provider' }

  // Validation catch-all for request-shape problems
  if (
    raw.startsWith('invalid')
    || raw.startsWith('missing')
    || raw.startsWith('conflict')
    || raw.startsWith('duplicate')
    || raw.startsWith('unsupported')
    || raw.startsWith('value')
    || raw.startsWith('array')
    || raw === 'unknownParameter'
    || raw === 'incompatibleParameters'
    || raw === 'mismatchProviderSettingsProvider'
    || raw === 'unknownProviderSettingsProvider'
    || raw === 'transparentModelMismatch'
    || raw === 'modelOwnershipValidationError'
    || raw === 'modelAlreadyExists'
    || raw.startsWith('max')
    || raw === 'validationFailed'
  ) { return 'validation' }

  return 'unknown'
}

export class RunwareError extends Error {
  /** Stable category for this error. Use this for switch/if statements. */
  code: ErrorCode
  /** True if retrying the same request might succeed. */
  retryable: boolean
  /** The request parameter related to the error, if applicable. */
  declare parameter?: string
  /** The task type of the request that failed. */
  declare taskType?: string
  /** The unique identifier of the failed request. */
  declare taskUUID?: string
  /** Link to relevant documentation, derived from taskType/model/parameter. */
  declare documentation?: string
  /** HTTP status code, when the error originated from an HTTP response. */
  declare statusCode?: number
  /**
   * Structured AJV errors describing each field that failed.
   * Only present when `code === 'validation'` and the failure was raised by the
   * opt-in client-side validator (`validate: true`). Server-side validation
   * errors only expose `parameter` and `message`.
   */
  declare validationErrors?: unknown[]

  constructor(rawCode: string, message: string) {
    super(message)
    this.name = 'RunwareError'
    this.code = deriveCode(rawCode)
    this.retryable = isRetryable(this.code)
  }
}

const paramAnchor = (parameter: string): string =>
  '#request-' + parameter.replace(/\./g, '-').toLowerCase()

export const buildDocumentationUrl = (
  taskType: string | undefined,
  model: string | undefined,
  parameter: string | undefined,
  rawCode: string,
): string | undefined => {
  // Curated model: build URL from the bundled slug.
  if (model) {
    const entry = models[model]
    if (entry) {
      const base = `${DOCS_BASE}/models/${entry.id}`
      return parameter ? `${base}${paramAnchor(parameter)}` : base
    }
  }

  // Non-curated model (fine-tune, etc.): check whether `/resolve` has been
  // called for this model (validate: true path) and cached the canonical
  // docs base URL. If so, append the parameter anchor.
  if (model) {
    const cachedBase = getDocsUrlForModel(model)
    if (cachedBase) {
      return parameter ? `${cachedBase}${paramAnchor(parameter)}` : cachedBase
    }
  }

  if (taskType && UTILITY_DOC_PATHS[taskType]) {
    const base = `${DOCS_BASE}/${UTILITY_DOC_PATHS[taskType]}`
    return parameter ? `${base}${paramAnchor(parameter)}` : base
  }

  if (SDK_ONLY_RAW_CODES.has(rawCode)) {
    return `${DOCS_BASE}/${SDK_ERROR_DOC_PATH}`
  }

  // Model was specified but we don't know its specific docs page
  // (fine-tune without `validate: true`, unknown AIR, etc.). Point to the
  // models index — better than nothing, no per-parameter anchor since the
  // index doesn't expose them.
  if (model) {
    return `${DOCS_BASE}/models`
  }

  return undefined
}

type ErrorDetails = {
  parameter?: string | undefined
  taskType?: string | undefined
  taskUUID?: string | undefined
  statusCode?: number | undefined
  validationErrors?: unknown[] | undefined
  model?: string | undefined
}

export const createRunwareError = (
  rawCode: string,
  message: string,
  details?: ErrorDetails,
): RunwareError => {
  const error = new RunwareError(rawCode, message)
  if (details?.parameter) { error.parameter = details.parameter }
  if (details?.taskType) { error.taskType = details.taskType }
  if (details?.taskUUID) { error.taskUUID = details.taskUUID }
  if (details?.statusCode !== undefined) { error.statusCode = details.statusCode }
  if (details?.validationErrors !== undefined && error.code === 'validation') {
    error.validationErrors = details.validationErrors
  }

  const url = buildDocumentationUrl(error.taskType, details?.model, error.parameter, rawCode)
  if (url) { error.documentation = url }

  return error
}

/**
 * Optional request context. Server error responses often omit `taskType` and
 * `model` (they only echo back what the user sent in the error item itself).
 * The SDK knows them from the original request — pass them through so the
 * resulting error has a populated `taskType` and a derivable `documentation`.
 */
export type ErrorContext = {
  taskType?: string | undefined
  model?: string | undefined
}

export const parseApiError = (raw: unknown, context?: ErrorContext): RunwareError => {
  if (typeof raw !== 'object' || raw === null) {
    return createRunwareError('unknown', String(raw))
  }

  const first: Record<string, unknown> = Array.isArray(raw)
    ? (raw[0] ?? {})
    : (() => {
      const obj = raw as Record<string, unknown>
      if (Array.isArray(obj.errors)) {
        return (obj.errors[0] ?? {}) as Record<string, unknown>
      }
      // Pre-stream HTTP errors come as { error: {code, message}, taskUUID }
      if (obj.error && typeof obj.error === 'object' && !Array.isArray(obj.error)) {
        return {
          ...(obj.error as Record<string, unknown>),
          taskUUID: (obj.error as Record<string, unknown>).taskUUID ?? obj.taskUUID,
          taskType: (obj.error as Record<string, unknown>).taskType ?? obj.taskType,
        }
      }
      return obj
    })()

  return createRunwareError(
    (first.code as string) ?? 'unknown',
    (first.message as string) ?? 'An unknown API error occurred',
    {
      parameter: first.parameter as string | undefined,
      taskType: (first.taskType as string | undefined) ?? context?.taskType,
      taskUUID: first.taskUUID as string | undefined,
      model: (first.model as string | undefined) ?? context?.model,
    },
  )
}

export const isRunwareError = (error: unknown): error is RunwareError =>
  error instanceof RunwareError
