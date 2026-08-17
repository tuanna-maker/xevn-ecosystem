import type { SignInPayload } from '../context/AuthContext';
import { isUuid } from '../utils/uuid';
import { getDefaultBaseUrl } from './hrmApiClient';
import { parseJwtClaims } from './jwtClaims';
import { normalizeHrmBaseUrl } from './normalizeHrmBaseUrl';

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
  /** BE display-ready labels (W1-B-04) — optional query params for QA deep-link. */
  companyLabel?: string;
  tenantLabel?: string;
  roleLabel?: string;
  jobTitleLabel?: string;
  employeeCode?: string;
  employeeName?: string;
};

/** qa-device assist — clears JWT session (not production login). */
export function parseQaLogoutDeepLink(url: string): boolean {
  const raw = url.trim();
  if (!raw) return false;
  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    return false;
  }
  const host = parsed.hostname.toLowerCase();
  const path = parsed.pathname.replace(/^\/+/, '').toLowerCase();
  if (host === 'qa-logout' || path === 'qa-logout') return true;
  return false;
}

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
  if (parseQaLogoutDeepLink(raw)) return null;
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
    companyLabel: (q.get('company_label') ?? q.get('companyLabel') ?? '').trim() || undefined,
    tenantLabel: (q.get('tenant_label') ?? q.get('tenantLabel') ?? '').trim() || undefined,
    roleLabel: (q.get('role_label') ?? q.get('roleLabel') ?? '').trim() || undefined,
    jobTitleLabel: (q.get('job_title_label') ?? q.get('jobTitleLabel') ?? '').trim() || undefined,
    employeeCode: (q.get('employee_code') ?? q.get('employeeCode') ?? '').trim() || undefined,
    employeeName: (q.get('employee_name') ?? q.get('employeeName') ?? '').trim() || undefined,
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
  const companyLabel = (params.companyLabel ?? '').trim();
  const memberships =
    employeeId && companyId
      ? [
          {
            tenant_id: params.tenantId,
            company_id: companyId,
            company_uuid: companyUuid,
            employee_id: employeeId,
            employee_code: params.employeeCode ?? '',
            employee_name: params.employeeName ?? '',
            company_display: companyLabel,
            company_label: companyLabel || undefined,
            tenant_label: (params.tenantLabel ?? '').trim() || undefined,
            role_label: (params.roleLabel ?? '').trim() || undefined,
            job_title_label: (params.jobTitleLabel ?? '').trim() || undefined,
            is_primary: true,
          },
        ]
      : [];
  return {
    baseUrl: normalizeHrmBaseUrl(params.baseUrl, getDefaultBaseUrl()),
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
