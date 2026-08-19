/**
 * @CODE-MEMORY
 * Screen:     /employees form + Work Timeline — catalog chức danh (Settings job_titles EFF)
 * UC:         AC-PLT-EMP-01 / 01b / 01c · VAL-EMP-POS-CNS-01/02/03
 * BR:         Option A — Settings/XBOS job_titles SoT when EFF>0 · invent → HRM-EMP-POSITION-KEY
 * SRS:        docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-POSITION-FE-SA-01.md Option A
 * TechSpec:   F-EMP-CAT-POS-EFF · F-EMP-POS-CNS-01/02/04 · L1 EMPPOSQA2-MSK3CDH1 RETAIN
 * API_DESIGN: assertJobTitleKeyInCatalog · WH alias HRM-WH-PICK-REQUIRED ≡ POSITION-KEY
 * Purpose:    Helper thuần — KEY constants, normalize, resolve edit invent/STAFF, toast VI.
 *             EFF>0 → picker ∈ job_titles; invent/out-of-EFF → Network 400 KEY + toast.
 *             EFF=0 → empty CTA HRM-WH-PICK-EMPTY-CATALOG · không seed · không free-text SoT.
 * WorkItem:   PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-POSITION-CATALOG-FE-01-R2
 * Coded:      2026-08-08
 * Callers:    useEmployeeMutations · EmployeeFormDialog · EmployeeWorkTimeline
 * Callees:    (pure) — không gọi Nest emp_position (DENIED)
 * must_keep:  POSITION KEY · EMP-STATUS FE CLOSED · EMP-CUSTOM · ATT · LVRULE HOLD ·
 *             Nest emp_position DENY · personnel=false · C-SLICE · U65 no seed
 * SOLID:      Constants/helpers SRP — FE bind Settings EFF display-ready
 * solid_convention_ack: FE chỉ format + map nhãn Settings; cấm Nest emp_position dual master
 * LastVerified: docs/qa/evidence/po-hrm-dynamic-config-platform-emp-position-catalog-fe-01.md
 */

import { ApiClientError, toErrorMessage } from '@/lib/apiError';

/** BE invent KEY when EFF>0 and job_title_key ∉ Settings job_titles effective (F-EMP-POS-CNS-01). */
export const HRM_EMP_POSITION_KEY_CODE = 'HRM-EMP-POSITION-KEY';

/** WH alias ≡ POSITION-KEY class (same invent assert). */
export const HRM_WH_PICK_REQUIRED_CODE = 'HRM-WH-PICK-REQUIRED';

/** Empty EFF catalog class (CTA Settings / CH06f · no seed). */
export const HRM_WH_PICK_EMPTY_CATALOG_CODE = 'HRM-WH-PICK-EMPTY-CATALOG';

/** Honesty — FE không flip UAT personnel / e2e từ slice consumer này. */
export const EMP_POSITION_UAT_HONESTY = false;

/** Nest emp_position table/admin — DENIED forever (Option A Settings SoT). */
export const EMP_POSITION_NEST_TABLE_DENIED = true;

/** Format-only — alphanumeric + underscore; không phải danh sách đóng. */
export const EMP_POSITION_KEY_FORMAT = /^[A-Za-z][A-Za-z0-9_]*$/;

export interface EmpPositionPickerOptionLike {
  value: string;
  label: string;
  code?: string;
}

/** Normalize key — trim (giữ casing catalog codes; BE assert khớp code). */
export function normalizeEmpPositionKey(raw: string): string {
  return raw.trim();
}

export function isValidEmpPositionKeyFormat(raw: string): boolean {
  const key = normalizeEmpPositionKey(raw);
  return Boolean(key) && EMP_POSITION_KEY_FORMAT.test(key);
}

/**
 * Resolve mã picker ban đầu từ job_title_key đã lưu (không dùng display label).
 * EFF>0: chỉ giữ mã ∈ options; invent/STAFF ngoài EFF → '' (bắt chọn lại, không invent free-text).
 * EFF=0: giữ raw nếu có (empty catalog — CTA, không seed SoT).
 */
export function resolveEmpPositionEditValue(
  options: readonly EmpPositionPickerOptionLike[],
  storedJobTitleKey: string | null | undefined,
  catalogBound: boolean,
): string {
  const raw = normalizeEmpPositionKey(storedJobTitleKey ?? '');
  if (!raw) return '';
  const hit = options.find(
    (o) =>
      o.value === raw ||
      o.code === raw ||
      o.value.toLowerCase() === raw.toLowerCase() ||
      (o.code ?? '').toLowerCase() === raw.toLowerCase(),
  );
  if (hit) return hit.value;
  if (!catalogBound) return raw;
  // EFF>0 · mã lịch sử ngoài catalog (STAFF OBS class) → clear, không invent SoT.
  return '';
}

/** True when value is empty or belongs to EFF options (case-insensitive code match). */
export function isEmpPositionKeyInCatalog(
  options: readonly EmpPositionPickerOptionLike[],
  value: string | null | undefined,
): boolean {
  const raw = normalizeEmpPositionKey(value ?? '');
  if (!raw) return true;
  return options.some(
    (o) =>
      o.value === raw ||
      o.code === raw ||
      o.value.toLowerCase() === raw.toLowerCase() ||
      (o.code ?? '').toLowerCase() === raw.toLowerCase(),
  );
}

export function isEmpPositionInventKeyError(error: unknown): boolean {
  if (!(error instanceof ApiClientError) || !error.code) return false;
  return (
    error.code === HRM_EMP_POSITION_KEY_CODE || error.code === HRM_WH_PICK_REQUIRED_CODE
  );
}

const POSITION_KEY_TOAST_VI =
  'Chức danh không thuộc danh mục hiệu lực. Chọn mã từ danh sách hoặc cấu hình trong Cài đặt → Danh mục nghiệp vụ (chức danh / job_titles · CH06f).';

const API_CLIENT_GENERIC_VI = 'Có lỗi xảy ra khi gọi API.';

/**
 * Surface invent POSITION KEY / WH-PICK-REQUIRED as VI toast; else fallback toErrorMessage.
 */
export function empPositionKeyToastMessage(error: unknown, fallback: string): string {
  if (isEmpPositionInventKeyError(error) && error instanceof ApiClientError) {
    const msg = error.message?.trim() ?? '';
    if (msg && msg !== API_CLIENT_GENERIC_VI) return msg;
    return POSITION_KEY_TOAST_VI;
  }
  return toErrorMessage(error, fallback);
}

/**
 * Combine EMP status KEY toast + POSITION KEY toast (mutations catch).
 * Prefer domain-specific KEY messages before generic toErrorMessage.
 */
export function empMutateKeyToastMessage(
  error: unknown,
  fallback: string,
  statusKeyToast: (err: unknown, fb: string) => string,
): string {
  if (isEmpPositionInventKeyError(error)) {
    return empPositionKeyToastMessage(error, fallback);
  }
  return statusKeyToast(error, fallback);
}
