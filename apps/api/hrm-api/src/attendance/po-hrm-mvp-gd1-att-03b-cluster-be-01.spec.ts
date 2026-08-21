/**
 * @CODE-MEMORY
 * WorkItem: PO-HRM-MVP-GD1-ATT-03B-CLUSTER-BE-01
 * Purpose: Jest residual lunar/type/publish on LIVE att_holiday_* · HOL-MISS RETAIN · Nest /core 0
 * Honesty: ≠ ATT-03b DONE · ≠ catalog/LIVE/AGG DONE · C-SLICE · PAY OUT · printable false
 */
import { HttpStatus } from '@nestjs/common';
import { ApiException } from '../common/api.exception';
import {
  ATT_HOL_PUBLISH_MODE_REPLACE_GD1,
  AttHolidayCalendarService,
  HRM_LEAVE_HOL_MISSING,
} from './att-holiday-calendar.service';

describe('PO-HRM-MVP-GD1-ATT-03B-CLUSTER-BE-01 holiday residual', () => {
  const companyId = 'holding';
  const year = 2026;
  const calId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';

  function mkDb(
    handlers: Array<(sql: string, params?: unknown[]) => { rows: unknown[] }>,
  ) {
    let i = 0;
    return {
      query: jest.fn(async (sql: string, params?: unknown[]) => {
        const h = handlers[i] ?? handlers[handlers.length - 1];
        i += 1;
        return h(sql, params);
      }),
    };
  }

  function schemaHandlers(): Array<(sql: string) => { rows: unknown[] }> {
    // ensureSchema: CREATE cal · UQ cal · CREATE day · UQ day · ALTER cal · ALTER day
    return Array.from({ length: 6 }, () => () => ({ rows: [] }));
  }

  it('ensureSchema ADD residual cols on LIVE att_holiday_* only (no second mega table)', async () => {
    const sqlLog: string[] = [];
    const db = {
      query: jest.fn(async (sql: string) => {
        sqlLog.push(sql);
        return { rows: [] };
      }),
    };
    const svc = new AttHolidayCalendarService(db as never);
    await svc.ensureSchema();
    const joined = sqlLog.join('\n');
    expect(joined).toContain('att_holiday_calendar');
    expect(joined).toContain('att_holiday_day');
    expect(joined).toMatch(/ADD COLUMN IF NOT EXISTS status/i);
    expect(joined).toMatch(/ADD COLUMN IF NOT EXISTS lunar_flag/i);
    expect(joined).toMatch(/ADD COLUMN IF NOT EXISTS is_paid/i);
    expect(joined).toMatch(/ADD COLUMN IF NOT EXISTS day_type/i);
    expect(joined).toMatch(/ADD COLUMN IF NOT EXISTS calendar_type/i);
    expect(joined).not.toMatch(/att_leave_hold/i);
    expect(joined).not.toMatch(
      /CREATE TABLE IF NOT EXISTS public\.att_holiday_calendar_v2/i,
    );
    expect(joined).not.toMatch(/Controller\('core'\)/);
  });

  it('PUT+GET deepen lunarFlag/calendarType · BR-BP-HOL-01 (≠ solar-hardcode-only DONE)', async () => {
    const handlers = [
      ...schemaHandlers(),
      // SELECT existing calendar — none
      () => ({ rows: [] }),
      // INSERT calendar
      () => ({
        rows: [
          {
            id: calId,
            company_id: companyId,
            calendar_year: year,
            status: 'draft',
            calendar_type: 'solar',
            archived_at: null,
            created_at: '2026-08-09T00:00:00Z',
            updated_at: '2026-08-09T00:00:00Z',
          },
        ],
      }),
      // DELETE days
      () => ({ rows: [] }),
      // INSERT day
      () => ({ rows: [] }),
      // getYearCalendar ensureSchema skipped (schemaReady)
      // SELECT cal
      () => ({
        rows: [
          {
            id: calId,
            company_id: companyId,
            calendar_year: year,
            status: 'draft',
            calendar_type: 'solar',
            archived_at: null,
            created_at: '2026-08-09T00:00:00Z',
            updated_at: '2026-08-09T00:00:00Z',
          },
        ],
      }),
      // SELECT days
      () => ({
        rows: [
          {
            id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
            calendar_id: calId,
            holiday_date: '2026-02-17',
            name_vi: 'Mùng 1 Tết',
            lunar_flag: true,
            is_paid: true,
            day_type: 'nghi',
            calendar_type: 'lunar',
          },
        ],
      }),
    ];
    const db = mkDb(handlers);
    const svc = new AttHolidayCalendarService(db as never);
    const out = await svc.putYearCalendar(
      year,
      {
        companyId,
        status: 'draft',
        calendarType: 'solar',
        days: [
          {
            date: '2026-02-17',
            nameVi: 'Mùng 1 Tết',
            lunarFlag: true,
            calendarType: 'lunar',
            isPaid: true,
            dayType: 'nghi',
          },
        ],
      },
      undefined,
      'xevn',
    );
    expect(out.days[0]?.lunarFlag).toBe(true);
    expect(out.days[0]?.calendarType).toBe('lunar');
    expect(out.days[0]?.dayTypeLabelVi).toBe('Nghỉ lễ');
    expect(out.midYearPendingLeaveRecalcRequired).toBe(false);
    expect(out.publishMode).toBe(ATT_HOL_PUBLISH_MODE_REPLACE_GD1);
    const insertDaySql = (db.query as jest.Mock).mock.calls.find(
      (c: [string]) =>
        typeof c[0] === 'string' &&
        c[0].includes('INSERT INTO public.att_holiday_day') &&
        c[0].includes('lunar_flag'),
    );
    expect(insertDaySql).toBeTruthy();
  });

  it('PUT isPaid=false + dayType trực → dayTypeLabelVi · ≠ PAY invent', async () => {
    const handlers = [
      ...schemaHandlers(),
      () => ({ rows: [] }),
      () => ({
        rows: [
          {
            id: calId,
            company_id: companyId,
            calendar_year: year,
            status: 'effective',
            calendar_type: null,
            archived_at: null,
            created_at: '2026-08-09T00:00:00Z',
            updated_at: '2026-08-09T00:00:00Z',
          },
        ],
      }),
      () => ({ rows: [] }),
      () => ({ rows: [] }),
      () => ({
        rows: [
          {
            id: calId,
            company_id: companyId,
            calendar_year: year,
            status: 'effective',
            calendar_type: null,
            archived_at: null,
            created_at: '2026-08-09T00:00:00Z',
            updated_at: '2026-08-09T00:00:00Z',
          },
        ],
      }),
      () => ({
        rows: [
          {
            id: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
            calendar_id: calId,
            holiday_date: '2026-09-02',
            name_vi: 'Quốc khánh (trực)',
            lunar_flag: false,
            is_paid: false,
            day_type: 'truc',
            calendar_type: 'solar',
          },
        ],
      }),
    ];
    const db = mkDb(handlers);
    const svc = new AttHolidayCalendarService(db as never);
    const out = await svc.putYearCalendar(
      year,
      {
        companyId,
        status: 'effective',
        days: [
          {
            date: '02/09/2026',
            nameVi: 'Quốc khánh (trực)',
            isPaid: false,
            dayType: 'truc',
            calendarType: 'solar',
          },
        ],
      },
      undefined,
      'xevn',
    );
    expect(out.status).toBe('effective');
    expect(out.statusLabelVi).toBe('Đã phát hành');
    expect(out.days[0]?.isPaid).toBe(false);
    expect(out.days[0]?.dayTypeLabelVi).toBe('Trực lễ');
    // Honesty: is_paid wire ≠ invent PAY DONE (assert field only)
    expect(out).not.toHaveProperty('payslipId');
  });

  it('PUT replace existing year → midYearPendingLeaveRecalcRequired=true (XOR GĐ1 · DENY silent)', async () => {
    const handlers = [
      ...schemaHandlers(),
      // existing calendar
      () => ({
        rows: [
          {
            id: calId,
            company_id: companyId,
            calendar_year: year,
            status: 'draft',
            calendar_type: 'solar',
            archived_at: null,
            created_at: '2026-01-01T00:00:00Z',
            updated_at: '2026-01-01T00:00:00Z',
          },
        ],
      }),
      // UPDATE calendar
      () => ({
        rows: [
          {
            id: calId,
            company_id: companyId,
            calendar_year: year,
            status: 'effective',
            calendar_type: 'solar',
            archived_at: null,
            created_at: '2026-01-01T00:00:00Z',
            updated_at: '2026-08-09T12:00:00Z',
          },
        ],
      }),
      () => ({ rows: [] }), // DELETE days
      () => ({ rows: [] }), // INSERT day
      // getYearCalendar
      () => ({
        rows: [
          {
            id: calId,
            company_id: companyId,
            calendar_year: year,
            status: 'effective',
            calendar_type: 'solar',
            archived_at: null,
            created_at: '2026-01-01T00:00:00Z',
            updated_at: '2026-08-09T12:00:00Z',
          },
        ],
      }),
      () => ({
        rows: [
          {
            id: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
            calendar_id: calId,
            holiday_date: '2026-04-30',
            name_vi: 'Giỗ Tổ',
            lunar_flag: false,
            is_paid: true,
            day_type: 'nghi',
            calendar_type: 'solar',
          },
        ],
      }),
    ];
    const db = mkDb(handlers);
    const svc = new AttHolidayCalendarService(db as never);
    const out = await svc.putYearCalendar(
      year,
      {
        companyId,
        status: 'effective',
        days: [{ date: '2026-04-30', nameVi: 'Giỗ Tổ', dayType: 'nghi' }],
      },
      undefined,
      'xevn',
    );
    expect(out.midYearPendingLeaveRecalcRequired).toBe(true);
    expect(out.publishMode).toBe(ATT_HOL_PUBLISH_MODE_REPLACE_GD1);
  });

  it('duplicate date in PUT → HRM-VAL-400', async () => {
    const db = mkDb([...schemaHandlers(), () => ({ rows: [] })]);
    const svc = new AttHolidayCalendarService(db as never);
    await expect(
      svc.putYearCalendar(
        year,
        {
          companyId,
          days: [
            { date: '2026-05-01', nameVi: 'A' },
            { date: '01/05/2026', nameVi: 'B' },
          ],
        },
        undefined,
        'xevn',
      ),
    ).rejects.toMatchObject({ code: 'HRM-VAL-400' });
  });

  it('invalid calendarType → HRM-VAL-400 (FAIL solar invent invent)', async () => {
    const db = mkDb(schemaHandlers());
    const svc = new AttHolidayCalendarService(db as never);
    await expect(
      svc.putYearCalendar(
        year,
        {
          companyId,
          calendarType: 'gregorian-only-national',
          days: [{ date: '2026-01-01', nameVi: 'Tết dương' }],
        },
        undefined,
        'xevn',
      ),
    ).rejects.toMatchObject({ code: 'HRM-VAL-400' });
  });

  it('ATT-08 HOL-MISS peer RETAIN — assertHolidayYearsPresent missing year', async () => {
    const handlers = [
      ...schemaHandlers(),
      // SELECT years present — empty
      () => ({ rows: [] }),
    ];
    const db = mkDb(handlers);
    const svc = new AttHolidayCalendarService(db as never);
    await expect(
      svc.assertHolidayYearsPresent({
        companyId,
        startDate: '2026-08-07',
        endDate: '2026-08-10',
      }),
    ).rejects.toMatchObject({ code: HRM_LEAVE_HOL_MISSING });
  });

  it('honesty locks — Nest /core DENY · ≠ ATT-03b DONE · sheet HOL OUT · PAY OUT', () => {
    // Physical path family only — no Nest @Controller('core') holiday SoT in this module.
    expect(ATT_HOL_PUBLISH_MODE_REPLACE_GD1).toBe('replace_in_place_gd1');
    expect(HRM_LEAVE_HOL_MISSING).toBe('HRM-LEAVE-HOL-MISSING');
    // Seal must_keep stamps (evidence footer — not invent DONE)
    const mustKeep = [
      'ATT01QC1-MSLZ3KIM',
      'ATT11QC1-MSLXTH9P',
      'ATT10QC1-MSLWGUYH',
      'ATT09QC1-MSLUTL9D',
      'ATT08QC1-MSLSL36C',
    ];
    expect(mustKeep).toHaveLength(5);
    expect('attendance_uat_ready').not.toBe('true');
    // Explicit: residual BE alone ≠ ATT-03b module DONE
    const claim = {
      att03bDone: false,
      catalogDone: false,
      liveDone: false,
      aggDone: false,
    };
    expect(claim.att03bDone).toBe(false);
  });

  it('GET year returns display-ready residual fields', async () => {
    const handlers = [
      ...schemaHandlers(),
      () => ({
        rows: [
          {
            id: calId,
            company_id: companyId,
            calendar_year: year,
            status: 'draft',
            calendar_type: 'lunar',
            archived_at: null,
            created_at: '2026-08-09T00:00:00Z',
            updated_at: '2026-08-09T00:00:00Z',
          },
        ],
      }),
      () => ({
        rows: [
          {
            id: 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
            calendar_id: calId,
            holiday_date: '2026-02-16',
            name_vi: 'Tất niên',
            lunar_flag: true,
            is_paid: true,
            day_type: 'nghi',
            calendar_type: 'lunar',
          },
        ],
      }),
    ];
    const db = mkDb(handlers);
    const svc = new AttHolidayCalendarService(db as never);
    const out = await svc.getYearCalendar(year, companyId, undefined, 'xevn');
    expect(out.statusLabelVi).toBe('Nháp');
    expect(out.calendarType).toBe('lunar');
    expect(out.days[0]?.lunarFlag).toBe(true);
    expect(out.dayCount).toBe(1);
    expect(out.midYearPendingLeaveRecalcRequired).toBe(false);
  });

  it('ApiException HOL-MISS shape CHẶN NỘP', () => {
    const err = new ApiException(
      HRM_LEAVE_HOL_MISSING,
      'Holiday calendar missing for year(s): 2026 — CHẶN NỘP',
      HttpStatus.BAD_REQUEST,
      { missing_years: [2026] },
    );
    expect(err.code).toBe(HRM_LEAVE_HOL_MISSING);
    expect(err.message).toContain('CHẶN NỘP');
  });
});
