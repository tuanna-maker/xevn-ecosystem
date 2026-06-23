/**
 * Center check-in FAB — MOBILE_HRM_ESS_UX_BENCHMARK.md §13.4 Option B · J-MOB-33.
 * Overlay above 4-tab bar; navigates TabAttendance → CheckIn (no 5th tab route).
 */

import { TAB_BAR_BASE_HEIGHT, resolveBottomSafeInset } from '../theme/layoutInsets';
import { colors } from '../theme/tokens';

/** Visible FAB diameter — DS touchTargetComfort + ZenHR parity. */
export const CHECK_IN_FAB_SIZE = 56;

/** Ionicons add glyph size inside FAB. */
export const CHECK_IN_FAB_ICON_SIZE = 28;

/** Tab routes in MainTabs — BR-PORT-02 / U48 4-tab lock. */
export { MAIN_TAB_COUNT } from './mainTabIa';

/** Nested navigation target for center FAB tap (BR-ZEN-01). */
export const CHECK_IN_FAB_NAV_TARGET = {
  tab: 'TabAttendance',
  screen: 'CheckIn',
} as const;

/** VoiceOver / TalkBack — opens primary action sheet (MOB-UX-10-P0). */
export { CHECK_IN_FAB_ACCESSIBILITY_LABEL } from './fabPrimaryActions';

/** XeVN accent fill — not ZenHR teal (BR-ZEN-05). */
export const CHECK_IN_FAB_FILL = colors.accent;

export const CHECK_IN_FAB_PRESSED_FILL = colors.primary;

export type SafeAreaBottomInset = {
  bottom: number;
};

/** Minimal navigation state slice for deepest-route resolution (R3-CHECKIN-FAB-01). */
export type FocusedRouteNavState = {
  index?: number;
  routes: Array<{ name: string; state?: FocusedRouteNavState }>;
};

/**
 * Walk nested stack/tab state to the leaf focused route — overlay sits outside Tab.Navigator
 * so one-level reads return tab keys (e.g. TabAttendance) not CheckIn.
 */
export function resolveDeepestFocusedRouteName(
  state: FocusedRouteNavState | null | undefined,
): string | undefined {
  if (!state?.routes?.length) return undefined;
  const index = state.index ?? 0;
  const route = state.routes[index];
  if (!route) return undefined;
  const child = route.state;
  if (child?.routes?.length) {
    return resolveDeepestFocusedRouteName(child) ?? route.name;
  }
  return route.name;
}

/**
 * FAB `bottom` offset from screen edge — centers on tab icon row (49pt band)
 * above home indicator / Android 3-button nav (MOB-UX-SAFE-01).
 */
export function resolveCheckInFabBottom(insets: SafeAreaBottomInset): number {
  const bottomInset = resolveBottomSafeInset(insets.bottom);
  const iconRowCenter = bottomInset + TAB_BAR_BASE_HEIGHT / 2;
  return iconRowCenter - CHECK_IN_FAB_SIZE / 2;
}

/** testID for device QA (J-MOB-33). */
export const CHECK_IN_FAB_TEST_ID = 'check-in-fab';

/** Routes where center FAB competes with sticky check-in CTAs (MOB-UX-16d ILA-09). */
export const CHECK_IN_FAB_HIDDEN_ROUTES = new Set(['CheckIn']);

/** Hide overlay when attendance check-in screen is focused — thumb-zone owns sticky footer. */
export function shouldHideCheckInFab(focusedRouteName: string | undefined): boolean {
  const name = focusedRouteName?.trim() ?? '';
  return CHECK_IN_FAB_HIDDEN_ROUTES.has(name);
}

/** Extra lift above tab bar for dual-button sticky footer (half FAB diameter clearance). */
export const CHECK_IN_STICKY_FOOTER_LIFT = Math.ceil(CHECK_IN_FAB_SIZE / 2);
