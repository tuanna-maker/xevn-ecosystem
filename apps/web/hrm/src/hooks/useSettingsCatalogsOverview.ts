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
 *   - resolveHrmSettingsCatalogScope (member OU partition; Group CEO → spreadsheet main)
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
 *
 * @CODE-MEMORY-CHANGE 2026-08-04 PO-UC-TC-W4-FE-AT12-L1-CREATE-CATALOG-01
 * change_mode: FIX
 * What: scope via resolveHrmSettingsCatalogScope (trsport JWT → x-company-id=trsport)
 * Why: spreadsheet main forced empty leave_types picker vs create assert OU partition
 * must_keep: shared SETTINGS_CATALOGS_QUERY_KEY; Group CEO main→holding; U65 no seed
 *
 * @CODE-MEMORY-CHANGE 2026-08-24 PO-HRM-CTR-CREATE-CATALOG-PARITY-01
 * change_mode: EXPAND
 * What: departmentPickerOptions = HRM GET /departments ∪ settings catalog (mergeDepartmentPickerOptions)
 * Why: Central picker parity with BE assertConDepartmentKey; PHONG_QLPT HRM-only visible on forms
 * Spec: docs/program/specs/PO-HRM-CTR-CREATE-CATALOG-PARITY-01.md
 * must_keep: COMPANY_DEPARTMENTS_QUERY_KEY; HRM row wins on duplicate code; catalog scope unchanged
 */
import { useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import {
  getSettingsCatalogsOverview,
  type HrmSettingsCatalogOverviewRow,
  type HrmSpreadsheetScope,
} from '@/integrations/hrmApi';
import { departmentOptionsFromCatalog } from '@/lib/catalogSearchPicker';
import {
  departmentPickerOptionsFromCompanyRows,
  loadCompanyDepartments,
  mergeDepartmentPickerOptions,
} from '@/lib/hrmDepartmentCatalog';
import { resolveHrmSettingsCatalogScope } from '@/lib/hrmSpreadsheetScope';

/** Stable RQ root — all FE settings-catalog overview consumers must use this. */
export const SETTINGS_CATALOGS_QUERY_KEY = 'hrm-settings-catalogs';

/** Shared RQ root — HRM `/departments` ∪ catalog (DepartmentManagement + form pickers). */
export const COMPANY_DEPARTMENTS_QUERY_KEY = 'company-departments';

export function companyDepartmentsQueryKey(companyId: string | null | undefined) {
  return [COMPANY_DEPARTMENTS_QUERY_KEY, companyId ?? null] as const;
}

export function settingsCatalogsQueryKey(scope: HrmSpreadsheetScope | null | undefined) {
  return [SETTINGS_CATALOGS_QUERY_KEY, scope?.tenantId ?? null, scope?.companyId ?? null] as const;
}

export function useSettingsCatalogsOverview(opts?: {
  enabled?: boolean;
  /** Override auth-derived scope (rare). */
  scope?: HrmSpreadsheetScope | null;
  /** Operating company for HRM `/departments` load (default: AuthContext currentCompanyId). */
  departmentCompanyId?: string | null;
}) {
  const { currentCompanyId } = useAuth();
  const queryClient = useQueryClient();

  const scope = useMemo(() => {
    if (opts?.scope !== undefined) return opts.scope;
    // Member JWT may resolve OU catalog partition even when AuthContext company is still unset.
    return resolveHrmSettingsCatalogScope(currentCompanyId);
  }, [opts?.scope, currentCompanyId]);

  const departmentCompanyId = opts?.departmentCompanyId ?? currentCompanyId;
  const enabled = opts?.enabled !== false && !!scope;

  const query = useQuery({
    queryKey: settingsCatalogsQueryKey(scope),
    queryFn: () => getSettingsCatalogsOverview(scope!),
    enabled,
    staleTime: 60_000,
  });

  const catalogs = (query.data?.catalogs ?? []) as HrmSettingsCatalogOverviewRow[];

  const departmentsQuery = useQuery({
    queryKey: companyDepartmentsQueryKey(departmentCompanyId),
    queryFn: async () => {
      if (!departmentCompanyId) {
        return { rows: [], fetchError: null as string | null };
      }
      return loadCompanyDepartments(departmentCompanyId);
    },
    enabled: enabled && !!departmentCompanyId,
    staleTime: 60_000,
  });

  const departmentPickerOptions = useMemo(
    () =>
      mergeDepartmentPickerOptions(
        departmentPickerOptionsFromCompanyRows(departmentsQuery.data?.rows ?? []),
        departmentOptionsFromCatalog(catalogs),
      ),
    [departmentsQuery.data?.rows, catalogs],
  );

  const invalidateSettingsCatalogs = () =>
    queryClient.invalidateQueries({ queryKey: [SETTINGS_CATALOGS_QUERY_KEY] });

  const invalidateCompanyDepartments = () =>
    queryClient.invalidateQueries({ queryKey: [COMPANY_DEPARTMENTS_QUERY_KEY] });

  return {
    ...query,
    scope,
    catalogs,
    departmentPickerOptions,
    isDepartmentLoading: departmentsQuery.isLoading,
    departmentFetchError: departmentsQuery.data?.fetchError ?? null,
    invalidateSettingsCatalogs,
    invalidateCompanyDepartments,
  };
}
