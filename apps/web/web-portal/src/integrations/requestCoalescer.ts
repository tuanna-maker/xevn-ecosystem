/**
 * Request coalescer — collapses concurrent/near-simultaneous identical GET reads into a
 * single network flight (React-Query-style dedupe, but web-portal has no React Query).
 *
 * Why: Command Center / portal mounts fire the same endpoint 2–4× per page load because
 * multiple components each own a `useEffect` fetch and React StrictMode double-invokes effects
 * in dev (P1 residual — docs/qa/evidence/p1-hrm-console-audit-qa-retest-20260716.md).
 *
 * Behaviour:
 * - In-flight dedupe (always): while a key's promise is pending, extra callers reuse it.
 *   This is mutation-safe — once the promise settles the entry is dropped, so the next read
 *   (e.g. inbox reload after approve) fetches fresh.
 * - Optional short TTL micro-cache (`ttlMs`): bridges consumers that mount a few hundred ms
 *   apart (after the first flight resolved) and StrictMode remount-after-resolve. Only enable
 *   for read-only families with no mutate→refetch path (tenant scope, KPI rollup).
 *
 * SOLID: single responsibility (read coalescing). Integration fns opt-in per key; no change to
 * `xbosHttp` transport or API contracts.
 */

type CacheEntry = { value: unknown; at: number };

const inFlight = new Map<string, Promise<unknown>>();
const cache = new Map<string, CacheEntry>();

export type CoalesceOptions = {
  /** When > 0, a resolved value is reused for this many ms (default 0 = in-flight dedupe only). */
  ttlMs?: number;
  /** Injectable clock for deterministic tests. */
  now?: () => number;
};

/**
 * Run `factory` under `key`, sharing an in-flight promise across concurrent callers and
 * (optionally) reusing a recently resolved value within `ttlMs`.
 */
export function coalesceGet<T>(
  key: string,
  factory: () => Promise<T>,
  options: CoalesceOptions = {},
): Promise<T> {
  const ttlMs = options.ttlMs ?? 0;
  const now = options.now ?? Date.now;

  if (ttlMs > 0) {
    const cached = cache.get(key);
    if (cached && now() - cached.at < ttlMs) {
      return Promise.resolve(cached.value as T);
    }
  }

  const existing = inFlight.get(key);
  if (existing) {
    return existing as Promise<T>;
  }

  const promise = factory()
    .then((value) => {
      if (ttlMs > 0) {
        cache.set(key, { value, at: now() });
      }
      return value;
    })
    .finally(() => {
      // Drop the shared entry once settled so the next read starts a fresh flight.
      if (inFlight.get(key) === promise) {
        inFlight.delete(key);
      }
    });

  inFlight.set(key, promise);
  return promise as Promise<T>;
}

/**
 * Invalidate cached values (in-flight promises are left to settle). Pass a key prefix to clear a
 * family (e.g. after a mutation), or omit to clear everything.
 */
export function invalidateCoalesced(keyPrefix?: string): void {
  if (!keyPrefix) {
    cache.clear();
    return;
  }
  for (const key of [...cache.keys()]) {
    if (key.startsWith(keyPrefix)) {
      cache.delete(key);
    }
  }
}

/** Test-only: reset all coalescer state. */
export function __resetRequestCoalescerForTests(): void {
  inFlight.clear();
  cache.clear();
}
