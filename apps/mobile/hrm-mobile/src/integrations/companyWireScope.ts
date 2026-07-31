import { isUuid } from '../utils/uuid';
import { parseJwtClaims } from './jwtClaims';

function pickActiveMembership(input: WireScopeInput): WireMembership | undefined {
  const memberships = input.memberships ?? [];
  if (!memberships.length) return undefined;

  const employeeId = input.employeeId?.trim() ?? '';
  const tenantId = input.tenantId?.trim() ?? '';
  return (
    memberships.find(
      (m) =>
        m.employee_id === employeeId &&
        (!tenantId || m.tenant_id === tenantId),
    ) ??
    memberships.find((m) => m.employee_id === employeeId) ??
    memberships[0]
  );
}

/** Workforce / member operating slug from active membership (any non-blocked TEXT slug). */
function resolveMembershipScopeSlug(input: WireScopeInput): string {
  const active = pickActiveMembership(input);
  const slug = active?.company_id?.trim().toLowerCase() ?? '';
  if (slug && !isUuid(slug) && !isHrmWireBlockedSlug(slug)) return slug;

  const wireUuid =
    (input.companyUuid?.trim() && isUuid(input.companyUuid.trim())
      ? input.companyUuid.trim()
      : '') ||
    (input.companyId?.trim() && isUuid(input.companyId.trim()) ? input.companyId.trim() : '');
  if (!wireUuid) return '';

  const memberships = input.memberships ?? [];
  const employeeId = input.employeeId?.trim() ?? '';
  const tenantId = input.tenantId?.trim() ?? '';
  const byUuid =
    memberships.find(
      (m) =>
        m.company_uuid?.trim() === wireUuid &&
        m.employee_id === employeeId &&
        (!tenantId || m.tenant_id === tenantId),
    ) ?? memberships.find((m) => m.company_uuid?.trim() === wireUuid);
  const recovered = byUuid?.company_id?.trim().toLowerCase() ?? '';
  if (recovered && !isUuid(recovered) && !isHrmWireBlockedSlug(recovered)) return recovered;

  return '';
}

function rollupSlugFromMemberships(input: WireScopeInput): string {
  const slug = pickActiveMembership(input)?.company_id?.trim().toLowerCase() ?? '';
  return slug && HOME_SUMMARY_QUERY_SCOPE_SLUGS.has(slug) ? slug : '';
}

/** Never send these scope slugs on HRM REST when legal UUID should be used (`du-lich.ceo` → `main`). */
export const HRM_WIRE_BLOCKED_SLUGS = new Set(['main']);

/** Payroll DB rows use TEXT company slugs; query must send rollup slug, not legal UUID alone. */
export const PAYROLL_QUERY_SCOPE_SLUGS = new Set(['main', 'holding']);

/** Home summary workforce blocks (celebrations, whos_out) use the same rollup slug as payroll. */
export const HOME_SUMMARY_QUERY_SCOPE_SLUGS = PAYROLL_QUERY_SCOPE_SLUGS;

/** Leave balance reads `employee_leave_balances` under TEXT company slugs (`holding`, …). */
export const LEAVE_BALANCE_QUERY_SCOPE_SLUGS = PAYROLL_QUERY_SCOPE_SLUGS;

export function isHrmWireBlockedSlug(value: string | undefined | null): boolean {
  if (!value?.trim()) return false;
  return HRM_WIRE_BLOCKED_SLUGS.has(value.trim().toLowerCase());
}

export type WireMembership = {
  tenant_id: string;
  company_uuid: string;
  employee_id: string;
  /** Membership scope slug (holding, main, …) — used to recover rollup query when companyId is legal UUID. */
  company_id?: string;
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
  if (scopeSlug && PAYROLL_QUERY_SCOPE_SLUGS.has(scopeSlug)) return scopeSlug;
  const wire = resolveWireCompanyId(input);
  if (wire) return wire;
  return scopeSlug;
}

