type LogCategory = typeof categories[number]

const categories = [
  'connection',
  'auth',
  'heartbeat',
  'send',
  'receive',
  'request',
  'retry',
  'error',
  'warn',
  'info',
] as const

export type LogEntry = {
  category: LogCategory
  message: string
  data?: unknown
  timestamp: string
}

export type LogSink = (entry: LogEntry) => void

const formatData = (data: unknown): string => {
  if (data === undefined || data === null) { return '' }
  if (typeof data === 'string') { return data }
  try {
    return JSON.stringify(data, null, 2)
  } catch {
    return '[unserializable]'
  }
}

const defaultSink: LogSink = (entry) => {
  const line = `[RUNWARE] [${entry.category.toUpperCase()}] ${entry.timestamp} ${entry.message}`
  const output = (entry.data !== undefined)
    ? `${line}\n${formatData(entry.data)}`
    : line

  if (entry.category === 'error') {
    console.error(output)
  } else if (entry.category === 'warn') {
    console.warn(output)
  } else {
    console.log(output)
  }
}

export type Logger = {
  readonly connection: (message: string, data?: unknown) => void
  readonly auth: (message: string, data?: unknown) => void
  readonly heartbeat: (message: string, data?: unknown) => void
  readonly send: (message: string, data?: unknown) => void
  readonly receive: (message: string, data?: unknown) => void
  readonly request: (message: string, data?: unknown) => void
  readonly retry: (message: string, data?: unknown) => void
  readonly error: (message: string, data?: unknown) => void
  readonly warn: (message: string, data?: unknown) => void
  readonly info: (message: string, data?: unknown) => void
}

const noop = (): void => {}

const noopLogger: Logger = {
  connection: noop,
  auth: noop,
  heartbeat: noop,
  send: noop,
  receive: noop,
  request: noop,
  retry: noop,
  error: noop,
  warn: noop,
  info: noop,
}

export const createLogger = (enabled: boolean, sink: LogSink = defaultSink): Logger => {
  if (!enabled) { return noopLogger }

  return Object.fromEntries(categories.map((category) => [
    category,
    (message: string, data?: unknown) => sink({
      category,
      message,
      data,
      timestamp: new Date().toISOString(),
    }),
  ])) as Logger
}
