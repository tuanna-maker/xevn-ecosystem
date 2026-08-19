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
import { isCodeInNestSalaryCatalog } from '@/lib/salaryComponentCatalog';

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

export function payFormulaRequiredVarLabel(key: string): string {
  const k = key.trim();
  if (PAY_FORMULA_REQUIRED_VAR_LABELS[k]) return PAY_FORMULA_REQUIRED_VAR_LABELS[k];
  if (PAY_FORMULA_ALLOWANCE_VAR_RE.test(k)) {
    return `Phụ cấp (${k.replace(/^allowance_/, '')})`;
  }
  return k || '—';
}

/** Display-ready: nhãn + mã — cấm raw-key-only trên UI. */
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
