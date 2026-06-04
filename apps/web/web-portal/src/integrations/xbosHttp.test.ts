import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mergeRequestHeaders, xbosFetch } from './xbosHttp';

describe('mergeRequestHeaders', () => {
  it('dedupes content-type and Content-Type to a single entry', () => {
    const merged = mergeRequestHeaders(
      { 'content-type': 'application/json', Authorization: 'Bearer t' },
      { 'Content-Type': 'application/json' },
    );
    const keys = Object.keys(merged).filter((k) => k.toLowerCase() === 'content-type');
    expect(keys).toHaveLength(1);
    expect(merged['Content-Type']).toBe('application/json');
    expect(merged['content-type']).toBeUndefined();
    expect(merged.Authorization).toBe('Bearer t');
  });

  it('later layer wins for case-insensitive header keys', () => {
    const merged = mergeRequestHeaders(
      { 'x-company-id': 'main' },
      { 'X-Company-Id': 'co-1' },
    );
    expect(Object.keys(merged).filter((k) => k.toLowerCase() === 'x-company-id')).toHaveLength(1);
    expect(merged['X-Company-Id']).toBe('co-1');
  });

  it('preserves unrelated headers from all layers', () => {
    const merged = mergeRequestHeaders(
      { 'content-type': 'application/json', Authorization: 'Bearer a' },
      { 'x-tenant-id': 'xe-du-lich' },
      { 'Content-Type': 'application/json', 'x-company-id': 'main' },
    );
    expect(merged.Authorization).toBe('Bearer a');
    expect(merged['x-tenant-id']).toBe('xe-du-lich');
    expect(merged['x-company-id']).toBe('main');
    expect(Object.keys(merged).filter((k) => k.toLowerCase() === 'content-type')).toHaveLength(1);
  });
});

describe('xbosFetch buildHeaders integration', () => {
  beforeEach(() => {
    sessionStorage.setItem('xevn.portal.accessToken', 'test.jwt.token');
    sessionStorage.setItem(
      'xevn.portal.tokenExpiresAt',
      String(Date.now() + 3600_000),
    );
    vi.stubGlobal(
      'fetch',
      vi.fn(async (_url: string, init?: RequestInit) => {
        const raw = init?.headers;
        const headerPairs: Array<[string, string]> =
          raw instanceof Headers
            ? Array.from(raw.entries())
            : Array.isArray(raw)
              ? raw
              : Object.entries((raw as Record<string, string>) ?? {});
        const contentTypeKeys = headerPairs.filter(
          ([k]) => k.toLowerCase() === 'content-type',
        );
        expect(contentTypeKeys).toHaveLength(1);
        return {
          ok: true,
          json: async () => ({ data: { id: 'le-1' } }),
        } as Response;
      }),
    );
  });

  afterEach(() => {
    sessionStorage.clear();
    vi.unstubAllGlobals();
  });

  it('sends single Content-Type when init adds Content-Type over auth content-type', async () => {
    await xbosFetch('/org-foundation/legal-entities/le-1', {
      method: 'PUT',
      tenantId: 'xe-du-lich',
      companyId: 'main',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: 'XE_DU_LICH', name: 'Test' }),
    });
    expect(fetch).toHaveBeenCalledOnce();
  });
});
