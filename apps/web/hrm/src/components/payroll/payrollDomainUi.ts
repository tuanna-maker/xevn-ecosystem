/**
 * @CODE-MEMORY
 * Screen:     /payroll — domain UI state (shell / advance / tax / salary / batch)
 * UC:         UC-HRM-PAY · UX-06 / P0-c
 * BR:         UX-PRODUCT-RULES §3.4 state smell — modal+form atomic reset
 * SRS:        docs/program/UX-UI-ERP-ANALYSIS.md §5 P0-c
 * TechSpec:   _vibe-team-os/UX-PRODUCT-RULES.md §3.4
 * Purpose:    Gom 25+ useState race-prone (tab / modal / form) thành useReducer
 *             theo domain. Open/close atomic — tránh form còn khi dialog đóng.
 * WorkItem:   D-UX-P0C-PAYROLL-REDUCER-01
 * Coded:      2026-07-28
 * Callers:    pages/Payroll.tsx · vitest payrollDomainUi.test.ts
 * Callees:    (pure reducers — không API)
 * FE-Actions: | Đổi tab shell | SET_ACTIVE_TAB / BOOTSTRAP_LIVE | state |
 *             | Mở/đóng dialog tạm ứng | OPEN_xxx / CLOSE_xxx | atomic reset |
 *             | Mở/đóng sửa thành phần lương | OPEN_EDIT / CLOSE_EDIT | atomic |
 * Impact:     Thiếu atomic close → race UI/data giữa nested modal (P0-b root)
 * must_keep:  taxSettlementFloatingUi C1 riêng; SalaryComponentsTab Zod+RHF D5;
 *             không đụng Clock-In / Attendance
 * SOLID:      Pure domain reducers — tách khỏi shell Payroll 4k+ LOC
 * LastVerified: docs/qa/evidence/d-ux-p0c-payroll-reducer-01-20260728.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-03
 * WorkItem: PO-E2E-SPINE-01-FE-VITE-PAY-CON-01
 * change_mode: FIX
 * What: Restore payrollDomainUi từ stash 43c479a (dep usePayrollDomainUi)
 * Why: Transitive Vite resolve — Payroll mount / CC Tiền lương
 * must_keep: pure reducers; C1 taxSettlement riêng; Clock-In untouched
 */

export type Updater<T> = T | ((prev: T) => T);

export function resolveUpdater<T>(prev: T, update: Updater<T>): T {
  return typeof update === 'function' ? (update as (p: T) => T)(prev) : update;
}

/* ─── Shell (tab / filter / sort) ─────────────────────────────────────────── */

export type PayrollShellUiState = {
  payrollLiveBootstrapped: boolean;
  activeTab: string;
  activeDataSubTab: string;
  activeCalcSubTab: string;
  activePolicySubTab: string;
  searchQuery: string;
  monthFilter: string;
  sortField: 'name' | 'department' | 'baseSalary' | 'netSalary' | null;
  sortDirection: 'asc' | 'desc';
  payrollDepartmentFilter: string;
};

export type PayrollShellUiAction =
  | { type: 'SET_FIELD'; field: keyof PayrollShellUiState; value: Updater<PayrollShellUiState[keyof PayrollShellUiState]> }
  | { type: 'BOOTSTRAP_LIVE_PAYSLIPS' }
  | { type: 'SET_ACTIVE_TAB'; tab: string }
  | { type: 'SET_CALC_SUB_TAB'; tab: string };

export function createInitialPayrollShellUiState(): PayrollShellUiState {
  return {
    payrollLiveBootstrapped: false,
    activeTab: 'overview',
    activeDataSubTab: 'data-attendance',
    activeCalcSubTab: 'calc-list',
    activePolicySubTab: 'tax',
    searchQuery: '',
    monthFilter: '2024-01',
    sortField: null,
    sortDirection: 'asc',
    payrollDepartmentFilter: 'all',
  };
}

