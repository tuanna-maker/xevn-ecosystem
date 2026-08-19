/**
 * @CODE-MEMORY WorkItem: HRM-TENANT-PROVISION-LISTENER-01
 * solid_convention_ack: true
 * be_boundary: true
 *
 * Jest unit tests for TenantProvisionService
 * Tests: handleTenantProvisioned, idempotency, BullMQ worker lifecycle, withTransaction wrapping
 */
import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { HrmDbService, HrmDbQueryFn } from '../db/hrm-db.service';
import { TenantProvisionService, TenantProvisionedPayload } from './tenant-provision.service';

/** 8 loại nghỉ theo BLLĐ 2019 - copied from service for test assertions */
const LABOR_LAW_LEAVE_TYPES: ReadonlyArray<{
  code: string;
  name: string;
  defaultDays: number;
  isPaid: boolean;
  payRate: number;
}> = [
  { code: 'ANNUAL', name: 'Nghỉ phép năm', defaultDays: 12, isPaid: true, payRate: 100 },
  { code: 'SICK', name: 'Nghỉ ốm đau', defaultDays: 30, isPaid: true, payRate: 75 },
  { code: 'MATERNITY', name: 'Nghỉ thai sản', defaultDays: 180, isPaid: true, payRate: 100 },
  { code: 'PATERNITY', name: 'Nghỉ thai sản cha', defaultDays: 5, isPaid: true, payRate: 100 },
  { code: 'BEREAVEMENT', name: 'Nghỉ tang', defaultDays: 3, isPaid: true, payRate: 100 },
  { code: 'MARRIAGE', name: 'Nghỉ kết hôn', defaultDays: 3, isPaid: true, payRate: 100 },
  { code: 'ELECTION', name: 'Nghỉ bầu cử', defaultDays: 1, isPaid: true, payRate: 100 },
  { code: 'NATIONAL_DISASTER', name: 'Nghỉ thiên tai quốc gia', defaultDays: 1, isPaid: false, payRate: 0 },
] as const;

type MockCall = unknown[];

// Mock bullmq before any imports
jest.mock('bullmq', () => ({
  Worker: jest.fn().mockImplementation(() => ({
    on: jest.fn(),
    close: jest.fn().mockResolvedValue(undefined),
  })),
}));

