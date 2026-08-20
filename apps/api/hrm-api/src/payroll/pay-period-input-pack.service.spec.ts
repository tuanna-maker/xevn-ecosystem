import { ApiException } from '../common/api.exception';
import { HttpStatus } from '@nestjs/common';
import { signServiceJwt } from '../common/jwt-sign';
import { HrmDbService } from '../db/hrm-db.service';
import {
  HRM_PAY_ATT_412,
  HRM_PAY_INP_409_DUP,
  HRM_PAY_PERIOD_409_IMMUTABLE,
} from './pay-period-input-pack.constants';
import {
  ensurePayPeriodInputPackSchema,
  PayPeriodInputPackService,
} from './pay-period-input-pack.service';
import { hasActiveTimesheetBindForPeriod } from './pay-period-bind-resolver';

describe('PayPeriodInputPackService (PO-HRM-AMIS-PARITY-PAY-INPUT-PACK-BE-01/02)', () => {
  let db: jest.Mocked<HrmDbService>;
  let svc: PayPeriodInputPackService;

  const periodId = 'f76f23f7-3683-4120-81b7-5126ee997b8e';
  const sheetId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
  const bindId = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
  const employeeId = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';

  beforeEach(() => {
    db = {
      query: jest.fn(),
      onModuleDestroy: jest.fn(),
    } as unknown as jest.Mocked<HrmDbService>;
    svc = new PayPeriodInputPackService(db);
  });

  it('ensurePayPeriodInputPackSchema creates bind + input tables without closed enum CHECK', async () => {
    await ensurePayPeriodInputPackSchema(db);
    const sql = db.query.mock.calls.map(([s]) => String(s)).join('\n');
    expect(sql).toContain('pay_period_timesheet_bind');
    expect(sql).toContain('pay_period_input_lines');
    expect(sql).toContain('uq_pay_period_timesheet_bind_active');
    expect(sql).toContain('uq_pay_period_input_active');
    expect(sql).not.toMatch(/CHECK\s*\(\s*source_kind\s+IN/i);
  });

  describe('VAL-INP-BIND-01 — assertClosedSheetForBind / ATT-412', () => {
    it('rejects bind when attendance sheet is not closed', async () => {
      db.query.mockImplementation(async (sql: string) => {
        if (sql.includes('CREATE TABLE')) return { rows: [] } as never;
        if (sql.includes('FROM public.payroll_periods')) {
          return {
            rows: [
              {
                id: periodId,
                company_id: 'holding',
                start_date: '2026-04-01',
                end_date: '2026-04-30',
                status: 'draft',
              },
            ],
          } as never;
        }
        if (sql.includes('FROM public.attendance_sheets')) {
          return {
            rows: [
              {
                company_id: 'holding',
                status: 'open',
                start_date: '2026-04-01',
                end_date: '2026-04-30',
              },
            ],
          } as never;
        }
        return { rows: [] } as never;
      });

      await expect(
        svc.createTimesheetBind(
          periodId,
          { timesheetHeaderId: sheetId },
          'holding',
        ),
      ).rejects.toMatchObject<ApiException>({ code: HRM_PAY_ATT_412 });
    });
  });

  describe('VAL-INP-BIND-04 — scope_parity list id under main rollup', () => {
    it('list returns bind under main; get-by-id same id succeeds with group CEO token', async () => {
      const token = signServiceJwt({
        sub: 'ceo@xe.vn',
        tenantId: 'xevn',
        companyId: 'main',
        roleCode: 'group_ceo',
      });

      db.query.mockImplementation(async (sql: string) => {
        if (sql.includes('CREATE TABLE')) return { rows: [] } as never;
        if (sql.includes('FROM public.payroll_periods')) {
          return {
            rows: [
              {
                id: periodId,
                company_id: 'holding',
                start_date: '2026-04-01',
                end_date: '2026-04-30',
                status: 'draft',
              },
            ],
          } as never;
        }
        if (
          sql.includes('FROM public.pay_period_timesheet_bind b') &&
          sql.includes('ORDER BY')
        ) {
          return {
            rows: [
              {
                id: bindId,
                company_id: 'holding',
                payroll_period_id: periodId,
                timesheet_header_id: sheetId,
                transfer_kind: 'closed_transfer',
                bound_at: '2026-04-05T00:00:00.000Z',
                bound_by: null,
                note: null,
                archived_at: null,
                timesheet_code: null,
                timesheet_name: 'Công tháng 4',
                timesheet_status: 'closed',
                sheet_date_from: '2026-04-01',
                sheet_date_to: '2026-04-30',
              },
            ],
          } as never;
        }
        if (
          sql.includes('FROM public.pay_period_timesheet_bind b') &&
          sql.includes('LIMIT 1')
        ) {
          return {
            rows: [
              {
                id: bindId,
                company_id: 'holding',
                payroll_period_id: periodId,
                timesheet_header_id: sheetId,
                transfer_kind: 'closed_transfer',
                bound_at: '2026-04-05T00:00:00.000Z',
                bound_by: null,
                note: null,
                archived_at: null,
                timesheet_code: null,
                timesheet_name: 'Công tháng 4',
                timesheet_status: 'closed',
                sheet_date_from: '2026-04-01',
                sheet_date_to: '2026-04-30',
              },
            ],
          } as never;
        }
        return { rows: [] } as never;
      });

      const list = await svc.listTimesheetBinds(
        periodId,
        'main',
        `Bearer ${token}`,
      );
      expect(list.items).toHaveLength(1);
      expect(list.items[0].id).toBe(bindId);
      expect(list.items[0].timesheetDisplayLabel).toBe('Công tháng 4');
      expect(list.items[0].timesheetStatus).toBe('closed');

      const listSql = db.query.mock.calls
        .map(([s]) => String(s))
        .find(
          (s) =>
            s.includes('FROM public.pay_period_timesheet_bind b') &&
            s.includes('ORDER BY'),
        );
      expect(listSql).toBeDefined();
      expect(listSql).not.toMatch(/s\.code\b/);
      expect(listSql).toMatch(/s\.name\s+AS\s+timesheet_name/);

      const got = await svc.getTimesheetBindById(
        periodId,
        bindId,
        'main',
        `Bearer ${token}`,
      );
      expect(got.id).toBe(bindId);
      expect(got.timesheetDisplayLabel).toContain('Công tháng 4');
      expect(got.timesheetStatus).toBe('closed');
    });
  });

  describe('R-PAY-INP-BIND-SHEET-CODE-COL — bind list without attendance_sheets.code', () => {
    it('LIST SQL never selects s.code (column ABSENT on attendance_sheets)', async () => {
      db.query.mockImplementation(async (sql: string) => {
        if (sql.includes('CREATE TABLE') || sql.includes('ALTER TABLE'))
          return { rows: [] } as never;
        if (sql.includes('FROM public.payroll_periods')) {
          return {
            rows: [
              {
                id: periodId,
                company_id: 'holding',
                start_date: '2026-04-01',
                end_date: '2026-04-30',
                status: 'draft',
              },
            ],
          } as never;
        }
        if (sql.includes('FROM public.pay_period_timesheet_bind')) {
          return {
            rows: [
              {
                id: bindId,
                company_id: 'holding',
                payroll_period_id: periodId,
                timesheet_header_id: sheetId,
                transfer_kind: 'closed_transfer',
                bound_at: '2026-04-05T00:00:00.000Z',
                bound_by: null,
                note: null,
                archived_at: null,
                timesheet_code: null,
                timesheet_name: 'QA-SHEET-NO-CODE',
                timesheet_status: 'closed',
                sheet_date_from: '2026-04-01',
                sheet_date_to: '2026-04-30',
              },
            ],
          } as never;
        }
        return { rows: [] } as never;
      });

      const list = await svc.listTimesheetBinds(periodId, 'holding');
      expect(list.items[0].timesheetDisplayLabel).toBe('QA-SHEET-NO-CODE');
      const bindSelectCalls = db.query.mock.calls
        .map(([s]) => String(s))
        .filter(
          (s) =>
            s.includes('pay_period_timesheet_bind') &&
            s.includes('attendance_sheets'),
        );
      expect(bindSelectCalls.length).toBeGreaterThan(0);
      for (const sql of bindSelectCalls) {
        expect(sql).not.toMatch(/s\.code\b/);
      }
    });
  });

  describe('VAL-INP-ADV-01 — advance bridge upserts input line', () => {
    it('bridges paid advance employees to pay_period_input_lines', async () => {
      db.query.mockImplementation(async (sql: string, params?: unknown[]) => {
        if (sql.includes('CREATE TABLE')) return { rows: [] } as never;
        if (sql.includes('FROM public.advance_requests')) {
          return {
            rows: [{ id: 'req-1', company_id: 'holding', status: 'paid' }],
          } as never;
        }
        if (sql.includes('FROM public.payroll_periods')) {
          return {
            rows: [
              {
                id: periodId,
                company_id: 'holding',
                start_date: '2026-04-01',
                end_date: '2026-04-30',
                status: 'draft',
              },
            ],
          } as never;
        }
        if (sql.includes('FROM public.salary_components')) {
          return { rows: [{ id: 'comp-1' }] } as never;
        }
        if (sql.includes('FROM public.advance_request_employees')) {
          return {
            rows: [
              {
                id: 'are-1',
                employee_id: employeeId,
                employee_code: 'NV001',
                advance_amount: '2000000',
              },
            ],
          } as never;
        }
        if (
          sql.includes('FROM public.pay_period_input_lines') &&
          sql.includes('LIMIT 1')
        ) {
          return { rows: [] } as never;
        }
        if (sql.includes('INSERT INTO public.pay_period_input_lines')) {
          return { rows: [] } as never;
        }
        return { rows: [] } as never;
      });

      const result = await svc.bridgeAdvanceRequestToPeriod({
        requestId: 'req-1',
        payrollPeriodId: periodId,
        requestedCompanyId: 'holding',
      });
      expect(result.bridgedInputLineIds).toHaveLength(1);
      expect(result.failedEmployees).toEqual([]);
      const insertCall = db.query.mock.calls.find(([s]) =>
        String(s).includes('INSERT INTO public.pay_period_input_lines'),
      );
      expect(insertCall).toBeDefined();
      expect(String(insertCall?.[0])).toContain('advance');
      expect(insertCall?.[1]).toEqual(
        expect.arrayContaining([
          expect.anything(),
          expect.anything(),
          employeeId,
        ]),
      );
      // source_ref grain — advance_request_employee:{id}
      const insertParams = insertCall?.[1] as unknown[];
      expect(
        insertParams?.some(
          (p) => String(p) === 'advance_request_employee:are-1',
        ),
      ).toBe(true);
    });
  });

  describe('AC-PAY-02-COMP-01 — R-PAY-02-COMP-01 period input pack', () => {
    it('createInputLine rejects invent component_code when Nest catalog effective active > 0', async () => {
      db.query.mockImplementation(async (sql: string) => {
        if (sql.includes('CREATE TABLE')) return { rows: [] } as never;
        if (sql.includes('FROM public.payroll_periods')) {
          return {
            rows: [
              {
                id: periodId,
                company_id: 'holding',
                start_date: '2026-04-01',
                end_date: '2026-04-30',
                status: 'draft',
              },
            ],
          } as never;
        }
        if (sql.includes('COUNT(*)') && sql.includes('salary_components')) {
          return { rows: [{ c: '2' }] } as never;
        }
        if (
          sql.includes('FROM public.salary_components') &&
          sql.includes('lower(code)')
        ) {
          return { rows: [] } as never;
        }
        return { rows: [] } as never;
      });

      await expect(
        svc.createInputLine(
          periodId,
          {
            employeeId,
            componentCode: 'INVENT_PACK_X',
            amount: 100_000,
            sourceKind: 'other_income',
          },
          'holding',
        ),
      ).rejects.toMatchObject<ApiException>({ code: 'HRM-SC-COMP-KEY' });
    });
  });

  describe('PO-HRM-PAY-CNTT-BE-01 — profile source_kind validation', () => {
    it('createInputLine rejects source_kind not in snapshot profile → HRM-PAY-INP-PROFILE-422', async () => {
      db.query.mockImplementation(async (sql: string) => {
        if (sql.includes('CREATE TABLE')) return { rows: [] } as never;
        if (sql.includes('FROM public.payroll_periods')) {
          return {
            rows: [
              {
                id: periodId,
                company_id: 'holding',
                start_date: '2026-04-01',
                end_date: '2026-04-30',
                status: 'draft',
                sheet_template_snapshot_json: {
                  template_id: 'tpl-1',
                  setupContext: {
                    allowedSourceKinds: ['manual', 'kpi'],
                  },
                },
              },
            ],
          } as never;
        }
        if (sql.includes('COUNT(*)') && sql.includes('salary_components')) {
          return { rows: [{ c: '1' }] } as never;
        }
        if (
          sql.includes('FROM public.salary_components') &&
          sql.includes('lower(code)')
        ) {
          return {
            rows: [{ id: 'sc-1', code: 'bonus', name: 'Thưởng' }],
          } as never;
        }
        return { rows: [] } as never;
      });

      await expect(
        svc.createInputLine(
          periodId,
          {
            employeeId,
            componentCode: 'bonus',
            amount: 100_000,
            sourceKind: 'revenue',
          },
          'holding',
        ),
      ).rejects.toMatchObject({ code: 'HRM-PAY-INP-PROFILE-422' });
    });
  });

  describe('immutable period guard', () => {
    it('VAL-INP-LINE-03 mutate after processed → IMMUTABLE', async () => {
      db.query.mockImplementation(async (sql: string) => {
        if (sql.includes('CREATE TABLE')) return { rows: [] } as never;
        if (sql.includes('FROM public.payroll_periods')) {
          return {
            rows: [
              {
                id: periodId,
                company_id: 'holding',
                start_date: '2026-04-01',
                end_date: '2026-04-30',
                status: 'processed',
              },
            ],
          } as never;
        }
        return { rows: [] } as never;
      });

      await expect(
        svc.createInputLine(
          periodId,
          {
            employeeId,
            componentCode: 'bonus',
            amount: 100_000,
            sourceKind: 'other_income',
          },
          'holding',
        ),
      ).rejects.toMatchObject<ApiException>({
        code: HRM_PAY_PERIOD_409_IMMUTABLE,
        status: HttpStatus.CONFLICT,
      });
    });
  });

  describe('hasActiveTimesheetBindForPeriod', () => {
    it('returns true when bind table has active closed bind', async () => {
      db.query.mockImplementation(async (sql: string) => {
        if (
          sql.includes('information_schema.tables') &&
          sql.includes('pay_period_timesheet_bind')
        ) {
          return { rows: [{ exists: true }] } as never;
        }
        if (sql.includes('FROM public.pay_period_timesheet_bind')) {
          return { rows: [{ timesheet_header_id: sheetId }] } as never;
        }
        return { rows: [] } as never;
      });
      const ok = await hasActiveTimesheetBindForPeriod(db, periodId);
      expect(ok).toBe(true);
    });
  });
});
