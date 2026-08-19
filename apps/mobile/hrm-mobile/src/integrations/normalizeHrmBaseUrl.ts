import { RELEASE_PILOT_HRM_API_BASE_URL } from '../config/pilotApiBase';

function stripTrailingSlash(url: string): string {
  return url.replace(/\/+$/, '');
}

/**
 * Normalize HRM API origin from deep-link `base_url`, SecureStore, or env fallback.
 * Rejects empty, path-only, or non-http(s) values that would make `fetch` throw (ERR-NETWORK).
 */
export function normalizeHrmBaseUrl(raw: string | undefined | null, fallback?: string): string {
  const fb = stripTrailingSlash((fallback ?? RELEASE_PILOT_HRM_API_BASE_URL).trim());
  const candidate = stripTrailingSlash((raw ?? '').trim());
  if (!candidate) return fb;

  try {
    const parsed = new URL(candidate);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return fb;
    if (!parsed.hostname.trim()) return fb;
    return stripTrailingSlash(`${parsed.protocol}//${parsed.host}`);
  } catch {
    return fb;
  }
}
