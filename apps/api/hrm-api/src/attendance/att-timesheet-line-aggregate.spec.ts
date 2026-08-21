/**
 * @CODE-MEMORY
 * WorkItem: PO-HRM-PAYROLL-FORMULA-RUN-GAP-BE-ATT-LINE-01
 * Purpose: Jest — AGG compute · unpaid map · schema DDL · lock/archive SQL
 *
 * @CODE-MEMORY-CHANGE
 * WorkItem: PO-HRM-PAYROLL-FORMULA-RUN-GAP-BE-ATT-LINE-02
 * Coded: 2026-08-07
 * What: Date-object header start/end → UPSERT line_count>0 (not AGG_SHEET_DATE_INVALID)
 * Why: QA-ATT-LINE-01 FAIL stamp PAYFEATT-MSIJH9MT · String(Date).slice
 */
import {
  ATT_STANDARD_DAY_HOURS,
  aggregateAttendanceSheetLines,
  archiveAttTimesheetLinesForSheet,
  computeLineHoursFromRecords,
  isUnpaidLeaveTypeKey,
  lockAttTimesheetLinesForSheet,
} from './att-timesheet-line-aggregate';
import {
  ensureAttendanceSheetSchema,
  ensureAttTimesheetLineSchema,
} from './attendance-sheet-schema.bootstrap';
import { ApiException } from '../common/api.exception';
import { HrmDbService } from '../db/hrm-db.service';

describe('isUnpaidLeaveTypeKey (FUNNEL-DB §4.2)', () => {
  it('flags LVT_04 / unpaid lineage', () => {
    expect(isUnpaidLeaveTypeKey('LVT_04')).toBe(true);
    expect(isUnpaidLeaveTypeKey('unpaid')).toBe(true);
    expect(isUnpaidLeaveTypeKey('Không lương')).toBe(true);
  });

  it('defaults annual/sick to paid', () => {
    expect(isUnpaidLeaveTypeKey('annual')).toBe(false);
    expect(isUnpaidLeaveTypeKey('LVT_01')).toBe(false);
    expect(isUnpaidLeaveTypeKey('sick')).toBe(false);
  });
});

describe('computeLineHoursFromRecords', () => {
  it('sums present + paid leave + OT weighted into payable (no silent invent)', () => {
    const hours = computeLineHoursFromRecords({
      records: [
        { status: 'present', check_in_at: null, check_out_at: null },
        { status: 'leave', leave_type_key: 'annual' },
        { status: 'leave', leave_type_key: 'LVT_04' },
        { status: 'absent' },
      ],
      otWeightedHours: 3,
    });
    expect(hours.standard_hours).toBe(ATT_STANDARD_DAY_HOURS);
    expect(hours.paid_leave_hours).toBe(ATT_STANDARD_DAY_HOURS);
    expect(hours.unpaid_leave_hours).toBe(ATT_STANDARD_DAY_HOURS);
    expect(hours.ot_hours_weighted).toBe(3);
    expect(hours.payable_hours).toBe(
      ATT_STANDARD_DAY_HOURS + ATT_STANDARD_DAY_HOURS + 3,
    );
    expect(hours.work_days).toBe(1);
  });
});

describe('ensureAttTimesheetLineSchema', () => {
  it('creates att_timesheet_line + UQ/IX after header ensure', async () => {
    const sql: string[] = [];
    const db = {
      query: jest.fn(async (q: string) => {
        sql.push(q);
        return { rows: [] };
      }),
    };
    await ensureAttTimesheetLineSchema(db as never);
    expect(
      sql.some((s) =>
        s.includes('CREATE TABLE IF NOT EXISTS public.att_timesheet_line'),
      ),
    ).toBe(true);
    expect(
      sql.some((s) =>
        s.includes('att_timesheet_line_header_employee_active_uq'),
      ),
    ).toBe(true);
    expect(sql.some((s) => s.includes('line_locked'))).toBe(true);
    expect(sql.some((s) => s.includes('payable_hours'))).toBe(true);
  });

  it('ensureAttendanceSheetSchema still only touches header close cols', async () => {
    const sql: string[] = [];
    const db = {
      query: jest.fn(async (q: string) => {
        sql.push(q);
        return { rows: [] };
      }),
    };
    await ensureAttendanceSheetSchema(db as never);
    expect(sql.some((s) => s.includes('att_timesheet_line'))).toBe(false);
    expect(
      sql.some((s) => s.includes('ADD COLUMN IF NOT EXISTS closed_at')),
    ).toBe(true);
  });
});

