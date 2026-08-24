#!/usr/bin/env node
import { loadDeployEnv } from '../seed-env-loader.mjs';
import { createHrmClient } from '../lib/uat-db.mjs';

loadDeployEnv();
const c = createHrmClient();
await c.connect();

const periodId = 'a4e896b6-6b22-4c0f-80e3-0acda5ee2810';

const payslips = await c.query(
  `SELECT e.employee_code, e.full_name, ps.id::text, ps.status,
          ps.gross_amount::text, ps.deduction_amount::text, ps.net_amount::text,
          (SELECT COUNT(*)::int FROM pay_period_input_lines pil
           WHERE pil.period_id = ps.period_id AND pil.employee_id = ps.employee_id
             AND pil.archived_at IS NULL) AS input_count,
          (SELECT COUNT(*)::int FROM payroll_payslip_lines pl WHERE pl.payslip_id = ps.id) AS line_count
   FROM payroll_payslips ps
   JOIN employees e ON e.id = ps.employee_id
   WHERE ps.period_id = $1::uuid
   ORDER BY e.employee_code`,
  [periodId],
);
console.log('payslips:', payslips.rows);

for (const ps of payslips.rows) {
  const inputs = await c.query(
    `SELECT component_code, amount::text FROM pay_period_input_lines
     WHERE period_id = $1::uuid
       AND employee_id = (SELECT id FROM employees WHERE employee_code = $2)
       AND archived_at IS NULL
     ORDER BY component_code`,
    [periodId, ps.employee_code],
  );
  console.log(`\n${ps.employee_code} period inputs (${inputs.rowCount}):`, inputs.rows);
}

const snap = await c.query(
  `SELECT jsonb_array_length(sheet_template_snapshot_json->'columns') AS col_count
   FROM payroll_periods WHERE id = $1::uuid`,
  [periodId],
);
console.log('\nsnapshot columns:', snap.rows[0]);

await c.end();
