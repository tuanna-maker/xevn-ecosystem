import {
  createDepartment,
  deleteDepartment,
  updateDepartment,
  type HrmSpreadsheetScope,
} from '@/integrations/hrmApi';
import { ApiClientError } from '@/lib/apiError';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isDepartmentUuid(id: string | null | undefined): boolean {
  return Boolean(id && UUID_RE.test(id.trim()));
}

/** Suggest stable catalog code from Vietnamese department name. */
export function suggestDepartmentCode(name: string): string {
  const base = name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 48);
  return base || `phong_${Date.now()}`;
}

export type CompanyDepartmentInput = {
  name: string;
  code?: string | null;
  description?: string | null;
  manager_name?: string | null;
  manager_email?: string | null;
  parent_id?: string | null;
  level?: number;
  status?: 'active' | 'draft';
};

export type CompanyDepartmentPersistOpts = {
  departmentId?: string | null;
  catalogCode?: string | null;
  previousCatalogCode?: string | null;
};

export async function persistCompanyDepartment(
  scope: HrmSpreadsheetScope,
  input: CompanyDepartmentInput,
  opts?: CompanyDepartmentPersistOpts,
) {
  const companyId = scope.companyId;
  const name = input.name.trim();
  const code = (input.code?.trim() || suggestDepartmentCode(name)).toLowerCase();
  const status = input.status === 'draft' ? 'inactive' : 'active';
  const departmentKey =
    opts?.departmentId?.trim() ||
    opts?.catalogCode?.trim() ||
    null;

  if (departmentKey) {
    const updated = await updateDepartment(
      departmentKey,
      companyId,
      {
        company_id: companyId,
        name,
        code,
        description: input.description ?? null,
        manager_name: input.manager_name ?? null,
        manager_email: input.manager_email ?? null,
        parent_id: input.parent_id ?? null,
        level: input.level,
        status,
        previous_catalog_code:
          opts?.previousCatalogCode?.trim() ||
          opts?.catalogCode?.trim() ||
          null,
      },
      scope,
    );
    return {
      code,
      departmentId: String(updated.id ?? departmentKey),
    };
  }

  const created = await createDepartment(
    {
      company_id: companyId,
      name,
      code,
      description: input.description ?? undefined,
      manager_name: input.manager_name ?? undefined,
      manager_email: input.manager_email ?? undefined,
      parent_id: input.parent_id ?? undefined,
      level: input.level,
      status,
    },
    scope,
  );
  return {
    code,
    departmentId: String(created.id ?? ''),
  };
}

export async function removeCompanyDepartment(
  scope: HrmSpreadsheetScope,
  row: { id: string; name: string; code?: string | null },
) {
  const companyId = scope.companyId;
  const departmentKey = row.id?.trim() || row.code?.trim();
  if (!departmentKey) return;
  await deleteDepartment(departmentKey, companyId, scope);
}

export function departmentMutateErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiClientError) {
    return error.message?.trim() || fallback;
  }
  return fallback;
}
