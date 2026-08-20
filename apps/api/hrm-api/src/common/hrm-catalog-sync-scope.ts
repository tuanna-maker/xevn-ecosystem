import {
  HRM_PILOT_OPERATING_COMPANY_ID,
  MASTER_TENANT_ID,
  resolveHrmSettingsCatalogCompanyId,
} from './hrm-list-scope';
import { getVerifiedInternalJwtPayload } from './internal-auth';
import { resolveScopeContext } from './scope-context';

function readClaim(
  payload: Record<string, unknown>,
  ...keys: string[]
): string | undefined {
  for (const key of keys) {
    const value = payload[key];
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }
  return undefined;
}

/**
 * Group CEO may send catalog partition `holding` while JWT carries `main` (J-XBOS-02 / ADR §4).
 * Normalize to operating bucket before strict scope resolution.
 */
export function normalizeHrmCatalogSyncRequestCompanyId(
  authorization: string | undefined,
  requestedCompanyId: string | undefined,
): string | undefined {
  if (!requestedCompanyId?.trim()) {
    return requestedCompanyId;
  }
  const requested = requestedCompanyId.trim().toLowerCase();
  if (requested !== 'holding') {
    return requestedCompanyId.trim();
  }
  const jwtPayload = getVerifiedInternalJwtPayload(authorization);
  if (!jwtPayload) {
    return requestedCompanyId.trim();
  }
  const claimTenantId = readClaim(jwtPayload, 'tenantId', 'tenant_id', 'tid');
  const claimCompanyId = readClaim(
    jwtPayload,
    'companyId',
    'company_id',
    'cid',
  );
  if (
    claimTenantId === MASTER_TENANT_ID &&
    claimCompanyId === HRM_PILOT_OPERATING_COMPANY_ID
  ) {
    return HRM_PILOT_OPERATING_COMPANY_ID;
  }
  return requestedCompanyId.trim();
}

export type HrmCatalogSyncScope = {
  tenantId: string;
  catalogCompanyId: string;
};

/** Tenant + persisted catalog partition (`holding` for group CEO on master). */
export function resolveHrmCatalogSyncScope(
  authorization: string | undefined,
  requested: { tenantId?: string; companyId?: string },
): HrmCatalogSyncScope {
  const tenantId = requested.tenantId?.trim();
  const companyId = normalizeHrmCatalogSyncRequestCompanyId(
    authorization,
    requested.companyId,
  );
  const scope = resolveScopeContext(authorization, { tenantId, companyId });
  const catalogCompanyId = resolveHrmSettingsCatalogCompanyId(
    authorization,
    scope.tenantId,
    scope.companyId,
  );
  return { tenantId: scope.tenantId, catalogCompanyId };
}
