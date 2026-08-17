/**
 * @CODE-MEMORY
 * Screen:     Attendance → Quản lý đơn → Đăng ký làm thêm (OvertimeRequestTab)
 * UC:         FR-HRM-AT-10 · ATT-C4 OT
 * SRS:        docs/hrm/SRS.md · chấm công / tăng ca
 * Purpose:    Hook list + create/approve/reject/delete đơn tăng ca qua Nest overtime-requests;
 *             toast i18n hk.overtime.*; refetch sau mutate.
 * WorkItem:   PO-MFD-M2-OT-FE-LOADING-01
 * Coded:      2026-08-04
 * Callers:    OvertimeRequestTab.tsx → useOvertimeRequests()
 * Callees:    listOvertimeRequests, createOvertimeRequest, approve/reject/deleteOvertimeRequest
 * must_keep:  create/approve contracts; Eye→Duyệt modal flow; U65 no seed
 * SOLID:      Một hook sở hữu fetch + mutate; không helper i18n không ổn định trong deps
 * LastVerified: docs/qa/evidence/po-mfd-m2-ot-fe-loading-01.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-04 PO-MFD-M2-OT-FE-LOADING-01
 * change_mode: FIX
 * What: Bỏ helper `h` tái tạo mỗi render khỏi deps useCallback; dùng trực tiếp t('hk.overtime.*')
 * Why: fetchRequests đổi identity → useEffect storm GET overtime-requests → isLoading mãi → CTA không mount
 * must_keep: createOvertimeRequest / approveOvertimeRequest contracts; OvertimeRequestTab Eye→Duyệt; U65 no seed
 *
 * @CODE-MEMORY-CHANGE 2026-08-08 PO-HRM-DYNAMIC-CONFIG-PLATFORM-OT-TYPE-CATALOG-FE-01
 * change_mode: ADD
 * What: Toast lỗi tạo đơn hiển thị đúng nguyên nhân nghiệp vụ từ BE (không nuốt lỗi) —
 *       riêng HRM-ATT-OT-TYPE-KEY có hướng dẫn chọn lại loại tăng ca trong catalog hiệu lực.
 * Why: AC-PLT-ATT-OT-01 · VAL-ATT-OT-CNS-01 — invent mã khi EFF>0 phải nhìn thấy trên FE
 *      (QC Condition R-PLT-ATT-OT-FE-01), không chỉ «Không thể tạo đơn».
 * must_keep: create/approve/reject/delete contracts; refetch sau mutate; U65 no seed
 *
 * @CODE-MEMORY-CHANGE 2026-08-08 PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-COMP-TYPE-CATALOG-FE-01
 * change_mode: ADD
 * What: Toast HRM-ATT-OT-COMP-KEY khi invent compensation_type (orthogonal ≠ OT-TYPE KEY).
 * Why: QC Condition R-PLT-ATT-OTC-03 · AC-PLT-ATT-COMP-01 · VAL-ATT-COMP-CNS-01
 * must_keep: OT-TYPE KEY toast RETAIN; create/approve contracts; U65 no seed
 *
 * @CODE-MEMORY-CHANGE 2026-08-10 PO-HRM-MVP-GD1-ATT-06-CLUSTER-FE-01
 * change_mode: ADD
 * What: Sau approve OT invalidate leave-balance/panel cache; toast credited_days khi accrual LIVE.
 * Why: J-HRM-ATT-06-03/04 · F5 panel entitled ↑ · peer ATT05BQC1 RETAIN
 * must_keep: compensation_type EFF picker RETAIN; ≠ FR-06 DONE
 */
import { LEAVE_BALANCE_PANEL_QUERY_KEY } from '@/hooks/useLeaveBalancesByType';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useHrmOperatingUnitFilter } from '@/contexts/HrmOperatingUnitFilterContext';
import { useToast } from '@/hooks/use-toast';
import { toErrorMessage } from '@/lib/apiError';
import {
  approveOvertimeRequest,
  createOvertimeRequest,
  deleteOvertimeRequest,
  listOvertimeRequests,
  rejectOvertimeRequest,
} from '@/integrations/hrmApi';

/** BE error code khi consumer gửi mã loại tăng ca ngoài catalog hiệu lực (EFF>0). */
export const HRM_ATT_OT_TYPE_KEY_CODE = 'HRM-ATT-OT-TYPE-KEY';

/** BE error code khi consumer gửi compensation_type ngoài catalog hiệu lực (EFF>0) — orthogonal ≠ OT-TYPE. */
export const HRM_ATT_OT_COMP_KEY_CODE = 'HRM-ATT-OT-COMP-KEY';

export interface OvertimeRequest {
  id: string; company_id: string; employee_id: string; employee_code: string; employee_name: string;
  department: string | null; position: string | null; overtime_date: string; start_time: string;
  end_time: string; total_hours: number; overtime_type: string; coefficient: number | null;
  reason: string; compensation_type: string | null; approver_id: string | null; approver_name: string | null;
  status: string; approved_at: string | null; rejected_reason: string | null; actual_hours: number | null;
  notes: string | null; created_at: string; updated_at: string;
  accrual?: {
    credited_days: number;
    balance_year: number;
    ledger_id: string;
    idempotent_replay: boolean;
  } | null;
}

