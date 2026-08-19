/**
 * @CODE-MEMORY
 * Screen:     /attendance → Thiết lập → Nhân viên (matrix #31)
 * UC:         HRM-IM-01 · FR-HRM-IM-01 (reuse employee spreadsheet import)
 * BR:         ATT-C7 · matrix #31 refresh + import
 * SRS:        docs/hrm/BANG_TONG_HOP_USECASE_HRM.md HRM-IM-01 · docs/hrm/TECHSPEC.md FR-HRM-IM-01
 * TechSpec:   POST /api/hrm/spreadsheet/import/preview|commit · kind=employee_import
 * Purpose:    Resolve spreadsheet scope + CTA intent for Settings→Nhân viên (không fake import).
 * WorkItem:   PO-MFD-M2-ATT-SETTINGS-EMP-01-FE
 * Coded:      2026-08-04
 * Callers:    Attendance.tsx settings employees panel
 * Callees:    EmployeeImportDialog · useEmployees.refetch
 * must_keep:  Fail-closed khi thiếu companyId; không invent attendance-only import API
 * SOLID:      Pure helpers — page chỉ wire onClick
 * LastVerified: apps/web/hrm/src/lib/attendanceSettingsEmployeesActions.test.ts
 */

import type { HrmSpreadsheetScope } from '@/integrations/hrmApi';

/** Same tenant/company pairing as Employees.tsx importSpreadsheetScope. */
export function resolveAttendanceEmployeeImportScope(
  companyId: string | null | undefined,
  tenantEnv?: string | null,
): HrmSpreadsheetScope | null {
  const trimmed = companyId?.trim();
  if (!trimmed) return null;
  const tenantFromEnv = tenantEnv?.trim();
  return {
    tenantId: tenantFromEnv && tenantFromEnv.length > 0 ? tenantFromEnv : trimmed,
    companyId: trimmed,
  };
}
