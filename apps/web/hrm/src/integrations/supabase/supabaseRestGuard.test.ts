import { describe, expect, it, vi, afterEach } from 'vitest';
import {
  SUPABASE_REST_BLOCKED_CODE,
  createBlockedPostgrestBuilder,
  shouldBlockSupabaseRest,
} from './supabaseRestGuard';

describe('createBlockedPostgrestBuilder', () => {
  it('fails closed with PostgREST error (no silent empty list)', async () => {
    const supabase = {
      from: () => createBlockedPostgrestBuilder(),
    };
    const result = await supabase
      .from('departments')
      .select('*')
      .eq('company_id', 'main')
      .order('sort_order', { ascending: true });
    expect(result.data).toBeNull();
    expect(result.error?.code).toBe(SUPABASE_REST_BLOCKED_CODE);
    expect(result.error?.message).toMatch(/disabled in HRM API mode/i);
  });
});

describe('shouldBlockSupabaseRest', () => {
  const originalLocation = window.location;

  afterEach(() => {
    vi.unstubAllEnvs();
    Object.defineProperty(window, 'location', { value: originalLocation, writable: true });
    window.history.replaceState({}, '', '/');
  });

  it('blocks on attendance path when API mode default', async () => {
    vi.stubEnv('VITE_HRM_USE_API', 'true');
    Object.defineProperty(window, 'location', {
      value: new URL('http://127.0.0.1:5173/hr/attendance?portal=1&companyId=main'),
      writable: true,
    });
    expect(shouldBlockSupabaseRest()).toBe(true);
  });

  it('allows legacy path only when VITE_HRM_USE_API=false', async () => {
    vi.stubEnv('VITE_HRM_USE_API', 'false');
    vi.stubEnv('VITE_SUPABASE_URL', 'https://project.supabase.co');
    Object.defineProperty(window, 'location', {
      value: new URL('http://127.0.0.1:8080/employees'),
      writable: true,
    });
    expect(shouldBlockSupabaseRest()).toBe(false);
  });
});
