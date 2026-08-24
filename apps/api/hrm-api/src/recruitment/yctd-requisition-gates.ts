/**
 * @CODE-MEMORY
 * Screen:     HRM Tuyển dụng → YCTD trong/ngoài ĐB (gates)
 * UC:         UC-BP-REC-02 · UC-BP-REC-02b
 * BR:         BR-BP-HC-05/06 · BR-REC-02-* · Y-S1..Y-S13 · O2/O3/O4
 * SRS:        docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md FR-UC-BP-REC-02/02b
 * TechSpec:   docs/program/specs/PO-HRM-MVP-GD1-REC-02-CLUSTER-API-01.md F-REC-YCTD-01..04
 * DB:         docs/program/specs/PO-HRM-MVP-GD1-REC-02-CLUSTER-DATA-01.md §4–§8
 * Purpose:    Pure helpers — mode/hire/out/cell-qty/matrix/pipeline/receivable/O4 gates.
 * WorkItem:   PO-HRM-MVP-GD1-REC-02-CLUSTER-BE-01
 * Coded:      2026-08-09
 * Callers:    recruitment.service · uv-yctd-bind · recruitment-workflow.bridge
 * Callees:    ApiException
 * must_keep:  REC-01 spawn UQ · JD soft FK · one XBOS WF · soft-delete · U65 no seed
 * SOLID:      Gate helpers tách khỏi CRUD/WF I/O
 * LastVerified: po-hrm-mvp-gd1-rec-02-cluster-be-01.spec.ts
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-REC-02-TARGET-MONTH-BE-01
 * ADD normalizeTargetMonthOrThrow — YYYY-MM | YYYY-MM-01 → first-day DATE;
 * invalid → 400 HRM-YCTD-VAL-400 (not PG 500). Align spawn firstOfMonthIso.
 * change_mode: FIX · residual R-REC-02-TARGET-MONTH-DATE · must_keep YCTD gates
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-REC-04-CLUSTER-BE-01
 * ADD internal_scan_* on PipelineFlags (JSON keys only) · posted gate BR-BP-CV-01
 * · mint HRM-REC-CV-SCAN-* · skip HR|TP+reason · RETAIN posted/has_cv family (no wipe).
 * change_mode: UPGRADE · UC-BP-REC-04 · API-01 §4–§8 · DENY scan-event sole SoT · REC-03
 */
import { HttpStatus } from '@nestjs/common';
import { ApiException } from '../common/api.exception';
import { getVerifiedInternalJwtPayload } from '../common/internal-auth';

export const HRM_YCTD_MODE_REQUIRED = 'HRM-YCTD-MODE-REQUIRED';
export const HRM_YCTD_CELL_MISSING = 'HRM-YCTD-CELL-MISSING';
export const HRM_YCTD_CELL_NOT_APPROVED = 'HRM-YCTD-CELL-NOT-APPROVED';
export const HRM_YCTD_CELL_PLAN_NOT_APPROVED =
  'HRM-YCTD-CELL-PLAN-NOT-APPROVED';
export const HRM_YCTD_CELL_QTY = 'HRM-YCTD-CELL-QTY';
export const HRM_YCTD_OUT_REASON = 'HRM-YCTD-OUT-REASON';
export const HRM_YCTD_HIRE_REASON = 'HRM-YCTD-HIRE-REASON';
export const HRM_YCTD_MATRIX_MISMATCH = 'HRM-YCTD-MATRIX-MISMATCH';
export const HRM_YCTD_BOD_REQUIRED = 'HRM-YCTD-BOD-REQUIRED';
export const HRM_YCTD_NOT_RECEIVABLE = 'HRM-YCTD-NOT-RECEIVABLE';
export const HRM_YCTD_MODE_UNCLASSIFIED = 'HRM-YCTD-MODE-UNCLASSIFIED';
export const HRM_YCTD_SPAWN_DUP = 'HRM-YCTD-SPAWN-DUP';
export const HRM_YCTD_VAL_400 = 'HRM-YCTD-VAL-400';

