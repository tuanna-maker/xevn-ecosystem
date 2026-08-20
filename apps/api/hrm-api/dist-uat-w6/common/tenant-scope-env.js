"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.masterTenantIdFromEnv = masterTenantIdFromEnv;
exports.defaultCompanyIdFromEnv = defaultCompanyIdFromEnv;
function masterTenantIdFromEnv() {
    const a = process.env.MASTER_TENANT_ID?.trim().toLowerCase();
    const b = process.env.DEFAULT_TENANT_ID?.trim().toLowerCase();
    return a || b || '';
}
function defaultCompanyIdFromEnv() {
    const a = process.env.DEFAULT_COMPANY_ID?.trim().toLowerCase();
    const b = process.env.DEFAULT_COMPANY_HEADER_ID?.trim().toLowerCase();
    return a || b || '';
}
//# sourceMappingURL=tenant-scope-env.js.map