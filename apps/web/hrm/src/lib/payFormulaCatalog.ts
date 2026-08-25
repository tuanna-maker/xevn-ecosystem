/**
 * @CODE-MEMORY
 * Screen:     /payroll · tab Công thức lương (GĐ1 form)
 * UC:         FR-UC-BP-PAY-02 · AC-PAY-FORMULA-01..05
 * BR:         Option A dual-control · DV-18 required_vars · R-PAY-DD-01 Form GĐ1 — cấm DnD
 * SRS:        docs/program/specs/PO-HRM-PAYROLL-FORMULA-RUN-GAP-API-01.md §4 · §7
 * TechSpec:   ADR-HRM-4-PILLAR-API-BOUNDARY.md §10 Option A
 * API_DESIGN: F-PAY-FORMULA-AUTHOR/PUBLISH/LIST/PREVIEW
 * DB_DESIGN:  docs/qa/evidence/po-hrm-payroll-formula-run-gap-data-01.md §2.1
 * Purpose:    Helper nhãn vi-VN + validate mã/format + parse required_vars — không FE evaluate net.
 * WorkItem:   PO-HRM-PAYROLL-FORMULA-RUN-GAP-FE-01
 * Coded:      2026-08-07
 * Callers:    PayFormulaAuthorPanel · payFormulaCatalog.test
 * Callees:    (pure) — không gọi API / không tính lương
 * FEActions:  nhập code → isValidPayFormulaCodeFormat; chọn biến DV-18 → keys
 * must_keep:  payroll_e2e_ready=false · cấm FE engine · cấm salary_components.formula SoT · cấm DnD
 * SOLID:      Constants/helpers SRP — UI bind display-ready từ BE
 * solid_convention_ack: FE chỉ format + nhãn + serialize expressionJson; net/gross chỉ từ BE preview
 * LastVerified: docs/qa/evidence/po-hrm-payroll-formula-run-gap-fe-eval-01.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-07
 * WorkItem: PO-HRM-PAYROLL-FORMULA-RUN-GAP-FE-EVAL-01
 * change_mode: ADD
 * What: Serialize form lines → expression_json dialect gd1_eval_v1 (documented subset); reverse-read; keep opaque helper legacy
 * must_keep: không FE evaluate / net calc · payroll_e2e_ready=false
 *
 * @CODE-MEMORY-CHANGE 2026-08-10 PO-HRM-MVP-GD1-PAY-02-CLUSTER-FE-BROWSER-01
 * change_mode: ADD
 * What: alignGd1EvalLinesToNestCatalog — seed/save AC-PAY-COMP-01 khi Nest >0 (BASE gợi ý → mã catalog thật)
 * Why: QA J-HRM-PAY-02-02 browser — assertComp01 chặn POST khi mã gợi ý ∉ Nest
 * must_keep: payroll_e2e_ready=false · COMP-01 hard block vẫn chặn mã lạ thủ công
 *
 * @CODE-MEMORY-CHANGE 2026-08-10
 * WorkItem: PO-HRM-MVP-GD1-PAY-02-CLUSTER-FE-01
 * change_mode: ADD
 * What: normalizePayFormulaPreviewLines — display-only bind BE lines[] (componentCode + amountVnd)
 * must_keep: cấm FE net calc · payroll_e2e_ready=false
 */

import type { CatalogPickerOption } from '@/lib/catalogSearchPicker';
import { PAY_DATA_FIELD_CATALOG, payDataFieldLabel, type PayFormulaPickerSearchOpts } from '@/lib/payDataFieldCatalog';
import {
  isCodeInNestSalaryCatalog,
  type NestSalaryComponentLike,
} from '@/lib/salaryComponentCatalog';

/** Format-only — khớp BE PAY_FORMULA_CODE_FORMAT; KHÔNG phải danh sách đóng code. */
export const PAY_FORMULA_CODE_FORMAT = /^[a-z][a-z0-9_]{1,62}$/;

export const PAY_FORMULA_STATUSES = [
  'draft',
  'pending_publish',
  'active',
  'retired',
] as const;
export type PayFormulaStatus = (typeof PAY_FORMULA_STATUSES)[number];

/** DV-18 allow-list (starter) — open allowance_* vẫn hợp lệ qua regex. */
export const PAY_FORMULA_REQUIRED_VAR_STARTER = [
  'payable_hours',
  'standard_hours',
  'ot_hours_weighted',
  'paid_leave_hours',
  'unpaid_leave_hours',
  'base_salary',
  'dependents_count',
] as const;

export const PAY_FORMULA_ALLOWANCE_VAR_RE = /^allowance_[a-z0-9_]{1,48}$/;

export const PAY_FORMULA_STATUS_LABELS: Record<PayFormulaStatus, string> = {
  draft: 'Bản nháp',
  pending_publish: 'Chờ phát hành',
  active: 'Đang hiệu lực',
  retired: 'Đã ngừng',
};

export const PAY_FORMULA_REQUIRED_VAR_LABELS: Record<string, string> = {
  payable_hours: 'Giờ công hưởng lương',
  standard_hours: 'Giờ chuẩn kỳ',
  ot_hours_weighted: 'Giờ OT (đã quy đổi)',
  paid_leave_hours: 'Giờ nghỉ hưởng lương',
  unpaid_leave_hours: 'Giờ nghỉ không lương',
  base_salary: 'Lương cơ bản',
  dependents_count: 'Số người phụ thuộc',
};

/** Honesty lock — FE không được flip / claim LIVE. */
export const PAYROLL_E2E_READY_HONESTY = false as const;

export function isValidPayFormulaCodeFormat(code: string): boolean {
  return PAY_FORMULA_CODE_FORMAT.test(code.trim());
}

export function normalizePayFormulaCode(raw: string): string {
  return raw.trim().toLowerCase().replace(/\s+/g, '_');
}

export function isAllowedPayFormulaRequiredVarKey(key: string): boolean {
  const k = key.trim();
  if (!k) return false;
  if ((PAY_FORMULA_REQUIRED_VAR_STARTER as readonly string[]).includes(k)) return true;
  return PAY_FORMULA_ALLOWANCE_VAR_RE.test(k);
}

export function payFormulaStatusLabel(status: string | null | undefined): string {
  const s = String(status ?? '').trim().toLowerCase();
  if ((PAY_FORMULA_STATUSES as readonly string[]).includes(s)) {
    return PAY_FORMULA_STATUS_LABELS[s as PayFormulaStatus];
  }
  return status?.trim() ? String(status) : '—';
}

export function payFormulaRequiredVarLabel(
  key: string,
  opts?: { componentVarLabels?: ReadonlyMap<string, string> },
): string {
  const k = key.trim();
  if (!k) return '—';
  const fromComponent = opts?.componentVarLabels?.get(k);
  if (fromComponent) return fromComponent;
  const fromCatalog = payDataFieldLabel(k);
  if (fromCatalog !== k) return fromCatalog;
  if (PAY_FORMULA_REQUIRED_VAR_LABELS[k]) return PAY_FORMULA_REQUIRED_VAR_LABELS[k];
  if (PAY_FORMULA_ALLOWANCE_VAR_RE.test(k)) {
    return `Phụ cấp (${k.replace(/^allowance_/, '')})`;
  }
  return k;
}

