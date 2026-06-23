/** Portal-aligned JWT session helpers (honors server `expires_in_sec`, default 24h). */

export const MOBILE_JWT_DEFAULT_TTL_SEC = 24 * 60 * 60;

const REFRESH_SKEW_MS = 60_000;

export function computeTokenExpiresAt(expiresInSec?: number, now = Date.now()): number {
  const sec = Number.isFinite(expiresInSec) && (expiresInSec as number) > 0
    ? (expiresInSec as number)
    : MOBILE_JWT_DEFAULT_TTL_SEC;
  return now + Math.max(0, sec) * 1000;
}

export function isMobileTokenExpired(expiresAt?: number, now = Date.now(), skewMs = REFRESH_SKEW_MS): boolean {
  if (!expiresAt || !Number.isFinite(expiresAt) || expiresAt <= 0) return false;
  return now >= expiresAt - skewMs;
}
