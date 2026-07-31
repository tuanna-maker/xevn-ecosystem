/**
 * @CODE-MEMORY
 * Screen:     Tab Đội nhóm → TeamDirectory
 * UC:         UC-HRM-MOB-16 (W7-5)
 * BR:         BR-DIR-01 · BR-DIR-03
 * SRS:        docs/hrm/MOBILE_W7_SRS_DELTA.md §4.4
 * TechSpec:   docs/hrm/MOBILE_W7_TECHSPEC_DELTA.md §3.7 · NFR-W7-04
 * Data:       docs/hrm/MOBILE_W7_DATA_CONTRACTS.md §5 — GET /employees?view=directory
 * Purpose:    Load scoped directory list (active) + today attendance join;
 *             paginate page_size≤50; pass `q` when search ≥2 chars.
 * WorkItem:   PCOMP-W7-MOB-DIRECTORY
 * Coded:      2026-07-19
 *
 * Callers: TeamDirectoryScreen
 * Callees: hrmRequest · composeTeamDirectoryMembers · normalizeDirectorySearchQuery
 *
 * FE-Actions:
 *   | User action | Handler | Lib / RPC |
 *   |-------------|---------|-----------|
 *   | Open tab / refresh | loadTeamDirectoryWithAttendance | GET /employees?view=directory |
 *   | Search ≥2 | same + q= | GET /employees?view=directory&q= |
 *   | Attendance badge | client join | GET /attendance/records |
 *
 * Impact:     page_size>100 → HRM-VAL-001; wrong company_id → empty/scope leak
 * must_keep:  view=directory; status=active; BR-DIR-03 page_size≤50; R1 q min 2
 * SOLID:      Integration only — UI in TeamDirectoryScreen
 * LastVerified: integrations/__tests__/hrmTeamDirectory.test.ts
 *
 * @CODE-MEMORY-CHANGE 2026-07-28 PCOMP-W7-MOB-DIRECTORY-01
 * What: Plane B listCompanyId via resolveDirectoryQueryCompanyId; page_size default 30;
 *       empty scope without search → ok empty (API honest empty).
 * Why: Header helper sent LE UUID when scope=main; dual-plane GWC must_keep slug query.
 * must_keep: leave/auth flows; view=directory; client accent-fold search.
 */
import type { AttendanceRecordRow } from '../utils/dashboardEss';
import { todayIsoInHoChiMinh } from '../utils/dashboardHubCelebrate';
import {
  buildAttendanceCheckInMap,
  composeTeamDirectoryMembers,
  normalizeDirectorySearchQuery,
  type TeamDirectoryMember,
} from '../utils/teamDirectory';
import { resolveDirectoryQueryCompanyId } from './companyWireScope';
import { readListRows, readListTotal } from './envelope';
import type { EmployeeRow } from './hrmEmployees';
import { hrmRequest } from './hrmApiClient';
import { formatHrmError } from './mapApiError';
import type { HrmAuthConfig } from './types';

/** BR-DIR-03 / TechSpec §3.7 default 30 · max 50 (BE hard max 100). */
export const DIRECTORY_PAGE_SIZE = 30;
const DIRECTORY_MAX_PAGES = 40;

export type TeamDirectoryLoadResult =
  | { ok: true; members: TeamDirectoryMember[]; date: string }
  | { ok: false; message: string; members: TeamDirectoryMember[]; date: string };

function buildAttendanceQuery(
  companyId: string,
  date: string,
  isManager: boolean,
  employeeId: string,
): URLSearchParams {
  const q = new URLSearchParams({
    company_id: companyId,
    from_date: date,
    to_date: date,
    page: '1',
    page_size: '500',
  });
  if (!isManager && employeeId.trim()) {
    q.set('employee_id', employeeId.trim());
  }
  return q;
}

function buildEmployeesQuery(companyId: string, search: string, page = 1): URLSearchParams {
  const q = new URLSearchParams({
    company_id: companyId,
    page: String(page),
    page_size: String(DIRECTORY_PAGE_SIZE),
    status: 'active',
    view: 'directory',
  });
  const term = normalizeDirectorySearchQuery(search);
  if (term) q.set('q', term);
  return q;
}

