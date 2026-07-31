/**
 * @CODE-MEMORY
 * Screen:     HRM operating unit filter + company label map
 * UC:         UC-HRM-SCOPE-03 · UC-HRM-21 · AC-EMP-COL-07
 * BR:         BR-EMP-COL-01 · BR-EMP-COL-03
 * SRS:        docs/qa/evidence/ba-hrm-emp-company-col-01-20260722.md
 * TechSpec:   GET /api/hrm/operating-units — display_name_vi = LE / ĐVTV SoT
 * Purpose:    Fetch OU filter rows; build slug→label map for charts + company column.
 * WorkItem:   D-HRM-EMP-COMPANY-COL-FE-01
 * Coded:      2026-07-22
 * Callers:    HrmOperatingUnitFilterContext · Employees (via label map)
 * Callees:    GET /api/hrm/operating-units
 * Impact:     Khối fixture → company column FAIL AC-EMP-COL-01
 * must_keep:  No static Khối runtime fallback; vitest fixture = LE names
 * SOLID:      Transport + pure map helpers only
 * LastVerified: hrmOperatingUnits.test.ts · employeeCompanyDisplayName.test.ts
 *
 * @CODE-MEMORY-CHANGE 2026-07-22 D-HRM-EMP-COMPANY-COL-FE-01
 * what: TEST_FIXTURE LE/ĐVTV names (not Khối); company column uses separate resolve helper
 * why: Sponsor + BA — cột Thông tin công ty = Plane A
 */
import { getPortalAccessToken } from '@/lib/portalAuthBridge';
import { safeRandomUuid } from '@/lib/safeRandomUuid';
import {
  isHrmOperatingUnitSlug,
  normalizeHrmApiListCompanyId,
  resolveHrmOperatingUnitQueryCompanyId,
} from '@/lib/hrmListScope';

export { isHrmOperatingUnitSlug, normalizeHrmApiListCompanyId, resolveHrmOperatingUnitQueryCompanyId };

export const HRM_OPERATING_UNIT_SLUGS_LIST = [
  'holding',
  'trsport',
  'logistics',
  'finance',
  'services',
] as const;

export type HrmOperatingUnitSlug = (typeof HRM_OPERATING_UNIT_SLUGS_LIST)[number];

export type HrmOperatingUnitRow = {
  operating_slug: HrmOperatingUnitSlug;
  display_name_vi: string;
  rollup_order: number;
};

export const HRM_OPERATING_UNIT_FILTER_STORAGE_KEY = 'hrm:operating-unit-filter';

/** Vitest-only fixture — LE/ĐVTV SoT aligned with BE registry (not Khối). */
export const HRM_OPERATING_UNIT_TEST_FIXTURE: HrmOperatingUnitRow[] = [
  { operating_slug: 'holding', display_name_vi: 'Tập đoàn XeVN', rollup_order: 1 },
  {
    operating_slug: 'trsport',
    display_name_vi: 'Công ty Cổ phần Thương mại và Dịch vụ X.E',
    rollup_order: 2,
  },
  { operating_slug: 'logistics', display_name_vi: 'Công ty TNHH Du lịch Visun', rollup_order: 3 },
  {
    operating_slug: 'finance',
    display_name_vi: 'Công ty TNHH Du lịch X.E Việt Nam',
    rollup_order: 4,
  },
  { operating_slug: 'services', display_name_vi: 'Công ty TNHH X.E Việt Nam', rollup_order: 5 },
];

export function resolveOperatingUnitDisplayName(
  slug: string | null | undefined,
  labelMap?: Map<string, string>,
): string | null {
  const key = slug?.trim();
  if (!key || !labelMap?.size) return null;
  return labelMap.get(key) ?? null;
}

/** Map slug → Vietnamese display label for charts and filters (live API rows only). */
export function buildOperatingUnitLabelMap(units: HrmOperatingUnitRow[]): Map<string, string> {
  return new Map(units.map((row) => [row.operating_slug, row.display_name_vi]));
}

export function readStoredOperatingUnitFilter(): 'all' | HrmOperatingUnitSlug {
  if (typeof sessionStorage === 'undefined') return 'all';
  const raw = sessionStorage.getItem(HRM_OPERATING_UNIT_FILTER_STORAGE_KEY)?.trim();
  if (!raw || raw === 'all' || raw === 'main') return 'all';
  return isHrmOperatingUnitSlug(raw) ? raw : 'all';
}

export function writeStoredOperatingUnitFilter(selected: 'all' | string): void {
  if (typeof sessionStorage === 'undefined') return;
  sessionStorage.setItem(HRM_OPERATING_UNIT_FILTER_STORAGE_KEY, selected);
}

async function hrmApiHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    Accept: 'application/json',
    'x-request-id': safeRandomUuid(),
  };
  const token = getPortalAccessToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
    headers['x-access-token'] = token;
    headers['x-portal-access-token'] = token;
  }
  return headers;
}

/** Group CEO — operating units from Nest (403 for member CEO). Fail-closed to empty. */
export async function fetchHrmOperatingUnits(): Promise<HrmOperatingUnitRow[]> {
  try {
    const res = await fetch('/api/hrm/operating-units', {
      method: 'GET',
      headers: await hrmApiHeaders(),
    });
    const body = (await res.json().catch(() => null)) as {
      success?: boolean;
      data?: HrmOperatingUnitRow[];
    } | null;
    if (res.ok && body?.success && Array.isArray(body.data) && body.data.length > 0) {
      return [...body.data].sort((a, b) => (a.rollup_order ?? 0) - (b.rollup_order ?? 0));
    }
  } catch {
    // fail-closed — charts show Khác / membership name until API succeeds
  }
  return [];
}