/** UC-BP-REC-04 / F-REC-CV-SCAN-* mint (API-01 §7). */
export const HRM_REC_CV_SCAN_REQUIRED = 'HRM-REC-CV-SCAN-REQUIRED';
export const HRM_REC_CV_SCAN_SKIP_REASON = 'HRM-REC-CV-SCAN-SKIP-REASON';
export const HRM_REC_CV_SCAN_FORBIDDEN = 'HRM-REC-CV-SCAN-FORBIDDEN';
export const HRM_REC_CV_SCAN_YCTD = 'HRM-REC-CV-SCAN-YCTD';
export const HRM_REC_CV_SCAN_ALREADY = 'HRM-REC-CV-SCAN-ALREADY';

/** Tenant CFG snapshot keys (SHORT vs LONG+BOD). */
export const YCTD_MATRIX_SHORT = 'hrm_requisition_short';
export const YCTD_MATRIX_LONG_BOD = 'hrm_requisition_long_bod';

export type YctdHeadcountMode = 'in_plan' | 'out_of_plan';
export type YctdHireReason = 'new' | 'replace';

export type PipelineFlags = {
  posted: boolean;
  has_cv: boolean;
  interview_started: boolean;
  cv_intake_allowed: boolean;
  posted_at: string | null;
  has_cv_at: string | null;
  interview_started_at: string | null;
  /** UC-BP-REC-04 — ADD keys on pipeline_flags_json (ba-data NOT REQUIRED). */
  internal_scan_done: boolean;
  internal_scan_skipped: boolean;
  internal_scan_at: string | null;
  internal_scan_skip_reason: string | null;
};

export const EMPTY_PIPELINE_FLAGS: PipelineFlags = {
  posted: false,
  has_cv: false,
  interview_started: false,
  cv_intake_allowed: false,
  posted_at: null,
  has_cv_at: null,
  interview_started_at: null,
  internal_scan_done: false,
  internal_scan_skipped: false,
  internal_scan_at: null,
  internal_scan_skip_reason: null,
};

export type PipelineFlagsPatch = Partial<{
  posted?: boolean;
  has_cv?: boolean;
  interview_started?: boolean;
  cv_intake_allowed?: boolean;
  internal_scan_done?: boolean;
  internal_scan_skipped?: boolean;
  internal_scan_skip_reason?: string | null;
}>;

export function normalizeHireReason(raw: unknown): YctdHireReason | null {
  if (raw == null || raw === '') return null;
  const s = String(raw).trim().toLowerCase();
  if (s === 'new') return 'new';
  if (s === 'replace' || s === 'replacement') return 'replace';
  return null;
}

/**
 * R-REC-02-TARGET-MONTH-DATE — DATE column rejects bare month / YYYY-MM with PG cast 500.
 * Accept null/omit/'' → null; `YYYY-MM` | `YYYY-MM-DD` (valid calendar) → coerce first-of-month.
 * Invalid → 400 HRM-YCTD-VAL-400 (API-01 VAL family).
 */
export function normalizeTargetMonthOrThrow(raw: unknown): string | null {
  if (raw == null) return null;
  const trimmed = String(raw).trim();
  if (trimmed === '') return null;

  const ym = /^(\d{4})-(0[1-9]|1[0-2])$/.exec(trimmed);
  if (ym) {
    return `${ym[1]}-${ym[2]}-01`;
  }

  const ymd = /^(\d{4})-(0[1-9]|1[0-2])-(\d{2})$/.exec(trimmed);
  if (ymd) {
    const year = Number(ymd[1]);
    const month = Number(ymd[2]);
    const day = Number(ymd[3]);
    const dt = new Date(Date.UTC(year, month - 1, day));
    if (
      dt.getUTCFullYear() !== year ||
      dt.getUTCMonth() !== month - 1 ||
      dt.getUTCDate() !== day
    ) {
      throw new ApiException(
        HRM_YCTD_VAL_400,
        'target_month phải là YYYY-MM hoặc YYYY-MM-01 (ngày không hợp lệ)',
        HttpStatus.BAD_REQUEST,
      );
    }
    return `${ymd[1]}-${ymd[2]}-01`;
  }

  throw new ApiException(
    HRM_YCTD_VAL_400,
    'target_month phải là YYYY-MM hoặc YYYY-MM-01',
    HttpStatus.BAD_REQUEST,
  );
}

