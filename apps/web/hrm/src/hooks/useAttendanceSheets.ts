import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { toErrorMessage } from '@/lib/apiError';
import {
  createAttendanceSheet,
  deleteAttendanceSheet,
  listAttendanceSheets,
  updateAttendanceSheet,
} from '@/integrations/hrmApi';

export interface AttendanceSheet {
  id: string; company_id: string; name: string; start_date: string; end_date: string;
  attendance_type: string; standard_type: string; department: string | null; positions: string | null;
  status: string; created_by: string | null; notes: string | null; created_at: string; updated_at: string;
}

export interface AttendanceSheetInput {
  name: string; start_date: string; end_date: string; attendance_type?: string; standard_type?: string;
  department?: string; positions?: string; notes?: string;
}

export function useAttendanceSheets(opts?: { enabled?: boolean }) {
  const enabled = opts?.enabled !== false;
  const [sheets, setSheets] = useState<AttendanceSheet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { currentCompanyId } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const h = (key: string): string => t(`hk.attendanceSheet.${key}`) as string;

  const fetchSheets = useCallback(async () => {
    if (!currentCompanyId) { setSheets([]); setIsLoading(false); return; }
    setIsLoading(true);
    try {
      const res = await listAttendanceSheets(currentCompanyId);
      setSheets((res.data ?? []) as AttendanceSheet[]);
    } catch (error: unknown) {
      console.error('Error fetching attendance sheets:', error);
      setSheets([]);
      toast({
        title: t('messages.error'),
        description: toErrorMessage(error, h('fetchError')),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentCompanyId, toast, t, h]);

  const createSheet = useCallback(async (input: AttendanceSheetInput): Promise<AttendanceSheet | null> => {
    if (!currentCompanyId) {
      toast({ title: t('messages.error'), description: t('hk.noCompany'), variant: 'destructive' });
      return null;
    }
    try {
      const created = await createAttendanceSheet({ company_id: currentCompanyId, ...input });
      toast({ title: t('messages.success'), description: h('createSuccess') });
      await fetchSheets();
      return created as AttendanceSheet;
    } catch (error: unknown) {
      toast({ title: t('messages.error'), description: toErrorMessage(error, h('createError')), variant: 'destructive' });
      return null;
    }
  }, [currentCompanyId, fetchSheets, toast, t, h]);

  const updateSheet = useCallback(async (id: string, updates: Partial<AttendanceSheetInput>): Promise<boolean> => {
    if (!currentCompanyId) return false;
    try {
      await updateAttendanceSheet(id, currentCompanyId, updates);
      toast({ title: t('messages.success'), description: h('updateSuccess') });
      await fetchSheets();
      return true;
    } catch (error: unknown) {
      toast({ title: t('messages.error'), description: toErrorMessage(error, h('updateError')), variant: 'destructive' });
      return false;
    }
  }, [currentCompanyId, fetchSheets, toast, t, h]);

  const deleteSheet = useCallback(async (id: string): Promise<boolean> => {
    if (!currentCompanyId) return false;
    try {
      await deleteAttendanceSheet(id, currentCompanyId);
      toast({ title: t('messages.success'), description: h('deleteSuccess') });
      await fetchSheets();
      return true;
    } catch (error: unknown) {
      toast({ title: t('messages.error'), description: toErrorMessage(error, h('deleteError')), variant: 'destructive' });
      return false;
    }
  }, [currentCompanyId, fetchSheets, toast, t, h]);

  useEffect(() => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }
    void fetchSheets();
  }, [fetchSheets, enabled]);

  return { sheets, isLoading, createSheet, updateSheet, deleteSheet, refetch: fetchSheets };
}
