import { ApiException } from '../common/api.exception';
import { HttpStatus } from '@nestjs/common';
import { signServiceJwt } from '../common/jwt-sign';
import { HrmDbService } from '../db/hrm-db.service';
import { HRM_PAY_FORMULA_412 } from './pay-formula.constants';
import { PayFormulaService } from './pay-formula.service';
import { PayPeriodInputPackService } from './pay-period-input-pack.service';
import { PayPayrollGroupService } from './pay-payroll-group.service';
import { __setPayAttHourCrossreadViolationForTests, HRM_PAY_BOUNDARY_403 } from './pay-att-hour-boundary';
import { PayrollService } from './payroll.service';

describe('PayrollService', () => {
  let service: PayrollService;
  let db: jest.Mocked<HrmDbService>;
  let payFormulas: {
    ensureSchema: jest.Mock;
    resolvePublishedFormulaForProcess: jest.Mock;
    evaluateBoundFormula: jest.Mock;
    processEmployeePayslipViaSrc: jest.Mock;
    replacePayslipLines: jest.Mock;
  };
  let payInputPack: {
    ensureSchema: jest.Mock;
    createTimesheetBind: jest.Mock;
    archiveAdvanceBridgedLines: jest.Mock;
    bridgeAdvanceRequestToPeriod: jest.Mock;
  };
  let settingsTaxParams: {
    ensureSchema: jest.Mock;
    readRequiredTaxValue: jest.Mock;
  };

  beforeEach(() => {
    db = {
      query: jest.fn(),
      onModuleDestroy: jest.fn(),
    } as unknown as jest.Mocked<HrmDbService>;
    payFormulas = {
      ensureSchema: jest.fn().mockResolvedValue(undefined),
      resolvePublishedFormulaForProcess: jest.fn().mockRejectedValue(
        new ApiException(HRM_PAY_FORMULA_412, 'No active formula', HttpStatus.PRECONDITION_FAILED),
      ),
      evaluateBoundFormula: jest.fn(),
      processEmployeePayslipViaSrc: jest.fn(),
      replacePayslipLines: jest.fn().mockResolvedValue(undefined),
    };
    payInputPack = {
      ensureSchema: jest.fn().mockResolvedValue(undefined),
      createTimesheetBind: jest.fn(),
      archiveAdvanceBridgedLines: jest.fn().mockResolvedValue(0),
      bridgeAdvanceRequestToPeriod: jest.fn().mockResolvedValue({ bridgedInputLineIds: [], failedEmployees: [] }),
    };
    settingsTaxParams = {
      ensureSchema: jest.fn().mockResolvedValue(undefined),
      readRequiredTaxValue: jest.fn(async (_co: string, key: string) => {
        if (key === 'pay_tax_regime') return { code: 'progressive_vn' };
        if (key === 'pay_tax_flags') {
          return { applyPersonalDeduction: false, applyDependentDeduction: false };
        }
        if (key === 'pay_tax_personal_deduction_vnd') return { amount: 11_000_000, currency: 'VND' };
        if (key === 'pay_tax_dependent_deduction_vnd') return { amount: 4_400_000, currency: 'VND' };
        return {};
      }),
    };
    const payPayrollGroups = {
      ensureSchema: jest.fn().mockResolvedValue(undefined),
      assertActiveGroupForPeriodBind: jest.fn(),
      resolveMemberEmployeeIdsForGroup: jest.fn().mockResolvedValue([]),
      loadEmployeeAttrsForCompany: jest.fn().mockResolvedValue([]),
      resolveEffectiveGroupForEmployee: jest.fn().mockResolvedValue({ winner_id: null, ambiguous: false }),
      persistPayslipGroupSnapshot: jest.fn().mockResolvedValue(undefined),
    };
    service = new PayrollService(
      db,
      payFormulas as unknown as PayFormulaService,
      payInputPack as unknown as PayPeriodInputPackService,
      settingsTaxParams as unknown as import('../settings/settings-tax-params.service').SettingsTaxParamsService,
      payPayrollGroups as unknown as PayPayrollGroupService,
    );
  });

  const draftPeriod = {
    id: 'f76f23f7-3683-4120-81b7-5126ee997b8e',
    company_id: 'holding',
    period_label: '2026-04',
    start_date: '2026-04-01',
    end_date: '2026-04-30',
    status: 'draft' as const,
    created_by: 'qa',
    processed_at: null,
    closed_at: null,
    created_at: '2026-04-01T00:00:00.000Z',
    updated_at: '2026-04-01T00:00:00.000Z',
  };

  it('throws deterministic overlap error when period overlaps', async () => {
    db.query.mockImplementation(async (sql: string) => {
      if (sql.includes('daterange(start_date, end_date')) {
        return { rows: [{ id: 'existing' }] } as never;
      }
      return { rows: [] } as never;
    });

    await expect(
      service.createPayrollPeriod({
        company_id: '78b8a663-f5e5-4f4d-a020-b8f950ec2037',
        period_label: '2026-04',
        start_date: '2026-04-01',
        end_date: '2026-04-30',
      }),
    ).rejects.toMatchObject<ApiException>({ code: 'HRM-PAY-002' });
  });

  it('throws deterministic process error when not found', async () => {
    db.query.mockResolvedValue({ rows: [] } as never);

    await expect(
      service.processPayrollPeriod('f76f23f7-3683-4120-81b7-5126ee997b8e', '78b8a663-f5e5-4f4d-a020-b8f950ec2037'),
    ).rejects.toMatchObject<
      ApiException
    >({ code: 'HRM-PAY-404' });
  });

  it('throws deterministic close transition error when period is not processing', async () => {
    db.query.mockImplementation(async (sql: string) => {
      if (sql.includes('FROM public.payroll_periods') && sql.includes('payroll_periods.id = $1')) {
        return { rows: [draftPeriod] } as never;
      }
      return { rows: [] } as never;
    });

    await expect(
      service.closePayrollPeriod('f76f23f7-3683-4120-81b7-5126ee997b8e', 'holding'),
    ).rejects.toMatchObject<
      ApiException
    >({ code: 'HRM-PAY-004' });
  });

  it('closePayrollPeriod blocks when unpaid payslips remain (HRM-PAY-005)', async () => {
    const processedPeriod = { ...draftPeriod, status: 'processed' as const };
    db.query.mockImplementation(async (sql: string) => {
      if (sql.includes('FROM public.payroll_periods') && sql.includes('payroll_periods.id = $1')) {
        return { rows: [processedPeriod] } as never;
      }
      if (sql.includes('FROM public.payroll_payslips') && sql.includes('payment_status')) {
        return { rows: [{ total: '2' }] } as never;
      }
      return { rows: [] } as never;
    });

    await expect(
      service.closePayrollPeriod('f76f23f7-3683-4120-81b7-5126ee997b8e', 'holding'),
    ).rejects.toMatchObject<ApiException>({ code: 'HRM-PAY-005' });
  });

  it('lists payroll periods with status filter', async () => {
    db.query.mockImplementation(async (sql: string) => {
      if (sql.includes('FROM public.payroll_periods') && sql.includes('payroll_periods.status = $2')) {
        return {
          rows: [
            {
              ...draftPeriod,
              status: 'processed',
              employee_count: '2',
            },
          ],
        } as never;
      }
      return { rows: [] } as never;
    });
    const result = await service.listPayrollPeriods({
      company_id: '78b8a663-f5e5-4f4d-a020-b8f950ec2037',
      status: 'processed',
    });

    expect(result.total).toBe(1);
    expect(result.data[0]).toMatchObject({ id: draftPeriod.id, status: 'processed', employee_count: 2 });
    expect(db.query).toHaveBeenCalledWith(expect.stringContaining('payroll_periods.status = $2'), [
      '78b8a663-f5e5-4f4d-a020-b8f950ec2037',
      'processed',
    ]);
  });

  it('listPayrollPeriods returns pay_sheet_template bind + snapshot (R-PAY-PERIOD-LIST-TPL)', async () => {
    const tplId = 'c2073510-1b19-475e-9ce1-129e4a1b4e4d';
    const snapshot = {
      template_id: tplId,
      template_code: 'QA-TPL',
      template_name: 'QA mẫu bind PAYTPLQA-MSIGIKB1',
      columns: [{ component_code: 'BASE' }],
      bound_at: '2026-08-07T00:00:00.000Z',
    };
    db.query.mockImplementation(async (sql: string) => {
      if (sql.includes('FROM public.payroll_periods') && sql.includes('ORDER BY payroll_periods.start_date DESC')) {
        expect(sql).toContain('pay_sheet_template_id::text AS pay_sheet_template_id');
        expect(sql).toContain('sheet_template_snapshot_json');
        return {
          rows: [
            {
              ...draftPeriod,
              employee_count: '0',
              total_gross: '0',
              total_deduction: '0',
              total_net: '0',
              pay_sheet_template_id: tplId,
              sheet_template_snapshot_json: snapshot,
            },
          ],
        } as never;
      }
      return { rows: [] } as never;
    });

    const result = await service.listPayrollPeriods({
      company_id: '78b8a663-f5e5-4f4d-a020-b8f950ec2037',
    });

    expect(result.total).toBe(1);
    expect(result.data[0]).toMatchObject({
      id: draftPeriod.id,
      pay_sheet_template_id: tplId,
      sheet_template_snapshot_json: snapshot,
    });
    expect(
      (result.data[0] as { sheet_template_snapshot_json: { template_name?: string } })
        .sheet_template_snapshot_json.template_name,
    ).toBe('QA mẫu bind PAYTPLQA-MSIGIKB1');
  });

  it('listPayrollPeriods returns display-ready total_gross/total_net + payslip_summary (R-PAY-PERIOD-LIST-TOTALS)', async () => {
    db.query.mockImplementation(async (sql: string) => {
      if (sql.includes('FROM public.payroll_periods') && sql.includes('ORDER BY payroll_periods.start_date DESC')) {
        expect(sql).toContain('LEFT JOIN LATERAL');
        expect(sql).toContain('SUM(ps.gross_amount)');
        expect(sql).toContain('SUM(ps.net_amount)');
        expect(sql).toContain('FROM public.payroll_payslips ps');
        return {
          rows: [
            {
              ...draftPeriod,
              status: 'processed',
              employee_count: '1',
              total_gross: '12345000',
              total_deduction: '0',
              total_net: '12345000',
            },
          ],
        } as never;
      }
      return { rows: [] } as never;
    });

    const result = await service.listPayrollPeriods({
      company_id: '78b8a663-f5e5-4f4d-a020-b8f950ec2037',
      status: 'processed',
    });

    expect(result.total).toBe(1);
    expect(result.data[0]).toMatchObject({
      id: draftPeriod.id,
      employee_count: 1,
      total_gross: 12_345_000,
      total_deduction: 0,
      total_net: 12_345_000,
      payslip_summary: {
        total_gross: 12_345_000,
        total_deduction: 0,
        total_net: 12_345_000,
      },
    });
  });

  it('getPeriodById exposes display-ready totals via mapPeriod (list↔get parity R-PAY-PERIOD-LIST-TOTALS)', async () => {
    const token = signServiceJwt({
      sub: 'ceo@xe.vn',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    });
    const periodRow = {
      ...draftPeriod,
      company_id: 'holding',
      status: 'processed' as const,
      employee_count: '1',
      total_gross: '12345000',
      total_deduction: '500000',
      total_net: '11845000',
    };
    db.query.mockImplementation(async (sql: string) => {
      if (sql.includes('FROM public.payroll_periods') && sql.includes('id = $1::uuid')) {
        expect(sql).toContain('LEFT JOIN LATERAL');
        expect(sql).toContain('SUM(ps.gross_amount)');
        return { rows: [periodRow] } as never;
      }
      return { rows: [] } as never;
    });

    const result = await service.getPeriodById(periodRow.id, 'main', `Bearer ${token}`);
    expect(result).toMatchObject({
      id: periodRow.id,
      total_gross: 12_345_000,
      total_deduction: 500_000,
      total_net: 11_845_000,
      payslip_summary: {
        total_gross: 12_345_000,
        total_deduction: 500_000,
        total_net: 11_845_000,
      },
    });
  });

  it('getPeriodById exposes pay_sheet_template bind via mapPeriod (list↔get parity)', async () => {
    const token = signServiceJwt({
      sub: 'ceo@xe.vn',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    });
    const tplId = 'c2073510-1b19-475e-9ce1-129e4a1b4e4d';
    const snapshot = {
      template_id: tplId,
      template_name: 'QA mẫu bind PAYTPLQA-MSIGIKB1',
    };
    const periodRow = {
      ...draftPeriod,
      company_id: 'holding',
      pay_sheet_template_id: tplId,
      sheet_template_snapshot_json: snapshot,
    };
    db.query.mockImplementation(async (sql: string) => {
      if (sql.includes('FROM public.payroll_periods') && sql.includes('id = $1::uuid')) {
        return { rows: [periodRow] } as never;
      }
      return { rows: [] } as never;
    });

    const result = await service.getPeriodById(periodRow.id, 'main', `Bearer ${token}`);
    expect(result).toMatchObject({
      id: periodRow.id,
      pay_sheet_template_id: tplId,
      sheet_template_snapshot_json: snapshot,
    });
  });

  it('getPeriodById keeps list/detail scope parity for company_id=main (G-INT-04)', async () => {
    const token = signServiceJwt({
      sub: 'ceo@xe.vn',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    });
    const periodId = 'f76f23f7-3683-4120-81b7-5126ee997b8e';
    const periodRow = {
      id: periodId,
      company_id: 'holding',
      period_label: '2026-04',
      start_date: '2026-04-01',
      end_date: '2026-04-30',
      status: 'draft' as const,
      created_by: null,
      processed_at: null,
      closed_at: null,
      created_at: '2026-04-01T00:00:00.000Z',
      updated_at: '2026-04-01T00:00:00.000Z',
    };
    db.query.mockImplementation(async (sql: string) => {
      if (sql.includes('FROM public.payroll_periods') && sql.includes('id = $1::uuid')) {
        return { rows: [periodRow] } as never;
      }
      return { rows: [] } as never;
    });

    const result = await service.getPeriodById(periodId, 'main', `Bearer ${token}`);

    expect(result.id).toBe(periodId);
    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining('company_id = ANY'),
      expect.arrayContaining([periodId, expect.any(Array)]),
    );
  });

  it('getPeriodById returns 404 when period is outside member CEO scope (G-INT-04)', async () => {
    const token = signServiceJwt({
      sub: 'du-lich.ceo@xe.vn',
      tenantId: 'xe-du-lich',
      companyId: 'main',
      roleCode: 'subsidiary_ceo',
    });
    db.query.mockImplementation(async (sql: string) => {
      if (sql.includes('FROM public.payroll_periods') && sql.includes('id = $1::uuid')) {
        return { rows: [] } as never;
      }
      return { rows: [] } as never;
    });

    await expect(
      service.getPeriodById('f76f23f7-3683-4120-81b7-5126ee997b8e', 'main', `Bearer ${token}`),
    ).rejects.toMatchObject<ApiException>({ code: 'HRM-PAY-404' });
  });

  it('lists payslips with employee_id filter (MOB-BE-05)', async () => {
    db.query.mockResolvedValue({ rows: [] } as never);
    await service.listPayslips({
      company_id: '78b8a663-f5e5-4f4d-a020-b8f950ec2037',
      employee_id: '11111111-1111-4111-8111-111111111111',
    });
    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining('p.employee_id = $2::uuid'),
      expect.arrayContaining(['78b8a663-f5e5-4f4d-a020-b8f950ec2037', '11111111-1111-4111-8111-111111111111']),
    );
  });

  it('lists payslips when mobile sends company_uuid but rows use holding slug (J-MOB-04)', async () => {
    const holdingUuid = '6efaa5d6-a4a8-4bfd-805a-3c4f003e4013';
    const token = signServiceJwt({
      sub: 'uat.nv0001@xe.vn',
      tenantId: 'xevn',
      companyId: 'holding',
      company_uuid: holdingUuid,
      roleCode: 'employee',
    });
    db.query.mockResolvedValue({ rows: [] } as never);
    await service.listPayslips(
      {
        company_id: holdingUuid,
        employee_id: '11111111-1111-4111-8111-111111111111',
      },
      `Bearer ${token}`,
    );
    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining('p.company_id = $1'),
      expect.arrayContaining(['holding', '11111111-1111-4111-8111-111111111111']),
    );
  });

  it('lists payslips via workforce scope when group CEO uses company_id=main', async () => {
    const token = signServiceJwt({
      sub: 'ceo@xe.vn',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    });
    db.query.mockResolvedValue({ rows: [] } as never);
    await service.listPayslips({ company_id: 'main' }, `Bearer ${token}`);
    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining('p.employee_id IN'),
      expect.any(Array),
    );
  });

  it('getPayslipById returns header + lines when in scope (F-PAY-PAYSLIP-01)', async () => {
    const payslipId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
    const token = signServiceJwt({
      sub: 'hrbp@xe.vn',
      tenantId: 'xevn',
      companyId: 'holding',
      roleCode: 'hrbp',
    });
    db.query.mockImplementation(async (sql: string) => {
      if (sql.includes('FROM public.payroll_payslips p') && sql.includes('p.id = $')) {
        return {
          rows: [
            {
              id: payslipId,
              company_id: 'holding',
              period_id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
              employee_id: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
              employee_code: 'NV002',
              employee_name: 'Nguyen Van B',
              gross_amount: '9500000',
              deduction_amount: '950000',
              net_amount: '8550000',
              currency: 'VND',
              status: 'processed',
              formula_definition_id: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
              created_at: '2026-07-01T00:00:00.000Z',
              updated_at: '2026-07-01T00:00:00.000Z',
              period_label: '2026-07',
            },
          ],
        } as never;
      }
      if (sql.includes('FROM public.payroll_payslip_lines')) {
        return {
          rows: [
            {
              id: 'line-1',
              payslip_id: payslipId,
              company_id: 'holding',
              component_code: 'BASE',
              amount: '9500000',
              sign: 'earning',
              source_ref: 'emp_cb:package:pkg-1:line:line-1',
              formula_definition_id: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
              sort_order: 1,
              created_at: '2026-07-01T00:00:00.000Z',
              source_tier: 'emp_cb',
            },
            {
              id: 'line-2',
              payslip_id: payslipId,
              company_id: 'holding',
              component_code: 'SI_EE',
              amount: '950000',
              sign: 'deduction',
              /** R-PAY-SRC-TIER-FIELD — stored null; GET must derive formula_default from ref */
              source_ref: 'expr:mul',
              formula_definition_id: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
              sort_order: 2,
              created_at: '2026-07-01T00:00:00.000Z',
              source_tier: null,
            },
          ],
        } as never;
      }
      return { rows: [] } as never;
    });

    const result = await service.getPayslipById(payslipId, 'holding', `Bearer ${token}`);
    expect(result.id).toBe(payslipId);
    expect(result.net_amount).toBe(8_550_000);
    expect(result.components).toHaveLength(2);
    expect(result.lines).toHaveLength(2);
    expect(result.lines[0]).toMatchObject({
      component_code: 'BASE',
      amount: 9_500_000,
      sign: 'earning',
      source_tier: 'emp_cb',
      source_ref: 'emp_cb:package:pkg-1:line:line-1',
    });
    expect(result.lines[1]).toMatchObject({
      component_code: 'SI_EE',
      source_tier: 'formula_default',
      source_ref: 'expr:mul',
    });
    expect(Object.prototype.hasOwnProperty.call(result.lines[0], 'source_tier')).toBe(true);
    expect(Object.prototype.hasOwnProperty.call(result.lines[1], 'source_tier')).toBe(true);

    const linesOnly = await service.listPayslipLines(payslipId, 'holding', `Bearer ${token}`);
    expect(linesOnly).toMatchObject({ payslip_id: payslipId, total: 2 });
    expect(linesOnly.data[0]).toMatchObject({ source_tier: 'emp_cb' });
    expect(linesOnly.data[1]).toMatchObject({ component_code: 'SI_EE', sign: 'deduction', source_tier: 'formula_default' });
  });

  it('getPayslipById returns 404 when payslip outside member CEO scope', async () => {
    const token = signServiceJwt({
      sub: 'du-lich.ceo@xe.vn',
      tenantId: 'xe-du-lich',
      companyId: 'main',
      roleCode: 'subsidiary_ceo',
    });
    db.query.mockImplementation(async (sql: string) => {
      if (sql.includes('FROM public.payroll_payslips p') && sql.includes('p.id = $')) {
        return { rows: [] } as never;
      }
      return { rows: [] } as never;
    });

    await expect(
      service.getPayslipById(
        'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
        'main',
        `Bearer ${token}`,
      ),
    ).rejects.toMatchObject<ApiException>({ code: 'HRM-PAY-404' });
  });

  it('getPayslipById uses workforce scope when group CEO company_id=main (scope_parity)', async () => {
    const token = signServiceJwt({
      sub: 'ceo@xe.vn',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    });
    db.query.mockResolvedValue({ rows: [] } as never);
    await expect(
      service.getPayslipById('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'main', `Bearer ${token}`),
    ).rejects.toMatchObject<ApiException>({ code: 'HRM-PAY-404' });
    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining('p.employee_id IN'),
      expect.any(Array),
    );
    expect(db.query).toHaveBeenCalledWith(expect.stringContaining('p.id = $'), expect.any(Array));
  });

  describe('F-PAY-PAYSLIP-01 ESS (PO-HRM-AMIS-PARITY-PAY-ESS-BE-01)', () => {
    const employeeId = '11111111-1111-4111-8111-111111111111';
    const otherEmployeeId = '22222222-2222-4222-8222-222222222222';
    const payslipId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
    const essToken = signServiceJwt({
      sub: 'uat.nv0001@xe.vn',
      tenantId: 'xevn',
      companyId: 'holding',
      employee_id: employeeId,
      roleCode: 'employee',
    });

    it('resolveEssEmployeeId rejects token without employee_id', () => {
      const ceoToken = signServiceJwt({
        sub: 'ceo@xe.vn',
        tenantId: 'xevn',
        companyId: 'main',
        roleCode: 'group_ceo',
      });
      expect(() => service.resolveEssEmployeeId(`Bearer ${ceoToken}`)).toThrow(
        expect.objectContaining({ code: 'HRM-PAY-403-ESS' }),
      );
    });

    it('listMyPayslips forces employee_id from token', async () => {
      db.query.mockResolvedValue({ rows: [] } as never);
      await service.listMyPayslips({ company_id: 'holding' }, `Bearer ${essToken}`);
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('p.employee_id = $'),
        expect.arrayContaining(['holding', employeeId]),
      );
    });

    it('getMyPayslipById returns header + lines for owner', async () => {
      db.query.mockImplementation(async (sql: string) => {
        if (sql.includes('FROM public.payroll_payslips p') && sql.includes('p.id = $')) {
          return {
            rows: [
              {
                id: payslipId,
                company_id: 'holding',
                period_id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
                employee_id: employeeId,
                employee_code: 'NV001',
                employee_name: 'UAT NV1',
                gross_amount: '9500000',
                deduction_amount: '950000',
                net_amount: '8550000',
                currency: 'VND',
                status: 'published',
                published_to_ess: true,
                published_at: '2026-08-07T09:00:00.000Z',
                payment_status: 'unpaid',
                version: 1,
                formula_definition_id: null,
                employee_confirmed_at: null,
                employee_confirmed_by: null,
                created_at: '2026-08-07T00:00:00.000Z',
                updated_at: '2026-08-07T00:00:00.000Z',
                period_label: '2026-07',
                period_start_date: '2026-07-01',
                period_end_date: '2026-07-31',
              },
            ],
          } as never;
        }
        if (sql.includes('FROM public.payroll_payslip_lines')) {
          return {
            rows: [
              {
                id: 'line-1',
                payslip_id: payslipId,
                company_id: 'holding',
                component_code: 'BASE',
                amount: '9500000',
                sign: 'earning',
                source_ref: 'var:base_salary',
                formula_definition_id: null,
                sort_order: 1,
                created_at: '2026-08-07T00:00:00.000Z',
              },
            ],
          } as never;
        }
        return { rows: [] } as never;
      });

      const result = await service.getMyPayslipById(payslipId, 'holding', `Bearer ${essToken}`);
      expect(result.id).toBe(payslipId);
      expect(result.employee_id).toBe(employeeId);
      expect(result.components).toHaveLength(1);
      expect(result.ess_confirmed).toBe(false);
    });

    it('getMyPayslipById returns 403 when payslip belongs to another employee', async () => {
      db.query.mockImplementation(async (sql: string) => {
        if (sql.includes('FROM public.payroll_payslips p') && sql.includes('p.id = $')) {
          return {
            rows: [
              {
                id: payslipId,
                company_id: 'holding',
                period_id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
                employee_id: otherEmployeeId,
                employee_code: 'NV002',
                employee_name: 'Other',
                gross_amount: '0',
                deduction_amount: '0',
                net_amount: '0',
                currency: 'VND',
                status: 'processed',
                formula_definition_id: null,
                employee_confirmed_at: null,
                employee_confirmed_by: null,
                created_at: '2026-08-07T00:00:00.000Z',
                updated_at: '2026-08-07T00:00:00.000Z',
                period_label: '2026-07',
              },
            ],
          } as never;
        }
        return { rows: [] } as never;
      });

      await expect(
        service.getMyPayslipById(payslipId, 'holding', `Bearer ${essToken}`),
      ).rejects.toMatchObject<ApiException>({ code: 'HRM-PAY-403-ESS' });
    });

    it('confirmMyPayslip stamps employee_confirmed_at and is idempotent', async () => {
      let confirmed = false;
      db.query.mockImplementation(async (sql: string) => {
        if (sql.includes('UPDATE public.payroll_payslips') && sql.includes('employee_confirmed_at')) {
          confirmed = true;
          return { rows: [] } as never;
        }
        if (sql.includes('FROM public.payroll_payslips p') && sql.includes('p.id = $')) {
          return {
            rows: [
              {
                id: payslipId,
                company_id: 'holding',
                period_id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
                employee_id: employeeId,
                employee_code: 'NV001',
                employee_name: 'UAT NV1',
                gross_amount: '9500000',
                deduction_amount: '950000',
                net_amount: '8550000',
                currency: 'VND',
                status: 'published',
                published_to_ess: true,
                published_at: '2026-08-07T09:00:00.000Z',
                payment_status: 'unpaid',
                version: 1,
                formula_definition_id: null,
                employee_confirmed_at: confirmed ? '2026-08-07T10:00:00.000Z' : null,
                employee_confirmed_by: confirmed ? employeeId : null,
                created_at: '2026-08-07T00:00:00.000Z',
                updated_at: '2026-08-07T00:00:00.000Z',
                period_label: '2026-07',
                period_start_date: '2026-07-01',
                period_end_date: '2026-07-31',
              },
            ],
          } as never;
        }
        if (sql.includes('FROM public.payroll_payslip_lines')) {
          return { rows: [] } as never;
        }
        return { rows: [] } as never;
      });

      const first = await service.confirmMyPayslip(payslipId, 'holding', `Bearer ${essToken}`);
      expect(confirmed).toBe(true);
      expect(first.ess_confirmed).toBe(true);

      const second = await service.confirmMyPayslip(payslipId, 'holding', `Bearer ${essToken}`);
      expect(second.ess_confirmed).toBe(true);
    });

    it('confirmMyPayslip rejects unpublished payslip', async () => {
      db.query.mockImplementation(async (sql: string) => {
        if (sql.includes('FROM public.payroll_payslips p') && sql.includes('p.id = $')) {
          return {
            rows: [
              {
                id: payslipId,
                company_id: 'holding',
                period_id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
                employee_id: employeeId,
                employee_code: 'NV001',
                employee_name: 'UAT NV1',
                gross_amount: '0',
                deduction_amount: '0',
                net_amount: '0',
                currency: 'VND',
                status: 'processed',
                published_to_ess: false,
                payment_status: null,
                formula_definition_id: null,
                employee_confirmed_at: null,
                employee_confirmed_by: null,
                created_at: '2026-08-07T00:00:00.000Z',
                updated_at: '2026-08-07T00:00:00.000Z',
                period_label: '2026-07',
                period_start_date: '2026-07-01',
                period_end_date: '2026-07-31',
              },
            ],
          } as never;
        }
        return { rows: [] } as never;
      });

      await expect(
        service.confirmMyPayslip(payslipId, 'holding', `Bearer ${essToken}`),
      ).rejects.toMatchObject<ApiException>({ code: 'HRM-PAY-PUBLISH-409' });
    });
  });

  it('reconciliation summary uses group rollup for company_id=main', async () => {
    const token = signServiceJwt({
      sub: 'ceo@xe.vn',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    });
    db.query.mockResolvedValue({ rows: [] } as never);
    await service.getPayrollReconciliationSummary('main', `Bearer ${token}`);
    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining('company_id = ANY'),
      expect.arrayContaining([expect.any(Array)]),
    );
  });

  it('returns eligibility rows with NO_CLOSED_SHEET when timesheet is not closed', async () => {
    db.query.mockImplementation(async (sql: string) => {
      if (sql.includes('FROM public.payroll_periods') && sql.includes('id = $1::uuid')) {
        return { rows: [draftPeriod] } as never;
      }
      if (sql.includes('SELECT EXISTS(') && sql.includes('FROM public.attendance_sheets')) {
        return { rows: [{ has_closed: false }] } as never;
      }
      if (sql.includes('FROM public.employees')) {
        return {
          rows: [
            {
              id: '11111111-1111-4111-8111-111111111111',
              employee_code: 'EMP001',
              full_name: 'Nguyen Van A',
              status: 'active',
              hired_at: '2026-04-10',
            },
          ],
        } as never;
      }
      return { rows: [] } as never;
    });

    const result = await service.getPayrollEligibility(draftPeriod.id, 'holding');
    expect(result.eligible_count).toBe(0);
    expect(result.items[0]).toMatchObject({
      employee_code: 'EMP001',
      eligible: false,
    });
    expect(result.items[0].reasons).toEqual(expect.arrayContaining(['NO_CLOSED_SHEET', 'HIRE_MID_MONTH']));
  });

  it('R-PAY-SRC-03 — eligibility for period.company_id=main uses holding OU (not silent items[])', async () => {
    const token = signServiceJwt({
      sub: 'ceo@xe.vn',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    });
    const mainPeriod = { ...draftPeriod, company_id: 'main' };
    let employeeSql = '';
    let employeeParams: unknown[] = [];
    db.query.mockImplementation(async (sql: string, params?: unknown[]) => {
      if (sql.includes('CREATE TABLE') || sql.includes('ALTER TABLE') || sql.includes('CREATE UNIQUE')) {
        return { rows: [] } as never;
      }
      if (sql.includes('FROM public.payroll_periods') && sql.includes('id = $1::uuid')) {
        return { rows: [mainPeriod] } as never;
      }
      if (sql.includes('information_schema.tables') && sql.includes('pay_period_timesheet_bind')) {
        return { rows: [{ exists: true }] } as never;
      }
      if (sql.includes('FROM public.pay_period_timesheet_bind')) {
        return { rows: [{ timesheet_header_id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa' }] } as never;
      }
      if (sql.includes('FROM public.employees')) {
        employeeSql = sql;
        employeeParams = params ?? [];
        return {
          rows: [
            {
              id: '3796d949-4513-45c0-88fa-33030a062b17',
              employee_code: 'HLD-0001',
              full_name: 'Nguyễn Văn An',
              status: 'active',
              hired_at: '2025-01-01',
            },
          ],
        } as never;
      }
      return { rows: [] } as never;
    });

    const result = await service.getPayrollEligibility(mainPeriod.id, 'main', `Bearer ${token}`);
    expect(result.items).toHaveLength(1);
    expect(result.eligible_count).toBe(1);
    expect(result.items[0]).toMatchObject({
      employee_code: 'HLD-0001',
      eligible: true,
    });
    expect(employeeSql).toMatch(/company_id = ANY/);
    // Must not force exact company_id = 'main' only (silent empty vs holding employees).
    const flatParams = JSON.stringify(employeeParams);
    expect(flatParams).toContain('holding');
  });

  it('F-PAY-ADV-EMP-01 — createAdvanceRequestEmployee inserts row while pending', async () => {
    const requestId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
    const empId = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
    db.query.mockImplementation(async (sql: string) => {
      if (sql.includes('CREATE TABLE') || sql.includes('ALTER TABLE') || sql.includes('CREATE UNIQUE')) {
        return { rows: [] } as never;
      }
      if (sql.includes('FROM public.advance_requests') && sql.includes('LIMIT 1')) {
        return { rows: [{ company_id: 'holding', status: 'pending' }] } as never;
      }
      if (sql.includes('INSERT INTO public.advance_request_employees')) {
        return {
          rows: [
            {
              id: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
              company_id: 'holding',
              request_id: requestId,
              employee_id: empId,
              employee_code: 'HLD-0001',
              employee_name: 'Nguyễn Văn An',
              advance_amount: '1500000',
            },
          ],
        } as never;
      }
      if (sql.includes('UPDATE public.advance_requests')) {
        return { rows: [] } as never;
      }
      return { rows: [] } as never;
    });

    const row = await service.createAdvanceRequestEmployee(
      requestId,
      {
        employee_id: empId,
        employee_code: 'HLD-0001',
        employee_name: 'Nguyễn Văn An',
        advance_amount: 1_500_000,
      },
      'holding',
    );
    expect(row.employee_code).toBe('HLD-0001');
    expect(db.query.mock.calls.some(([s]) => String(s).includes('INSERT INTO public.advance_request_employees'))).toBe(
      true,
    );
  });

  it('F-PAY-ADV-EMP-01 — createAdvanceRequestEmployee rejects when not pending', async () => {
    db.query.mockImplementation(async (sql: string) => {
      if (sql.includes('CREATE TABLE') || sql.includes('ALTER TABLE') || sql.includes('CREATE UNIQUE')) {
        return { rows: [] } as never;
      }
      if (sql.includes('FROM public.advance_requests')) {
        return { rows: [{ company_id: 'holding', status: 'approved' }] } as never;
      }
      return { rows: [] } as never;
    });
    await expect(
      service.createAdvanceRequestEmployee(
        'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
        { employee_code: 'HLD-0001', employee_name: 'An', advance_amount: 1000 },
        'holding',
      ),
    ).rejects.toMatchObject<ApiException>({ code: 'HRM-ADV-409' });
  });

  it('NO_CLOSED_SHEET uses same calendar month as payroll period (not any closed sheet)', async () => {
    const janPeriod = {
      ...draftPeriod,
      period_label: '2026-01',
      start_date: '2026-01-01',
      end_date: '2026-01-28',
    };
    let attendanceSql = '';
    db.query.mockImplementation(async (sql: string) => {
      if (sql.includes('FROM public.payroll_periods') && sql.includes('id = $1::uuid')) {
        return { rows: [janPeriod] } as never;
      }
      if (sql.includes('SELECT EXISTS(') && sql.includes('FROM public.attendance_sheets')) {
        attendanceSql = sql;
        return { rows: [{ has_closed: false }] } as never;
      }
      if (sql.includes('FROM public.employees')) {
        return {
          rows: [
            {
              id: '11111111-1111-4111-8111-111111111111',
              employee_code: 'EMP001',
              full_name: 'Nguyen Van A',
              status: 'active',
              hired_at: '2026-01-01',
            },
          ],
        } as never;
      }
      return { rows: [] } as never;
    });

    const result = await service.getPayrollEligibility(janPeriod.id, 'holding');
    expect(result.eligible_count).toBe(0);
    expect(result.items[0].reasons).toContain('NO_CLOSED_SHEET');
    expect(attendanceSql).toContain("date_trunc('month', s.start_date");
    expect(attendanceSql).not.toContain('daterange(');
    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining('date_trunc'),
      expect.arrayContaining([
        expect.arrayContaining(['holding', 'main']),
        '2026-01-01',
      ]),
    );
  });

  it('eligible when closed attendance sheet matches payroll period month and company', async () => {
    const janPeriod = {
      ...draftPeriod,
      period_label: '2026-01',
      start_date: '2026-01-01',
      end_date: '2026-01-28',
    };
    db.query.mockImplementation(async (sql: string) => {
      if (sql.includes('FROM public.payroll_periods') && sql.includes('id = $1::uuid')) {
        return { rows: [janPeriod] } as never;
      }
      if (sql.includes('SELECT EXISTS(') && sql.includes('FROM public.attendance_sheets')) {
        return { rows: [{ has_closed: true }] } as never;
      }
      if (sql.includes('FROM public.employees')) {
        return {
          rows: [
            {
              id: '11111111-1111-4111-8111-111111111111',
              employee_code: 'EMP001',
              full_name: 'Nguyen Van A',
              status: 'active',
              hired_at: '2026-01-01',
            },
          ],
        } as never;
      }
      return { rows: [] } as never;
    });

    const result = await service.getPayrollEligibility(janPeriod.id, 'holding');
    expect(result.eligible_count).toBe(1);
    expect(result.items[0].eligible).toBe(true);
    expect(result.items[0].reasons).not.toContain('NO_CLOSED_SHEET');
  });

  it('enrolls only eligible employees and reports rejected reasons', async () => {
    db.query.mockImplementation(async (sql: string) => {
      if (sql.includes('FROM public.payroll_periods') && sql.includes('id = $1::uuid')) {
        return { rows: [draftPeriod] } as never;
      }
      if (sql.includes('SELECT EXISTS(') && sql.includes('FROM public.attendance_sheets')) {
        return { rows: [{ has_closed: true }] } as never;
      }
      if (sql.includes('FROM public.employees')) {
        return {
          rows: [
            {
              id: '11111111-1111-4111-8111-111111111111',
              employee_code: 'EMP001',
              full_name: 'Nguyen Van A',
              status: 'active',
              hired_at: '2026-03-01',
            },
            {
              id: '22222222-2222-4222-8222-222222222222',
              employee_code: 'EMP002',
              full_name: 'Tran Van B',
              status: 'inactive',
              hired_at: '2026-03-01',
            },
          ],
        } as never;
      }
      if (sql.includes('INSERT INTO public.payroll_payslips')) {
        return {
          rows: [
            {
              id: 'ps-1',
              company_id: 'holding',
              period_id: draftPeriod.id,
              employee_id: '11111111-1111-4111-8111-111111111111',
              employee_code: 'EMP001',
              employee_name: 'Nguyen Van A',
              gross_amount: '0',
              deduction_amount: '0',
              net_amount: '0',
              currency: 'VND',
              status: 'draft',
              created_at: '2026-04-01T00:00:00.000Z',
              updated_at: '2026-04-01T00:00:00.000Z',
            },
          ],
        } as never;
      }
      return { rows: [] } as never;
    });

    const result = await service.enrollPayrollPeriod(
      draftPeriod.id,
      'holding',
      {
        mode: 'explicit',
        employee_ids: [
          '11111111-1111-4111-8111-111111111111',
          '22222222-2222-4222-8222-222222222222',
        ],
      },
      undefined,
    );
    expect(result.employee_count).toBe(1);
    expect(result.enrolled[0]).toMatchObject({ employee_code: 'EMP001', status: 'draft' });
    expect(result.rejected[0]).toMatchObject({
      employee_id: '22222222-2222-4222-8222-222222222222',
      reasons: ['NOT_ACTIVE'],
    });
  });

  it('process refuses silent zero when no published formula (FORMULA-412)', async () => {
    db.query.mockImplementation(async (sql: string) => {
      if (sql.includes('FROM public.payroll_periods') && sql.includes('id = $1::uuid') && sql.includes('LIMIT 1')) {
        return { rows: [draftPeriod] } as never;
      }
      if (sql.includes('SELECT EXISTS(') && sql.includes('FROM public.attendance_sheets')) {
        return { rows: [{ has_closed: true }] } as never;
      }
      if (sql.includes('FROM public.employees')) {
        return {
          rows: [
            {
              id: '11111111-1111-4111-8111-111111111111',
              employee_code: 'EMP001',
              full_name: 'Nguyen Van A',
              status: 'active',
              hired_at: '2026-03-01',
            },
          ],
        } as never;
      }
      return { rows: [] } as never;
    });

    await expect(service.processPayrollPeriod(draftPeriod.id, 'holding')).rejects.toMatchObject({
      code: HRM_PAY_FORMULA_412,
    });
  });

  it('process binds published gd1_eval_v1 → payslip lines + amounts', async () => {
    const formulaId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
    payFormulas.resolvePublishedFormulaForProcess.mockResolvedValue({
      id: formulaId,
      company_id: 'holding',
      code: 'std_pay',
      version: 1,
      status: 'active',
      expression_json: { form: 'gd1_eval_v1', lines: [] },
      required_vars_json: { keys: ['base_salary'] },
      source: 'company_active',
    });
    payFormulas.processEmployeePayslipViaSrc.mockResolvedValue({
      mode: 'computed',
      lines: [
        {
          component_code: 'BASE',
          sign: 'earning',
          amount: 10_000_000,
          source_ref: 'emp_cb:base_salary',
          sort_order: 0,
          source_tier: 'emp_cb',
          formula_definition_id: null,
        },
      ],
      gross: 10_000_000,
      deduction: 0,
      net: 10_000_000,
      primaryFormulaDefinitionId: formulaId,
      sourceTiers: ['emp_cb'],
      warnings: ['SRC_RESOLVER_GD1'],
    });

    db.query.mockImplementation(async (sql: string) => {
      if (sql.includes('FROM public.payroll_periods') && sql.includes('id = $1::uuid') && sql.includes('LIMIT 1')) {
        return { rows: [draftPeriod] } as never;
      }
      if (sql.includes('SELECT EXISTS(') && sql.includes('FROM public.attendance_sheets')) {
        return { rows: [{ has_closed: true }] } as never;
      }
      if (sql.includes('FROM public.employees')) {
        return {
          rows: [
            {
              id: '11111111-1111-4111-8111-111111111111',
              employee_code: 'EMP001',
              full_name: 'Nguyen Van A',
              status: 'active',
              hired_at: '2026-03-01',
            },
          ],
        } as never;
      }
      if (sql.includes('SELECT COUNT(*)::text AS total') && sql.includes('FROM public.payroll_payslips')) {
        return { rows: [{ total: '0' }] } as never;
      }
      if (sql.includes('INSERT INTO public.payroll_payslips')) {
        return {
          rows: [
            {
              id: 'ps-1',
              company_id: 'holding',
              period_id: draftPeriod.id,
              employee_id: '11111111-1111-4111-8111-111111111111',
              employee_code: 'EMP001',
              employee_name: 'Nguyen Van A',
              gross_amount: '10000000',
              deduction_amount: '0',
              net_amount: '10000000',
              currency: 'VND',
              status: 'processed',
              formula_definition_id: formulaId,
              created_at: '2026-04-01T00:00:00.000Z',
              updated_at: '2026-04-01T00:00:00.000Z',
            },
          ],
        } as never;
      }
      if (sql.includes('SELECT id::text AS id, employee_id') && sql.includes('FROM public.payroll_payslips')) {
        return {
          rows: [
            {
              id: 'ps-1',
              employee_id: '11111111-1111-4111-8111-111111111111',
              employee_code: 'EMP001',
              employee_name: 'Nguyen Van A',
              gross_amount: '0',
              deduction_amount: '0',
              net_amount: '0',
            },
          ],
        } as never;
      }
      if (sql.includes('UPDATE public.payroll_periods') && sql.includes("SET status = 'processed'")) {
        return {
          rows: [
            {
              ...draftPeriod,
              status: 'processed',
              processed_at: '2026-04-30T10:00:00.000Z',
              updated_at: '2026-04-30T10:00:00.000Z',
              formula_definition_id: formulaId,
            },
          ],
        } as never;
      }
      if (sql.includes('COALESCE(SUM(gross_amount), 0)::text AS total_gross')) {
        return {
          rows: [
            {
              employee_count: '1',
              total_gross: '10000000',
              total_deduction: '0',
              total_net: '10000000',
            },
          ],
        } as never;
      }
      return { rows: [] } as never;
    });

    const result = await service.processPayrollPeriod(draftPeriod.id, 'holding');
    expect(result.status).toBe('processed');
    expect(result.employee_count).toBe(1);
    expect(result.payslip_summary).toMatchObject({
      total_gross: 10_000_000,
      total_deduction: 0,
      total_net: 10_000_000,
    });
    expect(result).toMatchObject({
      total_gross: 10_000_000,
      total_deduction: 0,
      total_net: 10_000_000,
    });
    expect(result.formula_bind).toMatchObject({ formula_definition_id: formulaId, source: 'company_active' });
    expect(result.payroll_e2e_ready).toBe(false);
    expect(payFormulas.replacePayslipLines).toHaveBeenCalledWith(
      expect.objectContaining({
        payslipId: 'ps-1',
        formulaDefinitionId: formulaId,
      }),
    );
  });

  describe('PO-HRM-E2E-LINK-PAY-HIRE-BE-03 scope parity (main ↔ holding)', () => {
    const groupCeoToken = signServiceJwt({
      sub: 'ceo@xe.vn',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    });

    it('createPayrollPeriod with company_id=main persists holding TEXT for group CEO', async () => {
      db.query.mockImplementation(async (sql: string) => {
        if (sql.includes('daterange(start_date, end_date')) {
          return { rows: [] } as never;
        }
        if (sql.includes('INSERT INTO public.payroll_periods')) {
          return {
            rows: [
              {
                ...draftPeriod,
                company_id: 'holding',
                period_label: '2026-10',
                start_date: '2026-10-01',
                end_date: '2026-10-31',
              },
            ],
          } as never;
        }
        return { rows: [] } as never;
      });

      const result = await service.createPayrollPeriod(
        {
          company_id: 'main',
          period_label: '2026-10',
          start_date: '2026-10-01',
          end_date: '2026-10-31',
        },
        `Bearer ${groupCeoToken}`,
        'xevn',
      );

      expect(result.company_id).toBe('holding');
      const insertCall = db.query.mock.calls.find(([sql]) =>
        String(sql).includes('INSERT INTO public.payroll_periods'),
      );
      expect(insertCall?.[1]?.[1]).toBe('holding');
    });

    it('listPayrollPeriods company_id=main includes holding draft and legacy main orphan', async () => {
      const holdingDraft = {
        ...draftPeriod,
        status: 'draft' as const,
        employee_count: '0',
        total_gross: '0',
        total_deduction: '0',
        total_net: '0',
      };
      const mainOrphan = {
        ...draftPeriod,
        id: 'f12909dd-ce2f-4eee-947e-5318afb532b6',
        company_id: 'main',
        period_label: '2026-11',
        employee_count: '0',
        total_gross: '0',
        total_deduction: '0',
        total_net: '0',
      };
      db.query.mockImplementation(async (sql: string) => {
        if (sql.includes('FROM public.payroll_periods') && sql.includes('ORDER BY payroll_periods.start_date DESC')) {
          return { rows: [holdingDraft, mainOrphan] } as never;
        }
        return { rows: [] } as never;
      });

      const result = await service.listPayrollPeriods(
        { company_id: 'main' },
        `Bearer ${groupCeoToken}`,
      );

      expect(result.total).toBe(2);
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('company_id = ANY'),
        expect.arrayContaining([
          expect.arrayContaining(['holding', 'main']),
        ]),
      );
    });

    it('getPayrollEligibility resolves legacy main-stored draft (list↔get parity)', async () => {
      const mainPeriod = {
        ...draftPeriod,
        id: 'f12909dd-ce2f-4eee-947e-5318afb532b6',
        company_id: 'main',
      };
      db.query.mockImplementation(async (sql: string) => {
        if (sql.includes('FROM public.payroll_periods') && sql.includes('id = $1::uuid')) {
          return { rows: [mainPeriod] } as never;
        }
        if (sql.includes('SELECT EXISTS(') && sql.includes('FROM public.attendance_sheets')) {
          return { rows: [{ has_closed: false }] } as never;
        }
        if (sql.includes('FROM public.employees')) {
          return { rows: [] } as never;
        }
        return { rows: [] } as never;
      });

      const result = await service.getPayrollEligibility(
        mainPeriod.id,
        'main',
        `Bearer ${groupCeoToken}`,
      );

      expect(result.period_id).toBe(mainPeriod.id);
      expect(result.eligible_count).toBe(0);
    });

    it('processPayrollPeriod resolves holding-stored draft for company_id=main query', async () => {
      db.query.mockImplementation(async (sql: string) => {
        if (sql.includes('FROM public.payroll_periods') && sql.includes('id = $1::uuid') && sql.includes('LIMIT 1')) {
          return { rows: [draftPeriod] } as never;
        }
        if (sql.includes('SELECT EXISTS(') && sql.includes('FROM public.attendance_sheets')) {
          return { rows: [{ has_closed: false }] } as never;
        }
        return { rows: [] } as never;
      });

      await expect(
        service.processPayrollPeriod(draftPeriod.id, 'main', `Bearer ${groupCeoToken}`),
      ).rejects.toMatchObject<ApiException>({ code: 'HRM-PAY-ATT-412' });
    });

    it('AC-PAY-02-PROCESS-ORDER — ATT-412 before resolvePublishedFormulaForProcess', async () => {
      payFormulas.resolvePublishedFormulaForProcess.mockReset();
      payFormulas.resolvePublishedFormulaForProcess.mockResolvedValue({
        id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
        company_id: 'holding',
        code: 'std_pay',
        version: 1,
        status: 'active',
        expression_json: { form: 'gd1_eval_v1', lines: [] },
        required_vars_json: { keys: ['base_salary'] },
        source: 'company_active',
      });
      db.query.mockImplementation(async (sql: string) => {
        if (sql.includes('FROM public.payroll_periods') && sql.includes('id = $1::uuid') && sql.includes('LIMIT 1')) {
          return { rows: [draftPeriod] } as never;
        }
        if (sql.includes('SELECT EXISTS(') && sql.includes('FROM public.attendance_sheets')) {
          return { rows: [{ has_closed: false }] } as never;
        }
        return { rows: [] } as never;
      });

      await expect(
        service.processPayrollPeriod(draftPeriod.id, 'holding'),
      ).rejects.toMatchObject<ApiException>({ code: 'HRM-PAY-ATT-412' });
      expect(payFormulas.resolvePublishedFormulaForProcess).not.toHaveBeenCalled();
    });

    it('R-PAY-01-BOUNDARY — processPayrollPeriod rejects HRM-PAY-BOUNDARY-403 before DB', async () => {
      __setPayAttHourCrossreadViolationForTests(true);
      await expect(
        service.processPayrollPeriod(draftPeriod.id, 'holding'),
      ).rejects.toMatchObject<ApiException>({ code: HRM_PAY_BOUNDARY_403 });
      __setPayAttHourCrossreadViolationForTests(false);
    });

    it('holding-scoped periods remain accessible without regression', async () => {
      db.query.mockImplementation(async (sql: string) => {
        if (sql.includes('FROM public.payroll_periods') && sql.includes('id = $1::uuid')) {
          return { rows: [draftPeriod] } as never;
        }
        return { rows: [] } as never;
      });

      const result = await service.getPeriodById(draftPeriod.id, 'holding', `Bearer ${groupCeoToken}`);
      expect(result.company_id).toBe('holding');
    });
  });

  describe('advance request mutations (P1-BND-BE-01)', () => {
    const requestId = '11111111-1111-4111-8111-111111111111';
    const decideBody = { reviewer_name: 'HR Manager' };

    it('approveAdvanceRequest transitions pending to approved with scope parity on holding', async () => {
      const token = signServiceJwt({
        sub: 'ceo@xe.vn',
        tenantId: 'xevn',
        companyId: 'main',
        roleCode: 'group_ceo',
      });
      db.query.mockImplementation(async (sql: string) => {
        if (sql.includes('CREATE TABLE')) return { rows: [] } as never;
        if (sql.includes('SELECT company_id') && sql.includes('advance_requests')) {
          return { rows: [{ company_id: 'holding', status: 'pending' }] } as never;
        }
        if (sql.includes("SET status = 'approved'")) {
          return { rows: [{ id: requestId, company_id: 'holding', status: 'approved' }] } as never;
        }
        return { rows: [] } as never;
      });

      const row = await service.approveAdvanceRequest(
        requestId,
        decideBody,
        'main',
        `Bearer ${token}`,
        'xevn',
      );
      expect(row.status).toBe('approved');
      const updateCall = db.query.mock.calls.find(([sql]) =>
        String(sql).includes("SET status = 'approved'"),
      );
      expect(updateCall).toBeDefined();
    });

    it('rejectAdvanceRequest throws HRM-ADV-404 when request is not pending', async () => {
      db.query.mockImplementation(async (sql: string) => {
        if (sql.includes('CREATE TABLE')) return { rows: [] } as never;
        if (sql.includes('SELECT company_id') && sql.includes('advance_requests')) {
          return { rows: [{ company_id: 'holding', status: 'pending' }] } as never;
        }
        if (sql.includes("SET status = 'rejected'")) {
          return { rows: [] } as never;
        }
        return { rows: [] } as never;
      });

      await expect(
        service.rejectAdvanceRequest(requestId, { ...decideBody, rejected_reason: 'no budget' }, 'main', undefined, 'xevn'),
      ).rejects.toMatchObject<ApiException>({ code: 'HRM-ADV-404' });
    });

    it('markAdvanceRequestPaid transitions approved to paid and bridges input lines', async () => {
      db.query.mockImplementation(async (sql: string) => {
        if (sql.includes('CREATE TABLE')) return { rows: [] } as never;
        if (sql.includes('SELECT company_id') && sql.includes('advance_requests')) {
          return { rows: [{ company_id: 'holding', status: 'approved' }] } as never;
        }
        if (sql.includes("SET status = 'paid'")) {
          return { rows: [{ id: requestId, company_id: 'holding', status: 'paid' }] } as never;
        }
        return { rows: [] } as never;
      });
      payInputPack.bridgeAdvanceRequestToPeriod.mockResolvedValue({
        bridgedInputLineIds: ['line-1'],
        failedEmployees: [],
      });

      const row = await service.markAdvanceRequestPaid(
        requestId,
        { ...decideBody, payrollPeriodId: draftPeriod.id },
        'main',
        undefined,
        'xevn',
      );
      expect(row.status).toBe('paid');
      expect(payInputPack.bridgeAdvanceRequestToPeriod).toHaveBeenCalled();
      expect(row.bridgedInputLineIds).toEqual(['line-1']);
    });

    it('markAdvanceRequestPaid throws HRM-ADV-404 when request is not approved', async () => {
      db.query.mockImplementation(async (sql: string) => {
        if (sql.includes('CREATE TABLE')) return { rows: [] } as never;
        if (sql.includes('SELECT company_id') && sql.includes('advance_requests')) {
          return { rows: [{ company_id: 'holding', status: 'pending' }] } as never;
        }
        if (sql.includes("SET status = 'paid'")) {
          return { rows: [] } as never;
        }
        return { rows: [] } as never;
      });

      await expect(
        service.markAdvanceRequestPaid(requestId, { ...decideBody, payrollPeriodId: draftPeriod.id }, 'main', undefined, 'xevn'),
      ).rejects.toMatchObject<ApiException>({ code: 'HRM-ADV-404' });
    });
  });
});
