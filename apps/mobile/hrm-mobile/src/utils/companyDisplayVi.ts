import { isHrmOperatingUnitSlug } from '../integrations/hrmListScope';

import {

  isPilotKhoiFictionLabel,

  PLANE_A_COMPANY_LABELS_FALLBACK,

  type HrmOperatingUnitRow,

} from '../integrations/hrmOperatingUnits';

import { isUuid } from './uuid';



/**

 * @CODE-MEMORY

 * Screen:     Mobile HomeTopBar / Scope / Settings — company label VI

 * UC:         J-MOB-01 · Plane B′ display · UC-HRM-MOB-02 label SoT

 * Purpose:    Slug / Plane B′ UUID → nhãn tiếng Việt; cấm lộ raw UUID / English seed / Khối fiction.

 * WorkItem:   D-MOB-UUID-BPRIME-FE-01

 * Coded:      2026-07-28

 * must_keep:  Echo JWT company_uuid on wire; LE still reject at BE; display-only normalize

 * LastVerified: companyDisplayVi.test.ts

 *

 * @CODE-MEMORY-CHANGE 2026-07-28

 * WorkItem: D-MOB-UUID-BPRIME-FE-01

 * change_mode: FIX

 * What: Plane B′ UUID → operating slug before label map; unknown UUID → «—»

 * Why: QC-HRM-MOB-UUID-PLANE-01 GWC P2 — FE must not show raw LE/hash UUID as company name

 *

 * @CODE-MEMORY-CHANGE 2026-07-30

 * WorkItem: D-MOB-G-ORPH-KHOI-01

 * change_mode: FIX

 * What: Resolver priority BA §5.3 — membership VI legal → API row → Plane A fallback; reject Khối

 * Why: G-ORPH-MOB-01..03 · FR-HRM-EMP-COL-01 · AC-MOB-LABEL-01..07

 */



/** Mirrors BE `HRM_COMPANY_UUID_BY_SLUG` (Plane B′). */

export const HRM_PLANE_B_HOLDING_UUID = '10000000-0000-4000-8000-000000000001';



const HRM_PILOT_UUID_TO_SLUG: Record<string, string> = {

  [HRM_PLANE_B_HOLDING_UUID]: 'holding',

  '10000000-0000-4000-8000-000000000002': 'trsport',

  '10000000-0000-4000-8000-000000000003': 'logistics',

  '10000000-0000-4000-8000-000000000004': 'finance',

  '10000000-0000-4000-8000-000000000005': 'services',

};



/** Group rollup aliases — aligned with web `hrmOperatingUnits` + BE scope ladder. */

const ROLLUP_SLUG_LABELS: Record<string, string> = {

  holding: 'Tập đoàn XeVN',

  main: 'Tập đoàn XeVN',

};



const VIETNAMESE_DIACRITIC = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;



export { isPilotKhoiFictionLabel };



/**

 * Normalize company key for display lookup.

 * Plane B′ UUID → slug; `main` → `holding`; unknown / LE UUID → empty (caller shows «—»).

 */

export function resolveOperatingSlugForDisplay(

  companyId: string | null | undefined,

): string {

  const raw = companyId?.trim() ?? '';

  if (!raw) return '';

  if (isUuid(raw)) {

    return HRM_PILOT_UUID_TO_SLUG[raw.toLowerCase()] ?? '';

  }

  const lower = raw.toLowerCase();

  if (lower === 'main') return 'holding';

  return lower;

}



/** True when label is a raw API slug (holding, du-lich) not a human-facing Vietnamese name. */

export function isRawCompanySlugLabel(value: string | null | undefined): boolean {

  const v = value?.trim().toLowerCase() ?? '';

  if (!v) return true;

  if (isUuid(v)) return true;

  if (ROLLUP_SLUG_LABELS[v] !== undefined) return true;

  if (isHrmOperatingUnitSlug(v)) return true;

  if (VIETNAMESE_DIACRITIC.test(v)) return false;

  if (/^[a-z0-9][a-z0-9_-]*$/.test(v)) return true;

  return false;

}



/** Priority-1 membership label — valid VI legal name; cấm slug / Khối fiction. */

export function isValidViLegalCompanyDisplay(value: string | null | undefined): boolean {

  const v = value?.trim() ?? '';

  if (!v || isRawCompanySlugLabel(v) || isPilotKhoiFictionLabel(v)) return false;

  if (VIETNAMESE_DIACRITIC.test(v)) return true;

  if (/^(Công ty|Tập đoàn|TNHH|Cổ phần)/i.test(v)) return true;

  return false;

}



function planeAFallbackLabelForSlug(slug: string): string | undefined {

  if (!slug) return undefined;

  const fromRollup = ROLLUP_SLUG_LABELS[slug];

  if (fromRollup) return fromRollup;

  const row = PLANE_A_COMPANY_LABELS_FALLBACK.find((r) => r.operating_slug === slug);

  return row?.display_name_vi?.trim();

}



function labelFromOperatingUnits(

  slug: string,

  operatingUnits?: HrmOperatingUnitRow[],

): string | undefined {

  if (!slug || !operatingUnits?.length) return undefined;

  const row = operatingUnits.find((r) => r.operating_slug === slug);

  const label = row?.display_name_vi?.trim();

  if (!label || isPilotKhoiFictionLabel(label)) return undefined;

  return label;

}



/** Slug → Vietnamese label map — sanitized API rows first, Plane A fallback (web parity). */

export function buildCompanyDisplayViMap(

  operatingUnits?: HrmOperatingUnitRow[],

): Map<string, string> {

  const map = new Map<string, string>();

  for (const row of operatingUnits ?? PLANE_A_COMPANY_LABELS_FALLBACK) {

    const slug = row.operating_slug;

    const label = row.display_name_vi?.trim();

    if (!label || isPilotKhoiFictionLabel(label)) {

      const fallback = planeAFallbackLabelForSlug(slug);

      if (fallback) map.set(slug, fallback);

    } else {

      map.set(slug, label);

    }

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

 * Resolves company label in Vietnamese — BA §5.3 priority chain.

 * Known operating slugs / Plane B′ UUIDs — never raw slug/UUID or Khối pilot fiction.

 */

export function resolveCompanyDisplayVi(

  companyId: string | null | undefined,

  options?: ResolveCompanyDisplayViOptions,

): string {

  const raw = companyId?.trim() ?? '';

  const slug = resolveOperatingSlugForDisplay(companyId);

  const memDisplay = options?.membershipCompanyDisplay?.trim() ?? '';



  if (memDisplay && isValidViLegalCompanyDisplay(memDisplay)) {

    return memDisplay;

  }



  const fromApi = slug ? labelFromOperatingUnits(slug, options?.operatingUnits) : undefined;

  if (fromApi) return fromApi;



  const fromPlaneA = slug ? planeAFallbackLabelForSlug(slug) : undefined;

  if (fromPlaneA) return fromPlaneA;



  if (raw && isUuid(raw)) {

    return '—';

  }



  if (!raw) {

    return 'Chưa chọn công ty';

  }



  if (slug && isRawCompanySlugLabel(slug)) {

    return '—';

  }



  return 'Chưa chọn công ty';

}


