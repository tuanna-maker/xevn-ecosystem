/** F-PAY-TNCN-01 — progressive PIT (FR-UC-BP-PAY-06 · AC-PAY-06-DENY-MANUAL). */
export const HRM_PAY_TAX_403 = 'HRM-PAY-TAX-403';

export const PAY_TAX_FORBIDDEN_BODY_KEYS = [
  'tax_amount',
  'tax_amount_vnd',
  'taxAmount',
  'taxAmountVnd',
  'net_amount',
  'net_amount_vnd',
  'netAmount',
  'netAmountVnd',
  'manual_tax',
  'manual_tax_vnd',
  'manualTax',
  'override_tax',
  'override_tax_vnd',
  'tncn_amount',
  'tncn_amount_vnd',
] as const;

export const PAY_TNCN_BRACKET_SNAPSHOT_VERSION = 'progressive_vn_v1';
