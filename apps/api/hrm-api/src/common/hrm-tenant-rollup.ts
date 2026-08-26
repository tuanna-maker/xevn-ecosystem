import { getVerifiedInternalJwtPayload } from './internal-auth';
import {
  MASTER_TENANT_ID,
  resolveHrmPersistTenantId,
  type HrmListScope,
  type HrmListScopeContext,
} from './hrm-list-scope';

function readJwtClaim(
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

/** JWT tenant for catalog/HRM partition (member CEO → own tenant; group CEO → xevn). */
export function resolveHrmRequestTenantId(
  authorization: string | undefined,
  requestedCompanyId: string,
  scopeContext?: HrmListScopeContext,
): string {
  const fromPersist = resolveHrmPersistTenantId(
    authorization,
    requestedCompanyId,
    scopeContext,
  );
  if (fromPersist) return fromPersist;
  const jwt = getVerifiedInternalJwtPayload(authorization);
  const fromJwt = jwt
    ? readJwtClaim(jwt, 'tenantId', 'tenant_id', 'tid')
    : undefined;
  return fromJwt || MASTER_TENANT_ID;
}

/** Group CEO on master tenant — union catalogs across member tenants. */
export function shouldHrmGroupCeoTenantRollup(
  authorization: string | undefined,
  scope: HrmListScope,
  rollupTenantsRequested: boolean,
): boolean {
  if (!rollupTenantsRequested) return false;
  if (!scope.masterTenantPartition) return false;
  const jwt = getVerifiedInternalJwtPayload(authorization);
  if (!jwt) return false;
  const tenant = (
    readJwtClaim(jwt, 'tenantId', 'tenant_id', 'tid') ?? ''
  ).toLowerCase();
  const role = (
    readJwtClaim(jwt, 'roleCode', 'role_code', 'role') ?? ''
  ).toLowerCase();
  return (
    tenant === MASTER_TENANT_ID &&
    (role === 'group_ceo' || role.startsWith('group_'))
  );
}

/** Member/subsidiary CEO — restrict list to JWT tenant even when JWT is group-capable. */
export function narrowHrmScopeToRequestTenant(
  scope: HrmListScope,
  authorization: string | undefined,
  requestedCompanyId: string,
  scopeContext?: HrmListScopeContext,
): HrmListScope {
  const tenantId = resolveHrmRequestTenantId(
    authorization,
    requestedCompanyId,
    scopeContext,
  );
  return {
    ...scope,
    masterTenantPartition: tenantId === MASTER_TENANT_ID,
    memberTenantId: tenantId !== MASTER_TENANT_ID ? tenantId : undefined,
    tenantOnlyMode: scope.tenantOnlyMode ?? true,
    tenantIds: [tenantId],
  };
}

export function resolveCatalogTenantIdsForRollup(
  authorization: string | undefined,
  requestedCompanyId: string,
  scope: HrmListScope,
  rollupByTenant: boolean,
  scopeContext?: HrmListScopeContext,
): string[] {
  if (rollupByTenant && scope.tenantIds?.length) {
    return scope.tenantIds;
  }
  return [
    resolveHrmRequestTenantId(
      authorization,
      requestedCompanyId,
      scopeContext,
    ),
  ];
}
