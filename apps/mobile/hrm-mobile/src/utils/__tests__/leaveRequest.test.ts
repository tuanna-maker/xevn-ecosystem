import { describe, expect, it } from 'vitest';
import {
  computeLeaveTotalDays,
  leaveStatusSectionTitles,
  leaveTypeOptions,
  resolveLeaveStatusGroup,
  toIsoDateOnly,
} from '../leaveRequest';

describe('leaveRequest utils', () => {
  it('computes inclusive calendar days', () => {
    expect(computeLeaveTotalDays('2026-08-08', '2026-08-08')).toBe(1);
    expect(computeLeaveTotalDays('2026-08-08', '2026-08-11')).toBe(4);
    expect(computeLeaveTotalDays('2026-08-11', '2026-08-08')).toBe(0);
  });

  it('toIsoDateOnly is stable', () => {
    expect(toIsoDateOnly(new Date(2026, 7, 8))).toBe('2026-08-08');
  });

  it('maps status groups for iOS sections', () => {
    expect(resolveLeaveStatusGroup('pending')).toBe('pending');
    expect(resolveLeaveStatusGroup('APPROVED')).toBe('approved');
    expect(leaveStatusSectionTitles.pending).toBe('Chờ duyệt');
  });

  it('exposes web-parity leave type keys', () => {
    expect(leaveTypeOptions).toContain('annual');
    expect(leaveTypeOptions).toContain('sick');
    expect(leaveTypeOptions.length).toBeGreaterThanOrEqual(8);
  });
});
