/** F-PAY-SI-CEILING-01 — trần BH (FR-UC-BP-PAY-05 · BR-BP-SPL-02). */
export const HRM_PAY_SI_403 = 'HRM-PAY-SI-403';

/** Body keys that attempt manual SI / ceiling override on payroll mutate (AC-PAY-05-DENY-MANUAL). */
export const PAY_SI_FORBIDDEN_BODY_KEYS = [
  'si_employee_amount',
  'si_employer_amount',
  'siEmployeeAmount',
  'siEmployerAmount',
  'siEmployeeAmountVnd',
  'siEmployerAmountVnd',
  'ceiling_amount',
  'ceilingAmount',
  'ceilingAmountVnd',
  'ceiling_amount_vnd',
  'insurance_base_vnd',
  'insurance_base',
  'consolidated_insurance_base_vnd',
  'consolidatedInsuranceBaseVnd',
  'contribution_base_vnd',
  'contribution_base',
  'manual_si',
  'manualSi',
  'override_si',
  'overrideSi',
] as const;