describe('TenantProvisionService', () => {
  let service: TenantProvisionService;
  let dbMock: { query: jest.Mock; withTransaction: jest.Mock };
  let loggerSpy: jest.SpyInstance;
  let txQueryMock: jest.Mock;

  const validPayload: TenantProvisionedPayload = {
    eventType: 'TENANT_PROVISIONED',
    tenantId: 'test-tenant-001',
    defaultCompanyId: 'test-company-001',
    modules: ['hrm', 'logistics'],
    activatedAt: '2026-08-15T10:00:00.000Z',
    issuedBy: 'xbos-platform',
  };

  beforeEach(async () => {
    txQueryMock = jest.fn().mockResolvedValue({ rows: [] });

    dbMock = {
      query: jest.fn().mockResolvedValue({ rows: [{ exists: false }] }),
      withTransaction: jest.fn().mockImplementation(async (fn: (query: HrmDbQueryFn) => Promise<void>) => {
        await fn(txQueryMock);
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenantProvisionService,
        { provide: HrmDbService, useValue: dbMock },
      ],
    }).compile();

    service = module.get<TenantProvisionService>(TenantProvisionService);
    loggerSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();
    jest.spyOn(Logger.prototype, 'warn').mockImplementation();
    jest.spyOn(Logger.prototype, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  describe('handleTenantProvisioned', () => {
    it('modules includes hrm → calls all 3 seed methods inside withTransaction', async () => {
      await service.handleTenantProvisioned(validPayload);

      expect(dbMock.withTransaction).toHaveBeenCalledTimes(1);
      expect(txQueryMock).toHaveBeenCalledTimes(15); // 8 leave types + 3 insurance + 4 min wage

      const insertCalls = txQueryMock.mock.calls.filter((c: MockCall) => String(c[0]).includes('INSERT INTO'));
      expect(insertCalls).toHaveLength(15);

      const leaveTypeCalls = insertCalls.filter((c: MockCall) => String(c[0]).includes('hrm_leave_type'));
      const insuranceCalls = insertCalls.filter((c: MockCall) => String(c[0]).includes('hrm_insurance_rate'));
      const minWageCalls = insertCalls.filter((c: MockCall) => String(c[0]).includes('hrm_minimum_wage_region'));

      expect(leaveTypeCalls).toHaveLength(8);
      expect(insuranceCalls).toHaveLength(3);
      expect(minWageCalls).toHaveLength(4);

      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining('Tenant provisioned: test-tenant-001'),
      );
    });

    it('modules excludes hrm → logs skip message and returns early', async () => {
      const payloadNoHrm: TenantProvisionedPayload = {
        ...validPayload,
        modules: ['logistics'],
      };

      await service.handleTenantProvisioned(payloadNoHrm);

      expect(dbMock.withTransaction).not.toHaveBeenCalled();
      expect(dbMock.query).not.toHaveBeenCalled();
      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining("'hrm' not in modules"),
      );
    });

    it('idempotency: existing leave_type for tenantId → logs "already provisioned" and returns early', async () => {
      dbMock.query.mockResolvedValueOnce({ rows: [{ exists: true }] });

      await service.handleTenantProvisioned(validPayload);

      expect(dbMock.query).toHaveBeenCalledWith(
        expect.stringContaining('EXISTS(SELECT 1 FROM hrm_leave_type WHERE tenant_id = $1 LIMIT 1)'),
        ['test-tenant-001'],
      );
      expect(dbMock.withTransaction).not.toHaveBeenCalled();
      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining('already provisioned — skipping seed'),
      );
    });

    it('withTransaction wraps all 3 seeds (atomic rollback on failure)', async () => {
      const txError = new Error('DB constraint violation');
      dbMock.withTransaction.mockRejectedValueOnce(txError);

      await expect(service.handleTenantProvisioned(validPayload)).rejects.toThrow(txError);

      expect(dbMock.withTransaction).toHaveBeenCalledTimes(1);
      expect(loggerSpy).not.toHaveBeenCalledWith(
        expect.stringContaining('Tenant provisioned: test-tenant-001'),
      );
    });

    it('leaves correct seed data: leave types match LABOR_LAW_LEAVE_TYPES constant', async () => {
      await service.handleTenantProvisioned(validPayload);

      const leaveTypeCalls = txQueryMock.mock.calls.filter((c: MockCall) =>
        String(c[0]).includes('hrm_leave_type'),
      );

      expect(leaveTypeCalls).toHaveLength(8);

      const expectedCodes = [
        'ANNUAL', 'SICK', 'MATERNITY', 'PATERNITY',
        'BEREAVEMENT', 'MARRIAGE', 'ELECTION', 'NATIONAL_DISASTER',
      ];

      leaveTypeCalls.forEach((call: MockCall, idx: number) => {
        const params = call[1] as unknown[];
        const expectedLeave = LABOR_LAW_LEAVE_TYPES[idx];
        expect(params[2]).toBe(expectedLeave.code); // code parameter
        expect(params[0]).toBe('test-tenant-001'); // tenant_id
        expect(params[1]).toBe('test-company-001'); // company_id
        expect(params[3]).toBe(expectedLeave.name); // name
        expect(params[4]).toBe(expectedLeave.defaultDays); // default_days_per_year
        expect(params[5]).toBe(expectedLeave.isPaid); // is_paid
        expect(params[6]).toBe(expectedLeave.payRate); // pay_rate_percent
        // leave_category is hardcoded 'LABOR_LAW' in SQL, not a parameter
      });
    });

    it('leaves correct seed data: insurance rates match INSURANCE_RATES_2026 constant', async () => {
      await service.handleTenantProvisioned(validPayload);

      const insuranceCalls = txQueryMock.mock.calls.filter((c: MockCall) =>
        String(c[0]).includes('hrm_insurance_rate'),
      );

      expect(insuranceCalls).toHaveLength(3);

      const expectedRates = [
        { type: 'BHXH', employer: 17.0, employee: 8.0 },
        { type: 'BHYT', employer: 3.0, employee: 1.5 },
        { type: 'BHTN', employer: 1.0, employee: 1.0 },
      ];

      insuranceCalls.forEach((call: MockCall, idx: number) => {
        const params = call[1] as unknown[];
        expect(params[0]).toBe('test-tenant-001');
        expect(params[1]).toBe('test-company-001');
        expect(params[2]).toBe(expectedRates[idx].type);
        expect(params[3]).toBe(2026);
        expect(params[4]).toBe(expectedRates[idx].employer);
        expect(params[5]).toBe(expectedRates[idx].employee);
        expect(params[6]).toBe('2024-07-01');
      });
    });

    it('leaves correct seed data: minimum wage regions match MIN_WAGE_REGIONS constant', async () => {
      await service.handleTenantProvisioned(validPayload);

      const minWageCalls = txQueryMock.mock.calls.filter((c: MockCall) =>
        String(c[0]).includes('hrm_minimum_wage_region'),
      );

      expect(minWageCalls).toHaveLength(4);

      const expectedRegions = [
        { code: 'REGION_1', wage: 4960000 },
        { code: 'REGION_2', wage: 4410000 },
        { code: 'REGION_3', wage: 3860000 },
        { code: 'REGION_4', wage: 3450000 },
      ];

      minWageCalls.forEach((call: MockCall, idx: number) => {
        const params = call[1] as unknown[];
        expect(params[0]).toBe('test-tenant-001');
        expect(params[1]).toBe('test-company-001');
        expect(params[2]).toBe(expectedRegions[idx].code);
        expect(params[3]).toBe('2024-07-01');
        expect(params[4]).toBe(expectedRegions[idx].wage);
      });
    });

    it('DB errors propagate from withTransaction', async () => {
      const dbError = new Error('Connection terminated');
      dbMock.withTransaction.mockRejectedValueOnce(dbError);

      await expect(service.handleTenantProvisioned(validPayload)).rejects.toThrow(dbError);
    });

    it('handles empty modules array gracefully', async () => {
      const payloadEmpty: TenantProvisionedPayload = {
        ...validPayload,
        modules: [],
      };

      await service.handleTenantProvisioned(payloadEmpty);

      expect(dbMock.withTransaction).not.toHaveBeenCalled();
      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining("'hrm' not in modules []"),
      );
    });
  });

  describe('BullMQ Worker lifecycle', () => {
    let originalEnv: NodeJS.ProcessEnv;
    let bullLoggerSpy: jest.SpyInstance;

    beforeEach(() => {
      originalEnv = { ...process.env };
      bullLoggerSpy = jest.spyOn(Logger.prototype, 'warn').mockImplementation();
    });

    afterEach(() => {
      process.env = originalEnv;
    });

    it('onModuleInit: logs warning when BULLMQ_ENABLED != true', async () => {
      process.env.BULLMQ_ENABLED = 'false';
      process.env.REDIS_URL = 'redis://localhost:6379';

      const svc = new TenantProvisionService(dbMock as never);

      await svc.onModuleInit();

      expect(bullLoggerSpy).toHaveBeenCalledWith(
        expect.stringContaining('BULLMQ_ENABLED != true or REDIS_URL missing'),
      );
    });

    it('onModuleInit: logs warning when REDIS_URL missing', async () => {
      process.env.BULLMQ_ENABLED = 'true';
      delete process.env.REDIS_URL;

      const svc = new TenantProvisionService(dbMock as never);

      await svc.onModuleInit();

      expect(bullLoggerSpy).toHaveBeenCalledWith(
        expect.stringContaining('BULLMQ_ENABLED != true or REDIS_URL missing'),
      );
    });

    it('onModuleInit: logs warning when REDIS_URL is empty string', async () => {
      process.env.BULLMQ_ENABLED = 'true';
      process.env.REDIS_URL = '';

      const svc = new TenantProvisionService(dbMock as never);

      await svc.onModuleInit();

      expect(bullLoggerSpy).toHaveBeenCalledWith(
        expect.stringContaining('BULLMQ_ENABLED != true or REDIS_URL missing'),
      );
    });
  });
});