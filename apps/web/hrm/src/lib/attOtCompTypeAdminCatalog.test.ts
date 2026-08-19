import { describe, expect, it } from 'vitest';
import {
  formatAttOtCompTypeDisplay,
  isValidAttOtCompTypeKeyFormat,
  normalizeAttOtCompTypeKey,
} from './attOtCompTypeAdminCatalog';

describe('attOtCompTypeAdminCatalog (PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-OT-FE-ADMIN-BUILD-FE-01)', () => {
  it('accepts open-catalog OTC keys; rejects format-invalid', () => {
    expect(isValidAttOtCompTypeKeyFormat('cash_plus_leave')).toBe(true);
    expect(isValidAttOtCompTypeKeyFormat('salary')).toBe(true);
    expect(isValidAttOtCompTypeKeyFormat('9bad')).toBe(false);
    expect(isValidAttOtCompTypeKeyFormat('BAD KEY')).toBe(false);
  });

  it('normalizes + formats display-ready', () => {
    expect(normalizeAttOtCompTypeKey('  Cash_Plus_Leave  ')).toBe('cash_plus_leave');
    expect(formatAttOtCompTypeDisplay('cash_plus_leave', 'Tiền + nghỉ bù')).toBe(
      'Tiền + nghỉ bù (cash_plus_leave)',
    );
  });
});