export function buildSalaryComponentVarLabelMap(
  components: readonly NestSalaryComponentLike[],
): Map<string, string> {
  const map = new Map<string, string>();
  for (const row of components) {
    const name = String(row.name ?? '').trim();
    const code = String(row.code ?? '').trim().toLowerCase();
    if (code && name) {
      map.set(code, name);
    }
  }
  return map;
}

/** Gợi ý biến cho PayDataFieldFormulaInput — merge catalog + map từ DB salary_components. */
export function salaryComponentVarHintsForFormulaInput(
  components: readonly NestSalaryComponentLike[],
): { code: string; name: string }[] {
  return [...buildSalaryComponentVarLabelMap(components).entries()].map(([code, name]) => ({
    code,
    name,
  }));
}

/** Token chèn vào công thức TP khi user chọn theo tên thành phần lương. */
export function resolveSalaryComponentFormulaInsertToken(
  row: NestSalaryComponentLike,
): string {
  const code = String(row.code ?? '').trim().toLowerCase();
  if (code) return code;
  const formula = String((row as { formula?: string }).formula ?? '').trim();
  if (formula.startsWith('=')) {
    const body = formula.slice(1).trim();
    const singleVar = body.match(/^([a-z][a-z0-9_]*)$/i);
    if (singleVar) return singleVar[1].toLowerCase();
  }
  return '';
}

/** Thành phần lương Nest — tìm theo tên/mã trong picker công thức. */
export function salaryComponentPickerHintsForFormulaInput(
  components: readonly NestSalaryComponentLike[],
): { componentCode: string; insertToken: string; name: string; formula?: string }[] {
  return components
    .map((row) => {
      const componentCode = String(row.code ?? '').trim();
      if (!componentCode) return null;
      const name = String(row.name ?? '').trim() || componentCode;
      const formula = String((row as { formula?: string }).formula ?? '').trim();
      const insertToken = resolveSalaryComponentFormulaInsertToken(row);
      return {
        componentCode,
        insertToken,
        name,
        formula: formula || undefined,
      };
    })
    .filter((row): row is NonNullable<typeof row> => Boolean(row?.insertToken));
}

/** Gộp extraVarHints + salaryComponents cho PayDataFieldFormulaInput. */
export function payFormulaPickerSearchOptsFromSalaryComponents(
  components: readonly NestSalaryComponentLike[],
): {
  extraVarHints: { code: string; name: string }[];
  salaryComponents: { componentCode: string; insertToken: string; name: string; formula?: string }[];
} {
  return {
    extraVarHints: salaryComponentVarHintsForFormulaInput(components),
    salaryComponents: salaryComponentPickerHintsForFormulaInput(components),
  };
}
export function formatPayFormulaDisplay(
  code: string,
  label: string | null | undefined,
  version?: number | null,
): string {
  const c = code.trim() || '—';
  const l = (label ?? '').trim();
  const ver = version != null && Number.isFinite(Number(version)) ? ` · v${Number(version)}` : '';
  if (l) return `${l} (${c})${ver}`;
  return `${c}${ver}`;
}

export function extractRequiredVarKeys(
  requiredVarsJson: unknown,
): string[] {
  if (requiredVarsJson == null) return [];
  if (Array.isArray(requiredVarsJson)) {
    return [...new Set(requiredVarsJson.map((k) => String(k).trim()).filter(Boolean))];
  }
  if (typeof requiredVarsJson === 'object') {
    const obj = requiredVarsJson as Record<string, unknown>;
    if (Array.isArray(obj.keys)) {
      return [...new Set(obj.keys.map((k) => String(k).trim()).filter(Boolean))];
    }
    return Object.keys(obj)
      .filter((k) => k !== 'keys')
      .map((k) => k.trim())
      .filter(Boolean);
  }
  return [];
}

/** Documented staged subset — khớp BE `PAY_FORMULA_EVAL_FORM` (không invent AST). */
export const PAY_FORMULA_EVAL_FORM = 'gd1_eval_v1' as const;

export const PAY_FORMULA_EVAL_SIGNS = ['earning', 'deduction'] as const;
export type Gd1EvalSign = (typeof PAY_FORMULA_EVAL_SIGNS)[number];

export const PAY_FORMULA_EVAL_SOURCES = ['var', 'const', 'expr'] as const;
export type Gd1EvalSource = (typeof PAY_FORMULA_EVAL_SOURCES)[number];

export const PAY_FORMULA_EVAL_OPS = ['add', 'sub', 'mul', 'div'] as const;
export type Gd1EvalOp = (typeof PAY_FORMULA_EVAL_OPS)[number];

export const PAY_FORMULA_EVAL_SIGN_LABELS: Record<Gd1EvalSign, string> = {
  earning: 'Thu nhập',
  deduction: 'Khấu trừ',
};

export const PAY_FORMULA_EVAL_SOURCE_LABELS: Record<Gd1EvalSource, string> = {
  var: 'Biến (var)',
  const: 'Hằng số',
  expr: 'Biểu thức 2 ngôi',
};

export const PAY_FORMULA_EVAL_OP_LABELS: Record<Gd1EvalOp, string> = {
  add: 'Cộng (+)',
  sub: 'Trừ (−)',
  mul: 'Nhân (×)',
  div: 'Chia (÷)',
};

/** Draft line trên form — serialize sang BE; FE không tính amount. */
export type Gd1EvalLineDraft = {
  id: string;
  component_code: string;
  sign: Gd1EvalSign;
  source: Gd1EvalSource;
  var: string;
  amount: string;
  exprOp: Gd1EvalOp;
  exprLeft: string;
  exprRight: string;
};

let gd1LineSeq = 0;
export function newGd1EvalLineId(): string {
  gd1LineSeq += 1;
  return `gd1-line-${gd1LineSeq}-${Date.now().toString(36)}`;
}

export function emptyGd1EvalLineDraft(
  partial?: Partial<Omit<Gd1EvalLineDraft, 'id'>> & { id?: string },
): Gd1EvalLineDraft {
  return {
    id: partial?.id ?? newGd1EvalLineId(),
    component_code: partial?.component_code ?? '',
    sign: partial?.sign ?? 'earning',
    source: partial?.source ?? 'var',
    var: partial?.var ?? '',
    amount: partial?.amount ?? '',
    exprOp: partial?.exprOp ?? 'mul',
    exprLeft: partial?.exprLeft ?? '',
    exprRight: partial?.exprRight ?? '',
  };
}

/** Map DV-18 key → component_code gợi ý (không đóng catalog). */
export function suggestComponentCodeFromVar(key: string): string {
  const k = key.trim().toLowerCase();
  if (!k) return 'LINE';
  if (k === 'base_salary') return 'BASE';
  if (k.startsWith('allowance_')) {
    return `ALLOW_${k.slice('allowance_'.length).toUpperCase()}`.slice(0, 48);
  }
  return k.toUpperCase().replace(/[^A-Z0-9_]/g, '_').slice(0, 48);
}

