import { describe, expect, it } from 'vitest';
import {
  attLeaveTypeCategoryLabel,
  attLeaveTypesToPickerOptions,
  formatAttLeaveTypeDisplay,
  isValidAttLeaveTypeKeyFormat,
  normalizeAttLeaveTypeKey,
} from './attLeaveTypeCatalog';

describe('attLeaveTypeCatalog (PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-FE-01)', () => {
  it('accepts open-catalog format keys including #9+ style (hr_custom_09)', () => {
    expect(isValidAttLeaveTypeKeyFormat('hr_custom_09')).toBe(true);
    expect(isValidAttLeaveTypeKeyFormat('lvt_05')).toBe(true);
    expect(isValidAttLeaveTypeKeyFormat('annual')).toBe(true);
    expect(isValidAttLeaveTypeKeyFormat('sick_leave_extra')).toBe(true);
  });

  it('rejects format-only failures — not closed LVT_01..04 enum', () => {
    expect(isValidAttLeaveTypeKeyFormat('Annual')).toBe(false);
    expect(isValidAttLeaveTypeKeyFormat('9starts_digit')).toBe(false);
    expect(isValidAttLeaveTypeKeyFormat('BAD KEY')).toBe(false);
    expect(isValidAttLeaveTypeKeyFormat('')).toBe(false);
  });

  it('normalizes key to lowercase slug', () => {
    expect(normalizeAttLeaveTypeKey('  HR_CUSTOM_09  ')).toBe('hr_custom_09');
  });

  it('display-ready label never raw-key-only when nameVi present', () => {
    expect(formatAttLeaveTypeDisplay('hr_custom_09', 'Phép riêng HR')).toBe(
      'Phép riêng HR (hr_custom_09)',
    );
  });

  it('maps rows to picker options without FE LVT hardcode', () => {
    const opts = attLeaveTypesToPickerOptions([
      { leaveTypeKey: 'hr_custom_09', nameVi: 'Phép riêng HR' },
      { leaveTypeKey: 'annual', nameVi: 'Phép năm' },
    ]);
    expect(opts.map((o) => o.value)).toEqual(['hr_custom_09', 'annual']);
    expect(opts[0]?.label).toBe('Phép riêng HR');
    expect(attLeaveTypeCategoryLabel('sick')).toBe('Ốm / BHXH');
  });
});
