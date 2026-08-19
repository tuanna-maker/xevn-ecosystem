/** F-PAY-PAYSLIP-01 lifecycle (FR-UC-BP-PAY-08). */
export const HRM_PAY_PUBLISH_409 = 'HRM-PAY-PUBLISH-409';
export const HRM_PAY_LOCK_409 = 'HRM-PAY-LOCK-409';
export const HRM_PAY_PAYSLIP_403 = 'HRM-PAY-PAYSLIP-403';

export const PAY_PAYSLIP_PAYMENT_STATUSES = [
  'unpaid',
  'partial',
  'paid',
  'budget_hold',
] as const;

export type PayPayslipPaymentStatus = (typeof PAY_PAYSLIP_PAYMENT_STATUSES)[number];

/** Body keys that attempt calculator override on payslip mutate (AC-PAY-SLIP-DENY-MANUAL). */
export const PAY_PAYSLIP_FORBIDDEN_BODY_KEYS = [
  'gross_amount',
  'grossAmount',
  'deduction_amount',
  'deductionAmount',
  'net_amount',
  'netAmount',
  'tax_amount',
  'taxAmount',
  'gtgc_amount',
  'gtgcAmount',
  'si_employee_amount',
  'siEmployeeAmount',
  'si_employer_amount',
  'siEmployerAmount',
  'components',
  'lines',
  'segments',
] as const;

export const PAY_PAYSLIP_PAYMENT_STATUS_LABEL_VI: Record<PayPayslipPaymentStatus, string> = {
  unpaid: 'Chưa thanh toán',
  partial: 'Thanh toán một phần',
  paid: 'Đã thanh toán',
  budget_hold: 'Tạm giữ ngân sách',
};
