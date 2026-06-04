import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toErrorMessage } from '@/lib/apiError';
import { shouldSkipSupabaseDataFetches } from '@/lib/hrmDataMode';
import {
  approveEmployeeMetadataChangeRequest,
  listEmployeeMetadataChangeRequests,
  rejectEmployeeMetadataChangeRequest,
  type HrmEmployeeMetadataChangeRequest,
} from '@/integrations/hrmApi';

export function formatMetadataDisplayValue(value: unknown): string {
  if (value == null || value === '') return '—';
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
      try {
        return JSON.parse(trimmed) as string;
      } catch {
        return value;
      }
    }
    return value;
  }
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

export function useMetadataQueue(status: 'pending' | 'approved' | 'rejected' | 'cancelled' = 'pending') {
  const { currentCompanyId } = useAuth();
  const [rows, setRows] = useState<HrmEmployeeMetadataChangeRequest[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const useApi = shouldSkipSupabaseDataFetches();

  const refetch = useCallback(async () => {
    if (!currentCompanyId || !useApi) {
      setRows([]);
      setTotal(0);
      setFetchError(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setFetchError(null);
    try {
      const response = await listEmployeeMetadataChangeRequests({
        company_id: currentCompanyId,
        status,
        page_size: 50,
      });
      setRows(response.data ?? []);
      setTotal(response.total ?? response.data?.length ?? 0);
    } catch (error: unknown) {
      setRows([]);
      setTotal(0);
      setFetchError(toErrorMessage(error, 'Không tải được hàng chờ metadata'));
    } finally {
      setIsLoading(false);
    }
  }, [currentCompanyId, status, useApi]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  const decide = useCallback(
    async (id: string, action: 'approve' | 'reject', note?: string) => {
      const payload = {
        actor_name: 'HRM Portal',
        note: note ?? (action === 'approve' ? 'Duyệt từ HRM embed' : 'Từ chối từ HRM embed'),
      };
      if (action === 'approve') {
        await approveEmployeeMetadataChangeRequest(id, payload);
      } else {
        await rejectEmployeeMetadataChangeRequest(id, payload);
      }
      setRows((prev) => prev.filter((row) => row.id !== id));
      setTotal((prev) => Math.max(0, prev - 1));
    },
    [],
  );

  return {
    rows,
    total,
    isLoading,
    fetchError,
    refetch,
    decide,
    useApiMode: useApi,
  };
}
