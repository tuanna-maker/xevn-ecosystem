/**
 * @CODE-MEMORY
 * Screen:     /payroll · tab Công thức lương — unit tests catalog
 * UC:         AC-PAY-FORMULA-01 · VAL-PAY-F-01/02 · staged gd1_eval_v1
 * WorkItem:   PO-HRM-PAYROLL-FORMULA-RUN-GAP-FE-EVAL-01
 * Purpose:    Vitest format/label/serializer helpers — không gọi API · không FE net calc.
 *
 * @CODE-MEMORY-CHANGE 2026-08-07
 * WorkItem: PO-HRM-PAYROLL-FORMULA-RUN-GAP-FE-EVAL-01
 * change_mode: ADD
 * What: Tests buildGd1EvalV1ExpressionJson / readGd1EvalV1Expression / overrides parse
 */
import { describe, expect, it } from 'vitest';
import {
  buildGd1EvalV1ExpressionJson,
  buildOpaqueExpressionJson,
  countSerializableGd1EvalLines,
  defaultGd1EvalLinesFromVars,
  emptyGd1EvalLineDraft,
  extractRequiredVarKeys,
  formatPayFormulaDisplay,
  formatPayFormulaMoneyVi,
  isAllowedPayFormulaRequiredVarKey,
  isPayFormulaDraftEditable,
  isPayFormulaImmutableStatus,
  isValidPayFormulaCodeFormat,
  normalizePayFormulaCode,
  normalizePayFormulaPreviewLines,
  parsePreviewVariableOverrides,
  payFormulaRequiredVarLabel,
  payFormulaStatusLabel,
  PAY_FORMULA_EVAL_FORM,
  PAYROLL_E2E_READY_HONESTY,
  readGd1EvalV1Expression,
  readOpaqueExpressionText,
  suggestComponentCodeFromVar,
  alignGd1EvalLinesToNestCatalog,
} from './payFormulaCatalog';

