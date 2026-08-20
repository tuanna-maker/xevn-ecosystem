// @CODE-MEMORY: Unit Test (QA Step 4). Kiểm thử logic PayrollConfigService. Fail-deep với ConflictException.
import { Test, TestingModule } from '@nestjs/testing';
import { PayrollConfigService } from './payroll-config.service';
import { HrmDbService } from '../db/hrm-db.service';
import { ConflictException } from '@nestjs/common';

describe('PayrollConfigService', () => {
  let service: PayrollConfigService;
  let dbService: jest.Mocked<HrmDbService>;

  beforeEach(async () => {
    const mockDbService = {
      query: jest.fn(),
      queryOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PayrollConfigService,
        {
          provide: HrmDbService,
          useValue: mockDbService,
        },
      ],
    }).compile();

    service = module.get<PayrollConfigService>(PayrollConfigService);
    dbService = module.get(HrmDbService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createSalaryComponent', () => {
    const dto = {
      code: 'LUONG_CO_BAN',
      name_vi: 'Lương Cơ Bản',
      component_type: 'BASIC',
      is_taxable: true,
      in_bhxh_base: true,
    };

    it('Fail-deep: Should throw ConflictException if code already exists in same company', async () => {
      // Giả lập DB trả về có dữ liệu (bị trùng)
      dbService.queryOne.mockResolvedValueOnce({ id: 'uuid-existing' });

      await expect(service.createSalaryComponent('tenant_x', 'company_1', dto))
        .rejects
        .toThrow(ConflictException);

      expect(dbService.queryOne).toHaveBeenCalledWith(
        expect.stringContaining('SELECT id FROM pay_salary_component WHERE company_id = $1 AND code = $2'),
        ['company_1', 'LUONG_CO_BAN']
      );
    });

    it('Happy path: Should insert and return new component if code is unique', async () => {
      // Giả lập DB không trùng
      dbService.queryOne.mockResolvedValueOnce(null);
      // Giả lập DB insert thành công
      dbService.query.mockResolvedValueOnce({ rows: [{ id: 'new-uuid' }], command: 'INSERT', rowCount: 1, oid: 0, fields: [] });

      const result = await service.createSalaryComponent('tenant_x', 'company_1', dto);
      expect(result).toEqual({ id: 'new-uuid' });
      expect(dbService.query).toHaveBeenCalledTimes(1);
    });
  });

  describe('getSalaryComponents', () => {
    it('Should transform boolean to display-ready string badges', async () => {
      dbService.query.mockResolvedValueOnce({
        command: 'SELECT', rowCount: 1, oid: 0, fields: [],
        rows: [
          {
            id: 'uuid-1',
            code: 'TEST',
            name_vi: 'Thử nghiệm',
            component_type: 'ALLOWANCE',
            is_taxable: false,
            in_bhxh_base: true
          }
        ]
      });

      const result = await service.getSalaryComponents('tenant_x', 'company_1');
      expect(result).toHaveLength(1);
      expect(result[0].taxable_badge).toBe('Không tính thuế'); // is_taxable = false
      expect(result[0].bhxh_badge).toBe('Tính BHXH'); // in_bhxh_base = true
    });
  });
});
