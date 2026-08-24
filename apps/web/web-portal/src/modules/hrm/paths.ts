import { resolveHrmOperationalCompanyId } from '../../integrations/commandCenterScope';

/** Base path cho router HRM lồng trong Command Center */
export const HRM_PORTAL_BASE = '/command-center/hrm';

/** Optional legacy query param to bust stale HRM embed bundles (not used on tab nav — P1-HRM-PERF-FE-01). */
export const HRM_EMBED_CACHE_BUST_PARAM = '_v';

export type HrmEmbedPathOptions = {
  portal?: boolean;
  companyId?: string | null;
  tenantId?: string | null;
  cacheBust?: number | string | null;
};

function appendEmbedQueryParams(params: URLSearchParams, opts?: HrmEmbedPathOptions): void {
  if (opts?.portal) params.set('portal', '1');
  if (opts?.tenantId) params.set('tenantId', opts.tenantId);
  const embedCompany = embedCompanyQueryParam(opts?.tenantId, opts?.companyId);
  if (embedCompany) params.set('companyId', embedCompany);
  if (opts?.cacheBust != null && String(opts.cacheBust).length > 0) {
    params.set(HRM_EMBED_CACHE_BUST_PARAM, String(opts.cacheBust));
  }
}

const HRM_PORTAL_DEFAULT = 'dashboard';

function embedCompanyQueryParam(
  tenantId?: string | null,
  companyId?: string | null,
): string | undefined {
  if (!companyId || companyId === 'all') return undefined;
  return resolveHrmOperationalCompanyId(tenantId, companyId);
}

export function hrmPortalPath(view: string, tenantId?: string | null): string {
  const trimmed = view.replace(/^\/+/, '').replace(/\/+$/, '');
  const prefix = tenantId ? `/${tenantId}` : '';
  if (!trimmed || trimmed === 'dashboard') return `${prefix}${HRM_PORTAL_BASE}/dashboard`;
  return `${prefix}${HRM_PORTAL_BASE}/${trimmed}`;
}

const PORTAL_ROOT_SEGMENTS = new Set([
  'command-center',
  'cockpit',
  'catalog-governance',
  'dashboard',
]);

/** Query param carrying active tenant on canonical (non-prefixed) portal URLs. */
export const TENANT_QUERY_PARAM = 'tenantId';

export function extractTenantIdFromSearch(search: string): string | null {
  const value = new URLSearchParams(search).get(TENANT_QUERY_PARAM)?.trim();
  return value || null;
}

/** Append or replace `?tenantId=` on an absolute portal path (pathname + optional search + hash). */
export function withTenantQueryParam(
  pathWithOptionalSearch: string,
  tenantId: string | null | undefined,
): string {
  const tid = tenantId?.trim();
  if (!tid || tid === '__loading__') return pathWithOptionalSearch;

  const hashIdx = pathWithOptionalSearch.indexOf('#');
  const hash = hashIdx >= 0 ? pathWithOptionalSearch.slice(hashIdx) : '';
  const beforeHash = hashIdx >= 0 ? pathWithOptionalSearch.slice(0, hashIdx) : pathWithOptionalSearch;
  const qIdx = beforeHash.indexOf('?');
  const pathname = qIdx >= 0 ? beforeHash.slice(0, qIdx) : beforeHash;
  const params = new URLSearchParams(qIdx >= 0 ? beforeHash.slice(qIdx + 1) : '');
  params.set(TENANT_QUERY_PARAM, tid);
  const qs = params.toString();
  return `${pathname}?${qs}${hash}`;
}

/** Strip `/:tenantId` when pathname is `/{tenant}/(command-center|cockpit|...)/...` */
export function stripTenantPrefixFromPathname(pathname: string): string {
  const normalized = pathname.replace(/\/+$/, '') || '/';
  const parts = normalized.split('/');
  if (parts.length >= 3 && parts[1] && parts[2] && PORTAL_ROOT_SEGMENTS.has(parts[2])) {
    return '/' + parts.slice(2).join('/');
  }
  return normalized;
}

