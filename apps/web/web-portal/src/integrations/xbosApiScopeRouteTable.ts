/**
 * XBOS API scope route table — ADR-GROUP-CEO-MAIN-HOLDING-SCOPE §4 (EX-SA01-P1-04).
 * Only `kpi-rollup` and `group-legal-read` may use holding alias; strict modules require JWT `main`.
 */
export type XbosApiScopeMode = 'strict' | 'kpi-rollup' | 'group-legal-read';

export type XbosApiScopeRouteRow = {
  prefix: string;
  mode: XbosApiScopeMode;
  note: string;
};

/** Longest-prefix wins — keep more specific paths above broader prefixes. */
export const XBOS_API_SCOPE_ROUTE_TABLE: readonly XbosApiScopeRouteRow[] = [
  { prefix: '/kpi-engine/rollup', mode: 'kpi-rollup', note: 'UC-XBOS-CC-05 KPI rail' },
  { prefix: '/kpi-engine/portal-alerts', mode: 'kpi-rollup', note: 'CC alerts partition filter' },
  { prefix: '/kpi-engine/evaluate-batch', mode: 'strict', note: 'POST evaluate uses strict scope' },
  { prefix: '/workflow-engine', mode: 'strict', note: 'Definitions, instances, tasks' },
  { prefix: '/assets', mode: 'strict', note: 'Asset registry' },
  { prefix: '/asset-requests', mode: 'strict', note: 'UC asset request panel' },
  { prefix: '/position-rbac', mode: 'strict', note: 'Permission matrix' },
  { prefix: '/infrastructure', mode: 'strict', note: 'Foundation settings' },
  { prefix: '/raci-governance', mode: 'strict', note: 'x-company-id JWT main; path UUID partition' },
  { prefix: '/tenant-scope', mode: 'strict', note: 'Accessible tenants / member units' },
  { prefix: '/org-foundation', mode: 'group-legal-read', note: 'Legal entities, org tree' },
  { prefix: '/business-master', mode: 'group-legal-read', note: 'Dept templates, BM items' },
  { prefix: '/catalog-governance', mode: 'group-legal-read', note: 'Catalog inbox (read paths)' },
  { prefix: '/config-sync', mode: 'group-legal-read', note: 'HRM catalog pull' },
  { prefix: '/command-center', mode: 'group-legal-read', note: 'workspace-meta' },
  { prefix: '/platform-audit', mode: 'group-legal-read', note: 'Audit read' },
  { prefix: '/legal-entity-profile', mode: 'group-legal-read', note: 'Shareholders / legal docs' },
];

export function normalizeXbosApiPath(path: string): string {
  const raw = path.trim();
  const withoutOrigin = raw.replace(/^https?:\/\/[^/]+/i, '');
  const apiStripped = withoutOrigin.replace(/^\/api\/xbos/i, '');
  const withSlash = apiStripped.startsWith('/') ? apiStripped : `/${apiStripped}`;
  return withSlash.split('?')[0] ?? '/';
}

export function matchXbosApiScopeMode(apiPath: string): XbosApiScopeMode {
  const normalized = normalizeXbosApiPath(apiPath);
  for (const row of XBOS_API_SCOPE_ROUTE_TABLE) {
    if (normalized === row.prefix || normalized.startsWith(`${row.prefix}/`)) {
      return row.mode;
    }
  }
  return 'strict';
}

export function isXbosStrictApiPath(apiPath: string): boolean {
  return matchXbosApiScopeMode(apiPath) === 'strict';
}
