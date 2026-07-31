/**
 * @CODE-MEMORY
 * Screen:     Tab Đội nhóm → TeamDirectory (list helpers)
 * UC:         UC-HRM-MOB-16 (W7-5)
 * BR:         BR-DIR-01 · BR-DIR-02 · BR-DIR-03
 * SRS:        docs/hrm/MOBILE_W7_SRS_DELTA.md §4.4
 * TechSpec:   docs/hrm/MOBILE_W7_TECHSPEC_DELTA.md §3.7 · NFR-W7-04
 * Data:       docs/hrm/MOBILE_W7_DATA_CONTRACTS.md §5 VAL-W7-DIR-*
 * Purpose:    Compose directory members (dept/job/attendance), section group,
 *             chip filters; search normalize for API q (≥2 chars / R1).
 * WorkItem:   PCOMP-W7-MOB-DIRECTORY
 * Coded:      2026-07-19
 *
 * Callers: TeamDirectoryScreen · hrmTeamDirectory · TeamDirectoryRow
 * Callees: resolveRoleSubtitle · resolveColleagueHeroSubtitle
 *
 * FE-Actions:
 *   | User action | Handler | Lib / RPC |
 *   |-------------|---------|-----------|
 *   | Chip filter | applyTeamDirectoryFilters | client |
 *   | Search ≥2   | normalizeDirectorySearchQuery | GET /employees?view=directory&q= |
 *
 * Impact:     Wrong dept group / search min chars → AC-DIR-01/J-MOB-16 FAIL
 * must_keep:  status=active default; R1 q<2 → no API search; no DOB on list
 * SOLID:      Pure helpers — HTTP owned by hrmTeamDirectory
 * LastVerified: utils/__tests__/teamDirectory.test.ts
 *
 * @CODE-MEMORY-CHANGE 2026-07-19 PCOMP-W7-MOB-DIRECTORY-SEARCH-01
 * What: foldDirectorySearchText (NFD) so ASCII «Nguyen» matches «Nguyễn» client-side.
 * Why: AC-DIR-01 device FAIL when list relied on server-only filter.
 *
 * @CODE-MEMORY-CHANGE 2026-07-28 D-MOB-DIR-TOAST-01
 * What: Own resolveColleagueHeroSubtitle here (leaf for list); detail imports this file only.
 * Why: Break Metro require cycle teamDirectory ↔ teamDirectoryDetail (LogBox P2).
 * must_keep: resolveDirectoryQueryCompanyId Plane B · hub empty hide · HOLD_DEPLOY
 */
import type { EmployeeRow } from '../integrations/hrmEmployees';
import type { AttendanceRecordRow } from './dashboardEss';
import { resolveRoleSubtitle } from './dashboardEss';

/** SRS R1 / NFR-W7-04 — API search only when query length ≥ 2. */
export const DIRECTORY_SEARCH_MIN_CHARS = 2;
/** TechSpec NFR-W7-04 debounce for directory search. */
export const DIRECTORY_SEARCH_DEBOUNCE_MS = 300;

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

/** ZenHR org line: «Phòng ban · Chức danh» — shared by list + detail (no detail import). */
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

/**
 * SRS R1 — trim; return '' when length below DIRECTORY_SEARCH_MIN_CHARS
 * so list stays default A–Z (no `q` on wire).
 */
export function normalizeDirectorySearchQuery(raw: string): string {
  const term = raw.trim();
  if (term.length < DIRECTORY_SEARCH_MIN_CHARS) return '';
  return term;
}

/**
 * Accent-fold for AC-DIR-01 — «Nguyen» matches «Nguyễn» (NFD strip marks).
 * Used by client refine so list/chip update even before server `q` round-trip.
 */
export function foldDirectorySearchText(raw: string): string {
  return raw
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase();
}

/** Client-side refine on name, code, department, job title (chip/local + search). */
export function filterTeamDirectoryBySearch(
  members: TeamDirectoryMember[],
  query: string,
): TeamDirectoryMember[] {
  const q = foldDirectorySearchText(normalizeDirectorySearchQuery(query));
  if (!q) return members;
  return members.filter((m) => {
    const name = foldDirectorySearchText(m.employee.full_name ?? '');
    const code = foldDirectorySearchText(m.employee.employee_code ?? '');
    const dept = foldDirectorySearchText(m.department);
    const job = foldDirectorySearchText(m.jobTitle);
    const subtitle = foldDirectorySearchText(m.departmentLabel);
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
