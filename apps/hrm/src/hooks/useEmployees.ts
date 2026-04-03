import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Employee {
  id: string;
  company_id: string;
  employee_code: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  department: string | null;
  position: string | null;
  start_date: string | null;
  end_date: string | null;
  status: string;
  avatar_url: string | null;
  salary: number | null;
  manager_id: string | null;
  gender: string | null;
  birth_date: string | null;
  id_number: string | null;
  id_issue_date: string | null;
  id_issue_place: string | null;
  permanent_address: string | null;
  temporary_address: string | null;
  emergency_contact: string | null;
  emergency_phone: string | null;
  employment_type: string | null;
  work_location: string | null;
  bank_name: string | null;
  bank_account: string | null;
  tax_code: string | null;
  social_insurance_number: string | null;
  health_insurance_number: string | null;
  deleted_at: string | null;
  deleted_by: string | null;
  delete_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface EmployeeFormData {
  employee_code: string;
  full_name: string;
  email?: string | null;
  phone?: string | null;
  department?: string | null;
  position?: string | null;
  start_date?: string | null;
  salary?: number | null;
  status?: string;
  avatar_url?: string | null;
  gender?: string | null;
  birth_date?: string | null;
  id_number?: string | null;
  id_issue_date?: string | null;
  id_issue_place?: string | null;
  permanent_address?: string | null;
  temporary_address?: string | null;
  emergency_contact?: string | null;
  emergency_phone?: string | null;
  employment_type?: string | null;
  work_location?: string | null;
  bank_name?: string | null;
  bank_account?: string | null;
  tax_code?: string | null;
  social_insurance_number?: string | null;
  health_insurance_number?: string | null;
}

export function useEmployees(includeDeleted: boolean = false, companyIdFilter?: string | null) {
  const { currentCompanyId, user, profile, memberships } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [deletedEmployees, setDeletedEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Use specific filter, or null means all companies
  const targetCompanyId = companyIdFilter === undefined ? currentCompanyId : companyIdFilter;

  const fetchEmployees = useCallback(async () => {
    // If targetCompanyId is null, fetch across all user's companies
    const companyIds = targetCompanyId
      ? [targetCompanyId]
      : memberships.map(m => m.company_id);

    if (companyIds.length === 0) {
      setEmployees([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      // Fetch active employees (limit for performance at scale)
      const { data: activeData, error: activeError } = await supabase
        .from('employees')
        .select('*')
        .in('company_id', companyIds)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .limit(500);

      if (activeError) throw activeError;
      setEmployees(activeData || []);

      // Fetch deleted employees if needed
      if (includeDeleted) {
        const { data: deletedData, error: deletedError } = await supabase
          .from('employees')
          .select('*')
          .in('company_id', companyIds)
          .not('deleted_at', 'is', null)
          .order('deleted_at', { ascending: false });

        if (deletedError) throw deletedError;
        setDeletedEmployees(deletedData || []);
      }
    } catch (error: any) {
      console.error('Error fetching employees:', error);
      toast.error('Không thể tải danh sách nhân viên');
    } finally {
      setIsLoading(false);
    }
  }, [targetCompanyId, includeDeleted, memberships]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const createEmployee = async (data: EmployeeFormData): Promise<Employee | null> => {
    if (!currentCompanyId) {
      toast.error('Vui lòng chọn công ty');
      return null;
    }

    try {
      const { data: newEmployee, error } = await supabase
        .from('employees')
        .insert([{
          ...data,
          company_id: currentCompanyId,
          status: data.status || 'active',
        }])
        .select()
        .single();

      if (error) throw error;

      // Log to history
      await supabase.from('employee_history').insert([{
        employee_id: newEmployee.id,
        company_id: currentCompanyId,
        action: 'create',
        changes: { new: newEmployee },
        performed_by: user?.id,
        performed_by_name: profile?.full_name || user?.email,
      }]);

      toast.success('Thêm nhân viên thành công');
      await fetchEmployees();
      return newEmployee;
    } catch (error: any) {
      console.error('Error creating employee:', error);
      if (error.code === '23505') {
        toast.error('Mã nhân viên đã tồn tại');
      } else {
        toast.error('Không thể thêm nhân viên');
      }
      return null;
    }
  };

  const updateEmployee = async (id: string, data: Partial<EmployeeFormData>): Promise<boolean> => {
    if (!currentCompanyId) return false;

    try {
      // Get current employee data for history
      const { data: oldEmployee } = await supabase
        .from('employees')
        .select('*')
        .eq('id', id)
        .single();

      const { data: updatedEmployee, error } = await supabase
        .from('employees')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Log to history
      await supabase.from('employee_history').insert([{
        employee_id: id,
        company_id: currentCompanyId,
        action: 'update',
        changes: { old: oldEmployee, new: updatedEmployee },
        performed_by: user?.id,
        performed_by_name: profile?.full_name || user?.email,
      }]);

      toast.success('Cập nhật thành công');
      await fetchEmployees();
      return true;
    } catch (error: any) {
      console.error('Error updating employee:', error);
      toast.error('Không thể cập nhật nhân viên');
      return false;
    }
  };

  const softDeleteEmployee = async (id: string, reason?: string): Promise<boolean> => {
    if (!currentCompanyId) return false;

    try {
      // Get current employee data for history
      const { data: oldEmployee } = await supabase
        .from('employees')
        .select('*')
        .eq('id', id)
        .single();

      const { error } = await supabase
        .from('employees')
        .update({
          deleted_at: new Date().toISOString(),
          deleted_by: user?.id,
          delete_reason: reason || 'Xóa bởi người dùng',
          status: 'deleted',
        })
        .eq('id', id);

      if (error) throw error;

      // Log to history
      await supabase.from('employee_history').insert([{
        employee_id: id,
        company_id: currentCompanyId,
        action: 'delete',
        changes: { old: oldEmployee },
        performed_by: user?.id,
        performed_by_name: profile?.full_name || user?.email,
        reason: reason || 'Xóa bởi người dùng',
      }]);

      toast.success('Đã xóa nhân viên');
      await fetchEmployees();
      return true;
    } catch (error: any) {
      console.error('Error deleting employee:', error);
      toast.error('Không thể xóa nhân viên');
      return false;
    }
  };

  const restoreEmployee = async (id: string): Promise<boolean> => {
    if (!currentCompanyId) return false;

    try {
      const { error } = await supabase
        .from('employees')
        .update({
          deleted_at: null,
          deleted_by: null,
          delete_reason: null,
          status: 'active',
        })
        .eq('id', id);

      if (error) throw error;

      // Log to history
      await supabase.from('employee_history').insert([{
        employee_id: id,
        company_id: currentCompanyId,
        action: 'restore',
        performed_by: user?.id,
        performed_by_name: profile?.full_name || user?.email,
      }]);

      toast.success('Đã khôi phục nhân viên');
      await fetchEmployees();
      return true;
    } catch (error: any) {
      console.error('Error restoring employee:', error);
      toast.error('Không thể khôi phục nhân viên');
      return false;
    }
  };

  return {
    employees,
    deletedEmployees,
    isLoading,
    createEmployee,
    updateEmployee,
    softDeleteEmployee,
    restoreEmployee,
    refetch: fetchEmployees,
  };
}
