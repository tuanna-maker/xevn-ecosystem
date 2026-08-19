/** F-PAY-GTCG-01 — giảm trừ gia cảnh (FR-UC-BP-PAY-03 · BR-BP-PAY-02). */
export const HRM_PAY_GTCG_403 = 'HRM-PAY-GTCG-403';
export const HRM_PAY_GTCG_412 = 'HRM-PAY-GTCG-412';

export const PAY_GTCG_REGIME_CODE_DEFAULT = 'VN_PIT_GTGC';

/** Body keys that attempt manual GTCG override on payroll mutate (AC-PAY-03-DENY-MANUAL). */
export const PAY_GTCG_FORBIDDEN_BODY_KEYS = [
  'gtgc_amount',
  'gtgc_amount_vnd',
  'gtgcAmountVnd',
  'gtgcAmount',
  'dependent_count',
  'dependents_count',
  'dependentsCount',
  'manual_gtgc',
  'manualGtgc',
] as const;
