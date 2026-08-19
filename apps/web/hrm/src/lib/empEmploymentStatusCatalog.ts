/**
 * @CODE-MEMORY
 * Screen:     /employees form + filter — catalog trạng thái NV (F-EMP-CAT-ST-EFF)
 * UC:         AC-PLT-EMP-STATUS-01 / 01b / 01c · VAL-EMP-ST-CNS-02 · VAL-EMP-STR-CNS-01
 * BR:         DYNAMIC-LOCK — format-only status_key · Nest EFF SoT khi EFF>0 · bootstrap 3 khi EFF=0
 * SRS:        docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-CATALOG-BA-01.md § AC-01*
 * TechSpec:   docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-FE-SA-01.md Option A LOCKED
 * API_DESIGN: F-EMP-CAT-ST-EFF-01 · F-EMP-CAT-STR-EFF-01 · HRM-EMP-STATUS-KEY / REASON-KEY
 * Purpose:    Helper thuần map Nest employment-status / status-reason → picker options.
 *             EFF>0 → bind Nest; EFF=0 → bootstrap active|probation|inactive (không seed · không SoT).
 * WorkItem:   PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-CATALOG-FE-01
 * Coded:      2026-08-08
 * Callers:    useEmpEmploymentStatusesEffective · useEmpStatusReasonsEffective · EmployeeFormDialog · Employees
 * Callees:    (pure) — không gọi API
 * must_keep:  ST/STR KEY constants · EMP-CUSTOM · ATT seals · LVRULE HOLD ·
 *             hrm_personnel_uat_ready=false · C-SLICE · U65 no seed · Nest pos/dept DENY
 * SOLID:      Constants/helpers SRP — FE bind display-ready từ Nest
 * solid_convention_ack: FE chỉ format + map nhãn; không join Settings khi EFF>0
 * LastVerified: docs/qa/evidence/po-hrm-dynamic-config-platform-emp-status-catalog-fe-01.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-09
 * WorkItem:   PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-FE-ADMIN-BUILD-FE-01
 * change_mode: ADD
 * What:       formatDisplay + sourceLabel + reason key format helpers cho Settings ST/STR admin twin
 * Why:        Sponsor UNLOCK ABSENT twin R-PLT-EMP-ST-FE-ADMIN · peer DEC/ET Settings pattern
 * must_keep:  Nest KEY sealed path · no dual writer · pos/dept Nest DENY · honesty false · C-SLICE
 */

/** Format-only — khớp BE EMP_EMPLOYMENT_STATUS_KEY_FORMAT; KHÔNG phải danh sách đóng. */
export const EMP_EMPLOYMENT_STATUS_KEY_FORMAT = /^[a-z][a-z0-9_]*$/;

/** Format-only — khớp BE EMP_STATUS_REASON_KEY_FORMAT. */
export const EMP_STATUS_REASON_KEY_FORMAT = /^[a-z][a-z0-9_]*$/;

export const EMP_EMPLOYMENT_STATUS_SOURCE_LABELS: Record<string, string> = {
  emp_native: 'EMP (đơn vị)',
  group_ref: 'Danh mục tập đoàn',
  emp_override: 'EMP ghi đè REF',
};

/** Honesty — FE không flip UAT personnel / e2e từ slice consumer này. */
export const EMP_EMPLOYMENT_STATUS_UAT_HONESTY = false;

/** BE invent KEY khi EFF>0 và status ∉ effective (F-EMP-ST-CNS-01). */
export const HRM_EMP_STATUS_KEY_CODE = 'HRM-EMP-STATUS-KEY';

/** BE invent KEY khi reason required / reason EFF>0 và reason ∉ STR (F-EMP-ST-CNS-02). */
export const HRM_EMP_STATUS_REASON_KEY_CODE = 'HRM-EMP-STATUS-REASON-KEY';

/** Option chuẩn cho picker trạng thái NV — value bind = status_key (Nest). */
export interface EmpEmploymentStatusPickerOption {
  /** Nest emp_employment_status.status_key — value + submit (BE assert KEY). */
  value: string;
  /** Nhãn hiển thị (nameVi display-ready). */
  label: string;
  requiresReason?: boolean;
  isTerminal?: boolean;
  isWorkforceActive?: boolean;
}

