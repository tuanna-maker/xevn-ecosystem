/**
 * @CODE-MEMORY
 * Screen:     /attendance — Nghỉ phép form picker (effective catalog)
 * UC:         AC-PLT-ATT-01 · BR-PLT-06
 * BR:         Consumer binds F-ATT-CAT-EFF — cấm FE hardcode LVT_01..04
 * SRS:        docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-VERTICAL-SA-01.md §3.5
 * API_DESIGN: GET /attendance/leave-types/effective
 * Purpose:    React Query cache cho effective leave catalog (ATT + group REF, ATT wins).
 * WorkItem:   PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-FE-01
 * Coded:      2026-08-07
 * Callers:    LeaveTab
 * Callees:    listEffectiveAttLeaveTypes · attLeaveTypesToPickerOptions
 * must_keep:  empty → []; retire ẩn; U65 no seed; attendance_uat_ready=false
 * SOLID:      RQ read owner — Settings panel mutate → invalidate cùng key
 * LastVerified: docs/qa/evidence/po-hrm-dynamic-config-platform-att-fe-01.md
 */
import { useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useHrmOperatingUnitFilter } from '@/contexts/HrmOperatingUnitFilterContext';
import { listEffectiveAttLeaveTypes } from '@/integrations/hrmApi';
import { attLeaveTypesToPickerOptions } from '@/lib/attLeaveTypeCatalog';
import { resolveLeaveTypeLabel } from '@/lib/catalogSearchPicker';

export const ATT_LEAVE_TYPES_EFFECTIVE_QUERY_KEY = 'hrm-att-leave-types-effective';

export function attLeaveTypesEffectiveQueryKey(companyId: string | null | undefined) {
  return [ATT_LEAVE_TYPES_EFFECTIVE_QUERY_KEY, companyId ?? null] as const;
}

export function useAttLeaveTypesEffective(opts?: { enabled?: boolean }) {
  const { currentCompanyId } = useAuth();
  const { listCompanyId } = useHrmOperatingUnitFilter();
  const companyId = (listCompanyId || currentCompanyId || '').trim() || null;
  const queryClient = useQueryClient();

  const enabled = opts?.enabled !== false && Boolean(companyId);

  const query = useQuery({
    queryKey: attLeaveTypesEffectiveQueryKey(companyId),
    queryFn: () => listEffectiveAttLeaveTypes({ company_id: companyId! }),
    enabled,
    staleTime: 30_000,
  });

  const leaveTypeOptions = useMemo(
    () => attLeaveTypesToPickerOptions(query.data?.items ?? []),
    [query.data?.items],
  );

  const leaveTypeDisplayLabel = (code: string | null | undefined) =>
    resolveLeaveTypeLabel(leaveTypeOptions, code);

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: [ATT_LEAVE_TYPES_EFFECTIVE_QUERY_KEY] });
  };

  return {
    companyId,
    items: query.data?.items ?? [],
    leaveTypeOptions,
    leaveTypeDisplayLabel,
    isLoading: query.isLoading || query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    invalidate,
  };
}
