import { describe, expect, it, vi, afterEach } from 'vitest';

import {
  getPortalMockCustomers,
  getPortalMockEmployees,
  getPortalMockExecutiveDashboardStats,
  getPortalMockKpiDashboardData,
  getPortalMockPartners,
  getPortalMockVehicleTypes,
} from './portal-dev-seed';

describe('portal-dev-seed (M-CC-07..10)', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('strict mode returns empty gated seed getters', () => {
    vi.stubEnv('DEV', 'true');
    vi.stubEnv('VITE_ALLOW_MOCK_FALLBACK', 'false');
    expect(getPortalMockEmployees('all')).toEqual([]);
    expect(getPortalMockExecutiveDashboardStats()).toBeNull();
    expect(getPortalMockKpiDashboardData('all')).toEqual([]);
    expect(getPortalMockCustomers()).toEqual([]);
    expect(getPortalMockPartners()).toEqual([]);
    expect(getPortalMockVehicleTypes()).toEqual([]);
  });

  it('dev mock flag returns non-empty seed getters', () => {
    vi.stubEnv('DEV', 'true');
    vi.stubEnv('VITE_ALLOW_MOCK_FALLBACK', 'true');
    expect(getPortalMockEmployees('all').length).toBeGreaterThan(0);
    expect(getPortalMockExecutiveDashboardStats()).not.toBeNull();
    expect(getPortalMockKpiDashboardData('all').length).toBeGreaterThan(0);
    expect(getPortalMockCustomers().length).toBeGreaterThan(0);
    expect(getPortalMockPartners().length).toBeGreaterThan(0);
    expect(getPortalMockVehicleTypes().length).toBeGreaterThan(0);
  });
});