export function payrollShellUiReducer(
  state: PayrollShellUiState,
  action: PayrollShellUiAction,
): PayrollShellUiState {
  switch (action.type) {
    case 'SET_FIELD': {
      const prev = state[action.field];
      const next = resolveUpdater(prev, action.value as Updater<typeof prev>);
      if (next === prev) return state;
      return { ...state, [action.field]: next };
    }
    case 'BOOTSTRAP_LIVE_PAYSLIPS':
      if (state.payrollLiveBootstrapped) return state;
      return {
        ...state,
        payrollLiveBootstrapped: true,
        activeTab: 'calculate',
        activeCalcSubTab: 'calc-list',
      };
    case 'SET_ACTIVE_TAB':
      return { ...state, activeTab: action.tab };
    case 'SET_CALC_SUB_TAB':
      return { ...state, activeCalcSubTab: action.tab };
    default:
      return state;
  }
}

/* ─── Advance (+ approval dialog) ─────────────────────────────────────────── */

export type AdvanceFormData = {
  payrollBatch: string;
  department: string;
  position: string;
  employeeType: string;
  advanceName: string;
  description: string;
};

export type PayrollAdvanceUiState<TBatch = unknown> = {
  showAddAdvanceDialog: boolean;
  advanceFormData: AdvanceFormData;
  selectedAdvanceBatch: TBatch | null;
  selectedAdvanceBatches: string[];
  showDeleteAdvanceDialog: boolean;
  advanceToDelete: TBatch | null;
  showEditAdvanceDialog: boolean;
  advanceToEdit: TBatch | null;
  showApprovalDialog: boolean;
  approvalAction: 'approve' | 'reject';
  approvalNote: string;
};

export type PayrollAdvanceUiAction<TBatch = unknown> =
  | {
      type: 'SET_FIELD';
      field: keyof PayrollAdvanceUiState<TBatch>;
      value: Updater<PayrollAdvanceUiState<TBatch>[keyof PayrollAdvanceUiState<TBatch>]>;
    }
  | { type: 'OPEN_ADD_ADVANCE' }
  | { type: 'CLOSE_ADD_ADVANCE' }
  | { type: 'OPEN_EDIT_ADVANCE'; batch: TBatch }
  | { type: 'CLOSE_EDIT_ADVANCE' }
  | { type: 'OPEN_DELETE_ADVANCE'; batch: TBatch }
  | { type: 'CLOSE_DELETE_ADVANCE' }
  | { type: 'OPEN_APPROVAL'; action: 'approve' | 'reject' }
  | { type: 'CLOSE_APPROVAL' }
  | { type: 'RESET_ADVANCE_SELECTION' };

export function createEmptyAdvanceFormData(): AdvanceFormData {
  return {
    payrollBatch: '',
    department: '',
    position: 'all',
    employeeType: 'all',
    advanceName: '',
    description: '',
  };
}

export function createInitialPayrollAdvanceUiState<TBatch = unknown>(): PayrollAdvanceUiState<TBatch> {
  return {
    showAddAdvanceDialog: false,
    advanceFormData: createEmptyAdvanceFormData(),
    selectedAdvanceBatch: null,
    selectedAdvanceBatches: [],
    showDeleteAdvanceDialog: false,
    advanceToDelete: null,
    showEditAdvanceDialog: false,
    advanceToEdit: null,
    showApprovalDialog: false,
    approvalAction: 'approve',
    approvalNote: '',
  };
}

