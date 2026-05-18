import { resolveIdentityScope } from './identityScope';
import { xbosFetch, xbosGetData } from './xbosHttp';

function scopeHeaders(tenantIdHint?: string | null, companyHint?: string | null) {
  const scope = resolveIdentityScope(tenantIdHint ?? null, companyHint ?? null);
  return { tenantId: scope.tenantId, companyId: scope.companyId };
}

export async function listBusinessMasterItems<T>(
  domain: string,
  tenantIdHint?: string | null,
  companyHint?: string | null,
): Promise<T[]> {
  const { tenantId, companyId } = scopeHeaders(tenantIdHint, companyHint);
  const search = new URLSearchParams({ tenantId, companyId });
  try {
    const data = await xbosGetData<{ items?: T[] } | T[]>(
      `/business-master/${encodeURIComponent(domain)}/items?${search.toString()}`,
      {
        scope: `business-master.${domain}.list`,
        tenantId,
        companyId,
      },
    );
    if (Array.isArray(data)) return data;
    return data?.items ?? [];
  } catch (error) {
    throw error instanceof Error ? error : new Error(`load ${domain} failed`);
  }
}

export async function upsertBusinessMasterItem(
  domain: string,
  itemId: string,
  payload: unknown,
  tenantIdHint?: string | null,
  companyHint?: string | null,
) {
  const { tenantId, companyId } = scopeHeaders(tenantIdHint, companyHint);
  try {
    return await xbosFetch(`/business-master/${encodeURIComponent(domain)}/items/${encodeURIComponent(itemId)}`, {
      method: 'PUT',
      scope: `business-master.${domain}.upsert`,
      tenantId,
      companyId,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload ?? {}),
    });
  } catch (error) {
    throw error instanceof Error ? error : new Error(`save ${domain} failed`);
  }
}

export async function deleteBusinessMasterItem(
  domain: string,
  itemId: string,
  tenantIdHint?: string | null,
  companyHint?: string | null,
) {
  const { tenantId, companyId } = scopeHeaders(tenantIdHint, companyHint);
  try {
    return await xbosFetch(`/business-master/${encodeURIComponent(domain)}/items/${encodeURIComponent(itemId)}`, {
      method: 'DELETE',
      scope: `business-master.${domain}.delete`,
      tenantId,
      companyId,
    });
  } catch (error) {
    throw error instanceof Error ? error : new Error(`delete ${domain} failed`);
  }
}
