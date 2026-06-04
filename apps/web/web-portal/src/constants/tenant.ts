export const MASTER_TENANT_ID = (import.meta.env.VITE_MASTER_TENANT_ID ?? 'xevn').toLowerCase();
export const MEMBER_DEFAULT_COMPANY_ID = 'main';
/** Scope pháp nhân tập đoàn (holding) — khớp XBOS_GROUP_LEGAL_HOLDING. */
export const GROUP_HOLDING_COMPANY_ID = 'holding';

export function isMasterTenant(tenantId: string): boolean {
  return tenantId.trim().toLowerCase() === MASTER_TENANT_ID;
}

/** Module chỉ tenant master được thấy (X-BOS group). */
export const MASTER_ONLY_MODULE_IDS = new Set(['x-bos-group', 'cockpit-rollup']);
