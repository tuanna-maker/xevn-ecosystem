import type { HrmInboxNotification } from '@/integrations/hrmApi';
import { EM_DASH } from '@/lib/labelMaps';

/** SRS UC-HRM-12 / HRM-NT-01 — user-facing inbox row title (no raw event_type). */
export function inboxNotificationSummary(n: HrmInboxNotification): string {
  if (n.event_type === 'leave_request.created') return 'Đơn nghỉ mới';
  if (n.event_type === 'leave_request.approved') return 'Đơn nghỉ đã duyệt';
  if (n.event_type === 'leave_request.rejected') return 'Đơn nghỉ bị từ chối';
  if (n.event_type === 'service_request.created') return 'Yêu cầu dịch vụ mới';
  if (n.event_type === 'service_request.approved') return 'Yêu cầu dịch vụ đã duyệt';
  if (n.event_type === 'service_request.rejected') return 'Yêu cầu dịch vụ bị từ chối';
  return EM_DASH;
}

export function isHrmInboxUnread(n: HrmInboxNotification): boolean {
  return n.read_at == null || n.read_at.trim() === '';
}

/** BA AC-NT01-MARK-01 — mark HP = personal recipient only (hide CTA on broadcast NULL). */
export function canMarkHrmInboxPersonalRead(n: HrmInboxNotification): boolean {
  return (
    isHrmInboxUnread(n) &&
    typeof n.recipient_employee_id === 'string' &&
    n.recipient_employee_id.trim().length > 0
  );
}

export function hrmInboxQueryKey(companyId: string, employeeId: string) {
  return ['hrm-inbox', companyId, employeeId] as const;
}
