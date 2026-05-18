import { useEffect, useState } from 'react';
import type { KpiSparkPoint } from '../data/command-center-mock';
import { listBusinessMasterItems } from '../integrations/businessMasterApi';
import { xbosGetData } from '../integrations/xbosHttp';
import { MASTER_TENANT_ID } from '../constants/tenant';

type SparklinePayload = { points?: KpiSparkPoint[] };

export function useCommandCenterSparkline(tenantId = MASTER_TENANT_ID, companyId = MASTER_TENANT_ID) {
  const [series, setSeries] = useState<KpiSparkPoint[]>([]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const rollup = await xbosGetData<{ series?: Array<{ points?: Array<{ period: string; actual: number }> }> }>(
          `/kpi-engine/rollup?tenantId=${encodeURIComponent(tenantId)}&companyId=${encodeURIComponent(companyId)}`,
          { scope: 'kpi-engine.rollup', tenantId, companyId },
        );
        const first = rollup?.series?.[0]?.points;
        if (first?.length && !cancelled) {
          setSeries(first.map((p) => ({ label: p.period.slice(5), value: p.actual })));
          return;
        }
      } catch {
        /* rollup optional */
      }
      try {
        const items = await listBusinessMasterItems<SparklinePayload & { id: string }>(
          'kpi_sparkline_snapshots',
          tenantId,
          companyId,
        );
        const snap = items.find((x) => x.id === 'active_series');
        if (!cancelled && snap?.points?.length) setSeries(snap.points);
      } catch {
        if (!cancelled) setSeries([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [tenantId, companyId]);

  return series;
}
