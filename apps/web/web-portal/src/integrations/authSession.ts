/**
 * @CODE-MEMORY
 * Screen:     Portal auth session — login / me / select-membership
 * UC:         FR-UC-M01 · UC-M01
 * BR:         BR-SCOPE-01 — chọn membership trước API nghiệp vụ
 * SRS:        docs/brand-new-documents-20270801/SRS_NEW.md v1.1 §3.2 · FR-UC-M01 · Diễn biến #1–5
 * TechSpec:   docs/brand-new-documents-20270801/TECH_SPEC_NEW.md · TS-MOB-AUTH · ref_srs FR-UC-M01
 * Purpose:    Lưu JWT portal, gọi XBOS auth, chuẩn hóa membership display-ready từ BE
 *             (tenant_label / company_label / role_label) — không invent map slug→nhãn trên FE.
 * WorkItem:   W1-B-04-AUTH-FE
 * Coded:      2026-08-03
 * Callers:    AuthContext · identityScope · TopHeader (via memberships)
 * Callees:    POST /api/xbos/auth/login · select-membership · GET /me
 * FEActions:  login → persist · chọn membership → JWT mới + membershipId
 * BEChain:    xbos-api auth.service → membership-display → JWT claims
 * Impact:     Invent label FE → lệch OS 28; bỏ membershipId → scope sai sau select
 * must_keep:  Luồng login/select-membership hiện có; U65 no seed; fallback nhãn chỉ «—»
 * SOLID:      Session I/O tách khỏi UI chrome; normalize thuần function
 * LastVerified: authSession.test.ts W1-B-04
 *
 * @CODE-MEMORY-CHANGE
 * WorkItem: W1-B-04-AUTH-FE · 2026-08-03
 * Change: ADD normalizePortalMembership (*_label từ BE); persist/read membershipId JWT;
 *         LoginResult/SelectMembershipResult mang defaultMembershipId.
 * must_keep: Không map roleCode/companyId → tiếng Việt trên FE; cấm seed.
 */

import type { AccessibleTenant } from './tenantScopeApi';

const STORAGE_TOKEN = 'xevn.portal.accessToken';
const STORAGE_USER = 'xevn.portal.user';
const STORAGE_TOKEN_EXPIRES = 'xevn.portal.tokenExpiresAt';
const STORAGE_MEMBERSHIP_ID = 'xevn.portal.membershipId';
const STORAGE_LOGIN_REDIRECT = 'xevn.portal.loginRedirect';

/** Empty display fallback — never invent business labels from raw keys (OS 28). */
export const MEMBERSHIP_LABEL_FALLBACK = '—';

export type PortalUser = {
  userId: string;
  displayName: string;
};

export type LoginResult = {
  accessToken: string;
  expiresInSec: number;
  user: PortalUser;
  memberships: AccessibleTenant[];
  defaultTenantId: string;
  defaultCompanyId: string;
  defaultMembershipId?: string;
};

export type SelectMembershipResult = {
  accessToken: string;
  expiresInSec: number;
  membership: AccessibleTenant;
  memberships: AccessibleTenant[];
  defaultTenantId: string;
  defaultCompanyId: string;
  defaultMembershipId?: string;
};

let unauthorizedHandler: (() => void) | null = null;

/** AuthContext registers logout + redirect when API returns 401 with a stored JWT. */
export function setUnauthorizedHandler(handler: (() => void) | null) {
  unauthorizedHandler = handler;
}

function asTrimmedString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function readBase64Url(input: string): string {
  const base64 = input.replace(/-/g, '+').replace(/_/g, '/');
  const padded = `${base64}${'='.repeat((4 - (base64.length % 4)) % 4)}`;
  return atob(padded);
}

/** Read membershipId claim from portal JWT (API_CONTRACT §8.2). */
export function parseJwtMembershipId(accessToken: string | null | undefined): string | null {
  const token = accessToken?.trim();
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length < 2 || !parts[1]) return null;
  try {
    const claims = JSON.parse(readBase64Url(parts[1])) as Record<string, unknown>;
    const mid = asTrimmedString(claims.membershipId) || asTrimmedString(claims.membership_id);
    return mid || null;
  } catch {
    return null;
  }
}

/**
 * Bind BE display-ready membership fields. Missing labels → «—» only (no slug invent).
 */
