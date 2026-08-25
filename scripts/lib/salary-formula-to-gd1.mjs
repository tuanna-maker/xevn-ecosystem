/**
 * Chuyển công thức thành phần lương (HyperFormula text) → gd1_eval_v1 line.
 * Dùng chung seed VP Hà Nội + QA audit.
 */

const VAR_LABELS = {
  base_salary: 'Lương cơ bản',
  payable_hours: 'Giờ công hưởng lương',
  standard_hours: 'Giờ chuẩn kỳ',
  allowance_kpi: 'Lương KPI (P3)',
  allowance_p2: 'Phụ cấp P2',
  performance_bonus_p4: 'Thưởng P4',
  ot_150_hours: 'Giờ OT 150%',
  ot_200_hours: 'Giờ OT 200%',
  paid_leave_hours: 'Giờ nghỉ hưởng lương',
  revenue_salary: 'Lương doanh số',
  online_pay: 'Lương online',
  holiday_pay: 'Lương nghỉ lễ',
  other_salary: 'Lương khác',
  fuel_allowance: 'Phụ cấp xăng xe',
  retro_pay: 'Truy lĩnh',
  social_insurance: 'BHXH/BHYT/BHTN',
  union_fee: 'Công đoàn',
  discipline: 'Vi phạm kỷ luật',
  accounting_deduction: 'Bảng trừ kế toán',
  salary_advance_1: 'Ứng lương lần 1',
  other_advance: 'Tạm ứng khác',
  pit: 'Thuế TNCN',
  recovery: 'Truy thu',
};

const OP_SYMBOL = { add: '+', sub: '-', mul: '×', div: '÷' };

export function stripFormulaEquals(formula) {
  const t = String(formula ?? '').trim();
  return t.startsWith('=') ? t.slice(1).trim() : t;
}

export function salaryFormulaVarLabel(key) {
  const k = String(key ?? '').trim();
  if (!k) return '—';
  if (VAR_LABELS[k]) return VAR_LABELS[k];
  if (k.startsWith('allowance_')) return `Phụ cấp (${k.slice('allowance_'.length)})`;
  return k;
}

function tokenizeSalaryFormulaBody(body) {
  const tokens = [];
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
    if (!m) throw new Error(`Invalid formula token near: ${body.slice(i, i + 8)}`);
    tokens.push(m[1]);
    i += m[1].length;
  }
  return tokens;
}

function opCharToGd1(ch) {
  if (ch === '+') return 'add';
  if (ch === '-') return 'sub';
  if (ch === '*') return 'mul';
  if (ch === '/') return 'div';
  return null;
}

function isVarToken(tok) {
  return /^[a-z][a-z0-9_]*$/i.test(tok);
}

function isNumberToken(tok) {
  return /^-?\d+(\.\d+)?$/.test(tok);
}

/** Left-associative */ / + chain → nested gd1 expr nodes. */
function buildExprTree(tokens) {
  if (tokens.length === 0) return null;
  if (tokens.length === 1) {
    const tok = tokens[0];
    if (isNumberToken(tok)) return Number(tok);
    if (isVarToken(tok)) return tok;
    throw new Error(`Invalid operand: ${tok}`);
  }

  let i = 0;
  function parseMulDiv() {
    let node = parsePrimary();
    while (i < tokens.length && (tokens[i] === '*' || tokens[i] === '/')) {
      const op = opCharToGd1(tokens[i]);
      i += 1;
      const right = parsePrimary();
      node = { op, left: node, right };
    }
    return node;
  }

  function parseAddSub() {
    let node = parseMulDiv();
    while (i < tokens.length && (tokens[i] === '+' || tokens[i] === '-')) {
      const op = opCharToGd1(tokens[i]);
      i += 1;
      const right = parseMulDiv();
      node = { op, left: node, right };
    }
    return node;
  }

  function parsePrimary() {
    const tok = tokens[i];
    if (!tok) throw new Error('Unexpected end of formula');
    i += 1;
    if (isNumberToken(tok)) return Number(tok);
    if (isVarToken(tok)) return tok;
    throw new Error(`Invalid operand: ${tok}`);
  }

  const tree = parseAddSub();
  if (i !== tokens.length) throw new Error(`Unexpected token: ${tokens[i]}`);
  return tree;
}

