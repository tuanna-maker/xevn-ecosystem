import { getHrmPortalMode } from '@/lib/hrmPortalMode';

export const PORTAL_HRM_BASE = '/command-center/hrm';

/** Map pathname HRM app (basename /hr) → URL portal parent. */
export function hrmAppPathnameToPortalPath(pathname: string, basename = '/hr'): string {
  let rel = pathname;
  if (basename && rel.startsWith(basename)) {
    rel = rel.slice(basename.length) || '/';
  }
  if (!rel.startsWith('/')) rel = `/${rel}`;
  if (rel === '/' || rel === '/dashboard') return `${PORTAL_HRM_BASE}/dashboard`;
  return `${PORTAL_HRM_BASE}${rel}`;
}

/**
 * Khi HRM chạy trong iframe portal: đồng bộ URL parent để F5 giữ đúng màn (kể cả /employees/:id).
 * Popup/dialog không đổi route — không gọi hàm này từ dialog.
 */
export function syncHrmLocationToPortalParent(pathname: string, basename = '/hr'): void {
  if (typeof window === 'undefined') return;
  if (window.parent === window) return;
  if (!getHrmPortalMode(window.location.search)) return;

  try {
    const parent = window.parent;
    const portalPath = hrmAppPathnameToPortalPath(pathname, basename);
    const preserveSearch = new URLSearchParams(parent.location.search);
    // Không copy query portal/tenant từ iframe — parent giữ search hiện tại (settings, module, …)
    preserveSearch.delete('portal');
    preserveSearch.delete('tenantId');
    preserveSearch.delete('companyId');
    const qs = preserveSearch.toString();
    const target = qs ? `${portalPath}?${qs}` : portalPath;

    if (`${parent.location.pathname}${parent.location.search}` !== target) {
      parent.history.replaceState(null, '', target);
    }
  } catch {
    // cross-origin parent
  }
}
