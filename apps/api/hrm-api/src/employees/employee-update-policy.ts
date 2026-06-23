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

const SELF_PATCH_FIELDS = ['avatar_url'] as const;

function definedPatchFields(payload: UpdateEmployeeDto): string[] {
  return (Object.keys(payload) as (keyof UpdateEmployeeDto)[]).filter(
    (key) => payload[key] !== undefined,
  );
}

export function assertEmployeeUpdateAllowed(
  employeeId: string,
  payload: UpdateEmployeeDto,
  authorization?: string,
): void {
  if (canFullEmployeeUpdate(authorization)) {
    return;
  }
  const jwtEmployeeId = readJwtEmployeeId(authorization);
  if (!jwtEmployeeId) {
    throw new ApiException(
      'HRM-EMP-403',
      'Employee profile update requires HR role or self avatar patch',
      HttpStatus.FORBIDDEN,
    );
  }
  if (jwtEmployeeId !== employeeId) {
    throw new ApiException(
      'HRM-EMP-403',
      'Employees may only update their own profile avatar',
      HttpStatus.FORBIDDEN,
    );
  }
  const fields = definedPatchFields(payload);
  const disallowed = fields.filter(
    (field) => !SELF_PATCH_FIELDS.includes(field as (typeof SELF_PATCH_FIELDS)[number]),
  );
  if (disallowed.length > 0) {
    throw new ApiException(
      'HRM-EMP-403',
      'Employees may only update avatar_url on their own profile',
      HttpStatus.FORBIDDEN,
      { disallowed_fields: disallowed },
    );
  }
}
