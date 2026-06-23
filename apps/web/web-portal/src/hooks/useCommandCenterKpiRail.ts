import { useEffect, useMemo, useState } from 'react';
import type { KpiSparkPoint, PersonaRole } from '../data/command-center-types';
import { rollupToSparkline } from '../integrations/commandCenterKpi';
import { fetchKpiRollup } from '../integrations/kpiEngineApi';
import { listBusinessMasterItems } from '../integrations/businessMasterApi';
import { resolveIdentityScope } from '../integrations/identityScope';
import {
  isCommandCenterKpiDevFallbackEnabled,
  resolveCommandCenterKpiDevSeries,
  shouldSkipCommandCenterKpiSnapshotOnEmptyRollup,
} from '../utils/commandCenterStrictMode';

type SparklinePayload = { points?: KpiSparkPoint[] };

export type CommandCenterKpiSource = 'loading' | 'rollup' | 'snapshot' | 'mock' | 'empty';

export type CommandCenterKpiRailState = {
  series: KpiSparkPoint[];
  headlinePercent: number | null;
  source: CommandCenterKpiSource;
  usingMockFallback: boolean;
  loadFailed: boolean;
  isLoading: boolean;
};

/**
 * Command Center KPI rail — `kpi-engine/rollup` first (BE contract), optional business-master
 * snapshot. Mock persona series only when `VITE_ALLOW_MOCK_FALLBACK=true` (M-CC-06 strict default).
 */
export function useCommandCenterKpiRail(
  persona: PersonaRole,
  tenantIdHint?: string | null,
  companyIdHint?: string | null,
): CommandCenterKpiRailState {
  const [apiSeries, setApiSeries] = useState<KpiSparkPoint[]>([]);
  const [source, setSource] = useState<CommandCenterKpiSource>('loading');
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const { tenantId, companyId } = resolveIdentityScope(tenantIdHint, companyIdHint);

    void (async () => {
      setSource('loading');
      setLoadFailed(false);
      setApiSeries([]);

      const rollup = await fetchKpiRollup(tenantIdHint, companyIdHint);

      if (rollup !== null) {
        const fromRollup = rollupToSparkline(rollup);
        if (fromRollup.length && !cancelled) {
          setApiSeries(fromRollup);
          setSource('rollup');
          return;
        }
        // HTTP 200 with empty series — empty state, not error banner (D-8088-KPI-01)
        if (shouldSkipCommandCenterKpiSnapshotOnEmptyRollup()) {
          if (!cancelled) {
            setApiSeries([]);
            setSource('empty');
            setLoadFailed(false);
          }
          return;
        }
      }

      try {
        const items = await listBusinessMasterItems<SparklinePayload & { id: string }>(
          'kpi_sparkline_snapshots',
          tenantId,
          companyId,
        );
        const snap = items.find((x) => x.id === 'active_series');
        if (!cancelled && snap?.points?.length) {
          setApiSeries(snap.points);
          setSource('snapshot');
          return;
        }
      } catch {
        /* snapshot optional */
      }

      if (!cancelled) {
        setApiSeries([]);
        setSource('empty');
        setLoadFailed(rollup === null);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [tenantIdHint, companyIdHint]);

  return useMemo(() => {
    const devFallbackEnabled = isCommandCenterKpiDevFallbackEnabled();

    if (source === 'loading') {
      return {
        series: [],
        headlinePercent: null,
        source,
        usingMockFallback: false,
        loadFailed: false,
        isLoading: true,
      };
    }

    if (apiSeries.length) {
      const last = apiSeries[apiSeries.length - 1]?.value;
      return {
        series: apiSeries,
        headlinePercent: Number.isFinite(last) ? last : null,
        source,
        usingMockFallback: false,
        loadFailed: false,
        isLoading: false,
      };
    }

    if (devFallbackEnabled) {
      const mockSeries = resolveCommandCenterKpiDevSeries(persona);
      if (mockSeries.length) {
        const last = mockSeries[mockSeries.length - 1]?.value;
        return {
          series: mockSeries,
          headlinePercent: Number.isFinite(last) ? last : null,
          source: 'mock',
          usingMockFallback: true,
          loadFailed: false,
          isLoading: false,
        };
      }
    }

    return {
      series: [],
      headlinePercent: null,
      source,
      usingMockFallback: false,
      loadFailed,
      isLoading: false,
    };
  }, [apiSeries, loadFailed, persona, source]);
}
