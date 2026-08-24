/**
 * @CODE-MEMORY
 * Screen:     /hr/recruitment — Thêm/sửa ứng viên gắn YCTD (FR-UC-BP-REC-05a)
 * UC:         FR-UC-BP-REC-05a · AC-REC-UV-01..04
 * BR:         BR-BP-CV-01 · BR-BP-CV-03
 * SRS:        docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md v0.11 § FR-UC-BP-REC-05a Diễn biến #1–#6
 * TechSpec:   docs/program/specs/PO-HRM-REC-UV-YCTD-TECH-01.md §2 F-REC-UV-YCTD-01..05
 * DB:         docs/program/specs/PO-HRM-REC-UV-YCTD-DB-01.md — ONE physical requisition_id
 * API:        docs/program/specs/PO-HRM-REC-UV-YCTD-API-01.md — REQUIRED/STATUS/MISMATCH · no free-text SoT
 * Purpose:    Pure helpers — receivable filter, derive position from YCTD, create payload (no nested invent),
 *             list merge display-ready YCTD+position, context ?requisition_id= parse.
 * WorkItem:   PO-HRM-REC-UV-YCTD-FE-01
 * Coded:      2026-08-06
 * Callers:    CandidateFormDialog · CandidatesTab · CandidateDetailView
 * Callees:    none (pure)
 * must_keep:  soft FK requisition_id · OS 28 no FE invent nested write · no job_postings SoT · U65
 * SOLID:      Pure module — form/list consume helpers only
 * LastVerified: candidateUvYctdUi.test.ts
 *
 * @CODE-MEMORY-CHANGE 2026-08-06 PO-HRM-REC-UV-YCTD-FE-02
 * change_mode: FIX
 * What: Union spine-only Lane A rows into Candidates list SoT (pool enrich + spine-only project)
 * Why: QA FAIL R-UV-YCTD-LANE-A-LIST-GAP — POST /candidates writes recruitment_candidates only;
 *      pool merge alone hid new UV YCTD+position after 2xx/F5 (AC-REC-UV-02)
 * must_keep: FE-01 YCTD SELECT + derived position + context prefill · merge by email · no dual-write
 *            public.candidates · no job_postings SoT · U65 · no recruitment_uat_ready
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-REC-05-CLUSTER-FE-01
 * change_mode: ADD
 * What: mergeYctd attaches recruitment_candidate_id = spine.id for Lane A transitions/timeline
 * Why: AC-REC-05-02 O3 — POST …/candidates/:id/transitions needs Lane A id (pool id ≠ spine)
 * must_keep: YCTD display merge · union spine-only · no dual-write · no /rec · honesty false
 *
 * @CODE-MEMORY-CHANGE 2026-08-11 PO-HRM-CTR-WORKSPACE-G4-REC-ACCEPT-OFFER-CTA-FE-01
 * change_mode: FIX
 * What: mergeYctd projects spine status/stage + employee_id onto pool rows; resolveCandidatePipelineStage
 * Why: QA BLOCKED — API status=offer but list/detail kept pool stage=new → accept-offer CTA hidden
 * must_keep: union spine-only · YCTD merge · U65 · no dual-write pool SoT for FR-05 transitions
 *
 * @CODE-MEMORY-CHANGE 2026-08-11 PO-HRM-CTR-WORKSPACE-G4-REC-ACCEPT-OFFER-CTA-FE-02
 * change_mode: FIX
 * What: mergeYctd also projects spine `status` (not only `stage`) — resolveCandidatePipelineStage prefers status when YCTD-bound
 * Why: QA RETEST FAIL — pool status=new overrode merged stage=offer → rec-accept-offer-open-detail hidden
 * must_keep: FE-01 stage projection · union spine-only · U65
 */

import { normalizeCandidateEmail } from '@/components/recruitment/candidateActiveInterview';
import type { HrmJobRequisition, HrmJobRequisitionStatus } from '@/integrations/hrmApi';

/** Radix Select sentinel — never submit as requisition_id. */
export const UV_YCTD_NONE_SENTINEL = '__none__';

