/**
 * BA-HRM-PAYROLL-FORMULA-INPUT-PACK-BE-01 — Unit tests
 *
 * Coverage:
 *   1. isAllowedFormulaVarKey — core vars, allowance wildcard, IP source_kinds, unknown keys
 *   2. loadInputPackBag — SQL delegation, SUM aggregation, BR-W10-03 ATT-var skip
 *   3. buildPayFormulaVariableBag — merge order contract (ipBag < cbBag < attBag)
 *   4. Regression: zero impact on PAY_FORMULA_REQUIRED_VAR_ALLOWLIST freeze
 */

import {
  PAY_FORMULA_INPUT_PACK_SOURCE_KINDS,
  PAY_FORMULA_REQUIRED_VAR_ALLOWLIST,
  isAllowedFormulaVarKey,
} from './pay-formula.constants';
import {
  buildPayFormulaVariableBag,
  loadInputPackBag,
} from './pay-formula-variable-bag';

// ---------------------------------------------------------------------------
// Minimal DB mock (mirrors att-ot-comp-type.service.spec.ts mock pattern)
// ---------------------------------------------------------------------------
type MockQueryFn = (sql: string, params?: unknown[]) => Promise<{ rows: unknown[] }>;

function mockDb(queryImpl: MockQueryFn): { query: jest.MockedFunction<MockQueryFn> } {
  return { query: jest.fn().mockImplementation(queryImpl) };
}

