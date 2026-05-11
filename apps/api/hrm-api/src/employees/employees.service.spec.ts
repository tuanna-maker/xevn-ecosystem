import { ApiException } from '../common/api.exception';
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
    await expect(
      service.updateEmployee('633e95b7-cf1b-469f-a0f8-4c91f3f35f80', {}),
    ).rejects.toMatchObject<ApiException>({
      code: 'HRM-EMP-002',
    });
  });

  it('throws deterministic archive error when employee missing', async () => {
    db.query
      .mockResolvedValueOnce({ rows: [] } as never)
      .mockResolvedValueOnce({ rows: [] } as never)
      .mockResolvedValueOnce({ rows: [] } as never)
      .mockResolvedValueOnce({ rows: [] } as never);

    await expect(service.archiveEmployee('633e95b7-cf1b-469f-a0f8-4c91f3f35f80')).rejects.toMatchObject<ApiException>(
      { code: 'HRM-EMP-404' },
    );
  });
});
