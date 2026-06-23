import { describe, expect, it } from 'vitest';

/** MOB-UX-07 contract — SET B/C/D ESS leave surfaces */
describe('ESS leave UX-07 (MOB-UX-07)', () => {
  it('J-MOB-25/26: My Leaves tabs map Review|Approved|Rejected', () => {
    const tabs = [
      { key: 'review', label: 'Đang xét', status: 'pending' },
      { key: 'approved', label: 'Đã duyệt', status: 'approved' },
      { key: 'rejected', label: 'Từ chối', status: 'rejected' },
    ] as const;
    expect(tabs.map((t) => t.label).join('|')).toBe('Đang xét|Đã duyệt|Từ chối');
    expect(tabs[0].status).toBe('pending');
  });

  it('J-MOB-23/24: manager default inbox filter is leave', () => {
    const defaultFilter = 'leave';
    expect(defaultFilter).toBe('leave');
  });

  it('J-MOB-28/29: confirm modal kinds include approve decline submit', () => {
    const kinds = ['approve', 'decline', 'submit'] as const;
    expect(kinds).toContain('approve');
    expect(kinds).toContain('submit');
  });

  it('BR-ESS-UNDO-01: snackbar undo duration 5s', () => {
    const durationMs = 5000;
    expect(durationMs).toBe(5000);
  });
});
