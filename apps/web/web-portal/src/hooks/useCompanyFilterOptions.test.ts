import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useCompanyFilterOptions } from './useCompanyFilterOptions';
import * as tenantScopeApi from '../integrations/tenantScopeApi';

vi.mock('../contexts/GlobalFilterContext', () => ({
  useGlobalFilter: () => ({
    companies: [],
    tenants: [],
    tenantScopeStatus: 'ready',
  }),
}));

vi.mock('../integrations/tenantScopeApi');

describe('useCompanyFilterOptions', () => {
  beforeEach(() => {
    vi.stubEnv('DEV', 'true');
    vi.stubEnv('VITE_ALLOW_MOCK_FALLBACK', 'false');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('M-CC-05: loads companies from company-units API (no mockCompanies)', async () => {
    vi.mocked(tenantScopeApi.fetchCompanyUnitsForCommandCenter).mockResolvedValue([
      {
        id: 'le-du-lich',
        code: 'DL',
        name: 'Công ty Du lịch',
        shortName: 'Du lịch',
        employeeCount: 0,
        revenue: 0,
        status: 'active',
        address: '',
        establishedDate: '2020-01-01',
        entityLevel: 'subsidiary',
        parentEntityId: 'xbos-group-holding-root',
        tenantId: 'xe-du-lich',
      },
    ]);

    const { result } = renderHook(() => useCompanyFilterOptions());

    await waitFor(() => {
      expect(result.current.usingApi).toBe(true);
    });

    expect(result.current.companies).toHaveLength(1);
    expect(result.current.companies[0]?.name).toBe('Công ty Du lịch');
    expect(result.current.loadFailed).toBe(false);
    expect(tenantScopeApi.fetchCompanyUnitsForCommandCenter).toHaveBeenCalled();
  });

  it('returns empty with loadFailed when company-units fails in strict mode', async () => {
    vi.mocked(tenantScopeApi.fetchCompanyUnitsForCommandCenter).mockRejectedValue(
      new Error('403'),
    );

    const { result } = renderHook(() => useCompanyFilterOptions());

    await waitFor(() => {
      expect(result.current.loadFailed).toBe(true);
    });

    expect(result.current.companies).toEqual([]);
    expect(result.current.usingApi).toBe(false);
  });

  it('member CEO also loads company-units (scoped list, not 403 skip)', async () => {
    vi.mocked(tenantScopeApi.fetchCompanyUnitsForCommandCenter).mockResolvedValue([
      {
        id: 'le-visun',
        code: 'VISUN',
        name: 'Công ty TNHH Du lịch Visun',
        shortName: 'Visun',
        employeeCount: 0,
        revenue: 0,
        status: 'active',
        address: '',
        establishedDate: '2020-01-01',
        entityLevel: 'subsidiary',
        parentEntityId: null,
        tenantId: 'visun',
      },
    ]);

    const { result } = renderHook(() => useCompanyFilterOptions());

    await waitFor(() => {
      expect(result.current.usingApi).toBe(true);
    });

    expect(tenantScopeApi.fetchCompanyUnitsForCommandCenter).toHaveBeenCalled();
    expect(result.current.companies[0]?.name).toContain('Visun');
    expect(result.current.loadFailed).toBe(false);
  });
});
