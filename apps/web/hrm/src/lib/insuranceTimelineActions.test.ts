import { describe, expect, it } from 'vitest';
import {
  ACTION_TO_ENROLLMENT_STATUS,
  allowedInsuranceActionsForStatus,
  buildInsuranceActionBody,
  formatInsurancePeriodDateVi,
  isInsuranceTimelineAction,
  mapInsurancePeriods,
} from './insuranceTimelineActions';

describe('insuranceTimelineActions — PO-HRM-E2E-LINK-EMP-FE-01/04', () => {
  it('locks action vocabulary 1:1 SA', () => {
    expect(isInsuranceTimelineAction('close')).toBe(true);
    expect(isInsuranceTimelineAction('change_rate')).toBe(true);
    expect(isInsuranceTimelineAction('resume')).toBe(true);
    expect(isInsuranceTimelineAction('cancel')).toBe(false);
    expect(ACTION_TO_ENROLLMENT_STATUS.close).toBe('closed');
    expect(ACTION_TO_ENROLLMENT_STATUS.suspend).toBe('suspended');
  });

  it('enables resume when suspended; empty when closed', () => {
    expect(allowedInsuranceActionsForStatus('suspended')).toContain('resume');
    expect(allowedInsuranceActionsForStatus('active')).not.toContain('resume');
    expect(allowedInsuranceActionsForStatus('closed')).toEqual([]);
  });

  it('requires company_id in body (R-EMP-SI-ACTION-COMPANY-ID-BODY)', () => {
    const missing = buildInsuranceActionBody({
      company_id: '  ',
      action: 'suspend',
      effective_from: '2026-08-01',
      suspend_reason: 'Nghỉ không lương',
    });
    expect(missing.ok).toBe(false);
  });

  it('builds action body without inventing formulas — DTO wire names', () => {
    const suspend = buildInsuranceActionBody({
      company_id: 'main',
      action: 'suspend',
      effective_from: '2026-08-01',
      suspend_reason: 'Nghỉ không lương',
    });
    expect(suspend.ok).toBe(true);
    if (suspend.ok) {
      expect(suspend.body.company_id).toBe('main');
      expect(suspend.body.action).toBe('suspend');
      expect(suspend.body.suspend_reason).toBe('Nghỉ không lương');
      expect(suspend.body).not.toHaveProperty('contribution');
      expect(suspend.body).not.toHaveProperty('employee_amount');
      expect(suspend.body).not.toHaveProperty('notes');
    }

    const rateFail = buildInsuranceActionBody({
      company_id: 'main',
      action: 'change_rate',
      effective_from: '2026-08-01',
    });
    expect(rateFail.ok).toBe(false);

    const rateOk = buildInsuranceActionBody({
      company_id: 'main',
      action: 'change_rate',
      effective_from: '2026-08-01',
      contribution: 1_050_000,
      employer_contribution: 2_100_000,
      notes: 'Điều chỉnh mức',
    });
    expect(rateOk.ok).toBe(true);
    if (rateOk.ok) {
      expect(rateOk.body.company_id).toBe('main');
      expect(rateOk.body.employee_amount).toBe(1_050_000);
      expect(rateOk.body.employer_amount).toBe(2_100_000);
      expect(rateOk.body.change_reason).toBe('Điều chỉnh mức');
      expect(rateOk.body).not.toHaveProperty('contribution');
      expect(rateOk.body).not.toHaveProperty('employer_contribution');
      expect(rateOk.body).not.toHaveProperty('notes');
    }

    const rateDtoNames = buildInsuranceActionBody({
      company_id: 'main',
      action: 'change_rate',
      effective_from: '2026-08-01',
      employee_amount: 10,
      employer_amount: 20,
    });
    expect(rateDtoNames.ok).toBe(true);
    if (rateDtoNames.ok) {
      expect(rateDtoNames.body.employee_amount).toBe(10);
      expect(rateDtoNames.body.employer_amount).toBe(20);
    }
  });

  it('maps display-ready periods[] only', () => {
    const periods = mapInsurancePeriods([
      {
        id: 'p1',
        effective_from: '2026-01-01',
        effective_to: null,
        period_status: 'applying',
        contribution: 100,
      },
      { id: '', effective_from: 'x' },
    ]);
    expect(periods).toHaveLength(1);
    expect(periods[0].period_status).toBe('applying');
    expect(periods[0].statusLabelVi).toBe('Đang áp dụng');
    expect(periods[0].contribution).toBe(100);
  });

  it('maps BE employee_amount/employer_amount as display-ready (no invent)', () => {
    const periods = mapInsurancePeriods([
      {
        id: 'p2',
        effective_from: '2026-02-01',
        period_status: 'applying',
        employee_amount: 50_000,
        employer_amount: 100_000,
      },
    ]);
    expect(periods[0].contribution).toBe(50_000);
    expect(periods[0].employer_contribution).toBe(100_000);
    expect(periods[0].contributionLabelVi).toMatch(/50/);
  });

  it('prefers BE statusLabelVi on periods (R-CORE-10-DISP)', () => {
    const periods = mapInsurancePeriods([
      {
        id: 'p3',
        effective_from: '2026-03-01',
        period_status: 'suspended',
        statusLabelVi: 'Tạm dừng (BE)',
        suspend_reason: 'Nghỉ không lương',
      },
    ]);
    expect(periods[0].statusLabelVi).toBe('Tạm dừng (BE)');
    expect(periods[0].suspend_reason).toBe('Nghỉ không lương');
  });

  it('formats SI period dates as vi-VN dd/MM/yyyy (OBS-SI-DATE-ISO)', () => {
    expect(formatInsurancePeriodDateVi('2026-08-07')).toBe('07/08/2026');
    expect(formatInsurancePeriodDateVi('2026-08-06T00:00:00.000Z')).toMatch(/^\d{2}\/\d{2}\/2026$/);
    expect(formatInsurancePeriodDateVi('')).toBe('—');
    expect(formatInsurancePeriodDateVi(null)).toBe('—');
    // Wire body still yyyy-MM-dd — helper is display-only
    const wire = buildInsuranceActionBody({
      company_id: 'main',
      action: 'stop',
      effective_from: '2026-08-07',
    });
    expect(wire.ok).toBe(true);
    if (wire.ok) expect(wire.body.effective_from).toBe('2026-08-07');
  });
});
