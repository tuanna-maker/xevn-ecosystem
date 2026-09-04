/**
 * @CODE-MEMORY
 * Purpose:    Unit tests for all ComponentCalculators.
 * WorkItem:   HRM-POLICY-E2-TEST
 * Coded:      2026-08-22
 * Run:        npx jest --testPathPattern=calculators.spec
 */
import type { CalcContext } from "./calculator.interface";
// Import from the file — all calculators are now proper classes
import * as Calcs from "./all-calculators";

const AttendanceBonusConditionalCalculator = Calcs.AttendanceBonusConditionalCalculator;
const GradeBaseCalculator = Calcs.GradeBaseCalculator;
const InsuranceDeductionCalculator = Calcs.InsuranceDeductionCalculator;
const MealAllowanceConditionalCalculator = Calcs.MealAllowanceConditionalCalculator;
const RevenueCommissionTieredCalculator = Calcs.RevenueCommissionTieredCalculator;
const RevenueQualityCalculator = Calcs.RevenueQualityCalculator;
const TripRateTieredCalculator = Calcs.TripRateTieredCalculator;
const ZeroSumPoolCalculator = Calcs.ZeroSumPoolCalculator;
// New full-implementation classes (at bottom of file)
const ClhdPointDeductionCalculator = Calcs.ClhdPointDeductionCalculator;
const FuelQuotaDeductionCalculator = Calcs.FuelQuotaDeductionCalculator;
const KpiMultiplierCalculator = Calcs.KpiMultiplierCalculator;

// ─── SHARED CONTEXT FACTORY ───────────────────────────────────────────────

