/**
 * Hợp đồng FE ↔ HRM settings-catalogs cho danh mục hồ sơ nhân sự tập đoàn.
 * @see apps/api/hrm-api/src/settings-catalogs/group-employee-import-catalog.ts
 */
import { isMasterTenant, MASTER_TENANT_ID, MEMBER_DEFAULT_COMPANY_ID } from '../constants/tenant';
import { resolveHrmOperationalCompanyId } from './commandCenterScope';
import { getJwtTenantId, resolveIdentityScope, type IdentityScopeContext } from './identityScope';
import { formatHttpError, logApiFailure, logApiStart, logApiSuccess } from '../utils/apiLogger';

export const HRM_EMPLOYEE_CATALOG_KEYS = [
  'hrm_employee_basic_fields',
  'hrm_employee_personal_fields',
  'hrm_employee_contact_fields',
  'hrm_employee_emergency_fields',
  'hrm_employee_address_fields',
  'hrm_employee_insurance_fields',
  'hrm_employee_work_fields',
  'hrm_employee_finance_fields',
] as const;

export type HrmEmployeeCatalogKey = (typeof HRM_EMPLOYEE_CATALOG_KEYS)[number];

export type GroupHrSyncProgress = {
  completed: number;
  total: number;
  catalogKey: string;
};

/**
 * HRM settings-catalogs scope for Command Center group HR (J-XBOS-02 / ADR §4).
 * Group CEO JWT on master tenant always uses `xevn` + operational `main`.
 */
export function resolveGroupHrHrmCatalogScope(
  entityTenantId?: string | null,
): IdentityScopeContext {
  const claimTenant = getJwtTenantId();
  const rawTenant = (entityTenantId ?? MASTER_TENANT_ID).trim() || MASTER_TENANT_ID;
  const tenantId =
    claimTenant && isMasterTenant(claimTenant) ? MASTER_TENANT_ID : rawTenant;
  return {
    tenantId,
    companyId: resolveHrmOperationalCompanyId(tenantId, MEMBER_DEFAULT_COMPANY_ID),
  };
}

export type GroupHrCatalogFieldDto = {
  id: string;
  fieldCode: string;
  labelVi: string;
  dataType: 'text' | 'number' | 'date' | 'select' | 'phone' | 'email';
  blockCode: string;
  visible: boolean;
  selectConfig: string;
  hrmCatalogKey: HrmEmployeeCatalogKey;
};

/** Mã trường UI preset → mã catalog HRM (seed import). */
const PRESET_FIELD_TO_HRM_CODE: Record<string, string> = {
  'emf-emp-name': 'full_name',
  'emf-birth-year': 'birth_year',
  'emf-gender': 'gender',
  'emf-id-doc': 'national_id',
  'emf-ethnicity': 'ethnicity',
  'emf-religion': 'religion',
  'emf-qualification': 'professional_qualification',
  'emf-phone': 'phone_number',
  'emf-zalo': 'zalo',
  'emf-email': 'email',
  'emf-emergency-name': 'emergency_contact_name',
  'emf-emergency-phone': 'emergency_contact_phone',
  'emf-emergency-relation': 'emergency_contact_relation',
  'emf-permanent-address': 'permanent_address',
  'emf-temp-address': 'temporary_address',
  'emf-mgmt-unit': 'management_unit',
  'emf-dept': 'department',
  'emf-position': 'position',
  'emf-branch': 'branch',
  'emf-bhxh': 'social_insurance_code',
};

/** Catalog HRM → khối UI (popup). */
const HRM_CATALOG_TO_BLOCK: Record<string, string> = {
  hrm_employee_basic_fields: 'work',
  hrm_employee_personal_fields: 'personal',
  hrm_employee_contact_fields: 'contact',
  hrm_employee_emergency_fields: 'contact',
  hrm_employee_address_fields: 'address',
  hrm_employee_insurance_fields: 'insurance',
  hrm_employee_work_fields: 'work',
  hrm_employee_finance_fields: 'work',
};

