import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/hrmPortalMode', () => ({
  getHrmPortalMode: vi.fn(),
}));

vi.mock('@/lib/portalAuthBridge', () => ({
  hasPortalSession: vi.fn(),
}));

vi.mock('@/lib/hrmSpreadsheetScope', () => ({
  getPortalJwtCompanyId: vi.fn(),
}));

import { getHrmPortalMode } from '@/lib/hrmPortalMode';
import { hasPortalSession } from '@/lib/portalAuthBridge';
import { getPortalJwtCompanyId } from '@/lib/hrmSpreadsheetScope';
import { buildHrmEmbedQueryString, hrmPathWithEmbedSearch } from './hrmEmbedNavigation';

describe('hrmEmbedNavigation', () => {
  afterEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
  });

  it('builds portal embed query from URL search', () => {
    vi.mocked(getHrmPortalMode).mockReturnValue(true);
    vi.mocked(hasPortalSession).mockReturnValue(false);
    vi.mocked(getPortalJwtCompanyId).mockReturnValue(null);

    const qs = buildHrmEmbedQueryString('?portal=1&companyId=main&tenantId=xevn');
    expect(qs).toBe('?portal=1&tenantId=xevn&companyId=main');
  });

  it('falls back to stored company when query params are stripped', () => {
    vi.mocked(getHrmPortalMode).mockReturnValue(true);
    vi.mocked(hasPortalSession).mockReturnValue(false);
    vi.mocked(getPortalJwtCompanyId).mockReturnValue(null);
    sessionStorage.setItem('hrm_current_company_id', 'main');
    sessionStorage.setItem('hrm_current_tenant_id', 'xevn');

    const qs = buildHrmEmbedQueryString('');
    expect(qs).toContain('portal=1');
    expect(qs).toContain('companyId=main');
    expect(qs).toContain('tenantId=xevn');
  });

  it('appends embed query to employee profile path', () => {
    vi.mocked(getHrmPortalMode).mockReturnValue(true);
    vi.mocked(hasPortalSession).mockReturnValue(false);
    vi.mocked(getPortalJwtCompanyId).mockReturnValue(null);

    const path = hrmPathWithEmbedSearch(
      '/employees/00000000-0000-4000-8000-000000000021',
      '?portal=1&companyId=main',
    );
    expect(path).toBe(
      '/employees/00000000-0000-4000-8000-000000000021?portal=1&companyId=main',
    );
  });

  it('returns path unchanged outside embed mode', () => {
    vi.mocked(getHrmPortalMode).mockReturnValue(false);
    vi.mocked(hasPortalSession).mockReturnValue(false);

    expect(hrmPathWithEmbedSearch('/employees/e1', '')).toBe('/employees/e1');
  });
});
