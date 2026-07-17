import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { signServiceJwt } from '../common/jwt-sign';
import { HrmDbService } from '../db/hrm-db.service';
import { EmployeesController } from './employees.controller';
import { EmployeesService } from './employees.service';
import { EmployeeProfileService } from './employee-profile.service';
import { buildSalaryRangesFromCounts } from './employee-summary';

describe('P1-HRM-PERF-BE-01 employees summary', () => {
  describe('buildSalaryRangesFromCounts', () => {
    it('maps aggregate SQL columns to salary range buckets', () => {
      const ranges = buildSalaryRangesFromCounts({
        salary_range_above_30m: '12',
        salary_range_20_30m: '34',
        salary_range_15_20m: '56',
        salary_range_below_15m: '78',
      });
      expect(ranges).toEqual([
        { key: 'above_30m', min: 30_000_000, max: null, count: 12 },
        { key: 'range_20_30m', min: 20_000_000, max: 30_000_000, count: 34 },
        { key: 'range_15_20m', min: 15_000_000, max: 20_000_000, count: 56 },
        { key: 'below_15m', min: 0, max: 15_000_000, count: 78 },
      ]);
    });
  });

  describe('EmployeesService.getEmployeesSummary', () => {
    let service: EmployeesService;
    let db: jest.Mocked<HrmDbService>;

    beforeEach(() => {
      db = {
        query: jest.fn(),
        onModuleDestroy: jest.fn(),
      } as unknown as jest.Mocked<HrmDbService>;
      service = new EmployeesService(db);
    });

    it('returns aggregates in one service call (3 SQL round-trips vs 12+ list pages)', async () => {
      db.query
        .mockResolvedValueOnce({
          rows: [
            {
              total: '1107',
              active_count: '1050',
              inactive_count: '57',
              archived_count: '3',
              new_hires_last_30_days: '24',
              total_payroll: '18500000000',
              employees_with_salary: '900',
              salary_range_above_30m: '120',
              salary_range_20_30m: '340',
              salary_range_15_20m: '200',
              salary_range_below_15m: '240',
            },
          ],
        } as never)
        .mockResolvedValueOnce({
          rows: [
            { department: 'Vận hành', count: '400', avg_salary: '18000000' },
            { department: 'Khác', count: '50', avg_salary: null },
          ],
        } as never)
        .mockResolvedValueOnce({
          rows: [
            {
              id: '11111111-1111-4111-8111-111111111111',
              employee_code: 'NV1107',
              full_name: 'Nguyễn Văn Mới',
              status: 'active',
              hired_at: '2026-06-01',
              avatar_url: null,
            },
          ],
        } as never);

      const token = signServiceJwt({
        sub: 'ceo@xe.vn',
        tenantId: 'xevn',
        companyId: 'main',
        roleCode: 'group_ceo',
      });

      const result = await service.getEmployeesSummary(
        { company_id: 'main' },
        `Bearer ${token}`,
        { tenantId: 'xevn' },
      );

      expect(result.total).toBe(1107);
      expect(result.active_count).toBe(1050);
      expect(result.payroll.total).toBe(18_500_000_000);
      expect(result.by_department[0]).toEqual({
        department: 'Vận hành',
        count: 400,
        avg_salary: 18_000_000,
      });
      expect(result.new_hires.last_30_days).toBe(24);
      expect(result.new_hires.recent).toHaveLength(1);
      expect(db.query).toHaveBeenCalledTimes(3);
      expect(db.query.mock.calls[0]?.[0]).toContain('salary_range_above_30m');
      expect(db.query.mock.calls[0]?.[0]).toContain('company_id');
    });

    it('uses same scope filters as listEmployees (main JWT → holding partition)', async () => {
      db.query.mockResolvedValue({ rows: [{ total: '0', active_count: '0', inactive_count: '0', archived_count: '0', new_hires_last_30_days: '0', total_payroll: '0', employees_with_salary: '0', salary_range_above_30m: '0', salary_range_20_30m: '0', salary_range_15_20m: '0', salary_range_below_15m: '0' }] } as never);

      const token = signServiceJwt({
        sub: 'ceo@xe.vn',
        tenantId: 'xevn',
        companyId: 'main',
        roleCode: 'group_ceo',
      });

      await service.getEmployeesSummary({ company_id: 'main' }, `Bearer ${token}`, { tenantId: 'xevn' });

      const firstSql = String(db.query.mock.calls[0]?.[0] ?? '');
      const firstValues = db.query.mock.calls[0]?.[1] as unknown[] | undefined;
      expect(firstSql).toContain('company_id = ANY');
      expect(firstValues?.[0]).toEqual(expect.arrayContaining(['holding']));
    });
  });

  describe('GET /api/hrm/employees/summary', () => {
    let app: INestApplication;
    const serviceMock = {
      getEmployeesSummary: jest.fn().mockResolvedValue({
        company_id: 'main',
        total: 1107,
        active_count: 1050,
        inactive_count: 57,
        archived_count: 0,
        payroll: { total: 0, employees_with_salary: 0 },
        by_department: [],
        salary_ranges: [],
        new_hires: { last_30_days: 0, recent: [] },
      }),
      listEmployees: jest.fn(),
      listEmployeeDirectory: jest.fn(),
      createEmployee: jest.fn(),
      getEmployeeById: jest.fn(),
      getEmployeeDirectoryById: jest.fn(),
      updateEmployee: jest.fn(),
      archiveEmployee: jest.fn(),
      restoreEmployee: jest.fn(),
    };

    beforeEach(async () => {
      jest.clearAllMocks();
      process.env.INTERNAL_API_KEY = 'test-key';
      const module: TestingModule = await Test.createTestingModule({
        controllers: [EmployeesController],
        providers: [
          { provide: EmployeesService, useValue: serviceMock },
          {
            provide: EmployeeProfileService,
            useValue: {
              listDegrees: jest.fn(),
              listTraining: jest.fn(),
              listAssets: jest.fn(),
            },
          },
        ],
      }).compile();

      app = module.createNestApplication();
      app.setGlobalPrefix('api/hrm');
      await app.init();
    });

    afterEach(async () => {
      await app.close();
    });

    it('returns HRM-EMP-SUMMARY-200 envelope with internal key', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/hrm/employees/summary?company_id=main')
        .set('x-internal-api-key', 'test-key')
        .set('x-tenant-id', 'xevn')
        .expect(200);

      expect(res.body.code).toBe('HRM-EMP-SUMMARY-200');
      expect(res.body.data.total).toBe(1107);
      expect(serviceMock.getEmployeesSummary).toHaveBeenCalledWith(
        expect.objectContaining({ company_id: 'main' }),
        undefined,
        { tenantId: 'xevn' },
      );
    });

    it('does not match :employeeId route (summary before param routes)', async () => {
      await request(app.getHttpServer())
        .get('/api/hrm/employees/summary?company_id=holding')
        .set('x-internal-api-key', 'test-key')
        .set('x-tenant-id', 'xevn')
        .expect(200);

      expect(serviceMock.getEmployeeById).not.toHaveBeenCalled();
      expect(serviceMock.getEmployeesSummary).toHaveBeenCalled();
    });
  });
});
