import type { PortalAlert } from '../data/command-center-mock';
import { MASTER_TENANT_ID } from '../constants/tenant';
import { resolveWorkflowBusinessTypeLabel } from '../utils/workflowDisplayLabels';

export type CatalogInboxItem = {
  id: string;
  title?: string;
  status?: string;
  memberTenantId?: string;
  catalogKey?: string;
};

export function mapWorkflowTaskToPortalAlert(row: {
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
    detail: `Quy trình · ${resolveWorkflowBusinessTypeLabel(businessType)}${row.due_at ? ` · hạn ${row.due_at}` : ''}`,
    sourceSystem: 'xbos-workflow',
  };
}

export function mapCatalogInboxToPortalAlert(item: CatalogInboxItem): PortalAlert {
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

export function mapStoredPortalAlertRow(row: Record<string, string>): PortalAlert {
  const level = row.level as PortalAlert['level'];
  return {
    id: String(row.id),
    moduleCode: row.module_code ?? 'system',
    orgUnitId: row.company_id ?? row.tenant_id ?? MASTER_TENANT_ID,
    level: level === 'critical' || level === 'warn' || level === 'info' ? level : 'info',
    title: row.title ?? 'Thông báo',
    detail: row.detail ?? '',
    sourceSystem: row.source_system ?? 'xbos',
  };
}

const LEVEL_RANK: Record<PortalAlert['level'], number> = {
  critical: 0,
  warn: 1,
  info: 2,
};

export function sortPortalAlerts(alerts: PortalAlert[]): PortalAlert[] {
  return [...alerts].sort((a, b) => LEVEL_RANK[a.level] - LEVEL_RANK[b.level]);
}

export function dedupePortalAlerts(alerts: PortalAlert[]): PortalAlert[] {
  const seen = new Set<string>();
  const out: PortalAlert[] = [];
  for (const alert of alerts) {
    if (seen.has(alert.id)) continue;
    seen.add(alert.id);
    out.push(alert);
  }
  return out;
}
