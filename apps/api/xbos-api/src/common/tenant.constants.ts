/** Tenant tập đoàn (X-BOS + group). Mọi tenant khác là công ty thành viên. */
export const MASTER_TENANT_ID = (process.env.MASTER_TENANT_ID?.trim() || 'xevn').toLowerCase();

/** Mỗi tenant thành viên có một pháp nhân mặc định trong scope. */
export const MEMBER_DEFAULT_COMPANY_ID = 'main';

export function isMasterTenant(tenantId: string): boolean {
  return tenantId.trim().toLowerCase() === MASTER_TENANT_ID;
}
