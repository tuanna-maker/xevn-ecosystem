#!/usr/bin/env node
/**
 * Seed VP Hà Nội — catalog phòng ban + chức vụ, link NV, bảng công 93 NV.
 *
 * - hrm_catalog_extension_items: departments + job_titles (mã catalog SoT)
 * - public.departments: bản ghi phòng ban với UUID ổn định
 * - employees: custom_fields.department = mã PB, job_title_key = mã chức vụ
 * - attendance_sheets + att_timesheet_line: 93 dòng công 05/2026
 *
 * Usage: node scripts/seed-vp-hanoi-org-catalog-and-attendance.mjs
 */
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import XLSX from 'xlsx';
import { loadDeployEnv } from './seed-env-loader.mjs';
import { createHrmClient } from './lib/uat-db.mjs';
import { stableUuid } from './lib/stable-uuid.mjs';
import {
  buildCatalogMaps,
  cleanStr,
  normalizeDepartmentLabel,
  normalizeJobTitleLabel,
} from './lib/vp-hanoi-catalog-maps.mjs';
import { VP_HANOI_SEED_TAG } from './lib/vp-hanoi-seed-constants.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(__dirname, '..');
const REPORT_DIR = resolve(REPO, 'scripts/seed-reports/payroll-vp-hanoi-2026-05');
const DEFAULT_XLSX =
  'C:\\Users\\Admin\\Downloads\\Telegram Desktop\\2026.06.21 bảng lương văn phòng Hà Nội.done.xlsx';

const TENANT_ID = 'xevn';
const COMPANY_ID = 'main';
const PERIOD_START = '2026-05-01';
const PERIOD_END = '2026-05-31';
const PERIOD_STANDARD_HOURS = 208;

