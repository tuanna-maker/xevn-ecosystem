/**
 * Smoke: Employees page module loads without ReferenceError (companyFilter → selectedSlug).
 */
import { describe, expect, it, beforeEach, vi } from 'vitest';

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'u1' },
    currentCompanyId: 'main',
    memberships: [{ company_id: 'main', company: { name: 'XeVN Holding' } }],
    loading: false,
  }),
}));

vi.mock('@/contexts/HrmOperatingUnitFilterContext', () => ({
  useHrmOperatingUnitFilter: () => ({
    selectedSlug: 'all',
    operatingUnitLabelMap: new Map(),
  }),
}));

describe('Employees page smoke', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', '/hr/employees?portal=1&companyId=main');
    localStorage.setItem('hrm_portal_mode', '1');
    localStorage.setItem('hrm_current_company_id', 'main');
  });

  it(
    'dynamic import resolves a React component',
    async () => {
      const mod = await import('./Employees');
      expect(mod.default).toBeTypeOf('function');
    },
    120_000,
  );
});
