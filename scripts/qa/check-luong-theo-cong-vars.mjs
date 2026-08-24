#!/usr/bin/env node
import { loadDeployEnv } from '../seed-env-loader.mjs';
import { createHrmClient } from '../lib/uat-db.mjs';

loadDeployEnv();
const c = createHrmClient();
await c.connect();

const periodId = (
  await c.query(
    `SELECT id::text FROM public.payroll_periods WHERE company_id='main' ORDER BY start_date DESC LIMIT 1`,
  )
).rows[0].id;

for (const code of ['XE00236', 'XE00250']) {
  const emp = (await c.query(`SELECT id::text FROM public.employees WHERE employee_code=$1`, [code])).rows[0];
  const att = await c.query(
    `SELECT tl.payable_hours, tl.standard_hours, tl.line_locked, th.status, th.id::text AS sheet_id
     FROM public.att_timesheet_line tl
     JOIN public.attendance_sheets th ON th.id = tl.header_id
     WHERE tl.employee_id = $1::uuid AND th.start_date = '2026-05-01'`,
    [emp.id],
  );
  const cb = await c.query(
    `SELECT p.id::text, l.line_type, l.component_code, l.allowance_code, l.amount
     FROM public.employee_compensation_packages p
     JOIN public.employee_compensation_lines l ON l.package_id = p.id
     WHERE p.employee_id = $1::uuid
     ORDER BY p.effective_from DESC, l.line_type
     LIMIT 10`,
    [emp.id],
  );
  console.log(code, { att: att.rows, cb_lines: cb.rows });
}

await c.end();