/** Row tối thiểu cần để map (subset của effective record). */
export interface EmpEmploymentStatusEffectiveLike {
  statusKey?: string | null;
  nameVi?: string | null;
  statusLabel?: string | null;
  sortOrder?: number | null;
  requiresReason?: boolean | null;
  isTerminal?: boolean | null;
  isWorkforceActive?: boolean | null;
  legacyAliasKeys?: string[] | null;
}

/**
 * Bootstrap fallback — CHỈ dùng khi Nest EFF=0 (catalog rỗng, chưa admin tạo).
 * KHÔNG phải SoT, KHÔNG seed (AC-PLT-EMP-STATUS-01c · U65).
 */
export interface EmpEmploymentStatusBootstrapFallbackItem {
  statusKey: string;
  i18nKey: string;
  defaultNameVi: string;
}

export const EMP_EMPLOYMENT_STATUS_BOOTSTRAP_FALLBACK: readonly EmpEmploymentStatusBootstrapFallbackItem[] =
  [
    { statusKey: 'active', i18nKey: 'employees.active', defaultNameVi: 'Đang làm việc' },
    { statusKey: 'probation', i18nKey: 'employees.probation', defaultNameVi: 'Thử việc' },
    { statusKey: 'inactive', i18nKey: 'employees.inactive', defaultNameVi: 'Ngừng làm việc' },
  ] as const;

/** Normalize key — trim + hyphen→underscore + lowercase (khớp BE assert). */
export function normalizeEmpEmploymentStatusKey(raw: string): string {
  return raw.trim().replace(/-/g, '_').toLowerCase();
}

export function isValidEmpEmploymentStatusKeyFormat(raw: string): boolean {
  const key = normalizeEmpEmploymentStatusKey(raw);
  return Boolean(key) && EMP_EMPLOYMENT_STATUS_KEY_FORMAT.test(key);
}

export function empEmploymentStatusSourceLabel(source: string | null | undefined): string {
  const s = (source ?? '').trim();
  return EMP_EMPLOYMENT_STATUS_SOURCE_LABELS[s] ?? (s || '—');
}

export function formatEmpEmploymentStatusDisplay(
  statusKey: string,
  nameVi: string | null | undefined,
): string {
  const key = statusKey.trim();
  const label = (nameVi ?? '').trim();
  if (label) return `${label} (${key})`;
  return key || '—';
}

export function isValidEmpStatusReasonKeyFormat(raw: string): boolean {
  const key = normalizeEmpStatusReasonKey(raw);
  return Boolean(key) && EMP_STATUS_REASON_KEY_FORMAT.test(key);
}

export function formatEmpStatusReasonDisplay(
  reasonKey: string,
  nameVi: string | null | undefined,
): string {
  const key = reasonKey.trim();
  const label = (nameVi ?? '').trim();
  if (label) return `${label} (${key})`;
  return key || '—';
}

/** Parse comma/space-separated applies_to status keys → normalized unique list. */
export function parseEmpStatusReasonAppliesTo(raw: string): string[] {
  const parts = raw
    .split(/[,;\s]+/)
    .map((p) => normalizeEmpEmploymentStatusKey(p))
    .filter(Boolean);
  return [...new Set(parts)];
}

/** Map một effective row → picker option (value = statusKey, không invent). */
export function empEmploymentStatusToPickerOption(
  row: EmpEmploymentStatusEffectiveLike,
): EmpEmploymentStatusPickerOption {
  const value = normalizeEmpEmploymentStatusKey(String(row.statusKey ?? ''));
  const nameVi = String(row.nameVi ?? row.statusLabel ?? '').trim();
  return {
    value,
    label: nameVi || value,
    requiresReason: Boolean(row.requiresReason),
    isTerminal: Boolean(row.isTerminal),
    isWorkforceActive: row.isWorkforceActive !== false,
  };
}

/** Map danh sách effective rows → options (bỏ row thiếu key; giữ sort Nest). */
export function empEmploymentStatusesToPickerOptions(
  rows: readonly EmpEmploymentStatusEffectiveLike[],
): EmpEmploymentStatusPickerOption[] {
  return rows.map(empEmploymentStatusToPickerOption).filter((o) => Boolean(o.value));
}

