import { isUuid } from '../utils/uuid';
import { parseJwtClaims } from './jwtClaims';

/** Never send these scope slugs on HRM REST when legal UUID should be used (`du-lich.ceo` → `main`). */
export const HRM_WIRE_BLOCKED_SLUGS = new Set(['main']);

export function isHrmWireBlockedSlug(value: string | undefined | null): boolean {
  if (!value?.trim()) return false;
  return HRM_WIRE_BLOCKED_SLUGS.has(value.trim().toLowerCase());
}

export type WireMembership = {
  tenant_id: string;
  company_uuid: string;
  employee_id: string;
};

export type WireScopeInput = {
  companyUuid?: string;
  companyId?: string;
  accessToken?: string;
  memberships?: WireMembership[];
  employeeId?: string;
  tenantId?: string;
};

/**
 * Legal-entity UUID for `x-company-id` and `company_id` query/body on every HRM call.
 * Backfills from active membership, then JWT `company_uuid`, then UUID-shaped companyId.
 */
export function resolveWireCompanyId(input: WireScopeInput): string {
  const fromStore = input.companyUuid?.trim() ?? '';
  if (fromStore && isUuid(fromStore)) return fromStore;

  const employeeId = input.employeeId?.trim() ?? '';
  const tenantId = input.tenantId?.trim() ?? '';
  const memberships = input.memberships ?? [];
  if (employeeId && memberships.length) {
    const match =
      memberships.find(
        (m) =>
          m.employee_id === employeeId &&
          (!tenantId || m.tenant_id === tenantId) &&
          isUuid(m.company_uuid),
      ) ?? memberships.find((m) => isUuid(m.company_uuid));
    if (match?.company_uuid?.trim() && isUuid(match.company_uuid)) {
      return match.company_uuid.trim();
    }
  }

  const token = input.accessToken?.trim() ?? '';
  if (token) {
    const jwtUuid = parseJwtClaims(token)?.company_uuid?.trim();
    if (jwtUuid && isUuid(jwtUuid)) return jwtUuid;
  }

  const fromCompanyId = input.companyId?.trim() ?? '';
  if (fromCompanyId && isUuid(fromCompanyId)) return fromCompanyId;

  return '';
}

/**
 * `company_id` query param for payroll list APIs (`/payroll/periods`, `/payroll/payslips`).
 * Group CEO pilot seed uses slug `main` for BE rollup (`resolveHrmListScope`); legal UUID alone returns empty payslips.
 * `x-company-id` header still uses {@link resolveWireCompanyId} — never send slug `main` on the header.
 */
export function resolvePayrollQueryCompanyId(input: WireScopeInput): string {
  const scopeSlug = input.companyId?.trim().toLowerCase() ?? '';
  if (scopeSlug === 'main') return 'main';
  const wire = resolveWireCompanyId(input);
  if (wire) return wire;
  return scopeSlug;
}