export function normalizeHeadcountMode(raw: unknown): YctdHeadcountMode | null {
  if (raw == null || raw === '') return null;
  const s = String(raw).trim().toLowerCase();
  if (s === 'in_plan' || s === 'out_of_plan') return s;
  return null;
}

export function parsePipelineFlags(raw: unknown): PipelineFlags {
  const base = { ...EMPTY_PIPELINE_FLAGS };
  if (!raw || typeof raw !== 'object') return base;
  const o = raw as Record<string, unknown>;
  return {
    posted: o.posted === true,
    has_cv: o.has_cv === true,
    interview_started: o.interview_started === true,
    cv_intake_allowed: o.cv_intake_allowed === true,
    posted_at: typeof o.posted_at === 'string' ? o.posted_at : null,
    has_cv_at: typeof o.has_cv_at === 'string' ? o.has_cv_at : null,
    interview_started_at:
      typeof o.interview_started_at === 'string'
        ? o.interview_started_at
        : null,
    internal_scan_done: o.internal_scan_done === true,
    internal_scan_skipped: o.internal_scan_skipped === true,
    internal_scan_at:
      typeof o.internal_scan_at === 'string' ? o.internal_scan_at : null,
    internal_scan_skip_reason:
      typeof o.internal_scan_skip_reason === 'string'
        ? o.internal_scan_skip_reason
        : null,
  };
}

/** BR-BP-CV-01 / O5 — posted only after done ∨ (skipped ∧ reason). */
export function isInternalScanSatisfiedForPosted(
  flags: PipelineFlags,
): boolean {
  if (flags.internal_scan_done === true) return true;
  if (
    flags.internal_scan_skipped === true &&
    typeof flags.internal_scan_skip_reason === 'string' &&
    flags.internal_scan_skip_reason.trim() !== ''
  ) {
    return true;
  }
  return false;
}

export function assertPostedAllowedOrThrow(flags: PipelineFlags): void {
  if (!isInternalScanSatisfiedForPosted(flags)) {
    throw new ApiException(
      HRM_REC_CV_SCAN_REQUIRED,
      'Chưa quét kho nội bộ hoặc chưa bỏ qua có lý do — không đặt posted',
      HttpStatus.BAD_REQUEST,
    );
  }
}

export function requireInternalScanSkipReasonOrThrow(reason: unknown): string {
  const text = typeof reason === 'string' ? reason.trim() : '';
  if (!text) {
    throw new ApiException(
      HRM_REC_CV_SCAN_SKIP_REASON,
      'Nhập lý do bỏ qua quét kho nội bộ',
      HttpStatus.BAD_REQUEST,
    );
  }
  return text;
}

/**
 * O7 — Skip chỉ HR tuyển dụng | Trưởng bộ phận (và CEO/manager ladder có quyền mutate YCTD).
 * employee-only → 403 HRM-REC-CV-SCAN-FORBIDDEN.
 */