/**
 * Gợi ý dòng var từ required_vars — chỉ serialize shape; không tính net.
 * Ưu tiên biến tiền (base_salary / allowance_*); giờ công thường dùng trong expr.
 */
export function defaultGd1EvalLinesFromVars(requiredKeys: string[]): Gd1EvalLineDraft[] {
  const keys = [...new Set(requiredKeys.map((k) => k.trim()).filter(Boolean))];
  const moneyKeys = keys.filter(
    (k) => k === 'base_salary' || PAY_FORMULA_ALLOWANCE_VAR_RE.test(k),
  );
  const seed = moneyKeys.length > 0 ? moneyKeys : keys.slice(0, 1);
  if (seed.length === 0) {
    return [
      emptyGd1EvalLineDraft({
        component_code: 'BASE',
        sign: 'earning',
        source: 'var',
        var: 'base_salary',
      }),
    ];
  }
  return seed.map((k) =>
    emptyGd1EvalLineDraft({
      component_code: suggestComponentCodeFromVar(k),
      sign: 'earning',
      source: 'var',
      var: k,
    }),
  );
}

/**
 * Khi Nest catalog >0 — map mã gợi ý (vd. BASE) sang code thật trong picker (AC-PAY-COMP-01).
 * Không invent mã mới; chỉ chọn từ options Nest.
 */
export function alignGd1EvalLinesToNestCatalog(
  lines: Gd1EvalLineDraft[],
  options: readonly CatalogPickerOption[],
): Gd1EvalLineDraft[] {
  if (options.length === 0) return lines;
  return lines.map((line, idx) => {
    const code = line.component_code.trim();
    if (isCodeInNestSalaryCatalog(options, code)) return line;
    const suggested = suggestComponentCodeFromVar(line.var || code);
    const bySuggest = options.find(
      (o) => o.value === suggested || (o.code ?? '') === suggested,
    );
    const byBase = options.find((o) => /base/i.test(o.code ?? o.value));
    const pick = bySuggest ?? byBase ?? options[idx % options.length];
    if (!pick) return line;
    return { ...line, component_code: pick.value };
  });
}

function parseOperandToken(raw: string): number | string | null {
  const t = raw.trim();
  if (!t) return null;
  if (/^-?\d+(\.\d+)?$/.test(t)) {
    const n = Number(t);
    return Number.isFinite(n) ? n : null;
  }
  return t;
}

/**
 * Build expression_json dialect `gd1_eval_v1` — FE does NOT evaluate amounts.
 * Invalid / incomplete lines are skipped (warnings left to BE on preview).
 */
export function buildGd1EvalV1ExpressionJson(input: {
  note?: string;
  lines: Gd1EvalLineDraft[];
}): Record<string, unknown> {
  const note = (input.note ?? '').trim();
  const lines: Record<string, unknown>[] = [];
  for (const row of input.lines) {
    const component_code = row.component_code.trim();
    if (!component_code) continue;
    const sign: Gd1EvalSign = row.sign === 'deduction' ? 'deduction' : 'earning';
    if (row.source === 'var') {
      const varKey = row.var.trim();
      if (!varKey) continue;
      lines.push({ component_code, sign, source: 'var', var: varKey });
      continue;
    }
    if (row.source === 'const') {
      const amount = Number(String(row.amount).replace(/,/g, '').trim());
      if (!Number.isFinite(amount)) continue;
      lines.push({ component_code, sign, source: 'const', amount });
      continue;
    }
    if (row.source === 'expr') {
      const op = (PAY_FORMULA_EVAL_OPS as readonly string[]).includes(row.exprOp)
        ? row.exprOp
        : null;
      const left = parseOperandToken(row.exprLeft);
      const right = parseOperandToken(row.exprRight);
      if (!op || left == null || right == null) continue;
      lines.push({
        component_code,
        sign,
        source: 'expr',
        expr: { op, left, right },
      });
    }
  }
  return {
    form: PAY_FORMULA_EVAL_FORM,
    note: note || undefined,
    lines,
    dialect: PAY_FORMULA_EVAL_FORM,
    staged: true,
  };
}

export function countSerializableGd1EvalLines(lines: Gd1EvalLineDraft[]): number {
  return (buildGd1EvalV1ExpressionJson({ lines }).lines as unknown[]).length;
}

/** Reverse-read gd1_eval_v1 (and legacy opaque) for edit form — no FE engine. */
export function readGd1EvalV1Expression(expressionJson: unknown): {
  note: string;
  lines: Gd1EvalLineDraft[];
  isEvalV1: boolean;
  opaqueExpressionText: string;
} {
  if (!expressionJson || typeof expressionJson !== 'object' || Array.isArray(expressionJson)) {
    return { note: '', lines: [], isEvalV1: false, opaqueExpressionText: '' };
  }
  const obj = expressionJson as Record<string, unknown>;
  const note = typeof obj.note === 'string' ? obj.note : '';
  const form = typeof obj.form === 'string' ? obj.form.trim().toLowerCase() : '';

  if (form === PAY_FORMULA_EVAL_FORM) {
    const rawLines = Array.isArray(obj.lines) ? obj.lines : [];
    const lines: Gd1EvalLineDraft[] = [];
    for (const raw of rawLines) {
      if (!raw || typeof raw !== 'object' || Array.isArray(raw)) continue;
      const row = raw as Record<string, unknown>;
      const component_code = String(row.component_code ?? row.componentCode ?? '').trim();
      if (!component_code) continue;
      const signRaw = String(row.sign ?? 'earning').trim().toLowerCase();
      const sign: Gd1EvalSign = signRaw === 'deduction' ? 'deduction' : 'earning';
      const sourceRaw = String(row.source ?? 'var').trim().toLowerCase();
      const source: Gd1EvalSource = (PAY_FORMULA_EVAL_SOURCES as readonly string[]).includes(
        sourceRaw,
      )
        ? (sourceRaw as Gd1EvalSource)
        : 'var';
      const expr =
        row.expr && typeof row.expr === 'object' && !Array.isArray(row.expr)
          ? (row.expr as Record<string, unknown>)
          : null;
      const exprOpRaw = String(expr?.op ?? 'mul').trim().toLowerCase();
      const exprOp: Gd1EvalOp = (PAY_FORMULA_EVAL_OPS as readonly string[]).includes(exprOpRaw)
        ? (exprOpRaw as Gd1EvalOp)
        : 'mul';
      lines.push(
        emptyGd1EvalLineDraft({
          component_code,
          sign,
          source,
          var: typeof row.var === 'string' ? row.var : '',
          amount:
            row.amount != null && Number.isFinite(Number(row.amount))
              ? String(row.amount)
              : '',
          exprOp,
          exprLeft: expr?.left != null ? String(expr.left) : '',
          exprRight: expr?.right != null ? String(expr.right) : '',
        }),
      );
    }
    return { note, lines, isEvalV1: true, opaqueExpressionText: '' };
  }

  const opaque = readOpaqueExpressionText(expressionJson);
  return {
    note: opaque.note || note,
    lines: [],
    isEvalV1: false,
    opaqueExpressionText: opaque.expressionText,
  };
}

