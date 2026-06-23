import type { InboxHubRow } from './dashboardHub';
import { todayIsoInHoChiMinh } from './dashboardHubCelebrate';
import { formatHrmDate } from './formatHrm';

export type AttendanceRecordRow = {
  employee_id?: string | null;
  attendance_date: string;
  status: string;
  check_in_at?: string | null;
};

export type AttendanceStats = {
  totalWork: number;
  late: number;
  absence: number;
};

export type EssStatCardId = 'active_team' | 'off_work' | 'leave_requests' | 'my_leaves';

export type EssStatCard = {
  id: EssStatCardId;
  title: string;
  value: string;
  subtitle?: string;
};

export type AnnouncementRow = {
  id: string;
  title: string;
  dateLabel: string;
  eventType: string;
};

const JOB_TITLE_LABELS: Record<string, string> = {
  hr_staff: 'Nhân sự',
  sales_exec: 'Kinh doanh',
  engineer: 'Kỹ sư',
  manager: 'Quản lý',
  director: 'Giám đốc',
  admin: 'Hành chính',
  driver: 'Lái xe',
  DRIVER: 'Lái xe',
  transport_driver: 'Lái xe',
  operator: 'Vận hành',
  warehouse_staff: 'Kho bãi',
  accountant: 'Kế toán',
  supervisor: 'Giám sát',
};

const WORKFLOW_STATUS_LABELS: Record<string, string> = {
  pending: 'Chờ duyệt',
  approved: 'Đã duyệt',
  rejected: 'Từ chối',
  present: 'Có mặt',
  absent: 'Vắng mặt',
  draft: 'Nháp',
  paid: 'Đã thanh toán',
  active: 'Đang làm việc',
  on_leave: 'Đang nghỉ phép',
  inactive: 'Ngừng làm việc',
  neutral: 'Chưa chấm công',
  error: 'Lỗi tải dữ liệu',
  cancelled: 'Đã hủy',
  processing: 'Đang xử lý',
};

const INBOX_EVENT_LABELS: Record<string, string> = {
  broadcast: 'Thông báo chung',
  announcement: 'Thông báo',
  'company.broadcast': 'Thông báo công ty',
  company_announcement: 'Thông báo công ty',
  'hr.announcement': 'Thông báo nhân sự',
  'leave_request.created': 'Đơn nghỉ phép',
  'leave_request.approved': 'Đơn nghỉ đã duyệt',
  'leave_request.rejected': 'Đơn nghỉ bị từ chối',
  'attendance.update_request': 'Yêu cầu chỉnh sửa CC',
  'payslip.published': 'Phiếu lương mới',
};

const ANNOUNCEMENT_EVENT_TYPES = new Set([
  'broadcast',
  'announcement',
  'company.broadcast',
  'company_announcement',
  'hr.announcement',
]);

/** Localized time-of-day greeting — AC-ESS-20-01. */
export function resolveTimeBasedGreeting(displayName: string, hour = new Date().getHours()): string {
  const name = displayName.trim() || 'bạn';
  if (hour < 12) return `Chào buổi sáng, ${name}`;
  if (hour < 18) return `Chào buổi chiều, ${name}`;
  return `Chào buổi tối, ${name}`;
}

/** Workflow / payslip / leave status — no raw English enums on Home UI (MOB-UX-13c). */
export function resolveWorkflowStatusVi(status: string | null | undefined): string {
  const raw = status?.trim() ?? '';
  if (!raw) return '—';
  const mapped = WORKFLOW_STATUS_LABELS[raw.toLowerCase()];
  if (mapped) return mapped;
  if (/^[a-z][a-z0-9_]*$/i.test(raw)) return 'Đang xử lý';
  return raw;
}

/** Inbox event_type → Vietnamese label for announcements fallback. */
export function resolveInboxEventTypeVi(eventType: string | null | undefined): string {
  const raw = eventType?.trim() ?? '';
  if (!raw) return 'Thông báo';
  const lower = raw.toLowerCase();
  const mapped = INBOX_EVENT_LABELS[lower] ?? INBOX_EVENT_LABELS[raw];
  if (mapped) return mapped;
  if (lower.includes('broadcast') || lower.includes('announcement')) return 'Thông báo công ty';
  if (lower.includes('leave')) return 'Đơn nghỉ phép';
  if (lower.includes('payslip') || lower.includes('payroll')) return 'Phiếu lương';
  if (lower.includes('attendance')) return 'Chấm công';
  return 'Thông báo';
}

/** Sanitize announcement title — hide seed prefixes and raw English event keys. */
export function resolveAnnouncementTitleVi(
  title: string | null | undefined,
  eventType?: string | null,
): string {
  const text = title?.trim() ?? '';
  if (text && !/^[a-z][a-z0-9_.]*$/i.test(text)) return text;
  return resolveInboxEventTypeVi(eventType);
}

/** Role subtitle from employee job_title_key — AC-ESS-19-01. */
export function resolveRoleSubtitle(jobTitleKey: string | null | undefined): string {
  const key = jobTitleKey?.trim() ?? '';
  if (!key) return 'Nhân viên';
  const mapped = JOB_TITLE_LABELS[key] ?? JOB_TITLE_LABELS[key.toLowerCase()];
  if (mapped) return mapped;
  if (/^[A-Z0-9_]+$/.test(key)) return 'Nhân viên';
  return 'Nhân viên';
}

