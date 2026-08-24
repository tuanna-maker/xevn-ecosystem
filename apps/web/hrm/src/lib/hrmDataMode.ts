import { getHrmPortalMode } from '@/lib/hrmPortalMode';
import { hasPortalSession } from '@/lib/portalAuthBridge';

/** Nest list endpoints cap page_size at 100 (List*QueryDto @Max(100)). */
export const HRM_API_MAX_PAGE_SIZE = 100;

function envFlag(name: string): string | undefined {
  const v = import.meta.env[name];
  return typeof v === 'string' ? v.trim().toLowerCase() : undefined;
}

function envTrim(name: string): string {
  const v = import.meta.env[name];
  return typeof v === 'string' ? v.trim() : '';
}

/**
 * Production pilot builds may ship VITE_SUPABASE_URL=http://127.0.0.1:54321 for local dev parity.
 * Remote browsers must never call that host — force API-only / blocked REST instead.
 */
export function isRemoteLocalhostSupabaseMisconfig(): boolean {
  if (typeof window === 'undefined') return false;
  const supabaseUrl = envTrim('VITE_SUPABASE_URL');
  if (!supabaseUrl) return false;
  const pointsToLocalhost =
    supabaseUrl.includes('127.0.0.1') || supabaseUrl.includes('localhost');
  if (!pointsToLocalhost) return false;
  const host = window.location.hostname;
  return host !== 'localhost' && host !== '127.0.0.1';
}

function isPortalProxyRuntime(): boolean {
  if (typeof window === 'undefined') return false;
  const path = window.location?.pathname ?? '';
  return path === '/hr' || path.startsWith('/hr/');
}

function isAttendanceRuntimePath(): boolean {
  if (typeof window === 'undefined') return false;
  const path = window.location?.pathname ?? '';
  const segments = path.split('/').filter(Boolean);
  return segments.includes('attendance');
}

/**
 * When true, employee/department reads use HRM Nest API — not Supabase REST.
 * Default true unless VITE_HRM_USE_API=false.
 */
export function isHrmApiDataMode(): boolean {
  // Attendance runtime is API-only to prevent localhost fallback probes.
  if (isAttendanceRuntimePath()) {
    return true;
  }
  // Portal/embed runtime must never fall back to localhost Supabase.
  if (
    typeof window !== 'undefined' &&
    (isPortalProxyRuntime() || getHrmPortalMode(resolveSearch()) || hasPortalSession())
  ) {
    return true;
  }
  const flag = envFlag('VITE_HRM_USE_API');
  if (flag === 'false') return false;
  if (flag === 'true') return true;
  return true;
}

function resolveSearch(search?: string): string {
  if (typeof search === 'string' && search.trim().length > 0) {
    return search;
  }
  if (typeof window !== 'undefined' && typeof window.location?.search === 'string') {
    return window.location.search;
  }
  return '';
}

/**
 * Skip Supabase data fetches — default true (P1-SUPA-FE-01).
 * Legacy Supabase only when `VITE_HRM_USE_API=false` and not remote localhost misconfig.
 */
export function shouldSkipSupabaseDataFetches(_search?: string): boolean {
  if (isRemoteLocalhostSupabaseMisconfig()) return true;
  return isHrmApiDataMode();
}

/** Alias for embed guards in pages/hooks (P-CC-05..08). */
export function isPortalEmbedApiMode(search = ''): boolean {
  return shouldSkipSupabaseDataFetches(search);
}

export function clampHrmPageSize(requested?: number): number {
  const n = requested ?? HRM_API_MAX_PAGE_SIZE;
  return Math.min(Math.max(1, n), HRM_API_MAX_PAGE_SIZE);
}

/**
 * Nest HRM fetch base is `VITE_HRM_API_ORIGIN` + path, or relative `/api/hrm/*` when origin is empty
 * (portal Vite proxy at :5173/:8088). Inbox/reminders must not gate only on absolute origin.
 */
export function isHrmNestApiReachable(): boolean {
  if (envTrim('VITE_HRM_API_ORIGIN')) return true;
  return isHrmApiDataMode();
}
