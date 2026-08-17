/**
 * @CODE-MEMORY
 * Screen:     Attendance → Quản lý đơn → Đề nghị đi công tác (BusinessTripRequestTab)
 * UC:         FR-HRM-AT · ATT-C4 trip · matrix #22
 * SRS:        docs/hrm/SRS.md · chấm công / đơn công tác
 * Purpose:    Hook list + create/approve/reject/delete đơn công tác qua Nest business-trip-requests;
 *             toast i18n hk.businessTrip.*; refetch sau mutate.
 * WorkItem:   PO-MFD-M2-ATT-REQUESTS-FE-LOADING-01
 * Coded:      2026-08-04
 * Callers:    BusinessTripRequestTab.tsx → useBusinessTripRequests()
 * Callees:    listBusinessTripRequests, createBusinessTripRequest, approve/reject/deleteBusinessTripRequest
 * must_keep:  create/approve/reject contracts; U65 no seed; OT hook untouched
 * SOLID:      Một hook sở hữu fetch + mutate; không helper i18n không ổn định trong deps
 * LastVerified: docs/qa/evidence/po-mfd-m2-att-requests-fe-loading-01.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-04 PO-MFD-M2-ATT-REQUESTS-FE-LOADING-01
 * change_mode: FIX
 * What: Bỏ helper `h` tái tạo mỗi render khỏi deps useCallback; dùng trực tiếp t('hk.businessTrip.*')
 * Why: fetchRequests đổi identity → useEffect storm GET business-trip-requests → isLoading mãi → CTA không mount
 * must_keep: create/approve/reject/delete trip contracts; OT + update tabs LIVE; U65 no seed
 */
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import {
  approveBusinessTripRequest,
  createBusinessTripRequest,
  deleteBusinessTripRequest,
  listBusinessTripRequests,
  rejectBusinessTripRequest,
} from '@/integrations/hrmApi';

export interface BusinessTripRequest {
  id: string; company_id: string; employee_id: string; employee_code: string; employee_name: string;
  department: string | null; position: string | null; destination: string; start_date: string; end_date: string;
  total_days: number; purpose: string; transportation: string | null; accommodation: string | null;
  estimated_cost: number | null; advance_amount: number | null; companions: string | null;
  contact_info: string | null; approver_id: string | null; approver_name: string | null; status: string;
  approved_at: string | null; rejected_reason: string | null; actual_cost: number | null;
  expense_report_url: string | null; notes: string | null; created_at: string; updated_at: string;
}

export interface BusinessTripRequestFormData {
  employee_id: string; employee_code: string; employee_name: string; department?: string; position?: string;
  destination: string; start_date: string; end_date: string; total_days: number; purpose: string;
  transportation?: string; accommodation?: string; estimated_cost?: number; advance_amount?: number;
  companions?: string; contact_info?: string; approver_name?: string;
}

export function useBusinessTripRequests() {
  const { currentCompanyId, profile, memberships } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [requests, setRequests] = useState<BusinessTripRequest[]>([]);
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
      const result = await listBusinessTripRequests({ company_id: currentCompanyId });
      setRequests(result.data || []);
    } catch (error: unknown) {
      console.error('Error fetching business trip requests:', error);
      toast({
        title: t('messages.error'),
        description: t('hk.businessTrip.fetchError'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentCompanyId, toast, t]);

  useEffect(() => {
    void fetchRequests();
  }, [fetchRequests]);

  const createRequest = async (data: BusinessTripRequestFormData): Promise<BusinessTripRequest | null> => {
    if (!currentCompanyId) return null;
    try {
      const newRequest = await createBusinessTripRequest({ company_id: currentCompanyId, ...data });
      setRequests((prev) => [newRequest, ...prev]);
      toast({ title: t('messages.success'), description: t('hk.businessTrip.createSuccess') });
      return newRequest;
    } catch (error: unknown) {
      console.error('Error creating business trip request:', error);
      toast({
        title: t('messages.error'),
        description: t('hk.businessTrip.createError'),
        variant: 'destructive',
      });
      return null;
    }
  };

  const approveRequest = async (id: string): Promise<boolean> => {
    try {
      const updated = await approveBusinessTripRequest(id, {
        reviewer_name: reviewerName,
        reviewer_employee_id: reviewerEmployeeId,
      });
      setRequests((prev) => prev.map((r) => (r.id === id ? updated : r)));
      toast({ title: t('messages.success'), description: t('hk.businessTrip.approveSuccess') });
      return true;
    } catch (error: unknown) {
      console.error('Error approving business trip request:', error);
      toast({
        title: t('messages.error'),
        description: t('hk.businessTrip.updateError'),
        variant: 'destructive',
      });
      return false;
    }
  };

  const rejectRequest = async (id: string, reason?: string): Promise<boolean> => {
    try {
      const updated = await rejectBusinessTripRequest(id, {
        reviewer_name: reviewerName,
        reviewer_employee_id: reviewerEmployeeId,
        rejected_reason: reason,
      });
      setRequests((prev) => prev.map((r) => (r.id === id ? updated : r)));
      toast({ title: t('messages.success'), description: t('hk.businessTrip.rejectSuccess') });
      return true;
    } catch (error: unknown) {
      console.error('Error rejecting business trip request:', error);
      toast({
        title: t('messages.error'),
        description: t('hk.businessTrip.updateError'),
        variant: 'destructive',
      });
      return false;
    }
  };

  const deleteRequest = async (id: string): Promise<boolean> => {
    try {
      await deleteBusinessTripRequest(id);
      setRequests((prev) => prev.filter((r) => r.id !== id));
      toast({ title: t('messages.success'), description: t('hk.businessTrip.deleteSuccess') });
      return true;
    } catch (error: unknown) {
      console.error('Error deleting business trip request:', error);
      toast({
        title: t('messages.error'),
        description: t('hk.businessTrip.deleteError'),
        variant: 'destructive',
      });
      return false;
    }
  };

  return { requests, isLoading, fetchRequests, createRequest, approveRequest, rejectRequest, deleteRequest };
}
