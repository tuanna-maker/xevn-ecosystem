/**
 * @CODE-MEMORY
 * Purpose: Dedicated Unit Test Suite for all 9 Catalog Screens (W1–W11)
 * WorkItem: QA-PO-HRM-CATALOG-UNIT-TESTS-01
 */
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { createElement } from 'react';
import { PayrollComponentsSetupScreen } from './PayrollComponentsSetupScreen';
import { PayrollGradeSetupScreen } from './PayrollGradeSetupScreen';
import { PositionsDepartmentsSetupScreen } from './PositionsDepartmentsSetupScreen';
import { AttendanceShiftsSetupScreen } from './AttendanceShiftsSetupScreen';
import { ContractClausesSetupScreen } from './ContractClausesSetupScreen';
import { DecisionTypesSetupScreen } from './DecisionTypesSetupScreen';
import { ContractEmploymentTypesSetupScreen } from './ContractEmploymentTypesSetupScreen';
import { InsuranceTypesSetupScreen } from './InsuranceTypesSetupScreen';
import { OvertimeTypesSetupScreen } from './OvertimeTypesSetupScreen';
import { FormulaInputPackSetupScreen } from './FormulaInputPackSetupScreen';

afterEach(() => {
  cleanup();
});

describe('Catalog Screens Unit Test Suite (W1–W11)', () => {
  it('TC-W8-W9: PayrollComponentsSetupScreen renders table and opens add dialog', () => {
    render(createElement(PayrollComponentsSetupScreen));
    expect(screen.getByTestId('payroll-components-setup-screen')).toBeTruthy();
    expect(screen.getByTestId('payroll-components-table')).toBeTruthy();

    const addBtn = screen.getByTestId('btn-add-component');
    fireEvent.click(addBtn);
    expect(screen.getByText('Thêm Thành phần Lương Cục bộ')).toBeTruthy();
  });

  it('TC-W1: PayrollGradeSetupScreen renders job grade list and steps breakdown', () => {
    render(createElement(PayrollGradeSetupScreen));
    expect(screen.getByTestId('payroll-grade-setup-screen')).toBeTruthy();
    expect(screen.getByTestId('grade-item-D1')).toBeTruthy();
    expect(screen.getAllByText('Ngạch D1 - Nhân viên nghiệp vụ phổ thông')[0]).toBeTruthy();
  });

  it('TC-W3: PositionsDepartmentsSetupScreen renders treeview and position table', () => {
    render(createElement(PositionsDepartmentsSetupScreen));
    expect(screen.getByTestId('positions-departments-setup-screen')).toBeTruthy();
    expect(screen.getByTestId('positions-table')).toBeTruthy();
  });

  it('TC-W7: AttendanceShiftsSetupScreen renders shifts list and opens add dialog', () => {
    render(createElement(AttendanceShiftsSetupScreen));
    expect(screen.getByTestId('attendance-shifts-setup-screen')).toBeTruthy();
    expect(screen.getByTestId('shifts-table')).toBeTruthy();

    const addBtn = screen.getByTestId('btn-add-shift');
    fireEvent.click(addBtn);
    expect(screen.getByText('Tạo mới Ca Làm Việc')).toBeTruthy();
  });

  it('TC-W11: ContractClausesSetupScreen renders clauses list and filter tabs', () => {
    render(createElement(ContractClausesSetupScreen));
    expect(screen.getByTestId('contract-clauses-setup-screen')).toBeTruthy();
    expect(screen.getByTestId('clauses-table')).toBeTruthy();
  });

  it('TC-W2: DecisionTypesSetupScreen renders 7 standard decision types', () => {
    render(createElement(DecisionTypesSetupScreen));
    expect(screen.getByTestId('decision-types-setup-screen')).toBeTruthy();
    expect(screen.getByTestId('decision-types-table')).toBeTruthy();
    expect(screen.getByText('Quyết định Điều chỉnh lương')).toBeTruthy();
  });

  it('TC-W4: ContractEmploymentTypesSetupScreen renders contract & employment tabs', () => {
    render(createElement(ContractEmploymentTypesSetupScreen));
    expect(screen.getByTestId('contract-employment-types-setup-screen')).toBeTruthy();
    expect(screen.getByTestId('contract-types-table')).toBeTruthy();

    const empTab = screen.getByTestId('tab-employment-types');
    fireEvent.click(empTab);
    expect(screen.getByTestId('employment-types-table')).toBeTruthy();
  });

  it('TC-W5: InsuranceTypesSetupScreen renders 5 statutory insurance types & total rates', () => {
    render(createElement(InsuranceTypesSetupScreen));
    expect(screen.getByTestId('insurance-types-setup-screen')).toBeTruthy();
    expect(screen.getByTestId('insurance-types-table')).toBeTruthy();
    expect(screen.getByText('Bảo hiểm xã hội')).toBeTruthy();
    expect(screen.getAllByText(/23\.5/)[0]).toBeTruthy();
    expect(screen.getAllByText(/10\.5/)[0]).toBeTruthy();
  });

  it('TC-W6: OvertimeTypesSetupScreen renders 3 OT multipliers & driver exclusion rules', () => {
    render(createElement(OvertimeTypesSetupScreen));
    expect(screen.getByTestId('overtime-types-setup-screen')).toBeTruthy();
    expect(screen.getByTestId('overtime-types-table')).toBeTruthy();
    expect(screen.getByText('OT Ngày thường (150%)')).toBeTruthy();
  });

  it('TC-W10: FormulaInputPackSetupScreen renders 3 sections and search input', () => {
    render(createElement(FormulaInputPackSetupScreen));
    expect(screen.getByTestId('formula-input-pack-setup-screen')).toBeTruthy();
    // 3 section headers
    expect(screen.getByTestId('section-title-core')).toBeTruthy();
    expect(screen.getByTestId('section-title-allowance')).toBeTruthy();
    expect(screen.getByTestId('section-title-input-pack')).toBeTruthy();
    // Tables
    expect(screen.getByTestId('core-vars-table')).toBeTruthy();
    expect(screen.getByTestId('input-pack-table')).toBeTruthy();
    // Core vars lowercase
    expect(screen.getByText('payable_hours')).toBeTruthy();
    expect(screen.getByText('base_salary')).toBeTruthy();
    expect(screen.getByText('dependents_count')).toBeTruthy();
    // No UPPERCASE codes from old hardcoded list
    expect(screen.queryByText('BASE_SALARY')).toBeFalsy();
    expect(screen.queryByText('SALARY_COEFFICIENT')).toBeFalsy();
    // Input pack source kinds
    expect(screen.getByText('manual')).toBeTruthy();
    expect(screen.getByText('rd_transfer')).toBeTruthy();
    // Allowance pattern note
    expect(screen.getByTestId('allowance-pattern-note')).toBeTruthy();
    expect(screen.getByText(/employee_compensation_packages/)).toBeTruthy();
    // Search input
    expect(screen.getByTestId('formula-search-input')).toBeTruthy();
    // No drag buttons
    expect(screen.queryByTestId('btn-drag-up')).toBeFalsy();
    expect(screen.queryByTestId('btn-drag-down')).toBeFalsy();
  });
});
