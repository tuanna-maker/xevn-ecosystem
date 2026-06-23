import { describe, expect, it } from 'vitest';
import { leaveTypeLabels, resolveLeaveTypeColor, resolveLeaveTypeLabel } from '../leaveTypes';

describe('leaveTypes', () => {
  it('maps semantic leave codes to Vietnamese labels', () => {
    expect(resolveLeaveTypeLabel('annual')).toBe('Nghỉ phép năm');
    expect(resolveLeaveTypeLabel('sick')).toBe('Nghỉ ốm');
    expect(resolveLeaveTypeLabel('LVT_01')).toBe('Nghỉ phép năm');
    expect(resolveLeaveTypeLabel('LVT_02')).toBe('Nghỉ ốm');
  });

  it('falls back to raw code when unknown', () => {
    expect(resolveLeaveTypeLabel('CUSTOM_X')).toBe('CUSTOM_X');
  });

  it('resolves badge colors for known types', () => {
    expect(resolveLeaveTypeColor('annual')).toBe('#3B82F6');
    expect(resolveLeaveTypeColor('LVT_02')).toBe('#EF4444');
  });

  it('covers web LeaveTab label keys', () => {
    for (const key of ['annual', 'sick', 'unpaid', 'maternity', 'paternity', 'marriage', 'bereavement', 'other']) {
      expect(leaveTypeLabels[key]).toBeTruthy();
    }
  });
});
