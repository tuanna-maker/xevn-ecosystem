/**
 * HRM operational list scope — ADR-GROUP-CEO-MAIN-HOLDING-SCOPE / EX-SA01-P1-03 / U39.
 * Embed default uses `company_id=main` for group rollup; operating-unit filter may narrow to a slug.
 */
export const HRM_LIST_DEFAULT_COMPANY_ID = 'main';

/** Pilot operating slugs — workforce partition (CARD-EMP-01). */
export const HRM_OPERATING_UNIT_SLUGS = new Set([
  'holding',
  'trsport',
  'logistics',
  'finance',
  'services',
]);

/** Legacy group aliases that must map to rollup. */
export const HRM_GROUP_LIST_ALIASES = new Set(['holding', 'all']);

/** Master tenant slug must never be used as operational company_id in embed queries. */
export const HRM_MASTER_TENANT_ID = 'xevn';

export function isHrmOperatingUnitSlug(value: string | null | undefined): boolean {
  if (!value) return false;
  return HRM_OPERATING_UNIT_SLUGS.has(value.trim());
}

/**
 * Normalize company id for HRM list / embed GET query params and scope headers.
 * Legacy alias `holding` → rollup `main`; member operating slugs pass through.
 */
export function coerceHrmListCompanyId(companyId: string | null | undefined): string {
  const id = companyId?.trim();
  if (!id || HRM_GROUP_LIST_ALIASES.has(id) || id.toLowerCase() === HRM_MASTER_TENANT_ID) {
    return HRM_LIST_DEFAULT_COMPANY_ID;
  }
  if (id === 'holding') return HRM_LIST_DEFAULT_COMPANY_ID;
  if (isHrmOperatingUnitSlug(id)) return id;
  return id;
}

/** List/query company_id — preserves explicit operating slugs incl. holding (U39 filter). */
export function normalizeHrmApiListCompanyId(companyId: string | null | undefined): string {
  const id = companyId?.trim();
  if (!id || id === 'all') return HRM_LIST_DEFAULT_COMPANY_ID;
  if (isHrmOperatingUnitSlug(id)) return id;
  return coerceHrmListCompanyId(id);
}

/** @deprecated use normalizeHrmApiListCompanyId for list APIs */
export function resolveHrmApiListCompanyId(companyId: string | null | undefined): string {
  return normalizeHrmApiListCompanyId(companyId);
}

export function resolveHrmOperatingUnitQueryCompanyId(
  selected: 'all' | string | null | undefined,
): string {
  return normalizeHrmApiListCompanyId(selected === 'all' ? null : selected);
}