type FetchDirectoryResult =
  | { ok: true; rows: EmployeeRow[] }
  | { ok: false; message: string };

async function fetchDirectoryEmployees(
  auth: HrmAuthConfig,
  companyId: string,
  search: string,
): Promise<FetchDirectoryResult> {
  const all: EmployeeRow[] = [];
  let page = 1;

  for (let i = 0; i < DIRECTORY_MAX_PAGES; i += 1) {
    const q = buildEmployeesQuery(companyId, search, page);
    const res = await hrmRequest<unknown>(auth, `/employees?${q.toString()}`, { method: 'GET' });
    if (!res.ok) {
      return { ok: false, message: formatHrmError(res) };
    }
    const rows = readListRows<EmployeeRow>(res.data);
    all.push(...rows);
    const total = readListTotal(res.data);
    if (all.length >= total || rows.length < DIRECTORY_PAGE_SIZE) {
      return { ok: true, rows: all };
    }
    page += 1;
  }

  return { ok: true, rows: all };
}

async function fetchTodayAttendance(
  auth: HrmAuthConfig,
  attendanceCompanyId: string,
  date: string,
  isManager: boolean,
  employeeId: string,
): Promise<AttendanceRecordRow[]> {
  const q = buildAttendanceQuery(attendanceCompanyId, date, isManager, employeeId);
  const res = await hrmRequest<unknown>(
    auth,
    `/attendance/records?${q.toString()}`,
    { method: 'GET' },
  );
  if (!res.ok) return [];
  return readListRows<AttendanceRecordRow>(res.data);
}

/** Loads team directory with today's check-in status (client join). */
export async function loadTeamDirectoryWithAttendance(input: {
  auth: HrmAuthConfig;
  listCompanyId: string;
  attendanceCompanyId: string;
  isManager: boolean;
  employeeId: string;
  search?: string;
  date?: string;
}): Promise<TeamDirectoryLoadResult> {
  const date = (input.date ?? todayIsoInHoChiMinh()).slice(0, 10);
  const listCid = input.listCompanyId.trim();
  const attCid = input.attendanceCompanyId.trim();
  const searchTerm = normalizeDirectorySearchQuery(input.search ?? '');

  if (!listCid) {
    return { ok: false, message: 'Cần phạm vi công ty.', members: [], date };
  }

  const [employeesResult, attendanceRows] = await Promise.all([
    fetchDirectoryEmployees(input.auth, listCid, searchTerm),
    attCid
      ? fetchTodayAttendance(
          input.auth,
          attCid,
          date,
          input.isManager,
          input.employeeId,
        )
      : Promise.resolve([] as AttendanceRecordRow[]),
  ]);

  if (!employeesResult.ok) {
    return { ok: false, message: employeesResult.message, members: [], date };
  }

  let employees = employeesResult.rows;

  if (employees.length === 0 && listCid && !searchTerm) {
    // Plane B recovery — never fall back to LE UUID; recover alternate slug from auth.
    const planeB = resolveDirectoryQueryCompanyId({
      companyUuid: input.auth.companyUuid,
      companyId: input.auth.companyId,
      accessToken: input.auth.accessToken,
      memberships: input.auth.memberships,
      employeeId: input.auth.employeeId,
      tenantId: input.auth.tenantId,
    });
    if (planeB && planeB !== listCid) {
      const fallbackResult = await fetchDirectoryEmployees(
        input.auth,
        planeB,
        searchTerm,
      );
      if (!fallbackResult.ok) {
        return { ok: false, message: fallbackResult.message, members: [], date };
      }
      if (fallbackResult.rows.length > 0) {
        const map = buildAttendanceCheckInMap(attendanceRows);
        return {
          ok: true,
          members: composeTeamDirectoryMembers(fallbackResult.rows, map),
          date,
        };
      }
    }
  }

  const attendanceMap = buildAttendanceCheckInMap(attendanceRows);
  const members = composeTeamDirectoryMembers(employees, attendanceMap);

  // SRS R2 + API_DESIGN honest empty — success with empty list (UI copy)
  if (members.length === 0) {
    return { ok: true, members: [], date };
  }

  return { ok: true, members, date };
}
