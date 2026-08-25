#!/usr/bin/env node
import { loadDeployEnv } from '../seed-env-loader.mjs';
import { createHrmClient } from '../lib/uat-db.mjs';
loadDeployEnv();
const c = createHrmClient();
await c.connect();
const r = await c.query(
  `SELECT e.employee_code, th.id::text AS sheet_id, tl.payable_hours::text, tl.standard_hours::text
   FROM pay_period_timesheet_bind pb
   JOIN attendance_sheets th ON th.id = pb.timesheet_header_id
   JOIN att_timesheet_line tl ON tl.header_id = th.id
   JOIN employees e ON e.id = tl.employee_id
   WHERE pb.payroll_period_id = 'a4e896b6-6b22-4c0f-80e3-0acda5ee2810'
     AND pb.archived_at IS NULL
     AND e.employee_code IN ('XE00250','XE00236')
   ORDER BY e.employee_code, th.id`,
);
console.log(JSON.stringify(r.rows, null, 2));
await c.end();
