import type { PersonaRole } from '../data/command-center-types';
import {
  getCommandCenterMockKpiSeries,
  getCommandCenterMockPortalAlerts,
  getCommandCenterMockUnifiedTasks,
} from '../data/command-center-dev-seed';
import { allowMockFallback } from './mockPolicy';

/** M-CC-06 — strict KPI rail skips snapshot retry when rollup empty (not an error). */
export function shouldSkipCommandCenterKpiSnapshotOnEmptyRollup(): boolean {
  return !allowMockFallback();
}

/** M-CC-06/13 — KPI dev persona series (strict default → []). */
export function resolveCommandCenterKpiDevSeries(persona: PersonaRole) {
  return getCommandCenterMockKpiSeries(persona);
}


/** M-CC-06 — whether KPI rail may hydrate dev persona series after API miss. */
export function isCommandCenterKpiDevFallbackEnabled(): boolean {
  return allowMockFallback();
}

/**
 * BR-INBOX-01 — when mock fallback is off, never surface command-center-mock tasks.
 * M-CC-13 — mock seed loaded from gated getter, not page imports.
 */
export function resolveCommandCenterInboxTasks<T>(
  source: DataSourceKind,
  apiTasks: T[],
): T[] {
  if (source === 'api' && apiTasks.length > 0) {
    return apiTasks;
  }
  if (allowMockFallback() && source === 'mock') {
    return getCommandCenterMockUnifiedTasks() as T[];
  }
  return apiTasks;
}

/** M-CC-12/13 — portal alerts rail: mock rows only when dev mock flag + mock source. */
export function resolveCommandCenterPortalAlerts<T>(
  source: DataSourceKind,
  apiAlerts: T[],
): T[] {
  if (source === 'api' && apiAlerts.length > 0) {
    return apiAlerts;
  }
  if (allowMockFallback()) {
    return getCommandCenterMockPortalAlerts() as T[];
  }
  return apiAlerts;
}

/** M-CC-12 — inbox/alerts fetch: empty API response → mock source only when flag on. */
export function resolveCommandCenterEmptyApiSource(): 'api' | 'mock' {
  return allowMockFallback() ? 'mock' : 'api';
}

/** M-CC-12 — inbox/alerts fetch: API error → empty rows; loadFailed when strict. */
export function resolveCommandCenterApiErrorState(): {
  source: 'api' | 'mock';
  loadFailed: boolean;
} {
  return {
    source: allowMockFallback() ? 'mock' : 'api',
    loadFailed: !allowMockFallback(),
  };
}

/** M-CC-12 — workflow definitions local seed when API empty/fail. */
export function resolveWorkflowDefinitionsLocalSeed<T>(
  mockSeed: T[],
): { rows: T[]; source: 'empty' | 'mock'; loadFailed: boolean } {
  if (!allowMockFallback()) {
    return { rows: [], source: 'empty', loadFailed: false };
  }
  return { rows: mockSeed, source: 'mock', loadFailed: false };
}

export function resolveWorkflowDefinitionsApiErrorState<T>(
  mockSeed: T[],
): { rows: T[]; source: 'empty' | 'mock'; loadFailed: boolean } {
  const seeded = resolveWorkflowDefinitionsLocalSeed(mockSeed);
  return { ...seeded, loadFailed: !allowMockFallback() };
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
