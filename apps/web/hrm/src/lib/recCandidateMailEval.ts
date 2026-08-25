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

/** 3 mẫu chuẩn hệ thống — luôn có, không xóa được; thêm mẫu tùy chỉnh bên cạnh. */
export const REC_MAIL_TEMPLATE_CODES = [
  'fail_cv',
  'interview_invite',
  'offer',
] as const;

export type RecMailTemplateCode = (typeof REC_MAIL_TEMPLATE_CODES)[number];

export const REC_MAIL_TEMPLATE_CATALOG_MAX = 20;

export const REC_MAIL_TEMPLATE_CODE_RE = /^[a-z][a-z0-9_-]{1,63}$/;

export const REC_MAIL_TEMPLATE_LABEL_VI: Record<RecMailTemplateCode, string> = {
  fail_cv: 'Từ chối CV (fail_cv)',
  interview_invite: 'Mời phỏng vấn (interview_invite)',
  offer: 'Thư offer (offer — ≠ chốt tuyển)',
};

export function isStandardRecMailTemplateCode(code: string): boolean {
  return (REC_MAIL_TEMPLATE_CODES as readonly string[]).includes(
    code.trim().toLowerCase(),
  );
}

export function isValidRecMailTemplateCode(code: string): boolean {
  return REC_MAIL_TEMPLATE_CODE_RE.test(code.trim().toLowerCase());
}

export function normalizeRecMailTemplateCode(raw: string): string {
  return raw.trim().toLowerCase().replace(/\s+/g, '_');
}

export const REC_MAIL_STATUS_LABEL_VI: Record<string, string> = {
  queued: 'Xếp hàng',
  sending: 'Đang gửi',
  sent: 'Đã gửi',
  failed: 'Gửi thất bại',
};

export const REC_MAIL_SUCCESS_TOAST_VI =
  'Đã xếp hàng / ghi nhật ký thư tuyển (HRM-REC-MAIL-201). Trạng thái pipeline không đổi từ bước gửi thư.';

export const REC_MAIL_LOCAL_STUB_TOAST_VI =
  'Chỉ ghi stub local (provider_ref=local-…) — email KHÔNG tới Gmail. Cấu hình HRM_MAIL_PROVIDER=smtp + App Password trong apps/api/hrm-api/.env rồi restart hrm-api.';

export const REC_MAIL_SMTP_SENT_TOAST_VI =
  'Đã gửi qua SMTP/Gmail. Kiểm tra hộp thư (và Spam). Nhật ký phải có message-id, không còn local-.';

export const REC_MAIL_PROVIDER_FAIL_TOAST_VI =
  'Gửi Gmail/SMTP thất bại — kiểm tra App Password / HRM_SMTP_* trong .env (hoặc đặt HRM_MAIL_PROVIDER=local nếu cố ý stub). Pipeline không đổi.';

export const REC_MAIL_CC_HINT_VI =
  'Mẫu mời phỏng vấn: nhập ít nhất một email CC người phỏng vấn trước khi gửi.';

/** Default VI subject/body — placeholders {{candidate_name}} {{position}} {{company}}. */
export const REC_MAIL_TEMPLATE_DEFAULTS_VI: Record<
  RecMailTemplateCode,
  { subject: string; body: string }
> = {
  fail_cv: {
    subject: '[{{company}}] Thông báo kết quả hồ sơ ứng tuyển — {{position}}',
    body: `Kính gửi {{candidate_name}},

Cảm ơn bạn đã quan tâm và nộp hồ sơ ứng tuyển vị trí {{position}} tại {{company}}.

Sau khi xem xét, chúng tôi rất tiếc phải thông báo rằng hồ sơ của bạn chưa phù hợp với yêu cầu vị trí ở thời điểm hiện tại.

Chúng tôi sẽ lưu hồ sơ và liên hệ lại nếu có cơ hội phù hợp hơn trong tương lai.

Trân trọng,
Phòng Nhân sự — {{company}}`,
  },
  interview_invite: {
    subject: '[{{company}}] Thư mời phỏng vấn — {{position}}',
    body: `Kính gửi {{candidate_name}},

{{company}} trân trọng mời bạn tham dự buổi phỏng vấn cho vị trí {{position}}.

Vui lòng xác nhận tham dự và phản hồi thời gian phù hợp (hoặc theo lịch đã thỏa thuận với bộ phận tuyển dụng).

Nếu bạn có câu hỏi, vui lòng trả lời email này.

Trân trọng,
Phòng Nhân sự — {{company}}`,
  },
  offer: {
    subject: '[{{company}}] Thư đề nghị nhận việc (offer) — {{position}}',
    body: `Kính gửi {{candidate_name}},

{{company}} vui mừng gửi đến bạn thư đề nghị nhận việc cho vị trí {{position}}.

Đây là thư offer theo mẫu tuyển dụng — chưa thay thế hợp đồng chính thức. Vui lòng phản hồi chấp nhận / từ chối theo hướng dẫn của bộ phận Nhân sự.

Trân trọng,
Phòng Nhân sự — {{company}}`,
  },
};