export function assertInternalScanSkipActorOrThrow(
  authorization?: string,
): void {
  const payload = getVerifiedInternalJwtPayload(authorization);
  const roleRaw =
    (typeof payload?.roleCode === 'string' && payload.roleCode) ||
    (typeof payload?.role_code === 'string' && payload.role_code) ||
    (typeof payload?.role === 'string' && payload.role) ||
    '';
  const role = String(roleRaw).trim().toLowerCase();
  if (!role) {
    throw new ApiException(
      HRM_REC_CV_SCAN_FORBIDDEN,
      'Không đủ quyền bỏ qua quét kho nội bộ',
      HttpStatus.FORBIDDEN,
    );
  }
  if (role === 'employee' || role === 'staff' || role === 'driver') {
    throw new ApiException(
      HRM_REC_CV_SCAN_FORBIDDEN,
      'Không đủ quyền bỏ qua quét kho nội bộ — chỉ HR tuyển dụng hoặc Trưởng bộ phận',
      HttpStatus.FORBIDDEN,
    );
  }
  const allowed =
    role.includes('hr') ||
    role.includes('ceo') ||
    role.includes('manager') ||
    role.includes('head') ||
    role.startsWith('group_') ||
    role === 'department_head' ||
    role === 'direct_manager' ||
    role === 'subsidiary_ceo' ||
    role === 'member_ceo';
  if (!allowed) {
    throw new ApiException(
      HRM_REC_CV_SCAN_FORBIDDEN,
      'Không đủ quyền bỏ qua quét kho nội bộ — chỉ HR tuyển dụng hoặc Trưởng bộ phận',
      HttpStatus.FORBIDDEN,
    );
  }
}

/** Quét kho / complete|skip — YCTD phải receivable open_for_hire (SCAN-YCTD ≠ YCTD-NOT-RECEIVABLE). */
export function assertYctdOpenForInternalScanOrThrow(row: {
  status?: string | null;
  headcount_mode?: string | null;
}): void {
  if (isLegacyUnclassifiedMode(row.headcount_mode)) {
    throw new ApiException(
      HRM_REC_CV_SCAN_YCTD,
      'YCTD chưa mở nhận hồ sơ — cần phân loại và open_for_hire trước khi quét kho',
      HttpStatus.BAD_REQUEST,
    );
  }
  if (!isYctdReceivableStatus(row.status)) {
    throw new ApiException(
      HRM_REC_CV_SCAN_YCTD,
      'YCTD chưa mở nhận hồ sơ (open_for_hire) — không thể quét kho / ghi vết quét',
      HttpStatus.BAD_REQUEST,
    );
  }
}

export function applyInternalScanComplete(
  current: PipelineFlags,
  nowIso: string,
): PipelineFlags {
  return {
    ...current,
    internal_scan_done: true,
    internal_scan_skipped: false,
    internal_scan_skip_reason: null,
    internal_scan_at: nowIso,
  };
}

export function applyInternalScanSkip(
  current: PipelineFlags,
  skipReason: string,
  nowIso: string,
): PipelineFlags {
  return {
    ...current,
    internal_scan_skipped: true,
    internal_scan_done: false,
    internal_scan_skip_reason: skipReason,
    internal_scan_at: nowIso,
  };
}

export function mergePipelineFlags(
  current: PipelineFlags,
  patch: PipelineFlagsPatch,
  nowIso: string,
): PipelineFlags {
  let next = { ...current };
  // Scan keys first so posted gate can see same-request done|skip.
  if (patch.internal_scan_done === true) {
    next = applyInternalScanComplete(next, nowIso);
  } else if (patch.internal_scan_skipped === true) {
    const reason = requireInternalScanSkipReasonOrThrow(
      patch.internal_scan_skip_reason ?? next.internal_scan_skip_reason,
    );
    next = applyInternalScanSkip(next, reason, nowIso);
  } else if (
    patch.internal_scan_skip_reason !== undefined &&
    patch.internal_scan_skipped !== false
  ) {
    // Reason-only patch without skip flag — ignore unless skipped already.
    if (next.internal_scan_skipped) {
      next.internal_scan_skip_reason = requireInternalScanSkipReasonOrThrow(
        patch.internal_scan_skip_reason,
      );
    }
  }
  if (patch.posted !== undefined) {
    next.posted = patch.posted === true;
    next.posted_at = next.posted ? nowIso : null;
  }
  if (patch.has_cv !== undefined) {
    next.has_cv = patch.has_cv === true;
    next.has_cv_at = next.has_cv ? nowIso : null;
  }
  if (patch.interview_started !== undefined) {
    next.interview_started = patch.interview_started === true;
    next.interview_started_at = next.interview_started ? nowIso : null;
  }
  if (patch.cv_intake_allowed !== undefined) {
    next.cv_intake_allowed = patch.cv_intake_allowed === true;
  }
  return next;
}

