import { Test, TestingModule } from '@nestjs/testing';
import { createHmac } from 'node:crypto';
import { PayrollController } from './payroll.controller';
import { PayrollService } from './payroll.service';
import { PayrollCatalogService } from './payroll-catalog.service';
import { PayFormulaService } from './pay-formula.service';
import { PaySheetTemplateService } from './pay-sheet-template.service';
import { PayPeriodInputPackService } from './pay-period-input-pack.service';
import { PayPayrollGroupService } from './pay-payroll-group.service';
import { PayCnttSetupService } from './pay-cntt-setup.service';

function createInternalJwt(payload: Record<string, unknown>) {
  const header = Buffer.from(
    JSON.stringify({ alg: 'HS256', typ: 'JWT' }),
  ).toString('base64url');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const secret = process.env.SERVICE_JWT_SECRET ?? 'xevn-dev-jwt-secret';
  const sig = createHmac('sha256', secret)
    .update(`${header}.${body}`)
    .digest('base64url');
  return `${header}.${body}.${sig}`;
}

/** UC: HRM-PR-01..06 · embed UC-HRM-24 */
describe('PayrollController (HRM-PR-01..06)', () => {
  let controller: PayrollController;

  const catalogMock = {
    listSalaryComponents: jest.fn().mockResolvedValue({ total: 0, data: [] }),
    getSalaryComponentById: jest.fn().mockResolvedValue({ id: 'sc-1' }),
    listSalaryComponentCategories: jest
      .fn()
      .mockResolvedValue({ total: 0, data: [] }),
    createSalaryComponent: jest.fn().mockResolvedValue({ id: 'sc-1' }),
    updateSalaryComponent: jest.fn().mockResolvedValue({ id: 'sc-1' }),
    deleteSalaryComponent: jest.fn().mockResolvedValue({ id: 'sc-1' }),
    createSalaryComponentCategory: jest.fn().mockResolvedValue({ id: 'cat-1' }),
    deleteSalaryComponentCategory: jest.fn().mockResolvedValue({ id: 'cat-1' }),
    listPaymentBatches: jest.fn().mockResolvedValue({ total: 0, data: [] }),
    listPaymentBatchRecords: jest
      .fn()
      .mockResolvedValue({ total: 0, data: [] }),
    createPaymentBatch: jest.fn().mockResolvedValue({ id: 'pb-1' }),
    updatePaymentBatch: jest.fn().mockResolvedValue({ id: 'pb-1' }),
    deletePaymentBatch: jest.fn().mockResolvedValue({ id: 'pb-1' }),
    addPaymentRecord: jest.fn().mockResolvedValue({ id: 'pr-1' }),
    processPaymentRecord: jest
      .fn()
      .mockResolvedValue({ id: 'pr-1', status: 'paid' }),
    processAllPaymentsInBatch: jest
      .fn()
      .mockResolvedValue({ batch: { id: 'pb-1' }, processed_records: 2 }),
    wirePaymentBatchFromPeriod: jest.fn().mockResolvedValue({
      period_id: 'period-1',
      batch: { id: 'pb-1' },
      records_added: 2,
      records_skipped: 0,
      payslip_count: 2,
      payroll_e2e_ready: false,
    }),
  };

  const formulaMock = {
    listFormulas: jest.fn().mockResolvedValue({ items: [] }),
    createFormula: jest.fn().mockResolvedValue({ id: 'f1', status: 'draft' }),
    getFormulaById: jest.fn().mockResolvedValue({ id: 'f1' }),
    updateFormula: jest.fn().mockResolvedValue({ id: 'f1' }),
    createNewVersion: jest.fn().mockResolvedValue({ id: 'f2', version: 2 }),
    submitPublish: jest
      .fn()
      .mockResolvedValue({ id: 'f1', status: 'pending_publish' }),
    publish: jest.fn().mockResolvedValue({ id: 'f1', status: 'active' }),
    withdrawPublish: jest.fn().mockResolvedValue({ id: 'f1', status: 'draft' }),
    retireFormula: jest.fn().mockResolvedValue({ id: 'f1', status: 'retired' }),
    previewFormula: jest.fn().mockResolvedValue({ warnings: [] }),
  };

  const sheetTplMock = {
    listTemplates: jest.fn().mockResolvedValue({ items: [] }),
    createTemplate: jest.fn().mockResolvedValue({ id: 'tpl-1' }),
    getTemplateById: jest.fn().mockResolvedValue({ id: 'tpl-1' }),
    updateTemplate: jest.fn().mockResolvedValue({ id: 'tpl-1' }),
    getLines: jest.fn().mockResolvedValue({ templateId: 'tpl-1', lines: [] }),
    replaceLines: jest
      .fn()
      .mockResolvedValue({ templateId: 'tpl-1', lines: [] }),
    archiveTemplate: jest
      .fn()
      .mockResolvedValue({ id: 'tpl-1', archivedAt: '2026-08-07' }),
    archiveLine: jest.fn().mockResolvedValue({ id: 'line-1' }),
    bindToPeriod: jest.fn().mockResolvedValue({
      id: 'p1',
      pay_sheet_template_id: 'tpl-1',
      sheet_template_snapshot_json: { columns: [] },
    }),
  };

  const serviceMock = {
    createPayrollPeriod: jest.fn().mockResolvedValue({ id: 'p1' }),
    updatePayrollPeriod: jest.fn().mockResolvedValue({ id: 'p1' }),
    listPayrollPeriods: jest
      .fn()
      .mockResolvedValue({ total: 1, data: [{ id: 'p1' }] }),
    processPayrollPeriod: jest
      .fn()
      .mockResolvedValue({ id: 'p1', status: 'processed' }),
    closePayrollPeriod: jest
      .fn()
      .mockResolvedValue({ id: 'p1', status: 'closed' }),
    getPayrollEligibility: jest.fn().mockResolvedValue({
      period_id: 'p1',
      eligible_count: 1,
      ineligible_count: 0,
      items: [],
    }),
    enrollPayrollPeriod: jest
      .fn()
      .mockResolvedValue({ period_id: 'p1', employee_count: 1, enrolled: [] }),
    listPayslips: jest
      .fn()
      .mockResolvedValue({ total: 1, data: [{ id: 'ps-1' }] }),
    getPayslipById: jest.fn().mockResolvedValue({
      id: 'ps-1',
      components: [{ component_code: 'BASE', amount: 1 }],
      lines: [{ component_code: 'BASE', amount: 1 }],
    }),
    listPayslipLines: jest.fn().mockResolvedValue({
      payslip_id: 'ps-1',
      total: 1,
      data: [{ component_code: 'BASE', amount: 1 }],
    }),
    listMyPayslips: jest
      .fn()
      .mockResolvedValue({ total: 1, data: [{ id: 'ps-1' }] }),
    getMyPayslipById: jest.fn().mockResolvedValue({
      id: 'ps-1',
      ess_confirmed: false,
      components: [{ component_code: 'BASE', amount: 1 }],
      lines: [{ component_code: 'BASE', amount: 1 }],
    }),
    confirmMyPayslip: jest.fn().mockResolvedValue({
      id: 'ps-1',
      ess_confirmed: true,
      components: [{ component_code: 'BASE', amount: 1 }],
      lines: [{ component_code: 'BASE', amount: 1 }],
    }),
    getPayrollReconciliationSummary: jest
      .fn()
      .mockResolvedValue({ periods: 1, payslips: 2 }),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    process.env.INTERNAL_API_KEY = 'test-key';
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PayrollController],
      providers: [
        { provide: PayrollService, useValue: serviceMock },
        { provide: PayrollCatalogService, useValue: catalogMock },
        { provide: PayFormulaService, useValue: formulaMock },
        { provide: PaySheetTemplateService, useValue: sheetTplMock },
        {
          provide: PayPeriodInputPackService,
          useValue: {
            listTimesheetBinds: jest.fn().mockResolvedValue({ items: [] }),
            getTimesheetBindById: jest.fn(),
            createTimesheetBind: jest.fn(),
            archiveTimesheetBind: jest.fn(),
            listInputLines: jest.fn().mockResolvedValue({ items: [] }),
            getInputLineById: jest.fn(),
            createInputLine: jest.fn(),
            patchInputLine: jest.fn(),
            archiveInputLine: jest.fn(),
          },
        },
        {
          provide: PayPayrollGroupService,
          useValue: {
            listGroups: jest.fn().mockResolvedValue({ items: [] }),
            getGroupById: jest.fn(),
            createGroup: jest.fn(),
            updateGroup: jest.fn(),
            listGroupMembers: jest.fn().mockResolvedValue({
              group_id: 'g1',
              period_id: 'p1',
              items: [],
            }),
          },
        },
        {
          provide: PayCnttSetupService,
          useValue: {
            listPolicyPacks: jest.fn().mockResolvedValue({ items: [] }),
            createPolicyPack: jest.fn(),
            getPolicyPackById: jest.fn(),
            updatePolicyPack: jest.fn(),
            archivePolicyPack: jest.fn(),
            listInputProfiles: jest.fn().mockResolvedValue({ items: [] }),
            createInputProfile: jest.fn(),
            getInputProfileById: jest.fn(),
            updateInputProfile: jest.fn(),
            archiveInputProfile: jest.fn(),
            resolveSetup: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<PayrollController>(PayrollController);
  });

  it('HRM-PR-01 create HRM-PR-02 list HRM-PR-03 process HRM-PR-04 close payroll period codes', async () => {
    const createRes = await controller.createPayrollPeriod(
      undefined,
      'test-key',
      'xevn',
      undefined,
      {
        company_id: '78b8a663-f5e5-4f4d-a020-b8f950ec2037',
        period_label: '2026-04',
        start_date: '2026-04-01',
        end_date: '2026-04-30',
        created_by: 'system',
      },
    );
    const listRes = await controller.listPayrollPeriods(
      undefined,
      'test-key',
      'xevn',
      undefined,
      {
        company_id: '78b8a663-f5e5-4f4d-a020-b8f950ec2037',
      },
    );
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

  it('lists payroll eligibility and enrolls payroll period with deterministic envelope codes', async () => {
    const eligibilityRes = await controller.getPayrollEligibility(
      'f76f23f7-3683-4120-81b7-5126ee997b8e',
      undefined,
      'test-key',
      'xevn',
      '78b8a663-f5e5-4f4d-a020-b8f950ec2037',
    );
    const enrollRes = await controller.enrollPayrollPeriod(
      'f76f23f7-3683-4120-81b7-5126ee997b8e',
      undefined,
      'test-key',
      'xevn',
      '78b8a663-f5e5-4f4d-a020-b8f950ec2037',
      {
        mode: 'auto_eligible',
      },
    );
    expect(eligibilityRes.code).toBe('HRM-PAY-200');
    expect(enrollRes.code).toBe('HRM-PAY-ENROLL-200');
    expect(serviceMock.getPayrollEligibility).toHaveBeenCalledWith(
      'f76f23f7-3683-4120-81b7-5126ee997b8e',
      '78b8a663-f5e5-4f4d-a020-b8f950ec2037',
      undefined,
      undefined,
    );
    expect(serviceMock.enrollPayrollPeriod).toHaveBeenCalledWith(
      'f76f23f7-3683-4120-81b7-5126ee997b8e',
      '78b8a663-f5e5-4f4d-a020-b8f950ec2037',
      { mode: 'auto_eligible' },
      undefined,
    );
  });

  it('HRM-PR-05 list payslips HRM-PR-06 reconciliation summary', async () => {
    const companyId = '78b8a663-f5e5-4f4d-a020-b8f950ec2037';
    const payslipsRes = await controller.listPayslips(
      undefined,
      'test-key',
      'xevn',
      undefined,
      {
        company_id: companyId,
      },
    );
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
    expect(serviceMock.getPayrollReconciliationSummary).toHaveBeenCalledWith(
      companyId,
      undefined,
    );
  });

  it('F-PAY-PAYSLIP-01 get payslip by id and lines', async () => {
    const companyId = '78b8a663-f5e5-4f4d-a020-b8f950ec2037';
    const payslipId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
    const byId = await controller.getPayslipById(
      payslipId,
      undefined,
      'test-key',
      'xevn',
      undefined,
      { company_id: companyId },
    );
    const lines = await controller.listPayslipLines(
      payslipId,
      undefined,
      'test-key',
      'xevn',
      undefined,
      { company_id: companyId },
    );
    expect(byId.code).toBe('HRM-PAY-200');
    expect(lines.code).toBe('HRM-PAY-200');
    expect(serviceMock.getPayslipById).toHaveBeenCalledWith(
      payslipId,
      companyId,
      undefined,
      expect.anything(),
      true,
    );
    expect(serviceMock.listPayslipLines).toHaveBeenCalledWith(
      payslipId,
      companyId,
      undefined,
      expect.anything(),
    );
  });

  it('F-PAY-PAYSLIP-01 ESS me payslips list, get, confirm', async () => {
    const payslipId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
    const token = `Bearer ${createInternalJwt({
      sub: 'uat.nv0001@xe.vn',
      tenantId: 'xevn',
      companyId: 'holding',
      employee_id: '11111111-1111-4111-8111-111111111111',
    })}`;

    const listRes = await controller.listMyPayslips(
      token,
      undefined,
      'xevn',
      'holding',
      {},
      {},
    );
    const getRes = await controller.getMyPayslipById(
      payslipId,
      token,
      undefined,
      'xevn',
      'holding',
      {},
      {},
    );
    const confirmRes = await controller.confirmMyPayslip(
      payslipId,
      token,
      undefined,
      'xevn',
      'holding',
      {},
      {},
    );

    expect(listRes.code).toBe('HRM-PAY-200');
    expect(getRes.code).toBe('HRM-PAY-200');
    expect(confirmRes.code).toBe('HRM-PAY-204-ESS');
    expect(serviceMock.listMyPayslips).toHaveBeenCalled();
    expect(serviceMock.getMyPayslipById).toHaveBeenCalledWith(
      payslipId,
      'holding',
      expect.stringContaining('Bearer'),
      expect.anything(),
    );
    expect(serviceMock.confirmMyPayslip).toHaveBeenCalledWith(
      payslipId,
      'holding',
      expect.stringContaining('Bearer'),
      expect.anything(),
    );
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

    await controller.createPayrollPeriod(
      undefined,
      'test-key',
      'xevn',
      undefined,
      body,
    );
    await controller.listPayrollPeriods(
      undefined,
      'test-key',
      'xevn',
      undefined,
      query,
    );
    await controller.processPayrollPeriod(
      'p1',
      undefined,
      'test-key',
      'xevn',
      '78b8a663-f5e5-4f4d-a020-b8f950ec2037',
    );
    await controller.closePayrollPeriod(
      'p1',
      undefined,
      'test-key',
      'xevn',
      '78b8a663-f5e5-4f4d-a020-b8f950ec2037',
    );

    expect(serviceMock.createPayrollPeriod).toHaveBeenCalledWith(
      body,
      undefined,
      'xevn',
    );
    expect(serviceMock.listPayrollPeriods).toHaveBeenCalledWith(
      query,
      undefined,
    );
    expect(serviceMock.processPayrollPeriod).toHaveBeenCalledWith(
      'p1',
      '78b8a663-f5e5-4f4d-a020-b8f950ec2037',
      undefined,
      null,
      undefined,
      { tenantId: 'xevn' },
    );
    expect(serviceMock.closePayrollPeriod).toHaveBeenCalledWith(
      'p1',
      '78b8a663-f5e5-4f4d-a020-b8f950ec2037',
      undefined,
      { tenantId: 'xevn' },
    );
  });

  it('blocks unauthorized payroll access', async () => {
    expect(() =>
      controller.listPayrollPeriods(
        undefined,
        undefined,
        undefined,
        undefined,
        {
          company_id: '78b8a663-f5e5-4f4d-a020-b8f950ec2037',
        },
      ),
    ).toThrow('Unauthorized payroll access');
    expect(serviceMock.listPayrollPeriods).not.toHaveBeenCalled();
  });

  it('rejects missing tenant scope deterministically', async () => {
    expect(() =>
      controller.createPayrollPeriod(
        undefined,
        'test-key',
        undefined,
        undefined,
        {
          company_id: '78b8a663-f5e5-4f4d-a020-b8f950ec2037',
          period_label: '2026-04',
          start_date: '2026-04-01',
          end_date: '2026-04-30',
          created_by: 'qa',
        },
      ),
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
      controller.createPayrollPeriod(
        `Bearer ${token}`,
        undefined,
        'xevn',
        undefined,
        {
          company_id: 'a7d2dbec-75d7-4b2e-8c75-c53cd14f22aa',
          period_label: '2026-04',
          start_date: '2026-04-01',
          end_date: '2026-04-30',
          created_by: 'qa',
        },
      ),
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

  it('wires payment batch from processed payslips (AMIS step7)', async () => {
    const res = await controller.wirePaymentBatchFromPeriod(
      'f76f23f7-3683-4120-81b7-5126ee997b8e',
      undefined,
      'test-key',
      'xevn',
      { company_id: 'main' },
    );
    expect(res.code).toBe('HRM-PAY-WIRE-201');
    expect(catalogMock.wirePaymentBatchFromPeriod).toHaveBeenCalledWith(
      'f76f23f7-3683-4120-81b7-5126ee997b8e',
      { company_id: 'main' },
      undefined,
    );
  });
});
