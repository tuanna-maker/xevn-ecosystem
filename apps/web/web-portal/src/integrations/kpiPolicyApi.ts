import { listBusinessMasterItems, upsertBusinessMasterItem } from './businessMasterApi';

const DOMAIN = 'kpi_policies';
const ACTIVE_ITEM_ID = 'active_rows';

export type KpiPolicyRow = {
  id: string;
  code: string;
  name: string;
  description: string;
  status: 'approved' | 'pending' | 'draft';
  approvedDate: string | null;
  effectiveDate: string | null;
  applicableCompanies: string[];
  relatedKPIs: string[];
};

type PolicyPayload = { rows?: KpiPolicyRow[] };

export async function loadKpiPolicies(
  tenantId: string,
  companyId: string,
): Promise<KpiPolicyRow[]> {
  const items = await listBusinessMasterItems<PolicyPayload & { id: string }>(DOMAIN, tenantId, companyId);
  const entry = items.find((row) => row.id === ACTIVE_ITEM_ID);
  return entry?.rows ?? [];
}

export async function saveKpiPolicies(
  rows: KpiPolicyRow[],
  tenantId: string,
  companyId: string,
): Promise<void> {
  await upsertBusinessMasterItem(DOMAIN, ACTIVE_ITEM_ID, { rows }, tenantId, companyId);
}
