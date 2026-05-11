import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

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
  const { currentCompanyId } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const h = (key: string): string => t(`hk.businessTrip.${key}`) as string;
  const [requests, setRequests] = useState<BusinessTripRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRequests = useCallback(async () => {
    if (!currentCompanyId) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase.from('business_trip_requests').select('*').eq('company_id', currentCompanyId).order('created_at', { ascending: false });
      if (error) throw error; setRequests(data || []);
    } catch (error: any) {
      toast({ title: t('messages.error'), description: h('fetchError'), variant: 'destructive' });
    } finally { setIsLoading(false); }
  }, [currentCompanyId, toast, t]);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  const createRequest = async (data: BusinessTripRequestFormData): Promise<BusinessTripRequest | null> => {
    if (!currentCompanyId) return null;
    try {
      const { data: newRequest, error } = await supabase.from('business_trip_requests').insert({ company_id: currentCompanyId, ...data }).select().single();
      if (error) throw error;
      setRequests(prev => [newRequest, ...prev]);
      toast({ title: t('messages.success'), description: h('createSuccess') }); return newRequest;
    } catch (error: any) {
      toast({ title: t('messages.error'), description: h('createError'), variant: 'destructive' }); return null;
    }
  };

  const updateRequest = async (id: string, data: Partial<BusinessTripRequest>): Promise<boolean> => {
    try {
      const { error } = await supabase.from('business_trip_requests').update(data).eq('id', id);
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
      const { error } = await supabase.from('business_trip_requests').delete().eq('id', id);
      if (error) throw error;
      setRequests(prev => prev.filter(r => r.id !== id));
      toast({ title: t('messages.success'), description: h('deleteSuccess') }); return true;
    } catch (error: any) {
      toast({ title: t('messages.error'), description: h('deleteError'), variant: 'destructive' }); return false;
    }
  };

  return { requests, isLoading, fetchRequests, createRequest, updateRequest, approveRequest, rejectRequest, deleteRequest };
}
