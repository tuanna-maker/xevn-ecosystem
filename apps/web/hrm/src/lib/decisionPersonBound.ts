/**
 * @CODE-MEMORY
 * Screen:     /decisions — person-bound QSĐ gate (employee_id)
 * UC:         FR-UC-BP-CORE-01a · AC-DEC-WH-01 · AC-DEC-EMP-01 · BR-DEC-05
 * BR:         Person-bound decision_type → bắt employee_id; không SoT chỉ employee_name
 * SRS:        docs/program/specs/PO-HRM-E2E-LINK-EMP-SPEC-01.md §D.2/D.7
 * TechSpec:   docs/program/specs/PO-HRM-E2E-LINK-EMP-SA-01.md F-CORE-DEC-01
 * Purpose:    Pure helpers — loại QSĐ gắn người + validate employee_id trước Lưu.
 * WorkItem:   PO-HRM-E2E-LINK-EMP-FE-01
 * Coded:      2026-08-06
 * Callers:    Decisions.tsx · decisionPersonBound.test.ts
 * Callees:    none
 * FEActions:  Lưu QSĐ → isPersonBoundDecisionType + requireEmployeeIdForDecision
 * BEChain:    POST/PATCH /api/hrm/decisions (F-CORE-DEC-01) — BE enforce; FE gate sớm
 * Impact:     Bỏ bắt NV → AC-DEC-WH-01 FAIL; WH không neo decision_id
 * must_keep:  CatalogSearchPicker position; U65 no seed; J-HRM-01..04
 * SOLID:      Pure domain gate tách khỏi page
 * LastVerified: apps/web/hrm/src/lib/decisionPersonBound.test.ts
 *
 * @CODE-MEMORY-CHANGE 2026-08-06 PO-HRM-E2E-LINK-EMP-FE-02
 * change_mode: ADD
 * What: validateDecisionCreateForm — code/title/name + person-bound employee_id + position_key SoT
 * Why: R-EMP-DEC-WH-BROWSER-01 — toast generic khi thiếu field; HDSD path phải gate rõ trước POST
 * must_keep: CatalogSearchPicker position required; person-bound employee_id; U65; D2/D6 PASS
 *
 * @CODE-MEMORY-CHANGE 2026-08-07 PO-UAT-EMP-SOFT-OBS-FE-01
 * change_mode: FIX
 * What: Align person-bound + WH-neo with BE HRD_* catalog codes; expose isWorkHistoryNeoDecisionType
 * Why: OBS-D1-HINT — hdsd-decisions-effective-wh-hint false when type=HRD_01 (catalog ≠ appointment)
 * must_keep: D1 WH neo sealed; HRD_03 person-bound but NOT WH neo hint; U65; D5/J03 untouched
 */

/** Default person-bound types — legacy + live XBOS `hr_decision_types` (HRD_01..). */
export const DEFAULT_PERSON_BOUND_DECISION_TYPES = [
  'appointment',
  'promotion',
  'transfer',
  'termination',
  'contract_renewal',
  'hrd_01', // Bổ nhiệm
  'hrd_02', // Miễn nhiệm
  'hrd_03', // Kỷ luật (employee required; no WH neo)
] as const;

/**
 * F-CORE-DEC-02 — career spine only. HRD_03 = person-bound, no WH row / no WH hint.
 * Mirrors BE WORK_HISTORY_NEO_DECISION_TYPES.
 */
export const WORK_HISTORY_NEO_DECISION_TYPES = [
  'appointment',
  'transfer',
  'hrd_01',
  'hrd_02',
] as const;

export type PersonBoundDecisionType = (typeof DEFAULT_PERSON_BOUND_DECISION_TYPES)[number];

export function isPersonBoundDecisionType(
  decisionType: string | null | undefined,
  extraTypes: readonly string[] = [],
): boolean {
  const key = (decisionType ?? '').trim().toLowerCase();
  if (!key || key === 'all') return false;
  if ((DEFAULT_PERSON_BOUND_DECISION_TYPES as readonly string[]).includes(key)) return true;
  return extraTypes.some((t) => t.trim().toLowerCase() === key);
}

