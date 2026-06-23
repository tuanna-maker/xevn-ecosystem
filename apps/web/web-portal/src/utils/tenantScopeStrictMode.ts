import { MASTER_TENANT_ID } from '../constants/tenant';
import { allowMockFallback, TENANT_SCOPE_FAILED_MESSAGE } from './mockPolicy';

export type TenantScopeFailureResolution<T> = {
  tenants: T[];
  selectedTenant: T;
  tenantScopeStatus: 'ready' | 'error';
  tenantScopeError: string | null;
  usingMockTenantFallback: boolean;
};

/** M-CC-11 — mock master tenant only when VITE_ALLOW_MOCK_FALLBACK=true. */
export function buildMockFallbackMasterTenant<T>(factory: () => T): T {
  return factory();
}

/**
 * M-CC-11 — tenant-scope/accessible failure: strict → empty + error banner; dev mock → single master row.
 */
export function resolveTenantScopeAccessibleFailure<T>(
  buildMockMaster: () => T,
  placeholder: T,
): TenantScopeFailureResolution<T> {
  if (allowMockFallback()) {
    const fallback = buildMockFallbackMasterTenant(buildMockMaster);
    return {
      tenants: [fallback],
      selectedTenant: fallback,
      tenantScopeStatus: 'ready',
      tenantScopeError: null,
      usingMockTenantFallback: true,
    };
  }
  return {
    tenants: [],
    selectedTenant: placeholder,
    tenantScopeStatus: 'error',
    tenantScopeError: TENANT_SCOPE_FAILED_MESSAGE,
    usingMockTenantFallback: false,
  };
}

export const MOCK_FALLBACK_MASTER_TENANT_ID = MASTER_TENANT_ID;
