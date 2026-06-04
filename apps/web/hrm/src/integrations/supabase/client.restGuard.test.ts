import { describe, expect, it, vi, afterEach } from 'vitest';

describe('supabase client stub (P1-SUPA-FE-02)', () => {
  afterEach(() => {
    vi.resetModules();
  });

  it('throws on any supabase access', async () => {
    const { supabase } = await import('./client');
    expect(() => supabase.from('employees')).toThrow(/HRM_SUPABASE_BLOCKED/);
  });
});
