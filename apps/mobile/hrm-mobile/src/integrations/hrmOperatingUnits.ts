import type { HrmAuthConfig } from './types';
import { hrmRequest } from './hrmApiClient';
import {
  HRM_OPERATING_UNIT_SLUGS_LIST,
  type HrmOperatingUnitSlug,
  isHrmOperatingUnitSlug,
} from './hrmListScope';

export type HrmOperatingUnitRow = {
  operating_slug: HrmOperatingUnitSlug;
  display_name_vi: string;
  rollup_order: number;
};

/**
 * @CODE-MEMORY-CHANGE 2026-07-30
 * WorkItem: D-MOB-G-ORPH-KHOI-01
 * change_mode: FIX
 * What: TECHSPEC §19.1 Plane A offline fallback — zero «Khối … X.E» pilot fiction
 * Why: G-ORPH-MOB-01..03 · FR-HRM-EMP-COL-01 · BA-MOB-ORPH-KHOI-LABEL-01
 * must_keep: Slug keys unchanged; JWT / rollup_order unchanged
 */

/** Client offline map — TECHSPEC §19.1 / BA §4 Plane A legal names only. */
export const PLANE_A_COMPANY_LABELS_FALLBACK: HrmOperatingUnitRow[] = [
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

/** @deprecated Alias — use `PLANE_A_COMPANY_LABELS_FALLBACK` (Plane A bridge). */
export const PILOT_HRM_OPERATING_UNITS = PLANE_A_COMPANY_LABELS_FALLBACK;

const PLANE_A_LABEL_BY_SLUG = new Map(
  PLANE_A_COMPANY_LABELS_FALLBACK.map((row) => [row.operating_slug, row.display_name_vi] as const),
);

/** Pilot operating-unit fiction — cấm trên company-semantics (BA §5.1 FAIL pattern). */
export function isPilotKhoiFictionLabel(value: string | null | undefined): boolean {
  const v = value?.trim() ?? '';
  if (!v) return false;
  return /Khối/i.test(v) && /X\.E/i.test(v);
}

/** Sanitize API/pilot row label — replace Khối fiction with §19.1 Plane A or em-dash. */
export function sanitizeOperatingUnitDisplayLabel(
  slug: HrmOperatingUnitSlug,
  displayNameVi: string | null | undefined,
): string {
  const trimmed = displayNameVi?.trim() ?? '';
  if (trimmed && !isPilotKhoiFictionLabel(trimmed)) {
    return trimmed;
  }
  return PLANE_A_LABEL_BY_SLUG.get(slug) ?? '—';
}

export function sortOperatingUnits(rows: HrmOperatingUnitRow[]): HrmOperatingUnitRow[] {
  return [...rows].sort((a, b) => (a.rollup_order ?? 0) - (b.rollup_order ?? 0));
}

export function normalizeOperatingUnitRows(data: unknown): HrmOperatingUnitRow[] {
  if (!Array.isArray(data)) return [];
  const rows: HrmOperatingUnitRow[] = [];
  for (const item of data) {
    if (!item || typeof item !== 'object') continue;
    const slug = (item as { operating_slug?: string }).operating_slug?.trim() ?? '';
    if (!isHrmOperatingUnitSlug(slug)) continue;
    const rawLabel =
      (item as { display_name_vi?: string }).display_name_vi?.trim() ||
      PLANE_A_LABEL_BY_SLUG.get(slug as HrmOperatingUnitSlug) ||
      slug;
    const label = sanitizeOperatingUnitDisplayLabel(slug as HrmOperatingUnitSlug, rawLabel);
    const order = Number((item as { rollup_order?: number }).rollup_order);
    rows.push({
      operating_slug: slug as HrmOperatingUnitSlug,
      display_name_vi: label,
      rollup_order: Number.isFinite(order)
        ? order
        : HRM_OPERATING_UNIT_SLUGS_LIST.indexOf(slug as HrmOperatingUnitSlug) + 1,
    });
  }
  return sortOperatingUnits(rows);
}

/**
 * Group CEO — operating units from Nest; member CEO gets empty (BE scope).
 * Falls back to Plane A registry when API unavailable.
 */
export async function fetchHrmOperatingUnits(auth: HrmAuthConfig): Promise<HrmOperatingUnitRow[]> {
  const res = await hrmRequest<HrmOperatingUnitRow[]>(auth, '/operating-units', { method: 'GET' });
  if (res.ok && Array.isArray(res.data) && res.data.length > 0) {
    const normalized = normalizeOperatingUnitRows(res.data);
    if (normalized.length > 0) return normalized;
  }
  return PLANE_A_COMPANY_LABELS_FALLBACK;
}
