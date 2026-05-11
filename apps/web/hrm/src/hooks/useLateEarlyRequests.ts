import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

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
  const { currentCompanyId } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const h = (key: string): string => t(`hk.lateEarly.${key}`) as string;
  const [requests, setRequests] = useState<LateEarlyRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRequests = useCallback(async () => {
    if (!currentCompanyId) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase.from('late_early_requests').select('*').eq('company_id', currentCompanyId).order('created_at', { ascending: false });
      if (error) throw error; setRequests(data || []);
    } catch (error: any) {
      console.error('Error fetching late/early requests:', error);
      toast({ title: t('messages.error'), description: h('fetchError'), variant: 'destructive' });
    } finally { setIsLoading(false); }
  }, [currentCompanyId, toast, t]);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  const createRequest = async (data: LateEarlyRequestFormData): Promise<LateEarlyRequest | null> => {
    if (!currentCompanyId) return null;
    try {
      const { data: newRequest, error } = await supabase.from('late_early_requests').insert({ company_id: currentCompanyId, ...data }).select().single();
      if (error) throw error;
      setRequests(prev => [newRequest, ...prev]);
      toast({ title: t('messages.success'), description: h('createSuccess') }); return newRequest;
    } catch (error: any) {
      toast({ title: t('messages.error'), description: h('createError'), variant: 'destructive' }); return null;
    }
  };

  const updateRequest = async (id: string, data: Partial<LateEarlyRequest>): Promise<boolean> => {
    try {
      const { error } = await supabase.from('late_early_requests').update(data).eq('id', id);
      if (error) throw error;
      setRequests(prev => prev.map(r => r.id === id ? { ...r, ...data } : r)); return true;
    } catch (error: any) {
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
      const { error } = await supabase.from('late_early_requests').delete().eq('id', id);
      if (error) throw error;
      setRequests(prev => prev.filter(r => r.id !== id));
      toast({ title: t('messages.success'), description: h('deleteSuccess') }); return true;
    } catch (error: any) {
      toast({ title: t('messages.error'), description: h('deleteError'), variant: 'destructive' }); return false;
    }
  };

  return { requests, isLoading, fetchRequests, createRequest, updateRequest, approveRequest, rejectRequest, deleteRequest };
}
