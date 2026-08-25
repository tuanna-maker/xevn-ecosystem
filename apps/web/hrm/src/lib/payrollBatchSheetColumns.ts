/**
 * @CODE-MEMORY
 * WorkItem: PO-HRM-PAY-VP-HANOI-BATCH-DETAIL-COLUMNS-01
 * What: VP Hà Nội dynamic pay-sheet columns · period input merge · draft totals derive
 * Callees: resolvePayrollSheetColumns · groupPeriodInputLinesByEmployee · derivePayrollTotalsFromComponentValues
 * must_keep: snapshot columns SoT · payslip lines win over period input · isPayrollDeductionComponentCode for TRUY_THU
 *
 * @CODE-MEMORY-CHANGE 2026-08-24
 * WorkItem: PO-HRM-PAY-VP-HANOI-BATCH-DETAIL-COLUMNS-01
 * change_mode: FIX
 * What: normalizePeriodInputLine (camelCase+snake_case) · derivePayrollTotalsFromComponentValues for draft/header fallback
 * Why: GET input-lines limit=500 on 700-line VP HN period — enrolled employees missing from first page → all columns 0₫
 * must_keep: mergePayrollComponentValues payslip-wins · VP_PAYROLL_SHEET_FALLBACK_COLUMN_CODES · no FE formula invent
 */
import type { HrmPaySheetTemplatePeriodSnapshot } from '@/integrations/hrmApi';
import {
  type PaySheetLineDraft,
  paySheetLineDisplayLabel,
} from '@/lib/paySheetTemplateCatalog';

