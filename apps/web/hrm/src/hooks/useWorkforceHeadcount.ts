import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { listEmployees } from '@/integrations/hrmApi';
import { HRM_API_MAX_PAGE_SIZE, shouldSkipSupabaseDataFetches } from '@/lib/hrmDataMode';

/**
 * Lightweight workforce total for linked-data empty detection (P-CC-03 vs 05..08).
 */
export function useWorkforceHeadcount() {
  const { currentCompanyId } = useAuth();
  const apiMode = shouldSkipSupabaseDataFetches();
  const [workforceTotal, setWorkforceTotal] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!apiMode || !currentCompanyId) {
      setWorkforceTotal(null);
      return;
    }
    setLoading(true);
    try {
      const response = await listEmployees({
        company_id: currentCompanyId,
        page: 1,
        page_size: Math.min(5, HRM_API_MAX_PAGE_SIZE),
      });
      setWorkforceTotal(response.total ?? response.data?.length ?? 0);
    } catch {
      setWorkforceTotal(null);
    } finally {
      setLoading(false);
    }
  }, [apiMode, currentCompanyId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { workforceTotal, loading, apiMode, refresh };
}
