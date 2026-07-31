import type { Ionicons } from '@expo/vector-icons';
import { resolveLeaveTypeLabel } from '../i18n/leaveTypes';
import { resolveAttendanceChangeTypeVi } from './attendanceUpdateTypes';
import { parseInboxEntity } from './dashboardHub';
import { formatHrmCurrency, formatHrmDate, formatHrmDateRange, formatHrmDateTime, parseAmount } from './formatHrm';
import type { EssRichListRowIconTone } from '../components/ui/EssRichListRow';
import type { StatusTone } from '../theme/tokens';

/** All inbox event types emitted by HRM seed / realtime fanout — vitest must cover 100%. */
export const KNOWN_INBOX_EVENT_TYPES = [
  'leave_request.created',
  'leave_request.approved',
  'leave_request.rejected',
  'attendance_update_request.created',
  'attendance_update_request.approved',
  'attendance_update_request.rejected',
  'broadcast',
  'announcement',
  'company.broadcast',
  'company_announcement',
  'hr.announcement',
  'payslip.published',
  'service_request.created',
] as const;

export type KnownInboxEventType = (typeof KNOWN_INBOX_EVENT_TYPES)[number];

export type InboxNotificationRow = {
  id: string;
  event_type: string;
  payload: unknown;
  read_at: string | null;
  created_at: string;
};