/**
 * Build opaque expression_json for GĐ1 legacy — FE does NOT evaluate.
 * Prefer `buildGd1EvalV1ExpressionJson` for new drafts (PREVIEW compute path).
 */
export function buildOpaqueExpressionJson(input: {
  note?: string;
  expressionText?: string;
}): Record<string, unknown> {
  const note = (input.note ?? '').trim();
  const expressionText = (input.expressionText ?? '').trim();
  return {
    form: 'gd1',
    note: note || undefined,
    ops: expressionText
      ? [{ op: 'opaque', text: expressionText }]
      : [{ op: 'noop', note: note || 'GĐ1 draft' }],
  };
}

/** Best-effort reverse for edit form — still opaque; no FE engine. */
export function readOpaqueExpressionText(expressionJson: unknown): {
  note: string;
  expressionText: string;
} {
  if (!expressionJson || typeof expressionJson !== 'object' || Array.isArray(expressionJson)) {
    return { note: '', expressionText: '' };
  }
  const obj = expressionJson as Record<string, unknown>;
  const note = typeof obj.note === 'string' ? obj.note : '';
  const ops = Array.isArray(obj.ops) ? obj.ops : [];
  const first = ops[0];
  if (first && typeof first === 'object' && !Array.isArray(first)) {
    const op = first as Record<string, unknown>;
    if (typeof op.text === 'string') return { note, expressionText: op.text };
    if (typeof op.note === 'string' && !note) return { note: op.note, expressionText: '' };
  }
  if (typeof obj.stamp === 'string' && !note) {
    return { note: String(obj.stamp), expressionText: JSON.stringify(obj, null, 2) };
  }
  try {
    return { note, expressionText: JSON.stringify(obj, null, 2) };
  } catch {
    return { note, expressionText: '' };
  }
}

/** Nest evaluator dialect — align pay-formula-evaluator.ts classify hyperformula_v1. */
export const PAY_FORMULA_HYPER_FORM = 'hyperformula_v1' as const;

export type HyperFormulaLineDraft = {
  component_code: string;
  sign: 'earning' | 'deduction';
  formula: string;
};

export function readHyperFormulaV1Lines(expressionJson: unknown): HyperFormulaLineDraft[] {
  if (!expressionJson || typeof expressionJson !== 'object' || Array.isArray(expressionJson)) {
    return [];
  }
  const obj = expressionJson as Record<string, unknown>;
  const form = typeof obj.form === 'string' ? obj.form.trim().toLowerCase() : '';
  if (form !== PAY_FORMULA_HYPER_FORM) return [];
  const rawLines = Array.isArray(obj.lines) ? obj.lines : [];
  const lines: HyperFormulaLineDraft[] = [];
  for (const raw of rawLines) {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) continue;
    const row = raw as Record<string, unknown>;
    const component_code = String(row.component_code ?? row.componentCode ?? '').trim();
    const signRaw = String(row.sign ?? 'earning').trim().toLowerCase();
    const sign: HyperFormulaLineDraft['sign'] =
      signRaw === 'deduction' ? 'deduction' : 'earning';
    const formula = String(row.formula ?? '').trim();
    if (!component_code || !formula.startsWith('=')) continue;
    lines.push({ component_code, sign, formula });
  }
  return lines;
}

export function buildHyperFormulaV1ExpressionJson(
  lines: HyperFormulaLineDraft[],
): Record<string, unknown> {
  const serialized = lines
    .map((line) => {
      const component_code = line.component_code.trim();
      const rawFormula = line.formula.trim();
      const formula = rawFormula.startsWith('=') ? rawFormula : `=${rawFormula}`;
      return {
        component_code,
        sign: line.sign === 'deduction' ? 'deduction' : 'earning',
        formula,
      };
    })
    .filter((line) => line.component_code && line.formula.length > 1);
  return { form: PAY_FORMULA_HYPER_FORM, lines: serialized };
}

/** Extract bag var keys from HF lines — skip UPPERCASE Excel function names. */
export function extractVarKeysFromHyperFormulaLines(lines: HyperFormulaLineDraft[]): string[] {
  const keys = new Set<string>();
  for (const line of lines) {
    const matches = line.formula.replace(/^=/, '').match(/[a-zA-Z_][a-zA-Z0-9_]*/g) || [];
    for (const match of matches) {
      if (match.toUpperCase() !== match) keys.add(match);
    }
  }
  return [...keys];
}

type Gd1ExprNode = {
  op: Gd1EvalOp;
  left: number | string | Gd1ExprNode;
  right: number | string | Gd1ExprNode;
};

function isGd1ExprNode(value: unknown): value is Gd1ExprNode {
  return (
    value != null &&
    typeof value === 'object' &&
    'op' in value &&
    'left' in value &&
    'right' in value
  );
}

function tokenizeSalaryFormulaBody(body: string): string[] {
  const tokens: string[] = [];
  let i = 0;
  while (i < body.length) {
    if (/\s/.test(body[i])) {
      i += 1;
      continue;
    }
    if ('+-*/'.includes(body[i])) {
      tokens.push(body[i]);
      i += 1;
      continue;
    }
    const rest = body.slice(i);
    const m = rest.match(/^([a-z][a-z0-9_]*|\d+(?:\.\d+)?)/i);
    if (!m) break;
    tokens.push(m[1]);
    i += m[1].length;
  }
  return tokens;
}

function isVarToken(tok: string): boolean {
  return /^[a-z][a-z0-9_]*$/i.test(tok);
}

function isNumberToken(tok: string): boolean {
  return /^-?\d+(\.\d+)?$/.test(tok);
}

function opCharToGd1(ch: string): Gd1EvalOp | null {
  if (ch === '+') return 'add';
  if (ch === '-') return 'sub';
  if (ch === '*') return 'mul';
  if (ch === '/') return 'div';
  return null;
}

function buildSalaryFormulaExprTree(tokens: string[]): number | string | Gd1ExprNode | null {
  if (tokens.length === 0) return null;
  if (tokens.length === 1) {
    const tok = tokens[0];
    if (isNumberToken(tok)) return Number(tok);
    if (isVarToken(tok)) return tok;
    return null;
  }
  let i = 0;
  const parsePrimary = (): number | string | Gd1ExprNode => {
    const tok = tokens[i];
    i += 1;
    if (isNumberToken(tok)) return Number(tok);
    if (isVarToken(tok)) return tok;
    throw new Error(`Invalid operand: ${tok}`);
  };
  const parseMulDiv = (): number | string | Gd1ExprNode => {
    let node = parsePrimary();
    while (i < tokens.length && (tokens[i] === '*' || tokens[i] === '/')) {
      const op = opCharToGd1(tokens[i]);
      if (!op) break;
      i += 1;
      node = { op, left: node, right: parsePrimary() };
    }
    return node;
  };
  const parseAddSub = (): number | string | Gd1ExprNode => {
    let node = parseMulDiv();
    while (i < tokens.length && (tokens[i] === '+' || tokens[i] === '-')) {
      const op = opCharToGd1(tokens[i]);
      if (!op) break;
      i += 1;
      node = { op, left: node, right: parseMulDiv() };
    }
    return node;
  };
  return parseAddSub();
}

