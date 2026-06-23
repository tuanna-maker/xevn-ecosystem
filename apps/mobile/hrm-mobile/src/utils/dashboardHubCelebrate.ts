import { resolveLeaveTypeLabel } from '../i18n/leaveTypes';
import { formatHrmDateRange } from './formatHrm';
import { resolveEmployeeInitials } from './resolveHrmAvatarUrl';

const HCM_TIMEZONE = 'Asia/Ho_Chi_Minh';
const CELEBRATION_PREVIEW_LIMIT = 10;

export type HomeCelebrationItem = {
  employee_id: string;
  display_name: string;
  month_day: string;
  display_date: string;
  avatar_url: string | null;
  avatar_initials: string;
};

export type HomeWhosOutItem = {
  employee_id: string;
  display_name: string;
  leave_type: string;
  leave_request_id: string;
  avatar_url?: string | null;
  start_date?: string;
  end_date?: string;
};

export type ApprovedLeaveWhosOutRow = {
  id: string;
  employee_id?: string | null;
  employee_name: string | null;
  leave_type: string;
  start_date: string;
  end_date: string;
  status: string;
};

export type EmployeeCelebrationSource = {
  id: string;
  full_name: string;
  status?: string | null;
  archived_at?: string | null;
  avatar_url?: string | null;
  hired_at?: string | null;
  custom_fields?: Record<string, string> | null;
};

/** Today ISO date in Asia/Ho_Chi_Minh — BR-BDAY-04. */
export function todayIsoInHoChiMinh(now = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: HCM_TIMEZONE }).format(now);
}

/** MM-DD for today in HCM — BR-BDAY-04. */
export function todayMonthDayInHoChiMinh(now = new Date()): string {
  const iso = todayIsoInHoChiMinh(now);
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return '';
  return `${match[2]}-${match[3]}`;
}

/** Extract MM-DD from ISO date — never expose birth year (BR-BDAY-01/02). */
export function monthDayFromIsoDate(value: string | undefined | null): string | null {
  if (!value?.trim()) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value.trim());
  if (!match) return null;
  return `${match[2]}-${match[3]}`;
}

/** Format MM-DD → DD/MM for display — BR-BDAY-02. */
export function formatDisplayDateFromMonthDay(monthDay: string): string {
  const match = /^(\d{2})-(\d{2})$/.exec(monthDay.trim());
  if (!match) return '';
  return `${match[2]}/${match[1]}`;
}

export function resolveBirthdayBannerText(displayName: string): string {
  const name = displayName.trim() || 'bạn';
  return `Chúc mừng sinh nhật, ${name}!`;
}

/** Reject API items that leak birth_year or full ISO DOB on UI fields — AC-MOB-HUB-08-04. */
export function sanitizeCelebrationItem(raw: Record<string, unknown>): HomeCelebrationItem | null {
  if ('birth_year' in raw && raw.birth_year != null) return null;
  const employeeId = typeof raw.employee_id === 'string' ? raw.employee_id.trim() : '';
  const displayName = typeof raw.display_name === 'string' ? raw.display_name.trim() : '';
  if (!employeeId || !displayName) return null;

  let monthDay = typeof raw.month_day === 'string' ? raw.month_day.trim() : '';
  if (/^\d{4}-\d{2}-\d{2}/.test(monthDay)) return null;

  if (!monthDay) {
    const displayDate = typeof raw.display_date === 'string' ? raw.display_date.trim() : '';
    const fromDisplay = /^(\d{2})\/(\d{2})$/.exec(displayDate);
    if (fromDisplay) monthDay = `${fromDisplay[2]}-${fromDisplay[1]}`;
  }

  const displayDate =
    typeof raw.display_date === 'string' && raw.display_date.trim()
      ? raw.display_date.trim()
      : formatDisplayDateFromMonthDay(monthDay);

  const avatarUrl =
    raw.avatar_url === null || typeof raw.avatar_url === 'string' ? raw.avatar_url : null;
  const initials =
    typeof raw.avatar_initials === 'string' && raw.avatar_initials.trim()
      ? raw.avatar_initials.trim().slice(0, 2)
      : resolveEmployeeInitials(displayName);

  return {
    employee_id: employeeId,
    display_name: displayName,
    month_day: monthDay,
    display_date: displayDate,
    avatar_url: avatarUrl,
    avatar_initials: initials,
  };
}

export function parseCelebrationItems(raw: unknown): HomeCelebrationItem[] {
  if (!raw || typeof raw !== 'object') return [];
  const block = raw as { items?: unknown; total_count?: unknown };
  const items = Array.isArray(block.items) ? block.items : [];
  const parsed: HomeCelebrationItem[] = [];
  for (const entry of items) {
    if (!entry || typeof entry !== 'object') continue;
    const item = sanitizeCelebrationItem(entry as Record<string, unknown>);
    if (item) parsed.push(item);
  }
  if (typeof block.total_count === 'number' && block.total_count > parsed.length) {
    return parsed;
  }
  return parsed;
}

