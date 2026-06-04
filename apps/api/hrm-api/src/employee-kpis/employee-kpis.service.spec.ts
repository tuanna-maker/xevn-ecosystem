import { signServiceJwt } from '../common/jwt-sign';
import { HrmDbService } from '../db/hrm-db.service';
import { EmployeeKpisService } from './employee-kpis.service';

describe('EmployeeKpisService', () => {
  it('list applies company scope rollup', async () => {
    const db = {
      query: jest.fn().mockResolvedValue({ rows: [] }),
      onModuleDestroy: jest.fn(),
    } as unknown as jest.Mocked<HrmDbService>;
    const service = new EmployeeKpisService(db);
    const token = signServiceJwt({
      sub: 'ceo@xe.vn',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    });
    await service.list({ company_id: 'main' }, `Bearer ${token}`);
    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining('company_id = ANY'),
      expect.arrayContaining([expect.any(Array)]),
    );
  });
});
