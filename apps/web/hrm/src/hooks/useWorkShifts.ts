import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { toErrorMessage } from '@/lib/apiError';
import {
  createWorkShift,
  deleteWorkShift,
  listWorkShifts,
  updateWorkShift,
} from '@/integrations/hrmApi';

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

export function useWorkShifts(opts?: { enabled?: boolean }) {
  const enabled = opts?.enabled !== false;
  const [shifts, setShifts] = useState<WorkShift[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { currentCompanyId } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const h = (key: string, opts?: Record<string, string>): string =>
    t(`hk.workShift.${key}`, opts) as string;

  const fetchShifts = useCallback(async () => {
    if (!currentCompanyId) {
      setShifts([]);
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      const res = await listWorkShifts(currentCompanyId);
      setShifts((res.data ?? []) as WorkShift[]);
    } catch (error: unknown) {
      console.error('Error fetching work shifts:', error);
      setShifts([]);
      toast({
        title: t('messages.error'),
        description: toErrorMessage(error, h('fetchError')),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentCompanyId, toast, t, h]);

  const createShift = useCallback(
    async (input: WorkShiftInput): Promise<WorkShift | null> => {
      if (!currentCompanyId) {
        toast({
          title: t('messages.error'),
          description: t('hk.noCompany'),
          variant: 'destructive',
        });
        return null;
      }
      try {
        const data = await createWorkShift({ company_id: currentCompanyId, ...input });
        toast({
          title: t('messages.success'),
          description: h('createSuccess', { name: input.name }),
        });
        await fetchShifts();
        return data as WorkShift;
      } catch (error: unknown) {
        console.error('Error creating work shift:', error);
        toast({
          title: t('messages.error'),
          description: toErrorMessage(error, h('createError')),
          variant: 'destructive',
        });
        return null;
      }
    },
    [currentCompanyId, fetchShifts, toast, t, h],
  );

  const updateShift = useCallback(
    async (id: string, updates: Partial<WorkShiftInput>): Promise<boolean> => {
      if (!currentCompanyId) return false;
      try {
        await updateWorkShift(id, currentCompanyId, updates);
        toast({
          title: t('messages.success'),
          description: h('updateSuccess'),
        });
        await fetchShifts();
        return true;
      } catch (error: unknown) {
        console.error('Error updating work shift:', error);
        toast({
          title: t('messages.error'),
          description: toErrorMessage(error, h('updateError')),
          variant: 'destructive',
        });
        return false;
      }
    },
    [currentCompanyId, fetchShifts, toast, t, h],
  );

  const deleteShift = useCallback(
    async (id: string): Promise<boolean> => {
      if (!currentCompanyId) return false;
      try {
        await deleteWorkShift(id, currentCompanyId);
        toast({
          title: t('messages.success'),
          description: h('deleteSuccess'),
        });
        await fetchShifts();
        return true;
      } catch (error: unknown) {
        console.error('Error deleting work shift:', error);
        toast({
          title: t('messages.error'),
          description: toErrorMessage(error, h('deleteError')),
          variant: 'destructive',
        });
        return false;
      }
    },
    [currentCompanyId, fetchShifts, toast, t, h],
  );

  useEffect(() => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }
    void fetchShifts();
  }, [fetchShifts, enabled]);

  return {
    shifts,
    isLoading,
    createShift,
    updateShift,
    deleteShift,
    refetch: fetchShifts,
  };
}
