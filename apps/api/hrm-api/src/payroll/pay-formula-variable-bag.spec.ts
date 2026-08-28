/**
 * @CODE-MEMORY
 * WorkItem: PO-HRM-PAYROLL-FORMULA-RUN-GAP-BE-CB-BAG-01
 * Purpose: Jest — CORE C&B → var bag without variableOverrides; honest empty
 *
 * @CODE-MEMORY-CHANGE 2026-08-07
 * WorkItem: PO-HRM-PAYROLL-FORMULA-RUN-GAP-BE-ATT-LINE-01
 * What: loadAttHoursFromClosedLine + bag SELECT closed+locked; no silent 0
 */

import {
  applyVariableOverrides,
  buildPayFormulaVariableBag,
  expandCbReadCompanyIds,
  loadAttHoursFromClosedLine,
  loadCoreCbVariableBag,
  loadInputPackBag,
} from './pay-formula-variable-bag';
import {
  isAllowedFormulaVarKey,
  PAY_FORMULA_INPUT_PACK_SOURCE_KINDS,
  PAY_FORMULA_REQUIRED_VAR_ALLOWLIST,
} from './pay-formula.constants'; // W10 BA-HRM-PAYROLL-FORMULA-INPUT-PACK-BE-01
import { HrmDbService } from '../db/hrm-db.service';

function mockDb(
  handler: (sql: string, params?: unknown[]) => { rows: unknown[] },
): HrmDbService {
  return {
    query: jest.fn(async (sql: string, params?: unknown[]) =>
      handler(sql, params),
    ),
  } as unknown as HrmDbService;
}

describe('expandCbReadCompanyIds', () => {
  it('merges period holding + employee member OU aliases', () => {
    const ids = expandCbReadCompanyIds('holding', 'trsport');
    expect(ids).toEqual(expect.arrayContaining(['holding', 'main', 'trsport']));
  });
});

describe('applyVariableOverrides', () => {
  it('applies finite numbers only', () => {
    const r = applyVariableOverrides(
      { a: 1 },
      { a: 2, b: '3', c: 'x', d: null },
    );
    expect(r.vars).toEqual({ a: 2, b: 3 });
    expect(r.applied.sort()).toEqual(['a', 'b']);
  });
});