// ---------------------------------------------------------------------------
// Section 1 — isAllowedFormulaVarKey
// ---------------------------------------------------------------------------
describe('isAllowedFormulaVarKey', () => {
  it('returns true for every core ATT var in PAY_FORMULA_REQUIRED_VAR_ALLOWLIST', () => {
    for (const key of PAY_FORMULA_REQUIRED_VAR_ALLOWLIST) {
      expect(isAllowedFormulaVarKey(key)).toBe(true);
    }
  });

  it('returns true for route_count (IP source_kind)', () => {
    expect(isAllowedFormulaVarKey('route_count')).toBe(true);
  });

  it('returns true for every value in PAY_FORMULA_INPUT_PACK_SOURCE_KINDS', () => {
    for (const kind of PAY_FORMULA_INPUT_PACK_SOURCE_KINDS) {
      expect(isAllowedFormulaVarKey(kind)).toBe(true);
    }
  });

  it('returns true for allowance_transport (allowance_* wildcard)', () => {
    expect(isAllowedFormulaVarKey('allowance_transport')).toBe(true);
  });

  it('returns true for allowance_phone (allowance_* wildcard)', () => {
    expect(isAllowedFormulaVarKey('allowance_phone')).toBe(true);
  });

  it('returns false for unknown_xyz', () => {
    expect(isAllowedFormulaVarKey('unknown_xyz')).toBe(false);
  });

  it('returns false for empty string', () => {
    expect(isAllowedFormulaVarKey('')).toBe(false);
  });

  it('returns false for whitespace-only string', () => {
    expect(isAllowedFormulaVarKey('   ')).toBe(false);
  });

  it('returns false for allowance_ with no suffix (fails regex)', () => {
    expect(isAllowedFormulaVarKey('allowance_')).toBe(false);
  });

  it('returns false for ROUTE_COUNT (case-sensitive)', () => {
    expect(isAllowedFormulaVarKey('ROUTE_COUNT')).toBe(false);
  });

  it('trims whitespace before matching', () => {
    expect(isAllowedFormulaVarKey('  route_count  ')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Section 2 — loadInputPackBag
// ---------------------------------------------------------------------------
describe('loadInputPackBag', () => {
  const PERIOD_ID = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
  const EMP_ID = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';

  it('issues correct SQL with pay_period_id and employee_id params', async () => {
    const db = mockDb(async () => ({ rows: [] }));
    await loadInputPackBag(PERIOD_ID, EMP_ID, db);
    expect(db.query).toHaveBeenCalledTimes(1);
    const [sql, params] = db.query.mock.calls[0];
    expect(String(sql)).toContain('pay_period_input_lines');
    expect(String(sql)).toContain('deleted_at IS NULL');
    expect(String(sql)).toContain('GROUP BY source_kind');
    expect(params).toEqual([PERIOD_ID, EMP_ID]);
  });

  it('aggregates rows correctly: each source_kind → parsed number', async () => {
    const db = mockDb(async () => ({
      rows: [
        { source_kind: 'kpi', total: '1500.50' },
        { source_kind: 'route_count', total: '42' },
        { source_kind: 'revenue', total: '3000' },
      ],
    }));
    const bag = await loadInputPackBag(PERIOD_ID, EMP_ID, db);
    expect(bag['kpi']).toBe(1500.5);
    expect(bag['route_count']).toBe(42);
    expect(bag['revenue']).toBe(3000);
  });

  it('BR-W10-03: skips payable_hours even if present as source_kind in input_lines', async () => {
    const db = mockDb(async () => ({
      rows: [
        { source_kind: 'payable_hours', total: '999' }, // must be skipped
        { source_kind: 'kpi', total: '500' },
      ],
    }));
    const bag = await loadInputPackBag(PERIOD_ID, EMP_ID, db);
    expect('payable_hours' in bag).toBe(false);
    expect(bag['kpi']).toBe(500);
  });

  it('BR-W10-03: skips all core ATT vars that collide as source_kind', async () => {
    const coreRows = PAY_FORMULA_REQUIRED_VAR_ALLOWLIST.map((key) => ({
      source_kind: key,
      total: '100',
    }));
    const db = mockDb(async () => ({ rows: coreRows }));
    const bag = await loadInputPackBag(PERIOD_ID, EMP_ID, db);
    for (const key of PAY_FORMULA_REQUIRED_VAR_ALLOWLIST) {
      expect(key in bag).toBe(false);
    }
    expect(Object.keys(bag)).toHaveLength(0);
  });

  it('returns empty bag when no input lines exist (U65-safe)', async () => {
    const db = mockDb(async () => ({ rows: [] }));
    const bag = await loadInputPackBag(PERIOD_ID, EMP_ID, db);
    expect(bag).toEqual({});
  });

  it('skips rows where total is not a finite number', async () => {
    const db = mockDb(async () => ({
      rows: [
        { source_kind: 'manual', total: 'NaN' },
        { source_kind: 'kpi', total: 'null' },
        { source_kind: 'revenue', total: '200' },
      ],
    }));
    const bag = await loadInputPackBag(PERIOD_ID, EMP_ID, db);
    expect('manual' in bag).toBe(false);
    expect('kpi' in bag).toBe(false);
    expect(bag['revenue']).toBe(200);
  });
});

// ---------------------------------------------------------------------------
// Section 3 — buildPayFormulaVariableBag merge order
// ---------------------------------------------------------------------------
describe('buildPayFormulaVariableBag', () => {
  const PERIOD_ID = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';
  const EMP_ID = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd';

  it('merge order: attBag wins over cbBag which wins over ipBag on conflict', async () => {
    const db = mockDb(async () => ({
      rows: [{ source_kind: 'kpi', total: '100' }],
    }));
    const cbBag = { kpi: 200, base_salary: 10000000 };
    const attBag = { payable_hours: 176, kpi: 300 }; // ATT also has kpi — must win

    const result = await buildPayFormulaVariableBag(PERIOD_ID, EMP_ID, cbBag, attBag, db);

    // ATT wins: kpi from attBag=300 beats cbBag=200 and ipBag=100
    expect(result['kpi']).toBe(300);
    // cbBag-only key passes through
    expect(result['base_salary']).toBe(10000000);
    // attBag-only key passes through
    expect(result['payable_hours']).toBe(176);
  });

  it('cbBag wins over ipBag when no attBag conflict', async () => {
    const db = mockDb(async () => ({
      rows: [{ source_kind: 'revenue', total: '50' }],
    }));
    const cbBag = { revenue: 999 }; // cbBag overrides ipBag
    const attBag = { payable_hours: 160 };

    const result = await buildPayFormulaVariableBag(PERIOD_ID, EMP_ID, cbBag, attBag, db);
    expect(result['revenue']).toBe(999);
    expect(result['payable_hours']).toBe(160);
  });

  it('ipBag values survive when neither cbBag nor attBag override them', async () => {
    const db = mockDb(async () => ({
      rows: [{ source_kind: 'manual', total: '750' }],
    }));
    const cbBag = { base_salary: 8000000 };
    const attBag = { payable_hours: 168 };

    const result = await buildPayFormulaVariableBag(PERIOD_ID, EMP_ID, cbBag, attBag, db);
    expect(result['manual']).toBe(750);
    expect(result['base_salary']).toBe(8000000);
    expect(result['payable_hours']).toBe(168);
  });

  it('BR-W10-03 enforced end-to-end: payable_hours in IP lines cannot override attBag value', async () => {
    const db = mockDb(async () => ({
      // Malicious or accidental IP line with source_kind = 'payable_hours'
      rows: [{ source_kind: 'payable_hours', total: '9999' }],
    }));
    const cbBag = {};
    const attBag = { payable_hours: 176 }; // correct ATT value

    const result = await buildPayFormulaVariableBag(PERIOD_ID, EMP_ID, cbBag, attBag, db);
    // IP line is skipped at loadInputPackBag level; attBag value wins
    expect(result['payable_hours']).toBe(176);
  });
});

// ---------------------------------------------------------------------------
// Section 4 — Regression: PAY_FORMULA_REQUIRED_VAR_ALLOWLIST integrity
// ---------------------------------------------------------------------------
describe('PAY_FORMULA_REQUIRED_VAR_ALLOWLIST regression', () => {
  it('contains payable_hours (BR-W10-03 anchor)', () => {
    expect(PAY_FORMULA_REQUIRED_VAR_ALLOWLIST).toContain('payable_hours');
  });

  it('contains base_salary', () => {
    expect(PAY_FORMULA_REQUIRED_VAR_ALLOWLIST).toContain('base_salary');
  });

  it('has at least 10 protected vars', () => {
    expect(PAY_FORMULA_REQUIRED_VAR_ALLOWLIST.length).toBeGreaterThanOrEqual(10);
  });

  it('PAY_FORMULA_INPUT_PACK_SOURCE_KINDS has 13 entries matching spec §2 taxonomy', () => {
    expect(PAY_FORMULA_INPUT_PACK_SOURCE_KINDS).toHaveLength(13);
    expect(PAY_FORMULA_INPUT_PACK_SOURCE_KINDS).toContain('route_count');
    expect(PAY_FORMULA_INPUT_PACK_SOURCE_KINDS).toContain('rd_transfer');
  });
});
