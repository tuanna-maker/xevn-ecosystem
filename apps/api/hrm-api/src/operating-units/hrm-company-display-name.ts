/**
 * @CODE-MEMORY
 * Screen:     HRM employees list/get — company_display_name
 * UC:         UC-HRM-21 · AC-EMP-COL-01..04
 * BR:         BR-EMP-COL-01 · BR-EMP-COL-02 · BR-EMP-COL-03
 * SRS:        docs/qa/evidence/ba-hrm-emp-company-col-01-20260722.md
 * TechSpec:   company_slug_map.display_name synced to legal entity / ĐVTV names
 * Purpose:    Resolve + upsert company_slug_map display names from LE SoT;
 *             reject legacy «Khối …» as final company column label.
 * WorkItem:   BE-HRM-EMP-COMPANY-COL-01
 * Coded:      2026-07-22
 * Callers:    OperatingUnitsService · EmployeesService
 * Callees:    public.company_slug_map · hrm-operating-unit-registry
 * Impact:     Wrong SoT → FE cột Thông tin công ty lệch CompanyManagement
 * must_keep:  Không fallback Khối; COALESCE only empty or legacy Khoi
 * SOLID:      Shared resolve/sync — no Nest DI required
 * LastVerified: be-hrm-emp-company-col-01.spec.ts · D-HRM-EMP-COMPANY-COL-BE-02
 *
 * @CODE-MEMORY-CHANGE 2026-07-25 D-HRM-EMP-COMPANY-COL-BE-02
 * what: Export CompanyDisplayQueryFn aligned with pg QueryResultRow (nest --watch TS2322)
 * why: Wrapper `(sql, params) => db.query(...)` lost generics vs QueryFn; DX unblock start:dev
 * must_keep: LE resolve/upsert semantics; reject Khối*; no label rename
 */
import type { QueryResultRow } from 'pg';
import {
  HRM_GROUP_MEMBER_COMPANY_SLUGS,
  MASTER_TENANT_ID,
} from '../common/hrm-list-scope';
import {
  buildOperatingUnitSeedRows,
  HRM_LEGACY_KHOI_DISPLAY_NAMES,
  HRM_OPERATING_UNIT_DEFAULT_DISPLAY_NAMES,
} from './hrm-operating-unit-registry';

/** Compatible with `HrmDbService.query` — callers must forward the type param. */
export type CompanyDisplayQueryFn = <T extends QueryResultRow = QueryResultRow>(
  sql: string,
  params?: unknown[],
) => Promise<{ rows: T[] }>;

export function isLegacyKhoiDisplayName(
  name: string | null | undefined,
): boolean {
  const trimmed = name?.trim() ?? '';
  if (!trimmed) return false;
  if (HRM_LEGACY_KHOI_DISPLAY_NAMES.has(trimmed)) return true;
  return /^Khối\s+/u.test(trimmed);
}

/**
 * Plane A / ĐVTV display for an operating slug.
 * Prefer non-legacy DB value; else registry LE defaults; never return Khối*.
 */
export function resolveCompanyDisplayNameVi(
  companySlug: string | null | undefined,
  fromDb?: string | null,
): string | null {
  const slug = companySlug?.trim().toLowerCase() ?? '';
  if (!slug) return null;

  const dbName = fromDb?.trim() ?? '';
  if (dbName && !isLegacyKhoiDisplayName(dbName)) {
    return dbName;
  }

  const key = slug as keyof typeof HRM_OPERATING_UNIT_DEFAULT_DISPLAY_NAMES;
  const fromRegistry = HRM_OPERATING_UNIT_DEFAULT_DISPLAY_NAMES[key];
  return fromRegistry?.trim() || null;
}

/** Upsert slug map rows; upgrade blank or legacy Khối display_name to LE SoT (AC-EMP-COL-04). */
export async function ensureCompanySlugMapLegalDisplayNames(
  query: CompanyDisplayQueryFn,
): Promise<void> {
  await query(`
    ALTER TABLE public.company_slug_map
    ADD COLUMN IF NOT EXISTS display_name TEXT;
  `);
  for (const row of buildOperatingUnitSeedRows()) {
    await query(
      `INSERT INTO public.company_slug_map (tenant_id, company_slug, company_uuid, display_name, updated_at)
       VALUES ($1, $2, $3::uuid, $4, NOW())
       ON CONFLICT (tenant_id, company_slug) DO UPDATE SET
         display_name = CASE
           WHEN NULLIF(TRIM(company_slug_map.display_name), '') IS NULL THEN EXCLUDED.display_name
           WHEN company_slug_map.display_name ~ '^Khối[[:space:]]' THEN EXCLUDED.display_name
           ELSE company_slug_map.display_name
         END,
         company_uuid = EXCLUDED.company_uuid,
         updated_at = NOW();`,
      [row.tenant_id, row.company_slug, row.company_uuid, row.display_name],
    );
  }
}

export async function loadCompanyDisplayNameBySlug(
  query: CompanyDisplayQueryFn,
  slugs?: readonly string[],
): Promise<Map<string, string>> {
  await ensureCompanySlugMapLegalDisplayNames(query);
  const wanted =
    slugs && slugs.length > 0
      ? [...new Set(slugs.map((s) => s.trim().toLowerCase()).filter(Boolean))]
      : [...HRM_GROUP_MEMBER_COMPANY_SLUGS];
  if (!wanted.length) return new Map();

  const res = await query<{
    company_slug: string;
    display_name: string | null;
  }>(
    `SELECT company_slug, display_name
     FROM public.company_slug_map
     WHERE tenant_id = $1 AND company_slug = ANY($2::text[])`,
    [MASTER_TENANT_ID, wanted],
  );

  const map = new Map<string, string>();
  for (const row of res.rows) {
    const slug = String(row.company_slug ?? '')
      .trim()
      .toLowerCase();
    if (!slug) continue;
    const resolved = resolveCompanyDisplayNameVi(slug, row.display_name);
    if (resolved) map.set(slug, resolved);
  }
  for (const slug of wanted) {
    if (!map.has(slug)) {
      const resolved = resolveCompanyDisplayNameVi(slug, null);
      if (resolved) map.set(slug, resolved);
    }
  }
  return map;
}