export interface OvertimeRequestFormData {
  employee_id: string; employee_code: string; employee_name: string; department?: string; position?: string;
  overtime_date: string; start_time: string; end_time: string; total_hours: number; overtime_type: string;
  coefficient?: number; reason: string; compensation_type?: string; approver_name?: string;
}

export function useOvertimeRequests() {
  const { currentCompanyId, profile, memberships } = useAuth();
  const { listCompanyId } = useHrmOperatingUnitFilter();
  const companyId = (listCompanyId || currentCompanyId || '').trim() || null;
  const { toast } = useToast();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [requests, setRequests] = useState<OvertimeRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const reviewerName = profile?.full_name?.trim() || 'Web HRM';
  const reviewerEmployeeId = useMemo(
    () => memberships.find((m) => m.company_id === companyId)?.employee_id ?? undefined,
    [memberships, companyId],
  );

  const fetchRequests = useCallback(async () => {
    if (!companyId) {
      setRequests([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const result = await listOvertimeRequests({ company_id: companyId });
      setRequests(result.data || []);
    } catch (error: unknown) {
      console.error('Error fetching overtime requests:', error);
      toast({
        title: t('messages.error'),
        description: t('hk.overtime.fetchError'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [companyId, toast, t]);

  useEffect(() => {
    void fetchRequests();
  }, [fetchRequests]);

  const createRequest = async (data: OvertimeRequestFormData): Promise<OvertimeRequest | null> => {
    if (!companyId) return null;
    try {
      const newRequest = await createOvertimeRequest({ company_id: companyId, ...data });
      setRequests((prev) => [newRequest, ...prev]);
      toast({ title: t('messages.success'), description: t('hk.overtime.createSuccess') });
      return newRequest;
    } catch (error: unknown) {
      console.error('Error creating overtime request:', error);
      const code = (error as { code?: string } | null)?.code;
      // VAL-ATT-OT-CNS-01 / VAL-ATT-COMP-CNS-01 — mã ngoài catalog hiệu lực: hướng dẫn thay vì lỗi chung.
      const description =
        code === HRM_ATT_OT_TYPE_KEY_CODE
          ? t('hk.overtime.otTypeKeyError')
          : code === HRM_ATT_OT_COMP_KEY_CODE
            ? t('hk.overtime.otCompTypeKeyError')
            : toErrorMessage(error, t('hk.overtime.createError'));
      toast({
        title: t('messages.error'),
        description,
        variant: 'destructive',
      });
      return null;
    }
  };

  const approveRequest = async (id: string): Promise<boolean> => {
    try {
      const updated = await approveOvertimeRequest(id, {
        reviewer_name: reviewerName,
        reviewer_employee_id: reviewerEmployeeId,
      });
      setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, ...updated } : r)));
      void queryClient.invalidateQueries({ queryKey: [LEAVE_BALANCE_PANEL_QUERY_KEY] });
      const accrual = updated.accrual;
      const accrualHint =
        accrual && accrual.credited_days > 0
          ? accrual.idempotent_replay
            ? `Phép bù OT đã ghi trước (+${accrual.credited_days} ngày, idempotent).`
            : `Đã cộng quỹ Phép bù OT: +${accrual.credited_days} ngày (năm ${accrual.balance_year}).`
          : null;
      toast({
        title: t('messages.success'),
        description: accrualHint ?? t('hk.overtime.approveSuccess'),
      });
      return true;
    } catch (error: unknown) {
      console.error('Error approving overtime request:', error);
      toast({
        title: t('messages.error'),
        description: t('hk.overtime.updateError'),
        variant: 'destructive',
      });
      return false;
    }
  };

  const rejectRequest = async (id: string, reason?: string): Promise<boolean> => {
    try {
      const updated = await rejectOvertimeRequest(id, {
        reviewer_name: reviewerName,
        reviewer_employee_id: reviewerEmployeeId,
        rejected_reason: reason,
      });
      setRequests((prev) => prev.map((r) => (r.id === id ? updated : r)));
      toast({ title: t('messages.success'), description: t('hk.overtime.rejectSuccess') });
      return true;
    } catch (error: unknown) {
      console.error('Error rejecting overtime request:', error);
      toast({
        title: t('messages.error'),
        description: t('hk.overtime.updateError'),
        variant: 'destructive',
      });
      return false;
    }
  };

  const deleteRequest = async (id: string): Promise<boolean> => {
    try {
      await deleteOvertimeRequest(id);
      setRequests((prev) => prev.filter((r) => r.id !== id));
      toast({ title: t('messages.success'), description: t('hk.overtime.deleteSuccess') });
      return true;
    } catch (error: unknown) {
      console.error('Error deleting overtime request:', error);
      toast({
        title: t('messages.error'),
        description: t('hk.overtime.deleteError'),
        variant: 'destructive',
      });
      return false;
    }
  };

  return { requests, isLoading, fetchRequests, createRequest, approveRequest, rejectRequest, deleteRequest };
}
