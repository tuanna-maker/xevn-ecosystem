import { coerceHrmListCompanyId, HRM_LIST_DEFAULT_COMPANY_ID } from '@/lib/hrmListScope';
import { getHrmPortalMode } from '@/lib/hrmPortalMode';
import { getPortalJwtCompanyId } from '@/lib/hrmSpreadsheetScope';
import { hasPortalSession } from '@/lib/portalAuthBridge';

function readStoredCompanyId(): string | null {
  if (typeof localStorage === 'undefined' && typeof sessionStorage === 'undefined') return null;
  return (
    (typeof localStorage !== 'undefined' ? localStorage.getItem('hrm_current_company_id') : null) ||
    (typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('hrm_current_company_id') : null)
  );
}

function readStoredTenantId(): string | null {
  if (typeof localStorage === 'undefined' && typeof sessionStorage === 'undefined') return null;
  return (
    (typeof localStorage !== 'undefined' ? localStorage.getItem('hrm_current_tenant_id') : null) ||
    (typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('hrm_current_tenant_id') : null)
  );
}

/** Portal/embed query string (`?portal=1&companyId=main`, …) for in-app navigation. */
export function buildHrmEmbedQueryString(search = typeof window !== 'undefined' ? window.location.search : ''): string {
  if (!getHrmPortalMode(search) && !hasPortalSession()) return '';

  const urlParams = new URLSearchParams(search);
  const params = new URLSearchParams();
  params.set('portal', '1');

  const tenantId = urlParams.get('tenantId')?.trim() || readStoredTenantId();
  const companyId = coerceHrmListCompanyId(
    urlParams.get('companyId')?.trim() ||
      readStoredCompanyId() ||
      getPortalJwtCompanyId() ||
      HRM_LIST_DEFAULT_COMPANY_ID,
  );

  if (tenantId) params.set('tenantId', tenantId);
  params.set('companyId', companyId);

  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

/** Append embed scope query to an HRM app path (e.g. `/employees/:id`). */
export function hrmPathWithEmbedSearch(path: string, search = typeof window !== 'undefined' ? window.location.search : ''): string {
  const embedQs = buildHrmEmbedQueryString(search);
  if (!embedQs) return path;
  if (path.includes('?')) {
    return `${path}&${embedQs.slice(1)}`;
  }
  return `${path}${embedQs}`;
}
