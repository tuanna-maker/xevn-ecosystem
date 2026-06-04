import { HttpStatus } from '@nestjs/common';
import { ApiException } from '../common/api.exception';
import {
  isMasterTenant,
  MASTER_TENANT_ID,
  MEMBER_DEFAULT_COMPANY_ID,
} from '../common/tenant.constants';

/** Group catalog bootstrap plane (UC-ECO-MASTER-02 / SRS §8.2). */
export const MASTER_BOOTSTRAP_COMPANY_ID = 'holding';

export type TenantScopedScope = {
  tenantId: string;
  companyId: string;
};

/**
 * UC-ECO-MASTER-02 — group default catalogs must stay on master tenant `xevn` + `holding`
 * so member tenant rows are never overwritten by bootstrap.
 */
export function assertMasterGroupBootstrapScope(scope: TenantScopedScope): void {
  const tenantId = scope.tenantId.trim().toLowerCase();
  const companyId = scope.companyId.trim().toLowerCase();
  if (!isMasterTenant(tenantId) || companyId !== MASTER_BOOTSTRAP_COMPANY_ID) {
    throw new ApiException(
      'XBOS-TENANT-400',
      'Group catalog bootstrap is limited to master tenant holding scope',
      HttpStatus.BAD_REQUEST,
      {
        tenantId,
        companyId,
        expectedTenant: MASTER_TENANT_ID,
        expectedCompany: MASTER_BOOTSTRAP_COMPANY_ID,
      },
    );
  }
}

/** Member tenants use `main` as default company partition (SRS §10). */
export function resolveMemberBootstrapCompanyId(tenantId: string, companyHint?: string): string {
  if (isMasterTenant(tenantId)) {
    return companyHint?.trim().toLowerCase() || MASTER_BOOTSTRAP_COMPANY_ID;
  }
  return MEMBER_DEFAULT_COMPANY_ID;
}

/**
 * UC-ECO-MASTER-02 — cross-tenant destructive cleanup requires an explicit admin protection flag.
 */
export function assertCrossTenantCleanupAllowed(options: {
  targetTenantId: string;
  explicitAdminFlag?: boolean;
}): void {
  if (!options.explicitAdminFlag) {
    throw new ApiException(
      'XBOS-TENANT-409',
      'Cross-tenant cleanup requires explicit admin protection flag',
      HttpStatus.CONFLICT,
      { targetTenantId: options.targetTenantId.trim().toLowerCase() },
    );
  }
}

/** Validates seed/SQL helpers only touch one tenant partition. */
export function assertTenantScopedDeleteSql(sql: string, tenantId: string): void {
  const normalized = sql.replace(/\s+/g, ' ').toLowerCase();
  if (!normalized.includes('where tenant_id')) {
    throw new Error('Tenant-scoped delete must filter by tenant_id');
  }
  if (!normalized.includes('$1') && !normalized.includes(tenantId.toLowerCase())) {
    throw new Error('Tenant-scoped delete must bind target tenant');
  }
}
