import type { KpiSparkPoint } from '../data/command-center-mock';

/** Matches `GET /api/xbos/kpi-engine/rollup` data envelope (XBOS-KPI-202). */
export type KpiRollupPoint = {
  period: string;
  actual: number;
  target: number | null;
};

export type KpiRollupMetricSeries = {
  metricCode: string;
  points: KpiRollupPoint[];
};

export type KpiRollupData = {
  tenantId?: string;
  companyId?: string;
  from?: string;
  to?: string;
  series: KpiRollupMetricSeries[];
};

export function pickPrimaryRollupSeries(
  rollup: KpiRollupData | null | undefined,
  preferredMetricCode?: string,
): KpiRollupMetricSeries | null {
  const series = rollup?.series ?? [];
  if (!series.length) return null;
  if (preferredMetricCode) {
    const preferred = series.find((s) => s.metricCode === preferredMetricCode);
    if (preferred?.points?.length) return preferred;
  }
  return series.find((s) => s.points?.length) ?? null;
}

/** Map BE actuals/targets to % achievement sparkline (mock series are already %). */
export function mapRollupPointsToSparkline(points: KpiRollupPoint[]): KpiSparkPoint[] {
  return points.map((p) => {
    const target = p.target != null && Number(p.target) > 0 ? Number(p.target) : null;
    const actual = Number(p.actual) || 0;
    const value =
      target != null ? Math.round(Math.min((actual / target) * 100, 200)) : Math.round(actual);
    return {
      label: p.period.length >= 10 ? p.period.slice(5, 10) : p.period.slice(5) || p.period,
      value,
    };
  });
}

export function rollupToSparkline(
  rollup: KpiRollupData | null | undefined,
  preferredMetricCode?: string,
): KpiSparkPoint[] {
  const primary = pickPrimaryRollupSeries(rollup, preferredMetricCode);
  if (!primary?.points?.length) return [];
  return mapRollupPointsToSparkline(primary.points);
}

export function sparklineHeadlinePercent(points: KpiSparkPoint[]): number | null {
  if (!points.length) return null;
  const last = points[points.length - 1]?.value;
  return Number.isFinite(last) ? last : null;
}
