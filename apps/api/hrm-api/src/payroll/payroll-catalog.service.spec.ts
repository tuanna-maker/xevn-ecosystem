/**
 * PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-CATALOG-BE-01
 * Jest: ensureSchema · scope_parity list↔get · FK published formula · soft-delete · open catalog N+1
 */
import { ApiException } from '../common/api.exception';
import { signServiceJwt } from '../common/jwt-sign';
import { HrmDbService } from '../db/hrm-db.service';
import { SettingsCatalogsService } from '../settings-catalogs/settings-catalogs.service';
import {
  HRM_PAY_COMP_404,
  HRM_PAY_COMP_CODE_INVALID,
  HRM_PAY_COMP_FORMULA_412,
  PAY_SALARY_COMPONENT_STARTER_ROWS,
} from './payroll-catalog.constants';
import { PayrollCatalogService, HRM_SC_002 } from './payroll-catalog.service';

const COMP_ID = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const FORMULA_ID = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';

function groupCeoToken() {
  return `Bearer ${signServiceJwt({
    sub: 'ceo@xe.vn',
    tenantId: 'xevn',
    companyId: 'main',
    roleCode: 'group_ceo',
  })}`;
}

function memberCeoToken() {
  return `Bearer ${signServiceJwt({
    sub: 'du-lich.ceo@xe.vn',
    tenantId: 'xe-du-lich',
    companyId: 'main',
    roleCode: 'subsidiary_ceo',
  })}`;
}

function baseComponent(overrides: Record<string, unknown> = {}) {
  return {
    id: COMP_ID,
    company_id: 'holding',
    code: 'LUONG_CO_BAN',
    name: 'Lương cơ bản',
    category_id: null,
    component_type: 'luong',
    nature: 'income',
    value_type: 'currency',
    is_taxable: true,
    is_insurance_base: true,
    formula: '=legacy_hint',
    default_formula_definition_id: FORMULA_ID,
    default_value: 0,
    min_value: null,
    max_value: null,
    description: null,
    applied_to: 'all',
    is_active: true,
    sort_order: 10,
    archived_at: null,
    is_system: true,
    created_at: '2026-08-07T00:00:00Z',
    updated_at: '2026-08-07T00:00:00Z',
    category: null,
    default_formula_definition: {
      id: FORMULA_ID,
      code: 'base_eval',
      version: 1,
      status: 'active',
    },
    ...overrides,
  };
}

