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
  const h = (key: string): string => t(`hk.businessTrip.${key}`) as string;
  const [requests, setRequests] = useState<BusinessTripRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const reviewerName = profile?.full_name?.trim() || 'Web HRM';
  const reviewerEmployeeId = useMemo(
    () => memberships.find((m) => m.company_id === currentCompanyId)?.employee_id ?? undefined,
    [memberships, currentCompanyId],
  );

  const fetchRequests = useCallback(async () => {
    if (!currentCompanyId) return;
    setIsLoading(true);
    try {
      const result = await listBusinessTripRequests({ company_id: currentCompanyId });
      setRequests(result.data || []);
    } catch (error: unknown) {
      console.error('Error fetching business trip requests:', error);
      toast({ title: t('messages.error'), description: h('fetchError'), variant: 'destructive' });
    } finally { setIsLoading(false); }
  }, [currentCompanyId, toast, t, h]);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  const createRequest = async (data: BusinessTripRequestFormData): Promise<BusinessTripRequest | null> => {
    if (!currentCompanyId) return null;
    try {
      const newRequest = await createBusinessTripRequest({ company_id: currentCompanyId, ...data });
      setRequests(prev => [newRequest, ...prev]);
      toast({ title: t('messages.success'), description: h('createSuccess') }); return newRequest;
    } catch (error: unknown) {
      console.error('Error creating business trip request:', error);
      toast({ title: t('messages.error'), description: h('createError'), variant: 'destructive' }); return null;
    }
  };

  const approveRequest = async (id: string): Promise<boolean> => {
    try {
      const updated = await approveBusinessTripRequest(id, {
        reviewer_name: reviewerName,
        reviewer_employee_id: reviewerEmployeeId,
      });
      setRequests(prev => prev.map(r => r.id === id ? updated : r));
      toast({ title: t('messages.success'), description: h('approveSuccess') });
      return true;
    } catch (error: unknown) {
      console.error('Error approving business trip request:', error);
      toast({ title: t('messages.error'), description: h('updateError'), variant: 'destructive' });
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
      setRequests(prev => prev.map(r => r.id === id ? updated : r));
      toast({ title: t('messages.success'), description: h('rejectSuccess') });
      return true;
    } catch (error: unknown) {
      console.error('Error rejecting business trip request:', error);
      toast({ title: t('messages.error'), description: h('updateError'), variant: 'destructive' });
      return false;
    }
  };

  const deleteRequest = async (id: string): Promise<boolean> => {
    try {
      await deleteBusinessTripRequest(id);
      setRequests(prev => prev.filter(r => r.id !== id));
      toast({ title: t('messages.success'), description: h('deleteSuccess') }); return true;
    } catch (error: unknown) {
      console.error('Error deleting business trip request:', error);
      toast({ title: t('messages.error'), description: h('deleteError'), variant: 'destructive' }); return false;
    }
  };

  return { requests, isLoading, fetchRequests, createRequest, approveRequest, rejectRequest, deleteRequest };
}
