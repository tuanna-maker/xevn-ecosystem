/**
 * @CODE-MEMORY
 * Screen:     HRM → Chấm công → Thứ tự quỹ nghỉ ốm
 * UC:         FR-UC-BP-ATT-07 · BR-BP-LV-04 · DV-16
 * API_DESIGN: docs/program/specs/PO-HRM-MVP-GD1-ATT-07-CLUSTER-API-01.md §4.7–§4.8
 * Purpose:    Error mints + default fund sequence when no persisted policy row.
 * WorkItem:   PO-HRM-MVP-GD1-ATT-07-CLUSTER-BE-01
 */

export const HRM_ATT_SICK_FUND_ORDER_INVALID =
  'HRM-ATT-SICK-FUND-ORDER-INVALID';
export const HRM_ATT_SICK_DV16_DAY = 'HRM-ATT-SICK-DV16-DAY';
export const HRM_ATT_SICK_POLICY_MISSING = 'HRM-ATT-SICK-POLICY-MISSING';

export const SICK_FUND_SEQUENCE_TOKENS = [
  'annual',
  'insurance',
  'company',
  'unpaid',
] as const;

export type SickFundSequenceToken = (typeof SICK_FUND_SEQUENCE_TOKENS)[number];

export const SICK_DAY_BRANCH_CODES = [
  'annual',
  'insurance',
  'company_topup',
  'unpaid',
] as const;

export type SickDayBranchCode = (typeof SICK_DAY_BRANCH_CODES)[number];

export const DEFAULT_SICK_FUND_SEQUENCE: SickFundSequenceToken[] = [
  'insurance',
  'company',
  'unpaid',
];

export const DEFAULT_OVER_INSURANCE_ACTION = 'company_topup' as const;
