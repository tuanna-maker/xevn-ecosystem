import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  clearAuthSession,
  getStoredAccessToken,
  getStoredMembershipId,
  getValidAccessToken,
  handleUnauthorizedResponse,
  isStoredSessionExpired,
  MEMBERSHIP_LABEL_FALLBACK,
  membershipRoleDisplay,
  normalizePortalMembership,
  parseJwtMembershipId,
  persistAuthSession,
  peekLoginRedirect,
  stashLoginRedirect,
  type LoginResult,
} from './authSession';

function jwtWithClaims(claims: Record<string, unknown>): string {
  const header = btoa(JSON.stringify({ alg: 'none', typ: 'JWT' }));
  const payload = btoa(JSON.stringify(claims)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return `${header}.${payload}.sig`;
}

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

  it('re-hydrates CC shell sessionStorage from localStorage mirror (C-MEMCC-01)', () => {
    localStorage.setItem('xevn.portal.accessToken', 'mirror-jwt');
    localStorage.setItem('xevn.portal.user', JSON.stringify({ userId: 'du-lich.ceo@xe.vn', displayName: 'CEO DL' }));
    localStorage.setItem('xevn.portal.tokenExpiresAt', String(Date.now() + 3600_000));

    expect(getStoredAccessToken()).toBe('mirror-jwt');
    expect(sessionStorage.getItem('xevn.portal.accessToken')).toBe('mirror-jwt');
    expect(getValidAccessToken()).toBe('mirror-jwt');
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

/** P1-HRM-MEMBER-SESSION-403 — 403 is business-scope denial, not auth expiry. */
describe('handleUnauthorizedResponse (401-only logout)', () => {
  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
    persistAuthSession({ ...baseLogin, expiresInSec: 3600 });
  });

  afterEach(() => {
    clearAuthSession();
  });

  it('clears session on 401 and stashes current path for post-login redirect', () => {
    vi.stubGlobal('location', {
      ...window.location,
      pathname: '/command-center/hrm/employees',
      search: '',
    });
    handleUnauthorizedResponse(401);
    expect(getStoredAccessToken()).toBeNull();
    expect(peekLoginRedirect()).toBe('/command-center/hrm/employees');
    vi.unstubAllGlobals();
  });

  it('does not clear session on 403 (group-member-units member persona)', () => {
    handleUnauthorizedResponse(403);
    expect(getValidAccessToken()).toBe('test-jwt');
    expect(sessionStorage.getItem('xevn.portal.accessToken')).toBe('test-jwt');
  });
});

describe('selectPortalMembership (UC-HRM-SCOPE-04)', () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns new JWT payload on success', async () => {
    const mockFetch = vi.mocked(fetch);
    const accessToken = jwtWithClaims({
      sub: 'ceo@xe.vn',
      tenantId: 'xe-du-lich',
      membershipId: '22222222-2222-4222-8222-222222222222',
    });
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: {
          accessToken,
          expiresInSec: 86400,
          membership: {
            tenantId: 'xe-du-lich',
            companyId: 'main',
            roleCode: 'ceo',
            membershipId: '22222222-2222-4222-8222-222222222222',
            tenant_label: 'Xe Du Lịch',
            company_label: 'Công ty chính',
            role_label: 'CEO',
            tenant_kind_label: 'Công ty thành viên',
          },
          memberships: [],
          defaultTenantId: 'xe-du-lich',
          defaultCompanyId: 'main',
          defaultMembershipId: '22222222-2222-4222-8222-222222222222',
        },
      }),
    } as Response);

    const { selectPortalMembership } = await import('./authSession');
    const result = await selectPortalMembership('old-jwt', 'xe-du-lich');
    expect(result.accessToken).toBe(accessToken);
    expect(result.defaultMembershipId).toBe('22222222-2222-4222-8222-222222222222');
    expect(result.membership.role_label).toBe('CEO');
    expect(result.membership.tenant_label).toBe('Xe Du Lịch');
    expect(mockFetch).toHaveBeenCalledWith(
      '/api/xbos/auth/select-membership',
      expect.objectContaining({ method: 'POST' }),
    );
  });
});

describe('W1-B-04 display-ready membership + membershipId JWT', () => {
  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
  });

  afterEach(() => {
    clearAuthSession();
  });

  it('normalizePortalMembership binds BE labels and falls back to — (no invent)', () => {
    const row = normalizePortalMembership({
      tenantId: 'xevn',
      name: 'XeVN Group',
      shortName: 'XeVN',
      tenantKind: 'master',
      roleCode: 'group_ceo',
      companyId: 'main',
      isMaster: true,
      membershipId: '11111111-1111-4111-8111-111111111111',
      tenant_label: 'XeVN Group',
      company_label: 'Công ty chính',
      role_label: 'CEO Tập đoàn',
      tenant_kind_label: 'Tập đoàn',
    });
    expect(row.role_label).toBe('CEO Tập đoàn');
    expect(row.company_label).toBe('Công ty chính');
    expect(membershipRoleDisplay(row)).toBe('CEO Tập đoàn');

    const bare = normalizePortalMembership({
      tenantId: 'xe-du-lich',
      roleCode: 'subsidiary_ceo',
      companyId: 'main',
    });
    expect(bare.role_label).toBe(MEMBERSHIP_LABEL_FALLBACK);
    expect(bare.company_label).toBe(MEMBERSHIP_LABEL_FALLBACK);
    expect(membershipRoleDisplay(bare)).toBe(MEMBERSHIP_LABEL_FALLBACK);
  });

  it('persistAuthSession stores membershipId from JWT after select-membership path', () => {
    const accessToken = jwtWithClaims({
      membershipId: '33333333-3333-4333-8333-333333333333',
      tenantId: 'xevn',
    });
    persistAuthSession({
      ...baseLogin,
      accessToken,
      expiresInSec: 3600,
      defaultMembershipId: '33333333-3333-4333-8333-333333333333',
    });
    expect(getStoredMembershipId()).toBe('33333333-3333-4333-8333-333333333333');
    expect(parseJwtMembershipId(accessToken)).toBe('33333333-3333-4333-8333-333333333333');
    expect(localStorage.getItem('xevn.portal.membershipId')).toBe(
      '33333333-3333-4333-8333-333333333333',
    );
  });
});
