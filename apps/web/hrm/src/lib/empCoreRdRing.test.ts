/**
 * Helpers — PO-HRM-MVP-GD1-CORE-08-CLUSTER-FE-01 KT/KL ring
 */
import { describe, expect, it } from 'vitest';
import {
  buildRdMutatePayload,
  canCancelEnforceRdCase,
  canEnforceRdCase,
  canHardDeleteRdCase,
  isCoreRdDisciplinePhysicalPath,
  isCoreRdRewardsPhysicalPath,
  isForbiddenCoreRdSotPath,
  isRdPeriodSelectable,
  rdPayrollLinkLabelFallback,
  rdStatusLabelFallback,
  validateRdAmountPeriodGate,
} from './empCoreRdRing';

describe('empCoreRdRing', () => {
  it('recognizes physical rewards/discipline paths and forbids Nest /core SoT', () => {
    expect(
      isCoreRdRewardsPhysicalPath('/api/hrm/employees/e1/rewards'),
    ).toBe(true);
    expect(
      isCoreRdRewardsPhysicalPath('/api/hrm/employees/e1/rewards/r1/enforce'),
    ).toBe(true);
    expect(
      isCoreRdDisciplinePhysicalPath('/api/hrm/employees/e1/discipline/d1/cancel-enforce'),
    ).toBe(true);
    expect(isForbiddenCoreRdSotPath('/api/hrm/core/reward-discipline')).toBe(true);
    expect(isForbiddenCoreRdSotPath('/api/hrm/employees/e1/rewards')).toBe(false);
  });

  it('gates amount>0 → period and title-first', () => {
    expect(
      validateRdAmountPeriodGate({ title: '', amount: 0, payroll_period_id: null }),
    ).toMatch(/tiêu đề/i);
    expect(
      validateRdAmountPeriodGate({
        title: 'Thưởng Q1',
        amount: 1_000_000,
        payroll_period_id: null,
      }),
    ).toMatch(/kỳ lương/i);
    expect(
      validateRdAmountPeriodGate({
        title: 'Ghi nhận',
        amount: 0,
        payroll_period_id: null,
      }),
    ).toBeNull();
    expect(
      validateRdAmountPeriodGate({
        title: 'Thưởng',
        amount: 500_000,
        payroll_period_id: 'period-1',
      }),
    ).toBeNull();
  });

  it('maps enforce/cancel/delete eligibility + period selectable', () => {
    expect(canEnforceRdCase('pending')).toBe(true);
    expect(canEnforceRdCase('in_force')).toBe(false);
    expect(canCancelEnforceRdCase('in_force')).toBe(true);
    expect(canCancelEnforceRdCase('pending')).toBe(false);
    expect(
      canHardDeleteRdCase({ status: 'pending', payroll_link_status: 'none' }),
    ).toBe(true);
    expect(
      canHardDeleteRdCase({ status: 'in_force', payroll_link_status: 'linked' }),
    ).toBe(false);
    expect(isRdPeriodSelectable('draft')).toBe(true);
    expect(isRdPeriodSelectable('open')).toBe(true);
    expect(isRdPeriodSelectable('closed')).toBe(false);
  });

  it('fallback labels VI + mutate payload omits status / period when note-only', () => {
    expect(rdStatusLabelFallback('pending')).toBe('Chờ');
    expect(rdStatusLabelFallback('in_force')).toBe('Đang thi hành');
    expect(rdPayrollLinkLabelFallback('pending_period')).toBe('Chờ kỳ lương');
    const money = buildRdMutatePayload({
      title: 'Thưởng',
      typeKey: 'bonus',
      typeField: 'reward_type',
      dateKey: '2026-08-01',
      dateField: 'reward_date',
      amountField: 'amount',
      amount: 1000,
      payroll_period_id: 'p1',
    });
    expect(money.payroll_period_id).toBe('p1');
    expect(money).not.toHaveProperty('status');
    const note = buildRdMutatePayload({
      title: 'Giấy khen',
      typeKey: 'certificate',
      typeField: 'reward_type',
      dateKey: '2026-08-01',
      dateField: 'reward_date',
      amountField: 'amount',
      amount: 0,
    });
    expect(note.payroll_period_id).toBeNull();
  });
});