describe('aggregateAttendanceSheetLines', () => {
  const header = {
    id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    company_id: 'holding',
    status: 'draft',
    start_date: '2026-08-01',
    end_date: '2026-08-31',
  };

  it('rejects closed sheet with HRM-ATT-SHEET-LOCKED', async () => {
    const db = {
      query: jest.fn(async () => ({ rows: [] })),
    } as unknown as HrmDbService;
    await expect(
      aggregateAttendanceSheetLines(db, { ...header, status: 'closed' }),
    ).rejects.toMatchObject<Partial>({
      code: 'HRM-ATT-SHEET-LOCKED',
    });
  });

  it('upserts lines from records and returns line_count', async () => {
    const empId = '11111111-1111-4111-8111-111111111111';
    const sqlLog: string[] = [];
    const db = {
      query: jest.fn(async (sql: string) => {
        sqlLog.push(sql);
        if (sql.includes('CREATE TABLE IF NOT EXISTS')) return { rows: [] };
        if (sql.includes('CREATE UNIQUE INDEX') || sql.includes('CREATE INDEX'))
          return { rows: [] };
        if (sql.includes('FROM public.attendance_records')) {
          return {
            rows: [
              {
                employee_id: empId,
                status: 'present',
                leave_type_key: null,
                check_in_at: null,
                check_out_at: null,
              },
            ],
          };
        }
        if (
          sql.includes('FROM public.overtime_requests') &&
          sql.includes('DISTINCT')
        ) {
          return { rows: [] };
        }
        if (
          sql.includes('FROM public.overtime_requests') &&
          sql.includes('SUM')
        ) {
          return { rows: [{ weighted: '0' }] };
        }
        if (
          sql.includes('FROM public.att_timesheet_line') &&
          sql.includes('LIMIT 1')
        ) {
          return { rows: [] };
        }
        if (sql.includes('INSERT INTO public.att_timesheet_line')) {
          return { rows: [] };
        }
        if (sql.includes('SELECT COUNT(*)::text AS c')) {
          return { rows: [{ c: '1' }] };
        }
        return { rows: [] };
      }),
    } as unknown as HrmDbService;

    const result = await aggregateAttendanceSheetLines(db, header);
    expect(result.line_count).toBe(1);
    expect(result.sheet_id).toBe(header.id);
    expect(
      sqlLog.some((s) => s.includes('INSERT INTO public.att_timesheet_line')),
    ).toBe(true);
    expect(
      sqlLog.some(
        (s) => s.includes('line_locked = FALSE') || s.includes('FALSE'),
      ),
    ).toBe(true);
  });

  it('BE-ATT-LINE-02: pg Date header dates UPSERT (not AGG_SHEET_DATE_INVALID)', async () => {
    const empId = '22222222-2222-4222-8222-222222222222';
    const start = new Date(2026, 7, 1); // local Aug 1 — String(d).slice ≠ YYYY-MM-DD
    const end = new Date(2026, 7, 31);
    expect(String(start).slice(0, 10)).not.toMatch(/^\d{4}-\d{2}-\d{2}$/);

    const sqlLog: string[] = [];
    const db = {
      query: jest.fn(async (sql: string, params?: unknown[]) => {
        sqlLog.push(sql);
        if (sql.includes('CREATE TABLE IF NOT EXISTS')) return { rows: [] };
        if (sql.includes('CREATE UNIQUE INDEX') || sql.includes('CREATE INDEX'))
          return { rows: [] };
        if (sql.includes('FROM public.attendance_records')) {
          expect(params?.[1]).toBe('2026-08-01');
          expect(params?.[2]).toBe('2026-08-31');
          return {
            rows: [
              {
                employee_id: empId,
                status: 'present',
                leave_type_key: null,
                check_in_at: null,
                check_out_at: null,
              },
            ],
          };
        }
        if (
          sql.includes('FROM public.overtime_requests') &&
          sql.includes('DISTINCT')
        ) {
          return { rows: [] };
        }
        if (
          sql.includes('FROM public.overtime_requests') &&
          sql.includes('SUM')
        ) {
          return { rows: [{ weighted: '0' }] };
        }
        if (
          sql.includes('FROM public.att_timesheet_line') &&
          sql.includes('LIMIT 1')
        ) {
          return { rows: [] };
        }
        if (sql.includes('INSERT INTO public.att_timesheet_line')) {
          return { rows: [] };
        }
        if (sql.includes('SELECT COUNT(*)::text AS c')) {
          return { rows: [{ c: '1' }] };
        }
        return { rows: [] };
      }),
    } as unknown as HrmDbService;

    const result = await aggregateAttendanceSheetLines(db, {
      ...header,
      start_date: start,
      end_date: end,
    });
    expect(result.warnings).not.toContain('AGG_SHEET_DATE_INVALID');
    expect(result.line_count).toBe(1);
    expect(
      sqlLog.some((s) => s.includes('INSERT INTO public.att_timesheet_line')),
    ).toBe(true);
  });
});

describe('lock / archive lines', () => {
  it('lockAttTimesheetLinesForSheet sets line_locked=true', async () => {
    const db = {
      query: jest.fn(async (sql: string) => {
        if (
          sql.includes('CREATE TABLE') ||
          sql.includes('CREATE UNIQUE') ||
          sql.includes('CREATE INDEX')
        ) {
          return { rows: [] };
        }
        if (sql.includes('line_locked = TRUE')) {
          return { rows: [{ c: '2' }] };
        }
        return { rows: [] };
      }),
    } as unknown as HrmDbService;
    const n = await lockAttTimesheetLinesForSheet(
      db,
      'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    );
    expect(n).toBe(2);
  });

  it('archiveAttTimesheetLinesForSheet soft-deletes active lines', async () => {
    const db = {
      query: jest.fn(async (sql: string) => {
        if (
          sql.includes('CREATE TABLE') ||
          sql.includes('CREATE UNIQUE') ||
          sql.includes('CREATE INDEX')
        ) {
          return { rows: [] };
        }
        if (sql.includes('archived_at = NOW()')) {
          return { rows: [{ c: '1' }] };
        }
        return { rows: [] };
      }),
    } as unknown as HrmDbService;
    const n = await archiveAttTimesheetLinesForSheet(
      db,
      'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    );
    expect(n).toBe(1);
  });
});
