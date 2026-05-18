import { MASTER_TENANT_ID, MEMBER_DEFAULT_COMPANY_ID } from '../constants/tenant';
import { xbosGetData, xbosFetch } from './xbosHttp';

export type InfrastructureSettingsPayload = {
  foundationCategories?: unknown[];
  sites?: unknown[];
  blockTitleOverridesByEntity?: Record<string, unknown>;
  customBlocksByEntity?: Record<string, unknown>;
  customFieldDefsByEntity?: Record<string, unknown>;
};

export async function fetchInfrastructureSettings(
  tenantId = import.meta.env.VITE_DEFAULT_TENANT_ID ?? MASTER_TENANT_ID,
  companyId = MEMBER_DEFAULT_COMPANY_ID,
): Promise<InfrastructureSettingsPayload> {
  const search = new URLSearchParams({ tenantId, companyId });
  return xbosGetData<InfrastructureSettingsPayload>(
    `/infrastructure/settings?${search.toString()}`,
    {
      scope: 'infrastructure.settings.get',
      tenantId,
      companyId,
    },
  );
}

export async function saveInfrastructureSettings(
  payload: InfrastructureSettingsPayload,
  tenantId = import.meta.env.VITE_DEFAULT_TENANT_ID ?? MASTER_TENANT_ID,
  companyId = MEMBER_DEFAULT_COMPANY_ID,
): Promise<InfrastructureSettingsPayload> {
  const envelope = await xbosFetch<{ data: InfrastructureSettingsPayload }>('/infrastructure/settings', {
    method: 'PUT',
    scope: 'infrastructure.settings.put',
    tenantId,
    companyId,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return envelope.data ?? payload;
}
