/**
 * @CODE-MEMORY
 * Screen:     /hr/recruitment — Yêu cầu tuyển dụng (YCTD Wave-2 forks)
 * UC:         UC-BP-REC-02 · UC-BP-REC-02b
 * BR:         BR-BP-HC-05/06 · BR-REC-02-* · BR-REC-02b-REASON · O2/O4/O5
 * SRS:        FR-UC-BP-REC-02 · FR-UC-BP-REC-02b Diễn biến FE §3.4 · §4.4
 * TechSpec:   docs/program/specs/PO-HRM-MVP-GD1-REC-02-CLUSTER-API-01.md F-REC-YCTD-01..04
 * Purpose:    Pure helpers — mode/hire/out-reason/receivable/O4 classify/pipeline-flags gates;
 *             VI copy for CELL-QTY → ngoài ĐB hint; no Campaign invent.
 * WorkItem:   PO-HRM-MVP-GD1-REC-02-CLUSTER-FE-01
 * Coded:      2026-08-09
 * Callers:    JobRequisitionsTab · HeadcountProposalTab · candidateUvYctdUi · apiError
 * Callees:    none (pure)
 * must_keep:  UF-HRM-12 · J-HRM-JD-YCTD-01 · soft FK JD · REC-03 OUT · U65 · honesty false
 * SOLID:      Pure module — tab/forms consume helpers only
 * LastVerified: docs/qa/evidence/po-hrm-mvp-gd1-rec-02-cluster-fe-01.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-REC-02-BOD-CHAIN-FE-01
 * change_mode: UPGRADE
 * What: Approval-chain view (SHORT/LONG · next approver · BOD step) · cell picker options
 *       from REC-01 approved need_hire cells · replace/reject display helpers
 * Why: QC GWC remain AC-02d / 02b-05 / ALT-01/02 · R-REC-02-CELL-PICKER
 * must_keep: L1 tokens · O4/O5 · UF-HRM-12 · JD soft FK · REC-01 SoT · honesty false · U65
 * LastVerified: docs/qa/evidence/po-hrm-mvp-gd1-rec-02-bod-chain-fe-01.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-REC-04-CLUSTER-FE-01
 * change_mode: UPGRADE
 * What: resolvePipelineFlags / emptyPipelineFlags ADD internal_scan_* (O2 display-ready)
 * Why: UC-BP-REC-04 · API-01 §6.1 · VAL-21 BE SoT · BR-BP-CV-01 posted gate FE
 * must_keep: posted/has_cv/interview_started/cv_intake_allowed · REC-03 OUT · honesty false
 * LastVerified: docs/qa/evidence/po-hrm-mvp-gd1-rec-04-cluster-fe-01.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-11 PO-HRM-REC-YCTD-CREATE-BLOCKER-01
 * change_mode: FIX
 * What: validateYctdCreateForm phase draft_save — out_of_plan_reason optional on Lưu nháp (peer BE requireComplete:false)
 * Why: QA U65 YCTD POST blocked — form-ready true but zod gate empty out_of_plan_reason · SRS Diễn biến #6 draft
 * must_keep: complete phase for submit-workflow · in_plan cell on create · DEPTCONREG1 dept picker · U65
 */
import type {
  HrmJobRequisition,
  HrmJobRequisitionHeadcountMode,
  HrmJobRequisitionHireReason,
  HrmJobRequisitionPipelineFlags,
  HrmJobRequisitionStatus,
} from '@/integrations/hrmApi';

export type YctdHeadcountMode = HrmJobRequisitionHeadcountMode;
export type YctdHireReason = HrmJobRequisitionHireReason;

/** Normative receivable after full approve (O3). */
export const YCTD_RECEIVABLE_STATUS = 'open_for_hire' as const;

/** List/UV synonym filter only — not a create bypass. */
const RECEIVABLE_STATUS_SYNONYMS = new Set<string>([
  'open_for_hire',
  'open',
  'approved',
]);

export const YCTD_MODE_LABEL_VI: Record<YctdHeadcountMode, string> = {
  in_plan: 'Trong định biên',
  out_of_plan: 'Ngoài định biên',
};

export const YCTD_HIRE_REASON_LABEL_VI: Record<YctdHireReason, string> = {
  new: 'Tuyển mới',
  replace: 'Thay thế',
};

export const YCTD_MODE_REQUIRED_VI =
  'Bắt buộc chọn trong định biên hoặc ngoài định biên trước khi lưu/gửi duyệt.';