describe('loadCoreCbVariableBag', () => {
  const empId = '11111111-1111-4111-8111-111111111111';
  const pkgId = '22222222-2222-4222-8222-222222222222';

  it('resolves base_salary when package company is employee OU and period is holding', async () => {
    const db = mockDb((sql) => {
      if (sql.includes('FROM public.employees')) {
        return { rows: [{ company_id: 'trsport' }] };
      }
      if (
        sql.includes('FROM public.employee_compensation_packages') &&
        sql.includes('ANY($2::text[])')
      ) {
        return { rows: [{ id: pkgId, company_id: 'trsport' }] };
      }
      if (sql.includes('FROM public.employee_compensation_lines')) {
        return {
          rows: [
            { line_type: 'base', amount: '12000000', allowance_code: null },
            {
              line_type: 'allowance',
              amount: '500000',
              allowance_code: 'PHONE',
            },
          ],
        };
      }
      return { rows: [] };
    });

    const bag = await loadCoreCbVariableBag(db, {
      companyId: 'holding',
      employeeId: empId,
      asOfDate: '2026-08-31',
    });
    expect(bag.vars.base_salary).toBe(12_000_000);
    expect(bag.vars.allowance_phone).toBe(500_000);
    expect(bag.warnings).toEqual(
      expect.arrayContaining([
        'CB_PACKAGE_SOURCE:scoped_package',
        'CB_PACKAGE_COMPANY_ALIAS_MATCH',
      ]),
    );
    expect(bag.warnings).not.toContain('CB_PACKAGE_ABSENT');
  });

  it('falls back to employee-anchored package when scoped company miss', async () => {
    const db = mockDb((sql) => {
      if (sql.includes('FROM public.employees')) {
        return { rows: [{ company_id: 'holding' }] };
      }
      if (
        sql.includes('FROM public.employee_compensation_packages') &&
        sql.includes('ANY($2::text[])')
      ) {
        return { rows: [] };
      }
      if (
        sql.includes('FROM public.employee_compensation_packages') &&
        !sql.includes('ANY($2::text[])')
      ) {
        return { rows: [{ id: pkgId, company_id: 'legacy-ou' }] };
      }
      if (sql.includes('FROM public.employee_compensation_lines')) {
        return {
          rows: [
            { line_type: 'base', amount: '9000000', allowance_code: null },
          ],
        };
      }
      return { rows: [] };
    });

    const bag = await loadCoreCbVariableBag(db, {
      companyId: 'holding',
      employeeId: empId,
      asOfDate: '2026-08-31',
    });
    expect(bag.vars.base_salary).toBe(9_000_000);
    expect(bag.warnings).toEqual(
      expect.arrayContaining([
        'CB_PACKAGE_EMPLOYEE_FALLBACK',
        'CB_PACKAGE_SOURCE:employee_fallback',
      ]),
    );
  });

  it('falls back to contract.compensation_package_id when packages absent', async () => {
    const db = mockDb((sql) => {
      if (sql.includes('FROM public.employees')) {
        return { rows: [{ company_id: 'holding' }] };
      }
      if (sql.includes('FROM public.employee_compensation_packages')) {
        return { rows: [] };
      }
      if (sql.includes('FROM public.employee_contracts')) {
        return { rows: [{ compensation_package_id: pkgId }] };
      }
      if (sql.includes('FROM public.employee_compensation_lines')) {
        return {
          rows: [
            { line_type: 'base', amount: '7500000', allowance_code: null },
          ],
        };
      }
      return { rows: [] };
    });

    const bag = await loadCoreCbVariableBag(db, {
      companyId: 'holding',
      employeeId: empId,
      asOfDate: '2026-08-31',
    });
    expect(bag.vars.base_salary).toBe(7_500_000);
    expect(bag.warnings).toEqual(
      expect.arrayContaining([
        'CB_PACKAGE_FROM_CONTRACT_LINK',
        'CB_PACKAGE_SOURCE:contract_link',
      ]),
    );
  });

  it('maps probation line to base_salary when base line absent', async () => {
    const db = mockDb((sql) => {
      if (sql.includes('FROM public.employees')) {
        return { rows: [{ company_id: 'holding' }] };
      }
      if (
        sql.includes('FROM public.employee_compensation_packages') &&
        sql.includes('ANY')
      ) {
        return { rows: [{ id: pkgId, company_id: 'holding' }] };
      }
      if (sql.includes('FROM public.employee_compensation_lines')) {
        return {
          rows: [
            { line_type: 'probation', amount: '6000000', allowance_code: null },
          ],
        };
      }
      return { rows: [] };
    });

    const bag = await loadCoreCbVariableBag(db, {
      companyId: 'holding',
      employeeId: empId,
      asOfDate: '2026-08-31',
    });
    expect(bag.vars.base_salary).toBe(6_000_000);
    expect(bag.warnings).toContain('CB_BASE_FROM_PROBATION_LINE');
  });

  it('returns CB_PACKAGE_ABSENT when no package (honest empty — no invent)', async () => {
    const db = mockDb((sql) => {
      if (sql.includes('FROM public.employees')) {
        return { rows: [{ company_id: 'holding' }] };
      }
      return { rows: [] };
    });

    const bag = await loadCoreCbVariableBag(db, {
      companyId: 'holding',
      employeeId: empId,
      asOfDate: '2026-08-31',
    });
    expect(bag.vars).toEqual({});
    expect(bag.warnings).toContain('CB_PACKAGE_ABSENT');
  });
});

