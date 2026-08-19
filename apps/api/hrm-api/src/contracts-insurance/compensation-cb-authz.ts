/**
 * @CODE-MEMORY
 * Screen:     HRM C&B AuthZ (compensation-packages)
 * UC:         UC-BP-CORE-02 · FR-UC-BP-CORE-02 Diễn biến #1
 * BR:         BR-BP-SEC-02 · O4 AuthZ + access audit
 * SRS:        SRS_HRM_ENTERPRISE.md FR-UC-BP-CORE-02
 * TechSpec:   docs/program/specs/PO-HRM-MVP-GD1-CORE-02-CLUSTER-API-01.md §5.1 · §7
 * Purpose:    Gate open/mutate vòng mật C&B by membership / view_salary peer;
 *             mint HRM-CORE-CB-AUTHZ-403; append access audit residual.
 * WorkItem:   PO-HRM-MVP-GD1-CORE-02-CLUSTER-BE-01
 * Coded:      2026-08-09
 * Callers:    employee-compensation.service.ts
 * Callees:    getVerifiedInternalJwtPayload · HrmDbService.query → hrm_cb_access_audit
 * must_keep:  HRM-CORE-CB-403 public ≠ this code · Nest /core DENY · no seed
 * SOLID:      AuthZ + audit isolated from package versioning SRP
 * LastVerified: po-hrm-mvp-gd1-core-02-cluster-be-01.spec.ts
 *
 * @CODE-MEMORY-CHANGE 2026-08-12 D-BE-CTR-CB-BOOT-01
 * change_mode: ADD
 * What: Quyền bootstrap C&B đọc từ claim/membership C&B; vai trò HCNS/phòng ban/chức danh không tự cấp quyền.
 * Why: BA-CTR-INSURANCE-SALARY-SOURCE-01 §10b · BR-CTR-CB-BOOT-04.
 * must_keep: HRM-CORE-CB-AUTHZ-403; tài khoản chủ nền tảng giữ quyền ngầm; không mở public EMP.
 */

import { HttpStatus } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { ApiException } from '../common/api.exception';
import { getVerifiedInternalJwtPayload } from '../common/internal-auth';
import { HrmDbService } from '../db/hrm-db.service';

export const HRM_CORE_CB_AUTHZ_403 = 'HRM-CORE-CB-AUTHZ-403';
export const HRM_CORE_CB_VAL_400 = 'HRM-CORE-CB-VAL-400';
/** Optional 1:1 alias of LIVE HRM-COMP-409-OVERLAP (same semantics). */
export const HRM_CORE_CB_OVERLAP_409 = 'HRM-CORE-CB-OVERLAP-409';

export type CbAccessAction = 'open' | 'mutate';

const CB_ROLE_DENY_RE = /^(employee|driver|mobile|mobile_user|self_service)$/i;
const CB_PLATFORM_OWNER_ROLE_RE = /^(group_ceo|ceo_group|admin|system_admin)$/i;

function readRole(payload: Record<string, unknown>): string {
  const candidate = payload.roleCode ?? payload.role_code ?? payload.role;
  return typeof candidate === 'string' ? candidate.trim().toLowerCase() : '';
}

function normalizeUnknownString(value: unknown): string {
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
}

function permissionGrantsCbAccess(
  permission: unknown,
  action: CbAccessAction,
): boolean {
  if (typeof permission === 'string') {
    const value = permission.trim().toLowerCase();
    if (
      value === 'view_salary' ||
      value === 'employees:view_salary' ||
      value.includes('view_salary') ||
      value === 'cb' ||
      value === 'cb_membership'
    ) {
      return true;
    }
    const cbResource =
      value.includes('compensation') ||
      value.startsWith('cb:') ||
      value.startsWith('c&b:') ||
      value.startsWith('c_and_b:');
    if (!cbResource) return false;
    if (action === 'open') return true;
    return /(^|:)(manage|write|mutate|create|update)$/.test(value);
  }
  if (!permission || typeof permission !== 'object') return false;
  const row = permission as {
    module?: unknown;
    resource?: unknown;
    action?: unknown;
  };
  const mod = normalizeUnknownString(row.module ?? row.resource);
  const act = normalizeUnknownString(row.action);
  if (act === 'view_salary') return true;
  const cbModule =
    mod === 'employees' ||
    mod === 'compensation' ||
    mod === 'payroll' ||
    mod === 'contracts' ||
    mod === 'cb' ||
    mod === 'c&b';
  if (!cbModule) return false;
  return action === 'open'
    ? ['view', 'read', 'manage', 'write', 'view_salary'].includes(act)
    : ['manage', 'write', 'mutate', 'create', 'update', 'view_salary'].includes(
        act,
      );
}

function readMembershipPermissions(
  payload: Record<string, unknown>,
): unknown[] {
  const memberships = payload.memberships;
  if (!Array.isArray(memberships)) return [];
  const result: unknown[] = [];
  for (const membership of memberships as unknown[]) {
    if (!membership || typeof membership !== 'object') continue;
    const row = membership as {
      active?: unknown;
      is_active?: unknown;
      cb_membership?: unknown;
      permissions?: unknown;
      perms?: unknown;
      actions?: unknown;
    };
    if (row.active === false || row.is_active === false) continue;
    const permissions = row.permissions ?? row.perms ?? row.actions;
    if (Array.isArray(permissions)) {
      for (const permission of permissions as unknown[])
        result.push(permission);
    }
    if (row.cb_membership === true) result.push('cb_membership');
  }
  return result;
}

