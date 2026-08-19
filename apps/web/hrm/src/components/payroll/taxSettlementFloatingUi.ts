/**
 * @CODE-MEMORY
 * Screen:     /payroll · calc-tax-settlement — dialog sửa NV quyết toán thuế (floating UI)
 * UC:         UC-HRM-PAY · UX-02 / P0-b
 * BR:         L-OPS · UX-PRODUCT-RULES §2.1 Recovery (cancel an toàn)
 * SRS:        docs/program/UX-UI-ERP-ANALYSIS.md §5 P0-b · matrix UX-02
 * TechSpec:   _vibe-team-os/UX-PRODUCT-RULES.md §2 · §3.4 state smell
 * Purpose:    Null-guard + khởi tạo an toàn cho trạng thái floating UI
 *             (dialog sửa NV quyết toán thuế). Tránh crash khi employee/form
 *             thiếu field, name null, hoặc số undefined → toLocaleString.
 * WorkItem:   D-UX-C1-PAYROLL-FE-01
 * Coded:      2026-07-28
 * Callers:    pages/Payroll.tsx · vitest taxSettlementFloatingUi.test.ts
 * Callees:    (pure helpers — không API)
 * FE-Actions: | Mở dialog sửa NV | openTaxEmployeeEditFloatingUi | state |
 *             | Đóng / Cancel | closeTaxEmployeeEditFloatingUi | reset |
 * Impact:     Thiếu guard → runtime crash chặn chốt kỳ / quyết toán thuế
 * must_keep:  Không đổi luồng calculate/payment; chỉ state dialog tax edit
 * SOLID:      Pure domain helpers — tách khỏi shell Payroll 4k+ LOC
 * LastVerified: docs/qa/evidence/d-ux-c1-payroll-fe-01-20260728.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-03
 * WorkItem: PO-E2E-SPINE-01-FE-VITE-PAY-CON-01
 * change_mode: FIX
 * What: Restore taxSettlementFloatingUi từ stash 43c479a — Vite miss chặn Payroll.tsx
 * Why: QA W5 — CC /hr payroll blank · Failed to resolve taxSettlementFloatingUi
 * must_keep: C1 floating UI guards; Leave/LV-03/04 · AUTH/EMP/CAT · HP-03/04
 * LastVerified: docs/qa/evidence/po-e2e-spine-01-fe-vite-pay-con-01.md
 */

export type TaxSettlementEmployeeRow = {
  id: string;
  code: string;
  name: string;
  avatar?: string;
  totalTaxableIncome: number;
  dependents: number;
  familyDeduction: number;
  unemploymentInsurance: number;
  socialInsurance: number;
  healthInsurance: number;
  totalDeduction: number;
  taxableIncomeAfterDeduction: number;
  taxPayable: number;
  taxPaid: number;
};

export type TaxEmployeeEditForm = {
  totalTaxableIncome: number;
  dependents: number;
  familyDeduction: number;
  unemploymentInsurance: number;
  socialInsurance: number;
  healthInsurance: number;
  taxPayable: number;
  taxPaid: number;
};

/** Trạng thái floating UI dialog sửa NV — luôn có object (không undefined). */
export type TaxSettlementFloatingUiState = {
  showEditDialog: boolean;
  employeeToEdit: TaxSettlementEmployeeRow | null;
  editForm: TaxEmployeeEditForm;
};

export const EMPTY_TAX_EMPLOYEE_EDIT_FORM: TaxEmployeeEditForm = {
  totalTaxableIncome: 0,
  dependents: 0,
  familyDeduction: 0,
  unemploymentInsurance: 0,
  socialInsurance: 0,
  healthInsurance: 0,
  taxPayable: 0,
  taxPaid: 0,
};

export function createEmptyTaxSettlementFloatingUiState(): TaxSettlementFloatingUiState {
  return {
    showEditDialog: false,
    employeeToEdit: null,
    editForm: { ...EMPTY_TAX_EMPLOYEE_EDIT_FORM },
  };
}

/** Ép số an toàn — null / undefined / NaN / non-finite → 0 (không throw). */
export function safePayrollNumber(value: unknown): number {
  if (value == null || value === '') return 0;
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
}

export function employeeDisplayName(name: unknown): string {
  if (typeof name !== 'string') return '—';
  const trimmed = name.trim();
  return trimmed.length > 0 ? trimmed : '—';
}

export function employeeAvatarInitial(name: unknown): string {
  const display = employeeDisplayName(name);
  if (display === '—') return '?';
  const last = display.split(/\s+/).filter(Boolean).pop();
  const ch = last?.charAt(0);
  return ch ? ch.toUpperCase() : '?';
}

/**
 * Chuẩn hóa row NV quyết toán thuế.
 * Thiếu id hợp lệ → null (không mở dialog / không render row).
 */
export function normalizeTaxSettlementEmployee(
  raw: Partial<TaxSettlementEmployeeRow> | null | undefined,
): TaxSettlementEmployeeRow | null {
  if (raw == null || typeof raw !== 'object') return null;
  const id = typeof raw.id === 'string' ? raw.id.trim() : '';
  if (!id) return null;

  const totalTaxableIncome = safePayrollNumber(raw.totalTaxableIncome);
  const familyDeduction = safePayrollNumber(raw.familyDeduction);
  const unemploymentInsurance = safePayrollNumber(raw.unemploymentInsurance);
  const socialInsurance = safePayrollNumber(raw.socialInsurance);
  const healthInsurance = safePayrollNumber(raw.healthInsurance);
  const totalDeduction =
    raw.totalDeduction != null
      ? safePayrollNumber(raw.totalDeduction)
      : familyDeduction + unemploymentInsurance + socialInsurance + healthInsurance;
  const taxableIncomeAfterDeduction =
    raw.taxableIncomeAfterDeduction != null
      ? safePayrollNumber(raw.taxableIncomeAfterDeduction)
      : Math.max(0, totalTaxableIncome - totalDeduction);

  return {
    id,
    code: typeof raw.code === 'string' ? raw.code : '',
    name: employeeDisplayName(raw.name),
    avatar: typeof raw.avatar === 'string' ? raw.avatar : undefined,
    totalTaxableIncome,
    dependents: Math.max(0, Math.floor(safePayrollNumber(raw.dependents))),
    familyDeduction,
    unemploymentInsurance,
    socialInsurance,
    healthInsurance,
    totalDeduction,
    taxableIncomeAfterDeduction,
    taxPayable: safePayrollNumber(raw.taxPayable),
    taxPaid: safePayrollNumber(raw.taxPaid),
  };
}