export const YCTD_CELL_REQUIRED_VI =
  'YCTD trong định biên cần gắn mã ô Cần tuyển đã duyệt (headcount_cell_id).';

export const YCTD_OUT_REASON_REQUIRED_VI =
  'YCTD ngoài định biên bắt buộc nhập lý do vượt / phát sinh.';

export const YCTD_HIRE_REASON_REQUIRED_VI = 'Bắt buộc chọn lý do tuyển (mới hoặc thay thế).';

export const YCTD_REPLACE_EMPLOYEE_REQUIRED_VI =
  'Lý do thay thế bắt buộc chọn nhân viên được thay trong phạm vi đơn vị.';

export const YCTD_CLASSIFY_BANNER_VI =
  'YCTD legacy chưa phân loại trong/ngoài định biên — chọn chế độ và lưu trước khi nhận hồ sơ hoặc đăng tin.';

export const YCTD_NOT_RECEIVABLE_HINT_VI =
  'Chưa mở nhận hồ sơ (open_for_hire). Hoàn tất duyệt (ngoài ĐB: gồm BOD) rồi mới gắn CV / đăng tin.';

export const YCTD_LONG_MATRIX_HINT_VI =
  'Ngoài định biên dùng ma trận duyệt dài (+ BOD). Không mở nhận hồ sơ trước khi BOD duyệt.';

export const YCTD_CELL_QTY_HINT_VI =
  'Số lượng vượt ô định biên — không thể giữ Trong ĐB. Chuyển sang Ngoài định biên và nhập lý do, hoặc giảm số lượng.';

export const YCTD_PROPOSALS_DEPRECATE_VI =
  'Tab đề xuất ngoài ĐB không còn là nguồn sự thật YCTD. Tạo yêu cầu tuyển «Ngoài định biên» trên tab Yêu cầu tuyển dụng.';

export const YCTD_PROPOSALS_REDIRECT_CTA_VI = 'Tạo YCTD ngoài định biên';

export const YCTD_REJECT_REASON_REQUIRED_VI = 'Từ chối bắt buộc nhập lý do.';

/** Snapshot keys aligned with BE yctd-requisition-gates (Y-S8). */
export const YCTD_MATRIX_SHORT_KEY = 'hrm_requisition_short';
export const YCTD_MATRIX_LONG_BOD_KEY = 'hrm_requisition_long_bod';

export const YCTD_MATRIX_SHORT_LABEL_VI = 'SHORT (TP + HR tối thiểu)';
export const YCTD_MATRIX_LONG_LABEL_VI = 'LONG (+ BOD)';

export const YCTD_BOD_BLOCKED_CV_VI =
  'Ngoài định biên: chưa BOD duyệt — chặn nhận hồ sơ / đăng tin đến khi trạng thái Mở nhận hồ sơ.';

export const YCTD_CELL_PICKER_EMPTY_VI =
  'Chưa có ô Cần tuyển đã duyệt. Cần: (1) trên Định biên nhập SL Cần tuyển ≥ 1, (2) Duyệt kế hoạch → ô khóa need_hire_approved, hoặc dùng deep-link spawn.';

export const YCTD_CELL_PICKER_LABEL_VI = 'Ô Cần tuyển đã duyệt *';

/** Diagnose why CELL-PICKER is empty — plans exist but none approved / no need_hire. */
export function diagnoseApprovedNeedHireCellPickerEmpty(
  plans: ReadonlyArray<{ status?: string | null }>,
): string {
  if (!plans.length) {
    return 'Chưa có kế hoạch Định biên trong phạm vi. Tạo/duyệt kế hoạch trên tab Định biên trước.';
  }
  const hasApproved = plans.some(
    (p) => String(p.status ?? '').trim().toLowerCase() === 'approved',
  );
  if (!hasApproved) {
    return `Có ${plans.length} kế hoạch Định biên nhưng chưa ở trạng thái Đã duyệt — ô Cần tuyển chưa khóa để chọn trên YCTD.`;
  }
  return YCTD_CELL_PICKER_EMPTY_VI;
}

export type YctdMatrixFamily = 'SHORT' | 'LONG' | 'UNKNOWN';

export type YctdApprovalChainView = {
  matrixFamily: YctdMatrixFamily;
  matrixLabelVi: string;
  matrixKeyDisplay: string;
  nextApproverHintVi: string;
  bodStepPending: boolean;
  blockedFromCv: boolean;
  showTransitionActions: boolean;
  /** POST transitions bod_complete when approve (out_of_plan BOD step). */
  approveSendsBodComplete: boolean;
  approveButtonLabelVi: string;
  chainSteps: Array<{ id: string; label: string; state: 'done' | 'current' | 'pending' }>;
};

