import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { listExpiringContracts } from '@/integrations/hrmApi';
import { coerceHrmListCompanyId } from '@/lib/hrmListScope';
import { filterUpcomingExpiringContracts } from '@/lib/formatHrmDate';

/**
 * @CODE-MEMORY
 * Screen:      /dashboard — Tổng quan HRM (expiring contracts count + alert)
 * UC:          UC-HRM-20
 * Purpose:     Dashboard expiring-contracts widget via the dedicated
 *              `GET /contracts-insurance/contracts/expiring` aggregate endpoint.
 *              Shared React Query key so the Dashboard count and
 *              ExpiringContractsAlert coalesce to a single fetch.
 * WorkItem:    D-DASH-FE-STORM / P1-HRM-PERF-FE-04
 * Coded:       2026-07-17
 * Impact:      Previous impl paginated the full active-contract collection
 *              (listAllEmployeeContracts → contracts×N storm, 23 requests on
 *              1000+ NV). The expiring endpoint returns only the 30-day window
 *              in one call. filterUpcomingExpiringContracts stays as a safety
 *              net (drops overdue/stale rows + deterministic sort).
 * LastVerified: docs/qa/evidence/d-dash-fe-storm-20260717.md
 *
 * @CODE-MEMORY-CHANGE 2026-07-19 CD-FB-04-PERF-FIX / P1-HRM-PERF-FE-04
 * what: Reconfirm shared EXPIRING_CONTRACTS_DASHBOARD_QUERY_KEY + 60s staleTime
 * why: Dashboard mount must stay ≤1 contracts-expiring call (no listAll fan-out)
 */
export const EXPIRING_CONTRACTS_DASHBOARD_QUERY_KEY = 'expiring-contracts-dashboard';

export function useExpiringContractsDashboard() {
  const { currentCompanyId } = useAuth();

  return useQuery({
    queryKey: [EXPIRING_CONTRACTS_DASHBOARD_QUERY_KEY, currentCompanyId],
    queryFn: async () => {
      if (!currentCompanyId) return [];
      const res = await listExpiringContracts({
        company_id: coerceHrmListCompanyId(currentCompanyId),
        days: 30,
      });
      return filterUpcomingExpiringContracts(res.data ?? [], 30);
    },
    enabled: !!currentCompanyId,
    staleTime: 60_000,
  });
}
