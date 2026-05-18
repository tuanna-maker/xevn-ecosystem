import type { PortalAlert } from '../data/command-center-mock';
import { MASTER_TENANT_ID, MEMBER_DEFAULT_COMPANY_ID } from '../constants/tenant';
import { listWorkflowTasks } from './workflowEngineApi';
import { xbosGetData } from './xbosHttp';

type CatalogInboxItem = {
  id: string;
  title?: string;
  status?: string;
  memberTenantId?: string;
  catalogKey?: string;
};

function mapWorkflowTaskToAlert(row: {
  id: string;
  workflow_name?: string;
  step_key?: string;
  business_type?: string;
  due_at?: string | null;
}): PortalAlert {
  const businessType = String(row.business_type ?? '');
  let moduleCode = 'business';
  if (businessType.includes('hrm') || businessType.includes('payroll')) moduleCode = 'hrm';
  else if (businessType.includes('catalog')) moduleCode = 'x-bos';
  else if (businessType.includes('finance')) moduleCode = 'finance';
  return {
    id: `wf-${row.id}`,
    moduleCode,
    orgUnitId: MASTER_TENANT_ID,
    level: 'warn',
    title: row.workflow_name ?? row.step_key ?? 'Nhiệm vụ phê duyệt',
    detail: `Workflow · ${businessType}${row.due_at ? ` · hạn ${row.due_at}` : ''}`,
    sourceSystem: 'xbos-workflow',
  };
}

function mapCatalogItemToAlert(item: CatalogInboxItem): PortalAlert {
  return {
    id: `cat-${item.id}`,
    moduleCode: 'x-bos',
    orgUnitId: item.memberTenantId ?? MASTER_TENANT_ID,
    level: item.status === 'pending' ? 'warn' : 'info',
    title: item.title ?? 'Duyệt danh mục HRM',
    detail: item.catalogKey ? `Catalog: ${item.catalogKey}` : 'Catalog governance',
    sourceSystem: 'catalog-governance',
  };
}

export async function fetchPortalAlerts(
  tenantId = MASTER_TENANT_ID,
  assigneeUserId?: string,
  companyId = MASTER_TENANT_ID === tenantId ? MASTER_TENANT_ID : MEMBER_DEFAULT_COMPANY_ID,
): Promise<PortalAlert[]> {
  const alerts: PortalAlert[] = [];
  try {
    const tasks = await listWorkflowTasks(tenantId, 'pending');
    const filtered = assigneeUserId
      ? tasks.filter((t) => !t.assignee_user_id || t.assignee_user_id === assigneeUserId)
      : tasks;
    alerts.push(...filtered.slice(0, 12).map(mapWorkflowTaskToAlert));
  } catch {
    /* workflow optional */
  }
  try {
    const user = assigneeUserId ?? import.meta.env.VITE_DEV_USER_ID ?? 'admin@xevn.vn';
    const data = await xbosGetData<{ items?: CatalogInboxItem[] }>(
      `/catalog-governance/inbox?assigneeUserId=${encodeURIComponent(user)}`,
      { scope: 'catalog-governance.inbox', tenantId },
    );
    alerts.push(...(data?.items ?? []).slice(0, 8).map(mapCatalogItemToAlert));
  } catch {
    /* catalog inbox optional */
  }
  try {
    const stored = await xbosGetData<{ items?: Array<Record<string, string>> }>(
      `/kpi-engine/portal-alerts?tenantId=${encodeURIComponent(tenantId)}&companyId=${encodeURIComponent(companyId)}&limit=20`,
      { scope: 'kpi-engine.portal-alerts', tenantId, companyId },
    );
    for (const row of stored?.items ?? []) {
      alerts.push({
        id: String(row.id),
        moduleCode: row.module_code ?? 'system',
        orgUnitId: row.company_id ?? tenantId,
        level: (row.level as PortalAlert['level']) ?? 'info',
        title: row.title ?? 'Thông báo',
        detail: row.detail ?? '',
        sourceSystem: row.source_system ?? 'xbos',
      });
    }
  } catch {
    /* stored alerts optional */
  }
  return alerts;
}
