import { Test, TestingModule } from '@nestjs/testing';
import { createHmac } from 'node:crypto';
import { PayrollController } from './payroll.controller';
import { PayrollService } from './payroll.service';
import { PayrollCatalogService } from './payroll-catalog.service';

function createInternalJwt(payload: Record<string, unknown>) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
    .toString('base64url');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const secret = process.env.SERVICE_JWT_SECRET ?? 'xevn-dev-jwt-secret';
  const sig = createHmac('sha256', secret).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${sig}`;
}

/** UC: HRM-PR-01..06 · embed UC-HRM-24 */
describe('PayrollController (HRM-PR-01..06)', () => {
  let controller: PayrollController;

  const catalogMock = {
    listSalaryComponents: jest.fn().mockResolvedValue({ total: 0, data: [] }),
    listSalaryComponentCategories: jest.fn().mockResolvedValue({ total: 0, data: [] }),
    createSalaryComponent: jest.fn().mockResolvedValue({ id: 'sc-1' }),
    updateSalaryComponent: jest.fn().mockResolvedValue({ id: 'sc-1' }),
    deleteSalaryComponent: jest.fn().mockResolvedValue({ id: 'sc-1' }),
    createSalaryComponentCategory: jest.fn().mockResolvedValue({ id: 'cat-1' }),
    deleteSalaryComponentCategory: jest.fn().mockResolvedValue({ id: 'cat-1' }),
    listPaymentBatches: jest.fn().mockResolvedValue({ total: 0, data: [] }),
    listPaymentBatchRecords: jest.fn().mockResolvedValue({ total: 0, data: [] }),
    createPaymentBatch: jest.fn().mockResolvedValue({ id: 'pb-1' }),
    updatePaymentBatch: jest.fn().mockResolvedValue({ id: 'pb-1' }),
    deletePaymentBatch: jest.fn().mockResolvedValue({ id: 'pb-1' }),
    addPaymentRecord: jest.fn().mockResolvedValue({ id: 'pr-1' }),
    processPaymentRecord: jest.fn().mockResolvedValue({ id: 'pr-1', status: 'paid' }),
    processAllPaymentsInBatch: jest.fn().mockResolvedValue({ batch: { id: 'pb-1' }, processed_records: 2 }),
  };

  const serviceMock = {
    createPayrollPeriod: jest.fn().mockResolvedValue({ id: 'p1' }),
    listPayrollPeriods: jest.fn().mockResolvedValue({ total: 1, data: [{ id: 'p1' }] }),
    processPayrollPeriod: jest.fn().mockResolvedValue({ id: 'p1', status: 'processing' }),
    closePayrollPeriod: jest.fn().mockResolvedValue({ id: 'p1', status: 'closed' }),
    listPayslips: jest.fn().mockResolvedValue({ total: 1, data: [{ id: 'ps-1' }] }),
    getPayrollReconciliationSummary: jest.fn().mockResolvedValue({ periods: 1, payslips: 2 }),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    process.env.INTERNAL_API_KEY = 'test-key';
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PayrollController],
      providers: [
        { provide: PayrollService, useValue: serviceMock },
        { provide: PayrollCatalogService, useValue: catalogMock },
      ],
    }).compile();

    controller = module.get<PayrollController>(PayrollController);
  });

  it('HRM-PR-01 create HRM-PR-02 list HRM-PR-03 process HRM-PR-04 close payroll period codes', async () => {
    const createRes = await controller.createPayrollPeriod(undefined, 'test-key', 'xevn', undefined, {
      company_id: '78b8a663-f5e5-4f4d-a020-b8f950ec2037',
      period_label: '2026-04',
      start_date: '2026-04-01',
      end_date: '2026-04-30',
      created_by: 'system',
    });
    const listRes = await controller.listPayrollPeriods(undefined, 'test-key', 'xevn', undefined, {
      company_id: '78b8a663-f5e5-4f4d-a020-b8f950ec2037',
    });
    const processRes = await controller.processPayrollPeriod(
      'f76f23f7-3683-4120-81b7-5126ee997b8e',
      undefined,
      'test-key',
      'xevn',
      '78b8a663-f5e5-4f4d-a020-b8f950ec2037',
    );
    const closeRes = await controller.closePayrollPeriod(
      'f76f23f7-3683-4120-81b7-5126ee997b8e',
      undefined,
      'test-key',
      'xevn',
      '78b8a663-f5e5-4f4d-a020-b8f950ec2037',
    );
    expect(createRes.code).toBe('HRM-PAY-201');
    expect(listRes.code).toBe('HRM-PAY-200');
    expect(processRes.code).toBe('HRM-PAY-202');
    expect(closeRes.code).toBe('HRM-PAY-203');
  });

  it('HRM-PR-05 list payslips HRM-PR-06 reconciliation summary', async () => {
    const companyId = '78b8a663-f5e5-4f4d-a020-b8f950ec2037';
    const payslipsRes = await controller.listPayslips(undefined, 'test-key', 'xevn', undefined, {
      company_id: companyId,
    });
    const reconRes = await controller.payrollReconciliationSummary(
      undefined,
      'test-key',
      'xevn',
      undefined,
      companyId,
    );
    expect(payslipsRes.code).toBe('HRM-PAY-200');
    expect(reconRes.code).toBe('HRM-PAY-200');
    expect(serviceMock.listPayslips).toHaveBeenCalled();
    expect(serviceMock.getPayrollReconciliationSummary).toHaveBeenCalledWith(companyId, undefined);
  });

  it('accepts internal API key and forwards payroll calls', async () => {
    const body = {
      company_id: '78b8a663-f5e5-4f4d-a020-b8f950ec2037',
      period_label: '2026-04',
      start_date: '2026-04-01',
      end_date: '2026-04-30',
      created_by: 'qa',
    };
    const query = {
      company_id: '78b8a663-f5e5-4f4d-a020-b8f950ec2037',
      status: 'processed' as const,
    };

    await controller.createPayrollPeriod(undefined, 'test-key', 'xevn', undefined, body);
    await controller.listPayrollPeriods(undefined, 'test-key', 'xevn', undefined, query);
    await controller.processPayrollPeriod('p1', undefined, 'test-key', 'xevn', '78b8a663-f5e5-4f4d-a020-b8f950ec2037');
    await controller.closePayrollPeriod('p1', undefined, 'test-key', 'xevn', '78b8a663-f5e5-4f4d-a020-b8f950ec2037');

    expect(serviceMock.createPayrollPeriod).toHaveBeenCalledWith(body);
    expect(serviceMock.listPayrollPeriods).toHaveBeenCalledWith(query, undefined);
    expect(serviceMock.processPayrollPeriod).toHaveBeenCalledWith(
      'p1',
      '78b8a663-f5e5-4f4d-a020-b8f950ec2037',
      undefined,
    );
    expect(serviceMock.closePayrollPeriod).toHaveBeenCalledWith(
      'p1',
      '78b8a663-f5e5-4f4d-a020-b8f950ec2037',
      undefined,
    );
  });

  it('blocks unauthorized payroll access', async () => {
    expect(() =>
      controller.listPayrollPeriods(undefined, undefined, undefined, undefined, {
        company_id: '78b8a663-f5e5-4f4d-a020-b8f950ec2037',
      }),
    ).toThrow('Unauthorized payroll access');
    expect(serviceMock.listPayrollPeriods).not.toHaveBeenCalled();
  });

  it('rejects missing tenant scope deterministically', async () => {
    expect(() =>
      controller.createPayrollPeriod(undefined, 'test-key', undefined, undefined, {
        company_id: '78b8a663-f5e5-4f4d-a020-b8f950ec2037',
        period_label: '2026-04',
        start_date: '2026-04-01',
        end_date: '2026-04-30',
        created_by: 'qa',
      }),
    ).toThrow('tenantId is required');
    expect(serviceMock.createPayrollPeriod).not.toHaveBeenCalled();
  });

  it('rejects company scope mismatch against token', async () => {
    const token = createInternalJwt({
      iss: 'xevn-internal',
      aud: 'xevn-api',
      tenantId: 'xevn',
      companyId: '78b8a663-f5e5-4f4d-a020-b8f950ec2037',
    });
    expect(() =>
      controller.createPayrollPeriod(`Bearer ${token}`, undefined, 'xevn', undefined, {
        company_id: 'a7d2dbec-75d7-4b2e-8c75-c53cd14f22aa',
        period_label: '2026-04',
        start_date: '2026-04-01',
        end_date: '2026-04-30',
        created_by: 'qa',
      }),
    ).toThrow('companyId mismatches token scope');
    expect(serviceMock.createPayrollPeriod).not.toHaveBeenCalled();
  });

  it('accepts x-access-token fallback header for list payslips', async () => {
    const token = createInternalJwt({
      iss: 'xevn-internal',
      aud: 'xevn-api',
      tenantId: 'xevn',
      companyId: 'main',
    });
    const res = await controller.listPayslips(
      undefined,
      undefined,
      'xevn',
      undefined,
      { company_id: 'main' },
      { 'x-access-token': token },
    );
    expect(res.code).toBe('HRM-PAY-200');
    expect(serviceMock.listPayslips).toHaveBeenCalledWith(
      { company_id: 'main' },
      `Bearer ${token}`,
      { tenantId: 'xevn' },
    );
  });

  it('adds payment records and processes single/bulk payments', async () => {
    const addRes = await controller.addPaymentBatchRecord(
      'f76f23f7-3683-4120-81b7-5126ee997b8e',
      undefined,
      'test-key',
      {
        company_id: '78b8a663-f5e5-4f4d-a020-b8f950ec2037',
        employee_code: 'NV001',
        employee_name: 'Nguyen Van A',
        amount: 12000000,
      },
    );
    const processOneRes = await controller.processPaymentRecord(
      'f76f23f7-3683-4120-81b7-5126ee997b8e',
      'c76f23f7-3683-4120-81b7-5126ee997b8e',
      undefined,
      'test-key',
      '78b8a663-f5e5-4f4d-a020-b8f950ec2037',
      { transaction_ref: 'TX-001' },
    );
    const processAllRes = await controller.processPaymentBatch(
      'f76f23f7-3683-4120-81b7-5126ee997b8e',
      undefined,
      'test-key',
      '78b8a663-f5e5-4f4d-a020-b8f950ec2037',
      { notes: 'bulk payout' },
    );
    expect(addRes.code).toBe('HRM-PB-201');
    expect(processOneRes.code).toBe('HRM-PB-202');
    expect(processAllRes.code).toBe('HRM-PB-202');
    expect(catalogMock.addPaymentRecord).toHaveBeenCalled();
    expect(catalogMock.processPaymentRecord).toHaveBeenCalled();
    expect(catalogMock.processAllPaymentsInBatch).toHaveBeenCalled();
  });
});