function num(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function loadJson(name) {
  return JSON.parse(readFileSync(resolve(REPORT_DIR, name), 'utf8'));
}

function attendanceFromPayrollRow(row) {
  const hoursProb = num(row.hours_probation_100);
  const hoursOfficial = num(row.hours_official_100);
  const payableHours =
    hoursProb + hoursOfficial > 0
      ? hoursProb + hoursOfficial
      : num(row.official_work_days) * 8 + num(row.probation_work_days) * 8;
  const workDays =
    num(row.official_work_days) + num(row.probation_work_days) ||
    num(row.standard_days) ||
    26;
  const ot150 = num(row.ot_150_hours_tv) + num(row.ot_150_hours_ct);
  const ot200 = num(row.ot_200_hours_tv) + num(row.ot_200_hours_ct);
  const paidLeaveHours = (num(row.leave_days_lcb_ct) + num(row.leave_days_lcb_tv)) * 8;

  return {
    payable_hours: payableHours,
    work_days: workDays,
    ot_150_hours: ot150,
    ot_200_hours: ot200,
    paid_leave_hours: paidLeaveHours,
    standard_days: num(row.standard_days) || 26,
  };
}

function isEmployeeCode(v) {
  return /^XE\d+$/i.test(cleanStr(v));
}

function sheetRows(wb, name) {
  const ws = wb.Sheets[name];
  if (!ws) return [];
  return XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
}

function parseAttendanceFromExcel(wb) {
  const map = new Map();
  for (const row of sheetRows(wb, 'Bảng công')) {
    const code = cleanStr(row[1]).toUpperCase();
    if (!isEmployeeCode(code)) continue;
    const officialDays = num(row[39]);
    const officialHours = num(row[41]);
    const ot150 = num(row[46]) + num(row[47]);
    const ot200 = num(row[48]) + num(row[49]);
    const usedLeaveDays = num(row[59]);
    const actualWorkDays = num(row[60]);
    const payableHours = officialHours > 0 ? officialHours : officialDays * 8;
    if (payableHours <= 0 && officialDays <= 0) continue;
    map.set(code, {
      payable_hours: payableHours,
      work_days: actualWorkDays > 0 ? actualWorkDays : officialDays,
      ot_150_hours: ot150,
      ot_200_hours: ot200,
      paid_leave_hours: usedLeaveDays * 8,
      standard_days: num(row[43]) || 26,
    });
  }
  return map;
}

async function ensureSchemas(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS public.hrm_catalog_extension_items (
      id BIGSERIAL PRIMARY KEY,
      tenant_id TEXT NOT NULL,
      company_id TEXT NOT NULL,
      catalog_key TEXT NOT NULL,
      code TEXT NOT NULL,
      label TEXT NOT NULL,
      unit TEXT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  await client.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS uq_hrm_cat_ext_scope_key_code
      ON public.hrm_catalog_extension_items (tenant_id, company_id, catalog_key, code);
  `);
  await client.query(`
    CREATE TABLE IF NOT EXISTS public.departments (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      company_id TEXT NOT NULL,
      parent_id UUID REFERENCES public.departments (id) ON DELETE SET NULL,
      name TEXT NOT NULL,
      code TEXT,
      description TEXT,
      manager_name TEXT,
      manager_email TEXT,
      employee_count INTEGER NOT NULL DEFAULT 0,
      level INTEGER NOT NULL DEFAULT 1,
      sort_order INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'active',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  await client.query(`ALTER TABLE public.departments ADD COLUMN IF NOT EXISTS tenant_id TEXT NULL`);
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

async function upsertCatalogItem(client, catalogKey, code, label) {
  await client.query(
    `INSERT INTO public.hrm_catalog_extension_items
       (tenant_id, company_id, catalog_key, code, label, status)
     VALUES ($1, $2, $3, $4, $5, 'active')
     ON CONFLICT (tenant_id, company_id, catalog_key, code)
     DO UPDATE SET label = EXCLUDED.label, status = 'active'`,
    [TENANT_ID, COMPANY_ID, catalogKey, code, label],
  );
}

async function upsertDepartmentRow(client, code, label, sortOrder) {
  const id = stableUuid(`${VP_HANOI_SEED_TAG}:department:${code}`);
  await client.query(
    `INSERT INTO public.departments (
       id, company_id, tenant_id, name, code, description, sort_order, status, updated_at
     ) VALUES ($1::uuid, $2, $3, $4, $5, $6, $7, 'active', NOW())
     ON CONFLICT (id) DO UPDATE SET
       name = EXCLUDED.name,
       code = EXCLUDED.code,
       tenant_id = EXCLUDED.tenant_id,
       sort_order = EXCLUDED.sort_order,
       status = 'active',
       updated_at = NOW()`,
    [id, COMPANY_ID, TENANT_ID, label, code, `seed_tag=${VP_HANOI_SEED_TAG}`, sortOrder],
  );
  return id;
}

async function main() {
  loadDeployEnv();
  const payrollRows = loadJson('01-employees-payroll.json');
  const { deptLabelToCode, jobLabelToCode } = buildCatalogMaps(payrollRows);

  let excelAttendance = new Map();
  try {
    const xlsxPath = process.env.VP_HANOI_XLSX || DEFAULT_XLSX;
    const wb = XLSX.readFile(xlsxPath);
    excelAttendance = parseAttendanceFromExcel(wb);
  } catch {
    console.warn('Excel attendance not loaded — using payroll JSON aggregates only');
  }

  const client = createHrmClient();
  await client.connect();

  const sheetId = stableUuid(`${VP_HANOI_SEED_TAG}:attendance-sheet:2026-05`);
  let deptCatalogCount = 0;
  let jobCatalogCount = 0;
  let employeesLinked = 0;
  let timesheetLines = 0;

  try {
    await ensureSchemas(client);
    await client.query('BEGIN');

    const deptEntries = [...deptLabelToCode.entries()].sort((a, b) => a[0].localeCompare(b[0], 'vi'));
    for (let i = 0; i < deptEntries.length; i++) {
      const [label, code] = deptEntries[i];
      await upsertCatalogItem(client, 'departments', code, label);
      await upsertDepartmentRow(client, code, label, (i + 1) * 10);
      deptCatalogCount++;
    }

    const jobEntries = [...jobLabelToCode.entries()].sort((a, b) => a[0].localeCompare(b[0], 'vi'));
    for (const [label, code] of jobEntries) {
      await upsertCatalogItem(client, 'job_titles', code, label);
      jobCatalogCount++;
    }

    for (const row of payrollRows) {
      const code = row.employee_code.toUpperCase();
      const deptLabel = normalizeDepartmentLabel(row.department);
      const jobLabel = normalizeJobTitleLabel(row.job_title);
      const deptCode = deptLabelToCode.get(deptLabel) ?? null;
      const jobCode = jobLabelToCode.get(jobLabel) ?? null;
      const deptId = deptCode
        ? stableUuid(`${VP_HANOI_SEED_TAG}:department:${deptCode}`)
        : null;

      const customPatch = {
        tenant_id: TENANT_ID,
        seed_tag: VP_HANOI_SEED_TAG,
        department_label: deptLabel || null,
        job_title_label: jobLabel || null,
        department_id: deptId,
        probation_end_at: row.probation_end_at || null,
        contract_type: row.contract_type || null,
        legal_entity: row.legal_entity || null,
        insurance_base_p1: row.income?.insurance_base_p1 ?? null,
        supplemental_income_p2: row.income?.supplemental_income_p2 ?? null,
        kpi_salary_p3: row.income?.kpi_salary_p3 ?? null,
        performance_bonus_p4: row.income?.performance_bonus_p4 ?? null,
      };
      if (deptCode) customPatch.department = deptCode;

      const res = await client.query(
        `UPDATE public.employees
         SET job_title_key = COALESCE($3, job_title_key),
             custom_fields = custom_fields || $4::jsonb,
             updated_at = NOW()
         WHERE company_id = $1 AND employee_code = $2
           AND custom_fields->>'seed_tag' = $5
         RETURNING id`,
        [
          COMPANY_ID,
          code,
          jobCode,
          JSON.stringify(customPatch),
          VP_HANOI_SEED_TAG,
        ],
      );
      if (res.rowCount > 0) employeesLinked++;
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
      const empCode = emp.employee_code.toUpperCase();
      const payrollRow = payrollRows.find((r) => r.employee_code.toUpperCase() === empCode);
      const att =
        excelAttendance.get(empCode) ??
        (payrollRow ? attendanceFromPayrollRow(payrollRow) : null);
      if (!att) continue;

      const lineId = stableUuid(`${VP_HANOI_SEED_TAG}:timesheet-line:${sheetId}:${empCode}`);
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

    const deptCounts = await client.query(
      `SELECT custom_fields->>'department' AS dept_code, COUNT(*)::int AS c
       FROM employees WHERE custom_fields->>'seed_tag' = $1
       GROUP BY 1 ORDER BY 1`,
      [VP_HANOI_SEED_TAG],
    );

    await client.query('COMMIT');

    console.log(
      JSON.stringify(
        {
          success: true,
          seed_tag: VP_HANOI_SEED_TAG,
          tenant_id: TENANT_ID,
          company_id: COMPANY_ID,
          departments_catalog: deptCatalogCount,
          job_titles_catalog: jobCatalogCount,
          employees_linked: employeesLinked,
          attendance_sheet_id: sheetId,
          timesheet_lines: timesheetLines,
          employees_by_dept_code: deptCounts.rows,
          sample_dept_codes: deptEntries.slice(0, 3).map(([label, code]) => ({ label, code })),
          sample_job_codes: jobEntries.slice(0, 3).map(([label, code]) => ({ label, code })),
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

main().catch((err) => {
  console.error(JSON.stringify({ success: false, error: err.message, stack: err.stack }, null, 2));
  process.exit(1);
});
