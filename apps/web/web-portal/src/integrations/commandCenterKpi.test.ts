import { describe, expect, it } from 'vitest';
import {
  mapRollupPointsToSparkline,
  pickPrimaryRollupSeries,
  rollupToSparkline,
  sparklineHeadlinePercent,
} from './commandCenterKpi';

describe('commandCenterKpi', () => {
  it('maps rollup actual/target to achievement %', () => {
    const points = mapRollupPointsToSparkline([
      { period: '2026-01-01', actual: 80, target: 100 },
      { period: '2026-02-01', actual: 95, target: 100 },
    ]);
    expect(points).toEqual([
      { label: '01-01', value: 80 },
      { label: '02-01', value: 95 },
    ]);
    expect(points[0]?.label).toHaveLength(5);
    expect(sparklineHeadlinePercent(points)).toBe(95);
  });

  it('uses actual as value when target missing', () => {
    const points = mapRollupPointsToSparkline([{ period: '2026-03-01', actual: 42, target: null }]);
    expect(points[0]?.value).toBe(42);
  });

  it('picks preferred metric then first non-empty series', () => {
    const rollup = {
      series: [
        { metricCode: 'empty', points: [] },
        { metricCode: 'group_kpi', points: [{ period: '2026-01-01', actual: 1, target: 2 }] },
        { metricCode: 'other', points: [{ period: '2026-01-01', actual: 9, target: 10 }] },
      ],
    };
    expect(pickPrimaryRollupSeries(rollup, 'group_kpi')?.metricCode).toBe('group_kpi');
    expect(pickPrimaryRollupSeries(rollup, 'missing')?.metricCode).toBe('group_kpi');
    expect(rollupToSparkline(rollup, 'group_kpi')).toEqual([{ label: '01-01', value: 50 }]);
  });
});
