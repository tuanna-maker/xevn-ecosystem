import { resolveIdentityScope } from './identityScope';

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
