/** Tenant tập đoàn (X-BOS + group). Mọi tenant khác là công ty thành viên. */
export const MASTER_TENANT_ID = (process.env.MASTER_TENANT_ID?.trim() || 'xevn').toLowerCase();

/** Mỗi tenant thành viên có một pháp nhân mặc định trong scope. */
export const MEMBER_DEFAULT_COMPANY_ID = 'main';

/** UI aggregate id for group holding row (Command Center — mirrors web portal). */
export const GROUP_HOLDING_ROOT_ID = 'xbos-group-holding-root';

export function isMasterTenant(tenantId: string): boolean {
  return tenantId.trim().toLowerCase() === MASTER_TENANT_ID;
}
