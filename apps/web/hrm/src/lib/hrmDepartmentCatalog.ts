import {
  getSettingsCatalogsOverview,
  listDepartments,
  type HrmSettingsCatalogOverviewRow,
} from '@/integrations/hrmApi';
import { toErrorMessage } from '@/lib/apiError';
import { resolveHrmSpreadsheetScope } from '@/lib/hrmSpreadsheetScope';

const DEPARTMENT_CATALOG_KEYS = ['departments', 'department_catalog', 'org_departments'] as const;

export function findDepartmentCatalog(
  catalogs: HrmSettingsCatalogOverviewRow[],
): HrmSettingsCatalogOverviewRow | undefined {
  return catalogs.find((c) =>
    DEPARTMENT_CATALOG_KEYS.some((key) => c.catalogKey === key || c.catalogKey?.includes('department')),
  );
}

export type CatalogDepartmentRow = {
  id: string;
  name: string;
  code: string | null;
  company_id: string;
  parent_id: string | null;
  level: number;
  sort_order: number;
  status: string;
  description: string | null;
  manager_name: string | null;
  manager_email: string | null;
  employee_count: number;
  created_at: string;
  updated_at: string;
};

export function mapHrmDepartmentRow(item: Record<string, unknown>): CatalogDepartmentRow {
  const now = new Date().toISOString();
  return {
    id: String(item.id ?? ''),
    name: String(item.name ?? ''),
    code: item.code != null && String(item.code).trim() ? String(item.code).trim() : null,
    company_id: String(item.company_id ?? ''),
    parent_id: item.parent_id != null && String(item.parent_id).trim() ? String(item.parent_id) : null,
    level: Number(item.level ?? 1),
    sort_order: Number(item.sort_order ?? 0),
    status: String(item.status ?? 'active'),
    description: item.description != null ? String(item.description) : null,
    manager_name: item.manager_name != null ? String(item.manager_name) : null,
    manager_email: item.manager_email != null ? String(item.manager_email) : null,
    employee_count: Number(item.employee_count ?? 0),
    created_at: String(item.created_at ?? now),
    updated_at: String(item.updated_at ?? now),
  };
}

export type LoadCompanyDepartmentsResult = {
  rows: CatalogDepartmentRow[];
  fetchError: string | null;
};

/**
 * Company Phòng ban tab — HRM `/departments` when populated; else XBOS-synced settings catalog (org DM §1–6).
 * Non-2xx never coerces to silent empty (P1-HRM-MENU-COMPANY-DEPT-STUB).
 * R-DEPT-FETCH-X2: in-flight coalesce so StrictMode remount / parallel callers share one network GET.
 */
const companyDepartmentsInflight = new Map<string, Promise<LoadCompanyDepartmentsResult>>();

export async function loadCompanyDepartments(companyId: string): Promise<LoadCompanyDepartmentsResult> {
  const existing = companyDepartmentsInflight.get(companyId);
  if (existing) return existing;

  const promise = loadCompanyDepartmentsOnce(companyId).finally(() => {
    companyDepartmentsInflight.delete(companyId);
  });
  companyDepartmentsInflight.set(companyId, promise);
  return promise;
}

/** @internal — test helper to clear coalesce map between cases */
export function __resetCompanyDepartmentsInflightForTests(): void {
  companyDepartmentsInflight.clear();
}

async function loadCompanyDepartmentsOnce(companyId: string): Promise<LoadCompanyDepartmentsResult> {
  let hrmError: string | null = null;

  try {
    const response = await listDepartments({ company_id: companyId });
    const hrmRows = (response.data ?? [])
      .map((row) => mapHrmDepartmentRow(row))
      .filter((row) => row.id && row.name);
    if (hrmRows.length > 0) {
      return { rows: hrmRows, fetchError: null };
    }
  } catch (error) {
    hrmError = toErrorMessage(error, 'Không tải được danh sách phòng ban từ HRM API.');
  }

  try {
    const catalogRows = await listDepartmentsFromSettingsCatalog(companyId);
    if (catalogRows.length > 0) {
      return { rows: catalogRows, fetchError: null };
    }
    if (!hrmError) {
      return { rows: [], fetchError: null };
    }
    return { rows: [], fetchError: hrmError };
  } catch (error) {
    const catalogError = toErrorMessage(error, 'Không tải được danh sách phòng ban từ danh mục công ty.');
    return { rows: [], fetchError: hrmError ?? catalogError };
  }
}

/** Department labels from synced XBOS settings catalog (API mode — no Supabase `departments` table). */
export async function listDepartmentsFromSettingsCatalog(
  companyId: string,
): Promise<CatalogDepartmentRow[]> {
  const scope = resolveHrmSpreadsheetScope(companyId);
  if (!scope) return [];
  const overview = await getSettingsCatalogsOverview(scope);
  const deptCatalog = findDepartmentCatalog(overview.catalogs ?? []);
  const items = (deptCatalog?.effectiveItems ?? []).filter((item) => item.status === 'active');
  const now = new Date().toISOString();
  return items.map((item, index) => ({
    id: item.code?.trim() || `catalog-dept-${index}`,
    name: item.label.trim(),
    code: item.code?.trim() || null,
    company_id: companyId,
    parent_id: null,
    level: 1,
    sort_order: index,
    status: 'active',
    description: null,
    manager_name: null,
    manager_email: null,
    employee_count: 0,
    created_at: now,
    updated_at: now,
  }));
}
