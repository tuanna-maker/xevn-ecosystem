import { useState, useEffect, useCallback, useMemo } from 'react';

import { useTranslation } from 'react-i18next';

import { useAuth } from '@/contexts/AuthContext';

import { useToast } from '@/hooks/use-toast';

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

  const h = (key: string): string => t(`hk.shiftChange.${key}`) as string;

  const [requests, setRequests] = useState<ShiftChangeRequest[]>([]);

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

      const result = await listShiftChangeRequests({ company_id: currentCompanyId });

      setRequests(result.data || []);

    } catch (error: unknown) {

      console.error('Error fetching shift change requests:', error);

      toast({ title: t('messages.error'), description: h('fetchError'), variant: 'destructive' });

    } finally { setIsLoading(false); }

  }, [currentCompanyId, toast, t, h]);



  useEffect(() => { fetchRequests(); }, [fetchRequests]);



  const createRequest = async (data: ShiftChangeRequestFormData): Promise<ShiftChangeRequest | null> => {

    if (!currentCompanyId) return null;

    try {

      const newRequest = await createShiftChangeRequest({ company_id: currentCompanyId, ...data });

      setRequests(prev => [newRequest, ...prev]);

      toast({ title: t('messages.success'), description: h('createSuccess') });

      return newRequest;

    } catch (error: unknown) {

      console.error('Error creating shift change request:', error);

      toast({ title: t('messages.error'), description: h('createError'), variant: 'destructive' }); return null;

    }

  };



  const updateRequest = async (id: string, data: Partial<ShiftChangeRequest>): Promise<boolean> => {

    setRequests(prev => prev.map(r => r.id === id ? { ...r, ...data } : r));

    return true;

  };



  const approveRequest = async (id: string): Promise<boolean> => {

    try {

      const updated = await approveShiftChangeRequest(id, {

        reviewer_name: reviewerName,

        reviewer_employee_id: reviewerEmployeeId,

      });

      setRequests(prev => prev.map(r => r.id === id ? updated : r));

      toast({ title: t('messages.success'), description: h('approveSuccess') });

      return true;

    } catch (error: unknown) {

      console.error('Error approving shift change request:', error);

      toast({ title: t('messages.error'), description: h('updateError'), variant: 'destructive' });

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

      setRequests(prev => prev.map(r => r.id === id ? updated : r));

      toast({ title: t('messages.success'), description: h('rejectSuccess') });

      return true;

    } catch (error: unknown) {

      console.error('Error rejecting shift change request:', error);

      toast({ title: t('messages.error'), description: h('updateError'), variant: 'destructive' });

      return false;

    }

  };



  const deleteRequest = async (id: string): Promise<boolean> => {

    try {

      await deleteShiftChangeRequest(id);

      setRequests(prev => prev.filter(r => r.id !== id));

      toast({ title: t('messages.success'), description: h('deleteSuccess') }); return true;

    } catch (error: unknown) {

      console.error('Error deleting shift change request:', error);

      toast({ title: t('messages.error'), description: h('deleteError'), variant: 'destructive' }); return false;

    }

  };



  return { requests, isLoading, fetchRequests, createRequest, updateRequest, approveRequest, rejectRequest, deleteRequest };

}


