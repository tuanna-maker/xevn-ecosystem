import type { NavigationProp } from '@react-navigation/native';

import type { JourneyFeedParams, MainTabParamList, ProfileStackParamList } from './types';

export const PROFILE_STACK_TAB = 'TabProfile' as const;
export const PROFILE_ROOT_SCREEN = 'Profile' as const;
export const PROFILE_LEAVE_LIST_SCREEN = 'LeaveRequestsList' as const;
export const PROFILE_LEAVE_CREATE_SCREEN = 'CreateLeaveRequest' as const;
export const PROFILE_LEAVE_DETAIL_SCREEN = 'LeaveRequestDetail' as const;

type MainTabNav = NavigationProp<MainTabParamList>;

function buildProfileNestedParams<S extends keyof ProfileStackParamList>(
  screen: S,
  params?: ProfileStackParamList[S],
) {
  if (params !== undefined) {
    return { screen, params };
  }
  return { screen };
}

/**
 * Cross-tab → Profile nested stack (payslip-parity single hop).
 * R-W7-MOB-LEAVE-NAV-01-R3/R4 — blank 2822B: PanGestureHandler without GH root + manager inbox
 * SwipeableRow mount before tab transition; defer swipe + nested GH root on ManagerApprovals.
 */
export function navigateProfileStackScreen<S extends keyof ProfileStackParamList>(
  navigation: MainTabNav,
  screen: S,
  params?: ProfileStackParamList[S],
): void {
  navigation.navigate(PROFILE_STACK_TAB, buildProfileNestedParams(screen, params) as never);
}

/** Home / hub → My Leaves list (Profile stack). J-MOB-11/25 */
export function navigateToLeaveRequestsList(navigation: MainTabNav): void {
  navigateProfileStackScreen(navigation, PROFILE_LEAVE_LIST_SCREEN);
}

export function navigateToCreateLeaveRequest(navigation: MainTabNav): void {
  navigateProfileStackScreen(navigation, PROFILE_LEAVE_CREATE_SCREEN);
}

export function navigateToLeaveRequestDetail(
  navigation: MainTabNav,
  params: { id: string; employeeId?: string },
): void {
  navigateProfileStackScreen(
    navigation,
    PROFILE_LEAVE_DETAIL_SCREEN,
    params.employeeId?.trim()
      ? { id: params.id, employeeId: params.employeeId.trim() }
      : { id: params.id },
  );
}

/** R4 — defer nested push until TabProfile transition paints (nv0002 approve tile blank 2822B). */
export function navigateToManagerApprovals(navigation: MainTabNav): void {
  const push = () => navigateProfileStackScreen(navigation, 'ManagerApprovals');
  if (typeof requestAnimationFrame === 'function') {
    requestAnimationFrame(() => requestAnimationFrame(push));
    return;
  }
  push();
}

export function navigateToNotifications(navigation: MainTabNav): void {
  navigateProfileStackScreen(navigation, 'Notifications');
}

export function navigateToProfileRoot(navigation: MainTabNav): void {
  navigateProfileStackScreen(navigation, 'Profile');
}

export function navigateToContracts(navigation: MainTabNav): void {
  navigateProfileStackScreen(navigation, 'Contracts');
}

export function navigateToOperations(navigation: MainTabNav): void {
  navigateProfileStackScreen(navigation, 'Operations');
}

export function navigateToUpdateRequests(navigation: MainTabNav): void {
  navigateProfileStackScreen(navigation, 'UpdateRequests');
}

export function navigateToUpdateRequestDetail(navigation: MainTabNav, id: string): void {
  navigateProfileStackScreen(navigation, 'UpdateRequestDetail', { id });
}

export function navigateToJourney(navigation: MainTabNav, feed: JourneyFeedParams): void {
  navigateProfileStackScreen(navigation, 'Journey', { feed });
}

/** Profile / Home hub → Settings (HDSD §12.9 · TC-MOB-032). */
export function navigateToSettings(navigation: MainTabNav): void {
  navigateProfileStackScreen(navigation, 'Settings');
}

/** Settings quick nav → Scope (HDSD §12.1 · TC-MOB-006). */
export function navigateToScope(navigation: MainTabNav): void {
  navigateProfileStackScreen(navigation, 'Scope');
}
