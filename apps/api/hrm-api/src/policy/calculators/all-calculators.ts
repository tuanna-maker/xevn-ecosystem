/**
 * @CODE-MEMORY
 * Screen:     Policy Engine — All ComponentCalculator implementations
 * TechSpec:   TECHSPEC_HRM_POLICY_ENGINE_v1.md §6
 * SRS:        SRS_HRM_PAYROLL_POLICY_ENGINE_v1.md §4 (29 component_types)
 * Purpose:    All 29 calculators in one file (grouped by domain).
 *             Each calculator is a pure class with calculate(ctx) method.
 *             No DI, no DB calls — context carries everything needed.
 * WorkItem:   HRM-POLICY-E2-01
 * Coded:      2026-08-22
 * SOLID:      SRP — each calculator handles ONE component_type only.
 *             OCP — add new type by adding new class + registering in registry.
 * FORBIDDEN:  DB calls · async HTTP · shared mutable state · float money
 * must_keep:  All money as bigint; roundVND(1000n) for display rounding;
 *             skipped=true when data unavailable (not error).
 */
import {
  type BreakdownItem,
  type CalcContext,
  type ComponentCalculator,
  type ComponentResult,
  fmtVND,
  parseBigInt,
  roundVND,
} from "./calculator.interface";

// ─── SHARED SKIP HELPER ───────────────────────────────────────────────────────
function skipResult(ctx: CalcContext, reason: string): ComponentResult {
  return {
    component_type: ctx.componentType,
    name: ctx.componentName,
    is_deduction: false,
    amount_vnd: 0n,
    breakdown: [],
    warnings: [],
    skipped: true,
    skipped_reason: reason,
  };
}
function deductResult(
  ctx: CalcContext, amount: bigint, breakdown: BreakdownItem[], warnings: string[] = []
): ComponentResult {
  return { component_type: ctx.componentType, name: ctx.componentName, is_deduction: true,
    amount_vnd: amount, breakdown, warnings, skipped: false };
}
function incomeResult(
  ctx: CalcContext, amount: bigint, breakdown: BreakdownItem[], warnings: string[] = []
): ComponentResult {
  return { component_type: ctx.componentType, name: ctx.componentName, is_deduction: false,
    amount_vnd: amount, breakdown, warnings, skipped: false };
}

// ═══════════════════════════════════════════════════════════════════════════
// 1. GRADE_BASE — Lương cơ bản ngạch-bậc (tính theo ngày công thực tế)
// ═══════════════════════════════════════════════════════════════════════════
export class GradeBaseCalculator implements ComponentCalculator {
  readonly type = "grade_base";

