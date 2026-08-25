#!/usr/bin/env node
import { loadDeployEnv } from '../seed-env-loader.mjs';
import { createHrmClient } from '../lib/uat-db.mjs';

loadDeployEnv();
const client = createHrmClient();
await client.connect();

const periodId = 'a4e896b6-6b22-4c0f-80e3-0acda5ee2810';
const empId = 'f7218e5b-0af2-45a3-82b6-08f8cdff496f';

const binds = await client.query(
  `SELECT pb.timesheet_header_id::text, th.status
   FROM pay_period_timesheet_bind pb
   JOIN attendance_sheets th ON th.id = pb.timesheet_header_id
   WHERE pb.payroll_period_id = $1::uuid AND pb.archived_at IS NULL`,
  [periodId],
);
console.log('binds:', binds.rows);

for (const b of binds.rows) {
  const line = await client.query(
    `SELECT id::text, line_locked, payable_hours, standard_hours, ot_hours_weighted
     FROM att_timesheet_line
     WHERE header_id = $1::uuid AND employee_id = $2::uuid AND archived_at IS NULL`,
    [b.timesheet_header_id, empId],
  );
  console.log(`lines for sheet ${b.timesheet_header_id}:`, line.rows);
}

await client.end();
