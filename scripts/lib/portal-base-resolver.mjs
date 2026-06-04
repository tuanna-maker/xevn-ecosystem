const DEFAULT_CANDIDATES = ['http://127.0.0.1:5173', 'http://127.0.0.1:5175'];

function normalizeBase(url) {
  return String(url || '').trim().replace(/\/+$/, '');
}

async function canLogin(base, fetchImpl) {
  try {
    const response = await fetchImpl(`${base}/api/xbos/auth/login`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'ceo@xe.vn', password: 'Xevn@2026' }),
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) return false;
    const body = await response.json().catch(() => ({}));
    return Boolean(body?.data?.accessToken ?? body?.accessToken);
  } catch {
    return false;
  }
}

export async function resolvePortalBase(options = {}) {
  const fetchImpl = options.fetchImpl ?? fetch;
  const envBase = normalizeBase(options.portalDevUrl ?? process.env.PORTAL_DEV_URL);
  if (envBase) return envBase;

  const extraCandidates = Array.isArray(options.extraCandidates)
    ? options.extraCandidates.map(normalizeBase).filter(Boolean)
    : [];
  const candidates = [...new Set([...extraCandidates, ...DEFAULT_CANDIDATES])];
  for (const candidate of candidates) {
    if (await canLogin(candidate, fetchImpl)) return candidate;
  }

  return DEFAULT_CANDIDATES[0];
}
