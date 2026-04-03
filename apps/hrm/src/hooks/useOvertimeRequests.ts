import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

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
  const { currentCompanyId } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const h = (key: string): string => t(`hk.overtime.${key}`) as string;
  const [requests, setRequests] = useState<OvertimeRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRequests = useCallback(async () => {
    if (!currentCompanyId) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase.from('overtime_requests').select('*').eq('company_id', currentCompanyId).order('created_at', { ascending: false });
      if (error) throw error;
      setRequests(data || []);
    } catch (error: any) {
      console.error('Error fetching overtime requests:', error);
      toast({ title: t('messages.error'), description: h('fetchError'), variant: 'destructive' });
    } finally { setIsLoading(false); }
  }, [currentCompanyId, toast, t]);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  const createRequest = async (data: OvertimeRequestFormData): Promise<OvertimeRequest | null> => {
    if (!currentCompanyId) return null;
    try {
      const { data: newRequest, error } = await supabase.from('overtime_requests').insert({ company_id: currentCompanyId, ...data }).select().single();
      if (error) throw error;
      setRequests(prev => [newRequest, ...prev]);
      toast({ title: t('messages.success'), description: h('createSuccess') });
      return newRequest;
    } catch (error: any) {
      console.error('Error creating overtime request:', error);
      toast({ title: t('messages.error'), description: h('createError'), variant: 'destructive' }); return null;
    }
  };

  const updateRequest = async (id: string, data: Partial<OvertimeRequest>): Promise<boolean> => {
    try {
      const { error } = await supabase.from('overtime_requests').update(data).eq('id', id);
      if (error) throw error;
      setRequests(prev => prev.map(r => r.id === id ? { ...r, ...data } : r)); return true;
    } catch (error: any) {
      console.error('Error updating overtime request:', error);
      toast({ title: t('messages.error'), description: h('updateError'), variant: 'destructive' }); return false;
    }
  };

  const approveRequest = async (id: string): Promise<boolean> => {
    const success = await updateRequest(id, { status: 'approved', approved_at: new Date().toISOString() });
    if (success) toast({ title: t('messages.success'), description: h('approveSuccess') });
    return success;
  };

  const rejectRequest = async (id: string, reason?: string): Promise<boolean> => {
    const success = await updateRequest(id, { status: 'rejected', rejected_reason: reason });
    if (success) toast({ title: t('messages.success'), description: h('rejectSuccess') });
    return success;
  };

  const deleteRequest = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase.from('overtime_requests').delete().eq('id', id);
      if (error) throw error;
      setRequests(prev => prev.filter(r => r.id !== id));
      toast({ title: t('messages.success'), description: h('deleteSuccess') }); return true;
    } catch (error: any) {
      console.error('Error deleting overtime request:', error);
      toast({ title: t('messages.error'), description: h('deleteError'), variant: 'destructive' }); return false;
    }
  };

  return { requests, isLoading, fetchRequests, createRequest, updateRequest, approveRequest, rejectRequest, deleteRequest };
}
