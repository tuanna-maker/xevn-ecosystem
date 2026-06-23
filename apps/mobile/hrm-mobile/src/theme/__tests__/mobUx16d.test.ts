import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

import { groupedLayout } from '../groupedLayout';

const SRC = path.resolve(__dirname, '../..');

function readSrc(relativePath: string): string {
  return fs.readFileSync(path.join(SRC, relativePath), 'utf8');
}

describe('MOB-UX-16d GWC carry bundle', () => {
  it('CheckInScreen — ILA-09 thumb-zone sticky footer + stack header', () => {
    const screen = readSrc('features/attendance/CheckInScreen.tsx');
    expect(screen).toContain('stackHeaderPresent');
    expect(screen).toContain('thumbZone');
    expect(screen).toContain('check-in-sticky-footer');
    expect(screen).toContain('footerBottomExtra');
    expect(screen).toContain('groupedLayout.belowSubtitle');
    expect(screen).not.toContain('title="Chấm công"');
  });

  it('CheckInFabOverlay hides on CheckIn route — no FAB competition', () => {
    const fab = readSrc('navigation/checkInFab.ts');
    expect(fab).toContain('shouldHideCheckInFab');
    expect(fab).toContain("CHECK_IN_FAB_HIDDEN_ROUTES = new Set(['CheckIn'])");
    const overlay = readSrc('components/navigation/CheckInFabOverlay.tsx');
    expect(overlay).toContain('shouldHideCheckInFab');
    expect(overlay).toContain('resolveDeepestFocusedRouteName');
    expect(overlay).toContain('useNavigationState');
    expect(overlay).toContain('if (hideFab)');
  });

  it('ProfileScreen — ILA-02 groupedLayout tab density F-3', () => {
    const screen = readSrc('features/profile/ProfileScreen.tsx');
    expect(screen).toContain('stackHeaderPresent');
    expect(screen).toContain('groupedLayout.belowStackHeader');
    expect(screen).toContain('groupedLayout.belowBalanceCards');
    expect(screen).not.toContain('marginBottom: 4');
  });

  it('ScopeScreen + Settings — ILA-07 Vietnamese scope OU copy', () => {
    const scope = readSrc('features/auth/ScopeScreen.tsx');
    expect(scope).toContain('scopeScreenCopy');
    expect(scope).not.toContain('Slug:');
    expect(scope).not.toContain('Query company_id');
    expect(scope).not.toContain('operating-units)');

    const settings = readSrc('features/settings/SettingsScreen.tsx');
    expect(settings).toContain('resolveAuthRolesVi');
    expect(settings).toContain('fetchHrmOperatingUnits');
    expect(settings).not.toContain('auth.roles.join');
  });

  it('thumb-zone helpers exported in layoutInsets + StickyFooter', () => {
    const insets = readSrc('theme/layoutInsets.ts');
    expect(insets).toContain('MIN_THUMB_SAFE_INSET_DP = 24');
    expect(insets).toContain('thumbZone?: boolean');
    const footer = readSrc('components/ui/StickyFooter.tsx');
    expect(footer).toContain('thumbZone');
    expect(groupedLayout.belowSubtitle).toBe(12);
  });
});
