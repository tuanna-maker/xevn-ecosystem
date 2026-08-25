import { describe, expect, it } from 'vitest';
import {
  foldPayFormulaSearchText,
  isPayFormulaShiftUnitEnabled,
  payDataFieldLabel,
  PAY_DATA_FIELD_CATALOG,
  searchPayDataFields,
  searchPayFormulaPickerFields,
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
    const hits = searchPayDataFields('', 10);
    expect(hits.length).toBeLessThanOrEqual(10);
    expect(hits.some((h) => h.key === 'base_salary')).toBe(true);
    expect(hits.some((h) => h.key === 'allowance_p2')).toBe(true);
  });

  it('search p2 finds allowance_p2 for LUONG_CO_BAN formula', () => {
    const hits = searchPayDataFields('p2', 10);
    expect(hits.some((h) => h.key === 'allowance_p2')).toBe(true);
  });

  it('foldPayFormulaSearchText strips Vietnamese diacritics', () => {
    expect(foldPayFormulaSearchText('Lương cơ bản')).toBe('luong co ban');
    expect(foldPayFormulaSearchText('Phụ cấp P2')).toBe('phu cap p2');
  });

  it('search without diacritics matches Vietnamese labels', () => {
    expect(searchPayDataFields('luong co ban', 10).some((h) => h.key === 'base_salary')).toBe(
      true,
    );
    expect(searchPayDataFields('phu cap', 10).some((h) => h.key === 'allowance_p2')).toBe(true);
    expect(searchPayDataFields('thu nhap bo sung', 10).some((h) => h.key === 'allowance_p2')).toBe(
      true,
    );
    expect(searchPayDataFields('gio cong', 10).some((h) => h.key === 'payable_hours')).toBe(true);
    expect(searchPayDataFields('nghi phep', 10).some((h) => h.key === 'paid_leave_hours')).toBe(
      true,
    );
  });

  it('payDataFieldLabel resolves known keys', () => {
    expect(payDataFieldLabel('base_salary')).toContain('Lương cơ bản');
  });

  it('catalog has core + input pack fields', () => {
    expect(PAY_DATA_FIELD_CATALOG.length).toBeGreaterThanOrEqual(20);
  });

  it('searchPayFormulaPickerFields finds salary components by Vietnamese name and code', () => {
    const hits = searchPayFormulaPickerFields('lương theo công', 20, {
      salaryComponents: [
        {
          componentCode: 'LUONG_THEO_CONG',
          insertToken: 'base_salary',
          name: 'Lương theo công',
          formula: '=base_salary*payable_hours/standard_hours',
        },
      ],
    });
    expect(hits.some((h) => h.group === 'salary_component' && h.label === 'Lương theo công')).toBe(
      true,
    );

    const byCode = searchPayFormulaPickerFields('luong_theo_cong', 20, {
      salaryComponents: [
        {
          componentCode: 'LUONG_THEO_CONG',
          insertToken: 'base_salary',
          name: 'Lương theo công',
        },
      ],
    });
    expect(byCode.some((h) => h.key === 'base_salary')).toBe(true);
  });
});
