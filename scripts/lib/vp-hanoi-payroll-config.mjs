/**
 * VP Hà Nội 05/2026 — cấu hình thành phần lương, công thức, mẫu bảng lương.
 * Tham chiếu: scripts/seed-reports/payroll-vp-hanoi-2026-05/12-manual-payroll-setup-guide.md
 */
import { buildGd1EvalFromSalaryComponents } from './salary-formula-to-gd1.mjs';

export const VP_PAY_TYPES = [
  { code: 'luong', label: 'Lương' },
  { code: 'thue', label: 'Thuế' },
  { code: 'cham_cong', label: 'Chấm công' },
];

/** Thứ tự cột như bảng Excel VP Hà Nội. */
export const VP_SHEET_COLUMN_ORDER = [
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
];

/**
 * Thành phần lương — cờ thuế/BHXH theo guide Bước 2.
 * formula: tầng 1 (text hiển thị + hyperformula body khi expand).
 */
export const VP_SALARY_COMPONENTS = [
  {
    code: 'LUONG_CO_BAN',
    name: 'Lương cơ bản (P1+P2)',
    component_type: 'luong',
    nature: 'income',
    is_taxable: true,
    is_insurance_base: true,
    formula: '=base_salary+allowance_p2',
    sort_order: 5,
  },
  {
    code: 'LUONG_THEO_CONG',
    name: 'Lương theo ngày/giờ công',
    component_type: 'luong',
    nature: 'income',
    is_taxable: true,
    is_insurance_base: true,
    formula: '=base_salary*payable_hours/standard_hours',
    sort_order: 10,
  },
  {
    code: 'LUONG_KPI',
    name: 'Lương KPI (P3)',
    component_type: 'luong',
    nature: 'income',
    is_taxable: true,
    is_insurance_base: false,
    formula: '=allowance_kpi',
    sort_order: 20,
  },
  {
    code: 'THUONG_P4',
    name: 'Thưởng hiệu quả (P4)',
    component_type: 'luong',
    nature: 'income',
    is_taxable: true,
    is_insurance_base: false,
    formula: '=performance_bonus_p4',
    sort_order: 30,
  },
  {
    code: 'LUONG_OT_150',
    name: 'Lương OT 150%',
    component_type: 'luong',
    nature: 'income',
    is_taxable: true,
    is_insurance_base: false,
    formula: '=base_salary/standard_hours*ot_150_hours*1.5',
    sort_order: 40,
  },
  {
    code: 'LUONG_OT_200',
    name: 'Lương OT 200%',
    component_type: 'luong',
    nature: 'income',
    is_taxable: true,
    is_insurance_base: false,
    formula: '=base_salary/standard_hours*ot_200_hours*2',
    sort_order: 50,
  },
  {
    code: 'LUONG_NGHI_PHEP',
    name: 'Lương ngày phép',
    component_type: 'luong',
    nature: 'income',
    is_taxable: true,
    is_insurance_base: false,
    formula: '=base_salary/standard_hours*paid_leave_hours',
    sort_order: 60,
  },
  {
    code: 'LUONG_DOANH_SO',
    name: 'Lương doanh số',
    component_type: 'luong',
    nature: 'income',
    is_taxable: true,
    is_insurance_base: false,
    formula: '=revenue_salary',
    sort_order: 70,
  },
  {
    code: 'LUONG_ONLINE',
    name: 'Lương online',
    component_type: 'luong',
    nature: 'income',
    is_taxable: true,
    is_insurance_base: false,
    formula: '=online_pay',
    sort_order: 80,
  },
  {
    code: 'LUONG_NGHI_LE',
    name: 'Lương nghỉ lễ',
    component_type: 'luong',
    nature: 'income',
    is_taxable: true,
    is_insurance_base: false,
    formula: '=holiday_pay',
    sort_order: 90,
  },
  {
    code: 'LUONG_KHAC',
    name: 'Lương khác',
    component_type: 'luong',
    nature: 'income',
    is_taxable: true,
    is_insurance_base: false,
    formula: '=other_salary',
    sort_order: 100,
  },
  {
    code: 'PC_XANG_XE',
    name: 'Phụ cấp xăng xe',
    component_type: 'luong',
    nature: 'income',
    is_taxable: false,
    is_insurance_base: false,
    formula: '=fuel_allowance',
    sort_order: 110,
  },
  {
    code: 'TRUY_LINH',
    name: 'Truy lĩnh',
    component_type: 'luong',
    nature: 'income',
    is_taxable: true,
    is_insurance_base: false,
    formula: '=retro_pay',
    sort_order: 120,
  },
  {
    code: 'KHAU_TRU_BHXH',
    name: 'BHXH/BHYT/BHTN NLĐ',
    component_type: 'thue',
    nature: 'deduction',
    is_taxable: false,
    is_insurance_base: false,
    formula: '=social_insurance',
    sort_order: 200,
  },
  {
    code: 'KHAU_TRU_CONG_DOAN',
    name: 'Công đoàn',
    component_type: 'thue',
    nature: 'deduction',
    is_taxable: false,
    is_insurance_base: false,
    formula: '=union_fee',
    sort_order: 210,
  },
  {
    code: 'KHAU_TRU_VPKL',
    name: 'Vi phạm kỷ luật',
    component_type: 'thue',
    nature: 'deduction',
    is_taxable: false,
    is_insurance_base: false,
    formula: '=discipline',
    sort_order: 220,
  },
  {
    code: 'KHAU_TRU_KE_TOAN',
    name: 'Bảng trừ kế toán',
    component_type: 'thue',
    nature: 'deduction',
    is_taxable: false,
    is_insurance_base: false,
    formula: '=accounting_deduction',
    sort_order: 230,
  },
  {
    code: 'UNG_LUONG_LAN_1',
    name: 'Ứng lương lần 1',
    component_type: 'thue',
    nature: 'deduction',
    is_taxable: false,
    is_insurance_base: false,
    formula: '=salary_advance_1',
    sort_order: 240,
  },
  {
    code: 'TAM_UNG_KHAC',
    name: 'Tạm ứng khác',
    component_type: 'thue',
    nature: 'deduction',
    is_taxable: false,
    is_insurance_base: false,
    formula: '=other_advance',
    sort_order: 250,
  },
  {
    code: 'THUE_TNCN',
    name: 'Thuế TNCN',
    component_type: 'thue',
    nature: 'deduction',
    is_taxable: false,
    is_insurance_base: false,
    formula: '=pit',
    sort_order: 260,
  },
  {
    code: 'TRUY_THU',
    name: 'Truy thu',
    component_type: 'thue',
    nature: 'deduction',
    is_taxable: false,
    is_insurance_base: false,
    formula: '=recovery',
    sort_order: 270,
  },
];

