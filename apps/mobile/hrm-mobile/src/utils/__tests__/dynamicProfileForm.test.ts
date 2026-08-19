import { describe, expect, it } from 'vitest';
import type { EmployeeRow } from '../../integrations/hrmEmployees';
import {
  DEFAULT_W7_PERSONAL_FIELD_CATALOG,
  DYNAMIC_PROFILE_TOUCH_MIN,
  buildDynamicProfileFields,
  buildSelfEssCustomFieldsPatch,
  draftFromDynamicFields,
  filterEditableDynamicFields,
  parseSelectOptions,
  resolveEditableBy,
  resolveProfileFieldCatalog,
} from '../dynamicProfileForm';

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
    permanent_address: 'Quận 1, TP.HCM',
    date_of_birth: '1992-03-15',
  },
};

describe('dynamicProfileForm — PCOMP-W7-MOB-PROFILE-FULL', () => {
  it('AC-ESS-02: employee_code is never self-editable', () => {
    expect(resolveEditableBy('employee_code', { isHr: false })).toBe('none');
    expect(resolveEditableBy('employee_code', { isHr: true })).toBe('none');
  });

  it('AC-ESS-01: phone_number / work_phone are self-editable', () => {
    expect(resolveEditableBy('phone_number', { isHr: false })).toBe('self');
    expect(resolveEditableBy('work_phone', { isHr: false })).toBe('self');
  });

  it('BR-BDAY-01: date_of_birth never appears in built fields', () => {
    const fields = buildDynamicProfileFields(base, null, { isHr: false });
    expect(fields.some((f) => f.code === 'date_of_birth')).toBe(false);
    const joined = fields.map((f) => f.displayValue).join(' ');
    expect(joined).not.toMatch(/1992/);
  });

  it('always shows phone/gender/address labels even when custom_fields empty', () => {
    const empty: EmployeeRow = { ...base, custom_fields: {} };
    const fields = buildDynamicProfileFields(empty, null, { isHr: false });
    const codes = fields.map((f) => f.code);
    expect(codes).toContain('phone_number');
    expect(codes).toContain('gender');
    expect(codes).toContain('permanent_address');
    expect(fields.find((f) => f.code === 'phone_number')?.displayValue).toBe('â€”');
  });

  it('builds self editor for phone and read-only for email', () => {
    const fields = buildDynamicProfileFields(base, null, { isHr: false });
    const editable = filterEditableDynamicFields(fields, { isHr: false });
    expect(editable.map((f) => f.code)).toContain('phone_number');
    expect(editable.map((f) => f.code)).not.toContain('email');
    expect(fields.find((f) => f.code === 'gender')?.displayValue).toBe('Nam');
  });

  it('buildSelfEssCustomFieldsPatch merges only allowlisted dirty keys', () => {
    const existing = { phone_number: '0901234567', gender: 'male', tenant_id: 'xevn' };
    const patch = buildSelfEssCustomFieldsPatch(existing, {
      phone_number: '0911111111',
      gender: 'female',
      employee_code: 'HACK',
    });
    expect(patch).toEqual({
      phone_number: '0911111111',
      gender: 'male',
      tenant_id: 'xevn',
    });
  });

  it('buildSelfEssCustomFieldsPatch returns null when unchanged', () => {
    expect(
      buildSelfEssCustomFieldsPatch({ phone_number: '090' }, { phone_number: '090' }),
    ).toBeNull();
  });

  it('resolveProfileFieldCatalog falls back to DEFAULT_W7 set', () => {
    const catalog = resolveProfileFieldCatalog([]);
    expect(catalog.length).toBeGreaterThanOrEqual(DEFAULT_W7_PERSONAL_FIELD_CATALOG.length);
    expect(catalog.some((c) => c.code === 'phone_number')).toBe(true);
  });

  it('parseSelectOptions reads unit select:Nam|Nữ|Khác', () => {
    expect(parseSelectOptions('select:Nam|Nữ|Khác')).toEqual(['Nam', 'Nữ', 'Khác']);
  });

  it('draftFromDynamicFields only includes editable codes', () => {
    const fields = buildDynamicProfileFields(base, null, { isHr: false });
    const draft = draftFromDynamicFields(fields);
    expect(draft.phone_number).toBe('0901234567');
    expect(draft.employee_code).toBeUndefined();
  });

  it('touch target constant ≥ 44', () => {
    expect(DYNAMIC_PROFILE_TOUCH_MIN).toBeGreaterThanOrEqual(44);
  });
});