export function parseSalaryFormulaToGd1Source(formula) {
  const body = stripFormulaEquals(formula);
  if (!body) return null;
  const tokens = tokenizeSalaryFormulaBody(body);
  if (tokens.length === 1 && isVarToken(tokens[0])) {
    return { source: 'var', var: tokens[0] };
  }
  if (tokens.length === 1 && isNumberToken(tokens[0])) {
    return { source: 'const', amount: Number(tokens[0]) };
  }
  const expr = buildExprTree(tokens);
  if (expr == null) return null;
  if (typeof expr === 'string') return { source: 'var', var: expr };
  if (typeof expr === 'number') return { source: 'const', amount: expr };
  return { source: 'expr', expr };
}

export function parseSalaryFormulaToGd1Line(componentCode, sign, formula) {
  const parsed = parseSalaryFormulaToGd1Source(formula);
  if (!parsed) return null;
  return {
    component_code: componentCode,
    sign: sign === 'deduction' ? 'deduction' : 'earning',
    ...parsed,
  };
}

function formatExprNode(node) {
  if (typeof node === 'string') return salaryFormulaVarLabel(node);
  if (typeof node === 'number') return String(node);
  const left = formatExprNode(node.left);
  const right = formatExprNode(node.right);
  return `(${left} ${OP_SYMBOL[node.op] ?? node.op} ${right})`;
}

export function formatSalaryFormulaReadable(formula) {
  const body = stripFormulaEquals(formula);
  if (!body) return '—';
  try {
    const parsed = parseSalaryFormulaToGd1Source(formula);
    if (!parsed) return body;
    if (parsed.source === 'var') return salaryFormulaVarLabel(parsed.var);
    if (parsed.source === 'const') return String(parsed.amount);
    return formatExprNode(parsed.expr).replace(/^\(|\)$/g, '');
  } catch {
    return body
      .replace(/\*/g, ' × ')
      .replace(/\//g, ' ÷ ')
      .replace(/\+/g, ' + ')
      .replace(/-/g, ' − ');
  }
}

/** Thành phần cần tính bằng công thức (không lấy từ input kỳ). */
export const VP_FORMULA_COMPUTED_COMPONENTS = [
  'LUONG_THEO_CONG',
  'LUONG_KPI',
  'THUONG_P4',
  'LUONG_OT_150',
  'LUONG_OT_200',
  'LUONG_NGHI_PHEP',
  'LUONG_DOANH_SO',
  'LUONG_ONLINE',
  'LUONG_NGHI_LE',
  'LUONG_KHAC',
  'PC_XANG_XE',
  'KHAU_TRU_BHXH',
  'KHAU_TRU_CONG_DOAN',
  'KHAU_TRU_VPKL',
  'UNG_LUONG_LAN_1',
  'THUE_TNCN',
  'TRUY_THU',
];

export function buildGd1EvalFromSalaryComponents(components, codes = VP_FORMULA_COMPUTED_COMPONENTS) {
  const byCode = new Map(components.map((c) => [c.code, c]));
  const lines = [];
  for (const code of codes) {
    const row = byCode.get(code);
    if (!row?.formula) continue;
    const line = parseSalaryFormulaToGd1Line(
      code,
      row.nature === 'deduction' ? 'deduction' : 'earning',
      row.formula,
    );
    if (line) lines.push(line);
  }
  return {
    form: 'gd1_eval_v1',
    lines,
    ui: {
      mode: 'component_composite',
      expression: codes
        .filter((code) => byCode.has(code))
        .join(' + ')
        .replace(/^\+ /, ''),
    },
  };
}
