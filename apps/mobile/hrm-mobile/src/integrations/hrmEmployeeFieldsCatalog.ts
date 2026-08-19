/**
 * @CODE-MEMORY
 * Screen:     Profile ESS â€” employee field catalog load
 * UC:         UC-HRM-MOB-12 full (W7-6)
 * BR:         BR-ESS-01
 * SRS:        docs/hrm/MOBILE_W7_SRS_DELTA.md Â§4.5 (employee-fields schema)
 * TechSpec:   docs/hrm/MOBILE_W7_TECHSPEC_DELTA.md Â· interim GET /settings-catalogs
 * Purpose:    Load active personal/basic employee field definitions for DynamicProfileForm.
 *             SRS names GET â€¦/employee-fields; until BE ships that route, use settings-catalogs
 *             overview filtered to hrm_employee_*_fields (DATA Â§7).
 * WorkItem:   PCOMP-W7-MOB-PROFILE-FULL-01
 * Coded:      2026-07-19
 * @CODE-MEMORY-CHANGE 2026-07-28 â€” caller must pass Plane B slug (resolveDirectoryQueryCompanyId)
 *
 * Callers:
 *   - features/profile/ProfileScreen.tsx â†’ fetchEmployeeFieldsCatalog
 *
 * Callees:
 *   - hrmRequest GET /settings-catalogs?company_id=
 *
 * FE-Actions:
 *   | User action | Handler | Lib |
 *   | Focus Profile | load catalog | fetchEmployeeFieldsCatalog |
 *
 * Impact:     Wrong company slug â†’ empty catalog â†’ fallback DEFAULT_W7 only
 * must_keep:  Fail-soft to null (UI uses DEFAULT_W7_PERSONAL_FIELD_CATALOG); Plane B slug not LE UUID
 * SOLID:      Integration only â€” mapping in dynamicProfileForm.ts
 * LastVerified: integrations/__tests__/hrmEmployeeFieldsCatalog.test.ts
 */

import type { EmployeeFieldCatalogItem } from '../utils/dynamicProfileForm';
import { hrmRequest } from './hrmApiClient';
import type { HrmAuthConfig } from './types';

const PROFILE_CATALOG_KEYS = new Set([
  'hrm_employee_basic_fields',
  'hrm_employee_personal_fields',
]);

type CatalogOverviewRow = {
  catalogKey?: string;
  catalog_key?: string;
  key?: string;
  effectiveItems?: Array<{ code?: string; label?: string; unit?: string | null; status?: string }>;
  hrmExtensionItems?: Array<{ code?: string; label?: string; unit?: string | null; status?: string }>;
  items?: Array<{ code?: string; label?: string; unit?: string | null; status?: string }>;
  xbosItems?: Array<{ code?: string; label?: string; unit?: string | null; status?: string }>;
};

function catalogKeyOf(row: CatalogOverviewRow): string {
  return (row.catalogKey || row.catalog_key || row.key || '').trim().toLowerCase();
}

function itemsOf(row: CatalogOverviewRow): Array<{
  code?: string;
  label?: string;
  unit?: string | null;
  status?: string;
}> {
  if (Array.isArray(row.effectiveItems) && row.effectiveItems.length > 0) return row.effectiveItems;
  if (Array.isArray(row.hrmExtensionItems) && row.hrmExtensionItems.length > 0) {
    return row.hrmExtensionItems;
  }
  if (Array.isArray(row.items) && row.items.length > 0) return row.items;
  if (Array.isArray(row.xbosItems) && row.xbosItems.length > 0) return row.xbosItems;
  return [];
}

/** Parse settings-catalogs overview â†’ flat employee field list for profile ESS. */
export function parseEmployeeFieldsFromCatalogsOverview(data: unknown): EmployeeFieldCatalogItem[] {
  const catalogs =
    data && typeof data === 'object' && 'catalogs' in data
      ? (data as { catalogs: unknown }).catalogs
      : data;
  if (!Array.isArray(catalogs)) return [];

  const out: EmployeeFieldCatalogItem[] = [];
  const seen = new Set<string>();

  for (const raw of catalogs) {
    if (!raw || typeof raw !== 'object') continue;
    const row = raw as CatalogOverviewRow;
    const catalogKey = catalogKeyOf(row);
    if (!PROFILE_CATALOG_KEYS.has(catalogKey)) continue;
    for (const item of itemsOf(row)) {
      const code = typeof item.code === 'string' ? item.code.trim().toLowerCase() : '';
      if (!code || seen.has(code)) continue;
      const label = typeof item.label === 'string' ? item.label.trim() : code;
      const status = typeof item.status === 'string' ? item.status : 'active';
      if (status !== 'active' && status !== 'draft') continue;
      seen.add(code);
      out.push({
        code,
        label: label || code,
        unit: typeof item.unit === 'string' ? item.unit : null,
        status,
        catalogKey,
      });
    }
  }
  return out;
}

/**
 * Interim W7-6 catalog fetch (SRS employee-fields).
 * Prefer holding/member TEXT slug on query (settings-catalogs partition).
 */
export async function fetchEmployeeFieldsCatalog(
  auth: HrmAuthConfig,
  companyId: string,
): Promise<EmployeeFieldCatalogItem[] | null> {
  const cid = companyId.trim();
  if (!cid) return null;
  const q = new URLSearchParams({ company_id: cid });
  const res = await hrmRequest<unknown>(auth, `/settings-catalogs?${q.toString()}`, {
    method: 'GET',
  });
  if (!res.ok) return null;
  const parsed = parseEmployeeFieldsFromCatalogsOverview(res.data);
  return parsed.length > 0 ? parsed : null;
}
