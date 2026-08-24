#!/usr/bin/env node
/**
 * Seed chấm công chi tiết VP Hà Nội 05/2026 — attendance_records theo ngày + cập nhật tổng hợp.
 *
 * Nguồn: 03-attendance-lines.json (daily_marks) + 01-employees-payroll.json (online_hours)
 *
 * Usage: node scripts/seed-vp-hanoi-daily-attendance.mjs
 */
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadDeployEnv } from './seed-env-loader.mjs';
import { createHrmClient } from './lib/uat-db.mjs';
import { stableUuid } from './lib/stable-uuid.mjs';
import { VP_HANOI_SEED_TAG } from './lib/vp-hanoi-seed-constants.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPORT_DIR = resolve(__dirname, 'seed-reports/payroll-vp-hanoi-2026-05');

const COMPANY_ID = 'main';
const PERIOD_START = '2026-05-01';
const PERIOD_END = '2026-05-31';
const PERIOD_STANDARD_HOURS = 208;
const TZ_OFFSET = '+07:00';

function cleanStr(v) {
  if (v == null) return '';
  return String(v).replace(/\s+/g, ' ').trim();
}

function num(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function loadJson(name) {
  return JSON.parse(readFileSync(resolve(REPORT_DIR, name), 'utf8'));
}

/** 31 ngày tháng 5/2026 */
function may2026Dates() {
  const dates = [];
  for (let d = 1; d <= 31; d++) {
    dates.push(`2026-05-${String(d).padStart(2, '0')}`);
  }
  return dates;
}

function parseDailyMark(mark) {
  const raw = cleanStr(mark);
  if (!raw) return { kind: 'skip' };

  if (raw === 'L') {
    return { kind: 'leave', leave_type_key: 'holiday', hours: 8, label: 'Nghỉ lễ' };
  }
  if (raw === 'CT' || raw === 'TV' || raw === 'TV-CT') {
    return { kind: 'present', hours: 8, note: `Mã công: ${raw}`, online: false };
  }

  const hours = num(raw);
  if (hours === 0) {
    return { kind: 'leave', leave_type_key: 'unpaid', hours: 8, label: 'Nghỉ không lương' };
  }
  if (hours > 0) {
    return { kind: 'present', hours: Math.min(hours, 12), online: false };
  }

  return { kind: 'present', hours: 8, online: false };
}

function isoCheckIn(dateStr, hour = 8, minute = 0) {
  return `${dateStr}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00${TZ_OFFSET}`;
}

function isoCheckOut(dateStr, hours) {
  const totalMinutes = Math.round(hours * 60);
  const startH = 8;
  const endMinutes = startH * 60 + totalMinutes;
  const h = Math.floor(endMinutes / 60);
  const m = endMinutes % 60;
  return `${dateStr}T${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00${TZ_OFFSET}`;
}

async function ensureAttendanceRecordsSchema(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS public.attendance_records (
      id UUID PRIMARY KEY,
      company_id TEXT NOT NULL,
      employee_id UUID NOT NULL,
      attendance_date DATE NOT NULL,
      check_in_at TIMESTAMPTZ NULL,
      check_out_at TIMESTAMPTZ NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      note TEXT NULL,
      created_by TEXT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  await client.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS uq_attendance_company_employee_date
      ON public.attendance_records (company_id, employee_id, attendance_date);
  `);
  await client.query(`
    ALTER TABLE public.attendance_records
      ADD COLUMN IF NOT EXISTS leave_type_key TEXT NULL;
  `);
}

function aggregateFromMarks(dailyMarks, dates, onlineHours = 0) {
  let presentHours = 0;
  let paidLeaveHours = 0;
  let unpaidLeaveHours = 0;
  let workDays = 0;
  let onlineDays = 0;

  for (let i = 0; i < dates.length; i++) {
    const parsed = parseDailyMark(dailyMarks[i] ?? '');
    if (parsed.kind === 'present') {
      presentHours += parsed.hours;
      workDays += 1;
    } else if (parsed.kind === 'leave') {
      if (parsed.leave_type_key === 'unpaid') unpaidLeaveHours += parsed.hours;
      else paidLeaveHours += parsed.hours;
    }
  }

  if (onlineHours > 0 && workDays > 0) {
    onlineDays = Math.min(workDays, Math.round(onlineHours / 8));
  }

  const ot150 = 0;
  const ot200 = 0;
  const otWeighted = 0;
  const payable = presentHours + paidLeaveHours + otWeighted;

  return {
    standard_hours: PERIOD_STANDARD_HOURS,
    payable_hours: payable,
    paid_leave_hours: paidLeaveHours,
    unpaid_leave_hours: unpaidLeaveHours,
    work_days: workDays,
    ot_hours_weighted: otWeighted,
    online_hours: onlineHours,
    online_days: onlineDays,
    ot_150_hours: ot150,
    ot_200_hours: ot200,
  };
}

async function main() {
  loadDeployEnv();
  const payrollRows = loadJson('01-employees-payroll.json');
  const attendanceRows = loadJson('03-attendance-lines.json');
  const payrollCodes = new Set(payrollRows.map((r) => r.employee_code.toUpperCase()));
  const attByCode = new Map(
    attendanceRows
      .filter((r) => payrollCodes.has(r.employee_code.toUpperCase()))
      .map((r) => [r.employee_code.toUpperCase(), r]),
  );
  const payrollByCode = new Map(payrollRows.map((r) => [r.employee_code.toUpperCase(), r]));
  const dates = may2026Dates();
  const sheetId = stableUuid(`${VP_HANOI_SEED_TAG}:attendance-sheet:2026-05`);

  const client = createHrmClient();
  await client.connect();

  let recordsUpserted = 0;
  let linesUpdated = 0;

  try {
    await ensureAttendanceRecordsSchema(client);
    await client.query('BEGIN');

    const empRes = await client.query(
      `SELECT id, employee_code FROM employees
       WHERE company_id = $1 AND custom_fields->>'seed_tag' = $2`,
      [COMPANY_ID, VP_HANOI_SEED_TAG],
    );

    for (const emp of empRes.rows) {
      const code = emp.employee_code.toUpperCase();
      const attRow = attByCode.get(code);
      const payrollRow = payrollByCode.get(code);
      if (!attRow) continue;

      const dailyMarks = attRow.daily_marks ?? [];
      const onlineHours = num(payrollRow?.online_hours) || num(attRow.online_days_weekday) * 8;
      let onlineDaysLeft = onlineHours > 0 ? Math.ceil(onlineHours / 8) : 0;

      await client.query(
        `DELETE FROM attendance_records
         WHERE company_id = $1 AND employee_id = $2::uuid
           AND attendance_date >= $3::date AND attendance_date <= $4::date`,
        [COMPANY_ID, emp.id, PERIOD_START, PERIOD_END],
      );

      for (let i = 0; i < dates.length; i++) {
        const dateStr = dates[i];
        const parsed = parseDailyMark(dailyMarks[i] ?? '');
        if (parsed.kind === 'skip') continue;

        const recordId = stableUuid(`${VP_HANOI_SEED_TAG}:att-record:${code}:${dateStr}`);
        let status = 'present';
        let leaveTypeKey = null;
        let checkIn = null;
        let checkOut = null;
        let note = null;

        if (parsed.kind === 'leave') {
          status = 'leave';
          leaveTypeKey = parsed.leave_type_key;
          note = parsed.label ?? 'Nghỉ phép';
        } else {
          const isOnline = onlineDaysLeft > 0;
          if (isOnline) onlineDaysLeft--;
          checkIn = isoCheckIn(dateStr);
          checkOut = isoCheckOut(dateStr, parsed.hours);
          note = isOnline
            ? `Làm online · ${parsed.note ?? `${parsed.hours}h`}`
            : parsed.note ?? `${parsed.hours}h công`;
        }

        await client.query(
          `INSERT INTO attendance_records (
             id, company_id, employee_id, attendance_date,
             check_in_at, check_out_at, status, note, leave_type_key, created_by, updated_at
           ) VALUES (
             $1::uuid, $2, $3::uuid, $4::date,
             $5::timestamptz, $6::timestamptz, $7, $8, $9, $10, NOW()
           )
           ON CONFLICT (company_id, employee_id, attendance_date)
           DO UPDATE SET
             check_in_at = EXCLUDED.check_in_at,
             check_out_at = EXCLUDED.check_out_at,
             status = EXCLUDED.status,
             note = EXCLUDED.note,
             leave_type_key = EXCLUDED.leave_type_key,
             updated_at = NOW()`,
          [
            recordId,
            COMPANY_ID,
            emp.id,
            dateStr,
            checkIn,
            checkOut,
            status,
            note,
            leaveTypeKey,
            VP_HANOI_SEED_TAG,
          ],
        );
        recordsUpserted++;
      }

      const agg = aggregateFromMarks(dailyMarks, dates, onlineHours);
      const ot150 =
        num(payrollRow?.ot_150_hours_tv) + num(payrollRow?.ot_150_hours_ct) ||
        num(attRow.ot_150_hours_tv) + num(attRow.ot_150_hours_ct);
      const ot200 =
        num(payrollRow?.ot_200_hours_tv) + num(payrollRow?.ot_200_hours_ct) ||
        num(attRow.ot_200_hours_tv) + num(attRow.ot_200_hours_ct);
      agg.ot_150_hours = ot150;
      agg.ot_200_hours = ot200;
      agg.ot_hours_weighted = ot150 * 1.5 + ot200 * 2;
      agg.payable_hours = round4(
        agg.payable_hours + agg.ot_hours_weighted - agg.unpaid_leave_hours * 0,
      );

      const otherJson = {
        seed_tag: VP_HANOI_SEED_TAG,
        ot_150_hours: ot150,
        ot_200_hours: ot200,
        online_hours: onlineHours,
        online_days: agg.online_days,
        holiday_lcb_days: num(attRow.holiday_lcb_days),
        used_leave_days: num(attRow.used_leave_days),
        entitled_leave_days: num(attRow.entitled_leave_days),
        daily_marks_source: '03-attendance-lines.json',
      };

      const lineId = stableUuid(`${VP_HANOI_SEED_TAG}:timesheet-line:${sheetId}:${code}`);
      await client.query(
        `INSERT INTO att_timesheet_line (
           id, header_id, company_id, employee_id,
           standard_hours, ot_hours_weighted, paid_leave_hours, unpaid_leave_hours,
           payable_hours, work_days, other_components_json, line_locked, updated_at
         ) VALUES (
           $1::uuid, $2::uuid, $3, $4::uuid,
           $5, $6, $7, $8, $9, $10, $11::jsonb, TRUE, NOW()
         )
         ON CONFLICT (id) DO UPDATE SET
           standard_hours = EXCLUDED.standard_hours,
           ot_hours_weighted = EXCLUDED.ot_hours_weighted,
           paid_leave_hours = EXCLUDED.paid_leave_hours,
           unpaid_leave_hours = EXCLUDED.unpaid_leave_hours,
           payable_hours = EXCLUDED.payable_hours,
           work_days = EXCLUDED.work_days,
           other_components_json = EXCLUDED.other_components_json,
           line_locked = TRUE,
           updated_at = NOW()`,
        [
          lineId,
          sheetId,
          COMPANY_ID,
          emp.id,
          PERIOD_STANDARD_HOURS,
          agg.ot_hours_weighted,
          agg.paid_leave_hours,
          agg.unpaid_leave_hours,
          agg.payable_hours,
          agg.work_days,
          JSON.stringify(otherJson),
        ],
      );
      linesUpdated++;
    }

    await client.query('COMMIT');

    const verify = await client.query(
      `SELECT
        (SELECT COUNT(*)::int FROM attendance_records ar
          JOIN employees e ON e.id = ar.employee_id
          WHERE e.custom_fields->>'seed_tag' = $1
            AND ar.attendance_date BETWEEN $2::date AND $3::date) AS daily_records,
        (SELECT COUNT(*)::int FROM att_timesheet_line tl
          JOIN employees e ON e.id = tl.employee_id
          WHERE e.custom_fields->>'seed_tag' = $1 AND tl.header_id = $4::uuid) AS timesheet_lines,
        (SELECT COUNT(*)::int FROM attendance_records ar
          JOIN employees e ON e.id = ar.employee_id
          WHERE e.custom_fields->>'seed_tag' = $1 AND ar.status = 'leave'
            AND ar.leave_type_key <> 'unpaid') AS paid_leave_days,
        (SELECT COUNT(*)::int FROM attendance_records ar
          JOIN employees e ON e.id = ar.employee_id
          WHERE e.custom_fields->>'seed_tag' = $1 AND ar.status = 'leave'
            AND ar.leave_type_key = 'unpaid') AS unpaid_leave_days,
        (SELECT COUNT(*)::int FROM attendance_records ar
          JOIN employees e ON e.id = ar.employee_id
          WHERE e.custom_fields->>'seed_tag' = $1 AND ar.note ILIKE '%online%') AS online_marked_days`,
      [VP_HANOI_SEED_TAG, PERIOD_START, PERIOD_END, sheetId],
    );

    console.log(
      JSON.stringify(
        {
          success: true,
          seed_tag: VP_HANOI_SEED_TAG,
          employees: empRes.rows.length,
          daily_records_upserted: recordsUpserted,
          timesheet_lines_updated: linesUpdated,
          verify: verify.rows[0],
        },
        null,
        2,
      ),
    );
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    await client.end();
  }
}

function round4(n) {
  return Math.round(n * 10000) / 10000;
}

main().catch((err) => {
  console.error(JSON.stringify({ success: false, error: err.message }, null, 2));
  process.exit(1);
});
