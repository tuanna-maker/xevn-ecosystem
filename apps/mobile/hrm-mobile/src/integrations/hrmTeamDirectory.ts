import type { AttendanceRecordRow } from '../utils/dashboardEss';
import { todayIsoInHoChiMinh } from '../utils/dashboardHubCelebrate';
import {
  buildAttendanceCheckInMap,
  composeTeamDirectoryMembers,
  type TeamDirectoryMember,
} from '../utils/teamDirectory';
import { readListRows, readListTotal } from './envelope';
import type { EmployeeRow } from './hrmEmployees';
import { hrmRequest, resolveHrmCompanyHeaderId } from './hrmApiClient';
import { formatHrmError } from './mapApiError';
import type { HrmAuthConfig } from './types';

/** Pilot HRM API max per `list-employees.query.dto` (HRM-VAL-001). */
export const DIRECTORY_PAGE_SIZE = 100;
const DIRECTORY_MAX_PAGES = 20;

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
  const term = search.trim();
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

  if (!listCid) {
    return { ok: false, message: 'Cần phạm vi công ty.', members: [], date };
  }

  const [employeesResult, attendanceRows] = await Promise.all([
    fetchDirectoryEmployees(input.auth, listCid, input.search ?? ''),
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

  if (employees.length === 0 && listCid) {
    const headerId = resolveHrmCompanyHeaderId(input.auth.companyUuid, input.auth.companyId);
    if (headerId && headerId !== listCid) {
      const fallbackResult = await fetchDirectoryEmployees(
        input.auth,
        headerId,
        input.search ?? '',
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

  if (members.length === 0) {
    return {
      ok: false,
      message: 'Không tìm thấy nhân viên trong phạm vi.',
      members: [],
      date,
    };
  }

  return { ok: true, members, date };
}
