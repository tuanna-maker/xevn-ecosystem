import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface EmployeeKPI {
  id: string;
  employee_id: string;
  company_id: string;
  period_name: string;
  period_start: string;
  period_end: string;
  kpi_name: string;
  category: string;
  target_value: number;
  actual_value: number | null;
  weight: number;
  unit: string | null;
  score: number | null;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface KPIFormData {
  period_name: string;
  period_start: string;
  period_end: string;
  kpi_name: string;
  category: string;
  target_value: number;
  actual_value: number | null;
  weight: number;
  unit: string;
  status: string;
  notes: string;
}

export function useEmployeeKPI(employeeId: string) {
  const { currentCompanyId } = useAuth();
  const [kpis, setKpis] = useState<EmployeeKPI[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchKPIs = async () => {
    if (!employeeId || !currentCompanyId) return;

    try {
      const { data, error } = await supabase
        .from('employee_kpis' as any)
        .select('*')
        .eq('employee_id', employeeId)
        .eq('company_id', currentCompanyId)
        .order('period_end', { ascending: false });

      if (error) throw error;
      setKpis((data || []) as unknown as EmployeeKPI[]);
    } catch (error) {
      console.error('Error fetching KPIs:', error);
      toast.error('Không thể tải dữ liệu KPI');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKPIs();
  }, [employeeId, currentCompanyId]);

  const addKPI = async (formData: KPIFormData) => {
    if (!currentCompanyId) return;

    try {
      const { error } = await supabase
        .from('employee_kpis' as any)
        .insert({
          employee_id: employeeId,
          company_id: currentCompanyId,
          ...formData,
        });

      if (error) throw error;
      toast.success('Đã thêm KPI thành công');
      fetchKPIs();
    } catch (error) {
      console.error('Error adding KPI:', error);
      toast.error('Không thể thêm KPI');
    }
  };

  const updateKPI = async (id: string, formData: Partial<KPIFormData>) => {
    try {
      const { error } = await supabase
        .from('employee_kpis' as any)
        .update(formData)
        .eq('id', id);

      if (error) throw error;
      toast.success('Đã cập nhật KPI thành công');
      fetchKPIs();
    } catch (error) {
      console.error('Error updating KPI:', error);
      toast.error('Không thể cập nhật KPI');
    }
  };

  const deleteKPI = async (id: string) => {
    try {
      const { error } = await supabase
        .from('employee_kpis' as any)
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Đã xóa KPI');
      fetchKPIs();
    } catch (error) {
      console.error('Error deleting KPI:', error);
      toast.error('Không thể xóa KPI');
    }
  };

  // Group KPIs by period
  const getKPIsByPeriod = () => {
    const grouped: Record<string, EmployeeKPI[]> = {};
    kpis.forEach(kpi => {
      if (!grouped[kpi.period_name]) {
        grouped[kpi.period_name] = [];
      }
      grouped[kpi.period_name].push(kpi);
    });
    return grouped;
  };

  // Get current period KPIs
  const getCurrentPeriodKPIs = () => {
    const now = new Date();
    return kpis.filter(kpi => {
      const start = new Date(kpi.period_start);
      const end = new Date(kpi.period_end);
      return now >= start && now <= end;
    });
  };

  // Calculate stats
  const getStats = () => {
    const currentKPIs = getCurrentPeriodKPIs();
    const totalWeight = currentKPIs.reduce((sum, k) => sum + k.weight, 0);
    const currentScore = currentKPIs.reduce((sum, k) => {
      if (k.target_value === 0) return sum;
      const progress = Math.min(((k.actual_value || 0) / k.target_value) * 100, 100);
      return sum + (progress * k.weight / 100);
    }, 0);
    
    return {
      totalKPIs: currentKPIs.length,
      inProgress: currentKPIs.filter(k => k.status === 'in_progress').length,
      completed: currentKPIs.filter(k => k.status === 'completed').length,
      totalWeight,
      currentScore: Math.round(currentScore),
    };
  };

  return {
    kpis,
    loading,
    addKPI,
    updateKPI,
    deleteKPI,
    refetch: fetchKPIs,
    getKPIsByPeriod,
    getCurrentPeriodKPIs,
    getStats,
  };
}
