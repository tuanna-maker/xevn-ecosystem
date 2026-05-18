import { resolveIdentityScope } from './identityScope';

async function headers(companyHint?: string | null, withBody = false) {
  const scope = resolveIdentityScope(companyHint ?? null);
  const h: Record<string, string> = {
    'x-tenant-id': scope.tenantId,
    'x-company-id': scope.companyId,
  };
  const key = import.meta.env.VITE_INTERNAL_API_KEY?.trim();
  if (key) h['x-internal-api-key'] = key;
  if (withBody) h['Content-Type'] = 'application/json';
  return { headers: h };
}

export async function listAssetRequests(companyHint?: string | null) {
  const { headers: h } = await headers(companyHint);
  const res = await fetch('/api/xbos/asset-requests', { headers: h });
  if (!res.ok) throw new Error('asset requests load failed');
  const json = await res.json();
  return json?.data?.items ?? [];
}
