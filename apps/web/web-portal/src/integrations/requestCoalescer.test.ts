import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  __resetRequestCoalescerForTests,
  coalesceGet,
  invalidateCoalesced,
} from './requestCoalescer';

/** Deferred promise helper to hold a flight open across concurrent callers. */
function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

describe('requestCoalescer', () => {
  beforeEach(() => {
    __resetRequestCoalescerForTests();
  });

  it('shares one in-flight promise across concurrent callers with the same key', async () => {
    const d = deferred<number>();
    const factory = vi.fn(() => d.promise);

    const a = coalesceGet('k', factory);
    const b = coalesceGet('k', factory);
    const c = coalesceGet('k', factory);

    expect(factory).toHaveBeenCalledTimes(1);

    d.resolve(42);
    await expect(a).resolves.toBe(42);
    await expect(b).resolves.toBe(42);
    await expect(c).resolves.toBe(42);
  });

  it('does NOT share across different keys', async () => {
    const factory = vi.fn(async (v: string) => v);

    await Promise.all([
      coalesceGet('a', () => factory('a')),
      coalesceGet('b', () => factory('b')),
    ]);

    expect(factory).toHaveBeenCalledTimes(2);
  });

  it('re-fetches after settle when ttlMs is 0 (mutation-safe)', async () => {
    const factory = vi.fn(async () => 'v');

    await coalesceGet('k', factory);
    await coalesceGet('k', factory);

    expect(factory).toHaveBeenCalledTimes(2);
  });

  it('reuses a resolved value within ttlMs, then re-fetches after expiry', async () => {
    let clock = 1_000;
    const now = () => clock;
    const factory = vi.fn(async () => 'v');

    await coalesceGet('k', factory, { ttlMs: 30_000, now });
    clock = 10_000; // still inside window
    await coalesceGet('k', factory, { ttlMs: 30_000, now });
    expect(factory).toHaveBeenCalledTimes(1);

    clock = 40_000; // past 30s window
    await coalesceGet('k', factory, { ttlMs: 30_000, now });
    expect(factory).toHaveBeenCalledTimes(2);
  });

  it('invalidateCoalesced by prefix forces a fresh fetch of matching keys', async () => {
    const clock = 0;
    const now = () => clock;
    const factory = vi.fn(async () => 'v');

    await coalesceGet('fam:x', factory, { ttlMs: 30_000, now });
    invalidateCoalesced('fam:');
    await coalesceGet('fam:x', factory, { ttlMs: 30_000, now });

    expect(factory).toHaveBeenCalledTimes(2);
  });

  it('does not cache rejected flights (next call retries)', async () => {
    const factory = vi
      .fn<[], Promise<string>>()
      .mockRejectedValueOnce(new Error('boom'))
      .mockResolvedValueOnce('ok');

    await expect(coalesceGet('k', factory, { ttlMs: 30_000 })).rejects.toThrow('boom');
    await expect(coalesceGet('k', factory, { ttlMs: 30_000 })).resolves.toBe('ok');
    expect(factory).toHaveBeenCalledTimes(2);
  });
});
