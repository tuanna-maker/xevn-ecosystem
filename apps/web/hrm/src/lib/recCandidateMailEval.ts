/**
 * @CODE-MEMORY
 * Screen:     /hr/recruitment — Thư theo mẫu + Đánh giá Pass/Fail neo UV–YCTD
 * UC:         UC-BP-REC-06 · AC-REC-06-01..04 · EX-01..04 · VAL-REC-ME-01..13
 * BR:         BR-BP-MAIL-01 · BR-REC-ME-PATH/PASSFAIL/ROUND/STAGE · O1–O12
 * SRS:        SRS_HRM_ENTERPRISE.md FR-UC-BP-REC-06 Diễn biến #1–#2
 * TechSpec:   docs/program/specs/PO-HRM-MVP-GD1-REC-06-CLUSTER-API-01.md F-REC-MAIL-01 · F-REC-APP-03
 * Purpose:    Pure helpers — CFG template_code catalog, invite CC gate, Pass/Fail chốt,
 *             Lane A id reuse; cấm Nest /rec · Campaign · pool eval as FR-06 DONE · stage từ mail.
 * WorkItem:   PO-HRM-MVP-GD1-REC-06-CLUSTER-FE-01
 * Coded:      2026-08-09
 * Callers:    CandidateMailDialog · CandidateEvaluationDialog · CandidatesTab
 * Callees:    resolveLaneACandidateIdForTransition (peer REC-05)
 * must_keep:  physical /recruitment/ only · APP-02 sole stage · U65 · honesty false · C-SLICE
 * SOLID:      Pure SRP — dialogs consume helpers only
 * solid_convention_ack: FE không invent mail/eval aggregate SoT; bind display-ready DTO
 * LastVerified: docs/qa/evidence/po-hrm-mvp-gd1-rec-06-cluster-fe-01.md
 */

import {
  resolveLaneACandidateIdForTransition,
  type RecStageTransitionCandidate,
} from '@/lib/recCandidateStageTransition';

/** Tenant CFG template_code catalog (O4) — codes only; body from BE/CFG, never hardcode. */
export const REC_MAIL_TEMPLATE_CODES = [
  'fail_cv',
  'interview_invite',
  'offer',
] as const;

export type RecMailTemplateCode = (typeof REC_MAIL_TEMPLATE_CODES)[number];

export const REC_MAIL_TEMPLATE_LABEL_VI: Record<RecMailTemplateCode, string> = {
  fail_cv: 'Từ chối CV (fail_cv)',
  interview_invite: 'Mời phỏng vấn (interview_invite)',
  offer: 'Thư offer (offer — ≠ chốt tuyển)',
};

export const REC_MAIL_STATUS_LABEL_VI: Record<string, string> = {
  queued: 'Xếp hàng',
  sending: 'Đang gửi',
  sent: 'Đã gửi',
  failed: 'Gửi thất bại',
};

export const REC_MAIL_SUCCESS_TOAST_VI =
  'Đã xếp hàng / ghi nhật ký thư tuyển (HRM-REC-MAIL-201). Trạng thái pipeline không đổi từ bước gửi thư.';

export const REC_MAIL_CC_REQUIRED_CLIENT_VI =
  'Mẫu mời phỏng vấn bắt buộc CC ít nhất một email người phỏng vấn (BR-BP-MAIL-01).';

export const REC_MAIL_TO_REQUIRED_VI = 'Cần ít nhất một địa chỉ người nhận hợp lệ.';

export const REC_MAIL_NEO_REQUIRED_CLIENT_VI =
  'Gửi thư FR-06 chỉ trên UV gắn YCTD (Lane A). Gắn YCTD trước khi gửi.';

export const REC_EVAL_PASSFAIL_REQUIRED_CLIENT_VI =
  'Chốt đánh giá bắt buộc chọn Đạt (Pass) hoặc Không đạt (Fail) — không để nháp/pending làm DONE.';

export const REC_EVAL_NEO_REQUIRED_CLIENT_VI =
  'Đánh giá FR-06 phải neo UV–YCTD (recruitment_candidate_id / application_id). Không dùng hồ sơ kho CV thuần làm SoT.';

export const REC_EVAL_SUCCESS_TOAST_VI =
  'Đã chốt đánh giá Pass/Fail trên liên kết UV–YCTD (HRM-REC-EVAL-201). Đổi giai đoạn qua «Đổi trạng thái» (APP-02) nếu cần.';

export const REC_EVAL_SUGGEST_STAGE_HINT_VI =
  'Kết quả đã lưu. Muốn cập nhật pipeline? Dùng «Đổi trạng thái» — mail/eval không tự ghi stage.';

export type RecMailEvalCandidate = RecStageTransitionCandidate & {
  application_id?: string | null;
};

/** Reuse REC-05 Lane A resolver for mail + eval neo. */
export function resolveLaneACandidateIdForMailEval(
  row: RecMailEvalCandidate,
): string | null {
  return resolveLaneACandidateIdForTransition(row);
}

export function isRecMailInviteTemplate(code: string): boolean {
  return code.trim() === 'interview_invite';
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function parseEmailList(raw: string): string[] {
  return raw
    .split(/[,;\s]+/)
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

export function isValidEmail(email: string): boolean {
  return EMAIL_RE.test(email.trim());
}

export function validateRecMailForm(input: {
  laneAId: string | null;
  templateCode: string;
  to: string[];
  ccInterviewers: string[];
}): { ok: true } | { ok: false; message: string } {
  if (!input.laneAId?.trim()) {
    return { ok: false, message: REC_MAIL_NEO_REQUIRED_CLIENT_VI };
  }
  const code = input.templateCode.trim();
  if (!code) {
    return { ok: false, message: 'Chọn mẫu thư hiệu lực (template_code).' };
  }
  const to = input.to.filter((e) => isValidEmail(e));
  if (to.length === 0) {
    return { ok: false, message: REC_MAIL_TO_REQUIRED_VI };
  }
  if (isRecMailInviteTemplate(code)) {
    const cc = input.ccInterviewers.filter((e) => isValidEmail(e));
    if (cc.length === 0) {
      return { ok: false, message: REC_MAIL_CC_REQUIRED_CLIENT_VI };
    }
  }
  return { ok: true };
}

export type RecEvalCommitResult = 'pass' | 'fail';

export function isRecEvalPassFail(result: string): result is RecEvalCommitResult {
  const v = result.trim().toLowerCase();
  return v === 'pass' || v === 'fail';
}

export function validateRecEvalCommit(input: {
  laneAId: string | null;
  applicationId?: string | null;
  result: string;
}): { ok: true } | { ok: false; message: string } {
  const neo =
    Boolean(input.laneAId?.trim()) || Boolean((input.applicationId ?? '').trim());
  if (!neo) {
    return { ok: false as const, message: REC_EVAL_NEO_REQUIRED_CLIENT_VI };
  }
  if (!isRecEvalPassFail(input.result)) {
    return { ok: false as const, message: REC_EVAL_PASSFAIL_REQUIRED_CLIENT_VI };
  }
  return { ok: true as const };
}

export function formatRecMailStatusVi(status: string | null | undefined): string {
  const key = (status ?? '').trim().toLowerCase();
  return REC_MAIL_STATUS_LABEL_VI[key] ?? (status?.trim() || '—');
}

export function formatRecMailQueuedAtVi(iso: string | null | undefined): string {
  if (!iso?.trim()) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  return `${dd}/${mm}/${yyyy} ${hh}:${mi}`;
}
