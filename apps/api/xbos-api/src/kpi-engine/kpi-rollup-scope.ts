import { getVerifiedInternalJwtPayload } from '../common/internal-auth';
import { normalizePortalScopeRequest, resolveScopeContext } from '../common/scope-context';

const MASTER_TENANT_ID = 'xevn';
const GROUP_OPERATING_MAIN = 'main';
const GROUP_LEGAL_HOLDING = 'holding';

function readClaim(payload: Record<string, unknown>, ...keys: string[]): string | undefined {
  for (const key of keys) {
    const value = payload[key];
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }
  return undefined;
}

/** Group CEO JWT on `main` may request KPI rollup for `holding` (ADR M01 / view-completeness probe). */
export function resolveKpiRollupScopeContext(
  authorization: string | undefined,
  requested: { tenantId?: string; companyId?: string },
) {
  const jwtPayload = getVerifiedInternalJwtPayload(authorization) as Record<string, unknown> | null;
  const claimTenantId = jwtPayload ? readClaim(jwtPayload, 'tenantId', 'tenant_id', 'tid') : undefined;
  const claimCompanyId = jwtPayload ? readClaim(jwtPayload, 'companyId', 'company_id', 'cid') : undefined;
  const normalized = normalizePortalScopeRequest(claimTenantId, claimCompanyId, requested);
  const roleCode = (jwtPayload ? readClaim(jwtPayload, 'roleCode', 'role_code', 'role') ?? '' : '').toLowerCase();
  const requestedCompanyId = normalized.companyId?.trim().toLowerCase();
  const claimCompany = claimCompanyId?.trim().toLowerCase();

  const isGroupCeoOnMaster =
    claimTenantId === MASTER_TENANT_ID &&
    (roleCode === 'group_ceo' || roleCode.startsWith('group_'));

  if (
    isGroupCeoOnMaster &&
    claimCompany === GROUP_OPERATING_MAIN &&
    requestedCompanyId === GROUP_LEGAL_HOLDING
  ) {
    const scope = resolveScopeContext(authorization, {
      tenantId: normalized.tenantId ?? claimTenantId,
      companyId: GROUP_OPERATING_MAIN,
    });
    return { tenantId: scope.tenantId, companyId: GROUP_LEGAL_HOLDING };
  }

  return resolveScopeContext(authorization, normalized);
}
