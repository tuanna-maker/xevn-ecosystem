import { describe, expect, it } from 'vitest';

import { colors } from '../../theme/tokens';
import { PAYSLIP_HERO_TEST_ID } from '../payslipHero';

describe('payslipHero (J-MOB-34)', () => {
  it('exports stable testID for qa-device', () => {
    expect(PAYSLIP_HERO_TEST_ID).toBe('payslip-hero-card');
  });

  it('uses success gradient tokens per BR-ZEN-05', () => {
    expect(colors.payslipHeroGradientStart).toBe(colors.success);
    expect(colors.payslipHeroGradientEnd).toBe('#059669');
  });
});
