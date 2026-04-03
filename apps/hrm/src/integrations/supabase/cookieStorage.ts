// Cookie-backed storage compatible with @supabase/auth-js `auth.storage`.
// Goal: share Supabase session between multiple sub-apps under the same domain
// even when they run on different ports in development.

const COOKIE_PATH = '/'

function getCookieDomain(): string | null {
  // Allow explicit override for production setups (subdomains sharing same apex domain).
  const fromEnv =
    // Vite env var name (optional): set e.g. ".xevn.vn"
    import.meta.env.VITE_COOKIE_DOMAIN ?? import.meta.env.VITE_SUPABASE_COOKIE_DOMAIN;
  if (typeof fromEnv === 'string' && fromEnv.trim() !== '') {
    return fromEnv.trim();
  }

  if (typeof window === 'undefined') return null;
  const hostname = window.location.hostname;

  // Don't set Domain for localhost/dev hosts.
  if (hostname === 'localhost' || hostname.endsWith('.localhost')) return null;

  // If it's an IP (IPv4 / IPv6), avoid setting Domain.
  const isIPv4 = /^\d{1,3}(\.\d{1,3}){3}$/.test(hostname);
  const isIPv6 = hostname.includes(':');
  if (isIPv4 || isIPv6) return null;

  const parts = hostname.split('.').filter(Boolean);
  if (parts.length < 2) return null;

  // Best-effort: share across subdomains by setting last 2 labels.
  // For complex TLDs, prefer setting VITE_COOKIE_DOMAIN explicitly.
  return `.${parts.slice(-2).join('.')}`;
}

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  const encodedName = encodeURIComponent(name)
  const parts = document.cookie.split(';').map((p) => p.trim()).filter(Boolean)
  for (const part of parts) {
    const [rawKey, ...rest] = part.split('=')
    const key = rawKey ? decodeURIComponent(rawKey) : ''
    if (key === name || encodeURIComponent(key) === encodedName) {
      return rest.join('=')
    }
  }
  return null
}

function setCookie(name: string, value: string, maxAgeSeconds: number) {
  if (typeof document === 'undefined') return
  const secure = window.location.protocol === 'https:'
  const cookieDomain = getCookieDomain()

  // Note: cookie size is limited (~4KB). If your session tokens exceed that,
  // you'll need a different strategy (e.g. reverse proxy or token chunking).
  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; Path=${COOKIE_PATH};${
    cookieDomain ? ` Domain=${cookieDomain};` : ''
  } Max-Age=${maxAgeSeconds}; SameSite=Lax${
    secure ? '; Secure' : ''
  }`
}

function deleteCookie(name: string) {
  if (typeof document === 'undefined') return
  const cookieDomain = getCookieDomain()
  document.cookie = `${encodeURIComponent(name)}=; Path=${COOKIE_PATH};${
    cookieDomain ? ` Domain=${cookieDomain};` : ''
  } Max-Age=0; SameSite=Lax`
}

export const cookieStorage = {
  // `auth-js` treats `null` as missing storage.
  async getItem(key: string): Promise<string | null> {
    const raw = getCookie(key)
    if (!raw) return null
    try {
      return decodeURIComponent(raw)
    } catch {
      return raw
    }
  },
  async setItem(key: string, value: string): Promise<void> {
    // Long enough to cover token refresh cycles. Actual token expiry is still
    // enforced by Supabase.
    setCookie(key, value, 60 * 60 * 24 * 180) // ~180 days
  },
  async removeItem(key: string): Promise<void> {
    deleteCookie(key)
  },
}

