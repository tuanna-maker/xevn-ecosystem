import type { AccessibleTenant } from './tenantScopeApi';

const STORAGE_TOKEN = 'xevn.portal.accessToken';
const STORAGE_USER = 'xevn.portal.user';
const STORAGE_TOKEN_EXPIRES = 'xevn.portal.tokenExpiresAt';
const STORAGE_LOGIN_REDIRECT = 'xevn.portal.loginRedirect';

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
};

let unauthorizedHandler: (() => void) | null = null;

/** AuthContext registers logout + redirect when API returns 401 with a stored JWT. */
export function setUnauthorizedHandler(handler: (() => void) | null) {
  unauthorizedHandler = handler;
}

/** Re-hydrate portal shell sessionStorage from localStorage mirror (HRM iframe bridge). */
function hydrateSessionFromLocalMirror(): string | null {
  if (typeof localStorage === 'undefined' || typeof sessionStorage === 'undefined') return null;
  const mirrored = localStorage.getItem(STORAGE_TOKEN)?.trim();
  if (!mirrored) return null;
  sessionStorage.setItem(STORAGE_TOKEN, mirrored);
  const user = localStorage.getItem(STORAGE_USER);
  const expires = localStorage.getItem(STORAGE_TOKEN_EXPIRES);
  if (user) sessionStorage.setItem(STORAGE_USER, user);
  if (expires) sessionStorage.setItem(STORAGE_TOKEN_EXPIRES, expires);
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

function mirrorAuthToLocalStorage(
  accessToken: string,
  userJson: string,
  expiresAt: number,
): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(STORAGE_TOKEN, accessToken);
  localStorage.setItem(STORAGE_USER, userJson);
  localStorage.setItem(STORAGE_TOKEN_EXPIRES, String(expiresAt));
}

function clearAuthLocalStorageMirror(): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.removeItem(STORAGE_TOKEN);
  localStorage.removeItem(STORAGE_USER);
  localStorage.removeItem(STORAGE_TOKEN_EXPIRES);
}

export function persistAuthSession(result: LoginResult) {
  const userJson = JSON.stringify(result.user);
  const expiresAt = Date.now() + Math.max(0, result.expiresInSec) * 1000;
  sessionStorage.setItem(STORAGE_TOKEN, result.accessToken);
  sessionStorage.setItem(STORAGE_USER, userJson);
  sessionStorage.setItem(STORAGE_TOKEN_EXPIRES, String(expiresAt));
  // Same-origin HRM iframe cannot read parent sessionStorage — mirror for embed bridge.
  mirrorAuthToLocalStorage(result.accessToken, userJson, expiresAt);
}

export function clearAuthSession() {
  sessionStorage.removeItem(STORAGE_TOKEN);
  sessionStorage.removeItem(STORAGE_USER);
  sessionStorage.removeItem(STORAGE_TOKEN_EXPIRES);
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
  return json.data as LoginResult;
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
  return json.data as { user: PortalUser; memberships: AccessibleTenant[] };
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
