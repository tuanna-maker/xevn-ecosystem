/**
 * @CODE-MEMORY
 * Screen:     Attendance → Quản lý đơn → Đăng ký đi muộn, về sớm (LateEarlyRequestTab)
 * UC:         FR-HRM-AT · ATT-C4 late-early · matrix #20
 * SRS:        docs/hrm/SRS.md · chấm công / đơn đi muộn về sớm
 * Purpose:    Hook list + create/approve/reject/delete đơn đi muộn/về sớm qua Nest late-early-requests;
 *             toast i18n hk.lateEarly.*; refetch sau mutate.
 * WorkItem:   PO-MFD-M2-ATT-REQUESTS-FE-LOADING-01
 * Coded:      2026-08-04
 * Callers:    LateEarlyRequestTab.tsx → useLateEarlyRequests()
 * Callees:    listLateEarlyRequests, createLateEarlyRequest, approve/reject/deleteLateEarlyRequest
 * must_keep:  create/approve/reject contracts; U65 no seed; OT hook untouched
 * SOLID:      Một hook sở hữu fetch + mutate; không helper i18n không ổn định trong deps
 * LastVerified: docs/qa/evidence/po-mfd-m2-att-requests-fe-loading-01.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-04 PO-MFD-M2-ATT-REQUESTS-FE-LOADING-01
 * change_mode: FIX
 * What: Bỏ helper `h` tái tạo mỗi render khỏi deps useCallback; dùng trực tiếp t('hk.lateEarly.*')
 * Why: fetchRequests đổi identity → useEffect storm GET late-early-requests → isLoading mãi → CTA không mount
 * must_keep: create/approve/reject/delete late-early contracts; OT + update tabs LIVE; U65 no seed
 */
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import {
  approveLateEarlyRequest,
  createLateEarlyRequest,
  deleteLateEarlyRequest,
  listLateEarlyRequests,
  rejectLateEarlyRequest,
} from '@/integrations/hrmApi';

export interface LateEarlyRequest {
  id: string; company_id: string; employee_id: string; employee_code: string; employee_name: string;
  department: string | null; position: string | null; request_date: string; request_type: string;
  late_time: string | null; late_minutes: number | null; early_time: string | null; early_minutes: number | null;
  reason: string; approver_id: string | null; approver_name: string | null; status: string;
  approved_at: string | null; rejected_reason: string | null; notes: string | null;
  created_at: string; updated_at: string;
}

export interface LateEarlyRequestFormData {
  employee_id: string; employee_code: string; employee_name: string; department?: string; position?: string;
  request_date: string; request_type: string; late_time?: string; late_minutes?: number;
  early_time?: string; early_minutes?: number; reason: string; approver_name?: string;
}

export function useLateEarlyRequests() {
  const { currentCompanyId, profile, memberships } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [requests, setRequests] = useState<LateEarlyRequest[]>([]);
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
      const result = await listLateEarlyRequests({ company_id: currentCompanyId });
      setRequests(result.data || []);
    } catch (error: unknown) {
      console.error('Error fetching late/early requests:', error);
      toast({
        title: t('messages.error'),
        description: t('hk.lateEarly.fetchError'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentCompanyId, toast, t]);

  useEffect(() => {
    void fetchRequests();
  }, [fetchRequests]);

  const createRequest = async (data: LateEarlyRequestFormData): Promise<LateEarlyRequest | null> => {
    if (!currentCompanyId) return null;
    try {
      const newRequest = await createLateEarlyRequest({ company_id: currentCompanyId, ...data });
      setRequests((prev) => [newRequest, ...prev]);
      toast({ title: t('messages.success'), description: t('hk.lateEarly.createSuccess') });
      return newRequest;
    } catch (error: unknown) {
      console.error('Error creating late/early request:', error);
      toast({
        title: t('messages.error'),
        description: t('hk.lateEarly.createError'),
        variant: 'destructive',
      });
      return null;
    }
  };

  const approveRequest = async (id: string): Promise<boolean> => {
    try {
      const updated = await approveLateEarlyRequest(id, {
        reviewer_name: reviewerName,
        reviewer_employee_id: reviewerEmployeeId,
      });
      setRequests((prev) => prev.map((r) => (r.id === id ? updated : r)));
      toast({ title: t('messages.success'), description: t('hk.lateEarly.approveSuccess') });
      return true;
    } catch (error: unknown) {
      console.error('Error approving late/early request:', error);
      toast({
        title: t('messages.error'),
        description: t('hk.lateEarly.updateError'),
        variant: 'destructive',
      });
      return false;
    }
  };

  const rejectRequest = async (id: string, reason?: string): Promise<boolean> => {
    try {
      const updated = await rejectLateEarlyRequest(id, {
        reviewer_name: reviewerName,
        reviewer_employee_id: reviewerEmployeeId,
        rejected_reason: reason,
      });
      setRequests((prev) => prev.map((r) => (r.id === id ? updated : r)));
      toast({ title: t('messages.success'), description: t('hk.lateEarly.rejectSuccess') });
      return true;
    } catch (error: unknown) {
      console.error('Error rejecting late/early request:', error);
      toast({
        title: t('messages.error'),
        description: t('hk.lateEarly.updateError'),
        variant: 'destructive',
      });
      return false;
    }
  };

  const deleteRequest = async (id: string): Promise<boolean> => {
    try {
      await deleteLateEarlyRequest(id);
      setRequests((prev) => prev.filter((r) => r.id !== id));
      toast({ title: t('messages.success'), description: t('hk.lateEarly.deleteSuccess') });
      return true;
    } catch (error: unknown) {
      console.error('Error deleting late/early request:', error);
      toast({
        title: t('messages.error'),
        description: t('hk.lateEarly.deleteError'),
        variant: 'destructive',
      });
      return false;
    }
  };

  return { requests, isLoading, fetchRequests, createRequest, approveRequest, rejectRequest, deleteRequest };
}
