import { describe, expect, it } from 'vitest';
import type { EmployeeRow } from '../../integrations/hrmEmployees';
import {
  buildProfilePersonalSections,
  canHrFullEmployeePatch,
  readEmployeeCustomFields,
  resolveGenderVi,
} from '../profileEssFields';

const base: EmployeeRow = {
  id: '6c887177-0000-4000-8000-000000000001',
  company_id: 'holding',
  employee_code: 'NV0001',
  email: 'uat.nv0001@xe.vn',
  full_name: 'Nguyễn Văn A',
  job_title_key: 'engineer',
  status: 'active',
  hired_at: '2024-01-15',
  custom_fields: {
    phone_number: '0901234567',
    gender: 'male',
    address: 'Quận 1, TP.HCM',
  },
};

describe('profileEssFields — PCOMP-W7-MOB-PROFILE-FULL', () => {
  it('reads custom_fields from employee row', () => {
    expect(readEmployeeCustomFields(base).phone_number).toBe('0901234567');
  });

  it('builds personal sections with phone and gender (no DOB year)', () => {
    const sections = buildProfilePersonalSections(base);
    const labels = sections.flatMap((s) => s.rows.map((r) => r.label));
    expect(labels).toContain('Số điện thoại');
    expect(labels).toContain('Giới tính');
    expect(labels).toContain('Địa chỉ');
    expect(resolveGenderVi('male')).toBe('Nam');
    const allValues = sections.flatMap((s) => s.rows.map((r) => r.value)).join(' ');
    expect(allValues).not.toMatch(/199\d/);
  });

  it('always shows phone/gender/address when custom_fields empty (J-MOB-12 shell)', () => {
    const sections = buildProfilePersonalSections({ ...base, custom_fields: {} });
    const labels = sections.flatMap((s) => s.rows.map((r) => r.label));
    expect(labels).toEqual(
      expect.arrayContaining(['Số điện thoại', 'Giới tính', 'Địa chỉ', 'Email', 'Mã nhân viên']),
    );
  });

  it('HR roles can full patch; employee cannot', () => {
    expect(canHrFullEmployeePatch(['hr_manager'])).toBe(true);
    expect(canHrFullEmployeePatch(['staff'])).toBe(false);
  });

  it('unknown gender → em dash (U72 M-F-09)', () => {
    expect(resolveGenderVi('male')).toBe('Nam');
    expect(resolveGenderVi('female')).toBe('Nữ');
    expect(resolveGenderVi('other')).toBe('Khác');
    expect(resolveGenderVi('nonbinary_x')).toBe('—');
  });
});
