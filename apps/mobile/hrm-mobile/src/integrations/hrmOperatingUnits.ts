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

/** BA-D-01 §5 pilot fallback — aligned with BE `hrm-operating-unit-registry`. */
export const PILOT_HRM_OPERATING_UNITS: HrmOperatingUnitRow[] = [
  { operating_slug: 'holding', display_name_vi: 'Tập đoàn XeVN', rollup_order: 1 },
  { operating_slug: 'trsport', display_name_vi: 'Khối Vận tải X.E', rollup_order: 2 },
  { operating_slug: 'logistics', display_name_vi: 'Khối Logistics X.E', rollup_order: 3 },
  { operating_slug: 'finance', display_name_vi: 'Khối Tài chính X.E', rollup_order: 4 },
  { operating_slug: 'services', display_name_vi: 'Khối Dịch vụ X.E', rollup_order: 5 },
];

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
    const label =
      (item as { display_name_vi?: string }).display_name_vi?.trim() ||
      PILOT_HRM_OPERATING_UNITS.find((p) => p.operating_slug === slug)?.display_name_vi ||
      slug;
    const order = Number((item as { rollup_order?: number }).rollup_order);
    rows.push({
      operating_slug: slug as HrmOperatingUnitSlug,
      display_name_vi: label,
      rollup_order: Number.isFinite(order) ? order : HRM_OPERATING_UNIT_SLUGS_LIST.indexOf(slug as HrmOperatingUnitSlug) + 1,
    });
  }
  return sortOperatingUnits(rows);
}

/**
 * Group CEO — operating units from Nest; member CEO gets empty (BE scope).
 * Falls back to pilot registry when API unavailable.
 */
export async function fetchHrmOperatingUnits(auth: HrmAuthConfig): Promise<HrmOperatingUnitRow[]> {
  const res = await hrmRequest<HrmOperatingUnitRow[]>(auth, '/operating-units', { method: 'GET' });
  if (res.ok && Array.isArray(res.data) && res.data.length > 0) {
    const normalized = normalizeOperatingUnitRows(res.data);
    if (normalized.length > 0) return normalized;
  }
  return PILOT_HRM_OPERATING_UNITS;
}
