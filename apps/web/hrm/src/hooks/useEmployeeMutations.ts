import { useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { ApiClientError, toErrorMessage } from '@/lib/apiError';
import {
  HRM_EMP_STATUS_KEY_CODE,
  HRM_EMP_STATUS_REASON_KEY_CODE,
  normalizeEmpEmploymentStatusKey,
  normalizeEmpStatusReasonKey,
} from '@/lib/empEmploymentStatusCatalog';
import {
  empMutateKeyToastMessage,
  isValidEmpPositionKeyFormat,
  normalizeEmpPositionKey,
} from '@/lib/empPositionCatalog';
import {
  empDeptKeyToastFirst,
  mergeEmployeeDepartmentWriteFields,
} from '@/lib/empDeptCatalog';
import {
  archiveEmployee as archiveEmployeeApi,
  createEmployee as createEmployeeApi,
  restoreEmployee as restoreEmployeeApi,
  updateEmployee as updateEmployeeApi,
} from '@/integrations/hrmApi';
import { mapHrmEmployeeRecord, mergeEmployeeAvatarWriteFields } from '@/hooks/useEmployee';
import type { Employee, EmployeeFormData } from '@/hooks/useEmployees';
import { stripCoreCbKeysFromRecord } from '@/lib/empCorePublicRing';

/**
 * @CODE-MEMORY-CHANGE 2026-08-03 R-SPINE-MGR-HIER-01-FE
 * change_mode: ADD
 * What: Forward manager_id on POST/PATCH create/update employee
 * Why: UC-H01 Option B — QL trực tiếp → employees.manager_id for FR-UC-H03 L1
 * must_keep: avatar custom_fields merge; SoftDel archive/restore; U65 no seed
 *
 * @CODE-MEMORY-CHANGE 2026-08-08 PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-CATALOG-FE-01
 * change_mode: ADD
 * What: Forward status + status_reason_key; surface HRM-EMP-STATUS-KEY / REASON-KEY toast VI
 * Why: SA Option A — submit Nest keys; invent → Network 400 KEY + toast (peer ATT-CODE mutations)
 * must_keep: SoftDel; manager_id; avatar; no FE-ADMIN invent; personnel=false; L1 EMPSTQA RETAIN
 *
 * @CODE-MEMORY-CHANGE 2026-08-08 PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-POSITION-CATALOG-FE-01-R2
 * change_mode: ADD
 * What: Normalize + forward job_title_key; surface HRM-EMP-POSITION-KEY / WH-PICK-REQUIRED toast VI
 * Why: SA Option A · R-PLT-EMP-POS-FE-01 · AC-PLT-EMP-01b · STAFF OBS · peer STATUS KEY toast
 * must_keep: POSITION KEY · EMP-STATUS FE CLOSED · SoftDel; manager; status/reason KEY;
 *            Nest emp_position DENY · LVRULE HOLD · EMP-CUSTOM · ATT · personnel=false · U65
 *
 * @CODE-MEMORY-CHANGE 2026-08-08 PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-DEPT-CATALOG-FE-01
 * change_mode: ADD
 * What: Surface DEPT invent KEY toast first (HRM-EMP-DEPT-KEY / WH alias HRM-WH-DEPT-KEY) via
 *       empDeptKeyToastFirst → then POSITION/WH-PICK → then STATUS/REASON; department already
 *       forwarded on create/update payload (base EmployeeFormData) — no field add.
 * Why: SA Option A · R-PLT-EMP-DEPT-FE-01 · AC-PLT-EMP-DEPT-01b — invent → 400 KEY + VI toast · no persist
 * must_keep: DEPT KEY · POSITION KEY · EMP-STATUS FE CLOSED · SoftDel; manager; status/reason;
 *            Nest emp_department DENY · Nest emp_position DENY · LVRULE HOLD · EMP-CUSTOM · ATT · U65
 *
 * @CODE-MEMORY-CHANGE 2026-08-08 PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-DEPT-CATALOG-FE-02
 * change_mode: FIX
 * What: Route form `department` → create/update payload `custom_fields.department` via
 *       mergeEmployeeDepartmentWriteFields (BE từ chối top-level `department` HRM-VAL-001).
 *       Fresh picker value overrides stale echoed custom_fields.department; empty clears.
 *       Load/edit hydrate đã đọc custom_fields.department qua resolveEmployeeDepartmentLabel →
 *       F5 hiện lại đúng mã.
 * Why: QA FAIL EMPDEPTQAFE-MSKG2900 · R-PLT-EMP-DEPT-FE-01 OPEN — «Lưu never sends department»
 *      → F5 empty. SA Option A storage path = custom_fields.department.
 * must_keep: DEPT KEY L1 · POSITION KEY · EMP-POSITION FE CLOSED · EMP-STATUS FE CLOSED ·
 *            EMP-CUSTOM · ATT · LVRULE HOLD · Nest emp_department DENY · Nest emp_position DENY ·
 *            SoftDel; manager; status/reason; avatar merge; honesty false · C-SLICE · U65
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-CORE-01-CLUSTER-FE-01
 * change_mode: UPGRADE
 * What: Strip C&B deny keys from custom_fields before POST/PATCH /employees; toast HRM-CORE-CB-403 via toErrorMessage
 * Why: UC-BP-CORE-01 O3/O4 · AC-CORE-PUB-01 · AC-CORE-CB-MAP-01 — cấm same-form salary via CF leak
 * must_keep: SoftDel; DEPT/POS/ST KEY; Nest /employees physical only; hire≠CORE DONE; U65; C-SLICE
 */

/** Form may carry companion Nest reason_key (not on base EmployeeFormData yet). */
type EmployeeMutateFormData = EmployeeFormData & {
  company_id?: string;
  status_reason_key?: string | null;
};

function empStatusKeyToastMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiClientError) {
    if (error.code === HRM_EMP_STATUS_KEY_CODE) {
      return (
        error.message?.trim() ||
        'Trạng thái nhân viên không thuộc danh mục hiệu lực. Chọn mã từ danh sách hoặc cấu hình trong Cài đặt → Trạng thái NV (CH06e).'
      );
    }
    if (error.code === HRM_EMP_STATUS_REASON_KEY_CODE) {
      return (
        error.message?.trim() ||
        'Lý do trạng thái không hợp lệ hoặc bắt buộc khi trạng thái yêu cầu lý do. Chọn mã từ danh sách lý do hiệu lực.'
      );
    }
  }
  return toErrorMessage(error, fallback);
}