/** Normative receivable for new writes (O3) — open/approved = legacy synonym when classified. */
export function isYctdReceivableStatus(
  status: string | null | undefined,
): boolean {
  const s = String(status ?? '')
    .trim()
    .toLowerCase();
  return s === 'open_for_hire' || s === 'open' || s === 'approved';
}

export function isYctdNormativeReceivable(
  status: string | null | undefined,
): boolean {
  return (
    String(status ?? '')
      .trim()
      .toLowerCase() === 'open_for_hire'
  );
}

export function isLegacyUnclassifiedMode(
  mode: string | null | undefined,
): boolean {
  return mode == null || String(mode).trim() === '';
}

/** O4 DATA-01 — one-time uplift copy for legacy rows without headcount_mode. */
export const YCTD_LEGACY_BACKFILL_OUT_REASON_VI =
  'YCTD legacy — phân loại ngoài định biên (nâng cấp Wave-2)';

export type LegacyYctdHeadcountModeBackfill = {
  headcount_mode: YctdHeadcountMode;
  hire_reason: YctdHireReason;
  approval_matrix_key: string;
  out_of_plan_reason?: string;
};

/**
 * Infer Wave-2 classification for grandfather rows (NULL headcount_mode).
 * Rows already linked to a headcount cell → in_plan; otherwise out_of_plan + reason.
 */
export function inferLegacyYctdHeadcountModeBackfill(input: {
  headcount_mode: string | null | undefined;
  headcount_cell_id: string | null | undefined;
}): LegacyYctdHeadcountModeBackfill | null {
  if (!isLegacyUnclassifiedMode(input.headcount_mode)) return null;
  const cellId = String(input.headcount_cell_id ?? '').trim();
  if (cellId) {
    return {
      headcount_mode: 'in_plan',
      hire_reason: 'new',
      approval_matrix_key: YCTD_MATRIX_SHORT,
    };
  }
  return {
    headcount_mode: 'out_of_plan',
    hire_reason: 'new',
    approval_matrix_key: YCTD_MATRIX_LONG_BOD,
    out_of_plan_reason: YCTD_LEGACY_BACKFILL_OUT_REASON_VI,
  };
}

export const LEGACY_YCTD_HEADCOUNT_MODE_BACKFILL_IN_PLAN_SQL = `
  WITH winners AS (
    SELECT DISTINCT ON (company_id, headcount_cell_id) id
    FROM public.job_requisitions
    WHERE headcount_mode IS NULL
      AND headcount_cell_id IS NOT NULL
    ORDER BY company_id, headcount_cell_id, created_at ASC NULLS LAST, id ASC
  )
  UPDATE public.job_requisitions r
  SET
    headcount_mode = 'in_plan',
    hire_reason = COALESCE(r.hire_reason, 'new'),
    approval_matrix_key = COALESCE(
      NULLIF(TRIM(r.approval_matrix_key), ''),
      '${YCTD_MATRIX_SHORT}'
    ),
    updated_at = NOW()
  FROM winners w
  WHERE r.id = w.id;
`;

export const LEGACY_YCTD_HEADCOUNT_MODE_BACKFILL_OUT_OF_PLAN_SQL = `
  UPDATE public.job_requisitions
  SET
    headcount_mode = 'out_of_plan',
    hire_reason = COALESCE(hire_reason, 'new'),
    out_of_plan_reason = COALESCE(
      NULLIF(TRIM(out_of_plan_reason), ''),
      '${YCTD_LEGACY_BACKFILL_OUT_REASON_VI}'
    ),
    approval_matrix_key = COALESCE(
      NULLIF(TRIM(approval_matrix_key), ''),
      '${YCTD_MATRIX_LONG_BOD}'
    ),
    updated_at = NOW()
  WHERE headcount_mode IS NULL;
`;

