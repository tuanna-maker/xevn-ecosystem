/**
 * @CODE-MEMORY
 * Screen:     HRM portal embed auth bridge (JWT + mobile session)
 * UC:         UC-HRM-12 · HRM-NT-01
 * Purpose:    Đọc portal JWT; suy ra employee_id cho embed `portal=1` (mobile login / inbox scope)
 * WorkItem:   PO-UC-TC-W4-FE-NT01-PORTAL-EMBED-EMPLOYEE-ID-01
 * Coded:      2026-08-04
 * must_keep:  Không gán employee_id giả cho ceo@; chỉ claim JWT hoặc snapshot mobile login
 *
 * @CODE-MEMORY-CHANGE 2026-08-04 PO-UC-TC-W4-FE-NT01-PORTAL-EMBED-EMPLOYEE-ID-01
 * change_mode: FIX
 * What: ADD getPortalEmbedEmployeeId + persistMobileMembershipsSnapshot
 * Why: QA R1 portal=1 null employee_id → inbox disabled dù API 20 unread
 */
import { coerceHrmListCompanyId } from '@/lib/hrmListScope';

/**
 * Reads X-BOS portal JWT (sessionStorage in iframe after postMessage, localStorage mirror from parent).
 * Keys must stay aligned with apps/web/web-portal/src/integrations/authSession.ts.
 */
const STORAGE_TOKEN = 'xevn.portal.accessToken';
const STORAGE_USER = 'xevn.portal.user';
const STORAGE_TOKEN_EXPIRES = 'xevn.portal.tokenExpiresAt';
const STORAGE_MOBILE_MEMBERSHIPS = 'hrm.mobile.memberships';

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

export type MobileMembershipSnapshot = {
  company_id: string;
  employee_id: string | null;
};

function readBase64UrlJwtPart(input: string): string {
  const base64 = input.replace(/-/g, '+').replace(/_/g, '/');
  const padded = `${base64}${'='.repeat((4 - (base64.length % 4)) % 4)}`;
  return atob(padded);
}

function parseAccessTokenClaims(token: string | null | undefined): Record<string, unknown> {
  if (!token) return {};
  const parts = token.split('.');
  if (parts.length < 2 || !parts[1]) return {};
  try {
    return JSON.parse(readBase64UrlJwtPart(parts[1])) as Record<string, unknown>;
  } catch {
    return {};
  }
}

function pickClaimString(claims: Record<string, unknown>, keys: string[]): string | null {
  for (const key of keys) {
    const value = claims[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return null;
}

function readMobileMembershipSnapshots(): MobileMembershipSnapshot[] {
  const storages: Storage[] = [];
  if (typeof sessionStorage !== 'undefined') storages.push(sessionStorage);
  if (typeof localStorage !== 'undefined') storages.push(localStorage);
  for (const storage of storages) {
    const raw = storage.getItem(STORAGE_MOBILE_MEMBERSHIPS);
    if (!raw) continue;
    try {
      const parsed = JSON.parse(raw) as MobileMembershipSnapshot[];
      if (Array.isArray(parsed)) return parsed;
    } catch {
      // ignore
    }
  }
  return [];
}

/** Snapshot from HRM mobile login — fallback when embed refresh rebuilds portal membership. */
export function persistMobileMembershipsSnapshot(
  memberships: Array<{ company_id: string; employee_id?: string | null }>,
): void {
  if (typeof window === 'undefined') return;
  const snapshot: MobileMembershipSnapshot[] = memberships.map((m) => ({
    company_id: coerceHrmListCompanyId(m.company_id),
    employee_id: m.employee_id?.trim() ? m.employee_id.trim() : null,
  }));
  const json = JSON.stringify(snapshot);
  const targets: Storage[] = [];
  if (typeof sessionStorage !== 'undefined') targets.push(sessionStorage);
  if (typeof localStorage !== 'undefined') targets.push(localStorage);
  for (const storage of targets) {
    storage.setItem(STORAGE_MOBILE_MEMBERSHIPS, json);
  }
}

function employeeIdFromMobileSnapshot(companyId: string): string | null {
  const target = coerceHrmListCompanyId(companyId);
  const hit = readMobileMembershipSnapshots().find((m) => m.company_id === target);
  return hit?.employee_id?.trim() ? hit.employee_id.trim() : null;
}

/**
 * employee_id for portal embed inbox (HRM-NT-01).
 * Uses JWT claim when company aligns; else mobile login snapshot. Never invents for ceo@ without claim.
 */
export function getPortalEmbedEmployeeId(companyId: string): string | null {
  const target = coerceHrmListCompanyId(companyId);
  const token = getPortalAccessToken();
  const claims = parseAccessTokenClaims(token);
  const jwtEmployee = pickClaimString(claims, ['employee_id', 'employeeId']);
  const jwtCompany = pickClaimString(claims, ['companyId', 'company_id', 'activeCompanyId', 'active_company_id']);
  if (jwtEmployee) {
    if (!jwtCompany) return jwtEmployee;
    if (coerceHrmListCompanyId(jwtCompany) === target) return jwtEmployee;
  }
  return employeeIdFromMobileSnapshot(target);
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
    storage.removeItem(STORAGE_MOBILE_MEMBERSHIPS);
  }
}

/** Persist master-tenant rollup scope after mobile standalone login (ADR main bucket). */
export function applyStandaloneSessionScope(input: {
  tenantId?: string | null;
  companyId?: string | null;
}): void {
  if (typeof window === 'undefined') return;
  const tenantId = input.tenantId?.trim() || 'xevn';
  const companyId = input.companyId?.trim() || 'main';
  const targets: Storage[] = [];
  if (typeof sessionStorage !== 'undefined') targets.push(sessionStorage);
  if (typeof localStorage !== 'undefined') targets.push(localStorage);
  for (const storage of targets) {
    storage.setItem('hrm_current_tenant_id', tenantId);
    storage.setItem('hrm_current_company_id', companyId);
  }
}
