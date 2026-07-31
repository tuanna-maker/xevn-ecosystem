/**
 * @CODE-MEMORY
 * Screen:     Requests → CreateLeaveRequest — medical certificate attach (ESS)
 * UC:         UC-HRM-MOB-06b
 * BR:         BR-LEAVE-DOC-01
 * SRS:        docs/hrm/MOBILE_W7_SRS_DELTA.md §4.2
 * TechSpec:   docs/hrm/MOBILE_W7_TECHSPEC_DELTA.md §3.5 · §5.2
 * Data:       docs/hrm/MOBILE_W7_DATA_CONTRACTS.md §3 (attachment_url SoT)
 * Purpose:    Client rules for leave medical docs — which leave types require
 *             attachment, MIME/size validation, submit gate, and Phase-1 single
 *             URL resolution for BE `attachment_url` column.
 * WorkItem:   PCOMP-W7-MOB-LEAVE-DOC · PCOMP-W7-MOB-LEAVE-DOC-02
 * Coded:      2026-07-19
 *
 * Callers:
 *   - CreateLeaveRequestScreen.tsx → leaveTypeRequiresAttachment / submitBlocked / step1Next
 *   - LeaveAttachmentPicker.tsx → validateLeaveAttachment
 *   - hrmFileUpload.ts → validateLeaveAttachmentUpload
 *
 * Callees:
 *   - (pure utils — no I/O)
 *
 * FE-Actions:
 *   | User action           | Handler                         | Lib / RPC                          |
 *   |-----------------------|---------------------------------|------------------------------------|
 *   | Select sick/maternity | leaveTypeRequiresAttachment     | show LeaveAttachmentPicker         |
 *   | Add file              | validateLeaveAttachment         | then uploadLeaveAttachmentFile     |
 *   | Tiếp tục (Bước 2)     | leaveCreateStep1NextBlocked     | Alert + nextDisabled               |
 *   | Gửi đơn               | leaveAttachmentSubmitBlocked    | POST leave-requests + attachment_url |
 *
 * BE-Chain: N/A (client rules) — wire: POST /files/upload?feature=leave-attachment
 *           → POST /attendance/leave-requests { attachment_url }
 *
 * Impact:     Wrong required-types → submit without doc or block annual wrongly
 * must_keep:  sick + maternity required; annual optional; max 10MB; PDF/JPEG/PNG/WebP;
 *             step-1 Tiếp tục requires valid uploadedUrl (/api/hrm/files/…)
 * SOLID:      SRP — BR-LEAVE-DOC validation only; picker/upload live elsewhere
 * LastVerified: utils/__tests__/leaveAttachment.test.ts · leaveDocUx.test.ts
 *
 * @CODE-MEMORY-CHANGE 2026-07-28 PCOMP-W7-MOB-LEAVE-DOC-02 — valid uploadedUrl gate
 *             (reject local/file URIs); leaveCreateStep1NextBlocked for goNext product path
 */

import type { LeaveTypeOption } from './leaveRequest';

/**
 * BR-LEAVE-DOC-01 — types that require medical certificate.
 * Union of SRS §4.2 `{sick, medical, maternity}` + DATA_CONTRACTS
 * `{sick, medical, maternity_medical}` + catalog alias LVT_02 (ốm).
 * Form options stay web-parity (`leaveTypeOptions`); aliases cover hydrate/catalog.
 */
export const LEAVE_DOC_REQUIRED_TYPES = new Set<string>([
  'sick',
  'medical',
  'maternity',
  'maternity_medical',
  'LVT_02',
]);

export const LEAVE_ATTACHMENT_MAX_BYTES = 10 * 1024 * 1024;
export const LEAVE_ATTACHMENT_MAX_FILES = 3;

export const LEAVE_ATTACHMENT_ALLOWED_MIME = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
]);

