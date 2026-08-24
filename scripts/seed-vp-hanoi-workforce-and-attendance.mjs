#!/usr/bin/env node
/**
 * Seed VP Hà Nội — nhân viên (tenant xevn, company main) + bảng công 05/2026.
 * Không seed thành phần lương / công thức.
 *
 * Usage: node scripts/seed-vp-hanoi-workforce-and-attendance.mjs
 */
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import XLSX from 'xlsx';
import { loadDeployEnv } from './seed-env-loader.mjs';
import { createHrmClient } from './lib/uat-db.mjs';
import { stableUuid } from './lib/stable-uuid.mjs';
import {
  VP_HANOI_SEED_TAG,
  VP_HANOI_TENANT_ID as TENANT_ID,
  VP_HANOI_COMPANY_ID as COMPANY_ID,
  VP_HANOI_PERIOD_START as PERIOD_START,
  VP_HANOI_PERIOD_END as PERIOD_END,
  VP_HANOI_PERIOD_STANDARD_HOURS as PERIOD_STANDARD_HOURS,
} from './lib/vp-hanoi-seed-constants.mjs';
import {
  buildCatalogMaps,
  normalizeDepartmentLabel,
  normalizeJobTitleLabel,
} from './lib/vp-hanoi-catalog-maps.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(__dirname, '..');
const REPORT_DIR = resolve(REPO, 'scripts/seed-reports/payroll-vp-hanoi-2026-05');
const DEFAULT_XLSX =
  'C:\\Users\\Admin\\Downloads\\Telegram Desktop\\2026.06.21 bảng lương văn phòng Hà Nội.done.xlsx';
const PERIOD_STANDARD_DAYS = 26;

export { VP_HANOI_SEED_TAG };

function num(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function cleanStr(v) {
  if (v == null) return '';
  return String(v).replace(/\s+/g, ' ').trim();
}

function isEmployeeCode(v) {
  return /^XE\d+$/i.test(cleanStr(v));
}

function sheetRows(wb, name) {
  const ws = wb.Sheets[name];
  if (!ws) return [];
  return XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
}

function parseAttendanceRows(rows) {
  const map = new Map();
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const code = cleanStr(row[1]).toUpperCase();
    if (!isEmployeeCode(code) || i < 6) continue;
    const officialDays = num(row[39]);
    const officialHours = num(row[41]);
    const ot150 = num(row[46]) + num(row[47]);
    const ot200 = num(row[48]) + num(row[49]);
    const usedLeaveDays = num(row[59]);
    const actualWorkDays = num(row[60]);
    const payableHours = officialHours > 0 ? officialHours : officialDays * 8;
    map.set(code, {
      employee_code: code,
      official_days: officialDays,
      official_hours: officialHours,
      payable_hours: payableHours,
      ot_150_hours: ot150,
      ot_200_hours: ot200,
      paid_leave_hours: usedLeaveDays * 8,
      work_days: actualWorkDays > 0 ? actualWorkDays : officialDays,
      standard_days: num(row[43]) || PERIOD_STANDARD_DAYS,
    });
  }
  return map;
}