/** Keep tenant in `?tenantId=` — hide `/:tenantId` path prefix in the address bar. */
export function tenantScopedPortalPath(
  tenantId: string | null | undefined,
  absolutePath: string,
): string {
  const path = absolutePath.startsWith('/') ? absolutePath : `/${absolutePath}`;
  return withTenantQueryParam(path, tenantId);
}

export function tenantHrmPortalPath(
  tenantId: string | null | undefined,
  view: string,
): string {
  return tenantScopedPortalPath(tenantId, hrmPortalPath(view));
}

/** Lấy suffix sau `/command-center/hrm/` (vd. `contracts`, `employees/uuid`). */
export function hrmPortalSuffixFromPathname(pathname: string): string {
  const strippedPathname = stripTenantPrefixFromPathname(pathname);
  
  if (strippedPathname === HRM_PORTAL_BASE) return HRM_PORTAL_DEFAULT;
  if (!strippedPathname.startsWith(`${HRM_PORTAL_BASE}/`)) return HRM_PORTAL_DEFAULT;
  const suffix = strippedPathname.slice(`${HRM_PORTAL_BASE}/`.length);
  return suffix || HRM_PORTAL_DEFAULT;
}

/** Registry view key → HRM app route segment (hyphenated where required). */
export const HRM_VIEW_PATH_MAP: Record<string, string> = {
  dashboard: '/',
  employees: '/employees',
  company: '/company',
  recruitment: '/recruitment',
  attendance: '/attendance',
  payroll: '/payroll',
  performance: '/performance',
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
  fleet: '/fleet',
  internal_news: '/internal-news',
  guide: '/guide',
};

/** Chuyển suffix portal → path app HRM (không gồm basename /hr). */
export function hrmAppRelPathFromPortalSuffix(suffix: string): string {
  const trimmed = suffix.replace(/^\/+/, '').replace(/\/+$/, '');
  if (!trimmed || trimmed === 'dashboard') return '/';
  const [primary, ...rest] = trimmed.split('/');
  const mapped = HRM_VIEW_PATH_MAP[primary] ?? `/${primary}`;
  if (mapped === '/') return '/';
  const tail = rest.length ? `/${rest.join('/')}` : '';
  return `${mapped}${tail}`;
}

/** Segment đầu của suffix — dùng highlight menu sidebar. */
export function hrmPortalPrimaryView(suffix: string): string {
  const first = suffix.replace(/^\/+/, '').split('/')[0];
  return first || HRM_PORTAL_DEFAULT;
}

/** iframe src từ suffix portal (hỗ trợ deep link employees/:id). */
export function hrmProxyPathFromSuffix(
  portalSuffix: string,
  opts?: HrmEmbedPathOptions,
): string {
  const rel = hrmAppRelPathFromPortalSuffix(portalSuffix);
  // HRM Vite `base` is `/hr/` — `/hr?portal=1` 404s; dashboard must be `/hr/?…`.
  const baseHref = rel === '/' ? `${HRM_PROXY_BASE}/` : `${HRM_PROXY_BASE}${rel}`;

  const params = new URLSearchParams();
  appendEmbedQueryParams(params, opts);

  const qs = params.toString();
  return qs ? `${baseHref}?${qs}` : baseHref;
}

/** Base path khi nhúng HRM qua proxy web-portal — phải trùng `base` của apps/web/hrm (`/hr/`) */
export const HRM_PROXY_BASE = '/hr';

export function hrmProxyPath(
  view: string,
  opts?: HrmEmbedPathOptions,
): string {
  const suffix = HRM_VIEW_PATH_MAP[view] ?? '/';
  const baseHref = suffix === '/' ? `${HRM_PROXY_BASE}/` : `${HRM_PROXY_BASE}${suffix}`;

  const params = new URLSearchParams();
  appendEmbedQueryParams(params, opts);

  const qs = params.toString();
  return qs ? `${baseHref}${baseHref.includes('?') ? '&' : '?'}${qs}` : baseHref;
}

/** Base path của app HRM gốc */
export const HRM_APP_BASE = '/hr';

export function hrmAppPath(
  view: string,
  opts?: { portal?: boolean; companyId?: string | null; tenantId?: string | null }
): string {
  const suffix = HRM_VIEW_PATH_MAP[view] ?? '/';

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
