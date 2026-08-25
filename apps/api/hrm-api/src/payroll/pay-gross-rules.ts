/**
 * VP Hà Nội — quy tắc cộng Tổng thu nhập / gross (Excel: loại LUONG_CO_BAN tham chiếu).
 * SoT cho payroll_aggregate_v1 · aggregateSrcPayslipTotals · gd1_eval gross rollup.
 */

const PAYROLL_REFERENCE_EARNING_CODES = new Set(['luong_co_ban']);
const PAYROLL_SHEET_TOTAL_COMPONENT_CODES = new Set([
  'tong_thu_nhap',
  'thuc_linh',
]);

export type GrossResolvableLine = {
  component_code: string;
  sign: 'earning' | 'deduction' | string;
  amount: number;
  include_in_gross?: boolean;
};

/** Cột thu nhập thực cộng vào Tổng thu nhập — không gồm LUONG_CO_BAN (P1+P2 tham chiếu). */
export const VP_GROSS_EARNING_COMPONENT_CODES = [
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
  'TRUY_LINH',
] as const;

export function normalizePayrollComponentCode(code: string): string {
  return String(code ?? '').trim().toLowerCase();
}

export function parseGrossEarningComponentCodes(
  expressionJson: unknown,
): string[] | null {
  if (!expressionJson || typeof expressionJson !== 'object' || Array.isArray(expressionJson)) {
    return null;
  }
  const raw = (expressionJson as Record<string, unknown>).earning_component_codes;
  if (!Array.isArray(raw) || raw.length === 0) return null;
  const codes = raw
    .map((c) => normalizePayrollComponentCode(String(c ?? '')))
    .filter(Boolean);
  return codes.length > 0 ? codes : null;
}

export function shouldCountResolvedLineTowardGross(
  line: Pick<GrossResolvableLine, 'component_code' | 'sign' | 'include_in_gross'>,
  opts?: { earningComponentCodes?: readonly string[] | null },
): boolean {
  if (line.sign === 'deduction') return false;
  const code = normalizePayrollComponentCode(line.component_code);
  if (!code) return false;
  if (PAYROLL_SHEET_TOTAL_COMPONENT_CODES.has(code)) return false;

  const whitelist = opts?.earningComponentCodes;
  if (whitelist && whitelist.length > 0) {
    const allowed = new Set(whitelist.map(normalizePayrollComponentCode));
    return allowed.has(code);
  }

  if (line.include_in_gross === false) return false;
  if (PAYROLL_REFERENCE_EARNING_CODES.has(code)) return false;
  return true;
}

export function sumResolvedLinesGross(
  lines: readonly GrossResolvableLine[],
  opts?: { earningComponentCodes?: readonly string[] | null },
): number {
  let gross = 0;
  for (const line of lines) {
    if (!shouldCountResolvedLineTowardGross(line, opts)) continue;
    gross = roundMoney(gross + line.amount);
  }
  return gross;
}

export function sumEvalLinesGross(
  lines: ReadonlyArray<{ component_code: string; sign: string; amount: number }>,
  opts?: { earningComponentCodes?: readonly string[] | null },
): number {
  let gross = 0;
  for (const line of lines) {
    if (
      !shouldCountResolvedLineTowardGross(
        {
          component_code: line.component_code,
          sign: line.sign,
          include_in_gross: undefined,
        },
        opts,
      )
    ) {
      continue;
    }
    gross = roundMoney(gross + line.amount);
  }
  return gross;
}

function roundMoney(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}