export const UV_YCTD_REQUIRED_VI =
  'Bắt buộc chọn yêu cầu tuyển dụng (YCTD) trước khi lưu ứng viên.';

export const UV_YCTD_EMPTY_HINT_VI =
  'Chưa có YCTD đang nhận hồ sơ — tạo hoặc duyệt yêu cầu tuyển dụng trước, rồi quay lại thêm ứng viên.';

export const UV_YCTD_OPEN_CTA_VI = 'Mở yêu cầu tuyển dụng';

export const UV_YCTD_STATUS_BLOCKED_VI =
  'YCTD đã chọn không còn nhận hồ sơ. Chọn yêu cầu đang mở/duyệt khác.';

export const UV_POSITION_MISMATCH_VI =
  'Vị trí không khớp YCTD đã chọn — vị trí lấy từ yêu cầu tuyển, không nhập chữ tự do.';

/** AS-IS + enterprise receivable statuses (API-01 §5). */
const RECEIVABLE_STATUSES = new Set<string>(['open', 'approved', 'open_for_hire']);

export type UvYctdPickerRow = Pick<
  HrmJobRequisition,
  'id' | 'title' | 'status' | 'jd_code' | 'jd_title'
> & {
  /** OU slug — bắt buộc phân biệt cùng title khi Group CEO rollup nhiều công ty. */
  company_id?: string | null;
  position_key?: string | null;
  position_name?: string | null;
  recruitment_request_id?: string | null;
  code?: string | null;
  /** Phòng ban — phân biệt YCTD cùng title (compare / picker). */
  department?: string | null;
  headcount?: number | null;
  created_at?: string | null;
  /** Số UV Lane A gắn YCTD — giúp chọn đúng tin đang có hồ sơ. */
  candidate_count?: number | null;
};

export type UvPositionDisplay = {
  recruitment_request_id: string;
  position_key: string;
  position_name: string;
  source: 'yctd';
};

export type CandidateYctdDisplayFields = {
  requisition_id?: string | null;
  recruitment_request_id?: string | null;
  yctd_title?: string | null;
  yctd_code?: string | null;
  position_key?: string | null;
  position_name?: string | null;
  position_source?: 'yctd' | string | null;
  /** Legacy free-text remnant — display only when no derived SoT; never write as SoT. */
  position?: string | null;
  /** Lane A spine PK when pool row enriched by email (FR-05 transitions). */
  recruitment_candidate_id?: string | null;
};

export function isReceivableRequisitionStatus(
  status: HrmJobRequisitionStatus | string | null | undefined,
): boolean {
  if (!status) return false;
  return RECEIVABLE_STATUSES.has(String(status).trim().toLowerCase());
}

/**
 * Defense-in-depth client filter when BE receivable=true already applied (or pending BE-01).
 * FORBIDDEN: include closed/on_hold/draft/rejected as bind targets.
 * O4: exclude unclassified (NULL headcount_mode) — block CV until classify.
 */
export function filterReceivableRequisitions<
  T extends {
    status?: string | null;
    headcount_mode?: string | null;
    classification_required?: boolean | null;
  },
>(rows: readonly T[]): T[] {
  return rows.filter((row) => {
    if (!isReceivableRequisitionStatus(row.status)) return false;
    if (row.classification_required === true) return false;
    const mode = String(row.headcount_mode ?? '')
      .trim()
      .toLowerCase();
    // Legacy rows without mode field on older payloads — keep synonym open/approved
    // only when classification_required is explicitly false/absent AND mode present OR
    // mode field never returned (pre-Wave-2). When BE stamps classification_required, block.
    if (row.classification_required === false) return true;
    if ('headcount_mode' in row && (row.headcount_mode === null || mode === '')) {
      return false;
    }
    return true;
  });
}

const COMPARE_PICKER_EXCLUDED_STATUSES = new Set<string>(['rejected', 'cancelled']);

/**
 * REC-06b compare picker — parity tab «Yêu cầu tuyển dụng» (read-only).
 * Include mọi YCTD in-scope trừ rejected/cancelled — gồm draft, pending_approval, open_for_hire, …
 * FORBIDDEN: chỉ liệt kê YCTD đã có UV/eval (seed fallback) khi API requisitions còn dữ liệu.
 */
