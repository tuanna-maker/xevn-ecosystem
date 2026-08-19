/**
 * @CODE-MEMORY
 * Screen:     EmployeeProfile → tab Tài sản (E20)
 * UC:         UC-BP-CORE-05 · FR-UC-BP-CORE-05
 * BR:         BR-BP-AST-01 · BR-CORE-05-PATH · BR-CORE-05-STATUS · BR-CORE-05-BB · BR-CORE-05-SERIAL · AC-CORE-05-*
 * SRS:        SRS_HRM_ENTERPRISE.md FR-UC-BP-CORE-05 Luồng #1–#4 · Diễn biến #1–#2
 * TechSpec:   docs/program/specs/PO-HRM-MVP-GD1-CORE-05-CLUSTER-API-01.md F-CORE-AST-01 · F-CORE-AST-BB-01
 * Purpose:    Helpers FE cấp phát tài sản GĐ1 stub — physical /employees/:id/assets* SoT;
 *             VI status · BB confirm gate CFG default on · serial 409 · soft status prefer;
 *             cấm Nest /core dual · FE invent Asset SoT / e-sign · notes-only = BB · claim CRUD = CORE-05 DONE.
 * WorkItem:   PO-HRM-MVP-GD1-CORE-05-CLUSTER-FE-01
 * Coded:      2026-08-09
 * Callers:    EmployeeAssets · useEmployeeAssets · source tests
 * Callees:    (pure)
 * must_keep:  Physical assets* · CORE-03 DOC/ET/CHK · CORE-02b · CORE-09d..01 · U65 · honesty false · C-SLICE
 * LastVerified: empCoreAstRing.test.ts
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-CORE-05-CLUSTER-FE-02
 * change_mode: FIX
 * What: buildAssetWritePayload — omit blank assignedDate/returnDate (never send "")
 * Why: QA-01 R-CORE-05-EMPTY-DATE-500 · empty "" → PG DATE 500; peer BE coerce empty→null
 * must_keep: BB CTA · serial 409 toast · soft status · Nest /core DENY · no CORE-05 DONE claim
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-CORE-06-CLUSTER-FE-01
 * change_mode: ADD
 * What: F-CORE-AST-02 soft-return/lost patches · FE-derive asset_checklist_closed · TERM assigned filter · Nest /core TERM DENY
 * Why: API-01 R-CORE-06-TERM-CHK-01 · R-CORE-06-CLOSED-01 · AC-CORE-06-* · soft Profile ≠ CORE-06 DONE
 * must_keep: CORE-05 BB/serial/DELETE-FORBIDDEN · Nest /core AST/TERM 0 · no PAY settle invent · no /return dual · honesty false · C-SLICE
 */

/** Toast / domain codes — F-CORE-AST serial + soft delete. */
export const HRM_EMP_ASSET_SERIAL_CONFLICT_CODE = 'HRM-EMP-ASSET-SERIAL-CONFLICT';
export const HRM_EMP_ASSET_DELETE_FORBIDDEN_CODE = 'HRM-EMP-ASSET-DELETE-FORBIDDEN';
export const HRM_EMP_ASSET_VAL_400_CODE = 'HRM-EMP-ASSET-VAL-400';

/** Physical Network SoT (O1). */
export const CORE_AST_PATH_FRAGMENT = '/employees/';
export const CORE_AST_SUFFIX = '/assets';

/** Paper alias — DENY as Nest SoT. */
export const CORE_AST_PAPER_CORE_PATH = '/api/hrm/core/employees';

/**
 * BR-CORE-05-BB / AC-CORE-05-05 — CFG «Đang sử dụng» requires BB confirm.
 * Default ON after residual live (API-01 §5.3).
 */
export const AST_BB_CONFIRM_GATE_DEFAULT_ON = true;

export type CoreAstStatus = 'assigned' | 'returned' | 'maintenance' | 'lost';

export const CORE_AST_STATUSES: readonly CoreAstStatus[] = [
  'assigned',
  'returned',
  'maintenance',
  'lost',
] as const;

export function isCoreAstPhysicalPath(path: string): boolean {
  return path.includes('/employees/') && path.includes('/assets');
}

