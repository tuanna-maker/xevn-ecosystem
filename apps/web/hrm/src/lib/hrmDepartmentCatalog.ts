/**
 * @CODE-MEMORY
 * Lib:        HRM org chart ∪ settings catalog → department picker options
 * WorkItem:   PO-HRM-CTR-CREATE-CATALOG-PARITY-01
 * must_keep:  mergeDepartmentPickerOptions — primary (HRM) wins on duplicate code
 *
 * @CODE-MEMORY-CHANGE 2026-08-24 PO-HRM-CTR-CREATE-CATALOG-PARITY-01
 * change_mode: EXPAND
 * What: loadCompanyDepartments + mergeDepartmentPickerOptions — dual SoT for form pickers
 * Why: Tab Phòng ban (public.departments) vs catalog departments; BE assert parity
 * Spec: docs/program/specs/PO-HRM-CTR-CREATE-CATALOG-PARITY-01.md
 */
import {
  getSettingsCatalogsOverview,
  listDepartments,
  type HrmSettingsCatalogOverviewRow,
  type HrmSpreadsheetScope,
} from '@/integrations/hrmApi';
import type { CatalogPickerOption } from '@/lib/catalogSearchPicker';
import { toErrorMessage } from '@/lib/apiError';
import {
  getPortalJwtRoleCode,
  getPortalJwtTenantId,
  resolveHrmSettingsCatalogScope,
  resolveHrmSpreadsheetScope,
} from '@/lib/hrmSpreadsheetScope';
import {
  HRM_LIST_DEFAULT_COMPANY_ID,
  HRM_MASTER_TENANT_ID,
  HRM_ROLLUP_TENANT_IDS,
} from '@/lib/hrmListScope';
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
  /** Tenant partition (group CEO rollup / tenant-only scope). */
  tenant_id?: string | null;
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
    tenant_id:
      typeof item.tenant_id === 'string' && item.tenant_id.trim()
        ? item.tenant_id.trim()
        : null,
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

/** Map merged HRM + catalog department rows → CatalogSearchPicker options (code SoT, id fallback). */
export function departmentPickerOptionsFromCompanyRows(
  rows: readonly CatalogDepartmentRow[],
): CatalogPickerOption[] {
  const out: CatalogPickerOption[] = [];
  const seen = new Set<string>();
  for (const row of rows) {
    if (row.status && row.status !== 'active') continue;
    const label = row.name?.trim();
    if (!label) continue;
    const code = row.code?.trim() || row.id?.trim();
    if (!code) continue;
    const key = code.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ value: code, label, code: row.code?.trim() || code });
  }
  return out.sort((a, b) =>
    a.label.localeCompare(b.label, 'vi', { sensitivity: 'base' }),
  );
}

/** Union picker options — primary wins on duplicate code (HRM physical row over catalog). */
export function mergeDepartmentPickerOptions(
  primary: readonly CatalogPickerOption[],
  secondary: readonly CatalogPickerOption[],
): CatalogPickerOption[] {
  const merged = new Map<string, CatalogPickerOption>();
  for (const opt of secondary) {
    const key = (opt.code ?? opt.value).trim().toLowerCase();
    if (!key) continue;
    merged.set(key, opt);
  }
  for (const opt of primary) {
    const key = (opt.code ?? opt.value).trim().toLowerCase();
    if (!key) continue;
    merged.set(key, opt);
  }
  return [...merged.values()].sort((a, b) =>
    a.label.localeCompare(b.label, 'vi', { sensitivity: 'base' }),
  );
}

/** Group CEO on master tenant — union department catalogs across all member tenants. */
export function isGroupCeoDepartmentRollupContext(): boolean {
  const role = getPortalJwtRoleCode()?.trim().toLowerCase();
  const tenant = getPortalJwtTenantId()?.trim().toLowerCase();
  return (
    tenant === HRM_MASTER_TENANT_ID &&
    (role === 'group_ceo' || (role != null && role.startsWith('group_')))
  );
}

/** Stable merge key — prefer catalog code, else normalized name; tenant prefix when rollup. */
export function departmentMergeKey(
  row: CatalogDepartmentRow,
  rollupByTenant = false,
): string {
  const tenant = rollupByTenant
    ? (row.tenant_id?.trim().toLowerCase() || row.company_id?.trim().toLowerCase() || '')
    : '';
  const prefix = tenant ? `${tenant}:` : '';
  const code = row.code?.trim().toLowerCase();
  if (code) return `${prefix}code:${code}`;
  return `${prefix}name:${row.name.trim().toLowerCase()}`;
}

