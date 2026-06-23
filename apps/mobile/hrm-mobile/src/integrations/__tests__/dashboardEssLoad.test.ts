import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { HrmAuthConfig } from '../types';

const mocks = vi.hoisted(() => ({
  fetchEmployeeById: vi.fn(),
  hrmRequest: vi.fn(),
}));

vi.mock('../hrmEmployees', () => ({
  fetchEmployeeById: mocks.fetchEmployeeById,
}));

vi.mock('../hrmApiClient', async (importOriginal) => {
  const mod = await importOriginal<typeof import('../hrmApiClient')>();
  return {
    ...mod,
    hrmRequest: mocks.hrmRequest,
  };
});

import { loadEssDashboardSlice } from '../dashboardEssLoad';

const auth: HrmAuthConfig = {
  baseUrl: 'https://example.test',
  accessToken: 'Bearer t',
  companyId: 'holding',
  companyUuid: '00000000-0000-4000-8000-000000000099',
};

describe('loadEssDashboardSlice', () => {
  beforeEach(() => {
    mocks.fetchEmployeeById.mockReset();
    mocks.hrmRequest.mockReset();
  });

  it('resolves stat cards without throwing when scope ids are empty', async () => {
    const slice = await loadEssDashboardSlice({
      auth,
      companyId: '',
      employeeId: '',
      isManager: false,
      selectedDate: '2026-06-08',
      managerPendingCount: 0,
      offWorkCount: 0,
      myLeavesCount: 2,
    });

    expect(slice.roleSubtitle).toBe('Nhân viên');
    expect(slice.statCards.length).toBe(4);
    expect(mocks.fetchEmployeeById).not.toHaveBeenCalled();
  });

  it('swallows rejected parallel fetches and returns safe defaults', async () => {
    mocks.fetchEmployeeById.mockRejectedValue(new Error('network'));
    mocks.hrmRequest.mockRejectedValue(new Error('timeout'));

    const slice = await loadEssDashboardSlice({
      auth,
      companyId: '00000000-0000-4000-8000-000000000099',
      employeeId: 'e1',
      isManager: false,
      selectedDate: '2026-06-08',
      managerPendingCount: 0,
      offWorkCount: 0,
      myLeavesCount: 0,
    });

    expect(slice.roleSubtitle).toBe('Nhân viên');
    expect(slice.attendanceError).toBeTruthy();
    expect(slice.statCards.length).toBe(4);
  });

  it('never throws when fetch helpers reject synchronously', async () => {
    mocks.fetchEmployeeById.mockImplementation(() => {
      throw new Error('sync throw');
    });
    mocks.hrmRequest.mockImplementation(() => {
      throw new Error('sync throw');
    });

    const slice = await loadEssDashboardSlice({
      auth,
      companyId: 'cid',
      employeeId: 'e1',
      isManager: true,
      selectedDate: '2026-06-08',
      managerPendingCount: 1,
      offWorkCount: 0,
      myLeavesCount: 1,
    });

    expect(slice.roleSubtitle).toBe('Nhân viên');
    expect(slice.attendanceError).toBeTruthy();
    expect(slice.statCards.length).toBe(4);
  });
});
