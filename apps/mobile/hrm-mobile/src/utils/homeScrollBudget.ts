/**
 * Home 1-screen above-fold budget — MOB-UX-14b / MOBILE_HOME_RESPONSIVE_PROGRAM.md.
 */
import type { HomeSectionKey } from './dashboardPersonaLayout';

/** iPhone SE 3 baseline viewport height (pt). */
export const IPHONE_SE_VIEWPORT_HEIGHT = 667;

/** Above-fold must fit within this ratio of viewport (program target). */
export const HOME_ABOVE_FOLD_BUDGET_RATIO = 0.78;

export const HOME_ABOVE_FOLD_MAX_HEIGHT = Math.round(
  IPHONE_SE_VIEWPORT_HEIGHT * HOME_ABOVE_FOLD_BUDGET_RATIO,
);

/** Scroll sections rendered above the fold — TopBar → grid → EssStatRow → STOP. */
export const HOME_ABOVE_FOLD_SECTION_KEYS: readonly HomeSectionKey[] = [
  'action_grid',
  'above_fold_stats',
] as const;

/** Activity sections consolidated into «Hoạt động» bottom sheet (not main scroll). */
export const HOME_ACTIVITY_SHEET_SECTION_KEYS = [
  'payslip_feed',
  'manager_expandable',
  'tasks',
  'today',
  'upcoming',
] as const;

export type HomeActivitySheetSectionKey = (typeof HOME_ACTIVITY_SHEET_SECTION_KEYS)[number];

export const HOME_ACTIVITY_SHEET_TEST_ID = 'home-activity-sheet';
export const HOME_ACTIVITY_TRIGGER_TEST_ID = 'home-activity-trigger';

/** Layout height estimates (dp/pt) for vitest budget guard. */
export const homeAboveFoldHeights = {
  topBarBase: 56,
  safeAreaTop: 20,
  actionGridRow: 88,
  actionGridRowCompact: 52,
  actionGridRows: 1,
  gridSectionGap: 12,
  gridSectionGapCompact: 6,
  statRow: 44,
  activityTrigger: 56,
  statRowCount: 4,
} as const;

export function isAboveFoldSection(key: HomeSectionKey): boolean {
  return (HOME_ABOVE_FOLD_SECTION_KEYS as readonly string[]).includes(key);
}

export function isActivitySheetSection(key: string): key is HomeActivitySheetSectionKey {
  return (HOME_ACTIVITY_SHEET_SECTION_KEYS as readonly string[]).includes(key);
}

/** iPhone SE 3 — compact above-fold so ESS + activity fit first viewport (MOB-UX-14-R5/R6). */
export const IPHONE_SE_COMPACT_HEIGHT = 680;

/** Viewports ≤720dp need ultra-compact grid + 1 stat row (14d tabBarClearance on SE). */
export const HOME_COMPACT_VIEWPORT_MAX_HEIGHT = 720;

/** Tall phone class (Pro Max 932) — keep compact above-fold so scrollDepth markers stay in tree (MOB-UX-14-R7). */
export const HOME_TALL_PHONE_MAX_HEIGHT = 932;

/** Cap stat rows on short/tall narrow viewports so 14d scrollDepth finds markers without extra swipe. */
export function resolveAboveFoldStatMaxRows(viewportHeight: number): number {
  if (viewportHeight <= HOME_TALL_PHONE_MAX_HEIGHT) return 1;
  return 2;
}

/** Ultra-compact above-fold tiles/gaps on SE + tall phone wm-size classes (MOB-UX-14-R6/R7). */
export function resolveHomeAboveFoldCompact(viewportHeight: number): boolean {
  return viewportHeight <= HOME_TALL_PHONE_MAX_HEIGHT;
}

/** Estimate above-fold content height (excludes tab bar). Must stay ≤ HOME_ABOVE_FOLD_MAX_HEIGHT. */
export function estimateAboveFoldScrollHeight(
  gridRows = homeAboveFoldHeights.actionGridRows,
  statRows = homeAboveFoldHeights.statRowCount,
  viewportHeight = IPHONE_SE_VIEWPORT_HEIGHT,
): number {
  const compact = resolveHomeAboveFoldCompact(viewportHeight);
  const cappedStatRows = Math.min(
    statRows,
    resolveAboveFoldStatMaxRows(viewportHeight),
  );
  const gridRowHeight = compact
    ? homeAboveFoldHeights.actionGridRowCompact
    : homeAboveFoldHeights.actionGridRow;
  const gridGap = compact
    ? homeAboveFoldHeights.gridSectionGapCompact
    : homeAboveFoldHeights.gridSectionGap;
  return (
    homeAboveFoldHeights.topBarBase +
    homeAboveFoldHeights.safeAreaTop +
    gridRows * gridRowHeight +
    gridGap +
    cappedStatRows * homeAboveFoldHeights.statRow +
    homeAboveFoldHeights.activityTrigger
  );
}

export function passesAboveFoldBudget(
  gridRows = homeAboveFoldHeights.actionGridRows,
  statRows = homeAboveFoldHeights.statRowCount,
  viewportHeight = IPHONE_SE_VIEWPORT_HEIGHT,
): boolean {
  return estimateAboveFoldScrollHeight(gridRows, statRows, viewportHeight) <= HOME_ABOVE_FOLD_MAX_HEIGHT;
}

export type ActivityBadgeInput = {
  taskCount: number;
  managerPendingCount: number;
  upcomingCount: number;
  hasPayslipTeaser: boolean;
};

export function resolveActivityBadgeCount(input: ActivityBadgeInput): number {
  let total = input.taskCount + input.upcomingCount;
  if (input.managerPendingCount > 0) total += input.managerPendingCount;
  if (input.hasPayslipTeaser) total += 1;
  return total;
}

/** Markers used by qa-mobile-home-responsive-matrix scrollDepth probe. */
export const HOME_SCROLL_DEPTH_MARKERS = [
  'Truy cập nhanh',
  'Đội đang làm',
  'Đồng nghiệp',
  'Nghỉ hôm nay',
  'Hoạt động',
  'home-actions-carousel',
  'home-ess-stat-rows',
  'home-activity-trigger',
] as const;

export function countScrollDepthMarkers(markers: readonly string[], haystack: string): number {
  return markers.filter((m) => haystack.includes(m)).length;
}

export function passesScrollDepthProbe(
  haystack: string,
  minMarkers = 3,
  markerList: readonly string[] = HOME_SCROLL_DEPTH_MARKERS,
): boolean {
  return countScrollDepthMarkers(markerList, haystack) >= minMarkers;
}
