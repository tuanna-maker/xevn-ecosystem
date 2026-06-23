import { isHrmOperatingUnitSlug } from '../integrations/hrmListScope';
import {
  PILOT_HRM_OPERATING_UNITS,
  type HrmOperatingUnitRow,
} from '../integrations/hrmOperatingUnits';

/** Group rollup aliases — aligned with web `hrmOperatingUnits` + BE scope ladder. */
const ROLLUP_SLUG_LABELS: Record<string, string> = {
  holding: 'Tập đoàn XeVN',
  main: 'Tập đoàn XeVN',
};

const VIETNAMESE_DIACRITIC = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;

/** True when label is a raw API slug (holding, du-lich) not a human-facing Vietnamese name. */
export function isRawCompanySlugLabel(value: string | null | undefined): boolean {
  const v = value?.trim().toLowerCase() ?? '';
  if (!v) return true;
  if (ROLLUP_SLUG_LABELS[v] !== undefined) return true;
  if (isHrmOperatingUnitSlug(v)) return true;
  if (VIETNAMESE_DIACRITIC.test(v)) return false;
  if (/^[a-z0-9][a-z0-9_-]*$/.test(v)) return true;
  return false;
}

/** Slug → Vietnamese label map — API rows first, pilot registry fallback (web parity). */
export function buildCompanyDisplayViMap(
  operatingUnits?: HrmOperatingUnitRow[],
): Map<string, string> {
  const map = new Map<string, string>();
  for (const row of operatingUnits ?? PILOT_HRM_OPERATING_UNITS) {
    const label = row.display_name_vi?.trim();
    if (label) map.set(row.operating_slug, label);
  }
  for (const [slug, label] of Object.entries(ROLLUP_SLUG_LABELS)) {
    if (!map.has(slug)) map.set(slug, label);
  }
  return map;
}

export type ResolveCompanyDisplayViOptions = {
  membershipCompanyDisplay?: string | null;
  operatingUnits?: HrmOperatingUnitRow[];
};

/**
 * Resolves HomeTopBar company label in Vietnamese only.
 * Known operating slugs (holding/main/trsport/…) always use registry — never raw slug or English seed.
 */
export function resolveCompanyDisplayVi(
  companyId: string | null | undefined,
  options?: ResolveCompanyDisplayViOptions,
): string {
  const slug = companyId?.trim() ?? '';
  const memDisplay = options?.membershipCompanyDisplay?.trim() ?? '';
  const labelMap = buildCompanyDisplayViMap(options?.operatingUnits);

  if (slug) {
    const mapped = labelMap.get(slug);
    if (mapped) return mapped;
  }

  if (memDisplay && !isRawCompanySlugLabel(memDisplay)) {
    return memDisplay;
  }

  if (slug && !isRawCompanySlugLabel(slug)) {
    return slug;
  }

  return 'Chưa chọn công ty';
}
