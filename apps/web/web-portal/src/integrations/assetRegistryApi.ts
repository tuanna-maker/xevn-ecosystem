const XBOS_API_ORIGIN = import.meta.env.VITE_XBOS_API_ORIGIN ?? 'http://localhost:3002';
const SERVICE_JWT_TOKEN = import.meta.env.VITE_SERVICE_JWT_TOKEN;
const INTERNAL_API_KEY = import.meta.env.DEV
  ? import.meta.env.VITE_INTERNAL_API_KEY ?? 'xevn-dev-internal-key'
  : undefined;
const REQUEST_TIMEOUT_MS = 10_000;

type XbosEnvelope<T> = {
  success: boolean;
  code: string;
  message: string;
  data?: T;
  details?: unknown;
};

type AssetRegistryListResponseRaw = {
  data?: unknown[];
  total?: number;
  page?: number;
  limit?: number;
};

export type AssetRegistryAssetStatus = 'active' | 'inactive';

export type AssetRegistryAsset = {
  assetId: string;
  tenantId: string;
  companyId: string;
  assetCode: string;
  assetName: string;
  assetType: string;
  status: AssetRegistryAssetStatus;
  ownerModule: string;
  metadata?: Record<string, unknown> | null;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateAssetRegistryInput = {
  tenantId: string;
  companyId: string;
  assetCode: string;
  assetName: string;
  assetType: string;
  ownerModule: string;
  status?: AssetRegistryAssetStatus;
  metadata?: Record<string, unknown>;
};

export type UpdateAssetRegistryInput = Partial<CreateAssetRegistryInput>;
export type UiModuleCode = 'hrm' | 'fleet' | 'accounting' | 'hrm-admin' | 'operations' | 'finance-tax';
export type RegistryScope = {
  tenantId: string;
  companyId: string;
};

export type RegistryRequestContext = {
  moduleCode: UiModuleCode;
  scope: RegistryScope;
};

export class AssetRegistryApiError extends Error {
  status: number;
  code: string;
  causeType: 'network' | 'timeout' | 'auth' | 'server' | 'unknown';
  details?: unknown;

  constructor(
    message: string,
    options: {
      status: number;
      code: string;
      causeType: AssetRegistryApiError['causeType'];
      details?: unknown;
    }
  ) {
    super(message);
    this.name = 'AssetRegistryApiError';
    this.status = options.status;
    this.code = options.code;
    this.causeType = options.causeType;
    this.details = options.details;
  }
}

function headers() {
  const baseHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-request-id': crypto.randomUUID(),
  };
  if (SERVICE_JWT_TOKEN) {
    baseHeaders.Authorization = `Bearer ${SERVICE_JWT_TOKEN}`;
  } else if (INTERNAL_API_KEY) {
    baseHeaders['x-internal-api-key'] = INTERNAL_API_KEY;
  }
  return baseHeaders;
}

const moduleAliasMap: Record<string, UiModuleCode> = {
  hrm: 'hrm-admin',
  fleet: 'operations',
  accounting: 'finance-tax',
};

export function toCanonicalModuleAlias(moduleCode: string): UiModuleCode {
  return moduleAliasMap[moduleCode] ?? (moduleCode as UiModuleCode);
}

function normalizeScope(scope: RegistryScope): RegistryScope {
  return {
    tenantId: scope.tenantId.trim(),
    companyId: scope.companyId.trim(),
  };
}

function assertRegistryContext(context: RegistryRequestContext) {
  const scope = normalizeScope(context.scope);
  if (!scope.tenantId || !scope.companyId) {
    throw new AssetRegistryApiError('Thiếu tenantId hoặc companyId khi gọi Asset Registry', {
      status: 400,
      code: 'ASSET_REGISTRY_SCOPE_REQUIRED',
      causeType: 'unknown',
    });
  }
  const moduleCode = toCanonicalModuleAlias(context.moduleCode);
  if (!moduleCode) {
    throw new AssetRegistryApiError('Thiếu mã module khi gọi Asset Registry', {
      status: 400,
      code: 'ASSET_REGISTRY_MODULE_REQUIRED',
      causeType: 'unknown',
    });
  }
  return { moduleCode, scope };
}

function buildScopedParams(scope: RegistryScope) {
  const query = new URLSearchParams();
  query.set('tenantId', scope.tenantId);
  query.set('companyId', scope.companyId);
  return query.toString();
}

function mapAsset(raw: unknown): AssetRegistryAsset {
  const record = typeof raw === 'object' && raw !== null ? (raw as Record<string, unknown>) : {};
  const assetId = String(record.assetId ?? record.asset_id ?? '');
  const tenantId = String(record.tenantId ?? record.tenant_id ?? '');
  const companyId = String(record.companyId ?? record.company_id ?? '');
  const assetCode = String(record.assetCode ?? record.asset_code ?? '');
  const assetName = String(record.assetName ?? record.asset_name ?? '');
  const assetType = String(record.assetType ?? record.asset_type ?? '');
  const ownerModule = String(record.ownerModule ?? record.owner_module ?? '');
  const status = (record.status === 'inactive' ? 'inactive' : 'active') as AssetRegistryAssetStatus;
  return {
    assetId,
    tenantId,
    companyId,
    assetCode,
    assetName,
    assetType,
    ownerModule,
    status,
    metadata: (record.metadata as Record<string, unknown> | null | undefined) ?? null,
    createdAt: typeof record.createdAt === 'string' ? record.createdAt : typeof record.created_at === 'string' ? record.created_at : undefined,
    updatedAt: typeof record.updatedAt === 'string' ? record.updatedAt : typeof record.updated_at === 'string' ? record.updated_at : undefined,
  };
}

