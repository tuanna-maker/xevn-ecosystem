import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toErrorMessage } from '@/lib/apiError';
import { shouldSkipSupabaseDataFetches, HRM_API_MAX_PAGE_SIZE } from '@/lib/hrmDataMode';
import { listJobRequisitions, type HrmJobRequisition } from '@/integrations/hrmApi';

export function buildJobRequisitionsQuery(companyId: string) {
  return {
    company_id: companyId,
    page: 1,
    page_size: HRM_API_MAX_PAGE_SIZE,
  };
}

export function useJobRequisitions() {
  const { currentCompanyId } = useAuth();
  const [requisitions, setRequisitions] = useState<HrmJobRequisition[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const useApi = shouldSkipSupabaseDataFetches();

  const fetchRequisitions = useCallback(async () => {
    if (!currentCompanyId || !useApi) {
      setRequisitions([]);
      setFetchError(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setFetchError(null);
    try {
      const response = await listJobRequisitions(buildJobRequisitionsQuery(currentCompanyId));
      setRequisitions(response.data ?? []);
    } catch (error: unknown) {
      console.error('Error fetching job requisitions:', error);
      setRequisitions([]);
      setFetchError(toErrorMessage(error, 'Không thể tải yêu cầu tuyển dụng'));
    } finally {
      setIsLoading(false);
    }
  }, [currentCompanyId, useApi]);

  useEffect(() => {
    void fetchRequisitions();
  }, [fetchRequisitions]);

  return { requisitions, isLoading, fetchError, refetch: fetchRequisitions, useApiMode: useApi };
}
