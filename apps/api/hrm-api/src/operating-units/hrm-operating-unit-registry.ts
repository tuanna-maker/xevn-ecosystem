import {
  HRM_COMPANY_UUID_BY_SLUG,
  HRM_GROUP_MEMBER_COMPANY_SLUGS,
  MASTER_TENANT_ID,
} from '../common/hrm-list-scope';

/** BA-D-01 §5 authoritative display names (fallback when company_slug_map.display_name absent). */
export const HRM_OPERATING_UNIT_DEFAULT_DISPLAY_NAMES: Record<
  (typeof HRM_GROUP_MEMBER_COMPANY_SLUGS)[number],
  string
> = {
  holding: 'Tập đoàn XeVN',
  trsport: 'Khối Vận tải X.E',
  logistics: 'Khối Logistics X.E',
  finance: 'Khối Tài chính X.E',
  services: 'Khối Dịch vụ X.E',
};

export type HrmOperatingUnitRow = {
  operating_slug: (typeof HRM_GROUP_MEMBER_COMPANY_SLUGS)[number];
  display_name_vi: string;
  rollup_order: number;
};

export function rollupOrderForSlug(slug: string): number {
  const idx = (HRM_GROUP_MEMBER_COMPANY_SLUGS as readonly string[]).indexOf(slug);
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