export type LeaveAttachmentDraft = {
  uri: string;
  fileName: string;
  mimeType: string;
  byteSize?: number;
  /** Set after successful upload — relative `/api/hrm/files/...` URL. */
  uploadedUrl?: string;
};

export function leaveTypeRequiresAttachment(leaveType: string): boolean {
  const key = leaveType?.trim() ?? '';
  if (!key) return false;
  if (LEAVE_DOC_REQUIRED_TYPES.has(key)) return true;
  if (LEAVE_DOC_REQUIRED_TYPES.has(key.toLowerCase())) return true;
  return false;
}

export function validateLeaveAttachment(payload: LeaveAttachmentDraft): string | null {
  const mime = payload.mimeType?.trim().toLowerCase() ?? '';
  if (!LEAVE_ATTACHMENT_ALLOWED_MIME.has(mime)) {
    return 'Chỉ hỗ trợ ảnh JPEG/PNG/WebP hoặc PDF.';
  }
  if (payload.byteSize != null && payload.byteSize > LEAVE_ATTACHMENT_MAX_BYTES) {
    return 'Tệp tối đa 10 MB.';
  }
  if (!payload.uri?.trim()) return 'Không đọc được tệp đính kèm.';
  return null;
}

/**
 * Phase 1 SoT is single column `attachment_url` (DATA_CONTRACTS §3).
 * SRS §4.2 mentions `attachment_urls[]` — client may collect ≤3 uploads but
 * submit uses first uploaded URL until BE multi-file lands.
 */
/**
 * DATA_CONTRACTS §3 / VAL-W7-LATT-02 — accept relative `/api/hrm/files/…`
 * or absolute https URL that contains that path. Reject local picks (`file://`).
 */
export function isValidLeaveAttachmentUploadedUrl(url: string | undefined | null): boolean {
  const trimmed = url?.trim() ?? '';
  if (!trimmed) return false;
  const lower = trimmed.toLowerCase();
  if (lower.startsWith('file:') || lower.startsWith('content:') || lower.startsWith('blob:')) {
    return false;
  }
  if (trimmed.startsWith('/api/hrm/files/')) return true;
  if (/^https:\/\//i.test(trimmed) && trimmed.includes('/api/hrm/files/')) return true;
  return false;
}

export function resolveLeaveAttachmentUrlForSubmit(drafts: LeaveAttachmentDraft[]): string | undefined {
  const url = drafts.find((d) => isValidLeaveAttachmentUploadedUrl(d.uploadedUrl))?.uploadedUrl?.trim();
  return url || undefined;
}

/** All successfully uploaded relative URLs (UI review / future multi-file BE). */
export function resolveLeaveAttachmentUrls(drafts: LeaveAttachmentDraft[]): string[] {
  return drafts
    .map((d) => d.uploadedUrl?.trim())
    .filter((u): u is string => isValidLeaveAttachmentUploadedUrl(u));
}

export function leaveAttachmentSubmitBlocked(
  leaveType: string,
  drafts: LeaveAttachmentDraft[],
): string | null {
  if (!leaveTypeRequiresAttachment(leaveType)) return null;
  const uploaded = drafts.filter((d) => isValidLeaveAttachmentUploadedUrl(d.uploadedUrl));
  if (uploaded.length === 0) {
    return 'Đơn nghỉ y tế cần đính kèm giấy tờ (ảnh hoặc PDF).';
  }
  return null;
}

/**
 * Product gate for CreateLeaveRequest step === 1 (Bước 2 · Loại nghỉ).
 * Used by goNext + nextDisabled — tests must assert this, not only submit().
 */
export function leaveCreateStep1NextBlocked(
  leaveType: string,
  drafts: LeaveAttachmentDraft[],
): string | null {
  return leaveAttachmentSubmitBlocked(leaveType, drafts);
}

/** Type guard helper for create-form chips that are LeaveTypeOption. */
export function isLeaveTypeOptionDocRequired(leaveType: LeaveTypeOption): boolean {
  return leaveTypeRequiresAttachment(leaveType);
}
