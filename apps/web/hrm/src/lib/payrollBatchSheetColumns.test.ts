import { describe, expect, it } from 'vitest';
import {
  buildVpHanoiPaySheetLineDrafts,
  buildAttendanceHoursByEmployee,
  derivePayrollTotalsFromComponentValues,
  enrichDraftComponentValuesFromEmpCb,
  groupPeriodInputLinesByEmployee,
  resolveBaseSalaryFromCompensationLines,
  resolveLuongCoBanFromCompensationLines,
  resolveLuongTheoCongDraftPreview,
  injectPayrollSheetTotalComponentValues,
  isPayrollSheetTotalComponentCode,
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

  it('excludes reference LUONG_CO_BAN from draft gross totals', () => {
    const totals = derivePayrollTotalsFromComponentValues(
      {
        LUONG_CO_BAN: 8_600_000,
        THUONG_P4: 4_000_000,
      },
      { excludeReferenceEarnings: true },
    );
    expect(totals.gross).toBe(4_000_000);
  });

  it('injects TONG_THU_NHAP and THUC_LINH sheet total columns', () => {
    expect(isPayrollSheetTotalComponentCode('TONG_THU_NHAP')).toBe(true);
    const values = injectPayrollSheetTotalComponentValues({
      LUONG_CO_BAN: 8_600_000,
      THUONG_P4: 4_000_000,
      KHAU_TRU_BHXH: 400_000,
    });
    expect(values.TONG_THU_NHAP).toBe(4_000_000);
    expect(values.THUC_LINH).toBe(3_600_000);
  });

  it('resolves LUONG_CO_BAN from compensation lines (base + P2)', () => {
    const amount = resolveLuongCoBanFromCompensationLines([
      { line_type: 'base', amount: 5_700_000 },
      { line_type: 'allowance', allowance_code: 'p2', amount: 2_900_000 },
    ]);
    expect(amount).toBe(8_600_000);
  });

  it('resolves base salary P1 only for LUONG_THEO_CONG preview', () => {
    expect(
      resolveBaseSalaryFromCompensationLines([
        { line_type: 'base', amount: 5_700_000 },
        { line_type: 'allowance', allowance_code: 'p2', amount: 2_900_000 },
      ]),
    ).toBe(5_700_000);
  });

  it('computes LUONG_THEO_CONG draft preview from P1 and attendance hours', () => {
    expect(resolveLuongTheoCongDraftPreview(5_700_000, 104, 208)).toBe(2_850_000);
    expect(resolveLuongTheoCongDraftPreview(5_700_000, 0, 208)).toBe(0);
  });

  it('builds attendance hours map by employee (locked lines when sheet closed)', () => {
    const map = buildAttendanceHoursByEmployee(
      [
        { employee_id: 'emp-1', payable_hours: 200, standard_hours: 208, line_locked: true },
        { employee_id: 'emp-2', payable_hours: 100, standard_hours: 208, line_locked: false },
      ],
      { sheetClosed: true },
    );
    expect(map.get('emp-1')).toEqual({ payableHours: 200, standardHours: 208 });
    expect(map.has('emp-2')).toBe(false);
  });

  it('enriches draft values from emp_cb without overwriting period input', () => {
    const enriched = enrichDraftComponentValuesFromEmpCb(
      { THUONG_P4: 1_000_000, LUONG_CO_BAN: 0 },
      { LUONG_CO_BAN: 5_310_000 },
    );
    expect(enriched.values.LUONG_CO_BAN).toBe(5_310_000);
    expect(enriched.previewSources.LUONG_CO_BAN).toBe('emp_cb');
    expect(enriched.values.THUONG_P4).toBe(1_000_000);
  });

  it('builds VP HN line drafts from salary component catalog', () => {
    const drafts = buildVpHanoiPaySheetLineDrafts([
      { id: 'c1', code: 'LUONG_CO_BAN' },
      { id: 'c2', code: 'THUONG_P4' },
    ]);
    expect(drafts).toHaveLength(23);
    expect(drafts[0]).toMatchObject({
      componentId: 'c1',
      displayLabel: 'Lương cơ bản (P1+P2)',
      sortOrder: 0,
    });
    expect(drafts.find((d) => d.key === 'vp-hn-THUONG_P4')?.componentId).toBe('c2');
  });

  it('wires OV-C formula override on VP total columns when formulas exist', () => {
    const drafts = buildVpHanoiPaySheetLineDrafts(
      [
        { id: 'c-gross', code: 'TONG_THU_NHAP' },
        { id: 'c-net', code: 'THUC_LINH' },
      ],
      [
        { id: 'f-gross', code: 'formula_col_tong_thu_nhap' },
        { id: 'f-net', code: 'formula_col_thuc_linh' },
      ],
    );
    expect(drafts.find((d) => d.key === 'vp-hn-TONG_THU_NHAP')?.formulaOverrideDefinitionId).toBe(
      'f-gross',
    );
    expect(drafts.find((d) => d.key === 'vp-hn-THUC_LINH')?.formulaOverrideDefinitionId).toBe(
      'f-net',
    );
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
