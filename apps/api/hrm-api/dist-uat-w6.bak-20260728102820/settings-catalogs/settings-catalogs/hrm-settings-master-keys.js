"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HRM_SC_PAY_KEYS = exports.HRM_SC_DEC_KEY = exports.HRM_SC_LEAVE_KEY = exports.HRM_SC_POS_KEYS = void 0;
exports.normalizeMasterCatalogKey = normalizeMasterCatalogKey;
exports.isPosCatalogKey = isPosCatalogKey;
exports.HRM_SC_POS_KEYS = [
    'job_titles',
    'departments',
    'department_catalog',
    'org_departments',
    'positions',
];
exports.HRM_SC_LEAVE_KEY = 'leave_types';
exports.HRM_SC_DEC_KEY = 'decision_types';
exports.HRM_SC_PAY_KEYS = ['salary_components', 'payroll_templates'];
function normalizeMasterCatalogKey(catalogKey) {
    return catalogKey.trim().toLowerCase();
}
function isPosCatalogKey(catalogKey) {
    const k = normalizeMasterCatalogKey(catalogKey);
    return exports.HRM_SC_POS_KEYS.includes(k);
}
//# sourceMappingURL=hrm-settings-master-keys.js.map