/** Default dashboard date — BR-ESS-02 Asia/Ho_Chi_Minh. */
export function defaultEssDashboardDate(now = new Date()): string {
  return todayIsoInHoChiMinh(now);
}

/**
 * Aggregate attendance metrics for selected date.
 * totalWork=present, late=pending with check-in, absence=absent (+ no record for self-only).
 */
export function aggregateAttendanceStats(
  rows: AttendanceRecordRow[],
  options?: { isManager?: boolean; employeeId?: string; dateIso?: string },
): AttendanceStats {
  const isManager = options?.isManager === true;
  const employeeId = options?.employeeId?.trim() ?? '';
  const dateIso = options?.dateIso?.slice(0, 10) ?? '';

  const scoped = rows.filter((r) => {
    const d = r.attendance_date?.slice(0, 10) ?? '';
    if (dateIso && d && d !== dateIso) return false;
    if (!isManager && employeeId) {
      return (r.employee_id?.trim() ?? '') === employeeId || !r.employee_id;
    }
    return true;
  });

  let totalWork = 0;
  let late = 0;
  let absence = 0;

  for (const row of scoped) {
    const status = row.status?.trim().toLowerCase() ?? '';
    if (status === 'present' || status === 'leave') {
      totalWork += 1;
    } else if (status === 'absent') {
      absence += 1;
    } else if (status === 'pending') {
      if (row.check_in_at?.trim()) {
        late += 1;
      } else if (!isManager) {
        absence += 1;
      }
    }
  }

  if (!isManager && scoped.length === 0 && employeeId && dateIso) {
    const today = defaultEssDashboardDate();
    if (dateIso <= today) {
      absence = 1;
    }
  }

  return { totalWork, late, absence };
}

export function formatAttendanceStatValue(n: number): string {
  return String(Math.max(0, n));
}

/** Inbox rows for announcements feed — BR-ESS-04. */
export function filterAnnouncementInboxRows(rows: InboxHubRow[], limit = 5): AnnouncementRow[] {
  const out: AnnouncementRow[] = [];

  for (const row of rows) {
    const event = row.event_type.trim().toLowerCase();
    if (!ANNOUNCEMENT_EVENT_TYPES.has(event) && !event.includes('broadcast') && !event.includes('announcement')) {
      continue;
    }
    const payload = row.payload && typeof row.payload === 'object' ? (row.payload as Record<string, unknown>) : {};
    const rawTitle =
      (typeof payload.title === 'string' && payload.title.trim()) ||
      (typeof payload.message === 'string' && payload.message.trim()) ||
      (typeof payload.subject === 'string' && payload.subject.trim()) ||
      '';
    const title = resolveAnnouncementTitleVi(rawTitle, row.event_type) || 'Thông báo công ty';
    const created = row.created_at?.trim() ?? '';
    out.push({
      id: row.id,
      title,
      dateLabel: created ? formatHrmDate(created.slice(0, 10)) : '—',
      eventType: row.event_type,
    });
    if (out.length >= limit) break;
  }

  return out;
}

/** Fallback announcements when no broadcast rows — map generic inbox titles. */
export function mapFallbackAnnouncements(rows: InboxHubRow[], limit = 3): AnnouncementRow[] {
  return rows.slice(0, limit).map((row) => {
    const payload = row.payload && typeof row.payload === 'object' ? (row.payload as Record<string, unknown>) : {};
    const rawTitle = (typeof payload.title === 'string' && payload.title.trim()) || '';
    const title = resolveAnnouncementTitleVi(rawTitle, row.event_type);
    return {
      id: row.id,
      title,
      dateLabel: row.created_at ? formatHrmDate(row.created_at.slice(0, 10)) : '—',
      eventType: row.event_type,
    };
  });
}

/** Zero-value stat rows — paint above-fold list before async ESS hydrate (MOB-UX-14-R3). */
export function buildDefaultEssStatCards(isManager: boolean): EssStatCard[] {
  return buildEssStatCards({
    isManager,
    activeTeamCount: 0,
    offWorkCount: 0,
    leaveRequestsCount: 0,
    myLeavesCount: 0,
  });
}

export function buildEssStatCards(input: {
  isManager: boolean;
  activeTeamCount: number;
  offWorkCount: number;
  leaveRequestsCount: number;
  myLeavesCount: number;
}): EssStatCard[] {
  const activeLabel = input.isManager ? 'Đội đang làm' : 'Đồng nghiệp';
  const leaveLabel = input.isManager ? 'Đơn chờ duyệt' : 'Đơn chờ';

  return [
    {
      id: 'active_team',
      title: activeLabel,
      value: formatAttendanceStatValue(input.activeTeamCount),
      subtitle: 'Đang làm việc',
    },
    {
      id: 'off_work',
      title: 'Nghỉ hôm nay',
      value: formatAttendanceStatValue(input.offWorkCount),
      subtitle: 'Không có mặt',
    },
    {
      id: 'leave_requests',
      title: leaveLabel,
      value: formatAttendanceStatValue(input.leaveRequestsCount),
      subtitle: input.isManager ? 'Cần xử lý' : 'Đang chờ',
    },
    {
      id: 'my_leaves',
      title: 'Đơn nghỉ của tôi',
      value: formatAttendanceStatValue(input.myLeavesCount),
      subtitle: 'Tổng đơn',
    },
  ];
}
