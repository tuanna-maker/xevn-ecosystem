#!/usr/bin/env node
import { loadDeployEnv } from '../seed-env-loader.mjs';
import { createHrmClient } from '../lib/uat-db.mjs';

loadDeployEnv();
const c = createHrmClient();
await c.connect();

const emp = await c.query(
  `SELECT id::text, employee_code FROM public.employees WHERE employee_code IN ('XE00250','XE00236')`,
);

for (const row of emp.rows) {
  const att = await c.query(
    `SELECT tl.id::text, tl.standard_hours, tl.ot_hours_weighted, th.status, th.start_date::text, th.end_date::text
     FROM public.att_timesheet_line tl
     JOIN public.attendance_sheets th ON th.id = tl.header_id
     WHERE tl.employee_id = $1::uuid
     ORDER BY th.start_date DESC
     LIMIT 3`,
    [row.id],
  );
  const inputs = await c.query(
    `SELECT component_code, amount FROM public.pay_period_input_lines
     WHERE employee_id = $1::uuid AND period_id = (
       SELECT id FROM public.payroll_periods WHERE company_id='main' ORDER BY start_date DESC LIMIT 1
     ) AND archived_at IS NULL
     ORDER BY component_code LIMIT 10`,
    [row.id],
  );
  console.log(row.employee_code, { att: att.rows, inputs: inputs.rows });
}

await c.end();
