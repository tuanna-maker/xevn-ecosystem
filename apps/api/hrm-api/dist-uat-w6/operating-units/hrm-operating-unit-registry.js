"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HRM_LEGACY_KHOI_DISPLAY_NAMES = exports.HRM_OPERATING_UNIT_DEFAULT_DISPLAY_NAMES = void 0;
exports.rollupOrderForSlug = rollupOrderForSlug;
exports.buildOperatingUnitSeedRows = buildOperatingUnitSeedRows;
const hrm_list_scope_1 = require("../common/hrm-list-scope");
exports.HRM_OPERATING_UNIT_DEFAULT_DISPLAY_NAMES = {
    holding: 'Tập đoàn XeVN',
    trsport: 'Công ty Cổ phần Thương mại và Dịch vụ X.E',
    logistics: 'Công ty TNHH Du lịch Visun',
    finance: 'Công ty TNHH Du lịch X.E Việt Nam',
    services: 'Công ty TNHH X.E Việt Nam',
};
exports.HRM_LEGACY_KHOI_DISPLAY_NAMES = new Set([
    'Khối Vận tải X.E',
    'Khối Logistics X.E',
    'Khối Tài chính X.E',
    'Khối Dịch vụ X.E',
]);
function rollupOrderForSlug(slug) {
    const idx = hrm_list_scope_1.HRM_GROUP_MEMBER_COMPANY_SLUGS.indexOf(slug);
    return idx >= 0 ? idx + 1 : 99;
}
function buildOperatingUnitSeedRows() {
    return hrm_list_scope_1.HRM_GROUP_MEMBER_COMPANY_SLUGS.map((slug) => ({
        tenant_id: hrm_list_scope_1.MASTER_TENANT_ID,
        company_slug: slug,
        company_uuid: hrm_list_scope_1.HRM_COMPANY_UUID_BY_SLUG[slug],
        display_name: exports.HRM_OPERATING_UNIT_DEFAULT_DISPLAY_NAMES[slug],
    }));
}
//# sourceMappingURL=hrm-operating-unit-registry.js.map