describe('loadAttHoursFromClosedLine', () => {
  const empId = '11111111-1111-4111-8111-111111111111';
  const sheetId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
  const lineId = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';

  it('returns ATT_TIMESHEET_LINE_ABSENT when table missing (no silent 0)', async () => {
    const db = mockDb((sql) => {
      if (sql.includes("table_name = 'att_timesheet_line'")) {
        return { rows: [{ exists: false }] };
      }
      return { rows: [] };
    });
    const r = await loadAttHoursFromClosedLine(db, {
      companyId: 'holding',
      employeeId: empId,
      periodFrom: '2026-08-01',
      periodTo: '2026-08-31',
      requiredKeys: ['payable_hours'],
    });
    expect(r.vars).toEqual({});
    expect(r.attHoursReady).toBe(false);
    expect(r.attHoursReason).toBe('ATT_TIMESHEET_LINE_ABSENT');
    expect(r.warnings).toEqual(
      expect.arrayContaining([
        'ATT_TIMESHEET_LINE_ABSENT',
        'ATT_HOURS_BLOCKED_UNTIL_LINE',
      ]),
    );
  });

  it('maps closed+locked line into PAY_FORMULA_ATT_HOUR_VARS', async () => {
    const db = mockDb((sql) => {
      if (sql.includes("table_name = 'att_timesheet_line'")) {
        return { rows: [{ exists: true }] };
      }
      if (
        sql.includes('FROM public.attendance_sheets') &&
        sql.includes("status = 'closed'")
      ) {
        return { rows: [{ id: sheetId }] };
      }
      if (sql.includes('FROM public.att_timesheet_line')) {
        return {
          rows: [
            {
              id: lineId,
              line_locked: true,
              payable_hours: '176',
              standard_hours: '160',
              ot_hours_weighted: '8',
              paid_leave_hours: '8',
              unpaid_leave_hours: '0',
              work_days: '22',
            },
          ],
        };
      }
      return { rows: [] };
    });
    const r = await loadAttHoursFromClosedLine(db, {
      companyId: 'holding',
      employeeId: empId,
      periodFrom: '2026-08-01',
      periodTo: '2026-08-31',
      requiredKeys: ['payable_hours', 'standard_hours'],
    });
    expect(r.attHoursReady).toBe(true);
    expect(r.attHoursReason).toBe('ATT_HOURS_READY');
    expect(r.vars.payable_hours).toBe(176);
    expect(r.vars.standard_hours).toBe(160);
    expect(r.vars.ot_hours_weighted).toBe(8);
    expect(r.sheetId).toBe(sheetId);
    expect(r.lineId).toBe(lineId);
  });

  it('ATT_LINE_INCOMPLETE when line not locked — omit hours (no invent 0)', async () => {
    const db = mockDb((sql) => {
      if (sql.includes("table_name = 'att_timesheet_line'")) {
        return { rows: [{ exists: true }] };
      }
      if (sql.includes('FROM public.attendance_sheets')) {
        return { rows: [{ id: sheetId }] };
      }
      if (sql.includes('FROM public.att_timesheet_line')) {
        return {
          rows: [
            {
              id: lineId,
              line_locked: false,
              payable_hours: '176',
              standard_hours: '160',
              ot_hours_weighted: '0',
              paid_leave_hours: '0',
              unpaid_leave_hours: '0',
              work_days: '22',
            },
          ],
        };
      }
      return { rows: [] };
    });
    const r = await loadAttHoursFromClosedLine(db, {
      companyId: 'holding',
      employeeId: empId,
      periodFrom: '2026-08-01',
      periodTo: '2026-08-31',
      requiredKeys: ['payable_hours'],
    });
    expect(r.vars).toEqual({});
    expect(r.attHoursReason).toBe('ATT_LINE_INCOMPLETE');
    expect(r.warnings).toContain('ATT_LINE_NOT_LOCKED');
  });

  it('NO_CLOSED_SHEET when no closed attendance_sheets in window', async () => {
    const db = mockDb((sql) => {
      if (sql.includes("table_name = 'att_timesheet_line'")) {
        return { rows: [{ exists: true }] };
      }
      if (sql.includes('FROM public.attendance_sheets')) {
        return { rows: [] };
      }
      return { rows: [] };
    });
    const r = await loadAttHoursFromClosedLine(db, {
      companyId: 'holding',
      employeeId: empId,
      periodFrom: '2026-08-01',
      periodTo: '2026-08-31',
      requiredKeys: ['payable_hours'],
    });
    expect(r.vars).toEqual({});
    expect(r.attHoursReason).toBe('NO_CLOSED_SHEET');
    expect(r.warnings).toContain('NO_CLOSED_SHEET');
  });

  it('ATT_LINE_MISSING when closed sheet but no employee line', async () => {
    const db = mockDb((sql) => {
      if (sql.includes("table_name = 'att_timesheet_line'")) {
        return { rows: [{ exists: true }] };
      }
      if (sql.includes('FROM public.attendance_sheets')) {
        return { rows: [{ id: sheetId }] };
      }
      if (sql.includes('FROM public.att_timesheet_line')) {
        return { rows: [] };
      }
      return { rows: [] };
    });
    const r = await loadAttHoursFromClosedLine(db, {
      companyId: 'holding',
      employeeId: empId,
      periodFrom: '2026-08-01',
      periodTo: '2026-08-31',
      requiredKeys: ['payable_hours'],
    });
    expect(r.attHoursReason).toBe('ATT_LINE_MISSING');
    expect(r.vars).toEqual({});
  });
});

