import type { QuickActionItem } from '../components/ui/QuickActionRow';
import type { DirectoryDetailRow } from '../integrations/hrmEmployeeDirectory';
import { resolveRoleSubtitle } from './dashboardEss';
import { formatHrmDateTime } from './formatHrm';
import { resolveEmployeeStatusLabel } from './profileTabs';
import { TEAM_CHECK_IN_BADGE } from './teamDirectory';

export type ColleagueDetailFields = {
  name: string;
  code: string;
  department: string;
  jobTitle: string;
  heroSubtitle: string;
  email: string;
  phone: string;
  statusLabel: string;
  attendanceLabel: string;
  attendanceTone: 'success' | 'neutral';
  checkInAt: string;
};

/** Localized employment status — no raw `active` on UI (MOB-UX-12a). */
export function mapEmploymentStatusVi(status: string | null | undefined): string {
  return resolveEmployeeStatusLabel(status);
}

export function resolveDirectoryDepartment(row: DirectoryDetailRow): string {
  const dept = row.department?.trim();
  if (dept) return dept;
  return resolveRoleSubtitle(row.job_title_key);
}

/** ZenHR org line: «Phòng ban · Chức danh». */
export function resolveColleagueHeroSubtitle(department: string, jobTitle: string): string {
  const dept = department.trim();
  const role = jobTitle.trim();
  const hasDept = dept.length > 0 && dept !== '—';
  const hasRole = role.length > 0 && role !== '—';
  if (hasDept && hasRole) return `${dept} · ${role}`;
  if (hasDept) return dept;
  if (hasRole) return role;
  return '—';
}

export function hasDialablePhone(phone: string): boolean {
  const p = phone.trim();
  return p.length > 0 && p !== '—' && /\d/.test(p);
}

export function hasMailableEmail(email: string): boolean {
  const e = email.trim();
  return e.length > 0 && e !== '—' && e.includes('@');
}

export function buildColleagueQuickActions(phone: string, email: string): QuickActionItem[] {
  const actions: QuickActionItem[] = [];
  if (hasDialablePhone(phone)) {
    const digits = phone.replace(/[^\d+]/g, '');
    actions.push({
      id: 'call',
      label: 'Gọi',
      icon: 'call-outline',
      href: `tel:${digits}`,
    });
  }
  if (hasMailableEmail(email)) {
    actions.push({
      id: 'email',
      label: 'Email',
      icon: 'mail-outline',
      href: `mailto:${email.trim()}`,
    });
  }
  return actions;
}

export function mapColleagueDetailFields(row: DirectoryDetailRow): ColleagueDetailFields {
  const checkedIn = row.attendance_today?.checked_in ?? false;
  const badge = checkedIn ? TEAM_CHECK_IN_BADGE.checked_in : TEAM_CHECK_IN_BADGE.not_checked_in;
  const checkInRaw = row.attendance_today?.check_in_at?.trim() ?? '';
  const department = resolveDirectoryDepartment(row);
  const jobTitle = resolveRoleSubtitle(row.job_title_key);

  return {
    name: row.full_name?.trim() || row.employee_code?.trim() || '—',
    code: row.employee_code?.trim() || '—',
    department,
    jobTitle,
    heroSubtitle: resolveColleagueHeroSubtitle(department, jobTitle),
    email: row.email?.trim() || '—',
    phone: row.phone_number?.trim() || '—',
    statusLabel: mapEmploymentStatusVi(row.status),
    attendanceLabel: badge.label,
    attendanceTone: badge.tone,
    checkInAt: checkInRaw ? formatHrmDateTime(checkInRaw) : '—',
  };
}
