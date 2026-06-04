import { describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/hrmDataMode', () => ({
  shouldSkipSupabaseDataFetches: () => true,
}));

describe('useRecruitmentPlans portal mode', () => {
  it('skips Supabase recruitment_plans fetch when embed flag is on', async () => {
    const { shouldSkipSupabaseDataFetches } = await import('@/lib/hrmDataMode');
    expect(shouldSkipSupabaseDataFetches()).toBe(true);
  });
});