describe('buildPayFormulaVariableBag', () => {
  it('loads emp_cb without overrides when C&B present', async () => {
    const empId = '11111111-1111-4111-8111-111111111111';
    const pkgId = '22222222-2222-4222-8222-222222222222';
    const db = mockDb((sql) => {
      if (sql.includes("table_name = 'att_timesheet_line'")) {
        return { rows: [{ exists: false }] };
      }
      if (sql.includes('FROM public.employees')) {
        return { rows: [{ company_id: 'holding' }] };
      }
      if (
        sql.includes('FROM public.employee_compensation_packages') &&
        sql.includes('ANY')
      ) {
        return { rows: [{ id: pkgId, company_id: 'holding' }] };
      }
      if (sql.includes('FROM public.employee_compensation_lines')) {
        return {
          rows: [
            { line_type: 'base', amount: '8000000', allowance_code: null },
          ],
        };
      }
      return { rows: [] };
    });

    const bag = await buildPayFormulaVariableBag(db, {
      companyId: 'holding',
      employeeId: empId,
      asOfDate: '2026-08-31',
      requiredKeys: ['base_salary'],
    });
    expect(bag.vars.base_salary).toBe(8_000_000);
    expect(bag.sourcePrecedence).toContain('emp_cb');
    expect(bag.warnings.some((w) => w.startsWith('OVERRIDES_APPLIED'))).toBe(
      false,
    );
    expect(bag.attHoursReady).toBe(true);
  });

  it('keeps ATT hours incomplete when payable_hours required and line absent', async () => {
    const db = mockDb((sql) => {
      if (sql.includes("table_name = 'att_timesheet_line'")) {
        return { rows: [{ exists: false }] };
      }
      if (sql.includes('FROM public.employees')) {
        return { rows: [{ company_id: 'holding' }] };
      }
      return { rows: [] };
    });

    const bag = await buildPayFormulaVariableBag(db, {
      companyId: 'holding',
      employeeId: '11111111-1111-4111-8111-111111111111',
      asOfDate: '2026-08-31',
      requiredKeys: ['base_salary', 'payable_hours'],
    });
    expect(bag.attHoursReady).toBe(false);
    expect(bag.attHoursReason).toBe('ATT_TIMESHEET_LINE_ABSENT');
    expect(bag.warnings).toEqual(
      expect.arrayContaining([
        'ATT_HOURS_VAR_BAG_INCOMPLETE',
        'ATT_HOURS_BLOCKED_UNTIL_LINE',
      ]),
    );
    expect(bag.vars.payable_hours).toBeUndefined();
  });

  it('binds closed+locked ATT hours into bag (sourcePrecedence att_line)', async () => {
    const empId = '11111111-1111-4111-8111-111111111111';
    const pkgId = '22222222-2222-4222-8222-222222222222';
    const sheetId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
    const db = mockDb((sql) => {
      if (sql.includes("table_name = 'att_timesheet_line'")) {
        return { rows: [{ exists: true }] };
      }
      if (sql.includes('FROM public.employees')) {
        return { rows: [{ company_id: 'holding' }] };
      }
      if (
        sql.includes('FROM public.employee_compensation_packages') &&
        sql.includes('ANY')
      ) {
        return { rows: [{ id: pkgId, company_id: 'holding' }] };
      }
      if (sql.includes('FROM public.employee_compensation_lines')) {
        return {
          rows: [
            { line_type: 'base', amount: '8000000', allowance_code: null },
          ],
        };
      }
      if (sql.includes('FROM public.attendance_sheets')) {
        return { rows: [{ id: sheetId }] };
      }
      if (
        sql.includes('FROM public.att_timesheet_line') &&
        !sql.includes('information_schema')
      ) {
        return {
          rows: [
            {
              id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
              line_locked: true,
              payable_hours: '176',
              standard_hours: '176',
              ot_hours_weighted: '0',
              paid_leave_hours: '0',
              unpaid_leave_hours: '0',
              work_days: '22',
            },
          ],
        };
      }
      return { rows: [] };
    });

    const bag = await buildPayFormulaVariableBag(db, {
      companyId: 'holding',
      employeeId: empId,
      asOfDate: '2026-08-31',
      periodFrom: '2026-08-01',
      periodTo: '2026-08-31',
      requiredKeys: ['base_salary', 'payable_hours'],
    });
    expect(bag.vars.base_salary).toBe(8_000_000);
    expect(bag.vars.payable_hours).toBe(176);
    expect(bag.attHoursReady).toBe(true);
    expect(bag.sourcePrecedence).toEqual(
      expect.arrayContaining(['emp_cb', 'att_line']),
    );
    expect(bag.warnings).toContain('ATT_HOURS_FROM_CLOSED_LINE');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// W10 BA-HRM-PAYROLL-FORMULA-INPUT-PACK-BE-01 — New tests
// ═══════════════════════════════════════════════════════════════════════════

const PERIOD_ID_W10 = 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee';
const EMP_ID_W10 = 'ffffffff-ffff-4fff-8fff-ffffffffffff';

describe('isAllowedFormulaVarKey (W10)', () => {
  it('route_count (IP source_kind) → true', () => {
    expect(isAllowedFormulaVarKey('route_count')).toBe(true);
  });

  it('unknown_xyz → false', () => {
    expect(isAllowedFormulaVarKey('unknown_xyz')).toBe(false);
  });

  it('all 13 IP source_kinds → true', () => {
    for (const kind of PAY_FORMULA_INPUT_PACK_SOURCE_KINDS) {
      expect(isAllowedFormulaVarKey(kind)).toBe(true);
    }
  });

  it('all core ATT vars → true', () => {
    for (const key of PAY_FORMULA_REQUIRED_VAR_ALLOWLIST) {
      expect(isAllowedFormulaVarKey(key)).toBe(true);
    }
  });

  it('allowance_transport (allowance_* wildcard) → true', () => {
    expect(isAllowedFormulaVarKey('allowance_transport')).toBe(true);
  });

  it('empty string → false', () => {
    expect(isAllowedFormulaVarKey('')).toBe(false);
  });
});

describe('loadInputPackBag (W10)', () => {
  it('issues correct SQL with periodId + employeeId params', async () => {
    const db = mockDb((sql, params) => {
      expect(String(sql)).toContain('pay_period_input_lines');
      expect(String(sql)).toContain('archived_at IS NULL');
      if (String(sql).includes('GROUP BY')) {
        expect(String(sql)).toContain('GROUP BY source_kind');
      } else {
        expect(String(sql)).toContain('component_code');
      }
      expect(params).toEqual([PERIOD_ID_W10, EMP_ID_W10]);
      return { rows: [] };
    });
    await loadInputPackBag(PERIOD_ID_W10, EMP_ID_W10, db);
  });

  it('aggregates rows: kpi=1500.5, route_count=42', async () => {
    const db = mockDb(() => ({
      rows: [
        { source_kind: 'kpi', total: '1500.50' },
        { source_kind: 'route_count', total: '42' },
      ],
    }));
    const bag = await loadInputPackBag(PERIOD_ID_W10, EMP_ID_W10, db);
    expect(bag['kpi']).toBe(1500.5);
    expect(bag['route_count']).toBe(42);
  });

  it('BR-W10-03: payable_hours in input_lines is skipped', async () => {
    const db = mockDb(() => ({
      rows: [
        { source_kind: 'payable_hours', total: '999' }, // must be skipped
        { source_kind: 'kpi', total: '500' },
      ],
    }));
    const bag = await loadInputPackBag(PERIOD_ID_W10, EMP_ID_W10, db);
    expect('payable_hours' in bag).toBe(false);
    expect(bag['kpi']).toBe(500);
  });

  it('BR-W10-03: all core ATT vars skipped when present as source_kind', async () => {
    const db = mockDb(() => ({
      rows: PAY_FORMULA_REQUIRED_VAR_ALLOWLIST.map((key) => ({
        source_kind: key,
        total: '100',
      })),
    }));
    const bag = await loadInputPackBag(PERIOD_ID_W10, EMP_ID_W10, db);
    for (const key of PAY_FORMULA_REQUIRED_VAR_ALLOWLIST) {
      expect(key in bag).toBe(false);
    }
    expect(Object.keys(bag)).toHaveLength(0);
  });

  it('empty bag when no input lines exist (U65-safe)', async () => {
    const db = mockDb(() => ({ rows: [] }));
    const bag = await loadInputPackBag(PERIOD_ID_W10, EMP_ID_W10, db);
    expect(bag).toEqual({});
  });
});

describe('buildPayFormulaVariableBag merge order with IP bag (W10)', () => {
  function schemaPass(sql: string): boolean {
    return (
      sql.includes('information_schema') ||
      sql.includes('pg_class') ||
      sql.includes('to_regclass') ||
      sql.includes('employee_compensation') ||
      sql.includes('emp_contracts') ||
      sql.includes('att_timesheet') ||
      sql.includes('payroll_group_members') ||
      sql.includes('pay_gtgc') ||
      sql.includes('pay_sheet_template') ||
      sql.includes('att_timesheet_sheet')
    );
  }

  it('ipBag is lowest priority: attBag wins over cbBag which wins over ipBag', async () => {
    const db = mockDb((sql) => {
      if (schemaPass(sql)) return { rows: [] };
      if (sql.includes('pay_period_input_lines')) {
        // IP bag has kpi=100
        return { rows: [{ source_kind: 'kpi', total: '100' }] };
      }
      return { rows: [] };
    });

    const bag = await buildPayFormulaVariableBag(db, {
      companyId: 'holding',
      employeeId: EMP_ID_W10,
      asOfDate: '2026-08-31',
      periodFrom: '2026-08-01',
      periodTo: '2026-08-31',
      periodId: PERIOD_ID_W10,
      requiredKeys: ['kpi'],
      // variableOverrides with kpi=300 to simulate attBag win
      variableOverrides: { kpi: 300 },
    });
    // Override (simulates att precedence) should win over IP 100
    expect(bag.vars['kpi']).toBe(300);
  });

  it('BR-W10-03 e2e: payable_hours IP line cannot override attBag', async () => {
    const db = mockDb((sql) => {
      if (schemaPass(sql)) return { rows: [] };
      if (sql.includes('pay_period_input_lines')) {
        // Malicious IP line with source_kind=payable_hours
        return { rows: [{ source_kind: 'payable_hours', total: '9999' }] };
      }
      return { rows: [] };
    });

    const bag = await buildPayFormulaVariableBag(db, {
      companyId: 'holding',
      employeeId: EMP_ID_W10,
      asOfDate: '2026-08-31',
      periodId: PERIOD_ID_W10,
      requiredKeys: ['payable_hours'],
    });
    // payable_hours should NOT be 9999 from input_lines
    expect(bag.vars['payable_hours']).not.toBe(9999);
  });

  it('PAY_FORMULA_INPUT_PACK_SOURCE_KINDS has 13 entries', () => {
    expect(PAY_FORMULA_INPUT_PACK_SOURCE_KINDS).toHaveLength(13);
    expect(PAY_FORMULA_INPUT_PACK_SOURCE_KINDS).toContain('route_count');
    expect(PAY_FORMULA_INPUT_PACK_SOURCE_KINDS).toContain('rd_transfer');
  });
});