export function sanitizeWhosOutItem(raw: Record<string, unknown>): HomeWhosOutItem | null {
  const employeeId = typeof raw.employee_id === 'string' ? raw.employee_id.trim() : '';
  const displayName =
    (typeof raw.display_name === 'string' ? raw.display_name.trim() : '') ||
    (typeof raw.employee_name === 'string' ? raw.employee_name.trim() : '');
  const leaveType = typeof raw.leave_type === 'string' ? raw.leave_type.trim() : '';
  const leaveRequestId =
    typeof raw.leave_request_id === 'string'
      ? raw.leave_request_id.trim()
      : typeof raw.leave_id === 'string'
        ? raw.leave_id.trim()
        : typeof raw.id === 'string'
          ? raw.id.trim()
          : '';
  if (!leaveRequestId || !displayName) return null;
  const avatarUrl =
    raw.avatar_url === null || typeof raw.avatar_url === 'string' ? raw.avatar_url : null;
  const startDate = typeof raw.start_date === 'string' ? raw.start_date.trim() : '';
  const endDate = typeof raw.end_date === 'string' ? raw.end_date.trim() : '';
  return {
    employee_id: employeeId || leaveRequestId,
    display_name: displayName,
    leave_type: leaveType,
    leave_request_id: leaveRequestId,
    avatar_url: avatarUrl,
    start_date: startDate || undefined,
    end_date: endDate || undefined,
  };
}

export function parseWhosOutItems(raw: unknown): HomeWhosOutItem[] {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    const parsed: HomeWhosOutItem[] = [];
    for (const entry of raw) {
      if (!entry || typeof entry !== 'object') continue;
      const item = sanitizeWhosOutItem(entry as Record<string, unknown>);
      if (item) parsed.push(item);
    }
    return parsed;
  }
  if (typeof raw !== 'object') return [];
  const block = raw as { items?: unknown };
  const items = Array.isArray(block.items) ? block.items : [];
  const parsed: HomeWhosOutItem[] = [];
  for (const entry of items) {
    if (!entry || typeof entry !== 'object') continue;
    const item = sanitizeWhosOutItem(entry as Record<string, unknown>);
    if (item) parsed.push(item);
  }
  return parsed;
}

/** Approved leave overlapping today — BR-WHO-01/02 client compose fallback. */
export function filterApprovedLeaveCoveringToday(
  rows: ApprovedLeaveWhosOutRow[],
  todayIso: string,
): ApprovedLeaveWhosOutRow[] {
  const today = todayIso.slice(0, 10);
  return rows.filter((row) => {
    if (row.status.toLowerCase() !== 'approved') return false;
    const start = row.start_date?.slice(0, 10) ?? '';
    const end = row.end_date?.slice(0, 10) ?? start;
    if (!start) return false;
    return start <= today && today <= end;
  });
}

export function mapWhosOutFromLeaveRows(rows: ApprovedLeaveWhosOutRow[]): HomeWhosOutItem[] {
  return rows.map((row) => ({
    employee_id: row.employee_id?.trim() || row.id,
    display_name: (row.employee_name ?? 'Nhân viên').trim(),
    leave_type: row.leave_type,
    leave_request_id: row.id,
    start_date: row.start_date,
    end_date: row.end_date,
  }));
}

export function formatWhosOutRowSubtitle(leaveType: string): string {
  return resolveLeaveTypeLabel(leaveType);
}

/** Rich card subtitle — leave type + date range when API provides dates (MOB-UX-08). */
export function formatWhosOutCardSubtitle(item: HomeWhosOutItem): string {
  const typeLabel = resolveLeaveTypeLabel(item.leave_type);
  if (item.start_date?.trim()) {
    const range = formatHrmDateRange(item.start_date, item.end_date ?? item.start_date);
    return range ? `${typeLabel} · ${range}` : typeLabel;
  }
  return typeLabel;
}

export function formatCelebrationCardSubtitle(item: HomeCelebrationItem): string {
  if (item.display_date?.trim()) return `Sinh nhật · ${item.display_date}`;
  return 'Sinh nhật hôm nay';
}

/** Compose celebrations from employee list — active only, no birth year on output — BR-BDAY-03/06. */
export function composeCelebrationsFromEmployees(
  employees: EmployeeCelebrationSource[],
  todayMonthDay: string,
  limit = CELEBRATION_PREVIEW_LIMIT,
): HomeCelebrationItem[] {
  if (!todayMonthDay) return [];
  const hits: HomeCelebrationItem[] = [];
  for (const emp of employees) {
    if (hits.length >= limit) break;
    const status = (emp.status ?? 'active').toLowerCase();
    if (status !== 'active') continue;
    if (emp.archived_at?.trim()) continue;
    const dob = emp.custom_fields?.date_of_birth;
    const monthDay = monthDayFromIsoDate(dob);
    if (!monthDay || monthDay !== todayMonthDay) continue;
    const displayName = emp.full_name?.trim();
    if (!displayName) continue;
    hits.push({
      employee_id: emp.id,
      display_name: displayName,
      month_day: monthDay,
      display_date: formatDisplayDateFromMonthDay(monthDay),
      avatar_url: emp.avatar_url ?? null,
      avatar_initials: resolveEmployeeInitials(displayName),
    });
  }
  return hits;
}

export function limitCelebrationPreview(
  items: HomeCelebrationItem[],
  limit = CELEBRATION_PREVIEW_LIMIT,
): { preview: HomeCelebrationItem[]; totalCount: number; hasMore: boolean } {
  const totalCount = items.length;
  return {
    preview: items.slice(0, limit),
    totalCount,
    hasMore: totalCount > limit,
  };
}

export function shouldShowCelebrationsSection(items: HomeCelebrationItem[]): boolean {
  return items.length > 0;
}

export function shouldShowWhosOutSection(items: HomeWhosOutItem[]): boolean {
  return items.length > 0;
}

export function formatWhosOutSectionTitle(_count?: number): string {
  return 'Ai nghỉ hôm nay';
}

export const HOME_CELEBRATION_PREVIEW_LIMIT = CELEBRATION_PREVIEW_LIMIT;
