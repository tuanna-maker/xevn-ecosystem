import { HttpStatus } from '@nestjs/common';
import { ApiException } from '../common/api.exception';
import {
  HRM_PAY_PAYSLIP_403,
  PAY_PAYSLIP_FORBIDDEN_BODY_KEYS,
} from './pay-payslip.constants';

function collectForbiddenPayslipAmountKeys(body: Record<string, unknown> | null | undefined): string[] {
  if (!body || typeof body !== 'object') return [];
  const hits: string[] = [];
  for (const key of Object.keys(body)) {
    const lower = key.toLowerCase();
    if (lower.startsWith('manual_') || lower.startsWith('override_')) {
      hits.push(key);
      continue;
    }
    if (PAY_PAYSLIP_FORBIDDEN_BODY_KEYS.includes(key as (typeof PAY_PAYSLIP_FORBIDDEN_BODY_KEYS)[number])) {
      hits.push(key);
    }
  }
  return hits;
}

/** AC-PAY-SLIP-DENY-MANUAL — cấm PATCH số tiền / thành phần trên phiếu lương. */
export function assertNoPayPayslipAmountOverrideInBody(body: Record<string, unknown> | null | undefined): void {
  const hits = collectForbiddenPayslipAmountKeys(body);
  if (hits.length === 0) return;
  throw new ApiException(
    HRM_PAY_PAYSLIP_403,
    'Không được sửa số lương hoặc thành phần trên phiếu — chỉ xử lý kỳ hoặc PATCH trạng thái thanh toán',
    HttpStatus.FORBIDDEN,
    { forbiddenKeys: hits, payroll_e2e_ready: false },
  );
}
