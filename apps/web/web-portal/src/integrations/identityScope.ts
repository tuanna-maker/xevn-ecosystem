import { isMasterTenant, MASTER_TENANT_ID, MEMBER_DEFAULT_COMPANY_ID } from '../constants/tenant';
import { getActiveTenantScope } from './activeTenantScope';

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
  if (!token) return {};
  const parts = token.split('.');
  if (parts.length < 2 || !parts[1]) return {};
  try {
    return JSON.parse(readBase64Url(parts[1])) as Record<string, unknown>;
  } catch {
    return {};
  }
}

export function getJwtCompanyId(): string | null {
  const claims = parseJwtClaims(import.meta.env.VITE_SERVICE_JWT_TOKEN);
  return pickClaim(claims, ['companyId', 'company_id', 'activeCompanyId', 'active_company_id']);
}

export function getJwtTenantId(): string | null {
  const claims = parseJwtClaims(import.meta.env.VITE_SERVICE_JWT_TOKEN);
  return pickClaim(claims, ['tenantId', 'tenant_id', 'tid']);
}

export function isGroupCompanyId(companyId: string | null | undefined): boolean {
  return companyId === 'holding' || companyId === 'all';
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

function usePortalIdentityDefaults(): boolean {
  if (import.meta.env.VITE_STRICT_IDENTITY === 'true') return false;
  return import.meta.env.DEV || import.meta.env.VITE_DEV_SYSTEM_ADMIN === 'true';
}

/**
 * Phạm vi runtime: mỗi tenant thành viên dùng company_id = main.
 * Tenant master (xevn) dùng cho X-BOS group; company_id = xevn hoặc main tùy API.
 */
export function resolveIdentityScope(
  tenantIdHint?: string | null,
  companyIdHint?: string | null,
): IdentityScopeContext {
  const claims = parseJwtClaims(import.meta.env.VITE_SERVICE_JWT_TOKEN);
  const runtime = getActiveTenantScope();
  let tenantId =
    tenantIdHint ?? runtime?.tenantId ?? pickClaim(claims, ['tenantId', 'tenant_id', 'tid']);
  const claimCompanyId = pickClaim(claims, ['companyId', 'company_id', 'activeCompanyId', 'active_company_id']);

  const defaultTenant = import.meta.env.VITE_DEFAULT_TENANT_ID ?? MASTER_TENANT_ID;

  if (usePortalIdentityDefaults()) {
    if (!tenantId) tenantId = defaultTenant;
  }

  if (!tenantId) {
    throw new ScopeContextError('Thiếu tenantId trong identity context', 'SCOPE_TENANT_REQUIRED');
  }

  let companyId: string;
  if (isMasterTenant(tenantId)) {
    companyId =
      companyIdHint && !isGroupCompanyId(companyIdHint)
        ? companyIdHint
        : runtime?.companyId && !isGroupCompanyId(runtime.companyId)
          ? runtime.companyId
          : MASTER_TENANT_ID;
  } else {
    companyId = MEMBER_DEFAULT_COMPANY_ID;
    void claimCompanyId;
  }

  return { tenantId, companyId };
}
