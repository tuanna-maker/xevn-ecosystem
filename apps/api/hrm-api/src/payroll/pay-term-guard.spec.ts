import { HttpStatus } from '@nestjs/common';
import { ApiException } from '../common/api.exception';
import {
  assertNoIncludeTerminationsSettleSoT,
  assertNoPayTermPayoutOverrideInBody,
} from './pay-term-guard';
import {
  HRM_PAY_TERM_400_USE_DEDICATED_SETTLE,
  HRM_PAY_TERM_403,
} from './pay-term.constants';

describe('pay-term-guard', () => {
  it('assertNoPayTermPayoutOverrideInBody — HRM-PAY-TERM-403', () => {
    expect(() =>
      assertNoPayTermPayoutOverrideInBody({ severance_vnd: 1_000_000 }),
    ).toThrow(ApiException);
    try {
      assertNoPayTermPayoutOverrideInBody({ leave_cashout_vnd: 500_000 });
    } catch (e) {
      expect(e).toMatchObject<ApiException>({
        code: HRM_PAY_TERM_403,
        status: HttpStatus.FORBIDDEN,
      });
    }
  });

  it('assertNoIncludeTerminationsSettleSoT — dedicated settle route only', () => {
    expect(() =>
      assertNoIncludeTerminationsSettleSoT(null, {
        include_terminations: 'true',
      }),
    ).toThrow(ApiException);
    try {
      assertNoIncludeTerminationsSettleSoT(
        { include_terminations: true },
        null,
      );
    } catch (e) {
      expect(e).toMatchObject<ApiException>({
        code: HRM_PAY_TERM_400_USE_DEDICATED_SETTLE,
        status: HttpStatus.BAD_REQUEST,
      });
    }
  });
});
