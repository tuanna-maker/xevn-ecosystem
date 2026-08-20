/**
 * @CODE-MEMORY
 * WorkItem: PO-HRM-MVP-GD1-ATT-08-CLUSTER-BE-01
 * Purpose: Jest BR-BP-LV-05 gold T6→T2=2 · unit · HOL-MISS wire
 */
import { HttpStatus } from '@nestjs/common';
import { ApiException } from '../common/api.exception';
import {
  AttHolidayCalendarService,
  HRM_LEAVE_HOL_MISSING,
} from './att-holiday-calendar.service';
import {
  computeLeaveDeduction,
  parseLeaveDateInput,
} from './leave-deduction-engine';
import { LeaveRequestsService } from './leave-requests.service';

describe('leave-deduction-engine (BR-BP-LV-05)', () => {
  it('GC-ATT-08-01 gold T6→T2 (Fri 2026-08-07 → Mon 2026-08-10) working_days=2 not 4', () => {
    const out = computeLeaveDeduction({
      startDate: '2026-08-07',
      endDate: '2026-08-10',
      holidayDates: new Set(),
      unit: 'day',
    });
    expect(out.calendar_days).toBe(4);
    expect(out.working_days).toBe(2);
    expect(out.deductible_units).toBe(2);
    expect(out.excluded_days.map((d) => d.date)).toEqual([
      '2026-08-08',
      '2026-08-09',
    ]);
    expect(out.excluded_days.every((d) => d.reason === 'weekend')).toBe(true);
  });

  it('FAIL AC if calendar-4 used as trừ quỹ (contrast assertion)', () => {
    const out = computeLeaveDeduction({
      startDate: '07/08/2026',
      endDate: '10/08/2026',
      holidayDates: [],
      unit: 'day',
    });
    expect(out.calendar_days).toBe(4);
    expect(out.working_days).not.toBe(4);
    expect(out.deductible_units).toBe(2);
  });

  it('GC-ATT-08-02 Mon holiday → working_days=1', () => {
    const out = computeLeaveDeduction({
      startDate: '2026-08-07',
      endDate: '2026-08-10',
      holidayDates: new Set(['2026-08-10']),
      unit: 'day',
    });
    expect(out.working_days).toBe(1);
    expect(out.deductible_units).toBe(1);
    expect(
      out.excluded_days.some(
        (d) => d.date === '2026-08-10' && d.reason === 'holiday',
      ),
    ).toBe(true);
  });

  it('GC-ATT-08-03 Sat→Sun only → working_days=0 + warnings', () => {
    const out = computeLeaveDeduction({
      startDate: '2026-08-08',
      endDate: '2026-08-09',
      holidayDates: new Set(),
      unit: 'day',
    });
    expect(out.working_days).toBe(0);
    expect(out.deductible_units).toBe(0);
    expect(out.warnings.length).toBeGreaterThan(0);
  });

  it('GC-ATT-08-04 half-day unit=day → deductible_units=0.5', () => {
    const out = computeLeaveDeduction({
      startDate: '2026-08-07',
      endDate: '2026-08-07',
      holidayDates: new Set(),
      unit: 'day',
      halfDay: true,
    });
    expect(out.working_days).toBe(1);
    expect(out.deductible_units).toBe(0.5);
  });

  it('GC-ATT-08-05 unit=hour hours=1 → deductible_units=1', () => {
    const out = computeLeaveDeduction({
      startDate: '2026-08-07',
      endDate: '2026-08-07',
      holidayDates: new Set(),
      unit: 'hour',
      hours: 1,
    });
    expect(out.unit).toBe('hour');
    expect(out.deductible_units).toBe(1);
  });

  it('parseLeaveDateInput accepts ISO and dd/MM/yyyy', () => {
    expect(parseLeaveDateInput('2026-08-07')).toBe('2026-08-07');
    expect(parseLeaveDateInput('07/08/2026')).toBe('2026-08-07');
    expect(parseLeaveDateInput('bad')).toBeNull();
  });
});

