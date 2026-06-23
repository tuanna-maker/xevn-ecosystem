import type { EmployeeRow } from '../integrations/hrmEmployees';
import type { AttendanceRecordRow } from './dashboardEss';
import { resolveRoleSubtitle } from './dashboardEss';
import { resolveColleagueHeroSubtitle } from './teamDirectoryDetail';

export type TeamDirectoryFilter = 'all' | 'checked_in' | 'off';

export type TeamCheckInStatus = 'checked_in' | 'not_checked_in';

export type TeamDirectoryMember = {
  employee: EmployeeRow;
  checkInStatus: TeamCheckInStatus;
  /** Department name for section headers (localized fallback «Khác»). */
  department: string;
  /** Localized job title — never raw `job_title_key` on UI. */
  jobTitle: string;
  /** Subtitle line «Phòng · Chức danh» for search + row secondary. */
  departmentLabel: string;
};

export type TeamDirectorySection = {
  title: string;
  colorStrip: string;
  data: TeamDirectoryMember[];
};

const CHECKED_IN_STATUSES = new Set(['present', 'late', 'pending']);

const DEPT_STRIP_COLORS = [
  '#1E40AF',
  '#06B6D4',
  '#8B5CF6',
  '#EC4899',
  '#10B981',
  '#F59E0B',
  '#F97316',
  '#14B8A6',
] as const;

const UNASSIGNED_DEPARTMENT = 'Khác';

/** Maps today's attendance rows to employee_id → checked in. */
export function buildAttendanceCheckInMap(rows: AttendanceRecordRow[]): Map<string, TeamCheckInStatus> {
  const map = new Map<string, TeamCheckInStatus>();
  for (const row of rows) {
    const eid = row.employee_id?.trim();
    if (!eid) continue;
    const status = row.status?.trim().toLowerCase() ?? '';
    const hasCheckIn = Boolean(row.check_in_at?.trim());
    const checkedIn =
      CHECKED_IN_STATUSES.has(status) && (status !== 'pending' || hasCheckIn);
    map.set(eid, checkedIn ? 'checked_in' : 'not_checked_in');
  }
  return map;
}

export function resolveTeamCheckInStatus(
  attendanceMap: Map<string, TeamCheckInStatus>,
  employeeId: string,
): TeamCheckInStatus {
  return attendanceMap.get(employeeId.trim()) ?? 'not_checked_in';
}

export function resolveListEmployeeDepartment(employee: EmployeeRow): string {
  const dept = employee.department?.trim();
  if (dept) return dept;
  return UNASSIGNED_DEPARTMENT;
}

export function resolveTeamMemberJobTitle(employee: EmployeeRow): string {
  return resolveRoleSubtitle(employee.job_title_key);
}

/** Deterministic accent strip per department — DingTalk/Beisen card depth cue. */
export function resolveDepartmentColorStrip(department: string): string {
  const key = department.trim().toLowerCase() || UNASSIGNED_DEPARTMENT.toLowerCase();
  let hash = 0;
  for (let i = 0; i < key.length; i += 1) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  }
  return DEPT_STRIP_COLORS[hash % DEPT_STRIP_COLORS.length];
}

export function composeTeamDirectoryMembers(
  employees: EmployeeRow[],
  attendanceMap: Map<string, TeamCheckInStatus>,
): TeamDirectoryMember[] {
  return employees.map((employee) => {
    const department = resolveListEmployeeDepartment(employee);
    const jobTitle = resolveTeamMemberJobTitle(employee);
    const deptForSubtitle = department === UNASSIGNED_DEPARTMENT ? '' : department;
    return {
      employee,
      checkInStatus: resolveTeamCheckInStatus(attendanceMap, employee.id),
      department,
      jobTitle,
      departmentLabel: resolveColleagueHeroSubtitle(deptForSubtitle, jobTitle),
    };
  });
}

/** Groups filtered members into SectionList sections sorted by department name. */
export function groupTeamDirectoryByDepartment(members: TeamDirectoryMember[]): TeamDirectorySection[] {
  const map = new Map<string, TeamDirectoryMember[]>();
  for (const member of members) {
    const key = member.department;
    const bucket = map.get(key) ?? [];
    bucket.push(member);
    map.set(key, bucket);
  }

  const titles = [...map.keys()].sort((a, b) => {
    if (a === UNASSIGNED_DEPARTMENT) return 1;
    if (b === UNASSIGNED_DEPARTMENT) return -1;
    return a.localeCompare(b, 'vi');
  });

  return titles.map((title) => ({
    title,
    colorStrip: resolveDepartmentColorStrip(title),
    data: (map.get(title) ?? []).sort((a, b) =>
      (a.employee.full_name ?? '').localeCompare(b.employee.full_name ?? '', 'vi'),
    ),
  }));
}

/** Client-side search on name, code, department, job title. */
export function filterTeamDirectoryBySearch(
  members: TeamDirectoryMember[],
  query: string,
): TeamDirectoryMember[] {
  const q = query.trim().toLowerCase();
  if (!q) return members;
  return members.filter((m) => {
    const name = m.employee.full_name?.toLowerCase() ?? '';
    const code = m.employee.employee_code?.toLowerCase() ?? '';
    const dept = m.department.toLowerCase();
    const job = m.jobTitle.toLowerCase();
    const subtitle = m.departmentLabel.toLowerCase();
    return (
      name.includes(q) ||
      code.includes(q) ||
      dept.includes(q) ||
      job.includes(q) ||
      subtitle.includes(q)
    );
  });
}

export function filterTeamDirectoryByChip(
  members: TeamDirectoryMember[],
  filter: TeamDirectoryFilter,
): TeamDirectoryMember[] {
  if (filter === 'all') return members;
  if (filter === 'checked_in') {
    return members.filter((m) => m.checkInStatus === 'checked_in');
  }
  return members.filter((m) => m.checkInStatus === 'not_checked_in');
}

export function applyTeamDirectoryFilters(
  members: TeamDirectoryMember[],
  filter: TeamDirectoryFilter,
  searchQuery: string,
): TeamDirectoryMember[] {
  const searched = filterTeamDirectoryBySearch(members, searchQuery);
  return filterTeamDirectoryByChip(searched, filter);
}

export function countTeamDirectoryFilterOptions(members: TeamDirectoryMember[]): {
  all: number;
  checked_in: number;
  off: number;
} {
  let checkedIn = 0;
  for (const m of members) {
    if (m.checkInStatus === 'checked_in') checkedIn += 1;
  }
  return {
    all: members.length,
    checked_in: checkedIn,
    off: members.length - checkedIn,
  };
}

export const TEAM_CHECK_IN_BADGE: Record<
  TeamCheckInStatus,
  { label: string; status: string; tone: 'success' | 'neutral' }
> = {
  checked_in: { label: 'Đã chấm', status: 'present', tone: 'success' },
  not_checked_in: { label: 'Chưa chấm', status: 'absent', tone: 'neutral' },
};