function parseLineAmount(value: string | number | null | undefined): number {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  if (typeof value === 'string') {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

/** VP Hà Nội — nhãn cột mặc định khi snapshot/period input thiếu display_label. */
export const VP_PAYROLL_COMPONENT_LABELS: Record<string, string> = {
  LUONG_CO_BAN: 'Lương cơ bản (P1+P2)',
  LUONG_THEO_CONG: 'Lương theo ngày/giờ công',
  LUONG_KPI: 'Lương KPI (P3)',
  THUONG_P4: 'Thưởng hiệu quả (P4)',
  LUONG_OT_150: 'Lương OT 150%',
  LUONG_OT_200: 'Lương OT 200%',
  LUONG_NGHI_PHEP: 'Lương nghỉ phép',
  LUONG_DOANH_SO: 'Lương doanh số',
  LUONG_ONLINE: 'Lương online',
  LUONG_NGHI_LE: 'Lương nghỉ lễ',
  LUONG_KHAC: 'Lương khác',
  PC_XANG_XE: 'Phụ cấp xăng xe',
  TRUY_LINH: 'Truy lĩnh',
  KHAU_TRU_BHXH: 'Khấu trừ BHXH',
  KHAU_TRU_CONG_DOAN: 'Khấu trừ công đoàn',
  KHAU_TRU_VPKL: 'Khấu trừ VPKL',
  KHAU_TRU_KE_TOAN: 'Khấu trừ kế toán',
  UNG_LUONG_LAN_1: 'Ứng lương lần 1',
  TAM_UNG_KHAC: 'Tạm ứng khác',
  THUE_TNCN: 'Thuế TNCN',
  TRUY_THU: 'Truy thu',
  TONG_THU_NHAP: 'Tổng thu nhập',
  THUC_LINH: 'Lương Net',
};

/** Cột thu nhập thực cộng vào Tổng thu nhập — khớp BE `VP_GROSS_EARNING_COMPONENT_CODES`. */
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

const VP_GROSS_EARNING_CODE_SET = new Set<string>(VP_GROSS_EARNING_COMPONENT_CODES);

/** Cột tổng trên mẫu bảng lương — không cộng vào gross khi derive. */
export const PAYROLL_SHEET_TOTAL_COMPONENT_CODES = new Set([
  'TONG_THU_NHAP',
  'THUC_LINH',
]);

/** Mã công thức OV-C bootstrap — khớp BE `payroll-vp-sheet-starter.constants`. */
export const PAYROLL_SHEET_TOTAL_FORMULA_CODES = {
  TONG_THU_NHAP: 'formula_col_tong_thu_nhap',
  THUC_LINH: 'formula_col_thuc_linh',
} as const;

export function isPayrollSheetTotalComponentCode(code: string): boolean {
  return PAYROLL_SHEET_TOTAL_COMPONENT_CODES.has(code.trim().toUpperCase());
}

/** VP Hà Nội default column order when period snapshot is missing. */
export const VP_PAYROLL_SHEET_FALLBACK_COLUMN_CODES = [
  'LUONG_CO_BAN',
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
  'KHAU_TRU_BHXH',
  'KHAU_TRU_CONG_DOAN',
  'KHAU_TRU_VPKL',
  'KHAU_TRU_KE_TOAN',
  'UNG_LUONG_LAN_1',
  'TAM_UNG_KHAC',
  'THUE_TNCN',
  'TRUY_THU',
  'TONG_THU_NHAP',
  'THUC_LINH',
] as const;

export type PayrollSheetColumn = {
  componentCode: string;
  displayLabel: string;
  sortOrder: number;
  isDeduction: boolean;
  isTotalColumn: boolean;
};

const DEDUCTION_CODE_PREFIXES = ['KHAU_', 'THUE_', 'UNG_', 'TAM_'] as const;

export function isPayrollDeductionComponentCode(code: string): boolean {
  const upper = code.trim().toUpperCase();
  if (!upper) return false;
  if (upper === 'TRUY_THU') return true;
  return DEDUCTION_CODE_PREFIXES.some((prefix) => upper.startsWith(prefix));
}

function resolveColumnIsDeduction(
  componentCode: string,
  sign?: string | null,
): boolean {
  const normalizedSign = sign?.trim().toLowerCase();
  if (normalizedSign === 'deduction') return true;
  if (normalizedSign === 'earning') return false;
  return isPayrollDeductionComponentCode(componentCode);
}

export function resolvePayrollSheetColumns(
  snapshot?: HrmPaySheetTemplatePeriodSnapshot | null,
  observedCodes?: Iterable<string>,
): PayrollSheetColumn[] {
  const rawCols = snapshot?.columns;
  if (Array.isArray(rawCols) && rawCols.length > 0) {
    return rawCols
      .map((col, idx) => {
        const componentCode = String(col.component_code ?? '').trim();
        if (!componentCode) return null;
        return {
          componentCode,
          displayLabel: paySheetLineDisplayLabel({
            displayLabel: col.display_label ?? VP_PAYROLL_COMPONENT_LABELS[componentCode],
            componentCode,
          }),
          sortOrder: typeof col.sort_order === 'number' ? col.sort_order : idx,
          isDeduction: resolveColumnIsDeduction(componentCode, col.sign),
          isTotalColumn: isPayrollSheetTotalComponentCode(componentCode),
        };
      })
      .filter((col): col is PayrollSheetColumn => col != null)
      .sort((a, b) => a.sortOrder - b.sortOrder || a.componentCode.localeCompare(b.componentCode));
  }

  const codes = new Set<string>();
  for (const code of VP_PAYROLL_SHEET_FALLBACK_COLUMN_CODES) {
    codes.add(code);
  }
  if (observedCodes) {
    for (const code of observedCodes) {
      const trimmed = code.trim();
      if (trimmed) codes.add(trimmed);
    }
  }

  return [...codes].map((componentCode, idx) => ({
    componentCode,
    displayLabel: paySheetLineDisplayLabel({
      displayLabel: VP_PAYROLL_COMPONENT_LABELS[componentCode],
      componentCode,
    }),
    sortOrder: idx,
    isDeduction: isPayrollDeductionComponentCode(componentCode),
    isTotalColumn: isPayrollSheetTotalComponentCode(componentCode),
  }));
}

export type PeriodInputLineLike = {
  employeeId?: string | null;
  employee_id?: string | null;
  componentCode?: string | null;
  component_code?: string | null;
  amount?: number | string | null;
};

/** Normalize API row (camelCase or snake_case) for grouping. */
export function normalizePeriodInputLine(
  line: PeriodInputLineLike,
): { employeeId: string; componentCode: string; amount: number | string | null | undefined } | null {
  const employeeId = String(line.employeeId ?? line.employee_id ?? '').trim();
  const componentCode = String(line.componentCode ?? line.component_code ?? '').trim();
  if (!employeeId || !componentCode) return null;
  return { employeeId, componentCode, amount: line.amount };
}

/** Group period input lines by employee_id → component_code → amount (sum duplicates). */
export function groupPeriodInputLinesByEmployee(
  lines: readonly PeriodInputLineLike[],
): Map<string, Record<string, number>> {
  const byEmployee = new Map<string, Record<string, number>>();
  for (const line of lines) {
    const normalized = normalizePeriodInputLine(line);
    if (!normalized) continue;
    const { employeeId, componentCode, amount } = normalized;
    const bucket = byEmployee.get(employeeId) ?? {};
    const parsed = parseLineAmount(amount);
    bucket[componentCode] = (bucket[componentCode] ?? 0) + parsed;
    byEmployee.set(employeeId, bucket);
  }
  return byEmployee;
}

/** VP: LUONG_CO_BAN là cột tham chiếu P1+P2 — không cộng vào tổng draft (tránh 2× với LUONG_THEO_CONG). */
export const PAYROLL_REFERENCE_EARNING_CODES = new Set<string>(['LUONG_CO_BAN']);

/** Cột chỉ có sau process / công thức — không seed period input. */
export const PAYROLL_FORMULA_ONLY_COLUMN_CODES = new Set<string>([
  'LUONG_THEO_CONG',
  'LUONG_KPI',
  'THUE_TNCN',
]);

export type ComponentPreviewSource = 'period_input' | 'emp_cb' | 'formula_preview';

export type CompensationLineLike = {
  line_type?: string | null;
  amount?: number | string | null;
  allowance_code?: string | null;
};

/** P1+P2 từ gói C&B — khớp công thức VP `=base_salary+allowance_p2`. */
export function resolveLuongCoBanFromCompensationLines(
  lines: readonly CompensationLineLike[],
): number {
  let base = 0;
  let allowanceP2 = 0;
  for (const line of lines) {
    const amount = parseLineAmount(line.amount);
    const lineType = String(line.line_type ?? '').trim().toLowerCase();
    const allowanceCode = String(line.allowance_code ?? '').trim().toLowerCase();
    if (lineType === 'base') {
      base = amount;
    } else if (lineType === 'allowance' && (allowanceCode === 'p2' || allowanceCode === 'allowance_p2')) {
      allowanceP2 = amount;
    }
  }
  return base + allowanceP2;
}

/** P1 từ gói C&B — khớp biến `base_salary` trong công thức VP. */
export function resolveBaseSalaryFromCompensationLines(
  lines: readonly CompensationLineLike[],
): number {
  let probation = 0;
  for (const line of lines) {
    const amount = parseLineAmount(line.amount);
    const lineType = String(line.line_type ?? '').trim().toLowerCase();
    if (lineType === 'base') return amount;
    if (lineType === 'probation') probation = amount;
  }
  return probation;
}

/** VP `=base_salary*payable_hours/standard_hours` — preview draft (không thay process). */
export function resolveLuongTheoCongDraftPreview(
  baseSalary: number,
  payableHours: number,
  standardHours: number,
): number {
  if (baseSalary <= 0 || payableHours <= 0 || standardHours <= 0) return 0;
  return Math.round((baseSalary * payableHours) / standardHours);
}

export type AttendanceHoursLineLike = {
  employee_id?: string | null;
  employeeId?: string | null;
  payable_hours?: number | null;
  standard_hours?: number | null;
  line_locked?: boolean | null;
};

/** Map employee_id → giờ công từ att_timesheet_line (ưu tiên dòng đã khóa). */
export function buildAttendanceHoursByEmployee(
  lines: readonly AttendanceHoursLineLike[],
  opts?: { sheetClosed?: boolean },
): Map<string, { payableHours: number; standardHours: number }> {
  const byEmployee = new Map<string, { payableHours: number; standardHours: number }>();
  for (const line of lines) {
    const employeeId = String(line.employee_id ?? line.employeeId ?? '').trim();
    if (!employeeId) continue;
    if (opts?.sheetClosed && line.line_locked === false) continue;
    const payableHours = Number(line.payable_hours ?? 0);
    const standardHours = Number(line.standard_hours ?? 0);
    if (!Number.isFinite(payableHours) || !Number.isFinite(standardHours)) continue;
    byEmployee.set(employeeId, { payableHours, standardHours });
  }
  return byEmployee;
}

/** Bổ sung LUONG_CO_BAN từ emp_cb khi draft thiếu period input. */
export function enrichDraftComponentValuesFromEmpCb(
  values: Record<string, number>,
  empCbValues: Record<string, number>,
): { values: Record<string, number>; previewSources: Record<string, ComponentPreviewSource> } {
  const next = { ...values };
  const previewSources: Record<string, ComponentPreviewSource> = {};
  for (const [code, amount] of Object.entries(empCbValues)) {
    if (amount <= 0) continue;
    if ((next[code] ?? 0) !== 0) continue;
    next[code] = amount;
    previewSources[code] = 'emp_cb';
  }
  return { values: next, previewSources };
}

export function payrollDraftColumnTitle(
  componentCode: string,
  amount: number,
  opts?: {
    hasPayslipLines?: boolean;
    previewSource?: ComponentPreviewSource;
  },
): string | undefined {
  if (opts?.hasPayslipLines) return componentCode;
  if (amount > 0) {
    if (opts?.previewSource === 'emp_cb') {
      return 'Lương C&B (P1+P2) — tham chiếu, chưa qua công thức';
    }
    if (opts?.previewSource === 'formula_preview') {
      return 'Ước tính từ P1 × giờ công / giờ chuẩn — chưa khóa bảng lương';
    }
    return 'Dữ liệu đầu vào kỳ — chưa tính qua công thức';
  }
  if (PAYROLL_FORMULA_ONLY_COLUMN_CODES.has(componentCode)) {
    return 'Tính qua công thức khi khóa bảng lương — chưa có trong đầu vào kỳ';
  }
  return componentCode;
}

/** Sum gross/deduction/net from merged component map (draft / input-only preview). */
export function derivePayrollTotalsFromComponentValues(
  values: Record<string, number>,
  opts?: { excludeReferenceEarnings?: boolean },
): { gross: number; deduction: number; net: number } {
  let gross = 0;
  let deduction = 0;
  for (const [code, raw] of Object.entries(values)) {
    const amount = parseLineAmount(raw);
    if (amount === 0) continue;
    const upper = code.trim().toUpperCase();
    if (PAYROLL_SHEET_TOTAL_COMPONENT_CODES.has(upper)) continue;
    if (isPayrollDeductionComponentCode(code)) {
      deduction += amount;
    } else if (VP_GROSS_EARNING_CODE_SET.has(upper)) {
      gross += amount;
    }
  }
  return { gross, deduction, net: gross - deduction };
}

/** Inject TONG_THU_NHAP / THUC_LINH from peer component values (draft + processed display). */
export function injectPayrollSheetTotalComponentValues(
  values: Record<string, number>,
): Record<string, number> {
  const base: Record<string, number> = {};
  for (const [code, amount] of Object.entries(values)) {
    if (PAYROLL_SHEET_TOTAL_COMPONENT_CODES.has(code.trim().toUpperCase())) continue;
    base[code] = amount;
  }
  const totals = derivePayrollTotalsFromComponentValues(base, {
    excludeReferenceEarnings: true,
  });
  return {
    ...values,
    TONG_THU_NHAP: totals.gross,
    THUC_LINH: totals.net,
  };
}

/** Payslip lines win; period input fills missing component codes (draft preview). */
export function mergePayrollComponentValues(
  payslipValues: Record<string, number>,
  periodInputValues: Record<string, number>,
): Record<string, number> {
  const merged = { ...periodInputValues };
  for (const [code, amount] of Object.entries(payslipValues)) {
    if (amount !== 0 || !(code in merged)) {
      merged[code] = amount;
    }
  }
  return merged;
}

export type PayslipLineAmountInput = {
  component_code?: string | null;
  amount?: string | number | null;
};

export function mapPayslipLinesToComponentValues(
  lines: readonly PayslipLineAmountInput[],
): Record<string, number> {
  const result: Record<string, number> = {};
  for (const line of lines) {
    const code = String(line.component_code ?? '').trim();
    if (!code) continue;
    result[code] = parseLineAmount(line.amount);
  }
  return result;
}

export function payrollRecordComponentAmount(
  record: { component_values?: Record<string, number> | null },
  componentCode: string,
): number {
  return record.component_values?.[componentCode] ?? 0;
}

/** Build line drafts for Settings — 23 cột VP Hà Nội (khớp seed `VP_SHEET_COLUMN_ORDER`). */
export function buildVpHanoiPaySheetLineDrafts(
  components: readonly { id: string; code: string }[],
  formulas?: readonly { id: string; code: string }[],
): PaySheetLineDraft[] {
  const byCode = new Map(
    components.map((component) => [component.code.trim().toUpperCase(), component.id]),
  );
  const formulaIdByCode = new Map(
    (formulas ?? []).map((formula) => [
      formula.code.trim().toLowerCase(),
      formula.id,
    ]),
  );
  const tongThuNhapFormulaId =
    formulaIdByCode.get(PAYROLL_SHEET_TOTAL_FORMULA_CODES.TONG_THU_NHAP.toLowerCase()) ?? '';
  const thucLinhFormulaId =
    formulaIdByCode.get(PAYROLL_SHEET_TOTAL_FORMULA_CODES.THUC_LINH.toLowerCase()) ?? '';

  return VP_PAYROLL_SHEET_FALLBACK_COLUMN_CODES.map((code, idx) => ({
    key: `vp-hn-${code}`,
    componentId: byCode.get(code) ?? '',
    displayLabel: VP_PAYROLL_COMPONENT_LABELS[code] ?? code,
    sortOrder: idx,
    formulaOverrideDefinitionId:
      code === 'TONG_THU_NHAP'
        ? tongThuNhapFormulaId
        : code === 'THUC_LINH'
          ? thucLinhFormulaId
          : '',
  }));
}

export function missingVpHanoiComponentCodes(
  components: readonly { code: string }[],
): string[] {
  const known = new Set(components.map((c) => c.code.trim().toUpperCase()));
  return VP_PAYROLL_SHEET_FALLBACK_COLUMN_CODES.filter((code) => !known.has(code));
}
