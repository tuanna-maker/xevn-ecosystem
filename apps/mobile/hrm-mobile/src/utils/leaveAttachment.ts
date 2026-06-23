import type { LeaveTypeOption } from './leaveRequest';

/** BR-LEAVE-DOC-01 — leave types that require medical certificate (W7-3 SRS §4.2). */
export const LEAVE_DOC_REQUIRED_TYPES = new Set<LeaveTypeOption>(['sick', 'maternity']);

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
  return LEAVE_DOC_REQUIRED_TYPES.has(leaveType as LeaveTypeOption);
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

/** Phase 1 column is single `attachment_url` — use first uploaded URL on submit. */
export function resolveLeaveAttachmentUrlForSubmit(drafts: LeaveAttachmentDraft[]): string | undefined {
  const url = drafts.find((d) => d.uploadedUrl?.trim())?.uploadedUrl?.trim();
  return url || undefined;
}

export function leaveAttachmentSubmitBlocked(
  leaveType: string,
  drafts: LeaveAttachmentDraft[],
): string | null {
  if (!leaveTypeRequiresAttachment(leaveType)) return null;
  const uploaded = drafts.filter((d) => d.uploadedUrl?.trim());
  if (uploaded.length === 0) {
    return 'Đơn nghỉ y tế cần đính kèm giấy tờ (ảnh hoặc PDF).';
  }
  return null;
}
