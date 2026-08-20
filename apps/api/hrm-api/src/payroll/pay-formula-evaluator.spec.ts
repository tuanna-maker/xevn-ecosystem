/**
 * @CODE-MEMORY
 * Screen:     unit — pay-formula-evaluator
 * UC:         AC-PAY-FORMULA-04 · staged subset
 * WorkItem:   PO-HRM-PAYROLL-FORMULA-RUN-GAP-BE-EVAL-01
 * Purpose:    Jest pure evaluate / classify — no DB
 */
import {
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
});
