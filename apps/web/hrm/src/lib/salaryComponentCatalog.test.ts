import { describe, expect, it } from 'vitest';
import {
  collectAlienNestSalaryComponentCodes,
  comp01RejectMessageVi,
  isCodeInNestSalaryCatalog,
  nestSalaryComponentSoftWarn,
  nestSalaryComponentsToIdPickerOptions,
  nestSalaryComponentsToPickerOptions,
  PAY_SALARY_COMPONENT_EMPTY_NEST_HINT,
  PAY_SALARY_COMPONENT_UAT_HONESTY,
  resolveNestSalaryComponentLabel,
  withNestSalaryComponentHistoryOption,
} from './salaryComponentCatalog';

describe('salaryComponentCatalog (PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-CATALOG-CNS-FE-01)', () => {
  it('honesty stays false — no invent ready / formula LIVE', () => {
    expect(PAY_SALARY_COMPONENT_UAT_HONESTY).toBe(false);
    expect(PAY_SALARY_COMPONENT_EMPTY_NEST_HINT.length).toBeGreaterThan(20);
  });

  it('maps Nest rows to code picker; hides inactive; empty Nest → []', () => {
    expect(nestSalaryComponentsToPickerOptions([])).toEqual([]);
    const opts = nestSalaryComponentsToPickerOptions([
      { id: '1', code: 'base', name: 'Lương cơ bản', is_active: true },
      { id: '2', code: 'phu_cap_an', name: 'PC ăn', is_active: false },
      { id: '3', code: 'base', name: 'dup skip', is_active: true },
    ]);
    expect(opts).toEqual([{ value: 'base', label: 'Lương cơ bản', code: 'base' }]);
    expect(nestSalaryComponentsToPickerOptions(
      [{ id: '2', code: 'phu_cap_an', name: 'PC ăn', is_active: false }],
      { includeInactive: true },
    )).toHaveLength(1);
  });

  it('maps id picker for template lines', () => {
    const opts = nestSalaryComponentsToIdPickerOptions([
      { id: 'uuid-1', code: 'base', name: 'Lương cơ bản', is_active: true },
    ]);
    expect(opts[0]?.value).toBe('uuid-1');
    expect(opts[0]?.code).toBe('base');
    expect(opts[0]?.label).toContain('base');
  });

  it('membership + history + soft warn (VAL-PAY-CNS-07)', () => {
    const opts = nestSalaryComponentsToPickerOptions([
      { id: '1', code: 'LUONG_CB', name: 'Lương CB', is_active: true },
    ]);
    expect(isCodeInNestSalaryCatalog(opts, 'LUONG_CB')).toBe(true);
    expect(isCodeInNestSalaryCatalog(opts, 'INVENT')).toBe(false);
    expect(resolveNestSalaryComponentLabel(opts, 'INVENT')).toBe('INVENT');
    const withHist = withNestSalaryComponentHistoryOption(opts, 'retired_x');
    expect(withHist.some((o) => o.value === 'retired_x')).toBe(true);
    expect(nestSalaryComponentSoftWarn(0, 'INVENT', opts)).toBeNull();
    expect(nestSalaryComponentSoftWarn(1, 'LUONG_CB', opts)).toBeNull();
    expect(nestSalaryComponentSoftWarn(1, 'INVENT', opts)).toMatch(/Nest salary_components/);
  });

  it('AC-PAY-COMP-01 collect alien codes when catalog > 0', () => {
    const opts = nestSalaryComponentsToPickerOptions([
      { id: '1', code: 'base', name: 'Lương CB', is_active: true },
    ]);
    expect(collectAlienNestSalaryComponentCodes(['base', 'INVENT', ''], opts, 1)).toEqual([
      'INVENT',
    ]);
    expect(collectAlienNestSalaryComponentCodes(['base'], opts, 1)).toEqual([]);
    expect(collectAlienNestSalaryComponentCodes(['INVENT'], opts, 0)).toEqual([]);
    expect(comp01RejectMessageVi(['INVENT'])).toMatch(/AC-PAY-COMP-01/);
  });
});
