import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { getEmployeesSummary, type HrmEmployeeSummary } from '@/integrations/hrmApi';
import { coerceHrmListCompanyId } from '@/lib/hrmListScope';

export const EMPLOYEES_SUMMARY_QUERY_KEY = 'employees-summary';

export function useEmployeesSummary(opts?: {
  include_archived?: boolean;
  enabled?: boolean;
}) {
  const { currentCompanyId } = useAuth();
  const enabled = opts?.enabled !== false && !!currentCompanyId;

  return useQuery<HrmEmployeeSummary>({
    queryKey: [EMPLOYEES_SUMMARY_QUERY_KEY, currentCompanyId, opts?.include_archived ?? false],
    queryFn: () =>
      getEmployeesSummary({
        company_id: coerceHrmListCompanyId(currentCompanyId!),
        include_archived: opts?.include_archived,
      }),
    enabled,
    staleTime: 60_000,
  });
}
