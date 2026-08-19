import { describe, expect, it } from 'vitest';
import { ApiClientError } from '@/lib/apiError';
import {
  ATT_04B_BALANCE_RESOLUTION_API_LIVE,
  deriveAtt04bPanelBucketLabelVi,
  HRM_LEAVE_VAL_BALANCE_CODE,
  isAtt04bAdvanceCapCrudLive,
  isAtt04bOverBalanceBranchLive,
  parseAtt04bBalanceReject,
  parseAtt04bAdvanceCapFromPolicyRow,
  resolveEffectiveAllowsAdvance,
} from '@/lib/attLeave04bRing';

describe('attLeave04bRing', () => {
  it('panel bucket labels — advance and unpaid', () => {
    expect(deriveAtt04bPanelBucketLabelVi('advance')).toBe('Ứng phép');
    expect(deriveAtt04bPanelBucketLabelVi('unpaid')).toBe('Không lương');
    expect(deriveAtt04bPanelBucketLabelVi('annual', 'Phép năm (wire)')).toBe('Phép năm (wire)');
  });

  it('parseAtt04bBalanceReject — HRM-LEAVE-VAL-BALANCE + details', () => {
    const err = new ApiClientError({
      message: 'Insufficient',
      code: HRM_LEAVE_VAL_BALANCE_CODE,
      status: 400,
      details: { available_days: 2, requested_days: 5 },
    });
    const parsed = parseAtt04bBalanceReject(err);
    expect(parsed?.availableDays).toBe(2);
    expect(parsed?.requestedDays).toBe(5);
    expect(parsed?.message).toContain('2');
  });

  it('resolveEffectiveAllowsAdvance from effective catalog rows', () => {
    const items = [
      { leaveTypeKey: 'annual', allowsAdvance: false },
      { leaveTypeKey: 'hr_adv', allowsAdvance: true },
    ];
    expect(resolveEffectiveAllowsAdvance(items, 'annual')).toBe(false);
    expect(resolveEffectiveAllowsAdvance(items, 'hr_adv')).toBe(true);
  });

  it('cap CRUD LIVE detect — only when BE returns cap fields', () => {
    expect(isAtt04bAdvanceCapCrudLive([])).toBe(false);
    expect(
      isAtt04bAdvanceCapCrudLive([{ id: '1', advanceMaxDays: 3 } as Record<string, unknown>]),
    ).toBe(true);
    expect(parseAtt04bAdvanceCapFromPolicyRow({ advance_cap_percent: 50 })).toEqual({
      advanceMaxDays: null,
      advanceCapPercent: 50,
    });
  });

  it('over-balance branch flag — default HOLD until BE-01 flips constant', () => {
    expect(ATT_04B_BALANCE_RESOLUTION_API_LIVE).toBe(false);
    expect(isAtt04bOverBalanceBranchLive()).toBe(false);
  });
});
