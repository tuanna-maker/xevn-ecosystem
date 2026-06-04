import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface LeaveRequest {
  id: string; company_id: string; employee_id: string; employee_code: string; employee_name: string;
  department: string | null; position: string | null; leave_type: string; start_date: string; end_date: string;
  total_days: number; reason: string | null; handover_to: string | null; handover_tasks: string | null;
  approver_id: string | null; approver_name: string | null; status: string; approved_at: string | null;
  rejected_reason: string | null; attachment_url: string | null; notes: string | null;
  created_at: string; updated_at: string;
}

export interface LeaveRequestFormData {
  employee_id: string; employee_code: string; employee_name: string; department?: string; position?: string;
  leave_type: string; start_date: string; end_date: string; total_days: number; reason?: string;
  handover_to?: string; handover_tasks?: string; approver_name?: string;
}

export function useLeaveRequests() {
  const { currentCompanyId } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const h = (key: string): string => t(`hk.leave.${key}`) as string;
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRequests = useCallback(async () => {
    if (!currentCompanyId) return;
    setIsLoading(true);
    try {
      setRequests(data || []);
    } catch (error: any) {
      console.error('Error fetching leave requests:', error);
      toast({ title: t('messages.error'), description: h('fetchError'), variant: 'destructive' });
    } finally { setIsLoading(false); }
  }, [currentCompanyId, toast, t]);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  const createRequest = async (data: LeaveRequestFormData): Promise<LeaveRequest | null> => {
    if (!currentCompanyId) return null;
    try {
      setRequests(prev => [newRequest, ...prev]);
      toast({ title: t('messages.success'), description: h('createSuccess') }); return newRequest;
    } catch (error: any) {
      console.error('Error creating leave request:', error);
      toast({ title: t('messages.error'), description: h('createError'), variant: 'destructive' }); return null;
    }
  };

  const updateRequest = async (id: string, data: Partial<LeaveRequest>): Promise<boolean> => {
    try {
      setRequests(prev => prev.map(r => r.id === id ? { ...r, ...data } : r)); return true;
    } catch (error: any) {
      console.error('Error updating leave request:', error);
      toast({ title: t('messages.error'), description: h('updateError'), variant: 'destructive' }); return false;
    }
  };

  const approveRequest = async (id: string): Promise<boolean> => {
    return updateRequest(id, { status: 'approved', approved_at: new Date().toISOString() });
  };

  const rejectRequest = async (id: string, reason?: string): Promise<boolean> => {
    return updateRequest(id, { status: 'rejected', rejected_reason: reason });
  };

  const deleteRequest = async (id: string): Promise<boolean> => {
    try {
      setRequests(prev => prev.filter(r => r.id !== id));
      toast({ title: t('messages.success'), description: h('deleteSuccess') }); return true;
    } catch (error: any) {
      console.error('Error deleting leave request:', error);
      toast({ title: t('messages.error'), description: h('deleteError'), variant: 'destructive' }); return false;
    }
  };

  return { requests, isLoading, fetchRequests, createRequest, updateRequest, approveRequest, rejectRequest, deleteRequest };
}
