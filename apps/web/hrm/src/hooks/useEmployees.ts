import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { toErrorMessage } from '@/lib/apiError';
import { getHrmPortalMode } from '@/lib/hrmPortalMode';
import { HRM_API_MAX_PAGE_SIZE } from '@/lib/hrmDataMode';
import { coerceHrmListCompanyId } from '@/lib/hrmListScope';
import {
  archiveEmployee as archiveEmployeeApi,
  createEmployee as createEmployeeApi,
  listAllEmployees as listAllEmployeesApi,
  restoreEmployee as restoreEmployeeApi,
  type HrmEmployeeRecord,
  updateEmployee as updateEmployeeApi,
} from '@/integrations/hrmApi';
import { mapHrmEmployeeRecord, mergeEmployeeAvatarWriteFields } from '@/hooks/useEmployee';

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

export function useEmployees(
  includeDeleted: boolean = false,
  companyIdFilter?: string | null,
  opts?: { enabled?: boolean },
) {
  const enabled = opts?.enabled !== false;
  const { currentCompanyId, memberships } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [deletedEmployees, setDeletedEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Use specific filter, or null means all companies
  const targetCompanyId = companyIdFilter === undefined ? currentCompanyId : companyIdFilter;

  const mapEmployee = (row: HrmEmployeeRecord): Employee => mapHrmEmployeeRecord(row);

  const fetchEmployees = useCallback(async () => {
    const portalEmbed =
      typeof window !== 'undefined' && getHrmPortalMode(window.location.search);
    const companyIdsRaw = targetCompanyId
      ? [targetCompanyId]
      : portalEmbed
        ? currentCompanyId
          ? [currentCompanyId]
          : []
        : memberships.map((m) => m.company_id);
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
          listAllEmployeesApi({
            company_id: coerceHrmListCompanyId(companyId),
            include_archived: includeDeleted,
            page_size: HRM_API_MAX_PAGE_SIZE,
          }),
        ),
      );
      const merged = responses.flatMap((res) => res.data ?? []).map(mapEmployee);
      setEmployees(merged.filter((e) => e.deleted_at == null));
      setDeletedEmployees(includeDeleted ? merged.filter((e) => e.deleted_at != null) : []);
    } catch (error: unknown) {
      console.error('Error fetching employees:', error);
      toast.error(toErrorMessage(error, 'Không thể tải danh sách nhân viên'));
    } finally {
      setIsLoading(false);
    }
  }, [targetCompanyId, includeDeleted, memberships, currentCompanyId]);

  useEffect(() => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }
    void fetchEmployees();
  }, [fetchEmployees, enabled]);

  const createEmployee = async (data: EmployeeFormData): Promise<Employee | null> => {
    if (!currentCompanyId) {
      toast.error('Vui lòng chọn công ty');
      return null;
    }

    try {
      const avatarFields = mergeEmployeeAvatarWriteFields(data.avatar_url, data.custom_fields);
      const payload = {
        company_id:
          (data as EmployeeFormData & { company_id?: string }).company_id?.trim() || currentCompanyId,
        employee_code: data.employee_code,
        full_name: data.full_name,
        email: data.email?.trim() || `${data.employee_code.toLowerCase()}@xevn.local`,
        job_title_key: data.position ?? undefined,
        hired_at: data.start_date ?? undefined,
        ...avatarFields,
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
      const avatarFields = mergeEmployeeAvatarWriteFields(data.avatar_url, data.custom_fields);
      await updateEmployeeApi(id, {
        email: data.email ?? undefined,
        full_name: data.full_name ?? undefined,
        job_title_key: data.position ?? undefined,
        hired_at: data.start_date ?? undefined,
        ...avatarFields,
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
