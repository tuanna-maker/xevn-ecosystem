/**
 * @CODE-MEMORY
 * Screen:     /employees form + Work Timeline — catalog phòng ban (Settings departments EFF)
 * UC:         AC-PLT-EMP-DEPT-01 / 01b / 01c · VAL-EMP-DEPT-CNS-01/02/04
 * BR:         Option A — Settings/XBOS departments SoT when EFF>0 · invent → HRM-EMP-DEPT-KEY
 * SRS:        docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-DEPT-FE-SA-01.md Option A
 * TechSpec:   F-EMP-CAT-DEPT-EFF · F-EMP-DEPT-CNS-01/02/04 · L1 EMPDEPTQA-MSK3VVXX RETAIN
 * API_DESIGN: assertWhDepartmentKey · WH alias HRM-WH-DEPT-KEY ≡ HRM-EMP-DEPT-KEY (P3 alias HOLD)
 * Purpose:    Helper thuần — KEY constants, normalize, resolve edit invent/out-of-EFF, toast VI.
 *             EFF>0 → picker ∈ departments; invent/out-of-EFF → Network 400 KEY + toast.
 *             EFF=0 → empty CTA HRM-EMP-DEPT-EMPTY-CATALOG · không seed · không free-text SoT.
 * WorkItem:   PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-DEPT-CATALOG-FE-01
 * Coded:      2026-08-08
 * Callers:    useEmployeeMutations · EmployeeFormDialog · EmployeeWorkTimeline
 * Callees:    (pure) — không gọi Nest emp_department (DENIED)
 * must_keep:  DEPT KEY L1 EMPDEPTQA-MSK3VVXX · POSITION KEY · EMP-POSITION FE CLOSED ·
 *             EMP-STATUS FE CLOSED · EMP-CUSTOM · ATT · LVRULE HOLD ·
 *             Nest emp_department DENY · Nest emp_position DENY · personnel=false · C-SLICE · U65
 * SOLID:      Constants/helpers SRP — FE bind Settings EFF display-ready (peer empPositionCatalog)
 * solid_convention_ack: FE chỉ format + map nhãn Settings; cấm Nest emp_department dual master
 * LastVerified: docs/qa/evidence/po-hrm-dynamic-config-platform-emp-dept-catalog-fe-01.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-08 PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-DEPT-CATALOG-FE-02
 * change_mode: FIX
 * What: ADD mergeEmployeeDepartmentWriteFields — route selected department key vào
 *       custom_fields.department (BE từ chối top-level `department` HRM-VAL-001; SoT lưu =
 *       custom_fields.department). undefined → giữ nguyên (partial); rỗng/null → clear;
 *       non-empty → set custom_fields.department = normalizeEmpDeptKey.
 * Why: QA FAIL EMPDEPTQAFE-MSKG2900 · R-PLT-EMP-DEPT-FE-01 OPEN — useEmployeeMutations không
 *      forward department → Lưu không gửi department → F5 rỗng. SA Option A storage path.
 * must_keep: DEPT KEY L1 · POSITION KEY · EMP-POSITION FE CLOSED · EMP-STATUS FE CLOSED ·
 *            EMP-CUSTOM · ATT · LVRULE HOLD · Nest emp_department DENY · Nest emp_position DENY ·
 *            personnel=false · C-SLICE · U65
 */

import { ApiClientError, toErrorMessage } from '@/lib/apiError';

/** BE invent KEY when EFF>0 and department ∉ Settings departments effective (F-EMP-DEPT-CNS-01). */
export const HRM_EMP_DEPT_KEY_CODE = 'HRM-EMP-DEPT-KEY';

/** WH alias ≡ HRM-EMP-DEPT-KEY class (same invent assert · P3 alias HOLD RETAIN). */
export const HRM_WH_DEPT_KEY_CODE = 'HRM-WH-DEPT-KEY';

/** Empty EFF catalog class (CTA Settings / CH06g · no seed). */
export const HRM_EMP_DEPT_EMPTY_CATALOG_CODE = 'HRM-EMP-DEPT-EMPTY-CATALOG';

/** Honesty — FE không flip UAT personnel / e2e từ slice consumer này. */
export const EMP_DEPT_UAT_HONESTY = false;

/** Nest emp_department table/admin — DENIED forever (Option A Settings SoT). */
export const EMP_DEPT_NEST_TABLE_DENIED = true;

export interface EmpDeptPickerOptionLike {
  value: string;
  label: string;
  code?: string;
}

/** Normalize key — trim (giữ casing catalog codes; BE assert khớp code). */
export function normalizeEmpDeptKey(raw: string): string {
  return raw.trim();
}

