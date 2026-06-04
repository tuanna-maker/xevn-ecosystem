import {
  getSettingsCatalogsOverview,
  type HrmSettingsCatalogOverviewRow,
} from '@/integrations/hrmApi';
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
