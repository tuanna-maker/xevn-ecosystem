import { describe, expect, it } from 'vitest';
import {
  isPayFormulaShiftUnitEnabled,
  payDataFieldLabel,
  PAY_DATA_FIELD_CATALOG,
  searchPayDataFields,
  searchPayFormulaQuickInserts,
  suggestPayFormulaQuickInserts,
} from './payDataFieldCatalog';

describe('payDataFieldCatalog', () => {
  it('search matches Vietnamese label not only key', () => {
    const hits = searchPayDataFields('giờ công', 20);
    expect(hits.some((h) => h.key === 'payable_hours')).toBe(true);
  });

  it('search by nghỉ phép finds leave hours field', () => {
    const hits = searchPayDataFields('nghỉ phép', 20);
    expect(hits.some((h) => h.key === 'paid_leave_hours')).toBe(true);
  });

  it('no buổi quick insert when unit is hours', () => {
    expect(searchPayFormulaQuickInserts('buổi nghỉ', 'hours')).toEqual([]);
    expect(suggestPayFormulaQuickInserts('buổi', 'hours')).toEqual([]);
  });

  it('buổi quick insert only when shift unit enabled', () => {
    expect(isPayFormulaShiftUnitEnabled('hours')).toBe(false);
    expect(isPayFormulaShiftUnitEnabled('shift')).toBe(true);
    const hits = searchPayFormulaQuickInserts('buổi nghỉ', 'shift');
    expect(hits.some((h) => h.insert.includes('paid_leave_hours'))).toBe(true);
  });

  it('empty search returns popular fields only', () => {
    const hits = searchPayDataFields('', 8);
    expect(hits.length).toBeLessThanOrEqual(8);
    expect(hits.some((h) => h.key === 'base_salary')).toBe(true);
  });

  it('payDataFieldLabel resolves known keys', () => {
    expect(payDataFieldLabel('base_salary')).toContain('Lương cơ bản');
  });

  it('catalog has core + input pack fields', () => {
    expect(PAY_DATA_FIELD_CATALOG.length).toBeGreaterThanOrEqual(20);
  });
});