/** Chuyển công thức TP (=base_salary*payable_hours/...) → gd1_eval source (var|const|expr). */
export function parseSalaryFormulaToGd1Source(formula: string): {
  source: Gd1EvalSource;
  var?: string;
  amount?: number;
  expr?: Gd1ExprNode;
} | null {
  const body = stripFormulaEquals(formula);
  if (!body) return null;
  const tokens = tokenizeSalaryFormulaBody(body);
  if (tokens.length === 1 && isVarToken(tokens[0])) {
    return { source: 'var', var: tokens[0] };
  }
  if (tokens.length === 1 && isNumberToken(tokens[0])) {
    return { source: 'const', amount: Number(tokens[0]) };
  }
  const expr = buildSalaryFormulaExprTree(tokens);
  if (expr == null) return null;
  if (typeof expr === 'string') return { source: 'var', var: expr };
  if (typeof expr === 'number') return { source: 'const', amount: expr };
  return { source: 'expr', expr };
}

const FORMULA_OP_SYMBOL: Record<Gd1EvalOp, string> = {
  add: '+',
  sub: '−',
  mul: '×',
  div: '÷',
};

function formatGd1ExprNodeReadable(
  node: number | string | Gd1ExprNode,
  opts?: { componentVarLabels?: ReadonlyMap<string, string> },
): string {
  if (typeof node === 'string') return payFormulaRequiredVarLabel(node, opts);
  if (typeof node === 'number') return String(node);
  const left = formatGd1ExprNodeReadable(node.left, opts);
  const right = formatGd1ExprNodeReadable(node.right, opts);
  return `${left} ${FORMULA_OP_SYMBOL[node.op]} ${right}`;
}

/** Hiển thị công thức HF bằng nhãn biến hệ thống (không tính amount). */
export function formatSalaryFormulaReadable(
  formula: string,
  opts?: { componentVarLabels?: ReadonlyMap<string, string> },
): string {
  const body = stripFormulaEquals(formula);
  if (!body) return '—';
  const labelOpts = opts?.componentVarLabels
    ? { componentVarLabels: opts.componentVarLabels }
    : undefined;
  try {
    const parsed = parseSalaryFormulaToGd1Source(formula);
    if (!parsed) return body;
    if (parsed.source === 'var') return payFormulaRequiredVarLabel(parsed.var ?? '', labelOpts);
    if (parsed.source === 'const') return String(parsed.amount);
    if (parsed.expr) return formatGd1ExprNodeReadable(parsed.expr, labelOpts);
    return body;
  } catch {
    return body
      .replace(/\*/g, ' × ')
      .replace(/\//g, ' ÷ ')
      .replace(/\+/g, ' + ')
      .replace(/-/g, ' − ');
  }
}

const FORMULA_BRACKET_LABEL_RE = /\[([^\]]+)\]/g;

/** Gói nhãn tiếng Việt trong [] để sửa công thức dễ đọc. */
export function bracketLabelForFormulaField(label: string): string {
  const clean = String(label ?? '').replace(/\]/g, '').trim();
  return clean ? `[${clean}]` : '';
}

/** Map mã biến → nhãn hiển thị (catalog + TP lương Nest). */
export function buildPayFormulaDisplayLabelMap(
  opts?: PayFormulaPickerSearchOpts,
): Map<string, string> {
  const map = new Map<string, string>();
  for (const field of PAY_DATA_FIELD_CATALOG) {
    map.set(field.key.toLowerCase(), field.label);
  }
  for (const row of opts?.extraVarHints ?? []) {
    const key = row.code.trim().toLowerCase();
    if (!key) continue;
    map.set(key, row.name.trim() || key);
  }
  for (const row of opts?.salaryComponents ?? []) {
    const key = row.insertToken.trim().toLowerCase();
    if (!key) continue;
    map.set(key, row.name.trim() || row.componentCode.trim());
  }
  return map;
}

function resolveFormulaVarLabel(
  key: string,
  labelMap: ReadonlyMap<string, string>,
): string {
  const k = key.trim().toLowerCase();
  return labelMap.get(k) ?? payFormulaRequiredVarLabel(k, { componentVarLabels: labelMap });
}

/** Công thức TP — dạng sửa trên form: =[Lương cơ bản] + [Phụ cấp P2]. */
export function formatSalaryFormulaDisplayText(
  sourceFormula: string,
  labelMap: ReadonlyMap<string, string>,
): string {
  const raw = String(sourceFormula ?? '');
  if (!raw.trim()) return raw;
  const hasEq = raw.startsWith('=');
  const body = hasEq ? raw.slice(1).trim() : raw.trim();
  if (!body) return hasEq ? '=' : '';

  const tokens = tokenizeSalaryFormulaBody(body);
  if (tokens.length === 0) return raw;

  const formatted = tokens
    .map((tok) => {
      if ('+-*/()'.includes(tok)) {
        return '+-*/'.includes(tok) ? ` ${tok} ` : tok;
      }
      if (isNumberToken(tok)) return tok;
      if (isVarToken(tok)) {
        return bracketLabelForFormulaField(resolveFormulaVarLabel(tok, labelMap));
      }
      return tok;
    })
    .join('')
    .replace(/\s+/g, ' ')
    .trim();
  return hasEq ? `=${formatted}` : formatted;
}

/** Map nhãn hiển thị → mã biến (cho parse công thức có []). */
export function buildPayFormulaReverseLabelMap(
  labelMap: ReadonlyMap<string, string>,
  opts?: PayFormulaPickerSearchOpts,
): Map<string, string> {
  const reverse = new Map<string, string>();
  for (const [key, label] of labelMap) {
    const name = label.trim();
    if (name) reverse.set(name, key);
  }
  for (const field of PAY_DATA_FIELD_CATALOG) {
    reverse.set(field.label.trim(), field.key);
  }
  for (const row of opts?.extraVarHints ?? []) {
    const key = row.code.trim().toLowerCase();
    const name = row.name.trim();
    if (key && name) reverse.set(name, key);
  }
  for (const row of opts?.salaryComponents ?? []) {
    const key = row.insertToken.trim().toLowerCase();
    const name = row.name.trim();
    if (key && name) reverse.set(name, key);
  }
  return reverse;
}

function lookupFormulaLabelKey(
  label: string,
  labelMap: ReadonlyMap<string, string>,
  reverseMap?: ReadonlyMap<string, string>,
): string | null {
  const trimmed = label.trim();
  if (!trimmed) return null;
  const fromReverse = reverseMap?.get(trimmed);
  if (fromReverse) return fromReverse;
  for (const [key, mapped] of labelMap) {
    if (mapped === trimmed) return key;
  }
  return null;
}

