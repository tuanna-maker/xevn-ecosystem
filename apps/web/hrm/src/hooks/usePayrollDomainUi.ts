/**
 * @CODE-MEMORY
 * Screen:     /payroll — hook wire domain useReducer
 * UC:         UC-HRM-PAY · UX-06 / P0-c
 * Purpose:    Expose state + SetStateAction-compatible setters từ 5 domain
 *             reducers để Payroll.tsx thay useState mà không rewrite JSX.
 * WorkItem:   D-UX-P0C-PAYROLL-REDUCER-01
 * Coded:      2026-07-28
 * Callers:    pages/Payroll.tsx
 * Callees:    components/payroll/payrollDomainUi.ts
 * must_keep:  taxSettlementFloatingUi không nằm hook này (C1 riêng)
 * LastVerified: docs/qa/evidence/d-ux-p0c-payroll-reducer-01-20260728.md
 *
 * @CODE-MEMORY-CHANGE 2026-07-28
 * WorkItem: D-UX-P0C-PAYROLL-REDUCER-01
 * change_mode: ADD
 * What: Hook 5 domain slices (shell/advance/taxUi/salaryComponent/batch)
 * Why: P0-c — giảm race modal/tab/form; atomic open/close
 * must_keep: SalaryComponentsTab Zod+RHF; floating UI C1; Clock-In untouched
 *
 * @CODE-MEMORY-CHANGE 2026-07-28
 * WorkItem: D-UX-P0C-PAYROLL-REDUCER-01
 * change_mode: FIX
 * What: Bổ sung on*OpenChange + open/close atomic cho dialog race-prone
 *       (tax/advance/salary/batch) — Esc/overlay đóng cũng reset form
 * Why: Boolean setShow(false) không gọi CLOSE_* → form stale (UX-06)
 * must_keep: taxSettlementFloatingUi C1 ngoài hook; SalaryComponentsTab D5
 *
 * @CODE-MEMORY-CHANGE 2026-08-03
 * WorkItem: PO-E2E-SPINE-01-FE-VITE-PAY-CON-01
 * change_mode: FIX
 * What: Restore usePayrollDomainUi từ stash 43c479a (Payroll transitive mount)
 * Why: QA W5 Vite Payroll chain sau taxSettlementFloatingUi
 * must_keep: atomic open/close; C1 taxSettlement ngoài hook; Leave untouched
 */
import { useCallback, useMemo, useReducer, type Dispatch, type SetStateAction } from 'react';
import {
  createInitialPayrollAdvanceUiState,
  createInitialPayrollBatchUiState,
  createInitialPayrollSalaryComponentUiState,
  createInitialPayrollShellUiState,
  createInitialPayrollTaxSettlementUiState,
  payrollAdvanceUiReducer,
  payrollBatchUiReducer,
  payrollSalaryComponentUiReducer,
  payrollShellUiReducer,
  payrollTaxSettlementUiReducer,
  type PayrollAdvanceUiAction,
  type PayrollAdvanceUiState,
  type PayrollBatchUiAction,
  type PayrollBatchUiState,
  type PayrollSalaryComponentUiAction,
  type PayrollSalaryComponentUiState,
  type PayrollShellUiAction,
  type PayrollShellUiState,
  type PayrollTaxSettlementUiAction,
  type PayrollTaxSettlementUiState,
  type SalaryComponentEditForm,
  type Updater,
} from '@/components/payroll/payrollDomainUi';

function makeFieldSetter<S extends object, A extends { type: string }>(
  dispatch: Dispatch<A>,
  field: keyof S,
): Dispatch<SetStateAction<S[keyof S]>> {
  return (value) => {
    dispatch({
      type: 'SET_FIELD',
      field,
      value: value as Updater<S[keyof S]>,
    } as A);
  };
}

export type UsePayrollDomainUiOptions<TAdvance, TSettlement, TTaxEmp, TSalary, TPayment, TSummary> = {
  /** unused — generics inferred from call site when casting */
  _brand?: {
    advance: TAdvance;
    settlement: TSettlement;
    taxEmp: TTaxEmp;
    salary: TSalary;
    payment: TPayment;
    summary: TSummary;
  };
};

/**
 * Domain UI state for Payroll shell.
 * taxSettlementFloatingUi remains in Payroll (C1 must_keep).
 */
export function usePayrollDomainUi<
  TAdvance = unknown,
  TSettlement = unknown,
  TTaxEmp = unknown,
  TSalary = unknown,
  TPayment = unknown,
  TSummary = unknown,
