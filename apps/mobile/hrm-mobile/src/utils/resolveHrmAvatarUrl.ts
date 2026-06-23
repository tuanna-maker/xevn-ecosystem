/** Strips trailing slashes from API base URL. */
function stripTrailingSlash(url: string): string {
  return url.replace(/\/+$/, '');
}

/**
 * Resolves HRM file `avatar_url` for React Native `Image` source.
 * Relative paths from `POST /files/upload` are prefixed with `baseUrl`.
 */
export function resolveHrmAvatarUrl(
  baseUrl: string | undefined | null,
  avatarUrl: string | undefined | null,
): string | null {
  const raw = avatarUrl?.trim() ?? '';
  if (!raw) return null;
  if (/^https?:\/\//i.test(raw)) return raw;
  const base = stripTrailingSlash(baseUrl?.trim() ?? '');
  if (!base) return raw.startsWith('/') ? raw : `/${raw}`;
  return raw.startsWith('/') ? `${base}${raw}` : `${base}/${raw}`;
}

/** Optional cache-bust query for post-upload refresh. */
export function withAvatarCacheBust(resolvedUrl: string | null, version?: string | number): string | null {
  if (!resolvedUrl) return null;
  const v = version ?? Date.now();
  const sep = resolvedUrl.includes('?') ? '&' : '?';
  return `${resolvedUrl}${sep}v=${encodeURIComponent(String(v))}`;
}

/** Two-letter initials from full name for avatar fallback. */
export function resolveEmployeeInitials(fullName: string | undefined | null): string {
  const parts = (fullName?.trim() ?? '')
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ''}${parts[parts.length - 1][0] ?? ''}`.toUpperCase();
}

export const AVATAR_MAX_BYTES = 5 * 1024 * 1024;

export const AVATAR_ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp']);
