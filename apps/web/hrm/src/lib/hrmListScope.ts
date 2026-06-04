/**
 * HRM operational list scope — ADR-GROUP-CEO-MAIN-HOLDING-SCOPE / EX-SA01-P1-03.
 * Embed and Nest list APIs use `company_id=main` for group rollup; never `holding` literal on queries.
 */
export const HRM_LIST_DEFAULT_COMPANY_ID = 'main';

/** Legacy group aliases that must not be sent on HRM list REST (use `main` rollup). */
export const HRM_GROUP_LIST_ALIASES = new Set(['holding', 'all']);

/** Master tenant slug must never be used as operational company_id in embed queries. */
export const HRM_MASTER_TENANT_ID = 'xevn';

/**
 * Normalize company id for HRM list / embed GET query params and scope headers.
 * Member operating slugs (trsport, logistics, …) pass through unchanged.
 */
export function coerceHrmListCompanyId(companyId: string | null | undefined): string {
  const id = companyId?.trim();
  if (!id || HRM_GROUP_LIST_ALIASES.has(id) || id.toLowerCase() === HRM_MASTER_TENANT_ID) {
    return HRM_LIST_DEFAULT_COMPANY_ID;
  }
  return id;
}