/** Nest dual /core assets SoT — FAIL O1. */
export function isForbiddenCoreAstSotPath(path: string): boolean {
  if (!path.includes('/api/hrm/core/')) return false;
  return path.includes('/assets') || path.includes('asset');
}

export function isCoreAstStatus(raw: string | null | undefined): raw is CoreAstStatus {
  const s = (raw ?? '').trim().toLowerCase();
  return s === 'assigned' || s === 'returned' || s === 'maintenance' || s === 'lost';
}

/**
 * Fallback VI when BE omits statusLabelVi / status_label_vi (O3 / O11).
 * Prefer BE display-ready when present.
 */
export function astStatusLabelFallback(status: string | null | undefined): string {
  const s = (status ?? '').trim().toLowerCase();
  if (s === 'assigned') return 'Đang sử dụng';
  if (s === 'returned') return 'Đã thu hồi';
  if (s === 'maintenance') return 'Bảo trì';
  if (s === 'lost') return 'Mất/ghi nợ';
  return s || '—';
}

export function resolveAstStatusLabel(
  status: string | null | undefined,
  statusLabelVi: string | null | undefined,
): string {
  const fromBe = (statusLabelVi ?? '').trim();
  if (fromBe) return fromBe;
  return astStatusLabelFallback(status);
}

/** Parse confirm flag from display-ready (bool or timestamp). */
export function parseHandoverConfirmed(row: {
  handoverConfirmed?: unknown;
  handover_confirmed?: unknown;
  handoverConfirmedAt?: unknown;
  handover_confirmed_at?: unknown;
}): boolean {
  if (row.handoverConfirmed === true || row.handover_confirmed === true) return true;
  if (row.handoverConfirmed === false || row.handover_confirmed === false) return false;
  const at = row.handoverConfirmedAt ?? row.handover_confirmed_at;
  if (at == null || at === '') return false;
  return true;
}

/**
 * Fully «Đang sử dụng» for KPI / filter đang giữ (AC-CORE-05-02/05).
 * Base = status=assigned; when CFG on, also requires handoverConfirmed.
 */
export function isFullyInUse(
  asset: { status: string; handoverConfirmed: boolean },
  confirmGateOn: boolean = AST_BB_CONFIRM_GATE_DEFAULT_ON,
): boolean {
  if ((asset.status ?? '').trim().toLowerCase() !== 'assigned') return false;
  if (!confirmGateOn) return true;
  return asset.handoverConfirmed === true;
}

/** Assigned but chưa BB — show CTA «Xác nhận nhận» (≠ notes-only). */
export function needsHandoverConfirmCta(
  asset: { status: string; handoverConfirmed: boolean },
  confirmGateOn: boolean = AST_BB_CONFIRM_GATE_DEFAULT_ON,
): boolean {
  if (!confirmGateOn) return false;
  if ((asset.status ?? '').trim().toLowerCase() !== 'assigned') return false;
  return !asset.handoverConfirmed;
}

/** Issued history — prefer soft status over hard DELETE (O7 / AC-08). */
export function prefersSoftDisposition(asset: {
  status: string;
  handoverConfirmed: boolean;
}): boolean {
  const s = (asset.status ?? '').trim().toLowerCase();
  if (asset.handoverConfirmed) return true;
  return s === 'assigned' || s === 'returned' || s === 'maintenance' || s === 'lost';
}

/** PATCH body F-CORE-AST-BB-01 — confirm flags (≠ notes). */
export function buildHandoverConfirmPatch(receiverName?: string): Record<string, unknown> {
  const body: Record<string, unknown> = { handoverConfirmed: true };
  const name = (receiverName ?? '').trim();
  if (name) body.handoverReceiverName = name;
  return body;
}

/** Soft thu hồi — PATCH status returned (+ optional return_date ISO date). F-CORE-AST-02. */
export function buildSoftReturnPatch(returnDateIso?: string): Record<string, unknown> {
  const today = returnDateIso ?? new Date().toISOString().slice(0, 10);
  return { status: 'returned', return_date: today };
}

/**
 * Exception stub — PATCH status=lost + notes (R-CORE-06-EXCEPTION-01).
 * Structured bồi thường OUT invent — notes lý do only GĐ1.
 */
