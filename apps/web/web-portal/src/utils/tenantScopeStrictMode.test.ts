import { describe, expect, it, vi, afterEach } from 'vitest';
import { MASTER_TENANT_ID } from '../constants/tenant';
import { TENANT_SCOPE_FAILED_MESSAGE } from './mockPolicy';
import { resolveTenantScopeAccessibleFailure } from './tenantScopeStrictMode';

describe('tenantScopeStrictMode (M-CC-11)', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  const placeholder = { tenantId: '__loading__', name: 'loading' };
  const buildMock = () => ({
    tenantId: MASTER_TENANT_ID,
    name: 'Tập đoàn XeVN (mock fallback)',
    isMaster: true,
  });

  it('strict mode: accessible-tenant fail → empty tenants + error banner', () => {
    vi.stubEnv('DEV', 'true');
    vi.stubEnv('VITE_ALLOW_MOCK_FALLBACK', 'false');

    const result = resolveTenantScopeAccessibleFailure(buildMock, placeholder);

    expect(result.tenants).toEqual([]);
    expect(result.selectedTenant).toBe(placeholder);
    expect(result.tenantScopeStatus).toBe('error');
    expect(result.tenantScopeError).toBe(TENANT_SCOPE_FAILED_MESSAGE);
    expect(result.usingMockTenantFallback).toBe(false);
  });

  it('dev mock flag: accessible-tenant fail → single mock master tenant', () => {
    vi.stubEnv('DEV', 'true');
    vi.stubEnv('VITE_ALLOW_MOCK_FALLBACK', 'true');

    const result = resolveTenantScopeAccessibleFailure(buildMock, placeholder);

    expect(result.tenants).toHaveLength(1);
    expect(result.tenants[0]?.tenantId).toBe(MASTER_TENANT_ID);
    expect(result.tenantScopeStatus).toBe('ready');
    expect(result.tenantScopeError).toBeNull();
    expect(result.usingMockTenantFallback).toBe(true);
  });
});
