#!/usr/bin/env node
import { loadDeployEnv } from '../seed-env-loader.mjs';
import { createHrmClient } from '../lib/uat-db.mjs';
import { VP_SHEET_COLUMN_ORDER } from '../lib/vp-hanoi-payroll-config.mjs';

loadDeployEnv();
const client = createHrmClient();
await client.connect();

const periodId = 'a4e896b6-6b22-4c0f-80e3-0acda5ee2810';
const empCode = process.argv[2] ?? 'XE00250';

const emp = await client.query(
  `SELECT id::text FROM employees WHERE employee_code = $1`,
  [empCode],
);
const empId = emp.rows[0]?.id;
if (!empId) {
  console.log('no employee');
  process.exit(1);
}

const inputs = await client.query(
  `SELECT component_code, amount::text FROM pay_period_input_lines
   WHERE period_id = $1::uuid AND employee_id = $2::uuid
   ORDER BY component_code`,
  [periodId, empId],
);
const byCode = new Map(inputs.rows.map((r) => [r.component_code, Number(r.amount)]));
let incomeSum = 0;
let deductSum = 0;
console.log(`Period inputs for ${empCode}:`);
for (const code of VP_SHEET_COLUMN_ORDER) {
  const amt = byCode.get(code);
  if (amt == null || amt === 0) continue;
  const sign = code.startsWith('KHAU') || code.startsWith('THUE') || code.startsWith('UNG') || code.startsWith('TAM') || code === 'TRUY_THU' ? 'ded' : 'earn';
  console.log(`  ${code.padEnd(18)} ${amt.toLocaleString('vi-VN')}`);
  if (sign === 'earn') incomeSum += amt;
  else deductSum += amt;
}
console.log('  income sum:', incomeSum.toLocaleString('vi-VN'));
console.log('  deduct sum:', deductSum.toLocaleString('vi-VN'));

const cb = await client.query(
  `SELECT l.line_type, l.amount::text, l.allowance_code
   FROM employee_compensation_packages p
   JOIN employee_compensation_lines l ON l.package_id = p.id
   WHERE p.employee_id = $1::uuid`,
  [empId],
);
console.log('emp_cb:', cb.rows);

const att = await client.query(
  `SELECT tl.payable_hours::text, tl.standard_hours::text
   FROM att_timesheet_line tl
   JOIN pay_period_timesheet_bind pb ON pb.timesheet_header_id = tl.header_id AND pb.archived_at IS NULL
   WHERE pb.payroll_period_id = $1::uuid AND tl.employee_id = $2::uuid AND tl.archived_at IS NULL
   LIMIT 1`,
  [periodId, empId],
);
console.log('att:', att.rows[0]);

// Manual formula check
const base = Number(cb.rows.find((r) => r.line_type === 'base')?.amount ?? 0);
const p2 = Number(cb.rows.find((r) => r.line_type === 'allowance' && r.allowance_code === 'p2')?.amount ?? 0);
const ph = Number(att.rows[0]?.payable_hours ?? 0);
const sh = Number(att.rows[0]?.standard_hours ?? 0);
console.log('\nManual calc:');
console.log('  LUONG_CO_BAN formula (base+p2):', (base + p2).toLocaleString('vi-VN'));
console.log('  LUONG_THEO_CONG (base*ph/sh):', sh ? ((base * ph) / sh).toLocaleString('vi-VN') : 'n/a');
console.log('  period_input LUONG_CO_BAN:', byCode.get('LUONG_CO_BAN')?.toLocaleString('vi-VN') ?? '—');

await client.end();
