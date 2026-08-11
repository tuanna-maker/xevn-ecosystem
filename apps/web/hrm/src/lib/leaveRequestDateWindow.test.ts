import { describe, expect, it } from 'vitest';
import { pickNonOverlappingLeaveWindow } from '@/lib/leaveRequestDateWindow';

describe('leaveRequestDateWindow', () => {
  it('pickNonOverlappingLeaveWindow — skips pending overlap window', () => {
    const { startIso, endIso } = pickNonOverlappingLeaveWindow(
      [{ start_date: '2027-05-05', end_date: '2027-05-07', status: 'approved' }],
      'HDSDST8G8',
    );
    expect(startIso).not.toBe('2027-05-05');
    expect(startIso <= endIso).toBe(true);
  });

  it('pickNonOverlappingLeaveWindow — deterministic for same salt', () => {
    const a = pickNonOverlappingLeaveWindow([], 'QA-STAMP-1');
    const b = pickNonOverlappingLeaveWindow([], 'QA-STAMP-1');
    expect(a).toEqual(b);
  });

  it('pickNonOverlappingLeaveWindow — emits vi-VN display strings', () => {
    const { startVi, endVi, startIso } = pickNonOverlappingLeaveWindow([], 42);
    expect(startVi).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
    expect(endVi).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
    expect(startIso).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
