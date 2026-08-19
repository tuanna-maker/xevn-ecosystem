/** FR-UC-BP-PAY-07 · PO-HRM-MVP-GD1-PAY-07-CLUSTER-BE-01 */

export const HRM_PAY_TERM_409 = 'HRM-PAY-TERM-409' as const;
export const HRM_PAY_TERM_403 = 'HRM-PAY-TERM-403' as const;
export const HRM_PAY_TERM_404_NO_CASE = 'HRM-PAY-TERM-404-NO-CASE' as const;
export const HRM_PAY_TERM_400_USE_DEDICATED_SETTLE = 'HRM-PAY-TERM-400-USE-DEDICATED-SETTLE' as const;

export const PAY_TERM_CHECKLIST_REASON = {
  ASSET_OPEN: 'ASSET_OPEN',
  SI_CUTOFF_OPEN: 'SI_CUTOFF_OPEN',
  LEAVE_CASHOUT_OPEN: 'LEAVE_CASHOUT_OPEN',
  RD_PENDING: 'RD_PENDING',
} as const;

export type PayTermChecklistReasonCode =
  (typeof PAY_TERM_CHECKLIST_REASON)[keyof typeof PAY_TERM_CHECKLIST_REASON];

export const PAY_TERM_FORBIDDEN_BODY_KEYS = [
  'leave_cashout_vnd',
  'severance_vnd',
  'manual_payout_amount',
  'manual_payout_vnd',
  'override_severance',
  'override_leave_cashout',
] as const;

export const PAY_TERM_TERMINAL_STATUS_KEYS = new Set([
  'resigned',
  'termination',
  'terminated',
  'nghi_viec',
]);

export const PAY_TERM_SETTLEMENT_STATUSES = ['draft', 'ready', 'posted', 'cancelled'] as const;
export type PayTermSettlementStatus = (typeof PAY_TERM_SETTLEMENT_STATUSES)[number];
