import { ComponentCalculator, CalcContext, ComponentResult } from '../calculator.interface';

export class TripRateTieredCalculator implements ComponentCalculator {
  readonly componentType = 'TRIP_RATE_TIERED';

  async calculate(ctx: CalcContext): Promise<ComponentResult> {
    const tripLog = ctx.inputBag['TRIP_LOG'] as any;
    const warnings: string[] = [];
    
    if (!tripLog) {
      warnings.push(`Thiếu dữ liệu chuyến (TRIP_LOG) cho nhân viên ${ctx.employeeId}`);
      return {
        component_type: this.componentType,
        amount_vnd: 0n,
        breakdown: { error: 'Missing TRIP_LOG' },
        warnings
      };
    }

    const tiers = ctx.component?.params?.tiers || [];
    const totalTrips = (tripLog.so_luot_t1 || 0) + (tripLog.so_luot_t2 || 0);

    let rate = 0n;
    let matchedTier = null;

    // Tiers should be sorted by threshold descending, but we sort to be safe
    const sortedTiers = [...tiers].sort((a, b) => b.threshold - a.threshold);

    for (const tier of sortedTiers) {
      if (totalTrips >= tier.threshold) {
        rate = BigInt(tier.rate_vnd || 0);
        matchedTier = tier;
        break;
      }
    }

    // Default rate if no tiers matched or no tiers defined
    if (rate === 0n && ctx.component?.params?.base_rate_vnd) {
      rate = BigInt(ctx.component.params.base_rate_vnd);
    }

    const amount = BigInt(totalTrips) * rate;

    return {
      component_type: this.componentType,
      amount_vnd: amount,
      breakdown: {
        total_trips: totalTrips,
        applied_rate: rate.toString(),
        matched_tier: matchedTier,
        formula: `${totalTrips} chuyến x ${rate} đ`
      },
      warnings
    };
  }
}
