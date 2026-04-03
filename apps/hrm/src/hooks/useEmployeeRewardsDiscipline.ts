import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
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

  const fetchData = async () => {
    if (!employeeId || !currentCompanyId) return;

    try {
      const [rewardsRes, disciplinesRes] = await Promise.all([
        supabase
          .from('employee_rewards' as any)
          .select('*')
          .eq('employee_id', employeeId)
          .eq('company_id', currentCompanyId)
          .order('reward_date', { ascending: false }),
        supabase
          .from('employee_disciplines' as any)
          .select('*')
          .eq('employee_id', employeeId)
          .eq('company_id', currentCompanyId)
          .order('discipline_date', { ascending: false }),
      ]);

      if (rewardsRes.error) throw rewardsRes.error;
      if (disciplinesRes.error) throw disciplinesRes.error;

      setRewards((rewardsRes.data || []) as unknown as EmployeeReward[]);
      setDisciplines((disciplinesRes.data || []) as unknown as EmployeeDiscipline[]);
    } catch (error) {
      console.error('Error fetching rewards/disciplines:', error);
      toast.error('Không thể tải dữ liệu khen thưởng/kỷ luật');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [employeeId, currentCompanyId]);

  // Reward operations
  const addReward = async (formData: RewardFormData) => {
    if (!currentCompanyId) return;

    try {
      const { error } = await supabase
        .from('employee_rewards' as any)
        .insert({
          employee_id: employeeId,
          company_id: currentCompanyId,
          ...formData,
        });

      if (error) throw error;
      toast.success('Đã thêm khen thưởng thành công');
      fetchData();
    } catch (error) {
      console.error('Error adding reward:', error);
      toast.error('Không thể thêm khen thưởng');
    }
  };

  const updateReward = async (id: string, formData: Partial<RewardFormData>) => {
    try {
      const { error } = await supabase
        .from('employee_rewards' as any)
        .update(formData)
        .eq('id', id);

      if (error) throw error;
      toast.success('Đã cập nhật khen thưởng thành công');
      fetchData();
    } catch (error) {
      console.error('Error updating reward:', error);
      toast.error('Không thể cập nhật khen thưởng');
    }
  };

  const deleteReward = async (id: string) => {
    try {
      const { error } = await supabase
        .from('employee_rewards' as any)
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Đã xóa khen thưởng');
      fetchData();
    } catch (error) {
      console.error('Error deleting reward:', error);
      toast.error('Không thể xóa khen thưởng');
    }
  };

  // Discipline operations
  const addDiscipline = async (formData: DisciplineFormData) => {
    if (!currentCompanyId) return;

    try {
      const { error } = await supabase
        .from('employee_disciplines' as any)
        .insert({
          employee_id: employeeId,
          company_id: currentCompanyId,
          ...formData,
          effective_from: formData.effective_from || null,
          effective_to: formData.effective_to || null,
        });

      if (error) throw error;
      toast.success('Đã thêm kỷ luật thành công');
      fetchData();
    } catch (error) {
      console.error('Error adding discipline:', error);
      toast.error('Không thể thêm kỷ luật');
    }
  };

  const updateDiscipline = async (id: string, formData: Partial<DisciplineFormData>) => {
    try {
      const { error } = await supabase
        .from('employee_disciplines' as any)
        .update({
          ...formData,
          effective_from: formData.effective_from || null,
          effective_to: formData.effective_to || null,
        })
        .eq('id', id);

      if (error) throw error;
      toast.success('Đã cập nhật kỷ luật thành công');
      fetchData();
    } catch (error) {
      console.error('Error updating discipline:', error);
      toast.error('Không thể cập nhật kỷ luật');
    }
  };

  const deleteDiscipline = async (id: string) => {
    try {
      const { error } = await supabase
        .from('employee_disciplines' as any)
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Đã xóa kỷ luật');
      fetchData();
    } catch (error) {
      console.error('Error deleting discipline:', error);
      toast.error('Không thể xóa kỷ luật');
    }
  };

  // Calculate stats
  const getStats = () => {
    return {
      totalRewards: rewards.length,
      totalRewardAmount: rewards.reduce((sum, r) => sum + (r.amount || 0), 0),
      totalDisciplines: disciplines.length,
      totalPenalty: disciplines.reduce((sum, d) => sum + (d.penalty_amount || 0), 0),
      activeDisciplines: disciplines.filter(d => d.status === 'active').length,
    };
  };

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
