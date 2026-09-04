/**
 * Purpose: Unit tests for PoolCalculationService
 * WorkItem: HRM-POLICY-E4-TEST
 */
import { PoolCalculationService } from "./pool-calculation.service";

const svc = new PoolCalculationService();

const params = {
  total_pool_vnd: 9_000_000,
  basis: "so_cuoc_nghe",
  min_work_pct: 50,
  under_min_pct: 50,
  remainder_behavior: "redistribute",
};

function member(id: string, calls: number, actualDays = 26) {
  return {
    employee_id: id,
    attendance: { actual_days: actualDays, standard_days: 26 },
    inputBag: { hotline_stats: { so_cuoc_nghe: calls, ty_le_nho: 3, diem_chat_luong: 9, hotline_code: "1500" } },
  };
}

describe("PoolCalculationService", () => {
  it("equal basis → equal shares", () => {
    const result = svc.distributePool("TD_2026_06", params, [
      member("A", 1000), member("B", 1000), member("C", 1000),
    ]);
    expect(result.distributed_vnd).toBe(9_000_000n);
    expect(result.shares["A"]).toBe(3_000_000n);
    expect(result.shares["B"]).toBe(3_000_000n);
  });

  it("under-minimum employee gets 50% share", () => {
    const result = svc.distributePool("TD_2026_06", params, [
      member("A", 1000, 26),   // full
      member("B", 1000, 12),   // 46% work → under 50% → 50% basis
    ]);
    // A: basis=1000, B: basis=500 → A gets 2/3, B gets 1/3
    expect(result.shares["A"]! > result.shares["B"]!).toBe(true);
    expect(result.warnings.some((w) => w.includes("B"))).toBe(true);
  });

  it("zero total pool → all shares = 0, warning", () => {
    const result = svc.distributePool("TD_2026_06", { ...params, total_pool_vnd: 0 }, [
      member("A", 1000),
    ]);
    expect(result.total_pool_vnd).toBe(0n);
    expect(result.distributed_vnd).toBe(0n);
    expect(result.warnings.length).toBeGreaterThan(0);
  });

  it("zero total basis → warning, nothing distributed", () => {
    const result = svc.distributePool("TD_2026_06", params, [
      member("A", 0), member("B", 0),
    ]);
    expect(result.distributed_vnd).toBe(0n);
    expect(result.remainder_vnd).toBe(9_000_000n);
  });

  it("remainder behavior: return_to_company → warning added", () => {
    const pars = { ...params, remainder_behavior: "return_to_company", total_pool_vnd: 9_000_001 };
    const result = svc.distributePool("TD_2026_06", pars, [member("A", 1000)]);
    expect(result.warnings.some((w) => w.includes("trả về công ty"))).toBe(true);
  });
});
