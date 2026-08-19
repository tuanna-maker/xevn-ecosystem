import { HttpStatus } from '@nestjs/common';
import { ApiException } from '../common/api.exception';
import {
  HRM_PAY_TERM_400_USE_DEDICATED_SETTLE,
  HRM_PAY_TERM_403,
  PAY_TERM_FORBIDDEN_BODY_KEYS,
} from './pay-term.constants';

function collectForbiddenTermPayoutKeys(body: Record<string, unknown> | null | undefined): string[] {
  if (!body || typeof body !== 'object') return [];
  const hits: string[] = [];
  for (const key of Object.keys(body)) {
    const lower = key.toLowerCase();
    if (lower.startsWith('manual_payout_') || lower.startsWith('override_')) {
      hits.push(key);
      continue;
    }
    if (PAY_TERM_FORBIDDEN_BODY_KEYS.includes(key as (typeof PAY_TERM_FORBIDDEN_BODY_KEYS)[number])) {
      hits.push(key);
    }
  }
  return hits;
}

/** AC-PAY-TERM-DENY-MANUAL — cấm nhập tay severance / leave cashout trên settle hoặc process. */
export function assertNoPayTermPayoutOverrideInBody(body: Record<string, unknown> | null | undefined): void {
  const hits = collectForbiddenTermPayoutKeys(body);
  if (hits.length === 0) return;
  throw new ApiException(
    HRM_PAY_TERM_403,
    'Không được nhập thủ công số tiền tất toán nghỉ — chỉ công thức lương khi xử lý kỳ',
    HttpStatus.FORBIDDEN,
    { forbiddenKeys: hits, payroll_e2e_ready: false },
  );
}

/** AC-PAY-TERM-SOT — DENY public include_terminations as dual settle SoT on process. */
export function assertNoIncludeTerminationsSettleSoT(
  body: Record<string, unknown> | null | undefined,
  query?: Record<string, unknown> | null,
): void {
  const fromBody = body?.include_terminations ?? body?.includeTerminations;
  const fromQuery = query?.include_terminations ?? query?.includeTerminations;
  const raw = fromBody ?? fromQuery;
  if (raw === true || raw === 'true' || raw === 1 || raw === '1') {
    throw new ApiException(
      HRM_PAY_TERM_400_USE_DEDICATED_SETTLE,
      'Dùng POST /api/hrm/payroll/periods/:periodId/termination-settle để tất toán nghỉ — không dùng include_terminations trên process',
      HttpStatus.BAD_REQUEST,
      { payroll_e2e_ready: false },
    );
  }
}
