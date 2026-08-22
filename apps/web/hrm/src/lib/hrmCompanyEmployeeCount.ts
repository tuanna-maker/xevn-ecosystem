/**
 * @CODE-MEMORY
 * Screen:     HRM → Công ty / CompanyManagement — cột NV + card Tổng nhân viên
 * UC:         UC-HRM-CO-01 · UC-HRM-03 · FR-HRM-CO-HC-01 · AC-CO-EMP-01..06
 * BR:         BR-INT-05 (ĐVTV LE ↔ operating slug workforce)
 * SRS:        docs/hrm/HRM_MENU_DATA_LINKAGE_MATRIX.md §2.2 `/company` · docs/hrm/SRS.md §15 BR-INT-05
 * TechSpec:   GET /api/hrm/employees/summary · hrm-list-scope operating slugs · GET /operating-units
 * Purpose:    Bridge hàng Công ty (LE UUID / holding root) → operating slug; enrich employee_count
 *             từ workforce summary — cấm dùng LE UUID làm company_id cho count.
 * WorkItem:   D-HRM-CO-EMP-COUNT-FE-01
 * Coded:      2026-07-27
 * Callers:    CompanyManagement.fetchCompanies
 * Callees:    getEmployeesSummary · fetchHrmOperatingUnits · GROUP_HOLDING_ROOT_ID
 * FEActions:  load group-member-units → resolve slug → summary by slug → bind count
 * Impact:     Hard-null employee_count + `|| 0` → card/table luôn 0 dù dashboard ~1100
 * must_keep:  CO-BIND tax/founded/MST không đổi; OU filter JWT companyId không mutate; dashboard path
 * SOLID:      Pure bridge + thin enrich fetch — tách khỏi tenantScope XBOS mapper
 * LastVerified: hrmCompanyEmployeeCount.test.ts
 *
 * Interim (BE D-HRM-CO-EMP-COUNT-BE-01 chưa ship `by_company`):
 *   Prefer summary.by_company khi có; else N× GET /employees/summary?company_id=<slug>.
 *
 * @CODE-MEMORY-CHANGE 2026-08-03
 * WorkItem: BUILD-GAP-HRM-COMPANY-EMP-COUNT-01
 * change_mode: FIX (restore from git 43c479a)
 * What: Khôi phục module bị thiếu sau build-gap metadataWorkflowLabel — vite ENOENT import CompanyManagement.
 * must_keep: metadataWorkflowLabel · decisionListUi · CO-BIND CompanyManagement — không đổi logic bridge.
 *
 * @CODE-MEMORY-CHANGE 2026-08-10
 * WorkItem: D-HRM-CO-01-FE-HEADCOUNT-BIND-01
 * change_mode: UPGRADE
 * What: Card «Tổng NV» = display-ready `summary.total` (main); cột = `by_company[slug].total`;
 *       expose workforce_operating_slug cho QA testid; single GET summary khi có by_company.
 * Why: AC-CO-EMP-01 khớp Dashboard; BE D-HRM-CO-01-SUMMARY-BE-01 ship by_company Plane B
 * must_keep: «—» khi fail; không LE UUID làm company_id; CO-BIND legal enrich
 */

import { getEmployeesSummary, type HrmEmployeeSummary } from '@/integrations/hrmApi';
import {
  GROUP_HOLDING_ROOT_ID,
  type HrmCompanyRow,
} from '@/integrations/tenantScopeApi';
import {
  fetchHrmOperatingUnits,
  HRM_OPERATING_UNIT_SLUGS_LIST,
  type HrmOperatingUnitRow,
  type HrmOperatingUnitSlug,
} from '@/lib/hrmOperatingUnits';
import { isHrmOperatingUnitSlug } from '@/lib/hrmListScope';

