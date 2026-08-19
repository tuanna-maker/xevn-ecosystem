import { describe, expect, it } from 'vitest';
import { ApiClientError } from '@/lib/apiError';
import {
  EMP_POSITION_NEST_TABLE_DENIED,
  EMP_POSITION_UAT_HONESTY,
  HRM_EMP_POSITION_KEY_CODE,
  HRM_WH_PICK_EMPTY_CATALOG_CODE,
  HRM_WH_PICK_REQUIRED_CODE,
  empPositionKeyToastMessage,
  isEmpPositionInventKeyError,
  isEmpPositionKeyInCatalog,
  isValidEmpPositionKeyFormat,
  normalizeEmpPositionKey,
  resolveEmpPositionEditValue,
} from './empPositionCatalog';

describe('empPositionCatalog — pure helpers', () => {
  it('honesty + KEY constants + Nest DENY', () => {
    expect(EMP_POSITION_UAT_HONESTY).toBe(false);
    expect(EMP_POSITION_NEST_TABLE_DENIED).toBe(true);
    expect(HRM_EMP_POSITION_KEY_CODE).toBe('HRM-EMP-POSITION-KEY');
    expect(HRM_WH_PICK_REQUIRED_CODE).toBe('HRM-WH-PICK-REQUIRED');
    expect(HRM_WH_PICK_EMPTY_CATALOG_CODE).toBe('HRM-WH-PICK-EMPTY-CATALOG');
  });

  it('normalize + format validation', () => {
    expect(normalizeEmpPositionKey('  LEGAL_SPECIALIST  ')).toBe('LEGAL_SPECIALIST');
    expect(isValidEmpPositionKeyFormat('LEGAL_SPECIALIST')).toBe(true);
    expect(isValidEmpPositionKeyFormat('staff')).toBe(true);
    expect(isValidEmpPositionKeyFormat('2bad')).toBe(false);
    expect(isValidEmpPositionKeyFormat('')).toBe(false);
  });

  it('resolveEmpPositionEditValue — EFF>0 clears invent/STAFF out-of-catalog', () => {
    const opts = [
      { value: 'MGR', label: 'Quản lý', code: 'MGR' },
      { value: 'LEGAL_SPECIALIST', label: 'Chuyên viên Pháp chế', code: 'LEGAL_SPECIALIST' },
    ];
    expect(resolveEmpPositionEditValue(opts, 'LEGAL_SPECIALIST', true)).toBe('LEGAL_SPECIALIST');
    expect(resolveEmpPositionEditValue(opts, 'STAFF', true)).toBe('');
    expect(resolveEmpPositionEditValue(opts, 'staff', true)).toBe('');
    expect(resolveEmpPositionEditValue(opts, '', true)).toBe('');
  });

  it('resolveEmpPositionEditValue — EFF=0 keeps raw (empty CTA path · no invent SoT)', () => {
    expect(resolveEmpPositionEditValue([], 'STAFF', false)).toBe('STAFF');
  });

  it('isEmpPositionKeyInCatalog', () => {
    const opts = [{ value: 'MGR', label: 'Quản lý', code: 'MGR' }];
    expect(isEmpPositionKeyInCatalog(opts, 'MGR')).toBe(true);
    expect(isEmpPositionKeyInCatalog(opts, 'mgr')).toBe(true);
    expect(isEmpPositionKeyInCatalog(opts, 'STAFF')).toBe(false);
    expect(isEmpPositionKeyInCatalog(opts, '')).toBe(true);
  });

  it('invent KEY toast surfaces POSITION + WH alias', () => {
    const posErr = new ApiClientError({
      code: HRM_EMP_POSITION_KEY_CODE,
      message: 'Invent job title',
      status: 400,
    });
    const whErr = new ApiClientError({
      code: HRM_WH_PICK_REQUIRED_CODE,
      message: '',
      status: 400,
    });
    expect(isEmpPositionInventKeyError(posErr)).toBe(true);
    expect(isEmpPositionInventKeyError(whErr)).toBe(true);
    expect(empPositionKeyToastMessage(posErr, 'fallback')).toBe('Invent job title');
    expect(empPositionKeyToastMessage(whErr, 'fallback')).toMatch(/danh mục hiệu lực/i);
  });

  it('source-scan — mutations + form + WH wire POSITION KEY / empty CTA', async () => {
    const fs = await import('node:fs/promises');
    const path = await import('node:path');
    const root = path.resolve(__dirname, '..');
    const mutations = await fs.readFile(path.join(root, 'hooks/useEmployeeMutations.ts'), 'utf8');
    const form = await fs.readFile(
      path.join(root, 'components/employee/EmployeeFormDialog.tsx'),
      'utf8',
    );
    const wh = await fs.readFile(
      path.join(root, 'components/employee/EmployeeWorkTimeline.tsx'),
      'utf8',
    );
    expect(mutations).toContain('empMutateKeyToastMessage');
    expect(mutations).toContain('normalizeEmpPositionKey');
    expect(mutations).toContain('job_title_key');
    expect(form).toContain('resolveEmpPositionEditValue');
    expect(form).toContain('jobTitleOptionsFromCatalog');
    expect(form).toContain('HRM_WH_PICK_EMPTY_CATALOG_CODE');
    expect(form).toContain('job_title_key');
    expect(wh).toContain('empPositionKeyToastMessage');
    expect(wh).toContain('HRM_WH_PICK_EMPTY_CATALOG_CODE');
    expect(wh).toContain('resolveWorkTimelinePositionFromCatalog');
    expect(wh).toContain('HDSD_MUTATE_TEST_IDS.workTimelinePositionPicker');
    // Nest emp_position dual master DENIED — no FE Nest route bind.
    expect(form).not.toMatch(/\/employees\/emp-positions/);
    expect(mutations).not.toMatch(/\/employees\/emp-positions/);
  });
});
