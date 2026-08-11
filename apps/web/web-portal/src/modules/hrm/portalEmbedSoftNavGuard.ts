/**
 * @CODE-MEMORY
 * Screen:     /command-center/hrm/* — portal iframe soft-nav guard (C-CD-FB-09-01)
 * UC:         J-HRM-05 / P-CC-06 soft-nav into Tuyển dụng
 * BR:         Soft click must show target HRM route without hard browser reload
 * SRS:        docs/program/deltas/CUSTOMER_DEMO_HRM_DELTA_20260620.md §6 F6
 * TechSpec:   docs/qa/evidence/p1-hrm-perf-fe-01-20260620.md (postMessage soft nav)
 * Purpose:    Pure helpers — normalize iframe path vs expected app-rel path and decide
 *             when parent must fall back to document `src` reload (content remount)
 *             without changing embedScopeKey (PERF must_keep).
 * WorkItem:   CD-FB-09-SOFT-NAV
 * Coded:      2026-07-19
 * Callers:    HrmWorkspaceRoute → iframeAppPathMatchesExpected / shouldForceEmbedSrcReload
 * Callees:    none (pure)
 * FEActions:  CC sidebar soft click → postMessage → verify path → optional src fallback
 * Impact:     Wrong match → false src reload (PERF hit) or missed stall (UX stuck)
 * must_keep:  embedScopeKey ignores path; F6 product ACs; hard-nav P-CC-06
 * SOLID:      SRP path-compare only — transport stays in portalEmbedNavBridge
 * LastVerified: apps/web/web-portal/src/modules/hrm/portalEmbedSoftNavGuard.test.ts
 */

const HRM_BASENAME = '/hr';

/** Normalize iframe `location.pathname` or app-rel path to `/recruitment` form. */
export function normalizeHrmEmbedAppPath(pathname: string, basename = HRM_BASENAME): string {
  let rel = pathname.trim() || '/';
  if (basename && (rel === basename || rel.startsWith(`${basename}/`))) {
    rel = rel.slice(basename.length) || '/';
  }
  if (!rel.startsWith('/')) rel = `/${rel}`;
  if (rel === '/dashboard') return '/';
  if (rel.length > 1 && rel.endsWith('/')) rel = rel.replace(/\/+$/, '');
  return rel || '/';
}

/** True when iframe document path already matches the soft-nav target (app-rel). */
export function iframeAppPathMatchesExpected(
  iframePathname: string,
  expectedAppRel: string,
  basename = HRM_BASENAME,
): boolean {
  const actual = normalizeHrmEmbedAppPath(iframePathname, basename);
  const expected = normalizeHrmEmbedAppPath(expectedAppRel, '');
  return actual === expected;
}

/**
 * After postMessage soft-nav, force document `src` reload when the iframe path
 * still points at a different primary route (Attendance stuck / message dropped).
 */
export function shouldForceEmbedSrcReload(
  iframePathname: string | null | undefined,
  expectedAppRel: string,
): boolean {
  if (iframePathname == null || iframePathname === '') return false;
  return !iframeAppPathMatchesExpected(iframePathname, expectedAppRel);
}
