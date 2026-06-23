import { afterEach, describe, expect, it, vi } from 'vitest';

const platformState: { os: 'android' | 'ios' } = { os: 'ios' };

vi.mock('react-native', () => ({
  Platform: {
    get OS() {
      return platformState.os;
    },
  },
}));

import {
  CHECK_IN_FAB_ACCESSIBILITY_LABEL,
  CHECK_IN_FAB_FILL,
  CHECK_IN_FAB_NAV_TARGET,
  CHECK_IN_FAB_SIZE,
  CHECK_IN_FAB_TEST_ID,
  MAIN_TAB_COUNT,
  resolveCheckInFabBottom,
  resolveDeepestFocusedRouteName,
  shouldHideCheckInFab,
} from '../checkInFab';
import { TAB_BAR_BASE_HEIGHT } from '../../theme/layoutInsets';
import { colors } from '../../theme/tokens';

describe('checkInFab — J-MOB-33 Option B center FAB', () => {
  afterEach(() => {
    platformState.os = 'ios';
    vi.resetModules();
  });
  it('preserves 4-tab lock — no 5th tab route in nav target', () => {
    expect(MAIN_TAB_COUNT).toBe(4);
    expect(CHECK_IN_FAB_NAV_TARGET).toEqual({ tab: 'TabAttendance', screen: 'CheckIn' });
  });

  it('uses XeVN accent fill — not ZenHR teal primary (BR-ZEN-05)', () => {
    expect(CHECK_IN_FAB_FILL).toBe(colors.accent);
    expect(CHECK_IN_FAB_FILL).toBe('#06B6D4');
    expect(CHECK_IN_FAB_FILL).not.toBe('#14B8A6');
  });

  it('accessibility label opens primary action sheet (MOB-UX-10-P0)', () => {
    expect(CHECK_IN_FAB_ACCESSIBILITY_LABEL).toBe('Thao tác nhanh');
  });

  it('exposes stable testID for device QA', () => {
    expect(CHECK_IN_FAB_TEST_ID).toBe('check-in-fab');
  });

  it('shouldHideCheckInFab — MOB-UX-16d ILA-09', () => {
    expect(shouldHideCheckInFab('CheckIn')).toBe(true);
    expect(shouldHideCheckInFab('TeamDirectory')).toBe(false);
    expect(shouldHideCheckInFab(undefined)).toBe(false);
  });

  it('resolveDeepestFocusedRouteName — nested TabAttendance → CheckIn (R3-CHECKIN-FAB-01)', () => {
    const rootState = {
      index: 0,
      routes: [
        {
          name: 'Main',
          state: {
            index: 1,
            routes: [
              { name: 'TabDashboard' },
              {
                name: 'TabAttendance',
                state: {
                  index: 1,
                  routes: [{ name: 'TeamDirectory' }, { name: 'CheckIn' }],
                },
              },
            ],
          },
        },
      ],
    };
    expect(resolveDeepestFocusedRouteName(rootState)).toBe('CheckIn');
    expect(shouldHideCheckInFab(resolveDeepestFocusedRouteName(rootState))).toBe(true);

    const teamOnly = {
      index: 0,
      routes: [
        {
          name: 'Main',
          state: {
            index: 1,
            routes: [
              { name: 'TabDashboard' },
              {
                name: 'TabAttendance',
                state: {
                  index: 0,
                  routes: [{ name: 'TeamDirectory' }],
                },
              },
            ],
          },
        },
      ],
    };
    expect(resolveDeepestFocusedRouteName(teamOnly)).toBe('TeamDirectory');
    expect(shouldHideCheckInFab(resolveDeepestFocusedRouteName(teamOnly))).toBe(false);
  });

  it('resolveCheckInFabBottom centers on tab icon row — MOB-UX-SAFE-01', () => {
    const iphone = resolveCheckInFabBottom({ bottom: 34 });
    const iconRowCenterIphone = 34 + TAB_BAR_BASE_HEIGHT / 2;
    expect(iphone + CHECK_IN_FAB_SIZE / 2).toBe(iconRowCenterIphone);

    const android3Button = resolveCheckInFabBottom({ bottom: 48 });
    const iconRowCenterAndroid = 48 + TAB_BAR_BASE_HEIGHT / 2;
    expect(android3Button + CHECK_IN_FAB_SIZE / 2).toBe(iconRowCenterAndroid);

    expect(android3Button).toBeGreaterThan(iphone);
  });

  it('FAB bottom stays above Android nav inset (not clipped)', () => {
    const bottom = resolveCheckInFabBottom({ bottom: 48 });
    expect(bottom).toBeGreaterThanOrEqual(48 - CHECK_IN_FAB_SIZE / 2);
  });

  it('resolveCheckInFabBottom uses 24dp fallback when Android reports bottom=0 — MOB-UX-13b', async () => {
    platformState.os = 'android';
    vi.resetModules();
    const { resolveCheckInFabBottom: resolveFabBottom } = await import('../checkInFab');
    const { TAB_BAR_BASE_HEIGHT, ANDROID_NAV_BAR_FALLBACK_DP } = await import('../../theme/layoutInsets');
    const bottom = resolveFabBottom({ bottom: 0 });
    const iconRowCenter = ANDROID_NAV_BAR_FALLBACK_DP + TAB_BAR_BASE_HEIGHT / 2;
    expect(bottom + CHECK_IN_FAB_SIZE / 2).toBe(iconRowCenter);
    expect(bottom).toBeGreaterThan(0);
  });
});