export function buildTaxEmployeeEditForm(
  employee: TaxSettlementEmployeeRow | null | undefined,
): TaxEmployeeEditForm {
  if (!employee) return { ...EMPTY_TAX_EMPLOYEE_EDIT_FORM };
  return {
    totalTaxableIncome: safePayrollNumber(employee.totalTaxableIncome),
    dependents: Math.max(0, Math.floor(safePayrollNumber(employee.dependents))),
    familyDeduction: safePayrollNumber(employee.familyDeduction),
    unemploymentInsurance: safePayrollNumber(employee.unemploymentInsurance),
    socialInsurance: safePayrollNumber(employee.socialInsurance),
    healthInsurance: safePayrollNumber(employee.healthInsurance),
    taxPayable: safePayrollNumber(employee.taxPayable),
    taxPaid: safePayrollNumber(employee.taxPaid),
  };
}

/** Mở dialog — raw thiếu id → giữ/reset closed (không crash). */
export function openTaxEmployeeEditFloatingUi(
  _current: TaxSettlementFloatingUiState | null | undefined,
  raw: Partial<TaxSettlementEmployeeRow> | null | undefined,
): TaxSettlementFloatingUiState {
  const employee = normalizeTaxSettlementEmployee(raw);
  if (!employee) {
    return createEmptyTaxSettlementFloatingUiState();
  }
  return {
    showEditDialog: true,
    employeeToEdit: employee,
    editForm: buildTaxEmployeeEditForm(employee),
  };
}

export function closeTaxEmployeeEditFloatingUi(): TaxSettlementFloatingUiState {
  return createEmptyTaxSettlementFloatingUiState();
}

/** onOpenChange Dialog — đóng thì reset đủ; mở chỉ qua openTaxEmployeeEditFloatingUi. */
export function applyTaxEditDialogOpenChange(
  current: TaxSettlementFloatingUiState | null | undefined,
  open: boolean,
): TaxSettlementFloatingUiState {
  const base = current ?? createEmptyTaxSettlementFloatingUiState();
  if (!open) return closeTaxEmployeeEditFloatingUi();
  // Radix có thể gọi open=true khi đã open — giữ form nếu đã có employee
  if (base.employeeToEdit) {
    return {
      ...base,
      showEditDialog: true,
      editForm: base.editForm ?? buildTaxEmployeeEditForm(base.employeeToEdit),
    };
  }
  return closeTaxEmployeeEditFloatingUi();
}

export function patchTaxEmployeeEditForm(
  current: TaxSettlementFloatingUiState | null | undefined,
  patch: Partial<TaxEmployeeEditForm>,
): TaxSettlementFloatingUiState {
  const base = current ?? createEmptyTaxSettlementFloatingUiState();
  const prevForm = base.editForm ?? EMPTY_TAX_EMPLOYEE_EDIT_FORM;
  return {
    ...base,
    editForm: {
      ...prevForm,
      ...patch,
      totalTaxableIncome: safePayrollNumber(
        patch.totalTaxableIncome !== undefined ? patch.totalTaxableIncome : prevForm.totalTaxableIncome,
      ),
      dependents: Math.max(
        0,
        Math.floor(
          safePayrollNumber(patch.dependents !== undefined ? patch.dependents : prevForm.dependents),
        ),
      ),
      familyDeduction: safePayrollNumber(
        patch.familyDeduction !== undefined ? patch.familyDeduction : prevForm.familyDeduction,
      ),
      unemploymentInsurance: safePayrollNumber(
        patch.unemploymentInsurance !== undefined
          ? patch.unemploymentInsurance
          : prevForm.unemploymentInsurance,
      ),
      socialInsurance: safePayrollNumber(
        patch.socialInsurance !== undefined ? patch.socialInsurance : prevForm.socialInsurance,
      ),
      healthInsurance: safePayrollNumber(
        patch.healthInsurance !== undefined ? patch.healthInsurance : prevForm.healthInsurance,
      ),
      taxPayable: safePayrollNumber(
        patch.taxPayable !== undefined ? patch.taxPayable : prevForm.taxPayable,
      ),
      taxPaid: safePayrollNumber(patch.taxPaid !== undefined ? patch.taxPaid : prevForm.taxPaid),
    },
  };
}

export function formatPayrollMoney(value: unknown): string {
  return safePayrollNumber(value).toLocaleString('vi-VN');
}

export function matchesTaxSettlementEmployeeSearch(
  emp: TaxSettlementEmployeeRow | null | undefined,
  query: string,
): boolean {
  if (!emp) return false;
  const needle = (query ?? '').toLowerCase();
  const name = employeeDisplayName(emp.name).toLowerCase();
  const code = (typeof emp.code === 'string' ? emp.code : '').toLowerCase();
  return name.includes(needle) || code.includes(needle);
}
