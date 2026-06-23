/**
 * Structured console logging for API calls (dev-friendly, no secrets).
 */

export type ApiLogLevel = 'info' | 'warn' | 'error';

export type ApiLogContext = {
  scope: string;
  method: string;
  url: string;
  status?: number;
  durationMs?: number;
  detail?: string;
};

function prefix(scope: string): string {
  return `[${scope}]`;
}

export function logApiStart(scope: string, method: string, url: string): number {
  if (import.meta.env.DEV) {
    console.info(`${prefix(scope)} → ${method} ${url}`);
  }
  return performance.now();
}

export function logApiSuccess(
  scope: string,
  method: string,
  url: string,
  startedAt: number,
  status: number,
  responseCode?: string,
) {
  if (import.meta.env.DEV) {
    const durationMs = Math.round(performance.now() - startedAt);
    const mutating = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method.toUpperCase());
    if (mutating) {
      const codePart = responseCode?.trim() ? ` code=${responseCode.trim()}` : '';
      console.info(
        `${prefix(scope)} [DB-WRITE OK] ${method} ${url}${codePart} (HTTP ${status}, ${durationMs}ms)`,
      );
      return;
    }
    console.info(`${prefix(scope)} ✓ ${method} ${url} (${status}, ${durationMs}ms)`);
  }
}

export function logApiFailure(
  scope: string,
  method: string,
  url: string,
  startedAt: number,
  error: unknown,
  status?: number,
) {
  const durationMs = Math.round(performance.now() - startedAt);
  const detail =
    error instanceof Error
      ? error.message
      : typeof error === 'string'
        ? error
        : 'Unknown error';
  const statusPart = status != null ? ` HTTP ${status}` : '';
  console.error(`${prefix(scope)} ✗ ${method} ${url}${statusPart} (${durationMs}ms): ${detail}`);
}

export function formatHttpError(
  res: Response,
  body: { message?: string; code?: string } | null,
  fallback: string,
): string {
  const msg = body?.message?.trim();
  if (msg) return `${fallback}: ${msg} (HTTP ${res.status})`;
  if (res.status === 500) {
    return `${fallback}: Lỗi máy chủ (HTTP 500). Kiểm tra xbos-api đang chạy cổng 28002 và DATABASE_URL_XBOS.`;
  }
  if (res.status === 401 || res.status === 403) {
    return `${fallback}: Không đủ quyền (HTTP ${res.status}). Kiểm tra VITE_INTERNAL_API_KEY / đăng nhập.`;
  }
  return `${fallback} (HTTP ${res.status} ${res.statusText})`;
}
