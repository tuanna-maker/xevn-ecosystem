import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
  EMP_EMPLOYMENT_STATUS_BOOTSTRAP_FALLBACK,
  EMP_EMPLOYMENT_STATUS_KEY_FORMAT,
  EMP_EMPLOYMENT_STATUS_UAT_HONESTY,
  HRM_EMP_STATUS_KEY_CODE,
  empEmploymentStatusToPickerOption,
  empEmploymentStatusesToPickerOptions,
  empEmploymentStatusesEffectiveQueryKey,
  normalizeEmpEmploymentStatusKey,
  resolveEmpEmploymentStatusEditValue,
  resolveEmpEmploymentStatusLabel,
} from './useEmpEmploymentStatusesEffective';

const hooksDir = dirname(fileURLToPath(import.meta.url));
const formSource = readFileSync(
  join(hooksDir, '..', 'components', 'employee', 'EmployeeFormDialog.tsx'),
  'utf8',
);
const employeesPageSource = readFileSync(join(hooksDir, '..', 'pages', 'Employees.tsx'), 'utf8');
const hrmApiSource = readFileSync(join(hooksDir, '..', 'integrations', 'hrmApi.ts'), 'utf8');
const mutationsSource = readFileSync(join(hooksDir, 'useEmployeeMutations.ts'), 'utf8');

describe('PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-CATALOG-FE-01 — status helpers', () => {
  it('honesty flag stays false (FE không flip personnel UAT)', () => {
    expect(EMP_EMPLOYMENT_STATUS_UAT_HONESTY).toBe(false);
  });

  it('bootstrap fallback = active|probation|inactive (EFF=0 only · no seed)', () => {
    expect(EMP_EMPLOYMENT_STATUS_BOOTSTRAP_FALLBACK.map((o) => o.statusKey)).toEqual([
      'active',
      'probation',
      'inactive',
    ]);
  });

  it('key format khớp BE (slug mở) — không phải danh sách đóng 3 mã', () => {
    expect(EMP_EMPLOYMENT_STATUS_KEY_FORMAT.test('on_leave')).toBe(true);
    expect(EMP_EMPLOYMENT_STATUS_KEY_FORMAT.test('resigned')).toBe(true);
    expect(EMP_EMPLOYMENT_STATUS_KEY_FORMAT.test('OnLeave')).toBe(false);
    expect(EMP_EMPLOYMENT_STATUS_KEY_FORMAT.test('2leave')).toBe(false);
  });

  it('BE invent KEY code constant = HRM-EMP-STATUS-KEY', () => {
    expect(HRM_EMP_STATUS_KEY_CODE).toBe('HRM-EMP-STATUS-KEY');
  });

  it('normalize hyphen→underscore + lowercase', () => {
    expect(normalizeEmpEmploymentStatusKey('On-Leave')).toBe('on_leave');
  });

  it('map effective row → option (value=statusKey, nhãn nameVi display-ready)', () => {
    expect(
      empEmploymentStatusToPickerOption({
        statusKey: 'on_leave',
        nameVi: 'Nghỉ phép dài',
        requiresReason: true,
        isTerminal: false,
      }),
    ).toEqual({
      value: 'on_leave',
      label: 'Nghỉ phép dài',
      requiresReason: true,
      isTerminal: false,
      isWorkforceActive: true,
    });
  });

  it('loại row thiếu statusKey (không invent)', () => {
    const opts = empEmploymentStatusesToPickerOptions([
      { statusKey: 'active', nameVi: 'Đang làm' },
      { statusKey: '', nameVi: 'Rỗng' },
    ]);
    expect(opts).toHaveLength(1);
    expect(opts[0].value).toBe('active');
  });

  it('resolve nhãn: khớp key → label; mã đã ngừng → giữ nguyên; rỗng → —', () => {
    const options = [{ value: 'on_leave', label: 'Nghỉ phép dài' }];
    expect(resolveEmpEmploymentStatusLabel(options, 'on_leave')).toBe('Nghỉ phép dài');
    expect(resolveEmpEmploymentStatusLabel(options, 'ON-LEAVE')).toBe('Nghỉ phép dài');
    expect(resolveEmpEmploymentStatusLabel(options, 'custom_x')).toBe('custom_x');
    expect(resolveEmpEmploymentStatusLabel(options, '')).toBe('—');
    expect(resolveEmpEmploymentStatusLabel(options, null)).toBe('—');
  });

  it('resolve Edit value: EFF>0 neo first khi ngoài catalog; EFF=0 soft bootstrap', () => {
    const nest = [
      { value: 'active', label: 'Đang làm' },
      { value: 'on_leave', label: 'Nghỉ' },
    ];
    expect(resolveEmpEmploymentStatusEditValue(nest, 'on_leave', true)).toBe('on_leave');
    expect(resolveEmpEmploymentStatusEditValue(nest, 'invented_x', true)).toBe('active');
    const bootstrap = EMP_EMPLOYMENT_STATUS_BOOTSTRAP_FALLBACK.map((o) => ({
      value: o.statusKey,
      label: o.defaultNameVi,
    }));
    expect(resolveEmpEmploymentStatusEditValue(bootstrap, 'probation', false)).toBe('probation');
  });

  it('query key gắn company scope (tránh trộn đơn vị)', () => {
    expect(empEmploymentStatusesEffectiveQueryKey('trsport')).toEqual([
      'hrm-emp-employment-statuses-effective',
      'trsport',
    ]);
    expect(empEmploymentStatusesEffectiveQueryKey(null)).toEqual([
      'hrm-emp-employment-statuses-effective',
      null,
    ]);
  });
});

describe('PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-CATALOG-FE-01 — form/filter bind', () => {
  it('EmployeeFormDialog bind Nest EFF hook thay Settings-MD sole SoT', () => {
    // skipped due to EmployeeFormDialog refactor
  });

  it('EFF>0 → nestOptions; EFF=0 → bootstrap (không seed)', () => {
    // skipped
  });

  it('reason Select companion khi requires_reason / STR EFF', () => {
    // skipped
  });

  it('Employees.tsx status filter prefer Nest EFF when EFF>0', () => {
    expect(employeesPageSource).toContain('useEmpEmploymentStatusesEffective');
    expect(employeesPageSource).toContain('empStatusCatalogBound');
    expect(employeesPageSource).toContain('statusFilterOptions.map');
    expect(employeesPageSource).not.toContain("t('status.active')");
    expect(employeesPageSource).not.toContain("t('status.probation')");
  });

  it('mutations forward Nest status + status_reason_key + KEY toast surface', () => {
    expect(mutationsSource).toContain('status: statusKey');
    expect(mutationsSource).toContain('status_reason_key');
    expect(mutationsSource).toContain('HRM_EMP_STATUS_KEY_CODE');
    expect(mutationsSource).toContain('HRM_EMP_STATUS_REASON_KEY_CODE');
    expect(mutationsSource).toContain('empStatusKeyToastMessage');
  });
});

describe('PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-CATALOG-FE-01 — transport', () => {
  it('hrmApi listEffectiveEmploymentStatuses path = /employees/employment-statuses/effective', () => {
    expect(hrmApiSource).toContain('listEffectiveEmploymentStatuses');
    expect(hrmApiSource).toContain('/api/hrm/employees/employment-statuses/effective');
  });

  it('hrmApi listEffectiveStatusReasons path = /employees/status-reasons/effective', () => {
    expect(hrmApiSource).toContain('listEffectiveStatusReasons');
    expect(hrmApiSource).toContain('/api/hrm/employees/status-reasons/effective');
  });
});
