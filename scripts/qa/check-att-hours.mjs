#!/usr/bin/env node
/** Debug: simulate SRC resolve for LUONG_THEO_CONG */
import { loadDeployEnv } from '../seed-env-loader.mjs';
import { createHrmClient } from '../lib/uat-db.mjs';

loadDeployEnv();
const client = createHrmClient();
await client.connect();

const periodId = 'a4e896b6-6b22-4c0f-80e3-0acda5ee2810';
const empId = 'f7218e5b-0af2-45a3-82b6-08f8cdff496f';
const formulaId = '043aa919-eb2b-4e30-81dd-205285664604';

const formula = await client.query(
  `SELECT id::text, company_id, status FROM pay_formula_definitions WHERE id=$1::uuid`,
  [formulaId],
);
console.log('formula row:', formula.rows[0]);

const att = await client.query(
  `SELECT th.id::text AS sheet_id, th.status, tl.id::text AS line_id,
          tl.payable_hours, tl.standard_hours, tl.ot_hours_weighted
   FROM pay_period_timesheet_bind pb
   JOIN timesheet_headers th ON th.id = pb.timesheet_header_id
   LEFT JOIN timesheet_lines tl ON tl.header_id = th.id AND tl.employee_id = $2::uuid
   WHERE pb.payroll_period_id = $1::uuid AND pb.archived_at IS NULL`,
  [periodId, empId],
);
console.log('timesheet binds/lines:', att.rows);

const cb = await client.query(
  `SELECT l.line_type, l.amount, l.allowance_code
   FROM employee_compensation_packages p
   JOIN employee_compensation_lines l ON l.package_id = p.id
   WHERE p.employee_id = $1::uuid AND p.status = 'active'
   ORDER BY l.line_type`,
  [empId],
);
console.log('comp lines:', cb.rows);

await client.end();
