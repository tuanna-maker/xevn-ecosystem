import { describe, expect, it } from 'vitest';
import {
  HRM_EMP_STATUS_REASON_KEY_CODE,
  empStatusReasonToPickerOption,
  empStatusReasonsToPickerOptions,
  empStatusReasonsEffectiveQueryKey,
  filterEmpStatusReasonsForStatus,
  normalizeEmpStatusReasonKey,
  resolveEmpStatusReasonLabel,
} from './useEmpStatusReasonsEffective';

describe('PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-CATALOG-FE-01 — status reason helpers', () => {
  it('BE invent KEY code constant = HRM-EMP-STATUS-REASON-KEY', () => {
    expect(HRM_EMP_STATUS_REASON_KEY_CODE).toBe('HRM-EMP-STATUS-REASON-KEY');
  });

  it('normalize hyphen→underscore + lowercase', () => {
    expect(normalizeEmpStatusReasonKey('End-Of-Contract')).toBe('end_of_contract');
  });

  it('map effective row → option (value=reasonKey)', () => {
    expect(
      empStatusReasonToPickerOption({
        reasonKey: 'resigned_personal',
        nameVi: 'Xin nghỉ việc',
        appliesToStatusKeys: ['resigned'],
      }),
    ).toEqual({
      value: 'resigned_personal',
      label: 'Xin nghỉ việc',
      appliesToStatusKeys: ['resigned'],
    });
  });

  it('loại row thiếu reasonKey', () => {
    const opts = empStatusReasonsToPickerOptions([
      { reasonKey: 'a', nameVi: 'A' },
      { reasonKey: '', nameVi: 'B' },
    ]);
    expect(opts).toHaveLength(1);
  });

  it('filter applies_to — null = all; list = match status', () => {
    const options = [
      { value: 'all_reason', label: 'Chung', appliesToStatusKeys: null },
      { value: 'resigned_personal', label: 'NV', appliesToStatusKeys: ['resigned'] },
      { value: 'leave_medical', label: 'Y tế', appliesToStatusKeys: ['on_leave'] },
    ];
    expect(filterEmpStatusReasonsForStatus(options, 'resigned').map((o) => o.value)).toEqual([
      'all_reason',
      'resigned_personal',
    ]);
    expect(filterEmpStatusReasonsForStatus(options, 'on_leave').map((o) => o.value)).toEqual([
      'all_reason',
      'leave_medical',
    ]);
  });

  it('resolve nhãn reason', () => {
    const options = [{ value: 'resigned_personal', label: 'Xin nghỉ việc' }];
    expect(resolveEmpStatusReasonLabel(options, 'resigned_personal')).toBe('Xin nghỉ việc');
    expect(resolveEmpStatusReasonLabel(options, 'x')).toBe('x');
    expect(resolveEmpStatusReasonLabel(options, '')).toBe('—');
  });

  it('query key gắn company + applies_to', () => {
    expect(empStatusReasonsEffectiveQueryKey('trsport', 'resigned')).toEqual([
      'hrm-emp-status-reasons-effective',
      'trsport',
      'resigned',
    ]);
    expect(empStatusReasonsEffectiveQueryKey(null, null)).toEqual([
      'hrm-emp-status-reasons-effective',
      null,
      null,
    ]);
  });
});
