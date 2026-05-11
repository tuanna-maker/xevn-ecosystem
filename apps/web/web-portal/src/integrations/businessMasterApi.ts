import { resolveIdentityScope } from './identityScope';

async function getHeaders(companyHint?: string | null, withBody = false) {
  const scope = resolveIdentityScope(companyHint ?? null);
  const headers: Record<string, string> = {
    'x-tenant-id': scope.tenantId,
    'x-company-id': scope.companyId,
  };
  const internalApiKey = import.meta.env.VITE_INTERNAL_API_KEY?.trim();
  if (internalApiKey) headers['x-internal-api-key'] = internalApiKey;
  if (withBody) headers['Content-Type'] = 'application/json';
  return { headers, scope };
}

export async function listBusinessMasterItems<T>(domain: string, companyHint?: string | null): Promise<T[]> {
  const { headers, scope } = await getHeaders(companyHint, false);
  const search = new URLSearchParams({ tenantId: scope.tenantId, companyId: scope.companyId });
  const res = await fetch(`/api/xbos/business-master/${encodeURIComponent(domain)}/items?${search.toString()}`, {
    method: 'GET',
    headers,
  });
  if (!res.ok) throw new Error(`load ${domain} failed`);
  const json = await res.json();
  return (json?.data?.items ?? []) as T[];
}

export async function upsertBusinessMasterItem(
  domain: string,
  itemId: string,
  payload: unknown,
  companyHint?: string | null,
) {
  const { headers } = await getHeaders(companyHint, true);
  const res = await fetch(`/api/xbos/business-master/${encodeURIComponent(domain)}/items/${encodeURIComponent(itemId)}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(payload ?? {}),
  });
  if (!res.ok) throw new Error(`save ${domain} failed`);
  return res.json();
}

export async function deleteBusinessMasterItem(domain: string, itemId: string, companyHint?: string | null) {
  const { headers } = await getHeaders(companyHint, false);
  const res = await fetch(`/api/xbos/business-master/${encodeURIComponent(domain)}/items/${encodeURIComponent(itemId)}`, {
    method: 'DELETE',
    headers,
  });
  if (!res.ok) throw new Error(`delete ${domain} failed`);
  return res.json();
}

