import { describe, expect, it } from 'vitest';
import {
  formatEmployeePickerLabel,
  looksLikeJobTitleCatalogCode,
  resolveEmployeeDepartmentLabel,
  resolveEmployeePositionLabel,
} from '@/lib/employeePickerLabel';

describe('BM-FE-HIRE-TITLE-01 / D-HRM-U72-LABEL-FE-02 — employeePickerLabel', () => {
  it('looksLikeJobTitleCatalogCode detects snake / SCREAMING codes', () => {
    expect(looksLikeJobTitleCatalogCode('LEGAL_SPECIALIST')).toBe(true);
    expect(looksLikeJobTitleCatalogCode('legal-specialist')).toBe(true);
    expect(looksLikeJobTitleCatalogCode('Chuyên viên Pháp chế')).toBe(false);
    expect(looksLikeJobTitleCatalogCode('CEO')).toBe(false);
  });

  it('resolveEmployeePositionLabel prefers job_title_label over raw key (AC-FD-U02)', () => {
    expect(
      resolveEmployeePositionLabel({
        job_title_key: 'LEGAL_SPECIALIST',
        custom_fields: { job_title_label: 'Chuyên viên Pháp chế' },
      }),
    ).toBe('Chuyên viên Pháp chế');
    expect(
      resolveEmployeePositionLabel({
        job_title_key: 'staff',
        custom_fields: { position: 'Chuyên viên HCNS' },
      }),
    ).toBe('Chuyên viên HCNS');
    expect(resolveEmployeePositionLabel({ position: 'CEO', job_title_key: 'staff' })).toBe('CEO');
  });

  it('never returns raw job_title_key when unknown (fail-closed)', () => {
    expect(resolveEmployeePositionLabel({ job_title_key: 'LEGAL_SPECIALIST' })).toBeNull();
    expect(resolveEmployeePositionLabel({ job_title_key: 'staff' })).toBeNull();
    expect(resolveEmployeePositionLabel({})).toBeNull();
  });

  it('resolves job_title_key via settings catalog options', () => {
    expect(
      resolveEmployeePositionLabel(
        { job_title_key: 'LEGAL_SPECIALIST' },
        [{ value: 'LEGAL_SPECIALIST', label: 'Chuyên viên Pháp chế' }],
      ),
    ).toBe('Chuyên viên Pháp chế');
  });

  it('resolveEmployeeDepartmentLabel does not fall back to job_title_key', () => {
    expect(
      resolveEmployeeDepartmentLabel({
        job_title_key: 'staff',
        custom_fields: { department: 'Vận hành' },
      }),
    ).toBe('Vận hành');
    expect(resolveEmployeeDepartmentLabel({ department: 'IT' })).toBe('IT');
    expect(resolveEmployeeDepartmentLabel({ job_title_key: 'staff' })).toBeNull();
  });

  it('formatEmployeePickerLabel shows CODE — Name · chức vụ (no raw key)', () => {
    expect(
      formatEmployeePickerLabel({
        employee_code: 'NV001',
        full_name: 'Nguyễn Văn A',
        job_title_key: 'staff',
      }),
    ).toBe('NV001 — Nguyễn Văn A');

    expect(
      formatEmployeePickerLabel({
        employee_code: 'HLD-0996',
        full_name: 'Phạm Đức Hùng',
        job_title_key: 'LEGAL_SPECIALIST',
        custom_fields: { job_title_label: 'Chuyên viên Pháp chế' },
      }),
    ).toBe('HLD-0996 — Phạm Đức Hùng · Chuyên viên Pháp chế');

    expect(
      formatEmployeePickerLabel({
        employee_code: 'NV002',
        full_name: 'Trần Thị B',
        position: 'Trưởng phòng',
        custom_fields: { department: 'HCNS' },
      }),
    ).toBe('NV002 — Trần Thị B · Trưởng phòng (HCNS)');

    expect(
      formatEmployeePickerLabel({
        employee_code: 'NV003',
        full_name: 'Lê C',
      }),
    ).toBe('NV003 — Lê C');
  });

  it('omits duplicate dept when same as title', () => {
    expect(
      formatEmployeePickerLabel({
        employee_code: 'NV004',
        full_name: 'Phạm D',
        position: 'HCNS',
        department: 'HCNS',
      }),
    ).toBe('NV004 — Phạm D · HCNS');
  });
});
