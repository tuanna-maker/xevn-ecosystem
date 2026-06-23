import { resolveLeaveTypeLabel } from '../i18n/leaveTypes';
import { resolveUpdateTypeLabel } from './attendanceUpdateTypes';
import { formatHrmDateRange } from './formatHrm';

export { resolveUpdateTypeLabel } from './attendanceUpdateTypes';

export type ProfileCurrentTask = {
  title: string;
  subtitle: string;
  progress: number;
  priority: 'high' | 'normal' | 'low';
  priorityLabel: string;
};

type PendingLeave = {
  id: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  status: string;
};

type PendingUpdate = {
  id: string;
  update_type: string;
  status: string;
};

export function computeTaskProgress(status: string | null | undefined): number {
  const key = status?.trim().toLowerCase() ?? '';
  if (key === 'approved') return 100;
  if (key === 'rejected') return 100;
  if (key === 'pending') return 40;
  if (key === 'draft') return 15;
  return 25;
}

export function resolveTaskPriority(kind: 'leave' | 'update'): ProfileCurrentTask['priority'] {
  return kind === 'leave' ? 'normal' : 'high';
}

export function resolvePriorityLabel(priority: ProfileCurrentTask['priority']): string {
  if (priority === 'high') return 'Ưu tiên cao';
  if (priority === 'low') return 'Thấp';
  return 'Bình thường';
}

/** First pending own request for Profile task card — ZenHR Z-P06 / AC-ESS-E-02. */
export function resolveProfileCurrentTask(
  leaveRows: PendingLeave[],
  updateRows: PendingUpdate[],
): ProfileCurrentTask | null {
  const leave = leaveRows.find((r) => r.status?.trim().toLowerCase() === 'pending');
  if (leave) {
    const label = resolveLeaveTypeLabel(leave.leave_type);
    const range = formatHrmDateRange(leave.start_date, leave.end_date);
    const priority = resolveTaskPriority('leave');
    return {
      title: `Đơn nghỉ phép · ${label}`,
      subtitle: range,
      progress: computeTaskProgress(leave.status),
      priority,
      priorityLabel: resolvePriorityLabel(priority),
    };
  }

  const update = updateRows.find((r) => r.status?.trim().toLowerCase() === 'pending');
  if (update) {
    const label = resolveUpdateTypeLabel(update.update_type);
    const priority = resolveTaskPriority('update');
    return {
      title: `Chỉnh sửa chấm công · ${label}`,
      subtitle: 'Đang chờ phê duyệt',
      progress: computeTaskProgress(update.status),
      priority,
      priorityLabel: resolvePriorityLabel(priority),
    };
  }

  return null;
}
