/**
 * @CODE-MEMORY
 * Screen:     /employees form · YCTD — effective employment-type picker cache
 * UC:         AC-PLT-EMP-04/05 · BR-PLT-06
 * BR:         Consumer binds F-EMP-CAT-EFF-02 — cấm FE hardcode 4-option enum
 * SRS:        docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-VERTICAL-SA-01.md §3
 * API_DESIGN: GET /employees/employment-types/effective
 * Purpose:    React Query cache cho effective EMP employment catalog (EMP + group REF, EMP wins).
 * WorkItem:   PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-FE-01
 * Coded:      2026-08-07
 * Callers:    EmployeeFormDialog · JobRequisitionsTab · EmpEmploymentTypeSettingsPanel
 * Callees:    listEffectiveEmpEmploymentTypes · empEmploymentTypesToPickerOptions
 * must_keep:  empty → []; retire ẩn + history option; U65; hrm_personnel_uat_ready=false
 * SOLID:      RQ read owner — Settings mutate → invalidate cùng key
 * LastVerified: docs/qa/evidence/po-hrm-dynamic-config-platform-emp-fe-01.md
 */
import { useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useHrmOperatingUnitFilter } from '@/contexts/HrmOperatingUnitFilterContext';
import { listEffectiveEmpEmploymentTypes } from '@/integrations/hrmApi';
import {
  empEmploymentTypesToPickerOptions,
  ensureHistoricalEmploymentTypeOption,
  resolveEmpEmploymentTypeLabel,
} from '@/lib/empEmploymentTypeCatalog';

export const EMP_EMPLOYMENT_TYPES_EFFECTIVE_QUERY_KEY = 'hrm-emp-employment-types-effective';

export function empEmploymentTypesEffectiveQueryKey(companyId: string | null | undefined) {
  return [EMP_EMPLOYMENT_TYPES_EFFECTIVE_QUERY_KEY, companyId ?? null] as const;
}

export function useEmpEmploymentTypesEffective(opts?: {
  enabled?: boolean;
  /** Giá trị đang edit — giữ option lịch sử sau retire (BR-PLT-04). */
  currentValue?: string | null;
}) {
  const { currentCompanyId } = useAuth();
  const { listCompanyId } = useHrmOperatingUnitFilter();
  const companyId = (listCompanyId || currentCompanyId || '').trim() || null;
  const queryClient = useQueryClient();

  const enabled = opts?.enabled !== false && Boolean(companyId);

  const query = useQuery({
    queryKey: empEmploymentTypesEffectiveQueryKey(companyId),
    queryFn: () => listEffectiveEmpEmploymentTypes({ company_id: companyId! }),
    enabled,
    staleTime: 30_000,
  });

  const employmentTypeOptions = useMemo(() => {
    const base = empEmploymentTypesToPickerOptions(query.data?.items ?? []);
    return ensureHistoricalEmploymentTypeOption(base, opts?.currentValue);
  }, [query.data?.items, opts?.currentValue]);

  const employmentTypeDisplayLabel = (code: string | null | undefined) =>
    resolveEmpEmploymentTypeLabel(employmentTypeOptions, code);

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: [EMP_EMPLOYMENT_TYPES_EFFECTIVE_QUERY_KEY] });
  };

  return {
    companyId,
    items: query.data?.items ?? [],
    employmentTypeOptions,
    employmentTypeDisplayLabel,
    isLoading: query.isLoading || query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    invalidate,
  };
}
