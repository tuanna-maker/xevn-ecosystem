import { useCallback, useState } from 'react';
import { useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { ApiClientError, toErrorMessage } from '@/lib/apiError';
import { coerceHrmListCompanyId } from '@/lib/hrmListScope';
import { isHrmApiDataMode } from '@/lib/hrmDataMode';
import {
  createPayrollGroup,
  getPayrollGroupMembers,
  listPayrollGroups,
  updatePayrollGroup,
  type HrmPayrollGroupApiRow,
} from '@/integrations/hrmApi';
import { resolvePayGroup409UserMessage } from '@/lib/payPay09GroupRing';
import { toast } from 'sonner';

export const PAYROLL_GROUPS_QUERY_ROOT = 'payroll-groups' as const;

export function payrollGroupsQueryKey(companyId: string, status?: 'active' | 'retired') {
  return status ? ([PAYROLL_GROUPS_QUERY_ROOT, companyId, status] as const) : ([PAYROLL_GROUPS_QUERY_ROOT, companyId] as const);
}

/** FE-PAY09-CATALOG-LIST-STALE: upsert row so catalog shows POST 201 without manual F5. */
export function upsertPayrollGroupInListCache(
  queryClient: QueryClient,
  companyId: string,
  row: HrmPayrollGroupApiRow,
) {
  if (!companyId || !row?.id) return;
  queryClient.setQueriesData<HrmPayrollGroupApiRow[]>(
    { queryKey: payrollGroupsQueryKey(companyId) },
    (old) => {
      const list = old ?? [];
      const idx = list.findIndex((g) => g.id === row.id);
      if (idx >= 0) {
        const next = [...list];
        next[idx] = row;
        return next;
      }
      return [...list, row];
    },
  );
}

export async function refreshPayrollGroupsQueries(queryClient: QueryClient, companyId: string) {
  if (!companyId) return;
  await queryClient.invalidateQueries({ queryKey: payrollGroupsQueryKey(companyId) });
  await queryClient.refetchQueries({ queryKey: payrollGroupsQueryKey(companyId), type: 'active' });
}

export type PayrollGroupFormPayload = {
  code: string;
  name_vi: string;
  priority: number;
  departmentIdsText: string;
  positionKeysText: string;
  employeeIdsText: string;
  status?: 'active' | 'retired';
};

export function usePayrollGroups(options?: { status?: 'active' | 'retired'; enabled?: boolean }) {
  const { currentCompanyId } = useAuth();
  const companyId = currentCompanyId ? coerceHrmListCompanyId(currentCompanyId) : '';
  const useApi = isHrmApiDataMode();
  const enabled = (options?.enabled ?? true) && Boolean(companyId) && useApi;

  const query = useQuery({
    queryKey: payrollGroupsQueryKey(companyId, options?.status),
    queryFn: async () => {
      const res = await listPayrollGroups({ company_id: companyId, status: options?.status });
      return res.items ?? [];
    },
    enabled,
  });

  return {
    groups: query.data ?? [],
    isLoading: query.isLoading,
    fetchError: query.error ? toErrorMessage(query.error, 'Không thể tải danh mục nhóm lương') : null,
    refetch: query.refetch,
    useApiMode: useApi,
    companyId,
  };
}

export function usePayrollGroupMutations() {
  const { currentCompanyId } = useAuth();
  const companyId = currentCompanyId ? coerceHrmListCompanyId(currentCompanyId) : '';
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async (payload: Parameters<typeof createPayrollGroup>[0]) => createPayrollGroup(payload),
    onSuccess: async (created, variables) => {
      const cid = variables.company_id || companyId;
      upsertPayrollGroupInListCache(queryClient, cid, created);
      await refreshPayrollGroupsQueries(queryClient, cid);
      toast.success('Đã tạo nhóm bảng lương');
    },
    onError: (error: unknown) => {
      if (error instanceof ApiClientError) {
        toast.error(resolvePayGroup409UserMessage(error.code, error.message));
        return;
      }
      toast.error(toErrorMessage(error, 'Không thể tạo nhóm'));
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      groupId,
      payload,
    }: {
      groupId: string;
      payload: Parameters<typeof updatePayrollGroup>[1];
    }) => updatePayrollGroup(groupId, payload),
    onSuccess: async (updated) => {
      upsertPayrollGroupInListCache(queryClient, companyId, updated);
      await refreshPayrollGroupsQueries(queryClient, companyId);
      toast.success('Đã cập nhật nhóm bảng lương');
    },
    onError: (error: unknown) => {
      if (error instanceof ApiClientError) {
        toast.error(resolvePayGroup409UserMessage(error.code, error.message));
        return;
      }
      toast.error(toErrorMessage(error, 'Không thể cập nhật nhóm'));
    },
  });

  return {
    createGroup: createMutation.mutateAsync,
    updateGroup: updateMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
  };
}

export function usePayrollGroupMembersPreview(groupId: string | null) {
  const [periodId, setPeriodId] = useState<string>('');
  const [preview, setPreview] = useState<Awaited<ReturnType<typeof getPayrollGroupMembers>> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPreview = useCallback(async () => {
    if (!groupId || !periodId) {
      setError('Chọn kỳ lương để xem trước thành viên.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const data = await getPayrollGroupMembers(groupId, periodId);
      setPreview(data);
    } catch (e: unknown) {
      setPreview(null);
      if (e instanceof ApiClientError) {
        setError(resolvePayGroup409UserMessage(e.code, e.message));
      } else {
        setError(toErrorMessage(e, 'Không thể tải danh sách thành viên'));
      }
    } finally {
      setIsLoading(false);
    }
  }, [groupId, periodId]);

  return {
    periodId,
    setPeriodId,
    preview,
    isLoading,
    error,
    loadPreview,
    clearPreview: () => setPreview(null),
  };
}

export function mapApiGroupToRow(row: HrmPayrollGroupApiRow) {
  return row;
}