export type YctdApprovedCellPickerOption = {
  value: string;
  label: string;
  code?: string;
  need_hire: number;
  plan_id: string;
};

export function normalizeYctdHeadcountMode(
  value: string | null | undefined,
): YctdHeadcountMode | null {
  const raw = String(value ?? '')
    .trim()
    .toLowerCase();
  if (raw === 'in_plan' || raw === 'in-plan' || raw === 'in_headcount') return 'in_plan';
  if (raw === 'out_of_plan' || raw === 'out-of-plan' || raw === 'out_of_headcount') {
    return 'out_of_plan';
  }
  return null;
}

export function normalizeYctdHireReason(
  value: string | null | undefined,
): YctdHireReason | null {
  const raw = String(value ?? '')
    .trim()
    .toLowerCase();
  if (raw === 'new') return 'new';
  if (raw === 'replace' || raw === 'replacement') return 'replace';
  return null;
}

/** O4 — legacy row with NULL/empty headcount_mode. */
export function isYctdClassificationRequired(
  row: Pick<HrmJobRequisition, 'headcount_mode' | 'classification_required'> | null | undefined,
): boolean {
  if (!row) return false;
  if (row.classification_required === true) return true;
  return normalizeYctdHeadcountMode(row.headcount_mode) == null;
}

export function isYctdReceivableStatus(
  status: HrmJobRequisitionStatus | string | null | undefined,
): boolean {
  if (!status) return false;
  return RECEIVABLE_STATUS_SYNONYMS.has(String(status).trim().toLowerCase());
}

/**
 * Gate CV / posted / pipeline intake (VAL-10/11/14).
 * Normative: open_for_hire + classified mode. Synonym open/approved allowed only when classified.
 */
export function canMutateYctdPipelineFlags(
  row: Pick<
    HrmJobRequisition,
    'status' | 'headcount_mode' | 'classification_required' | 'requires_bod'
  > | null | undefined,
): boolean {
  if (!row) return false;
  if (isYctdClassificationRequired(row)) return false;
  const status = String(row.status ?? '')
    .trim()
    .toLowerCase();
  if (status === YCTD_RECEIVABLE_STATUS) return true;
  // Legacy synonym only when already classified (O4 blocks NULL mode).
  if (status === 'open' || status === 'approved') {
    return normalizeYctdHeadcountMode(row.headcount_mode) != null && row.requires_bod !== true;
  }
  return false;
}

export function emptyPipelineFlags(): HrmJobRequisitionPipelineFlags {
  return {
    posted: false,
    has_cv: false,
    interview_started: false,
    cv_intake_allowed: false,
    internal_scan_done: false,
    internal_scan_skipped: false,
    internal_scan_at: null,
    internal_scan_skip_reason: null,
  };
}

export function resolvePipelineFlags(
  row: Pick<HrmJobRequisition, 'pipeline_flags'> | null | undefined,
): HrmJobRequisitionPipelineFlags {
  const flags = row?.pipeline_flags;
  if (!flags || typeof flags !== 'object') return emptyPipelineFlags();
  return {
    posted: Boolean(flags.posted),
    has_cv: Boolean(flags.has_cv),
    interview_started: Boolean(flags.interview_started),
    cv_intake_allowed: Boolean(flags.cv_intake_allowed),
    posted_at: flags.posted_at ?? null,
    has_cv_at: flags.has_cv_at ?? null,
    interview_started_at: flags.interview_started_at ?? null,
    internal_scan_done: Boolean(flags.internal_scan_done),
    internal_scan_skipped: Boolean(flags.internal_scan_skipped),
    internal_scan_at: flags.internal_scan_at ?? null,
    internal_scan_skip_reason: flags.internal_scan_skip_reason ?? null,
  };
}

/** draft_save = Lưu nháp (BE requireComplete:false); complete = Gửi duyệt / PATCH classify. */
export type YctdCreateFormValidationPhase = 'draft_save' | 'complete';

