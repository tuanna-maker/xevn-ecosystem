import { ApiException } from '../common/api.exception';
import { signServiceJwt } from '../common/jwt-sign';
import { HrmDbService } from '../db/hrm-db.service';
import { EmployeesService } from './employees.service';

describe('EmployeesService', () => {
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

  it('throws deterministic update error for empty payload', async () => {
    const row = {
      id: '633e95b7-cf1b-469f-a0f8-4c91f3f35f80',
      company_id: 'holding',
      employee_code: 'NV001',
      email: 'ceo@xe.vn',
      full_name: 'Nguyen Van A',
      job_title_key: 'CEO',
      manager_id: null,
      status: 'active',
      hired_at: '2024-01-01',
      archived_at: null,
      custom_fields: {},
      created_at: '2024-01-01T00:00:00.000Z',
      updated_at: '2024-01-01T00:00:00.000Z',
    };
    db.query.mockResolvedValueOnce({ rows: [row] } as never);

    await expect(
      service.updateEmployee('633e95b7-cf1b-469f-a0f8-4c91f3f35f80', {}, 'holding'),
    ).rejects.toMatchObject<ApiException>({
      code: 'HRM-EMP-002',
    });
  });

  it('returns employee scoped by company_id', async () => {
    const row = {
      id: '633e95b7-cf1b-469f-a0f8-4c91f3f35f80',
      company_id: 'holding',
      employee_code: 'NV001',
      email: 'ceo@xe.vn',
      full_name: 'Nguyen Van A',
      job_title_key: 'CEO',
      manager_id: null,
      status: 'active',
      hired_at: '2024-01-01',
      archived_at: null,
      custom_fields: {},
      created_at: '2024-01-01T00:00:00.000Z',
      updated_at: '2024-01-01T00:00:00.000Z',
    };
    db.query.mockResolvedValueOnce({ rows: [row] } as never);

    const result = await service.getEmployeeById(row.id, { company_id: 'holding' });
    expect(result.id).toBe(row.id);
    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining('company_id = $2::text'),
      [row.id, 'holding'],
    );
  });

  it('finds employee with blank tenant_id when group CEO requests company_id=main (UAT legacy rows)', async () => {
    const token = signServiceJwt({
      sub: 'ceo@xe.vn',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    });
    const row = {
      id: '8d846eb9-fcf7-4fe3-8987-24c503d80ce3',
      company_id: 'holding',
      employee_code: 'NV002',
      email: 'legacy@xe.vn',
      full_name: 'Legacy Row',
      job_title_key: 'STAFF',
      manager_id: null,
      status: 'active',
      hired_at: '2024-01-01',
      archived_at: null,
      custom_fields: { tenant_id: '' },
      created_at: '2024-01-01T00:00:00.000Z',
      updated_at: '2024-01-01T00:00:00.000Z',
    };
    db.query.mockResolvedValueOnce({ rows: [row] } as never);

    const result = await service.getEmployeeById(
      row.id,
      { company_id: 'main' },
      `Bearer ${token}`,
      { tenantId: 'xevn' },
    );
    expect(result.id).toBe(row.id);
  });

  it('finds employee under holding when group CEO requests company_id=main (ADR scope rollup)', async () => {
    const token = signServiceJwt({
      sub: 'ceo@xe.vn',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    });
    const row = {
      id: '633e95b7-cf1b-469f-a0f8-4c91f3f35f80',
      company_id: 'holding',
      employee_code: 'NV001',
      email: 'ceo@xe.vn',
      full_name: 'Nguyen Van A',
      job_title_key: 'CEO',
      manager_id: null,
      status: 'active',
      hired_at: '2024-01-01',
      archived_at: null,
      custom_fields: { tenant_id: 'xevn' },
      created_at: '2024-01-01T00:00:00.000Z',
      updated_at: '2024-01-01T00:00:00.000Z',
    };
    db.query.mockResolvedValueOnce({ rows: [row] } as never);

    const result = await service.getEmployeeById(
      row.id,
      { company_id: 'main' },
      `Bearer ${token}`,
    );
    expect(result.id).toBe(row.id);
    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining('company_id = ANY'),
      expect.arrayContaining([row.id, expect.any(Array)]),
    );
    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining('NULLIF(TRIM(custom_fields'),
      expect.arrayContaining(['xevn']),
    );
  });

  it('throws deterministic not-found for get-by-id', async () => {
    db.query.mockResolvedValueOnce({ rows: [] } as never);
    await expect(
      service.getEmployeeById('633e95b7-cf1b-469f-a0f8-4c91f3f35f80', { company_id: 'holding' }),
    ).rejects.toMatchObject<ApiException>({ code: 'HRM-EMP-404' });
  });

  it('throws deterministic archive error when employee missing', async () => {
    db.query
      .mockResolvedValueOnce({ rows: [] } as never)
      .mockResolvedValueOnce({ rows: [] } as never)
      .mockResolvedValueOnce({ rows: [] } as never)
      .mockResolvedValueOnce({ rows: [] } as never);

    await expect(
      service.archiveEmployee('633e95b7-cf1b-469f-a0f8-4c91f3f35f80', 'holding'),
    ).rejects.toMatchObject<ApiException>({ code: 'HRM-EMP-404' });
  });
});