export function filterComparePickerYctds<
  T extends {
    status?: string | null;
    candidate_count?: number | null;
  },
>(rows: readonly T[]): T[] {
  return rows.filter((row) => {
    const status = String(row.status ?? '')
      .trim()
      .toLowerCase();
    return !COMPARE_PICKER_EXCLUDED_STATUSES.has(status);
  });
}

export function normalizeRequisitionId(value: string | null | undefined): string {
  const id = typeof value === 'string' ? value.trim() : '';
  if (!id || id === UV_YCTD_NONE_SENTINEL) return '';
  return id;
}

/** AC-REC-UV-04 — parse context create from URL search. */
export function parseRequisitionIdFromSearch(
  search: string | URLSearchParams | null | undefined,
): string {
  if (!search) return '';
  const params =
    typeof search === 'string' ? new URLSearchParams(search.startsWith('?') ? search : `?${search}`) : search;
  return (
    normalizeRequisitionId(params.get('requisition_id')) ||
    normalizeRequisitionId(params.get('recruitment_request_id'))
  );
}

/**
 * Derive display-ready position from selected YCTD (AC-REC-UV-03).
 * Prefer BE position_key/name; fallback jd_title / title for label only — source remains yctd.
 */
export function deriveUvPositionFromYctd(
  yctd: UvYctdPickerRow | null | undefined,
): UvPositionDisplay | null {
  if (!yctd?.id) return null;
  const requisitionId = normalizeRequisitionId(yctd.recruitment_request_id) || normalizeRequisitionId(yctd.id);
  if (!requisitionId) return null;
  const positionKey = (yctd.position_key ?? '').trim();
  const positionName =
    (yctd.position_name ?? '').trim() ||
    (yctd.jd_title ?? '').trim() ||
    (yctd.title ?? '').trim() ||
    (positionKey || '—');
  return {
    recruitment_request_id: requisitionId,
    position_key: positionKey,
    position_name: positionName,
    source: 'yctd',
  };
}

export function formatYctdOptionPrimaryLine(row: UvYctdPickerRow): string {
  const company = (row.company_id ?? '').trim();
  const code = (row.code ?? row.jd_code ?? '').trim();
  const title = (row.title ?? '').trim() || 'YCTD';
  const head = code ? `${code} — ${title}` : title;
  return company ? `${company} · ${head}` : head;
}

/** Meta line for picker (no company/title repeat) — dept · SL · UV · status · date · #id. */
export function formatYctdOptionMetaLine(row: UvYctdPickerRow): string {
  const company = (row.company_id ?? '').trim();
  const title = (row.title ?? '').trim() || 'YCTD';
  const pos = (row.position_name ?? row.jd_title ?? '').trim();
  const dept = (row.department ?? '').trim();
  const status = String(row.status ?? '')
    .trim()
    .toLowerCase();
  const headcount =
    row.headcount != null && Number.isFinite(Number(row.headcount))
      ? Number(row.headcount)
      : null;
  const uvCount =
    row.candidate_count != null && Number.isFinite(Number(row.candidate_count))
      ? Number(row.candidate_count)
      : null;
  const created = formatYctdCreatedShort(row.created_at);
  const idHint = shortIdHint(row.id);

  const parts: string[] = [];
  if (pos && pos.toLowerCase() !== title.toLowerCase()) parts.push(pos);
  if (
    dept &&
    dept.toLowerCase() !== pos.toLowerCase() &&
    dept.toLowerCase() !== company.toLowerCase()
  ) {
    parts.push(dept);
  }
  if (headcount != null) parts.push(`SL ${headcount}`);
  if (uvCount != null) parts.push(`UV ${uvCount}`);
  if (status) parts.push(status);
  if (created) parts.push(created);
  if (idHint) parts.push(`#${idHint}`);
  return parts.join(' · ');
}

export function formatYctdOptionLabel(row: UvYctdPickerRow): string {
  const primary = formatYctdOptionPrimaryLine(row);
  const meta = formatYctdOptionMetaLine(row);
  return meta ? `${primary} · ${meta}` : primary;
}

