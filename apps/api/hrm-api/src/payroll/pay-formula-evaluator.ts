/**
 * @CODE-MEMORY
 * Screen:     HRM → Công thức lương (staged evaluator)
 * UC:         FR-UC-BP-PAY-02 · AC-PAY-FORMULA-04 · AC-PAY-RUN-06/07/09
 * BR:         Q-PAY-F-3 closed-sheet vars · AMIS SRC Emp→Period→Template→Catalog (cite only)
 * SRS:        docs/program/specs/PO-HRM-PAYROLL-FORMULA-RUN-GAP-API-01.md §4.4 · §5 · §7
 * TechSpec:   ADR-HRM-4-PILLAR-API-BOUNDARY.md §10 · DATA-01 G-PAY-F-06/07
 * DB_DESIGN:  expression_json opaque + documented subset gd1_eval_v1
 * API_DESIGN: F-PAY-FORMULA-PREVIEW-01 · F-PAY-PROCESS-01 bind
 * Purpose:    Staged pure evaluator — gd1_eval_v1 lines; opaque GĐ1 form = not LIVE.
 * WorkItem:   PO-HRM-PAYROLL-FORMULA-RUN-GAP-BE-EVAL-01
 * Coded:      2026-08-07
 * Callers:    pay-formula.service preview · payroll.service process
 * Callees:    (pure) — không I/O · không salary_components.formula
 * must_keep:  cấm fake LIVE từ opaque text · payroll_e2e_ready=false
 * SOLID:      Pure function SRP — parse/eval tách khỏi Nest service
 * LastVerified: pay-formula-evaluator.spec.ts
 *
 * @CODE-MEMORY-CHANGE 2026-08-07
 * WorkItem: PO-HRM-PAYROLL-FORMULA-RUN-GAP-BE-EVAL-01
 * change_mode: ADD
 * What: Documented subset gd1_eval_v1 + classify opaque FE form
 * must_keep: ATT hours fidelity blocked until att_timesheet_line
 */

/** Documented staged subset — NOT a full AST taxonomy invent. */
export const PAY_FORMULA_EVAL_FORM = 'gd1_eval_v1' as const;

export const PAY_FORMULA_ATT_HOUR_VARS = [
  'payable_hours',
  'standard_hours',
  'ot_hours_weighted',
  'paid_leave_hours',
  'unpaid_leave_hours',
] as const;

export type PayFormulaEvalSign = 'earning' | 'deduction';

export type PayFormulaEvalLineInput = {
  component_code: string;
  sign: PayFormulaEvalSign;
  source: 'var' | 'const' | 'expr';
  var?: string;
  amount?: number;
  expr?: {
    op: 'add' | 'sub' | 'mul' | 'div';
    left: number | string;
    right: number | string;
  };
};

export type PayFormulaEvalResultLine = {
  component_code: string;
  sign: PayFormulaEvalSign;
  amount: number;
  source_ref: string;
  sort_order: number;
};

export type PayFormulaEvalOk = {
  ok: true;
  form: typeof PAY_FORMULA_EVAL_FORM;
  lines: PayFormulaEvalResultLine[];
  gross: number;
  deduction: number;
  net: number;
  warnings: string[];
};

export type PayFormulaEvalFail = {
  ok: false;
  reason:
    | 'OPAQUE_NOT_EVALUABLE'
    | 'UNSUPPORTED_FORM'
    | 'EMPTY_LINES'
    | 'INVALID_LINE'
    | 'MISSING_VAR'
    | 'DIV_BY_ZERO';
  message: string;
  warnings: string[];
};

export type PayFormulaEvalResult = PayFormulaEvalOk | PayFormulaEvalFail;

export function isAttHoursVarKey(key: string): boolean {
  return (PAY_FORMULA_ATT_HOUR_VARS as readonly string[]).includes(key.trim());
}

/**
 * Classify expression_json without inventing full AST.
 * - gd1_eval_v1 + lines[] → evaluable subset
 * - FE GĐ1 opaque (`form: gd1` / ops opaque|noop) → not LIVE
 */
