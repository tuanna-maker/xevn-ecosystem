import { HrmDbService } from '../db/hrm-db.service';
import { PayFormulaService } from './pay-formula.service';
import { HRM_PAY_SPLIT_409 } from './pay-payslip-split.constants';
import {
  buildSplitSegmentWindows,
  detectDoubleStaticViolation,
  ensurePayPayslipSplitSegmentsSchema,
  isStaticSplitComponentCode,
  PayPayslipSplitService,
  prorateAttHourOverrides,
} from './pay-payslip-split.service';

describe('PayPayslipSplitService (PAY-04 C-SLICE)', () => {
  describe('buildSplitSegmentWindows', () => {
    it('builds contiguous windows from CORE effective_from cuts (not hardcoded day 15)', () => {
      const windows = buildSplitSegmentWindows('2026-04-01', '2026-04-30', [
        '2026-04-16',
      ]);
      expect(windows).toHaveLength(2);
      expect(windows[0]).toMatchObject({
        segmentSeq: 1,
        effectiveFrom: '2026-04-01',
        effectiveTo: '2026-04-15',
      });
      expect(windows[1]).toMatchObject({
        segmentSeq: 2,
        effectiveFrom: '2026-04-16',
        effectiveTo: '2026-04-30',
      });
    });

    it('supports N>2 segments (O5)', () => {
      const windows = buildSplitSegmentWindows('2026-04-01', '2026-04-30', [
        '2026-04-10',
        '2026-04-20',
      ]);
      expect(windows).toHaveLength(3);
      expect(windows.map((w) => w.segmentSeq)).toEqual([1, 2, 3]);
    });
  });

  describe('detectDoubleStaticViolation / HRM-PAY-SPLIT-409', () => {
    it('flags static deduction on more than one segment', () => {
      const violation = detectDoubleStaticViolation([
        { lines: [{ component_code: 'GTCG', sign: 'deduction' }] },
        { lines: [{ component_code: 'BASE', sign: 'earning' }] },
        { lines: [{ component_code: 'TAX', sign: 'deduction' }] },
      ]);
      expect(violation).toBe(true);
    });

    it('passes when static deduction appears on at most one segment eval', () => {
      const violation = detectDoubleStaticViolation([
        { lines: [{ component_code: 'GTCG', sign: 'deduction' }] },
        { lines: [{ component_code: 'BASE', sign: 'earning' }] },
      ]);
      expect(violation).toBe(false);
    });

    it('isStaticSplitComponentCode recognizes GTCG prefix family', () => {
      expect(isStaticSplitComponentCode('GTCG_FAMILY')).toBe(true);
      expect(isStaticSplitComponentCode('BASE')).toBe(false);
    });
  });

  describe('prorateAttHourOverrides', () => {
    it('prorates closed-sheet hours by inclusive day ratio (F-PAY-ATT-CLOSED-01)', () => {
      const prorated = prorateAttHourOverrides(
        { payable_hours: 160 },
        '2026-04-01',
        '2026-04-15',
        '2026-04-01',
        '2026-04-30',
      );
      expect(prorated.payable_hours).toBeGreaterThan(0);
      expect(prorated.payable_hours).toBeLessThan(160);
    });
  });

  describe('ensurePayPayslipSplitSegmentsSchema', () => {
    it('CREATE TABLE payroll_payslip_split_segments per DATA §6.1', async () => {
      const queries: string[] = [];
      const db = {
        query: jest.fn(async (sql: string) => {
          queries.push(sql);
          return { rows: [] };
        }),
      } as unknown as HrmDbService;
      await ensurePayPayslipSplitSegmentsSchema(db);
      const ddl = queries.join('\n');
      expect(ddl).toContain('payroll_payslip_split_segments');
      expect(ddl).toContain('segment_seq');
      expect(ddl).not.toContain('tax_amount');
      expect(ddl).not.toContain('gtgc_amount');
    });
  });

  describe('processEmployeeInPeriod simulateDoubleStatic', () => {
    it('returns HRM-PAY-SPLIT-409 when simulateDoubleStatic is set', async () => {
      const payFormulas = {
        processEmployeePayslipViaSrc: jest.fn(),
      } as unknown as PayFormulaService;
      const db = {
        query: jest.fn(async (sql: string) => {
          if (sql.includes('employee_compensation_packages')) {
            return { rows: [{ cut: '2026-04-16' }] };
          }
          return { rows: [] };
        }),
      } as unknown as HrmDbService;

      (payFormulas.processEmployeePayslipViaSrc as jest.Mock).mockResolvedValue(
        {
          mode: 'computed',
          lines: [
            { component_code: 'BASE', sign: 'earning', amount: 5_000_000 },
          ],
          gross: 5_000_000,
          deduction: 0,
          net: 5_000_000,
          primaryFormulaDefinitionId: 'f1',
          sourceTiers: [],
          warnings: [],
        },
      );

      const svc = new PayPayslipSplitService(db, payFormulas);
      const result = await svc.processEmployeeInPeriod({
        companyId: 'holding',
        periodId: 'p1',
        periodFrom: '2026-04-01',
        periodTo: '2026-04-30',
        employeeId: 'e1',
        asOfDate: '2026-04-30',
        boundFormula: {
          id: 'f1',
          code: 'GD1',
          version: 1,
          source: 'company_active',
          expression_json: {},
          required_vars_json: {},
        },
        simulateDoubleStatic: true,
      });

      expect(result.mode).toBe('blocked');
      if (result.mode === 'blocked') {
        expect(result.code).toBe(HRM_PAY_SPLIT_409);
      }
    });
  });
});