  async calculate(ctx: CalcContext): Promise<ComponentResult> {
    if (!ctx.gradeStep) return skipResult(ctx, "Chưa gán ngạch-bậc cho nhân viên");

    const monthly = ctx.gradeStep.monthly_salary_vnd;
    const std = ctx.attendance.standard_days || 26;
    const actual = ctx.attendance.actual_days;

    // Prorated by actual days: salary × (actual / standard)
    // multiply first to avoid bigint division loss
    const amount = roundVND((monthly * BigInt(actual)) / BigInt(std));

    const breakdown: BreakdownItem[] = [
      { label: "Ngạch", value: `${ctx.gradeStep.grade_code} — ${ctx.gradeStep.grade_name}` },
      { label: "Bậc", value: String(ctx.gradeStep.step_number) },
      { label: "Lương ngạch-bậc tháng", value: fmtVND(monthly) },
      { label: "Ngày công thực", value: `${actual} / ${std}` },
      { label: "Tính", value: `${fmtVND(monthly)} × ${actual}/${std} = ${fmtVND(amount)}` },
    ];

    return incomeResult(ctx, amount, breakdown);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// 2. TRIP_RATE_TIERED — Lương lượt theo tỉnh (tiered rate)
// params: { tiers: [{from_trip:0, to_trip:100, rate:65000}, ...],
//           rate_ho_tro_vnd, rate_noi_bai_vnd, rate_meal_sunday_vnd }
// ═══════════════════════════════════════════════════════════════════════════
export class TripRateTieredCalculator implements ComponentCalculator {
  readonly type = "trip_rate_tiered";

  async calculate(ctx: CalcContext): Promise<ComponentResult> {
    const log = ctx.inputBag.trip_log;
    if (!log) return skipResult(ctx, "Chưa có dữ liệu TRIP_LOG");

    const tiers = (ctx.params["tiers"] as { from_trip: number; to_trip: number; rate: number }[]) ?? [];
    const rateHoTro = parseBigInt(ctx.params["rate_ho_tro_vnd"]);
    const rateNoiBai = parseBigInt(ctx.params["rate_noi_bai_vnd"]);
    const rateMealSunday = parseBigInt(ctx.params["rate_meal_sunday_vnd"]);

    // Tiered trip income: T1 + T2
    let tripIncome = 0n;
    const bd: BreakdownItem[] = [];
    let remaining = log.so_luot_t1 + log.so_luot_t2;
    let tier1Used = 0; let tier2Used = 0;

    for (const tier of tiers) {
      if (remaining <= 0) break;
      const capacity = tier.to_trip === 9999 ? remaining : Math.min(remaining, tier.to_trip - tier.from_trip + 1);
      const count = Math.min(remaining, capacity);
      const sub = BigInt(count) * parseBigInt(tier.rate);
      tripIncome += sub;
      if (tier.from_trip === 0) { tier1Used = count; }
      else { tier2Used = count; }
      remaining -= count;
    }

    if (tier1Used > 0) {
      bd.push({ label: `Lượt Tier 1 (${tier1Used} lượt)`, value: fmtVND(BigInt(tier1Used) * parseBigInt((tiers[0] ?? {rate:0}).rate)) });
    }
    if (tier2Used > 0) {
      bd.push({ label: `Lượt Tier 2 (${tier2Used} lượt)`, value: fmtVND(BigInt(tier2Used) * parseBigInt((tiers[1] ?? {rate:0}).rate)) });
    }

    // Hỗ trợ tỉnh khác
    const hoTroIncome = BigInt(log.so_luot_ho_tro) * rateHoTro;
    if (log.so_luot_ho_tro > 0) {
      bd.push({ label: `Lượt hỗ trợ (${log.so_luot_ho_tro} lượt)`, value: fmtVND(hoTroIncome) });
    }

    // Nội Bài
    const noiBaiIncome = BigInt(log.so_luot_noibai) * rateNoiBai;
    if (log.so_luot_noibai > 0) {
      bd.push({ label: `Lượt Nội Bài (${log.so_luot_noibai} lượt)`, value: fmtVND(noiBaiIncome) });
    }

    // Ăn ca CN (Chủ nhật — counted from attendance)
    const mealSundayIncome = BigInt(ctx.attendance.sunday_days) * rateMealSunday;
    if (ctx.attendance.sunday_days > 0 && rateMealSunday > 0n) {
      bd.push({ label: `Ăn ca CN (${ctx.attendance.sunday_days} ngày)`, value: fmtVND(mealSundayIncome) });
    }

    const total = roundVND(tripIncome + hoTroIncome + noiBaiIncome + mealSundayIncome);
    return incomeResult(ctx, total, bd);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// 3. REVENUE_QUALITY — Doanh thu × Hệ số CLDV
// params: { coefficients: [{min_score:9.0, max_score:9.5, coefficient:1.2}, ...],
//           revenue_pct: 0.006 }
// ═══════════════════════════════════════════════════════════════════════════
export class RevenueQualityCalculator implements ComponentCalculator {
  readonly type = "revenue_quality";

  async calculate(ctx: CalcContext): Promise<ComponentResult> {
    const rcldv = ctx.inputBag.revenue_cldv;
    if (!rcldv) return skipResult(ctx, "Chưa có dữ liệu REVENUE_CLDV");

    const doanhthu = parseBigInt(rcldv.doanh_thu_vnd);
    const diem = Number(rcldv.diem_cldv ?? 0);
    const coefficients = (ctx.params["coefficients"] as { min_score: number; max_score: number; coefficient: number }[]) ?? [];
    const revenuePct = Number(ctx.params["revenue_pct"] ?? 0.006);

    // Find coefficient for diem_cldv
    let coeff = 0;
    for (const c of coefficients) {
      if (diem >= c.min_score && diem <= c.max_score) {
        coeff = c.coefficient;
        break;
      }
    }

    if (coeff === 0) {
      return incomeResult(ctx, 0n, [
        { label: "Điểm CLDV", value: String(diem) },
        { label: "Hệ số", value: "0 (điểm chưa đạt ngưỡng)" },
      ], [`Điểm CLDV ${diem} không khớp ngưỡng nào — hưởng 0`]);
    }

    // amount = DT × revenuePct × coefficient
    const amount = roundVND(BigInt(Math.round(Number(doanhthu) * revenuePct * coeff)));

    return incomeResult(ctx, amount, [
      { label: "Doanh thu HĐ", value: fmtVND(doanhthu) },
      { label: "Điểm CLDV", value: String(diem) },
      { label: "Hệ số CLDV", value: `× ${coeff}` },
      { label: "Tỷ lệ áp dụng", value: `${(revenuePct * 100).toFixed(1)}%` },
      { label: "Tính", value: `${fmtVND(doanhthu)} × ${(revenuePct * 100).toFixed(1)}% × ${coeff} = ${fmtVND(amount)}` },
    ]);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// 4. REVENUE_COMMISSION_TIERED — Thưởng DT LX Tải (tiered %)
// params: { tiers: [{from_vnd:0, to_vnd:50000000, pct:6}, ...] }
// ═══════════════════════════════════════════════════════════════════════════
export class RevenueCommissionTieredCalculator implements ComponentCalculator {
  readonly type = "revenue_commission_tiered";

  async calculate(ctx: CalcContext): Promise<ComponentResult> {
    const fr = ctx.inputBag.freight_revenue;
    if (!fr) return skipResult(ctx, "Chưa có dữ liệu FREIGHT_REVENUE");

    const dt = parseBigInt(fr.doanh_thu_vnd);
    const tiers = (ctx.params["tiers"] as { from_vnd: number; to_vnd: number | null; pct: number }[]) ?? [];

    if (!tiers.length) return skipResult(ctx, "Chưa cấu hình bảng thưởng DT");

    // Find applicable tier (apply to FULL doanh_thu, not progressive)
    let pct = 0;
    for (const tier of tiers) {
      const from = BigInt(tier.from_vnd);
      const to = tier.to_vnd ? BigInt(tier.to_vnd) : null;
      if (dt >= from && (to === null || dt <= to)) {
        pct = tier.pct;
        break;
      }
    }

    const amount = roundVND((dt * BigInt(pct)) / 100n);
    return incomeResult(ctx, amount, [
      { label: "Doanh thu", value: fmtVND(dt) },
      { label: "Mức thưởng", value: `${pct}%` },
      { label: "Tính", value: `${fmtVND(dt)} × ${pct}% = ${fmtVND(amount)}` },
    ]);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// 5. FIXED_BASE_SALARY — Lương cứng theo loại xe LX Tải
// params: { vehicle_type_rates: {"FRR_55T": 8000000, ...} }
// ═══════════════════════════════════════════════════════════════════════════
export class FixedBaseSalaryCalculator implements ComponentCalculator {
  readonly type = "fixed_base_salary";

  async calculate(ctx: CalcContext): Promise<ComponentResult> {
    const fr = ctx.inputBag.freight_revenue;
    const vehicleType = String(fr?.loai_xe ?? ctx.params["default_vehicle_type"] ?? "");
    const rates = (ctx.params["vehicle_type_rates"] as Record<string, number>) ?? {};
    const rate = rates[vehicleType];

    if (!rate) {
      return incomeResult(ctx, 0n, [], [`Không tìm thấy đơn giá cho loại xe '${vehicleType}'`]);
    }

    const monthly = parseBigInt(rate);
    const std = ctx.attendance.standard_days || 26;
    const actual = ctx.attendance.actual_days;
    const amount = roundVND((monthly * BigInt(actual)) / BigInt(std));

    return incomeResult(ctx, amount, [
      { label: "Loại xe", value: vehicleType },
      { label: "Lương cứng tháng", value: fmtVND(monthly) },
      { label: "Ngày công", value: `${actual}/${std}` },
      { label: "Tính", value: `${fmtVND(monthly)} × ${actual}/${std} = ${fmtVND(amount)}` },
    ]);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// 6. VEHICLE_REPAIR_DEDUCTION — Giảm trừ bảo dưỡng (% chi phí)
// params: { deduction_pct: 10 }  (10% of maintenance cost)
// ═══════════════════════════════════════════════════════════════════════════
export class VehicleRepairDeductionCalculator implements ComponentCalculator {
  readonly type = "vehicle_repair_deduction";

  async calculate(ctx: CalcContext): Promise<ComponentResult> {
    const mc = ctx.inputBag.maintenance_cost;
    if (!mc) return skipResult(ctx, "Chưa có dữ liệu MAINTENANCE_COST");

    const pct = Number(ctx.params["deduction_pct"] ?? 10);
    const totalCost = parseBigInt(mc.cp_sua_chua_vnd) + parseBigInt(mc.cp_lop_vnd);
    const amount = roundVND((totalCost * BigInt(pct)) / 100n);

    return deductResult(ctx, amount, [
      { label: "CP sửa chữa", value: fmtVND(parseBigInt(mc.cp_sua_chua_vnd)) },
      { label: "CP lốp", value: fmtVND(parseBigInt(mc.cp_lop_vnd)) },
      { label: "Tổng CP", value: fmtVND(totalCost) },
      { label: "Mức khấu trừ", value: `${pct}%` },
      { label: "Tính", value: `${fmtVND(totalCost)} × ${pct}% = ${fmtVND(amount)}` },
    ]);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// 7. INSURANCE_DEDUCTION — BHXH + BHYT + BHTN (Q4 confirmed configurable)
// params: { base_ref: "grade_base"|"contract"|"actual_income",
//           bhxh_pct:8, bhyt_pct:1.5, bhtn_pct:1,
//           apply_ceiling: true, ceiling_multiplier: 20 }
// ═══════════════════════════════════════════════════════════════════════════
export class InsuranceDeductionCalculator implements ComponentCalculator {
  readonly type = "insurance_deduction";

  private readonly BASE_SALARY_REF_VND = 2_340_000n; // 2024 lương cơ sở

  async calculate(ctx: CalcContext): Promise<ComponentResult> {
    const baseRef = String(ctx.params["base_ref"] ?? "grade_base");
    const bhxhPct = Number(ctx.params["bhxh_pct"] ?? 8);
    const bhytPct = Number(ctx.params["bhyt_pct"] ?? 1.5);
    const bhtnPct = Number(ctx.params["bhtn_pct"] ?? 1);
    const applyCeiling = ctx.params["apply_ceiling"] !== false;
    const ceilingMult = Number(ctx.params["ceiling_multiplier"] ?? 20);

    // Determine base salary
    let baseSalary: bigint;
    if (baseRef === "grade_base" && ctx.gradeStep) {
      baseSalary = ctx.gradeStep.monthly_salary_vnd;
    } else if (baseRef === "contract" && ctx.employee.contract_salary_vnd) {
      baseSalary = ctx.employee.contract_salary_vnd;
    } else if (baseRef === "actual_income" && ctx.preTaxGrossVnd) {
      baseSalary = ctx.preTaxGrossVnd;
    } else {
      return skipResult(ctx, `Không xác định được cơ sở đóng BH (${baseRef})`);
    }

    // Apply ceiling
    const ceiling = this.BASE_SALARY_REF_VND * BigInt(ceilingMult);
    const effectiveBase = applyCeiling && baseSalary > ceiling ? ceiling : baseSalary;

    // Calculate each component
    const bhxh = roundVND(BigInt(Math.round(Number(effectiveBase) * bhxhPct / 100)));
    const bhyt = roundVND(BigInt(Math.round(Number(effectiveBase) * bhytPct / 100)));
    const bhtn = roundVND(BigInt(Math.round(Number(effectiveBase) * bhtnPct / 100)));
    const total = bhxh + bhyt + bhtn;

    const bd: BreakdownItem[] = [
      { label: "Cơ sở đóng", value: `${baseRef} = ${fmtVND(baseSalary)}` },
      ...(applyCeiling && baseSalary > ceiling ? [{ label: "Trần đóng", value: fmtVND(ceiling) }] : []),
      { label: `BHXH (${bhxhPct}%)`, value: fmtVND(bhxh) },
      { label: `BHYT (${bhytPct}%)`, value: fmtVND(bhyt) },
      { label: `BHTN (${bhtnPct}%)`, value: fmtVND(bhtn) },
    ];

    return deductResult(ctx, total, bd);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// 8. ZERO_SUM_POOL — Pool TĐ/VP Tỉnh (filled by PoolCalculationService)
// params: { pool_key: "TD_{YYYY_MM}", total_pool_vnd: 5000000,
//           basis: "so_cuoc_nghe"|"gio_cong"|"he_so",
//           min_work_pct: 50, under_min_pct: 50,
//           remainder_behavior: "redistribute"|"return_to_company"|"carry_forward" }
// NOTE: actual amount injected via ctx.poolShare by PoolCalculationService
// ═══════════════════════════════════════════════════════════════════════════
export class ZeroSumPoolCalculator implements ComponentCalculator {
  readonly type = "zero_sum_pool";

  async calculate(ctx: CalcContext): Promise<ComponentResult> {
    // If PoolCalculationService already resolved the share, use it
    if (ctx.poolShare !== undefined) {
      return incomeResult(ctx, ctx.poolShare, [
        { label: "Pool key", value: String(ctx.params["pool_key"] ?? "") },
        { label: "Phần pool phân bổ", value: fmtVND(ctx.poolShare) },
      ]);
    }

    // No pool share yet — return 0 with warning (batch will call again via PoolService)
    return incomeResult(ctx, 0n, [], ["Pool chưa được tính — sẽ được điền bởi PoolCalculationService"]);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// 9. ATTENDANCE_BONUS_CONDITIONAL — Thưởng chuyên cần
// params: { min_actual_days: 24, amount_vnd: 1000000,
//           effective_from: "YYYY-MM-DD", effective_to: "YYYY-MM-DD" }
// ═══════════════════════════════════════════════════════════════════════════
export class AttendanceBonusConditionalCalculator implements ComponentCalculator {
  readonly type = "attendance_bonus_conditional";

  async calculate(ctx: CalcContext): Promise<ComponentResult> {
    const minDays = Number(ctx.params["min_actual_days"] ?? 24);
    const bonusAmount = parseBigInt(ctx.params["amount_vnd"]);
    const effFrom = String(ctx.params["effective_from"] ?? "");
    const effTo = String(ctx.params["effective_to"] ?? "");

    // Check date range if configured
    const today = ctx.periodMonth + "-01";
    if (effFrom && today < effFrom) return skipResult(ctx, `Thưởng CC chưa có hiệu lực (từ ${effFrom})`);
    if (effTo && today > effTo) return skipResult(ctx, `Thưởng CC hết hiệu lực (đến ${effTo})`);

    const actual = ctx.attendance.actual_days;
    const qualifies = actual >= minDays && !ctx.attendance.absence_days;

    if (!qualifies) {
      return incomeResult(ctx, 0n, [
        { label: "Ngày công thực", value: String(actual) },
        { label: "Ngưỡng tối thiểu", value: String(minDays) },
        { label: "Kết quả", value: "Không đủ điều kiện" },
      ]);
    }

    return incomeResult(ctx, bonusAmount, [
      { label: "Ngày công thực", value: `${actual} ≥ ${minDays} ✓` },
      { label: "Thưởng chuyên cần", value: fmtVND(bonusAmount) },
    ]);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// 10. MEAL_ALLOWANCE_CONDITIONAL — Ăn ca Chủ nhật
// params: { amount_per_sunday_vnd: 25000 }
// ═══════════════════════════════════════════════════════════════════════════
export class MealAllowanceConditionalCalculator implements ComponentCalculator {
  readonly type = "meal_allowance_conditional";

  async calculate(ctx: CalcContext): Promise<ComponentResult> {
    const rate = parseBigInt(ctx.params["amount_per_sunday_vnd"] ?? 25000);
    const sundays = ctx.attendance.sunday_days;

    if (sundays === 0) return incomeResult(ctx, 0n, [{ label: "Số CN đi làm", value: "0" }]);

    const amount = rate * BigInt(sundays);
    return incomeResult(ctx, amount, [
      { label: "Ngày CN đi làm", value: String(sundays) },
      { label: "Đơn giá", value: fmtVND(rate) },
      { label: "Tính", value: `${fmtVND(rate)} × ${sundays} = ${fmtVND(amount)}` },
    ]);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// 11. KPI_BONUS_PCT — Thưởng KPI % lương cơ bản
// params: { max_pct: 30 }  — actual pct from EXCEL import (kpi_log)
// ═══════════════════════════════════════════════════════════════════════════
export class KpiBonusPctCalculator implements ComponentCalculator {
  readonly type = "kpi_bonus_pct";

  async calculate(ctx: CalcContext): Promise<ComponentResult> {
    if (!ctx.gradeStep) return skipResult(ctx, "Chưa gán ngạch-bậc");
    // KPI % loaded from inputBag if available; else skip
    const kpiPct = Number(ctx.params["kpi_pct_override"] ?? 0);
    if (!kpiPct) return skipResult(ctx, "Chưa có kết quả KPI kỳ này");

    const base = ctx.gradeStep.monthly_salary_vnd;
    const amount = roundVND((base * BigInt(Math.round(kpiPct))) / 100n);
    return incomeResult(ctx, amount, [
      { label: "Lương cơ bản", value: fmtVND(base) },
      { label: "KPI%", value: `${kpiPct}%` },
      { label: "Tính", value: `${fmtVND(base)} × ${kpiPct}% = ${fmtVND(amount)}` },
    ]);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// 12. PROBATION_OVERRIDE — Nhân 85% khi thử việc
// Không phải thành phần cộng thêm — là modifier nhân vào TỔNG thu nhập trước
// params: { apply_to: "gross", multiplier_pct: 85 }
// ═══════════════════════════════════════════════════════════════════════════
export class ProbationOverrideCalculator implements ComponentCalculator {
  readonly type = "probation_override";

  async calculate(ctx: CalcContext): Promise<ComponentResult> {
    if (!ctx.attendance.is_probation && !ctx.employee.is_probation) {
      return skipResult(ctx, "Không trong thời gian thử việc");
    }
    const pct = Number(ctx.params["multiplier_pct"] ?? 85);
    const gross = ctx.preTaxGrossVnd ?? 0n;
    const reduced = roundVND((gross * BigInt(pct)) / 100n);
    const deduction = gross - reduced;

    return deductResult(ctx, deduction, [
      { label: "Thu nhập trước giảm", value: fmtVND(gross) },
      { label: "Thử việc hưởng", value: `${pct}%` },
      { label: "Giảm", value: fmtVND(deduction) },
    ]);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// 13. FIXED_TRIAL_SALARY — Lương flat thử việc (override hoàn toàn)
// params: { flat_salary_vnd: 5000000 }
// ═══════════════════════════════════════════════════════════════════════════
export class FixedTrialSalaryCalculator implements ComponentCalculator {
  readonly type = "fixed_trial_salary";

  async calculate(ctx: CalcContext): Promise<ComponentResult> {
    if (!ctx.attendance.is_probation && !ctx.employee.is_probation) {
      return skipResult(ctx, "Không trong thời gian thử việc");
    }
    const flat = parseBigInt(ctx.params["flat_salary_vnd"]);
    return incomeResult(ctx, flat, [
      { label: "Lương thử việc cố định", value: fmtVND(flat) },
    ]);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// 14. DPHH REVENUE POOL — Hoa hồng gửi/nhận ĐPHH
// params: { commission_gui_pct: 0.5, commission_nhan_pct: 0.3 }
// ═══════════════════════════════════════════════════════════════════════════
export class RevenuePoolCommissionCalculator implements ComponentCalculator {
  readonly type = "revenue_pool_commission";

  async calculate(ctx: CalcContext): Promise<ComponentResult> {
    const dphh = ctx.inputBag.dphh_revenue;
    if (!dphh) return { component_type: ctx.componentType, name: ctx.componentName, is_deduction: false, amount_vnd: 0n, breakdown: [], warnings: [], skipped: true, skipped_reason: "No DPHH_REVENUE" };
    const guiPct = Number(ctx.params["commission_gui_pct"] ?? 0.5);
    const nhanPct = Number(ctx.params["commission_nhan_pct"] ?? 0.3);
    const dtGui = parseBigInt(dphh.dt_gui_vnd);
    const dtNhan = parseBigInt(dphh.dt_nhan_vnd);
    const guiIncome = roundVND(BigInt(Math.round(Number(dtGui) * guiPct / 100)));
    const nhanIncome = roundVND(BigInt(Math.round(Number(dtNhan) * nhanPct / 100)));
    const total = guiIncome + nhanIncome;
    return incomeResult(ctx, total, [
      { label: "DT gửi hàng", value: fmtVND(dtGui) },
      { label: `Hoa hồng gửi (${guiPct}%)`, value: fmtVND(guiIncome) },
      { label: "DT nhận hàng", value: fmtVND(dtNhan) },
      { label: `Hoa hồng nhận (${nhanPct}%)`, value: fmtVND(nhanIncome) },
    ]);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// 15. KPI_POOL_SHARE — Pool KPI ĐPHH (zero-sum by hours worked)
// Same mechanism as zero_sum_pool but basis=gio_cong
// Uses ctx.poolShare injected by PoolCalculationService
// ═══════════════════════════════════════════════════════════════════════════
export class KpiPoolShareCalculator implements ComponentCalculator {
  readonly type = "kpi_pool_share";

  async calculate(ctx: CalcContext): Promise<ComponentResult> {
    if (ctx.poolShare !== undefined) {
      return incomeResult(ctx, ctx.poolShare, [
        { label: "Pool KPI ĐPHH", value: fmtVND(ctx.poolShare) },
      ]);
    }
    return incomeResult(ctx, 0n, [], ["Pool chưa được tính"]);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// 16. HOTLINE ZERO-SUM POOL — alias for zero_sum_pool (same logic, different pool_key)
// Handled by ZeroSumPoolCalculator already — registered under both keys
// ═══════════════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════════════
// 17. PENALTY_DEDUCTION — Phạt kỷ luật/giám sát (từ Excel manual)
// params: {} — amount from inputBag or manual override
// ═══════════════════════════════════════════════════════════════════════════
export class PenaltyDeductionCalculator implements ComponentCalculator {
  readonly type = "penalty_deduction";

  async calculate(ctx: CalcContext): Promise<ComponentResult> {
    const amount = parseBigInt(ctx.params["override_amount_vnd"] ?? 0);
    if (!amount) return skipResult(ctx, "Không có phạt kỳ này");
    return deductResult(ctx, amount, [
      { label: "Phạt kỷ luật", value: fmtVND(amount) },
    ]);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// 18. GRADE_ALLOWANCE — Phụ cấp theo ngạch
// params: { allowance_map: {"D1": 2000000, "D2": 1500000, ...} }
// ═══════════════════════════════════════════════════════════════════════════
export class GradeAllowanceCalculator implements ComponentCalculator {
  readonly type = "grade_allowance";

  async calculate(ctx: CalcContext): Promise<ComponentResult> {
    if (!ctx.gradeStep) return skipResult(ctx, "Chưa gán ngạch-bậc");
    const map = (ctx.params["allowance_map"] as Record<string, number>) ?? {};
    const amount = parseBigInt(map[ctx.gradeStep.grade_code] ?? 0);
    if (!amount) return incomeResult(ctx, 0n, [{ label: "PC ngạch", value: "0 (không cấu hình)" }]);
    return incomeResult(ctx, amount, [
      { label: "Ngạch", value: ctx.gradeStep.grade_code },
      { label: "Phụ cấp", value: fmtVND(amount) },
    ]);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// 19. REMOTE_WORK_ALLOWANCE — PC xa nhà / tăng cường
// params: { amount_vnd: 500000 }
// ═══════════════════════════════════════════════════════════════════════════
export class RemoteWorkAllowanceCalculator implements ComponentCalculator {
  readonly type = "remote_work_allowance";

  async calculate(ctx: CalcContext): Promise<ComponentResult> {
    const amount = parseBigInt(ctx.params["amount_vnd"] ?? 0);
    if (!amount) return skipResult(ctx, "Chưa cấu hình PC xa nhà");
    return incomeResult(ctx, amount, [{ label: "PC xa nhà", value: fmtVND(amount) }]);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// 20. SPECIAL_ALLOWANCE — Phụ cấp đặc thù
// params: { amount_vnd: 300000, condition: "always"|"if_attendance_ok" }
// ═══════════════════════════════════════════════════════════════════════════
export class SpecialAllowanceCalculator implements ComponentCalculator {
  readonly type = "special_allowance";

  async calculate(ctx: CalcContext): Promise<ComponentResult> {
    const amount = parseBigInt(ctx.params["amount_vnd"] ?? 0);
    if (!amount) return skipResult(ctx, "Chưa cấu hình PC đặc thù");
    const condition = String(ctx.params["condition"] ?? "always");
    if (condition === "if_attendance_ok" && ctx.attendance.absence_days > 0) {
      return incomeResult(ctx, 0n, [{ label: "PC đặc thù", value: "0 (có ngày vắng)" }]);
    }
    return incomeResult(ctx, amount, [{ label: "PC đặc thù", value: fmtVND(amount) }]);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// 21–29: Stub calculators — return 0 with note (implement later per QĐ)
// ═══════════════════════════════════════════════════════════════════════════
function stubCalculator(type_: string): ComponentCalculator {
  return {
    type: type_,
    async calculate(ctx: CalcContext): Promise<ComponentResult> {
      return {
        component_type: ctx.componentType,
        name: ctx.componentName,
        is_deduction: false,
        amount_vnd: 0n,
        breakdown: [],
        warnings: [`[STUB] Calculator '${type_}' chưa implement — trả về 0`],
        skipped: false,
      };
    },
  };
}

// [CpnCommissionCalculator replaced by class below]
// [ContractFeeCalculator replaced by class below]
// [VehicleMgmtAllowanceCalculator replaced by class below]
// [FuelQuotaDeductionCalculator replaced by class below]
// [ClhdPointDeductionCalculator replaced by class below]
// [TeamMilestoneBonusCalculator replaced by class below]
// [DeliveryCommissionCalculator replaced by class below]
// [LoadingSupportCalculator replaced by class below]
// [RankingBonusCalculator replaced by class below]
// [KpiMultiplierCalculator replaced by class below]

// ═══════════════════════════════════════════════════════════════════════════
// FULL IMPLEMENTATIONS (replacing stubs above)
// ═══════════════════════════════════════════════════════════════════════════

export class CpnCommissionCalculator implements ComponentCalculator {
  readonly type = "cpn_commission";
  async calculate(ctx: CalcContext): Promise<ComponentResult> {
    const tlog = ctx.inputBag.trip_log;
    if (!tlog) return { component_type: ctx.componentType, name: ctx.componentName, is_deduction: false, amount_vnd: 0n, breakdown: [], warnings: [], skipped: true, skipped_reason: "No TRIP_LOG" };
    const pct = Number(ctx.params["commission_pct"] ?? 2.5);
    const dtHD = parseBigInt(tlog.dt_hop_dong_vnd);
    const amount = roundVND((dtHD * BigInt(Math.round(pct * 100))) / 10000n);
    return { component_type: ctx.componentType, name: ctx.componentName, is_deduction: false, amount_vnd: amount, breakdown: [{ label: "DT HĐ", value: fmtVND(dtHD) }, { label: `CPN ${pct}%`, value: fmtVND(amount) }], warnings: [], skipped: false };
  }
}

export class ContractFeeCalculator implements ComponentCalculator {
  readonly type = "contract_fee";
  async calculate(ctx: CalcContext): Promise<ComponentResult> {
    const fee = parseBigInt(ctx.params["fee_vnd"] ?? 0);
    return { component_type: ctx.componentType, name: ctx.componentName, is_deduction: false, amount_vnd: fee, breakdown: [{ label: "Phí HĐ", value: fmtVND(fee) }], warnings: [], skipped: !fee };
  }
}

export class VehicleMgmtAllowanceCalculator implements ComponentCalculator {
  readonly type = "vehicle_mgmt_allowance";
  async calculate(ctx: CalcContext): Promise<ComponentResult> {
    const fr = ctx.inputBag.freight_revenue;
    const vehicleType = String(fr?.loai_xe ?? ctx.params["default_vehicle_type"] ?? "");
    const rates = (ctx.params["vehicle_type_rates"] as Record<string, number>) ?? {};
    const amount = parseBigInt(rates[vehicleType] ?? ctx.params["default_vnd"] ?? 0);
    return { component_type: ctx.componentType, name: ctx.componentName, is_deduction: false, amount_vnd: amount, breakdown: [{ label: "Loại xe", value: vehicleType }, { label: "QLPT", value: fmtVND(amount) }], warnings: [], skipped: false };
  }
}

export class FuelQuotaDeductionCalculator implements ComponentCalculator {
  readonly type = "fuel_quota_deduction";
  async calculate(ctx: CalcContext): Promise<ComponentResult> {
    const fr = ctx.inputBag.freight_revenue;
    const vehicleType = String(fr?.loai_xe ?? ctx.params["default_vehicle_type"] ?? "");
    const pricePerLiter = parseBigInt(ctx.params["price_per_liter_vnd"] ?? 23000);
    const consumption = (ctx.params["vehicle_consumption"] as Record<string, number>) ?? {};
    const literPer100km = Number(consumption[vehicleType] ?? ctx.params["default_liter_per_100km"] ?? 0);
    const kmPeriod = Number(ctx.params["km_per_period"] ?? 0);
    if (!literPer100km || !kmPeriod) return { component_type: ctx.componentType, name: ctx.componentName, is_deduction: true, amount_vnd: 0n, breakdown: [], warnings: [`No km/consumption for ${vehicleType}`], skipped: true };
    const totalLiters = (kmPeriod * literPer100km) / 100;
    const amount = roundVND(BigInt(Math.round(totalLiters)) * pricePerLiter);
    return { component_type: ctx.componentType, name: ctx.componentName, is_deduction: true, amount_vnd: amount, breakdown: [{ label: "Km", value: String(kmPeriod) }, { label: "L/100km", value: String(literPer100km) }, { label: "Tổng", value: fmtVND(amount) }], warnings: [], skipped: false };
  }
}

export class ClhdPointDeductionCalculator implements ComponentCalculator {
  readonly type = "clhd_point_deduction";
  async calculate(ctx: CalcContext): Promise<ComponentResult> {
    const fr = ctx.inputBag.freight_revenue;
    if (!fr) return { component_type: ctx.componentType, name: ctx.componentName, is_deduction: true, amount_vnd: 0n, breakdown: [], warnings: [], skipped: true, skipped_reason: "No FREIGHT_REVENUE" };
    const diemClhd = Number(fr.diem_clhd ?? 10);
    const thresholds = (ctx.params["thresholds"] as { min_score: number; max_score: number; deduct_pct: number }[]) ?? [];
    const gross = ctx.preTaxGrossVnd ?? 0n;
    let deductPct = 0;
    for (const t of thresholds) { if (diemClhd >= t.min_score && diemClhd < t.max_score) { deductPct = t.deduct_pct; break; } }
    const amount = roundVND((gross * BigInt(deductPct)) / 100n);
    return { component_type: ctx.componentType, name: ctx.componentName, is_deduction: true, amount_vnd: amount, breakdown: [{ label: "Điểm CLHĐ", value: String(diemClhd) }, { label: "Phạt%", value: String(deductPct) }, { label: "Tổng", value: fmtVND(amount) }], warnings: [], skipped: false };
  }
}

export class TeamMilestoneBonusCalculator implements ComponentCalculator {
  readonly type = "team_milestone_bonus";
  async calculate(ctx: CalcContext): Promise<ComponentResult> {
    const branch = ctx.inputBag.branch_stats;
    if (!branch) return { component_type: ctx.componentType, name: ctx.componentName, is_deduction: false, amount_vnd: 0n, breakdown: [], warnings: [], skipped: true, skipped_reason: "No BRANCH_STATS" };
    const dt = parseBigInt(branch.doanh_thu_vnd);
    const milestones = (ctx.params["milestones"] as { target_vnd: number; bonus_vnd: number }[]) ?? [];
    const sorted = [...milestones].sort((a, b) => b.target_vnd - a.target_vnd);
    const reached = sorted.find((m) => dt >= parseBigInt(m.target_vnd));
    const bonus = reached ? parseBigInt(reached.bonus_vnd) : 0n;
    return { component_type: ctx.componentType, name: ctx.componentName, is_deduction: false, amount_vnd: bonus, breakdown: [{ label: "DT", value: fmtVND(dt) }, { label: "Thưởng mốc", value: fmtVND(bonus) }], warnings: reached ? [] : ["Chưa đạt mốc"], skipped: false };
  }
}

export class DeliveryCommissionCalculator implements ComponentCalculator {
  readonly type = "delivery_commission";
  async calculate(ctx: CalcContext): Promise<ComponentResult> {
    const fr = ctx.inputBag.freight_revenue;
    if (!fr) return { component_type: ctx.componentType, name: ctx.componentName, is_deduction: false, amount_vnd: 0n, breakdown: [], warnings: [], skipped: true, skipped_reason: "No FREIGHT_REVENUE" };
    const rate = parseBigInt(ctx.params["rate_per_trip_vnd"] ?? 5000);
    const trips = Number(fr.so_chuyen ?? 0);
    const amount = rate * BigInt(trips);
    return { component_type: ctx.componentType, name: ctx.componentName, is_deduction: false, amount_vnd: amount, breakdown: [{ label: "Chuyến", value: String(trips) }, { label: "Đơn giá", value: fmtVND(rate) }, { label: "Tổng", value: fmtVND(amount) }], warnings: [], skipped: false };
  }
}

export class LoadingSupportCalculator implements ComponentCalculator {
  readonly type = "loading_support";
  async calculate(ctx: CalcContext): Promise<ComponentResult> {
    const amount = parseBigInt(ctx.params["amount_vnd"] ?? 0);
    return { component_type: ctx.componentType, name: ctx.componentName, is_deduction: false, amount_vnd: amount, breakdown: [{ label: "Hỗ trợ bốc xếp", value: fmtVND(amount) }], warnings: [], skipped: !amount };
  }
}

export class RankingBonusCalculator implements ComponentCalculator {
  readonly type = "ranking_bonus";
  async calculate(ctx: CalcContext): Promise<ComponentResult> {
    const rank = Number(ctx.params["current_rank"] ?? 0);
    const rankBonuses = (ctx.params["rank_bonuses"] as Record<string, number>) ?? {};
    const bonus = rank ? parseBigInt(rankBonuses[String(rank)] ?? 0) : 0n;
    return { component_type: ctx.componentType, name: ctx.componentName, is_deduction: false, amount_vnd: bonus, breakdown: [{ label: "Rank", value: rank ? `#${rank}` : "N/A" }, { label: "Thưởng", value: fmtVND(bonus) }], warnings: rank ? [] : ["Chưa có thứ hạng"], skipped: !rank };
  }
}

export class KpiMultiplierCalculator implements ComponentCalculator {
  readonly type = "kpi_multiplier";
  async calculate(ctx: CalcContext): Promise<ComponentResult> {
    const hs = ctx.inputBag.hotline_stats;
    if (!hs) return { component_type: ctx.componentType, name: ctx.componentName, is_deduction: true, amount_vnd: 0n, breakdown: [], warnings: [], skipped: true, skipped_reason: "No HOTLINE_STATS" };
    const threshold = Number(ctx.params["threshold_pct"] ?? 5);
    const deductPerPct = parseBigInt(ctx.params["deduct_per_pct_over_vnd"] ?? 100000);
    const tyLeNho = Number(hs.ty_le_nho ?? 0);
    const overPct = tyLeNho > threshold ? Math.ceil(tyLeNho - threshold) : 0;
    const amount = deductPerPct * BigInt(overPct);
    return { component_type: ctx.componentType, name: ctx.componentName, is_deduction: true, amount_vnd: amount, breakdown: [{ label: "Tỷ lệ nhỡ", value: `${tyLeNho.toFixed(1)}%` }, { label: "Ngưỡng", value: `${threshold}%` }, { label: "Phạt", value: fmtVND(amount) }], warnings: [], skipped: false };
  }
}