/**
 * Resolve mã picker ban đầu từ department (đã lưu) — không dùng display label.
 * EFF>0: chỉ giữ mã ∈ options; invent/legacy ngoài EFF → '' (bắt chọn lại, không invent free-text).
 * EFF=0: giữ raw nếu có (empty catalog — CTA, không seed SoT).
 */
export function resolveEmpDeptEditValue(
  options: readonly EmpDeptPickerOptionLike[],
  storedDeptKey: string | null | undefined,
  catalogBound: boolean,
): string {
  const raw = normalizeEmpDeptKey(storedDeptKey ?? '');
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
  // EFF>0 · giá trị lịch sử/tên ngoài catalog → clear, không invent SoT (tránh submit invent lặng).
  return '';
}

/** True when value is empty or belongs to EFF options (case-insensitive code match). */
export function isEmpDeptKeyInCatalog(
  options: readonly EmpDeptPickerOptionLike[],
  value: string | null | undefined,
): boolean {
  const raw = normalizeEmpDeptKey(value ?? '');
  if (!raw) return true;
  return options.some(
    (o) =>
      o.value === raw ||
      o.code === raw ||
      o.value.toLowerCase() === raw.toLowerCase() ||
      (o.code ?? '').toLowerCase() === raw.toLowerCase(),
  );
}

export function isEmpDeptInventKeyError(error: unknown): boolean {
  if (!(error instanceof ApiClientError) || !error.code) return false;
  return error.code === HRM_EMP_DEPT_KEY_CODE || error.code === HRM_WH_DEPT_KEY_CODE;
}

const DEPT_KEY_TOAST_VI =
  'Phòng ban không thuộc danh mục hiệu lực. Chọn mã từ danh sách hoặc cấu hình trong Cài đặt → Danh mục nghiệp vụ (phòng ban / departments · CH06g).';

const API_CLIENT_GENERIC_VI = 'Có lỗi xảy ra khi gọi API.';

/**
 * Surface invent DEPT KEY (HRM-EMP-DEPT-KEY / WH alias HRM-WH-DEPT-KEY) as VI toast;
 * else fallback toErrorMessage.
 */
export function empDeptKeyToastMessage(error: unknown, fallback: string): string {
  if (isEmpDeptInventKeyError(error) && error instanceof ApiClientError) {
    const msg = error.message?.trim() ?? '';
    if (msg && msg !== API_CLIENT_GENERIC_VI) return msg;
    return DEPT_KEY_TOAST_VI;
  }
  return toErrorMessage(error, fallback);
}

/**
 * DEPT invent KEY first, then delegate to next domain toast (position / status).
 * Keeps mutation catch composable (peer empMutateKeyToastMessage chain).
 */
export function empDeptKeyToastFirst(
  error: unknown,
  fallback: string,
  next: (err: unknown, fb: string) => string,
): string {
  if (isEmpDeptInventKeyError(error)) {
    return empDeptKeyToastMessage(error, fallback);
  }
  return next(error, fallback);
}

/** Employee write fields carrying avatar + custom_fields (peer mergeEmployeeAvatarWriteFields). */
export interface EmployeeCustomFieldWriteFields {
  avatar_url?: string | null;
  custom_fields?: Record<string, string>;
}

/**
 * Route selected department key into custom_fields.department write path.
 *
 * BE rejects top-level `department` (HRM-VAL-001 `property department should not exist`);
 * SoT storage = `custom_fields.department` (SA Option A · AC-PLT-EMP-DEPT-01).
 *
 * - `department === undefined` → no change (partial update leaves custom_fields untouched).
 * - non-empty key → set `custom_fields.department = normalizeEmpDeptKey(key)` (fresh picker
 *   value overrides any stale echoed custom_fields.department).
 * - `null` / empty → remove `custom_fields.department` (clear) while keeping sibling keys.
 *
 * Keeps an empty `custom_fields` object when caller already provided one so a clear can
 * propagate on update; otherwise omits `custom_fields` to avoid empty writes.
 */
export function mergeEmployeeDepartmentWriteFields(
  department: string | null | undefined,
  writeFields: EmployeeCustomFieldWriteFields,
): EmployeeCustomFieldWriteFields {
  if (department === undefined) return writeFields;

  const key = normalizeEmpDeptKey(department ?? '');
  const custom: Record<string, string> = { ...(writeFields.custom_fields ?? {}) };
  if (key) {
    custom.department = key;
  } else {
    delete custom.department;
  }

  const next: EmployeeCustomFieldWriteFields = { ...writeFields };
  const hadCustom = writeFields.custom_fields !== undefined;
  if (Object.keys(custom).length > 0 || hadCustom) {
    next.custom_fields = custom;
  } else {
    delete next.custom_fields;
  }
  return next;
}
