import { MobileAuthService } from '../auth/mobile-auth.service';

describe('P1-G3-JMOB-05-PERSONA-NV2-FIX', () => {
  const employeeId = '3796d949-4513-45c0-88fa-33030a062b17';
  const managerId = 'a1b2c3d4-e5f6-4789-a012-3456789abcde';

  it('mobile login COO row issues manager JWT + is_manager flag', async () => {
    const auth = new MobileAuthService({ query: jest.fn() } as never);
    const roles = await auth.resolveRolesForEmployee({
      id: managerId,
      company_id: 'trsport',
      email: 'uat.nv0002@xe.vn',
      full_name: 'UAT COO',
      employee_code: 'TRS-0002',
      job_title_key: 'COO',
      custom_fields: { mobile_persona: 'mgr' },
    });
    expect(roles).toEqual(expect.arrayContaining(['employee', 'manager']));
    expect(auth.isManagerRoles(roles)).toBe(true);
  });

  it('mobile login STAFF + mobile_persona emp stays non-manager when 0 direct reports', async () => {
    const auth = new MobileAuthService({
      query: jest.fn().mockResolvedValue({ rows: [{ count: 0 }] }),
    } as never);
    const roles = await auth.resolveRolesForEmployee({
      id: employeeId,
      company_id: 'holding',
      email: 'uat.nv0001@xe.vn',
      full_name: 'UAT NV',
      employee_code: 'HLD-0001',
      job_title_key: 'STAFF',
      custom_fields: { mobile_persona: 'emp' },
    });
    expect(roles).toEqual(['employee']);
    expect(auth.isManagerRoles(roles)).toBe(false);
  });

  it('R-SPINE-MGR-HIER-01: emp persona + directReports>0 grants manager (BR-MOB-MGR-REPORTS-01)', async () => {
    const auth = new MobileAuthService({
      query: jest.fn().mockResolvedValue({ rows: [{ count: 3 }] }),
    } as never);
    const roles = await auth.resolveRolesForEmployee({
      id: employeeId,
      company_id: 'holding',
      email: 'uat.nv0001@xe.vn',
      full_name: 'UAT NV',
      employee_code: 'HLD-0001',
      job_title_key: 'STAFF',
      custom_fields: { mobile_persona: 'emp', is_manager: 'false' },
    });
    expect(roles).toEqual(expect.arrayContaining(['employee', 'manager']));
    expect(auth.isManagerRoles(roles)).toBe(true);
  });
});