/** Tỷ lệ BHXH+BHYT+BHTN phần NLĐ (chuẩn VN). */
export const VP_EMPLOYEE_INSURANCE_RATE = 0.105;

/** Không seed input kỳ — tính bằng công thức hoặc chỉ hiển thị tham chiếu Excel. */
export const VP_PERIOD_INPUT_SKIP_CODES = new Set([
  'LUONG_THEO_CONG',
  /** P1+P2 tham chiếu — gross chỉ cộng LUONG_THEO_CONG (tránh ~2× lương CB). */
  'LUONG_CO_BAN',
]);

export function roundPayrollMoney(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

function parsePayrollNumber(value) {
  const x = Number(value);
  return Number.isFinite(x) ? x : 0;
}

/** Mức đóng BHXH (P1) — ưu tiên paying_insurance rồi insurance_base_p1. */
export function resolveInsuranceBaseP1(row) {
  const paying = parsePayrollNumber(row?.income?.paying_insurance);
  if (paying > 0) return paying;
  return parsePayrollNumber(row?.income?.insurance_base_p1);
}

/**
 * Excel VP Hà Nội: cột BHXH (row[48]) thường gấp ~10 lần cột tổng khấu trừ (row[55])
 * hoặc lệch lớn so với P1 × 10,5%. Chuẩn hóa trước khi seed / import.
 */
export function normalizeSocialInsuranceDeduction(row) {
  const raw = parsePayrollNumber(row?.deductions?.social_insurance);
  const totalDed = parsePayrollNumber(row?.deductions?.total_deduction);
  if (raw <= 0 && totalDed <= 0) return 0;

  if (raw > 0 && totalDed > 0) {
    const ratio = raw / totalDed;
    if (ratio >= 9 && ratio <= 11) {
      return roundPayrollMoney(totalDed);
    }
  }

  const insuranceBase = resolveInsuranceBaseP1(row);
  const expected =
    insuranceBase > 0 ? roundPayrollMoney(insuranceBase * VP_EMPLOYEE_INSURANCE_RATE) : 0;

  if (expected > 0) {
    if (raw <= 0 || raw > expected * 2) {
      if (totalDed >= expected * 0.5 && totalDed <= expected * 1.25) {
        return roundPayrollMoney(totalDed);
      }
      return expected;
    }
    return roundPayrollMoney(raw);
  }

  if (totalDed > 0 && raw > totalDed * 3) {
    return roundPayrollMoney(totalDed);
  }
  return roundPayrollMoney(raw);
}

export function shouldSeedPeriodInput(code, amount) {
  if (VP_PERIOD_INPUT_SKIP_CODES.has(code)) return false;
  if (code === 'LUONG_KPI' && amount < 1000) return false;
  return amount != null && amount !== 0;
}

/** Map component_code → amount từ row Excel (01-employees-payroll.json). */
export function amountForComponentFromPayrollRow(code, row) {
  const n = (v) => {
    const x = Number(v);
    return Number.isFinite(x) ? x : 0;
  };
  switch (code) {
    case 'LUONG_CO_BAN':
      return n(row.income?.base_salary_p1_p2);
    case 'LUONG_THEO_CONG':
      return null;
    case 'LUONG_KPI': {
      const amt = n(row.kpi_pay ?? row.income?.kpi_salary_p3);
      return amt >= 1000 ? amt : null;
    }
    case 'THUONG_P4':
      return n(row.p4_bonus ?? row.income?.performance_bonus_p4);
    case 'LUONG_OT_150':
      return n(row.ot_150_pay);
    case 'LUONG_OT_200':
      return n(row.ot_200_pay);
    case 'LUONG_NGHI_PHEP':
      return n(row.leave_day_pay);
    case 'LUONG_DOANH_SO':
      return n(row.revenue_salary);
    case 'LUONG_ONLINE':
      return n(row.online_pay_weekday) + n(row.online_pay_saturday);
    case 'LUONG_NGHI_LE':
      return n(row.holiday_pay);
    case 'LUONG_KHAC':
      return n(row.other_salary);
    case 'PC_XANG_XE':
      return n(row.fuel_allowance);
    case 'TRUY_LINH':
      return n(row.retro_pay);
    case 'KHAU_TRU_BHXH':
      return normalizeSocialInsuranceDeduction(row);
    case 'KHAU_TRU_CONG_DOAN':
      return n(row.deductions?.union_fee);
    case 'KHAU_TRU_VPKL':
      return n(row.deductions?.discipline);
    case 'KHAU_TRU_KE_TOAN':
      return n(row.deductions?.accounting_deduction);
    case 'UNG_LUONG_LAN_1':
      return n(row.deductions?.salary_advance_1);
    case 'TAM_UNG_KHAC':
      return n(row.deductions?.other_advance);
    case 'THUE_TNCN':
      return n(row.deductions?.pit);
    case 'TRUY_THU':
      return n(row.recovery);
    default:
      return null;
  }
}

export function buildHyperFormulaExpressionJson(components) {
  const lines = components.map((c) => ({
    component_code: c.code,
    sign: c.nature === 'deduction' ? 'deduction' : 'earning',
    formula: c.formula.startsWith('=') ? c.formula : `=${c.formula}`,
  }));
  return {
    form: 'hyperformula_v1',
    lines,
    ui: {
      mode: 'component_composite',
      expression: lines
        .map((l) => `${l.sign === 'deduction' ? '-' : '+'} ${l.component_code}`)
        .join(' ')
        .replace(/^\+ /, ''),
    },
  };
}

export function buildGd1EvalExpressionJson(components = VP_SALARY_COMPONENTS) {
  return buildGd1EvalFromSalaryComponents(components);
}