function createTimeoutSignal(timeoutMs: number) {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);
  return {
    signal: controller.signal,
    cleanup: () => window.clearTimeout(timeoutId),
  };
}

async function xbosRequest<T>(endpoint: string, init: RequestInit): Promise<T> {
  const { signal, cleanup } = createTimeoutSignal(REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(`${XBOS_API_ORIGIN}${endpoint}`, {
      ...init,
      signal,
      headers: {
        ...headers(),
        ...(init.headers ?? {}),
      },
    });

    const maybeBody = (await res.json().catch(() => null)) as XbosEnvelope<T> | null;
    if (!res.ok) {
      throw new AssetRegistryApiError(
        maybeBody?.message ?? `Yêu cầu thất bại (${res.status})`,
        {
          status: res.status,
          code: maybeBody?.code ?? `HTTP_${res.status}`,
          causeType: res.status === 401 || res.status === 403 ? 'auth' : 'server',
          details: maybeBody?.details,
        }
      );
    }

    if (!maybeBody || !maybeBody.success || maybeBody.data === undefined) {
      throw new AssetRegistryApiError(
        maybeBody?.message ?? 'Dịch vụ Asset Registry trả về dữ liệu không hợp lệ',
        {
          status: res.status,
          code: maybeBody?.code ?? 'ASSET_REGISTRY_INVALID_ENVELOPE',
          causeType: 'server',
          details: maybeBody?.details,
        }
      );
    }

    return maybeBody.data;
  } catch (error) {
    if (error instanceof AssetRegistryApiError) {
      throw error;
    }
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new AssetRegistryApiError('Asset Registry timeout', {
        status: 408,
        code: 'TIMEOUT',
        causeType: 'timeout',
      });
    }
    throw new AssetRegistryApiError(
      error instanceof Error ? error.message : 'Lỗi kết nối Asset Registry',
      {
        status: 0,
        code: 'NETWORK_ERROR',
        causeType: 'network',
      }
    );
  } finally {
    cleanup();
  }
}

export async function listRegistryAssets(context: RegistryRequestContext): Promise<AssetRegistryAsset[]> {
  const normalized = assertRegistryContext(context);
  const data = await xbosRequest<AssetRegistryListResponseRaw>(
    `/api/xbos/assets?${buildScopedParams(normalized.scope)}`,
    {
    method: 'GET',
    headers: {
      'x-module-code': normalized.moduleCode,
      'x-owner-module': normalized.moduleCode,
    },
  }
  );
  const rows = Array.isArray(data?.data) ? data.data : [];
  return rows.map(mapAsset);
}

export async function createRegistryAsset(
  payload: CreateAssetRegistryInput,
  context: RegistryRequestContext
): Promise<AssetRegistryAsset> {
  const normalized = assertRegistryContext(context);
  const scoped = normalizeScope(context.scope);
  const bodyPayload = {
    tenantId: scoped.tenantId,
    companyId: scoped.companyId,
    assetCode: payload.assetCode,
    assetName: payload.assetName,
    assetType: payload.assetType,
    ownerModule: toCanonicalModuleAlias(payload.ownerModule),
    status: payload.status,
    metadata: payload.metadata,
  };
  const data = await xbosRequest<unknown>('/api/xbos/assets', {
    method: 'POST',
    body: JSON.stringify(bodyPayload),
    headers: {
      'x-module-code': normalized.moduleCode,
      'x-owner-module': normalized.moduleCode,
    },
  });
  return mapAsset(data);
}

export async function getRegistryAsset(assetId: string, context: RegistryRequestContext): Promise<AssetRegistryAsset> {
  const normalized = assertRegistryContext(context);
  const data = await xbosRequest<unknown>(
    `/api/xbos/assets/${assetId}?${buildScopedParams(normalized.scope)}`,
    {
    method: 'GET',
    headers: {
      'x-module-code': normalized.moduleCode,
      'x-owner-module': normalized.moduleCode,
    },
  }
  );
  return mapAsset(data);
}

export async function updateRegistryAsset(
  assetId: string,
  payload: UpdateAssetRegistryInput,
  context: RegistryRequestContext
): Promise<AssetRegistryAsset> {
  const normalized = assertRegistryContext(context);
  const bodyPayload = {
    assetCode: payload.assetCode,
    assetName: payload.assetName,
    assetType: payload.assetType,
    ownerModule: payload.ownerModule ? toCanonicalModuleAlias(payload.ownerModule) : undefined,
    status: payload.status,
    metadata: payload.metadata,
  };
  const data = await xbosRequest<unknown>(
    `/api/xbos/assets/${assetId}?${buildScopedParams(normalized.scope)}`,
    {
    method: 'PATCH',
    body: JSON.stringify(bodyPayload),
    headers: {
      'x-module-code': normalized.moduleCode,
      'x-owner-module': normalized.moduleCode,
    },
  }
  );
  return mapAsset(data);
}