/** Chuyển công thức hiển thị (có []) về mã biến snake_case để lưu Nest. */
export function parseSalaryFormulaDisplayText(
  displayFormula: string,
  labelMap: ReadonlyMap<string, string>,
  opts?: PayFormulaPickerSearchOpts,
): string {
  const raw = String(displayFormula ?? '');
  if (!raw.trim()) return raw;
  const hasEq = raw.startsWith('=');
  let body = hasEq ? raw.slice(1) : raw;
  const reverseMap = buildPayFormulaReverseLabelMap(labelMap, opts);

  body = body.replace(FORMULA_BRACKET_LABEL_RE, (_, label: string) => {
    const trimmed = label.trim();
    return lookupFormulaLabelKey(trimmed, labelMap, reverseMap) ?? trimmed;
  });

  body = body.replace(/\s*([+\-*/()])\s*/g, '$1').trim();
  return hasEq ? `=${body}` : body;
}

export function formatGd1EvalLineReadable(line: Gd1EvalLineDraft): string {
  if (line.source === 'var') {
    return payFormulaRequiredVarLabel(line.var);
  }
  if (line.source === 'const') {
    return line.amount || '—';
  }
  const left = line.exprLeft.trim();
  const right = line.exprRight.trim();
  if (left && right) {
    return `${payFormulaRequiredVarLabel(left)} ${FORMULA_OP_SYMBOL[line.exprOp]} ${payFormulaRequiredVarLabel(right)}`;
  }
  return '—';
}

export type PayFormulaComponentReadableLine = {
  componentCode: string;
  componentLabel: string;
  sign: Gd1EvalSign;
  readableFormula: string;
};

/** Đọc chi tiết từng TP + công thức biến (từ HF hoặc gd1_eval). */
export function readPayFormulaReadableLines(
  expressionJson: unknown,
  componentLabels?: ReadonlyMap<string, string>,
  componentFormulas?: ReadonlyMap<string, string>,
): PayFormulaComponentReadableLine[] {
  const gd1 = readGd1EvalV1Expression(expressionJson);
  if (gd1.isEvalV1 && gd1.lines.length > 0) {
    return gd1.lines.map((line) => {
      const code = line.component_code.trim().toUpperCase();
      return {
        componentCode: code,
        componentLabel: componentLabels?.get(code) ?? code,
        sign: line.sign,
        readableFormula: formatGd1EvalLineReadable(line),
      };
    });
  }
  const hfLines = readHyperFormulaV1Lines(expressionJson);
  return hfLines.map((line) => {
    const code = line.component_code.trim().toUpperCase();
    const catalogFormula = componentFormulas?.get(code) ?? line.formula;
    return {
      componentCode: code,
      componentLabel: componentLabels?.get(code) ?? code,
      sign: line.sign,
      readableFormula: formatSalaryFormulaReadable(catalogFormula),
    };
  });
}

export function gd1EvalLinesToComponentTokens(
  lines: Gd1EvalLineDraft[],
  componentLabels?: ReadonlyMap<string, string>,
): PayFormulaComponentToken[] {
  const tokens: PayFormulaComponentToken[] = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (i > 0) {
      tokens.push({
        type: 'op',
        label: line.sign === 'deduction' ? '−' : '+',
        value: line.sign === 'deduction' ? '-' : '+',
      });
    }
    const code = line.component_code.trim();
    const name = componentLabels?.get(code.toUpperCase()) ?? code;
    tokens.push({ type: 'var', label: `[${name}]`, value: code });
  }
  return tokens;
}

/**
 * Gộp biểu thức TP → gd1_eval_v1 (mỗi TP lấy formula từ catalog, parse sang biến hệ thống).
 * Thay hyperformula_v1 — dễ đọc + khớp BE process evaluator.
 */
export function buildGd1EvalFromComponentComposite(input: {
  expression: string;
  tokens?: PayFormulaComponentToken[];
  componentFormulas: ReadonlyMap<string, string>;
  componentLabels?: ReadonlyMap<string, string>;
}): {
  expressionJson: Record<string, unknown>;
  lines: Gd1EvalLineDraft[];
  readableLines: PayFormulaComponentReadableLine[];
} {
  const expression =
    input.expression.trim() || (input.tokens ? tokensToComponentExpression(input.tokens) : '');
  const terms = parseComponentCompositeExpression(expression);
  const serializedLines: Record<string, unknown>[] = [];
  const drafts: Gd1EvalLineDraft[] = [];
  const readableLines: PayFormulaComponentReadableLine[] = [];

  for (const term of terms) {
    const baseFormula = input.componentFormulas.get(term.componentCode) ?? '';
    const body = baseFormula ? stripFormulaEquals(baseFormula) : term.componentCode.toLowerCase();
    const wrapped =
      term.coefficient === 1 ? `=${body}` : `=(${body}) * ${term.coefficient}`;
    const parsed = parseSalaryFormulaToGd1Source(wrapped);
    if (!parsed) continue;

    const line: Record<string, unknown> = {
      component_code: term.componentCode,
      sign: term.sign,
      source: parsed.source,
    };
    if (parsed.source === 'var') line.var = parsed.var;
    if (parsed.source === 'const') line.amount = parsed.amount;
    if (parsed.source === 'expr') line.expr = parsed.expr;
    serializedLines.push(line);

    const draft = emptyGd1EvalLineDraft({
      component_code: term.componentCode,
      sign: term.sign,
      source: parsed.source,
      var: parsed.var ?? '',
      amount: parsed.amount != null ? String(parsed.amount) : '',
    });
    if (parsed.source === 'expr' && parsed.expr) {
      draft.exprOp = parsed.expr.op;
      draft.exprLeft =
        typeof parsed.expr.left === 'object' ? '' : String(parsed.expr.left ?? '');
      draft.exprRight =
        typeof parsed.expr.right === 'object' ? '' : String(parsed.expr.right ?? '');
    }
    drafts.push(draft);

    const code = term.componentCode.toUpperCase();
    readableLines.push({
      componentCode: code,
      componentLabel: input.componentLabels?.get(code) ?? code,
      sign: term.sign,
      readableFormula: formatSalaryFormulaReadable(wrapped),
    });
  }

  const ui: PayFormulaComponentCompositeUi = {
    mode: 'component_composite',
    expression,
    tokens:
      input.tokens && input.tokens.length > 0
        ? input.tokens
        : gd1EvalLinesToComponentTokens(drafts, input.componentLabels),
  };

  return {
    lines: drafts,
    readableLines,
    expressionJson: {
      form: PAY_FORMULA_EVAL_FORM,
      lines: serializedLines,
      dialect: PAY_FORMULA_EVAL_FORM,
      staged: true,
      [PAY_FORMULA_COMPOSITE_UI_KEY]: ui,
    },
  };
}

/** Bag variable hints for Settings formula line editor (DV-18 starter). */
export function payFormulaBagVariableHints(): { value: string; label: string }[] {
  return PAY_FORMULA_REQUIRED_VAR_STARTER.map((value) => ({
    value,
    label: payFormulaRequiredVarLabel(value),
  }));
}

export function validateHyperFormulaLines(lines: HyperFormulaLineDraft[]): string | null {
  const valid = lines.filter(
    (l) => l.component_code.trim() && l.formula.trim().startsWith('='),
  );
  if (valid.length === 0) {
    return 'Cần ít nhất một dòng có thành phần lương và công thức (bắt đầu =).';
  }
  for (const line of valid) {
    if (!line.formula.trim().startsWith('=')) {
      return `Công thức ${line.component_code} phải bắt đầu bằng dấu =.`;
    }
  }
  return null;
}

