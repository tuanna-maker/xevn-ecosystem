import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import i18n from '@/i18n';

export interface TrainingItem {
  id: string;
  employee_id: string;
  company_id: string;
  name: string;
  type: 'internal' | 'external' | 'online' | 'certification';
  category: 'technical' | 'soft-skill' | 'management' | 'compliance' | 'language' | 'other';
  provider: string | null;
  instructor: string | null;
  start_date: string | null;
  end_date: string | null;
  duration: number;
  duration_unit: 'hours' | 'days' | 'weeks' | 'months';
  location: string | null;
  status: 'planned' | 'in-progress' | 'completed' | 'cancelled';
  progress: number;
  score: number | null;
  certificate_number: string | null;
  certificate_file_url: string | null;
  cost: number;
  paid_by: 'company' | 'employee' | 'shared';
  description: string | null;
  skills: string[];
  created_at: string;
  updated_at: string;
}

export interface TrainingFormData {
  name: string;
  type?: TrainingItem['type'];
  category?: TrainingItem['category'];
  provider?: string;
  instructor?: string;
  start_date?: string;
  end_date?: string;
  duration?: number;
  duration_unit?: TrainingItem['duration_unit'];
  location?: string;
  status?: TrainingItem['status'];
  progress?: number;
  score?: number | null;
  certificate_number?: string;
  certificate_file_url?: string;
  cost?: number;
  paid_by?: TrainingItem['paid_by'];
  description?: string;
  skills?: string[];
}

export function useEmployeeTraining(employeeId: string | undefined) {
  const { currentCompanyId } = useAuth();
  const [trainings, setTrainings] = useState<TrainingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!employeeId || !currentCompanyId) {
      setTrainings([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('employee_trainings')
        .select('*')
        .eq('employee_id', employeeId)
        .eq('company_id', currentCompanyId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTrainings((data || []) as TrainingItem[]);
    } catch (error: any) {
      console.error('Error fetching trainings:', error);
      toast.error(i18n.t('training.messages.fetchError'));
    } finally {
      setIsLoading(false);
    }
  }, [employeeId, currentCompanyId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const createTraining = async (data: TrainingFormData): Promise<boolean> => {
    if (!employeeId || !currentCompanyId) return false;

    try {
      const { error } = await supabase
        .from('employee_trainings')
        .insert([{
          ...data,
          employee_id: employeeId,
          company_id: currentCompanyId,
        }]);

      if (error) throw error;
      toast.success(i18n.t('training.messages.createSuccess'));
      await fetchData();
      return true;
    } catch (error: any) {
      console.error('Error creating training:', error);
      toast.error(i18n.t('training.messages.createError'));
      return false;
    }
  };

  const updateTraining = async (id: string, data: Partial<TrainingFormData>): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('employee_trainings')
        .update(data)
        .eq('id', id);

      if (error) throw error;
      toast.success(i18n.t('training.messages.updateSuccess'));
      await fetchData();
      return true;
    } catch (error: any) {
      console.error('Error updating training:', error);
      toast.error(i18n.t('training.messages.updateError'));
      return false;
    }
  };

  const deleteTraining = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('employee_trainings')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success(i18n.t('training.messages.deleteSuccess'));
      await fetchData();
      return true;
    } catch (error: any) {
      console.error('Error deleting training:', error);
      toast.error(i18n.t('training.messages.deleteError'));
      return false;
    }
  };

  // Stats
  const stats = {
    completed: trainings.filter(t => t.status === 'completed').length,
    inProgress: trainings.filter(t => t.status === 'in-progress').length,
    totalHours: trainings.reduce((sum, t) => {
      if (t.duration_unit === 'hours') return sum + t.duration;
      if (t.duration_unit === 'days') return sum + t.duration * 8;
      if (t.duration_unit === 'weeks') return sum + t.duration * 40;
      if (t.duration_unit === 'months') return sum + t.duration * 160;
      return sum;
    }, 0),
    totalCost: trainings.filter(t => t.paid_by === 'company').reduce((sum, t) => sum + t.cost, 0),
  };

  return {
    trainings,
    isLoading,
    stats,
    createTraining,
    updateTraining,
    deleteTraining,
    refetch: fetchData,
  };
}
