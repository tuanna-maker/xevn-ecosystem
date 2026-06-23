import { safeRandomUuid } from '../lib/safeRandomUuid';

const XBOS_API_ORIGIN = import.meta.env.VITE_XBOS_API_ORIGIN ?? 'http://localhost:3002';
const SERVICE_JWT_TOKEN = import.meta.env.VITE_SERVICE_JWT_TOKEN;
const INTERNAL_API_KEY = import.meta.env.DEV ? import.meta.env.VITE_INTERNAL_API_KEY ?? 'xevn-dev-internal-key' : undefined;
const REQUEST_TIMEOUT_MS = 10_000;

type XbosEnvelope<T> = {
  success: boolean;
  code: string;
  message: string;
  data: T;
};

export class XbosApiError extends Error {
  status: number;
  code: string;
  causeType: 'network' | 'timeout' | 'auth' | 'server' | 'unknown';

  constructor(message: string, options: { status: number; code: string; causeType: XbosApiError['causeType'] }) {
    super(message);
    this.name = 'XbosApiError';
    this.status = options.status;
    this.code = options.code;
    this.causeType = options.causeType;
  }
}

export type XbosCatalog = {
  key: string;
  name: string;
  items: Array<{ code: string; label: string }>;
};

function headers() {
  const baseHeaders: Record<string, string> = {
    'x-request-id': safeRandomUuid(),
  };
  if (SERVICE_JWT_TOKEN) {
    baseHeaders.Authorization = `Bearer ${SERVICE_JWT_TOKEN}`;
  } else if (INTERNAL_API_KEY) {
    // Dev-only fallback when no JWT token is provisioned in local environment.
    baseHeaders['x-internal-api-key'] = INTERNAL_API_KEY;
  }
  return baseHeaders;
}

function createTimeoutSignal(timeoutMs: number) {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);
  return { signal: controller.signal, cleanup: () => window.clearTimeout(timeoutId) };
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

    if (!res.ok) {
      const message = `Request failed (${res.status})`;
      throw new XbosApiError(message, {
        status: res.status,
        code: `HTTP_${res.status}`,
        causeType: res.status === 401 || res.status === 403 ? 'auth' : 'server',
      });
    }

    const body = (await res.json()) as XbosEnvelope<T>;
    if (!body.success) {
      throw new XbosApiError(body.message || 'XBOS API rejected request', {
        status: 400,
        code: body.code || 'XBOS_API_ERROR',
        causeType: 'server',
      });
    }
    return body.data;
  } catch (error) {
    if (error instanceof XbosApiError) throw error;
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new XbosApiError('XBOS API timeout', { status: 408, code: 'TIMEOUT', causeType: 'timeout' });
    }
    throw new XbosApiError(
      error instanceof Error ? error.message : 'Unknown XBOS API error',
      { status: 0, code: 'NETWORK_ERROR', causeType: 'network' },
    );
  } finally {
    cleanup();
  }
}

export async function bootstrapXbosCatalogs() {
  return xbosRequest<{ seeded_catalogs: number }>('/api/xbos/config-sync/bootstrap-xevn', {
    method: 'POST',
  });
}

export async function listXbosCatalogsForTarget(target: 'xbos' | 'hrm' = 'xbos') {
  const data = await xbosRequest<{ data: XbosCatalog[] }>(`/api/xbos/config-sync/catalogs?target=${target}`, {
    method: 'GET',
  });
  return data.data;
}

export async function syncXbosCatalogs(target: 'xbos' | 'hrm' = 'xbos') {
  await bootstrapXbosCatalogs();
  return listXbosCatalogsForTarget(target);
}
