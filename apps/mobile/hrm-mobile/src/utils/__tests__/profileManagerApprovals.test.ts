import { describe, expect, it } from 'vitest';

import {
  formatProfileApprovalsEntryLabel,
  PROFILE_APPROVALS_ENTRY_TEST_ID,
  resolveManagerPendingTotal,
} from '../profileManagerApprovals';

describe('profileManagerApprovals — J-MOB-05 nav entry', () => {
  it('exposes stable profile approvals entry testID', () => {
    expect(PROFILE_APPROVALS_ENTRY_TEST_ID).toBe('profile-approvals-entry');
  });

  it('formatProfileApprovalsEntryLabel matches home manager card copy', () => {
    expect(formatProfileApprovalsEntryLabel(2)).toBe('Cần duyệt (2)');
    expect(formatProfileApprovalsEntryLabel(1)).toBe('Cần duyệt (1)');
  });

  it('resolveManagerPendingTotal sums att + leave rows', () => {
    expect(resolveManagerPendingTotal({ pendingAtt: 1, pendingLeave: 1, total: 2 })).toBe(2);
    expect(resolveManagerPendingTotal({ pendingAtt: 0, pendingLeave: 0, total: 0 })).toBe(0);
  });
});
