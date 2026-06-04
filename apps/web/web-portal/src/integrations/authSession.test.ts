import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  clearAuthSession,
  getValidAccessToken,
  isStoredSessionExpired,
  persistAuthSession,
  type LoginResult,
} from './authSession';

const baseLogin: LoginResult = {
  accessToken: 'test-jwt',
  expiresInSec: 86400,
  user: { userId: 'ceo@xe.vn', displayName: 'CEO' },
  memberships: [],
  defaultTenantId: 'xe-du-lich',
  defaultCompanyId: 'co-1',
};

describe('authSession expiry', () => {
  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-22T10:00:00Z'));
  });

  afterEach(() => {
    clearAuthSession();
    vi.useRealTimers();
  });

  it('persists tokenExpiresAt from expiresInSec', () => {
    persistAuthSession({ ...baseLogin, expiresInSec: 3600 });
    expect(sessionStorage.getItem('xevn.portal.tokenExpiresAt')).toBe(
      String(Date.now() + 3600 * 1000),
    );
  });

  it('mirrors session to localStorage for same-origin HRM iframe', () => {
    persistAuthSession({ ...baseLogin, expiresInSec: 3600 });
    expect(localStorage.getItem('xevn.portal.accessToken')).toBe('test-jwt');
    expect(localStorage.getItem('xevn.portal.user')).toContain('ceo@xe.vn');
  });

  it('treats session as expired when past expiresAt', () => {
    persistAuthSession({ ...baseLogin, expiresInSec: 60 });
    vi.advanceTimersByTime(61_000);
    expect(isStoredSessionExpired()).toBe(true);
    expect(getValidAccessToken()).toBeNull();
    expect(sessionStorage.getItem('xevn.portal.accessToken')).toBeNull();
    expect(localStorage.getItem('xevn.portal.accessToken')).toBeNull();
  });

  it('returns token while before expiresAt', () => {
    persistAuthSession({ ...baseLogin, expiresInSec: 3600 });
    expect(isStoredSessionExpired()).toBe(false);
    expect(getValidAccessToken()).toBe('test-jwt');
  });
});

/** UC-ECO-FE-01 — portal session backs HRM embed API token (no mock-only auth). */
describe('UC-ECO-FE-01 portal API session bridge', () => {
  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-22T10:00:00Z'));
  });

  afterEach(() => {
    clearAuthSession();
    vi.useRealTimers();
  });

  it('UC-ECO-FE-01: persistAuthSession exposes access token for downstream API clients', () => {
    persistAuthSession({
      accessToken: 'portal-api-jwt',
      expiresInSec: 7200,
      user: { userId: 'ceo@xe.vn', displayName: 'CEO' },
      memberships: [
        {
          tenantId: 'xevn',
          name: 'XeVN Group',
          shortName: 'XeVN',
          tenantKind: 'master',
          roleCode: 'group_ceo',
          companyId: 'main',
          isMaster: true,
        },
      ],
      defaultTenantId: 'xevn',
      defaultCompanyId: 'main',
    });
    expect(getValidAccessToken()).toBe('portal-api-jwt');
    expect(localStorage.getItem('xevn.portal.accessToken')).toBe('portal-api-jwt');
  });
});