/** Token chip trên UI công thức lương — gộp từ mã thành phần + toán tử. */
export type PayFormulaComponentToken = {
  type: 'var' | 'op';
  label: string;
  value: string;
};

export type PayFormulaComponentCompositeUi = {
  mode: 'component_composite';
  expression: string;
  tokens: PayFormulaComponentToken[];
};

const PAY_FORMULA_COMPOSITE_UI_KEY = 'ui';

export function parsedComponentTermsToTokens(
  terms: ParsedComponentTerm[],
  componentLabels?: ReadonlyMap<string, string>,
): PayFormulaComponentToken[] {
  const tokens: PayFormulaComponentToken[] = [];
  for (let i = 0; i < terms.length; i++) {
    const term = terms[i];
    if (i > 0) {
      tokens.push({
        type: 'op',
        label: term.sign === 'deduction' ? '−' : '+',
        value: term.sign === 'deduction' ? '-' : '+',
      });
    } else if (term.sign === 'deduction') {
      tokens.push({ type: 'op', label: '−', value: '-' });
    }
    const code = term.componentCode;
    const name = componentLabels?.get(code.toUpperCase()) ?? componentLabels?.get(code) ?? code;
    tokens.push({ type: 'var', label: `[${name}]`, value: code });
  }
  return tokens;
}

export function expressionToComponentTokens(
  expression: string,
  componentLabels?: ReadonlyMap<string, string>,
): PayFormulaComponentToken[] {
  return parsedComponentTermsToTokens(parseComponentCompositeExpression(expression), componentLabels);
}

/** Nội dung công thức đọc được (gd1 / aggregate / legacy) — hiển thị khi sửa. */
export function formatPayFormulaReadableSummary(
  expressionJson: unknown,
  componentLabels?: ReadonlyMap<string, string>,
  componentFormulas?: ReadonlyMap<string, string>,
): string {
  if (!expressionJson || typeof expressionJson !== 'object' || Array.isArray(expressionJson)) {
    return '';
  }
  const obj = expressionJson as Record<string, unknown>;
  const form = typeof obj.form === 'string' ? obj.form.trim().toLowerCase() : '';

  if (form === 'payroll_aggregate_v1') {
    const ui =
      obj.ui && typeof obj.ui === 'object' && !Array.isArray(obj.ui)
        ? (obj.ui as Record<string, unknown>)
        : {};
    const label = typeof ui.label === 'string' ? ui.label.trim() : '';
    const aggregate = String(obj.aggregate ?? '').trim().toLowerCase();
    const expr = typeof ui.expression === 'string' ? ui.expression.trim() : '';
    const codes = Array.isArray(obj.earning_component_codes)
      ? obj.earning_component_codes.map((c) => String(c).trim().toUpperCase()).filter(Boolean)
      : [];
    const lines: string[] = [];
    if (label) lines.push(label);
    lines.push(
      aggregate === 'gross'
        ? 'Tổng hợp thu nhập (gross)'
        : aggregate === 'net'
          ? 'Thực lĩnh sau khấu trừ (net)'
          : 'Cột tổng bảng lương',
    );
    if (expr) {
      lines.push('');
      lines.push('Biểu thức gộp thành phần:');
      const terms = parseComponentCompositeExpression(expr);
      if (terms.length > 0) {
        for (const term of terms) {
          const name =
            componentLabels?.get(term.componentCode) ??
            componentLabels?.get(term.componentCode.toUpperCase()) ??
            term.componentCode;
          const sign = term.sign === 'deduction' ? '−' : '+';
          lines.push(`  ${sign} ${name} (${term.componentCode})`);
        }
      } else {
        lines.push(`  ${expr}`);
      }
    } else if (codes.length > 0) {
      lines.push('');
      lines.push('Thành phần thu nhập:');
      for (const code of codes) {
        const name = componentLabels?.get(code) ?? code;
        lines.push(`  + ${name} (${code})`);
      }
    } else if (aggregate === 'net') {
      lines.push('');
      lines.push('= Tổng thu nhập − các khoản khấu trừ');
    }
    return lines.join('\n').trim();
  }

  const readableLines = readPayFormulaReadableLines(
    expressionJson,
    componentLabels,
    componentFormulas,
  );
  if (readableLines.length > 0) {
    return readableLines
      .map((row) => {
        const sign = row.sign === 'deduction' ? '−' : '+';
        return `${sign} ${row.componentLabel} (${row.componentCode}): ${row.readableFormula}`;
      })
      .join('\n');
  }

  const composite = readPayFormulaComponentTokens(expressionJson, componentLabels);
  if (composite?.expression) {
    return composite.expression;
  }

  return readOpaqueExpressionText(expressionJson).expressionText.trim();
}

/** Đọc token UI đã lưu; fallback gợi ý từ lines HF (mỗi component_code = 1 chip). */
export function readPayFormulaComponentTokens(
  expressionJson: unknown,
  componentLabels?: ReadonlyMap<string, string>,
): PayFormulaComponentCompositeUi | null {
  if (!expressionJson || typeof expressionJson !== 'object' || Array.isArray(expressionJson)) {
    return null;
  }
  const obj = expressionJson as Record<string, unknown>;
  const ui = obj[PAY_FORMULA_COMPOSITE_UI_KEY];
  if (ui && typeof ui === 'object' && !Array.isArray(ui)) {
    const uiObj = ui as Record<string, unknown>;
    const expression = typeof uiObj.expression === 'string' ? uiObj.expression.trim() : '';
    const rawTokens = Array.isArray(uiObj.tokens) ? uiObj.tokens : [];
    const tokens: PayFormulaComponentToken[] = [];
    for (const raw of rawTokens) {
      if (!raw || typeof raw !== 'object' || Array.isArray(raw)) continue;
      const t = raw as Record<string, unknown>;
      const type = t.type === 'op' ? 'op' : 'var';
      const value = String(t.value ?? '').trim();
      const label = String(t.label ?? value).trim();
      if (!value) continue;
      tokens.push({ type, label, value });
    }
    if (tokens.length === 0 && expression) {
      const parsed = expressionToComponentTokens(expression, componentLabels);
      if (parsed.length > 0) {
        return {
          mode: 'component_composite',
          expression,
          tokens: parsed,
        };
      }
    }
    if (tokens.length > 0) {
      return {
        mode: 'component_composite',
        expression: expression || tokensToComponentExpression(tokens),
        tokens,
      };
    }
  }

  const lines = readHyperFormulaV1Lines(expressionJson);
  if (lines.length === 0) {
    const gd1 = readGd1EvalV1Expression(expressionJson);
    if (gd1.isEvalV1 && gd1.lines.length > 0) {
      const tokens = gd1EvalLinesToComponentTokens(gd1.lines, componentLabels);
      return {
        mode: 'component_composite',
        expression: tokensToComponentExpression(tokens),
        tokens,
      };
    }
    return null;
  }
  const tokens = hyperFormulaLinesToComponentTokens(lines, componentLabels);
  return {
    mode: 'component_composite',
    expression: tokensToComponentExpression(tokens),
    tokens,
  };
}

