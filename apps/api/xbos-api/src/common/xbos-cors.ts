/**
 * XBOS API CORS — production-safe; never reflect-any-origin (Nest `origin: true`).
 * Matches hrm-api + `resolveCorsOptions()` when NODE_ENV=production and CORS_ALLOWED_ORIGINS is set.
 */

const DEV_JWT_MARKERS = new Set([
  'xevn-dev-jwt-secret',
  'change-me',
  'secret',
  'replace_with_strong_secret',
]);

export function parseCorsAllowedOrigins(): string[] {
  const raw = process.env.CORS_ALLOWED_ORIGINS?.trim();
  if (!raw) return [];
  return raw.split(',').map((s) => s.trim()).filter(Boolean);
}

/** Pilot/VPS or local dev with explicit whitelist — not permissive reflect mode. */
export function shouldUseXbosCorsWhitelist(): boolean {
  if (process.env.NODE_ENV === 'production') return true;
  if (parseCorsAllowedOrigins().length > 0) return true;
  const jwt = process.env.SERVICE_JWT_SECRET?.trim();
  return Boolean(jwt && !DEV_JWT_MARKERS.has(jwt));
}

export function resolveXbosCorsOptions(): {
  origin: boolean | string | string[];
  credentials: boolean;
} {
  if (!shouldUseXbosCorsWhitelist()) {
    return { origin: false, credentials: true };
  }
  const origins = parseCorsAllowedOrigins();
  return { origin: origins.length ? origins : false, credentials: true };
}
