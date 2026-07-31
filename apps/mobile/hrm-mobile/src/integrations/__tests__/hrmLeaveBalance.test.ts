import { describe, expect, it } from 'vitest';
import { resolveLeaveBalanceQueryCompanyId } from '../companyWireScope';
import {
  composeLeaveBalanceParams,
  formatLeaveBalanceChipText,
  formatLeaveBalanceDays,
  isLeaveBalanceNotConfiguredError,
  leaveBalanceWarnBannerText,
  resolveLeaveBalanceDisplayDays,
  resolveLeaveBalanceWarnLevel,
} from '../hrmLeaveBalance';

const HOLDING_UUID = '10000000-0000-4000-8000-000000000001';
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
        companyId: '10000000-0000-4000-8000-000000000001',
        companyUuid: '10000000-0000-4000-8000-000000000001',
        memberships: [
          {
            tenant_id: 'xevn',
            company_id: 'holding',
            company_uuid: '10000000-0000-4000-8000-000000000001',
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

  it('PCOMP-W7-MOB-LEAVE-BAL-02: Plane B ≡ directory (main rollup + membership recover)', () => {
    expect(
      resolveLeaveBalanceQueryCompanyId({
        companyUuid: '20000000-0000-4000-8000-000000000099',
        companyId: 'main',
      }),
    ).toBe('main');
    const trsportUuid = '32a3cdcb-c534-4e47-80f9-d2f156e65094';
    expect(
      resolveLeaveBalanceQueryCompanyId({
        companyUuid: trsportUuid,
        companyId: trsportUuid,
        employeeId: '293b5900-8f99-4a97-878b-26270fb01827',
        tenantId: 'xevn',
        memberships: [
          {
            tenant_id: 'xevn',
            company_id: 'trsport',
            company_uuid: trsportUuid,
            employee_id: '293b5900-8f99-4a97-878b-26270fb01827',
          },
        ],
      }),
    ).toBe('trsport');
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

  it('AC-LEAVE-BAL-01: formatLeaveBalanceChipText matches SRS copy', () => {
    expect(
      formatLeaveBalanceChipText({
        remaining_days: 8,
        available_days: 8,
        entitled_days: 12,
        year: 2026,
        balance_year: 2026,
      }),
    ).toBe('Còn lại: 8 / 12 ngày phép năm 2026');
  });

  it('B1: isLeaveBalanceNotConfiguredError detects 404 codes', () => {
    expect(isLeaveBalanceNotConfiguredError('HRM-LEAVE-BAL-404', 404)).toBe(true);
    expect(isLeaveBalanceNotConfiguredError('HRM-SCOPE', 409)).toBe(false);
  });

  it('B2/B3: resolveLeaveBalanceWarnLevel exceed then depleted', () => {
    expect(resolveLeaveBalanceWarnLevel(5, 8)).toBe('exceed');
    expect(resolveLeaveBalanceWarnLevel(0, 2)).toBe('depleted');
    expect(leaveBalanceWarnBannerText('exceed')).toBeTruthy();
  });
});
