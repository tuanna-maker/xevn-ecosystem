/**
 * @CODE-MEMORY
 * Screen:     Attendance → LeaveTab → Tạo yêu cầu nghỉ (đính kèm giấy bác sĩ)
 * UC:         FR-UC-H03 · UC-H03 · J-HRM-06 · LV-04
 * BR:         BR-LEAVE-ATT-01
 * SRS:        docs/brand-new-documents-20270801/SRS_NEW.md § FR-UC-H03 · chứng từ nghỉ ốm ≥3 ngày
 * TechSpec:   docs/brand-new-documents-20270801/API_CONTRACT_NEW.md §4 leave create · attachment_url
 * Purpose:    Client rules for web leave medical attachment — sick/ốm catalog codes
 *             (LVT_02 / sick / medical), show picker, require when total_days≥3,
 *             normalize upload URL to relative `/api/hrm/files/…` for Nest VAL-ATT.
 * WorkItem:   R-SPINE-LV04-ATTACH-FE-01
 * Coded:      2026-08-03
 *
 * Callers:
 *   - components/attendance/LeaveTab.tsx → show / require / validate / submit URL
 *   - hooks/useLeaveRequests.ts → buildLeaveCreatePayload.attachment_url
 *
 * Callees: none (pure utils)
 *
 * FE-Actions:
 *   | Select ốm / LVT_02     | shouldShowLeaveAttachmentControl | show file input |
 *   | Pick file              | validateLeaveAttachmentFile       | MIME/size gate  |
 *   | Upload OK              | toLeaveAttachmentUrlForApi        | relative path   |
 *   | Gửi (ốm ≥3d)           | leaveAttachmentSubmitBlocked      | block if thiếu  |
 *
 * BE-Chain: POST /api/hrm/files/upload?feature=leave-attachment → POST leave-requests { attachment_url }
 *
 * Impact:     Missing control → LV-04 BLOCKED; wrong URL form → HRM-LEAVE-VAL-ATT
 * must_keep:  BR-LEAVE-ATT-01 ốm≥3; LVT_02 + sick aliases; relative /api/hrm/files/; U65 no seed
 * SOLID:      SRP — BR/validation only; upload I/O stays in LeaveTab + uploadHrmFile
 * LastVerified: apps/web/hrm/src/lib/leaveAttachment.test.ts
 */

/** Catalog + literal codes that map to nghỉ ốm (parity mobile leaveAttachment + BE VAL-ATT). */
export const SICK_LEAVE_TYPE_CODES = new Set([
  'sick',
  'medical',
  'LVT_02',
  'lvt_02',
]);

export const LEAVE_ATTACHMENT_MAX_BYTES = 10 * 1024 * 1024;

export const LEAVE_ATTACHMENT_ALLOWED_MIME = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
]);

/** Upload feature query — BE sanitizes `-` → `_` → filename `leave_attachment-…`. */
export const LEAVE_ATTACHMENT_UPLOAD_FEATURE = 'leave-attachment';

export const LEAVE_SICK_ATTACHMENT_MIN_DAYS = 3;

/**
 * Detect nghỉ ốm from catalog code and/or display label (VI «Ốm»).
 */
export function isSickLeaveType(
  leaveType: string,
  leaveTypeLabel?: string | null,
): boolean {
  const key = leaveType?.trim() ?? '';
  if (!key) return false;
  if (SICK_LEAVE_TYPE_CODES.has(key) || SICK_LEAVE_TYPE_CODES.has(key.toLowerCase())) {
    return true;
  }
  const lower = key.toLowerCase();
  if (lower.includes('sick') || lower === 'om' || lower.includes('nghi-om') || lower.includes('nghi_om')) {
    return true;
  }
  const label = (leaveTypeLabel ?? '').trim().toLowerCase();
  if (!label) return false;
  // VI «ốm» / EN sick — avoid loose «om» substring false positives.
  return label.includes('ốm') || label.includes('sick');
}

/** Show attach control when loại nghỉ is ốm (user can upload before days settle). */
export function shouldShowLeaveAttachmentControl(
  leaveType: string,
  leaveTypeLabel?: string | null,
): boolean {
  return isSickLeaveType(leaveType, leaveTypeLabel);
}

/** BR-LEAVE-ATT-01 — ốm ≥ 3 ngày bắt buộc đính kèm. */
export function leaveAttachmentRequired(
  leaveType: string,
  totalDays: number,
  leaveTypeLabel?: string | null,
): boolean {
  return isSickLeaveType(leaveType, leaveTypeLabel) && totalDays >= LEAVE_SICK_ATTACHMENT_MIN_DAYS;
}

export function validateLeaveAttachmentFile(file: File): string | null {
  const mime = (file.type || '').trim().toLowerCase();
  if (!LEAVE_ATTACHMENT_ALLOWED_MIME.has(mime)) {
    return 'Chỉ hỗ trợ ảnh JPEG/PNG/WebP hoặc PDF.';
  }
  if (file.size > LEAVE_ATTACHMENT_MAX_BYTES) {
    return 'Tệp tối đa 10 MB.';
  }
  return null;
}

/**
 * Nest createLeaveRequest accepts only relative `/api/hrm/files/{scope}/…`.
 * `uploadHrmFile` may return absolute URL — strip origin.
 */
export function toLeaveAttachmentUrlForApi(url: string | null | undefined): string | undefined {
  const trimmed = url?.trim() ?? '';
  if (!trimmed) return undefined;
  const lower = trimmed.toLowerCase();
  if (lower.startsWith('file:') || lower.startsWith('blob:') || lower.startsWith('content:')) {
    return undefined;
  }
  if (trimmed.startsWith('/api/hrm/files/')) return trimmed;
  const idx = trimmed.indexOf('/api/hrm/files/');
  if (idx >= 0) return trimmed.slice(idx);
  return undefined;
}

export function isValidLeaveAttachmentUploadedUrl(url: string | null | undefined): boolean {
  const relative = toLeaveAttachmentUrlForApi(url);
  if (!relative) return false;
  return /^\/api\/hrm\/files\/[a-zA-Z0-9_-]+\/.+$/.test(relative);
}

/** Block Gửi when BR-LEAVE-ATT-01 applies and no valid uploaded URL. */
export function leaveAttachmentSubmitBlocked(
  leaveType: string,
  totalDays: number,
  attachmentUrl: string | null | undefined,
  leaveTypeLabel?: string | null,
): string | null {
  if (!leaveAttachmentRequired(leaveType, totalDays, leaveTypeLabel)) return null;
  if (!isValidLeaveAttachmentUploadedUrl(attachmentUrl)) {
    return 'Nghỉ ốm từ 3 ngày trở lên cần đính kèm giấy bác sĩ (ảnh hoặc PDF).';
  }
  return null;
}
