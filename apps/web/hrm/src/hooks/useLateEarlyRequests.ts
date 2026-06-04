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
  const h = (key: string): string => t(`hk.lateEarly.${key}`) as string;
  const [requests, setRequests] = useState<LateEarlyRequest[]>([]);
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
      const result = await listLateEarlyRequests({ company_id: currentCompanyId });
      setRequests(result.data || []);
    } catch (error: unknown) {
      console.error('Error fetching late/early requests:', error);
      toast({ title: t('messages.error'), description: h('fetchError'), variant: 'destructive' });
    } finally { setIsLoading(false); }
  }, [currentCompanyId, toast, t, h]);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  const createRequest = async (data: LateEarlyRequestFormData): Promise<LateEarlyRequest | null> => {
    if (!currentCompanyId) return null;
    try {
      const newRequest = await createLateEarlyRequest({ company_id: currentCompanyId, ...data });
      setRequests(prev => [newRequest, ...prev]);
      toast({ title: t('messages.success'), description: h('createSuccess') }); return newRequest;
    } catch (error: unknown) {
      console.error('Error creating late/early request:', error);
      toast({ title: t('messages.error'), description: h('createError'), variant: 'destructive' }); return null;
    }
  };

  const approveRequest = async (id: string): Promise<boolean> => {
    try {
      const updated = await approveLateEarlyRequest(id, {
        reviewer_name: reviewerName,
        reviewer_employee_id: reviewerEmployeeId,
      });
      setRequests(prev => prev.map(r => r.id === id ? updated : r));
      toast({ title: t('messages.success'), description: h('approveSuccess') });
      return true;
    } catch (error: unknown) {
      console.error('Error approving late/early request:', error);
      toast({ title: t('messages.error'), description: h('updateError'), variant: 'destructive' });
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
      setRequests(prev => prev.map(r => r.id === id ? updated : r));
      toast({ title: t('messages.success'), description: h('rejectSuccess') });
      return true;
    } catch (error: unknown) {
      console.error('Error rejecting late/early request:', error);
      toast({ title: t('messages.error'), description: h('updateError'), variant: 'destructive' });
      return false;
    }
  };

  const deleteRequest = async (id: string): Promise<boolean> => {
    try {
      await deleteLateEarlyRequest(id);
      setRequests(prev => prev.filter(r => r.id !== id));
      toast({ title: t('messages.success'), description: h('deleteSuccess') }); return true;
    } catch (error: unknown) {
      console.error('Error deleting late/early request:', error);
      toast({ title: t('messages.error'), description: h('deleteError'), variant: 'destructive' }); return false;
    }
  };

  return { requests, isLoading, fetchRequests, createRequest, approveRequest, rejectRequest, deleteRequest };
}
