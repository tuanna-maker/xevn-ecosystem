import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import i18n from '@/i18n';
import {
  createEmployeeTraining,
  deleteEmployeeTraining,
  listEmployeeTraining,
  updateEmployeeTraining,
} from '@/integrations/hrmApi';
import { toErrorMessage } from '@/lib/apiError';
import { toast } from 'sonner';

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

function mapTraining(row: Record<string, unknown>): TrainingItem {
  return {
    ...(row as unknown as TrainingItem),
    skills: Array.isArray(row.skills) ? (row.skills as string[]) : [],
  };
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
      const result = await listEmployeeTraining(employeeId, currentCompanyId);
      setTrainings((result.data ?? []).map(mapTraining));
    } catch (error: unknown) {
      console.error('Error fetching training:', error);
      toast.error(toErrorMessage(error, i18n.t('messages.error', 'Không thể tải đào tạo')));
      setTrainings([]);
    } finally {
      setIsLoading(false);
    }
  }, [employeeId, currentCompanyId]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const createTraining = async (data: TrainingFormData): Promise<boolean> => {
    if (!employeeId || !currentCompanyId) return false;
    try {
      await createEmployeeTraining(employeeId, currentCompanyId, data);
      await fetchData();
      return true;
    } catch (error: unknown) {
      toast.error(toErrorMessage(error, i18n.t('messages.error')));
      return false;
    }
  };

  const updateTraining = async (id: string, data: Partial<TrainingFormData>): Promise<boolean> => {
    if (!employeeId || !currentCompanyId) return false;
    try {
      await updateEmployeeTraining(employeeId, id, currentCompanyId, data);
      await fetchData();
      return true;
    } catch (error: unknown) {
      toast.error(toErrorMessage(error, i18n.t('messages.error')));
      return false;
    }
  };

  const deleteTraining = async (id: string): Promise<boolean> => {
    if (!employeeId || !currentCompanyId) return false;
    try {
      await deleteEmployeeTraining(employeeId, id, currentCompanyId);
      await fetchData();
      return true;
    } catch (error: unknown) {
      toast.error(toErrorMessage(error, i18n.t('messages.error')));
      return false;
    }
  };

  const getStats = () => ({
    total: trainings.length,
    completed: trainings.filter((t) => t.status === 'completed').length,
    inProgress: trainings.filter((t) => t.status === 'in-progress').length,
    planned: trainings.filter((t) => t.status === 'planned').length,
    totalCost: trainings.reduce((sum, t) => sum + (t.cost || 0), 0),
  });

  return {
    trainings,
    isLoading,
    refetch: fetchData,
    createTraining,
    updateTraining,
    deleteTraining,
    getStats,
  };
}
