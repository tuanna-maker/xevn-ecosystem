import { describe, expect, it } from 'vitest';
import {
  formatAttSheetAggToast,
  isAttSheetAggEmptyEnrollment,
  normalizeAttSheetAggWarnings,
} from './attSheetAggUi';

describe('attSheetAggUi — PO-HRM-PAYROLL-FORMULA-RUN-GAP-FE-ATT-ENROLL-01', () => {
  it('normalizes warnings and detects AGG_EMPTY_ENROLLMENT', () => {
    expect(normalizeAttSheetAggWarnings(['AGG_EMPTY_ENROLLMENT', '  '])).toEqual([
      'AGG_EMPTY_ENROLLMENT',
    ]);
    expect(
      isAttSheetAggEmptyEnrollment({
        line_count: 0,
        warnings: ['AGG_EMPTY_ENROLLMENT', 'AGG_LINE_COUNT_ZERO'],
      }),
    ).toBe(true);
    expect(isAttSheetAggEmptyEnrollment({ line_count: 2, warnings: [] })).toBe(false);
    expect(isAttSheetAggEmptyEnrollment({ line_count: 0, warnings: [] })).toBe(true);
  });

  it('formats honest empty vs density toast copy', () => {
    const empty = formatAttSheetAggToast({
      line_count: 0,
      warnings: ['AGG_EMPTY_ENROLLMENT'],
    });
    expect(empty.titleKey).toBe('notice');
    expect(empty.emptyEnrollment).toBe(true);
    expect(empty.description).toMatch(/Clock-In|tăng ca/i);

    const dense = formatAttSheetAggToast({ line_count: 3, warnings: [] });
    expect(dense.titleKey).toBe('success');
    expect(dense.emptyEnrollment).toBe(false);
    expect(dense.description).toMatch(/3 dòng/);
  });
});
