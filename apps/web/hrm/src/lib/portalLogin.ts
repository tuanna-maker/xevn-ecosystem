import { isHrmPortalEmbedFrame } from '@/lib/hrmPortalMode';
import { hrmAppPathnameToPortalPath } from '@/lib/hrmPortalUrlSync';

/** Query key aligned with X-BOS Portal login (`authSession` post-login navigation). */
export const PORTAL_LOGIN_REDIRECT_PARAM = 'redirect';

const DEFAULT_PORTAL_DEV_ORIGIN = 'http://127.0.0.1:5175';
const DEFAULT_POST_LOGIN_PATH = '/command-center/hrm/dashboard';

function normalizeReturnPath(returnPath?: string): string {
  const raw = returnPath?.trim();
  if (!raw) return DEFAULT_POST_LOGIN_PATH;
  if (!raw.startsWith('/')) return DEFAULT_POST_LOGIN_PATH;
  if (raw.startsWith('//')) return DEFAULT_POST_LOGIN_PATH;
  return raw;
}

/** Public portal origin for handoff when HRM runs standalone (:8080). */
export function getPortalPublicOrigin(): string {
  const configured = import.meta.env.VITE_PORTAL_PUBLIC_ORIGIN?.trim().replace(/\/+$/, '');
  if (configured) return configured;

  if (typeof window !== 'undefined') {
    const { port, origin } = window.location;
    if (port === '8080') {
      return import.meta.env.DEV ? DEFAULT_PORTAL_DEV_ORIGIN : origin;
    }
    return origin;
  }

  return import.meta.env.DEV ? DEFAULT_PORTAL_DEV_ORIGIN : '';
}

/**
 * Absolute portal `/login` URL with `redirect` query (same contract as `xevn.portal.loginRedirect`).
 */
export function getPortalLoginUrl(returnPath?: string): string {
  const origin = getPortalPublicOrigin() || DEFAULT_PORTAL_DEV_ORIGIN;
  const path = normalizeReturnPath(returnPath);
  const url = new URL('/login', origin);
  url.searchParams.set(PORTAL_LOGIN_REDIRECT_PARAM, path);
  return url.toString();
}

/** Map current HRM app pathname (basename /hr) → portal return path after login. */
export function hrmReturnPathForPortalLogin(pathname: string, basename = '/hr'): string {
  return hrmAppPathnameToPortalPath(pathname, basename);
}

/**
 * Navigate to portal login on the **top** window when embedded in Command Center
 * so users never see a nested login form inside the HRM iframe.
 */
export function redirectToPortalLogin(returnPath?: string): void {
  if (typeof window === 'undefined') return;
  const url = getPortalLoginUrl(returnPath);
  if (isHrmPortalEmbedFrame() && window.top) {
    window.top.location.assign(url);
    return;
  }
  window.location.assign(url);
}
