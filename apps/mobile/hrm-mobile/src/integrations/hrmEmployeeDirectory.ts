/**
 * @CODE-MEMORY
 * Screen:     TeamColleagueDetail (directory detail)
 * UC:         UC-HRM-MOB-16 (W7-5) · AC-DIR-02
 * BR:         BR-DIR-02 (PII / phone policy)
 * SRS:        docs/hrm/MOBILE_W7_SRS_DELTA.md §4.4 R6
 * TechSpec:   docs/hrm/MOBILE_W7_TECHSPEC_DELTA.md §3.7 · §4.2 EmployeeDirectoryDetail
 * Data:       docs/hrm/MOBILE_W7_DATA_CONTRACTS.md §5 detail · VAL-W7-DIR-01/03
 * Purpose:    GET colleague profile lite with view=directory + attendance_today.
 * WorkItem:   PCOMP-W7-MOB-DIRECTORY
 * Coded:      2026-07-19
 *
 * Callers: TeamColleagueDetailScreen
 * Callees: hrmRequest · resolveHrmCompanyHeaderId · formatHrmError
 *
 * FE-Actions:
 *   | User action | Handler | Lib / RPC |
 *   |-------------|---------|-----------|
 *   | Tap row | fetchEmployeeDirectoryDetail | GET /employees/:id?view=directory |
 *
 * Impact:     Wrong view → PII leak / missing fields → VAL-W7-DIR-03 FAIL
 * must_keep:  view=directory; no invent email/phone; list→detail same id
 * SOLID:      Detail fetch only — mapping in teamDirectoryDetail
 * LastVerified: integrations/__tests__/hrmEmployeeDirectory.test.ts
 *
 * @CODE-MEMORY-CHANGE 2026-07-28 PCOMP-W7-MOB-DIRECTORY-01
 * What: company_id query via resolveDirectoryQueryCompanyId (Plane B slug / main).
 * Why: VAL-W7-DIR-01 scope parity list↔detail; dual-plane GWC must_keep.
 */
import { resolveDirectoryQueryCompanyId } from './companyWireScope';
import { hrmRequest } from './hrmApiClient';
import { formatHrmError } from './mapApiError';
import type { HrmAuthConfig } from './types';

export type DirectoryAttendanceToday = {
  checked_in: boolean;
  check_in_at: string | null;
  status: string | null;
};

export type DirectoryDetailRow = {
  id: string;
  employee_code: string;
  full_name: string;
  job_title_key: string | null;
  department: string | null;
  avatar_url: string | null;
  status: string;
  attendance_today?: DirectoryAttendanceToday;
  manager_id: string | null;
  phone_number: string | null;
  email?: string;
};

export type FetchDirectoryDetailResult =
  | { ok: true; row: DirectoryDetailRow }
  | { ok: false; message: string };

function isDirectoryDetailRow(data: unknown): data is DirectoryDetailRow {
  if (!data || typeof data !== 'object') return false;
  const row = data as DirectoryDetailRow;
  return typeof row.id === 'string' && 'employee_code' in row;
}

/** GET /employees/:id?view=directory — colleague detail for team directory (J-MOB-16 / AC-DIR-02). */
export async function fetchEmployeeDirectoryDetail(
  auth: HrmAuthConfig,
  employeeId: string,
): Promise<FetchDirectoryDetailResult> {
  const id = employeeId.trim();
  if (!id) {
    return { ok: false, message: 'Thiếu mã nhân viên.' };
  }

  const companyId = resolveDirectoryQueryCompanyId({
    companyUuid: auth.companyUuid,
    companyId: auth.companyId,
    accessToken: auth.accessToken,
    memberships: auth.memberships,
    employeeId: auth.employeeId,
    tenantId: auth.tenantId,
  });
  if (!companyId) {
    return { ok: false, message: 'Cần phạm vi công ty.' };
  }

  const q = new URLSearchParams({
    company_id: companyId,
    view: 'directory',
    include_attendance_today: 'true',
  });

  const res = await hrmRequest<DirectoryDetailRow>(
    auth,
    `/employees/${id}?${q.toString()}`,
    { method: 'GET' },
  );

  if (!res.ok) {
    return { ok: false, message: formatHrmError(res) };
  }

  if (!isDirectoryDetailRow(res.data)) {
    return { ok: false, message: 'Dữ liệu nhân viên không hợp lệ.' };
  }

  return { ok: true, row: res.data };
}
