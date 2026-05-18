import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { toErrorMessage } from '@/lib/apiError';
import {
  archiveEmployee as archiveEmployeeApi,
  createEmployee as createEmployeeApi,
  listEmployees as listEmployeesApi,
  restoreEmployee as restoreEmployeeApi,
  type HrmEmployeeRecord,
  updateEmployee as updateEmployeeApi,
} from '@/integrations/hrmApi';

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
  custom_fields?: Record<string, string>;
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
  custom_fields?: Record<string, string>;
}

export function useEmployees(includeDeleted: boolean = false, companyIdFilter?: string | null) {
  const { currentCompanyId, memberships } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [deletedEmployees, setDeletedEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Use specific filter, or null means all companies
  const targetCompanyId = companyIdFilter === undefined ? currentCompanyId : companyIdFilter;

  const mapEmployee = (row: HrmEmployeeRecord): Employee => ({
    id: row.id,
    company_id: row.company_id,
    employee_code: row.employee_code,
    full_name: row.full_name,
    email: row.email,
    phone: null,
    department: null,
    position: row.job_title_key,
    start_date: row.hired_at,
    end_date: null,
    status: row.status,
    avatar_url: null,
    salary: null,
    manager_id: null,
    gender: null,
    birth_date: null,
    id_number: null,
    id_issue_date: null,
    id_issue_place: null,
    permanent_address: null,
    temporary_address: null,
    emergency_contact: null,
    emergency_phone: null,
    employment_type: null,
    work_location: null,
    bank_name: null,
    bank_account: null,
    tax_code: null,
    social_insurance_number: null,
    health_insurance_number: null,
    custom_fields: row.custom_fields ?? {},
    deleted_at: row.archived_at,
    deleted_by: null,
    delete_reason: null,
    created_at: row.created_at,
    updated_at: row.updated_at,
  });

  const fetchEmployees = useCallback(async () => {
    const companyIdsRaw = targetCompanyId ? [targetCompanyId] : memberships.map((m) => m.company_id);
    const companyIds = [...new Set(companyIdsRaw.filter((id) => !!id && id !== 'all'))];

    if (companyIds.length === 0) {
      setEmployees([]);
      setDeletedEmployees([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const responses = await Promise.all(
        companyIds.map((companyId) =>
          listEmployeesApi({
            company_id: companyId,
            include_archived: includeDeleted,
            page: 1,
            page_size: 200,
          }),
        ),
      );
      const merged = responses.flatMap((res) => res.data).map(mapEmployee);
      setEmployees(merged.filter((e) => e.deleted_at == null));
      setDeletedEmployees(includeDeleted ? merged.filter((e) => e.deleted_at != null) : []);
    } catch (error: unknown) {
      console.error('Error fetching employees:', error);
      toast.error(toErrorMessage(error, 'Không thể tải danh sách nhân viên'));
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
      const payload = {
        company_id:
          (data as EmployeeFormData & { company_id?: string }).company_id?.trim() || currentCompanyId,
        employee_code: data.employee_code,
        full_name: data.full_name,
        email: data.email?.trim() || `${data.employee_code.toLowerCase()}@xevn.local`,
        job_title_key: data.position ?? undefined,
        hired_at: data.start_date ?? undefined,
        custom_fields: data.custom_fields ?? undefined,
      };
      const newEmployee = await createEmployeeApi(payload);
      toast.success('Thêm nhân viên thành công');
      await fetchEmployees();
      return mapEmployee(newEmployee);
    } catch (error: unknown) {
      console.error('Error creating employee:', error);
      toast.error(toErrorMessage(error, 'Không thể thêm nhân viên'));
      return null;
    }
  };

  const updateEmployee = async (id: string, data: Partial<EmployeeFormData>): Promise<boolean> => {
    try {
      await updateEmployeeApi(id, {
        email: data.email ?? undefined,
        full_name: data.full_name ?? undefined,
        job_title_key: data.position ?? undefined,
        hired_at: data.start_date ?? undefined,
        custom_fields: data.custom_fields ?? undefined,
      });
      toast.success('Cập nhật thành công');
      await fetchEmployees();
      return true;
    } catch (error: unknown) {
      console.error('Error updating employee:', error);
      toast.error(toErrorMessage(error, 'Không thể cập nhật nhân viên'));
      return false;
    }
  };

  const softDeleteEmployee = async (id: string, reason?: string): Promise<boolean> => {
    try {
      void reason; // giữ signature cũ cho UI, backend hiện chưa nhận lý do.
      await archiveEmployeeApi(id);
      toast.success('Đã xóa nhân viên');
      await fetchEmployees();
      return true;
    } catch (error: unknown) {
      console.error('Error deleting employee:', error);
      toast.error(toErrorMessage(error, 'Không thể xóa nhân viên'));
      return false;
    }
  };

  const restoreEmployee = async (id: string): Promise<boolean> => {
    try {
      await restoreEmployeeApi(id);
      toast.success('Đã khôi phục nhân viên');
      await fetchEmployees();
      return true;
    } catch (error: unknown) {
      console.error('Error restoring employee:', error);
      toast.error(toErrorMessage(error, 'Không thể khôi phục nhân viên'));
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
