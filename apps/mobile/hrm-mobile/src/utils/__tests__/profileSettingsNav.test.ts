import { describe, expect, it } from 'vitest';

import {
  PROFILE_SETTINGS_ENTRY_TEST_ID,
  SCOPE_SCREEN_TEST_ID,
  SETTINGS_SCOPE_LINK_TEST_ID,
  SETTINGS_SCREEN_TEST_ID,
} from '../profileSettingsNav';

describe('profileSettingsNav — MOB-NAV-SETTINGS-01', () => {
  it('exposes stable testIDs for qa-device harness', () => {
    expect(PROFILE_SETTINGS_ENTRY_TEST_ID).toBe('profile-settings-entry');
    expect(SETTINGS_SCREEN_TEST_ID).toBe('settings-screen');
    expect(SETTINGS_SCOPE_LINK_TEST_ID).toBe('settings-scope-link');
    expect(SCOPE_SCREEN_TEST_ID).toBe('scope-screen');
  });
});
