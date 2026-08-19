/**
 * @CODE-MEMORY
 * Screen:     /employees form — effective status-reason picker cache (companion STR)
 * UC:         AC-PLT-EMP-STATUS-01b · VAL-EMP-STR-CNS-01 · BR-PLT-EMP-ST-06
 * BR:         When status.requires_reason / STR EFF>0 → bind Nest reason_key; free-text SoT FORBIDDEN
 * SRS:        docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-CATALOG-BA-01.md § AC-01b
 * TechSpec:   docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-FE-SA-01.md Option A LOCKED
 * API_DESIGN: GET /api/hrm/employees/status-reasons/effective?applies_to_status_key=
 * Purpose:    React Query cache cho catalog lý do trạng thái hiệu lực; filter applies_to.
 * WorkItem:   PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-CATALOG-FE-01
 * Coded:      2026-08-08
 * Callers:    EmployeeFormDialog · EmpEmploymentStatusSettingsPanel
 * Callees:    listEffectiveStatusReasons · empStatusReasonsToPickerOptions
 * must_keep:  HRM-EMP-STATUS-REASON-KEY · applies_to filter · U65 no seed ·
 *             personnel=false · L1 EMPSTQA-MSK20G7H RETAIN · Nest pos/dept DENY
 * SOLID:      RQ read owner SRP — companion to status EFF hook
 * solid_convention_ack: FE bind display-ready reasonKey/nameVi từ Nest
 * LastVerified: docs/qa/evidence/po-hrm-dynamic-config-platform-emp-status-fe-admin-build-fe-01.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-09
 * WorkItem:   PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-FE-ADMIN-BUILD-FE-01
 * change_mode: ADD
 * What:       Callers += Settings STR admin panel (invalidate EFF after mutate)
 * Why:        Sponsor UNLOCK R-PLT-EMP-ST-FE-ADMIN
 * must_keep:  sealed Nest KEY · no dual writer
 */
import { useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useHrmOperatingUnitFilter } from '@/contexts/HrmOperatingUnitFilterContext';
import { listEffectiveStatusReasons } from '@/integrations/hrmApi';
import {
  empStatusReasonsToPickerOptions,
  filterEmpStatusReasonsForStatus,
  resolveEmpStatusReasonLabel,
  type EmpStatusReasonPickerOption,
} from '@/lib/empEmploymentStatusCatalog';

export {
  HRM_EMP_STATUS_REASON_KEY_CODE,
  empStatusReasonToPickerOption,
  empStatusReasonsToPickerOptions,
  filterEmpStatusReasonsForStatus,
  normalizeEmpStatusReasonKey,
  resolveEmpStatusReasonLabel,
} from '@/lib/empEmploymentStatusCatalog';

export const EMP_STATUS_REASONS_EFFECTIVE_QUERY_KEY = 'hrm-emp-status-reasons-effective';

export function empStatusReasonsEffectiveQueryKey(
  companyId: string | null | undefined,
  appliesToStatusKey?: string | null,
) {
  return [
    EMP_STATUS_REASONS_EFFECTIVE_QUERY_KEY,
    companyId ?? null,
    appliesToStatusKey?.trim() || null,
  ] as const;
}

export function useEmpStatusReasonsEffective(opts?: {
  enabled?: boolean;
  /** Filter Nest applies_to_status_key (optional). */
  appliesToStatusKey?: string | null;
}) {
  const { currentCompanyId } = useAuth();
  const { listCompanyId } = useHrmOperatingUnitFilter();
  const companyId = (listCompanyId || currentCompanyId || '').trim() || null;
  const queryClient = useQueryClient();
  const appliesTo = (opts?.appliesToStatusKey ?? '').trim() || undefined;

  const enabled = opts?.enabled !== false && Boolean(companyId);

  const query = useQuery({
    queryKey: empStatusReasonsEffectiveQueryKey(companyId, appliesTo),
    queryFn: () =>
      listEffectiveStatusReasons({
        company_id: companyId!,
        applies_to_status_key: appliesTo,
      }),
    enabled,
    staleTime: 30_000,
  });

  const nestOptions = useMemo<EmpStatusReasonPickerOption[]>(() => {
    const base = empStatusReasonsToPickerOptions(query.data?.items ?? []);
    // Client filter as safety if API returns unfiltered rows.
    return filterEmpStatusReasonsForStatus(base, appliesTo);
  }, [query.data?.items, appliesTo]);

  const effectiveCount = query.data?.total ?? nestOptions.length;

  const reasonDisplayLabel = (code: string | null | undefined) =>
    resolveEmpStatusReasonLabel(nestOptions, code);

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: [EMP_STATUS_REASONS_EFFECTIVE_QUERY_KEY] });
  };

  return {
    companyId,
    items: query.data?.items ?? [],
    nestOptions,
    effectiveCount,
    reasonDisplayLabel,
    isLoading: query.isLoading || query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    invalidate,
  };
}