export function resolveHrmFieldCode(uiFieldCode: string): string {
  return PRESET_FIELD_TO_HRM_CODE[uiFieldCode] ?? uiFieldCode;
}

export function resolveHrmCatalogKey(blockCode: string, fieldCode: string): HrmEmployeeCatalogKey {
  if (blockCode === 'work') return 'hrm_employee_basic_fields';
  if (blockCode === 'personal') {
    if (fieldCode === 'emf-emp-name' || fieldCode === 'full_name') {
      return 'hrm_employee_basic_fields';
    }
    return 'hrm_employee_personal_fields';
  }
  if (blockCode === 'contact') {
    if (
      fieldCode.startsWith('emf-emergency') ||
      fieldCode.startsWith('emergency_contact')
    ) {
      return 'hrm_employee_emergency_fields';
    }
    return 'hrm_employee_contact_fields';
  }
  if (blockCode === 'address') return 'hrm_employee_address_fields';
  if (blockCode === 'insurance') return 'hrm_employee_insurance_fields';
  return 'hrm_employee_finance_fields';
}

export function parseCatalogUnitToDataType(unit: string | null): {
  dataType: GroupHrCatalogFieldDto['dataType'];
  selectConfig: string;
} {
  const raw = (unit ?? 'text').trim();
  if (raw.startsWith('select:')) {
    const opts = raw.slice('select:'.length).split('|').map((x) => x.trim()).filter(Boolean);
    return { dataType: 'select', selectConfig: opts.join(', ') };
  }
  if (raw === 'number' || raw === 'phone' || raw === 'email' || raw === 'date') {
    return { dataType: raw, selectConfig: '' };
  }
  return { dataType: 'text', selectConfig: '' };
}

function catalogItemToFieldDto(
  catalogKey: string,
  item: { code: string; label: string; unit: string | null; status: string },
): GroupHrCatalogFieldDto | null {
  if (item.status !== 'active') return null;
  const blockCode = HRM_CATALOG_TO_BLOCK[catalogKey] ?? 'work';
  const parsed = parseCatalogUnitToDataType(item.unit);
  return {
    id: `ghr-${item.code}`,
    fieldCode: item.code,
    labelVi: item.label,
    dataType: parsed.dataType,
    blockCode,
    visible: true,
    selectConfig: parsed.selectConfig,
    hrmCatalogKey: (HRM_EMPLOYEE_CATALOG_KEYS.includes(catalogKey as HrmEmployeeCatalogKey)
      ? catalogKey
      : 'hrm_employee_finance_fields') as HrmEmployeeCatalogKey,
  };
}

export async function fetchGroupHrCatalogFieldDefs(
  tenantId?: string | null,
  companyIdHint?: string | null,
): Promise<GroupHrCatalogFieldDto[]> {
  const scope =
    companyIdHint != null && companyIdHint.trim()
      ? resolveIdentityScope(tenantId ?? null, companyIdHint)
      : resolveGroupHrHrmCatalogScope(tenantId);
  const headers: Record<string, string> = {
    'x-tenant-id': scope.tenantId,
    'x-company-id': scope.companyId,
  };
  const internalApiKey = import.meta.env.VITE_INTERNAL_API_KEY?.trim();
  if (internalApiKey) headers['x-internal-api-key'] = internalApiKey;

  const url = '/api/hrm/settings-catalogs';
  const startedAt = logApiStart('hrm.settings-catalogs', 'GET', url);
  let res: Response;
  try {
    res = await fetch(url, { method: 'GET', headers });
  } catch (error) {
    logApiFailure('hrm.settings-catalogs', 'GET', url, startedAt, error);
    throw new Error('Không kết nối được HRM API (cổng 28001). Chạy pnpm dev:hrm-api.');
  }
  const json = await res.json().catch(() => null);
  if (!res.ok) {
    const err = new Error(formatHttpError(res, json, 'Không tải được settings-catalogs từ HRM'));
    logApiFailure('hrm.settings-catalogs', 'GET', url, startedAt, err, res.status);
    throw err;
  }
  logApiSuccess('hrm.settings-catalogs', 'GET', url, startedAt, res.status);
  const catalogs = (json?.data?.catalogs ?? []) as Array<{
    catalogKey: string;
    effectiveItems?: Array<{ code: string; label: string; unit: string | null; status: string }>;
  }>;

  const merged: GroupHrCatalogFieldDto[] = [];
  for (const c of catalogs) {
    const key = (c.catalogKey ?? '').toLowerCase();
    if (!HRM_EMPLOYEE_CATALOG_KEYS.includes(key as HrmEmployeeCatalogKey)) continue;
    for (const item of c.effectiveItems ?? []) {
      const row = catalogItemToFieldDto(key, item);
      if (row) merged.push(row);
    }
  }
  return Array.from(new Map(merged.map((x) => [x.fieldCode, x])).values());
}

