import { HttpStatus } from '@nestjs/common';
import { ApiException } from '../common/api.exception';
import {
  HRM_PAY_SI_403,
  PAY_SI_FORBIDDEN_BODY_KEYS,
} from './pay-si-ceiling.constants';

function collectForbiddenSiKeys(
  body: Record<string, unknown> | null | undefined,
): string[] {
  if (!body || typeof body !== 'object') return [];
  const hits: string[] = [];
  for (const key of Object.keys(body)) {
    const lower = key.toLowerCase();
    if (
      lower.startsWith('si_') ||
      lower === 'si' ||
      lower.startsWith('ceiling_') ||
      lower.startsWith('ceiling')
    ) {
      hits.push(key);
      continue;
    }
    if (
      lower.includes('insurance_base') ||
      lower.includes('contribution_base') ||
      lower.includes('manual_si')
    ) {
      hits.push(key);
      continue;
    }
    if (
      PAY_SI_FORBIDDEN_BODY_KEYS.includes(
        key as (typeof PAY_SI_FORBIDDEN_BODY_KEYS)[number],
      )
    ) {
      hits.push(key);
    }
  }
  return hits;
}

/** AC-PAY-05-DENY-MANUAL — reject payroll mutate bodies that override SI / trần BH. */
export function assertNoPaySiOverrideInBody(
  body: Record<string, unknown> | null | undefined,
): void {
  const hits = collectForbiddenSiKeys(body);
  if (hits.length === 0) return;
  throw new ApiException(
    HRM_PAY_SI_403,
    'Không được nhập bảo hiểm hoặc trần đóng thủ công trên bảng lương — hệ thống tính khi xử lý kỳ',
    HttpStatus.FORBIDDEN,
    { forbiddenKeys: hits, payroll_e2e_ready: false },
  );
}