export function classifyPayFormulaExpression(expressionJson: unknown): {
  kind: 'gd1_eval_v1' | 'opaque_gd1' | 'unknown';
  lines: PayFormulaEvalLineInput[];
  warnings: string[];
} {
  const warnings: string[] = [];
  if (
    !expressionJson ||
    typeof expressionJson !== 'object' ||
    Array.isArray(expressionJson)
  ) {
    return { kind: 'unknown', lines: [], warnings: ['EXPRESSION_NOT_OBJECT'] };
  }
  const obj = expressionJson as Record<string, unknown>;
  const form =
    typeof obj.form === 'string' ? obj.form.trim().toLowerCase() : '';

  if (form === PAY_FORMULA_EVAL_FORM) {
    const rawLines = Array.isArray(obj.lines) ? obj.lines : [];
    const lines: PayFormulaEvalLineInput[] = [];
    for (const raw of rawLines) {
      if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
        warnings.push('SKIP_INVALID_LINE_SHAPE');
        continue;
      }
      const row = raw as Record<string, unknown>;
      const component_code = String(
        row.component_code ?? row.componentCode ?? '',
      ).trim();
      const signRaw = String(row.sign ?? 'earning')
        .trim()
        .toLowerCase();
      const sign: PayFormulaEvalSign =
        signRaw === 'deduction' ? 'deduction' : 'earning';
      const sourceRaw = String(row.source ?? '')
        .trim()
        .toLowerCase();
      if (!component_code || !['var', 'const', 'expr'].includes(sourceRaw)) {
        warnings.push('SKIP_INVALID_LINE_FIELDS');
        continue;
      }
      const source = sourceRaw as PayFormulaEvalLineInput['source'];
      lines.push({
        component_code,
        sign,
        source,
        var: typeof row.var === 'string' ? row.var.trim() : undefined,
        amount:
          typeof row.amount === 'number' ? row.amount : Number(row.amount),
        expr:
          row.expr && typeof row.expr === 'object' && !Array.isArray(row.expr)
            ? (row.expr as PayFormulaEvalLineInput['expr'])
            : undefined,
      });
    }
    return { kind: 'gd1_eval_v1', lines, warnings };
  }

  const ops = Array.isArray(obj.ops) ? obj.ops : [];
  const looksOpaque =
    form === 'gd1' ||
    ops.some((op) => {
      if (!op || typeof op !== 'object' || Array.isArray(op)) return false;
      const k = String((op as Record<string, unknown>).op ?? '').toLowerCase();
      return k === 'opaque' || k === 'noop';
    });
  if (looksOpaque) {
    return {
      kind: 'opaque_gd1',
      lines: [],
      warnings: ['OPAQUE_GD1_FORM', 'EVALUATOR_SUBSET_REQUIRED'],
    };
  }

  return {
    kind: 'unknown',
    lines: [],
    warnings: ['UNSUPPORTED_EXPRESSION_FORM'],
  };
}

function resolveOperand(
  value: number | string,
  vars: Record<string, number>,
): { ok: true; value: number } | { ok: false; key: string } {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return { ok: true, value };
  }
  const key = String(value).trim();
  if (!(key in vars) || !Number.isFinite(vars[key])) {
    return { ok: false, key };
  }
  return { ok: true, value: vars[key] };
}

