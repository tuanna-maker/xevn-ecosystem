/**
 * @CODE-MEMORY
 * Screen:     Performance / Insurance — status machine UI helpers (E3)
 * UC:         FR-HRM-PERF-SM-E3-01 · FR-HRM-INS-DEPTH-E3-01 · AC-E3-SM-01
 * BR:         BR-HRM-PERF-E3-02 · BR-HRM-INS-E3-03 · BR-HRM-SM-E3-01
 * SRS:        docs/program/deltas/BA_ERP_E3_SRS_01_20260728.md §1.2/§1.3
 * TechSpec:   docs/hrm/DB_DESIGN_HRM_ERP_E3.md §2.2 · API_DESIGN_HRM_ERP_E3.md
 * Purpose:    Pure allow-list next status cho cycle / eval / policy — FE disable illegal jump (U72).
 * WorkItem:   D-FE-ERP-E3-01
 * Coded:      2026-07-28
 * Callers:    Performance.tsx · InsurancePolicyMasterPanel · labelMaps
 * Callees:    none
 * Impact:     Sai map → nút SM cho phép jump → BE 400 hoặc data bẩn
 * must_keep:  Cycle enum ≠ eval enum (không collapse); withdraw submitted→draft cấm mặc định
 * SOLID:      Pure — no React / i18n
 * LastVerified: docs/qa/evidence/d-fe-erp-e3-01-20260728.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-01 D-HDSD-MUTATE-FE-DEPS-02
 * change_mode: ADD
 * What: Reconstruct statusMachineE3 (InsurancePolicyMasterPanel transitive) after Vite 500
 * Why: QA SMOKE-02 BH path — MasterPanel on /insurance needs nextInsurancePolicyStatuses
 * must_keep: Cycle ≠ eval enums · SoftDel · BH policy_id · TC-041 · U65 no seed
 */

export type PerformanceCycleStatus = 'draft' | 'active' | 'closed';
export type PerformanceEvalStatus = 'draft' | 'submitted' | 'approved' | 'completed';
export type InsurancePolicyStatus = 'draft' | 'active' | 'expired' | 'cancelled';

const CYCLE_NEXT: Record<PerformanceCycleStatus, readonly PerformanceCycleStatus[]> = {
  draft: ['active', 'closed'],
  active: ['closed'],
  closed: [],
};

const EVAL_NEXT: Record<PerformanceEvalStatus, readonly PerformanceEvalStatus[]> = {
  draft: ['submitted'],
  submitted: ['approved'],
  approved: ['completed'],
  completed: [],
};

const POLICY_NEXT: Record<InsurancePolicyStatus, readonly InsurancePolicyStatus[]> = {
  draft: ['active', 'cancelled'],
  active: ['expired', 'cancelled'],
  expired: [],
  cancelled: [],
};

function asCycle(status: string | null | undefined): PerformanceCycleStatus | null {
  const key = status?.trim().toLowerCase();
  if (key === 'open') return 'active'; // SRS open ≡ active
  if (key === 'draft' || key === 'active' || key === 'closed') return key;
  return null;
}

function asEval(status: string | null | undefined): PerformanceEvalStatus | null {
  const key = status?.trim().toLowerCase();
  if (key === 'draft' || key === 'submitted' || key === 'approved' || key === 'completed') {
    return key;
  }
  return null;
}

function asPolicy(status: string | null | undefined): InsurancePolicyStatus | null {
  const key = status?.trim().toLowerCase();
  if (key === 'draft' || key === 'active' || key === 'expired' || key === 'cancelled') {
    return key;
  }
  return null;
}

/** Next legal cycle statuses (U72 buttons). */
export function nextPerformanceCycleStatuses(
  current: string | null | undefined,
): readonly PerformanceCycleStatus[] {
  const from = asCycle(current);
  if (!from) return [];
  return CYCLE_NEXT[from];
}

/** Next legal evaluation statuses — no jumps / no withdraw. */
export function nextPerformanceEvalStatuses(
  current: string | null | undefined,
): readonly PerformanceEvalStatus[] {
  const from = asEval(current);
  if (!from) return [];
  return EVAL_NEXT[from];
}

/** Next legal insurance policy statuses. */
export function nextInsurancePolicyStatuses(
  current: string | null | undefined,
): readonly InsurancePolicyStatus[] {
  const from = asPolicy(current);
  if (!from) return [];
  return POLICY_NEXT[from];
}

export function isPerformanceCycleTransitionAllowed(
  from: string | null | undefined,
  to: string | null | undefined,
): boolean {
  const target = asCycle(to);
  if (!target) return false;
  return nextPerformanceCycleStatuses(from).includes(target);
}

export function isPerformanceEvalTransitionAllowed(
  from: string | null | undefined,
  to: string | null | undefined,
): boolean {
  const target = asEval(to);
  if (!target) return false;
  return nextPerformanceEvalStatuses(from).includes(target);
}

export function isInsurancePolicyTransitionAllowed(
  from: string | null | undefined,
  to: string | null | undefined,
): boolean {
  const target = asPolicy(to);
  if (!target) return false;
  return nextInsurancePolicyStatuses(from).includes(target);
}

/** Cycle editable (name/dates) when draft|active — not closed. */
export function isPerformanceCycleContentEditable(status: string | null | undefined): boolean {
  const key = asCycle(status);
  return key === 'draft' || key === 'active';
}

/** Eval content (score/summary/kpi) editable only in draft. */
export function isPerformanceEvalContentEditable(status: string | null | undefined): boolean {
  return asEval(status) === 'draft';
}

/** DELETE cycle allowed only draft (FE gate; BE may add eval-block). */
export function canDeletePerformanceCycle(status: string | null | undefined): boolean {
  return asCycle(status) === 'draft';
}

/** DELETE eval allowed only draft. */
export function canDeletePerformanceEval(status: string | null | undefined): boolean {
  return asEval(status) === 'draft';
}
