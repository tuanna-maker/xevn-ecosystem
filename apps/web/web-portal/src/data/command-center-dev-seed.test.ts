import { describe, expect, it, vi, afterEach } from 'vitest';

import {

  getCommandCenterMockPortalAlerts,

  getCommandCenterMockUnifiedTasks,

  getCommandCenterMockKpiSeries,

} from './command-center-dev-seed';



describe('command-center-dev-seed (M-CC-13)', () => {

  afterEach(() => {

    vi.unstubAllEnvs();

  });



  it('strict mode returns empty inbox/alerts/KPI seed', () => {

    vi.stubEnv('DEV', 'true');

    vi.stubEnv('VITE_ALLOW_MOCK_FALLBACK', 'false');

    expect(getCommandCenterMockUnifiedTasks()).toEqual([]);

    expect(getCommandCenterMockPortalAlerts()).toEqual([]);

    expect(getCommandCenterMockKpiSeries('bod')).toEqual([]);

  });



  it('dev mock flag returns non-empty seed rows', () => {

    vi.stubEnv('DEV', 'true');

    vi.stubEnv('VITE_ALLOW_MOCK_FALLBACK', 'true');

    expect(getCommandCenterMockUnifiedTasks().length).toBeGreaterThan(0);

    expect(getCommandCenterMockPortalAlerts().length).toBeGreaterThan(0);

    expect(getCommandCenterMockKpiSeries('bod').length).toBeGreaterThan(0);

  });

});

