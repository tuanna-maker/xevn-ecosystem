import type { SignInPayload } from '../context/AuthContext';
import { isUuid } from '../utils/uuid';
import { parseJwtClaims } from './jwtClaims';

function normalizeQaScopeSlug(companyId: string, claims: ReturnType<typeof parseJwtClaims>): string {
  const raw = companyId.trim();
  if (raw && !isUuid(raw)) return raw;
  const fromJwt = claims?.companyId?.trim() ?? '';
  if (fromJwt && !isUuid(fromJwt)) return fromJwt;
  return 'holding';
}

export type QaLoginDeepLinkParams = {
  baseUrl?: string;
  tenantId: string;
  companyId: string;
  companyUuid: string;
  employeeId: string;
  accessToken: string;
  refreshToken?: string;
};

export function parseQaLoginDeepLink(url: string): QaLoginDeepLinkParams | null {
  const raw = url.trim();
  if (!raw) return null;
  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    return null;
  }
  const host = parsed.hostname.toLowerCase();
  const path = parsed.pathname.replace(/^\/+/, '').toLowerCase();
  const isQaHost = host === 'qa-login' || path === 'qa-login';
  if (!isQaHost && parsed.protocol !== 'xevn:' && parsed.protocol !== 'vn.xevn.hrm.mobile:') {
    return null;
  }

  const q = parsed.searchParams;
  const accessToken = (q.get('access_token') ?? q.get('token') ?? '').trim();
  if (!accessToken) return null;

  const claims = parseJwtClaims(accessToken);
  const tenantId = (q.get('tenant_id') ?? q.get('tenantId') ?? claims?.tenantId ?? '').trim();
  const companyId = (q.get('company_id') ?? q.get('companyId') ?? claims?.companyId ?? 'holding').trim();
  const companyUuid = (q.get('company_uuid') ?? q.get('companyUuid') ?? claims?.company_uuid ?? '').trim();
  const employeeId = (q.get('employee_id') ?? q.get('employeeId') ?? claims?.employee_id ?? '').trim();
  if (!tenantId || !companyId) return null;

  return {
    baseUrl: (q.get('base_url') ?? q.get('baseUrl') ?? '').trim() || undefined,
    tenantId,
    companyId,
    companyUuid,
    employeeId,
    accessToken,
    refreshToken: (q.get('refresh_token') ?? q.get('refreshToken') ?? '').trim() || undefined,
  };
}

export function qaDeepLinkToSignInPayload(params: QaLoginDeepLinkParams): SignInPayload {
  const claims = parseJwtClaims(params.accessToken);
  const employeeId = params.employeeId || claims?.employee_id || '';
  const companyUuid = params.companyUuid || claims?.company_uuid || '';
  const companyId = normalizeQaScopeSlug(
    params.companyId || claims?.companyId || 'holding',
    claims,
  );
  const memberships =
    employeeId && companyId
      ? [
          {
            tenant_id: params.tenantId,
            company_id: companyId,
            company_uuid: companyUuid,
            employee_id: employeeId,
            employee_code: '',
            employee_name: '',
            company_display: '',
            is_primary: true,
          },
        ]
      : [];
  return {
    baseUrl: params.baseUrl ?? '',
    tenantId: params.tenantId,
    companyId,
    companyUuid,
    employeeId,
    accessToken: params.accessToken,
    refreshToken: params.refreshToken ?? '',
    internalApiKey: '',
    roles: claims?.roles ?? [],
    memberships,
    tokenExpiresAt: 0,
  };
}