export function payrollAdvanceUiReducer<TBatch = unknown>(
  state: PayrollAdvanceUiState<TBatch>,
  action: PayrollAdvanceUiAction<TBatch>,
): PayrollAdvanceUiState<TBatch> {
  switch (action.type) {
    case 'SET_FIELD': {
      const prev = state[action.field];
      const next = resolveUpdater(prev, action.value as Updater<typeof prev>);
      if (next === prev) return state;
      return { ...state, [action.field]: next };
    }
    case 'OPEN_ADD_ADVANCE':
      return {
        ...state,
        showAddAdvanceDialog: true,
        advanceFormData: createEmptyAdvanceFormData(),
      };
    case 'CLOSE_ADD_ADVANCE':
      return {
        ...state,
        showAddAdvanceDialog: false,
        advanceFormData: createEmptyAdvanceFormData(),
      };
    case 'OPEN_EDIT_ADVANCE':
      return {
        ...state,
        showEditAdvanceDialog: true,
        advanceToEdit: action.batch,
      };
    case 'CLOSE_EDIT_ADVANCE':
      return {
        ...state,
        showEditAdvanceDialog: false,
        advanceToEdit: null,
      };
    case 'OPEN_DELETE_ADVANCE':
      return {
        ...state,
        showDeleteAdvanceDialog: true,
        advanceToDelete: action.batch,
      };
    case 'CLOSE_DELETE_ADVANCE':
      return {
        ...state,
        showDeleteAdvanceDialog: false,
        advanceToDelete: null,
      };
    case 'OPEN_APPROVAL':
      return {
        ...state,
        showApprovalDialog: true,
        approvalAction: action.action,
        approvalNote: '',
      };
    case 'CLOSE_APPROVAL':
      return {
        ...state,
        showApprovalDialog: false,
        approvalNote: '',
        approvalAction: 'approve',
      };
    case 'RESET_ADVANCE_SELECTION':
      return { ...state, selectedAdvanceBatches: [] };
    default:
      return state;
  }
}

/* ─── Tax settlement UI (list/dialogs — floating edit = C1 riêng) ─────────── */

export type TaxSettlementFormData = {
  year: number;
  appliedUnits: string[];
  name: string;
  monthlyTaxTables: Record<number, string>;
};

export type TaxRefundFormData = {
  date: Date;
  appliedUnits: string[];
  position: string;
  employeeType: 'all' | 'selected';
  name: string;
  incomeType: string;
};

export type TaxDeductionFormData = {
  date: Date;
  appliedUnits: string[];
  position: string;
  employeeType: 'all' | 'selected';
  name: string;
  deductionType: string;
};

export type PayrollTaxSettlementUiState<TSettlement = unknown, TEmployee = unknown> = {
  taxSettlementSearch: string;
  taxSettlementUnitFilter: string;
  selectedTaxSettlements: string[];
  showAddTaxSettlementDialog: boolean;
  taxSettlementFormData: TaxSettlementFormData;
  selectedTaxSettlement: TSettlement | null;
  taxSettlementDetailSearch: string;
  taxSettlementDetailStatusFilter: string;
  taxSettlementDetailUnitFilter: string;
  selectedTaxSettlementEmployees: string[];
  showTaxRefundDialog: boolean;
  taxRefundFormData: TaxRefundFormData;
  showTaxDeductionDialog: boolean;
  taxDeductionFormData: TaxDeductionFormData;
  showDeleteTaxEmployeeDialog: boolean;
  taxEmployeeToDelete: TEmployee | null;
  showBulkDeleteTaxEmployeeDialog: boolean;
};

export type PayrollTaxSettlementUiAction<TSettlement = unknown, TEmployee = unknown> =
  | {
      type: 'SET_FIELD';
      field: keyof PayrollTaxSettlementUiState<TSettlement, TEmployee>;
      value: Updater<
        PayrollTaxSettlementUiState<TSettlement, TEmployee>[keyof PayrollTaxSettlementUiState<
          TSettlement,
          TEmployee
        >]
      >;
    }
  | { type: 'OPEN_ADD_TAX_SETTLEMENT' }
  | { type: 'CLOSE_ADD_TAX_SETTLEMENT' }
  | { type: 'OPEN_TAX_REFUND' }
  | { type: 'CLOSE_TAX_REFUND' }
  | { type: 'OPEN_TAX_DEDUCTION' }
  | { type: 'CLOSE_TAX_DEDUCTION' }
  | { type: 'OPEN_DELETE_TAX_EMPLOYEE'; employee: TEmployee }
  | { type: 'CLOSE_DELETE_TAX_EMPLOYEE' }
  | { type: 'OPEN_BULK_DELETE_TAX_EMPLOYEE' }
  | { type: 'CLOSE_BULK_DELETE_TAX_EMPLOYEE' }
  | { type: 'CLEAR_TAX_EMPLOYEE_SELECTION' };

