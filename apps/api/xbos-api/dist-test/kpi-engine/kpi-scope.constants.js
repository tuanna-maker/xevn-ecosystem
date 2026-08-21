"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GROUP_ROLLUP_COMPANY_IDS = void 0;
exports.isGroupRollupCompanyId = isGroupRollupCompanyId;
const workflow_catalog_constants_1 = require("../workflow-engine/workflow-catalog.constants");
/** Company ids under master tenant `xevn` used for holding-level KPI rollup (UC-XBOS-KPI-03). */
exports.GROUP_ROLLUP_COMPANY_IDS = [
    workflow_catalog_constants_1.MASTER_COMPANY_HOLDING,
    'main',
    'xe-tmdv',
    'xe-du-lich',
    'xe-vietnam',
    'visun',
];
function isGroupRollupCompanyId(companyId) {
    const normalized = companyId.trim().toLowerCase();
    return normalized === workflow_catalog_constants_1.MASTER_COMPANY_HOLDING || normalized === 'all';
}
