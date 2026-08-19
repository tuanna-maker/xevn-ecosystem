/**
 * progressive_vn_v1 — monthly PIT brackets (BE SoT GĐ1 · O19).
 * Amounts VND · marginal rates per Vietnamese 7-bracket ladder.
 */
export type ProgressiveVnBracket = {
  /** Upper bound inclusive (VND). */
  upToVnd: number;
  rate: number;
};

export const PROGRESSIVE_VN_V1_BRACKETS: readonly ProgressiveVnBracket[] = [
  { upToVnd: 5_000_000, rate: 0.05 },
  { upToVnd: 10_000_000, rate: 0.1 },
  { upToVnd: 18_000_000, rate: 0.15 },
  { upToVnd: 32_000_000, rate: 0.2 },
  { upToVnd: 52_000_000, rate: 0.25 },
  { upToVnd: 80_000_000, rate: 0.3 },
  { upToVnd: Number.POSITIVE_INFINITY, rate: 0.35 },
] as const;

function roundMoney(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

/** Apply 7-bracket progressive tax once on post-deduction assessable income (VND). */
export function computeProgressiveVnV1Tax(assessableIncomeVnd: number): number {
  const income = Math.max(0, roundMoney(assessableIncomeVnd));
  if (income <= 0) return 0;

  let tax = 0;
  let prevCap = 0;
  for (const bracket of PROGRESSIVE_VN_V1_BRACKETS) {
    if (income <= prevCap) break;
    const cap = bracket.upToVnd;
    const sliceEnd = Math.min(income, cap);
    const slice = sliceEnd - prevCap;
    if (slice > 0) {
      tax += slice * bracket.rate;
    }
    if (!Number.isFinite(cap)) break;
    prevCap = cap;
  }
  return roundMoney(tax);
}
