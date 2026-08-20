import { config } from 'dotenv';
import pg from 'pg';
import { resolve } from 'node:path';

config({ path: resolve('deploy/xevn-ecosystem/.env') });
const c = new pg.Client({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: 'xevn_hrm',
});
await c.connect();
const emp = '0f6e1369-4170-42e3-ad6b-3d04b3ec2edd';
const r1 = await c.query('SELECT company_id FROM employees WHERE id=$1', [emp]);
const r2 = await c.query(
  `SELECT id, company_id, overtime_request_id, credited_days::text, balance_year
   FROM att_ot_comp_accrual_ledger WHERE employee_id=$1 ORDER BY created_at DESC LIMIT 5`,
  [emp],
);
const r3 = await c.query(
  `SELECT company_id, leave_type, balance_year, entitled_days::text
   FROM employee_leave_balances WHERE employee_id=$1`,
  [emp],
);
const r5 = await c.query(
  `SELECT id, employee_id, status, total_hours::text, company_id
   FROM overtime_requests WHERE employee_id=$1 AND status='approved'
   ORDER BY updated_at DESC LIMIT 3`,
  [emp],
);
const emp2 = '2b4cbc90-fb74-4a2d-9fef-d188d4e48d61';
const r7 = await c.query(
  `SELECT company_id, leave_type, balance_year, entitled_days::text
   FROM employee_leave_balances WHERE employee_id=$1 AND lower(leave_type)='compensatory'`,
  [emp2],
);
const r6 = await c.query(
  `SELECT id, employee_id, company_id, credited_days::text, overtime_request_id
   FROM att_ot_comp_accrual_ledger WHERE id=$1`,
  ['f3282edd-9fce-45b6-abc3-636eee6f5da9'],
);
console.log(
  JSON.stringify(
    {
      employee: r1.rows,
      ledgers: r2.rows,
      balances: r3.rows,
      ot_approved: r5.rows,
      qa_ledger: r6.rows,
      emp2_comp_balance: r7.rows,
    },
    null,
    2,
  ),
);
await c.end();
