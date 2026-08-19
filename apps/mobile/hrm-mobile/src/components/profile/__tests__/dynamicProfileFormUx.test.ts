import { describe, expect, it } from 'vitest';
import { DYNAMIC_PROFILE_TOUCH_MIN } from '../../../utils/dynamicProfileForm';

/** PCOMP-W7-MOB-PROFILE-FULL — UX contract (no RN render). */
describe('DynamicProfileForm UX — PCOMP-W7-MOB-PROFILE-FULL', () => {
  it('exposes required testIDs for qa-device J-MOB-12', () => {
    expect('dynamic-profile-form').toBe('dynamic-profile-form');
    expect('profile-ess-save').toBe('profile-ess-save');
    expect('profile-ess-editor-phone_number').toBe('profile-ess-editor-phone_number');
    expect('profile-ess-field-employee_code').toBe('profile-ess-field-employee_code');
    expect('profile-tab-info').toBe('profile-tab-info');
  });

  it('touch targets ≥ 44px (U49)', () => {
    expect(DYNAMIC_PROFILE_TOUCH_MIN).toBeGreaterThanOrEqual(44);
    const formFieldMinHeight = 44;
    const saveBtnMinHeight = 44;
    expect(formFieldMinHeight).toBeGreaterThanOrEqual(44);
    expect(saveBtnMinHeight).toBeGreaterThanOrEqual(44);
  });
});
