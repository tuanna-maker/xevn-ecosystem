/**
 * @CODE-MEMORY
 * Screen:     /hr/recruitment — YCTD → Quét kho CV nội bộ (UC-BP-REC-04)
 * UC:         UC-BP-REC-04
 * BR:         BR-BP-CV-01 · BR-REC-CV-* · O1–O8
 * SRS:        SRS_HRM_ENTERPRISE.md FR-UC-BP-REC-04 Diễn biến #1–#2 · 0-hits/skip
 * TechSpec:   docs/program/specs/PO-HRM-MVP-GD1-REC-04-CLUSTER-API-01.md F-REC-CV-SCAN-01..03 · §5.4 gate
 * Purpose:    Pure helpers — scan criteria (title+skill/exp), scan status from DTO flags,
 *             posted gate client UX, VI copy. FE does not invent flag SoT (VAL-21).
 * WorkItem:   PO-HRM-MVP-GD1-REC-04-CLUSTER-FE-01
 * Coded:      2026-08-09
 * Callers:    InternalCvScanDialog · JobRequisitionsTab · jobRequisitionYctdWave2
 * Callees:    none (pure)
 * must_keep:  physical /recruitment/* · UV-YCTD attach cite · REC-03 OUT · U65 · honesty false
 * SOLID:      Pure module — dialog/tab consume helpers only
 * LastVerified: docs/qa/evidence/po-hrm-mvp-gd1-rec-04-cluster-fe-01.md
 */
import type { HrmJobRequisition, HrmJobRequisitionPipelineFlags } from '@/integrations/hrmApi';

export const YCTD_CV_SCAN_TITLE_VI = 'Quét kho CV nội bộ';

export const YCTD_CV_SCAN_HINT_VI =
  'Trước khi bật «Đã đăng tin» (kênh ngoài GĐ1), quét kho nội bộ theo chức danh + kỹ năng/kinh nghiệm. Không mở Campaign.';

export const YCTD_CV_SCAN_CRITERIA_REQUIRED_VI =
  'Bắt buộc chọn/nhập chức danh và ít nhất một tiêu chí kỹ năng hoặc kinh nghiệm (không chỉ tìm theo tên hành chính).';

export const YCTD_CV_SCAN_ZERO_HITS_VI =
  'Đã quét — 0 kết quả khớp. Có thể hoàn tất quét mà không gắn UV.';

export const YCTD_CV_SCAN_DONE_BADGE_VI = 'Đã quét kho';

export const YCTD_CV_SCAN_SKIPPED_BADGE_VI = 'Đã bỏ qua quét';

export const YCTD_CV_SCAN_PENDING_BADGE_VI = 'Chưa quét kho';

export const YCTD_CV_SCAN_SKIP_REASON_REQUIRED_VI =
  'Bỏ qua quét bắt buộc nhập lý do (HR/TP).';

export const YCTD_CV_SCAN_POSTED_BLOCKED_VI =
  'Chưa quét kho hoặc bỏ qua có lý do — không bật «Đã đăng tin» (BR-BP-CV-01).';

export const YCTD_CV_SCAN_COMPLETE_TOAST_VI = 'Đã ghi nhận quét kho nội bộ trên YCTD.';

export const YCTD_CV_SCAN_SKIP_TOAST_VI = 'Đã bỏ qua quét kho — lý do đã lưu trên YCTD.';

export const YCTD_CV_SCAN_ATTACH_TOAST_VI = 'Đã gắn ứng viên kho vào pipeline YCTD.';

export const YCTD_CV_SCAN_EMPTY_CTA_VI =
  'Không có UV khớp trong phạm vi. Điều chỉnh tiêu chí hoặc hoàn tất quét (0 kết quả).';

export type CvScanCriteriaInput = {
  position_code?: string | null;
  position?: string | null;
  skill?: string | null;
  experience?: string | null;
  experience_min_years?: number | null;
};

/** O4 — title family + ≥1 skill|experience dimension (exact-title-only = FAIL). */
export function validateCvScanCriteria(
  input: CvScanCriteriaInput,
): { ok: true } | { ok: false; message: string } {
  const title =
    String(input.position_code ?? '').trim() ||
    String(input.position ?? '').trim();
  if (!title) {
    return { ok: false, message: YCTD_CV_SCAN_CRITERIA_REQUIRED_VI };
  }
  const skill = String(input.skill ?? '').trim();
  const experience = String(input.experience ?? '').trim();
  const years = input.experience_min_years;
  const hasSkillOrExp =
    skill.length > 0 ||
    experience.length > 0 ||
    (typeof years === 'number' && Number.isFinite(years) && years >= 0);
  if (!hasSkillOrExp) {
    return { ok: false, message: YCTD_CV_SCAN_CRITERIA_REQUIRED_VI };
  }
  return { ok: true };
}

export type CvScanAuditState = 'pending' | 'done' | 'skipped';

/** Display-ready from BE pipeline_flags — do not invent SoT. */
export function resolveCvScanAuditState(
  flags: HrmJobRequisitionPipelineFlags | null | undefined,
): CvScanAuditState {
  if (!flags) return 'pending';
  if (flags.internal_scan_skipped === true) return 'skipped';
  if (flags.internal_scan_done === true) return 'done';
  return 'pending';
}

export function cvScanAuditBadgeLabel(state: CvScanAuditState): string {
  if (state === 'done') return YCTD_CV_SCAN_DONE_BADGE_VI;
  if (state === 'skipped') return YCTD_CV_SCAN_SKIPPED_BADGE_VI;
  return YCTD_CV_SCAN_PENDING_BADGE_VI;
}

/** O5 / BR-BP-CV-01 — posted only after done|skip valid (reason when skipped). */
export function canSetYctdPostedFromScan(
  flags: HrmJobRequisitionPipelineFlags | null | undefined,
): boolean {
  if (!flags) return false;
  if (flags.internal_scan_done === true) return true;
  if (
    flags.internal_scan_skipped === true &&
    String(flags.internal_scan_skip_reason ?? '').trim().length > 0
  ) {
    return true;
  }
  return false;
}

export function resolveDefaultScanPosition(
  row: Pick<HrmJobRequisition, 'position_key' | 'position_name' | 'title'> | null | undefined,
): { position_code: string; position_label: string } {
  const code = String(row?.position_key ?? '').trim();
  const name = String(row?.position_name ?? '').trim();
  const title = String(row?.title ?? '').trim();
  if (code) {
    return { position_code: code, position_label: name || code };
  }
  if (name) {
    return { position_code: name, position_label: name };
  }
  return { position_code: title, position_label: title || '—' };
}

export function formatCvScanAtVi(iso: string | null | undefined): string {
  const raw = String(iso ?? '').trim();
  if (!raw) return '—';
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return '—';
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
}