export async function backfillLegacyYctdHeadcountMode(db: {
  query: (
    sql: string,
    params?: unknown[],
  ) => Promise<{ rows?: unknown[] } | unknown>;
}): Promise<void> {
  try {
    const probe = await db.query(`
      SELECT 1 AS n
      FROM public.job_requisitions
      WHERE headcount_mode IS NULL
      LIMIT 1
    `);
    const rows =
      probe && typeof probe === 'object' && 'rows' in probe
        ? (probe as { rows?: unknown[] }).rows
        : undefined;
    if (!rows?.length) return;

    await db.query(LEGACY_YCTD_HEADCOUNT_MODE_BACKFILL_IN_PLAN_SQL);
    await db.query(LEGACY_YCTD_HEADCOUNT_MODE_BACKFILL_OUT_OF_PLAN_SQL);
  } catch (err) {
    // Never fail ensureSchema — legacy rows stay classifiable via PATCH; avoids HTTP 500 on all HRM routes.
    console.warn(
      '[hrm-api] YCTD legacy headcount_mode backfill skipped:',
      err instanceof Error ? err.message : err,
    );
  }
}

export function assertYctdModeClassifiedOrThrow(
  mode: string | null | undefined,
): void {
  if (isLegacyUnclassifiedMode(mode)) {
    throw new ApiException(
      HRM_YCTD_MODE_UNCLASSIFIED,
      'YCTD chưa phân loại trong/ngoài ĐB — cần chọn headcount_mode trước khi nhận hồ sơ / mở tin',
      HttpStatus.CONFLICT,
    );
  }
}

export function assertYctdReceivableForMutateOrThrow(row: {
  status?: string | null;
  headcount_mode?: string | null;
}): void {
  assertYctdModeClassifiedOrThrow(row.headcount_mode);
  const status = String(row.status ?? '')
    .trim()
    .toLowerCase();
  const mode = String(row.headcount_mode ?? '')
    .trim()
    .toLowerCase();
  // Out-of-plan before BOD: approved/pending ≠ receivable (Y-S9).
  if (
    mode === 'out_of_plan' &&
    status !== 'open_for_hire' &&
    status !== 'open'
  ) {
    throw new ApiException(
      HRM_YCTD_BOD_REQUIRED,
      'YCTD ngoài ĐB chưa đủ duyệt BOD — không được nhận hồ sơ / mở tin',
      HttpStatus.CONFLICT,
    );
  }
  // Normative receivable = open_for_hire; legacy synonym open when classified (O3).
  if (status !== 'open_for_hire' && status !== 'open') {
    throw new ApiException(
      HRM_YCTD_NOT_RECEIVABLE,
      'Chỉ YCTD ở trạng thái open_for_hire (hoặc legacy open đã phân loại) mới nhận hồ sơ / pipeline',
      HttpStatus.CONFLICT,
    );
  }
}

export function resolveApprovalMatrixKey(mode: YctdHeadcountMode): string {
  return mode === 'in_plan' ? YCTD_MATRIX_SHORT : YCTD_MATRIX_LONG_BOD;
}

export function assertMatrixMatchesModeOrThrow(
  mode: YctdHeadcountMode,
  matrixKey: string | null | undefined,
): void {
  const expected = resolveApprovalMatrixKey(mode);
  const key = (matrixKey ?? '').trim();
  if (!key) return;
  if (mode === 'in_plan' && key === YCTD_MATRIX_LONG_BOD) {
    throw new ApiException(
      HRM_YCTD_MATRIX_MISMATCH,
      'YCTD trong ĐB không được dùng ma trận LONG-only',
      HttpStatus.CONFLICT,
    );
  }
  if (mode === 'out_of_plan' && key === YCTD_MATRIX_SHORT) {
    throw new ApiException(
      HRM_YCTD_MATRIX_MISMATCH,
      'YCTD ngoài ĐB không được dùng ma trận SHORT-only',
      HttpStatus.CONFLICT,
    );
  }
  if (
    key !== expected &&
    key !== YCTD_MATRIX_SHORT &&
    key !== YCTD_MATRIX_LONG_BOD
  ) {
    // Unknown tenant key — allow if mode family matches via contains
    const lower = key.toLowerCase();
    if (
      mode === 'in_plan' &&
      lower.includes('long') &&
      !lower.includes('short')
    ) {
      throw new ApiException(
        HRM_YCTD_MATRIX_MISMATCH,
        'YCTD trong ĐB không được dùng ma trận LONG-only',
        HttpStatus.CONFLICT,
      );
    }
    if (
      mode === 'out_of_plan' &&
      lower.includes('short') &&
      !lower.includes('long')
    ) {
      throw new ApiException(
        HRM_YCTD_MATRIX_MISMATCH,
        'YCTD ngoài ĐB không được dùng ma trận SHORT-only',
        HttpStatus.CONFLICT,
      );
    }
  }
}

