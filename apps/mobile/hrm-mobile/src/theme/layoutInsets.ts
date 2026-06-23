/**
 * Safe-area + tab bar inset helpers — MOBILE_XEVN_DESIGN_SYSTEM_DIRECTION.md §3–4.1.
 */

import { Platform } from 'react-native';

import { layout } from './tokens';

/** iOS HIG / DS §4.1 base tab bar content height (excludes home indicator). */
export const TAB_BAR_BASE_HEIGHT = 49;

/**
 * Android 3-button nav — SafeAreaProvider often reports bottom=0 (MOB-UX-13b).
 * Material minimum gesture/nav clearance for tab bar padding.
 */
export const ANDROID_NAV_BAR_FALLBACK_DP = 24;

/** Device QA — bottom safe-zone marker above system navigation (MOB-UX-13b). */
export const TAB_BAR_SAFE_ZONE_TEST_ID = 'tab-bar-safe-zone';

export type SafeAreaInsets = {
  top: number;
  bottom: number;
};

/**
 * When `react-native-safe-area-context` returns bottom=0 on Android (3-button nav),
 * apply minimum nav bar inset so tab bar / FAB do not overlap system buttons.
 */
export function resolveAndroidNavigationBarInset(insetBottom: number): number {
  if (Platform.OS !== 'android') {
    return insetBottom;
  }
  if (insetBottom > 0) {
    return insetBottom;
  }
  return ANDROID_NAV_BAR_FALLBACK_DP;
}

/** Effective bottom safe area for layout (Android 3-button fallback included). */
export function resolveBottomSafeInset(insetBottom: number): number {
  return resolveAndroidNavigationBarInset(insetBottom);
}

/** Total tab bar footprint: 49pt + bottom safe area (gesture bar / 3-button nav). */
export function resolveTabBarHeight(insets: Pick<SafeAreaInsets, 'bottom'>): number {
  return TAB_BAR_BASE_HEIGHT + resolveBottomSafeInset(insets.bottom);
}

/** Top padding for headerless tab-root screens (Dashboard, Login). */
export function resolveScreenPaddingTop(
  insets: Pick<SafeAreaInsets, 'top'>,
  safeAreaTop: boolean,
): number {
  const base = layout.screenPaddingH;
  return safeAreaTop ? insets.top + base : base;
}

/**
 * ScrollView content bottom padding — DS §3 screenPaddingBottom + tab bar + safe area.
 * @param tabBarHeight — from `useBottomTabBarHeight()` when tab bar overlays content, or `resolveTabBarHeight(insets)` fallback.
 */
export function resolveScrollPaddingBottom(
  insets: Pick<SafeAreaInsets, 'bottom'>,
  tabBarHeight: number,
): number {
  return layout.screenPaddingBottom + tabBarHeight;
}

/** Standalone screens (Login) — no tab bar; still respect bottom safe area. */
export function resolveStandaloneScrollPaddingBottom(
  insets: Pick<SafeAreaInsets, 'bottom'>,
): number {
  return layout.screenPaddingBottom + resolveBottomSafeInset(insets.bottom);
}

/** HIG thumb-zone minimum clearance above system nav (MOB-UX-16d ILA-09). */
export const MIN_THUMB_SAFE_INSET_DP = 24;

/** StickyFooter sits above absolute tab bar — only needs inner spacing, not home indicator. */
export function resolveStickyFooterPaddingBottom(
  aboveTabBar: boolean,
  insetBottom: number,
  options?: { thumbZone?: boolean },
): number {
  if (aboveTabBar) {
    if (options?.thumbZone) {
      return MIN_THUMB_SAFE_INSET_DP;
    }
    return 8;
  }
  return Math.max(resolveBottomSafeInset(insetBottom), 8);
}

/** Check-in screen footer zone — tab bar + optional lift so CTAs clear center FAB on other routes. */
export function resolveCheckInFooterBottomInset(tabBarHeight: number, fabLift = 0): number {
  return tabBarHeight + fabLift;
}
