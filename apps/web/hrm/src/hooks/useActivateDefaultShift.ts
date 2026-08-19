/**
 * @CODE-MEMORY
 * Screen:     EmployeeProfile — ca mặc định activate_default (ATT-12)
 * UC:         FR-UC-BP-ATT-12 · AC-ATT-12-FE-CONFIRM
 * Purpose:    GET shift-assignments/activate-default for HCNS strip; F5 parity.
 * WorkItem:   PO-HRM-MVP-GD1-ATT-12-CLUSTER-FE-01
 * Coded:      2026-08-10
 * must_keep:  Nest /core DENY · U65 · ≠ ATT-12 DONE
 */

import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { fetchActivateDefaultShiftAssignment } from '@/integrations/hrmApi';
import { coerceHrmListCompanyId } from '@/lib/hrmListScope';
import type { ActivateDefaultShiftDisplay } from '@/lib/attLeave12Ring';

export const ACTIVATE_DEFAULT_SHIFT_QUERY_KEY = 'att-activate-default-shift' as const;

export function buildActivateDefaultShiftQueryKey(
  companyId: string | null | undefined,
  employeeId: string | null | undefined,
): readonly unknown[] {
  return [ACTIVATE_DEFAULT_SHIFT_QUERY_KEY, companyId ?? null, employeeId ?? null] as const;
}

export function useActivateDefaultShift(opts: {
  employeeId: string | null | undefined;
  enabled?: boolean;
}) {
  const { currentCompanyId } = useAuth();
  const employeeId = opts.employeeId?.trim() || '';
  const enabled =
    opts.enabled !== false && Boolean(currentCompanyId) && Boolean(employeeId);

  return useQuery({
    queryKey: buildActivateDefaultShiftQueryKey(currentCompanyId, employeeId),
    enabled,
    queryFn: async (): Promise<ActivateDefaultShiftDisplay> => {
      const company_id = coerceHrmListCompanyId(currentCompanyId!);
      return fetchActivateDefaultShiftAssignment({
        company_id,
        employee_id: employeeId,
      });
    },
    staleTime: 30_000,
  });
}
