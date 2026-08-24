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
};

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
] as const;

export type PayrollSheetColumn = {
  componentCode: string;
  displayLabel: string;
  sortOrder: number;
  isDeduction: boolean;
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

/** Sum gross/deduction/net from merged component map (draft / input-only preview). */
export function derivePayrollTotalsFromComponentValues(
  values: Record<string, number>,
): { gross: number; deduction: number; net: number } {
  let gross = 0;
  let deduction = 0;
  for (const [code, raw] of Object.entries(values)) {
    const amount = parseLineAmount(raw);
    if (amount === 0) continue;
    if (isPayrollDeductionComponentCode(code)) {
      deduction += amount;
    } else {
      gross += amount;
    }
  }
  return { gross, deduction, net: gross - deduction };
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

/** Build line drafts for Settings — 21 cột VP Hà Nội (khớp seed `VP_SHEET_COLUMN_ORDER`). */
export function buildVpHanoiPaySheetLineDrafts(
  components: readonly { id: string; code: string }[],
): PaySheetLineDraft[] {
  const byCode = new Map(
    components.map((component) => [component.code.trim().toUpperCase(), component.id]),
  );
  return VP_PAYROLL_SHEET_FALLBACK_COLUMN_CODES.map((code, idx) => ({
    key: `vp-hn-${code}`,
    componentId: byCode.get(code) ?? '',
    displayLabel: VP_PAYROLL_COMPONENT_LABELS[code] ?? code,
    sortOrder: idx,
    formulaOverrideDefinitionId: '',
  }));
}

export function missingVpHanoiComponentCodes(
  components: readonly { code: string }[],
): string[] {
  const known = new Set(components.map((c) => c.code.trim().toUpperCase()));
  return VP_PAYROLL_SHEET_FALLBACK_COLUMN_CODES.filter((code) => !known.has(code));
}
