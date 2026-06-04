import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { MEMBER_DEFAULT_COMPANY_ID, MASTER_TENANT_ID } from '../constants/tenant';
import { resolveIdentityScope } from './identityScope';
import { minimalScopeJwt } from '../test/jwtTestUtils';

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
