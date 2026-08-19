import { HttpStatus } from '@nestjs/common';
import { ApiException } from '../common/api.exception';
import { HRM_PAY_GTCG_403, PAY_GTCG_FORBIDDEN_BODY_KEYS } from './pay-gtgc.constants';

function collectForbiddenKeys(body: Record<string, unknown> | null | undefined): string[] {
  if (!body || typeof body !== 'object') return [];
  const hits: string[] = [];
  for (const key of Object.keys(body)) {
    const lower = key.toLowerCase();
    if (lower.startsWith('gtgc_') || lower.startsWith('gtgc')) {
      hits.push(key);
      continue;
    }
    if (PAY_GTCG_FORBIDDEN_BODY_KEYS.includes(key as typeof PAY_GTCG_FORBIDDEN_BODY_KEYS[number])) {
      hits.push(key);
    }
  }
  return hits;
}

/** AC-PAY-03-DENY-MANUAL — reject payroll mutate bodies that override GTCG. */
export function assertNoPayGtgcOverrideInBody(
  body: Record<string, unknown> | null | undefined,
): void {
  const hits = collectForbiddenKeys(body);
  if (hits.length === 0) return;
  throw new ApiException(
    HRM_PAY_GTCG_403,
    'Không được nhập giảm trừ gia cảnh thủ công trên bảng lương — cập nhật người phụ thuộc trên hồ sơ',
    HttpStatus.FORBIDDEN,
    { forbiddenKeys: hits, payroll_e2e_ready: false },
  );
}
