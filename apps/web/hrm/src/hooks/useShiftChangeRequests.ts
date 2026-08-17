/**
 * @CODE-MEMORY
 * Screen:     Attendance → Quản lý đơn → Đề nghị đổi ca (ShiftChangeRequestTab)
 * UC:         FR-HRM-AT · ATT-C4 shift-change · matrix #24
 * SRS:        docs/hrm/SRS.md · chấm công / đơn đổi ca
 * Purpose:    Hook list + create/approve/reject/delete đơn đổi ca qua Nest shift-change-requests;
 *             toast i18n hk.shiftChange.*; refetch sau mutate.
 * WorkItem:   PO-MFD-M2-ATT-REQUESTS-FE-LOADING-01
 * Coded:      2026-08-04
 * Callers:    ShiftChangeRequestTab.tsx → useShiftChangeRequests()
 * Callees:    listShiftChangeRequests, createShiftChangeRequest, approve/reject/deleteShiftChangeRequest
 * must_keep:  create/approve/reject contracts; local updateRequest helper; U65 no seed; OT hook untouched
 * SOLID:      Một hook sở hữu fetch + mutate; không helper i18n không ổn định trong deps
 * LastVerified: docs/qa/evidence/po-mfd-m2-att-requests-fe-loading-01.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-04 PO-MFD-M2-ATT-REQUESTS-FE-LOADING-01
 * change_mode: FIX
 * What: Bỏ helper `h` tái tạo mỗi render khỏi deps useCallback; dùng trực tiếp t('hk.shiftChange.*')
 * Why: fetchRequests đổi identity → useEffect storm GET shift-change-requests → isLoading mãi → CTA không mount
 * must_keep: create/approve/reject/delete shift-change contracts; updateRequest local; OT + update LIVE; U65 no seed
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-ATT-01-CLUSTER-FE-01
 * change_mode: UPGRADE
 * What: Surface HRM-ATT-SHIFT-KEY via toErrorMessage on create; Nest /core 0 · U65 no seed.
 * Why: UC-BP-ATT-01 · F-ATT-SHIFT-CNS-01 · AC-ATT-01-INVENT-BAN · J-HRM-ATT-01-04
 * must_keep: mutate wires; ATT-11/10/09/08/02/PLT/CORE seals; ≠ ATT-01 DONE from CNS alone
 * LastVerified: docs/qa/evidence/po-hrm-mvp-gd1-att-01-cluster-fe-01.md
 */
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { toErrorMessage } from '@/lib/apiError';
import {
  approveShiftChangeRequest,
  createShiftChangeRequest,
  deleteShiftChangeRequest,
  listShiftChangeRequests,
  rejectShiftChangeRequest,
} from '@/integrations/hrmApi';

export interface ShiftChangeRequest {
  id: string; company_id: string; employee_id: string; employee_code: string; employee_name: string;
  department: string | null; position: string | null; change_date: string; change_type: string;
  current_shift: string; current_shift_time: string | null; requested_shift: string;
  requested_shift_time: string | null; swap_with_employee_id: string | null;
  swap_with_employee_name: string | null; swap_with_employee_code: string | null; reason: string;
  approver_id: string | null; approver_name: string | null; status: string; approved_at: string | null;
  rejected_reason: string | null; notes: string | null; created_at: string; updated_at: string;
}

export interface ShiftChangeRequestFormData {
  employee_id: string; employee_code: string; employee_name: string; department?: string; position?: string;
  change_date: string; change_type: string; current_shift: string; current_shift_time?: string;
  requested_shift: string; requested_shift_time?: string; swap_with_employee_id?: string;
  swap_with_employee_name?: string; swap_with_employee_code?: string; reason: string; approver_name?: string;
}

export function useShiftChangeRequests() {
  const { currentCompanyId, profile, memberships } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [requests, setRequests] = useState<ShiftChangeRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const reviewerName = profile?.full_name?.trim() || 'Web HRM';
  const reviewerEmployeeId = useMemo(
    () => memberships.find((m) => m.company_id === currentCompanyId)?.employee_id ?? undefined,
    [memberships, currentCompanyId],
  );

  const fetchRequests = useCallback(async () => {
    if (!currentCompanyId) {
      setRequests([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const result = await listShiftChangeRequests({ company_id: currentCompanyId });
      setRequests(result.data || []);
    } catch (error: unknown) {
      console.error('Error fetching shift change requests:', error);
      toast({
        title: t('messages.error'),
        description: t('hk.shiftChange.fetchError'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentCompanyId, toast, t]);

  useEffect(() => {
    void fetchRequests();
  }, [fetchRequests]);

  const createRequest = async (data: ShiftChangeRequestFormData): Promise<ShiftChangeRequest | null> => {
    if (!currentCompanyId) return null;
    try {
      const newRequest = await createShiftChangeRequest({ company_id: currentCompanyId, ...data });
      setRequests((prev) => [newRequest, ...prev]);
      toast({ title: t('messages.success'), description: t('hk.shiftChange.createSuccess') });
      return newRequest;
    } catch (error: unknown) {
      console.error('Error creating shift change request:', error);
      toast({
        title: t('messages.error'),
        description: toErrorMessage(error, t('hk.shiftChange.createError')),
        variant: 'destructive',
      });
      return null;
    }
  };

  const updateRequest = async (id: string, data: Partial<ShiftChangeRequest>): Promise<boolean> => {
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, ...data } : r)));
    return true;
  };

  const approveRequest = async (id: string): Promise<boolean> => {
    try {
      const updated = await approveShiftChangeRequest(id, {
        reviewer_name: reviewerName,
        reviewer_employee_id: reviewerEmployeeId,
      });
      setRequests((prev) => prev.map((r) => (r.id === id ? updated : r)));
      toast({ title: t('messages.success'), description: t('hk.shiftChange.approveSuccess') });
      return true;
    } catch (error: unknown) {
      console.error('Error approving shift change request:', error);
      toast({
        title: t('messages.error'),
        description: t('hk.shiftChange.updateError'),
        variant: 'destructive',
      });
      return false;
    }
  };

  const rejectRequest = async (id: string, reason?: string): Promise<boolean> => {
    try {
      const updated = await rejectShiftChangeRequest(id, {
        reviewer_name: reviewerName,
        reviewer_employee_id: reviewerEmployeeId,
        rejected_reason: reason,
      });
      setRequests((prev) => prev.map((r) => (r.id === id ? updated : r)));
      toast({ title: t('messages.success'), description: t('hk.shiftChange.rejectSuccess') });
      return true;
    } catch (error: unknown) {
      console.error('Error rejecting shift change request:', error);
      toast({
        title: t('messages.error'),
        description: t('hk.shiftChange.updateError'),
        variant: 'destructive',
      });
      return false;
    }
  };

  const deleteRequest = async (id: string): Promise<boolean> => {
    try {
      await deleteShiftChangeRequest(id);
      setRequests((prev) => prev.filter((r) => r.id !== id));
      toast({ title: t('messages.success'), description: t('hk.shiftChange.deleteSuccess') });
      return true;
    } catch (error: unknown) {
      console.error('Error deleting shift change request:', error);
      toast({
        title: t('messages.error'),
        description: t('hk.shiftChange.deleteError'),
        variant: 'destructive',
      });
      return false;
    }
  };

  return {
    requests,
    isLoading,
    fetchRequests,
    createRequest,
    updateRequest,
    approveRequest,
    rejectRequest,
    deleteRequest,
  };
}
