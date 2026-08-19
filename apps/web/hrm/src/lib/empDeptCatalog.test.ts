import { describe, expect, it } from 'vitest';
import { ApiClientError } from '@/lib/apiError';
import {
  EMP_DEPT_NEST_TABLE_DENIED,
  EMP_DEPT_UAT_HONESTY,
  HRM_EMP_DEPT_EMPTY_CATALOG_CODE,
  HRM_EMP_DEPT_KEY_CODE,
  HRM_WH_DEPT_KEY_CODE,
  empDeptKeyToastFirst,
  empDeptKeyToastMessage,
  isEmpDeptInventKeyError,
  isEmpDeptKeyInCatalog,
  mergeEmployeeDepartmentWriteFields,
  normalizeEmpDeptKey,
  resolveEmpDeptEditValue,
} from './empDeptCatalog';

describe('empDeptCatalog — pure helpers (R-PLT-EMP-DEPT-FE-01)', () => {
  it('honesty + KEY constants + Nest DENY', () => {
    expect(EMP_DEPT_UAT_HONESTY).toBe(false);
    expect(EMP_DEPT_NEST_TABLE_DENIED).toBe(true);
    expect(HRM_EMP_DEPT_KEY_CODE).toBe('HRM-EMP-DEPT-KEY');
    expect(HRM_WH_DEPT_KEY_CODE).toBe('HRM-WH-DEPT-KEY');
    expect(HRM_EMP_DEPT_EMPTY_CATALOG_CODE).toBe('HRM-EMP-DEPT-EMPTY-CATALOG');
  });

  it('normalize trims (keeps catalog casing)', () => {
    expect(normalizeEmpDeptKey('  SALES_DEPT  ')).toBe('SALES_DEPT');
    expect(normalizeEmpDeptKey('')).toBe('');
  });

  it('resolveEmpDeptEditValue — EFF>0 clears invent/legacy out-of-catalog', () => {
    const opts = [
      { value: 'SALES', label: 'Kinh doanh', code: 'SALES' },
      { value: 'WAREHOUSE', label: 'Kho vận', code: 'WAREHOUSE' },
    ];
    expect(resolveEmpDeptEditValue(opts, 'WAREHOUSE', true)).toBe('WAREHOUSE');
    expect(resolveEmpDeptEditValue(opts, 'warehouse', true)).toBe('WAREHOUSE');
    // Legacy free-text name-as-value out of EFF → clear (no invent SoT).
    expect(resolveEmpDeptEditValue(opts, 'Phòng ban cũ', true)).toBe('');
    expect(resolveEmpDeptEditValue(opts, '', true)).toBe('');
  });

  it('resolveEmpDeptEditValue — EFF=0 keeps raw (empty CTA path · no invent SoT)', () => {
    expect(resolveEmpDeptEditValue([], 'WAREHOUSE', false)).toBe('WAREHOUSE');
  });

  it('isEmpDeptKeyInCatalog', () => {
    const opts = [{ value: 'SALES', label: 'Kinh doanh', code: 'SALES' }];
    expect(isEmpDeptKeyInCatalog(opts, 'SALES')).toBe(true);
    expect(isEmpDeptKeyInCatalog(opts, 'sales')).toBe(true);
    expect(isEmpDeptKeyInCatalog(opts, 'WAREHOUSE')).toBe(false);
    expect(isEmpDeptKeyInCatalog(opts, '')).toBe(true);
  });

  it('invent KEY toast surfaces EMP-DEPT + WH-DEPT alias (≡ class)', () => {
    const deptErr = new ApiClientError({
      code: HRM_EMP_DEPT_KEY_CODE,
      message: 'Invent department',
      status: 400,
    });
    const whErr = new ApiClientError({
      code: HRM_WH_DEPT_KEY_CODE,
      message: '',
      status: 400,
    });
    expect(isEmpDeptInventKeyError(deptErr)).toBe(true);
    expect(isEmpDeptInventKeyError(whErr)).toBe(true);
    expect(empDeptKeyToastMessage(deptErr, 'fallback')).toBe('Invent department');
    expect(empDeptKeyToastMessage(whErr, 'fallback')).toMatch(/danh mục hiệu lực/i);
  });

  it('non-DEPT error → not invent KEY; delegates to next toast (chain)', () => {
    const posErr = new ApiClientError({
      code: 'HRM-EMP-POSITION-KEY',
      message: 'pos',
      status: 400,
    });
    expect(isEmpDeptInventKeyError(posErr)).toBe(false);
    // empDeptKeyToastFirst delegates non-DEPT errors to the provided next handler.
    const next = (_e: unknown, fb: string) => `NEXT:${fb}`;
    expect(empDeptKeyToastFirst(posErr, 'fb', next)).toBe('NEXT:fb');
    // DEPT error short-circuits before next.
    const deptErr = new ApiClientError({ code: HRM_EMP_DEPT_KEY_CODE, message: 'd', status: 400 });
    expect(empDeptKeyToastFirst(deptErr, 'fb', next)).toBe('d');
  });
});

describe('mergeEmployeeDepartmentWriteFields — custom_fields.department wire (R-PLT-EMP-DEPT-FE-01 FE-02)', () => {
  it('non-empty department → set custom_fields.department (BE rejects top-level)', () => {
    const out = mergeEmployeeDepartmentWriteFields('DEPT_01', {
      avatar_url: null,
      custom_fields: { BASIC_02: 'x' },
    });
    expect(out.custom_fields).toEqual({ BASIC_02: 'x', department: 'DEPT_01' });
    // Never surfaces a top-level `department` field (HRM-VAL-001 guard).
    expect('department' in out).toBe(false);
  });

  it('trims + overrides stale echoed custom_fields.department with fresh picker value', () => {
    const out = mergeEmployeeDepartmentWriteFields('  DEPT_04  ', {
      custom_fields: { department: 'DEPT_LEGACY', avatar_url: 'a' },
    });
    expect(out.custom_fields).toEqual({ department: 'DEPT_04', avatar_url: 'a' });
  });

  it('department === undefined → no change (partial update untouched)', () => {
    const write = { avatar_url: 'a', custom_fields: { department: 'DEPT_02' } };
    expect(mergeEmployeeDepartmentWriteFields(undefined, write)).toBe(write);
  });

  it('null/empty clears department but keeps sibling custom fields', () => {
    const out = mergeEmployeeDepartmentWriteFields(null, {
      custom_fields: { department: 'DEPT_02', BASIC_02: 'x' },
    });
    expect(out.custom_fields).toEqual({ BASIC_02: 'x' });
    expect(out.custom_fields?.department).toBeUndefined();
  });

  it('clear keeps empty custom_fields object when caller already provided one (propagate on update)', () => {
    const out = mergeEmployeeDepartmentWriteFields('', { custom_fields: { department: 'DEPT_02' } });
    expect(out.custom_fields).toEqual({});
  });

  it('clear with no prior custom_fields omits custom_fields (avoid empty write)', () => {
    const out = mergeEmployeeDepartmentWriteFields('', { avatar_url: 'a' });
    expect(out.custom_fields).toBeUndefined();
    expect(out.avatar_url).toBe('a');
  });
});
