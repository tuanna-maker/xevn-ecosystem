/**
 * @CODE-MEMORY
 * Screen:     /payroll · Chi trả lương → Chi trả từ kỳ đã xử lý
 * UC:         AMIS Step7 Chi trả · FN-PAY-WIRE · R-PAY-WIRE-FE
 * BR:         WirePaymentBatchDto — company_id required in JSON body; period must be processed
 * SRS:        docs/qa/evidence/po-hrm-amis-parity-pay-payment-wire-qc-01.md · CONDITION R-PAY-WIRE-FE
 * TechSpec:   Nest POST /payroll/periods/:periodId/wire-payment-batch → HRM-PAY-WIRE-201
 * Purpose:    Whitelist body POST tạo lô chi trả từ phiếu lương processed — không invent công thức.
 * WorkItem:   PO-HRM-AMIS-PARITY-PAY-PAYMENT-WIRE-FE-01
 * Coded:      2026-08-07
 * Callers:    hrmApi.wirePaymentBatchFromPeriod · usePaymentBatches.wireFromPeriod
 * Callees:    POST /api/hrm/payroll/periods/:id/wire-payment-batch
 * must_keep:  U65 no seed · payroll_e2e_ready=false · company_id trong body (DTO) · process→paid→close BE
 * SOLID:      Lib DTO thuần — tách khỏi hrmApi để vitest không kéo requestHrm
 * LastVerified: wirePaymentBatchRequest.test.ts
 */

export type WirePaymentBatchBody = {
  company_id: string;
  name?: string;
  payment_method?: string;
  bank_name?: string;
  require_ess_confirm?: boolean;
};

export type WirePaymentBatchInput = {
  company_id: string;
  name?: string | null;
  payment_method?: string | null;
  bank_name?: string | null;
  require_ess_confirm?: boolean;
};

/** Build WirePaymentBatchDto body — company_id required (unlike ProcessPaymentDto). */
export function buildWirePaymentBatchBody(input: WirePaymentBatchInput): WirePaymentBatchBody {
  const company_id = String(input.company_id ?? '').trim();
  const body: WirePaymentBatchBody = { company_id };
  const name = input.name?.trim();
  if (name) body.name = name;
  const payment_method = input.payment_method?.trim();
  if (payment_method) body.payment_method = payment_method;
  const bank_name = input.bank_name?.trim();
  if (bank_name) body.bank_name = bank_name;
  if (input.require_ess_confirm === true) body.require_ess_confirm = true;
  return body;
}
