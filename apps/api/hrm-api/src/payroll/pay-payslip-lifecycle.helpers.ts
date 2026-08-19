import {
  PAY_PAYSLIP_PAYMENT_STATUS_LABEL_VI,
  type PayPayslipPaymentStatus,
} from './pay-payslip.constants';

/** LIVE `processed` ≡ API `calculated` (DATA-01 alias). */
export function mapPayslipStatusForApi(dbStatus: string): string {
  if (dbStatus === 'processed') return 'calculated';
  return dbStatus;
}

export function isPayslipCalculatedReady(dbStatus: string): boolean {
  return dbStatus === 'calculated' || dbStatus === 'processed';
}

export function paymentStatusLabelVi(
  paymentStatus: string | null | undefined,
): string | null {
  if (!paymentStatus) return null;
  const key = paymentStatus as PayPayslipPaymentStatus;
  return PAY_PAYSLIP_PAYMENT_STATUS_LABEL_VI[key] ?? paymentStatus;
}

export function isPeriodPayrollLocked(period: {
  status: string;
  payroll_locked?: boolean | null;
}): boolean {
  if (period.payroll_locked === true) return true;
  return period.status === 'closed' || period.status === 'locked';
}
