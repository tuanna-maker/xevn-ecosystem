import { resolveHrmCompanyHeaderId, hrmRequest } from './hrmApiClient';
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

/** GET /employees/:id?view=directory — colleague detail for team directory (J-MOB-30 / R-DIR-DETAIL-01). */
export async function fetchEmployeeDirectoryDetail(
  auth: HrmAuthConfig,
  employeeId: string,
): Promise<FetchDirectoryDetailResult> {
  const id = employeeId.trim();
  if (!id) {
    return { ok: false, message: 'Thiếu mã nhân viên.' };
  }

  const companyId = resolveHrmCompanyHeaderId(auth.companyUuid, auth.companyId);
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
