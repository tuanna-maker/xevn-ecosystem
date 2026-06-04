import { afterEach, describe, expect, it } from 'vitest';
import {
  applyPortalSession,
  clearPortalSession,
  getPortalAccessToken,
  hasPortalSession,
  PORTAL_SESSION_READY_EVENT,
  waitForPortalAccessToken,
} from './portalAuthBridge';

const STORAGE_TOKEN = 'xevn.portal.accessToken';
const STORAGE_TOKEN_EXPIRES = 'xevn.portal.tokenExpiresAt';
const STORAGE_USER = 'xevn.portal.user';

describe('portalAuthBridge', () => {
  afterEach(() => {
    sessionStorage.clear();
    localStorage.clear();
  });

  it('returns token when not expired', () => {
    sessionStorage.setItem(STORAGE_TOKEN, 'jwt-test');
    sessionStorage.setItem(STORAGE_TOKEN_EXPIRES, String(Date.now() + 60_000));
    expect(getPortalAccessToken()).toBe('jwt-test');
    expect(hasPortalSession()).toBe(true);
  });

  it('returns null when expired', () => {
    sessionStorage.setItem(STORAGE_TOKEN, 'jwt-test');
    sessionStorage.setItem(STORAGE_TOKEN_EXPIRES, String(Date.now() - 1));
    expect(getPortalAccessToken()).toBeNull();
  });

  it('reads token from localStorage mirror when iframe sessionStorage is empty', () => {
    localStorage.setItem(STORAGE_TOKEN, 'jwt-from-parent');
    localStorage.setItem(STORAGE_TOKEN_EXPIRES, String(Date.now() + 60_000));
    expect(getPortalAccessToken()).toBe('jwt-from-parent');
  });

  it('applyPortalSession writes both storages and emits ready event', () => {
    let ready = false;
    window.addEventListener(PORTAL_SESSION_READY_EVENT, () => {
      ready = true;
    });
    applyPortalSession({
      accessToken: 'jwt-embed',
      user: { userId: 'ceo@xe.vn', displayName: 'CEO' },
      expiresAt: Date.now() + 60_000,
    });
    expect(sessionStorage.getItem(STORAGE_TOKEN)).toBe('jwt-embed');
    expect(localStorage.getItem(STORAGE_TOKEN)).toBe('jwt-embed');
    expect(sessionStorage.getItem(STORAGE_USER)).toContain('ceo@xe.vn');
    expect(ready).toBe(true);
  });

  it('clearPortalSession removes portal JWT keys from both storages', () => {
    sessionStorage.setItem(STORAGE_TOKEN, 'jwt-test');
    localStorage.setItem(STORAGE_TOKEN, 'jwt-test');
    sessionStorage.setItem(STORAGE_TOKEN_EXPIRES, String(Date.now() + 60_000));
    clearPortalSession();
    expect(hasPortalSession()).toBe(false);
    expect(localStorage.getItem(STORAGE_TOKEN)).toBeNull();
  });

  it('waitForPortalAccessToken resolves when session-ready event arrives', async () => {
    const pending = waitForPortalAccessToken(2000);
    setTimeout(() => {
      applyPortalSession({
        accessToken: 'jwt-delayed',
        user: { userId: 'ceo@xe.vn', displayName: 'CEO' },
        expiresAt: Date.now() + 60_000,
      });
    }, 10);

    await expect(pending).resolves.toBe('jwt-delayed');
  });

  it('waitForPortalAccessToken returns null on timeout without token', async () => {
    await expect(waitForPortalAccessToken(5)).resolves.toBeNull();
  });
});