async function ensureAttendanceSchema(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS public.attendance_sheets (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      company_id TEXT NOT NULL,
      name TEXT NOT NULL,
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      attendance_type TEXT NOT NULL DEFAULT 'daily',
      standard_type TEXT NOT NULL DEFAULT 'standard',
      department TEXT,
      positions TEXT,
      status TEXT NOT NULL DEFAULT 'draft',
      created_by TEXT,
      notes TEXT,
      closed_at TIMESTAMPTZ,
      closed_by TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  await client.query(`
    CREATE TABLE IF NOT EXISTS public.att_timesheet_line (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      header_id UUID NOT NULL,
      company_id TEXT NOT NULL,
      employee_id UUID NOT NULL,
      standard_hours NUMERIC(12,4) NOT NULL,
      ot_hours_weighted NUMERIC(12,4) NOT NULL DEFAULT 0,
      paid_leave_hours NUMERIC(12,4) NOT NULL DEFAULT 0,
      unpaid_leave_hours NUMERIC(12,4) NOT NULL DEFAULT 0,
      late_penalty_hours NUMERIC(12,4) NULL,
      meal_shift_hours NUMERIC(12,4) NULL,
      other_components_json JSONB NULL,
      payable_hours NUMERIC(12,4) NOT NULL,
      line_locked BOOLEAN NOT NULL DEFAULT FALSE,
      work_days NUMERIC(8,2) NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      archived_at TIMESTAMPTZ NULL
    );
  `);
  await client.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS att_timesheet_line_header_employee_active_uq
      ON public.att_timesheet_line (header_id, employee_id)
      WHERE archived_at IS NULL;
  `);
}

function loadJson(name) {
  return JSON.parse(readFileSync(resolve(REPORT_DIR, name), 'utf8'));
}

function emailFor(code, emailMap) {
  const fromMap = emailMap.get(code);
  if (fromMap && fromMap.includes('@')) return fromMap.toLowerCase();
  return `${code.toLowerCase()}@seed.xevn.local`;
}

async function main() {
  loadDeployEnv();
  const xlsxPath = process.env.VP_HANOI_XLSX || DEFAULT_XLSX;
  const wb = XLSX.readFile(xlsxPath);

  const payrollRows = loadJson('01-employees-payroll.json');
  const emailRows = loadJson('09-emails.json');
  const attendanceMap = parseAttendanceRows(sheetRows(wb, 'Bảng công'));

  const emailMap = new Map(
    emailRows
      .filter((e) => e.email)
      .map((e) => [e.employee_code.toUpperCase(), e.email]),
  );

  const { deptLabelToCode, jobLabelToCode } = buildCatalogMaps(payrollRows);

  const client = createHrmClient();
  await client.connect();

  const sheetId = stableUuid(`${VP_HANOI_SEED_TAG}:attendance-sheet:2026-05`);
  let insertedEmployees = 0;
  let updatedEmployees = 0;
  let timesheetLines = 0;

  try {
    await ensureAttendanceSchema(client);
    await client.query('BEGIN');

    for (const row of payrollRows) {
      const code = row.employee_code.toUpperCase();
      const id = stableUuid(`${VP_HANOI_SEED_TAG}:employee:${code}`);
      const status = row.resigned_at ? 'inactive' : 'active';
      const deptLabel = normalizeDepartmentLabel(row.department);
      const jobLabel = normalizeJobTitleLabel(row.job_title);
      const deptCode = deptLabelToCode.get(deptLabel) ?? null;
      const jobCode = jobLabelToCode.get(jobLabel) ?? null;
      const customFields = {
        tenant_id: TENANT_ID,
        seed_tag: VP_HANOI_SEED_TAG,
        department: deptCode,
        department_label: deptLabel || null,
        job_title_label: jobLabel || null,
        department_id: deptCode
          ? stableUuid(`${VP_HANOI_SEED_TAG}:department:${deptCode}`)
          : null,
        probation_end_at: row.probation_end_at || null,
        contract_type: row.contract_type || null,
        legal_entity: row.legal_entity || null,
        phone_number: null,
        salary: row.income?.total_monthly_salary ?? null,
        insurance_base_p1: row.income?.insurance_base_p1 ?? null,
        supplemental_income_p2: row.income?.supplemental_income_p2 ?? null,
        kpi_salary_p3: row.income?.kpi_salary_p3 ?? null,
        performance_bonus_p4: row.income?.performance_bonus_p4 ?? null,
      };

      const res = await client.query(
        `INSERT INTO public.employees (
          id, company_id, employee_code, email, full_name, job_title_key,
          status, hired_at, custom_fields, archived_at, updated_at
        ) VALUES (
          $1::uuid, $2, $3, $4, $5, $6, $7, $8::date, $9::jsonb,
          CASE WHEN $7 = 'inactive' THEN NOW() ELSE NULL END, NOW()
        )
        ON CONFLICT (company_id, employee_code)
        DO UPDATE SET
          email = EXCLUDED.email,
          full_name = EXCLUDED.full_name,
          job_title_key = EXCLUDED.job_title_key,
          status = EXCLUDED.status,
          hired_at = EXCLUDED.hired_at,
          custom_fields = employees.custom_fields || EXCLUDED.custom_fields,
          archived_at = EXCLUDED.archived_at,
          updated_at = NOW()
        RETURNING (xmax = 0) AS inserted`,
        [
          id,
          COMPANY_ID,
          code,
          emailFor(code, emailMap),
          row.full_name,
          jobCode,
          status,
          row.hired_at || null,
          JSON.stringify(customFields),
        ],
      );
      if (res.rows[0]?.inserted) insertedEmployees++;
      else updatedEmployees++;
    }

    await client.query(
      `INSERT INTO public.attendance_sheets (
        id, company_id, name, start_date, end_date, status, notes, closed_at, closed_by, updated_at
      ) VALUES ($1::uuid, $2, $3, $4::date, $5::date, 'closed', $6, NOW(), $7, NOW())
      ON CONFLICT (id) DO UPDATE SET
        status = 'closed',
        closed_at = NOW(),
        closed_by = EXCLUDED.closed_by,
        updated_at = NOW()`,
      [
        sheetId,
        COMPANY_ID,
        'Bảng chấm công VP Hà Nội — 05/2026',
        PERIOD_START,
        PERIOD_END,
        `seed_tag=${VP_HANOI_SEED_TAG}`,
        VP_HANOI_SEED_TAG,
      ],
    );

    const empRes = await client.query(
      `SELECT id, employee_code FROM public.employees
       WHERE company_id = $1 AND custom_fields->>'seed_tag' = $2`,
      [COMPANY_ID, VP_HANOI_SEED_TAG],
    );

    for (const emp of empRes.rows) {
      const code = emp.employee_code.toUpperCase();
      const att = attendanceMap.get(code);
      if (!att) continue;

      const lineId = stableUuid(`${VP_HANOI_SEED_TAG}:timesheet-line:${sheetId}:${code}`);
      const otWeighted = att.ot_150_hours * 1.5 + att.ot_200_hours * 2;
      const otherJson = {
        ot_150_hours: att.ot_150_hours,
        ot_200_hours: att.ot_200_hours,
        standard_days: att.standard_days,
        seed_tag: VP_HANOI_SEED_TAG,
      };

      await client.query(
        `DELETE FROM public.att_timesheet_line
         WHERE header_id = $1::uuid AND employee_id = $2::uuid AND archived_at IS NULL`,
        [sheetId, emp.id],
      );

      await client.query(
        `INSERT INTO public.att_timesheet_line (
          id, header_id, company_id, employee_id,
          standard_hours, ot_hours_weighted, paid_leave_hours, unpaid_leave_hours,
          payable_hours, work_days, other_components_json, line_locked, updated_at
        ) VALUES (
          $1::uuid, $2::uuid, $3, $4::uuid,
          $5, $6, $7, 0, $8, $9, $10::jsonb, TRUE, NOW()
        )`,
        [
          lineId,
          sheetId,
          COMPANY_ID,
          emp.id,
          PERIOD_STANDARD_HOURS,
          otWeighted,
          att.paid_leave_hours,
          att.payable_hours,
          att.work_days,
          JSON.stringify(otherJson),
        ],
      );
      timesheetLines++;
    }

    await client.query('COMMIT');

    const verify = await client.query(
      `SELECT
        (SELECT COUNT(*)::int FROM employees WHERE custom_fields->>'seed_tag' = $1) AS employees,
        (SELECT COUNT(*)::int FROM att_timesheet_line l
          JOIN employees e ON e.id = l.employee_id
          WHERE e.custom_fields->>'seed_tag' = $1 AND l.header_id = $2::uuid) AS lines,
        (SELECT status FROM attendance_sheets WHERE id = $2::uuid) AS sheet_status`,
      [VP_HANOI_SEED_TAG, sheetId],
    );

    console.log(
      JSON.stringify(
        {
          success: true,
          seed_tag: VP_HANOI_SEED_TAG,
          tenant_id: TENANT_ID,
          company_id: COMPANY_ID,
          inserted_employees: insertedEmployees,
          updated_employees: updatedEmployees,
          attendance_sheet_id: sheetId,
          timesheet_lines: timesheetLines,
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

const isMain =
  process.argv[1] &&
  resolve(fileURLToPath(import.meta.url)) === resolve(process.argv[1]);

if (isMain) {
  main().catch((err) => {
    console.error(JSON.stringify({ success: false, error: err.message }, null, 2));
    process.exit(1);
  });
}