export function validateYctdCreateForm(
  input: {
    headcount_mode: string | null | undefined;
    headcount_cell_id?: string | null;
    hire_reason: string | null | undefined;
    replace_employee_id?: string | null;
    out_of_plan_reason?: string | null;
  },
  phase: YctdCreateFormValidationPhase = 'complete',
): { ok: true } | { ok: false; field: string; message: string } {
  const mode = normalizeYctdHeadcountMode(input.headcount_mode);
  if (!mode) {
    return { ok: false, field: 'headcount_mode', message: YCTD_MODE_REQUIRED_VI };
  }
  const hire = normalizeYctdHireReason(input.hire_reason);
  if (!hire) {
    return { ok: false, field: 'hire_reason', message: YCTD_HIRE_REASON_REQUIRED_VI };
  }
  if (hire === 'replace' && !String(input.replace_employee_id ?? '').trim()) {
    return {
      ok: false,
      field: 'replace_employee_id',
      message: YCTD_REPLACE_EMPLOYEE_REQUIRED_VI,
    };
  }
  if (mode === 'in_plan' && !String(input.headcount_cell_id ?? '').trim()) {
    return { ok: false, field: 'headcount_cell_id', message: YCTD_CELL_REQUIRED_VI };
  }
  if (
    phase === 'complete' &&
    mode === 'out_of_plan' &&
    !String(input.out_of_plan_reason ?? '').trim()
  ) {
    return { ok: false, field: 'out_of_plan_reason', message: YCTD_OUT_REASON_REQUIRED_VI };
  }
  return { ok: true };
}

/** Parse deep-link / spawn handoff query for create preset (U19 scope-safe). */
export function parseYctdCreatePresetFromSearch(
  search: string | URLSearchParams | null | undefined,
): {
  headcount_mode?: YctdHeadcountMode;
  headcount_cell_id?: string;
  headcount?: number;
} {
  if (!search) return {};
  const params =
    typeof search === 'string'
      ? new URLSearchParams(search.startsWith('?') ? search : `?${search}`)
      : search;
  const mode = normalizeYctdHeadcountMode(params.get('headcount_mode'));
  const cell = params.get('headcount_cell_id')?.trim() || params.get('cell_id')?.trim() || '';
  const hcRaw = params.get('headcount');
  const hc = hcRaw != null && hcRaw !== '' ? Number(hcRaw) : NaN;
  return {
    ...(mode ? { headcount_mode: mode } : {}),
    ...(cell ? { headcount_cell_id: cell } : {}),
    ...(Number.isFinite(hc) && hc >= 1 ? { headcount: Math.trunc(hc) } : {}),
  };
}

export function yctdModeBadgeLabel(
  mode: string | null | undefined,
  classificationRequired?: boolean,
): string {
  if (classificationRequired || normalizeYctdHeadcountMode(mode) == null) {
    return 'Chưa phân loại';
  }
  const normalized = normalizeYctdHeadcountMode(mode)!;
  return YCTD_MODE_LABEL_VI[normalized];
}

/** Resolve SHORT vs LONG from snapshot key, else infer from headcount_mode. */
export function resolveYctdMatrixFamily(
  row: Pick<HrmJobRequisition, 'approval_matrix_key' | 'headcount_mode'> | null | undefined,
): YctdMatrixFamily {
  const key = String(row?.approval_matrix_key ?? '')
    .trim()
    .toLowerCase();
  if (key === YCTD_MATRIX_SHORT_KEY || key.includes('short')) return 'SHORT';
  if (key === YCTD_MATRIX_LONG_BOD_KEY || key.includes('long')) return 'LONG';
  const mode = normalizeYctdHeadcountMode(row?.headcount_mode);
  if (mode === 'in_plan') return 'SHORT';
  if (mode === 'out_of_plan') return 'LONG';
  return 'UNKNOWN';
}

export function yctdMatrixLabelVi(family: YctdMatrixFamily): string {
  if (family === 'SHORT') return YCTD_MATRIX_SHORT_LABEL_VI;
  if (family === 'LONG') return YCTD_MATRIX_LONG_LABEL_VI;
  return 'Chưa xác định ma trận';
}

/**
 * AC-02d / 02b-05 — surface approval chain on detail:
 * pending → next approver · SHORT vs LONG · BOD step for out_of_plan.
 * BE: out_of_plan approve without bod_complete → approved; with bod_complete → open_for_hire.
 */
