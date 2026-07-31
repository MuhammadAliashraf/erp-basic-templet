/** Async primitives used by the HTTP layer and long-running UI operations. */

export function sleep(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

export interface RetryOptions {
  retries?: number;
  /** Base delay; grows exponentially with full jitter on each attempt. */
  delayMs?: number;
  maxDelayMs?: number;
  /** Return false to fail fast — e.g. never retry a 4xx. */
  shouldRetry?: (error: unknown, attempt: number) => boolean;
  signal?: AbortSignal;
}

/**
 * Retries an operation with exponential backoff and jitter.
 *
 * Jitter matters at scale: without it, every client that failed during an
 * outage retries in lockstep and re-creates the thundering herd that caused it.
 */
export async function retry<T>(
  operation: (attempt: number) => Promise<T>,
  options: RetryOptions = {},
): Promise<T> {
  const {
    retries = 2,
    delayMs = 300,
    maxDelayMs = 8_000,
    shouldRetry = () => true,
    signal,
  } = options;

  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    if (signal?.aborted) throw signal.reason ?? new Error('Aborted');

    try {
      return await operation(attempt);
    } catch (error) {
      lastError = error;
      if (attempt === retries || !shouldRetry(error, attempt)) break;

      const backoff = Math.min(delayMs * 2 ** attempt, maxDelayMs);
      await sleep(backoff / 2 + Math.random() * (backoff / 2));
    }
  }

  throw lastError;
}

/** Rejects if the promise does not settle in time. */
export function withTimeout<T>(
  promise: Promise<T>,
  milliseconds: number,
  message = 'Operation timed out',
): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(message)), milliseconds);
    promise.then(resolve, reject).finally(() => clearTimeout(timer));
  });
}

/**
 * Wraps a promise into a Go-style `[error, value]` tuple.
 * Keeps call sites flat when a rejection is an expected outcome.
 */
export async function safeAwait<T>(promise: Promise<T>): Promise<[null, T] | [Error, null]> {
  try {
    return [null, await promise];
  } catch (error) {
    return [error instanceof Error ? error : new Error(String(error)), null];
  }
}
