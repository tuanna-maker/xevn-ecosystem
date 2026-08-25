import { describe, expect, it } from 'vitest';
import {
  buildVpHanoiPaySheetLineDrafts,
  derivePayrollTotalsFromComponentValues,
  groupPeriodInputLinesByEmployee,
  isPayrollDeductionComponentCode,
  mapPayslipLinesToComponentValues,
  mergePayrollComponentValues,
  resolvePayrollSheetColumns,
} from './payrollBatchSheetColumns';

describe('payrollBatchSheetColumns', () => {
  it('resolves columns from period snapshot in sort order', () => {
    const columns = resolvePayrollSheetColumns({
      template_code: 'vp_hanoi',
      columns: [
        { component_code: 'THUONG_P4', display_label: 'Thưởng P4', sort_order: 20 },
        { component_code: 'LUONG_THEO_CONG', display_label: 'Lương theo công', sort_order: 10 },
      ],
    });
    expect(columns.map((c) => c.componentCode)).toEqual(['LUONG_THEO_CONG', 'THUONG_P4']);
    expect(columns[1].displayLabel).toBe('Thưởng P4');
  });

  it('flags deduction component codes', () => {
    expect(isPayrollDeductionComponentCode('KHAU_TRU_BHXH')).toBe(true);
    expect(isPayrollDeductionComponentCode('THUE_TNCN')).toBe(true);
    expect(isPayrollDeductionComponentCode('LUONG_CO_BAN')).toBe(false);
  });

  it('maps payslip lines to component value map', () => {
    const values = mapPayslipLinesToComponentValues([
      { component_code: 'LUONG_THEO_CONG', amount: '6200000' },
      { component_code: 'KHAU_TRU_BHXH', amount: 500000 },
    ]);
    expect(values).toEqual({
      LUONG_THEO_CONG: 6_200_000,
      KHAU_TRU_BHXH: 500_000,
    });
  });

  it('merges period input under payslip lines with payslip winning', () => {
    const merged = mergePayrollComponentValues(
      { LUONG_THEO_CONG: 6_200_000 },
      { LUONG_CO_BAN: 8_600_000, LUONG_THEO_CONG: 1 },
    );
    expect(merged.LUONG_CO_BAN).toBe(8_600_000);
    expect(merged.LUONG_THEO_CONG).toBe(6_200_000);
  });

  it('groups period input lines by employee', () => {
    const grouped = groupPeriodInputLinesByEmployee([
      { employeeId: 'emp-1', componentCode: 'LUONG_CO_BAN', amount: 8_600_000 },
      { employeeId: 'emp-1', componentCode: 'THUONG_P4', amount: 1_000_000 },
      { employeeId: 'emp-2', componentCode: 'LUONG_CO_BAN', amount: 5_000_000 },
    ]);
    expect(grouped.get('emp-1')).toEqual({
      LUONG_CO_BAN: 8_600_000,
      THUONG_P4: 1_000_000,
    });
    expect(grouped.get('emp-2')?.LUONG_CO_BAN).toBe(5_000_000);
  });

  it('groups snake_case period input API rows', () => {
    const grouped = groupPeriodInputLinesByEmployee([
      { employee_id: 'emp-1', component_code: 'THUONG_P4', amount: '4500000' },
    ]);
    expect(grouped.get('emp-1')?.THUONG_P4).toBe(4_500_000);
  });

  it('derives gross/deduction/net from component values', () => {
    const totals = derivePayrollTotalsFromComponentValues({
      THUONG_P4: 4_000_000,
      LUONG_KHAC: 500_000,
      KHAU_TRU_BHXH: 400_000,
      TRUY_THU: 100_000,
    });
    expect(totals).toEqual({ gross: 4_500_000, deduction: 500_000, net: 4_000_000 });
  });

  it('builds VP HN line drafts from salary component catalog', () => {
    const drafts = buildVpHanoiPaySheetLineDrafts([
      { id: 'c1', code: 'LUONG_CO_BAN' },
      { id: 'c2', code: 'THUONG_P4' },
    ]);
    expect(drafts).toHaveLength(21);
    expect(drafts[0]).toMatchObject({
      componentId: 'c1',
      displayLabel: 'Lương cơ bản (P1+P2)',
      sortOrder: 0,
    });
    expect(drafts.find((d) => d.key === 'vp-hn-THUONG_P4')?.componentId).toBe('c2');
  });

  it('uses snapshot sign for deduction styling', () => {
    const columns = resolvePayrollSheetColumns({
      columns: [
        { component_code: 'LUONG_CO_BAN', sign: 'earning', sort_order: 0 },
        { component_code: 'KHAU_TRU_BHXH', sign: 'deduction', sort_order: 1 },
      ],
    });
    expect(columns[0].isDeduction).toBe(false);
    expect(columns[1].isDeduction).toBe(true);
  });
});