export function resolveYctdApprovalChainView(
  row: Pick<
    HrmJobRequisition,
    | 'status'
    | 'headcount_mode'
    | 'approval_matrix_key'
    | 'requires_bod'
    | 'classification_required'
  > | null | undefined,
): YctdApprovalChainView {
  const status = String(row?.status ?? '')
    .trim()
    .toLowerCase();
  const mode = normalizeYctdHeadcountMode(row?.headcount_mode);
  const family = resolveYctdMatrixFamily(row);
  const matrixKeyDisplay =
    String(row?.approval_matrix_key ?? '').trim() ||
    (family === 'SHORT'
      ? YCTD_MATRIX_SHORT_KEY
      : family === 'LONG'
        ? YCTD_MATRIX_LONG_BOD_KEY
        : '—');
  const blockedFromCv = !canMutateYctdPipelineFlags(row);
  const classified = !isYctdClassificationRequired(row);

  const empty: YctdApprovalChainView = {
    matrixFamily: family,
    matrixLabelVi: yctdMatrixLabelVi(family),
    matrixKeyDisplay,
    nextApproverHintVi: '',
    bodStepPending: false,
    blockedFromCv,
    showTransitionActions: false,
    approveSendsBodComplete: false,
    approveButtonLabelVi: 'Duyệt → mở nhận hồ sơ',
    chainSteps: [],
  };

  if (!row || !classified) return empty;

  const isLong = mode === 'out_of_plan' || family === 'LONG' || row.requires_bod === true;

  if (status === 'open_for_hire' || status === 'open') {
    return {
      ...empty,
      nextApproverHintVi: 'Đã mở nhận hồ sơ — chuỗi duyệt hoàn tất.',
      bodStepPending: false,
      blockedFromCv: false,
      chainSteps: isLong
        ? [
            { id: 'tp_hr', label: 'TP/HR', state: 'done' },
            { id: 'bod', label: 'BOD', state: 'done' },
            { id: 'receivable', label: 'Mở nhận hồ sơ', state: 'done' },
          ]
        : [
            { id: 'tp_hr', label: 'TP/HR (SHORT)', state: 'done' },
            { id: 'receivable', label: 'Mở nhận hồ sơ', state: 'done' },
          ],
    };
  }

  if (status === 'rejected' || status === 'cancelled') {
    return {
      ...empty,
      nextApproverHintVi: 'YCTD đã từ chối/hủy — không mở nhận hồ sơ.',
      chainSteps: [{ id: 'closed', label: 'Đã đóng (không receivable)', state: 'done' }],
    };
  }

  if (status === 'pending_approval') {
    if (isLong) {
      return {
        ...empty,
        nextApproverHintVi:
          'Bước kế: TP/HR duyệt trước. BOD còn chờ — chưa cho nhận CV / đăng tin.',
        bodStepPending: true,
        blockedFromCv: true,
        showTransitionActions: true,
        approveSendsBodComplete: false,
        approveButtonLabelVi: 'Duyệt (TP/HR) — chờ BOD',
        chainSteps: [
          { id: 'tp_hr', label: 'TP/HR', state: 'current' },
          { id: 'bod', label: 'BOD', state: 'pending' },
          { id: 'receivable', label: 'Mở nhận hồ sơ', state: 'pending' },
        ],
      };
    }
    return {
      ...empty,
      nextApproverHintVi: 'Bước kế: TP/HR (ma trận SHORT) — duyệt đủ → mở nhận hồ sơ.',
      bodStepPending: false,
      blockedFromCv: true,
      showTransitionActions: true,
      approveSendsBodComplete: false,
      approveButtonLabelVi: 'Duyệt → mở nhận hồ sơ',
      chainSteps: [
        { id: 'tp_hr', label: 'TP/HR (SHORT)', state: 'current' },
        { id: 'receivable', label: 'Mở nhận hồ sơ', state: 'pending' },
      ],
    };
  }

  if (status === 'approved' && isLong) {
    return {
      ...empty,
      nextApproverHintVi:
        'Bước kế: BOD duyệt cuối. Vẫn chặn nhận hồ sơ / đăng tin đến khi Mở nhận hồ sơ.',
      bodStepPending: true,
      blockedFromCv: true,
      showTransitionActions: true,
      approveSendsBodComplete: true,
      approveButtonLabelVi: 'BOD duyệt → mở nhận hồ sơ',
      chainSteps: [
        { id: 'tp_hr', label: 'TP/HR', state: 'done' },
        { id: 'bod', label: 'BOD', state: 'current' },
        { id: 'receivable', label: 'Mở nhận hồ sơ', state: 'pending' },
      ],
    };
  }

  /** in_plan may land on approved (CFG BOD / bridge) before open_for_hire — still allow transition. */
  if (status === 'approved' && !isLong) {
    return {
      ...empty,
      nextApproverHintVi: 'Đã duyệt cấp trước — Duyệt để mở nhận hồ sơ (SHORT).',
      bodStepPending: false,
      blockedFromCv: true,
      showTransitionActions: true,
      approveSendsBodComplete: false,
      approveButtonLabelVi: 'Duyệt → mở nhận hồ sơ',
      chainSteps: [
        { id: 'tp_hr', label: 'TP/HR (SHORT)', state: 'done' },
        { id: 'receivable', label: 'Mở nhận hồ sơ', state: 'current' },
      ],
    };
  }

  return empty;
}

