import { resolveLeaveBalanceQueryCompanyId } from './companyWireScope';
import { hrmRequest, type HrmRequestResult } from './hrmApiClient';
import type { HrmAuthConfig } from './types';

export type LeaveBalancePayload = {
  company_id: string;
  employee_id: string;
  leave_type: string;
  balance_year: number;
  year: number;
  period: number;
  entitled_days: number;
  used_days: number;
  pending_days: number;
  remaining_days: number;
  available_days: number;
  as_of: string;
  source: 'employee_leave_balances' | 'custom_fields' | 'default';
};

function readBalancePayload(data: unknown): LeaveBalancePayload | null {
  if (!data || typeof data !== 'object') return null;
  const row = data as Record<string, unknown>;
  const employeeId = String(row.employee_id ?? '').trim();
  if (!employeeId) return null;
  const entitled = Number(row.entitled_days ?? 0);
  const used = Number(row.used_days ?? 0);
  const pending = Number(row.pending_days ?? 0);
  const remainingFromApi = Number(row.remaining_days ?? NaN);
  const remaining = Number.isFinite(remainingFromApi)
    ? remainingFromApi
    : Math.max(0, entitled - used - pending);
  const availableFromApi = Number(row.available_days ?? NaN);
  const available =
    Number.isFinite(availableFromApi) && availableFromApi > 0
      ? availableFromApi
      : remaining;
  return {
    company_id: String(row.company_id ?? ''),
    employee_id: employeeId,
    leave_type: String(row.leave_type ?? 'annual'),
    balance_year: Number(row.balance_year ?? row.year ?? new Date().getFullYear()),
    year: Number(row.year ?? row.balance_year ?? new Date().getFullYear()),
    period: Number(row.period ?? row.balance_year ?? new Date().getFullYear()),
    entitled_days: entitled,
    used_days: used,
    pending_days: pending,
    remaining_days: remaining,
    available_days: available,
    as_of: String(row.as_of ?? ''),
    source: (row.source as LeaveBalancePayload['source']) ?? 'default',
  };
}

export function resolveLeaveBalanceDisplayDays(
  balance: Pick<LeaveBalancePayload, 'available_days' | 'remaining_days'>,
): number {
  const remaining = Number.isFinite(balance.remaining_days) ? balance.remaining_days : 0;
  const available = Number.isFinite(balance.available_days) ? balance.available_days : remaining;
  return available > 0 ? available : remaining;
}

export type FetchLeaveBalanceParams = {
  employeeId: string;
  leaveType?: string;
  year?: number;
};

export type LeaveBalanceQueryParams = {
  companyId: string;
  employeeId: string;
  leaveType?: string;
  year?: number;
};

/** Builds GET /attendance/leave-balance query scope — rollup slug `holding`, never wire UUID alone. */
export function composeLeaveBalanceParams(
  auth: HrmAuthConfig,
  params: FetchLeaveBalanceParams,
): LeaveBalanceQueryParams | null {
  const employeeId = params.employeeId.trim() || auth.employeeId?.trim() || '';
  if (!employeeId) return null;

  const companyId = resolveLeaveBalanceQueryCompanyId({
    companyUuid: auth.companyUuid,
    companyId: auth.companyId,
    accessToken: auth.accessToken,
    memberships: auth.memberships,
    employeeId,
    tenantId: auth.tenantId,
  });
  if (!companyId.trim()) return null;

  return {
    companyId,
    employeeId,
    leaveType: params.leaveType,
    year: params.year,
  };
}

export async function fetchLeaveBalance(
  auth: HrmAuthConfig,
  params: FetchLeaveBalanceParams,
): Promise<HrmRequestResult<LeaveBalancePayload>> {
  const scoped = composeLeaveBalanceParams(auth, params);
  if (!scoped) {
    return {
      ok: false,
      code: 'HRM-LEAVE-BAL-SCOPE',
      message: 'Thiếu phạm vi công ty hoặc mã nhân viên.',
      requestId: 'mob-leave-bal-scope',
      httpStatus: 0,
    };
  }
  const q = new URLSearchParams({
    company_id: scoped.companyId,
    employee_id: scoped.employeeId,
  });
  if (scoped.leaveType?.trim()) q.set('leave_type', scoped.leaveType.trim());
  if (scoped.year != null) q.set('year', String(scoped.year));

  const res = await hrmRequest<unknown>(auth, `/attendance/leave-balance?${q.toString()}`, {
    method: 'GET',
  });
  if (!res.ok) return res;
  const payload = readBalancePayload(res.data);
  if (!payload) {
    return {
      ok: false,
      code: 'HRM-LEAVE-BAL-PARSE',
      message: 'Không đọc được số dư nghỉ phép.',
      requestId: res.requestId,
      httpStatus: 200,
    };
  }
  return { ...res, data: payload };
}

export function formatLeaveBalanceDays(value: number): string {
  if (!Number.isFinite(value)) return '0';
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}
