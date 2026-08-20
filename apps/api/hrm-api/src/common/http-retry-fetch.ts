/**
 * Bounded HTTP GET helper: explicit timeout (AbortController) and limited retries
 * for transient upstream failures only (502/503/504 and network-level errors).
 * Client timeouts (AbortError) and 4xx responses are not retried.
 */

const DEFAULT_TIMEOUT_MS = 30_000;
const DEFAULT_MAX_ATTEMPTS = 3; // initial attempt + 2 retries

const TRANSIENT_HTTP_STATUSES = new Set([502, 503, 504]);

function isTransientHttpStatus(status: number): boolean {
  return TRANSIENT_HTTP_STATUSES.has(status);
}

function isAbortError(err: unknown): boolean {
  if (err instanceof DOMException && err.name === 'AbortError') return true;
  if (err instanceof Error && err.name === 'AbortError') return true;
  return false;
}

/** Network / DNS failures from `fetch`; excludes timeout abort. */
function isTransientNetworkError(err: unknown): boolean {
  if (isAbortError(err)) return false;
  return err instanceof TypeError;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export type FetchWithTimeoutAndRetryOptions = RequestInit & {
  timeoutMs?: number;
  /** Total attempts including the first (default 3 = up to 2 retries). */
  maxAttempts?: number;
};

export async function fetchWithTimeoutAndRetry(
  url: string,
  init: FetchWithTimeoutAndRetryOptions = {},
): Promise<Response> {
  const timeoutMs = init.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const maxAttempts = init.maxAttempts ?? DEFAULT_MAX_ATTEMPTS;
  const { timeoutMs: _t, maxAttempts: _m, ...requestInit } = init;

  let lastError: unknown;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(url, {
        ...requestInit,
        signal: controller.signal,
      });
      clearTimeout(timer);
      if (isTransientHttpStatus(response.status) && attempt < maxAttempts - 1) {
        await sleep(50 * 2 ** attempt);
        try {
          await response.body?.cancel();
        } catch {
          // ignore cancel errors
        }
        continue;
      }
      return response;
    } catch (err) {
      clearTimeout(timer);
      lastError = err;
      if (isTransientNetworkError(err) && attempt < maxAttempts - 1) {
        await sleep(50 * 2 ** attempt);
        continue;
      }
      throw err;
    }
  }
  throw lastError instanceof Error
    ? lastError
    : new Error('fetchWithTimeoutAndRetry failed');
}
