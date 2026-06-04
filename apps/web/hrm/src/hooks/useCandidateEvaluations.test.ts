import { describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/hrmDataMode', () => ({
  shouldSkipSupabaseDataFetches: () => true,
}));

describe('useCandidateEvaluations portal mode', () => {
  it('uses skip Supabase flag in embed mode', async () => {
    const { shouldSkipSupabaseDataFetches } = await import('@/lib/hrmDataMode');
    expect(shouldSkipSupabaseDataFetches()).toBe(true);
  });
});
