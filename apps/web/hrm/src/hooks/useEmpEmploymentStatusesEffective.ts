/**
 * @CODE-MEMORY
 * Screen:     /employees form · filter — effective employment-status picker cache
 * UC:         AC-PLT-EMP-STATUS-01 / 01c · VAL-EMP-ST-CNS-02 · BR-PLT-EMP-ST-02/04/05
 * BR:         Consumer binds F-EMP-CAT-ST-EFF — cấm Settings-MD/hardcode-3 sole SoT khi EFF>0
 * SRS:        docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-CATALOG-BA-01.md § AC-01*
 * TechSpec:   docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-FE-SA-01.md Option A LOCKED
 * API_DESIGN: GET /api/hrm/employees/employment-statuses/effective
 * Purpose:    React Query cache cho catalog trạng thái NV hiệu lực (EMP + group REF, EMP wins).
 *             effectiveCount>0 → bind Nest; =0 → caller dùng bootstrap active|probation|inactive
 *             (empty UX hợp lệ — U65 no seed · không invent FE-ADMIN).
 * WorkItem:   PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-CATALOG-FE-01
 * Coded:      2026-08-08
 * Callers:    EmployeeFormDialog · Employees.tsx status filter
 * Callees:    listEffectiveEmploymentStatuses · empEmploymentStatusesToPickerOptions
 * must_keep:  scope theo company · submit Nest status_key · L1 EMPSTQA-MSK20G7H RETAIN ·
 *             HRM-EMP-STATUS-KEY · EMP-CUSTOM · ATT seals · LVRULE HOLD · personnel=false ·
 *             Nest pos/dept DENY · honesty false · C-SLICE
 * SOLID:      RQ read owner + helper thuần SRP — FE không join/không aggregate rewrite
 * solid_convention_ack: FE bind display-ready từ Nest; bootstrap chỉ khi catalog rỗng
 * LastVerified: docs/qa/evidence/po-hrm-dynamic-config-platform-emp-status-fe-admin-build-fe-01.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-09
 * WorkItem:   PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-FE-ADMIN-BUILD-FE-01
 * change_mode: ADD
 * What:       Callers += EmpEmploymentStatusSettingsPanel (invalidate EFF after admin mutate)
 * Why:        Sponsor UNLOCK ABSENT twin — Settings admin uses same EFF cache
 * must_keep:  sealed Nest KEY · no dual writer · pos/dept DENY
 */
import { useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useHrmOperatingUnitFilter } from '@/contexts/HrmOperatingUnitFilterContext';
import { listEffectiveEmploymentStatuses } from '@/integrations/hrmApi';
import {
  empEmploymentStatusesToPickerOptions,
  resolveEmpEmploymentStatusLabel,
  type EmpEmploymentStatusPickerOption,
} from '@/lib/empEmploymentStatusCatalog';

export {
  EMP_EMPLOYMENT_STATUS_BOOTSTRAP_FALLBACK,
  EMP_EMPLOYMENT_STATUS_KEY_FORMAT,
  EMP_EMPLOYMENT_STATUS_UAT_HONESTY,
  HRM_EMP_STATUS_KEY_CODE,
  empEmploymentStatusToPickerOption,
  empEmploymentStatusesToPickerOptions,
  normalizeEmpEmploymentStatusKey,
  resolveEmpEmploymentStatusEditValue,
  resolveEmpEmploymentStatusLabel,
} from '@/lib/empEmploymentStatusCatalog';

export const EMP_EMPLOYMENT_STATUSES_EFFECTIVE_QUERY_KEY = 'hrm-emp-employment-statuses-effective';

export function empEmploymentStatusesEffectiveQueryKey(companyId: string | null | undefined) {
  return [EMP_EMPLOYMENT_STATUSES_EFFECTIVE_QUERY_KEY, companyId ?? null] as const;
}

export function useEmpEmploymentStatusesEffective(opts?: { enabled?: boolean }) {
  const { currentCompanyId } = useAuth();
  const { listCompanyId } = useHrmOperatingUnitFilter();
  const companyId = (listCompanyId || currentCompanyId || '').trim() || null;
  const queryClient = useQueryClient();

  const enabled = opts?.enabled !== false && Boolean(companyId);

  const query = useQuery({
    queryKey: empEmploymentStatusesEffectiveQueryKey(companyId),
    queryFn: () => listEffectiveEmploymentStatuses({ company_id: companyId! }),
    enabled,
    staleTime: 30_000,
  });

  const nestOptions = useMemo<EmpEmploymentStatusPickerOption[]>(
    () => empEmploymentStatusesToPickerOptions(query.data?.items ?? []),
    [query.data?.items],
  );

  const effectiveCount = query.data?.total ?? nestOptions.length;

  const statusDisplayLabel = (code: string | null | undefined) =>
    resolveEmpEmploymentStatusLabel(nestOptions, code);

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: [EMP_EMPLOYMENT_STATUSES_EFFECTIVE_QUERY_KEY] });
  };

  return {
    companyId,
    items: query.data?.items ?? [],
    nestOptions,
    effectiveCount,
    statusDisplayLabel,
    isLoading: query.isLoading || query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    invalidate,
  };
}
