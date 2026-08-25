#!/usr/bin/env node
/** Simulate LUONG_THEO_CONG amount for XE00250 */
import { loadDeployEnv } from '../seed-env-loader.mjs';
import { createHrmClient } from '../lib/uat-db.mjs';

loadDeployEnv();
const c = createHrmClient();
await c.connect();

const empId = (await c.query(`SELECT id::text FROM employees WHERE employee_code='XE00250'`)).rows[0].id;
const base = 5700000;
const p2 = 2900000;
const att = (await c.query(
  `SELECT payable_hours::float ph, standard_hours::float sh
   FROM att_timesheet_line tl
   JOIN pay_period_timesheet_bind pb ON pb.timesheet_header_id=tl.header_id AND pb.archived_at IS NULL
   WHERE pb.payroll_period_id='a4e896b6-6b22-4c0f-80e3-0acda5ee2810' AND tl.employee_id=$1::uuid LIMIT 1`,
  [empId],
)).rows[0];

const ph = att.ph;
const sh = att.sh;

console.log('C&B base (P1):', base.toLocaleString('vi-VN'));
console.log('C&B P2:', p2.toLocaleString('vi-VN'));
console.log('P1+P2 (LUONG_CO_BAN Excel):', (base + p2).toLocaleString('vi-VN'));
console.log(`Att: payable=${ph} standard=${sh}`);
console.log('LUONG_THEO_CONG (base*ph/sh):', Math.round((base * ph) / sh).toLocaleString('vi-VN'));
console.log('If standard_hours=8 (BUG):', Math.round((base * ph) / 8).toLocaleString('vi-VN'));
console.log('If standard_hours=40:', Math.round((base * ph) / 40).toLocaleString('vi-VN'));

const inputs = (await c.query(
  `SELECT component_code, amount::float FROM pay_period_input_lines
   WHERE period_id='a4e896b6-6b22-4c0f-80e3-0acda5ee2810' AND employee_id=$1::uuid
   AND component_code IN ('LUONG_CO_BAN','THUONG_P4','PC_XANG_XE','LUONG_DOANH_SO','LUONG_KHAC')`,
  [empId],
)).rows;
let sum = 0;
for (const r of inputs) {
  console.log(`period_input ${r.component_code}:`, r.amount.toLocaleString('vi-VN'));
  sum += r.amount;
}
sum += (base * ph) / sh; // LUONG_THEO_CONG formula
console.log('\nRough gross if LUONG_CO_BAN from input + LUONG_THEO_CONG formula:', Math.round(sum).toLocaleString('vi-VN'));

await c.end();
