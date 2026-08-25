#!/usr/bin/env node
import { loadDeployEnv } from '../seed-env-loader.mjs';
import { createHrmClient } from '../lib/uat-db.mjs';

loadDeployEnv();
const client = createHrmClient();
await client.connect();

const periodId = 'a4e896b6-6b22-4c0f-80e3-0acda5ee2810';

const payslips = await client.query(
  `SELECT ps.id::text, ps.employee_id::text, e.employee_code, e.full_name, ps.gross_amount
   FROM payroll_payslips ps JOIN employees e ON e.id = ps.employee_id
   WHERE ps.period_id = $1::uuid ORDER BY e.employee_code`,
  [periodId],
);

for (const ps of payslips.rows) {
  const lines = await client.query(
    `SELECT component_code, amount, source_tier, source_ref, sort_order
     FROM payroll_payslip_lines WHERE payslip_id = $1::uuid
     ORDER BY sort_order, component_code`,
    [ps.id],
  );
  console.log(`\n=== ${ps.employee_code} ${ps.full_name} gross=${ps.gross_amount} lines=${lines.rowCount} ===`);
  for (const l of lines.rows) {
    console.log(`  ${String(l.sort_order ?? '').padStart(2)} ${l.component_code.padEnd(18)} ${Number(l.amount).toLocaleString('vi-VN').padStart(16)}  ${l.source_tier}`);
  }

  const inputs = await client.query(
    `SELECT component_code, amount FROM pay_period_input_lines
     WHERE period_id=$1::uuid AND employee_id=$2::uuid
       AND component_code IN ('LUONG_CO_BAN','LUONG_THEO_CONG','LUONG_KPI')
     ORDER BY component_code`,
    [periodId, ps.employee_id],
  );
  console.log('  period_input:', inputs.rows);

  const cb = await client.query(
    `SELECT l.line_type, l.amount::text, l.allowance_code
     FROM employee_compensation_packages p
     JOIN employee_compensation_lines l ON l.package_id = p.id
     WHERE p.employee_id = $1::uuid
     ORDER BY l.line_type`,
    [ps.employee_id],
  );
  console.log('  emp_cb:', cb.rows);
}

await client.end();
