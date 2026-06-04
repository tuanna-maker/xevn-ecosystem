import { describe, expect, it } from 'vitest';
import { hasPositiveOperationsSummary } from './useOperationsSummary';

describe('useOperationsSummary helpers', () => {
  it('detects seeded fidelity counters (UC-HRM-20 AC-U18-20-01)', () => {
    expect(
      hasPositiveOperationsSummary({
        attendance_records: 12000,
        payroll_periods: 60,
        job_requisitions: 5,
        tasks: 25,
      }),
    ).toBe(true);
    expect(
      hasPositiveOperationsSummary({
        attendance_records: 0,
        payroll_periods: 0,
        job_requisitions: 0,
        tasks: 0,
      }),
    ).toBe(false);
  });
});