>() {
  const [shell, dispatchShell] = useReducer(
    payrollShellUiReducer,
    undefined,
    createInitialPayrollShellUiState,
  );
  const [advance, dispatchAdvance] = useReducer(
    payrollAdvanceUiReducer as (
      s: PayrollAdvanceUiState<TAdvance>,
      a: PayrollAdvanceUiAction<TAdvance>,
    ) => PayrollAdvanceUiState<TAdvance>,
    undefined,
    () => createInitialPayrollAdvanceUiState<TAdvance>(),
  );
  const [taxUi, dispatchTaxUi] = useReducer(
    payrollTaxSettlementUiReducer as (
      s: PayrollTaxSettlementUiState<TSettlement, TTaxEmp>,
      a: PayrollTaxSettlementUiAction<TSettlement, TTaxEmp>,
    ) => PayrollTaxSettlementUiState<TSettlement, TTaxEmp>,
    undefined,
    () => createInitialPayrollTaxSettlementUiState<TSettlement, TTaxEmp>(),
  );
  const [salaryUi, dispatchSalaryUi] = useReducer(
    payrollSalaryComponentUiReducer as (
      s: PayrollSalaryComponentUiState<TSalary>,
      a: PayrollSalaryComponentUiAction<TSalary>,
    ) => PayrollSalaryComponentUiState<TSalary>,
    undefined,
    () => createInitialPayrollSalaryComponentUiState<TSalary>(),
  );
  const [batchUi, dispatchBatchUi] = useReducer(
    payrollBatchUiReducer as (
      s: PayrollBatchUiState<TPayment, TSummary>,
      a: PayrollBatchUiAction<TPayment, TSummary>,
    ) => PayrollBatchUiState<TPayment, TSummary>,
    undefined,
    () => createInitialPayrollBatchUiState<TPayment, TSummary>(),
  );

  const shellSetters = useMemo(() => {
    const set = <K extends keyof PayrollShellUiState>(field: K) =>
      makeFieldSetter<PayrollShellUiState, PayrollShellUiAction>(
        dispatchShell,
        field,
      ) as Dispatch<SetStateAction<PayrollShellUiState[K]>>;
    return {
      setPayrollLiveBootstrapped: set('payrollLiveBootstrapped'),
      setActiveTab: set('activeTab'),
      setActiveDataSubTab: set('activeDataSubTab'),
      setActiveCalcSubTab: set('activeCalcSubTab'),
      setActivePolicySubTab: set('activePolicySubTab'),
      setSearchQuery: set('searchQuery'),
      setMonthFilter: set('monthFilter'),
      setSortField: set('sortField'),
      setSortDirection: set('sortDirection'),
      setPayrollDepartmentFilter: set('payrollDepartmentFilter'),
    };
  }, []);

  const advanceSetters = useMemo(() => {
    const set = <K extends keyof PayrollAdvanceUiState<TAdvance>>(field: K) =>
      makeFieldSetter<PayrollAdvanceUiState<TAdvance>, PayrollAdvanceUiAction<TAdvance>>(
        dispatchAdvance,
        field,
      ) as Dispatch<SetStateAction<PayrollAdvanceUiState<TAdvance>[K]>>;
    return {
      setShowAddAdvanceDialog: set('showAddAdvanceDialog'),
      setAdvanceFormData: set('advanceFormData'),
      setSelectedAdvanceBatch: set('selectedAdvanceBatch'),
      setSelectedAdvanceBatches: set('selectedAdvanceBatches'),
      setShowDeleteAdvanceDialog: set('showDeleteAdvanceDialog'),
      setAdvanceToDelete: set('advanceToDelete'),
      setShowEditAdvanceDialog: set('showEditAdvanceDialog'),
      setAdvanceToEdit: set('advanceToEdit'),
      setShowApprovalDialog: set('showApprovalDialog'),
      setApprovalAction: set('approvalAction'),
      setApprovalNote: set('approvalNote'),
    };
  }, []);

  const taxSetters = useMemo(() => {
    const set = <K extends keyof PayrollTaxSettlementUiState<TSettlement, TTaxEmp>>(field: K) =>
      makeFieldSetter<
        PayrollTaxSettlementUiState<TSettlement, TTaxEmp>,
        PayrollTaxSettlementUiAction<TSettlement, TTaxEmp>
      >(dispatchTaxUi, field) as Dispatch<
        SetStateAction<PayrollTaxSettlementUiState<TSettlement, TTaxEmp>[K]>
      >;
    return {
      setTaxSettlementSearch: set('taxSettlementSearch'),
      setTaxSettlementUnitFilter: set('taxSettlementUnitFilter'),
      setSelectedTaxSettlements: set('selectedTaxSettlements'),
      setShowAddTaxSettlementDialog: set('showAddTaxSettlementDialog'),
      setTaxSettlementFormData: set('taxSettlementFormData'),
      setSelectedTaxSettlement: set('selectedTaxSettlement'),
      setTaxSettlementDetailSearch: set('taxSettlementDetailSearch'),
      setTaxSettlementDetailStatusFilter: set('taxSettlementDetailStatusFilter'),
      setTaxSettlementDetailUnitFilter: set('taxSettlementDetailUnitFilter'),
      setSelectedTaxSettlementEmployees: set('selectedTaxSettlementEmployees'),
      setShowTaxRefundDialog: set('showTaxRefundDialog'),
      setTaxRefundFormData: set('taxRefundFormData'),
      setShowTaxDeductionDialog: set('showTaxDeductionDialog'),
      setTaxDeductionFormData: set('taxDeductionFormData'),
      setShowDeleteTaxEmployeeDialog: set('showDeleteTaxEmployeeDialog'),
      setTaxEmployeeToDelete: set('taxEmployeeToDelete'),
      setShowBulkDeleteTaxEmployeeDialog: set('showBulkDeleteTaxEmployeeDialog'),
    };
  }, []);

  const salarySetters = useMemo(() => {
    const set = <K extends keyof PayrollSalaryComponentUiState<TSalary>>(field: K) =>
      makeFieldSetter<
        PayrollSalaryComponentUiState<TSalary>,
        PayrollSalaryComponentUiAction<TSalary>
      >(dispatchSalaryUi, field) as Dispatch<
        SetStateAction<PayrollSalaryComponentUiState<TSalary>[K]>
      >;
    return {
      setSelectedSalaryComponents: set('selectedSalaryComponents'),
      setSalaryComponentStatusFilter: set('salaryComponentStatusFilter'),
      setSalaryComponentUnitFilter: set('salaryComponentUnitFilter'),
      setSalaryComponentsPage: set('salaryComponentsPage'),
      setShowEditSalaryComponentDialog: set('showEditSalaryComponentDialog'),
      setShowDeleteSalaryComponentDialog: set('showDeleteSalaryComponentDialog'),
      setSalaryComponentToEdit: set('salaryComponentToEdit'),
      setSalaryComponentToDelete: set('salaryComponentToDelete'),
      setEditSalaryComponentForm: set('editSalaryComponentForm'),
      setShowSystemComponentsDialog: set('showSystemComponentsDialog'),
      setSystemComponentsSearch: set('systemComponentsSearch'),
      setSystemComponentsTypeFilter: set('systemComponentsTypeFilter'),
      setSelectedSystemComponents: set('selectedSystemComponents'),
      setSystemComponentsPage: set('systemComponentsPage'),
    };
  }, []);

  const batchSetters = useMemo(() => {
    const set = <K extends keyof PayrollBatchUiState<TPayment, TSummary>>(field: K) =>
      makeFieldSetter<
        PayrollBatchUiState<TPayment, TSummary>,
        PayrollBatchUiAction<TPayment, TSummary>
      >(dispatchBatchUi, field) as Dispatch<
        SetStateAction<PayrollBatchUiState<TPayment, TSummary>[K]>
      >;
    return {
      setSelectedPayroll: set('selectedPayroll'),
      setSelectedPaymentBatch: set('selectedPaymentBatch'),
      setShowAddPaymentDialog: set('showAddPaymentDialog'),
      setSelectedEmployeesToAdd: set('selectedEmployeesToAdd'),
      setShowAddPayrollSummaryDialog: set('showAddPayrollSummaryDialog'),
      setShowDeletePayrollBatchDialog: set('showDeletePayrollBatchDialog'),
      setPayrollBatchToDelete: set('payrollBatchToDelete'),
      setSelectedPayrollSummaryBatch: set('selectedPayrollSummaryBatch'),
      setShowPayslipPrintDialog: set('showPayslipPrintDialog'),
      setPrintEmployeeIndex: set('printEmployeeIndex'),
      setSelectedPayrollBatches: set('selectedPayrollBatches'),
    };
  }, []);

  const bootstrapLivePayslips = useCallback(() => {
    dispatchShell({ type: 'BOOTSTRAP_LIVE_PAYSLIPS' });
  }, []);

  /** Dialog onOpenChange → OPEN/CLOSE atomic (UX-06: không để form stale khi đóng overlay/Esc). */
  const onAddAdvanceOpenChange = useCallback((open: boolean) => {
    dispatchAdvance({ type: open ? 'OPEN_ADD_ADVANCE' : 'CLOSE_ADD_ADVANCE' });
  }, []);
  const closeAddAdvance = useCallback(() => {
    dispatchAdvance({ type: 'CLOSE_ADD_ADVANCE' });
  }, []);
  const closeEditAdvance = useCallback(() => {
    dispatchAdvance({ type: 'CLOSE_EDIT_ADVANCE' });
  }, []);
  const onEditAdvanceOpenChange = useCallback((open: boolean) => {
    if (!open) dispatchAdvance({ type: 'CLOSE_EDIT_ADVANCE' });
  }, []);
  const closeDeleteAdvance = useCallback(() => {
    dispatchAdvance({ type: 'CLOSE_DELETE_ADVANCE' });
  }, []);
  const onDeleteAdvanceOpenChange = useCallback((open: boolean) => {
    if (!open) dispatchAdvance({ type: 'CLOSE_DELETE_ADVANCE' });
  }, []);
  const closeApproval = useCallback(() => {
    dispatchAdvance({ type: 'CLOSE_APPROVAL' });
  }, []);
  const onApprovalOpenChange = useCallback((open: boolean) => {
    if (!open) dispatchAdvance({ type: 'CLOSE_APPROVAL' });
  }, []);

  const openAddTaxSettlement = useCallback(() => {
    dispatchTaxUi({ type: 'OPEN_ADD_TAX_SETTLEMENT' });
  }, []);
  const closeAddTaxSettlement = useCallback(() => {
    dispatchTaxUi({ type: 'CLOSE_ADD_TAX_SETTLEMENT' });
  }, []);
  const onAddTaxSettlementOpenChange = useCallback((open: boolean) => {
    dispatchTaxUi({ type: open ? 'OPEN_ADD_TAX_SETTLEMENT' : 'CLOSE_ADD_TAX_SETTLEMENT' });
  }, []);
  const openTaxRefund = useCallback(() => {
    dispatchTaxUi({ type: 'OPEN_TAX_REFUND' });
  }, []);
  const closeTaxRefund = useCallback(() => {
    dispatchTaxUi({ type: 'CLOSE_TAX_REFUND' });
  }, []);
  const onTaxRefundOpenChange = useCallback((open: boolean) => {
    dispatchTaxUi({ type: open ? 'OPEN_TAX_REFUND' : 'CLOSE_TAX_REFUND' });
  }, []);
  const openTaxDeduction = useCallback(() => {
    dispatchTaxUi({ type: 'OPEN_TAX_DEDUCTION' });
  }, []);
  const closeTaxDeduction = useCallback(() => {
    dispatchTaxUi({ type: 'CLOSE_TAX_DEDUCTION' });
  }, []);
  const onTaxDeductionOpenChange = useCallback((open: boolean) => {
    dispatchTaxUi({ type: open ? 'OPEN_TAX_DEDUCTION' : 'CLOSE_TAX_DEDUCTION' });
  }, []);
  const openDeleteTaxEmployee = useCallback((employee: TTaxEmp) => {
    dispatchTaxUi({ type: 'OPEN_DELETE_TAX_EMPLOYEE', employee });
  }, []);
  const closeDeleteTaxEmployee = useCallback(() => {
    dispatchTaxUi({ type: 'CLOSE_DELETE_TAX_EMPLOYEE' });
  }, []);
  const onDeleteTaxEmployeeOpenChange = useCallback((open: boolean) => {
    if (!open) dispatchTaxUi({ type: 'CLOSE_DELETE_TAX_EMPLOYEE' });
  }, []);
  const openBulkDeleteTaxEmployee = useCallback(() => {
    dispatchTaxUi({ type: 'OPEN_BULK_DELETE_TAX_EMPLOYEE' });
  }, []);
  const closeBulkDeleteTaxEmployee = useCallback(() => {
    dispatchTaxUi({ type: 'CLOSE_BULK_DELETE_TAX_EMPLOYEE' });
  }, []);
  const onBulkDeleteTaxEmployeeOpenChange = useCallback((open: boolean) => {
    dispatchTaxUi({
      type: open ? 'OPEN_BULK_DELETE_TAX_EMPLOYEE' : 'CLOSE_BULK_DELETE_TAX_EMPLOYEE',
    });
  }, []);

  const openEditSalaryComponent = useCallback((component: TSalary, form: SalaryComponentEditForm) => {
    dispatchSalaryUi({ type: 'OPEN_EDIT_SALARY_COMPONENT', component, form });
  }, []);
  const closeEditSalaryComponent = useCallback(() => {
    dispatchSalaryUi({ type: 'CLOSE_EDIT_SALARY_COMPONENT' });
  }, []);
  const onEditSalaryComponentOpenChange = useCallback((open: boolean) => {
    if (!open) dispatchSalaryUi({ type: 'CLOSE_EDIT_SALARY_COMPONENT' });
  }, []);
  const openDeleteSalaryComponent = useCallback((component: TSalary) => {
    dispatchSalaryUi({ type: 'OPEN_DELETE_SALARY_COMPONENT', component });
  }, []);
  const closeDeleteSalaryComponent = useCallback(() => {
    dispatchSalaryUi({ type: 'CLOSE_DELETE_SALARY_COMPONENT' });
  }, []);
  const onDeleteSalaryComponentOpenChange = useCallback((open: boolean) => {
    if (!open) dispatchSalaryUi({ type: 'CLOSE_DELETE_SALARY_COMPONENT' });
  }, []);
  const openSystemComponents = useCallback(() => {
    dispatchSalaryUi({ type: 'OPEN_SYSTEM_COMPONENTS' });
  }, []);
  const closeSystemComponents = useCallback(() => {
    dispatchSalaryUi({ type: 'CLOSE_SYSTEM_COMPONENTS' });
  }, []);
  const onSystemComponentsOpenChange = useCallback((open: boolean) => {
    dispatchSalaryUi({ type: open ? 'OPEN_SYSTEM_COMPONENTS' : 'CLOSE_SYSTEM_COMPONENTS' });
  }, []);

  const openAddPayment = useCallback(() => {
    dispatchBatchUi({ type: 'OPEN_ADD_PAYMENT' });
  }, []);
  const closeAddPayment = useCallback(() => {
    dispatchBatchUi({ type: 'CLOSE_ADD_PAYMENT' });
  }, []);
  const onAddPaymentOpenChange = useCallback((open: boolean) => {
    dispatchBatchUi({ type: open ? 'OPEN_ADD_PAYMENT' : 'CLOSE_ADD_PAYMENT' });
  }, []);
  const closeDeletePayrollBatch = useCallback(() => {
    dispatchBatchUi({ type: 'CLOSE_DELETE_PAYROLL_BATCH' });
  }, []);
  const onDeletePayrollBatchOpenChange = useCallback((open: boolean) => {
    if (!open) dispatchBatchUi({ type: 'CLOSE_DELETE_PAYROLL_BATCH' });
  }, []);
  const closePayslipPrint = useCallback(() => {
    dispatchBatchUi({ type: 'CLOSE_PAYSLIP_PRINT' });
  }, []);
  const onPayslipPrintOpenChange = useCallback((open: boolean) => {
    if (!open) dispatchBatchUi({ type: 'CLOSE_PAYSLIP_PRINT' });
  }, []);

  return {
    // shell
    ...shell,
    ...shellSetters,
    bootstrapLivePayslips,
    // advance
    ...advance,
    ...advanceSetters,
    closeAddAdvance,
    onAddAdvanceOpenChange,
    closeEditAdvance,
    onEditAdvanceOpenChange,
    closeDeleteAdvance,
    onDeleteAdvanceOpenChange,
    closeApproval,
    onApprovalOpenChange,
    dispatchAdvance,
    // tax UI
    ...taxUi,
    ...taxSetters,
    openAddTaxSettlement,
    closeAddTaxSettlement,
    onAddTaxSettlementOpenChange,
    openTaxRefund,
    closeTaxRefund,
    onTaxRefundOpenChange,
    openTaxDeduction,
    closeTaxDeduction,
    onTaxDeductionOpenChange,
    openDeleteTaxEmployee,
    closeDeleteTaxEmployee,
    onDeleteTaxEmployeeOpenChange,
    openBulkDeleteTaxEmployee,
    closeBulkDeleteTaxEmployee,
    onBulkDeleteTaxEmployeeOpenChange,
    dispatchTaxUi,
    // salary UI
    ...salaryUi,
    ...salarySetters,
    openEditSalaryComponent,
    closeEditSalaryComponent,
    onEditSalaryComponentOpenChange,
    openDeleteSalaryComponent,
    closeDeleteSalaryComponent,
    onDeleteSalaryComponentOpenChange,
    openSystemComponents,
    closeSystemComponents,
    onSystemComponentsOpenChange,
    dispatchSalaryUi,
    // batch
    ...batchUi,
    ...batchSetters,
    openAddPayment,
    closeAddPayment,
    onAddPaymentOpenChange,
    closeDeletePayrollBatch,
    onDeletePayrollBatchOpenChange,
    closePayslipPrint,
    onPayslipPrintOpenChange,
    dispatchBatchUi,
  };
}
