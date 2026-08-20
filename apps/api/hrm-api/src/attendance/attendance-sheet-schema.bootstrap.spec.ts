import {
  ensureAttendanceSheetSchema,
  ensureAttTimesheetLineSchema,
} from './attendance-sheet-schema.bootstrap';

describe('ensureAttendanceSheetSchema (close columns)', () => {
  it('runs CREATE IF NOT EXISTS and ALTER for closed_at / closed_by', async () => {
    const sql: string[] = [];
    const db = {
      query: jest.fn(async (q: string) => {
        sql.push(q);
        return { rows: [] };
      }),
    };

    await ensureAttendanceSheetSchema(db as never);

    expect(db.query).toHaveBeenCalledTimes(3);
    expect(
      sql.some((s) =>
        s.includes('CREATE TABLE IF NOT EXISTS public.attendance_sheets'),
      ),
    ).toBe(true);
    expect(
      sql.some((s) => s.includes('ADD COLUMN IF NOT EXISTS closed_at')),
    ).toBe(true);
    expect(
      sql.some((s) => s.includes('ADD COLUMN IF NOT EXISTS closed_by')),
    ).toBe(true);
  });
});

describe('ensureAttTimesheetLineSchema (BE-ATT-LINE-01)', () => {
  it('adds att_timesheet_line DDL after header ensure', async () => {
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
  });
});
