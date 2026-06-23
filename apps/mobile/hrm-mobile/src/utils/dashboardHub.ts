import { resolveLeaveTypeLabel } from '../i18n/leaveTypes';
import { resolveAttendanceChangeTypeVi } from './attendanceUpdateTypes';
import { formatHrmDateRange } from './formatHrm';

export type InboxHubRow = {
  id: string;
  event_type: string;
  payload: unknown;
  read_at: string | null;
  created_at: string;
};

export type OwnPendingLeaveRow = {
  id: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  status: string;
};

export type OwnPendingUpdateRow = {
  id: string;
  update_type: string;
  status: string;
};

export type ManagerLeaveRow = {
  id: string;
  employee_name: string | null;
  leave_type: string;
  start_date: string;
  end_date: string;
};

export type ManagerUpdateRow = {
  id: string;
  employee_name: string;
  update_type: string;
};

export type HomeTaskNav =
  | { target: 'LeaveRequestDetail'; id: string }
  | { target: 'UpdateRequestDetail'; id: string }
  | { target: 'ManagerApprovals' }
  | { target: 'LeaveRequestsList' }
  | { target: 'UpdateRequests' }
  | { target: 'PayslipList' }
  | { target: 'Operations' }
  | { target: 'InAppNotifications' };

export type HomeTaskRow = {
  key: string;
  dedupeKey: string;
  title: string;
  subtitle?: string;
  status?: string;
  unread?: boolean;
  navigate: HomeTaskNav;
};

export type ManagerPreviewRow = {
  key: string;
  kind: 'leave' | 'att';
  id: string;
  title: string;
  subtitle: string;
};

function payloadRecord(payload: unknown): Record<string, unknown> | null {
  if (!payload || typeof payload !== 'object') return null;
  return payload as Record<string, unknown>;
}

function payloadString(payload: Record<string, unknown>, ...keys: string[]): string {
  for (const key of keys) {
    const v = payload[key];
    if (typeof v === 'string' && v.trim()) return v.trim();
  }
  return '';
}

/** Extract entity id + type from inbox payload — BR-INBOX-HUB + dedupe BR-MGR-TASK-08. */
export function parseInboxEntity(payload: unknown): {
  entityId: string;
  entityType: 'leave_request' | 'update_request' | 'unknown';
  displayName: string;
} {
  const p = payloadRecord(payload);
  if (!p) {
    return { entityId: '', entityType: 'unknown', displayName: '' };
  }

  const inner =
    p.request && typeof p.request === 'object'
      ? (p.request as Record<string, unknown>)
      : p;

  const eventHint =
    typeof p.type === 'string'
      ? p.type.toLowerCase()
      : typeof inner.entity_type === 'string'
        ? String(inner.entity_type).toLowerCase()
        : '';

  const leaveId = payloadString(inner, 'leave_request_id', 'leaveRequestId');
  const updateId = payloadString(
    inner,
    'update_request_id',
    'updateRequestId',
    'attendance_update_request_id',
  );
  const genericId = payloadString(inner, 'entity_id', 'request_id', 'id');
  const name = payloadString(inner, 'employee_name', 'employeeName', 'name', 'full_name');

  if (leaveId) {
    return { entityId: leaveId, entityType: 'leave_request', displayName: name };
  }
  if (updateId) {
    return { entityId: updateId, entityType: 'update_request', displayName: name };
  }
  if (genericId) {
    if (eventHint.includes('leave')) {
      return { entityId: genericId, entityType: 'leave_request', displayName: name };
    }
    if (eventHint.includes('update') || eventHint.includes('attendance')) {
      return { entityId: genericId, entityType: 'update_request', displayName: name };
    }
    const hint = typeof p.entity_type === 'string' ? p.entity_type.toLowerCase() : '';
    if (hint.includes('leave')) {
      return { entityId: genericId, entityType: 'leave_request', displayName: name };
    }
    if (hint.includes('update') || hint.includes('attendance')) {
      return { entityId: genericId, entityType: 'update_request', displayName: name };
    }
  }

  return { entityId: genericId, entityType: 'unknown', displayName: name };
}

