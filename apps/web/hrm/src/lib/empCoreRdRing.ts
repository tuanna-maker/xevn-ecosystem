/**
 * @CODE-MEMORY
 * Screen:     EmployeeProfile → tab Khen thưởng / kỷ luật (KT/KL)
 * UC:         UC-BP-CORE-08 · FR-UC-BP-CORE-08
 * BR:         BR-BP-RD-01 · BR-CORE-RD-PATH · BR-CORE-RD-AMOUNT-PERIOD · AC-CORE-08-*
 * SRS:        SRS_HRM_ENTERPRISE.md FR-UC-BP-CORE-08 Diễn biến #1–#5
 * TechSpec:   docs/program/specs/PO-HRM-MVP-GD1-CORE-08-CLUSTER-API-01.md F-CORE-RD-01
 * Purpose:    Helpers FE KT/KL — physical rewards* + discipline* SoT; amount>0 → kỳ;
 *             enforce/cancel eligibility; cấm Nest /core dual · FE invent payslip Net ·
 *             fold /decisions · claim CORE-02=pillar DONE · note-CRUD=FR-08 DONE.
 * WorkItem:   PO-HRM-MVP-GD1-CORE-08-CLUSTER-FE-01
 * Coded:      2026-08-09
 * Callers:    EmployeeRewardsDiscipline · useEmployeeRewardsDiscipline · source tests
 * Callees:    (pure)
 * must_keep:  Physical /employees/:id/rewards* + /discipline* · U65 · honesty false · C-SLICE
 * LastVerified: empCoreRdRing.test.ts
 */

/** Toast codes — space before slash in comments only (CODE-MEMORY safe). */
export const HRM_CORE_RD_VAL_400_CODE = 'HRM-CORE-RD-VAL-400';
export const HRM_CORE_RD_ENFORCE_409_CODE = 'HRM-CORE-RD-ENFORCE-409';
export const HRM_CORE_RD_DUAL_PERIOD_409_CODE = 'HRM-CORE-RD-DUAL-PERIOD-409';
export const HRM_CORE_RD_LOCKED_PERIOD_409_CODE = 'HRM-CORE-RD-LOCKED-PERIOD-409';
export const HRM_CORE_RD_EMP_INACTIVE_409_CODE = 'HRM-CORE-RD-EMP-INACTIVE-409';
export const HRM_CORE_RD_PERIOD_404_CODE = 'HRM-CORE-RD-PERIOD-404';
export const HRM_CORE_RD_404_CODE = 'HRM-CORE-RD-404';

/** Physical Network SoT (O1). */
export const CORE_RD_REWARDS_PATH_FRAGMENT = '/employees/';
export const CORE_RD_REWARDS_SUFFIX = '/rewards';
export const CORE_RD_DISCIPLINE_SUFFIX = '/discipline';

/** Paper alias — DENY as Nest SoT. */
export const CORE_RD_PAPER_CORE_PATH = '/api/hrm/core/reward-discipline';

export type RdPayrollLinkStatus = 'none' | 'pending_period' | 'linked' | 'executed';

export type RdExecutionStatus =
  | 'pending'
  | 'in_force'
  | 'executed'
  | 'cancelled'
  /** LIVE residual aliases — display via status_label when BE supplies. */
  | 'approved'
  | 'active'
  | 'completed';

export function isCoreRdRewardsPhysicalPath(path: string): boolean {
  return path.includes('/employees/') && path.includes('/rewards');
}

export function isCoreRdDisciplinePhysicalPath(path: string): boolean {
  return path.includes('/employees/') && path.includes('/discipline');
}

export function isForbiddenCoreRdSotPath(path: string): boolean {
  return (
    path.includes('/api/hrm/core/') &&
    (path.includes('reward-discipline') || path.includes('/reward') || path.includes('/discipline'))
  );
}

/** Period unlocked for picker / enforce soft target (LIVE draft|processed · paper open|adjust). */
export function isRdPeriodSelectable(status: string | null | undefined): boolean {
  const s = (status ?? '').trim().toLowerCase();
  if (!s) return false;
  if (s === 'closed' || s === 'locked') return false;
  return s === 'draft' || s === 'processed' || s === 'open' || s === 'adjust';
}

