import type { ApiEnvelopeError, ApiEnvelopeSuccess, HrmAuthConfig } from './types';

const DEFAULT_TIMEOUT_MS = 30_000;

export type HrmRequestResult<T> =
  | { ok: true; data: T; code: string; requestId: string }
  | { ok: false; code: string; message: string; requestId: string; httpStatus?: number };

function stripTrailingSlash(url: string): string {
  return url.replace(/\/+$/, '');
}

function randomRequestId(): string {
  return `mob-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function getDefaultBaseUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_HRM_API_BASE_URL;
  if (fromEnv && fromEnv.trim()) return stripTrailingSlash(fromEnv.trim());
  return 'http://localhost:3001';
}

export async function hrmRequest<T>(
  auth: HrmAuthConfig,
  path: string,
  init: RequestInit & { timeoutMs?: number } = {},
): Promise<HrmRequestResult<T>> {
  const requestId = randomRequestId();
  const timeoutMs = init.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const { timeoutMs: _omit, ...fetchInit } = init;

  const url = `${stripTrailingSlash(auth.baseUrl)}/api/hrm${path.startsWith('/') ? path : `/${path}`}`;
  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'x-request-id': requestId,
    'x-tenant-id': auth.tenantId,
    'x-company-id': auth.companyId,
    ...(fetchInit.headers as Record<string, string> | undefined),
  };

  if (auth.accessToken) {
    headers.Authorization = auth.accessToken.startsWith('Bearer ')
      ? auth.accessToken
      : `Bearer ${auth.accessToken}`;
  }
  if (auth.internalApiKey) {
    headers['x-internal-api-key'] = auth.internalApiKey;
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
      code: aborted ? 'HRM-MOB-ERR-NETWORK' : 'HRM-MOB-ERR-NETWORK',
      message: aborted ? 'Hết thời gian chờ máy chủ' : e instanceof Error ? e.message : 'Lỗi mạng',
      requestId,
    };
  }
}
