import { ApiException } from '../common/api.exception';
import { signServiceJwt } from '../common/jwt-sign';
import {
  assertEmployeeUpdateAllowed,
  canFullEmployeeUpdate,
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

  it('assertEmployeeUpdateAllowed permits self avatar_url only', () => {
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

  it('assertEmployeeUpdateAllowed rejects self full_name patch', () => {
    const token = signServiceJwt({
      sub: 'uat.nv0001@xe.vn',
      tenantId: 'xevn',
      companyId: 'holding',
      employee_id: employeeId,
      roles: ['employee'],
    });
    expect(() =>
      assertEmployeeUpdateAllowed(employeeId, { full_name: 'New Name' }, `Bearer ${token}`),
    ).toThrow(
      expect.objectContaining<ApiException>({
        code: 'HRM-EMP-403',
      }),
    );
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
      expect.objectContaining<ApiException>({
        code: 'HRM-EMP-403',
      }),
    );
  });
});