/**
 * Resolve nhãn hiển thị từ giá trị đã lưu (status_key Nest hoặc nhãn legacy).
 * Khớp key → name; không khớp → trả nguyên giá trị đã lưu (giữ lịch sử, không invent).
 */
export function resolveEmpEmploymentStatusLabel(
  options: readonly EmpEmploymentStatusPickerOption[],
  codeOrValue: string | null | undefined,
): string {
  const raw = (codeOrValue ?? '').trim();
  if (!raw) return '—';
  const normalized = normalizeEmpEmploymentStatusKey(raw);
  const hit = options.find(
    (o) => o.value === raw || o.value === normalized || o.value.toLowerCase() === raw.toLowerCase(),
  );
  return hit ? hit.label : raw;
}

/**
 * Resolve mã Select ban đầu từ status đã lưu.
 * EFF>0: chỉ chọn mã có trong Nest options (alias soft match);
 * EFF=0: bootstrap closed-3.
 */
export function resolveEmpEmploymentStatusEditValue(
  options: readonly EmpEmploymentStatusPickerOption[],
  storedStatus: string | null | undefined,
  catalogBound: boolean,
): string {
  const raw = normalizeEmpEmploymentStatusKey(storedStatus ?? '');
  if (!raw) return options[0]?.value ?? 'active';
  const direct = options.find((o) => o.value === raw);
  if (direct) return direct.value;
  if (!catalogBound) {
    if (options.some((o) => o.value === raw)) return raw;
    return options[0]?.value ?? 'active';
  }
  // EFF>0 · mã lịch sử ngoài catalog → neo option đầu (không invent free-text SoT).
  return options[0]?.value ?? 'active';
}

/** Option chuẩn cho picker lý do trạng thái — value = reason_key. */
export interface EmpStatusReasonPickerOption {
  value: string;
  label: string;
  appliesToStatusKeys?: string[] | null;
}

export interface EmpStatusReasonEffectiveLike {
  reasonKey?: string | null;
  nameVi?: string | null;
  sortOrder?: number | null;
  appliesToStatusKeys?: string[] | null;
}

export function normalizeEmpStatusReasonKey(raw: string): string {
  return raw.trim().replace(/-/g, '_').toLowerCase();
}

export function empStatusReasonToPickerOption(
  row: EmpStatusReasonEffectiveLike,
): EmpStatusReasonPickerOption {
  const value = normalizeEmpStatusReasonKey(String(row.reasonKey ?? ''));
  const nameVi = String(row.nameVi ?? '').trim();
  return {
    value,
    label: nameVi || value,
    appliesToStatusKeys: row.appliesToStatusKeys ?? null,
  };
}

export function empStatusReasonsToPickerOptions(
  rows: readonly EmpStatusReasonEffectiveLike[],
): EmpStatusReasonPickerOption[] {
  return rows.map(empStatusReasonToPickerOption).filter((o) => Boolean(o.value));
}

/**
 * Filter client-side applies_to (khi API chưa filter / hoặc full EFF list).
 * Null/empty applies_to = applies to all statuses.
 */
export function filterEmpStatusReasonsForStatus(
  options: readonly EmpStatusReasonPickerOption[],
  statusKey: string | null | undefined,
): EmpStatusReasonPickerOption[] {
  const sk = normalizeEmpEmploymentStatusKey(statusKey ?? '');
  if (!sk) return [...options];
  return options.filter((o) => {
    const applies = o.appliesToStatusKeys;
    if (!applies || applies.length === 0) return true;
    return applies.map((k) => normalizeEmpEmploymentStatusKey(k)).includes(sk);
  });
}

export function resolveEmpStatusReasonLabel(
  options: readonly EmpStatusReasonPickerOption[],
  codeOrValue: string | null | undefined,
): string {
  const raw = (codeOrValue ?? '').trim();
  if (!raw) return '—';
  const normalized = normalizeEmpStatusReasonKey(raw);
  const hit = options.find((o) => o.value === raw || o.value === normalized);
  return hit ? hit.label : raw;
}