/** Sort receivable picker: company → title → newest. */
export function sortYctdPickerRows<T extends UvYctdPickerRow>(rows: readonly T[]): T[] {
  return [...rows].sort((a, b) => {
    const ca = (a.company_id ?? '').localeCompare(b.company_id ?? '', 'vi');
    if (ca !== 0) return ca;
    const ta = (a.title ?? '').localeCompare(b.title ?? '', 'vi');
    if (ta !== 0) return ta;
    return String(b.created_at ?? '').localeCompare(String(a.created_at ?? ''));
  });
}

/** Sort compare picker: more UV first → company → title (find evaluated YCTD faster). */
export function sortCompareYctdPickerRows<T extends UvYctdPickerRow>(rows: readonly T[]): T[] {
  return [...rows].sort((a, b) => {
    const ua = Number(a.candidate_count ?? 0);
    const ub = Number(b.candidate_count ?? 0);
    if (ub !== ua) return ub - ua;
    const ca = (a.company_id ?? '').localeCompare(b.company_id ?? '', 'vi');
    if (ca !== 0) return ca;
    const ta = (a.title ?? '').localeCompare(b.title ?? '', 'vi');
    if (ta !== 0) return ta;
    return String(b.created_at ?? '').localeCompare(String(a.created_at ?? ''));
  });
}

/** Client filter for compare YCTD search box. */
export function filterYctdPickerRowsByQuery<T extends UvYctdPickerRow>(
  rows: readonly T[],
  query: string,
): T[] {
  const tokens = query
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);
  if (tokens.length === 0) return [...rows];
  return rows.filter((row) => {
    const hay = [
      row.company_id,
      row.title,
      row.code,
      row.jd_code,
      row.jd_title,
      row.position_name,
      row.department,
      row.status,
      shortIdHint(row.id),
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    return tokens.every((token) => hay.includes(token));
  });
}

function formatYctdCreatedShort(raw: string | null | undefined): string {
  if (!raw) return '';
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return '';
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function shortIdHint(id: string | null | undefined): string {
  const s = String(id ?? '').replace(/-/g, '');
  if (s.length < 4) return '';
  return s.slice(-4).toLowerCase();
}

/** Deduplicate list rows by id (defense if join/envelope ever duplicates). */
export function dedupeRowsById<T extends { id: string }>(rows: readonly T[]): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const row of rows) {
    const id = String(row.id ?? '').trim();
    if (!id || seen.has(id)) continue;
    seen.add(id);
    out.push(row);
  }
  return out;
}

export function resolveCandidatePositionLabel(row: CandidateYctdDisplayFields): string {
  const derived = (row.position_name ?? '').trim() || (row.position_key ?? '').trim();
  if (derived) return derived;
  return (row.position ?? '').trim() || '—';
}

export function resolveCandidateYctdLabel(row: CandidateYctdDisplayFields): string {
  const title = (row.yctd_title ?? '').trim();
  const code = (row.yctd_code ?? '').trim();
  if (code && title) return `${code} — ${title}`;
  if (title) return title;
  const id =
    normalizeRequisitionId(row.requisition_id) ||
    normalizeRequisitionId(row.recruitment_request_id);
  return id || '—';
}

export function hasCandidateYctdLink(row: CandidateYctdDisplayFields): boolean {
  return Boolean(
    normalizeRequisitionId(row.requisition_id) ||
      normalizeRequisitionId(row.recruitment_request_id),
  );
}

/** Lane A `status` / pool `stage` → unified list stage (new → applied). */
export function normalizeRecPipelineListStage(
  stageOrStatus: string | null | undefined,
): string | null {
  const raw = (stageOrStatus ?? '').trim();
  if (!raw) return null;
  return raw === 'new' ? 'applied' : raw;
}

