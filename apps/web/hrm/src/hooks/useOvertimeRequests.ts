import { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import {
  approveOvertimeRequest,
  createOvertimeRequest,
  deleteOvertimeRequest,
  listOvertimeRequests,
  rejectOvertimeRequest,
} from '@/integrations/hrmApi';

export interface OvertimeRequest {
  id: string; company_id: string; employee_id: string; employee_code: string; employee_name: string;
  department: string | null; position: string | null; overtime_date: string; start_time: string;
  end_time: string; total_hours: number; overtime_type: string; coefficient: number | null;
  reason: string; compensation_type: string | null; approver_id: string | null; approver_name: string | null;
  status: string; approved_at: string | null; rejected_reason: string | null; actual_hours: number | null;
  notes: string | null; created_at: string; updated_at: string;
}

export interface OvertimeRequestFormData {
  employee_id: string; employee_code: string; employee_name: string; department?: string; position?: string;
  overtime_date: string; start_time: string; end_time: string; total_hours: number; overtime_type: string;
  coefficient?: number; reason: string; compensation_type?: string; approver_name?: string;
}

export function useOvertimeRequests() {
  const { currentCompanyId, profile, memberships } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const h = (key: string): string => t(`hk.overtime.${key}`) as string;
  const [requests, setRequests] = useState<OvertimeRequest[]>([]);
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
      const result = await listOvertimeRequests({ company_id: currentCompanyId });
      setRequests(result.data || []);
    } catch (error: unknown) {
      console.error('Error fetching overtime requests:', error);
      toast({ title: t('messages.error'), description: h('fetchError'), variant: 'destructive' });
    } finally { setIsLoading(false); }
  }, [currentCompanyId, toast, t, h]);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  const createRequest = async (data: OvertimeRequestFormData): Promise<OvertimeRequest | null> => {
    if (!currentCompanyId) return null;
    try {
      const newRequest = await createOvertimeRequest({ company_id: currentCompanyId, ...data });
      setRequests(prev => [newRequest, ...prev]);
      toast({ title: t('messages.success'), description: h('createSuccess') });
      return newRequest;
    } catch (error: unknown) {
      console.error('Error creating overtime request:', error);
      toast({ title: t('messages.error'), description: h('createError'), variant: 'destructive' }); return null;
    }
  };

  const approveRequest = async (id: string): Promise<boolean> => {
    try {
      const updated = await approveOvertimeRequest(id, {
        reviewer_name: reviewerName,
        reviewer_employee_id: reviewerEmployeeId,
      });
      setRequests(prev => prev.map(r => r.id === id ? updated : r));
      toast({ title: t('messages.success'), description: h('approveSuccess') });
      return true;
    } catch (error: unknown) {
      console.error('Error approving overtime request:', error);
      toast({ title: t('messages.error'), description: h('updateError'), variant: 'destructive' });
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
      setRequests(prev => prev.map(r => r.id === id ? updated : r));
      toast({ title: t('messages.success'), description: h('rejectSuccess') });
      return true;
    } catch (error: unknown) {
      console.error('Error rejecting overtime request:', error);
      toast({ title: t('messages.error'), description: h('updateError'), variant: 'destructive' });
      return false;
    }
  };

  const deleteRequest = async (id: string): Promise<boolean> => {
    try {
      await deleteOvertimeRequest(id);
      setRequests(prev => prev.filter(r => r.id !== id));
      toast({ title: t('messages.success'), description: h('deleteSuccess') }); return true;
    } catch (error: unknown) {
      console.error('Error deleting overtime request:', error);
      toast({ title: t('messages.error'), description: h('deleteError'), variant: 'destructive' }); return false;
    }
  };

  return { requests, isLoading, fetchRequests, createRequest, approveRequest, rejectRequest, deleteRequest };
}
