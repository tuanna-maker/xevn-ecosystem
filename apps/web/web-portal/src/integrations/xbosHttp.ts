import { buildApiAuthHeaders, handleUnauthorizedResponse } from './authSession';
import { resolveXbosApiCompanyIdForPath } from './commandCenterScope';
import { formatHttpError, logApiFailure, logApiStart, logApiSuccess } from '../utils/apiLogger';

export type XbosRequestInit = Omit<RequestInit, 'headers'> & {
  headers?: Record<string, string>;
  tenantId?: string | null;
  companyId?: string | null;
  scope?: string;
  /** HTTP statuses that skip console.error (optional KPI/widgets). */
  suppressLogStatuses?: number[];
};

async function buildHeaders(path: string, init?: XbosRequestInit): Promise<Record<string, string>> {
  const base = buildApiAuthHeaders();
  if (init?.tenantId) base['x-tenant-id'] = init.tenantId;
  const companyId =
    init?.companyId != null && String(init.companyId).trim()
      ? resolveXbosApiCompanyIdForPath(path, init.tenantId, init.companyId)
      : undefined;
  if (companyId) base['x-company-id'] = companyId;
  return { ...base, ...(init?.headers ?? {}) };
}

export async function xbosFetch<T>(
  path: string,
  init: XbosRequestInit = {},
): Promise<T> {
  const scope = init.scope ?? 'xbos-api';
  const method = (init.method ?? 'GET').toUpperCase();
  const url = path.startsWith('http') ? path : path.startsWith('/api/xbos') ? path : `/api/xbos${path.startsWith('/') ? path : `/${path}`}`;
  const startedAt = logApiStart(scope, method, url);

  try {
    const res = await fetch(url, {
      ...init,
      method,
      headers: await buildHeaders(url, init),
    });
    const json = await res.json().catch(() => null);
    if (!res.ok) {
      handleUnauthorizedResponse(res.status);
      const err = new Error(formatHttpError(res, json, `${scope} failed`));
      const suppress = init.suppressLogStatuses?.includes(res.status);
      if (!suppress) {
        logApiFailure(scope, method, url, startedAt, err, res.status);
      } else if (import.meta.env.DEV) {
        console.debug(`[${scope}] optional ${method} ${url} (HTTP ${res.status})`);
      }
      throw err;
    }
    logApiSuccess(scope, method, url, startedAt, res.status);
    return json as T;
  } catch (error) {
    if (error instanceof Error && error.message.includes(`${scope} failed`)) {
      throw error;
    }
    const wrapped =
      error instanceof TypeError && error.message.includes('fetch')
        ? new Error(
            `${scope}: Không kết nối được XBOS API. Chạy \`pnpm dev:xbos-api\` (cổng 28002) và kiểm tra VITE_DEV_PROXY_XBOS_API.`,
          )
        : error;
    logApiFailure(scope, method, url, startedAt, wrapped);
    throw wrapped;
  }
}

export async function xbosGetData<T>(path: string, init: XbosRequestInit = {}): Promise<T> {
  const envelope = await xbosFetch<{ success?: boolean; data?: T }>(path, { ...init, method: 'GET' });
  if (envelope && typeof envelope === 'object' && 'data' in envelope) {
    return envelope.data as T;
  }
  return envelope as T;
}
