import test from 'node:test';
import assert from 'node:assert/strict';
import { resolvePortalBase } from './portal-base-resolver.mjs';

test('uses explicit PORTAL_DEV_URL when provided', async () => {
  const resolved = await resolvePortalBase({
    portalDevUrl: 'http://127.0.0.1:5999/',
    fetchImpl: async () => {
      throw new Error('fetch should not be called when env override exists');
    },
  });
  assert.equal(resolved, 'http://127.0.0.1:5999');
});

test('prefers first reachable candidate (5173 before 5175)', async () => {
  const calls = [];
  const fetchImpl = async (url) => {
    calls.push(url);
    return {
      ok: url.startsWith('http://127.0.0.1:5173'),
      async json() {
        return { data: { accessToken: 'token' } };
      },
    };
  };
  const resolved = await resolvePortalBase({ fetchImpl });
  assert.equal(resolved, 'http://127.0.0.1:5173');
  assert.ok(calls[0].startsWith('http://127.0.0.1:5173'));
});

test('falls back to 5175 when 5173 unavailable', async () => {
  const fetchImpl = async (url) => {
    if (url.startsWith('http://127.0.0.1:5173')) {
      throw new Error('connection refused');
    }
    return {
      ok: true,
      async json() {
        return { data: { accessToken: 'token' } };
      },
    };
  };
  const resolved = await resolvePortalBase({ fetchImpl });
  assert.equal(resolved, 'http://127.0.0.1:5175');
});
