import { describe, expect, it } from 'vitest';
import {
  findLeaveBalanceInPanel,
  formatLeaveBalanceSummary,
  MVP_LEAVE_BALANCE_TYPE_CODES,
  parseLeaveBalancePanelPayload,
  parseLeaveBalancePayload,
  projectLeaveBalanceAfterRequest,
  resolveLeaveBalanceDisplayDays,
  resolveLeaveBalanceHeldDays,
  resolveLeaveBalanceTypeCodes,
} from './leaveBalance';

describe('PO-MFD-M2-ATT-WIRE-BALANCE-01 — leaveBalance parse', () => {
  it('parseLeaveBalancePayload maps API row', () => {
    const parsed = parseLeaveBalancePayload({
      company_id: 'holding',
      employee_id: 'e1-uuid',
      leave_type: 'annual',
      balance_year: 2026,
      entitled_days: 12,
      used_days: 3,
      pending_days: 1,
      remaining_days: 8,
      available_days: 8,
      as_of: '2026-08-04T00:00:00.000Z',
      source: 'employee_leave_balances',
    });
    expect(parsed?.remaining_days).toBe(8);
    expect(resolveLeaveBalanceDisplayDays(parsed!)).toBe(8);
    expect(formatLeaveBalanceSummary(parsed!)).toContain('8 ngày');
  });

  it('parseLeaveBalancePayload derives remaining when omitted', () => {
    const parsed = parseLeaveBalancePayload({
      employee_id: 'e2',
      entitled_days: 10,
      used_days: 2,
      pending_days: 1,
    });
    expect(parsed?.remaining_days).toBe(7);
  });

  it('parseLeaveBalancePayload returns null without employee_id', () => {
    expect(parseLeaveBalancePayload({ entitled_days: 1 })).toBeNull();
  });
});

describe('PO-HRM-ATT-03d-05b-FE-01 — ATT-05b type codes + project', () => {
  it('resolveLeaveBalanceTypeCodes prefers catalog; falls back to MVP five', () => {
    expect(resolveLeaveBalanceTypeCodes([])).toEqual([...MVP_LEAVE_BALANCE_TYPE_CODES]);
    expect(resolveLeaveBalanceTypeCodes(null)).toEqual([...MVP_LEAVE_BALANCE_TYPE_CODES]);
    expect(resolveLeaveBalanceTypeCodes(['annual', 'sick', 'annual'])).toEqual([
      'annual',
      'sick',
    ]);
  });

  it('projectLeaveBalanceAfterRequest subtracts requested days from available', () => {
    const proj = projectLeaveBalanceAfterRequest(
      { available_days: 8, remaining_days: 8, pending_days: 1 },
      3,
    );
    expect(proj.available).toBe(8);
    expect(proj.pendingHold).toBe(1);
    expect(proj.projected).toBe(5);
  });

  it('parseLeaveBalancePanelPayload maps 5 MVP items incl. zeros', () => {
    const panel = parseLeaveBalancePanelPayload({
      company_id: 'main',
      employee_id: 'e-panel',
      balance_year: 2026,
      year: 2026,
      as_of: '2026-08-05T00:00:00.000Z',
      items: MVP_LEAVE_BALANCE_TYPE_CODES.map((leave_type) => ({
        company_id: 'main',
        employee_id: 'e-panel',
        leave_type,
        leave_type_label: leave_type,
        balance_year: 2026,
        entitled_days: 0,
        used_days: 0,
        pending_days: 0,
        remaining_days: 0,
        available_days: 0,
        as_of: '2026-08-05T00:00:00.000Z',
        source: 'default',
      })),
    });
    expect(panel?.items).toHaveLength(5);
    expect(panel?.items.every((i) => i.available_days === 0)).toBe(true);
    expect(findLeaveBalanceInPanel(panel, 'annual')?.leave_type).toBe('annual');
    expect(findLeaveBalanceInPanel(panel, 'SICK')).toBeNull();
  });

  it('parseLeaveBalancePanelPayload returns null without employee_id', () => {
    expect(parseLeaveBalancePanelPayload({ items: [] })).toBeNull();
  });

  it('PO-HRM-MVP-GD1-ATT-09: held = pending_days (DENY invent att_leave_hold)', () => {
    const parsed = parseLeaveBalancePayload({
      employee_id: 'e9',
      entitled_days: 12,
      used_days: 3,
      pending_days: 2,
      available_days: 7,
    });
    expect(resolveLeaveBalanceHeldDays(parsed)).toBe(2);
    expect(resolveLeaveBalanceHeldDays(null)).toBe(0);
  });
});