export function requireModeOrThrow(raw: unknown): YctdHeadcountMode {
  const mode = normalizeHeadcountMode(raw);
  if (!mode) {
    throw new ApiException(
      HRM_YCTD_MODE_REQUIRED,
      'headcount_mode bắt buộc: in_plan | out_of_plan',
      HttpStatus.BAD_REQUEST,
    );
  }
  return mode;
}

export function requireHireReasonOrThrow(
  hireReasonRaw: unknown,
  replaceEmployeeId?: string | null,
): { hire_reason: YctdHireReason; replace_employee_id: string | null } {
  const hire = normalizeHireReason(hireReasonRaw);
  if (!hire) {
    throw new ApiException(
      HRM_YCTD_HIRE_REASON,
      'hire_reason bắt buộc: new | replace',
      HttpStatus.BAD_REQUEST,
    );
  }
  if (hire === 'replace') {
    const id = (replaceEmployeeId ?? '').trim();
    if (!id) {
      throw new ApiException(
        HRM_YCTD_HIRE_REASON,
        'replace_employee_id bắt buộc khi hire_reason=replace',
        HttpStatus.BAD_REQUEST,
      );
    }
    return { hire_reason: hire, replace_employee_id: id };
  }
  return { hire_reason: hire, replace_employee_id: null };
}

export function requireOutOfPlanReasonOrThrow(reason: unknown): string {
  const text = typeof reason === 'string' ? reason.trim() : '';
  if (!text) {
    throw new ApiException(
      HRM_YCTD_OUT_REASON,
      'out_of_plan_reason bắt buộc khi headcount_mode=out_of_plan',
      HttpStatus.BAD_REQUEST,
    );
  }
  return text;
}

export function requireRejectedReasonOrThrow(reason: unknown): string {
  const text = typeof reason === 'string' ? reason.trim() : '';
  if (!text) {
    throw new ApiException(
      HRM_YCTD_VAL_400,
      'rejected_reason bắt buộc khi từ chối YCTD',
      HttpStatus.BAD_REQUEST,
    );
  }
  return text;
}

export function pipelineRequiresReceivableGate(
  patch: PipelineFlagsPatch,
): boolean {
  return (
    patch.posted === true ||
    patch.has_cv === true ||
    patch.interview_started === true ||
    patch.cv_intake_allowed === true ||
    patch.internal_scan_done === true ||
    patch.internal_scan_skipped === true
  );
}

export type CellCapacitySnapshot = {
  cell_id: string;
  lifecycle_status: string;
  plan_status: string;
  headcount_need_hire: number;
  plan_id: string | null;
};

/** O2 — qty must not exceed cell need_hire capacity. */
export function assertCellQtyOrThrow(
  requested: number,
  cellNeedHire: number,
): void {
  if (requested > cellNeedHire) {
    throw new ApiException(
      HRM_YCTD_CELL_QTY,
      `Số lượng vượt ô Cần tuyển (còn tối đa ${cellNeedHire}) — hãy chuyển sang ngoài ĐB nếu phát sinh`,
      HttpStatus.CONFLICT,
      { requested, cell_capacity: cellNeedHire },
    );
  }
}
