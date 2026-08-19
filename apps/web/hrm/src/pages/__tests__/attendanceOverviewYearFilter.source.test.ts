import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * Source guard — fake day/week/month overview Select must not return.
 * PO-MFD-M2-ATT-OVERVIEW-01 · fail-closed honesty.
 */
describe('PO-MFD-M2-ATT-OVERVIEW-01 · Attendance overview year filter source', () => {
  const src = readFileSync(resolve(__dirname, '../Attendance.tsx'), 'utf8');

  it('wires overviewApiYear into useAttendanceOverview', () => {
    expect(src).toMatch(/useAttendanceOverview\(overviewApiYear/);
    expect(src).toMatch(/data-testid="overview-year-filter"/);
    expect(src).toMatch(/data-testid="overview-year-filter-honesty"/);
  });

  it('does not expose unwired day/week/month overview SelectItems', () => {
    // Sheet form may still use this-month preset — assert overview SelectContent slice only.
    const overviewSelect = src.slice(
      src.indexOf('data-testid="overview-year-filter"'),
      src.indexOf('data-testid="overview-loaded-year"'),
    );
    expect(overviewSelect).not.toMatch(/value="today"/);
    expect(overviewSelect).not.toMatch(/value="this-week"/);
    expect(overviewSelect).not.toMatch(/value="this-month"/);
    expect(overviewSelect).not.toMatch(/value="custom"/);
    expect(overviewSelect).toMatch(/value="this-year"/);
    expect(overviewSelect).toMatch(/value="last-year"/);
  });
});
