import { HttpStatus } from '@nestjs/common';
import { ApiException } from '../common/api.exception';
import { HRM_PAY_TAX_403, PAY_TAX_FORBIDDEN_BODY_KEYS } from './pay-tax.constants';

function collectForbiddenTaxKeys(body: Record<string, unknown> | null | undefined): string[] {
  if (!body || typeof body !== 'object') return [];
  const hits: string[] = [];
  for (const key of Object.keys(body)) {
    const lower = key.toLowerCase();
    if (lower.startsWith('manual_tax') || lower.startsWith('override_tax') || lower.startsWith('tncn_')) {
      hits.push(key);
      continue;
    }
    if (lower === 'tax_amount' || lower === 'tax_amount_vnd' || lower === 'net_amount' || lower === 'net_amount_vnd') {
      hits.push(key);
      continue;
    }
    if (PAY_TAX_FORBIDDEN_BODY_KEYS.includes(key as (typeof PAY_TAX_FORBIDDEN_BODY_KEYS)[number])) {
      hits.push(key);
    }
  }
  return hits;
}

/** AC-PAY-06-DENY-MANUAL — reject payroll mutate bodies that override TNCN / net. */
export function assertNoPayTaxOverrideInBody(body: Record<string, unknown> | null | undefined): void {
  const hits = collectForbiddenTaxKeys(body);
  if (hits.length === 0) return;
  throw new ApiException(
    HRM_PAY_TAX_403,
    'Không được nhập thuế TNCN hoặc thực lĩnh thủ công trên bảng lương — hệ thống tính khi xử lý kỳ',
    HttpStatus.FORBIDDEN,
    { forbiddenKeys: hits, payroll_e2e_ready: false },
  );
}
