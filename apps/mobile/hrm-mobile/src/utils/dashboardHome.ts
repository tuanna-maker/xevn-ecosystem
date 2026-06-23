import type { MobileMembership } from '../context/AuthContext';
import type { HrmOperatingUnitRow } from '../integrations/hrmOperatingUnits';
import { resolveLeaveTypeLabel } from '../i18n/leaveTypes';
import { resolveCompanyDisplayVi } from './companyDisplayVi';
import { formatHrmDateRange } from './formatHrm';

export type LeaveHomeRow = {
  id: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  status: string;
};

export type HomeGreeting = {
  displayName: string;
  companyLabel: string;
};

function resolveActiveMembership(
  memberships: MobileMembership[],
  employeeId: string,
): MobileMembership | undefined {
  const eid = employeeId.trim();
  return (
    memberships.find((m) => m.employee_id === eid) ??
    memberships.find((m) => m.is_primary) ??
    memberships[0]
  );
}

/**
 * Employee profile `full_name` wins over JWT membership seed — avoids «bạn» when API has data.
 */
export function resolveHomeDisplayName(
  profileFullName: string | null | undefined,
  memberships: MobileMembership[],
  employeeId: string,
): string {
  const fromProfile = profileFullName?.trim();
  if (fromProfile) return fromProfile;

  const active = resolveActiveMembership(memberships, employeeId);
  const fromMembership = active?.employee_name?.trim();
  if (fromMembership) return fromMembership;

  return 'bạn';
}

/** Resolve greeting — Personio Home §3.2; company label Vietnamese via operating-unit registry. */
export function resolveHomeGreeting(
  memberships: MobileMembership[],
  employeeId: string,
  companyId: string,
  options?: {
    profileFullName?: string | null;
    operatingUnits?: HrmOperatingUnitRow[];
  },
): HomeGreeting {
  const active = resolveActiveMembership(memberships, employeeId);
  const displayName = resolveHomeDisplayName(
    options?.profileFullName,
    memberships,
    employeeId,
  );
  const companyLabel = resolveCompanyDisplayVi(companyId, {
    membershipCompanyDisplay: active?.company_display,
    operatingUnits: options?.operatingUnits,
  });

  return { displayName, companyLabel };
}

/** Approved or pending leave with start on/after today — sorted ascending, max 3. */
export function pickUpcomingLeaves(rows: LeaveHomeRow[], todayIso: string, limit = 3): LeaveHomeRow[] {
  const today = todayIso.slice(0, 10);
  return rows
    .filter((row) => {
      const status = row.status.toLowerCase();
      if (status !== 'approved' && status !== 'pending') return false;
      const start = row.start_date?.slice(0, 10) ?? '';
      return start >= today;
    })
    .sort((a, b) => a.start_date.localeCompare(b.start_date))
    .slice(0, limit);
}

export function formatUpcomingLeaveLine(row: LeaveHomeRow): string {
  const range = formatHrmDateRange(row.start_date, row.end_date);
  const label = resolveLeaveTypeLabel(row.leave_type);
  return `${range} · ${label}`;
}

export function formatCheckInTime(checkInAt: string | null | undefined): string | null {
  if (!checkInAt?.trim()) return null;
  const parsed = new Date(checkInAt);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
}

export function resolveTodayCheckInSummary(
  hasRecord: boolean,
  checkInAt: string | null | undefined,
): { summary: string; status: string } {
  if (!hasRecord) {
    return { summary: 'Chưa chấm công hôm nay', status: 'pending' };
  }
  const time = formatCheckInTime(checkInAt);
  return {
    summary: time ? `Chấm lúc ${time}` : 'Đã chấm công hôm nay',
    status: 'present',
  };
}

export function formatPendingRequestsLine(leaveCount: number, updateCount: number): string {
  const total = leaveCount + updateCount;
  if (total === 0) return 'Không có đơn chờ duyệt';
  if (total === 1) return '1 đơn chờ duyệt';
  return `${total} đơn chờ duyệt`;
}