export function tokensToComponentExpression(tokens: PayFormulaComponentToken[]): string {
  return tokens
    .map((t) => t.value)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function hyperFormulaLinesToComponentTokens(
  lines: HyperFormulaLineDraft[],
  componentLabels?: ReadonlyMap<string, string>,
): PayFormulaComponentToken[] {
  const tokens: PayFormulaComponentToken[] = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (i > 0) {
      tokens.push({ type: 'op', label: '+', value: '+' });
    }
    const code = line.component_code.trim();
    const name = componentLabels?.get(code) ?? code;
    tokens.push({ type: 'var', label: `[${name}]`, value: code });
  }
  return tokens;
}

/** Parse biểu thức gộp TP → các term có dấu (+/-) và hệ số tùy chọn. */
export type ParsedComponentTerm = {
  componentCode: string;
  sign: 'earning' | 'deduction';
  coefficient: number;
};

export function parseComponentCompositeExpression(expression: string): ParsedComponentTerm[] {
  const normalized = expression.replace(/\s+/g, ' ').trim();
  if (!normalized) return [];
  const parts = normalized.split(/\s+/);
  const terms: ParsedComponentTerm[] = [];
  let pendingSign: 'earning' | 'deduction' = 'earning';
  let pendingCoef = 1;

  const flushComponent = (code: string) => {
    const componentCode = code.trim().toUpperCase();
    if (!componentCode) return;
    terms.push({
      componentCode,
      sign: pendingSign,
      coefficient: pendingCoef,
    });
    pendingCoef = 1;
  };

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (part === '+' || part === '-') {
      pendingSign = part === '-' ? 'deduction' : 'earning';
      continue;
    }
    if (part === '*' || part === '/') {
      const rhs = parts[i + 1];
      const n = Number(rhs);
      if (Number.isFinite(n) && part === '*') {
        pendingCoef *= n;
        i += 1;
      }
      continue;
    }
    if (/^[A-Z][A-Z0-9_]*$/i.test(part)) {
      flushComponent(part);
      continue;
    }
    const n = Number(part);
    if (Number.isFinite(n)) {
      pendingCoef *= n;
    }
  }
  return terms;
}

function stripFormulaEquals(formula: string): string {
  const t = formula.trim();
  return t.startsWith('=') ? t.slice(1).trim() : t;
}

function wrapFormulaBody(body: string, coefficient: number): string {
  const inner = body.trim();
  if (!inner) return '=0';
  if (coefficient === 1) return `=${inner}`;
  return `=(${inner}) * ${coefficient}`;
}

/**
 * Gộp biểu thức TP → hyperformula_v1 lines (mỗi TP lấy formula từ catalog).
 * FE expand only — BE evaluate từng dòng trên bag vars.
 */
export function buildHyperFormulaFromComponentComposite(input: {
  expression: string;
  tokens?: PayFormulaComponentToken[];
  componentFormulas: ReadonlyMap<string, string>;
}): { expressionJson: Record<string, unknown>; lines: HyperFormulaLineDraft[] } {
  const expression =
    input.expression.trim() || (input.tokens ? tokensToComponentExpression(input.tokens) : '');
  const terms = parseComponentCompositeExpression(expression);
  const lines: HyperFormulaLineDraft[] = [];

  for (const term of terms) {
    const baseFormula = input.componentFormulas.get(term.componentCode) ?? '';
    const body = baseFormula ? stripFormulaEquals(baseFormula) : term.componentCode.toLowerCase();
    lines.push({
      component_code: term.componentCode,
      sign: term.sign,
      formula: wrapFormulaBody(body, term.coefficient),
    });
  }

  const hf = buildHyperFormulaV1ExpressionJson(lines);
  const ui: PayFormulaComponentCompositeUi = {
    mode: 'component_composite',
    expression,
    tokens:
      input.tokens && input.tokens.length > 0
        ? input.tokens
        : hyperFormulaLinesToComponentTokens(lines),
  };
  return {
    lines,
    expressionJson: {
      ...hf,
      [PAY_FORMULA_COMPOSITE_UI_KEY]: ui,
    },
  };
}

export function validateComponentCompositeExpression(
  expression: string,
  knownComponentCodes: readonly string[],
): string | null {
  const expr = expression.trim();
  if (!expr) return 'Vui lòng ghép ít nhất một thành phần lương.';
  const terms = parseComponentCompositeExpression(expr);
  if (terms.length === 0) return 'Biểu thức không hợp lệ — dùng mã thành phần và + - * /.';
  const known = new Set(knownComponentCodes.map((c) => c.trim().toUpperCase()));
  for (const term of terms) {
    if (!known.has(term.componentCode)) {
      return `Mã thành phần «${term.componentCode}» chưa có trong danh mục Nest.`;
    }
  }
  return null;
}

/** Parse preview override inputs → numeric bag for Nest (FE không tính net). */
export function parsePreviewVariableOverrides(
  raw: Record<string, string>,
): Record<string, number> {
  const out: Record<string, number> = {};
  for (const [key, value] of Object.entries(raw)) {
    const k = key.trim();
    if (!k) continue;
    const cleaned = String(value).replace(/,/g, '').trim();
    if (!cleaned) continue;
    const n = Number(cleaned);
    if (Number.isFinite(n)) out[k] = n;
  }
  return out;
}

export function formatPayFormulaMoneyVi(amount: number | null | undefined): string {
  if (amount == null || !Number.isFinite(Number(amount))) return '—';
  return `${Math.round(Number(amount)).toLocaleString('vi-VN')} ₫`;
}

/** Display-ready row from Nest preview `lines[]` — FE không tính amount. */
export type PayFormulaPreviewLineDisplay = {
  componentCode: string;
  amountVnd: number | null;
  sign: string;
};

/** Normalize BE preview lines for table bind (componentCode + amountVnd vi-VN). */
export function normalizePayFormulaPreviewLines(lines: unknown): PayFormulaPreviewLineDisplay[] {
  if (!Array.isArray(lines)) return [];
  const out: PayFormulaPreviewLineDisplay[] = [];
  for (const raw of lines) {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) continue;
    const row = raw as Record<string, unknown>;
    const componentCode = String(row.componentCode ?? row.component_code ?? '').trim();
    if (!componentCode) continue;
    const amountRaw = row.amountVnd ?? row.amount_vnd ?? row.amount;
    const n = amountRaw != null ? Number(amountRaw) : NaN;
    const amountVnd = Number.isFinite(n) ? n : null;
    const sign = String(row.sign ?? 'earning').trim().toLowerCase() || 'earning';
    out.push({ componentCode, amountVnd, sign });
  }
  return out;
}

export function isPayFormulaDraftEditable(status: string | null | undefined): boolean {
  return String(status ?? '').trim().toLowerCase() === 'draft';
}

export function isPayFormulaImmutableStatus(status: string | null | undefined): boolean {
  const s = String(status ?? '').trim().toLowerCase();
  return s === 'active' || s === 'retired' || s === 'pending_publish';
}