/** True when effective status should surface QSĐ→WH neo hint (AC-DEC-WH-02 / OBS-D1-HINT). */
export function isWorkHistoryNeoDecisionType(
  decisionType: string | null | undefined,
  extraTypes: readonly string[] = [],
): boolean {
  const key = (decisionType ?? '').trim().toLowerCase();
  if (!key || key === 'all') return false;
  if ((WORK_HISTORY_NEO_DECISION_TYPES as readonly string[]).includes(key)) return true;
  return extraTypes.some((t) => t.trim().toLowerCase() === key);
}

/** True when status transition should surface WH neo (AC-DEC-WH-02). */
export function isDecisionEffectiveStatus(status: string | null | undefined): boolean {
  return (status ?? '').trim().toLowerCase() === 'effective';
}

export type DecisionEmployeeGateResult =
  | { ok: true }
  | { ok: false; code: 'HRM-DEC-EMP-REQUIRED'; message: string };

/**
 * FE pre-submit gate for person-bound QSĐ — mirrors F-CORE-DEC-01 require employee_id.
 */
export function requireEmployeeIdForDecision(input: {
  decision_type: string;
  employee_id: string | null | undefined;
  extraPersonBoundTypes?: readonly string[];
}): DecisionEmployeeGateResult {
  if (!isPersonBoundDecisionType(input.decision_type, input.extraPersonBoundTypes ?? [])) {
    return { ok: true };
  }
  const id = (input.employee_id ?? '').trim();
  if (!id) {
    return {
      ok: false,
      code: 'HRM-DEC-EMP-REQUIRED',
      message:
        'Quyết định loại gắn người bắt buộc chọn nhân viên từ danh sách (không chỉ nhập tên).',
    };
  }
  return { ok: true };
}

export type DecisionCreateField =
  | 'decision_code'
  | 'title'
  | 'employee_name'
  | 'employee_id'
  | 'position_key';

export type DecisionCreateValidateResult =
  | { ok: true }
  | { ok: false; field: DecisionCreateField; message: string };

/**
 * Pre-submit gate for QSĐ create/edit — HDSD path (AC-DEC-WH · F-FRM-* · R-EMP-DEC-WH-BROWSER-01).
 * Order: code → title → employee_name → person-bound employee_id → position_key catalog SoT.
 */
export function validateDecisionCreateForm(input: {
  decision_code: string;
  title: string;
  employee_name: string;
  decision_type: string;
  employee_id: string | null | undefined;
  /** True when position_key resolves in CatalogSearchPicker options (no free-text). */
  positionCatalogOk: boolean;
  extraPersonBoundTypes?: readonly string[];
}): DecisionCreateValidateResult {
  if (!(input.decision_code ?? '').trim()) {
    return {
      ok: false,
      field: 'decision_code',
      message: 'Vui lòng nhập số / mã quyết định.',
    };
  }
  if (!(input.title ?? '').trim()) {
    return {
      ok: false,
      field: 'title',
      message: 'Vui lòng nhập tiêu đề quyết định.',
    };
  }
  if (!(input.employee_name ?? '').trim()) {
    return {
      ok: false,
      field: 'employee_name',
      message: 'Vui lòng chọn hoặc nhập tên nhân viên.',
    };
  }
  const empGate = requireEmployeeIdForDecision({
    decision_type: input.decision_type,
    employee_id: input.employee_id,
    extraPersonBoundTypes: input.extraPersonBoundTypes,
  });
  if (!empGate.ok) {
    return { ok: false, field: 'employee_id', message: empGate.message };
  }
  if (!input.positionCatalogOk) {
    return {
      ok: false,
      field: 'position_key',
      message: 'Chọn vị trí từ danh mục (không nhập tự do).',
    };
  }
  return { ok: true };
}
