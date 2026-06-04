import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toErrorMessage } from '@/lib/apiError';
import {
  createSalesData,
  deleteSalesData,
  listSalesData,
  syncSalesData,
  updateSalesData,
} from '@/integrations/hrmApi';
import { toast } from 'sonner';

export interface SalesRecord {
  id: string;
  company_id: string;
  employee_id: string | null;
  employee_code: string;
  employee_name: string;
  department: string | null;
  position: string | null;
  period_month: number;
  period_year: number;
  sales_target: number;
  actual_sales: number;
  achievement_rate: number;
  commission_rate: number;
  commission_amount: number;
  bonus_amount: number;
  total_earnings: number;
  order_count: number;
  customer_count: number;
  new_customer_count: number;
  sync_source: string | null;
  synced_at: string | null;
  external_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface UseSalesDataOptions {
  periodMonth?: number;
  periodYear?: number;
}

function mapRow(row: Record<string, unknown>): SalesRecord {
  return {
    id: String(row.id),
    company_id: String(row.company_id),
    employee_id: row.employee_id ? String(row.employee_id) : null,
    employee_code: String(row.employee_code ?? ''),
    employee_name: String(row.employee_name ?? ''),
    department: row.department ? String(row.department) : null,
    position: row.position ? String(row.position) : null,
    period_month: Number(row.period_month ?? 0),
    period_year: Number(row.period_year ?? 0),
    sales_target: Number(row.sales_target ?? 0),
    actual_sales: Number(row.actual_sales ?? 0),
    achievement_rate: Number(row.achievement_rate ?? 0),
    commission_rate: Number(row.commission_rate ?? 0),
    commission_amount: Number(row.commission_amount ?? 0),
    bonus_amount: Number(row.bonus_amount ?? 0),
    total_earnings: Number(row.total_earnings ?? 0),
    order_count: Number(row.order_count ?? 0),
    customer_count: Number(row.customer_count ?? 0),
    new_customer_count: Number(row.new_customer_count ?? 0),
    sync_source: row.sync_source ? String(row.sync_source) : null,
    synced_at: row.synced_at ? String(row.synced_at) : null,
    external_id: row.external_id ? String(row.external_id) : null,
    notes: row.notes ? String(row.notes) : null,
    created_at: String(row.created_at ?? ''),
    updated_at: String(row.updated_at ?? ''),
  };
}

export function useSalesData(options: UseSalesDataOptions = {}) {
  const { currentCompanyId } = useAuth();
  const [salesData, setSalesData] = useState<SalesRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  const currentDate = new Date();
  const month = options.periodMonth || currentDate.getMonth() + 1;
  const year = options.periodYear || currentDate.getFullYear();

  const fetchSalesData = useCallback(async () => {
    if (!currentCompanyId) {
      setSalesData([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const response = await listSalesData({
        company_id: currentCompanyId,
        period_month: month,
        period_year: year,
      });
      setSalesData((response.data ?? []).map(mapRow));
    } catch (error) {
      console.error('fetchSalesData:', error);
      toast.error(toErrorMessage(error, 'Không thể tải dữ liệu doanh số'));
      setSalesData([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentCompanyId, month, year]);

  useEffect(() => {
    void fetchSalesData();
  }, [fetchSalesData]);

  const syncFromAPI = async (_apiEndpoint?: string) => {
    if (!currentCompanyId) return;
    setIsSyncing(true);
    try {
      await syncSalesData(currentCompanyId);
      await fetchSalesData();
      toast.success('Đã đồng bộ dữ liệu doanh số');
    } catch (error) {
      toast.error(toErrorMessage(error, 'Đồng bộ thất bại'));
    } finally {
      setIsSyncing(false);
    }
  };

  const importFromExcel = async (records: Partial<SalesRecord>[]) => {
    if (!currentCompanyId) return false;
    try {
      for (const record of records) {
        await createSalesData({
          company_id: currentCompanyId,
          ...record,
          period_month: record.period_month ?? month,
          period_year: record.period_year ?? year,
        });
      }
      await fetchSalesData();
      return true;
    } catch (error) {
      toast.error(toErrorMessage(error, 'Import thất bại'));
      return false;
    }
  };

  const addRecord = async (record: Partial<SalesRecord>) => {
    if (!currentCompanyId) return false;
    try {
      await createSalesData({
        company_id: currentCompanyId,
        ...record,
        period_month: record.period_month ?? month,
        period_year: record.period_year ?? year,
      });
      await fetchSalesData();
      return true;
    } catch (error) {
      toast.error(toErrorMessage(error, 'Không thể thêm bản ghi'));
      return false;
    }
  };

  const updateRecord = async (id: string, updates: Partial<SalesRecord>) => {
    if (!currentCompanyId) return false;
    try {
      await updateSalesData(id, currentCompanyId, updates);
      await fetchSalesData();
      return true;
    } catch (error) {
      toast.error(toErrorMessage(error, 'Không thể cập nhật'));
      return false;
    }
  };

  const deleteRecord = async (id: string) => {
    if (!currentCompanyId) return false;
    try {
      await deleteSalesData(id, currentCompanyId);
      await fetchSalesData();
      return true;
    } catch (error) {
      toast.error(toErrorMessage(error, 'Không thể xóa'));
      return false;
    }
  };

  const getStats = () => {
    const totalEmployees = salesData.length;
    const totalSales = salesData.reduce((sum, r) => sum + Number(r.actual_sales || 0), 0);
    const totalCommission = salesData.reduce((sum, r) => sum + Number(r.commission_amount || 0), 0);
    const avgAchievement =
      totalEmployees > 0
        ? salesData.reduce((sum, r) => sum + Number(r.achievement_rate || 0), 0) / totalEmployees
        : 0;

    return { totalEmployees, totalSales, totalCommission, avgAchievement };
  };

  return {
    salesData,
    isLoading,
    isSyncing,
    fetchSalesData,
    syncFromAPI,
    importFromExcel,
    addRecord,
    updateRecord,
    deleteRecord,
    getStats,
    month,
    year,
  };
}
