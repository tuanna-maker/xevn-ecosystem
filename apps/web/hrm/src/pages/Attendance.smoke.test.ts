/**
 * Smoke: Attendance page module loads and default export is a function (pilot blank-root guard).
 */
import { describe, expect, it, beforeEach, vi } from 'vitest';

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'u1' },
    currentCompanyId: 'main',
    memberships: [],
    loading: false,
  }),
}));

describe('Attendance page smoke', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', '/hr/attendance?portal=1&companyId=main');
    localStorage.setItem('hrm_portal_mode', '1');
    localStorage.setItem('hrm_current_company_id', 'main');
  });

  it(
    'dynamic import resolves a React component',
    async () => {
      const mod = await import('./Attendance');
      expect(mod.default).toBeTypeOf('function');
    },
    120_000,
  );
});