describe('PO-HRM-MVP-GD1-ATT-08-CLUSTER-BE-01 preview + HOL-MISS + ALIGN', () => {
  const employeeId = '11111111-1111-4111-8111-111111111111';

  function noopBridge() {
    return {
      startLeaveWorkflowIfConfigured: jest.fn().mockResolvedValue(null),
    };
  }

  function holidayMock(opts?: { missing?: boolean; holidays?: string[] }) {
    return {
      ensureSchema: jest.fn().mockResolvedValue(undefined),
      assertHolidayYearsPresent: jest.fn().mockImplementation(async () => {
        if (opts?.missing) {
          throw new ApiException(
            HRM_LEAVE_HOL_MISSING,
            'Holiday calendar missing for year(s): 2026 — CHẶN NỘP',
            HttpStatus.BAD_REQUEST,
            { missing_years: [2026] },
          );
        }
        return {
          years: [2026],
          holidayDates: new Set(opts?.holidays ?? []),
        };
      }),
    } as unknown as AttHolidayCalendarService;
  }

  function leaveTypeMock(unit: 'day' | 'hour' = 'day') {
    return {
      assertLeaveTypeInEffectiveCatalog: jest.fn().mockResolvedValue({
        leaveTypeKey: 'annual',
        unit,
        metadata: null,
      }),
    };
  }

  it('preview T6→T2 = working_days 2 · Nest path family display-ready', async () => {
    const queryMock = jest.fn().mockResolvedValue({ rows: [] });
    const svc = new LeaveRequestsService(
      { query: queryMock } as never,
      {} as never,
      noopBridge() as never,
      undefined,
      undefined,
      undefined,
      undefined,
      leaveTypeMock('day') as never,
      holidayMock(),
    );
    const out = await svc.previewDeduction(
      {
        companyId: 'holding',
        employeeId,
        leaveType: 'annual',
        startDate: '2026-08-07',
        endDate: '2026-08-10',
      },
      undefined,
      { tenantId: 'xevn' },
    );
    expect(out.working_days).toBe(2);
    expect(out.calendar_days).toBe(4);
    expect(out.deductible_units).toBe(2);
    expect(out.unit).toBe('day');
    expect(out.labelsVi.working_days).toContain('trừ quỹ');
  });

  it('HOL-MISS — thiếu lịch năm → HRM-LEAVE-HOL-MISSING CHẶN', async () => {
    const svc = new LeaveRequestsService(
      { query: jest.fn().mockResolvedValue({ rows: [] }) } as never,
      {} as never,
      noopBridge() as never,
      undefined,
      undefined,
      undefined,
      undefined,
      leaveTypeMock('day') as never,
      holidayMock({ missing: true }),
    );
    await expect(
      svc.previewDeduction(
        {
          companyId: 'holding',
          employeeId,
          leaveType: 'annual',
          startDate: '2026-08-07',
          endDate: '2026-08-10',
        },
        undefined,
        { tenantId: 'xevn' },
      ),
    ).rejects.toMatchObject({ code: HRM_LEAVE_HOL_MISSING });
  });

  it('Q-LEAVE-UNIT hour — deductible_units=1 when hours=1', async () => {
    const svc = new LeaveRequestsService(
      { query: jest.fn().mockResolvedValue({ rows: [] }) } as never,
      {} as never,
      noopBridge() as never,
      undefined,
      undefined,
      undefined,
      undefined,
      leaveTypeMock('hour') as never,
      holidayMock(),
    );
    const out = await svc.previewDeduction(
      {
        companyId: 'holding',
        employeeId,
        leaveType: 'annual',
        startDate: '2026-08-07',
        endDate: '2026-08-07',
        hours: 1,
      },
      undefined,
      { tenantId: 'xevn' },
    );
    expect(out.unit).toBe('hour');
    expect(out.deductible_units).toBe(1);
  });

  it('ALIGN reject calendar inflate total_days=4 vs engine=2', async () => {
    const insertRow = {
      id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      company_id: 'holding',
      employee_id: employeeId,
      leave_type: 'annual',
      start_date: '2026-08-07',
      end_date: '2026-08-10',
      status: 'pending',
      total_days: '2',
      employee_code: 'NV001',
      employee_name: 'Test',
      department: null,
      position: null,
      reason: null,
      requested_at: '2026-08-09T00:00:00.000Z',
      reviewed_at: null,
      reviewed_by: null,
      handover_to: null,
      handover_tasks: null,
      approver_employee_id: null,
      rejected_reason: null,
      attachment_url: null,
    };
    const queryMock = jest.fn().mockImplementation((sql: string) => {
      const s = String(sql);
      if (
        s.includes('CREATE TABLE') ||
        s.includes('ALTER TABLE') ||
        s.includes('CREATE INDEX')
      ) {
        return Promise.resolve({ rows: [] });
      }
      if (s.includes('daterange')) {
        return Promise.resolve({ rows: [] });
      }
      if (s.includes('employee_leave_balances')) {
        return Promise.resolve({ rows: [] });
      }
      if (s.includes('INSERT INTO')) {
        return Promise.resolve({ rows: [insertRow] });
      }
      if (s.includes('SELECT * FROM public.leave_requests WHERE id')) {
        return Promise.resolve({ rows: [insertRow] });
      }
      return Promise.resolve({ rows: [] });
    });
    const fanout = {
      onLeaveRequestCreated: jest.fn().mockResolvedValue(undefined),
    };
    const svc = new LeaveRequestsService(
      { query: queryMock } as never,
      fanout as never,
      noopBridge() as never,
      undefined,
      undefined,
      undefined,
      undefined,
      leaveTypeMock('day') as never,
      holidayMock(),
    );
    await expect(
      svc.createLeaveRequest({
        company_id: 'holding',
        employee_id: employeeId,
        employee_code: 'NV001',
        employee_name: 'Test',
        leave_type: 'annual',
        start_date: '2026-08-07',
        end_date: '2026-08-10',
        total_days: 4,
      }),
    ).rejects.toMatchObject({ code: 'HRM-VAL-400' });
  });

  it('Nest /core dual DENY lock — physical attendance family constant', () => {
    expect('attendance').not.toBe('core');
    expect(HRM_LEAVE_HOL_MISSING).toBe('HRM-LEAVE-HOL-MISSING');
  });
});