export function createEmptyTaxSettlementFormData(): TaxSettlementFormData {
  return {
    year: new Date().getFullYear(),
    appliedUnits: [],
    name: '',
    monthlyTaxTables: {},
  };
}

export function createEmptyTaxRefundFormData(): TaxRefundFormData {
  return {
    date: new Date(),
    appliedUnits: [],
    position: 'all',
    employeeType: 'all',
    name: '',
    incomeType: 'Thuế TNCN được hoàn',
  };
}

export function createEmptyTaxDeductionFormData(): TaxDeductionFormData {
  return {
    date: new Date(),
    appliedUnits: [],
    position: 'all',
    employeeType: 'all',
    name: '',
    deductionType: 'Thuế TNCN khấu trừ',
  };
}

export function createInitialPayrollTaxSettlementUiState<
  TSettlement = unknown,
  TEmployee = unknown,
>(): PayrollTaxSettlementUiState<TSettlement, TEmployee> {
  return {
    taxSettlementSearch: '',
    taxSettlementUnitFilter: 'all',
    selectedTaxSettlements: [],
    showAddTaxSettlementDialog: false,
    taxSettlementFormData: createEmptyTaxSettlementFormData(),
    selectedTaxSettlement: null,
    taxSettlementDetailSearch: '',
    taxSettlementDetailStatusFilter: 'all',
    taxSettlementDetailUnitFilter: 'all',
    selectedTaxSettlementEmployees: [],
    showTaxRefundDialog: false,
    taxRefundFormData: createEmptyTaxRefundFormData(),
    showTaxDeductionDialog: false,
    taxDeductionFormData: createEmptyTaxDeductionFormData(),
    showDeleteTaxEmployeeDialog: false,
    taxEmployeeToDelete: null,
    showBulkDeleteTaxEmployeeDialog: false,
  };
}

export function payrollTaxSettlementUiReducer<TSettlement = unknown, TEmployee = unknown>(
  state: PayrollTaxSettlementUiState<TSettlement, TEmployee>,
  action: PayrollTaxSettlementUiAction<TSettlement, TEmployee>,
): PayrollTaxSettlementUiState<TSettlement, TEmployee> {
  switch (action.type) {
    case 'SET_FIELD': {
      const prev = state[action.field];
      const next = resolveUpdater(prev, action.value as Updater<typeof prev>);
      if (next === prev) return state;
      return { ...state, [action.field]: next };
    }
    case 'OPEN_ADD_TAX_SETTLEMENT':
      return {
        ...state,
        showAddTaxSettlementDialog: true,
        taxSettlementFormData: createEmptyTaxSettlementFormData(),
      };
    case 'CLOSE_ADD_TAX_SETTLEMENT':
      return {
        ...state,
        showAddTaxSettlementDialog: false,
        taxSettlementFormData: createEmptyTaxSettlementFormData(),
      };
    case 'OPEN_TAX_REFUND':
      return {
        ...state,
        showTaxRefundDialog: true,
        taxRefundFormData: createEmptyTaxRefundFormData(),
      };
    case 'CLOSE_TAX_REFUND':
      return {
        ...state,
        showTaxRefundDialog: false,
        taxRefundFormData: createEmptyTaxRefundFormData(),
      };
    case 'OPEN_TAX_DEDUCTION':
      return {
        ...state,
        showTaxDeductionDialog: true,
        taxDeductionFormData: createEmptyTaxDeductionFormData(),
      };
    case 'CLOSE_TAX_DEDUCTION':
      return {
        ...state,
        showTaxDeductionDialog: false,
        taxDeductionFormData: createEmptyTaxDeductionFormData(),
      };
    case 'OPEN_DELETE_TAX_EMPLOYEE':
      return {
        ...state,
        showDeleteTaxEmployeeDialog: true,
        taxEmployeeToDelete: action.employee,
      };
    case 'CLOSE_DELETE_TAX_EMPLOYEE':
      return {
        ...state,
        showDeleteTaxEmployeeDialog: false,
        taxEmployeeToDelete: null,
      };
    case 'OPEN_BULK_DELETE_TAX_EMPLOYEE':
      return { ...state, showBulkDeleteTaxEmployeeDialog: true };
    case 'CLOSE_BULK_DELETE_TAX_EMPLOYEE':
      return { ...state, showBulkDeleteTaxEmployeeDialog: false };
    case 'CLEAR_TAX_EMPLOYEE_SELECTION':
      return { ...state, selectedTaxSettlementEmployees: [] };
    default:
      return state;
  }
}

