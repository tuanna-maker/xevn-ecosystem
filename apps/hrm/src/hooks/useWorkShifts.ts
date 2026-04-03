import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface WorkShift {
  id: string;
  company_id: string;
  code: string;
  name: string;
  department: string | null;
  start_time: string;
  end_time: string;
  break_start: string | null;
  break_end: string | null;
  work_hours: number | null;
  coefficient: number | null;
  is_night_shift: boolean | null;
  is_overtime_shift: boolean | null;
  color: string | null;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface WorkShiftInput {
  code: string;
  name: string;
  department?: string;
  start_time: string;
  end_time: string;
  break_start?: string;
  break_end?: string;
  work_hours?: number;
  coefficient?: number;
  is_night_shift?: boolean;
  is_overtime_shift?: boolean;
  color?: string;
  status?: string;
  notes?: string;
}

export function useWorkShifts() {
  const [shifts, setShifts] = useState<WorkShift[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { currentCompanyId } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const h = (key: string, opts?: any): string => t(`hk.workShift.${key}`, opts) as string;

  const fetchShifts = useCallback(async () => {
    if (!currentCompanyId) {
      setShifts([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('work_shifts')
        .select('*')
        .eq('company_id', currentCompanyId)
        .order('code', { ascending: true });

      if (error) throw error;
      setShifts(data || []);
    } catch (error: any) {
      console.error('Error fetching work shifts:', error);
      toast({
        title: t('messages.error'),
        description: h('fetchError'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentCompanyId, toast, t]);

  const createShift = useCallback(async (input: WorkShiftInput): Promise<WorkShift | null> => {
    if (!currentCompanyId) {
      toast({
        title: t('messages.error'),
        description: t('hk.noCompany'),
        variant: 'destructive',
      });
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('work_shifts')
        .insert({
          company_id: currentCompanyId,
          code: input.code,
          name: input.name,
          department: input.department || null,
          start_time: input.start_time,
          end_time: input.end_time,
          break_start: input.break_start || null,
          break_end: input.break_end || null,
          work_hours: input.work_hours || 8,
          coefficient: input.coefficient || 1,
          is_night_shift: input.is_night_shift || false,
          is_overtime_shift: input.is_overtime_shift || false,
          color: input.color || '#3b82f6',
          status: input.status || 'active',
          notes: input.notes || null,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: t('messages.success'),
        description: h('createSuccess', { name: input.name }),
      });

      await fetchShifts();
      return data;
    } catch (error: any) {
      console.error('Error creating work shift:', error);
      toast({
        title: t('messages.error'),
        description: h('createError'),
        variant: 'destructive',
      });
      return null;
    }
  }, [currentCompanyId, fetchShifts, toast, t]);

  const updateShift = useCallback(async (id: string, updates: Partial<WorkShiftInput>): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('work_shifts')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: t('messages.success'),
        description: h('updateSuccess'),
      });

      await fetchShifts();
      return true;
    } catch (error: any) {
      console.error('Error updating work shift:', error);
      toast({
        title: t('messages.error'),
        description: h('updateError'),
        variant: 'destructive',
      });
      return false;
    }
  }, [fetchShifts, toast, t]);

  const deleteShift = useCallback(async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('work_shifts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: t('messages.success'),
        description: h('deleteSuccess'),
      });

      await fetchShifts();
      return true;
    } catch (error: any) {
      console.error('Error deleting work shift:', error);
      toast({
        title: t('messages.error'),
        description: h('deleteError'),
        variant: 'destructive',
      });
      return false;
    }
  }, [fetchShifts, toast, t]);

  useEffect(() => {
    fetchShifts();
  }, [fetchShifts]);

  return {
    shifts,
    isLoading,
    createShift,
    updateShift,
    deleteShift,
    refetch: fetchShifts,
  };
}
