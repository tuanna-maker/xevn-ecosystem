import { describe, expect, it } from 'vitest';
import { PROFILE_QUICK_ACTIONS } from '../profileQuickActions';

describe('PROFILE_QUICK_ACTIONS', () => {
  it('exposes four deep-link tiles per F-3', () => {
    expect(PROFILE_QUICK_ACTIONS.map((a) => a.label)).toEqual([
      'Phiếu lương',
      'Nghỉ phép',
      'Chấm công',
      'Phê duyệt',
    ]);
    expect(PROFILE_QUICK_ACTIONS.map((a) => a.id)).toEqual(['payslip', 'leave', 'check_in', 'approvals']);
  });
});
