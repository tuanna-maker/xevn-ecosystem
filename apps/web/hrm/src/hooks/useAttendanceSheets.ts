import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface AttendanceSheet {
  id: string; company_id: string; name: string; start_date: string; end_date: string;
  attendance_type: string; standard_type: string; department: string | null; positions: string | null;
  status: string; created_by: string | null; notes: string | null; created_at: string; updated_at: string;
}

export interface AttendanceSheetInput {
  name: string; start_date: string; end_date: string; attendance_type?: string; standard_type?: string;
  department?: string; positions?: string; notes?: string;
}

export function useAttendanceSheets() {
  const [sheets, setSheets] = useState<AttendanceSheet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { currentCompanyId } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const h = (key: string): string => t(`hk.attendanceSheet.${key}`) as string;

  const fetchSheets = useCallback(async () => {
    if (!currentCompanyId) { setSheets([]); setIsLoading(false); return; }
    try {
      setIsLoading(true);
      const { data, error } = await supabase.from('attendance_sheets').select('*').eq('company_id', currentCompanyId).order('created_at', { ascending: false });
      if (error) throw error; setSheets(data || []);
    } catch (error: any) {
      console.error('Error fetching attendance sheets:', error);
      toast({ title: t('messages.error'), description: h('fetchError'), variant: 'destructive' });
    } finally { setIsLoading(false); }
  }, [currentCompanyId, toast, t]);

  const createSheet = useCallback(async (input: AttendanceSheetInput): Promise<AttendanceSheet | null> => {
    if (!currentCompanyId) { toast({ title: t('messages.error'), description: t('hk.noCompany'), variant: 'destructive' }); return null; }
    try {
      const { data, error } = await supabase.from('attendance_sheets').insert({
        company_id: currentCompanyId, name: input.name, start_date: input.start_date, end_date: input.end_date,
        attendance_type: input.attendance_type || 'daily', standard_type: input.standard_type || 'fixed',
        department: input.department || null, positions: input.positions || null, notes: input.notes || null,
      }).select().single();
      if (error) throw error;
      toast({ title: t('messages.success'), description: h('createSuccess') });
      await fetchSheets(); return data;
    } catch (error: any) {
      console.error('Error creating attendance sheet:', error);
      toast({ title: t('messages.error'), description: h('createError'), variant: 'destructive' }); return null;
    }
  }, [currentCompanyId, fetchSheets, toast, t]);

  const updateSheet = useCallback(async (id: string, updates: Partial<AttendanceSheetInput>): Promise<boolean> => {
    try {
      const { error } = await supabase.from('attendance_sheets').update(updates).eq('id', id);
      if (error) throw error;
      toast({ title: t('messages.success'), description: h('updateSuccess') });
      await fetchSheets(); return true;
    } catch (error: any) {
      console.error('Error updating attendance sheet:', error);
      toast({ title: t('messages.error'), description: h('updateError'), variant: 'destructive' }); return false;
    }
  }, [fetchSheets, toast, t]);

  const deleteSheet = useCallback(async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase.from('attendance_sheets').delete().eq('id', id);
      if (error) throw error;
      toast({ title: t('messages.success'), description: h('deleteSuccess') });
      await fetchSheets(); return true;
    } catch (error: any) {
      console.error('Error deleting attendance sheet:', error);
      toast({ title: t('messages.error'), description: h('deleteError'), variant: 'destructive' }); return false;
    }
  }, [fetchSheets, toast, t]);

  useEffect(() => { fetchSheets(); }, [fetchSheets]);

  return { sheets, isLoading, createSheet, updateSheet, deleteSheet, refetch: fetchSheets };
}
