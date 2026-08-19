/**
 * @CODE-MEMORY
 * Screen:     Attendance → Đơn từ → Đổi ca — picker ca (effective work-shift catalog)
 * UC:         UC-HRM-ATT-SHIFT-CHANGE · VAL-ATT-SHIFT-CNS-02 · AC-PLT-ATT-SHIFT-01
 * BR:         BR-PLT-04 — consumer bind Nest active work_shifts (admin ≠ consumer)
 * SRS:        docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-SHIFT-CATALOG-SA-01.md
 * API_DESIGN: GET /api/hrm/attendance/work-shifts/effective
 * Purpose:    React Query cache cho effective (active-only) work-shift catalog + picker options.
 *             activeCount>0 → bind Nest; =0 → caller empty CTA (no bootstrap seed · ATT-01).
 * WorkItem:   PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-SHIFT-CATALOG-FE-01
 * Coded:      2026-08-08
 * Callers:    ShiftChangeRequestTab
 * Callees:    listEffectiveWorkShifts · workShiftsToPickerOptions
 * must_keep:  scope theo currentCompanyId (khớp createShiftChangeRequest) · empty → []; U65 no seed;
 *             submit gửi Nest code (HRM-ATT-SHIFT-KEY BE) · attendance_uat_ready=false
 * SOLID:      RQ read owner — Settings work-shift mutate → invalidate cùng key
 * solid_convention_ack: FE bind display-ready từ Nest; không join/công thức FE
 * LastVerified: docs/qa/evidence/po-hrm-mvp-gd1-att-01-cluster-fe-01.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-ATT-01-CLUSTER-FE-01
 * change_mode: UPGRADE
 * What: Document empty → CTA (caller); invalidate from useWorkShifts CRUD; Nest /core 0.
 * Why: AC-ATT-01-EMPTY · R-ATT-01-CNS-FE · U65
 * must_keep: physical /work-shifts/effective · no seed · ≠ ATT-01 DONE
 */
import { useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { listEffectiveWorkShifts } from '@/integrations/hrmApi';
import {
  workShiftsToPickerOptions,
  type WorkShiftPickerOption,
} from '@/lib/workShiftCatalog';

export const WORK_SHIFTS_EFFECTIVE_QUERY_KEY = 'hrm-work-shifts-effective';

export function workShiftsEffectiveQueryKey(companyId: string | null | undefined) {
  return [WORK_SHIFTS_EFFECTIVE_QUERY_KEY, companyId ?? null] as const;
}

export function useWorkShiftsEffective(opts?: { enabled?: boolean }) {
  // Scope theo currentCompanyId để khớp company_id gửi khi createShiftChangeRequest
  // (BE invent KEY assert đối chiếu effective của đúng company persist).
  const { currentCompanyId } = useAuth();
  const companyId = (currentCompanyId || '').trim() || null;
  const queryClient = useQueryClient();

  const enabled = opts?.enabled !== false && Boolean(companyId);

  const query = useQuery({
    queryKey: workShiftsEffectiveQueryKey(companyId),
    queryFn: () => listEffectiveWorkShifts({ company_id: companyId! }),
    enabled,
    staleTime: 30_000,
  });

  const nestOptions = useMemo<WorkShiftPickerOption[]>(
    () => workShiftsToPickerOptions(query.data?.items ?? []),
    [query.data?.items],
  );

  const activeCount = query.data?.total ?? nestOptions.length;

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: [WORK_SHIFTS_EFFECTIVE_QUERY_KEY] });
  };

  return {
    companyId,
    items: query.data?.items ?? [],
    nestOptions,
    activeCount,
    isLoading: query.isLoading || query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    invalidate,
  };
}
