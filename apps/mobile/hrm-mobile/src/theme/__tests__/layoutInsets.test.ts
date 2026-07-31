import { afterEach, describe, expect, it, vi } from 'vitest';

const platformState: { os: 'android' | 'ios' } = { os: 'ios' };

vi.mock('react-native', () => ({
  Platform: {
    get OS() {
      return platformState.os;
    },
  },
}));

import { layout } from '../tokens';

describe('layoutInsets — MOBILE_XEVN_DESIGN_SYSTEM §4.1', () => {
  afterEach(() => {
    platformState.os = 'ios';
    vi.resetModules();
  });

  async function loadInsets() {
    return import('../layoutInsets');
  }

  it('resolves tab bar height as 49 + bottom inset', async () => {
    const {
      TAB_BAR_BASE_HEIGHT,
      resolveTabBarHeight,
    } = await loadInsets();
    expect(TAB_BAR_BASE_HEIGHT).toBe(49);
    expect(resolveTabBarHeight({ bottom: 0 })).toBe(49);
    expect(resolveTabBarHeight({ bottom: 34 })).toBe(83);
    expect(resolveTabBarHeight({ bottom: 48 })).toBe(97);
  });

  it('adds top inset on headerless tab-root screens', async () => {
    const { resolveScreenPaddingTop } = await loadInsets();
    expect(resolveScreenPaddingTop({ top: 0 }, false)).toBe(layout.screenPaddingH);
    expect(resolveScreenPaddingTop({ top: 47 }, true)).toBe(47 + layout.screenPaddingH);
  });

  it('scroll padding includes tab bar height + base spacing (not fixed 24 only)', async () => {
    const { resolveScrollPaddingBottom, resolveTabBarHeight } = await loadInsets();
    const android3Button = resolveScrollPaddingBottom({ bottom: 48 }, resolveTabBarHeight({ bottom: 48 }));
    expect(android3Button).toBe(layout.screenPaddingBottom + 97);

    const iphone = resolveScrollPaddingBottom({ bottom: 34 }, resolveTabBarHeight({ bottom: 34 }));
    expect(iphone).toBe(layout.screenPaddingBottom + 83);
  });

  it('standalone screens use bottom safe area without tab bar constant', async () => {
    const { resolveStandaloneScrollPaddingBottom } = await loadInsets();
    expect(resolveStandaloneScrollPaddingBottom({ bottom: 34 })).toBe(layout.screenPaddingBottom + 34);
  });

  it('sticky footer above tab bar uses compact padding only', async () => {
    const { resolveStickyFooterPaddingBottom } = await loadInsets();
    expect(resolveStickyFooterPaddingBottom(true, 34)).toBe(8);
    expect(resolveStickyFooterPaddingBottom(true, 34, { thumbZone: true })).toBe(24);
    expect(resolveStickyFooterPaddingBottom(false, 34)).toBe(34);
    expect(resolveStickyFooterPaddingBottom(false, 0)).toBe(8);
  });

  it('resolveFabActionSheetMarginBottom — WCAG 2.4.12 sheet clears tab + safe inset', async () => {
    const { resolveFabActionSheetMarginBottom, TAB_BAR_BASE_HEIGHT, WCAG_MIN_TOUCH_TARGET_PT } =
      await loadInsets();
    expect(WCAG_MIN_TOUCH_TARGET_PT).toBe(44);
    expect(resolveFabActionSheetMarginBottom(34, 8)).toBe(34 + TAB_BAR_BASE_HEIGHT + 8);
  });

  it('resolveAndroidNavigationBarInset — MOB-UX-13b Android 3-button fallback', async () => {
    platformState.os = 'android';
    vi.resetModules();
    const {
      ANDROID_NAV_BAR_FALLBACK_DP,
      TAB_BAR_SAFE_ZONE_TEST_ID,
      resolveAndroidNavigationBarInset,
      resolveBottomSafeInset,
      resolveTabBarHeight,
    } = await loadInsets();

    expect(ANDROID_NAV_BAR_FALLBACK_DP).toBe(24);
    expect(TAB_BAR_SAFE_ZONE_TEST_ID).toBe('tab-bar-safe-zone');
    expect(resolveAndroidNavigationBarInset(0)).toBe(24);
    expect(resolveAndroidNavigationBarInset(48)).toBe(48);
    expect(resolveBottomSafeInset(0)).toBe(24);
    expect(resolveTabBarHeight({ bottom: 0 })).toBe(49 + 24);
  });

  it('resolveAndroidNavigationBarInset — iOS leaves raw inset unchanged', async () => {
    platformState.os = 'ios';
    vi.resetModules();
    const { resolveAndroidNavigationBarInset, resolveBottomSafeInset, resolveTabBarHeight } = await loadInsets();

    expect(resolveAndroidNavigationBarInset(0)).toBe(0);
    expect(resolveBottomSafeInset(0)).toBe(0);
    expect(resolveTabBarHeight({ bottom: 0 })).toBe(49);
  });
});
