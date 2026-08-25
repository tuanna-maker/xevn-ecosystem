import { HrmDbService } from '../db/hrm-db.service';
import {
  aggregateSrcPayslipTotals,
  catalogFormulaCodeCandidates,
  componentCodesMatch,
  loadEmployeeFixedAmountForComponent,
  loadPeriodInputAmount,
  normalizePayrollAsOfDate,
  parsePeriodSnapshotColumns,
  pickSrcTierAvailable,
  resolveCatalogDefaultFormulaId,
  resolveLineComponentCode,
  resolvePayslipLineSourceTier,
} from './pay-src-resolver';

describe('pay-src-resolver (PO-HRM-AMIS-PARITY-PAY-SRC-BE-01)', () => {
  describe('resolvePayslipLineSourceTier (R-PAY-SRC-TIER-FIELD)', () => {
    it('prefers stored column when valid', () => {
      expect(resolvePayslipLineSourceTier('emp_cb', 'period_input:x')).toBe(
        'emp_cb',
      );
      expect(
        resolvePayslipLineSourceTier('template_override', 'expr:mul'),
      ).toBe('template_override');
    });

    it('derives emp_cb from source_ref when stored null (GET-TIER)', () => {
      expect(
        resolvePayslipLineSourceTier(
          null,
          'emp_cb:package:ab2c7c78-8b89-4f59-a84e-6f99df05763c:line:d6d116da-1fa0-4815-a48f-6bc9825b52b0',
        ),
      ).toBe('emp_cb');
    });

    it('derives period_input / formula_default prefixes', () => {
      expect(
        resolvePayslipLineSourceTier(undefined, 'period_input:line-1'),
      ).toBe('period_input');
      expect(resolvePayslipLineSourceTier('', 'catalog:default_value')).toBe(
        'formula_default',
      );
      expect(resolvePayslipLineSourceTier(null, 'expr:mul')).toBe(
        'formula_default',
      );
      expect(resolvePayslipLineSourceTier(null, 'var:base_salary')).toBe(
        'formula_default',
      );
    });

    it('returns null when neither stored nor ref is known', () => {
      expect(resolvePayslipLineSourceTier(null, null)).toBeNull();
      expect(resolvePayslipLineSourceTier('bogus', 'unknown-ref')).toBeNull();
    });
  });

  describe('parsePeriodSnapshotColumns', () => {
    it('parses snapshot columns ordered by sort_order', () => {
      const cols = parsePeriodSnapshotColumns({
        template_id: 'tpl-1',
        columns: [
          {
            component_code: 'OT',
            sort_order: 2,
            formula_definition_id: null,
            override_applied: false,
          },
          {
            component_code: 'BASE',
            sort_order: 1,
            formula_definition_id: 'f1',
            override_applied: true,
          },
        ],
      });
      expect(cols.map((c) => c.component_code)).toEqual(['BASE', 'OT']);
      expect(cols[0].formula_definition_id).toBe('f1');
      expect(cols[0].override_applied).toBe(true);
    });

    it('formula_definition_id alone does not imply override_applied (SRC-05 default)', () => {
      const cols = parsePeriodSnapshotColumns({
        columns: [
          {
            component_code: 'LUONG_THEO_CONG',
            sort_order: 1,
            formula_definition_id: 'f1',
          },
        ],
      });
      expect(cols[0].override_applied).toBe(false);
      expect(cols[0].formula_definition_id).toBe('f1');
    });

    it('returns empty for invalid snapshot', () => {
      expect(parsePeriodSnapshotColumns(null)).toEqual([]);
      expect(parsePeriodSnapshotColumns([])).toEqual([]);
    });
  });

  describe('pickSrcTierAvailable (BR-AMIS-PAY-SRC-02..05)', () => {
    it('SRC-02 emp C&B wins over all lower tiers', () => {
      expect(
        pickSrcTierAvailable({
          empCbAmount: 5_000_000,
          periodInputAmount: 1,
          templateOverrideFormulaId: 'tpl-f',
          catalogDefaultFormulaId: 'cat-f',
          catalogDefaultValue: 100,
        }),
      ).toBe('emp_cb');
    });

    it('SRC-03 period input wins when no emp C&B', () => {
      expect(
        pickSrcTierAvailable({
          empCbAmount: null,
          periodInputAmount: 500_000,
          templateOverrideFormulaId: 'tpl-f',
          catalogDefaultFormulaId: 'cat-f',
          catalogDefaultValue: null,
        }),
      ).toBe('period_input');
    });

    it('SRC-04 template override wins when 1–2 empty', () => {
      expect(
        pickSrcTierAvailable({
          empCbAmount: null,
          periodInputAmount: null,
          templateOverrideFormulaId: 'tpl-f',
          catalogDefaultFormulaId: 'cat-f',
          catalogDefaultValue: null,
        }),
      ).toBe('template_override');
    });

    it('SRC-05 catalog default when upper tiers empty', () => {
      expect(
        pickSrcTierAvailable({
          empCbAmount: null,
          periodInputAmount: null,
          templateOverrideFormulaId: null,
          catalogDefaultFormulaId: 'cat-f',
          catalogDefaultValue: null,
        }),
      ).toBe('formula_default');
    });

    it('SRC-05 blocked when all tiers empty — cấm silent zero', () => {
      expect(
        pickSrcTierAvailable({
          empCbAmount: null,
          periodInputAmount: null,
          templateOverrideFormulaId: null,
          catalogDefaultFormulaId: null,
          catalogDefaultValue: null,
        }),
      ).toBe('blocked');
    });
  });

  describe('aggregateSrcPayslipTotals', () => {
    it('sums earning and deduction lines', () => {
      const totals = aggregateSrcPayslipTotals([
        {
          component_code: 'BASE',
          sign: 'earning',
          amount: 10_000_000,
          source_tier: 'emp_cb',
          source_ref: 'emp_cb:base',
          formula_definition_id: null,
          sort_order: 0,
        },
        {
          component_code: 'TAX',
          sign: 'deduction',
          amount: 1_000_000,
          source_tier: 'formula_default',
          source_ref: 'expr:mul',
          formula_definition_id: 'f1',
          sort_order: 1,
        },
      ]);
      expect(totals).toEqual({
        gross: 10_000_000,
        deduction: 1_000_000,
        net: 9_000_000,
      });
    });
  });

  describe('catalogFormulaCodeCandidates', () => {
    it('returns open convention codes without closed enum', () => {
      const codes = catalogFormulaCodeCandidates('Meal_Allow');
      expect(codes).toContain('comp:meal_allow');
      expect(codes).toContain('meal_allow');
    });
  });

  describe('loadEmployeeFixedAmountForComponent (SRC-02)', () => {
    it('VAL-PAY-SRC-02A: reads component_code line with package:line source_ref', async () => {
      const db = {
        query: jest.fn(async (sql: string) => {
          if (
            sql.includes('ALTER TABLE') ||
            sql.includes('UPDATE public.employee_compensation_lines')
          ) {
            return { rows: [] };
          }
          if (sql.includes('FROM public.employees')) {
            return { rows: [{ company_id: 'holding' }] };
          }
          if (
            sql.includes('FROM public.employee_compensation_packages') &&
            sql.includes('ANY')
          ) {
            return { rows: [{ id: 'pkg-1', company_id: 'holding' }] };
          }
          if (sql.includes('FROM public.employee_compensation_lines')) {
            return {
              rows: [
                {
                  id: 'line-meal-1',
                  line_type: 'allowance',
                  amount: '500000',
                  allowance_code: 'PHU_CAP_AN',
                  component_code: 'phu_cap_an',
                },
              ],
            };
          }
          return { rows: [] };
        }),
      } as unknown as HrmDbService;

      const fixed = await loadEmployeeFixedAmountForComponent(db, {
        companyId: 'holding',
        employeeId: '11111111-1111-4111-8111-111111111111',
        asOfDate: '2026-04-30',
        componentCode: 'PHU_CAP_AN',
      });
      expect(fixed).toEqual({
        amount: 500_000,
        source_ref: 'emp_cb:package:pkg-1:line:line-meal-1',
        warnings: expect.arrayContaining(['CB_PACKAGE_SOURCE:scoped_package']),
      });
    });

    it('VAL-PAY-SRC-02A: BASE alias matches base line via component_code', async () => {
      const db = {
        query: jest.fn(async (sql: string) => {
          if (
            sql.includes('ALTER TABLE') ||
            sql.includes('UPDATE public.employee_compensation_lines')
          ) {
            return { rows: [] };
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
                  amount: '12000000',
                  allowance_code: null,
                  component_code: 'base',
                },
              ],
            };
          }
          return { rows: [] };
        }),
      } as unknown as HrmDbService;

      const fixed = await loadEmployeeFixedAmountForComponent(db, {
        companyId: 'holding',
        employeeId: '11111111-1111-4111-8111-111111111111',
        asOfDate: '2026-04-30',
        componentCode: 'BASE',
      });
      expect(fixed).toMatchObject({
        amount: 12_000_000,
        source_ref: 'emp_cb:package:pkg-1:line:line-base-1',
      });
    });

    it('returns null with CB_COMPONENT_UNMAPPED warning path when lines unmapped', async () => {
      const db = {
        query: jest.fn(async (sql: string) => {
          if (
            sql.includes('ALTER TABLE') ||
            sql.includes('UPDATE public.employee_compensation_lines')
          ) {
            return { rows: [] };
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
                  id: 'line-x',
                  line_type: 'probation',
                  amount: '9000000',
                  allowance_code: null,
                  component_code: null,
                },
              ],
            };
          }
          return { rows: [] };
        }),
      } as unknown as HrmDbService;

      const fixed = await loadEmployeeFixedAmountForComponent(db, {
        companyId: 'holding',
        employeeId: '11111111-1111-4111-8111-111111111111',
        asOfDate: '2026-04-30',
        componentCode: 'MYSTERY_COMPONENT',
      });
      expect(fixed).toBeNull();
    });
  });

  describe('resolveLineComponentCode', () => {
    it('prefers explicit component_code over allowance_code', () => {
      expect(
        resolveLineComponentCode({
          line_type: 'allowance',
          allowance_code: 'PHU_CAP_AN',
          component_code: 'meal_allow',
        }),
      ).toBe('meal_allow');
    });

    it('derives base from line_type when component_code absent', () => {
      expect(
        resolveLineComponentCode({
          line_type: 'base',
          allowance_code: null,
          component_code: null,
        }),
      ).toBe('base');
    });
  });

  describe('componentCodesMatch BASE ↔ LUONG_CO_BAN (D-PAY-SRC-01)', () => {
    it('matches template LUONG_CO_BAN to C&B base', () => {
      expect(componentCodesMatch('LUONG_CO_BAN', 'base')).toBe(true);
      expect(componentCodesMatch('BASE', 'luong_co_ban')).toBe(true);
      expect(componentCodesMatch('base_salary', 'LUONG_CO_BAN')).toBe(true);
    });

    it('does not match unrelated codes', () => {
      expect(componentCodesMatch('LUONG_CO_BAN', 'phu_cap_an')).toBe(false);
      expect(componentCodesMatch('BASE', 'DED_SAMPLE')).toBe(false);
    });
  });

  describe('normalizePayrollAsOfDate', () => {
    it('keeps yyyy-MM-dd and slices ISO date prefix', () => {
      expect(normalizePayrollAsOfDate('2026-09-30')).toBe('2026-09-30');
      expect(normalizePayrollAsOfDate('2026-09-29T17:00:00.000Z')).toBe(
        '2026-09-29',
      );
    });
  });

  describe('loadEmployeeFixedAmountForComponent legacy note', () => {
    it('reads base_salary from C&B bag for BASE component', async () => {
      const db = {
        query: jest.fn(async (sql: string) => {
          if (
            sql.includes('ALTER TABLE') ||
            sql.includes('UPDATE public.employee_compensation_lines')
          ) {
            return { rows: [] };
          }
          if (sql.includes('FROM public.employees')) {
            return { rows: [{ company_id: 'holding' }] };
          }
          if (
            sql.includes('FROM public.employee_compensation_packages') &&
            sql.includes('ANY')
          ) {
            return { rows: [{ id: 'pkg-1', company_id: 'holding' }] };
          }
          if (sql.includes('FROM public.employee_compensation_lines')) {
            return {
              rows: [
                {
                  id: 'line-base-legacy',
                  line_type: 'base',
                  amount: '12000000',
                  allowance_code: null,
                  component_code: 'base',
                },
              ],
            };
          }
          return { rows: [] };
        }),
      } as unknown as HrmDbService;

      const fixed = await loadEmployeeFixedAmountForComponent(db, {
        companyId: 'holding',
        employeeId: '11111111-1111-4111-8111-111111111111',
        asOfDate: '2026-04-30',
        componentCode: 'BASE',
      });
      expect(fixed).toMatchObject({
        amount: 12_000_000,
        source_ref: expect.stringContaining('emp_cb:package:'),
      });
    });

    it('D-PAY-SRC-01: LUONG_CO_BAN template code wins emp_cb from base line', async () => {
      const db = {
        query: jest.fn(async (sql: string) => {
          if (
            sql.includes('ALTER TABLE') ||
            sql.includes('UPDATE public.employee_compensation_lines')
          ) {
            return { rows: [] };
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
                  component_code: null,
                },
              ],
            };
          }
          return { rows: [] };
        }),
      } as unknown as HrmDbService;

      const fixed = await loadEmployeeFixedAmountForComponent(db, {
        companyId: 'holding',
        employeeId: '22222222-2222-4222-8222-222222222222',
        asOfDate: new Date('2026-09-29T17:00:00.000Z'),
        componentCode: 'LUONG_CO_BAN',
      });
      expect(fixed).toMatchObject({
        amount: 9_500_000,
        source_ref: 'emp_cb:package:pkg-nv002:line:line-base-nv002',
      });
    });
  });

  describe('loadPeriodInputAmount (SRC-03)', () => {
    it('returns amount when pay_period_input_lines row exists', async () => {
      const db = {
        query: jest.fn(async (sql: string) => {
          if (sql.includes('information_schema.tables')) {
            return { rows: [{ exists: true }] };
          }
          if (sql.includes('FROM public.pay_period_input_lines')) {
            return {
              rows: [
                { id: 'inp-1', amount: '750000', source_kind: 'other_income' },
              ],
            };
          }
          return { rows: [] };
        }),
      } as unknown as HrmDbService;

      const pack = await loadPeriodInputAmount(db, {
        periodId: 'period-1',
        employeeId: 'emp-1',
        componentCode: 'BONUS',
      });
      expect(pack).toEqual({
        id: 'inp-1',
        amount: 750_000,
        source_kind: 'other_income',
      });
    });

    it('VAL-INP-SRC-03b throws when row has non-finite amount (no silent 0)', async () => {
      const db = {
        query: jest.fn(async (sql: string) => {
          if (sql.includes('information_schema.tables')) {
            return { rows: [{ exists: true }] };
          }
          if (sql.includes('FROM public.pay_period_input_lines')) {
            return {
              rows: [
                { id: 'bad-1', amount: 'not-a-number', source_kind: 'manual' },
              ],
            };
          }
          return { rows: [] };
        }),
      } as unknown as HrmDbService;

      await expect(
        loadPeriodInputAmount(db, {
          periodId: 'period-1',
          employeeId: 'emp-1',
          componentCode: 'BONUS',
        }),
      ).rejects.toThrow(/VAL-INP-SRC-03b/);
    });

    it('returns null when table absent (honest PAPER)', async () => {
      const db = {
        query: jest.fn(async (sql: string) => {
          if (sql.includes('information_schema.tables')) {
            return { rows: [{ exists: false }] };
          }
          return { rows: [] };
        }),
      } as unknown as HrmDbService;

      const pack = await loadPeriodInputAmount(db, {
        periodId: 'period-1',
        employeeId: 'emp-1',
        componentCode: 'BONUS',
      });
      expect(pack).toBeNull();
    });
  });

  describe('resolveCatalogDefaultFormulaId (SRC-05)', () => {
    it('finds published formula by comp: code convention', async () => {
      const db = {
        query: jest.fn(async (sql: string, params?: unknown[]) => {
          if (
            sql.includes('FROM public.pay_formula_definitions') &&
            params?.[1] === 'comp:meal'
          ) {
            return { rows: [{ id: 'formula-meal' }] };
          }
          return { rows: [] };
        }),
      } as unknown as HrmDbService;

      const id = await resolveCatalogDefaultFormulaId(db, {
        companyId: 'holding',
        componentCode: 'MEAL',
      });
      expect(id).toBe('formula-meal');
    });
  });
});
