import { describe, expect, it } from 'vitest';
import { parseEmployeeFieldsFromCatalogsOverview } from '../hrmEmployeeFieldsCatalog';

describe('hrmEmployeeFieldsCatalog — PCOMP-W7-MOB-PROFILE-FULL', () => {
  it('parses personal + basic fields from settings-catalogs overview', () => {
    const parsed = parseEmployeeFieldsFromCatalogsOverview({
      catalogs: [
        {
          catalogKey: 'hrm_employee_personal_fields',
          effectiveItems: [
            { code: 'phone_number', label: 'Số điện thoại', unit: 'phone', status: 'active' },
            { code: 'gender', label: 'Giới tính', unit: 'select:Nam|Nữ|Khác', status: 'active' },
            { code: 'date_of_birth', label: 'Ngày sinh', unit: 'date', status: 'active' },
          ],
        },
        {
          catalog_key: 'hrm_employee_basic_fields',
          hrmExtensionItems: [
            { code: 'employee_code', label: 'Mã nhân sự', unit: 'text', status: 'active' },
          ],
        },
        {
          catalogKey: 'hrm_leave_types',
          items: [{ code: 'annual', label: 'Nghỉ phép', unit: 'text', status: 'active' }],
        },
      ],
    });
    const codes = parsed.map((p) => p.code);
    expect(codes).toContain('phone_number');
    expect(codes).toContain('employee_code');
    expect(codes).toContain('date_of_birth');
    expect(codes).not.toContain('annual');
  });

  it('returns empty array on malformed payload', () => {
    expect(parseEmployeeFieldsFromCatalogsOverview(null)).toEqual([]);
    expect(parseEmployeeFieldsFromCatalogsOverview({})).toEqual([]);
  });
});