/** Pilot UUID → slug (inverse of BE HRM_COMPANY_UUID_BY_SLUG). Never treat LE UUID as slug. */
const HRM_PILOT_UUID_TO_SLUG: Record<string, HrmOperatingUnitSlug> = {
  '10000000-0000-4000-8000-000000000001': 'holding',
  '10000000-0000-4000-8000-000000000002': 'trsport',
  '10000000-0000-4000-8000-000000000003': 'logistics',
  '10000000-0000-4000-8000-000000000004': 'finance',
  '10000000-0000-4000-8000-000000000005': 'services',
};

/** BR-INT-05 interim LE/ĐVTV display → slug (folded keys; aligned OU registry / TEST_FIXTURE). */
const FALLBACK_DISPLAY_NAME_TO_SLUG: Record<string, HrmOperatingUnitSlug> = {
  'tap doan xevn': 'holding',
  'cong ty co phan thuong mai va dich vu x.e': 'trsport',
  'cong ty tnhh du lich visun': 'logistics',
  'cong ty tnhh du lich x.e viet nam': 'finance',
  'cong ty tnhh x.e viet nam': 'services',
};

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function normalizeCompanyDisplayKey(name: string | null | undefined): string {
  return (name ?? '')
    .normalize('NFC')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

/** Strip Vietnamese diacritics for resilient name match. */
export function foldCompanyDisplayKey(name: string | null | undefined): string {
  return normalizeCompanyDisplayKey(name)
    .normalize('NFD')
    .replace(/\p{M}/gu, '');
}

export function buildOperatingUnitNameToSlugMap(
  units: HrmOperatingUnitRow[],
): Map<string, HrmOperatingUnitSlug> {
  const map = new Map<string, HrmOperatingUnitSlug>();
  for (const row of units) {
    if (!isHrmOperatingUnitSlug(row.operating_slug)) continue;
    const slug = row.operating_slug;
    const key = normalizeCompanyDisplayKey(row.display_name_vi);
    const folded = foldCompanyDisplayKey(row.display_name_vi);
    if (key) map.set(key, slug);
    if (folded) map.set(folded, slug);
  }
  return map;
}

/**
 * Resolve workforce operating slug for a Company row.
 * Holding root / Tập đoàn → `holding`. Member LE UUID is NOT used as company_id.
 */
export function resolveHrmCompanyRowOperatingSlug(
  company: Pick<HrmCompanyRow, 'id' | 'name' | 'code'>,
  nameToSlug?: Map<string, HrmOperatingUnitSlug>,
): HrmOperatingUnitSlug | null {
  const id = company.id?.trim() ?? '';
  if (id === GROUP_HOLDING_ROOT_ID) return 'holding';

  if (UUID_RE.test(id)) {
    const fromPilot = HRM_PILOT_UUID_TO_SLUG[id.toLowerCase()];
    if (fromPilot) return fromPilot;
    // Legal-entity UUID from XBOS — must NOT be passed to employees/summary as company_id.
  } else if (isHrmOperatingUnitSlug(id)) {
    return id;
  }

  const nameKey = normalizeCompanyDisplayKey(company.name);
  const nameFolded = foldCompanyDisplayKey(company.name);
  if (nameKey.includes('tập đoàn') || nameFolded.includes('tap doan')) {
    return 'holding';
  }

  const fromLive =
    (nameKey && nameToSlug?.get(nameKey)) ||
    (nameFolded && nameToSlug?.get(nameFolded));
  if (fromLive) return fromLive;

  const fromFallback = FALLBACK_DISPLAY_NAME_TO_SLUG[nameFolded];
  if (fromFallback) return fromFallback;

  return null;
}

export type HrmCompanyRowWithWorkforce = HrmCompanyRow & {
  /** Plane B operating slug for QA `co-row-{slug}-count` — not persisted. */
  workforce_operating_slug: HrmOperatingUnitSlug | null;
};

export function enrichHrmCompaniesWithEmployeeCounts(
  companies: HrmCompanyRow[],
  countsBySlug: ReadonlyMap<string, number | null>,
  nameToSlug?: Map<string, HrmOperatingUnitSlug>,
): HrmCompanyRowWithWorkforce[] {
  return companies.map((company) => {
    const slug = resolveHrmCompanyRowOperatingSlug(company, nameToSlug);
    if (!slug) {
      return { ...company, employee_count: null, workforce_operating_slug: null };
    }
    if (!countsBySlug.has(slug)) {
      return { ...company, employee_count: null, workforce_operating_slug: slug };
    }
    const count = countsBySlug.get(slug);
    return {
      ...company,
      employee_count: typeof count === 'number' && !Number.isNaN(count) ? count : null,
      workforce_operating_slug: slug,
    };
  });
}

/** Sum known counts; null when every row is unknown (API fail) — UI shows «—», not 0. */
export function sumKnownEmployeeCounts(
  companies: ReadonlyArray<{ employee_count: number | null | undefined }>,
): number | null {
  let any = false;
  let sum = 0;
  for (const row of companies) {
    if (typeof row.employee_count === 'number' && !Number.isNaN(row.employee_count)) {
      any = true;
      sum += row.employee_count;
    }
  }
  return any ? sum : null;
}

export function formatHrmEmployeeCount(
  count: number | null | undefined,
): string {
  if (count == null || Number.isNaN(count)) return '—';
  return String(count);
}

export function parseEmployeeSummaryByCompany(
  summary: HrmEmployeeSummary,
): Map<string, number> | null {
  const rows = summary.by_company;
  if (!Array.isArray(rows) || rows.length === 0) return null;
  const map = new Map<string, number>();
  for (const row of rows) {
    const slug = String(row.company_id ?? '').trim();
    if (!isHrmOperatingUnitSlug(slug)) continue;
    const total = Number(row.total);
    if (Number.isFinite(total)) map.set(slug, total);
  }
  return map.size > 0 ? map : null;
}

export function parseEmployeeSummaryByTenant(
  summary: HrmEmployeeSummary,
): Map<string, number> | null {
  const rows = summary.by_tenant;
  if (!Array.isArray(rows) || rows.length === 0) return null;
  const map = new Map<string, number>();
  for (const row of rows) {
    const tenantId = String(row.tenant_id ?? '').trim().toLowerCase();
    if (!tenantId) continue;
    const total = Number(row.total);
    if (Number.isFinite(total)) map.set(tenantId, total);
  }
  return map.size > 0 ? map : null;
}

function isTenantOnlyScopeEnabled(): boolean {
  const raw = import.meta.env.VITE_HRM_TENANT_ONLY_SCOPE;
  return raw === '1' || raw === 'true' || raw === 'yes';
}

export function enrichHrmCompaniesWithTenantCounts(
  companies: HrmCompanyRow[],
  countsByTenant: ReadonlyMap<string, number | null>,
): HrmCompanyRowWithWorkforce[] {
  return companies.map((company) => {
    const tenantId = company.tenant_id?.trim().toLowerCase();
    if (!tenantId) {
      return { ...company, employee_count: null, workforce_operating_slug: null };
    }
    const count = countsByTenant.get(tenantId);
    return {
      ...company,
      employee_count: typeof count === 'number' && !Number.isNaN(count) ? count : null,
      workforce_operating_slug: null,
    };
  });
}

async function fetchEmployeeCountsByTenant(
  tenantIds: readonly string[],
): Promise<HrmWorkforceCountFetchResult> {
  const unique = [
    ...new Set(tenantIds.map((id) => id.trim().toLowerCase()).filter(Boolean)),
  ];
  const result = new Map<string, number | null>();
  if (unique.length === 0) {
    return { countsBySlug: result, rollupTotal: null };
  }
  try {
    const rollup = await getEmployeesSummary({ company_id: 'main' });
    const rollupTotal = Number.isFinite(rollup.total) ? rollup.total : null;
    const byTenant = parseEmployeeSummaryByTenant(rollup);
    if (byTenant) {
      for (const tenantId of unique) {
        result.set(tenantId, byTenant.has(tenantId) ? (byTenant.get(tenantId) as number) : null);
      }
      return { countsBySlug: result, rollupTotal };
    }
  } catch {
    // fall through — honest null counts
  }
  return { countsBySlug: result, rollupTotal: null };
}

export type HrmWorkforceCountFetchResult = {
  countsBySlug: Map<string, number | null>;
  /** AC-CO-EMP-01 — `data.total` from GET summary?company_id=main */
  rollupTotal: number | null;
};

/**
 * Load workforce headcounts keyed by operating slug.
 * Prefer BE `by_company` on rollup summary when present; else one summary call per slug.
 */
export async function fetchEmployeeCountsByOperatingSlug(
  slugs: readonly string[],
): Promise<HrmWorkforceCountFetchResult> {
  const unique = [
    ...new Set(
      slugs.filter((s): s is HrmOperatingUnitSlug => isHrmOperatingUnitSlug(s)),
    ),
  ];
  const result = new Map<string, number | null>();
  if (unique.length === 0) {
    return { countsBySlug: result, rollupTotal: null };
  }

  let rollupTotal: number | null = null;

  // Prefer single rollup + by_company (D-HRM-CO-01-SUMMARY-BE-01).
  try {
    const rollup = await getEmployeesSummary({ company_id: 'main' });
    rollupTotal = Number.isFinite(rollup.total) ? rollup.total : null;
    const byCompany = parseEmployeeSummaryByCompany(rollup);
    if (byCompany) {
      for (const slug of unique) {
        result.set(slug, byCompany.has(slug) ? (byCompany.get(slug) as number) : null);
      }
      return { countsBySlug: result, rollupTotal };
    }
  } catch {
    rollupTotal = null;
    // Fall through to per-slug interim.
  }

  await Promise.all(
    unique.map(async (slug) => {
      try {
        const summary = await getEmployeesSummary({ company_id: slug });
        result.set(slug, Number.isFinite(summary.total) ? summary.total : null);
      } catch {
        result.set(slug, null);
      }
    }),
  );
  return { countsBySlug: result, rollupTotal };
}

/**
 * After XBOS group-member-units (+ CO-BIND legal enrich), bind workforce counts by slug.
 * Does not mutate OU filter / JWT companyId.
 */
export type HrmCompanyWorkforceEnrichResult = {
  companies: HrmCompanyRowWithWorkforce[];
  rollupTotal: number | null;
};

export async function enrichHrmCompaniesWithWorkforceCounts(
  companies: HrmCompanyRow[],
): Promise<HrmCompanyWorkforceEnrichResult> {
  if (companies.length === 0) {
    return { companies: [], rollupTotal: null };
  }

  if (isTenantOnlyScopeEnabled()) {
    const tenantIds = companies
      .map((c) => c.tenant_id?.trim().toLowerCase())
      .filter((id): id is string => Boolean(id));
    const { countsBySlug: countsByTenant, rollupTotal } =
      await fetchEmployeeCountsByTenant(tenantIds);
    return {
      companies: enrichHrmCompaniesWithTenantCounts(companies, countsByTenant),
      rollupTotal,
    };
  }

  let units: HrmOperatingUnitRow[] = [];
  try {
    units = await fetchHrmOperatingUnits();
  } catch {
    units = [];
  }
  const nameToSlug = buildOperatingUnitNameToSlugMap(units);

  const slugByRow = companies.map((c) =>
    resolveHrmCompanyRowOperatingSlug(c, nameToSlug),
  );
  const slugsNeeded = slugByRow.filter(
    (s): s is HrmOperatingUnitSlug => s != null,
  );
  // Always request full pilot slug set when any holding/member present — aligns sum ≈ dashboard.
  const slugs =
    slugsNeeded.length > 0
      ? [...new Set([...slugsNeeded, ...HRM_OPERATING_UNIT_SLUGS_LIST])]
      : [];

  const { countsBySlug, rollupTotal } = await fetchEmployeeCountsByOperatingSlug(slugs);
  return {
    companies: enrichHrmCompaniesWithEmployeeCounts(companies, countsBySlug, nameToSlug),
    rollupTotal,
  };
}
