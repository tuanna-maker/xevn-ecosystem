import { resolveHrmOperationalCompanyId } from '../../integrations/commandCenterScope';

/** Base path cho router HRM lồng trong Command Center */
export const HRM_PORTAL_BASE = '/command-center/hrm';

function embedCompanyQueryParam(
  tenantId?: string | null,
  companyId?: string | null,
): string | undefined {
  if (!companyId || companyId === 'all') return undefined;
  return resolveHrmOperationalCompanyId(tenantId, companyId);
}

const HRM_PORTAL_DEFAULT = 'dashboard';

export function hrmPortalPath(view: string): string {
  const trimmed = view.replace(/^\/+/, '').replace(/\/+$/, '');
  if (!trimmed || trimmed === 'dashboard') return `${HRM_PORTAL_BASE}/dashboard`;
  return `${HRM_PORTAL_BASE}/${trimmed}`;
}

/** Lấy suffix sau `/command-center/hrm/` (vd. `contracts`, `employees/uuid`). */
export function hrmPortalSuffixFromPathname(pathname: string): string {
  const normalized = pathname.replace(/\/+$/, '');
  if (normalized === HRM_PORTAL_BASE) return HRM_PORTAL_DEFAULT;
  if (!normalized.startsWith(`${HRM_PORTAL_BASE}/`)) return HRM_PORTAL_DEFAULT;
  const suffix = normalized.slice(`${HRM_PORTAL_BASE}/`.length);
  return suffix || HRM_PORTAL_DEFAULT;
}

/** Chuyển suffix portal → path app HRM (không gồm basename /hr). */
export function hrmAppRelPathFromPortalSuffix(suffix: string): string {
  const trimmed = suffix.replace(/^\/+/, '').replace(/\/+$/, '');
  if (!trimmed || trimmed === 'dashboard') return '/';
  return `/${trimmed}`;
}

/** Segment đầu của suffix — dùng highlight menu sidebar. */
export function hrmPortalPrimaryView(suffix: string): string {
  const first = suffix.replace(/^\/+/, '').split('/')[0];
  return first || HRM_PORTAL_DEFAULT;
}

/** iframe src từ suffix portal (hỗ trợ deep link employees/:id). */
export function hrmProxyPathFromSuffix(
  portalSuffix: string,
  opts?: { portal?: boolean; companyId?: string | null; tenantId?: string | null },
): string {
  const rel = hrmAppRelPathFromPortalSuffix(portalSuffix);
  // HRM Vite `base` is `/hr/` — `/hr?portal=1` 404s; dashboard must be `/hr/?…`.
  const baseHref = rel === '/' ? `${HRM_PROXY_BASE}/` : `${HRM_PROXY_BASE}${rel}`;

  const params = new URLSearchParams();
  if (opts?.portal) params.set('portal', '1');
  if (opts?.tenantId) params.set('tenantId', opts.tenantId);
  const embedCompany = embedCompanyQueryParam(opts?.tenantId, opts?.companyId);
  if (embedCompany) params.set('companyId', embedCompany);

  const qs = params.toString();
  return qs ? `${baseHref}?${qs}` : baseHref;
}

/** Base path khi nhúng HRM qua proxy web-portal — phải trùng `base` của apps/web/hrm (`/hr/`) */
export const HRM_PROXY_BASE = '/hr';

export function hrmProxyPath(
  view: string,
  opts?: { portal?: boolean; companyId?: string | null; tenantId?: string | null }
): string {
  // view key từ registry (vd: "attendance", "tools_equipment"...)
  const map: Record<string, string> = {
    dashboard: '/', // HRM dashboard nằm ở "/"
    employees: '/employees',
    company: '/company',
    recruitment: '/recruitment',
    attendance: '/attendance',
    payroll: '/payroll',
    contracts: '/contracts',
    insurance: '/insurance',
    decisions: '/decisions',
    reports: '/reports',
    settings: '/settings',
    hrm_ai: '/ai',
    tasks: '/tasks',
    processes: '/processes',
    internal_services: '/internal-services',
    tools_equipment: '/tools-equipment',
    guide: '/guide',
  };

  const suffix = map[view] ?? '/';
  const baseHref = suffix === '/' ? `${HRM_PROXY_BASE}/` : `${HRM_PROXY_BASE}${suffix}`;

  const params = new URLSearchParams();
  if (opts?.portal) params.set('portal', '1');
  if (opts?.tenantId) params.set('tenantId', opts.tenantId);
  const embedCompany = embedCompanyQueryParam(opts?.tenantId, opts?.companyId);
  if (embedCompany) params.set('companyId', embedCompany);

  const qs = params.toString();
  return qs ? `${baseHref}${baseHref.includes('?') ? '&' : '?'}${qs}` : baseHref;
}

/** Base path của app HRM gốc */
export const HRM_APP_BASE = '/hr';

export function hrmAppPath(
  view: string,
  opts?: { portal?: boolean; companyId?: string | null; tenantId?: string | null }
): string {
  // view key từ registry (vd: "attendance", "tools_equipment"...)
  const map: Record<string, string> = {
    dashboard: '/', // HRM dashboard nằm ở "/"
    employees: '/employees',
    company: '/company',
    recruitment: '/recruitment',
    attendance: '/attendance',
    payroll: '/payroll',
    contracts: '/contracts',
    insurance: '/insurance',
    decisions: '/decisions',
    reports: '/reports',
    settings: '/settings',
    hrm_ai: '/ai',
    tasks: '/tasks',
    processes: '/processes',
    internal_services: '/internal-services',
    tools_equipment: '/tools-equipment',
    guide: '/guide',
  };

  const suffix = map[view] ?? '/';

  // Prefer same-origin `/hr/...` (portal Vite proxy) so localStorage + postMessage JWT bridge works.
  // Only use VITE_HRM_ORIGIN when explicitly set (e.g. isolated HRM dev without proxy).
  const hrmOrigin = import.meta.env.VITE_HRM_ORIGIN?.trim().replace(/\/+$/, '') ?? '';
  const baseHref = hrmOrigin ? `${hrmOrigin}${HRM_APP_BASE}${suffix}` : `${HRM_APP_BASE}${suffix}`;

  const params = new URLSearchParams();
  if (opts?.portal) params.set('portal', '1');
  if (opts?.tenantId) params.set('tenantId', opts.tenantId);
  const embedCompany = embedCompanyQueryParam(opts?.tenantId, opts?.companyId);
  if (embedCompany) params.set('companyId', embedCompany);

  const qs = params.toString();
  return qs ? `${baseHref}${baseHref.includes('?') ? '&' : '?'}${qs}` : baseHref;
}