export type RecMailTemplateVars = {
  candidate_name: string;
  position: string;
  company: string;
};

export function fillRecMailPlaceholders(
  template: string,
  vars: RecMailTemplateVars,
): string {
  return template
    .replaceAll('{{candidate_name}}', vars.candidate_name || 'Ứng viên')
    .replaceAll('{{position}}', vars.position || 'Vị trí tuyển dụng')
    .replaceAll('{{company}}', vars.company || 'Công ty');
}

export function buildDefaultRecMailTemplateCatalog(): Array<{
  code: RecMailTemplateCode;
  label_vi: string;
  subject: string;
  body: string;
  active: boolean;
}> {
  return REC_MAIL_TEMPLATE_CODES.map((code) => ({
    code,
    label_vi: REC_MAIL_TEMPLATE_LABEL_VI[code],
    subject: REC_MAIL_TEMPLATE_DEFAULTS_VI[code].subject,
    body: REC_MAIL_TEMPLATE_DEFAULTS_VI[code].body,
    active: true,
  }));
}

export function buildRecMailDefaultsForCandidate(
  templateCode: RecMailTemplateCode,
  vars: RecMailTemplateVars,
): { subject: string; body: string } {
  const raw = REC_MAIL_TEMPLATE_DEFAULTS_VI[templateCode];
  return {
    subject: fillRecMailPlaceholders(raw.subject, vars),
    body: fillRecMailPlaceholders(raw.body, vars),
  };
}

export const REC_MAIL_CC_REQUIRED_CLIENT_VI =
  'Mẫu mời phỏng vấn bắt buộc CC ít nhất một email người phỏng vấn (BR-BP-MAIL-01).';

export const REC_MAIL_TO_REQUIRED_VI = 'Cần ít nhất một địa chỉ người nhận hợp lệ.';

export const REC_MAIL_TO_UNDELIVERABLE_VI =
  'Người nhận / CC phải là email inbox thật (Gmail, Outlook…). Không dùng @dev.local, @localhost, @test, @example.';

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
  company_id?: string | null;
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

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;
const NON_DELIVERABLE_DOMAIN_RE =
  /\.(local|localhost|test|example|invalid)$/i;

export function parseEmailList(raw: string): string[] {
  return raw
    .split(/[,;\s]+/)
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

export function isValidEmail(email: string): boolean {
  return EMAIL_RE.test(email.trim());
}

/** Reject fixture domains that SMTP may "accept" but never land in a real inbox. */
export function isDeliverableEmailAddress(email: string): boolean {
  const e = email.trim().toLowerCase();
  if (!EMAIL_RE.test(e)) return false;
  const at = e.lastIndexOf('@');
  if (at <= 0) return false;
  const domain = e.slice(at + 1);
  if (!domain || domain.includes('..')) return false;
  if (NON_DELIVERABLE_DOMAIN_RE.test(domain)) return false;
  if (domain === 'localhost' || domain.endsWith('.localhost')) return false;
  return true;
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
  const toRaw = input.to.map((e) => e.trim().toLowerCase()).filter(Boolean);
  const undeliverable = toRaw.filter((e) => !isDeliverableEmailAddress(e));
  if (undeliverable.length > 0) {
    return {
      ok: false,
      message: `${REC_MAIL_TO_UNDELIVERABLE_VI} Sai: ${undeliverable.join(', ')}`,
    };
  }
  const to = toRaw.filter((e) => isDeliverableEmailAddress(e));
  if (to.length === 0) {
    return { ok: false, message: REC_MAIL_TO_REQUIRED_VI };
  }
  if (isRecMailInviteTemplate(code)) {
    const ccRaw = input.ccInterviewers
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);
    const badCc = ccRaw.filter((e) => !isDeliverableEmailAddress(e));
    if (badCc.length > 0) {
      return {
        ok: false,
        message: `${REC_MAIL_TO_UNDELIVERABLE_VI} Sai: ${badCc.join(', ')}`,
      };
    }
    const cc = ccRaw.filter((e) => isDeliverableEmailAddress(e));
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