/* ─── Salary component dialogs (live Add = SalaryComponentsTab D5) ─────────── */

export type SalaryComponentEditForm = {
  code: string;
  name: string;
  appliedUnit: string;
  componentType: string;
  nature: 'income' | 'deduction' | 'other';
  valueType: 'currency' | 'number' | 'percentage';
  formula: string;
};

export type PayrollSalaryComponentUiState<TComponent = unknown> = {
  selectedSalaryComponents: string[];
  salaryComponentStatusFilter: string;
  salaryComponentUnitFilter: string;
  salaryComponentsPage: number;
  showEditSalaryComponentDialog: boolean;
  showDeleteSalaryComponentDialog: boolean;
  salaryComponentToEdit: TComponent | null;
  salaryComponentToDelete: TComponent | null;
  editSalaryComponentForm: SalaryComponentEditForm;
  showSystemComponentsDialog: boolean;
  systemComponentsSearch: string;
  systemComponentsTypeFilter: string;
  selectedSystemComponents: string[];
  systemComponentsPage: number;
};

export type PayrollSalaryComponentUiAction<TComponent = unknown> =
  | {
      type: 'SET_FIELD';
      field: keyof PayrollSalaryComponentUiState<TComponent>;
      value: Updater<
        PayrollSalaryComponentUiState<TComponent>[keyof PayrollSalaryComponentUiState<TComponent>]
      >;
    }
  | {
      type: 'OPEN_EDIT_SALARY_COMPONENT';
      component: TComponent;
      form: SalaryComponentEditForm;
    }
  | { type: 'CLOSE_EDIT_SALARY_COMPONENT' }
  | { type: 'OPEN_DELETE_SALARY_COMPONENT'; component: TComponent }
  | { type: 'CLOSE_DELETE_SALARY_COMPONENT' }
  | { type: 'OPEN_SYSTEM_COMPONENTS' }
  | { type: 'CLOSE_SYSTEM_COMPONENTS' };

export function createEmptySalaryComponentEditForm(): SalaryComponentEditForm {
  return {
    code: '',
    name: '',
    appliedUnit: '',
    componentType: '',
    nature: 'other',
    valueType: 'number',
    formula: '',
  };
}

export function createInitialPayrollSalaryComponentUiState<
  TComponent = unknown,
>(): PayrollSalaryComponentUiState<TComponent> {
  return {
    selectedSalaryComponents: [],
    salaryComponentStatusFilter: 'all',
    salaryComponentUnitFilter: 'all',
    salaryComponentsPage: 1,
    showEditSalaryComponentDialog: false,
    showDeleteSalaryComponentDialog: false,
    salaryComponentToEdit: null,
    salaryComponentToDelete: null,
    editSalaryComponentForm: createEmptySalaryComponentEditForm(),
    showSystemComponentsDialog: false,
    systemComponentsSearch: '',
    systemComponentsTypeFilter: 'all',
    selectedSystemComponents: [],
    systemComponentsPage: 1,
  };
}

