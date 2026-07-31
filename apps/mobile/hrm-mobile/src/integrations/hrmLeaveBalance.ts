/**
 * @CODE-MEMORY
 * Screen:     ESS leave surfaces (CreateLeave chip · My Leaves header · Profile metrics)
 * UC:         UC-HRM-MOB-06c
 * BR:         BR-LEAVE-BAL-01 · BR-LEAVE-BAL-02
 * SRS:        docs/hrm/MOBILE_W7_SRS_DELTA.md §4.3
 * TechSpec:   docs/hrm/MOBILE_W7_TECHSPEC_DELTA.md §3.6
 * Data:       docs/hrm/MOBILE_W7_DATA_CONTRACTS.md §4
 * Purpose:    Client for GET /attendance/leave-balance — slug query scope, parse payload,
 *             chip format + warn helpers (no invent balance).
 * WorkItem:   PCOMP-W7-MOB-LEAVE-BAL
 * Coded:      2026-06-08
 *
 * Callers: CreateLeaveRequestScreen · LeaveRequestsListScreen · ProfileScreen · LeaveBalanceChip
 * Callees: resolveLeaveBalanceQueryCompanyId · hrmRequest GET /attendance/leave-balance
 *
 * FE-Actions:
 *   | User action | Handler | Lib / RPC |
 *   |-------------|---------|-----------|
 *   | Open wizard / My Leaves | fetchLeaveBalance | GET leave-balance |
 *
 * Impact:     UUID query → empty/403; wrong chip format → AC-LEAVE-BAL-01 FAIL
 * must_keep:  holding slug not legal UUID; SRS chip copy helpers; BR-LEAVE-BAL-02 warn-only
 * SOLID:      Integration + pure display/warn helpers; UI in LeaveBalanceChip/Header
 * LastVerified: integrations/__tests__/hrmLeaveBalance.test.ts
 *
 * @CODE-MEMORY-CHANGE 2026-07-19 PCOMP-W7-MOB-LEAVE-BAL — chip format + B1/B2/B3 helpers
 * @CODE-MEMORY-CHANGE 2026-07-28 PCOMP-W7-MOB-LEAVE-BAL-02 — Plane B query ≡ resolveDirectoryQueryCompanyId
 *             (holding/trsport/main); chip still on CreateLeave step 0 (testID leave-balance-chip)
 */
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

/** SRS UC-HRM-MOB-06c B1 — API 404 / no policy configured. */
export const LEAVE_BALANCE_MISSING_HR_MSG = 'Chưa có số dư — liên hệ HR';

export function isLeaveBalanceNotConfiguredError(
  code?: string,
  httpStatus?: number,
): boolean {
  if (httpStatus === 404) return true;
  const c = (code ?? '').trim().toUpperCase();
  return (
    c === 'HRM-LEAVE-BAL-404' ||
    c === 'HRM-ATT-BAL-404' ||
    c === 'HRM-DATA-404'
  );
}

/**
 * SRS UC-HRM-MOB-06c main flow step 2:
 * «Còn lại: {remaining_days} / {entitled_days} ngày phép năm {year}»
 */
export function formatLeaveBalanceChipText(
  balance: Pick<
    LeaveBalancePayload,
    'remaining_days' | 'available_days' | 'entitled_days' | 'year' | 'balance_year'
  >,
): string {
  const remaining = formatLeaveBalanceDays(resolveLeaveBalanceDisplayDays(balance));
  const entitled = formatLeaveBalanceDays(balance.entitled_days);
  const year = balance.year || balance.balance_year || new Date().getFullYear();
  return `Còn lại: ${remaining} / ${entitled} ngày phép năm ${year}`;
}

/** SRS B2/B3 · BR-LEAVE-BAL-02 — pilot warns, does not block submit. */
export type LeaveBalanceWarnLevel = 'none' | 'exceed' | 'depleted';

export function resolveLeaveBalanceWarnLevel(
  remainingDays: number | null | undefined,
  requestedDays: number,
): LeaveBalanceWarnLevel {
  if (remainingDays == null || !Number.isFinite(remainingDays)) return 'none';
  if (remainingDays <= 0) return 'depleted';
  if (Number.isFinite(requestedDays) && requestedDays > remainingDays) return 'exceed';
  return 'none';
}

export function leaveBalanceWarnBannerText(level: LeaveBalanceWarnLevel): string | null {
  if (level === 'depleted') {
    return 'Số dư phép đã hết — đơn vẫn có thể gửi; quản lý/HR sẽ xem xét (BR-LEAVE-BAL-02).';
  }
  if (level === 'exceed') {
    return 'Số ngày nghỉ vượt số dư còn lại — tiếp tục sẽ cần xác nhận (cảnh báo, không chặn).';
  }
  return null;
}
