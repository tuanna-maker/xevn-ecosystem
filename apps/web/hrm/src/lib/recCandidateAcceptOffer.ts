/**
 * @CODE-MEMORY
 * Screen:     /hr/recruitment — Chấp nhận offer → tạo/gắn hồ sơ NS (UV–YCTD)
 * UC:         UC-BP-REC-07 · AC-REC-07-01..08 · EX-01..13 · VAL-REC-HIRE-01..24
 * BR:         BR-BP-LC-01 · BR-BP-ONB-01 · BR-REC-HIRE-PATH/GATE/STAGE/NO-REKEY · O1–O12
 * SRS:        SRS_HRM_ENTERPRISE.md FR-UC-BP-REC-07 Diễn biến #1–#2 (+ HTP #3–#5)
 * TechSpec:   docs/program/specs/PO-HRM-MVP-GD1-REC-07-CLUSTER-API-01.md F-REC-HIRE-01
 * Purpose:    Pure helpers — application neo = Lane A id, offer-ready gate, prefill snapshot,
 *             toast HIRE family; cấm Nest /rec · mail=hire · pool/Kanban = FR-07 DONE · re-key form.
 * WorkItem:   PO-HRM-MVP-GD1-REC-07-CLUSTER-FE-01
 * Coded:      2026-08-09
 * Callers:    CandidateAcceptOfferDialog · CandidatesTab · CandidateDetailView
 * Callees:    resolveLaneACandidateIdForTransition (peer REC-05)
 * must_keep:  physical /recruitment/applications/:id/accept-offer · APP-02 after accept · U65 · honesty false · C-SLICE
 * SOLID:      Pure SRP — dialogs consume helpers only
 * solid_convention_ack: FE bind display-ready DTO; không invent hire aggregate / PAY
 * LastVerified: docs/qa/evidence/po-hrm-ctr-workspace-g4-accept-offer-cta-fe-01.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-11 PO-HRM-CTR-WORKSPACE-G4-REC-ACCEPT-OFFER-CTA-FE-01
 * change_mode: FIX
 * What: shouldShowAcceptOfferCta uses resolveCandidatePipelineStage (spine status over stale pool stage)
 * Why: DEF-REC-ACCEPT-OFFER-CTA-OFFER-STAGE — rec-accept-offer-open-detail gate
 * must_keep: YCTD + application neo · U65 · C-SLICE
 */

import {
  resolveLaneACandidateIdForTransition,
  type RecStageTransitionCandidate,
} from '@/lib/recCandidateStageTransition';
import { hasCandidateYctdLink, resolveCandidatePipelineStage } from '@/lib/candidateUvYctdUi';

/** EFF stage flags used for offer-ready (O2). */
export type RecOfferReadyStageFlags = {
  stageKey: string;
  allowsAcceptOffer?: boolean | null;
  metadata?: Record<string, unknown> | null;
};

export type RecAcceptOfferCandidate = RecStageTransitionCandidate & {
  application_id?: string | null;
  phone?: string | null;
  position?: string | null;
  position_key?: string | null;
  position_name?: string | null;
  company_id?: string | null;
  employee_id?: string | null;
  expected_start_date?: string | null;
  yctd_title?: string | null;
  yctd_code?: string | null;
};

export type RecAcceptOfferPrefillSnapshot = {
  full_name: string;
  email: string;
  phone: string | null;
  company_id: string | null;
  position_key: string | null;
  position_label: string | null;
  requisition_id: string | null;
  expected_start_date: string | null;
  yctd_label: string | null;
};

export type RecAcceptOfferMode = 'created' | 'linked' | 'idempotent';

export const REC_HIRE_OFFER_NOT_READY_VI =
  'Ứng viên chưa ở giai đoạn offer-ready. Chuyển sang giai đoạn Offer (hoặc bật cờ cho phép chấp nhận offer) rồi thử lại.';

export const REC_HIRE_NEO_REQUIRED_VI =
  'Chấp nhận offer chỉ trên UV gắn YCTD (Lane A). Gắn yêu cầu tuyển trước.';

export const REC_HIRE_NO_REKEY_HINT_VI =
  'Hồ sơ nhân sự sẽ được tạo/gắn từ dữ liệu UV + YCTD — không nhập lại các trường đã có.';

export const REC_HIRE_SUCCESS_CREATED_VI =
  'Đã tạo hồ sơ nhân sự chờ hoàn thiện và gắn ứng viên (HRM-REC-HIRE-201).';

export const REC_HIRE_SUCCESS_LINKED_VI =
  'Đã gắn hồ sơ nhân sự hiện có cùng pháp nhân (HRM-REC-HIRE-200).';

export const REC_HIRE_SUCCESS_IDEMPOTENT_VI =
  'Offer đã được chấp nhận trước đó — giữ cùng mã hồ sơ, không tạo nhân viên thứ hai (HRM-REC-HIRE-200).';

export const REC_HIRE_STAGE_AFTER_ACCEPT_VI =
  'Đã ghi giai đoạn hired-outcome qua Đổi trạng thái (APP-02).';