/** Resolve pipeline stage for list/detail/offer-ready — Lane A `status` wins when YCTD-bound. */
export function resolveCandidatePipelineStage(row: {
  stage?: string | null;
  status?: string | null;
  requisition_id?: string | null;
  recruitment_request_id?: string | null;
}): string {
  const fromStatus = normalizeRecPipelineListStage(row.status);
  const fromStage = normalizeRecPipelineListStage(row.stage);
  if (hasCandidateYctdLink(row) && fromStatus) return fromStatus;
  return fromStage ?? fromStatus ?? 'applied';
}

type SpineYctdRow = CandidateYctdDisplayFields & {
  email?: string | null;
  id?: string;
  stage?: string | null;
  status?: string | null;
  employee_id?: string | null;
};

/** Spine list row projected for Candidates tab (Lane A only — not dual-written to pool). */
export type SpineOnlyListCandidate = CandidateYctdDisplayFields & {
  id: string;
  company_id: string;
  full_name: string;
  email: string;
  phone?: string | null;
  source?: string | null;
  stage?: string | null;
  created_at: string;
  applied_date?: string | null;
  /** Marker — pool mutate (stage/delete) must not target these ids. */
  list_lane: 'spine';
  active_interview?: {
    has_active_interview?: boolean | null;
    active_interview_id?: string | null;
    active_interview_status?: string | null;
    active_interview_at?: string | null;
    active_interview_display_time_vi_vn?: string | null;
    active_interview_badge_label?: string | null;
  } | null;
};

export type SpineCandidateForList = SpineYctdRow & {
  id: string;
  company_id: string;
  full_name: string;
  email: string;
  source?: string | null;
  status?: string | null;
  stage?: string | null;
  created_at: string;
  phone?: string | null;
  active_interview?: SpineOnlyListCandidate['active_interview'];
};

/**
 * Merge Lane A spine display-ready YCTD + position onto pool rows (email key).
 * FE does not invent nested applications aggregate — only project BE fields.
 */
export function mergeYctdDisplayOntoPoolCandidates<T extends { email?: string | null; id?: string }>(
  poolRows: T[],
  spineCandidates: SpineYctdRow[],
): Array<T & CandidateYctdDisplayFields> {
  const byEmail = new Map<string, SpineYctdRow>();
  const byId = new Map<string, SpineYctdRow>();
  for (const row of spineCandidates) {
    const emailKey = normalizeCandidateEmail(row.email);
    if (emailKey) byEmail.set(emailKey, row);
    if (row.id) byId.set(row.id, row);
  }
  return poolRows.map((row) => {
    const spine =
      (row.id ? byId.get(row.id) : undefined) ??
      byEmail.get(normalizeCandidateEmail(row.email));
    if (!spine) return row;
    const spineStatus = (spine.status ?? '').trim();
    const spineStage = normalizeRecPipelineListStage(spine.stage ?? spine.status);
    const spineEmployeeId = (spine.employee_id ?? '').trim();
    return {
      ...row,
      requisition_id: spine.requisition_id ?? null,
      recruitment_request_id: spine.recruitment_request_id ?? spine.requisition_id ?? null,
      yctd_title: spine.yctd_title ?? null,
      yctd_code: spine.yctd_code ?? null,
      position_key: spine.position_key ?? null,
      position_name: spine.position_name ?? null,
      position_source: spine.position_source ?? (spine.position_key ? 'yctd' : null),
      // FR-05 O3 — Lane A id for POST transitions / GET stage-history (pool id may differ).
      recruitment_candidate_id: spine.id ?? null,
      // Lane A status/stage SoT when pool row shares id/email but pool fields lag (POST transitions).
      ...(spineStatus ? { status: spineStatus } : {}),
      ...(spineStage ? { stage: spineStage } : {}),
      ...(spineEmployeeId ? { employee_id: spineEmployeeId } : {}),
    };
  });
}