/**
 * Client gate O2: amount>0 requires payroll_period_id before create/enforce.
 * Returns null when OK; otherwise VAL message for toast.
 */
export function validateRdAmountPeriodGate(input: {
  title: string;
  amount: number | null | undefined;
  payroll_period_id?: string | null;
}): string | null {
  if (!input.title.trim()) {
    return 'Thiếu tiêu đề khen thưởng / kỷ luật. Nhập tiêu đề trước rồi lưu.';
  }
  const amount = Number(input.amount ?? 0);
  if (Number.isFinite(amount) && amount > 0 && !(input.payroll_period_id ?? '').trim()) {
    return 'Có số tiền phải chọn kỳ lương đích (mở / điều chỉnh). Chọn kỳ rồi lưu.';
  }
  return null;
}

/** Pending / residual waiting — eligible for Enforce. */
export function canEnforceRdCase(status: string | null | undefined): boolean {
  const s = (status ?? '').trim().toLowerCase();
  return s === 'pending' || s === 'approved' || s === '';
}

/** In force / executed (or residual active/completed) — eligible for Cancel-enforce. */
export function canCancelEnforceRdCase(status: string | null | undefined): boolean {
  const s = (status ?? '').trim().toLowerCase();
  return (
    s === 'in_force' ||
    s === 'executed' ||
    s === 'active' ||
    s === 'completed' ||
    s === 'approved'
  );
}

/** Hard delete only when not linked to locked payslip path — prefer cancel when linked. */
export function canHardDeleteRdCase(input: {
  status: string | null | undefined;
  payroll_link_status?: string | null;
}): boolean {
  const link = (input.payroll_link_status ?? 'none').trim().toLowerCase();
  if (link === 'linked' || link === 'executed') return false;
  const s = (input.status ?? '').trim().toLowerCase();
  return s === 'pending' || s === 'cancelled' || s === 'approved' || s === '';
}

/** Fallback VI when BE omits status_label (display-ready prefer BE). */
export function rdStatusLabelFallback(status: string | null | undefined): string {
  switch ((status ?? '').trim().toLowerCase()) {
    case 'pending':
      return 'Chờ';
    case 'in_force':
    case 'approved':
    case 'active':
      return 'Đang thi hành';
    case 'executed':
    case 'completed':
      return 'Đã thi hành';
    case 'cancelled':
      return 'Hủy';
    default:
      return status?.trim() || '—';
  }
}

export function rdPayrollLinkLabelFallback(link: string | null | undefined): string {
  switch ((link ?? '').trim().toLowerCase()) {
    case 'none':
      return 'Không gắn lương';
    case 'pending_period':
      return 'Chờ kỳ lương';
    case 'linked':
      return 'Đã gắn kỳ';
    case 'executed':
      return 'Đã vào phiếu';
    default:
      return link?.trim() || '—';
  }
}

/** Build create/patch body — omit status (BE pending) · note-only omits period. */
export function buildRdMutatePayload(input: {
  title: string;
  typeKey: string;
  typeField: 'reward_type' | 'discipline_type';
  dateKey: string;
  dateField: 'reward_date' | 'discipline_date';
  amountField: 'amount' | 'penalty_amount';
  amount: number;
  description?: string;
  decision_number?: string;
  issued_by?: string;
  notes?: string;
  payroll_period_id?: string | null;
  effective_from?: string;
  effective_to?: string;
}): Record<string, unknown> {
  const amount = Number(input.amount) || 0;
  const periodId = (input.payroll_period_id ?? '').trim();
  const body: Record<string, unknown> = {
    title: input.title.trim(),
    [input.typeField]: input.typeKey,
    [input.dateField]: input.dateKey,
    [input.amountField]: amount,
    description: input.description?.trim() || null,
    decision_number: input.decision_number?.trim() || null,
    issued_by: input.issued_by?.trim() || null,
    notes: input.notes?.trim() || null,
  };
  if (amount > 0 && periodId) {
    body.payroll_period_id = periodId;
  } else {
    body.payroll_period_id = null;
  }
  if (input.effective_from !== undefined) {
    body.effective_from = input.effective_from?.trim() || null;
  }
  if (input.effective_to !== undefined) {
    body.effective_to = input.effective_to?.trim() || null;
  }
  return body;
}