/** DEPT KEY first (HRM-EMP-DEPT-KEY / WH-DEPT), then POSITION / WH-PICK, then STATUS/REASON (peer). */
function empFormMutateToastMessage(error: unknown, fallback: string): string {
  return empDeptKeyToastFirst(error, fallback, (err, fb) =>
    empMutateKeyToastMessage(err, fb, empStatusKeyToastMessage),
  );
}

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
    async (data: EmployeeMutateFormData): Promise<Employee | null> => {
      if (!currentCompanyId) {
        toast.error('Vui lòng chọn công ty');
        return null;
      }

      try {
        const publicCf = stripCoreCbKeysFromRecord(data.custom_fields);
        const avatarFields = mergeEmployeeAvatarWriteFields(data.avatar_url, publicCf);
        // BE rejects top-level `department` (HRM-VAL-001) → route into custom_fields.department.
        const writeFields = mergeEmployeeDepartmentWriteFields(data.department, avatarFields);
        if (writeFields.custom_fields) {
          writeFields.custom_fields =
            stripCoreCbKeysFromRecord(writeFields.custom_fields) ?? {};
        }
        const statusKey = data.status?.trim()
          ? normalizeEmpEmploymentStatusKey(data.status)
          : undefined;
        const reasonRaw = data.status_reason_key;
        const statusReasonKey =
          reasonRaw === undefined
            ? undefined
            : reasonRaw?.trim()
              ? normalizeEmpStatusReasonKey(reasonRaw)
              : null;
        const jobTitleKey = data.position?.trim()
          ? normalizeEmpPositionKey(data.position)
          : undefined;
        if (jobTitleKey && !isValidEmpPositionKeyFormat(jobTitleKey)) {
          toast.error(
            'Chức danh phải là mã từ danh mục job_titles — chọn từ danh sách, không dùng tên hiển thị.',
          );
          return null;
        }
        const payload = {
          company_id: data.company_id?.trim() || currentCompanyId,
          employee_code: data.employee_code,
          full_name: data.full_name,
          email: data.email?.trim() || `${data.employee_code.toLowerCase()}@xevn.local`,
          ...(jobTitleKey ? { job_title_key: jobTitleKey } : {}),
          hired_at: data.start_date ?? undefined,
          manager_id:
            data.manager_id === undefined
              ? undefined
              : data.manager_id?.trim()
                ? data.manager_id.trim()
                : null,
          ...(statusKey ? { status: statusKey } : {}),
          ...(statusReasonKey !== undefined ? { status_reason_key: statusReasonKey } : {}),
          ...writeFields,
        };
        const newEmployee = await createEmployeeApi(payload);
        toast.success('Thêm nhân viên thành công');
        await afterMutate();
        return mapHrmEmployeeRecord(newEmployee);
      } catch (error: unknown) {
        console.error('Error creating employee:', error);
        toast.error(empFormMutateToastMessage(error, 'Không thể thêm nhân viên'));
        return null;
      }
    },
    [afterMutate, currentCompanyId],
  );

  const updateEmployee = useCallback(
    async (id: string, data: Partial<EmployeeMutateFormData>): Promise<boolean> => {
      try {
        const publicCf = stripCoreCbKeysFromRecord(data.custom_fields);
        const avatarFields = mergeEmployeeAvatarWriteFields(data.avatar_url, publicCf);
        // BE rejects top-level `department` (HRM-VAL-001) → route into custom_fields.department.
        const writeFields = mergeEmployeeDepartmentWriteFields(data.department, avatarFields);
        if (writeFields.custom_fields) {
          writeFields.custom_fields =
            stripCoreCbKeysFromRecord(writeFields.custom_fields) ?? {};
        }
        const statusKey = data.status?.trim()
          ? normalizeEmpEmploymentStatusKey(data.status)
          : undefined;
        const reasonRaw = data.status_reason_key;
        const statusReasonKey =
          reasonRaw === undefined
            ? undefined
            : reasonRaw?.trim()
              ? normalizeEmpStatusReasonKey(reasonRaw)
              : null;
        const jobTitleKey =
          data.position === undefined
            ? undefined
            : data.position?.trim()
              ? normalizeEmpPositionKey(data.position)
              : undefined;
        if (jobTitleKey && !isValidEmpPositionKeyFormat(jobTitleKey)) {
          toast.error(
            'Chức danh phải là mã từ danh mục job_titles — chọn từ danh sách, không dùng tên hiển thị.',
          );
          return false;
        }
        if (jobTitleKey !== undefined && writeFields.custom_fields) {
          delete writeFields.custom_fields.job_title_label;
        }
        await updateEmployeeApi(id, {
          email: data.email ?? undefined,
          full_name: data.full_name ?? undefined,
          ...(jobTitleKey !== undefined ? { job_title_key: jobTitleKey } : {}),
          hired_at: data.start_date ?? undefined,
          ...(data.manager_id !== undefined
            ? {
                manager_id: data.manager_id?.trim() ? data.manager_id.trim() : null,
              }
            : {}),
          ...(statusKey ? { status: statusKey } : {}),
          ...(statusReasonKey !== undefined ? { status_reason_key: statusReasonKey } : {}),
          ...writeFields,
        });
        toast.success('Cập nhật thành công');
        await afterMutate();
        return true;
      } catch (error: unknown) {
        console.error('Error updating employee:', error);
        toast.error(empFormMutateToastMessage(error, 'Không thể cập nhật nhân viên'));
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