/** Map inbox row to home task — BR-INBOX-HUB event_type table. */
export function mapInboxToHomeTask(row: InboxHubRow, isManager: boolean): HomeTaskRow | null {
  const event = row.event_type.trim().toLowerCase();
  const { entityId, entityType, displayName } = parseInboxEntity(row.payload);
  const name = displayName || 'Nhân viên';
  const unread = !row.read_at;

  if (event === 'leave_request.created') {
    return {
      key: `inbox:${row.id}`,
      dedupeKey: entityId ? `leave_request:${entityId}` : `inbox:${row.id}`,
      title: isManager ? `Đơn nghỉ mới — ${name}` : `Đơn nghỉ mới`,
      subtitle: unread ? 'Chưa đọc' : undefined,
      unread,
      navigate: isManager ? { target: 'ManagerApprovals' } : { target: 'LeaveRequestsList' },
    };
  }

  if (event === 'leave_request.approved' || event === 'leave_request.rejected') {
    if (!entityId) return null;
    const verb = event.endsWith('approved') ? 'được duyệt' : 'bị từ chối';
    return {
      key: `inbox:${row.id}`,
      dedupeKey: `leave_request:${entityId}`,
      title: `Đơn nghỉ đã ${verb}`,
      subtitle: unread ? 'Chưa đọc' : undefined,
      status: event.endsWith('approved') ? 'approved' : 'rejected',
      unread,
      navigate: { target: 'LeaveRequestDetail', id: entityId },
    };
  }

  if (event === 'attendance_update_request.approved' || event === 'attendance_update_request.rejected') {
    if (!entityId) return null;
    const verb = event.endsWith('approved') ? 'được duyệt' : 'bị từ chối';
    return {
      key: `inbox:${row.id}`,
      dedupeKey: `update_request:${entityId}`,
      title: `Chỉnh sửa chấm công đã ${verb}`,
      subtitle: unread ? 'Chưa đọc' : undefined,
      unread,
      navigate: { target: 'UpdateRequestDetail', id: entityId },
    };
  }

  if (event === 'attendance_update_request.created' || event.startsWith('attendance_update_request')) {
    return {
      key: `inbox:${row.id}`,
      dedupeKey: entityId ? `update_request:${entityId}` : `inbox:${row.id}`,
      title: `Chỉnh sửa chấm công — ${name}`,
      subtitle: unread ? 'Chưa đọc' : undefined,
      unread,
      navigate: isManager
        ? { target: 'ManagerApprovals' }
        : entityId
          ? { target: 'UpdateRequestDetail', id: entityId }
          : { target: 'UpdateRequests' },
    };
  }

  if (event.includes('update_request') && !event.startsWith('leave_request')) {
    return {
      key: `inbox:${row.id}`,
      dedupeKey: entityId ? `update_request:${entityId}` : `inbox:${row.id}`,
      title: `Chỉnh sửa chấm công — ${name}`,
      subtitle: unread ? 'Chưa đọc' : undefined,
      unread,
      navigate: isManager
        ? { target: 'ManagerApprovals' }
        : entityId
          ? { target: 'UpdateRequestDetail', id: entityId }
          : { target: 'UpdateRequests' },
    };
  }

  if (event === 'payslip.published' || event.startsWith('payslip.')) {
    return {
      key: `inbox:${row.id}`,
      dedupeKey: `inbox:${row.id}`,
      title: 'Phiếu lương mới',
      subtitle: unread ? 'Chưa đọc' : undefined,
      unread,
      navigate: { target: 'PayslipList' },
    };
  }

  if (event.startsWith('service_request.')) {
    return {
      key: `inbox:${row.id}`,
      dedupeKey: entityId ? `service_request:${entityId}` : `inbox:${row.id}`,
      title: `Yêu cầu dịch vụ — ${name}`,
      subtitle: unread ? 'Chưa đọc' : undefined,
      unread,
      navigate: isManager ? { target: 'Operations' } : { target: 'InAppNotifications' },
    };
  }

  if (entityType === 'leave_request' && entityId) {
    return {
      key: `inbox:${row.id}`,
      dedupeKey: `leave_request:${entityId}`,
      title: displayName ? `Thông báo đơn nghỉ — ${displayName}` : 'Thông báo đơn nghỉ',
      unread,
      navigate: { target: 'LeaveRequestDetail', id: entityId },
    };
  }

  if (entityType === 'update_request' && entityId) {
    return {
      key: `inbox:${row.id}`,
      dedupeKey: `update_request:${entityId}`,
      title: displayName ? `Chỉnh sửa chấm công — ${displayName}` : 'Chỉnh sửa chấm công',
      unread,
      navigate: isManager ? { target: 'ManagerApprovals' } : { target: 'UpdateRequests' },
    };
  }

  return {
    key: `inbox:${row.id}`,
    dedupeKey: `inbox:${row.id}`,
    title: 'Thông báo chung',
    subtitle: unread ? 'Chưa đọc' : undefined,
    unread,
    navigate: { target: 'InAppNotifications' },
  };
}