export function normalizePortalMembership(raw: unknown): AccessibleTenant {
  const row = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  const tenantId = asTrimmedString(row.tenantId);
  const name = asTrimmedString(row.name);
  const shortName = asTrimmedString(row.shortName);
  const roleCode = asTrimmedString(row.roleCode);
  const companyId = asTrimmedString(row.companyId);
  const kindRaw = asTrimmedString(row.tenantKind).toLowerCase();
  const tenantKind: 'master' | 'member' = kindRaw === 'member' ? 'member' : 'master';
  const isMaster =
    typeof row.isMaster === 'boolean' ? row.isMaster : tenantKind === 'master';

  const tenant_label =
    asTrimmedString(row.tenant_label) || name || MEMBERSHIP_LABEL_FALLBACK;
  const company_label =
    asTrimmedString(row.company_label) || MEMBERSHIP_LABEL_FALLBACK;
  const role_label = asTrimmedString(row.role_label) || MEMBERSHIP_LABEL_FALLBACK;
  const tenant_kind_label =
    asTrimmedString(row.tenant_kind_label) || MEMBERSHIP_LABEL_FALLBACK;
  const membershipId = asTrimmedString(row.membershipId) || undefined;
  const modules = Array.isArray(row.modules)
    ? row.modules
        .map((m) => (typeof m === 'string' ? m.trim() : ''))
        .filter(Boolean)
    : undefined;

  return {
    tenantId,
    name: name || (tenant_label !== MEMBERSHIP_LABEL_FALLBACK ? tenant_label : tenantId),
    shortName,
    tenantKind,
    roleCode,
    companyId,
    isMaster,
    membershipId,
    modules,
    tenant_label,
    company_label,
    role_label,
    tenant_kind_label,
  };
}

export function normalizePortalMemberships(raw: unknown): AccessibleTenant[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => normalizePortalMembership(item));
}

/** Prefer BE role_label; never invent from roleCode. */
export function membershipRoleDisplay(m: Pick<AccessibleTenant, 'role_label'>): string {
  const label = asTrimmedString(m.role_label);
  return label || MEMBERSHIP_LABEL_FALLBACK;
}

/** Prefer BE tenant_label then name; empty → «—». */
export function membershipTenantDisplay(
  m: Pick<AccessibleTenant, 'tenant_label' | 'name' | 'shortName'>,
): string {
  return (
    asTrimmedString(m.tenant_label) ||
    asTrimmedString(m.name) ||
    asTrimmedString(m.shortName) ||
    MEMBERSHIP_LABEL_FALLBACK
  );
}

/** Prefer BE company_label; empty → «—». */
export function membershipCompanyDisplay(m: Pick<AccessibleTenant, 'company_label'>): string {
  const label = asTrimmedString(m.company_label);
  return label || MEMBERSHIP_LABEL_FALLBACK;
}

function normalizeLoginPayload(data: Record<string, unknown>): LoginResult {
  const memberships = normalizePortalMemberships(data.memberships);
  const accessToken = asTrimmedString(data.accessToken);
  const defaultMembershipId =
    asTrimmedString(data.defaultMembershipId) ||
    parseJwtMembershipId(accessToken) ||
    memberships[0]?.membershipId;
  return {
    accessToken,
    expiresInSec: Number(data.expiresInSec) || 0,
    user: data.user as PortalUser,
    memberships,
    defaultTenantId: asTrimmedString(data.defaultTenantId),
    defaultCompanyId: asTrimmedString(data.defaultCompanyId),
    defaultMembershipId: defaultMembershipId || undefined,
  };
}

function normalizeSelectPayload(data: Record<string, unknown>): SelectMembershipResult {
  const memberships = normalizePortalMemberships(data.memberships);
  const membership = normalizePortalMembership(data.membership);
  const accessToken = asTrimmedString(data.accessToken);
  const defaultMembershipId =
    asTrimmedString(data.defaultMembershipId) ||
    membership.membershipId ||
    parseJwtMembershipId(accessToken);
  return {
    accessToken,
    expiresInSec: Number(data.expiresInSec) || 0,
    membership,
    memberships,
    defaultTenantId: asTrimmedString(data.defaultTenantId),
    defaultCompanyId: asTrimmedString(data.defaultCompanyId),
    defaultMembershipId: defaultMembershipId || undefined,
  };
}