export function buildLostAssetPatch(
  notes: string,
  returnDateIso?: string,
): Record<string, unknown> {
  const body: Record<string, unknown> = {
    status: 'lost',
    notes: (notes ?? '').trim(),
  };
  const day = (returnDateIso ?? '').trim();
  if (day) body.return_date = day;
  return body;
}

/** Checklist «cần thu» = status=assigned only (O3 / AC-CORE-06-02). */
export function isAssignedAssetStatus(status: string | null | undefined): boolean {
  return (status ?? '').trim().toLowerCase() === 'assigned';
}

export function filterAssignedAssets<T extends { status: string }>(assets: readonly T[]): T[] {
  return assets.filter((a) => isAssignedAssetStatus(a.status));
}

/**
 * R-CORE-06-CLOSED-01 — FE-derive prefer.
 * true iff count(mandatory assigned) == 0. GĐ1: all assigned rows are mandatory (no waive col).
 */
export function countOpenAssigned(assets: readonly { status: string }[]): number {
  return filterAssignedAssets(assets).length;
}

export function deriveAssetChecklistClosed(
  assets: readonly { status: string }[],
): { asset_checklist_closed: boolean; openAssignedCount: number } {
  const openAssignedCount = countOpenAssigned(assets);
  return {
    asset_checklist_closed: openAssignedCount === 0,
    openAssignedCount,
  };
}

/** Nest dual /core terminations SoT — FAIL O1/O5. */
export function isForbiddenCoreTermSotPath(path: string): boolean {
  if (!path.includes('/api/hrm/core/')) return false;
  const p = path.toLowerCase();
  return p.includes('termination') || p.includes('/term');
}

/** Combined Nest /core AST|TERM dual assert (QA Network). */
export function isForbiddenCoreAstOrTermSotPath(path: string): boolean {
  return isForbiddenCoreAstSotPath(path) || isForbiddenCoreTermSotPath(path);
}

/**
 * Honesty footer — soft Profile Thu hồi alone ≠ FR-06 / CORE-06 DONE · CORE-05 ≠ personnel UAT.
 * FE MUST NOT flip readiness flags.
 */
export const CORE_06_SOFT_NE_DONE_FOOTER_VI =
  'Thu hồi trên Profile (đổi trạng thái) ≠ CORE-06 DONE — cần checklist đang giữ + tín hiệu thu hồi xong. CORE-05 ≠ personnel UAT.';

/** Date write keys (snake + camel) — blank must never reach PG DATE as "". */
export const AST_DATE_WRITE_KEYS = [
  'assigned_date',
  'return_date',
  'assignedDate',
  'returnDate',
] as const;

export function isBlankAssetDate(value: unknown): boolean {
  if (value == null) return true;
  if (typeof value === 'string' && value.trim() === '') return true;
  return false;
}

export function isAstDateWriteKey(key: string): boolean {
  return (AST_DATE_WRITE_KEYS as readonly string[]).includes(key);
}

/**
 * Create/update payload — omit blank assigned/return dates (do not send "").
 * Defense for R-CORE-05-EMPTY-DATE-500; peer BE coerces ""→null.
 * Non-date fields pass through unchanged (including empty notes/serial).
 */
export function buildAssetWritePayload(
  form: Record<string, unknown>,
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(form)) {
    if (value === undefined) continue;
    if (isAstDateWriteKey(key) && isBlankAssetDate(value)) continue;
    out[key] = value;
  }
  return out;
}

/** Honesty flags — FE MUST NOT flip. */
export const CORE_AST_UAT_HONESTY = {
  recruitment_uat_ready: false,
  jd_dynamic_done: false,
  contracts_printable_ready: false,
  hrm_personnel_uat_ready: false,
} as const;

/** CORE-06 honesty locks — soft≠DONE · CORE-05≠personnel · CORE-07/PAY OUT. */
export const CORE_06_UAT_HONESTY = {
  ...CORE_AST_UAT_HONESTY,
  soft_profile_alone_ne_core06_done: true,
  core05_ne_personnel_uat: true,
  core07_out_queued: true,
  pay07_settle_out: true,
} as const;
