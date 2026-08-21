"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VIOLATION_SEVERITIES = exports.REGISTERED_SATELLITE_MODULE_CODES = void 0;
exports.normalizeModuleCode = normalizeModuleCode;
exports.isRegisteredModuleCode = isRegisteredModuleCode;
/** Registered satellite / spoke module codes (UC-XBOS-07). Case-insensitive match. */
exports.REGISTERED_SATELLITE_MODULE_CODES = new Set([
    'trsport',
    'lgts',
    'logistics',
    'fleet',
    'operations',
    'hrm-admin',
    'hrm',
    'finance-tax',
    'accounting',
    'kpi-engine',
    'xbos',
    'web-portal',
    'system',
]);
exports.VIOLATION_SEVERITIES = ['low', 'medium', 'high', 'critical'];
function normalizeModuleCode(moduleCode) {
    return moduleCode.trim().toLowerCase();
}
function isRegisteredModuleCode(moduleCode) {
    return exports.REGISTERED_SATELLITE_MODULE_CODES.has(normalizeModuleCode(moduleCode));
}
