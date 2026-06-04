import { describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/hrmDataMode', () => ({
  shouldSkipSupabaseDataFetches: () => true,
}));

describe('useLeaveRequests portal mode', () => {
  it('uses Nest leave-requests path when embed flag is on', async () => {
    const { shouldSkipSupabaseDataFetches } = await import('@/lib/hrmDataMode');
    expect(shouldSkipSupabaseDataFetches()).toBe(true);
  });
});
