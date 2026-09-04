/**
 * @CODE-MEMORY
 * Screen:     HRM · Payroll · Batch Phase 2 — Pool Distribution
 * UC:         UC-E4-02 (Pool Phase)
 * TechSpec:   TECHSPEC_HRM_POLICY_ENGINE_v1.md §7 Pool Engine
 * Purpose:    Orchestrate zero-sum pool distribution across all pool members.
 *             Flow:
 *               1. Collect all members with pool component
 *               2. Compute each member''s basis (so_cuoc_nghe / gio_cong / he_so)
 *               3. Check min_work_pct compliance
 *               4. Distribute pool_total proportionally
 *               5. Handle remainder per remainder_behavior
 * WorkItem:   HRM-POLICY-E4-01
 * Coded:      2026-08-22
 * must_keep:  All arithmetic in BIGINT. Pool key unique per period+type.
 *             remainder_behavior: "redistribute"|"return_to_company"|"carry_forward"
 */
import { Injectable } from "@nestjs/common";
import type { CalcContext } from "../policy/calculators/calculator.interface";
import { parseBigInt } from "../policy/calculators/calculator.interface";

export type PoolMember = {
  employee_id: string;
  calc_context: CalcContext;    // context for this employee's pool component
  component_params: Record<string, unknown>;
};

export type PoolResult = {
  pool_key: string;
  total_pool_vnd: bigint;
  distributed_vnd: bigint;
  remainder_vnd: bigint;
  remainder_behavior: string;
  shares: Record<string, bigint>; // employee_id → share
  warnings: string[];
};

@Injectable()
export class PoolCalculationService {
  /**
   * Distribute a zero-sum pool among members.
   * Returns map of employee_id → share amount.
   */
  distributePool(
    poolKey: string,
    params: Record<string, unknown>,
    members: Array<{
      employee_id: string;
      attendance: { actual_days: number; standard_days: number };
      inputBag: CalcContext["inputBag"];
    }>,
  ): PoolResult {
    const totalPool = parseBigInt(params["total_pool_vnd"] ?? 0);
    const basis = String(params["basis"] ?? "so_cuoc_nghe");
    const minWorkPct = Number(params["min_work_pct"] ?? 50);
    const underMinPct = Number(params["under_min_pct"] ?? 50);
    const remainderBehavior = String(params["remainder_behavior"] ?? "redistribute");

    const warnings: string[] = [];

    if (totalPool === 0n) {
      warnings.push("Pool total = 0 — không có gì để phân bổ");
      return {
        pool_key: poolKey, total_pool_vnd: 0n, distributed_vnd: 0n,
        remainder_vnd: 0n, remainder_behavior: remainderBehavior,
        shares: {}, warnings,
      };
    }

    // Step 1: Compute basis score for each member
    const memberBasis = members.map((m) => {
      const stdDays = m.attendance.standard_days || 26;
      const actualDays = m.attendance.actual_days;
      const workPct = (actualDays / stdDays) * 100;
      const meetsMin = workPct >= minWorkPct;

      let basisScore = 0;
      switch (basis) {
        case "so_cuoc_nghe":
          basisScore = m.inputBag.hotline_stats?.so_cuoc_nghe ?? 0;
          break;
        case "gio_cong":
          basisScore = m.inputBag.dphh_revenue?.gio_cong ?? 0;
          break;
        case "he_so":
          // Use actual/standard as basis
          basisScore = actualDays;
          break;
        default:
          basisScore = actualDays;
      }

      // Under-minimum: qualify for reduced share only
      const effectiveBasis = meetsMin ? basisScore : basisScore * (underMinPct / 100);
      return { employee_id: m.employee_id, basisScore, effectiveBasis, meetsMin, workPct };
    });

    // Step 2: Total effective basis
    const totalBasis = memberBasis.reduce((s, m) => s + m.effectiveBasis, 0);
    if (totalBasis === 0) {
      warnings.push("Tổng basis = 0 — không thể phân bổ pool");
      return {
        pool_key: poolKey, total_pool_vnd: totalPool, distributed_vnd: 0n,
        remainder_vnd: totalPool, remainder_behavior: remainderBehavior,
        shares: {}, warnings,
      };
    }

    // Step 3: Compute raw shares
    const shares: Record<string, bigint> = {};
    let distributed = 0n;

    for (const m of memberBasis) {
      if (m.effectiveBasis === 0) { shares[m.employee_id] = 0n; continue; }
      // share = total × (effectiveBasis / totalBasis), floor to 1000 VND
      const rawShare = (totalPool * BigInt(Math.round(m.effectiveBasis * 1000))) /
                       BigInt(Math.round(totalBasis * 1000));
      const rounded = (rawShare / 1000n) * 1000n;
      shares[m.employee_id] = rounded;
      distributed += rounded;
      if (!m.meetsMin) warnings.push(`${m.employee_id}: dưới chuẩn công (${m.workPct.toFixed(0)}%) — hưởng ${underMinPct}% phần chia`);
    }

    const remainder = totalPool - distributed;

    // Step 4: Handle remainder
    if (remainder > 0n) {
      switch (remainderBehavior) {
        case "redistribute": {
          // Add remainder to top-performing member
          const top = memberBasis.filter((m) => m.meetsMin).sort((a, b) => b.basisScore - a.basisScore)[0];
          if (top) {
            shares[top.employee_id] = (shares[top.employee_id] ?? 0n) + remainder;
            distributed += remainder;
          }
          break;
        }
        case "return_to_company":
          warnings.push(`Phần dư ${remainder.toLocaleString()} đ trả về công ty`);
          break;
        case "carry_forward":
          warnings.push(`Phần dư ${remainder.toLocaleString()} đ cộng vào quỹ tháng sau (chưa implement auto carry)`);
          break;
      }
    }

    return {
      pool_key: poolKey, total_pool_vnd: totalPool, distributed_vnd: distributed,
      remainder_vnd: totalPool - distributed, remainder_behavior: remainderBehavior,
      shares, warnings,
    };
  }
}
