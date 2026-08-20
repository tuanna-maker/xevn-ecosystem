import { HRM_GROUP_MEMBER_COMPANY_SLUGS } from '../common/hrm-list-scope';
export declare const HRM_OPERATING_UNIT_DEFAULT_DISPLAY_NAMES: Record<(typeof HRM_GROUP_MEMBER_COMPANY_SLUGS)[number], string>;
export declare const HRM_LEGACY_KHOI_DISPLAY_NAMES: ReadonlySet<string>;
export type HrmOperatingUnitRow = {
    operating_slug: (typeof HRM_GROUP_MEMBER_COMPANY_SLUGS)[number];
    display_name_vi: string;
    rollup_order: number;
};
export declare function rollupOrderForSlug(slug: string): number;
export declare function buildOperatingUnitSeedRows(): Array<{
    tenant_id: string;
    company_slug: string;
    company_uuid: string;
    display_name: string;
}>;
