import { describe, expect, it } from 'vitest';
import {
  createEmptyAdvanceFormData,
  createEmptySalaryComponentEditForm,
  createEmptyTaxSettlementFormData,
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
  resolveUpdater,
  resolveCalcListTabComponent,
  formatPayrollEligibilityReason,
  isPayrollEmployeeEligibleForEnroll,
  mapEligibilityByEmployeeId,
  resolvePayrollEligibilityDisplay,
} from '../payrollDomainUi';

describe('payrollDomainUi (D-UX-P0C-PAYROLL-REDUCER-01 / P0-c)', () => {
  it('resolveUpdater supports value and functional updater', () => {
    expect(resolveUpdater(1, 2)).toBe(2);
    expect(resolveUpdater(1, (p) => p + 3)).toBe(4);
  });

  describe('calc-list surface (PO-HRM-E2E-LINK-PAY-HIRE-FE-02)', () => {
    it('always resolves to batches tab even when live payslip count >= 1', () => {
      expect(resolveCalcListTabComponent(0)).toBe('batches');
      expect(resolveCalcListTabComponent(1)).toBe('batches');
      expect(resolveCalcListTabComponent(99)).toBe('batches');
    });

    it('maps eligibility reasons to Vietnamese labels', () => {
      expect(formatPayrollEligibilityReason('NO_CLOSED_SHEET')).toContain('chấm công');
      expect(formatPayrollEligibilityReason('UNKNOWN_CODE')).toBe('UNKNOWN_CODE');
    });

    it('indexes eligibility items by employee_id', () => {
      const map = mapEligibilityByEmployeeId([
        { employee_id: 'e1', eligible: false, reasons: ['NO_CLOSED_SHEET'] },
        { employee_id: 'e2', eligible: true, reasons: [] },
      ]);
      expect(map.get('e1')?.eligible).toBe(false);
      expect(map.get('e1')?.reasons).toEqual(['NO_CLOSED_SHEET']);
      expect(map.get('e2')?.eligible).toBe(true);
    });

    it('fail-closed enroll gate — PO-HRM-E2E-LINK-PAY-HIRE-FE-05', () => {
      const map = mapEligibilityByEmployeeId([
        { employee_id: 'e1', eligible: false, reasons: ['NO_CLOSED_SHEET'] },
        { employee_id: 'e2', eligible: true, reasons: [] },
      ]);
      const ready = { eligibilityReady: true };
      const notReady = { eligibilityReady: false };

      expect(isPayrollEmployeeEligibleForEnroll(map, 'e1', ready)).toBe(false);
      expect(isPayrollEmployeeEligibleForEnroll(map, 'e2', ready)).toBe(true);
      expect(isPayrollEmployeeEligibleForEnroll(map, 'missing', ready)).toBe(false);
      expect(isPayrollEmployeeEligibleForEnroll(map, 'e2', notReady)).toBe(false);

      expect(resolvePayrollEligibilityDisplay(map, 'e1', ready)).toEqual({
        isEligible: false,
        reasonCodes: ['NO_CLOSED_SHEET'],
      });
      expect(resolvePayrollEligibilityDisplay(map, 'missing', ready)).toEqual({
        isEligible: false,
        reasonCodes: ['NOT_FOUND'],
      });
      expect(resolvePayrollEligibilityDisplay(map, 'e2', notReady)).toEqual({
        isEligible: false,
        reasonCodes: [],
      });
    });
  });

  describe('shell', () => {
    it('BOOTSTRAP_LIVE_PAYSLIPS sets calculate tab atomically once', () => {
      const initial = createInitialPayrollShellUiState();
      const next = payrollShellUiReducer(initial, { type: 'BOOTSTRAP_LIVE_PAYSLIPS' });
      expect(next.payrollLiveBootstrapped).toBe(true);
      expect(next.activeTab).toBe('calculate');
      expect(next.activeCalcSubTab).toBe('calc-list');
      const again = payrollShellUiReducer(next, { type: 'BOOTSTRAP_LIVE_PAYSLIPS' });
      expect(again).toBe(next);
    });

    it('SET_FIELD updates searchQuery via functional updater', () => {
      const state = createInitialPayrollShellUiState();
      const next = payrollShellUiReducer(state, {
        type: 'SET_FIELD',
        field: 'searchQuery',
        value: (prev) => `${String(prev)}x`,
      });
      expect(next.searchQuery).toBe('x');
    });
  });

  describe('advance', () => {
    it('CLOSE_ADD_ADVANCE resets form (no stale fields after cancel)', () => {
      let state = createInitialPayrollAdvanceUiState();
      state = payrollAdvanceUiReducer(state, { type: 'OPEN_ADD_ADVANCE' });
      state = payrollAdvanceUiReducer(state, {
        type: 'SET_FIELD',
        field: 'advanceFormData',
        value: { ...createEmptyAdvanceFormData(), advanceName: 'Tạm ứng T7' },
      });
      expect(state.showAddAdvanceDialog).toBe(true);
      expect(state.advanceFormData.advanceName).toBe('Tạm ứng T7');
      state = payrollAdvanceUiReducer(state, { type: 'CLOSE_ADD_ADVANCE' });
      expect(state.showAddAdvanceDialog).toBe(false);
      expect(state.advanceFormData).toEqual(createEmptyAdvanceFormData());
    });

    it('OPEN/CLOSE_EDIT_ADVANCE keeps batch + dialog in sync', () => {
      const batch = { id: 'adv-1', name: 'Batch A' };
      let state = createInitialPayrollAdvanceUiState<typeof batch>();
      state = payrollAdvanceUiReducer(state, { type: 'OPEN_EDIT_ADVANCE', batch });
      expect(state.showEditAdvanceDialog).toBe(true);
      expect(state.advanceToEdit).toEqual(batch);
      state = payrollAdvanceUiReducer(state, { type: 'CLOSE_EDIT_ADVANCE' });
      expect(state.showEditAdvanceDialog).toBe(false);
      expect(state.advanceToEdit).toBeNull();
    });

    it('CLOSE_APPROVAL clears note', () => {
      let state = createInitialPayrollAdvanceUiState();
      state = payrollAdvanceUiReducer(state, { type: 'OPEN_APPROVAL', action: 'reject' });
      state = payrollAdvanceUiReducer(state, {
        type: 'SET_FIELD',
        field: 'approvalNote',
        value: 'Thiếu chứng từ',
      });
      state = payrollAdvanceUiReducer(state, { type: 'CLOSE_APPROVAL' });
      expect(state.showApprovalDialog).toBe(false);
      expect(state.approvalNote).toBe('');
      expect(state.approvalAction).toBe('approve');
    });
  });

  describe('tax settlement UI', () => {
    it('CLOSE_ADD_TAX_SETTLEMENT resets form atomically', () => {
      let state = createInitialPayrollTaxSettlementUiState();
      state = payrollTaxSettlementUiReducer(state, { type: 'OPEN_ADD_TAX_SETTLEMENT' });
      state = payrollTaxSettlementUiReducer(state, {
        type: 'SET_FIELD',
        field: 'taxSettlementFormData',
        value: {
          ...createEmptyTaxSettlementFormData(),
          year: 2025,
          appliedUnits: ['HN'],
        },
      });
      state = payrollTaxSettlementUiReducer(state, { type: 'CLOSE_ADD_TAX_SETTLEMENT' });
      expect(state.showAddTaxSettlementDialog).toBe(false);
      expect(state.taxSettlementFormData.appliedUnits).toEqual([]);
      expect(state.taxSettlementFormData.year).toBe(new Date().getFullYear());
    });

    it('OPEN/CLOSE_DELETE_TAX_EMPLOYEE syncs employee target', () => {
      const emp = { id: 'e1', name: 'A' };
      let state = createInitialPayrollTaxSettlementUiState<unknown, typeof emp>();
      state = payrollTaxSettlementUiReducer(state, {
        type: 'OPEN_DELETE_TAX_EMPLOYEE',
        employee: emp,
      });
      expect(state.showDeleteTaxEmployeeDialog).toBe(true);
      expect(state.taxEmployeeToDelete).toEqual(emp);
      state = payrollTaxSettlementUiReducer(state, { type: 'CLOSE_DELETE_TAX_EMPLOYEE' });
      expect(state.showDeleteTaxEmployeeDialog).toBe(false);
      expect(state.taxEmployeeToDelete).toBeNull();
    });

    it('CLOSE_TAX_REFUND resets form after Esc/overlay close path', () => {
      let state = createInitialPayrollTaxSettlementUiState();
      state = payrollTaxSettlementUiReducer(state, { type: 'OPEN_TAX_REFUND' });
      state = payrollTaxSettlementUiReducer(state, {
        type: 'SET_FIELD',
        field: 'taxRefundFormData',
        value: (prev) => ({ ...prev, name: 'Hoàn thuế T7', appliedUnits: ['HN'] }),
      });
      state = payrollTaxSettlementUiReducer(state, { type: 'CLOSE_TAX_REFUND' });
      expect(state.showTaxRefundDialog).toBe(false);
      expect(state.taxRefundFormData.name).toBe('');
      expect(state.taxRefundFormData.appliedUnits).toEqual([]);
    });
  });

  describe('salary component UI', () => {
    it('OPEN_EDIT then CLOSE clears component + form (race fix)', () => {
      const component = { id: 'sc-1', code: 'PHU_CAP' };
      const form = {
        ...createEmptySalaryComponentEditForm(),
        code: 'PHU_CAP',
        name: 'Phụ cấp',
        nature: 'income' as const,
      };
      let state = createInitialPayrollSalaryComponentUiState<typeof component>();
      state = payrollSalaryComponentUiReducer(state, {
        type: 'OPEN_EDIT_SALARY_COMPONENT',
        component,
        form,
      });
      expect(state.showEditSalaryComponentDialog).toBe(true);
      expect(state.salaryComponentToEdit).toEqual(component);
      expect(state.editSalaryComponentForm.name).toBe('Phụ cấp');
      state = payrollSalaryComponentUiReducer(state, { type: 'CLOSE_EDIT_SALARY_COMPONENT' });
      expect(state.showEditSalaryComponentDialog).toBe(false);
      expect(state.salaryComponentToEdit).toBeNull();
      expect(state.editSalaryComponentForm).toEqual(createEmptySalaryComponentEditForm());
    });

    it('CLOSE_SYSTEM_COMPONENTS clears selection + filters', () => {
      let state = createInitialPayrollSalaryComponentUiState();
      state = payrollSalaryComponentUiReducer(state, { type: 'OPEN_SYSTEM_COMPONENTS' });
      state = payrollSalaryComponentUiReducer(state, {
        type: 'SET_FIELD',
        field: 'selectedSystemComponents',
        value: ['a', 'b'],
      });
      state = payrollSalaryComponentUiReducer(state, { type: 'CLOSE_SYSTEM_COMPONENTS' });
      expect(state.showSystemComponentsDialog).toBe(false);
      expect(state.selectedSystemComponents).toEqual([]);
      expect(state.systemComponentsSearch).toBe('');
    });
  });

  describe('batch UI', () => {
    it('OPEN/CLOSE_DELETE_PAYROLL_BATCH syncs target', () => {
      const batch = { id: 'pb-1' };
      let state = createInitialPayrollBatchUiState<unknown, typeof batch>();
      state = payrollBatchUiReducer(state, { type: 'OPEN_DELETE_PAYROLL_BATCH', batch });
      expect(state.showDeletePayrollBatchDialog).toBe(true);
      expect(state.payrollBatchToDelete).toEqual(batch);
      state = payrollBatchUiReducer(state, { type: 'CLOSE_DELETE_PAYROLL_BATCH' });
      expect(state.showDeletePayrollBatchDialog).toBe(false);
      expect(state.payrollBatchToDelete).toBeNull();
    });

    it('CLOSE_ADD_PAYMENT clears employee selection', () => {
      let state = createInitialPayrollBatchUiState();
      state = payrollBatchUiReducer(state, { type: 'OPEN_ADD_PAYMENT' });
      state = payrollBatchUiReducer(state, {
        type: 'SET_FIELD',
        field: 'selectedEmployeesToAdd',
        value: ['e1'],
      });
      state = payrollBatchUiReducer(state, { type: 'CLOSE_ADD_PAYMENT' });
      expect(state.showAddPaymentDialog).toBe(false);
      expect(state.selectedEmployeesToAdd).toEqual([]);
    });
  });
});
