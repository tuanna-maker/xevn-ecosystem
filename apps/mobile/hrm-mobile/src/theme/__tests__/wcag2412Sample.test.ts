/**
 * D-UX-R3-WCAG-MOBILE-01 — WCAG 2.4.12 Focus not obscured sample gate (4 screens).
 */
import fs from 'node:fs';
import path from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { layout } from '../tokens';

const SRC = path.resolve(__dirname, '../..');

function readSrc(relativePath: string): string {
  return fs.readFileSync(path.join(SRC, relativePath), 'utf8');
}

const platformState: { os: 'android' | 'ios' } = { os: 'ios' };

vi.mock('react-native', () => ({
  Platform: {
    get OS() {
      return platformState.os;
    },
  },
}));

describe('D-UX-R3-WCAG-MOBILE-01 — WCAG 2.4.12 sample (4 screens)', () => {
  afterEach(() => {
    platformState.os = 'ios';
    vi.resetModules();
  });

  it('layout.touchTargetMin and WCAG_MIN_TOUCH_TARGET_PT are ≥ 44', async () => {
    const { WCAG_MIN_TOUCH_TARGET_PT } = await import('../layoutInsets');
    expect(layout.touchTargetMin).toBeGreaterThanOrEqual(44);
    expect(WCAG_MIN_TOUCH_TARGET_PT).toBe(44);
    expect(WCAG_MIN_TOUCH_TARGET_PT).toBe(layout.touchTargetMin);
  });

  it('resolveFabActionSheetMarginBottom clears tab bar + home indicator (iOS)', async () => {
    const { resolveFabActionSheetMarginBottom, TAB_BAR_BASE_HEIGHT } = await import('../layoutInsets');
    const spacingSm = 8;
    expect(resolveFabActionSheetMarginBottom(34, spacingSm)).toBe(34 + TAB_BAR_BASE_HEIGHT + spacingSm);
    expect(resolveFabActionSheetMarginBottom(0, spacingSm)).toBe(TAB_BAR_BASE_HEIGHT + spacingSm);
  });

  it('1) CheckIn (AttendanceEntry) — StickyFooter thumbZone above tab bar', () => {
    const screen = readSrc('features/attendance/CheckInScreen.tsx');
    expect(screen).toContain('StickyFooter');
    expect(screen).toContain('thumbZone');
    expect(screen).toContain('check-in-sticky-footer');
    expect(screen).toContain('check-in-submit');
    expect(screen).toContain('footerBottomExtra');
    expect(screen).toContain('WCAG 2.4.12');
  });

  it('2) FabPrimaryActionSheet (ClockIn method selector) — safe margin helper', () => {
    const sheet = readSrc('components/navigation/FabPrimaryActionSheet.tsx');
    expect(sheet).toContain('resolveFabActionSheetMarginBottom');
    expect(sheet).toContain('minHeight: layout.listRowMinHeight');
    expect(sheet).toContain('minHeight: layout.primaryButtonHeight');
    expect(sheet).toContain('width: 44');
    expect(sheet).toContain('height: 44');
  });

  it('3) Home — HomeTopBar safe-area top + avatar ≥44 hit', () => {
    const topBar = readSrc('components/home/HomeTopBar.tsx');
    expect(topBar).toContain('useSafeAreaInsets');
    expect(topBar).toContain('paddingTop: insets.top');
    expect(topBar).toContain('avatarHit');
    expect(topBar).toContain('layout.touchTargetMin');
    expect(topBar).toContain('home-top-bar-avatar');
    expect(topBar).toMatch(/iconButton[\s\S]*touchTargetMin/);
  });

  it('4) Profile ESS — SegmentedTabBar ≥44 + scroll layout + ESS save ≥44', () => {
    const tabs = readSrc('components/ui/SegmentedTabBar.tsx');
    expect(tabs).toContain('minHeight: layout.touchTargetMin');
    expect(tabs).not.toMatch(/minHeight:\s*36/);

    const profile = readSrc('features/profile/ProfileScreen.tsx');
    expect(profile).toContain('AppScreenLayout');
    expect(profile).toContain('SegmentedTabBar');
    expect(profile).toContain('DynamicProfileForm');

    const form = readSrc('components/profile/DynamicProfileForm.tsx');
    expect(form).toContain('DYNAMIC_PROFILE_TOUCH_MIN');
    expect(form).toContain('profile-ess-save');
    expect(form).toMatch(/minHeight:\s*DYNAMIC_PROFILE_TOUCH_MIN/);

    const quick = readSrc('components/profile/ProfileQuickActionGrid.tsx');
    expect(quick).toContain('minHeight: layout.touchTargetMin');
  });
});