export type InboxNotificationCopy = {
  title: string;
  subtitle: string;
  timeLabel: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconTone: EssRichListRowIconTone;
  readLabel: 'Chưa đọc' | 'Đã đọc';
  readTone: StatusTone;
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

/** Unwrap realtime envelope `{ type, request }` or flat API payload. */
export function unwrapInboxPayload(payload: unknown): Record<string, unknown> {
  const outer = payloadRecord(payload);
  if (!outer) return {};
  if (outer.request && typeof outer.request === 'object') {
    return outer.request as Record<string, unknown>;
  }
  return outer;
}

function resolveEmployeeName(payload: unknown, fallback = ''): string {
  const inner = unwrapInboxPayload(payload);
  const name = payloadString(inner, 'employee_name', 'employeeName', 'name', 'full_name');
  if (name) return name;
  const { displayName } = parseInboxEntity(payload);
  return displayName || fallback;
}

function resolveLeaveRangeSubtitle(payload: unknown): string {
  const inner = unwrapInboxPayload(payload);
  const range = formatHrmDateRange(
    payloadString(inner, 'start_date', 'startDate'),
    payloadString(inner, 'end_date', 'endDate'),
  );
  const leaveType = payloadString(inner, 'leave_type', 'leaveType');
  const typeLabel = leaveType ? resolveLeaveTypeLabel(leaveType) : '';
  const parts = [resolveEmployeeName(payload), typeLabel, range !== '—' ? range : ''].filter(Boolean);
  return parts.join(' · ') || 'Đơn nghỉ phép';
}

function resolveAttendanceSubtitle(payload: unknown): string {
  const inner = unwrapInboxPayload(payload);
  const name = resolveEmployeeName(payload);
  const updateTypeRaw = payloadString(inner, 'update_type', 'updateType');
  const updateType = updateTypeRaw ? resolveAttendanceChangeTypeVi(updateTypeRaw) : '';
  const date = formatHrmDate(payloadString(inner, 'attendance_date', 'attendanceDate'));
  const parts = [name, updateType, date !== '—' ? date : ''].filter(Boolean);
  return parts.join(' · ') || 'Yêu cầu chỉnh sửa chấm công';
}

/** Display net for inbox — vi-VN currency when payload is numeric or grouped string. */
function resolvePayslipNetDisplay(inner: Record<string, unknown>): string {
  for (const key of ['net_amount', 'netAmount'] as const) {
    const v = inner[key];
    if (typeof v === 'number' && Number.isFinite(v)) {
      return formatHrmCurrency(v);
    }
    if (typeof v === 'string' && v.trim()) {
      const raw = v.trim();
      const n = parseAmount(raw);
      if (Number.isFinite(n) && (n !== 0 || /^0([.,]0+)?$/.test(raw.replace(/\s/g, '')))) {
        return formatHrmCurrency(n);
      }
      return raw;
    }
  }
  return '';
}

function resolvePayslipSubtitle(payload: unknown): string {
  const inner = unwrapInboxPayload(payload);
  const period = payloadString(inner, 'period_label', 'periodLabel', 'period_name', 'periodName');
  const net = resolvePayslipNetDisplay(inner);
  if (period && net) return `${period} · ${net}`;
  if (period) return period;
  return 'Phiếu lương mới';
}

function resolveBroadcastSubtitle(payload: unknown): string {
  const inner = unwrapInboxPayload(payload);
  const body = payloadString(inner, 'body', 'message', 'content', 'title');
  if (body && !/^[a-z][a-z0-9_.]*$/i.test(body)) return body;
  return 'Thông báo từ công ty';
}

/** Relative time in Vietnamese — «2 giờ trước», «hôm qua». */
export function formatInboxRelativeTime(
  createdAt: string | null | undefined,
  now = new Date(),
): string | null {
  if (!createdAt) return null;
  const parsed = new Date(createdAt);
  if (Number.isNaN(parsed.getTime())) return null;
  const diffMs = now.getTime() - parsed.getTime();
  if (diffMs < 0) return null;
  const diffMin = Math.floor(diffMs / 60_000);
  if (diffMin < 1) return 'vừa xong';
  if (diffMin < 60) return `${diffMin} phút trước`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} giờ trước`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay === 1) return 'hôm qua';
  if (diffDay < 7) return `${diffDay} ngày trước`;
  return null;
}

export function formatInboxTimeLabel(createdAt: string, now = new Date()): string {
  const formatted = formatHrmDateTime(createdAt);
  const relative = formatInboxRelativeTime(createdAt, now);
  if (relative && formatted !== '—') return `${formatted} · ${relative}`;
  return formatted;
}

function resolveIcon(event: string): { icon: keyof typeof Ionicons.glyphMap; tone: EssRichListRowIconTone } {
  if (event.startsWith('leave_request')) return { icon: 'calendar', tone: 'primary' };
  if (event.startsWith('attendance_update_request')) return { icon: 'time', tone: 'accent' };
  if (event.startsWith('payslip') || event.includes('payroll')) return { icon: 'cash', tone: 'success' };
  if (event.startsWith('service_request')) return { icon: 'construct', tone: 'warning' };
  if (event.includes('broadcast') || event.includes('announcement')) return { icon: 'megaphone', tone: 'neutral' };
  return { icon: 'notifications', tone: 'primary' };
}

/** Map inbox row → user-facing Vietnamese title + subtitle (MOB-UX-15a). */
export function resolveInboxNotificationCopy(
  row: InboxNotificationRow,
  isManager: boolean,
  now = new Date(),
): InboxNotificationCopy {
  const event = row.event_type.trim().toLowerCase();
  const name = resolveEmployeeName(row.payload, 'Nhân viên');
  const { icon, tone } = resolveIcon(event);
  const unread = !row.read_at;

  let title = 'Thông báo';
  let subtitle = '';

  switch (event) {
    case 'leave_request.created':
      title = isManager ? `Đơn nghỉ mới — ${name}` : 'Đơn nghỉ phép mới';
      subtitle = resolveLeaveRangeSubtitle(row.payload);
      break;
    case 'leave_request.approved':
      title = 'Đơn nghỉ đã duyệt';
      subtitle = resolveLeaveRangeSubtitle(row.payload);
      break;
    case 'leave_request.rejected':
      title = 'Đơn nghỉ bị từ chối';
      subtitle = resolveLeaveRangeSubtitle(row.payload);
      break;
    case 'attendance_update_request.created':
      title = isManager ? `Chỉnh sửa chấm công — ${name}` : 'Yêu cầu chỉnh sửa chấm công';
      subtitle = resolveAttendanceSubtitle(row.payload);
      break;
    case 'attendance_update_request.approved':
      title = 'Chỉnh sửa chấm công đã duyệt';
      subtitle = resolveAttendanceSubtitle(row.payload);
      break;
    case 'attendance_update_request.rejected':
      title = 'Chỉnh sửa chấm công bị từ chối';
      subtitle = resolveAttendanceSubtitle(row.payload);
      break;
    case 'payslip.published':
      title = 'Phiếu lương mới';
      subtitle = resolvePayslipSubtitle(row.payload);
      break;
    case 'service_request.created':
      title = isManager ? `Yêu cầu dịch vụ — ${name}` : 'Yêu cầu dịch vụ mới';
      subtitle = resolveBroadcastSubtitle(row.payload);
      break;
    case 'broadcast':
    case 'announcement':
    case 'company.broadcast':
    case 'company_announcement':
    case 'hr.announcement':
      title = event.includes('hr') ? 'Thông báo nhân sự' : 'Thông báo công ty';
      subtitle = resolveBroadcastSubtitle(row.payload);
      break;
    default:
      if (event.includes('leave')) {
        title = 'Đơn nghỉ phép';
        subtitle = resolveLeaveRangeSubtitle(row.payload);
      } else if (event.includes('attendance') || event.includes('update_request')) {
        title = 'Chỉnh sửa chấm công';
        subtitle = resolveAttendanceSubtitle(row.payload);
      } else if (event.includes('payslip') || event.includes('payroll')) {
        title = 'Phiếu lương';
        subtitle = resolvePayslipSubtitle(row.payload);
      } else {
        subtitle = resolveBroadcastSubtitle(row.payload);
      }
      break;
  }

  return {
    title,
    subtitle,
    timeLabel: formatInboxTimeLabel(row.created_at, now),
    icon,
    iconTone: tone,
    readLabel: unread ? 'Chưa đọc' : 'Đã đọc',
    readTone: unread ? 'info' : 'neutral',
  };
}
