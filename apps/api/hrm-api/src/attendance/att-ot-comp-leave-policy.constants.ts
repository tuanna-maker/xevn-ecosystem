/**
 * @CODE-MEMORY
 * Screen:     HRM → Chấm công → Chế độ phép bù OT (`/attendance/ot-comp-leave-policy`)
 * UC:         FR-UC-BP-ATT-06 · AC-ATT-06-POLICY-TOGGLE · AC-ATT-06-HOURS-DAYS
 * SRS:        docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md FR-UC-BP-ATT-06
 * TechSpec:   docs/program/specs/PO-HRM-MVP-GD1-ATT-06-CLUSTER-API-01.md §4.8–§4.9
 * DB_DESIGN:  docs/program/specs/PO-HRM-MVP-GD1-ATT-06-CLUSTER-DATA-01.md §5.1–§5.2
 * Purpose:    Mã lỗi + hằng số cho policy OT→phép bù và ledger idempotency.
 * WorkItem:   PO-HRM-MVP-GD1-ATT-06-CLUSTER-BE-01
 * Coded:      2026-08-10
 * must_keep:  comp_balance_key default compensatory · DENY merge annual/carry_over ·
 *             DENY att_leave_hold · accrual ≠ sheet close
 * SOLID:      Constants SRP — không I/O
 * LastVerified: docs/qa/evidence/po-hrm-mvp-gd1-att-06-cluster-be-01.md
 */

export const ATT_OT_COMP_LEAVE_POLICY_STATUSES = ['active', 'retired'] as const;

export const HRM_ATT_OT_COMP_POLICY_RATIO = 'HRM-ATT-OT-COMP-POLICY-RATIO';
export const HRM_ATT_OT_COMP_POLICY_CONFLICT = 'HRM-ATT-OT-COMP-POLICY-409';
export const HRM_ATT_OT_COMP_POLICY_CONFIG = 'HRM-ATT-OT-COMP-POLICY-CONFIG';
export const HRM_ATT_OT_COMP_NO_ACCRUE = 'HRM-ATT-OT-COMP-NO-ACCRUE';

/** Default OT compensation codes that map to leave-comp accrual when maps_comp_codes unset. */
export const ATT_OT_COMP_LEAVE_ACCRUE_DEFAULT_CODES = [
  'compensatory_leave',
  'compensatory',
] as const;

export const ATT_OT_COMP_BALANCE_KEY_DEFAULT = 'compensatory' as const;
