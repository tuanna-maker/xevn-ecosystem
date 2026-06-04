import { useState, useEffect } from 'react';

import { useAuth } from '@/contexts/AuthContext';

import { toast } from 'sonner';

import { toErrorMessage } from '@/lib/apiError';

import {

  createEmployeeAsset,

  deleteEmployeeAsset,

  listEmployeeAssets,

  updateEmployeeAsset,

} from '@/integrations/hrmApi';



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



function mapAsset(row: Record<string, unknown>, employeeId: string): EmployeeAsset {

  return {

    id: String(row.id),

    employee_id: String(row.employee_id ?? employeeId),

    company_id: String(row.company_id ?? ''),

    asset_code: String(row.asset_code ?? ''),

    asset_name: String(row.asset_name ?? ''),

    category: String(row.category ?? ''),

    brand: row.brand ? String(row.brand) : null,

    model: row.model ? String(row.model) : null,

    serial_number: row.serial_number ? String(row.serial_number) : null,

    specifications: row.specifications ? String(row.specifications) : null,

    condition: String(row.condition ?? ''),

    assigned_date: row.assigned_date ? String(row.assigned_date) : null,

    return_date: row.return_date ? String(row.return_date) : null,

    value: Number(row.value ?? 0),

    status: String(row.status ?? 'assigned'),

    notes: row.notes ? String(row.notes) : null,

    created_at: String(row.created_at ?? ''),

    updated_at: String(row.updated_at ?? ''),

  };

}



export function useEmployeeAssets(employeeId: string) {

  const { currentCompanyId } = useAuth();

  const [assets, setAssets] = useState<EmployeeAsset[]>([]);

  const [loading, setLoading] = useState(true);



  const fetchAssets = async () => {

    if (!employeeId || !currentCompanyId) return;



    try {

      setLoading(true);

      const response = await listEmployeeAssets(employeeId, currentCompanyId);

      setAssets((response.data ?? []).map((row) => mapAsset(row, employeeId)));

    } catch (error) {

      console.error('Error fetching assets:', error);

      toast.error(toErrorMessage(error, 'Không thể tải dữ liệu tài sản'));

      setAssets([]);

    } finally {

      setLoading(false);

    }

  };



  useEffect(() => {

    void fetchAssets();

  }, [employeeId, currentCompanyId]);



  const addAsset = async (formData: AssetFormData) => {

    if (!currentCompanyId) return;



    try {

      await createEmployeeAsset(employeeId, currentCompanyId, formData);

      toast.success('Đã thêm tài sản thành công');

      await fetchAssets();

    } catch (error) {

      console.error('Error adding asset:', error);

      toast.error(toErrorMessage(error, 'Không thể thêm tài sản'));

    }

  };



  const updateAsset = async (id: string, formData: Partial<AssetFormData>) => {

    if (!currentCompanyId) return;



    try {

      await updateEmployeeAsset(employeeId, id, currentCompanyId, formData);

      toast.success('Đã cập nhật tài sản thành công');

      await fetchAssets();

    } catch (error) {

      console.error('Error updating asset:', error);

      toast.error(toErrorMessage(error, 'Không thể cập nhật tài sản'));

    }

  };



  const deleteAsset = async (id: string) => {

    if (!currentCompanyId) return;



    try {

      await deleteEmployeeAsset(employeeId, id, currentCompanyId);

      toast.success('Đã xóa tài sản');

      await fetchAssets();

    } catch (error) {

      console.error('Error deleting asset:', error);

      toast.error(toErrorMessage(error, 'Không thể xóa tài sản'));

    }

  };



  const getStats = () => {

    const inUse = assets.filter((a) => a.status === 'assigned');

    return {

      totalAssets: assets.length,

      inUseCount: inUse.length,

      totalValue: inUse.reduce((sum, a) => sum + (a.value || 0), 0),

      categoryCount: new Set(assets.map((a) => a.category)).size,

      maintenanceCount: assets.filter((a) => a.status === 'maintenance').length,

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


