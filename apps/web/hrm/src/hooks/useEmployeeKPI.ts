import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toErrorMessage } from '@/lib/apiError';
import { toast } from 'sonner';
import {
  createEmployeeKpi,
  deleteEmployeeKpi,
  listEmployeeKpis,
  type HrmEmployeeKpiRow,
} from '@/integrations/hrmApi';

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

function mapKpiRow(row: HrmEmployeeKpiRow): EmployeeKPI {
  const periodStart = row.period_start ?? '';
  const periodEnd = row.period_end ?? '';
  const periodName =
    periodStart && periodEnd ? `${periodStart} – ${periodEnd}` : row.kpi_name;
  return {
    id: row.id,
    employee_id: row.employee_id,
    company_id: row.company_id,
    period_name: periodName,
    period_start: periodStart,
    period_end: periodEnd,
    kpi_name: row.kpi_name,
    category: row.kpi_type ?? 'general',
    target_value: Number(row.target_value ?? 0),
    actual_value: row.actual_value != null ? Number(row.actual_value) : null,
    weight: Number(row.weight ?? 0),
    unit: row.unit,
    score: null,
    status: row.status,
    notes: row.notes,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export function useEmployeeKPI(employeeId: string) {
  const { currentCompanyId } = useAuth();
  const [kpis, setKpis] = useState<EmployeeKPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchKPIs = useCallback(async () => {
    if (!employeeId || !currentCompanyId) {
      setKpis([]);
      setFetchError(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setFetchError(null);
    try {
      const response = await listEmployeeKpis({
        company_id: currentCompanyId,
        employee_id: employeeId,
      });
      setKpis((response.data ?? []).map(mapKpiRow));
    } catch (error: unknown) {
      console.error('Error fetching employee KPIs:', error);
      setKpis([]);
      setFetchError(toErrorMessage(error, 'Không thể tải KPI nhân viên'));
    } finally {
      setLoading(false);
    }
  }, [employeeId, currentCompanyId]);

  useEffect(() => {
    void fetchKPIs();
  }, [fetchKPIs]);

  const addKPI = async (formData: KPIFormData) => {
    if (!employeeId || !currentCompanyId) return;
    try {
      await createEmployeeKpi({
        company_id: currentCompanyId,
        employee_id: employeeId,
        kpi_name: formData.kpi_name,
        kpi_type: formData.category,
        target_value: formData.target_value,
        actual_value: formData.actual_value,
        unit: formData.unit || undefined,
        weight: formData.weight,
        period_start: formData.period_start,
        period_end: formData.period_end,
        status: formData.status,
        notes: formData.notes || formData.period_name || undefined,
      });
      await fetchKPIs();
    } catch (error: unknown) {
      console.error('addKPI:', error);
      setFetchError(toErrorMessage(error, 'Không thể thêm KPI'));
      throw error;
    }
  };

  const updateKPI = async (_id: string, _formData: Partial<KPIFormData>) => {
    const message = 'Cập nhật KPI chưa có API (PATCH employee-kpis) — chờ P1-SUPA-BE-03';
    setFetchError(message);
    toast.error(message);
    throw new Error(message);
  };

  const deleteKPI = async (id: string) => {
    if (!currentCompanyId) return;
    try {
      await deleteEmployeeKpi(id, currentCompanyId);
      await fetchKPIs();
    } catch (error: unknown) {
      console.error('deleteKPI:', error);
      setFetchError(toErrorMessage(error, 'Không thể xóa KPI'));
      throw error;
    }
  };

  const getKPIsByPeriod = () => {
    const grouped: Record<string, EmployeeKPI[]> = {};
    kpis.forEach((kpi) => {
      if (!grouped[kpi.period_name]) grouped[kpi.period_name] = [];
      grouped[kpi.period_name].push(kpi);
    });
    return grouped;
  };

  const getCurrentPeriodKPIs = () => {
    const now = new Date();
    return kpis.filter((kpi) => {
      if (!kpi.period_start || !kpi.period_end) return false;
      const start = new Date(kpi.period_start);
      const end = new Date(kpi.period_end);
      return now >= start && now <= end;
    });
  };

  const getStats = () => {
    const currentKPIs = getCurrentPeriodKPIs();
    const totalWeight = currentKPIs.reduce((sum, k) => sum + k.weight, 0);
    const currentScore = currentKPIs.reduce((sum, k) => {
      if (k.target_value === 0) return sum;
      const progress = Math.min(((k.actual_value || 0) / k.target_value) * 100, 100);
      return sum + (progress * k.weight) / 100;
    }, 0);

    return {
      totalKPIs: currentKPIs.length,
      inProgress: currentKPIs.filter((k) => k.status === 'in_progress').length,
      completed: currentKPIs.filter((k) => k.status === 'completed').length,
      totalWeight,
      currentScore: Math.round(currentScore),
    };
  };

  return {
    kpis,
    loading,
    fetchError,
    addKPI,
    updateKPI,
    deleteKPI,
    refetch: fetchKPIs,
    getKPIsByPeriod,
    getCurrentPeriodKPIs,
    getStats,
  };
}
