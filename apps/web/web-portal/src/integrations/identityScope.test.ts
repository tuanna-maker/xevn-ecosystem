import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { MEMBER_DEFAULT_COMPANY_ID, MASTER_TENANT_ID } from '../constants/tenant';
import { resolveIdentityScope } from './identityScope';
import { minimalScopeJwt } from '../test/jwtTestUtils';

const MEMBER_TENANT_ID = 'xe-du-lich';

describe('resolveIdentityScope (master tenant)', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_STRICT_IDENTITY', 'true');
    vi.stubEnv('VITE_ALLOW_MOCK_FALLBACK', 'false');
    sessionStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    sessionStorage.clear();
  });

  it('rejects tenant slug mistaken as JWT companyId on master tenant (HTTPS pilot)', () => {
    const jwt = minimalScopeJwt(MASTER_TENANT_ID, MASTER_TENANT_ID);
    sessionStorage.setItem('xevn.portal.accessToken', jwt);
    vi.stubEnv('VITE_SERVICE_JWT_TOKEN', jwt);

    const scope = resolveIdentityScope(MASTER_TENANT_ID, null);
    expect(scope.tenantId).toBe(MASTER_TENANT_ID);
    expect(scope.companyId).toBe(MEMBER_DEFAULT_COMPANY_ID);
  });
});

describe('resolveIdentityScope (member CEO — C-MEMCC-01)', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_STRICT_IDENTITY', 'true');
    vi.stubEnv('VITE_ALLOW_MOCK_FALLBACK', 'false');
    vi.stubEnv('VITE_DEFAULT_TENANT_ID', MASTER_TENANT_ID);
    sessionStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    sessionStorage.clear();
  });

  it('prefers JWT member tenant over master placeholder hint (CC embed boot)', () => {
    const jwt = minimalScopeJwt(MEMBER_TENANT_ID, MEMBER_DEFAULT_COMPANY_ID);
    sessionStorage.setItem('xevn.portal.accessToken', jwt);

    const scope = resolveIdentityScope(MASTER_TENANT_ID, null);
    expect(scope.tenantId).toBe(MEMBER_TENANT_ID);
    expect(scope.companyId).toBe(MEMBER_DEFAULT_COMPANY_ID);
  });

  it('keeps member tenant + main when UI hint matches JWT (du-lich.ceo@xe.vn)', () => {
    const jwt = minimalScopeJwt(MEMBER_TENANT_ID, MEMBER_DEFAULT_COMPANY_ID);
    sessionStorage.setItem('xevn.portal.accessToken', jwt);

    const scope = resolveIdentityScope(MEMBER_TENANT_ID, null);
    expect(scope.tenantId).toBe(MEMBER_TENANT_ID);
    expect(scope.companyId).toBe(MEMBER_DEFAULT_COMPANY_ID);
  });

  it('normalizes holding hint to main for member HRM operational scope', () => {
    const jwt = minimalScopeJwt(MEMBER_TENANT_ID, MEMBER_DEFAULT_COMPANY_ID);
    sessionStorage.setItem('xevn.portal.accessToken', jwt);

    const scope = resolveIdentityScope(MEMBER_TENANT_ID, 'holding');
    expect(scope.tenantId).toBe(MEMBER_TENANT_ID);
    expect(scope.companyId).toBe(MEMBER_DEFAULT_COMPANY_ID);
  });
});
