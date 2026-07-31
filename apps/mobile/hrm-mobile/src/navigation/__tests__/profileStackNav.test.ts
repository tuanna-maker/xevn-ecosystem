import fs from 'node:fs';

import path from 'node:path';

import { describe, expect, it } from 'vitest';



const SRC = path.resolve(__dirname, '..');



function readNavSrc(name: string): string {

  return fs.readFileSync(path.join(SRC, name), 'utf8');

}



describe('profileStackNav — R-W7-MOB-LEAVE-NAV-01-R3', () => {

  it('uses payslip-parity single-hop TabProfile navigate', () => {

    const src = readNavSrc('profileStackNav.ts');

    expect(src).toContain('navigateProfileStackScreen');

    expect(src).toContain("navigation.navigate(PROFILE_STACK_TAB");

    expect(src).not.toContain('CommonActions.reset');

    expect(src).toContain('R-W7-MOB-LEAVE-NAV-01-R3/R4');

  });



  it('navigateToManagerApprovals defers nested push until tab transition (R4)', () => {

    const src = readNavSrc('profileStackNav.ts');

    expect(src).toContain('requestAnimationFrame');

    expect(src).toContain("navigateProfileStackScreen(navigation, 'ManagerApprovals')");

  });



  it('index.ts imports react-native-gesture-handler before other app modules', () => {

    const index = fs.readFileSync(path.resolve(__dirname, '../../../index.ts'), 'utf8');

    const ghIdx = index.indexOf("import 'react-native-gesture-handler'");

    const guardIdx = index.indexOf("import './src/bootstrap/vectorIconFontsGuard'");

    expect(ghIdx).toBeGreaterThan(-1);

    expect(guardIdx).toBeGreaterThan(ghIdx);

  });



  it('App.tsx wraps tree in GestureHandlerRootView for SwipeableRow', () => {

    const app = fs.readFileSync(path.resolve(__dirname, '../../../App.tsx'), 'utf8');

    expect(app).toContain('GestureHandlerRootView');

    expect(app).toMatch(/GestureHandlerRootView[\s\S]*RootNavigator/);

  });



  it('DashboardScreen wires time_off tile to navigateToLeaveRequestsList', () => {

    const dash = fs.readFileSync(

      path.resolve(__dirname, '../../features/dashboard/DashboardScreen.tsx'),

      'utf8',

    );

    expect(dash).toContain('navigateToLeaveRequestsList');

    expect(dash).toContain("case 'time_off':");

    expect(dash).toContain('goLeaveList()');

    expect(dash).toContain('navigateToManagerApprovals');

  });



  it('ProfileStackNavigator registers leave + approvals after Profile root', () => {

    const root = fs.readFileSync(path.resolve(SRC, 'RootNavigator.tsx'), 'utf8');

    const profileIdx = root.indexOf('name="Profile"');

    const leaveIdx = root.indexOf('name="LeaveRequestsList"');

    const mgrIdx = root.indexOf('name="ManagerApprovals"');

    expect(profileIdx).toBeGreaterThan(-1);

    expect(leaveIdx).toBeGreaterThan(profileIdx);

    expect(mgrIdx).toBeGreaterThan(leaveIdx);

    expect(root).toContain('name="ManagerApprovals"');

  });



  it('useQaMatrixHomeLock uses single focusHome pin (no repeat jumpTo)', () => {

    const lock = readNavSrc('useQaMatrixHomeLock.ts');

    expect(lock).not.toContain('setInterval');

    expect(lock).not.toContain('setTimeout(focusHome');

  });

  it('ProfileScreen exposes manager approvals entry on default info tab (J-MOB-05)', () => {
    const profile = fs.readFileSync(
      path.resolve(__dirname, '../../features/profile/ProfileScreen.tsx'),
      'utf8',
    );
    const entry = fs.readFileSync(
      path.resolve(__dirname, '../../components/profile/ProfileManagerApprovalsEntry.tsx'),
      'utf8',
    );
    expect(profile).toContain('ProfileManagerApprovalsEntry');
    expect(profile).toContain('fetchManagerPendingSnapshot');
    expect(profile).toContain('navigateToManagerApprovals');
    expect(entry).toContain('PROFILE_APPROVALS_ENTRY_TEST_ID');
    expect(entry).toContain('Phê duyệt');
  });

  it('ProfileScreen exposes settings entry + stack nav helpers (MOB-NAV-SETTINGS-01)', () => {
    const profile = fs.readFileSync(
      path.resolve(__dirname, '../../features/profile/ProfileScreen.tsx'),
      'utf8',
    );
    const settingsEntry = fs.readFileSync(
      path.resolve(__dirname, '../../components/profile/ProfileSettingsEntry.tsx'),
      'utf8',
    );
    const nav = readNavSrc('profileStackNav.ts');
    const settings = fs.readFileSync(
      path.resolve(__dirname, '../../features/settings/SettingsScreen.tsx'),
      'utf8',
    );
    const scope = fs.readFileSync(
      path.resolve(__dirname, '../../features/auth/ScopeScreen.tsx'),
      'utf8',
    );

    expect(profile).toContain('ProfileSettingsEntry');
    expect(profile).toContain('navigateToSettings');
    expect(settingsEntry).toContain('PROFILE_SETTINGS_ENTRY_TEST_ID');
    expect(settingsEntry).toContain('vi.settings');
    expect(nav).toContain("navigateProfileStackScreen(navigation, 'Settings')");
    expect(nav).toContain("navigateProfileStackScreen(navigation, 'Scope')");
    expect(settings).toContain('settings-screen');
    expect(settings).toContain('settings-scope-link');
    expect(settings).toContain('Phạm vi công ty');
    expect(scope).toContain('SCOPE_SCREEN_TEST_ID');
  });

});

