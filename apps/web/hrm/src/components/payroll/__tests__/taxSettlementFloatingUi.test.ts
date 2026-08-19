import { describe, expect, it } from 'vitest';
import {
  applyTaxEditDialogOpenChange,
  buildTaxEmployeeEditForm,
  closeTaxEmployeeEditFloatingUi,
  createEmptyTaxSettlementFloatingUiState,
  employeeAvatarInitial,
  employeeDisplayName,
  formatPayrollMoney,
  matchesTaxSettlementEmployeeSearch,
  normalizeTaxSettlementEmployee,
  openTaxEmployeeEditFloatingUi,
  patchTaxEmployeeEditForm,
  safePayrollNumber,
} from '../taxSettlementFloatingUi';

describe('taxSettlementFloatingUi (D-UX-C1-PAYROLL-FE-01 / UX-02 P0-b)', () => {
  it('createEmptyTaxSettlementFloatingUiState never returns undefined fields', () => {
    const state = createEmptyTaxSettlementFloatingUiState();
    expect(state).toBeDefined();
    expect(state.showEditDialog).toBe(false);
    expect(state.employeeToEdit).toBeNull();
    expect(state.editForm).toEqual({
      totalTaxableIncome: 0,
      dependents: 0,
      familyDeduction: 0,
      unemploymentInsurance: 0,
      socialInsurance: 0,
      healthInsurance: 0,
      taxPayable: 0,
      taxPaid: 0,
    });
  });

  it('safePayrollNumber / formatPayrollMoney tolerate null undefined NaN', () => {
    expect(safePayrollNumber(undefined)).toBe(0);
    expect(safePayrollNumber(null)).toBe(0);
    expect(safePayrollNumber(Number.NaN)).toBe(0);
    expect(safePayrollNumber('12.5')).toBe(12.5);
    expect(formatPayrollMoney(undefined)).toBe('0');
    expect(formatPayrollMoney(1_000_000)).toBe((1_000_000).toLocaleString('vi-VN'));
  });

  it('employeeDisplayName / avatarInitial never call split on null', () => {
    expect(employeeDisplayName(undefined)).toBe('—');
    expect(employeeDisplayName(null)).toBe('—');
    expect(employeeDisplayName('')).toBe('—');
    expect(employeeAvatarInitial(undefined)).toBe('?');
    expect(employeeAvatarInitial('Nguyễn Văn A')).toBe('A');
  });

  it('normalizeTaxSettlementEmployee rejects missing id; fills numeric holes', () => {
    expect(normalizeTaxSettlementEmployee(undefined)).toBeNull();
    expect(normalizeTaxSettlementEmployee({ name: 'X' })).toBeNull();
    const row = normalizeTaxSettlementEmployee({
      id: 'emp-1',
      name: '  Trần B  ',
      // intentionally omit money fields
    });
    expect(row).not.toBeNull();
    expect(row!.name).toBe('Trần B');
    expect(row!.totalTaxableIncome).toBe(0);
    expect(row!.taxPayable).toBe(0);
    expect(() => formatPayrollMoney(row!.totalTaxableIncome)).not.toThrow();
  });

  it('openTaxEmployeeEditFloatingUi opens with safe form; refuse when id missing', () => {
    const closed = createEmptyTaxSettlementFloatingUiState();
    const refused = openTaxEmployeeEditFloatingUi(closed, { name: 'no-id' });
    expect(refused.showEditDialog).toBe(false);
    expect(refused.employeeToEdit).toBeNull();

    const opened = openTaxEmployeeEditFloatingUi(closed, {
      id: 'e2',
      code: 'NV-01',
      name: 'Lê C',
      totalTaxableIncome: 50_000_000,
      dependents: 2,
    });
    expect(opened.showEditDialog).toBe(true);
    expect(opened.employeeToEdit?.id).toBe('e2');
    expect(opened.editForm.totalTaxableIncome).toBe(50_000_000);
    expect(opened.editForm.dependents).toBe(2);
    expect(buildTaxEmployeeEditForm(null).totalTaxableIncome).toBe(0);
  });

  it('close / onOpenChange(false) resets floatingUiState (no stale employee)', () => {
    const opened = openTaxEmployeeEditFloatingUi(createEmptyTaxSettlementFloatingUiState(), {
      id: 'e3',
      name: 'Phạm D',
      taxPaid: 1000,
    });
    const closed = closeTaxEmployeeEditFloatingUi();
    expect(closed.showEditDialog).toBe(false);
    expect(closed.employeeToEdit).toBeNull();

    const viaChange = applyTaxEditDialogOpenChange(opened, false);
    expect(viaChange.showEditDialog).toBe(false);
    expect(viaChange.employeeToEdit).toBeNull();
    expect(viaChange.editForm.taxPaid).toBe(0);
  });

  it('applyTaxEditDialogOpenChange(true) without employee stays closed (no crash)', () => {
    const state = applyTaxEditDialogOpenChange(undefined, true);
    expect(state.showEditDialog).toBe(false);
    expect(state.editForm).toBeDefined();
  });

  it('patchTaxEmployeeEditForm null-guards current state', () => {
    const patched = patchTaxEmployeeEditForm(undefined, { taxPayable: 9_000 });
    expect(patched.editForm.taxPayable).toBe(9_000);
    expect(patched.editForm.totalTaxableIncome).toBe(0);
  });

  it('matchesTaxSettlementEmployeeSearch safe on partial rows', () => {
    const emp = normalizeTaxSettlementEmployee({ id: '1', code: 'HLD-01', name: 'An' })!;
    expect(matchesTaxSettlementEmployeeSearch(emp, 'hld')).toBe(true);
    expect(matchesTaxSettlementEmployeeSearch(null, 'x')).toBe(false);
  });
});
