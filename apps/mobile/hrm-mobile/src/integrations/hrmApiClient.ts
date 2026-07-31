/**
 * @CODE-MEMORY-CHANGE
 * WorkItem: D-MOB-REMOVE-NIPIO-01 · 2026-07-28
 * Change: getDefaultBaseUrl fallback qua pilotApiBase = VPS/dev HRM_BE_PORT:3001; không hostname DNS tạm / không portal :8088.
 * must_keep: EXPO_PUBLIC trim ưu tiên; __DEV__ http://localhost:3001.
 *
 * @CODE-MEMORY-CHANGE
 * WorkItem: D-HDSD-MOB-PILOT-CLIENT-NET-01 · 2026-07-31
 * Change: normalizeHrmBaseUrl + QA logcat trace; release cleartext via network_security_config (pilot HTTP :3001).
 * must_keep: resolveHrmCompanyHeaderId / resolveHrmWriteHeaderId split; EXPO_PUBLIC ưu tiên.
 */
import { isQaDeepLinkLoginEnabled } from '../config/qaLogin';
import { RELEASE_PILOT_HRM_API_BASE_URL } from '../config/pilotApiBase';
import { isUuid } from '../utils/uuid';
import { isHrmWireBlockedSlug } from './companyWireScope';
import { normalizeHrmBaseUrl } from './normalizeHrmBaseUrl';
import type { ApiEnvelopeError, ApiEnvelopeSuccess, HrmAuthConfig } from './types';

const DEFAULT_TIMEOUT_MS = 30_000;

export type HrmRequestResult<T> =
  | { ok: true; data: T; code: string; requestId: string }
  | { ok: false; code: string; message: string; requestId: string; httpStatus?: number };

function stripTrailingSlash(url: string): string {
  return url.replace(/\/+$/, '');
}

/** Resolve wire origin for hrmRequest — never pass malformed deep-link base to fetch. */
export function resolveHrmApiBaseUrl(auth: Pick<HrmAuthConfig, 'baseUrl'>): string {
  const devFallback =
    typeof __DEV__ !== 'undefined' && __DEV__ ? 'http://localhost:3001' : RELEASE_PILOT_HRM_API_BASE_URL;
  const fromEnv = process.env.EXPO_PUBLIC_HRM_API_BASE_URL?.trim();
  const envFallback = fromEnv ? stripTrailingSlash(fromEnv) : devFallback;
  return normalizeHrmBaseUrl(auth.baseUrl, envFallback);
}