function roundMoney(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

/**
 * Evaluate documented subset against a numeric variable bag.
 * Does NOT invent amounts for opaque FE text.
 */
export function evaluatePayFormulaExpression(
  expressionJson: unknown,
  vars: Record<string, number>,
): PayFormulaEvalResult {
  const classified = classifyPayFormulaExpression(expressionJson);
  if (classified.kind === 'opaque_gd1') {
    return {
      ok: false,
      reason: 'OPAQUE_NOT_EVALUABLE',
      message:
        'GĐ1 opaque expression_json is not LIVE-evaluable — use gd1_eval_v1 lines subset',
      warnings: classified.warnings,
    };
  }
  if (classified.kind !== 'gd1_eval_v1') {
    return {
      ok: false,
      reason: 'UNSUPPORTED_FORM',
      message:
        'expression_json form not in staged evaluator subset (gd1_eval_v1)',
      warnings: classified.warnings,
    };
  }
  if (classified.lines.length === 0) {
    return {
      ok: false,
      reason: 'EMPTY_LINES',
      message: 'gd1_eval_v1 requires non-empty lines[]',
      warnings: classified.warnings,
    };
  }

  const out: PayFormulaEvalResultLine[] = [];
  const warnings = [...classified.warnings];
  let gross = 0;
  let deduction = 0;
  let sort = 0;

  for (const line of classified.lines) {
    let amount = 0;
    let sourceRef = '';
    if (line.source === 'var') {
      const key = String(line.var ?? '').trim();
      if (!key || !(key in vars) || !Number.isFinite(vars[key])) {
        return {
          ok: false,
          reason: 'MISSING_VAR',
          message: `Missing variable for line ${line.component_code}: ${key || '(empty)'}`,
          warnings,
        };
      }
      amount = vars[key];
      sourceRef = `var:${key}`;
    } else if (line.source === 'const') {
      if (!Number.isFinite(line.amount)) {
        return {
          ok: false,
          reason: 'INVALID_LINE',
          message: `Invalid const amount for ${line.component_code}`,
          warnings,
        };
      }
      amount = Number(line.amount);
      sourceRef = 'const';
    } else if (line.source === 'expr') {
      const expr = line.expr;
      if (!expr || !['add', 'sub', 'mul', 'div'].includes(expr.op)) {
        return {
          ok: false,
          reason: 'INVALID_LINE',
          message: `Invalid expr for ${line.component_code}`,
          warnings,
        };
      }
      const left = resolveOperand(expr.left, vars);
      const right = resolveOperand(expr.right, vars);
      if (!left.ok) {
        return {
          ok: false,
          reason: 'MISSING_VAR',
          message: `Missing expr left var ${left.key}`,
          warnings,
        };
      }
      if (!right.ok) {
        return {
          ok: false,
          reason: 'MISSING_VAR',
          message: `Missing expr right var ${right.key}`,
          warnings,
        };
      }
      if (expr.op === 'add') amount = left.value + right.value;
      else if (expr.op === 'sub') amount = left.value - right.value;
      else if (expr.op === 'mul') amount = left.value * right.value;
      else {
        if (right.value === 0) {
          return {
            ok: false,
            reason: 'DIV_BY_ZERO',
            message: `Division by zero on ${line.component_code}`,
            warnings,
          };
        }
        amount = left.value / right.value;
      }
      sourceRef = `expr:${expr.op}`;
    } else {
      return {
        ok: false,
        reason: 'INVALID_LINE',
        message: `Unknown source on ${line.component_code}`,
        warnings,
      };
    }

    amount = roundMoney(amount);
    if (line.sign === 'deduction') {
      deduction = roundMoney(deduction + amount);
    } else {
      gross = roundMoney(gross + amount);
    }
    out.push({
      component_code: line.component_code,
      sign: line.sign,
      amount,
      source_ref: sourceRef,
      sort_order: sort++,
    });
  }

  return {
    ok: true,
    form: PAY_FORMULA_EVAL_FORM,
    lines: out,
    gross,
    deduction,
    net: roundMoney(gross - deduction),
    warnings: [...warnings, 'STAGED_EVAL_SUBSET', 'PAYROLL_E2E_READY_FALSE'],
  };
}

/**
 * Collect var keys.
 * - expressionJson alone → keys referenced by gd1_eval_v1 var/expr lines (evaluate hard-gate).
 * - optional requiredVarsJson → union declared publish keys (metadata / soft-warn).
 * Evaluate path must pass expression only; stale required_vars must not invent missingVars.
 */
export function collectExpressionVarKeys(
  expressionJson: unknown,
  requiredVarsJson?: unknown,
): string[] {
  const keys = new Set<string>();
  if (expressionJson != null) {
    const classified = classifyPayFormulaExpression(expressionJson);
    for (const line of classified.lines) {
      if (line.source === 'var' && line.var) keys.add(line.var);
      if (line.source === 'expr' && line.expr) {
        if (typeof line.expr.left === 'string') keys.add(line.expr.left.trim());
        if (typeof line.expr.right === 'string')
          keys.add(line.expr.right.trim());
      }
    }
  }
  if (requiredVarsJson != null) {
    if (Array.isArray(requiredVarsJson)) {
      for (const k of requiredVarsJson) {
        const s = String(k).trim();
        if (s) keys.add(s);
      }
    } else if (typeof requiredVarsJson === 'object') {
      const obj = requiredVarsJson as Record<string, unknown>;
      if (Array.isArray(obj.keys)) {
        for (const k of obj.keys) {
          const s = String(k).trim();
          if (s) keys.add(s);
        }
      }
    }
  }
  return [...keys];
}

export function missingVarKeys(
  needed: string[],
  bag: Record<string, number>,
): string[] {
  return needed.filter((k) => !(k in bag) || !Number.isFinite(bag[k]));
}
