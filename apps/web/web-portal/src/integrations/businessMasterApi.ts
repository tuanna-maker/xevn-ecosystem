import { resolveIdentityScope } from './identityScope';
import {
  resolveXbosApiCompanyIdForPath,
  resolveXbosCommandCenterCatalogCompanyId,
} from './commandCenterScope';
import { xbosFetch, xbosGetData } from './xbosHttp';

const COMMAND_CENTER_CATALOGS_DOMAIN = 'command_center_catalogs';

function scopeHeaders(
  apiPath: string,
  tenantIdHint?: string | null,
  companyHint?: string | null,
  domain?: string,
) {
  const scope = resolveIdentityScope(tenantIdHint ?? null, companyHint ?? null);
  const companyId =
    domain === COMMAND_CENTER_CATALOGS_DOMAIN
      ? resolveXbosCommandCenterCatalogCompanyId(scope.tenantId, companyHint ?? scope.companyId)
      : resolveXbosApiCompanyIdForPath(apiPath, scope.tenantId, companyHint ?? scope.companyId);
  return { tenantId: scope.tenantId, companyId };
}

export async function listBusinessMasterItems<T>(
  domain: string,
  tenantIdHint?: string | null,
  companyHint?: string | null,
): Promise<T[]> {
  const path = `/business-master/${encodeURIComponent(domain)}/items`;
  const { tenantId, companyId } = scopeHeaders(path, tenantIdHint, companyHint, domain);
  const search = new URLSearchParams({ tenantId, companyId });
  try {
    const data = await xbosGetData<{ items?: T[] } | T[]>(
      `${path}?${search.toString()}`,
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
  const path = `/business-master/${encodeURIComponent(domain)}/items/${encodeURIComponent(itemId)}`;
  const { tenantId, companyId } = scopeHeaders(path, tenantIdHint, companyHint, domain);
  try {
    return await xbosFetch(path, {
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
  const path = `/business-master/${encodeURIComponent(domain)}/items/${encodeURIComponent(itemId)}`;
  const { tenantId, companyId } = scopeHeaders(path, tenantIdHint, companyHint, domain);
  try {
    return await xbosFetch(path, {
      method: 'DELETE',
      scope: `business-master.${domain}.delete`,
      tenantId,
      companyId,
    });
  } catch (error) {
    throw error instanceof Error ? error : new Error(`delete ${domain} failed`);
  }
}
