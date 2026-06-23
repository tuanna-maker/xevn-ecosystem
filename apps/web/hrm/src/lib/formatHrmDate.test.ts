import { describe, expect, it } from 'vitest';
import {
  filterUpcomingExpiringContracts,
  formatHrmDateVi,
  parseHrmDateOnly,
} from './formatHrmDate';

describe('formatHrmDate', () => {
  it('parseHrmDateOnly handles YYYY-MM-DD without drift', () => {
    const d = parseHrmDateOnly('2026-06-15');
    expect(d?.getFullYear()).toBe(2026);
    expect(d?.getMonth()).toBe(5);
    expect(d?.getDate()).toBe(15);
  });

  it('formatHrmDateVi returns dash for invalid values', () => {
    expect(formatHrmDateVi(null)).toBe('-');
    expect(formatHrmDateVi('0')).toBe('-');
  });

  it('filterUpcomingExpiringContracts excludes stale past dates', () => {
    const today = new Date(2026, 5, 6);
    const rows = [
      { id: 'old', end_date: '2022-03-01', status: 'active' },
      { id: 'soon', end_date: '2026-06-20', status: 'active' },
      { id: 'expired', end_date: '2026-06-10', status: 'expired' },
    ];
    const filtered = filterUpcomingExpiringContracts(rows, 30, today);
    expect(filtered.map((r) => r.id)).toEqual(['soon']);
  });
});
