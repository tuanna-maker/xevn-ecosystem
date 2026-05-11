import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface EmployeeAsset {
  id: string;
  employee_id: string;
  company_id: string;
  asset_code: string;
  asset_name: string;
  category: string;
  brand: string | null;
  model: string | null;
  serial_number: string | null;
  specifications: string | null;
  condition: string;
  assigned_date: string | null;
  return_date: string | null;
  value: number;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface AssetFormData {
  asset_code: string;
  asset_name: string;
  category: string;
  brand: string;
  model: string;
  serial_number: string;
  specifications: string;
  condition: string;
  assigned_date: string;
  return_date: string;
  value: number;
  status: string;
  notes: string;
}

export function useEmployeeAssets(employeeId: string) {
  const { currentCompanyId } = useAuth();
  const [assets, setAssets] = useState<EmployeeAsset[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAssets = async () => {
    if (!employeeId || !currentCompanyId) return;

    try {
      const { data, error } = await supabase
        .from('employee_assets' as any)
        .select('*')
        .eq('employee_id', employeeId)
        .eq('company_id', currentCompanyId)
        .order('assigned_date', { ascending: false });

      if (error) throw error;
      setAssets((data || []) as unknown as EmployeeAsset[]);
    } catch (error) {
      console.error('Error fetching assets:', error);
      toast.error('Không thể tải dữ liệu tài sản');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, [employeeId, currentCompanyId]);

  const addAsset = async (formData: AssetFormData) => {
    if (!currentCompanyId) return;

    try {
      const { error } = await supabase
        .from('employee_assets' as any)
        .insert({
          employee_id: employeeId,
          company_id: currentCompanyId,
          ...formData,
          assigned_date: formData.assigned_date || null,
          return_date: formData.return_date || null,
        });

      if (error) throw error;
      toast.success('Đã thêm tài sản thành công');
      fetchAssets();
    } catch (error) {
      console.error('Error adding asset:', error);
      toast.error('Không thể thêm tài sản');
    }
  };

  const updateAsset = async (id: string, formData: Partial<AssetFormData>) => {
    try {
      const { error } = await supabase
        .from('employee_assets' as any)
        .update({
          ...formData,
          assigned_date: formData.assigned_date || null,
          return_date: formData.return_date || null,
        })
        .eq('id', id);

      if (error) throw error;
      toast.success('Đã cập nhật tài sản thành công');
      fetchAssets();
    } catch (error) {
      console.error('Error updating asset:', error);
      toast.error('Không thể cập nhật tài sản');
    }
  };

  const deleteAsset = async (id: string) => {
    try {
      const { error } = await supabase
        .from('employee_assets' as any)
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Đã xóa tài sản');
      fetchAssets();
    } catch (error) {
      console.error('Error deleting asset:', error);
      toast.error('Không thể xóa tài sản');
    }
  };

  // Calculate stats
  const getStats = () => {
    const inUse = assets.filter(a => a.status === 'assigned');
    return {
      totalAssets: assets.length,
      inUseCount: inUse.length,
      totalValue: inUse.reduce((sum, a) => sum + (a.value || 0), 0),
      categoryCount: new Set(assets.map(a => a.category)).size,
      maintenanceCount: assets.filter(a => a.status === 'maintenance').length,
    };
  };

  return {
    assets,
    loading,
    addAsset,
    updateAsset,
    deleteAsset,
    refetch: fetchAssets,
    getStats,
  };
}
