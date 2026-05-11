import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import {
  approveAttendanceUpdateRequest,
  createAttendanceUpdateRequest,
  deleteAttendanceUpdateRequest,
  listAttendanceUpdateRequests,
  rejectAttendanceUpdateRequest,
  updateAttendanceUpdateRequest,
} from '@/integrations/hrmApi';

export interface AttendanceUpdateRequest {
  id: string; company_id: string; employee_id: string; employee_code: string; employee_name: string;
  department: string | null; position: string | null; attendance_date: string; update_type: string;
  current_check_in: string | null; current_check_out: string | null; requested_check_in: string | null;
  requested_check_out: string | null; reason: string; evidence_url: string | null;
  approver_id: string | null; approver_name: string | null; status: string; approved_at: string | null;
  rejected_reason: string | null; notes: string | null; created_at: string; updated_at: string;
}

export interface AttendanceUpdateRequestFormData {
  employee_id: string; employee_code: string; employee_name: string; department?: string; position?: string;
  attendance_date: string; update_type: string; current_check_in?: string; current_check_out?: string;
  requested_check_in?: string; requested_check_out?: string; reason: string; evidence_url?: string; approver_name?: string;
}

export function useAttendanceUpdateRequests() {
  const { currentCompanyId } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const h = (key: string): string => t(`hk.attendanceUpdate.${key}`) as string;
  const [requests, setRequests] = useState<AttendanceUpdateRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRequests = useCallback(async () => {
    if (!currentCompanyId) return;
    setIsLoading(true);
    try {
      const result = await listAttendanceUpdateRequests({ company_id: currentCompanyId });
      setRequests(result.data || []);
    } catch (error: unknown) {
      console.error('Error fetching attendance update requests:', error);
      toast({ title: t('messages.error'), description: h('fetchError'), variant: 'destructive' });
    } finally { setIsLoading(false); }
  }, [currentCompanyId, toast, t]);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  const createRequest = async (data: AttendanceUpdateRequestFormData): Promise<AttendanceUpdateRequest | null> => {
    if (!currentCompanyId) return null;
    try {
      const newRequest = await createAttendanceUpdateRequest({ company_id: currentCompanyId, ...data });
      setRequests(prev => [newRequest, ...prev]);
      toast({ title: t('messages.success'), description: h('createSuccess') }); return newRequest;
    } catch (error: unknown) {
      console.error('Error creating attendance update request:', error);
      toast({ title: t('messages.error'), description: h('createError'), variant: 'destructive' }); return null;
    }
  };

  const updateRequest = async (id: string, data: Partial<AttendanceUpdateRequest>): Promise<boolean> => {
    try {
      const updated = await updateAttendanceUpdateRequest(id, data);
      setRequests(prev => prev.map(r => r.id === id ? updated : r)); return true;
    } catch (error: unknown) {
      console.error('Error updating attendance update request:', error);
      toast({ title: t('messages.error'), description: h('updateError'), variant: 'destructive' }); return false;
    }
  };

  const approveRequest = async (id: string): Promise<boolean> => {
    try {
      const updated = await approveAttendanceUpdateRequest(id);
      setRequests(prev => prev.map(r => r.id === id ? updated : r));
      toast({ title: t('messages.success'), description: h('approveSuccess') });
      return true;
    } catch (error: unknown) {
      console.error('Error approving attendance update request:', error);
      toast({ title: t('messages.error'), description: h('updateError'), variant: 'destructive' });
      return false;
    }
  };

  const rejectRequest = async (id: string, reason?: string): Promise<boolean> => {
    try {
      const updated = await rejectAttendanceUpdateRequest(id, { rejected_reason: reason });
      setRequests(prev => prev.map(r => r.id === id ? updated : r));
      toast({ title: t('messages.success'), description: h('rejectSuccess') });
      return true;
    } catch (error: unknown) {
      console.error('Error rejecting attendance update request:', error);
      toast({ title: t('messages.error'), description: h('updateError'), variant: 'destructive' });
      return false;
    }
  };

  const deleteRequest = async (id: string): Promise<boolean> => {
    try {
      await deleteAttendanceUpdateRequest(id);
      setRequests(prev => prev.filter(r => r.id !== id));
      toast({ title: t('messages.success'), description: h('deleteSuccess') }); return true;
    } catch (error: unknown) {
      console.error('Error deleting attendance update request:', error);
      toast({ title: t('messages.error'), description: h('deleteError'), variant: 'destructive' }); return false;
    }
  };

  return { requests, isLoading, fetchRequests, createRequest, updateRequest, approveRequest, rejectRequest, deleteRequest };
}