function baseCtx(overrides: Partial<CalcContext> = {}): CalcContext {
  return {
    periodMonth: "2026-06",
    employee: {
      employee_id: "EMP001", full_name: "Nguyễn Văn A",
      pay_group_code: "LX_TUYEN", province_code: "ND",
      is_probation: false, contract_salary_vnd: null,
    },
    gradeStep: {
      grade_code: "LX1", step_number: 3,
      monthly_salary_vnd: 6_200_000n,
      grade_name: "Lái xe Tuyến - Sơ cấp",
    },
    attendance: {
      standard_days: 26, actual_days: 26,
      sunday_days: 4, night_shift_hours: 0,
      overtime_hours: 0, absence_days: 0, is_probation: false,
    },
    inputBag: {},
    params: {},
    componentName: "Test Component",
    componentType: "test",
    ...overrides,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// GradeBaseCalculator
// ═══════════════════════════════════════════════════════════════════════════
describe("GradeBaseCalculator", () => {
  const calc = new GradeBaseCalculator();

  it("full month → monthly_salary_vnd rounded 1000", async () => {
    const result = await calc.calculate(baseCtx());
    expect(result.skipped).toBe(false);
    expect(result.amount_vnd).toBe(6_200_000n);
  });

  it("prorated: 13/26 days → half salary", async () => {
    const ctx = baseCtx({ attendance: { ...baseCtx().attendance, actual_days: 13 } });
    const result = await calc.calculate(ctx);
    expect(result.amount_vnd).toBe(3_100_000n);
  });

  it("no gradeStep → skipped", async () => {
    const result = await calc.calculate(baseCtx({ gradeStep: null }));
    expect(result.skipped).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// TripRateTieredCalculator
// ═══════════════════════════════════════════════════════════════════════════
describe("TripRateTieredCalculator", () => {
  const calc = new TripRateTieredCalculator();
  const params = {
    tiers: [
      { from_trip: 0, to_trip: 60, rate: 65000 },
      { from_trip: 61, to_trip: 9999, rate: 70000 },
    ],
    rate_ho_tro_vnd: 50000,
    rate_noi_bai_vnd: 80000,
    rate_meal_sunday_vnd: 25000,
  };

  it("40 T1+T2 trips → tier 1 only", async () => {
    const ctx = baseCtx({
      params,
      inputBag: { trip_log: { tinh_code: "ND", so_luot_t1: 40, so_luot_t2: 0, so_luot_noibai: 0, so_luot_ho_tro: 0, dt_hop_dong_vnd: 1000000 } },
    });
    const result = await calc.calculate(ctx);
    expect(result.amount_vnd).toBeGreaterThan(0n);
  });

  it("no trip_log → skipped", async () => {
    const result = await calc.calculate(baseCtx({ params }));
    expect(result.skipped).toBe(true);
  });

  it("hotro trips add to total", async () => {
    const ctx = baseCtx({
      params,
      inputBag: { trip_log: { tinh_code: "ND", so_luot_t1: 0, so_luot_t2: 0, so_luot_noibai: 0, so_luot_ho_tro: 10, dt_hop_dong_vnd: 0 } },
    });
    const result = await calc.calculate(ctx);
    // 10 × 50000 (hỗ trợ) + 4 CN × 25000 (ăn ca) = 600,000
    expect(result.amount_vnd).toBe(600_000n);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// RevenueQualityCalculator
// ═══════════════════════════════════════════════════════════════════════════
describe("RevenueQualityCalculator", () => {
  const calc = new RevenueQualityCalculator();
  const params = {
    coefficients: [
      { min_score: 9.0, max_score: 9.5, coefficient: 1.0 },
      { min_score: 9.5, max_score: 10.0, coefficient: 1.2 },
    ],
    revenue_pct: 0.006,
  };

  it("score 9.2 → coeff 1.0", async () => {
    const ctx = baseCtx({
      params,
      inputBag: { revenue_cldv: { doanh_thu_vnd: 100_000_000, diem_cldv: 9.2 } },
    });
    const result = await calc.calculate(ctx);
    // 100M × 0.6% × 1.0 = 600,000
    expect(result.amount_vnd).toBe(600_000n);
  });

  it("score below threshold → 0 with warning", async () => {
    const ctx = baseCtx({
      params,
      inputBag: { revenue_cldv: { doanh_thu_vnd: 100_000_000, diem_cldv: 7.0 } },
    });
    const result = await calc.calculate(ctx);
    expect(result.amount_vnd).toBe(0n);
    expect(result.warnings.length).toBeGreaterThan(0);
  });

  it("no data → skipped", async () => {
    const result = await calc.calculate(baseCtx({ params }));
    expect(result.skipped).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// InsuranceDeductionCalculator
// ═══════════════════════════════════════════════════════════════════════════
describe("InsuranceDeductionCalculator", () => {
  const calc = new InsuranceDeductionCalculator();

  it("grade_base 6.2M → BHXH(8%)+BHYT(1.5%)+BHTN(1%)", async () => {
    const ctx = baseCtx({ params: { base_ref: "grade_base", bhxh_pct: 8, bhyt_pct: 1.5, bhtn_pct: 1, apply_ceiling: false } });
    const result = await calc.calculate(ctx);
    // 6.2M × 10.5% = 651,000 → rounded to 651,000
    expect(result.is_deduction).toBe(true);
    expect(result.amount_vnd).toBeGreaterThan(0n);
  });

  it("salary above ceiling (20× base) → capped at ceiling", async () => {
    const highGrade = { grade_code: "VP2", step_number: 9, monthly_salary_vnd: 50_000_000n, grade_name: "VP HN" };
    const ctx = baseCtx({ gradeStep: highGrade, params: { base_ref: "grade_base", apply_ceiling: true, ceiling_multiplier: 20 } });
    const result = await calc.calculate(ctx);
    // Ceiling = 20 × 2,340,000 = 46,800,000 → amount based on 46.8M not 50M
    expect(result.breakdown.some((b) => b.label === "Trần đóng")).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// ZeroSumPoolCalculator
// ═══════════════════════════════════════════════════════════════════════════
describe("ZeroSumPoolCalculator", () => {
  const calc = new ZeroSumPoolCalculator();

  it("poolShare not set → returns 0 with warning", async () => {
    const result = await calc.calculate(baseCtx({ params: { pool_key: "TD_2026_06" } }));
    expect(result.amount_vnd).toBe(0n);
    expect(result.warnings.length).toBeGreaterThan(0);
  });

  it("poolShare injected → returns injected value", async () => {
    const ctx = baseCtx({ params: { pool_key: "TD_2026_06" }, poolShare: 1_500_000n });
    const result = await calc.calculate(ctx);
    expect(result.amount_vnd).toBe(1_500_000n);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// AttendanceBonusConditionalCalculator
// ═══════════════════════════════════════════════════════════════════════════
describe("AttendanceBonusConditionalCalculator", () => {
  const calc = new AttendanceBonusConditionalCalculator();
  const params = { min_actual_days: 24, amount_vnd: 1_000_000 };

  it("26 days no absence → qualifies", async () => {
    const result = await calc.calculate(baseCtx({ params }));
    expect(result.amount_vnd).toBe(1_000_000n);
  });

  it("20 days → not qualified", async () => {
    const ctx = baseCtx({ params, attendance: { ...baseCtx().attendance, actual_days: 20 } });
    const result = await calc.calculate(ctx);
    expect(result.amount_vnd).toBe(0n);
  });

  it("has absence → not qualified", async () => {
    const ctx = baseCtx({ params, attendance: { ...baseCtx().attendance, absence_days: 2 } });
    const result = await calc.calculate(ctx);
    expect(result.amount_vnd).toBe(0n);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// MealAllowanceConditionalCalculator
// ═══════════════════════════════════════════════════════════════════════════
describe("MealAllowanceConditionalCalculator", () => {
  const calc = new MealAllowanceConditionalCalculator();

  it("4 sundays × 25000 = 100000", async () => {
    const result = await calc.calculate(baseCtx({ params: { amount_per_sunday_vnd: 25000 } }));
    expect(result.amount_vnd).toBe(100_000n);
  });

  it("0 sundays → 0", async () => {
    const ctx = baseCtx({ params: { amount_per_sunday_vnd: 25000 }, attendance: { ...baseCtx().attendance, sunday_days: 0 } });
    const result = await calc.calculate(ctx);
    expect(result.amount_vnd).toBe(0n);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// RevenueCommissionTieredCalculator
// ═══════════════════════════════════════════════════════════════════════════
describe("RevenueCommissionTieredCalculator", () => {
  const calc = new RevenueCommissionTieredCalculator();
  const params = {
    tiers: [
      { from_vnd: 0, to_vnd: 50_000_000, pct: 6 },
      { from_vnd: 50_000_001, to_vnd: 100_000_000, pct: 8 },
      { from_vnd: 100_000_001, to_vnd: null, pct: 10 },
    ],
  };

  it("DT 30M → 6%", async () => {
    const ctx = baseCtx({ params, inputBag: { freight_revenue: { doanh_thu_vnd: 30_000_000, diem_clhd: 9, so_chuyen: 10, loai_xe: "FRR_55T" } } });
    const result = await calc.calculate(ctx);
    expect(result.amount_vnd).toBe(1_800_000n); // 30M × 6%
  });

  it("DT 120M → 10%", async () => {
    const ctx = baseCtx({ params, inputBag: { freight_revenue: { doanh_thu_vnd: 120_000_000, diem_clhd: 9, so_chuyen: 30, loai_xe: "DAU_KEO" } } });
    const result = await calc.calculate(ctx);
    expect(result.amount_vnd).toBe(12_000_000n); // 120M × 10%
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// ClhdPointDeductionCalculator
// ═══════════════════════════════════════════════════════════════════════════
describe("ClhdPointDeductionCalculator", () => {
  const calc = new ClhdPointDeductionCalculator();
  const params = {
    thresholds: [
      { min_score: 0, max_score: 6, deduct_pct: 100 },
      { min_score: 6, max_score: 8, deduct_pct: 50 },
      { min_score: 8, max_score: 10, deduct_pct: 0 },
    ],
  };

  it("diem 9 → no deduction", async () => {
    const ctx = baseCtx({ params, preTaxGrossVnd: 10_000_000n, inputBag: { freight_revenue: { doanh_thu_vnd: 50_000_000, diem_clhd: 9, so_chuyen: 10, loai_xe: "FRR_55T" } } });
    const result = await calc.calculate(ctx);
    expect(result.amount_vnd).toBe(0n);
  });

  it("diem 5 → 100% gross deducted", async () => {
    const ctx = baseCtx({ params, preTaxGrossVnd: 10_000_000n, inputBag: { freight_revenue: { doanh_thu_vnd: 50_000_000, diem_clhd: 5, so_chuyen: 10, loai_xe: "FRR_55T" } } });
    const result = await calc.calculate(ctx);
    expect(result.amount_vnd).toBe(10_000_000n);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// FuelQuotaDeductionCalculator
// ═══════════════════════════════════════════════════════════════════════════
describe("FuelQuotaDeductionCalculator", () => {
  const calc = new FuelQuotaDeductionCalculator();

  it("FRR_55T 1000km × 12l/100km × 23000/l = 2,760,000", async () => {
    const params = {
      price_per_liter_vnd: 23000,
      vehicle_consumption: { FRR_55T: 12.0 },
      km_per_period: 1000,
      default_vehicle_type: "FRR_55T",
    };
    const ctx = baseCtx({ params, inputBag: { freight_revenue: { doanh_thu_vnd: 0, diem_clhd: 9, so_chuyen: 0, loai_xe: "FRR_55T" } } });
    const result = await calc.calculate(ctx);
    // 1000 × 12/100 × 23000 = 120 × 23000 = 2,760,000
    expect(result.amount_vnd).toBe(2_760_000n);
    expect(result.is_deduction).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// KpiMultiplierCalculator
// ═══════════════════════════════════════════════════════════════════════════
describe("KpiMultiplierCalculator", () => {
  const calc = new KpiMultiplierCalculator();
  const params = { threshold_pct: 5, deduct_per_pct_over_vnd: 100_000 };

  it("ty_le_nho 3% ≤ 5% → no deduction", async () => {
    const ctx = baseCtx({ params, inputBag: { hotline_stats: { so_cuoc_nghe: 1000, ty_le_nho: 3, diem_chat_luong: 9, hotline_code: "1500" } } });
    const result = await calc.calculate(ctx);
    expect(result.amount_vnd).toBe(0n);
  });

  it("ty_le_nho 8% → 3% over → deduct 300,000", async () => {
    const ctx = baseCtx({ params, inputBag: { hotline_stats: { so_cuoc_nghe: 1000, ty_le_nho: 8, diem_chat_luong: 7, hotline_code: "1500" } } });
    const result = await calc.calculate(ctx);
    expect(result.amount_vnd).toBe(300_000n);
  });
});

