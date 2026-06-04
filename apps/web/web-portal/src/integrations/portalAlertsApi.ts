import type { PortalAlert } from '../data/command-center-mock';
import { MASTER_TENANT_ID } from '../constants/tenant';
import { resolveIdentityScope } from './identityScope';
import { resolveXbosApiCompanyIdForPath, resolveXbosKpiRollupCompanyId } from './commandCenterScope';
import {
  dedupePortalAlerts,
  mapCatalogInboxToPortalAlert,
  mapStoredPortalAlertRow,
  mapWorkflowTaskToPortalAlert,
  sortPortalAlerts,
  type CatalogInboxItem,
} from './portalAlertMappers';
import { listWorkflowTasks } from './workflowEngineApi';
import { xbosGetData } from './xbosHttp';

export async function fetchPortalAlerts(
  tenantIdHint?: string | null,
  assigneeUserId?: string,
  companyIdHint?: string | null,
): Promise<PortalAlert[]> {
  const { tenantId } = resolveIdentityScope(tenantIdHint ?? MASTER_TENANT_ID, companyIdHint);
  const companyId = resolveXbosKpiRollupCompanyId(tenantIdHint ?? MASTER_TENANT_ID, companyIdHint);
  const alerts: PortalAlert[] = [];
  try {
    const tasks = await listWorkflowTasks(tenantId, 'pending');
    const filtered = assigneeUserId
      ? tasks.filter((t) => !t.assignee_user_id || t.assignee_user_id === assigneeUserId)
      : tasks;
    alerts.push(...filtered.slice(0, 12).map(mapWorkflowTaskToPortalAlert));
  } catch {
    /* workflow optional */
  }
  try {
    const user = assigneeUserId ?? import.meta.env.VITE_DEV_USER_ID ?? 'admin@xe.vn';
    const catalogCompanyId = resolveXbosApiCompanyIdForPath(
      '/catalog-governance/inbox',
      tenantId,
      companyIdHint,
    );
    const data = await xbosGetData<{ items?: CatalogInboxItem[] }>(
      `/catalog-governance/inbox?assigneeUserId=${encodeURIComponent(user)}`,
      { scope: 'catalog-governance.inbox', tenantId, companyId: catalogCompanyId },
    );
    alerts.push(...(data?.items ?? []).slice(0, 8).map(mapCatalogInboxToPortalAlert));
  } catch {
    /* catalog inbox optional */
  }
  try {
    const stored = await xbosGetData<{ items?: Array<Record<string, string>> }>(
      `/kpi-engine/portal-alerts?tenantId=${encodeURIComponent(tenantId)}&companyId=${encodeURIComponent(companyId)}&limit=20`,
      { scope: 'kpi-engine.portal-alerts', tenantId, companyId, suppressLogStatuses: [409] },
    );
    for (const row of stored?.items ?? []) {
      alerts.push(mapStoredPortalAlertRow(row));
    }
  } catch {
    /* stored alerts optional */
  }
  return sortPortalAlerts(dedupePortalAlerts(alerts));
}
