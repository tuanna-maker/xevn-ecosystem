#!/usr/bin/env node
import { loadDeployEnv } from '../seed-env-loader.mjs';
import { createHrmClient } from '../lib/uat-db.mjs';

loadDeployEnv();
const c = createHrmClient();
await c.connect();

const periodId = 'a4e896b6-6b22-4c0f-80e3-0acda5ee2810';

const payslips = await c.query(
  `SELECT e.employee_code, ps.id::text, ps.status, ps.gross_amount::text,
          (SELECT COUNT(*)::int FROM payroll_payslip_lines pl WHERE pl.payslip_id = ps.id) AS line_count
   FROM payroll_payslips ps
   JOIN employees e ON e.id = ps.employee_id
   WHERE ps.period_id = $1::uuid
   ORDER BY e.employee_code`,
  [periodId],
);
console.log('payslips:', payslips.rows);

const period = await c.query(
  `SELECT status, processed_at::text FROM payroll_periods WHERE id = $1::uuid`,
  [periodId],
);
console.log('period:', period.rows[0]);

await c.end();
