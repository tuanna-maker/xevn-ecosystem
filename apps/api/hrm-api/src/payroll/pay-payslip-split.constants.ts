/** F-PAY-SPLIT-01 — double static merge guard (FR-UC-BP-PAY-04 FAIL GTCG kép). */
export const HRM_PAY_SPLIT_409 = 'HRM-PAY-SPLIT-409';

/** Component codes treated as static monthly vars — must not appear on >1 segment eval (DV-14 merge). */
export const PAY_SPLIT_STATIC_COMPONENT_PREFIXES = [
  'GTCG',
  'GTGC',
  'TAX',
  'THUE',
  'SI_',
  'BH_',
  'BHXH',
  'BHYT',
  'BHTN',
] as const;