export function payrollSalaryComponentUiReducer<TComponent = unknown>(
  state: PayrollSalaryComponentUiState<TComponent>,
  action: PayrollSalaryComponentUiAction<TComponent>,
): PayrollSalaryComponentUiState<TComponent> {
  switch (action.type) {
    case 'SET_FIELD': {
      const prev = state[action.field];
      const next = resolveUpdater(prev, action.value as Updater<typeof prev>);
      if (next === prev) return state;
      return { ...state, [action.field]: next };
    }
    case 'OPEN_EDIT_SALARY_COMPONENT':
      return {
        ...state,
        showEditSalaryComponentDialog: true,
        salaryComponentToEdit: action.component,
        editSalaryComponentForm: { ...action.form },
      };
    case 'CLOSE_EDIT_SALARY_COMPONENT':
      return {
        ...state,
        showEditSalaryComponentDialog: false,
        salaryComponentToEdit: null,
        editSalaryComponentForm: createEmptySalaryComponentEditForm(),
      };
    case 'OPEN_DELETE_SALARY_COMPONENT':
      return {
        ...state,
        showDeleteSalaryComponentDialog: true,
        salaryComponentToDelete: action.component,
      };
    case 'CLOSE_DELETE_SALARY_COMPONENT':
      return {
        ...state,
        showDeleteSalaryComponentDialog: false,
        salaryComponentToDelete: null,
      };
    case 'OPEN_SYSTEM_COMPONENTS':
      return {
        ...state,
        showSystemComponentsDialog: true,
        systemComponentsSearch: '',
        systemComponentsTypeFilter: 'all',
        selectedSystemComponents: [],
        systemComponentsPage: 1,
      };
    case 'CLOSE_SYSTEM_COMPONENTS':
      return {
        ...state,
        showSystemComponentsDialog: false,
        systemComponentsSearch: '',
        systemComponentsTypeFilter: 'all',
        selectedSystemComponents: [],
        systemComponentsPage: 1,
      };
    default:
      return state;
  }
}

/* ─── Payment / payroll-summary batch dialogs ─────────────────────────────── */

export type PayrollBatchUiState<TPayment = unknown, TSummary = unknown> = {
  selectedPayroll: unknown | null;
  selectedPaymentBatch: TPayment | null;
  showAddPaymentDialog: boolean;
  selectedEmployeesToAdd: string[];
  showAddPayrollSummaryDialog: boolean;
  showDeletePayrollBatchDialog: boolean;
  payrollBatchToDelete: TSummary | null;
  selectedPayrollSummaryBatch: TSummary | null;
  showPayslipPrintDialog: boolean;
  printEmployeeIndex: number;
  selectedPayrollBatches: string[];
};

export type PayrollBatchUiAction<TPayment = unknown, TSummary = unknown> =
  | {
      type: 'SET_FIELD';
      field: keyof PayrollBatchUiState<TPayment, TSummary>;
      value: Updater<
        PayrollBatchUiState<TPayment, TSummary>[keyof PayrollBatchUiState<TPayment, TSummary>]
      >;
    }
  | { type: 'OPEN_ADD_PAYMENT' }
  | { type: 'CLOSE_ADD_PAYMENT' }
  | { type: 'OPEN_DELETE_PAYROLL_BATCH'; batch: TSummary }
  | { type: 'CLOSE_DELETE_PAYROLL_BATCH' }
  | { type: 'OPEN_PAYSLIP_PRINT'; index?: number }
  | { type: 'CLOSE_PAYSLIP_PRINT' }
  | { type: 'CLEAR_PAYROLL_BATCH_SELECTION' };

export function createInitialPayrollBatchUiState<
  TPayment = unknown,
  TSummary = unknown,
>(): PayrollBatchUiState<TPayment, TSummary> {
  return {
    selectedPayroll: null,
    selectedPaymentBatch: null,
    showAddPaymentDialog: false,
    selectedEmployeesToAdd: [],
    showAddPayrollSummaryDialog: false,
    showDeletePayrollBatchDialog: false,
    payrollBatchToDelete: null,
    selectedPayrollSummaryBatch: null,
    showPayslipPrintDialog: false,
    printEmployeeIndex: 0,
    selectedPayrollBatches: [],
  };
}

