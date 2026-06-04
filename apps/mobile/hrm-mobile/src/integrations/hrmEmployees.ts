import { resolveHrmCompanyHeaderId } from './hrmApiClient';
import type { HrmAuthConfig } from './types';
import { hrmRequest } from './hrmApiClient';
import { readListRows } from './envelope';

export type EmployeeRow = {
  id: string;
  company_id: string;
  employee_code: string;
  email: string;
  full_name: string;
  job_title_key: string | null;
  status: string;
  hired_at: string | null;
};

/** Loads employees for `company_id` (header scope string) and returns the row matching `employeeId` (UUID), if any. */
export async function fetchEmployeeById(
  auth: HrmAuthConfig,
  employeeId: string,
): Promise<EmployeeRow | null> {
  const id = employeeId.trim();
  if (!id) return null;
  const companyId = resolveHrmCompanyHeaderId(auth.companyUuid, auth.companyId);
  if (!companyId) return null;

  let page = 1;
  const pageSize = 100;
  for (let i = 0; i < 20; i += 1) {
    const q = new URLSearchParams({
      company_id: companyId,
      page: String(page),
      page_size: String(pageSize),
    });
    const res = await hrmRequest<unknown>(auth, `/employees?${q.toString()}`, { method: 'GET' });
    if (!res.ok) return null;
    const rows = readListRows<EmployeeRow>(res.data);
    const hit = rows.find((r) => r.id === id);
    if (hit) return hit;
    if (rows.length < pageSize) return null;
    page += 1;
  }
  return null;
}
