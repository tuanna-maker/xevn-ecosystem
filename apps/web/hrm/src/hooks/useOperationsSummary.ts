import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toErrorMessage } from '@/lib/apiError';
import { shouldSkipSupabaseDataFetches } from '@/lib/hrmDataMode';
import { getOperationsSummary } from '@/integrations/hrmApi';

export type OperationsSummaryCounts = {
  attendance_records: number;
  payroll_periods: number;
  job_requisitions: number;
  tasks: number;
};

export function hasPositiveOperationsSummary(summary: OperationsSummaryCounts | null): boolean {
  if (!summary) return false;
  return (
    summary.attendance_records > 0 ||
    summary.job_requisitions > 0 ||
    summary.payroll_periods > 0 ||
    summary.tasks > 0
  );
}

export function useOperationsSummary() {
  const { currentCompanyId } = useAuth();
  const [summary, setSummary] = useState<OperationsSummaryCounts | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const useApi = shouldSkipSupabaseDataFetches();

  const refetch = useCallback(async () => {
    if (!currentCompanyId || !useApi) {
      setSummary(null);
      setFetchError(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setFetchError(null);
    try {
      const data = await getOperationsSummary(currentCompanyId);
      setSummary(data);
    } catch (error: unknown) {
      setSummary(null);
      setFetchError(toErrorMessage(error, 'Không tải được tổng hợp vận hành'));
    } finally {
      setIsLoading(false);
    }
  }, [currentCompanyId, useApi]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { summary, isLoading, fetchError, refetch, useApiMode: useApi };
}
