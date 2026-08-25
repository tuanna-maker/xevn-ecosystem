/**
 * @CODE-MEMORY
 * Screen:     unit — pay-formula-evaluator
 * UC:         AC-PAY-FORMULA-04 · staged subset
 * WorkItem:   PO-HRM-PAYROLL-FORMULA-RUN-GAP-BE-EVAL-01
 * Purpose:    Jest pure evaluate / classify — no DB
 */
import {
  applyProcessZeroDefaults,
  classifyPayFormulaExpression,
  collectExpressionVarKeys,
  evaluatePayFormulaExpression,
  missingVarKeys,
} from './pay-formula-evaluator';

describe('pay-formula-evaluator (BE-EVAL-01)', () => {
  it('classifies FE GĐ1 opaque form as not LIVE', () => {
    const expression = {
      form: 'gd1',
      ops: [{ op: 'opaque', text: 'base * hours' }],
    };
    const c = classifyPayFormulaExpression(expression);
    expect(c.kind).toBe('opaque_gd1');
    const r = evaluatePayFormulaExpression(expression, {});
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.reason).toBe('OPAQUE_NOT_EVALUABLE');
  });

  it('classifies payroll_aggregate_v1 sheet total override formulas', () => {
    const gross = classifyPayFormulaExpression({
      form: 'payroll_aggregate_v1',
      aggregate: 'gross',
      earning_component_codes: ['LUONG_THEO_CONG', 'THUONG_P4'],
    });
    expect(gross.kind).toBe('payroll_aggregate_v1');
    if (gross.kind === 'payroll_aggregate_v1') {
      expect(gross.aggregate).toBe('gross');
      expect(gross.earning_component_codes).toEqual(['luong_theo_cong', 'thuong_p4']);
    }
    const net = classifyPayFormulaExpression({
      form: 'payroll_aggregate_v1',
      aggregate: 'net',
    });
    expect(net.kind).toBe('payroll_aggregate_v1');
    if (net.kind === 'payroll_aggregate_v1') {
      expect(net.aggregate).toBe('net');
    }
  });

  it('rolls up gd1 gross from earning_component_codes whitelist (excludes LUONG_CO_BAN)', () => {
    const expression = {
      form: 'gd1_eval_v1',
      earning_component_codes: ['LUONG_THEO_CONG', 'THUONG_P4'],
      lines: [
        {
          component_code: 'LUONG_CO_BAN',
          sign: 'earning',
          source: 'const',
          amount: 8_600_000,
        },
        {
          component_code: 'LUONG_THEO_CONG',
          sign: 'earning',
          source: 'const',
          amount: 5_000_000,
        },
        {
          component_code: 'THUONG_P4',
          sign: 'earning',
          source: 'const',
          amount: 1_000_000,
        },
      ],
    };
    const r = evaluatePayFormulaExpression(expression, {});
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.gross).toBe(6_000_000);
    expect(r.net).toBe(6_000_000);
  });

  it('evaluates gd1_eval_v1 var + expr lines → gross/net', () => {
    const expression = {
      form: 'gd1_eval_v1',
      lines: [
        {
          component_code: 'BASE',
          sign: 'earning',
          source: 'var',
          var: 'base_salary',
        },
        {
          component_code: 'ALLOW_MEAL',
          sign: 'earning',
          source: 'const',
          amount: 500_000,
        },
        {
          component_code: 'DED_TAX',
          sign: 'deduction',
          source: 'expr',
          expr: { op: 'mul', left: 'base_salary', right: 0.1 },
        },
      ],
    };
    const r = evaluatePayFormulaExpression(expression, {
      base_salary: 10_000_000,
    });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.gross).toBe(10_500_000);
    expect(r.deduction).toBe(1_000_000);
    expect(r.net).toBe(9_500_000);
    expect(r.lines).toHaveLength(3);
    expect(r.warnings).toContain('STAGED_EVAL_SUBSET');
  });

  it('fails MISSING_VAR honestly — no silent zero', () => {
    const r = evaluatePayFormulaExpression(
      {
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
      {},
    );
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.reason).toBe('MISSING_VAR');
  });

  it('evaluates nested expr for LUONG_THEO_CONG (base * payable / standard)', () => {
    const expr = {
      form: 'gd1_eval_v1',
      lines: [
        {
          component_code: 'LUONG_THEO_CONG',
          sign: 'earning',
          source: 'expr',
          expr: {
            op: 'mul',
            left: 'base_salary',
            right: { op: 'div', left: 'payable_hours', right: 'standard_hours' },
          },
        },
      ],
    };
    const keys = collectExpressionVarKeys(expr);
    expect(keys.sort()).toEqual(
      ['base_salary', 'payable_hours', 'standard_hours'].sort(),
    );
    const r = evaluatePayFormulaExpression(expr, {
      base_salary: 5_700_000,
      payable_hours: 212,
      standard_hours: 196,
    });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.lines[0].amount).toBeCloseTo(6_165_306.12, 0);
  });

  it('collectExpressionVarKeys + missingVarKeys', () => {
    const exprOnly = collectExpressionVarKeys({
      form: 'gd1_eval_v1',
      lines: [
        {
          component_code: 'A',
          sign: 'earning',
          source: 'var',
          var: 'payable_hours',
        },
        {
          component_code: 'B',
          sign: 'earning',
          source: 'expr',
          expr: { op: 'mul', left: 'base_salary', right: 1 },
        },
      ],
    });
    expect(exprOnly.sort()).toEqual(['base_salary', 'payable_hours'].sort());

    const keys = collectExpressionVarKeys(
      {
        form: 'gd1_eval_v1',
        lines: [
          {
            component_code: 'A',
            sign: 'earning',
            source: 'var',
            var: 'payable_hours',
          },
          {
            component_code: 'B',
            sign: 'earning',
            source: 'expr',
            expr: { op: 'mul', left: 'base_salary', right: 1 },
          },
        ],
      },
      { keys: ['dependents_count'] },
    );
    expect(keys.sort()).toEqual(
      ['base_salary', 'dependents_count', 'payable_hours'].sort(),
    );
    expect(missingVarKeys(keys, { base_salary: 1 })).toEqual(
      expect.arrayContaining(['payable_hours', 'dependents_count']),
    );

    // Const line + stale required_vars → evaluate gate empty (W3 FORMULA-412 fix)
    expect(
      collectExpressionVarKeys({
        form: 'gd1_eval_v1',
        lines: [
          {
            component_code: 'BASE',
            sign: 'earning',
            source: 'const',
            amount: 7_500_000,
          },
        ],
      }),
    ).toEqual([]);
  });

  it('applyProcessZeroDefaults fills optional operands, not ATT/C&B keys', () => {
    const bag: Record<string, number> = { base_salary: 5_000_000 };
    const applied = applyProcessZeroDefaults(
      ['ot_150_hours', 'base_salary', 'payable_hours'],
      bag,
    );
    expect(applied).toEqual(['ot_150_hours']);
    expect(bag.ot_150_hours).toBe(0);
    expect(bag.payable_hours).toBeUndefined();
  });

  it('div by zero → DIV_BY_ZERO', () => {
    const r = evaluatePayFormulaExpression(
      {
        form: 'gd1_eval_v1',
        lines: [
          {
            component_code: 'X',
            sign: 'earning',
            source: 'expr',
            expr: { op: 'div', left: 10, right: 0 },
          },
        ],
      },
      {},
    );
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.reason).toBe('DIV_BY_ZERO');
  });

  it('evaluates hyperformula_v1 var + expressions', () => {
    const expr = {
      form: 'hyperformula_v1',
      lines: [
        {
          component_code: 'LUONG_CHINH',
          sign: 'earning',
          formula: '=base_salary * (payable_hours / 208)',
        },
        {
          component_code: 'PHU_CAP',
          sign: 'earning',
          formula: '=allowance_p2',
        },
        {
          component_code: 'BHXH',
          sign: 'deduction',
          formula: '=base_salary * 0.1',
        },
      ],
    };
    const vars = {
      base_salary: 20800000,
      payable_hours: 104, // Nửa tháng
      allowance_p2: 500000,
    };

    const res = evaluatePayFormulaExpression(expr, vars);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.lines).toHaveLength(3);
      expect(res.lines[0].amount).toBe(10400000); // 20.8M * 0.5
      expect(res.lines[1].amount).toBe(500000);
      expect(res.lines[2].amount).toBe(2080000);
      expect(res.gross).toBe(10900000);
      expect(res.deduction).toBe(2080000);
      expect(res.net).toBe(8820000);
    }
  });
});
