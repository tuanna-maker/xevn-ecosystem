import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  createEmployeeDiscipline,
  createEmployeeReward,
  deleteEmployeeDiscipline,
  deleteEmployeeReward,
  listEmployeeDiscipline,
  listEmployeeRewards,
  updateEmployeeDiscipline,
  updateEmployeeReward,
} from '@/integrations/hrmApi';
import { toErrorMessage } from '@/lib/apiError';
import { toast } from 'sonner';

export interface EmployeeReward {
  id: string;
  employee_id: string;
  company_id: string;
  reward_date: string;
  reward_type: string;
  title: string;
  description: string | null;
  decision_number: string | null;
  amount: number;
  issued_by: string | null;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface EmployeeDiscipline {
  id: string;
  employee_id: string;
  company_id: string;
  discipline_date: string;
  discipline_type: string;
  title: string;
  description: string | null;
  decision_number: string | null;
  penalty_amount: number;
  issued_by: string | null;
  effective_from: string | null;
  effective_to: string | null;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface RewardFormData {
  reward_date: string;
  reward_type: string;
  title: string;
  description: string;
  decision_number: string;
  amount: number;
  issued_by: string;
  status: string;
  notes: string;
}

export interface DisciplineFormData {
  discipline_date: string;
  discipline_type: string;
  title: string;
  description: string;
  decision_number: string;
  penalty_amount: number;
  issued_by: string;
  effective_from: string;
  effective_to: string;
  status: string;
  notes: string;
}

export function useEmployeeRewardsDiscipline(employeeId: string) {
  const { currentCompanyId } = useAuth();
  const [rewards, setRewards] = useState<EmployeeReward[]>([]);
  const [disciplines, setDisciplines] = useState<EmployeeDiscipline[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!employeeId || !currentCompanyId) {
      setRewards([]);
      setDisciplines([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [rewardRes, disciplineRes] = await Promise.all([
        listEmployeeRewards(employeeId, currentCompanyId),
        listEmployeeDiscipline(employeeId, currentCompanyId),
      ]);
      setRewards((rewardRes.data ?? []) as unknown as EmployeeReward[]);
      setDisciplines((disciplineRes.data ?? []) as unknown as EmployeeDiscipline[]);
    } catch (error: unknown) {
      console.error('Error fetching rewards/discipline:', error);
      toast.error(toErrorMessage(error, 'Không thể tải khen thưởng / kỷ luật'));
      setRewards([]);
      setDisciplines([]);
    } finally {
      setLoading(false);
    }
  }, [employeeId, currentCompanyId]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const addReward = async (formData: RewardFormData) => {
    if (!employeeId || !currentCompanyId) return;
    try {
      await createEmployeeReward(employeeId, currentCompanyId, formData);
      toast.success('Đã thêm khen thưởng');
      await fetchData();
    } catch (error: unknown) {
      toast.error(toErrorMessage(error, 'Không thể lưu khen thưởng'));
    }
  };

  const updateReward = async (id: string, formData: Partial<RewardFormData>) => {
    if (!employeeId || !currentCompanyId) return;
    try {
      await updateEmployeeReward(employeeId, id, currentCompanyId, formData);
      toast.success('Đã cập nhật khen thưởng');
      await fetchData();
    } catch (error: unknown) {
      toast.error(toErrorMessage(error, 'Không thể cập nhật khen thưởng'));
    }
  };

  const deleteReward = async (id: string) => {
    if (!employeeId || !currentCompanyId) return;
    try {
      await deleteEmployeeReward(employeeId, id, currentCompanyId);
      toast.success('Đã xóa khen thưởng');
      await fetchData();
    } catch (error: unknown) {
      toast.error(toErrorMessage(error, 'Không thể xóa khen thưởng'));
    }
  };

  const addDiscipline = async (formData: DisciplineFormData) => {
    if (!employeeId || !currentCompanyId) return;
    try {
      await createEmployeeDiscipline(employeeId, currentCompanyId, formData);
      toast.success('Đã thêm kỷ luật');
      await fetchData();
    } catch (error: unknown) {
      toast.error(toErrorMessage(error, 'Không thể lưu kỷ luật'));
    }
  };

  const updateDiscipline = async (id: string, formData: Partial<DisciplineFormData>) => {
    if (!employeeId || !currentCompanyId) return;
    try {
      await updateEmployeeDiscipline(employeeId, id, currentCompanyId, formData);
      toast.success('Đã cập nhật kỷ luật');
      await fetchData();
    } catch (error: unknown) {
      toast.error(toErrorMessage(error, 'Không thể cập nhật kỷ luật'));
    }
  };

  const deleteDiscipline = async (id: string) => {
    if (!employeeId || !currentCompanyId) return;
    try {
      await deleteEmployeeDiscipline(employeeId, id, currentCompanyId);
      toast.success('Đã xóa kỷ luật');
      await fetchData();
    } catch (error: unknown) {
      toast.error(toErrorMessage(error, 'Không thể xóa kỷ luật'));
    }
  };

  const getStats = () => ({
    totalRewards: rewards.length,
    totalRewardAmount: rewards.reduce((sum, r) => sum + (Number(r.amount) || 0), 0),
    totalDisciplines: disciplines.length,
    totalPenalty: disciplines.reduce((sum, d) => sum + (Number(d.penalty_amount) || 0), 0),
    activeDisciplines: disciplines.filter((d) => d.status === 'active').length,
  });

  return {
    rewards,
    disciplines,
    loading,
    addReward,
    updateReward,
    deleteReward,
    addDiscipline,
    updateDiscipline,
    deleteDiscipline,
    refetch: fetchData,
    getStats,
  };
}
