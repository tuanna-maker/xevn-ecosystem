/**
 * @CODE-MEMORY
 * Screen:     Policy Engine — Calculator Plugin Interface
 * TechSpec:   TECHSPEC_HRM_POLICY_ENGINE_v1.md §6 Calculator Pattern
 * Purpose:    Shared types for all ComponentCalculator implementations.
 *             ComponentCalculator: pure function, no side-effects, no DI.
 *             CalcContext carries all inputs needed for any component.
 * WorkItem:   HRM-POLICY-E2-01
 * Coded:      2026-08-22
 * SOLID:      OCP — add new component_type by adding new Calculator + registering
 * FORBIDDEN:  DB calls inside calculate() · HTTP calls · shared mutable state
 * must_keep:  amount_vnd ALWAYS bigint (no floats for VND);
 *             skipped=true means component is not applicable (not an error);
 *             breakdown is free-form for display (UI accordion)
 */

// ─── INPUT CONTEXT ───────────────────────────────────────────────────────────

/** Attendance summary từ hệ thống chấm công (E0) */
export type AttendanceSummary = {
  standard_days: number;       // Ngày công chuẩn của tháng
  actual_days: number;         // Ngày công thực tế
  sunday_days: number;         // Số ngày Chủ nhật đi làm
  night_shift_hours: number;   // Giờ ca đêm
  overtime_hours: number;      // Giờ tăng ca
  absence_days: number;        // Ngày vắng
  is_probation: boolean;       // Đang thử việc
};

/** Grade-Step của nhân viên tại kỳ tính */
export type GradeStepSnapshot = {
  grade_code: string;          // D1, M1, E2, LX1...
  step_number: number;         // 1–9
  monthly_salary_vnd: bigint;  // Mức lương ngạch-bậc (BIGINT)
  grade_name: string;
};

/** Thông tin nhân viên cần cho policy engine */
export type EmployeeSnapshot = {
  employee_id: string;
  full_name: string;
  pay_group_code: string;      // LX_TUYEN, LX_TAI, DPHH, TONG_DAI...
  province_code: string | null;// ND, NB, TB... (cho LX_TUYEN)
  is_probation: boolean;
  contract_salary_vnd: bigint | null; // Lương hợp đồng (nếu có)
};

/** Component params — JSONB từ pay_income_components.params */
export type ComponentParams = Record<string, unknown>;

/** Một input data row (từ approved Excel import) */
export type InputDataBag = {
  trip_log?: {
    tinh_code: string;
    so_luot_t1: number;
    so_luot_t2: number;
    so_luot_noibai: number;
    so_luot_ho_tro: number;
    dt_hop_dong_vnd: number;
  };
  revenue_cldv?: {
    doanh_thu_vnd: number;
    diem_cldv: number;
  };
  maintenance_cost?: {
    cp_sua_chua_vnd: number;
    cp_lop_vnd: number;
  };
  freight_revenue?: {
    doanh_thu_vnd: number;
    diem_clhd: number;
    so_chuyen: number;
    loai_xe: string;
  };
  dphh_revenue?: {
    dt_gui_vnd: number;
    dt_nhan_vnd: number;
    gio_cong: number;
    van_phong: string;
  };
  hotline_stats?: {
    so_cuoc_nghe: number;
    ty_le_nho: number;
    diem_chat_luong: number;
    hotline_code: string;
  };
  branch_stats?: {
    so_khach: number;
    doanh_thu_vnd: number;
    chi_nhanh: string;
  };
};

/** Full context passed to every calculator */
export type CalcContext = {
  periodMonth: string;         // "YYYY-MM"
  employee: EmployeeSnapshot;
  gradeStep: GradeStepSnapshot | null;
  attendance: AttendanceSummary;
  inputBag: InputDataBag;
  params: ComponentParams;     // params from pay_income_components row
  componentName: string;
  componentType: string;
  /** Pre-tax gross income so far (for PIT calculator) */
  preTaxGrossVnd?: bigint;
  /** Pool accumulator (for zero_sum_pool) — filled by PoolCalculationService */
  poolShare?: bigint;
};

// ─── OUTPUT ──────────────────────────────────────────────────────────────────

/** Breakdown item for UI accordion */
export type BreakdownItem = {
  label: string;
  value: string;
};

/** Result of one component calculation */
export type ComponentResult = {
  component_type: string;
  name: string;
  is_deduction: boolean;
  amount_vnd: bigint;          // positive always; sign determined by is_deduction
  breakdown: BreakdownItem[];  // audit trail / UI display
  warnings: string[];          // non-fatal issues
  skipped: boolean;            // true = N/A for this employee (amount = 0)
  skipped_reason?: string;
};

// ─── INTERFACE ───────────────────────────────────────────────────────────────

/** Every calculator must implement this interface */
export interface ComponentCalculator {
  readonly type: string;        // matches component_type in DB
  calculate(ctx: CalcContext): Promise<ComponentResult>;
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

/** Round to nearest 1000 VND (phổ biến trong quy chế XeVN) */
export function roundVND(n: bigint, unit = 1000n): bigint {
  return (n / unit) * unit;
}

/** Format VND for breakdown display */
export function fmtVND(n: bigint): string {
  return n.toLocaleString("vi-VN") + " đ";
}

/** Safe parse bigint from string/number (Excel → any) */
export function parseBigInt(v: unknown): bigint {
  if (v === null || v === undefined || v === "") return 0n;
  return BigInt(Math.round(Number(v)));
}