export function mapOwnPendingLeave(row: OwnPendingLeaveRow): HomeTaskRow {
  const range = formatHrmDateRange(row.start_date, row.end_date);
  const label = resolveLeaveTypeLabel(row.leave_type);
  return {
    key: `own-leave:${row.id}`,
    dedupeKey: `leave_request:${row.id}`,
    title: `Đơn nghỉ chờ duyệt · ${label}`,
    subtitle: range,
    status: row.status,
    navigate: { target: 'LeaveRequestDetail', id: row.id },
  };
}

export function mapOwnPendingUpdate(row: OwnPendingUpdateRow): HomeTaskRow {
  return {
    key: `own-update:${row.id}`,
    dedupeKey: `update_request:${row.id}`,
    title: `Chỉnh sửa CC chờ duyệt · ${resolveAttendanceChangeTypeVi(row.update_type)}`,
    status: row.status,
    navigate: { target: 'UpdateRequestDetail', id: row.id },
  };
}

/** Merge inbox + own pending with dedupe — BR-MGR-TASK-06/07/08. Priority: own pending > inbox. */
export function mergeHomeTasks(
  inboxRows: InboxHubRow[],
  ownLeaveRows: OwnPendingLeaveRow[],
  ownUpdateRows: OwnPendingUpdateRow[],
  isManager: boolean,
  previewLimit = 3,
): { preview: HomeTaskRow[]; totalCount: number } {
  const byDedupe = new Map<string, HomeTaskRow>();

  for (const row of inboxRows) {
    const task = mapInboxToHomeTask(row, isManager);
    if (!task) continue;
    if (!byDedupe.has(task.dedupeKey)) {
      byDedupe.set(task.dedupeKey, task);
    }
  }

  for (const row of ownLeaveRows) {
    const task = mapOwnPendingLeave(row);
    byDedupe.set(task.dedupeKey, task);
  }

  for (const row of ownUpdateRows) {
    const task = mapOwnPendingUpdate(row);
    byDedupe.set(task.dedupeKey, task);
  }

  const all = [...byDedupe.values()];
  return {
    totalCount: all.length,
    preview: all.slice(0, previewLimit),
  };
}

/** Manager pending count — BR-MGR-TASK-02/03 (direct reports only via API query). */
export function resolveManagerPendingCount(
  leaveRows: ManagerLeaveRow[],
  updateRows: ManagerUpdateRow[],
): number {
  return leaveRows.length + updateRows.length;
}

export function buildManagerPreviewRows(
  leaveRows: ManagerLeaveRow[],
  updateRows: ManagerUpdateRow[],
  limit = 3,
): ManagerPreviewRow[] {
  const items: ManagerPreviewRow[] = [];

  for (const r of leaveRows) {
    items.push({
      key: `mgr-leave:${r.id}`,
      kind: 'leave',
      id: r.id,
      title: (r.employee_name ?? 'Nhân viên').trim(),
      subtitle: `Nghỉ phép · ${formatHrmDateRange(r.start_date, r.end_date)} · ${resolveLeaveTypeLabel(r.leave_type)}`,
    });
  }

  for (const r of updateRows) {
    items.push({
      key: `mgr-att:${r.id}`,
      kind: 'att',
      id: r.id,
      title: r.employee_name.trim() || 'Nhân viên',
      subtitle: `Chỉnh sửa CC · ${resolveAttendanceChangeTypeVi(r.update_type)}`,
    });
  }

  return items.slice(0, limit);
}

export function formatManagerCardTitle(count: number): string {
  return `Cần duyệt (${count})`;
}
