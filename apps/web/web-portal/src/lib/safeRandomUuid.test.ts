import { afterEach, describe, expect, it, vi } from 'vitest';
import { installSafeRandomUuidPolyfill, safeRandomUuid } from './safeRandomUuid';

describe('safeRandomUuid', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('uses native randomUUID when available', () => {
    vi.stubGlobal('crypto', { randomUUID: () => 'native-uuid' } as Crypto);
    expect(safeRandomUuid()).toBe('native-uuid');
  });

  it('returns RFC-4122 shape when randomUUID missing (HTTP pilot)', () => {
    vi.stubGlobal('crypto', { getRandomValues: (arr: Uint8Array) => arr.fill(0xaa) } as Crypto);
    const id = safeRandomUuid();
    expect(id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
  });

  it('installSafeRandomUuidPolyfill patches global crypto.randomUUID', () => {
    vi.stubGlobal('crypto', undefined);
    installSafeRandomUuidPolyfill();
    expect(typeof globalThis.crypto.randomUUID).toBe('function');
    expect(globalThis.crypto.randomUUID()).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
  });
});
