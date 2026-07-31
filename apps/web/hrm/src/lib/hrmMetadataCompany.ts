/**
 * @CODE-MEMORY
 * Screen:     Shared HRM company key helpers (metadata UUID + leave TEXT slug)
 * UC:         UC-HRM-10 · FR-HRM-AT-10 · G-AT10-01
 * BR:         Settings catalog partition `holding` for group/main
 * SRS:        docs/client-delivery/hrm/SRS_HRM_KHACH.md §3.5 · FR-HRM-AT-10
 * TechSpec:   docs/hrm/TECHSPEC.md §14.5 · §14.9 G-AT10-01
 * Purpose:    Map portal slug ↔ pilot company UUID. Metadata mutate still needs UUID;
 *             leave create posts TEXT slug aligned Settings catalog (`holding`/`main`).
 * WorkItem:   D-HRM-LEAVE-REQ-CREATE-FE-01
 * Coded:      2026-07-27
 * must_keep:  resolveHrmMetadataCompanyUuid for metadata DTOs; leave uses slug helper
 * LastVerified: hrmMetadataCompany.test.ts · useLeaveRequests.test.ts
 *
 * @CODE-MEMORY-CHANGE 2026-07-28
 * WorkItem: D-MOB-UUID-BPRIME-FE-01
 * change_mode: FIX
 * What: resolveHrmCompanySlugForDisplay — Plane B′ UUID → operating slug; LE UUID → null (no raw UUID label)
 * Why: QC GWC residual P2 — UI must show name/slug, never LE/hash UUID
 * must_keep: metadata UUID wire; leave TEXT slug; OP/MD/INF dual-plane guards untouched
 *
 * @CODE-MEMORY-CHANGE 2026-08-01
 * WorkItem: D-HDSD-MUTATE-FE-METADATA-EXPORT-01
 * change_mode: FIX
 * What: Ship fuller module (Plane B′ SLUG_BY_UUID + resolveHrmCompanySlugForDisplay + leave slug helper)
 *       onto main allow-list — VPS@ea2df15 stub lacked export → Employees SyntaxError crash SoftDel
 * Why: QA-HDSD-MUTATE-SOFTDEL-8088-SMOKE-03A FAIL — employeeCompanyDisplayName imports missing export
 * must_keep: SoftDel DataTable · TC-025 local · CatalogSearchPicker · ViMoney (parallel); no Employees.tsx rewrite
 * LastVerified: hrmMetadataCompany.test.ts (resolveHrmCompanySlugForDisplay suite)
 */
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

/** Pilot UUID → operating slug (inverse of HRM_COMPANY_UUID_BY_SLUG; `main` shares holding UUID). */
const HRM_COMPANY_SLUG_BY_UUID: Record<string, string> = {
  [HRM_HOLDING_COMPANY_UUID]: 'holding',
  '10000000-0000-4000-8000-000000000002': 'trsport',
  '10000000-0000-4000-8000-000000000003': 'logistics',
  '10000000-0000-4000-8000-000000000004': 'finance',
  '10000000-0000-4000-8000-000000000005': 'services',
};

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Nest mutate DTOs with `@IsUUID()` company_id (metadata, …) —
 * map portal rollup `main` / member slug → holding UUID.
 * Leave create uses `resolveHrmLeaveCreateCompanyId` (TEXT slug) instead.
 */
export function resolveHrmMetadataCompanyUuid(
  companyId: string | null | undefined,
): string | null {
  const raw = companyId?.trim();
  if (!raw) return null;
  if (UUID_RE.test(raw)) return raw.toLowerCase();
  return HRM_COMPANY_UUID_BY_SLUG[raw.toLowerCase()] ?? null;
}

/**
 * Leave create POST `company_id` — G-AT10-01 TEXT slug aligned Settings catalog partition.
 * `main` / holding UUID → `holding`; member UUID → operating slug; unknown UUID passthrough.
 */
export function resolveHrmLeaveCreateCompanyId(
  companyId: string | null | undefined,
): string | null {
  const raw = companyId?.trim();
  if (!raw) return null;
  if (UUID_RE.test(raw)) {
    const lower = raw.toLowerCase();
    return HRM_COMPANY_SLUG_BY_UUID[lower] ?? lower;
  }
  const lower = raw.toLowerCase();
  if (lower === 'main' || lower === 'holding') return 'holding';
  if (HRM_COMPANY_UUID_BY_SLUG[lower]) return lower;
  return null;
}

/**
 * Display-only: normalize company key to operating slug for label maps.
 * Plane B′ pilot UUID → slug; `main` → `holding`; unknown / LE UUID → null (UI shows «—»).
 * Never returns a UUID string for end-user labels.
 */
export function resolveHrmCompanySlugForDisplay(
  companyId: string | null | undefined,
): string | null {
  const raw = companyId?.trim();
  if (!raw) return null;
  if (UUID_RE.test(raw)) {
    return HRM_COMPANY_SLUG_BY_UUID[raw.toLowerCase()] ?? null;
  }
  const lower = raw.toLowerCase();
  if (lower === 'main') return 'holding';
  return lower;
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
