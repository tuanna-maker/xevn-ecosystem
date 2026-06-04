import type { KpiRollupData } from './commandCenterKpi';
import { resolveXbosKpiRollupCompanyId } from './commandCenterScope';
import { resolveIdentityScope } from './identityScope';
import { xbosGetData } from './xbosHttp';

export type KpiEvaluateInput = {
  target: number;
  actual: number;
  weight?: number;
  warningThreshold?: number;
  criticalThreshold?: number;
};

export type KpiEvaluateResult = {
  index: number;
  score: number;
  band: 'excellent' | 'warning' | 'critical';
  rewardAmount: number;
  penaltyAmount: number;
  netAmount: number;
  ratio: number;
};

async function kpiHeaders(tenantIdHint?: string | null, companyHint?: string | null) {
  const scope = resolveIdentityScope(tenantIdHint ?? null, companyHint ?? null);
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-tenant-id': scope.tenantId,
    'x-company-id': scope.companyId,
  };
  const internalApiKey = import.meta.env.VITE_INTERNAL_API_KEY?.trim();
  if (internalApiKey) headers['x-internal-api-key'] = internalApiKey;
  return { headers, scope };
}

export async function fetchKpiRollup(
  tenantIdHint?: string | null,
  companyIdHint?: string | null,
  range?: { from?: string; to?: string },
): Promise<KpiRollupData | null> {
  const { tenantId } = resolveIdentityScope(tenantIdHint, companyIdHint);
  const rollupCompanyId = resolveXbosKpiRollupCompanyId(tenantIdHint, companyIdHint);
  const q = new URLSearchParams({
    tenantId,
    companyId: rollupCompanyId,
  });
  if (range?.from) q.set('from', range.from);
  if (range?.to) q.set('to', range.to);
  try {
    return await xbosGetData<KpiRollupData>(`/kpi-engine/rollup?${q.toString()}`, {
      scope: 'kpi-engine.rollup',
      tenantId,
      companyId: rollupCompanyId,
      headers: { 'x-company-id': rollupCompanyId },
      suppressLogStatuses: [409],
    });
  } catch {
    return null;
  }
}

export async function evaluateKpiBatch(
  items: KpiEvaluateInput[],
  tenantIdHint?: string | null,
  companyHint?: string | null,
): Promise<KpiEvaluateResult[]> {
  const { headers } = await kpiHeaders(tenantIdHint, companyHint);
  const res = await fetch('/api/xbos/kpi-engine/evaluate-batch', {
    method: 'POST',
    headers,
    body: JSON.stringify({ items }),
  });
  if (!res.ok) throw new Error('kpi-engine evaluate-batch failed');
  const json = await res.json();
  return (json?.data ?? []) as KpiEvaluateResult[];
}
