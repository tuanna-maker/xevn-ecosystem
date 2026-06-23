import type { LeaveBalancePayload } from '../integrations/hrmLeaveBalance';
import { formatLeaveBalanceDays } from '../integrations/hrmLeaveBalance';
import type { StatusTone } from '../theme/tokens';
import { resolveTodayCheckInSummary } from './dashboardHome';

export type ProfileStatusMetric = {
  id: string;
  label: string;
  value: string;
  tone: StatusTone;
};

export type ProfileWorkMetricsInput = {
  leaveBalance: LeaveBalancePayload | null;
  pendingLeaveCount: number;
  pendingUpdateCount: number;
  hasAttendanceToday: boolean;
  checkInAt: string | null | undefined;
  employmentStatus: string | null | undefined;
};

/** 2×3 status grid for Profile «Công việc» — MOB-UX-12c / F-3. */
export function buildProfileStatusMetrics(input: ProfileWorkMetricsInput): ProfileStatusMetric[] {
  const balance = input.leaveBalance;
  const entitled = balance ? formatLeaveBalanceDays(balance.entitled_days) : '—';
  const remaining = balance ? formatLeaveBalanceDays(balance.available_days) : '—';
  const used = balance ? formatLeaveBalanceDays(balance.used_days) : '—';
  const pendingDays = balance ? formatLeaveBalanceDays(balance.pending_days) : '—';

  const ownPending = input.pendingLeaveCount + input.pendingUpdateCount;
  const pendingOrdersValue = ownPending > 0 ? String(ownPending) : '0';

  const { summary: attendanceLabel } = resolveTodayCheckInSummary(
    input.hasAttendanceToday,
    input.checkInAt,
  );
  const attendanceTone: StatusTone = input.hasAttendanceToday ? 'success' : 'warning';

  return [
    { id: 'leave_entitled', label: 'Phép được hưởng', value: entitled, tone: 'info' },
    { id: 'leave_remaining', label: 'Phép còn lại', value: remaining, tone: 'success' },
    { id: 'leave_used', label: 'Đã sử dụng', value: used, tone: 'neutral' },
    { id: 'leave_pending_days', label: 'Phép chờ duyệt', value: pendingDays, tone: 'warning' },
    { id: 'own_pending', label: 'Đơn chờ xử lý', value: pendingOrdersValue, tone: ownPending > 0 ? 'warning' : 'neutral' },
    {
      id: 'attendance_today',
      label: 'Chấm công hôm nay',
      value: attendanceLabel.replace('Check-in ', ''),
      tone: attendanceTone,
    },
  ];
}