export async function syncGroupHrFieldDefsToHrm(
  defs: GroupHrCatalogFieldDto[],
  tenantId?: string | null,
  companyIdHint?: string | null,
  onProgress?: (progress: GroupHrSyncProgress) => void,
): Promise<void> {
  const scope =
    companyIdHint != null && companyIdHint.trim()
      ? resolveIdentityScope(tenantId ?? null, companyIdHint)
      : resolveGroupHrHrmCatalogScope(tenantId);
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-tenant-id': scope.tenantId,
    'x-company-id': scope.companyId,
    'x-catalog-write-mode': 'immediate',
  };
  const internalApiKey = import.meta.env.VITE_INTERNAL_API_KEY?.trim();
  if (internalApiKey) headers['x-internal-api-key'] = internalApiKey;
  const devUser = import.meta.env.VITE_DEV_USER_ID?.trim();
  if (devUser) headers['x-user-id'] = devUser;

  const buckets: Record<string, Array<{ code: string; label: string; unit: string; status: 'active' }>> =
    {};
  for (const key of HRM_EMPLOYEE_CATALOG_KEYS) {
    buckets[key] = [];
  }

  for (const def of defs.filter((x) => x.visible)) {
    const catalogKey =
      def.hrmCatalogKey ?? resolveHrmCatalogKey(def.blockCode, def.fieldCode);
    const unit =
      def.dataType === 'select'
        ? `select:${(def.selectConfig ?? '')
            .split(',')
            .map((x) => x.trim())
            .filter(Boolean)
            .join('|')}`
        : def.dataType;
    buckets[catalogKey].push({
      code: resolveHrmFieldCode(def.fieldCode),
      label: def.labelVi.trim(),
      unit,
      status: 'active',
    });
  }

  const entries = Object.entries(buckets).filter(([, items]) => items.length > 0);
  const total = entries.length;
  let completed = 0;

  const postBucket = async (catalogKey: string, items: Array<{ code: string; label: string; unit: string; status: 'active' }>) => {
    const url = `/api/hrm/settings-catalogs/${encodeURIComponent(catalogKey)}/extension-items`;
    const startedAt = logApiStart('hrm.settings-catalogs', 'POST', url);
    let res: Response;
    try {
      res = await fetch(url, { method: 'POST', headers, body: JSON.stringify({ items }) });
    } catch (error) {
      logApiFailure('hrm.settings-catalogs', 'POST', url, startedAt, error);
      throw new Error(
        `Không kết nối HRM khi đồng bộ ${catalogKey}. Chạy \`pnpm dev:hrm-api\` (cổng 28001); portal proxy /api/hrm → HRM.`,
      );
    }
    const body = await res.json().catch(() => null);
    if (!res.ok) {
      const err = new Error(formatHttpError(res, body, `Không thể đồng bộ danh mục ${catalogKey}`));
      logApiFailure('hrm.settings-catalogs', 'POST', url, startedAt, err, res.status);
      throw err;
    }
    logApiSuccess('hrm.settings-catalogs', 'POST', url, startedAt, res.status);
    completed += 1;
    onProgress?.({ completed, total, catalogKey });
  };

  await Promise.all(entries.map(([catalogKey, items]) => postBucket(catalogKey, items)));
}