/**
 * `company_id` query param for GET `/home/summary` (celebrations + whos_out workforce rollup).
 * D-W7-HOME-WHOS-SLUG-01: slug `holding` scopes whos_out via workforce IN — legal UUID alone returns empty items.
 */
export function resolveHomeSummaryQueryCompanyId(input: WireScopeInput): string {
  const scopeSlug = input.companyId?.trim().toLowerCase() ?? '';
  if (scopeSlug && HOME_SUMMARY_QUERY_SCOPE_SLUGS.has(scopeSlug)) return scopeSlug;

  const fromMembership = rollupSlugFromMemberships(input);
  if (fromMembership) return fromMembership;

  const token = input.accessToken?.trim() ?? '';
  if (token) {
    const jwtSlug = parseJwtClaims(token)?.companyId?.trim().toLowerCase() ?? '';
    if (jwtSlug && HOME_SUMMARY_QUERY_SCOPE_SLUGS.has(jwtSlug)) return jwtSlug;
  }

  const wire = resolveWireCompanyId(input);
  if (wire) return wire;
  return scopeSlug;
}

/**
 * `company_id` query param for `POST /files/upload` (employee-avatar).
 * ADR-HRM-RBAC-SCOPE-LADDER: rollup slug (`holding`/`main`) on query; legal UUID on `x-company-id` header.
 * Same recovery as {@link resolveHomeSummaryQueryCompanyId} (PCOMP-W7-MOB-WHOS-OUT-02).
 */
export function resolveAvatarUploadQueryCompanyId(input: WireScopeInput): string {
  return resolveHomeSummaryQueryCompanyId(input);
}

/**
 * `company_id` query param for GET `/employees?view=directory` (+ detail).
 * PCOMP-W7-MOB-DIRECTORY-01 / API_DESIGN_HRM_EMPLOYEES: Plane B TEXT slug
 * (`holding`, `trsport`, `main` rollup) — never LE UUID when membership slug recoverable.
 * Header `x-company-id` still uses {@link resolveHrmCompanyHeaderId} (may be UUID for `main`).
 */
export function resolveDirectoryQueryCompanyId(input: WireScopeInput): string {
  const scopeSlug = input.companyId?.trim().toLowerCase() ?? '';

  // Group CEO rollup — query accepts `main` (unlike wire header blocked set).
  if (scopeSlug === 'main') return 'main';

  if (scopeSlug && !isUuid(scopeSlug) && !isHrmWireBlockedSlug(scopeSlug)) {
    return scopeSlug;
  }

  const fromMembership = resolveMembershipScopeSlug(input);
  if (fromMembership) return fromMembership;

  const token = input.accessToken?.trim() ?? '';
  if (token) {
    const jwtSlug = parseJwtClaims(token)?.companyId?.trim().toLowerCase() ?? '';
    if (jwtSlug === 'main') return 'main';
    if (jwtSlug && !isHrmWireBlockedSlug(jwtSlug) && !isUuid(jwtSlug)) return jwtSlug;
  }

  const rollupMembership = rollupSlugFromMemberships(input);
  if (rollupMembership) return rollupMembership;

  if (scopeSlug === 'main' || (scopeSlug && HOME_SUMMARY_QUERY_SCOPE_SLUGS.has(scopeSlug))) {
    return scopeSlug;
  }

  // ESS peer default — honest Plane B slug, not LE UUID
  return 'holding';
}

/**
 * `company_id` query param for GET `/attendance/leave-balance`.
 * D-W8-MOB-BAL-UI-01 / P1-LEAVE-BALANCE-DEVICE-01 / PCOMP-W7-MOB-LEAVE-BAL-02:
 * Plane B TEXT slug — same resolver as directory/profile (`holding`, `trsport`, `main` rollup);
 * never LE UUID when membership/JWT slug recoverable.
 */
export function resolveLeaveBalanceQueryCompanyId(input: WireScopeInput): string {
  return resolveDirectoryQueryCompanyId(input);
}
