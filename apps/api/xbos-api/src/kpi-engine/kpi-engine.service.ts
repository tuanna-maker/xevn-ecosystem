import { Injectable } from '@nestjs/common';

type EvaluateInput = {
  target: number;
  actual: number;
  weight?: number;
  warningThreshold?: number;
  criticalThreshold?: number;
};

@Injectable()
export class KpiEngineService {
  evaluate(input: EvaluateInput) {
    const target = Number(input.target || 0);
    const actual = Number(input.actual || 0);
    const weight = Number(input.weight ?? 1);
    const warningThreshold = Number(input.warningThreshold ?? target * 0.8);
    const criticalThreshold = Number(input.criticalThreshold ?? target * 0.6);
    const ratio = target > 0 ? actual / target : 0;
    const score = Math.max(0, Math.round(ratio * 100 * weight));

    let band: 'excellent' | 'warning' | 'critical' = 'excellent';
    if (actual <= criticalThreshold) band = 'critical';
    else if (actual <= warningThreshold) band = 'warning';

    const rewardAmount = band === 'excellent' ? Math.round((score - 100) * 10000) : 0;
    const penaltyAmount = band === 'critical' ? Math.round((100 - score) * 15000) : band === 'warning' ? Math.round((100 - score) * 7000) : 0;

    return {
      score,
      band,
      rewardAmount: rewardAmount > 0 ? rewardAmount : 0,
      penaltyAmount: penaltyAmount > 0 ? penaltyAmount : 0,
      netAmount: Math.max(rewardAmount, 0) - Math.max(penaltyAmount, 0),
      ratio,
    };
  }

  evaluateBatch(items: EvaluateInput[]) {
    return items.map((item, index) => ({ index, ...this.evaluate(item) }));
  }
}

