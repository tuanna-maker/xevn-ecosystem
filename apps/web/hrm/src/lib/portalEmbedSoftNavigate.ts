/**
 * @CODE-MEMORY
 * Screen:      Portal HRM iframe soft-nav (parent postMessage → React Router)
 * UC:          J-HRM-02 / embed tab switch
 * BR:          Soft-nav must commit route view without iframe remount; preserve embed QS
 * SRS:         docs/program/PROGRAM_JOURNEY_MAP.md J-HRM-*
 * TechSpec:    docs/qa/evidence/p1-hrm-perf-fe-01-20260620.md (postMessage soft nav)
 * Purpose:     Apply parent→iframe path changes with flushSync so BrowserRouter
 *              `v7_startTransition` cannot leave a heavy page (Attendance) painted
 *              after window.location already moved. Preserves ?portal=1&companyId&_v.
 * WorkItem:    D-HRM-ATT-NAV-STALL-01
 * Coded:       2026-07-17
 * Callers:     PortalEmbedRouterSync → applyPortalEmbedSoftNavigate
 * Callees:     react-dom flushSync, react-router navigate
 * FEActions:   CC sidebar click → postMessage → flushSync navigate → Outlet swaps
 * Impact:      Soft-nav leave Attendance stuck until F5 if flushSync/search omitted
 * must_keep:   no iframe remount on path change; preserve embedScopeKey / _v query
 * SOLID:       Pure navigate applicator — bridge transport stays in portalEmbedNavBridge
 * LastVerified: apps/web/hrm/src/lib/portalEmbedSoftNavigate.test.ts
 */
import { flushSync } from 'react-dom';
import type { NavigateFunction } from 'react-router-dom';

export type PortalEmbedLocationSnapshot = {
  pathname: string;
  search: string;
};

/**
 * Soft-navigate inside the HRM iframe SPA.
 * - Preserves embed search (`portal`, `companyId`, `tenantId`, `_v`, …)
 * - Uses flushSync + navigate `flushSync: true` (belt for data-router / RR upgrades);
 *   HRM BrowserRouter also keeps `v7_startTransition` off so location commits sync.
 */
export function applyPortalEmbedSoftNavigate(
  navigate: NavigateFunction,
  path: string,
  current: PortalEmbedLocationSnapshot,
): void {
  const pathname = path.startsWith('/') ? path : `/${path}`;
  const search = current.search ?? '';

  if (pathname === current.pathname) {
    return;
  }

  flushSync(() => {
    navigate({ pathname, search }, { flushSync: true });
  });
}
