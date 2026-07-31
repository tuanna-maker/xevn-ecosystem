/**
 * @CODE-MEMORY
 * Screen:     PATCH /api/hrm/employees/:id — self vs HR update gate
 * UC:         UC-HRM-MOB-12 full (W7-6) · AC-ESS-01
 * BR:         BR-ESS-01 (self allowlist) · BR-DIR-02 (work_phone / phone_number)
 * SRS:        docs/hrm/MOBILE_W7_SRS_DELTA.md §4.5 · docs/hrm/MOBILE_W7_DATA_CONTRACTS.md §7
 * TechSpec:   docs/hrm/MOBILE_W7_TECHSPEC_DELTA.md §3.1 PATCH self + DynamicProfileForm
 * Purpose:    Authorize employee PATCH: HR full update; self only avatar_url +
 *             ESS phone keys inside custom_fields (phone_number, work_phone).
 * WorkItem:   PCOMP-W7-BE-SELF-PATCH-PHONE-01
 * Coded:      2026-06-07 (avatar baseline)
 * @CODE-MEMORY-CHANGE 2026-07-19 — AC-ESS-01: allow self custom_fields phone keys;
 *             mergeSelfEssCustomFields so mobile full-merge PATCH cannot wipe/open HR fields
 * @CODE-MEMORY-CHANGE 2026-07-19 — PCOMP-W7-BE-SELF-PATCH-PHONE-01-R1 Option A:
 *             jwt.employee_id === :id → always SELF allowlist + phone merge even if roles include
 *             manager|hr_manager (CEO mobile deriveRoles); HR full update only for other employees
 *
 * Callers:
 *   - employees.service.ts → updateEmployee → assertEmployeeUpdateAllowed / isSelfEmployeeTarget / merge
 *   - employee-directory.ts → canFullEmployeeUpdate (email mask)
 *
 * Callees:
 *   - getVerifiedInternalJwtPayload → JWT claims
 *
 * BE-Chain:
 *   PATCH /employees/:id → assertEmployeeUpdateAllowed → (self) merge phone keys → UPDATE employees
 *
 * Impact:     Too-open allowlist → salary/DOB/tenant_id self-write; too-narrow → HRM-EMP-403 on ESS save;
 *             manager self without Option A → full_name/gender 200 (QA FAIL on uat.nv0001)
 * must_keep:  Self ≠ HR; only avatar_url + phone_number/work_phone; no full_name/job_title/email/hired_at;
 *             Option A: self path wins over canFullEmployeeUpdate
 * SOLID:      SRP — authz policy only; persistence merge helper colocated for single allowlist SoT
 * LastVerified: employee-update-policy.spec.ts · employees.service.spec.ts self phone PATCH (R1)
 */

import { HttpStatus } from '@nestjs/common';
import { ApiException } from '../common/api.exception';
import { getVerifiedInternalJwtPayload } from '../common/internal-auth';
import type { UpdateEmployeeDto } from './dto/update-employee.dto';

const FULL_UPDATE_ROLE_CODES = new Set([
  'group_ceo',
  'subsidiary_ceo',
  'company_ceo',
  'chro',
  'hr_admin',
  'hr_manager',
  /** Portal membership role for member-tenant HRBP (ADR-HRM-RBAC-SCOPE-LADDER §3.3). */
  'hrbp_manager',
]);

/** Top-level DTO keys a non-HR employee may PATCH on their own row. */
const SELF_PATCH_FIELDS = ['avatar_url', 'custom_fields'] as const;

/**
 * Keys inside `custom_fields` that self may mutate (AC-ESS-01).
 * Other catalog keys (gender, DOB, salary, tenant_id, …) remain HR/system-only.
 */
export const SELF_PATCH_CUSTOM_FIELD_KEYS = ['phone_number', 'work_phone'] as const;

export type SelfPatchCustomFieldKey = (typeof SELF_PATCH_CUSTOM_FIELD_KEYS)[number];

function readClaim(payload: Record<string, unknown>, ...keys: string[]): string | undefined {
  for (const key of keys) {
    const value = payload[key];
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }
  return undefined;
}

function readJwtRoles(payload: Record<string, unknown>): string[] {
  const roles = payload.roles;
  if (!Array.isArray(roles)) {
    return [];
  }
  return roles.filter((role): role is string => typeof role === 'string');
}

export function readJwtEmployeeId(authorization?: string): string | undefined {
  const payload = getVerifiedInternalJwtPayload(authorization) as Record<string, unknown> | null;
  if (!payload) {
    return undefined;
  }
  return readClaim(payload, 'employee_id', 'employeeId', 'emp_id');
}

