import { describe, expect, it, vi, afterEach, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useCommandCenterKpiRail } from './useCommandCenterKpiRail';
import * as kpiEngineApi from '../integrations/kpiEngineApi';
import * as businessMasterApi from '../integrations/businessMasterApi';

vi.mock('../integrations/kpiEngineApi');
vi.mock('../integrations/businessMasterApi');

describe('useCommandCenterKpiRail', () => {
  beforeEach(() => {
    vi.stubEnv('DEV', 'true');
    vi.stubEnv('VITE_ALLOW_MOCK_FALLBACK', 'false');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('D-8088-KPI-01: empty rollup series HTTP 200 does not set loadFailed', async () => {
    vi.mocked(kpiEngineApi.fetchKpiRollup).mockResolvedValue({
      tenantId: 'xevn',
      companyId: 'holding',
      series: [],
    });

    const { result } = renderHook(() => useCommandCenterKpiRail('bod', 'xevn', 'main'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.loadFailed).toBe(false);
    expect(result.current.source).toBe('empty');
    expect(result.current.series).toEqual([]);
    expect(result.current.headlinePercent).toBeNull();
  });

  it('sets loadFailed when rollup API returns null (network/HTTP error)', async () => {
    vi.mocked(kpiEngineApi.fetchKpiRollup).mockResolvedValue(null);
    vi.mocked(businessMasterApi.listBusinessMasterItems).mockRejectedValue(new Error('skip'));

    const { result } = renderHook(() => useCommandCenterKpiRail('bod', 'xevn', 'main'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.loadFailed).toBe(true);
    expect(result.current.source).toBe('empty');
    expect(result.current.usingMockFallback).toBe(false);
    expect(result.current.series).toEqual([]);
  });

  it('M-CC-06 strict default: never uses mock persona series when flag off', async () => {
    vi.mocked(kpiEngineApi.fetchKpiRollup).mockResolvedValue(null);
    vi.mocked(businessMasterApi.listBusinessMasterItems).mockResolvedValue([]);

    const { result } = renderHook(() => useCommandCenterKpiRail('bod', 'xevn', 'main'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.source).not.toBe('mock');
    expect(result.current.usingMockFallback).toBe(false);
    expect(result.current.series).toEqual([]);
  });

  it('tries business-master snapshot when rollup fails in strict mode', async () => {
    vi.mocked(kpiEngineApi.fetchKpiRollup).mockResolvedValue(null);
    vi.mocked(businessMasterApi.listBusinessMasterItems).mockResolvedValue([
      {
        id: 'active_series',
        points: [
          { label: 'T1', value: 72 },
          { label: 'T2', value: 78 },
        ],
      },
    ]);

    const { result } = renderHook(() => useCommandCenterKpiRail('bod', 'xevn', 'main'));

    await waitFor(() => {
      expect(result.current.source).toBe('snapshot');
    });

    expect(result.current.loadFailed).toBe(false);
    expect(result.current.series).toHaveLength(2);
  });

  it('maps non-empty rollup series to sparkline', async () => {
    vi.mocked(kpiEngineApi.fetchKpiRollup).mockResolvedValue({
      series: [
        {
          metricCode: 'REV',
          points: [
            { period: '2026-01', actual: 80, target: 100 },
            { period: '2026-02', actual: 90, target: 100 },
          ],
        },
      ],
    });

    const { result } = renderHook(() => useCommandCenterKpiRail('bod', 'xevn', 'main'));

    await waitFor(() => {
      expect(result.current.source).toBe('rollup');
    });

    expect(result.current.loadFailed).toBe(false);
    expect(result.current.series.length).toBeGreaterThan(0);
    expect(result.current.headlinePercent).toBe(90);
  });
});