/** Project Lane A spine row into list shape with display-ready YCTD + position (AC-REC-UV-02). */
export function projectSpineCandidateToListRow(spine: SpineCandidateForList): SpineOnlyListCandidate {
  const stage = resolveCandidatePipelineStage(spine);
  return {
    id: spine.id,
    company_id: spine.company_id,
    full_name: spine.full_name,
    email: spine.email,
    phone: spine.phone ?? null,
    source: spine.source ?? null,
    stage,
    created_at: spine.created_at,
    applied_date: spine.created_at,
    list_lane: 'spine',
    requisition_id: spine.requisition_id ?? null,
    recruitment_request_id: spine.recruitment_request_id ?? spine.requisition_id ?? null,
    yctd_title: spine.yctd_title ?? null,
    yctd_code: spine.yctd_code ?? null,
    position_key: spine.position_key ?? null,
    position_name: spine.position_name ?? null,
    position_source: spine.position_source ?? (spine.position_key ? 'yctd' : null),
    recruitment_candidate_id: spine.id,
    active_interview: spine.active_interview ?? null,
  };
}

/**
 * Union spine-only Lane A rows into Candidates list SoT.
 * Pool rows stay primary (enriched by merge); spine rows absent from pool (id/email)
 * are prepended so POST /candidates 201 + F5 show YCTD/position cells.
 * FORBIDDEN: invent dual-write to public.candidates / job_postings.
 */
export function unionSpineOnlyCandidatesIntoList<T extends { id?: string; email?: string | null }>(
  poolEnriched: T[],
  spineCandidates: SpineCandidateForList[],
): Array<T | SpineOnlyListCandidate> {
  const poolIds = new Set<string>();
  const poolEmails = new Set<string>();
  for (const row of poolEnriched) {
    if (row.id) poolIds.add(row.id);
    const emailKey = normalizeCandidateEmail(row.email);
    if (emailKey) poolEmails.add(emailKey);
  }

  const spineOnly = spineCandidates
    .filter((spine) => {
      if (!spine.id) return false;
      if (poolIds.has(spine.id)) return false;
      const emailKey = normalizeCandidateEmail(spine.email);
      if (emailKey && poolEmails.has(emailKey)) return false;
      return true;
    })
    .map(projectSpineCandidateToListRow)
    .sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));

  return [...spineOnly, ...poolEnriched];
}

export type CandidateCreateFormInput = {
  company_id: string;
  full_name: string;
  email: string;
  phone?: string | null;
  source?: string | null;
  stage?: string;
  employee_id?: string | null;
  rating?: number | null;
  applied_date?: string | null;
  expected_start_date?: string | null;
  nationality?: string | null;
  hometown?: string | null;
  marital_status?: string | null;
  notes?: string | null;
  /** Required for FR-05a create. */
  requisition_id: string;
  /** Optional — must match YCTD when present. */
  position_key?: string | null;
};

/**
 * Build POST body for Lane A create — YCTD required; omit free-text `position` SoT (AC-03).
 * OS 28: flat DTO only — no FE-invented nested applications[].
 */
export function buildCandidateCreateWithYctdPayload(
  input: CandidateCreateFormInput,
): CandidateCreateFormInput & { requisition_id: string } {
  const requisitionId = normalizeRequisitionId(input.requisition_id);
  if (!requisitionId) {
    throw new Error(UV_YCTD_REQUIRED_VI);
  }
  const positionKey = (input.position_key ?? '').trim();
  return {
    company_id: input.company_id,
    full_name: input.full_name,
    email: input.email,
    phone: input.phone ?? null,
    source: input.source ?? null,
    stage: input.stage,
    ...(input.employee_id?.trim() ? { employee_id: input.employee_id.trim() } : {}),
    rating: input.rating ?? 0,
    applied_date: input.applied_date ?? null,
    expected_start_date: input.expected_start_date ?? null,
    nationality: input.nationality ?? null,
    hometown: input.hometown ?? null,
    marital_status: input.marital_status ?? null,
    notes: input.notes ?? null,
    requisition_id: requisitionId,
    ...(positionKey ? { position_key: positionKey } : {}),
  };
}

/** True when create submit should be blocked client-side (empty receivable / missing YCTD). */
export function isUvCreateSubmitBlocked(args: {
  isCreate: boolean;
  requisitionId: string | null | undefined;
  receivableCount: number;
}): boolean {
  if (!args.isCreate) return false;
  if (args.receivableCount <= 0) return true;
  return !normalizeRequisitionId(args.requisitionId);
}
