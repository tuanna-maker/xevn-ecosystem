import { ApiException } from '../common/api.exception';
import { signServiceJwt } from '../common/jwt-sign';
import {
  assertEmployeeUpdateAllowed,
  canFullEmployeeUpdate,
  mergeSelfEssCustomFields,
  readJwtEmployeeId,
} from './employee-update-policy';

describe('employee-update-policy', () => {
  const employeeId = '11111111-1111-4111-8111-111111111111';

  it('readJwtEmployeeId reads employee_id claim', () => {
    const token = signServiceJwt({
      sub: 'uat.nv0001@xe.vn',
      tenantId: 'xevn',
      companyId: 'holding',
      employee_id: employeeId,
      roles: ['employee'],
    });
    expect(readJwtEmployeeId(`Bearer ${token}`)).toBe(employeeId);
  });

  it('canFullEmployeeUpdate is true for hr_manager role array', () => {
    const token = signServiceJwt({
      sub: 'hr.manager@xe.vn',
      tenantId: 'xevn',
      companyId: 'holding',
      employee_id: '22222222-2222-4222-8222-222222222222',
      roles: ['employee', 'manager', 'hr_manager'],
    });
    expect(canFullEmployeeUpdate(`Bearer ${token}`)).toBe(true);
  });

  it('canFullEmployeeUpdate is true for group_ceo roleCode', () => {
    const token = signServiceJwt({
      sub: 'ceo@xe.vn',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    });
    expect(canFullEmployeeUpdate(`Bearer ${token}`)).toBe(true);
  });

  it('canFullEmployeeUpdate is true for HRBP_MANAGER roleCode (member portal)', () => {
    const token = signServiceJwt({
      sub: 'du-lich.hr@xe.vn',
      tenantId: 'xe-du-lich',
      companyId: 'main',
      roleCode: 'HRBP_MANAGER',
    });
    expect(canFullEmployeeUpdate(`Bearer ${token}`)).toBe(true);
  });

  it('canFullEmployeeUpdate is true for hrbp_manager roles array', () => {
    const token = signServiceJwt({
      sub: 'du-lich.hr@xe.vn',
      tenantId: 'xe-du-lich',
      companyId: 'main',
      employee_id: '33333333-3333-4333-8333-333333333333',
      roles: ['employee', 'hrbp_manager'],
    });
    expect(canFullEmployeeUpdate(`Bearer ${token}`)).toBe(true);
  });

  it('assertEmployeeUpdateAllowed permits HRBP_MANAGER cross-employee job_title_key patch', () => {
    const token = signServiceJwt({
      sub: 'du-lich.hr@xe.vn',
      tenantId: 'xe-du-lich',
      companyId: 'main',
      roleCode: 'HRBP_MANAGER',
      employee_id: '33333333-3333-4333-8333-333333333333',
    });
    expect(() =>
      assertEmployeeUpdateAllowed(
        '44444444-4444-4444-8444-444444444444',
        { job_title_key: 'STAFF' },
        `Bearer ${token}`,
      ),
    ).not.toThrow();
  });

  it('assertEmployeeUpdateAllowed permits self avatar_url', () => {
    const token = signServiceJwt({
      sub: 'uat.nv0001@xe.vn',
      tenantId: 'xevn',
      companyId: 'holding',
      employee_id: employeeId,
      roles: ['employee'],
    });
    expect(() =>
      assertEmployeeUpdateAllowed(
        employeeId,
        { avatar_url: '/api/hrm/files/holding/avatar.jpg' },
        `Bearer ${token}`,
      ),
    ).not.toThrow();
  });

  it('AC-ESS-01: assertEmployeeUpdateAllowed permits self custom_fields phone_number/work_phone', () => {
    const token = signServiceJwt({
      sub: 'uat.nv0001@xe.vn',
      tenantId: 'xevn',
      companyId: 'holding',
      employee_id: employeeId,
      roles: ['employee'],
    });
    expect(() =>
      assertEmployeeUpdateAllowed(
        employeeId,
        {
          custom_fields: {
            phone_number: '0911111111',
            work_phone: '0281234567',
            gender: 'male',
            tenant_id: 'xevn',
          },
        },
        `Bearer ${token}`,
      ),
    ).not.toThrow();
  });

  it('assertEmployeeUpdateAllowed rejects self custom_fields without phone keys', () => {
    const token = signServiceJwt({
      sub: 'uat.nv0001@xe.vn',
      tenantId: 'xevn',
      companyId: 'holding',
      employee_id: employeeId,
      roles: ['employee'],
    });
    expect(() =>
      assertEmployeeUpdateAllowed(
        employeeId,
        { custom_fields: { gender: 'male', salary: '999' } },
        `Bearer ${token}`,
      ),
    ).toThrow(
      expect.objectContaining({
        code: 'HRM-EMP-403',
      }),
    );
  });

  it('assertEmployeeUpdateAllowed rejects self full_name patch', () => {
    const token = signServiceJwt({
      sub: 'uat.nv0001@xe.vn',
      tenantId: 'xevn',
      companyId: 'holding',
      employee_id: employeeId,
      roles: ['employee'],
    });
    expect(() =>
      assertEmployeeUpdateAllowed(
        employeeId,
        { full_name: 'New Name' },
        `Bearer ${token}`,
      ),
    ).toThrow(
      expect.objectContaining({
        code: 'HRM-EMP-403',
      }),
    );
  });

  it('Option A R1: self full_name denied even with manager|hr_manager roles', () => {
    const token = signServiceJwt({
      sub: 'uat.nv0001@xe.vn',
      tenantId: 'xevn',
      companyId: 'holding',
      employee_id: employeeId,
      roles: ['employee', 'manager', 'hr_manager'],
    });
    expect(canFullEmployeeUpdate(`Bearer ${token}`)).toBe(true);
    expect(() =>
      assertEmployeeUpdateAllowed(
        employeeId,
        { full_name: 'SHOULD_NOT_APPLY' },
        `Bearer ${token}`,
      ),
    ).toThrow(
      expect.objectContaining({
        code: 'HRM-EMP-403',
      }),
    );
  });

  it('Option A R1: self gender-only custom_fields denied with manager|hr_manager roles', () => {
    const token = signServiceJwt({
      sub: 'uat.nv0001@xe.vn',
      tenantId: 'xevn',
      companyId: 'holding',
      employee_id: employeeId,
      roles: ['employee', 'manager', 'hr_manager'],
    });
    expect(() =>
      assertEmployeeUpdateAllowed(
        employeeId,
        { custom_fields: { gender: 'female' } },
        `Bearer ${token}`,
      ),
    ).toThrow(
      expect.objectContaining({
        code: 'HRM-EMP-403',
      }),
    );
  });

  it('Option A R1: self phone custom_fields still allowed with manager|hr_manager roles', () => {
    const token = signServiceJwt({
      sub: 'uat.nv0001@xe.vn',
      tenantId: 'xevn',
      companyId: 'holding',
      employee_id: employeeId,
      roles: ['employee', 'manager', 'hr_manager'],
    });
    expect(() =>
      assertEmployeeUpdateAllowed(
        employeeId,
        {
          custom_fields: {
            phone_number: '0911111111',
            work_phone: '0281234567',
            gender: 'male',
          },
        },
        `Bearer ${token}`,
      ),
    ).not.toThrow();
  });

  it('Option A R1: manager|hr_manager may still full-update a different employee', () => {
    const token = signServiceJwt({
      sub: 'uat.nv0001@xe.vn',
      tenantId: 'xevn',
      companyId: 'holding',
      employee_id: employeeId,
      roles: ['employee', 'manager', 'hr_manager'],
    });
    expect(() =>
      assertEmployeeUpdateAllowed(
        '22222222-2222-4222-8222-222222222222',
        { full_name: 'Other Employee' },
        `Bearer ${token}`,
      ),
    ).not.toThrow();
  });

  it('assertEmployeeUpdateAllowed rejects cross-employee avatar patch', () => {
    const token = signServiceJwt({
      sub: 'uat.nv0001@xe.vn',
      tenantId: 'xevn',
      companyId: 'holding',
      employee_id: employeeId,
      roles: ['employee'],
    });
    expect(() =>
      assertEmployeeUpdateAllowed(
        '22222222-2222-4222-8222-222222222222',
        { avatar_url: '/api/hrm/files/holding/avatar.jpg' },
        `Bearer ${token}`,
      ),
    ).toThrow(
      expect.objectContaining({
        code: 'HRM-EMP-403',
      }),
    );
  });

  it('mergeSelfEssCustomFields applies only phone keys and preserves others', () => {
    const merged = mergeSelfEssCustomFields(
      {
        phone_number: '0901234567',
        gender: 'male',
        tenant_id: 'xevn',
        salary: '1000',
      },
      {
        phone_number: '0911111111',
        work_phone: '0289999999',
        gender: 'female',
        salary: '999999',
        tenant_id: 'hacked',
      },
    );
    expect(merged).toEqual({
      phone_number: '0911111111',
      work_phone: '0289999999',
      gender: 'male',
      tenant_id: 'xevn',
      salary: '1000',
    });
  });

  it('mergeSelfEssCustomFields clears phone key when empty string', () => {
    const merged = mergeSelfEssCustomFields(
      { phone_number: '0901234567', work_phone: '028' },
      { phone_number: '  ', work_phone: '028123' },
    );
    expect(merged).toEqual({ work_phone: '028123' });
  });
});
