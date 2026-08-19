/**
 * PO-HRM-PAYROLL-FORMULA-RUN-GAP-BE-01
 * Jest: SM draft→pending_publish→active · dual-control deny · immutable active · scope_parity
 */
import { ApiException } from '../common/api.exception';
import { signServiceJwt } from '../common/jwt-sign';
import { HrmDbService } from '../db/hrm-db.service';
import {
  HRM_PAY_FORMULA_403_DUAL,
  HRM_PAY_FORMULA_409_IMMUTABLE,
  HRM_PAY_FORMULA_412,
  HRM_PAY_FORMULA_412_PREVIEW_STUB,
  HRM_PAY_FORMULA_412_VARS,
} from './pay-formula.constants';
import { PayFormulaService } from './pay-formula.service';

const FORMULA_ID = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const EVAL_FORMULA_ID = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';

type StoreRow = {
  id: string;
  company_id: string;
  code: string;
  version: number;
  status: string;
  expression_json: unknown;
  required_vars_json: unknown;
  meta_json: unknown;
  authored_by: string | null;
  authored_at: string | null;
  published_by: string | null;
  published_at: string | null;
  effective_from: string | null;
  effective_to: string | null;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
};

function authorToken() {
  return `Bearer ${signServiceJwt({
    sub: 'cb.author@xe.vn',
    tenantId: 'xevn',
    companyId: 'main',
    roleCode: 'group_ceo',
  })}`;
}

