import { MASTER_TENANT_ID, MEMBER_DEFAULT_COMPANY_ID } from '../constants/tenant';
import {
  deleteBusinessMasterItem,
  listBusinessMasterItems,
  upsertBusinessMasterItem,
} from './businessMasterApi';

export type DeptSystemTemplateRow = {
  id: string;
  code: string;
  nameVi: string;
  description?: string;
  appliesToCompanyIds: string[];
  enabledOrgGradeLevels: number[];
};

type StoredPayload = Omit<DeptSystemTemplateRow, 'id'>;

type RawMasterRow = Partial<StoredPayload> & { id: string };

/** Normalize business-master list row → template (pure, testable). */
export function mapDeptSystemTemplateRow(row: RawMasterRow): DeptSystemTemplateRow {
  return {
    id: row.id,
    code: String(row.code ?? '').trim(),
    nameVi: String(row.nameVi ?? '').trim(),
    description: row.description != null ? String(row.description) : '',
    appliesToCompanyIds: Array.isArray(row.appliesToCompanyIds) ? [...row.appliesToCompanyIds] : [],
    enabledOrgGradeLevels: Array.isArray(row.enabledOrgGradeLevels)
      ? [...row.enabledOrgGradeLevels].sort((a, b) => a - b)
      : [],
  };
}

export type DeptSystemTemplatesLoadSource = 'api' | 'mock' | 'empty';

/** QA seed — see docs/qa/evidence/p1-s1-fe-03-dept-templates-20260524.md */
export const DEPT_SYSTEM_TEMPLATES_SEED_CMD = 'pnpm seed:business-master:settings-md';

export const DEPT_SYSTEM_TEMPLATES_LIST_PATH =
  '/api/xbos/business-master/dept_system_templates/items';

export function isDeptTemplatesNotFoundError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  return /\b404\b/.test(error.message) || /HTTP\s*404/i.test(error.message);
}

export function deptTemplatesLoadErrorMessage(notFound: boolean, apiFailed: boolean): string | null {
  if (notFound) {
    return `Domain dept_system_templates chưa có trên business-master (HTTP 404). Chạy \`${DEPT_SYSTEM_TEMPLATES_SEED_CMD}\` (xbos-api :28002) rồi làm mới tab này.`;
  }
  if (apiFailed) {
    return `Không tải khung phòng/ban từ ${DEPT_SYSTEM_TEMPLATES_LIST_PATH}. Kiểm tra xbos-api (28002), đăng nhập, hoặc chạy \`${DEPT_SYSTEM_TEMPLATES_SEED_CMD}\`.`;
  }
  return null;
}

/** Resolve templates after API list (strict mock policy — FE-01/02). */
export function resolveDeptSystemTemplatesLoad(
  apiRows: DeptSystemTemplateRow[],
  allowMock: boolean,
  mockRows: DeptSystemTemplateRow[],
  apiFailed = false,
): { templates: DeptSystemTemplateRow[]; source: DeptSystemTemplatesLoadSource; loadFailed: boolean } {
  if (apiRows.length > 0) {
    return { templates: apiRows, source: 'api', loadFailed: false };
  }
  if (allowMock) {
    return {
      templates: mockRows.map((r) => mapDeptSystemTemplateRow(r)),
      source: 'mock',
      loadFailed: apiFailed,
    };
  }
  return { templates: [], source: 'empty', loadFailed: apiFailed };
}

export async function listDeptSystemTemplates(
  tenantId = MASTER_TENANT_ID,
  companyId = MEMBER_DEFAULT_COMPANY_ID,
): Promise<DeptSystemTemplateRow[]> {
  const items = await listBusinessMasterItems<RawMasterRow>('dept_system_templates', tenantId, companyId);
  return items.map((row) => mapDeptSystemTemplateRow(row));
}

export async function upsertDeptSystemTemplate(
  template: DeptSystemTemplateRow,
  tenantId = MASTER_TENANT_ID,
  companyId = MEMBER_DEFAULT_COMPANY_ID,
): Promise<void> {
  const { id, ...payload } = template;
  await upsertBusinessMasterItem('dept_system_templates', id, payload, tenantId, companyId);
}

export async function deleteDeptSystemTemplate(
  templateId: string,
  tenantId = MASTER_TENANT_ID,
  companyId = MEMBER_DEFAULT_COMPANY_ID,
): Promise<void> {
  await deleteBusinessMasterItem('dept_system_templates', templateId, tenantId, companyId);
}
