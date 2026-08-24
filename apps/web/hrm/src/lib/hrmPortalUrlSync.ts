import { applyIframeWorkspaceParamsToParent } from '@/lib/contractWorkspaceDeepLink';
import { getHrmPortalMode } from '@/lib/hrmPortalMode';

export const PORTAL_HRM_BASE = '/command-center/hrm';

/** Map pathname HRM app (basename /hr) → URL portal parent. */
export function hrmAppPathnameToPortalPath(pathname: string, basename = '/hr', tenantId?: string | null): string {
  const rel = hrmRelativePathname(pathname, basename);
  const prefix = tenantId ? `/${tenantId}` : '';
  if (rel === '/' || rel === '/dashboard') return `${prefix}${PORTAL_HRM_BASE}/dashboard`;
  return `${prefix}${PORTAL_HRM_BASE}${rel}`;
}

/**
 * Khi HRM chạy trong iframe portal: đồng bộ URL parent để F5 giữ đúng màn (kể cả /employees/:id).
 * Popup/dialog không đổi route — không gọi hàm này từ dialog.
 */
/** After catalog mutate — parent F5 can restore row via `?tab=` + `?focus=` on CC URL. */
export function syncSettingsCatalogFocusToPortalParent(
  catalogTabId: string,
  focusSlug: string,
  basename = '/hr',
): void {
  if (typeof window === 'undefined') return;
  if (window.parent === window) return;
  if (!getHrmPortalMode(window.location.search)) return;
  const slug = focusSlug.trim().toLowerCase();
  const tab = catalogTabId.trim().toLowerCase();
  if (!slug || !tab) return;

  try {
    const parent = window.parent;
    const iframeParams = new URLSearchParams(window.location.search);
    const tenantId = iframeParams.get('tenantId');
    const portalPath = hrmAppPathnameToPortalPath('/settings', basename, tenantId);
    const params = new URLSearchParams(parent.location.search);
    params.set('tab', tab);
    params.set('focus', slug);
    params.delete('portal');
    params.delete('tenantId');
    params.delete('companyId');
    const qs = params.toString();
    const target = `${portalPath}?${qs}`;
    if (`${parent.location.pathname}${parent.location.search}` !== target) {
      parent.history.replaceState(null, '', target);
    }
  } catch {
    // cross-origin parent
  }
}

function hrmRelativePathname(pathname: string, basename = '/hr'): string {
  let rel = pathname;
  if (basename && rel.startsWith(basename)) {
    rel = rel.slice(basename.length) || '/';
  }
  if (!rel.startsWith('/')) rel = `/${rel}`;
  return rel;
}

export function syncHrmLocationToPortalParent(
  pathname: string,
  basename = '/hr',
  iframeSearch?: string,
): void {
  if (typeof window === 'undefined') return;
  if (window.parent === window) return;
  if (!getHrmPortalMode(window.location.search)) return;

  try {
    const parent = window.parent;
    const iframeParams = new URLSearchParams(window.location.search);
    const tenantId = iframeParams.get('tenantId');
    const portalPath = hrmAppPathnameToPortalPath(pathname, basename, tenantId);
    const preserveSearch = new URLSearchParams(parent.location.search);
    // Không copy query portal/tenant từ iframe — parent giữ search hiện tại (settings, module, …)
    preserveSearch.delete('portal');
    preserveSearch.delete('tenantId');
    preserveSearch.delete('companyId');

    const rel = hrmRelativePathname(pathname, basename);
    const onContractsRoute = rel === '/contracts' || rel.startsWith('/contracts/');
    if (iframeSearch !== undefined) {
      applyIframeWorkspaceParamsToParent(preserveSearch, iframeSearch, onContractsRoute);
    }

    const qs = preserveSearch.toString();
    const target = qs ? `${portalPath}?${qs}` : portalPath;

    if (`${parent.location.pathname}${parent.location.search}` !== target) {
      parent.history.replaceState(null, '', target);
    }
  } catch {
    // cross-origin parent
  }
}
