/**
 * BR-MOCK-01/02 — mock fallback only in dev when explicitly enabled.
 */

export function allowMockFallback(): boolean {
  return import.meta.env.DEV && import.meta.env.VITE_ALLOW_MOCK_FALLBACK === 'true';
}

export function resolveOnApiFailure<T>(mockRows: T[]): T[] {
  return allowMockFallback() ? mockRows : [];
}

export const API_LOAD_FAILED_MESSAGE =
  'Không tải được dữ liệu từ API. Kiểm tra XBOS/HRM API, proxy và đăng nhập.';

export const MOCK_FALLBACK_ACTIVE_MESSAGE =
  'Đang hiển thị dữ liệu mẫu (bật VITE_ALLOW_MOCK_FALLBACK=true trong .env).';

export const TENANT_SCOPE_FAILED_MESSAGE =
  'Không tải được phạm vi tenant. Kiểm tra xbos-api (cổng 28002) và VITE_INTERNAL_API_KEY.';

export const API_NOT_AVAILABLE_MESSAGE = 'Phân hệ này chưa có API — dữ liệu sẽ hiển thị khi backend sẵn sàng.';
