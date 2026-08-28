import { ComponentCalculator, CalcContext, ComponentResult } from '../calculator.interface';

export class RevenueQualityCalculator implements ComponentCalculator {
  readonly componentType = 'REVENUE_QUALITY';

  async calculate(ctx: CalcContext): Promise<ComponentResult> {
    const revenueLog = ctx.inputBag['REVENUE_CLDV'] as any;
    const warnings: string[] = [];

    if (!revenueLog) {
      warnings.push(`Thiếu dữ liệu doanh thu (REVENUE_CLDV) cho nhân viên ${ctx.employeeId}`);
      return {
        component_type: this.componentType,
        amount_vnd: 0n,
        breakdown: { error: 'Missing REVENUE_CLDV' },
        warnings
      };
    }

    const revenueVnd = BigInt(revenueLog.doanh_thu_vnd || 0);
    const qualityScore = revenueLog.diem_cldv || 100;

    const basePct = ctx.component?.params?.revenue_pct || 0; // e.g., 2%
    const tiers = ctx.component?.params?.quality_tiers || [];

    let qualityMultiplier = 1.0;
    let matchedTier = null;

    // Tiers sorted by min_score descending
    const sortedTiers = [...tiers].sort((a, b) => b.min_score - a.min_score);

    for (const tier of sortedTiers) {
      if (qualityScore >= tier.min_score) {
        qualityMultiplier = tier.multiplier;
        matchedTier = tier;
        break;
      }
    }

    if (!matchedTier && tiers.length > 0) {
      // If there are tiers but none matched (score is too low), maybe multiplier is 0
      qualityMultiplier = 0;
    }

    const baseAmount = Number(revenueVnd) * (basePct / 100);
    const finalAmount = BigInt(Math.floor(baseAmount * qualityMultiplier));

    return {
      component_type: this.componentType,
      amount_vnd: finalAmount,
      breakdown: {
        revenue_vnd: revenueVnd.toString(),
        quality_score: qualityScore,
        base_pct: basePct,
        quality_multiplier: qualityMultiplier,
        matched_tier: matchedTier,
        formula: `${revenueVnd} x ${basePct}% x ${qualityMultiplier} (K_CLDV)`
      },
      warnings
    };
  }
}