/** Human-readable replace employee on detail (VAL-06). */
export function resolveYctdReplaceEmployeeDisplay(
  replaceEmployeeId: string | null | undefined,
  employeeOptions: ReadonlyArray<{ value: string; label: string; code?: string }>,
): string {
  const id = String(replaceEmployeeId ?? '').trim();
  if (!id) return '—';
  const hit = employeeOptions.find((o) => o.value === id);
  if (!hit) return id;
  return hit.code ? `${hit.label} (${hit.code})` : hit.label;
}

type PlanLikeForCellPicker = {
  id: string;
  title?: string | null;
  status?: string | null;
  year?: number | null;
  departments?: Array<{
    name?: string | null;
    positions?: Array<{
      name?: string | null;
      months_data?: unknown;
      months?: Array<{
        cell_id?: string;
        month: number;
        need_hire: number;
        lifecycle_status?: string;
      }>;
    }>;
  }>;
};

/**
 * CELL-PICKER — options from approved Định biên cells (REC-01 SoT).
 * Only `need_hire_approved` + need_hire≥1 + cell_id. Does not invent a second SoT.
 */
export function collectApprovedNeedHireCellOptions(
  plans: ReadonlyArray<PlanLikeForCellPicker>,
  parseMonths: (raw: unknown) => Array<{
    cell_id?: string;
    month: number;
    need_hire: number;
    lifecycle_status: string;
  }>,
): YctdApprovedCellPickerOption[] {
  const out: YctdApprovedCellPickerOption[] = [];
  const seen = new Set<string>();
  for (const plan of plans) {
    const planStatus = String(plan.status ?? '')
      .trim()
      .toLowerCase();
    if (planStatus !== 'approved') continue;
    const planTitle = String(plan.title ?? '').trim() || plan.id;
    const year = plan.year != null ? String(plan.year) : '';
    for (const dept of plan.departments ?? []) {
      const deptName = String(dept.name ?? '').trim() || '—';
      for (const pos of dept.positions ?? []) {
        const posName = String(pos.name ?? '').trim() || '—';
        const months =
          Array.isArray(pos.months) && pos.months.length > 0
            ? pos.months
            : parseMonths(pos.months_data);
        for (const cell of months) {
          const cellId = String(cell.cell_id ?? '').trim();
          if (!cellId) continue;
          if (cell.lifecycle_status !== 'need_hire_approved') continue;
          if (!(Number(cell.need_hire) >= 1)) continue;
          if (seen.has(cellId)) continue;
          seen.add(cellId);
          const monthLabel = `T${cell.month}${year ? `/${year}` : ''}`;
          out.push({
            value: cellId,
            label: `${deptName} · ${posName} · ${monthLabel} · SL ${cell.need_hire} · ${planTitle}`,
            code: cellId.slice(0, 8),
            need_hire: Math.floor(Number(cell.need_hire)),
            plan_id: plan.id,
          });
        }
      }
    }
  }
  return out;
}

/** Keep deep-link / spawn preset cell visible even if not yet in approved list. */
export function ensureHeadcountCellOptionPresent(
  options: ReadonlyArray<YctdApprovedCellPickerOption>,
  cellId: string | null | undefined,
  fallbackLabel?: string,
): YctdApprovedCellPickerOption[] {
  const id = String(cellId ?? '').trim();
  if (!id) return [...options];
  if (options.some((o) => o.value === id)) return [...options];
  return [
    {
      value: id,
      label: fallbackLabel?.trim() || `Ô deep-link / spawn (${id.slice(0, 8)}…)`,
      code: id.slice(0, 8),
      need_hire: 0,
      plan_id: '',
    },
    ...options,
  ];
}

export function resolveYctdCellLabel(
  cellId: string | null | undefined,
  options: ReadonlyArray<YctdApprovedCellPickerOption>,
): string {
  const id = String(cellId ?? '').trim();
  if (!id) return '—';
  const hit = options.find((o) => o.value === id);
  return hit?.label ?? id;
}
