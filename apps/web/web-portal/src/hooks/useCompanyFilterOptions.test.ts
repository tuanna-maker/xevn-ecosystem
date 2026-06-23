import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useCompanyFilterOptions } from './useCompanyFilterOptions';
import * as commandCenterScope from '../integrations/commandCenterScope';
import * as tenantScopeApi from '../integrations/tenantScopeApi';

vi.mock('../contexts/GlobalFilterContext', () => ({
  useGlobalFilter: () => ({
    companies: [],
    tenants: [],
    tenantScopeStatus: 'ready',
  }),
}));

vi.mock('../integrations/commandCenterScope', () => ({
  isGroupCeoOnMasterTenant: vi.fn(() => true),
}));

vi.mock('../integrations/tenantScopeApi');

describe('useCompanyFilterOptions', () => {
  beforeEach(() => {
    vi.stubEnv('DEV', 'true');
    vi.stubEnv('VITE_ALLOW_MOCK_FALLBACK', 'false');
    vi.mocked(commandCenterScope.isGroupCeoOnMasterTenant).mockReturnValue(true);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('M-CC-05: loads companies from group-member-units API (no mockCompanies)', async () => {
    vi.mocked(tenantScopeApi.fetchGroupMemberUnitsForCommandCenter).mockResolvedValue([
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
    expect(tenantScopeApi.fetchGroupMemberUnitsForCommandCenter).toHaveBeenCalled();
  });

  it('returns empty with loadFailed when group-member-units fails in strict mode', async () => {
    vi.mocked(commandCenterScope.isGroupCeoOnMasterTenant).mockReturnValue(true);
    vi.mocked(tenantScopeApi.fetchGroupMemberUnitsForCommandCenter).mockRejectedValue(
      new Error('403'),
    );

    const { result } = renderHook(() => useCompanyFilterOptions());

    await waitFor(() => {
      expect(result.current.loadFailed).toBe(true);
    });

    expect(result.current.companies).toEqual([]);
    expect(result.current.usingApi).toBe(false);
  });

  it('skips group-member-units fetch for non-group-CEO personas (member session)', async () => {
    vi.mocked(commandCenterScope.isGroupCeoOnMasterTenant).mockReturnValue(false);

    const { result } = renderHook(() => useCompanyFilterOptions());

    await waitFor(() => {
      expect(result.current.usingApi).toBe(false);
    });

    expect(tenantScopeApi.fetchGroupMemberUnitsForCommandCenter).not.toHaveBeenCalled();
    expect(result.current.loadFailed).toBe(false);
  });
});
