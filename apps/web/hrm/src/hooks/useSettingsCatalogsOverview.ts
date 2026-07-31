/**
 * @CODE-MEMORY
 * Screen:     Settings catalogs / Contracts form / Employee form (shared overview)
 * UC:         UF-HRM-10 · UC-HRM-SCOPE-03
 * BR:         BR-INT-05 — one GET /settings-catalogs per scope window
 * SRS:        docs/hrm/SRS.md §15 catalog publish/pull
 * TechSpec:   docs/qa/evidence/cd-fb-03-hrm-perf-audit-20260620.md P0#3
 * Purpose:    Unified React Query cache for GET /api/hrm/settings-catalogs so
 *             Settings, Contracts dialog, and EmployeeFormDialog share one
 *             in-flight/cached payload (~76 catalogs) instead of duplicate keys.
 * WorkItem:   P1-HRM-PERF-FE-03 / CD-FB-04-PERF-FIX
 * Coded:      2026-07-19
 *
 * Callers:
 *   - SettingsCatalogsTab → useSettingsCatalogsOverview()
 *   - Contracts.tsx → useSettingsCatalogsOverview({ enabled: dialogOpen })
 *   - EmployeeFormDialog → useSettingsCatalogsOverview({ enabled: open })
 *
 * Callees:
 *   - getSettingsCatalogsOverview → GET /api/hrm/settings-catalogs
 *   - resolveHrmSpreadsheetScope
 *
 * FE-Actions:
 *   | User action              | Handler     | Lib / API                      |
 *   |--------------------------|-------------|-------------------------------|
 *   | Open settings catalogs   | useQuery    | getSettingsCatalogsOverview   |
 *   | Open contract/employee dlg | useQuery  | same key → cache hit          |
 *   | Sync / upsert item       | invalidate  | SETTINGS_CATALOGS_QUERY_KEY   |
 *
 * BE-Chain: GET /api/hrm/settings-catalogs → catalog overview rows
 * Impact:   Split query keys caused 2× heavy payload on Contracts + Settings.
 * must_keep: F5 contract ACs; UF-HRM-10 mutate path; U65 no seed
 * SOLID:     Single RQ key owner; consumers only pass enabled/scope opts
 * LastVerified: apps/web/hrm/src/hooks/p1-hrm-perf-fe-03.test.ts
 */
import { useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import {
  getSettingsCatalogsOverview,
  type HrmSettingsCatalogOverviewRow,
  type HrmSpreadsheetScope,
} from '@/integrations/hrmApi';
import { resolveHrmSpreadsheetScope } from '@/lib/hrmSpreadsheetScope';

/** Stable RQ root — all FE settings-catalog overview consumers must use this. */
export const SETTINGS_CATALOGS_QUERY_KEY = 'hrm-settings-catalogs';

export function settingsCatalogsQueryKey(scope: HrmSpreadsheetScope | null | undefined) {
  return [SETTINGS_CATALOGS_QUERY_KEY, scope?.tenantId ?? null, scope?.companyId ?? null] as const;
}

export function useSettingsCatalogsOverview(opts?: {
  enabled?: boolean;
  /** Override auth-derived scope (rare). */
  scope?: HrmSpreadsheetScope | null;
}) {
  const { currentCompanyId } = useAuth();
  const queryClient = useQueryClient();

  const scope = useMemo(() => {
    if (opts?.scope !== undefined) return opts.scope;
    if (!currentCompanyId) return null;
    return resolveHrmSpreadsheetScope(currentCompanyId);
  }, [opts?.scope, currentCompanyId]);

  const enabled = opts?.enabled !== false && !!scope;

  const query = useQuery({
    queryKey: settingsCatalogsQueryKey(scope),
    queryFn: () => getSettingsCatalogsOverview(scope!),
    enabled,
    staleTime: 60_000,
  });

  const invalidateSettingsCatalogs = () =>
    queryClient.invalidateQueries({ queryKey: [SETTINGS_CATALOGS_QUERY_KEY] });

  return {
    ...query,
    scope,
    catalogs: (query.data?.catalogs ?? []) as HrmSettingsCatalogOverviewRow[],
    invalidateSettingsCatalogs,
  };
}
