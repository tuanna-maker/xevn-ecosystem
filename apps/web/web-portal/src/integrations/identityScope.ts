export type IdentityScopeContext = {
  tenantId: string;
  companyId: string;
};

export class ScopeContextError extends Error {
  code: string;
  details?: Record<string, unknown>;

  constructor(message: string, code: string, details?: Record<string, unknown>) {
    super(message);
    this.name = 'ScopeContextError';
    this.code = code;
    this.details = details;
  }
}

function readBase64Url(input: string): string {
  const base64 = input.replace(/-/g, '+').replace(/_/g, '/');
  const padded = `${base64}${'='.repeat((4 - (base64.length % 4)) % 4)}`;
  return atob(padded);
}

function parseJwtClaims(token: string | undefined): Record<string, unknown> {
  if (!token) {
    return {};
  }
  const parts = token.split('.');
  if (parts.length < 2 || !parts[1]) {
    return {};
  }
  try {
    return JSON.parse(readBase64Url(parts[1])) as Record<string, unknown>;
  } catch {
    return {};
  }
}

function pickClaim(claims: Record<string, unknown>, keys: string[]): string | null {
  for (const key of keys) {
    const value = claims[key];
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }
  return null;
}

/**
 * Khi không có JWT dịch vụ (hoặc JWT thiếu claim phạm vi), Command Center vẫn cần tenant/company
 * để ghép iframe HRM và gọi API nội bộ.
 *
 * - Mặc định: trong `import.meta.env.DEV`, tự điền `VITE_DEFAULT_TENANT_ID` / `VITE_DEFAULT_COMPANY_ID`
 *   (fallback `xevn` / `holding`) trừ khi bật `VITE_STRICT_IDENTITY=true`.
 * - Production: chỉ điền khi `VITE_DEV_SYSTEM_ADMIN=true` (dùng cho bản demo/staging có chủ đích).
 *
 * Gộp dữ liệu mọi tenant thật sự cần API + RLS/backend hỗ trợ truy vấn liên tenant; đây chỉ là identity mặc định cho dev.
 */
function usePortalIdentityDefaults(): boolean {
  if (import.meta.env.VITE_STRICT_IDENTITY === 'true') return false;
  return import.meta.env.DEV || import.meta.env.VITE_DEV_SYSTEM_ADMIN === 'true';
}

export function resolveIdentityScope(companyIdHint?: string | null): IdentityScopeContext {
  const claims = parseJwtClaims(import.meta.env.VITE_SERVICE_JWT_TOKEN);
  let tenantId = pickClaim(claims, ['tenantId', 'tenant_id', 'tid']);
  const claimCompanyId = pickClaim(claims, ['companyId', 'company_id', 'activeCompanyId', 'active_company_id']);
  const selectedCompanyId = companyIdHint && companyIdHint !== 'all' ? companyIdHint : null;
  let companyId = selectedCompanyId ?? claimCompanyId;

  const defaultTenant = import.meta.env.VITE_DEFAULT_TENANT_ID ?? 'xevn';
  const defaultCompany = import.meta.env.VITE_DEFAULT_COMPANY_ID ?? 'holding';

  if (usePortalIdentityDefaults()) {
    if (!tenantId) tenantId = defaultTenant;
    if (!companyId) companyId = defaultCompany;
  }

  if (!tenantId) {
    throw new ScopeContextError('Thiếu tenantId trong identity context', 'SCOPE_TENANT_REQUIRED');
  }
  if (!companyId) {
    throw new ScopeContextError('Thiếu companyId trong identity context', 'SCOPE_COMPANY_REQUIRED');
  }

  return { tenantId, companyId };
}