/**
 * Union HRM physical departments + settings catalog effective items.
 * HRM row wins on duplicate key; rollup mode keeps same code across tenants distinct.
 */
export function mergeDepartmentCatalogRows(
  hrmRows: CatalogDepartmentRow[],
  catalogRows: CatalogDepartmentRow[],
  rollupByTenant = false,
): CatalogDepartmentRow[] {
  const merged = new Map<string, CatalogDepartmentRow>();
  for (const row of catalogRows) {
    if (!row.name?.trim()) continue;
    merged.set(departmentMergeKey(row, rollupByTenant), row);
  }
  for (const row of hrmRows) {
    if (!row.name?.trim()) continue;
    merged.set(departmentMergeKey(row, rollupByTenant), row);
  }
  return [...merged.values()].sort(
    (a, b) =>
      a.sort_order - b.sort_order ||
      a.name.localeCompare(b.name, 'vi', { sensitivity: 'base' }),
  );
}

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
  let hrmRows: CatalogDepartmentRow[] = [];
  let hrmError: string | null = null;
  let catalogRows: CatalogDepartmentRow[] = [];
  let catalogError: string | null = null;
  const scope = resolveHrmSpreadsheetScope(companyId);

  try {
    const response = await listDepartments({ company_id: companyId }, scope ?? undefined);
    hrmRows = (response.data ?? [])
      .map((row) => mapHrmDepartmentRow(row))
      .filter((row) => row.id && row.name);
  } catch (error) {
    hrmError = toErrorMessage(error, 'Không tải được danh sách phòng ban.');
  }

  try {
    if (isGroupCeoDepartmentRollupContext()) {
      catalogRows = await listDepartmentsFromSettingsCatalogRollup();
    } else {
      const catalogScope = resolveHrmSettingsCatalogScope(companyId);
      if (catalogScope) {
        catalogRows = await listDepartmentsFromSettingsCatalogForScope(catalogScope);
      } else {
        catalogRows = await listDepartmentsFromSettingsCatalog(companyId);
      }
    }
  } catch (error) {
    catalogError = toErrorMessage(
      error,
      'Không tải được danh sách phòng ban từ danh mục công ty.',
    );
  }

  const rollupByTenant = isGroupCeoDepartmentRollupContext();
  const merged = mergeDepartmentCatalogRows(hrmRows, catalogRows, rollupByTenant);
  if (merged.length > 0) {
    return { rows: merged, fetchError: null };
  }
  return { rows: [], fetchError: hrmError ?? catalogError };
}

/** Department labels from synced XBOS settings catalog for one tenant/company scope. */
export async function listDepartmentsFromSettingsCatalogForScope(
  scope: HrmSpreadsheetScope,
): Promise<CatalogDepartmentRow[]> {
  const overview = await getSettingsCatalogsOverview(scope);
  const deptCatalog = findDepartmentCatalog(overview.catalogs ?? []);
  const items = (deptCatalog?.effectiveItems ?? []).filter((item) => item.status === 'active');
  const now = new Date().toISOString();
  return items.map((item, index) => ({
    id: item.code?.trim() || `catalog-dept-${scope.tenantId}-${index}`,
    name: item.label.trim(),
    code: item.code?.trim() || null,
    company_id: scope.companyId,
    tenant_id: scope.tenantId,
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

/** Group CEO — load department catalog from rollup tenants (skip 409 partitions). */
export async function listDepartmentsFromSettingsCatalogRollup(): Promise<CatalogDepartmentRow[]> {
  const rows: CatalogDepartmentRow[] = [];
  const jwtTenant = getPortalJwtTenantId()?.trim().toLowerCase();
  // Only request catalog for JWT tenant — cross-tenant headers cause 409 SCOPE_CONTEXT_MISMATCH.
  const tenants = jwtTenant ? [jwtTenant] : [...HRM_ROLLUP_TENANT_IDS];
  for (const tenantId of tenants) {
    try {
      const batch = await listDepartmentsFromSettingsCatalogForScope({
        tenantId,
        companyId: HRM_LIST_DEFAULT_COMPANY_ID,
      });
      rows.push(...batch);
    } catch (error) {
      console.warn(`[hrmDepartmentCatalog] catalog rollup skipped for ${tenantId}`, error);
    }
  }
  return rows;
}

/** Department labels from synced XBOS settings catalog (API mode — no Supabase `departments` table). */
export async function listDepartmentsFromSettingsCatalog(
  companyId: string,
): Promise<CatalogDepartmentRow[]> {
  const scope = resolveHrmSettingsCatalogScope(companyId);
  if (!scope) return [];
  return listDepartmentsFromSettingsCatalogForScope(scope);
}
