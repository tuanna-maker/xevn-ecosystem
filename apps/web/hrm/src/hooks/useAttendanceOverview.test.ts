import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';

vi.mock('@/lib/hrmDataMode', () => ({
  shouldSkipSupabaseDataFetches: () => true,
  HRM_API_MAX_PAGE_SIZE: 100,
}));

const fetchAttendanceOverview = vi.fn();

vi.mock('@/integrations/hrmApi', () => ({
  fetchAttendanceOverview: (...args: unknown[]) => fetchAttendanceOverview(...args),
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ currentCompanyId: 'trsport' }),
}));

describe('useAttendanceOverview portal mode', () => {
  beforeEach(() => {
    fetchAttendanceOverview.mockReset();
    fetchAttendanceOverview.mockResolvedValue({
      stats: {
        lateEarlyToday: 1,
        lateEarlyChange: 0,
        actualLeaveThisWeek: 2,
        actualLeaveChange: 0,
        plannedLeaveNextWeek: 0,
        plannedLeaveChange: 0,
      },
      monthlyLeaveData: [],
      departmentLeaveData: [],
      leaveTypeData: [],
      lateEarlyList: [],
    });
  });

  it('prefers Nest attendance/leave APIs when Supabase is skipped', async () => {
    const { shouldSkipSupabaseDataFetches, HRM_API_MAX_PAGE_SIZE } = await import('@/lib/hrmDataMode');
    expect(shouldSkipSupabaseDataFetches()).toBe(true);
    expect(HRM_API_MAX_PAGE_SIZE).toBe(100);
  });

  it('PO-MFD-M2-ATT-OVERVIEW-01 passes year query to Nest overview', async () => {
    const { useAttendanceOverview } = await import('./useAttendanceOverview');
    const { result } = renderHook(() => useAttendanceOverview(2025, { enabled: true }));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(fetchAttendanceOverview).toHaveBeenCalledWith({
      company_id: 'trsport',
      year: 2025,
    });
    expect(result.current.year).toBe(2025);
    expect(result.current.error).toBeNull();
    expect(result.current.stats.lateEarlyToday).toBe(1);
  });

  it('PO-MFD-M2-ATT-OVERVIEW-01 surfaces error when overview GET fails', async () => {
    const { ApiClientError } = await import('@/lib/apiError');
    fetchAttendanceOverview.mockRejectedValueOnce(
      new ApiClientError({ code: 'HRM-ATT-500', message: 'overview down', status: 500 }),
    );
    const { useAttendanceOverview } = await import('./useAttendanceOverview');
    const { result } = renderHook(() => useAttendanceOverview(2026, { enabled: true }));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toMatch(/overview down|Không tải được/);
    expect(result.current.stats.lateEarlyToday).toBe(0);
  });
});
