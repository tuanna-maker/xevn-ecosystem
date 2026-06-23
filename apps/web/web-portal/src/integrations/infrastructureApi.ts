import { MASTER_TENANT_ID, MEMBER_DEFAULT_COMPANY_ID } from '../constants/tenant';
import type { InfrastructureFoundationCategory } from '../data/infrastructure-foundation-catalog';
import { INITIAL_INFRASTRUCTURE_FOUNDATION_CATEGORIES } from '../data/infrastructure-foundation-catalog';
import { allowMockFallback } from '../utils/mockPolicy';
import { xbosGetData, xbosFetch } from './xbosHttp';

export type InfrastructureSettingsPayload = {
  foundationCategories?: unknown[];
  sites?: unknown[];
  blockTitleOverridesByEntity?: Record<string, unknown>;
  customBlocksByEntity?: Record<string, unknown>;
  customFieldDefsByEntity?: Record<string, unknown>;
};

export type InfrastructureSummaryPayload = {
  tenantId: string;
  companyId: string;
  stats: {
    foundationCategories: number;
    sites: number;
    customFields: number;
  };
  updatedAt: string;
};

export type InfrastructureCatalogLoadSource = 'api' | 'mock' | 'empty';

/** UC-XBOS-CC-07 — resolve foundation catalog index after API load (strict mock policy). */
export function resolveInfrastructureFoundationLoad(
  apiRows: InfrastructureFoundationCategory[],
  allowMock: boolean,
  mockRows: InfrastructureFoundationCategory[],
  apiFailed = false,
): {
  categories: InfrastructureFoundationCategory[];
  source: InfrastructureCatalogLoadSource;
  loadFailed: boolean;
} {
  if (apiRows.length > 0) {
    return { categories: apiRows, source: 'api', loadFailed: false };
  }
  if (allowMock) {
    return {
      categories: mockRows.map((r) => ({ ...r })),
      source: 'mock',
      loadFailed: apiFailed,
    };
  }
  return { categories: [], source: 'empty', loadFailed: apiFailed };
}

/** M-CC-04 — CC page loader; dev seed internal (REC-EXEC-GREP-W2-03). */
export function loadInfrastructureFoundationFromApi(
  apiRows: InfrastructureFoundationCategory[],
  apiFailed = false,
): {
  categories: InfrastructureFoundationCategory[];
  source: InfrastructureCatalogLoadSource;
  loadFailed: boolean;
} {
  return resolveInfrastructureFoundationLoad(
    apiRows,
    allowMockFallback(),
    INITIAL_INFRASTRUCTURE_FOUNDATION_CATEGORIES,
    apiFailed,
  );
}

export const INFRASTRUCTURE_CATALOG_SEED_CMD = 'pnpm seed:infrastructure:settings';

export function infrastructureCatalogErrorMessage(apiFailed: boolean): string | null {
  if (!apiFailed) return null;
  return `Không tải danh mục hạ tầng từ /api/xbos/infrastructure/settings. Kiểm tra xbos-api (:28002) và đăng nhập JWT scope main.`;
}

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

export async function fetchInfrastructureSummary(
  tenantId = import.meta.env.VITE_DEFAULT_TENANT_ID ?? MASTER_TENANT_ID,
  companyId = MEMBER_DEFAULT_COMPANY_ID,
): Promise<InfrastructureSummaryPayload> {
  const search = new URLSearchParams({ tenantId, companyId });
  return xbosGetData<InfrastructureSummaryPayload>(
    `/infrastructure/summary?${search.toString()}`,
    {
      scope: 'infrastructure.summary.get',
      tenantId,
      companyId,
    },
  );
}

