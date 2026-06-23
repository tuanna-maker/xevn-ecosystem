import type { MobileMembership } from '../context/AuthContext';
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
  /** Present on `view=directory` list/detail payloads. */
  department?: string | null;
  status: string;
  hired_at: string | null;
  avatar_url?: string | null;
  custom_fields?: Record<string, string>;
};

export type EmployeeRequestMeta = {
  employee_code: string;
  employee_name: string;
  department: string;
};

/** Resolves code/name from JWT login memberships — immediate fallback when GET /employees list misses row. */
export function resolveEmployeeMetaFromMemberships(
  memberships: MobileMembership[],
  employeeId: string,
): EmployeeRequestMeta | null {
  const eid = employeeId.trim();
  if (!eid) return null;
  const hit =
    memberships.find((m) => m.employee_id === eid) ??
    memberships.find((m) => m.is_primary) ??
    memberships[0];
  if (!hit) return null;
  const code = hit.employee_code?.trim() ?? '';
  const name = hit.employee_name?.trim() ?? '';
  if (!code && !name) return null;
  return { employee_code: code, employee_name: name, department: '' };
}

/** Merges membership seed with API row — API wins when both present. */
export function mergeEmployeeRequestMeta(
  fromMembership: EmployeeRequestMeta | null,
  row: EmployeeRow | null,
): EmployeeRequestMeta | null {
  const fromRow = row
    ? {
        employee_code: row.employee_code?.trim() ?? '',
        employee_name: row.full_name?.trim() ?? '',
        department: row.job_title_key?.trim() ?? '',
      }
    : null;
  if (!fromMembership && !fromRow) return null;
  return {
    employee_code: fromRow?.employee_code || fromMembership?.employee_code || '',
    employee_name: fromRow?.employee_name || fromMembership?.employee_name || '',
    department: fromRow?.department || fromMembership?.department || '',
  };
}

/**
 * Hydrates employee metadata for attendance write payloads (leave/update requests).
 * Order: memberships (sync) → GET /employees/:id → list pagination fallback.
 */
export async function hydrateEmployeeMetaForRequest(
  auth: HrmAuthConfig,
  memberships: MobileMembership[],
  employeeId: string,
): Promise<EmployeeRequestMeta | null> {
  const eid = employeeId.trim();
  if (!eid) return null;
  const fromMembership = resolveEmployeeMetaFromMemberships(memberships, eid);
  const row = await fetchEmployeeById(auth, eid);
  return mergeEmployeeRequestMeta(fromMembership, row);
}

/** PATCH employee avatar_url (self-service or HR). Uses write header via hrmRequest. */
export async function patchEmployeeAvatarUrl(
  auth: HrmAuthConfig,
  employeeId: string,
  avatarUrl: string | null,
) {
  const id = employeeId.trim();
  if (!id) {
    return {
      ok: false as const,
      code: 'HRM-MOB-AVT-400',
      message: 'Thiếu employeeId.',
      requestId: 'local',
    };
  }
  return hrmRequest<unknown>(auth, `/employees/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ avatar_url: avatarUrl }),
  });
}

async function fetchEmployeeByIdDirect(
  auth: HrmAuthConfig,
  employeeId: string,
): Promise<EmployeeRow | null> {
  const id = employeeId.trim();
  if (!id) return null;
  const companyId = resolveHrmCompanyHeaderId(auth.companyUuid, auth.companyId);
  if (!companyId) return null;

  const q = new URLSearchParams({ company_id: companyId });
  const res = await hrmRequest<EmployeeRow>(auth, `/employees/${id}?${q.toString()}`, { method: 'GET' });
  if (!res.ok) return null;
  const data = res.data;
  if (data && typeof data === 'object' && 'id' in data && typeof (data as EmployeeRow).id === 'string') {
    return data as EmployeeRow;
  }
  return null;
}

/** Loads employee by UUID: direct GET first, then paginated list scan. */
export async function fetchEmployeeById(
  auth: HrmAuthConfig,
  employeeId: string,
): Promise<EmployeeRow | null> {
  const id = employeeId.trim();
  if (!id) return null;

  const direct = await fetchEmployeeByIdDirect(auth, id);
  if (direct) return direct;

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
