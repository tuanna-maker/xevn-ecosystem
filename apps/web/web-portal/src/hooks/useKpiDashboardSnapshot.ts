import { useEffect, useState } from 'react';
import type { KPIDashboardData, KPIMetric } from '../data/mockData';
import { mockKPIDashboardData } from '../data/mockData';
import { listBusinessMasterItems } from '../integrations/businessMasterApi';
import { evaluateKpiBatch } from '../integrations/kpiEngineApi';
import { allowMockFallback } from '../utils/mockPolicy';

type LoadState = 'idle' | 'loading' | 'ready' | 'error';

function readNumber(value: unknown, fallback = 0): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function bandToStatus(band: 'excellent' | 'warning' | 'critical'): KPIDashboardData['status'] {
  if (band === 'excellent') return 'good';
  if (band === 'warning') return 'warning';
  return 'critical';
}

function bandToTrend(ratio: number): KPIDashboardData['trend'] {
  if (ratio >= 1) return 'up';
  if (ratio < 0.85) return 'down';
  return 'stable';
}

function metricToDashboardRow(
  metric: KPIMetric,
  companyId: string,
  evaluation: { band: 'excellent' | 'warning' | 'critical'; ratio: number; score: number },
): KPIDashboardData {
  const target = readNumber(metric.targetValue, 1);
  const actual = readNumber(
    (metric as KPIMetric & { currentValue?: number; lastActual?: number }).currentValue ??
      (metric as KPIMetric & { lastActual?: number }).lastActual,
    target * evaluation.ratio,
  );
  const changePercent = Math.round((evaluation.ratio - 1) * 100);
  return {
    companyId,
    kpiCode: metric.code,
    kpiName: metric.name,
    currentValue: actual,
    targetValue: target,
    unit: metric.unit,
    status: bandToStatus(evaluation.band),
    trend: bandToTrend(evaluation.ratio),
    changePercent,
  };
}

export function useKpiDashboardSnapshot(tenantId: string, companyId: string, scopeCompanyId: string) {
  const [rows, setRows] = useState<KPIDashboardData[]>([]);
  const [loadState, setLoadState] = useState<LoadState>('idle');
  const [usingMockFallback, setUsingMockFallback] = useState(false);
  const [sourceNote, setSourceNote] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoadState('loading');
      setUsingMockFallback(false);
      setSourceNote(null);
      try {
        const metrics = await listBusinessMasterItems<KPIMetric & { currentValue?: number; lastActual?: number }>(
          'kpi_metrics',
          tenantId,
          companyId,
        );
        if (!metrics.length) {
          setRows([]);
          setLoadState('ready');
          setSourceNote('Chưa có KPI trong business-master. Thêm tại Cài đặt → KPI & Metric.');
          return;
        }

        const applicable = metrics.filter((m) => {
          const companies = m.applicableCompanies ?? ['all'];
          if (scopeCompanyId === 'all') return companies.includes('all');
          return companies.includes('all') || companies.includes(scopeCompanyId);
        });

        const evaluateInputs = applicable.map((m) => {
          const target = readNumber(m.targetValue, 1);
          const actual = readNumber(m.currentValue ?? m.lastActual, target * 0.92);
          return {
            target,
            actual,
            warningThreshold: readNumber(m.warningThreshold, target * 0.8),
            criticalThreshold: readNumber(m.criticalThreshold, target * 0.6),
          };
        });

        const evaluations = await evaluateKpiBatch(evaluateInputs, tenantId, companyId);
        const companyKey = scopeCompanyId === 'all' ? 'all' : scopeCompanyId;
        const built = applicable.map((m, index) =>
          metricToDashboardRow(m, companyKey, {
            band: evaluations[index]?.band ?? 'warning',
            ratio: evaluations[index]?.ratio ?? 0.9,
            score: evaluations[index]?.score ?? 0,
          }),
        );

        if (!cancelled) {
          setRows(built);
          setLoadState('ready');
          setSourceNote(
            built.some((r) => !applicable.find((m) => m.code === r.kpiCode && (m.currentValue ?? m.lastActual)))
              ? 'Một số KPI dùng giá trị thực tế ước lượng (92% mục tiêu) khi chưa có telemetry.'
              : 'Nguồn: business-master + kpi-engine/evaluate-batch.',
          );
        }
      } catch {
        if (cancelled) return;
        if (allowMockFallback()) {
          const filtered =
            scopeCompanyId === 'all'
              ? mockKPIDashboardData.filter((k) => k.companyId === 'all')
              : mockKPIDashboardData.filter((k) => k.companyId === scopeCompanyId);
          setRows(filtered);
          setUsingMockFallback(true);
          setSourceNote(null);
        } else {
          setRows([]);
          setUsingMockFallback(false);
        }
        setLoadState('error');
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [tenantId, companyId, scopeCompanyId]);

  return {
    rows,
    loadState,
    loadFailed: loadState === 'error',
    usingMockFallback,
    sourceNote,
    isLoading: loadState === 'loading',
  };
}
