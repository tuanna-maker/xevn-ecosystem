import { describe, expect, it } from 'vitest';
import {
  OVERVIEW_PERIOD_SPEC_GAP,
  OVERVIEW_UNSUPPORTED_TIME_FILTERS,
  resolveOverviewApiYear,
} from '../attendanceOverviewTimeFilter';

describe('PO-MFD-M2-ATT-OVERVIEW-01 · attendanceOverviewTimeFilter', () => {
  it('maps this-year / last-year to Nest year query', () => {
    const now = new Date('2026-08-04T10:00:00.000Z');
    expect(resolveOverviewApiYear('this-year', now)).toBe(2026);
    expect(resolveOverviewApiYear('last-year', now)).toBe(2025);
  });

  it('documents day/week/month as unsupported until SPEC_GAP closed', () => {
    expect(OVERVIEW_UNSUPPORTED_TIME_FILTERS).toContain('this-month');
    expect(OVERVIEW_UNSUPPORTED_TIME_FILTERS).toContain('this-week');
    expect(OVERVIEW_UNSUPPORTED_TIME_FILTERS).toContain('today');
    expect(OVERVIEW_PERIOD_SPEC_GAP).toMatch(/year/i);
    expect(OVERVIEW_PERIOD_SPEC_GAP).toMatch(/SPEC_GAP/);
  });
});
