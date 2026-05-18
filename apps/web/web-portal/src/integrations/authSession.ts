import type { AccessibleTenant } from './tenantScopeApi';

const STORAGE_TOKEN = 'xevn.portal.accessToken';
const STORAGE_USER = 'xevn.portal.user';

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

export function getStoredAccessToken(): string | null {
  return sessionStorage.getItem(STORAGE_TOKEN)?.trim() || null;
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

export function persistAuthSession(result: LoginResult) {
  sessionStorage.setItem(STORAGE_TOKEN, result.accessToken);
  sessionStorage.setItem(STORAGE_USER, JSON.stringify(result.user));
}

export function clearAuthSession() {
  sessionStorage.removeItem(STORAGE_TOKEN);
  sessionStorage.removeItem(STORAGE_USER);
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
  if (!res.ok || !json?.success) {
    throw new Error(json?.message ?? 'Phiên đăng nhập hết hạn');
  }
  return json.data as { user: PortalUser; memberships: AccessibleTenant[] };
}

/** Headers API: JWT ưu tiên; dev fallback internal key + x-user-id. */
export function buildApiAuthHeaders(userId?: string): Record<string, string> {
  const h: Record<string, string> = { 'content-type': 'application/json' };
  const token = getStoredAccessToken();
  if (token) {
    h.Authorization = `Bearer ${token}`;
    const user = getStoredUser();
    if (user?.userId) h['x-user-id'] = user.userId;
    // Dev: vẫn gửi internal key khi JWT hết hạn để tránh 401 im lặng trên Command Center.
    const devKey = import.meta.env.VITE_INTERNAL_API_KEY?.trim();
    if (devKey && import.meta.env.DEV) h['x-internal-api-key'] = devKey;
    return h;
  }
  const key = import.meta.env.VITE_INTERNAL_API_KEY?.trim();
  if (key) h['x-internal-api-key'] = key;
  h['x-user-id'] = userId ?? getStoredUser()?.userId ?? import.meta.env.VITE_DEV_USER_ID ?? 'admin@xevn.vn';
  return h;
}
