import type { EmployeeRow } from './employee-directory.types';
import {
  buildEmployeeDisplayReadyFields,
  employeeStatusLabelVi,
  resolveEmployeeJobTitleLabel,
} from './employee-display';
import { canFullEmployeeUpdate } from './employee-update-policy';

export type DirectoryListItem = {
  id: string;
  employee_code: string;
  full_name: string;
  /** Catalog key for job title (canonical). */
  job_title_key: string | null;
  /** MP-01 mobile parity alias — same value as `job_title_key`. */
  job_title: string | null;
  /** OS 28 — VI label; null when unknown (never raw snake key). */
  job_title_label: string | null;
  department: string | null;
  avatar_url: string | null;
  status: string;
  /** OS 28 — VI status label for FE bind. */
  status_label: string;
  attendance_today?: {
    checked_in: boolean;
    check_in_at: string | null;
    status: string | null;
  };
};

export type DirectoryDetailItem = DirectoryListItem & {
  manager_id: string | null;
  phone_number: string | null;
  email?: string;
};

type AttendanceTodayRow = {
  check_in_at: string | null;
  status: string | null;
};

export function isDirectoryView(view: string | undefined): boolean {
  return view?.trim().toLowerCase() === 'directory';
}

export function resolveDirectorySearchTerm(
  keyword?: string,
  q?: string,
): string | undefined {
  const term = (q ?? keyword)?.trim();
  return term || undefined;
}

export function readDepartment(
  customFields: Record<string, string> | null | undefined,
): string | null {
  const value = customFields?.department?.trim();
  return value || null;
}

export function readPhoneNumber(
  customFields: Record<string, string> | null | undefined,
): string | null {
  const phone =
    customFields?.phone_number?.trim() || customFields?.work_phone?.trim();
  return phone || null;
}

export function maskDirectoryEmail(email: string): string {
  const trimmed = email.trim();
  const at = trimmed.indexOf('@');
  if (at <= 0) {
    return '***';
  }
  const local = trimmed.slice(0, at);
  const domain = trimmed.slice(at + 1);
  const maskedLocal = local.length <= 1 ? '*' : `${local[0]}***`;
  return `${maskedLocal}@${domain}`;
}

export function mapDirectoryListItem(
  row: EmployeeRow,
  attendance?: AttendanceTodayRow | null,
  includeAttendanceToday?: boolean,
): DirectoryListItem {
  const display = buildEmployeeDisplayReadyFields(row);
  const item: DirectoryListItem = {
    id: row.id,
    employee_code: row.employee_code,
    full_name: row.full_name,
    job_title_key: row.job_title_key,
    job_title: row.job_title_key,
    job_title_label: display.job_title_label,
    department: display.department,
    avatar_url: row.avatar_url ?? null,
    status: row.status,
    status_label: display.status_label,
  };
  if (includeAttendanceToday) {
    item.attendance_today = {
      checked_in: Boolean(attendance?.check_in_at),
      check_in_at: attendance?.check_in_at ?? null,
      status: attendance?.status ?? null,
    };
  }
  return item;
}

/** Re-export for callers that only import directory helpers. */
export { employeeStatusLabelVi, resolveEmployeeJobTitleLabel };

export function mapDirectoryDetail(
  row: EmployeeRow,
  authorization: string | undefined,
  attendance?: AttendanceTodayRow | null,
  includeAttendanceToday?: boolean,
): DirectoryDetailItem {
  const base = mapDirectoryListItem(row, attendance, includeAttendanceToday);
  const detail: DirectoryDetailItem = {
    ...base,
    manager_id: row.manager_id,
    phone_number: readPhoneNumber(row.custom_fields),
  };
  if (canFullEmployeeUpdate(authorization)) {
    detail.email = row.email;
  } else {
    detail.email = maskDirectoryEmail(row.email);
  }
  return detail;
}

export function directoryItemPassesAttendanceFilter(
  item: DirectoryListItem,
  filter: string | undefined,
): boolean {
  if (!filter || filter === 'all') {
    return true;
  }
  const checkedIn = item.attendance_today?.checked_in ?? false;
  if (filter === 'checked_in') {
    return checkedIn;
  }
  if (filter === 'not_checked_in') {
    return !checkedIn;
  }
  return true;
}

export function todayIsoInHoChiMinh(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Ho_Chi_Minh',
  }).format(new Date());
}
