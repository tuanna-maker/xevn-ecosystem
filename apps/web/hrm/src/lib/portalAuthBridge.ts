/**
 * Reads X-BOS portal JWT (sessionStorage in iframe after postMessage, localStorage mirror from parent).
 * Keys must stay aligned with apps/web/web-portal/src/integrations/authSession.ts.
 */
const STORAGE_TOKEN = 'xevn.portal.accessToken';
const STORAGE_USER = 'xevn.portal.user';
const STORAGE_TOKEN_EXPIRES = 'xevn.portal.tokenExpiresAt';

export const PORTAL_SESSION_READY_EVENT = 'xevn-portal-session-ready';

export type PortalSessionUser = {
  userId: string;
  displayName: string;
};

export type PortalSessionPayload = {
  accessToken: string;
  user: PortalSessionUser;
  expiresAt: number;
};

function readTokenFromStorage(storage: Storage, now: number): string | null {
  const token = storage.getItem(STORAGE_TOKEN)?.trim();
  if (!token) return null;
  const rawExpires = storage.getItem(STORAGE_TOKEN_EXPIRES);
  if (rawExpires) {
    const expiresAt = Number(rawExpires);
    if (Number.isFinite(expiresAt) && expiresAt > 0 && now >= expiresAt) {
      return null;
    }
  }
  return token;
}

export function getPortalAccessToken(now = Date.now()): string | null {
  if (typeof window === 'undefined') return null;
  if (typeof sessionStorage !== 'undefined') {
    const fromSession = readTokenFromStorage(sessionStorage, now);
    if (fromSession) return fromSession;
  }
  if (typeof localStorage !== 'undefined') {
    return readTokenFromStorage(localStorage, now);
  }
  return null;
}

/**
 * Waits for the postMessage bridge to hydrate portal session token in iframe runtime.
 * Returns null on timeout so caller can continue with existing auth fallbacks.
 */
export function waitForPortalAccessToken(timeoutMs = 1500): Promise<string | null> {
  const existing = getPortalAccessToken();
  if (existing) return Promise.resolve(existing);
  if (typeof window === 'undefined') return Promise.resolve(null);

  return new Promise((resolve) => {
    let settled = false;
    const settle = (token: string | null) => {
      if (settled) return;
      settled = true;
      window.removeEventListener(PORTAL_SESSION_READY_EVENT, onReady);
      clearTimeout(timer);
      resolve(token);
    };
    const onReady = () => settle(getPortalAccessToken());
    const timer = setTimeout(() => settle(getPortalAccessToken()), timeoutMs);
    window.addEventListener(PORTAL_SESSION_READY_EVENT, onReady, { once: true });
  });
}

export function getPortalSessionUser(): PortalSessionUser | null {
  const storages: Storage[] = [];
  if (typeof sessionStorage !== 'undefined') storages.push(sessionStorage);
  if (typeof localStorage !== 'undefined') storages.push(localStorage);
  for (const storage of storages) {
    const raw = storage.getItem(STORAGE_USER);
    if (!raw) continue;
    try {
      const parsed = JSON.parse(raw) as PortalSessionUser;
      if (parsed?.userId) return parsed;
    } catch {
      // ignore
    }
  }
  return null;
}

export function hasPortalSession(): boolean {
  return getPortalAccessToken() != null;
}

/** Parent postMessage or localStorage mirror → iframe session for HRM API calls. */
export function applyPortalSession(payload: PortalSessionPayload): void {
  const userJson = JSON.stringify(payload.user);
  const expiresStr = String(payload.expiresAt);
  const targets: Storage[] = [];
  if (typeof sessionStorage !== 'undefined') targets.push(sessionStorage);
  if (typeof localStorage !== 'undefined') targets.push(localStorage);
  for (const storage of targets) {
    storage.setItem(STORAGE_TOKEN, payload.accessToken);
    storage.setItem(STORAGE_USER, userJson);
    storage.setItem(STORAGE_TOKEN_EXPIRES, expiresStr);
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(PORTAL_SESSION_READY_EVENT));
  }
}

/** Clears portal JWT written by Command Center login (SSO sign-out from HRM embed). */
export function clearPortalSession(): void {
  const targets: Storage[] = [];
  if (typeof sessionStorage !== 'undefined') targets.push(sessionStorage);
  if (typeof localStorage !== 'undefined') targets.push(localStorage);
  for (const storage of targets) {
    storage.removeItem(STORAGE_TOKEN);
    storage.removeItem(STORAGE_USER);
    storage.removeItem(STORAGE_TOKEN_EXPIRES);
  }
}
