import { describe, expect, it } from 'vitest';
import {
  EMP_EMPLOYMENT_STATUS_BOOTSTRAP_FALLBACK,
  EMP_EMPLOYMENT_STATUS_UAT_HONESTY,
  HRM_EMP_STATUS_KEY_CODE,
  HRM_EMP_STATUS_REASON_KEY_CODE,
  empEmploymentStatusesToPickerOptions,
  empStatusReasonsToPickerOptions,
  filterEmpStatusReasonsForStatus,
  formatEmpEmploymentStatusDisplay,
  isValidEmpEmploymentStatusKeyFormat,
  isValidEmpStatusReasonKeyFormat,
  normalizeEmpEmploymentStatusKey,
  parseEmpStatusReasonAppliesTo,
} from './empEmploymentStatusCatalog';

describe('empEmploymentStatusCatalog — pure helpers', () => {
  it('honesty + KEY constants', () => {
    expect(EMP_EMPLOYMENT_STATUS_UAT_HONESTY).toBe(false);
    expect(HRM_EMP_STATUS_KEY_CODE).toBe('HRM-EMP-STATUS-KEY');
    expect(HRM_EMP_STATUS_REASON_KEY_CODE).toBe('HRM-EMP-STATUS-REASON-KEY');
  });

  it('bootstrap closed-3 only for EFF=0', () => {
    expect(EMP_EMPLOYMENT_STATUS_BOOTSTRAP_FALLBACK).toHaveLength(3);
  });

  it('format validation open catalog', () => {
    expect(isValidEmpEmploymentStatusKeyFormat('active')).toBe(true);
    expect(isValidEmpEmploymentStatusKeyFormat('hr_st_custom_09')).toBe(true);
    // BE lowercases before format check — 'Active' → 'active' = valid.
    expect(isValidEmpEmploymentStatusKeyFormat('Active')).toBe(true);
    expect(isValidEmpEmploymentStatusKeyFormat('2leave')).toBe(false);
    expect(normalizeEmpEmploymentStatusKey('On-Leave')).toBe('on_leave');
  });

  it('map lists drop empty keys', () => {
    expect(
      empEmploymentStatusesToPickerOptions([
        { statusKey: 'a', nameVi: 'A' },
        { statusKey: null, nameVi: 'B' },
      ]),
    ).toHaveLength(1);
    expect(
      empStatusReasonsToPickerOptions([
        { reasonKey: 'r1', nameVi: 'R1' },
        { reasonKey: '  ', nameVi: 'R2' },
      ]),
    ).toHaveLength(1);
  });

  it('filterEmpStatusReasonsForStatus', () => {
    const filtered = filterEmpStatusReasonsForStatus(
      [
        { value: 'x', label: 'X', appliesToStatusKeys: ['inactive'] },
        { value: 'y', label: 'Y', appliesToStatusKeys: [] },
      ],
      'inactive',
    );
    expect(filtered.map((o) => o.value)).toEqual(['x', 'y']);
  });

  it('admin display + reason key helpers (FE-ADMIN twin)', () => {
    expect(formatEmpEmploymentStatusDisplay('active', 'Đang làm')).toBe('Đang làm (active)');
    expect(isValidEmpStatusReasonKeyFormat('resign_personal')).toBe(true);
    expect(parseEmpStatusReasonAppliesTo('On-Leave, inactive')).toEqual([
      'on_leave',
      'inactive',
    ]);
  });
});
