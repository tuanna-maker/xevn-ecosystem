import { MASTER_TENANT_ID, MEMBER_DEFAULT_COMPANY_ID } from '../constants/tenant';
import { listBusinessMasterItems, upsertBusinessMasterItem } from './businessMasterApi';

export type DeptSystemTemplateRow = {
  id: string;
  code: string;
  nameVi: string;
  description?: string;
  appliesToCompanyIds: string[];
  enabledOrgGradeLevels: number[];
};

type StoredPayload = Omit<DeptSystemTemplateRow, 'id'>;

export async function listDeptSystemTemplates(
  tenantId = MASTER_TENANT_ID,
  companyId = MEMBER_DEFAULT_COMPANY_ID,
): Promise<DeptSystemTemplateRow[]> {
  const items = await listBusinessMasterItems<StoredPayload & { id: string }>(
    'dept_system_templates',
    tenantId,
    companyId,
  );
  return items.map((row) => ({
    id: row.id,
    code: row.code ?? '',
    nameVi: row.nameVi ?? '',
    description: row.description ?? '',
    appliesToCompanyIds: row.appliesToCompanyIds ?? [],
    enabledOrgGradeLevels: row.enabledOrgGradeLevels ?? [],
  }));
}

export async function upsertDeptSystemTemplate(
  template: DeptSystemTemplateRow,
  tenantId = MASTER_TENANT_ID,
  companyId = MEMBER_DEFAULT_COMPANY_ID,
): Promise<void> {
  const { id, ...payload } = template;
  await upsertBusinessMasterItem('dept_system_templates', id, payload, tenantId, companyId);
}
