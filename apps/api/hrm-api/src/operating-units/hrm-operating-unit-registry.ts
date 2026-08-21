/**
 * @CODE-MEMORY
 * Screen:     HRM operating units + employees «Thông tin công ty»
 * UC:         UC-HRM-21 · UC-HRM-SCOPE-03 · J-HRM-02
 * BR:         BR-EMP-COL-01..03 · BR-INT-05 · BR-DQ-01a
 * SRS:        docs/hrm/SRS.md UC-HRM-21 · §15.4 BR-INT-05
 * TechSpec:   docs/program/governance/p1-prod-int-ba-d-01-20260607.md Plane A/B
 * Purpose:    SoT nhãn hiển thị công ty/pháp nhân (ĐVTV) cho slug workforce —
 *             không dùng «Khối … X.E» làm nhãn cột Thông tin công ty.
 * WorkItem:   BE-HRM-EMP-COMPANY-COL-01
 * Coded:      2026-07-22
 * Callers:    operating-units.service · employees.service · hrm-company-display-name
 * Callees:    HRM_GROUP_MEMBER_COMPANY_SLUGS · company_slug_map
 * Impact:     Fallback Khối → lệch ĐVTV / CompanyManagement legal names
 * must_keep:  holding = Tập đoàn XeVN; AC-EMP-COL-04 không đè LE bằng Khối
 * SOLID:      Registry constants only — resolve/sync logic in hrm-company-display-name
 * LastVerified: be-hrm-emp-company-col-01.spec.ts
 *
 * @CODE-MEMORY-CHANGE 2026-07-22 BE-HRM-EMP-COMPANY-COL-01
 * what: Replace Khối* BA-D-01 §5 chart interim labels with legal-entity / ĐVTV names
 * why: Sponsor + BA-HRM-EMP-COMPANY-COL-01 — cột «Thông tin công ty» = Plane A SoT
 * must_keep: 5 GROUP_MEMBER_SLUGS; UUID map unchanged
 */
import {
  HRM_COMPANY_UUID_BY_SLUG,
  HRM_GROUP_MEMBER_COMPANY_SLUGS,
  MASTER_TENANT_ID,
} from '../common/hrm-list-scope';

/**
 * Interim BR-INT-05 slug → legal entity display (org-seed-member-companies.json).
 * SA may refine map; until then names must stay ∈ ĐVTV/LE set (AC-EMP-COL-01).
 * Order: holding + subsidiaries in org-seed order ↔ UAT slug order after holding.
 */
export const HRM_OPERATING_UNIT_DEFAULT_DISPLAY_NAMES: Record<
  (typeof HRM_GROUP_MEMBER_COMPANY_SLUGS)[number],
  string
> = {
  holding: 'Tập đoàn XeVN',
  trsport: 'Công ty Cổ phần Thương mại và Dịch vụ X.E',
  logistics: 'Công ty TNHH Du lịch Visun',
  finance: 'Công ty TNHH Du lịch X.E Việt Nam',
  services: 'Công ty TNHH X.E Việt Nam',
};

/** Legacy Plane B chart labels (BA-D-01 §5 interim) — must not surface on company column. */
export const HRM_LEGACY_KHOI_DISPLAY_NAMES: ReadonlySet<string> = new Set([
  'Khối Vận tải X.E',
  'Khối Logistics X.E',
  'Khối Tài chính X.E',
  'Khối Dịch vụ X.E',
]);

export type HrmOperatingUnitRow = {
  operating_slug: (typeof HRM_GROUP_MEMBER_COMPANY_SLUGS)[number];
  display_name_vi: string;
  rollup_order: number;
};

export function rollupOrderForSlug(slug: string): number {
  const idx = (HRM_GROUP_MEMBER_COMPANY_SLUGS as readonly string[]).indexOf(
    slug,
  );
  return idx >= 0 ? idx + 1 : 99;
}

export function buildOperatingUnitSeedRows(): Array<{
  tenant_id: string;
  company_slug: string;
  company_uuid: string;
  display_name: string;
}> {
  return HRM_GROUP_MEMBER_COMPANY_SLUGS.map((slug) => ({
    tenant_id: MASTER_TENANT_ID,
    company_slug: slug,
    company_uuid: HRM_COMPANY_UUID_BY_SLUG[slug],
    display_name: HRM_OPERATING_UNIT_DEFAULT_DISPLAY_NAMES[slug],
  }));
}
