import { describe, expect, it } from 'vitest';
import { resolveLeaveBalanceQueryCompanyId } from '../companyWireScope';
import {
  composeLeaveBalanceParams,
  formatLeaveBalanceDays,
  resolveLeaveBalanceDisplayDays,
} from '../hrmLeaveBalance';

const HOLDING_UUID = '6efaa5d6-a4a8-4bfd-805a-3c4f003e4013';
const UAT_EMPLOYEE_ID = '3796d949-4513-45c0-88fa-33030a062b17';

describe('hrmLeaveBalance', () => {
  it('formats whole and fractional day balances', () => {
    expect(formatLeaveBalanceDays(12)).toBe('12');
    expect(formatLeaveBalanceDays(3.5)).toBe('3.5');
    expect(formatLeaveBalanceDays(Number.NaN)).toBe('0');
  });

  it('resolveLeaveBalanceDisplayDays prefers remaining when available is zero', () => {
    expect(
      resolveLeaveBalanceDisplayDays({ available_days: 0, remaining_days: 8 }),
    ).toBe(8);
  });

  it('composeLeaveBalanceParams never emits wire UUID', () => {
    const scoped = composeLeaveBalanceParams(
      {
        baseUrl: 'https://example.test',
        tenantId: 'xevn',
        companyId: '6efaa5d6-a4a8-4bfd-805a-3c4f003e4013',
        companyUuid: '6efaa5d6-a4a8-4bfd-805a-3c4f003e4013',
        memberships: [
          {
            tenant_id: 'xevn',
            company_id: 'holding',
            company_uuid: '6efaa5d6-a4a8-4bfd-805a-3c4f003e4013',
            employee_id: UAT_EMPLOYEE_ID,
          },
        ],
      },
      { employeeId: UAT_EMPLOYEE_ID },
    );
    expect(scoped?.companyId).toBe('holding');
  });

  it('D-W8-MOB-BAL-UI-01: leave-balance query uses holding slug not legal UUID', () => {
    expect(
      resolveLeaveBalanceQueryCompanyId({
        companyUuid: HOLDING_UUID,
        companyId: 'holding',
      }),
    ).toBe('holding');
    expect(
      resolveLeaveBalanceQueryCompanyId({
        companyUuid: HOLDING_UUID,
        companyId: HOLDING_UUID,
        employeeId: UAT_EMPLOYEE_ID,
        tenantId: 'xevn',
        memberships: [
          {
            tenant_id: 'xevn',
            company_id: 'holding',
            company_uuid: HOLDING_UUID,
            employee_id: UAT_EMPLOYEE_ID,
          },
        ],
      }),
    ).toBe('holding');
    const q = new URLSearchParams({
      company_id: 'holding',
      employee_id: UAT_EMPLOYEE_ID,
      leave_type: 'annual',
    });
    expect(q.toString()).toContain('leave_type=annual');
    expect(`/attendance/leave-balance?${q.toString()}`).toMatch(/\/attendance\/leave-balance/);
  });

  it('P1-LEAVE-BALANCE-DEVICE-01: composeLeaveBalanceParams never wires legal UUID query', () => {
    const scoped = composeLeaveBalanceParams(
      {
        baseUrl: 'https://example.test',
        tenantId: 'xevn',
        companyId: HOLDING_UUID,
        companyUuid: HOLDING_UUID,
        employeeId: UAT_EMPLOYEE_ID,
        memberships: [],
      },
      { employeeId: UAT_EMPLOYEE_ID, leaveType: 'annual' },
    );
    expect(scoped?.companyId).toBe('holding');
    expect(scoped?.employeeId).toBe(UAT_EMPLOYEE_ID);
  });

  it('resolveLeaveBalanceDisplayDays uses available when positive', () => {
    expect(resolveLeaveBalanceDisplayDays({ available_days: 8, remaining_days: 3 })).toBe(8);
  });
});
