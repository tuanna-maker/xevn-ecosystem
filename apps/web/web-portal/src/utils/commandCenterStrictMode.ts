import { allowMockFallback } from './mockPolicy';

/**
 * BR-INBOX-01 — when mock fallback is off, never surface command-center-mock tasks.
 */
export function resolveCommandCenterInboxTasks<T>(
  source: DataSourceKind,
  apiTasks: T[],
  mockTasks: T[],
): T[] {
  if (source === 'api' && apiTasks.length > 0) {
    return apiTasks;
  }
  if (allowMockFallback() && source === 'mock') {
    return mockTasks;
  }
  return apiTasks;
}

export type DataSourceKind = 'loading' | 'api' | 'mock';

export type StrictModeBannerState = {
  loadFailed: boolean;
  usingMockFallback: boolean;
  emptyStrictHint: boolean;
};

/**
 * UC-CC-P0-09 — inbox/tasks rail: no mock rows unless VITE_ALLOW_MOCK_FALLBACK=true.
 */
export function resolveInboxStrictBanner(
  source: DataSourceKind,
  loadFailed: boolean,
  rowCount: number,
): StrictModeBannerState {
  const mockAllowed = allowMockFallback();
  if (source === 'loading') {
    return { loadFailed: false, usingMockFallback: false, emptyStrictHint: false };
  }
  return {
    loadFailed: loadFailed && !mockAllowed,
    usingMockFallback: source === 'mock' && mockAllowed && rowCount > 0,
    emptyStrictHint: source === 'api' && !mockAllowed && rowCount === 0 && !loadFailed,
  };
}

/**
 * UC-CC-P0-09 — portal alerts: mock only when dev flag set; banner on API miss in strict mode.
 */
export function resolveAlertsStrictBanner(
  source: DataSourceKind,
  loadFailed: boolean,
  rowCount: number,
): StrictModeBannerState {
  const mockAllowed = allowMockFallback();
  if (source === 'loading') {
    return { loadFailed: false, usingMockFallback: false, emptyStrictHint: false };
  }
  return {
    loadFailed: (loadFailed || (source === 'api' && rowCount === 0)) && !mockAllowed,
    usingMockFallback: source === 'mock' && mockAllowed && rowCount > 0,
    emptyStrictHint: false,
  };
}

export const INBOX_STRICT_EMPTY_HINT =
  'Inbox trống — chạy pnpm seed:workflow:inbox (cần xbos-api @ 28002).';

export const INBOX_STRICT_LOAD_FAILED =
  'Không tải được hộp thư từ workflow-engine — kiểm tra XBOS API (28002) và đăng nhập.';

export const ALERTS_STRICT_EMPTY_HINT =
  'Không có cảnh báo từ workflow, catalog-governance hoặc kpi-engine/portal-alerts.';

/**
 * UC-XBOS-CC-06 — workflow definitions list/canvas: no local graph seed unless mock flag.
 */
export function resolveWorkflowDefinitionsStrictBanner(
  source: DataSourceKind,
  loadFailed: boolean,
  rowCount: number,
): StrictModeBannerState {
  const mockAllowed = allowMockFallback();
  if (source === 'loading') {
    return { loadFailed: false, usingMockFallback: false, emptyStrictHint: false };
  }
  return {
    loadFailed: loadFailed && !mockAllowed,
    usingMockFallback: source === 'mock' && mockAllowed && rowCount > 0,
    emptyStrictHint: source === 'api' && !mockAllowed && rowCount === 0 && !loadFailed,
  };
}

export const WORKFLOW_DEFINITIONS_STRICT_EMPTY_HINT =
  'Chưa có quy trình trên workflow-engine — seed DB (pnpm seed:workflow:inbox) hoặc tạo quy trình mới.';

export const WORKFLOW_DEFINITIONS_STRICT_LOAD_FAILED =
  'Không tải được danh mục quy trình từ workflow-engine — kiểm tra XBOS API (28002) và đăng nhập.';
