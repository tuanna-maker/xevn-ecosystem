/**
 * HRM list scope — ADR scope ladder / U39 parity with web embed.
 * JWT keeps `main` for group CEO; query `company_id` may narrow to operating slug.
 */

export const HRM_LIST_DEFAULT_COMPANY_ID = 'main';

export const HRM_OPERATING_UNIT_SLUGS_LIST = [
  'holding',
  'trsport',
  'logistics',
  'finance',
  'services',
] as const;

export type HrmOperatingUnitSlug = (typeof HRM_OPERATING_UNIT_SLUGS_LIST)[number];

const HRM_OPERATING_UNIT_SLUGS = new Set<string>(HRM_OPERATING_UNIT_SLUGS_LIST);

export const HRM_GROUP_LIST_ALIASES = new Set(['holding', 'all']);

export const HRM_MASTER_TENANT_ID = 'xevn';

export function isHrmOperatingUnitSlug(value: string | null | undefined): boolean {
  if (!value) return false;
  return HRM_OPERATING_UNIT_SLUGS.has(value.trim());
}

export function isGroupCeoMasterTenant(tenantId: string | null | undefined): boolean {
  return tenantId?.trim().toLowerCase() === HRM_MASTER_TENANT_ID;
}

export function coerceHrmListCompanyId(companyId: string | null | undefined): string {
  const id = companyId?.trim();
  if (!id || HRM_GROUP_LIST_ALIASES.has(id) || id.toLowerCase() === HRM_MASTER_TENANT_ID) {
    return HRM_LIST_DEFAULT_COMPANY_ID;
  }
  if (id === 'holding') return HRM_LIST_DEFAULT_COMPANY_ID;
  if (isHrmOperatingUnitSlug(id)) return id;
  return id;
}

export function normalizeHrmApiListCompanyId(companyId: string | null | undefined): string {
  const id = companyId?.trim();
  if (!id || id === 'all') return HRM_LIST_DEFAULT_COMPANY_ID;
  if (isHrmOperatingUnitSlug(id)) return id;
  return coerceHrmListCompanyId(id);
}

export function resolveHrmOperatingUnitQueryCompanyId(
  selected: 'all' | string | null | undefined,
): string {
  return normalizeHrmApiListCompanyId(selected === 'all' ? null : selected);
}

/** Maps stored companyId back to filter selection for UI highlight. */
export function readOperatingUnitFilterSelection(companyId: string): 'all' | HrmOperatingUnitSlug {
  const id = companyId?.trim();
  if (!id || id === 'main' || id === 'all') return 'all';
  if (isHrmOperatingUnitSlug(id)) return id as HrmOperatingUnitSlug;
  return 'all';
}
