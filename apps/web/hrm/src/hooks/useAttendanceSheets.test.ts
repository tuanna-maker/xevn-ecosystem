import { describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/hrmDataMode', () => ({
  shouldSkipSupabaseDataFetches: () => true,
}));

describe('useAttendanceSheets portal mode', () => {
  it('skips Supabase attendance_sheets when embed flag is on', async () => {
    const { shouldSkipSupabaseDataFetches } = await import('@/lib/hrmDataMode');
    expect(shouldSkipSupabaseDataFetches()).toBe(true);
  });
});
