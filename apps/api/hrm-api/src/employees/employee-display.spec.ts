import {
  buildEmployeeDisplayReadyFields,
  employeeStatusLabelVi,
  looksLikeJobTitleCatalogCode,
  resolveEmployeeJobTitleLabel,
} from './employee-display';

describe('employee-display (W1-B-02-EMP / OS 28)', () => {
  it('employeeStatusLabelVi maps known statuses to VI', () => {
    expect(employeeStatusLabelVi('active')).toBe('Đang làm việc');
    expect(employeeStatusLabelVi('inactive')).toBe('Ngừng hoạt động');
    expect(employeeStatusLabelVi('probation')).toBe('Thử việc');
    expect(employeeStatusLabelVi('unknown_x')).toBe('unknown_x');
    expect(employeeStatusLabelVi(null)).toBe('—');
  });

  it('looksLikeJobTitleCatalogCode detects snake / kebab only', () => {
    expect(looksLikeJobTitleCatalogCode('LEGAL_SPECIALIST')).toBe(true);
    expect(looksLikeJobTitleCatalogCode('legal-specialist')).toBe(true);
    expect(looksLikeJobTitleCatalogCode('CEO')).toBe(false);
    expect(looksLikeJobTitleCatalogCode('Chuyên viên Pháp chế')).toBe(false);
  });

  it('resolveEmployeeJobTitleLabel prefers denormalized VI label', () => {
    expect(
      resolveEmployeeJobTitleLabel('LEGAL_SPECIALIST', {
        job_title_label: 'Chuyên viên Pháp chế',
      }),
    ).toBe('Chuyên viên Pháp chế');
    expect(
      resolveEmployeeJobTitleLabel('staff', { position: 'Chuyên viên HCNS' }),
    ).toBe('Chuyên viên HCNS');
    expect(resolveEmployeeJobTitleLabel('CEO', {})).toBe('CEO');
    expect(resolveEmployeeJobTitleLabel('LEGAL_SPECIALIST', {})).toBeNull();
  });

  it('buildEmployeeDisplayReadyFields flattens dept/name/status for FE bind', () => {
    const fields = buildEmployeeDisplayReadyFields({
      full_name: ' Nguyễn Văn A ',
      status: 'active',
      job_title_key: 'LEGAL_SPECIALIST',
      custom_fields: {
        department: 'Pháp chế',
        job_title_label: 'Chuyên viên Pháp chế',
        phone_number: '0901234567',
      },
    });
    expect(fields).toEqual({
      status_label: 'Đang làm việc',
      department: 'Pháp chế',
      job_title_label: 'Chuyên viên Pháp chế',
      display_name: 'Nguyễn Văn A',
      phone_number: '0901234567',
    });
  });
});
