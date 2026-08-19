/**
 * @CODE-MEMORY
 * Screen:     EmployeeProfile → tab Giấy tờ (checklist hồ sơ)
 * UC:         UC-BP-CORE-03 · FR-UC-BP-CORE-03
 * BR:         BR-BP-DOC-01 · BR-CORE-03-PATH · BR-PLT-02 · AC-CORE-03-*
 * SRS:        SRS_HRM_ENTERPRISE.md FR-UC-BP-CORE-03 Diễn biến #1–#2
 * TechSpec:   docs/program/specs/PO-HRM-MVP-GD1-CORE-03-CLUSTER-API-01.md F-CORE-CHK-01
 * Purpose:    Helpers FE checklist — physical /employees/:id/document-checklist* SoT;
 *             status missing|submitted|approved; cấm Nest /core dual · FE invent DOC SoT ·
 *             hardcode required starter · claim CORE-07/personnel/printable DONE.
 * WorkItem:   PO-HRM-MVP-GD1-CORE-03-CLUSTER-FE-01
 * Coded:      2026-08-09
 * Callers:    EmployeeDocumentChecklist · useEmployeeDocumentChecklist · source tests
 * Callees:    (pure)
 * must_keep:  Physical document-checklist* · DOC/ET Settings RETAIN · U65 · honesty false · C-SLICE
 * LastVerified: empCoreChkRing.test.ts
 */

/** Toast / domain codes — space before slash in comments only (CODE-MEMORY safe). */
export const HRM_CORE_CHK_VAL_400_CODE = 'HRM-CORE-CHK-VAL-400';
export const HRM_CORE_CHK_CONFLICT_409_CODE = 'HRM-CORE-CHK-CONFLICT-409';
export const HRM_CORE_CHK_404_CODE = 'HRM-CORE-CHK-404';
export const HRM_EMP_DOC_TYPE_UNKNOWN_CODE = 'HRM-EMP-DOC-TYPE-UNKNOWN';

/** Physical Network SoT (O1). */
export const CORE_CHK_PATH_FRAGMENT = '/employees/';
export const CORE_CHK_SUFFIX = '/document-checklist';
export const CORE_CHK_DOC_TYPES_PATH = '/api/hrm/employees/document-types';
export const CORE_CHK_ET_PATH = '/api/hrm/employees/employment-types';

/** Paper alias — DENY as Nest SoT. */
export const CORE_CHK_PAPER_CORE_PATH = '/api/hrm/core/document-checklist';

export type CoreChkStatus = 'missing' | 'submitted' | 'approved';

export const CORE_CHK_STATUSES: readonly CoreChkStatus[] = [
  'missing',
  'submitted',
  'approved',
] as const;

export function isCoreChkPhysicalPath(path: string): boolean {
  return path.includes('/employees/') && path.includes('/document-checklist');
}

export function isCoreChkDocCatalogPhysicalPath(path: string): boolean {
  return path.includes('/employees/document-types');
}

export function isCoreChkEtCatalogPhysicalPath(path: string): boolean {
  return path.includes('/employees/employment-types');
}

/** Nest dual /core checklist or DOC catalog SoT — FAIL O1. */
export function isForbiddenCoreChkSotPath(path: string): boolean {
  if (!path.includes('/api/hrm/core/')) return false;
  return (
    path.includes('document-checklist') ||
    path.includes('document-types') ||
    path.includes('employment-types') ||
    path.includes('/documents')
  );
}

export function isCoreChkStatus(raw: string | null | undefined): raw is CoreChkStatus {
  const s = (raw ?? '').trim().toLowerCase();
  return s === 'missing' || s === 'submitted' || s === 'approved';
}

/** Fallback VI when BE omits status_label (display-ready prefer BE). */
export function chkStatusLabelFallback(status: string | null | undefined): string {
  const s = (status ?? '').trim().toLowerCase();
  if (s === 'submitted') return 'Đã nộp';
  if (s === 'approved') return 'Đã xác nhận';
  if (s === 'missing') return 'Thiếu / chờ nộp';
  return s || '—';
}

/** Diễn biến #1 — Nộp: missing → submitted. */
export function canSubmitChkItem(status: string | null | undefined): boolean {
  const s = (status ?? '').trim().toLowerCase();
  return s === 'missing' || s === '';
}

/** Diễn biến #2 — Xác nhận: submitted → approved. */
export function canApproveChkItem(status: string | null | undefined): boolean {
  const s = (status ?? '').trim().toLowerCase();
  return s === 'submitted';
}

/** Yêu cầu nộp lại: approved|submitted → missing. */
export function canReopenChkItem(status: string | null | undefined): boolean {
  const s = (status ?? '').trim().toLowerCase();
  return s === 'submitted' || s === 'approved';
}

/**
 * Client gate — key required before POST. Does NOT invent required starter set from FE.
 * Catalog requiredByDefault is BE SoT on create when body.required omitted.
 */
export function validateChkCreateGate(input: {
  documentTypeKey: string;
}): string | null {
  if (!(input.documentTypeKey ?? '').trim()) {
    return 'Thiếu mã loại giấy tờ. Chọn từ catalog hiệu lực (Cài đặt → Loại giấy tờ EMP).';
  }
  return null;
}

/** Honesty flags — FE MUST NOT flip. */
export const CORE_CHK_UAT_HONESTY = {
  recruitment_uat_ready: false,
  jd_dynamic_done: false,
  contracts_printable_ready: false,
  hrm_personnel_uat_ready: false,
} as const;
