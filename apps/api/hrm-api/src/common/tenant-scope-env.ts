/**
 * Phạm vi tenant/company cho **bootstrap** (DDL mặc định, seed khi thiếu header).
 * Mọi request API vẫn phải gửi `x-tenant-id` / JWT — không thay thế resolveScopeContext.
 * Giai đoạn một tenant: đặt MASTER_TENANT_ID (hoặc DEFAULT_TENANT_ID) trên máy chủ; sau này nhiều tenant
 * vẫn dùng các biến này chỉ cho master / migration, còn runtime theo từng phiên.
 */
export function masterTenantIdFromEnv(): string {
  const a = process.env.MASTER_TENANT_ID?.trim().toLowerCase();
  const b = process.env.DEFAULT_TENANT_ID?.trim().toLowerCase();
  return a || b || '';
}

/** Mã công ty header mặc định cho DDL catalog sync (không thay thế x-company-id trên request). */
export function defaultCompanyIdFromEnv(): string {
  const a = process.env.DEFAULT_COMPANY_ID?.trim().toLowerCase();
  const b = process.env.DEFAULT_COMPANY_HEADER_ID?.trim().toLowerCase();
  return a || b || '';
}
