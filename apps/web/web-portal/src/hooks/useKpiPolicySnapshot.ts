import { useEffect, useState } from 'react';
import type { KPIMetric } from '../data/mockData';
import { mockKPIMetrics } from '../data/mockData';
import { listBusinessMasterItems } from '../integrations/businessMasterApi';
import { loadKpiPolicies, type KpiPolicyRow } from '../integrations/kpiPolicyApi';
import { allowMockFallback } from '../utils/mockPolicy';

type LoadState = 'idle' | 'loading' | 'ready' | 'error';

const mockPoliciesFallback: KpiPolicyRow[] = [
  {
    id: 'policy-1',
    code: 'CS-2024-001',
    name: 'Chính sách KPI Doanh thu Q1/2024',
    description: 'Quy định mục tiêu và cách tính KPI doanh thu cho toàn tập đoàn',
    status: 'approved',
    approvedDate: '2024-01-15',
    effectiveDate: '2024-01-01',
    applicableCompanies: ['all'],
    relatedKPIs: ['REV001'],
  },
];

export function useKpiPolicySnapshot(tenantId: string, companyId: string) {
  const [policies, setPolicies] = useState<KpiPolicyRow[]>([]);
  const [metrics, setMetrics] = useState<KPIMetric[]>([]);
  const [loadState, setLoadState] = useState<LoadState>('idle');
  const [usingMockFallback, setUsingMockFallback] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoadState('loading');
      setErrorMessage(null);
      setUsingMockFallback(false);
      try {
        const [policyRows, metricRows] = await Promise.all([
          loadKpiPolicies(tenantId, companyId),
          listBusinessMasterItems<KPIMetric>('kpi_metrics', tenantId, companyId),
        ]);
        if (cancelled) return;
        if (policyRows.length) {
          setPolicies(policyRows);
        } else if (allowMockFallback()) {
          setPolicies(mockPoliciesFallback);
          setUsingMockFallback(true);
        } else {
          setPolicies([]);
        }
        if (metricRows.length) {
          setMetrics(metricRows);
        } else if (allowMockFallback()) {
          setMetrics(mockKPIMetrics);
          setUsingMockFallback(true);
        } else {
          setMetrics([]);
        }
        setLoadState('ready');
      } catch (error) {
        if (cancelled) return;
        setLoadState('error');
        setErrorMessage(error instanceof Error ? error.message : 'Không tải được chính sách KPI');
        if (allowMockFallback()) {
          setPolicies(mockPoliciesFallback);
          setMetrics(mockKPIMetrics);
          setUsingMockFallback(true);
          setLoadState('ready');
        } else {
          setPolicies([]);
          setMetrics([]);
        }
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [tenantId, companyId]);

  return {
    policies,
    metrics,
    loadState,
    usingMockFallback,
    errorMessage,
    isLoading: loadState === 'loading',
    loadFailed: loadState === 'error',
  };
}
