import { signServiceJwt } from '../common/jwt-sign';
import { HrmDbService } from '../db/hrm-db.service';
import { EmployeeInsurancesService } from './employee-insurances.service';

describe('EmployeeInsurancesService', () => {
  let service: EmployeeInsurancesService;
  let db: jest.Mocked<HrmDbService>;

  beforeEach(() => {
    db = {
      query: jest.fn(),
      onModuleDestroy: jest.fn(),
    } as unknown as jest.Mocked<HrmDbService>;
    db.query.mockResolvedValue({ rows: [] } as never);
    service = new EmployeeInsurancesService(db);
  });

  it('list scopes company_id for group CEO main', async () => {
    const token = signServiceJwt({
      sub: 'ceo@xe.vn',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    });
    db.query.mockImplementation(async (sql: string) => {
      if (sql.includes('FROM public.employee_insurances')) {
        return { rows: [] } as never;
      }
      return { rows: [] } as never;
    });

    await service.list({ company_id: 'main', employee_id: '00000000-0000-4000-8000-000000000010' }, `Bearer ${token}`);

    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining('company_id = ANY'),
      expect.arrayContaining([expect.any(Array)]),
    );
  });

  it('getById returns 404 when row missing', async () => {
    await expect(
      service.getById('00000000-0000-4000-8000-000000000001', 'main'),
    ).rejects.toMatchObject({
      code: 'HRM-EINS-404',
    });
  });
});