function claimHasViewSalaryOrCb(
  payload: Record<string, unknown>,
  action: CbAccessAction,
): boolean {
  if (payload.view_salary === true || payload.viewSalary === true) return true;
  if (payload.cb_membership === true || payload.cbMembership === true)
    return true;
  const perms = payload.permissions ?? payload.perms ?? payload.actions;
  const directPermissions: unknown[] = [];
  if (Array.isArray(perms)) {
    for (const permission of perms as unknown[])
      directPermissions.push(permission);
  }
  return directPermissions
    .concat(readMembershipPermissions(payload))
    .some((permission) => permissionGrantsCbAccess(permission, action));
}

/**
 * C&B membership SoT for GĐ1:
 * - Explicit JWT view_salary / cb_membership / permissions → allow
 * - Platform owner roles (group_ceo/system_admin) keep implicit entitlement
 * - HCNS/C&B/payroll role, department or title alone does not grant access
 * - Deny plain employee / driver
 * - subsidiary_ceo / member unit CEO without membership claim → deny (BA O4)
 */
export function hasCompensationCbMembership(
  authorization: string | undefined,
  action: CbAccessAction = 'open',
): boolean {
  const payload = getVerifiedInternalJwtPayload(authorization);
  if (!payload) return false;
  if (claimHasViewSalaryOrCb(payload, action)) return true;
  const role = readRole(payload);
  if (!role) return false;
  if (CB_ROLE_DENY_RE.test(role)) return false;
  if (
    role.includes('subsidiary') ||
    role === 'member_ceo' ||
    role.includes('member_ceo')
  ) {
    return false;
  }
  return CB_PLATFORM_OWNER_ROLE_RE.test(role);
}

export function formatAmountDisplayVi(amount: number): string {
  if (!Number.isFinite(amount)) return '—';
  return new Intl.NumberFormat('vi-VN').format(amount);
}

export async function ensureCbAccessAuditSchema(
  db: HrmDbService,
): Promise<void> {
  await db.query(`
    CREATE TABLE IF NOT EXISTS public.hrm_cb_access_audit (
      id UUID PRIMARY KEY,
      company_id TEXT NULL,
      actor_sub TEXT NULL,
      actor_role TEXT NULL,
      action TEXT NOT NULL,
      resource_kind TEXT NOT NULL DEFAULT 'compensation_package',
      resource_id TEXT NULL,
      employee_id UUID NULL,
      outcome TEXT NOT NULL,
      detail JSONB NOT NULL DEFAULT '{}'::jsonb,
      occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  await db.query(`
    CREATE INDEX IF NOT EXISTS ix_hrm_cb_access_audit_actor_time
    ON public.hrm_cb_access_audit (actor_sub, occurred_at DESC);
  `);
  await db.query(`
    CREATE INDEX IF NOT EXISTS ix_hrm_cb_access_audit_emp_time
    ON public.hrm_cb_access_audit (employee_id, occurred_at DESC)
    WHERE employee_id IS NOT NULL;
  `);
}

async function appendCbAccessAudit(
  db: HrmDbService,
  input: {
    companyId?: string | null;
    authorization?: string;
    action: CbAccessAction;
    resourceId?: string | null;
    employeeId?: string | null;
    outcome: 'allowed' | 'denied';
    detail?: Record<string, unknown>;
  },
): Promise<void> {
  try {
    const payload = getVerifiedInternalJwtPayload(input.authorization);
    const actorSub =
      payload && typeof payload.sub === 'string'
        ? payload.sub.trim().toLowerCase()
        : null;
    const actorRole = payload ? readRole(payload) || null : null;
    await db.query(
      `
        INSERT INTO public.hrm_cb_access_audit (
          id, company_id, actor_sub, actor_role, action, resource_kind,
          resource_id, employee_id, outcome, detail
        ) VALUES (
          $1::uuid, $2, $3, $4, $5, 'compensation_package',
          $6, $7::uuid, $8, $9::jsonb
        );
      `,
      [
        randomUUID(),
        input.companyId ?? null,
        actorSub,
        actorRole,
        input.action,
        input.resourceId ?? null,
        input.employeeId ?? null,
        input.outcome,
        JSON.stringify(input.detail ?? {}),
      ],
    );
  } catch {
    // Soft: audit must not block AuthZ deny/allow after schema bootstrap race.
  }
}

/**
 * Fail-closed C&B gate + access audit (BR-BP-SEC-02).
 * Call on every packages open (GET) and mutate (POST create/revise).
 */
export async function assertCompensationCbAccess(input: {
  db: HrmDbService;
  authorization: string | undefined;
  action: CbAccessAction;
  companyId?: string | null;
  employeeId?: string | null;
  resourceId?: string | null;
}): Promise<void> {
  const allowed = hasCompensationCbMembership(
    input.authorization,
    input.action,
  );
  await appendCbAccessAudit(input.db, {
    companyId: input.companyId,
    authorization: input.authorization,
    action: input.action,
    resourceId: input.resourceId,
    employeeId: input.employeeId,
    outcome: allowed ? 'allowed' : 'denied',
    detail: { gate: 'BR-BP-SEC-02' },
  });
  if (!allowed) {
    throw new ApiException(
      HRM_CORE_CB_AUTHZ_403,
      'Không đủ quyền xem/sửa vòng mật C&B (cần membership C&B / view_salary)',
      HttpStatus.FORBIDDEN,
    );
  }
}