describe('PayrollCatalogService platform PAY catalog (PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-CATALOG-BE-01)', () => {
  it('ensureSchema adds default_formula_definition_id + archived_at without closed enum CHECK', async () => {
    const sqls: string[] = [];
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        sqls.push(String(sql));
        return { rows: [] };
      }),
    } as unknown as HrmDbService;
    const svc = new PayrollCatalogService(db);
    await svc.ensureSalaryComponentSchemaPublic();
    const joined = sqls.join('\n');
    expect(joined).toMatch(/default_formula_definition_id/i);
    expect(joined).toMatch(/archived_at/i);
    expect(joined).not.toMatch(/CHECK\s*\(\s*code\s+IN/i);
  });

  it('scope_parity: list id under main → getById 200 (holding row)', async () => {
    const row = baseComponent();
    const db = {
      query: jest
        .fn()
        .mockImplementation(async (sql: string, params?: unknown[]) => {
          const s = String(sql);
          if (
            s.includes('CREATE TABLE') ||
            s.includes('ALTER TABLE') ||
            s.includes('CREATE INDEX')
          ) {
            return { rows: [] };
          }
          if (
            s.includes('INSERT INTO public.salary_components') &&
            s.includes('WHERE NOT EXISTS')
          ) {
            return { rows: [] };
          }
          if (
            s.includes('FROM public.salary_components sc') &&
            s.includes('ORDER BY')
          ) {
            expect(JSON.stringify(params ?? [])).toMatch(/holding|main/);
            return { rows: [row] };
          }
          if (
            s.includes('FROM public.salary_components sc') &&
            s.includes('LIMIT 1')
          ) {
            return { rows: [row] };
          }
          return { rows: [] };
        }),
    } as unknown as HrmDbService;
    const svc = new PayrollCatalogService(db);
    const auth = groupCeoToken();
    const list = await svc.listSalaryComponents('main', auth);
    expect(list.data).toHaveLength(1);
    expect(list.data[0].formula_sot).toBe('deprecated');
    expect(list.payroll_e2e_ready).toBe(false);
    const detail = await svc.getSalaryComponentById(COMP_ID, 'main', auth);
    expect(detail.id).toBe(COMP_ID);
    expect(detail.company_id).toBe('holding');
  });

  it('scope_parity: member CEO cannot get holding component', async () => {
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        const s = String(sql);
        if (
          s.includes('CREATE TABLE') ||
          s.includes('ALTER TABLE') ||
          s.includes('CREATE INDEX')
        ) {
          return { rows: [] };
        }
        if (s.includes('LIMIT 1')) {
          return { rows: [] };
        }
        return { rows: [] };
      }),
    } as unknown as HrmDbService;
    const svc = new PayrollCatalogService(db);
    await expect(
      svc.getSalaryComponentById(COMP_ID, 'main', memberCeoToken()),
    ).rejects.toMatchObject({
      code: HRM_PAY_COMP_404,
    });
  });

  it('create rejects invalid code format (open catalog — not closed N-set)', async () => {
    const db = {
      query: jest.fn().mockResolvedValue({ rows: [] }),
    } as unknown as HrmDbService;
    const svc = new PayrollCatalogService(db);
    await expect(
      svc.createSalaryComponent(
        {
          company_id: 'holding',
          code: 'bad code!',
          name: 'Test',
          component_type: 'luong',
        },
        groupCeoToken(),
      ),
    ).rejects.toMatchObject({ code: HRM_PAY_COMP_CODE_INVALID });
  });

  it('create N+1 custom code succeeds when format valid (no closed enum)', async () => {
    const sqls: string[] = [];
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        const s = String(sql);
        sqls.push(s);
        if (
          s.includes('CREATE TABLE') ||
          s.includes('ALTER TABLE') ||
          s.includes('CREATE INDEX')
        ) {
          return { rows: [] };
        }
        if (
          s.includes('SELECT id FROM public.salary_components') &&
          s.includes('lower(code)')
        ) {
          return { rows: [] };
        }
        if (s.includes('INSERT INTO public.salary_components')) {
          return {
            rows: [
              baseComponent({
                id: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
                code: 'CUSTOM_TP_09',
                name: 'Thành phần 9',
                is_system: false,
                default_formula_definition_id: null,
              }),
            ],
          };
        }
        return { rows: [] };
      }),
    } as unknown as HrmDbService;
    const svc = new PayrollCatalogService(db);
    const created = await svc.createSalaryComponent(
      {
        company_id: 'holding',
        code: 'CUSTOM_TP_09',
        name: 'Thành phần 9',
        component_type: 'luong',
      },
      groupCeoToken(),
    );
    expect(created.code).toBe('CUSTOM_TP_09');
    expect(created.formula_sot).toBe('deprecated');
    expect(
      sqls.some((q) => q.includes('INSERT INTO public.salary_components')),
    ).toBe(true);
  });

  it('bind default_formula_definition_id requires published active formula', async () => {
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        const s = String(sql);
        if (
          s.includes('CREATE TABLE') ||
          s.includes('ALTER TABLE') ||
          s.includes('CREATE INDEX')
        ) {
          return { rows: [] };
        }
        if (
          s.includes('FROM public.pay_formula_definitions') &&
          s.includes("status = 'active'")
        ) {
          return { rows: [] };
        }
        if (s.includes('SELECT id FROM public.salary_components')) {
          return { rows: [] };
        }
        return { rows: [] };
      }),
    } as unknown as HrmDbService;
    const svc = new PayrollCatalogService(db);
    await expect(
      svc.createSalaryComponent(
        {
          company_id: 'holding',
          code: 'WITH_FORMULA',
          name: 'With formula',
          component_type: 'luong',
          default_formula_definition_id: FORMULA_ID,
        },
        groupCeoToken(),
      ),
    ).rejects.toMatchObject({ code: HRM_PAY_COMP_FORMULA_412 });
  });

  it('VAL-PAY-02-DATA-08 — default_formula_definition_id rejects draft-only formula', async () => {
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        const s = String(sql);
        if (
          s.includes('CREATE TABLE') ||
          s.includes('ALTER TABLE') ||
          s.includes('CREATE INDEX')
        ) {
          return { rows: [] };
        }
        if (s.includes('FROM public.salary_components WHERE id = $1::uuid')) {
          return {
            rows: [
              {
                company_id: 'holding',
                archived_at: null,
                component_type: 'luong',
                is_system: false,
              },
            ],
          };
        }
        if (
          s.includes('FROM public.pay_formula_definitions') &&
          s.includes("status = 'active'")
        ) {
          return { rows: [] };
        }
        return { rows: [] };
      }),
    } as unknown as HrmDbService;
    const svc = new PayrollCatalogService(db);
    await expect(
      svc.updateSalaryComponent(
        COMP_ID,
        { default_formula_definition_id: FORMULA_ID },
        'holding',
        groupCeoToken(),
      ),
    ).rejects.toMatchObject({ code: HRM_PAY_COMP_FORMULA_412 });
  });

  it('delete soft-archives (no hard DELETE)', async () => {
    const sqls: string[] = [];
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        const s = String(sql);
        sqls.push(s);
        if (
          s.includes('CREATE TABLE') ||
          s.includes('ALTER TABLE') ||
          s.includes('CREATE INDEX')
        ) {
          return { rows: [] };
        }
        if (
          s.includes('UPDATE public.salary_components') &&
          s.includes('archived_at = NOW()')
        ) {
          return { rows: [{ id: COMP_ID }] };
        }
        return { rows: [] };
      }),
    } as unknown as HrmDbService;
    const svc = new PayrollCatalogService(db);
    const result = await svc.deleteSalaryComponent(
      COMP_ID,
      'main',
      groupCeoToken(),
    );
    expect(result.archived).toBe(true);
    expect(
      sqls.some((q) => q.startsWith('DELETE FROM public.salary_components')),
    ).toBe(false);
  });

  it('starter ensure upserts bootstrap rows only when missing', async () => {
    const starterSqls: string[] = [];
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        const s = String(sql);
        if (s.includes('WHERE NOT EXISTS')) {
          starterSqls.push(s);
        }
        if (
          s.includes('CREATE TABLE') ||
          s.includes('ALTER TABLE') ||
          s.includes('CREATE INDEX')
        ) {
          return { rows: [] };
        }
        if (
          s.includes('FROM public.salary_components sc') &&
          s.includes('ORDER BY')
        ) {
          return { rows: [] };
        }
        return { rows: [] };
      }),
    } as unknown as HrmDbService;
    const svc = new PayrollCatalogService(db);
    await svc.listSalaryComponents('holding', groupCeoToken());
    expect(starterSqls.length).toBe(PAY_SALARY_COMPONENT_STARTER_ROWS.length);
  });

  it('duplicate active code → HRM-SC-002 conflict', async () => {
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        const s = String(sql);
        if (
          s.includes('CREATE TABLE') ||
          s.includes('ALTER TABLE') ||
          s.includes('CREATE INDEX')
        ) {
          return { rows: [] };
        }
        if (
          s.includes('SELECT id FROM public.salary_components') &&
          s.includes('lower(code)')
        ) {
          return { rows: [{ id: COMP_ID }] };
        }
        return { rows: [] };
      }),
    } as unknown as HrmDbService;
    const svc = new PayrollCatalogService(db);
    await expect(
      svc.createSalaryComponent(
        {
          company_id: 'holding',
          code: 'LUONG_CO_BAN',
          name: 'Dup',
          component_type: 'luong',
        },
        groupCeoToken(),
      ),
    ).rejects.toMatchObject({ code: HRM_SC_002 });
  });

  it('ensureStarterPayTypes appends open-catalog rows when picker empty (not closed enum)', async () => {
    const listPickerItems = jest.fn().mockResolvedValue({
      catalog_key: 'pay_types',
      aliases: [],
      family_id: 'pay',
      company_id: 'holding',
      total: 0,
      data: [],
    });
    const appendExtensionItems = jest
      .fn()
      .mockResolvedValue({ upserted: 3, storageKey: 'pay_types' });
    const settingsCatalogs = {
      listPickerItems,
      appendExtensionItems,
    } as unknown as SettingsCatalogsService;
    const db = {
      query: jest.fn().mockResolvedValue({ rows: [] }),
    } as unknown as HrmDbService;
    const svc = new PayrollCatalogService(db, settingsCatalogs);
    await svc.ensureStarterPayTypes('main', groupCeoToken());
    expect(listPickerItems).toHaveBeenCalledWith(
      expect.any(String),
      'holding',
      'pay_types',
      expect.objectContaining({ status: 'active' }),
    );
    expect(appendExtensionItems).toHaveBeenCalledWith(
      expect.any(String),
      'holding',
      'pay_types',
      expect.arrayContaining([
        expect.objectContaining({
          code: 'luong',
          label: 'Lương',
          status: 'active',
        }),
        expect.objectContaining({ code: 'thue' }),
        expect.objectContaining({ code: 'cham_cong' }),
      ]),
    );
  });

  it('ensureStarterPayTypes skips append when pay_types already has items', async () => {
    const listPickerItems = jest.fn().mockResolvedValue({
      catalog_key: 'pay_types',
      aliases: [],
      family_id: 'pay',
      company_id: 'holding',
      total: 2,
      data: [{ code: 'luong' }, { code: 'thue' }],
    });
    const appendExtensionItems = jest.fn();
    const settingsCatalogs = {
      listPickerItems,
      appendExtensionItems,
    } as unknown as SettingsCatalogsService;
    const db = {
      query: jest.fn().mockResolvedValue({ rows: [] }),
    } as unknown as HrmDbService;
    const svc = new PayrollCatalogService(db, settingsCatalogs);
    await svc.ensureStarterPayTypes('holding', groupCeoToken());
    expect(appendExtensionItems).not.toHaveBeenCalled();
  });
});

