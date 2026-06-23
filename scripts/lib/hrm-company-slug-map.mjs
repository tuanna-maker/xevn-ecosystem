/**
 * BA-D-01 §5 — GROUP_MEMBER_SLUG display_name bridge (G-INT-03 / PCOMP-W3-BE-04).
 * Shared by seed script and verify-hrm-xbos-integrity.mjs.
 */
import { UAT_COMPANIES } from './uat-workforce.mjs';

export const MASTER_TENANT_ID = process.env.MASTER_TENANT_ID ?? 'xevn';

/** Canonical operating slugs — same order as hrm-list-scope.ts */
export const GROUP_MEMBER_SLUGS = [...UAT_COMPANIES];

/** Pilot UUIDs — must match HRM_COMPANY_UUID_BY_SLUG in hrm-list-scope.ts */
export const HRM_COMPANY_UUID_BY_SLUG = {
  holding: '10000000-0000-4000-8000-000000000001',
  trsport: '10000000-0000-4000-8000-000000000002',
  logistics: '10000000-0000-4000-8000-000000000003',
  finance: '10000000-0000-4000-8000-000000000004',
  services: '10000000-0000-4000-8000-000000000005',
};

/** BA-D-01 §5 authoritative Vietnamese display names */
export const HRM_OPERATING_UNIT_DISPLAY_NAMES = {
  holding: 'Tập đoàn XeVN',
  trsport: 'Khối Vận tải X.E',
  logistics: 'Khối Logistics X.E',
  finance: 'Khối Tài chính X.E',
  services: 'Khối Dịch vụ X.E',
};

export function buildCompanySlugMapSeedRows() {
  return GROUP_MEMBER_SLUGS.map((slug) => ({
    tenant_id: MASTER_TENANT_ID,
    company_slug: slug,
    company_uuid: HRM_COMPANY_UUID_BY_SLUG[slug],
    display_name: HRM_OPERATING_UNIT_DISPLAY_NAMES[slug],
  }));
}
