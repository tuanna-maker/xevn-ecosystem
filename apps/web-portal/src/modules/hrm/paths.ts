/** Base path cho router HRM lồng trong Command Center */
export const HRM_PORTAL_BASE = '/command-center/hrm';

export function hrmPortalPath(view: string): string {
  return `${HRM_PORTAL_BASE}/${view}`;
}

/** Base path khi nhúng HRM qua proxy web-portal — phải trùng `base` của apps/hrm (`/hr/`) */
export const HRM_PROXY_BASE = '/hr';

export function hrmProxyPath(
  view: string,
  opts?: { portal?: boolean; companyId?: string | null }
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
  const baseHref = `${HRM_PROXY_BASE}${suffix}`;

  const params = new URLSearchParams();
  if (opts?.portal) params.set('portal', '1');
  if (opts?.companyId && opts.companyId !== 'all') params.set('companyId', opts.companyId);

  const qs = params.toString();
  return qs ? `${baseHref}${baseHref.includes('?') ? '&' : '?'}${qs}` : baseHref;
}

/** Base path của app HRM gốc */
export const HRM_APP_BASE = '/hr';

export function hrmAppPath(
  view: string,
  opts?: { portal?: boolean; companyId?: string | null }
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

  // Micro-FE handoff: HRM chạy độc lập ở port khác trong dev (`apps/hrm/vite.config.ts`).
  // Prod có thể được reverse-proxy về cùng domain -> fallback tương đối.
  const hrmOrigin =
    import.meta.env.VITE_HRM_ORIGIN ?? (import.meta.env.DEV ? 'http://localhost:8080' : '');

  const baseHref = hrmOrigin ? `${hrmOrigin}${HRM_APP_BASE}${suffix}` : `${HRM_APP_BASE}${suffix}`;

  const params = new URLSearchParams();
  if (opts?.portal) params.set('portal', '1');
  if (opts?.companyId && opts.companyId !== 'all') params.set('companyId', opts.companyId);

  const qs = params.toString();
  return qs ? `${baseHref}${baseHref.includes('?') ? '&' : '?'}${qs}` : baseHref;
}
