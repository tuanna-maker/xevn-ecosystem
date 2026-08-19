/**
 * @CODE-MEMORY
 * Screen:     ATT leave accrual / balance RULE schema constants
 * UC:         AC-PLT-ATT-LEAVE-BAL-01* · FR-UC-BP-ATT-04/05b/09
 * BR:         L-ATT-LVRULE-01..10 · BR-PLT-02/04/05/06 · Option B Nest rule SoT
 * SRS:        docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-BALANCE-BA-01.md
 * TechSpec:   docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-BALANCE-SA-01.md F-ATT-LVRULE-*
 * DB_DESIGN:  docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-BALANCE-DATA-01.md §2
 * Purpose:    Accrual mode allow-list + error stamps — FORBIDDEN reopen leave-type L1 /
 *             Settings-sole · engine LIVE claim · closed leave_type_key CHECK.
 * WorkItem:   PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-BALANCE-BE-01
 * Coded:      2026-08-08
 * must_keep:  HRM-LEAVE-TYPE-UNKNOWN RETAIN (≠ LVRULE-KEY) · soft-retire · U65 no seed ·
 *             F-ATT-LEAVE-04 HOLD · ATT-CODE/WS/SHIFT seals
 * SOLID:      Constants SRP — no I/O
 * LastVerified: docs/qa/evidence/po-hrm-dynamic-config-platform-att-leave-balance-be-01.md
 */

/** Starter allow-list (DATA-01 §2.3) — admin open within set; BA may EXPAND later. */
export const ATT_LEAVE_ACCRUAL_MODES = [
  'year_start_grant',
  'month_end_accrual',
  'after_6_months',
  'manual_only',
  'other',
] as const;
export type AttLeaveAccrualMode = (typeof ATT_LEAVE_ACCRUAL_MODES)[number];

export const ATT_LEAVE_ACCRUAL_UNITS = ['day', 'hour'] as const;
export type AttLeaveAccrualUnit = (typeof ATT_LEAVE_ACCRUAL_UNITS)[number];

export const ATT_LEAVE_ACCRUAL_POLICY_STATUSES = ['active', 'retired'] as const;
export type AttLeaveAccrualPolicyStatus =
  (typeof ATT_LEAVE_ACCRUAL_POLICY_STATUSES)[number];

/** Format-only for accrual_mode / leave_type_key soft FK (not closed type ceiling). */
export const ATT_LEAVE_ACCRUAL_KEY_FORMAT = /^[a-z][a-z0-9_]*$/;

export const ATT_LEAVE_ACCRUAL_POLICY_KIND = 'att_leave_accrual_policy' as const;

/** Consumer invent unknown policy_id / ad-hoc mode|days when active policy >0. */
export const HRM_ATT_LVRULE_KEY = 'HRM-ATT-LVRULE-KEY';
/** Admin orphan leave_type_key ∉ EFF — class membership (≠ leave TXN UNKNOWN). */
export const HRM_ATT_LVRULE_TYPE = 'HRM-ATT-LVRULE-TYPE';
/** Overlapping active effective window same (company, leave_type_key). */
export const HRM_ATT_LVRULE_CONFLICT = 'HRM-ATT-LVRULE-CONFLICT';
export const HRM_ATT_LVRULE_404 = 'HRM-ATT-LVRULE-404';
export const HRM_PLT_CAT_CODE_INVALID = 'HRM-PLT-CAT-CODE-INVALID';

export const ATT_LEAVE_ACCRUAL_STATUS_LABEL_VI: Record<
  AttLeaveAccrualPolicyStatus,
  string
> = {
  active: 'Đang hiệu lực',
  retired: 'Đã nghỉ hưu',
};

export const ATT_LEAVE_ACCRUAL_MODE_LABEL_VI: Record<string, string> = {
  year_start_grant: 'Cấp đầu năm',
  month_end_accrual: 'Tích lũy cuối tháng',
  after_6_months: 'Sau 6 tháng',
  manual_only: 'Chỉ điều chỉnh tay',
  other: 'Khác (HR định nghĩa)',
};