/** Re-hydrate portal shell sessionStorage from localStorage mirror (HRM iframe bridge). */
function hydrateSessionFromLocalMirror(): string | null {
  if (typeof localStorage === 'undefined' || typeof sessionStorage === 'undefined') return null;
  const mirrored = localStorage.getItem(STORAGE_TOKEN)?.trim();
  if (!mirrored) return null;
  sessionStorage.setItem(STORAGE_TOKEN, mirrored);
  const user = localStorage.getItem(STORAGE_USER);
  const expires = localStorage.getItem(STORAGE_TOKEN_EXPIRES);
  const membershipId = localStorage.getItem(STORAGE_MEMBERSHIP_ID);
  if (user) sessionStorage.setItem(STORAGE_USER, user);
  if (expires) sessionStorage.setItem(STORAGE_TOKEN_EXPIRES, expires);
  if (membershipId) sessionStorage.setItem(STORAGE_MEMBERSHIP_ID, membershipId);
  return mirrored;
}

export function getStoredAccessToken(): string | null {
  const session = sessionStorage.getItem(STORAGE_TOKEN)?.trim();
  if (session) return session;
  return hydrateSessionFromLocalMirror();
}

export function getStoredTokenExpiresAt(): number | null {
  const raw = sessionStorage.getItem(STORAGE_TOKEN_EXPIRES);
  if (!raw) return null;
  const ms = Number(raw);
  return Number.isFinite(ms) && ms > 0 ? ms : null;
}

export function isStoredSessionExpired(now = Date.now()): boolean {
  const token = getStoredAccessToken();
  if (!token) return true;
  const expiresAt = getStoredTokenExpiresAt();
  // Legacy sessions without expiry: treat as valid until /me fails.
  if (expiresAt == null) return false;
  return now >= expiresAt;
}

/** Returns JWT when present and not past expiresAt; otherwise clears storage. */
export function getValidAccessToken(now = Date.now()): string | null {
  const token = getStoredAccessToken();
  if (!token) return null;
  if (isStoredSessionExpired(now)) {
    clearAuthSession();
    return null;
  }
  return token;
}

export function getStoredUser(): PortalUser | null {
  const raw = sessionStorage.getItem(STORAGE_USER);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as PortalUser;
  } catch {
    return null;
  }
}

/** Active membershipId from session mirror or JWT claim after select-membership. */
export function getStoredMembershipId(): string | null {
  const stored = sessionStorage.getItem(STORAGE_MEMBERSHIP_ID)?.trim();
  if (stored) return stored;
  const fromLocal =
    typeof localStorage !== 'undefined'
      ? localStorage.getItem(STORAGE_MEMBERSHIP_ID)?.trim()
      : null;
  if (fromLocal) {
    sessionStorage.setItem(STORAGE_MEMBERSHIP_ID, fromLocal);
    return fromLocal;
  }
  return parseJwtMembershipId(getStoredAccessToken());
}

function mirrorAuthToLocalStorage(
  accessToken: string,
  userJson: string,
  expiresAt: number,
  membershipId: string | null,
): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(STORAGE_TOKEN, accessToken);
  localStorage.setItem(STORAGE_USER, userJson);
  localStorage.setItem(STORAGE_TOKEN_EXPIRES, String(expiresAt));
  if (membershipId) localStorage.setItem(STORAGE_MEMBERSHIP_ID, membershipId);
  else localStorage.removeItem(STORAGE_MEMBERSHIP_ID);
}

function clearAuthLocalStorageMirror(): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.removeItem(STORAGE_TOKEN);
  localStorage.removeItem(STORAGE_USER);
  localStorage.removeItem(STORAGE_TOKEN_EXPIRES);
  localStorage.removeItem(STORAGE_MEMBERSHIP_ID);
}

export function persistAuthSession(result: LoginResult) {
  const userJson = JSON.stringify(result.user);
  const expiresAt = Date.now() + Math.max(0, result.expiresInSec) * 1000;
  const membershipId =
    result.defaultMembershipId?.trim() ||
    parseJwtMembershipId(result.accessToken) ||
    null;
  sessionStorage.setItem(STORAGE_TOKEN, result.accessToken);
  sessionStorage.setItem(STORAGE_USER, userJson);
  sessionStorage.setItem(STORAGE_TOKEN_EXPIRES, String(expiresAt));
  if (membershipId) sessionStorage.setItem(STORAGE_MEMBERSHIP_ID, membershipId);
  else sessionStorage.removeItem(STORAGE_MEMBERSHIP_ID);
  // Same-origin HRM iframe cannot read parent sessionStorage — mirror for embed bridge.
  mirrorAuthToLocalStorage(result.accessToken, userJson, expiresAt, membershipId);
}

