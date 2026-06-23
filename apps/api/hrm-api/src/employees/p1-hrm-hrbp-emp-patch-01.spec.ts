import { signServiceJwt } from '../common/jwt-sign';
import { HrmDbService } from '../db/hrm-db.service';
import { EmployeesService } from './employees.service';

/**
 * P1-HRM-HRBP-EMP-PATCH-01 — member HRBP (`du-lich.hr@xe.vn`) PATCH employee
 * within `xe-du-lich` / `company_id=main` per ADR-HRM-RBAC-SCOPE-LADDER §3.3.
 */
describe('P1-HRM-HRBP-EMP-PATCH-01', () => {
  const hrbpEmployeeId = '33333333-3333-4333-8333-333333333333';
  const targetEmployeeId = '44444444-4444-4444-8444-444444444444';

  let service: EmployeesService;
  let db: jest.Mocked<HrmDbService>;

  beforeEach(() => {
    db = {
      query: jest.fn(),
      onModuleDestroy: jest.fn(),
    } as unknown as jest.Mocked<HrmDbService>;
    db.query.mockResolvedValue({ rows: [] } as never);
    service = new EmployeesService(db);
  });

  it('member HRBP portal JWT can PATCH job_title_key on tenant employee (main scope)', async () => {
    const token = signServiceJwt({
      sub: 'du-lich.hr@xe.vn',
      tenantId: 'xe-du-lich',
      companyId: 'main',
      roleCode: 'HRBP_MANAGER',
      employee_id: hrbpEmployeeId,
    });

    const baseRow = {
      id: targetEmployeeId,
      company_id: 'main',
      employee_code: 'MEMEMP440961',
      email: 'staff@xe-du-lich.local',
      full_name: 'Tourism Staff',
      job_title_key: 'STAFF',
      manager_id: null,
      status: 'active',
      hired_at: '2024-01-01',
      archived_at: null,
      avatar_url: null,
      custom_fields: { tenant_id: 'xe-du-lich' },
      created_at: '2024-01-01T00:00:00.000Z',
      updated_at: '2024-01-01T00:00:00.000Z',
    };
    const updatedRow = {
      ...baseRow,
      job_title_key: 'HR_SPECIALIST',
      updated_at: '2026-06-20T00:00:00.000Z',
    };

    db.query
      .mockResolvedValueOnce({ rows: [baseRow] } as never)
      .mockResolvedValueOnce({ rows: [updatedRow] } as never);

    const result = await service.updateEmployee(
      targetEmployeeId,
      { job_title_key: 'HR_SPECIALIST' },
      'main',
      `Bearer ${token}`,
    );

    expect(result.job_title_key).toBe('HR_SPECIALIST');
    expect(db.query).toHaveBeenLastCalledWith(
      expect.stringContaining('job_title_key = $1'),
      expect.arrayContaining(['HR_SPECIALIST', targetEmployeeId]),
    );
  });

  it('plain employee JWT still cannot PATCH another employee full_name', async () => {
    const token = signServiceJwt({
      sub: 'staff@xe-du-lich.local',
      tenantId: 'xe-du-lich',
      companyId: 'main',
      employee_id: hrbpEmployeeId,
      roles: ['employee'],
    });

    await expect(
      service.updateEmployee(
        targetEmployeeId,
        { full_name: 'Hacked' },
        'main',
        `Bearer ${token}`,
      ),
    ).rejects.toMatchObject({ code: 'HRM-EMP-403' });
  });
});