/**
 * True when JWT employee_id matches the target row (ESS self path).
 * Option A: self always uses ESS allowlist even if roles include manager/hr_manager.
 */
export function isSelfEmployeeTarget(employeeId: string, authorization?: string): boolean {
  const jwtEmployeeId = readJwtEmployeeId(authorization);
  return Boolean(jwtEmployeeId && jwtEmployeeId === employeeId);
}

export function canFullEmployeeUpdate(authorization?: string): boolean {
  const payload = getVerifiedInternalJwtPayload(authorization) as Record<string, unknown> | null;
  if (!payload) {
    return true;
  }
  const roleCode = readClaim(payload, 'roleCode', 'role_code', 'role')?.toLowerCase() ?? '';
  if (FULL_UPDATE_ROLE_CODES.has(roleCode) || roleCode.startsWith('group_')) {
    return true;
  }
  const roles = readJwtRoles(payload);
  return (
    roles.includes('hr_manager') ||
    roles.includes('hrbp_manager') ||
    roles.includes('manager')
  );
}

function assertSelfEssPatchAllowed(payload: UpdateEmployeeDto): void {
  const fields = definedPatchFields(payload);
  const disallowed = fields.filter(
    (field) => !SELF_PATCH_FIELDS.includes(field as (typeof SELF_PATCH_FIELDS)[number]),
  );
  if (disallowed.length > 0) {
    throw new ApiException(
      'HRM-EMP-403',
      'Employees may only update avatar_url or custom_fields phone keys on their own profile',
      HttpStatus.FORBIDDEN,
      { disallowed_fields: disallowed },
    );
  }
  if (payload.custom_fields !== undefined) {
    assertSelfCustomFieldsPatch(payload.custom_fields ?? {});
  }
}

function definedPatchFields(payload: UpdateEmployeeDto): string[] {
  return (Object.keys(payload) as (keyof UpdateEmployeeDto)[]).filter(
    (key) => payload[key] !== undefined,
  );
}

function isSelfPatchCustomFieldKey(key: string): key is SelfPatchCustomFieldKey {
  return (SELF_PATCH_CUSTOM_FIELD_KEYS as readonly string[]).includes(key);
}

/**
 * Merge only ESS phone keys from a self PATCH into existing custom_fields.
 * Ignores HR/system keys present in the client blob (mobile full-merge passthrough).
 */
export function mergeSelfEssCustomFields(
  existing: Record<string, string> | null | undefined,
  patch: Record<string, string> | null | undefined,
): Record<string, string> {
  const next: Record<string, string> = { ...(existing ?? {}) };
  if (!patch || typeof patch !== 'object') {
    return next;
  }
  for (const key of SELF_PATCH_CUSTOM_FIELD_KEYS) {
    if (!Object.prototype.hasOwnProperty.call(patch, key)) {
      continue;
    }
    const raw = patch[key];
    const trimmed = typeof raw === 'string' ? raw.trim() : '';
    if (trimmed) {
      next[key] = trimmed;
    } else {
      delete next[key];
    }
  }
  return next;
}

function assertSelfCustomFieldsPatch(customFields: Record<string, string>): void {
  const keys = Object.keys(customFields);
  if (keys.filter(isSelfPatchCustomFieldKey).length === 0) {
    throw new ApiException(
      'HRM-EMP-403',
      'Employees may only update avatar_url or custom_fields phone keys (phone_number, work_phone) on their own profile',
      HttpStatus.FORBIDDEN,
      {
        disallowed_fields: ['custom_fields'],
        disallowed_custom_fields: keys,
        allowed_custom_fields: [...SELF_PATCH_CUSTOM_FIELD_KEYS],
      },
    );
  }
}

export function assertEmployeeUpdateAllowed(
  employeeId: string,
  payload: UpdateEmployeeDto,
  authorization?: string,
): void {
  // Option A (PCOMP-W7-BE-SELF-PATCH-PHONE-01-R1): self target always uses ESS allowlist
  // before canFullEmployeeUpdate short-circuit (manager|hr_manager from mobile deriveRoles).
  if (isSelfEmployeeTarget(employeeId, authorization)) {
    assertSelfEssPatchAllowed(payload);
    return;
  }
  if (canFullEmployeeUpdate(authorization)) {
    return;
  }
  const jwtEmployeeId = readJwtEmployeeId(authorization);
  if (!jwtEmployeeId) {
    throw new ApiException(
      'HRM-EMP-403',
      'Employee profile update requires HR role or self ESS patch (avatar_url / phone)',
      HttpStatus.FORBIDDEN,
    );
  }
  throw new ApiException(
    'HRM-EMP-403',
    'Employees may only update their own profile (avatar_url / phone custom_fields)',
    HttpStatus.FORBIDDEN,
  );
}
