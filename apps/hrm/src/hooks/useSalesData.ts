import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
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

export function useSalesData(options: UseSalesDataOptions = {}) {
  const { currentCompanyId } = useAuth();
  const [salesData, setSalesData] = useState<SalesRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  const currentDate = new Date();
  const month = options.periodMonth || currentDate.getMonth() + 1;
  const year = options.periodYear || currentDate.getFullYear();

  const fetchSalesData = async () => {
    if (!currentCompanyId) return;
    
    setIsLoading(true);
    try {
      let query = supabase
        .from('sales_data')
        .select('*')
        .eq('company_id', currentCompanyId)
        .order('employee_code', { ascending: true });

      if (options.periodMonth && options.periodYear) {
        query = query
          .eq('period_month', options.periodMonth)
          .eq('period_year', options.periodYear);
      }

      const { data, error } = await query;

      if (error) throw error;
      setSalesData(data || []);
    } catch (error) {
      console.error('Error fetching sales data:', error);
      toast.error('Không thể tải dữ liệu doanh số');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSalesData();
  }, [currentCompanyId, options.periodMonth, options.periodYear]);

  const syncFromAPI = async (apiEndpoint?: string) => {
    if (!currentCompanyId) return;
    
    setIsSyncing(true);
    try {
      // If apiEndpoint is provided, call external API
      // For now, simulate API sync
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update synced_at for existing records
      const now = new Date().toISOString();
      const { error } = await supabase
        .from('sales_data')
        .update({ synced_at: now, sync_source: 'api' })
        .eq('company_id', currentCompanyId)
        .eq('period_month', month)
        .eq('period_year', year);

      if (error) throw error;
      
      await fetchSalesData();
      toast.success('Đồng bộ dữ liệu thành công!');
    } catch (error) {
      console.error('Error syncing data:', error);
      toast.error('Không thể đồng bộ dữ liệu');
    } finally {
      setIsSyncing(false);
    }
  };

  const importFromExcel = async (records: Partial<SalesRecord>[]) => {
    if (!currentCompanyId) return;

    try {
      const now = new Date().toISOString();
      const dataToInsert = records.map(record => ({
      company_id: currentCompanyId,
        employee_code: record.employee_code || '',
        employee_name: record.employee_name || '',
        department: record.department || null,
        position: record.position || null,
        period_month: record.period_month || month,
        period_year: record.period_year || year,
        sales_target: record.sales_target || 0,
        actual_sales: record.actual_sales || 0,
        commission_rate: record.commission_rate || 0,
        commission_amount: record.commission_amount || 0,
        bonus_amount: record.bonus_amount || 0,
        order_count: record.order_count || 0,
        customer_count: record.customer_count || 0,
        new_customer_count: record.new_customer_count || 0,
        sync_source: 'import',
        synced_at: now,
        notes: record.notes || null,
      }));

      const { error } = await supabase
        .from('sales_data')
        .upsert(dataToInsert, {
          onConflict: 'company_id,employee_code,period_month,period_year',
        });

      if (error) throw error;

      await fetchSalesData();
      toast.success(`Import thành công ${records.length} bản ghi!`);
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      toast.error('Không thể import dữ liệu');
      return false;
    }
  };

  const addRecord = async (record: Partial<SalesRecord>) => {
    if (!currentCompanyId) return;

    try {
      const { error } = await supabase
        .from('sales_data')
        .insert({
          company_id: currentCompanyId,
          employee_code: record.employee_code || '',
          employee_name: record.employee_name || '',
          department: record.department || null,
          position: record.position || null,
          period_month: record.period_month || month,
          period_year: record.period_year || year,
          sales_target: record.sales_target || 0,
          actual_sales: record.actual_sales || 0,
          commission_rate: record.commission_rate || 0,
          commission_amount: record.commission_amount || 0,
          bonus_amount: record.bonus_amount || 0,
          order_count: record.order_count || 0,
          customer_count: record.customer_count || 0,
          new_customer_count: record.new_customer_count || 0,
          sync_source: 'manual',
          notes: record.notes || null,
        });

      if (error) throw error;

      await fetchSalesData();
      toast.success('Thêm dữ liệu thành công!');
      return true;
    } catch (error) {
      console.error('Error adding record:', error);
      toast.error('Không thể thêm dữ liệu');
      return false;
    }
  };

  const updateRecord = async (id: string, updates: Partial<SalesRecord>) => {
    try {
      const { error } = await supabase
        .from('sales_data')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      await fetchSalesData();
      toast.success('Cập nhật thành công!');
      return true;
    } catch (error) {
      console.error('Error updating record:', error);
      toast.error('Không thể cập nhật dữ liệu');
      return false;
    }
  };

  const deleteRecord = async (id: string) => {
    try {
      const { error } = await supabase
        .from('sales_data')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchSalesData();
      toast.success('Xóa thành công!');
      return true;
    } catch (error) {
      console.error('Error deleting record:', error);
      toast.error('Không thể xóa dữ liệu');
      return false;
    }
  };

  const getStats = () => {
    const totalEmployees = salesData.length;
    const totalSales = salesData.reduce((sum, r) => sum + Number(r.actual_sales || 0), 0);
    const totalCommission = salesData.reduce((sum, r) => sum + Number(r.commission_amount || 0), 0);
    const avgAchievement = totalEmployees > 0
      ? salesData.reduce((sum, r) => sum + Number(r.achievement_rate || 0), 0) / totalEmployees
      : 0;

    return {
      totalEmployees,
      totalSales,
      totalCommission,
      avgAchievement,
    };
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
  };
}
