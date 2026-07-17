import { useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { toErrorMessage } from '@/lib/apiError';
import {
  archiveEmployee as archiveEmployeeApi,
  createEmployee as createEmployeeApi,
  restoreEmployee as restoreEmployeeApi,
  updateEmployee as updateEmployeeApi,
} from '@/integrations/hrmApi';
import { mapHrmEmployeeRecord, mergeEmployeeAvatarWriteFields } from '@/hooks/useEmployee';
import type { Employee, EmployeeFormData } from '@/hooks/useEmployees';

/**
 * Employee write operations without listAllEmployees fetch storm.
 * P1-HRM-PERF-FE-02 — use on profile/detail screens that only need mutations.
 */
export function useEmployeeMutations(opts?: { onMutated?: () => void | Promise<void> }) {
  const { currentCompanyId } = useAuth();
  const onMutated = opts?.onMutated;

  const afterMutate = useCallback(async () => {
    if (onMutated) await onMutated();
  }, [onMutated]);

  const createEmployee = useCallback(
    async (data: EmployeeFormData): Promise<Employee | null> => {
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
        await afterMutate();
        return mapHrmEmployeeRecord(newEmployee);
      } catch (error: unknown) {
        console.error('Error creating employee:', error);
        toast.error(toErrorMessage(error, 'Không thể thêm nhân viên'));
        return null;
      }
    },
    [afterMutate, currentCompanyId],
  );

  const updateEmployee = useCallback(
    async (id: string, data: Partial<EmployeeFormData>): Promise<boolean> => {
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
        await afterMutate();
        return true;
      } catch (error: unknown) {
        console.error('Error updating employee:', error);
        toast.error(toErrorMessage(error, 'Không thể cập nhật nhân viên'));
        return false;
      }
    },
    [afterMutate],
  );

  const softDeleteEmployee = useCallback(
    async (id: string, reason?: string): Promise<boolean> => {
      try {
        void reason;
        await archiveEmployeeApi(id);
        toast.success('Đã xóa nhân viên');
        await afterMutate();
        return true;
      } catch (error: unknown) {
        console.error('Error deleting employee:', error);
        toast.error(toErrorMessage(error, 'Không thể xóa nhân viên'));
        return false;
      }
    },
    [afterMutate],
  );

  const restoreEmployee = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        await restoreEmployeeApi(id);
        toast.success('Đã khôi phục nhân viên');
        await afterMutate();
        return true;
      } catch (error: unknown) {
        console.error('Error restoring employee:', error);
        toast.error(toErrorMessage(error, 'Không thể khôi phục nhân viên'));
        return false;
      }
    },
    [afterMutate],
  );

  return {
    createEmployee,
    updateEmployee,
    softDeleteEmployee,
    restoreEmployee,
  };
}
