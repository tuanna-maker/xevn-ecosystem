"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GROUP_HOLDING_ROOT_ID = exports.MEMBER_DEFAULT_COMPANY_ID = exports.MASTER_TENANT_ID = void 0;
exports.isMasterTenant = isMasterTenant;
/** Tenant tập đoàn (X-BOS + group). Mọi tenant khác là công ty thành viên. */
exports.MASTER_TENANT_ID = (process.env.MASTER_TENANT_ID?.trim() || 'xevn').toLowerCase();
/** Mỗi tenant thành viên có một pháp nhân mặc định trong scope. */
exports.MEMBER_DEFAULT_COMPANY_ID = 'main';
/** UI aggregate id for group holding row (Command Center — mirrors web portal). */
exports.GROUP_HOLDING_ROOT_ID = 'xbos-group-holding-root';
function isMasterTenant(tenantId) {
    return tenantId.trim().toLowerCase() === exports.MASTER_TENANT_ID;
}