export const REC_HIRE_STAGE_AFTER_ACCEPT_FAIL_VI =
  'Hồ sơ đã tạo/gắn nhưng chưa ghi được giai đoạn hired-outcome. Dùng «Đổi trạng thái» hoặc kiểm tra catalog EFF.';

export const REC_HIRE_MAIL_NOT_HIRE_VI =
  'Gửi thư mẫu offer (REC-06) không thay cho bước Chấp nhận offer.';

export const REC_HIRE_PICKER_NOT_DONE_VI =
  'Gắn hồ sơ thủ công (picker) không đủ để nghiệm thu FR-07 — dùng Chấp nhận offer tạo/prefill.';

/** GĐ1 application neo = Lane A recruitment_candidates.id (YCTD-bound). */
export function resolveApplicationIdForAcceptOffer(
  row: RecAcceptOfferCandidate,
): string | null {
  const explicit = (row.application_id ?? '').trim();
  if (explicit) return explicit;
  return resolveLaneACandidateIdForTransition(row);
}

function metadataAllowsAcceptOffer(meta: Record<string, unknown> | null | undefined): boolean {
  if (!meta || typeof meta !== 'object') return false;
  const snake = meta.allows_accept_offer;
  const camel = meta.allowsAcceptOffer;
  return snake === true || camel === true;
}

/**
 * O2 — offer-ready when current stage key is `offer` OR EFF flag allowsAcceptOffer
 * (or metadata.allows_accept_offer). Empty catalog → soft-allow stage===offer only.
 */
export function isOfferReadyStage(
  items: readonly RecOfferReadyStageFlags[],
  currentStage: string | null | undefined,
  catalogCount: number,
): boolean {
  const key = (currentStage ?? '').trim();
  if (!key) return false;
  const lower = key.toLowerCase();
  if (catalogCount > 0 && items.length > 0) {
    const row = items.find(
      (i) => i.stageKey === key || i.stageKey.toLowerCase() === lower,
    );
    if (row) {
      if (row.allowsAcceptOffer === true) return true;
      if (metadataAllowsAcceptOffer(row.metadata ?? null)) return true;
      if (row.stageKey.toLowerCase() === 'offer') return true;
      return false;
    }
  }
  return lower === 'offer';
}

/** CTA: YCTD-bound + (offer-ready OR already soft-linked for idempotent re-accept). */
export function shouldShowAcceptOfferCta(
  row: RecAcceptOfferCandidate,
  items: readonly RecOfferReadyStageFlags[],
  catalogCount: number,
): boolean {
  if (!hasCandidateYctdLink(row)) return false;
  const appId = resolveApplicationIdForAcceptOffer(row);
  if (!appId) return false;
  if ((row.employee_id ?? '').trim()) return true;
  const stage = resolveCandidatePipelineStage(row);
  return isOfferReadyStage(items, stage, catalogCount);
}

export function buildAcceptOfferPrefillSnapshot(
  row: RecAcceptOfferCandidate,
): RecAcceptOfferPrefillSnapshot {
  const positionLabel =
    (row.position_name ?? '').trim() ||
    (row.position ?? '').trim() ||
    (row.position_key ?? '').trim() ||
    null;
  const yctd =
    [row.yctd_code, row.yctd_title].filter((s) => (s ?? '').trim()).join(' — ') || null;
  return {
    full_name: (row.full_name ?? '').trim() || '—',
    email: (row.email ?? '').trim() || '—',
    phone: (row.phone ?? '').trim() || null,
    company_id: (row.company_id ?? '').trim() || null,
    position_key: (row.position_key ?? '').trim() || null,
    position_label: positionLabel,
    requisition_id:
      (row.requisition_id ?? row.recruitment_request_id ?? '').trim() || null,
    expected_start_date: (row.expected_start_date ?? '').trim() || null,
    yctd_label: yctd,
  };
}

export function formatAcceptOfferSuccessToast(
  mode: RecAcceptOfferMode | string | null | undefined,
  code?: string | null,
): string {
  const m = (mode ?? '').trim().toLowerCase();
  if (m === 'linked') return REC_HIRE_SUCCESS_LINKED_VI;
  if (m === 'idempotent') return REC_HIRE_SUCCESS_IDEMPOTENT_VI;
  if (m === 'created') return REC_HIRE_SUCCESS_CREATED_VI;
  const c = (code ?? '').trim().toUpperCase();
  if (c === 'HRM-REC-HIRE-200') return REC_HIRE_SUCCESS_LINKED_VI;
  return REC_HIRE_SUCCESS_CREATED_VI;
}

/** Display dd/MM/yyyy from ISO date (date-only or datetime). */
export function formatHireExpectedStartVi(iso: string | null | undefined): string {
  if (!iso || !String(iso).trim()) return '—';
  const raw = String(iso).trim();
  const d = new Date(raw.includes('T') ? raw : `${raw}T00:00:00`);
  if (Number.isNaN(d.getTime())) return '—';
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}