export function payrollBatchUiReducer<TPayment = unknown, TSummary = unknown>(
  state: PayrollBatchUiState<TPayment, TSummary>,
  action: PayrollBatchUiAction<TPayment, TSummary>,
): PayrollBatchUiState<TPayment, TSummary> {
  switch (action.type) {
    case 'SET_FIELD': {
      const prev = state[action.field];
      const next = resolveUpdater(prev, action.value as Updater<typeof prev>);
      if (next === prev) return state;
      return { ...state, [action.field]: next };
    }
    case 'OPEN_ADD_PAYMENT':
      return {
        ...state,
        showAddPaymentDialog: true,
        selectedEmployeesToAdd: [],
      };
    case 'CLOSE_ADD_PAYMENT':
      return {
        ...state,
        showAddPaymentDialog: false,
        selectedEmployeesToAdd: [],
      };
    case 'OPEN_DELETE_PAYROLL_BATCH':
      return {
        ...state,
        showDeletePayrollBatchDialog: true,
        payrollBatchToDelete: action.batch,
      };
    case 'CLOSE_DELETE_PAYROLL_BATCH':
      return {
        ...state,
        showDeletePayrollBatchDialog: false,
        payrollBatchToDelete: null,
      };
    case 'OPEN_PAYSLIP_PRINT':
      return {
        ...state,
        showPayslipPrintDialog: true,
        printEmployeeIndex: action.index ?? 0,
      };
    case 'CLOSE_PAYSLIP_PRINT':
      return {
        ...state,
        showPayslipPrintDialog: false,
        printEmployeeIndex: 0,
      };
    case 'CLEAR_PAYROLL_BATCH_SELECTION':
      return { ...state, selectedPayrollBatches: [] };
    default:
      return state;
  }
}

/** calc-list surface — decoupled from global payslip count (PO-HRM-E2E-LINK-PAY-HIRE-FE-02) */
export type PayrollCalcListSurface = 'batches' | 'payslips-api';

export function resolveCalcListTabComponent(_livePayslipCount: number): PayrollCalcListSurface {
  void _livePayslipCount;
  return 'batches';
}

const PAYROLL_ELIGIBILITY_REASON_LABELS: Record<string, string> = {
  NOT_ACTIVE: 'Nhân viên không còn hiệu lực',
  NO_CLOSED_SHEET: 'Chưa có bảng chấm công đã khóa trong kỳ',
  HIRE_MID_MONTH: 'Tuyển mới giữa kỳ lương',
  NOT_FOUND: 'Không thuộc phạm vi công ty',
};

export function formatPayrollEligibilityReason(code: string): string {
  return PAYROLL_ELIGIBILITY_REASON_LABELS[code] ?? code;
}

export type PayrollEligibilityRow = {
  eligible: boolean;
  reasons: string[];
};

export function mapEligibilityByEmployeeId(
  items: Array<{ employee_id: string; eligible: boolean; reasons: string[] }>,
): Map<string, PayrollEligibilityRow> {
  return new Map(items.map((item) => [item.employee_id, { eligible: item.eligible, reasons: item.reasons }]));
}

/**
 * Fail-closed enroll gate — checkbox chỉ bật khi BE đã trả và eligible===true.
 * PO-HRM-E2E-LINK-PAY-HIRE-FE-05 · R-PAY-HIRE-ELIG-UI-ENABLED-MISMATCH
 */
export function isPayrollEmployeeEligibleForEnroll(
  eligibilityByEmployeeId: Map<string, PayrollEligibilityRow>,
  employeeId: string,
  options: { eligibilityReady: boolean },
): boolean {
  if (!options.eligibilityReady) return false;
  return eligibilityByEmployeeId.get(employeeId)?.eligible === true;
}

export function resolvePayrollEligibilityDisplay(
  eligibilityByEmployeeId: Map<string, PayrollEligibilityRow>,
  employeeId: string,
  options: { eligibilityReady: boolean },
): { isEligible: boolean; reasonCodes: string[] } {
  if (!options.eligibilityReady) {
    return { isEligible: false, reasonCodes: [] };
  }
  const row = eligibilityByEmployeeId.get(employeeId);
  if (!row) {
    return { isEligible: false, reasonCodes: ['NOT_FOUND'] };
  }
  return { isEligible: row.eligible === true, reasonCodes: row.reasons };
}