function publisherToken() {
  return `Bearer ${signServiceJwt({
    sub: 'tech.publisher@xe.vn',
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

function baseRow(overrides: Partial<StoreRow> = {}): StoreRow {
  return {
    id: FORMULA_ID,
    company_id: 'holding',
    code: 'std_monthly',
    version: 1,
    status: 'draft',
    expression_json: { form: 'opaque', ops: [] },
    required_vars_json: { keys: ['payable_hours', 'base_salary'] },
    meta_json: { label: 'Lương tháng chuẩn' },
    authored_by: 'cb.author@xe.vn',
    authored_at: '2026-08-07T00:00:00Z',
    published_by: null,
    published_at: null,
    effective_from: null,
    effective_to: null,
    archived_at: null,
    created_at: '2026-08-07T00:00:00Z',
    updated_at: '2026-08-07T00:00:00Z',
    ...overrides,
  };
}

function createStatefulDb(initial?: StoreRow[]) {
  const store: StoreRow[] = initial ? initial.map((r) => ({ ...r })) : [];
  const sqls: string[] = [];

  const clone = (r: StoreRow) => ({ ...r });

  const db = {
    query: jest.fn().mockImplementation(async (sql: string, params?: unknown[]) => {
      const s = String(sql).replace(/\s+/g, ' ');
      sqls.push(s);

      if (
        s.includes('CREATE TABLE') ||
        s.includes('CREATE INDEX') ||
        s.includes('CREATE UNIQUE') ||
        s.includes('ALTER TABLE') ||
        s.includes('DO $$')
      ) {
        return { rows: [] };
      }

      if (s.includes('INSERT INTO public.pay_formula_definitions')) {
        const row = baseRow({
          id: String(params?.[0]),
          company_id: String(params?.[1]),
          code: String(params?.[2]),
          version: Number(params?.[3] ?? 1),
          status: 'draft',
          expression_json: params?.[4] ? JSON.parse(String(params[4])) : {},
          required_vars_json: params?.[5] ? JSON.parse(String(params[5])) : null,
          meta_json: params?.[6] ? JSON.parse(String(params[6])) : null,
          authored_by: String(params?.[7] ?? ''),
        });
        if (s.includes("$4, 'draft'")) {
          row.version = Number(params?.[3]);
        } else {
          row.version = 1;
        }
        store.push(row);
        return { rows: [clone(row)] };
      }

      // Retire prior overlapping active rows (publish step)
      if (
        s.includes('UPDATE public.pay_formula_definitions') &&
        s.includes("status = 'retired'") &&
        s.includes("status = 'active'") &&
        s.includes('id <>')
      ) {
        const companyId = String(params?.[0]);
        const code = String(params?.[1]);
        const keepId = String(params?.[2]);
        for (const r of store) {
          if (
            r.company_id === companyId &&
            r.code === code &&
            r.status === 'active' &&
            !r.archived_at &&
            r.id !== keepId
          ) {
            r.status = 'retired';
          }
        }
        return { rows: [] };
      }

      // Soft-delete retire by id
      if (
        s.includes('UPDATE public.pay_formula_definitions') &&
        s.includes("status = 'retired'") &&
        s.includes('archived_at = NOW()')
      ) {
        const id = String(params?.[0]);
        const row = store.find((r) => r.id === id);
        if (row) {
          row.status = 'retired';
          row.archived_at = '2026-08-07T12:00:00Z';
          return { rows: [clone(row)] };
        }
        return { rows: [] };
      }

      // submit-publish (SET status pending — do not match publish RETURNING)
      if (
        s.includes('UPDATE public.pay_formula_definitions') &&
        s.includes("SET status = 'pending_publish'")
      ) {
        const id = String(params?.[0]);
        const row = store.find((r) => r.id === id && r.status === 'draft');
        if (!row) return { rows: [] };
        row.status = 'pending_publish';
        if (params?.[1]) {
          row.required_vars_json = JSON.parse(String(params[1]));
        }
        return { rows: [clone(row)] };
      }

      // publish → active
      if (
        s.includes('UPDATE public.pay_formula_definitions') &&
        s.includes("SET status = 'active'") &&
        s.includes('published_by')
      ) {
        const id = String(params?.[0]);
        const row = store.find((r) => r.id === id && r.status === 'pending_publish');
        if (!row) return { rows: [] };
        row.status = 'active';
        row.published_by = String(params?.[1]);
        row.published_at = '2026-08-07T12:00:00Z';
        return { rows: [clone(row)] };
      }

      // withdraw → draft
      if (
        s.includes('UPDATE public.pay_formula_definitions') &&
        s.includes("SET status = 'draft'")
      ) {
        const id = String(params?.[0]);
        const row = store.find((r) => r.id === id && r.status === 'pending_publish');
        if (!row) return { rows: [] };
        row.status = 'draft';
        return { rows: [clone(row)] };
      }

      // draft update
      if (
        s.includes('UPDATE public.pay_formula_definitions') &&
        s.includes('expression_json = COALESCE')
      ) {
        const id = String(params?.[0]);
        const row = store.find((r) => r.id === id && r.status === 'draft');
        if (!row) return { rows: [] };
        if (params?.[1]) row.expression_json = JSON.parse(String(params[1]));
        if (params?.[2] === true && params?.[3]) {
          row.required_vars_json = JSON.parse(String(params[3]));
        }
        row.authored_by = String(params?.[7] ?? row.authored_by);
        return { rows: [clone(row)] };
      }

      if (s.includes('FROM public.pay_formula_definitions') && s.includes('ORDER BY code')) {
        return { rows: store.filter((r) => !r.archived_at).map(clone) };
      }

      if (s.includes('FROM public.pay_formula_definitions') && s.includes('ORDER BY version DESC')) {
        const code = String(params?.[0]);
        const matches = store
          .filter((r) => r.code === code && !r.archived_at)
          .sort((a, b) => b.version - a.version);
        return { rows: matches.slice(0, 1).map(clone) };
      }

      if (s.includes('FROM public.pay_formula_definitions') && s.includes('id = $1')) {
        const id = String(params?.[0]);
        const row = store.find((r) => r.id === id);
        return { rows: row ? [clone(row)] : [] };
      }

      return { rows: [] };
    }),
  } as unknown as HrmDbService;

  return { db, store, sqls };
}

describe('PayFormulaService (PO-HRM-PAYROLL-FORMULA-RUN-GAP-BE-01)', () => {
  it('ensureSchema ADD pay_formula_definitions + UQ/IX; optional formula_definition_id; FORBIDDEN closed code enum', async () => {
    const sqls: string[] = [];
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        sqls.push(String(sql));
        return { rows: [] };
      }),
    } as unknown as HrmDbService;
    const svc = new PayFormulaService(db);
    await svc.ensureSchema();
    expect(sqls.some((q) => q.includes('CREATE TABLE IF NOT EXISTS public.pay_formula_definitions'))).toBe(
      true,
    );
    expect(
      sqls.some((q) => q.includes('uq_pay_formula_definitions_company_code_version')),
    ).toBe(true);
    expect(sqls.some((q) => q.includes('ix_pay_formula_definitions_company_code_status'))).toBe(
      true,
    );
    expect(sqls.some((q) => q.includes('formula_definition_id'))).toBe(true);
    expect(sqls.some((q) => q.includes('CREATE TABLE IF NOT EXISTS public.payroll_payslip_lines'))).toBe(
      true,
    );
    expect(sqls.some((q) => /CHECK\s*\(\s*code\s+IN/i.test(q))).toBe(false);
    expect(sqls.some((q) => q.includes('salary_components') && q.includes('formula'))).toBe(false);
  });

  it('SM draft → pending_publish → active with dual-control publisher ≠ author', async () => {
    const { db, store } = createStatefulDb([baseRow()]);
    const svc = new PayFormulaService(db);

    const submitted = await svc.submitPublish(FORMULA_ID, 'main', authorToken());
    expect(submitted.status).toBe('pending_publish');
    expect(store[0].status).toBe('pending_publish');

    const published = await svc.publish(FORMULA_ID, 'main', publisherToken());
    expect(published.status).toBe('active');
    expect(published.publishedBy).toBe('tech.publisher@xe.vn');
    expect(published.authoredBy).toBe('cb.author@xe.vn');
  });

  it('dual-control deny self-publish → HRM-PAY-FORMULA-403-DUAL', async () => {
    const { db } = createStatefulDb([
      baseRow({ status: 'pending_publish', authored_by: 'cb.author@xe.vn' }),
    ]);
    const svc = new PayFormulaService(db);
    await expect(svc.publish(FORMULA_ID, 'main', authorToken())).rejects.toMatchObject({
      code: HRM_PAY_FORMULA_403_DUAL,
    });
  });

  it('immutable active — update expression → 409-IMMUTABLE', async () => {
    const { db } = createStatefulDb([baseRow({ status: 'active' })]);
    const svc = new PayFormulaService(db);
    await expect(
      svc.updateFormula(
        FORMULA_ID,
        { company_id: 'main', expressionJson: { changed: true } },
        authorToken(),
      ),
    ).rejects.toMatchObject({ code: HRM_PAY_FORMULA_409_IMMUTABLE });
  });

  it('submit-publish without required_vars → 412-VARS', async () => {
    const { db } = createStatefulDb([baseRow({ required_vars_json: null })]);
    const svc = new PayFormulaService(db);
    await expect(svc.submitPublish(FORMULA_ID, 'main', authorToken())).rejects.toMatchObject({
      code: HRM_PAY_FORMULA_412_VARS,
    });
  });

  it('scope_parity: list id under main → getById 200 (holding row)', async () => {
    const { db } = createStatefulDb([baseRow({ company_id: 'holding' })]);
    const svc = new PayFormulaService(db);
    const auth = authorToken();
    const list = await svc.listFormulas({ company_id: 'main' }, auth);
    expect(list.items).toHaveLength(1);
    const detail = await svc.getFormulaById(FORMULA_ID, 'main', auth);
    expect(detail.id).toBe(FORMULA_ID);
    expect(detail.companyId).toBe('holding');
  });

  it('scope_parity: member CEO cannot get holding formula', async () => {
    const { db } = createStatefulDb([baseRow({ company_id: 'holding' })]);
    const svc = new PayFormulaService(db);
    await expect(svc.getFormulaById(FORMULA_ID, 'main', memberCeoToken())).rejects.toBeInstanceOf(
      ApiException,
    );
  });

  it('scope_parity: member CEO cannot mutate holding formula (list=get=mutate U19)', async () => {
    const { db } = createStatefulDb([baseRow({ company_id: 'holding', status: 'draft' })]);
    const svc = new PayFormulaService(db);
    await expect(
      svc.updateFormula(
        FORMULA_ID,
        { company_id: 'main', expressionJson: { form: 'gd1_eval_v1', lines: [] } },
        memberCeoToken(),
      ),
    ).rejects.toBeInstanceOf(ApiException);
  });

  it('preview remains staged honest stub — not LIVE (opaque GĐ1)', async () => {
    const { db } = createStatefulDb([
      baseRow({
        status: 'active',
        expression_json: { form: 'gd1', ops: [{ op: 'opaque', text: 'x' }] },
      }),
    ]);
    const svc = new PayFormulaService(db);
    await expect(
      svc.previewFormula(FORMULA_ID, 'main', {}, publisherToken()),
    ).rejects.toMatchObject({ code: HRM_PAY_FORMULA_412_PREVIEW_STUB });
  });

  it('preview computes gd1_eval_v1 when variableOverrides complete bag (still payroll_e2e_ready=false)', async () => {
    const { db } = createStatefulDb([
      baseRow({
        id: EVAL_FORMULA_ID,
        status: 'active',
        expression_json: {
          form: 'gd1_eval_v1',
          lines: [
            {
              component_code: 'BASE',
              sign: 'earning',
              source: 'var',
              var: 'base_salary',
            },
          ],
        },
        required_vars_json: { keys: ['base_salary'] },
      }),
    ]);
    // Probe ATT line absent + skip C&B — overrides supply bag
    const rawDb = db as unknown as { query: jest.Mock };
    const inner = rawDb.query.getMockImplementation();
    rawDb.query.mockImplementation(async (sql: string, params?: unknown[]) => {
      const s = String(sql);
      if (s.includes("table_name = 'att_timesheet_line'")) {
        return { rows: [{ exists: false }] };
      }
      if (s.includes('FROM public.employee_compensation_packages')) {
        return { rows: [] };
      }
      return inner ? inner(sql, params) : { rows: [] };
    });

    const svc = new PayFormulaService(db);
    const preview = await svc.previewFormula(
      EVAL_FORMULA_ID,
      'main',
      { variableOverrides: { base_salary: 8_000_000 } },
      publisherToken(),
    );
    expect(preview.payroll_e2e_ready).toBe(false);
    expect(preview.gross).toBe(8_000_000);
    expect(preview.net).toBe(8_000_000);
    expect(preview.lines[0].component_code).toBe('BASE');
    expect(preview.warnings).toEqual(expect.arrayContaining(['STAGED_EVAL_SUBSET', 'PREVIEW_DRY_RUN']));
  });

  it('evaluateBoundFormula uses CORE C&B base_salary without variableOverrides (R-PAY-F-CB-BAG)', async () => {
    const empId = '11111111-1111-4111-8111-111111111111';
    const pkgId = '33333333-3333-4333-8333-333333333333';
    const { db } = createStatefulDb([
      baseRow({
        id: EVAL_FORMULA_ID,
        status: 'active',
        expression_json: {
          form: 'gd1_eval_v1',
          lines: [
            {
              component_code: 'BASE',
              sign: 'earning',
              source: 'var',
              var: 'base_salary',
            },
            {
              component_code: 'DED_SAMPLE',
              sign: 'deduction',
              source: 'expr',
              expr: { op: 'mul', left: 'base_salary', right: 0.1 },
            },
          ],
        },
        required_vars_json: { keys: ['base_salary'] },
      }),
    ]);
    const rawDb = db as unknown as { query: jest.Mock };
    const inner = rawDb.query.getMockImplementation();
    rawDb.query.mockImplementation(async (sql: string, params?: unknown[]) => {
      const s = String(sql);
      if (s.includes("table_name = 'att_timesheet_line'")) {
        return { rows: [{ exists: false }] };
      }
      if (s.includes('FROM public.employees') && s.includes('company_id::text')) {
        return { rows: [{ company_id: 'trsport' }] };
      }
      if (s.includes('FROM public.employee_compensation_packages') && s.includes('ANY($2::text[])')) {
        return { rows: [{ id: pkgId, company_id: 'trsport' }] };
      }
      if (s.includes('FROM public.employee_compensation_lines')) {
        return { rows: [{ line_type: 'base', amount: '10000000', allowance_code: null }] };
      }
      return inner ? inner(sql, params) : { rows: [] };
    });

    const svc = new PayFormulaService(db);
    const evaluated = await svc.evaluateBoundFormula({
      formula: {
        id: EVAL_FORMULA_ID,
        company_id: 'holding',
        code: 'cb_bag',
        version: 1,
        status: 'active',
        expression_json: {
          form: 'gd1_eval_v1',
          lines: [
            {
              component_code: 'BASE',
              sign: 'earning',
              source: 'var',
              var: 'base_salary',
            },
            {
              component_code: 'DED_SAMPLE',
              sign: 'deduction',
              source: 'expr',
              expr: { op: 'mul', left: 'base_salary', right: 0.1 },
            },
          ],
        },
        required_vars_json: { keys: ['base_salary'] },
      },
      companyId: 'holding',
      employeeId: empId,
      asOfDate: '2026-08-31',
    });
    expect(evaluated.mode).toBe('computed');
    if (evaluated.mode !== 'computed') return;
    expect(evaluated.result.gross).toBe(10_000_000);
    expect(evaluated.result.net).toBe(9_000_000);
    expect(evaluated.result.lines).toHaveLength(2);
    expect(evaluated.sourcePrecedence).toContain('emp_cb');
    expect(evaluated.bagWarnings.some((w) => w.startsWith('OVERRIDES_APPLIED'))).toBe(false);
  });

  it('evaluateBoundFormula returns FORMULA-412-VARS when C&B package absent (no silent zero)', async () => {
    const { db } = createStatefulDb([
      baseRow({
        id: EVAL_FORMULA_ID,
        status: 'active',
        expression_json: {
          form: 'gd1_eval_v1',
          lines: [
            {
              component_code: 'BASE',
              sign: 'earning',
              source: 'var',
              var: 'base_salary',
            },
          ],
        },
        required_vars_json: { keys: ['base_salary'] },
      }),
    ]);
    const rawDb = db as unknown as { query: jest.Mock };
    const inner = rawDb.query.getMockImplementation();
    rawDb.query.mockImplementation(async (sql: string, params?: unknown[]) => {
      const s = String(sql);
      if (s.includes("table_name = 'att_timesheet_line'")) {
        return { rows: [{ exists: false }] };
      }
      if (s.includes('FROM public.employees')) {
        return { rows: [{ company_id: 'holding' }] };
      }
      if (s.includes('FROM public.employee_compensation_packages')) {
        return { rows: [] };
      }
      if (s.includes('FROM public.employee_contracts')) {
        return { rows: [] };
      }
      return inner ? inner(sql, params) : { rows: [] };
    });

    const svc = new PayFormulaService(db);
    const evaluated = await svc.evaluateBoundFormula({
      formula: {
        id: EVAL_FORMULA_ID,
        company_id: 'holding',
        code: 'cb_miss',
        version: 1,
        status: 'active',
        expression_json: {
          form: 'gd1_eval_v1',
          lines: [
            {
              component_code: 'BASE',
              sign: 'earning',
              source: 'var',
              var: 'base_salary',
            },
          ],
        },
        required_vars_json: { keys: ['base_salary'] },
      },
      companyId: 'holding',
      employeeId: '11111111-1111-4111-8111-111111111111',
      asOfDate: '2026-08-31',
    });
    expect(evaluated.mode).toBe('blocked');
    if (evaluated.mode !== 'blocked') return;
    expect(evaluated.code).toBe(HRM_PAY_FORMULA_412_VARS);
    expect(evaluated.details.missingVars).toEqual(['base_salary']);
    expect(evaluated.details.payroll_e2e_ready).toBe(false);
  });

  it('W3 FORMULA-412: const expression + stale required base_salary + no C&B → computed (not VARS)', async () => {
    const { db } = createStatefulDb([
      baseRow({
        id: EVAL_FORMULA_ID,
        status: 'active',
        expression_json: {
          form: 'gd1_eval_v1',
          lines: [
            {
              component_code: 'BASE',
              sign: 'earning',
              source: 'const',
              amount: 7_500_000,
            },
          ],
        },
        required_vars_json: { keys: ['base_salary'] },
      }),
    ]);
    const rawDb = db as unknown as { query: jest.Mock };
    const inner = rawDb.query.getMockImplementation();
    rawDb.query.mockImplementation(async (sql: string, params?: unknown[]) => {
      const s = String(sql);
      if (s.includes("table_name = 'att_timesheet_line'")) {
        return { rows: [{ exists: true }] };
      }
      if (s.includes('FROM public.employees')) {
        return { rows: [{ company_id: 'holding' }] };
      }
      if (s.includes('FROM public.employee_compensation_packages')) {
        return { rows: [] };
      }
      if (s.includes('FROM public.employee_contracts')) {
        return { rows: [] };
      }
      return inner ? inner(sql, params) : { rows: [] };
    });

    const svc = new PayFormulaService(db);
    const evaluated = await svc.evaluateBoundFormula({
      formula: {
        id: EVAL_FORMULA_ID,
        company_id: 'holding',
        code: 'const_stale_req',
        version: 1,
        status: 'active',
        expression_json: {
          form: 'gd1_eval_v1',
          lines: [
            {
              component_code: 'BASE',
              sign: 'earning',
              source: 'const',
              amount: 7_500_000,
            },
          ],
        },
        required_vars_json: { keys: ['base_salary'] },
      },
      companyId: 'holding',
      employeeId: '11111111-1111-4111-8111-111111111111',
      asOfDate: '2026-09-30',
      surface: 'process',
    });
    expect(evaluated.mode).toBe('computed');
    if (evaluated.mode !== 'computed') return;
    expect(evaluated.result.gross).toBe(7_500_000);
    expect(evaluated.bagWarnings).toEqual(
      expect.arrayContaining([
        'CB_PACKAGE_ABSENT',
        'REQUIRED_VARS_DECLARED_UNUSED:base_salary',
      ]),
    );
  });

  it('soft-delete retire sets archived_at + status=retired (no hard DELETE)', async () => {
    const { db, store, sqls } = createStatefulDb([baseRow({ status: 'active' })]);
    const svc = new PayFormulaService(db);
    const retired = await svc.retireFormula(FORMULA_ID, 'main', publisherToken());
    expect(retired.status).toBe('retired');
    expect(retired.archivedAt).toBeTruthy();
    expect(store[0].archived_at).toBeTruthy();
    expect(sqls.some((q) => /DELETE\s+FROM\s+public\.pay_formula_definitions/i.test(q))).toBe(
      false,
    );
  });

  describe('processEmployeePayslipViaSrc (PO-HRM-AMIS-PARITY-PAY-SRC-BE-01)', () => {
    const boundFormula = {
      id: EVAL_FORMULA_ID,
      company_id: 'holding',
      code: 'std_pay',
      version: 1,
      status: 'active' as const,
      expression_json: {
        form: 'gd1_eval_v1',
        lines: [
          { component_code: 'BASE', sign: 'earning', source: 'var', var: 'base_salary' },
        ],
      },
      required_vars_json: { keys: ['base_salary'] },
      source: 'company_active' as const,
    };

    it('SRC-02: emp C&B fixed amount wins — skips template/catalog evaluate', async () => {
      const db = {
        query: jest.fn(async (sql: string) => {
          if (sql.includes('ALTER TABLE') || sql.includes('UPDATE public.employee_compensation_lines')) {
            return { rows: [] };
          }
          if (sql.includes('information_schema')) {
            return { rows: [{ exists: true }] };
          }
          if (sql.includes('FROM public.employees')) {
            return { rows: [{ company_id: 'holding' }] };
          }
          if (sql.includes('FROM public.employee_compensation_packages')) {
            return { rows: [{ id: 'pkg-1', company_id: 'holding' }] };
          }
          if (sql.includes('FROM public.employee_compensation_lines')) {
            return {
              rows: [
                {
                  id: 'line-base-1',
                  line_type: 'base',
                  amount: '15000000',
                  allowance_code: null,
                  component_code: 'base',
                },
              ],
            };
          }
          if (sql.includes('FROM public.salary_components')) {
            return { rows: [{ id: 'sc-1', nature: 'income', default_value: '0', value_type: 'fixed' }] };
          }
          if (sql.includes('FROM public.pay_period_input_lines')) {
            return { rows: [] };
          }
          return { rows: [] };
        }),
      } as unknown as HrmDbService;
      const svc = new PayFormulaService(db);
      const result = await svc.processEmployeePayslipViaSrc({
        companyId: 'holding',
        periodId: 'period-1',
        employeeId: '11111111-1111-4111-8111-111111111111',
        asOfDate: '2026-04-30',
        periodFrom: '2026-04-01',
        periodTo: '2026-04-30',
        sheetTemplateSnapshotJson: {
          columns: [
            {
              component_code: 'BASE',
              sort_order: 0,
              formula_definition_id: 'override-should-skip',
              override_applied: true,
            },
          ],
        },
        boundFormula,
      });
      expect(result.mode).toBe('computed');
      if (result.mode !== 'computed') return;
      expect(result.lines[0]).toMatchObject({
        component_code: 'BASE',
        amount: 15_000_000,
        source_tier: 'emp_cb',
        source_ref: 'emp_cb:package:pkg-1:line:line-base-1',
      });
      expect(result.sourceTiers).toContain('emp_cb');
    });

    it('SRC-02 D-PAY-SRC-01: LUONG_CO_BAN snapshot matches C&B base → emp_cb', async () => {
      const db = {
        query: jest.fn(async (sql: string) => {
          if (sql.includes('ALTER TABLE') || sql.includes('UPDATE public.employee_compensation_lines')) {
            return { rows: [] };
          }
          if (sql.includes('information_schema')) {
            return { rows: [{ exists: false }] };
          }
          if (sql.includes('FROM public.employees')) {
            return { rows: [{ company_id: 'holding' }] };
          }
          if (sql.includes('FROM public.employee_compensation_packages')) {
            return { rows: [{ id: 'pkg-nv002', company_id: 'holding' }] };
          }
          if (sql.includes('FROM public.employee_compensation_lines')) {
            return {
              rows: [
                {
                  id: 'line-base-nv002',
                  line_type: 'base',
                  amount: '9500000',
                  allowance_code: null,
                  component_code: 'base',
                },
              ],
            };
          }
          if (sql.includes('FROM public.salary_components')) {
            return { rows: [{ id: 'sc-lcb', nature: 'income', default_value: '0', value_type: 'fixed' }] };
          }
          return { rows: [] };
        }),
      } as unknown as HrmDbService;
      const svc = new PayFormulaService(db);
      const result = await svc.processEmployeePayslipViaSrc({
        companyId: 'holding',
        periodId: 'period-1',
        employeeId: '22222222-2222-4222-8222-222222222222',
        asOfDate: new Date('2026-09-29T17:00:00.000Z'),
        periodFrom: '2026-09-01',
        periodTo: '2026-09-30',
        sheetTemplateSnapshotJson: {
          columns: [
            {
              component_code: 'LUONG_CO_BAN',
              sort_order: 0,
              formula_definition_id: null,
              override_applied: false,
            },
          ],
        },
        boundFormula,
      });
      expect(result.mode).toBe('computed');
      if (result.mode !== 'computed') return;
      expect(result.lines[0]).toMatchObject({
        component_code: 'LUONG_CO_BAN',
        amount: 9_500_000,
        source_tier: 'emp_cb',
        source_ref: 'emp_cb:package:pkg-nv002:line:line-base-nv002',
      });
    });

    it('SRC-05: blocked when no tier resolves — FORMULA-412 not silent zero', async () => {
      const db = {
        query: jest.fn(async (sql: string) => {
          if (sql.includes('ALTER TABLE') || sql.includes('UPDATE public.employee_compensation_lines')) {
            return { rows: [] };
          }
          if (sql.includes('information_schema')) {
            return { rows: [{ exists: false }] };
          }
          if (sql.includes('FROM public.employees')) {
            return { rows: [{ company_id: 'holding' }] };
          }
          if (sql.includes('FROM public.employee_compensation_packages')) {
            return { rows: [] };
          }
          if (sql.includes('FROM public.salary_components')) {
            return { rows: [{ id: 'sc-1', nature: 'income', default_value: '0', value_type: 'fixed' }] };
          }
          if (sql.includes('FROM public.pay_formula_definitions')) {
            return { rows: [] };
          }
          return { rows: [] };
        }),
      } as unknown as HrmDbService;
      const svc = new PayFormulaService(db);
      const result = await svc.processEmployeePayslipViaSrc({
        companyId: 'holding',
        periodId: 'period-1',
        employeeId: '11111111-1111-4111-8111-111111111111',
        asOfDate: '2026-04-30',
        periodFrom: '2026-04-01',
        periodTo: '2026-04-30',
        sheetTemplateSnapshotJson: {
          columns: [{ component_code: 'MYSTERY', sort_order: 0, formula_definition_id: null }],
        },
        boundFormula,
      });
      expect(result.mode).toBe('blocked');
      if (result.mode !== 'blocked') return;
      expect(result.code).toBe(HRM_PAY_FORMULA_412);
      expect(result.details.payroll_e2e_ready).toBe(false);
    });
  });
});