describe('payFormulaCatalog', () => {
  it('validates code format only (open catalog — not closed enum)', () => {
    expect(isValidPayFormulaCodeFormat('base_net_v1')).toBe(true);
    expect(isValidPayFormulaCodeFormat('qa_formula_msigd3e0')).toBe(true);
    expect(isValidPayFormulaCodeFormat('1bad')).toBe(false);
    expect(isValidPayFormulaCodeFormat('HasCaps')).toBe(false);
    expect(normalizePayFormulaCode(' Base Net ')).toBe('base_net');
  });

  it('labels status + required vars in vi-VN (no raw-key-only)', () => {
    expect(payFormulaStatusLabel('draft')).toBe('Bản nháp');
    expect(payFormulaStatusLabel('pending_publish')).toBe('Chờ phát hành');
    expect(payFormulaStatusLabel('active')).toBe('Đang hiệu lực');
    expect(payFormulaRequiredVarLabel('payable_hours')).toContain('Giờ công');
    expect(payFormulaRequiredVarLabel('allowance_meal')).toContain('Phụ cấp');
    expect(formatPayFormulaDisplay('base_net', 'Lương cơ bản', 2)).toBe(
      'Lương cơ bản (base_net) · v2',
    );
  });

  it('accepts DV-18 starter + open allowance_* ; rejects leave/ot invent keys', () => {
    expect(isAllowedPayFormulaRequiredVarKey('base_salary')).toBe(true);
    expect(isAllowedPayFormulaRequiredVarKey('allowance_shift_night')).toBe(true);
    expect(isAllowedPayFormulaRequiredVarKey('leave_request_id')).toBe(false);
  });

  it('extracts required var keys + builds opaque expression (legacy — no FE net calc)', () => {
    expect(extractRequiredVarKeys({ keys: ['payable_hours', 'base_salary'] })).toEqual([
      'payable_hours',
      'base_salary',
    ]);
    const expr = buildOpaqueExpressionJson({ note: 'GĐ1', expressionText: 'base + hours' });
    expect(expr.form).toBe('gd1');
    expect(Array.isArray(expr.ops)).toBe(true);
    const round = readOpaqueExpressionText(expr);
    expect(round.expressionText).toBe('base + hours');
  });

  it('draft editable vs immutable active/pending; honesty lock false', () => {
    expect(isPayFormulaDraftEditable('draft')).toBe(true);
    expect(isPayFormulaImmutableStatus('active')).toBe(true);
    expect(isPayFormulaImmutableStatus('pending_publish')).toBe(true);
    expect(PAYROLL_E2E_READY_HONESTY).toBe(false);
  });

  it('serializes form lines → gd1_eval_v1 (documented subset — no FE evaluate)', () => {
    const lines = [
      emptyGd1EvalLineDraft({
        component_code: 'BASE',
        sign: 'earning',
        source: 'var',
        var: 'base_salary',
      }),
      emptyGd1EvalLineDraft({
        component_code: 'DED_TAX',
        sign: 'deduction',
        source: 'expr',
        exprOp: 'mul',
        exprLeft: 'base_salary',
        exprRight: '0.1',
      }),
      emptyGd1EvalLineDraft({
        component_code: 'ALLOW_MEAL',
        sign: 'earning',
        source: 'const',
        amount: '500000',
      }),
      emptyGd1EvalLineDraft({
        component_code: '',
        sign: 'earning',
        source: 'var',
        var: 'base_salary',
      }),
    ];
    const json = buildGd1EvalV1ExpressionJson({ note: 'Staged GĐ1', lines });
    expect(json.form).toBe(PAY_FORMULA_EVAL_FORM);
    expect(json.form).toBe('gd1_eval_v1');
    expect(json.note).toBe('Staged GĐ1');
    expect(json.staged).toBe(true);
    const outLines = json.lines as Record<string, unknown>[];
    expect(outLines).toHaveLength(3);
    expect(outLines[0]).toEqual({
      component_code: 'BASE',
      sign: 'earning',
      source: 'var',
      var: 'base_salary',
    });
    expect(outLines[1]).toEqual({
      component_code: 'DED_TAX',
      sign: 'deduction',
      source: 'expr',
      expr: { op: 'mul', left: 'base_salary', right: 0.1 },
    });
    expect(outLines[2]).toEqual({
      component_code: 'ALLOW_MEAL',
      sign: 'earning',
      source: 'const',
      amount: 500000,
    });
    expect(countSerializableGd1EvalLines(lines)).toBe(3);
  });

  it('round-trips gd1_eval_v1 read; legacy opaque → isEvalV1=false', () => {
    const built = buildGd1EvalV1ExpressionJson({
      note: 'n1',
      lines: [
        emptyGd1EvalLineDraft({
          component_code: 'BASE',
          sign: 'earning',
          source: 'var',
          var: 'base_salary',
        }),
      ],
    });
    const round = readGd1EvalV1Expression(built);
    expect(round.isEvalV1).toBe(true);
    expect(round.note).toBe('n1');
    expect(round.lines).toHaveLength(1);
    expect(round.lines[0]?.component_code).toBe('BASE');
    expect(round.lines[0]?.var).toBe('base_salary');

    const opaque = readGd1EvalV1Expression(
      buildOpaqueExpressionJson({ note: 'old', expressionText: 'x*y' }),
    );
    expect(opaque.isEvalV1).toBe(false);
    expect(opaque.opaqueExpressionText).toBe('x*y');
    expect(opaque.lines).toHaveLength(0);
  });

  it('defaults money var lines + parses preview overrides (no FE net)', () => {
    expect(suggestComponentCodeFromVar('base_salary')).toBe('BASE');
    expect(suggestComponentCodeFromVar('allowance_meal')).toBe('ALLOW_MEAL');
    const defaults = defaultGd1EvalLinesFromVars(['payable_hours', 'base_salary']);
    expect(defaults.some((l) => l.var === 'base_salary')).toBe(true);
    expect(defaults.every((l) => l.source === 'var')).toBe(true);
    const overrides = parsePreviewVariableOverrides({
      base_salary: '8,000,000',
      payable_hours: '176',
      junk: '',
    });
    expect(overrides).toEqual({ base_salary: 8_000_000, payable_hours: 176 });
    expect(formatPayFormulaMoneyVi(8_000_000)).toContain('8');
    expect(formatPayFormulaMoneyVi(null)).toBe('—');
  });

  it('normalizes preview lines from BE (display-only — no FE net)', () => {
    const rows = normalizePayFormulaPreviewLines([
      { componentCode: 'BASE', amountVnd: 8_000_000, sign: 'earning' },
      { component_code: 'DED_TAX', amount: 800_000, sign: 'deduction' },
      { junk: true },
    ]);
    expect(rows).toHaveLength(2);
    expect(rows[0]?.componentCode).toBe('BASE');
    expect(rows[0]?.amountVnd).toBe(8_000_000);
    expect(rows[1]?.componentCode).toBe('DED_TAX');
    expect(rows[1]?.sign).toBe('deduction');
  });

  it('alignGd1EvalLinesToNestCatalog maps BASE gợi ý → Nest code (AC-PAY-COMP-01)', () => {
    const opts = [{ value: 'luong_cb', label: 'Lương CB', code: 'luong_cb' }];
    const lines = defaultGd1EvalLinesFromVars(['base_salary']);
    expect(lines[0]?.component_code).toBe('BASE');
    const aligned = alignGd1EvalLinesToNestCatalog(lines, opts);
    expect(aligned[0]?.component_code).toBe('luong_cb');
  });
});
