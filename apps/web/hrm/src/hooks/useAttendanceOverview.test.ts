import { describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/hrmDataMode', () => ({
  shouldSkipSupabaseDataFetches: () => true,
  HRM_API_MAX_PAGE_SIZE: 100,
}));

describe('useAttendanceOverview portal mode', () => {
  it('prefers Nest attendance/leave APIs when Supabase is skipped', async () => {
    const { shouldSkipSupabaseDataFetches, HRM_API_MAX_PAGE_SIZE } = await import('@/lib/hrmDataMode');
    expect(shouldSkipSupabaseDataFetches()).toBe(true);
    expect(HRM_API_MAX_PAGE_SIZE).toBe(100);
  });
});
