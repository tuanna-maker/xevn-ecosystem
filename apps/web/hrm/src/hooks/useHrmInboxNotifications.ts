import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import {
  listHrmInboxNotifications,
  markHrmInboxNotificationRead,
  type HrmInboxNotification,
} from '@/integrations/hrmApi';
import {
  canMarkHrmInboxPersonalRead,
  hrmInboxQueryKey,
} from '@/lib/hrmInboxNotificationDisplay';
import { resolveHrmMetadataCompanyUuid } from '@/lib/hrmMetadataCompany';
import { isHrmNestApiReachable } from '@/lib/hrmDataMode';
import { toast } from 'sonner';

/**
 * @CODE-MEMORY-CHANGE 2026-08-04 PO-UC-TC-W4-FE-NT01-INBOX-SCOPE-PROXY-01
 * change_mode: FIX
 * What: enabled when isHrmNestApiReachable() (portal /api/hrm proxy) + company + employee_id
 * Why: QA R2 — VITE_HRM_API_ORIGIN empty on :5173 blocked inbox; ceo@ still EXPECTED_NO_INBOX without employee_id
 * must_keep: no fake unread; mark-read PATCH parity; getPortalEmbedEmployeeId via AuthContext memberships
 *
 * @CODE-MEMORY-CHANGE 2026-08-04 PO-UC-TC-W4-FE-NT01-MARK-COMPANY-UUID-01
 * change_mode: FIX
 * What: mark-read prefers row.company_id UUID → resolveHrmMetadataCompanyUuid; reject broadcast NULL recipient
 * Why: QA R3 PATCH company_id=trsport → HRM-VAL-001; BA AC-NT01-MARK-01 personal-only
 * must_keep: GET inbox proxy + EXPECTED_NO_INBOX ceo@; U65 no seed
 */

export function useHrmInboxScope() {
  const { currentCompanyId, memberships } = useAuth();
  const employeeId = useMemo(
    () => memberships.find((m) => m.company_id === currentCompanyId)?.employee_id ?? null,
    [memberships, currentCompanyId],
  );
  const enabled = Boolean(isHrmNestApiReachable() && currentCompanyId && employeeId);
  return {
    currentCompanyId,
    employeeId,
    enabled,
  };
}

type UseHrmInboxNotificationsOptions = {
  limit?: number;
  enabled?: boolean;
};

export function useHrmInboxNotifications(opts?: UseHrmInboxNotificationsOptions) {
  const queryClient = useQueryClient();
  const { currentCompanyId, employeeId, enabled: scopeEnabled } = useHrmInboxScope();
  const limit = opts?.limit ?? 50;
  const enabled = (opts?.enabled ?? true) && scopeEnabled;

  const query = useQuery({
    queryKey: [...hrmInboxQueryKey(currentCompanyId!, employeeId!), limit],
    queryFn: async () => {
      const res = await listHrmInboxNotifications({
        company_id: currentCompanyId!,
        employee_id: employeeId!,
        limit,
      });
      return res.data ?? [];
    },
    enabled,
    refetchInterval: enabled ? 60_000 : false,
  });

  const markReadMutation = useMutation({
    mutationFn: async (row: HrmInboxNotification) => {
      if (!currentCompanyId || !employeeId) {
        throw new Error('Thiếu phạm vi công ty hoặc mã nhân viên');
      }
      if (!canMarkHrmInboxPersonalRead(row)) {
        throw new Error('Chỉ đánh dấu đã đọc được thông báo gửi riêng cho bạn');
      }
      // Prefer list row.company_id (UUID); fallback session slug → UUID for MarkInboxReadQueryDto.
      const companyForMark =
        resolveHrmMetadataCompanyUuid(row.company_id) ??
        resolveHrmMetadataCompanyUuid(currentCompanyId);
      if (!companyForMark) {
        throw new Error('Không xác định được mã công ty (UUID) để đánh dấu đã đọc');
      }
      return markHrmInboxNotificationRead(row.id, {
        company_id: companyForMark,
        viewer_employee_id: employeeId,
      });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['hrm-inbox'] });
      void queryClient.invalidateQueries({ queryKey: ['hrm-api-reminders'] });
    },
    onError: (e: unknown) => {
      toast.error(e instanceof Error ? e.message : 'Không đánh dấu đã đọc được');
    },
  });

  const rows = query.data ?? [];
  const unreadCount = rows.filter((r) => r.read_at == null || r.read_at.trim() === '').length;

  return {
    enabled,
    currentCompanyId,
    employeeId,
    rows,
    unreadCount,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
    markRead: markReadMutation.mutateAsync,
    isMarkingRead: markReadMutation.isPending,
  };
}