describe('PayrollCatalogService payment wire (PO-HRM-AMIS-PARITY-PAY-PAYMENT-WIRE-BE-01)', () => {
  const PERIOD_ID = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';
  const PAYSLIP_ID = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd';
  const BATCH_ID = 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee';

  it('wirePaymentBatchFromPeriod creates batch + records from processed payslips', async () => {
    let payslipSelectSql = '';
    let paymentRecordInsertParams: unknown[] | undefined;
    const db = {
      query: jest
        .fn()
        .mockImplementation(async (sql: string, params?: unknown[]) => {
          const s = String(sql);
          if (s.includes('CREATE TABLE') || s.includes('CREATE UNIQUE INDEX')) {
            return { rows: [] };
          }
          if (s.includes('FROM public.payroll_periods pp')) {
            return {
              rows: [
                {
                  id: PERIOD_ID,
                  company_id: 'holding',
                  period_label: '2026-04',
                  start_date: '2026-04-01',
                  end_date: '2026-04-30',
                  status: 'processed',
                },
              ],
            };
          }
          if (s.includes('FROM public.payroll_payslips ps')) {
            payslipSelectSql = s;
            return {
              rows: [
                {
                  id: PAYSLIP_ID,
                  employee_id: '11111111-1111-4111-8111-111111111111',
                  employee_code: 'NV001',
                  employee_name: 'Nguyen Van A',
                  net_amount: '9500000',
                  department: 'Van hanh',
                },
              ],
            };
          }
          if (
            s.includes('FROM public.payment_batches WHERE payroll_batch_id')
          ) {
            return { rows: [] };
          }
          if (s.includes('INSERT INTO public.payment_batches')) {
            return {
              rows: [
                {
                  id: BATCH_ID,
                  company_id: 'holding',
                  payroll_batch_id: PERIOD_ID,
                  status: 'pending',
                },
              ],
            };
          }
          if (
            s.includes('FROM public.payment_records') &&
            s.includes('payroll_record_id')
          ) {
            return { rows: [] };
          }
          if (s.includes('INSERT INTO public.payment_records')) {
            paymentRecordInsertParams = params;
            return {
              rows: [
                {
                  id: 'ffffffff-ffff-4fff-8fff-ffffffffffff',
                  payroll_record_id: PAYSLIP_ID,
                  amount: 9500000,
                  status: 'pending',
                  department: params?.[7] ?? null,
                },
              ],
            };
          }
          if (s.includes('UPDATE public.payment_batches pb SET')) {
            return {
              rows: [
                {
                  id: BATCH_ID,
                  employee_count: 1,
                  total_amount: 9500000,
                  status: 'pending',
                },
              ],
            };
          }
          return { rows: [] };
        }),
    } as unknown as HrmDbService;
    const svc = new PayrollCatalogService(db);
    const result = await svc.wirePaymentBatchFromPeriod(
      PERIOD_ID,
      { company_id: 'main' },
      groupCeoToken(),
    );
    expect(payslipSelectSql).toContain("custom_fields->>'department'");
    expect(payslipSelectSql).not.toMatch(/\be\.department\b/);
    expect(paymentRecordInsertParams?.[7]).toBe('Van hanh');
    expect(result.records_added).toBe(1);
    expect(result.payslip_count).toBe(1);
    expect(result.payroll_e2e_ready).toBe(false);
    expect(result.batch).toMatchObject({ id: BATCH_ID });
  });

  it('wirePaymentBatchFromPeriod allows null department from custom_fields (schema reality)', async () => {
    let paymentRecordInsertParams: unknown[] | undefined;
    const db = {
      query: jest
        .fn()
        .mockImplementation(async (sql: string, params?: unknown[]) => {
          const s = String(sql);
          if (s.includes('CREATE TABLE') || s.includes('CREATE UNIQUE INDEX')) {
            return { rows: [] };
          }
          if (s.includes('FROM public.payroll_periods pp')) {
            return {
              rows: [
                {
                  id: PERIOD_ID,
                  company_id: 'holding',
                  period_label: '2026-04',
                  start_date: '2026-04-01',
                  end_date: '2026-04-30',
                  status: 'processed',
                },
              ],
            };
          }
          if (s.includes('FROM public.payroll_payslips ps')) {
            expect(s).toContain("custom_fields->>'department'");
            expect(s).not.toMatch(/\be\.department\b/);
            return {
              rows: [
                {
                  id: PAYSLIP_ID,
                  employee_id: '11111111-1111-4111-8111-111111111111',
                  employee_code: 'NV001',
                  employee_name: 'Nguyen Van A',
                  net_amount: '9500000',
                  department: null,
                },
              ],
            };
          }
          if (
            s.includes('FROM public.payment_batches WHERE payroll_batch_id')
          ) {
            return { rows: [] };
          }
          if (s.includes('INSERT INTO public.payment_batches')) {
            return {
              rows: [
                {
                  id: BATCH_ID,
                  company_id: 'holding',
                  payroll_batch_id: PERIOD_ID,
                  status: 'pending',
                },
              ],
            };
          }
          if (
            s.includes('FROM public.payment_records') &&
            s.includes('payroll_record_id')
          ) {
            return { rows: [] };
          }
          if (s.includes('INSERT INTO public.payment_records')) {
            paymentRecordInsertParams = params;
            return {
              rows: [
                {
                  id: 'ffffffff-ffff-4fff-8fff-ffffffffffff',
                  payroll_record_id: PAYSLIP_ID,
                  amount: 9500000,
                  status: 'pending',
                  department: null,
                },
              ],
            };
          }
          if (s.includes('UPDATE public.payment_batches pb SET')) {
            return {
              rows: [
                {
                  id: BATCH_ID,
                  employee_count: 1,
                  total_amount: 9500000,
                  status: 'pending',
                },
              ],
            };
          }
          return { rows: [] };
        }),
    } as unknown as HrmDbService;
    const svc = new PayrollCatalogService(db);
    const result = await svc.wirePaymentBatchFromPeriod(
      PERIOD_ID,
      { company_id: 'main' },
      groupCeoToken(),
    );
    expect(paymentRecordInsertParams?.[7]).toBeNull();
    expect(result.records_added).toBe(1);
    expect(result.payslip_count).toBe(1);
    expect(result.payroll_e2e_ready).toBe(false);
  });

  it('wirePaymentBatchFromPeriod rejects draft period', async () => {
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        const s = String(sql);
        if (s.includes('CREATE TABLE') || s.includes('CREATE UNIQUE INDEX')) {
          return { rows: [] };
        }
        if (s.includes('FROM public.payroll_periods pp')) {
          return {
            rows: [
              {
                id: PERIOD_ID,
                company_id: 'holding',
                period_label: '2026-04',
                start_date: '2026-04-01',
                end_date: '2026-04-30',
                status: 'draft',
              },
            ],
          };
        }
        return { rows: [] };
      }),
    } as unknown as HrmDbService;
    const svc = new PayrollCatalogService(db);
    await expect(
      svc.wirePaymentBatchFromPeriod(PERIOD_ID, { company_id: 'holding' }),
    ).rejects.toMatchObject({ code: 'HRM-PAY-WIRE-409' });
  });

  it('processAllPaymentsInBatch syncs payslip paid status', async () => {
    const syncCalls: string[] = [];
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        const s = String(sql);
        syncCalls.push(s);
        if (s.includes('CREATE TABLE') || s.includes('CREATE UNIQUE INDEX')) {
          return { rows: [] };
        }
        if (s.includes('SELECT company_id FROM public.payment_batches')) {
          return { rows: [{ company_id: 'holding' }] };
        }
        if (
          s.includes('UPDATE public.payment_records') &&
          s.includes("status <> 'paid'")
        ) {
          return { rows: [{ id: 'rec-1' }, { id: 'rec-2' }] };
        }
        if (s.includes('UPDATE public.payroll_payslips ps')) {
          return { rows: [] };
        }
        if (s.includes('UPDATE public.payment_batches pb SET')) {
          return { rows: [{ id: BATCH_ID, status: 'completed' }] };
        }
        return { rows: [] };
      }),
    } as unknown as HrmDbService;
    const svc = new PayrollCatalogService(db);
    const result = await svc.processAllPaymentsInBatch(
      BATCH_ID,
      'holding',
      {},
      groupCeoToken(),
    );
    expect(result.processed_records).toBe(2);
    expect(
      syncCalls.some((s) => s.includes('UPDATE public.payroll_payslips ps')),
    ).toBe(true);
  });
});
