/** Lifecycle of a serverless task. `pending` is the only non-terminal state. */
export type TaskStatus = 'pending' | 'completed' | 'failed'

/**
 * A serverless task, as both invoke routes and `getTask` return it.
 *
 * `output` and `completedAt` are set once `status` is `completed`; `error` is
 * set once it is `failed`. While `pending`, none of the three are.
 */
export type ServerlessTask = {
  /** Task identifier. The one sent with the invocation, generated when omitted. */
  id: string
  status: TaskStatus
  /**
   * App that owns the task. On a resubmitted id this can name a different app
   * than the one invoked, and it is the one to poll under.
   */
  appId: string
  endpointPath: string
  /** Handler return value on success, `null` otherwise. Any JSON value. */
  output: unknown
  /**
   * Failure message when `status` is `failed`, `null` otherwise. Free-form: it
   * carries no stable code and no retry signal, so don't parse it.
   */
  error: string | null
  createdAt: string
  completedAt: string | null
}

/**
 * How the caller waits for a task.
 *
 * - `async` takes an acknowledgement and polls. No connection is held, which
 *   is what long jobs want and what survives a dropped connection.
 * - `sync` holds the request open until the task is terminal, one round trip.
 *   Best-effort: a task that outlives the platform wait window comes back
 *   accepted rather than failed, and the SDK polls it from there. The fast
 *   path for work that finishes in seconds.
 *
 * Both return the finished task. The default is `async`, the same default
 * `run` takes and for the same reason.
 */
export type DeliveryMethod = 'sync' | 'async'

export type InvokeParams = {
  /** App to invoke. */
  appId: string
  /**
   * Endpoint to route to, as `listEndpoints` returns it: a bare lowercase
   * segment such as `generate`, with no leading slash.
   */
  endpointPath: string
  /** The body the handler receives, validated against the endpoint's input schema. */
  payload?: Record<string, unknown>
  /**
   * Task identifier, a lowercase UUID. Generated when omitted.
   *
   * One id is one task: sending it again returns the task it already names
   * instead of starting a second, so a call whose response was lost can be
   * repeated without paying for the work twice. Supply your own to make a
   * retry from a different process land on the same task.
   */
  taskId?: string
}

export type InvokeOptions = {
  /** How to wait for the task. Default: `async`. Ignored when `wait` is false. */
  deliveryMethod?: DeliveryMethod
  /**
   * Whether to return the finished task. Default: `true`.
   *
   * Set `false` to return as soon as the task is accepted, leaving it to run.
   * Read the id off the returned task and poll `getTask` when you want it.
   *
   * The task goes on the `async` route, which is already the default, so this
   * only overrides an explicit `deliveryMethod: 'sync'`. A `sync` invocation
   * always waits, because holding a request open for a result nobody is going
   * to read has nothing to offer.
   */
  wait?: boolean
  /** Seconds between polls while waiting. Default: 2. */
  pollInterval?: number
  /**
   * End-to-end budget in ms, measured from the start of the call rather than
   * from the first poll, so a long `sync` wait counts against it. Falls back
   * to `config.pollTimeout`. Giving up leaves the task running: poll
   * `getTask` to pick it back up.
   */
  pollTimeout?: number
  /**
   * Per-request timeout in ms for one HTTP call. Falls back to
   * `config.timeout`. A `sync` invocation raises it to at least five minutes
   * so the platform's own wait window decides the outcome rather than the
   * client giving up first.
   */
  timeout?: number
  /** Abort the call, and any polling it is doing. */
  signal?: AbortSignal
}

export type GetTaskOptions = {
  /** Per-request timeout in ms. Falls back to `config.timeout`. */
  timeout?: number
  signal?: AbortSignal
}