function randomRequestId(): string {
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return globalThis.crypto.randomUUID();
  }
  return `mob-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Value for `x-company-id` on HRM **read** calls (GET).
 * Portal/UAT parity: membership scope slug (`holding`, …) when valid; legal UUID when slug is blocked (`main`).
 */
export function resolveHrmCompanyHeaderId(companyUuid?: string, companySlugOrId?: string): string {
  const slug = companySlugOrId?.trim() ?? '';
  if (slug && !isHrmWireBlockedSlug(slug) && !isUuid(slug)) return slug;
  const uuid = companyUuid?.trim() ?? '';
  if (uuid && isUuid(uuid)) return uuid;
  if (slug && isUuid(slug)) return slug;
  if (slug && isHrmWireBlockedSlug(slug)) return '';
  return slug;
}

/**
 * Value for `x-company-id` on HRM **write** calls (POST/PATCH/PUT/DELETE).
 * BE scope guards require legal-entity UUID — never send rollup slug `holding` on mutate paths.
 */
export function resolveHrmWriteHeaderId(companyUuid?: string, companySlugOrId?: string): string {
  const uuid = companyUuid?.trim() ?? '';
  if (uuid && isUuid(uuid)) return uuid;
  return resolveHrmCompanyHeaderId(companyUuid, companySlugOrId);
}

export function isHrmWriteMethod(method?: string): boolean {
  const m = (method ?? 'GET').toUpperCase();
  return m === 'POST' || m === 'PATCH' || m === 'PUT' || m === 'DELETE';
}

export function getDefaultBaseUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_HRM_API_BASE_URL;
  if (fromEnv && fromEnv.trim()) return normalizeHrmBaseUrl(fromEnv);
  if (typeof __DEV__ !== 'undefined' && __DEV__) {
    return normalizeHrmBaseUrl('http://localhost:3001');
  }
  return normalizeHrmBaseUrl(RELEASE_PILOT_HRM_API_BASE_URL);
}

export async function hrmRequest<T>(
  auth: HrmAuthConfig,
  path: string,
  init: RequestInit & { timeoutMs?: number } = {},
): Promise<HrmRequestResult<T>> {
  const requestId = randomRequestId();
  const timeoutMs = init.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const { timeoutMs: _omit, ...fetchInit } = init;

  const base = resolveHrmApiBaseUrl(auth);
  const url = `${base}/api/hrm${path.startsWith('/') ? path : `/${path}`}`;
  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'x-request-id': requestId,
    ...(fetchInit.headers as Record<string, string> | undefined),
  };
  if (auth.tenantId?.trim()) headers['x-tenant-id'] = auth.tenantId.trim();
  const method = fetchInit.method ?? 'GET';
  const companyHeader = isHrmWriteMethod(method)
    ? resolveHrmWriteHeaderId(auth.companyUuid, auth.companyId)
    : resolveHrmCompanyHeaderId(auth.companyUuid, auth.companyId);
  if (companyHeader) headers['x-company-id'] = companyHeader;

  if (auth.accessToken) {
    headers.Authorization = auth.accessToken.startsWith('Bearer ')
      ? auth.accessToken
      : `Bearer ${auth.accessToken}`;
  }
  if (auth.internalApiKey) {
    headers['x-internal-api-key'] = auth.internalApiKey;
  }

  if (isQaDeepLinkLoginEnabled()) {
    const authPreview = headers.Authorization
      ? headers.Authorization.startsWith('Bearer ')
        ? 'Bearer …'
        : 'present'
      : 'missing';
    console.info(
      `[HRM-MOB] ${method} ${url} x-company-id=${companyHeader || '(empty)'} Authorization=${authPreview}`,
    );
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      ...fetchInit,
      headers,
      signal: controller.signal,
    });
    clearTimeout(timer);

    const text = await res.text();
    let body: unknown = null;
    try {
      body = text ? JSON.parse(text) : null;
    } catch {
      body = { raw: text };
    }

    const envelope = body as Partial<ApiEnvelopeSuccess<T>> & Partial<ApiEnvelopeError>;

    if (envelope && envelope.success === true) {
      return {
        ok: true,
        data: envelope.data as T,
        code: envelope.code ?? 'OK',
        requestId,
      };
    }

    if (envelope && envelope.success === false) {
      return {
        ok: false,
        code: envelope.code ?? 'HRM-ERR-UNKNOWN',
        message: envelope.message ?? 'Yêu cầu thất bại',
        requestId,
        httpStatus: res.status,
      };
    }

    if (!res.ok) {
      return {
        ok: false,
        code: 'HRM-ERR-UNKNOWN',
        message: typeof text === 'string' && text ? text.slice(0, 200) : `HTTP ${res.status}`,
        requestId,
        httpStatus: res.status,
      };
    }

    return {
      ok: true,
      data: (body ?? {}) as T,
      code: 'HRM-OK-HEALTH',
      requestId,
    };
  } catch (e) {
    clearTimeout(timer);
    const aborted = e instanceof Error && e.name === 'AbortError';
    return {
      ok: false,
      code: aborted ? 'HRM-MOB-ERR-TIMEOUT' : 'HRM-MOB-ERR-NETWORK',
      message: aborted ? 'Hết thời gian chờ máy chủ' : e instanceof Error ? e.message : 'Lỗi mạng',
      requestId,
    };
  }
}
