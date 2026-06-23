/** Mirrors `HRM_COMPANY_UUID_BY_SLUG` in hrm-api — metadata submit requires UUID company_id. */
export const HRM_HOLDING_COMPANY_UUID = '10000000-0000-4000-8000-000000000001';

const HRM_COMPANY_UUID_BY_SLUG: Record<string, string> = {
  main: HRM_HOLDING_COMPANY_UUID,
  holding: HRM_HOLDING_COMPANY_UUID,
  trsport: '10000000-0000-4000-8000-000000000002',
  logistics: '10000000-0000-4000-8000-000000000003',
  finance: '10000000-0000-4000-8000-000000000004',
  services: '10000000-0000-4000-8000-000000000005',
};

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Metadata change-requests POST requires `@IsUUID()` company_id — map portal rollup `main` → holding UUID.
 */
export function resolveHrmMetadataCompanyUuid(
  companyId: string | null | undefined,
): string | null {
  const raw = companyId?.trim();
  if (!raw) return null;
  if (UUID_RE.test(raw)) return raw.toLowerCase();
  return HRM_COMPANY_UUID_BY_SLUG[raw.toLowerCase()] ?? null;
}

/** Serialize metadata JSON field once for Nest `@IsJSON()` validators. */
export function serializeMetadataJsonValue(value: unknown): string {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return 'null';
    try {
      JSON.parse(trimmed);
      return trimmed;
    } catch {
      return JSON.stringify(value);
    }
  }
  return JSON.stringify(value ?? null);
}