export function clearAuthSession() {
  sessionStorage.removeItem(STORAGE_TOKEN);
  sessionStorage.removeItem(STORAGE_USER);
  sessionStorage.removeItem(STORAGE_TOKEN_EXPIRES);
  sessionStorage.removeItem(STORAGE_MEMBERSHIP_ID);
  clearAuthLocalStorageMirror();
}

export function stashLoginRedirect(path: string) {
  sessionStorage.setItem(STORAGE_LOGIN_REDIRECT, path);
}

export function peekLoginRedirect(): string | null {
  const path = sessionStorage.getItem(STORAGE_LOGIN_REDIRECT);
  return path?.trim() ? path : null;
}

export function consumeLoginRedirect(): string | null {
  const path = sessionStorage.getItem(STORAGE_LOGIN_REDIRECT);
  sessionStorage.removeItem(STORAGE_LOGIN_REDIRECT);
  return path;
}

/**
 * Global session teardown — **401 only**.
 * HTTP 403 on business-scope endpoints (e.g. group-member-units for member CEO) is scope denial, not auth expiry.
 */
export function handleUnauthorizedResponse(status: number) {
  if (status !== 401) return;
  if (!getStoredAccessToken()) return;
  stashLoginRedirect(window.location.pathname + window.location.search);
  clearAuthSession();
  unauthorizedHandler?.();
}

export async function loginPortal(email: string, password: string): Promise<LoginResult> {
  const res = await fetch('/api/xbos/auth/login', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.success) {
    throw new Error(json?.message ?? 'Đăng nhập thất bại');
  }
  return normalizeLoginPayload((json.data ?? {}) as Record<string, unknown>);
}

export async function fetchPortalMe(accessToken: string) {
  const res = await fetch('/api/xbos/auth/me', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const json = await res.json().catch(() => null);
  if (res.status === 401) {
    handleUnauthorizedResponse(res.status);
    throw new Error(json?.message ?? 'Phiên đăng nhập hết hạn');
  }
  if (res.status === 403) {
    throw new Error(json?.message ?? 'Không có quyền truy cập phiên');
  }
  if (!res.ok || !json?.success) {
    throw new Error(json?.message ?? 'Phiên đăng nhập hết hạn');
  }
  const data = (json.data ?? {}) as Record<string, unknown>;
  return {
    user: data.user as PortalUser,
    memberships: normalizePortalMemberships(data.memberships),
  };
}

/** UC-HRM-SCOPE-04 — portal membership switch with JWT re-issue (ADR §5.3). */
export async function selectPortalMembership(
  accessToken: string,
  tenantId: string,
): Promise<SelectMembershipResult> {
  const res = await fetch('/api/xbos/auth/select-membership', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ tenantId }),
  });
  const json = await res.json().catch(() => null);
  if (res.status === 401) {
    handleUnauthorizedResponse(res.status);
    throw new Error(json?.message ?? 'Phiên đăng nhập hết hạn');
  }
  if (res.status === 403) {
    throw new Error(json?.message ?? 'Membership không thuộc tài khoản hiện tại');
  }
  if (!res.ok || !json?.success) {
    throw new Error(json?.message ?? 'Không thể chuyển membership');
  }
  return normalizeSelectPayload((json.data ?? {}) as Record<string, unknown>);
}

/**
 * Headers API: JWT when session valid; dev internal key only when no valid JWT.
 * VITE_REQUIRE_LOGIN=false + internal key on non–command-center routes may still use key-only dev mode.
 */
export function buildApiAuthHeaders(userId?: string): Record<string, string> {
  const h: Record<string, string> = {};
  const token = getValidAccessToken();
  if (token) {
    h.Authorization = `Bearer ${token}`;
    const user = getStoredUser();
    if (user?.userId) h['x-user-id'] = user.userId;
    return h;
  }
  const key = import.meta.env.VITE_INTERNAL_API_KEY?.trim();
  if (key) h['x-internal-api-key'] = key;
  h['x-user-id'] = userId ?? getStoredUser()?.userId ?? import.meta.env.VITE_DEV_USER_ID ?? 'ceo@xe.vn';
  return h;
}
