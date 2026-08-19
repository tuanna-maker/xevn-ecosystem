import { describe, expect, it } from 'vitest';
import {
  formatAttOtTypeDisplay,
  isValidAttOtTypeKeyFormat,
  normalizeAttOtTypeKey,
  parseAttOtTypeDefaultCoeff,
} from './attOtTypeAdminCatalog';

describe('attOtTypeAdminCatalog (PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-OT-FE-ADMIN-BUILD-FE-01)', () => {
  it('accepts open-catalog OT keys; rejects format-invalid', () => {
    expect(isValidAttOtTypeKeyFormat('night_shift_ot')).toBe(true);
    expect(isValidAttOtTypeKeyFormat('weekday')).toBe(true);
    expect(isValidAttOtTypeKeyFormat('9bad')).toBe(false);
    expect(isValidAttOtTypeKeyFormat('has-hyphen')).toBe(false);
  });

  it('normalizes + formats display-ready', () => {
    expect(normalizeAttOtTypeKey('  Night_Shift_OT  ')).toBe('night_shift_ot');
    expect(formatAttOtTypeDisplay('night_shift_ot', 'OT ca đêm')).toBe('OT ca đêm (night_shift_ot)');
  });

  it('parses defaultCoeff ≥0 (not payroll formula)', () => {
    expect(parseAttOtTypeDefaultCoeff('2.0')).toBe(2);
    expect(parseAttOtTypeDefaultCoeff('-1')).toBeNull();
    expect(parseAttOtTypeDefaultCoeff('abc')).toBeNull();
  });
});
