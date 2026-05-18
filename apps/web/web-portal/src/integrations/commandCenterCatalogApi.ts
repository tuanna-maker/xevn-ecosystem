import { MASTER_TENANT_ID, MEMBER_DEFAULT_COMPANY_ID } from '../constants/tenant';
import { listBusinessMasterItems, upsertBusinessMasterItem } from './businessMasterApi';

const DOMAIN = 'command_center_catalogs';

export type CcCatalogKind = 'regulations' | 'measurements' | 'pricing';

type CatalogPayload<T> = { rows?: T[] };

export async function loadCcCatalogRows<T>(
  kind: CcCatalogKind,
  tenantId = MASTER_TENANT_ID,
  companyId = MEMBER_DEFAULT_COMPANY_ID,
): Promise<T[]> {
  const items = await listBusinessMasterItems<CatalogPayload<T> & { id: string }>(
    DOMAIN,
    tenantId,
    companyId,
  );
  const entry = items.find((row) => row.id === kind);
  return entry?.rows ?? [];
}

export async function saveCcCatalogRows<T>(
  kind: CcCatalogKind,
  rows: T[],
  tenantId = MASTER_TENANT_ID,
  companyId = MEMBER_DEFAULT_COMPANY_ID,
): Promise<void> {
  await upsertBusinessMasterItem(DOMAIN, kind, { rows }, tenantId, companyId);
}
