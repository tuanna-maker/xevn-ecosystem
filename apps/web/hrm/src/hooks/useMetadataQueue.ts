import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toErrorMessage } from '@/lib/apiError';
import { shouldSkipSupabaseDataFetches } from '@/lib/hrmDataMode';
import { normalizeHrmApiListCompanyId } from '@/lib/hrmListScope';
import { resolveHrmMetadataCompanyUuid } from '@/lib/hrmMetadataCompany';
import { resolveHrmSpreadsheetScope } from '@/lib/hrmSpreadsheetScope';
import {
  approveEmployeeMetadataChangeRequest,
  listEmployeeMetadataChangeRequests,
  rejectEmployeeMetadataChangeRequest,
  submitEmployeeMetadataChangeRequest,
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

function metadataScopeForRow(
  currentCompanyId: string | null,
  rowCompanyId?: string | null,
): { tenantId: string; companyId: string } | undefined {
  const hint = rowCompanyId ?? currentCompanyId;
  const scope = resolveHrmSpreadsheetScope(hint ?? undefined);
  if (!scope) return undefined;
  const companyUuid = resolveHrmMetadataCompanyUuid(rowCompanyId ?? currentCompanyId);
  return companyUuid
    ? { tenantId: scope.tenantId, companyId: companyUuid }
    : scope;
}

export function useMetadataQueue(status: 'pending' | 'approved' | 'rejected' | 'cancelled' = 'pending') {
  const { currentCompanyId, user } = useAuth();
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
        company_id: normalizeHrmApiListCompanyId(currentCompanyId),
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
    async (id: string, action: 'approve' | 'reject', row?: HrmEmployeeMetadataChangeRequest, note?: string) => {
      const payload = {
        actor_user_id: user?.email ?? undefined,
        actor_name: user?.email ?? 'HRM Portal',
        note: note ?? (action === 'approve' ? 'Duyệt từ HRM embed' : 'Từ chối từ HRM embed'),
      };
      const scope = metadataScopeForRow(currentCompanyId, row?.company_id);
      if (action === 'approve') {
        await approveEmployeeMetadataChangeRequest(id, payload, scope);
      } else {
        await rejectEmployeeMetadataChangeRequest(id, payload, scope);
      }
      setRows((prev) => prev.filter((r) => r.id !== id));
      setTotal((prev) => Math.max(0, prev - 1));
    },
    [currentCompanyId, user?.email],
  );

  const submit = useCallback(
    async (input: {
      employee_id: string;
      company_id: string;
      field_key: string;
      requested_value: unknown;
      reason?: string;
    }) => {
      await submitEmployeeMetadataChangeRequest({
        company_id: input.company_id,
        employee_id: input.employee_id,
        field_key: input.field_key,
        requested_value: input.requested_value,
        reason: input.reason,
        actor_user_id: user?.email ?? undefined,
        actor_name: user?.email ?? 'HRM Portal',
      });
      await refetch();
    },
    [refetch, user?.email],
  );

  return {
    rows,
    total,
    isLoading,
    fetchError,
    refetch,
    decide,
    submit,
    useApiMode: useApi,
  };
}
