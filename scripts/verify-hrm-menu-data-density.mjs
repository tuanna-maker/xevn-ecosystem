#!/usr/bin/env node
/**
 * HRM menu data density gate — fails if satellite tables are far below employee count.
 * work_item_id: HRM-FIDELITY-QA / G-FID-07
 */
import pg from 'pg';
import { loadDeployEnv } from './seed-env-loader.mjs';

loadDeployEnv();

const { Client } = pg;

const MIN_CONTRACT_RATIO = Number(process.env.HRM_FIDELITY_MIN_CONTRACT_RATIO ?? 0.85);
const MIN_INSURANCE_RATIO = Number(process.env.HRM_FIDELITY_MIN_INSURANCE_RATIO ?? 0.85);
const MIN_ATTENDANCE_PER_ACTIVE = Number(process.env.HRM_FIDELITY_MIN_ATTENDANCE_PER_ACTIVE ?? 0.02);
const MIN_PAYROLL_PERIODS = Number(process.env.HRM_FIDELITY_MIN_PAYROLL_PERIODS ?? 10);
const MIN_REQUISITIONS = Number(process.env.HRM_FIDELITY_MIN_REQUISITIONS ?? 5);

async function count(client, table) {
  try {
    const r = await client.query(`SELECT COUNT(*)::int AS c FROM public.${table}`);
    return r.rows[0].c;
  } catch {
    return null;
  }
}

async function main() {
  const client = new Client({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.HRM_DB_NAME || 'xevn_hrm',
    ssl: false,
  });
  await client.connect();

  const employees = (await count(client, 'employees')) ?? 0;
  const active =
    (
      await client.query(
        `SELECT COUNT(*)::int AS c FROM public.employees WHERE status = 'active' OR status IS NULL`,
      )
    ).rows[0].c ?? employees;

  const contracts = (await count(client, 'employee_contracts')) ?? 0;
  const insurance = (await count(client, 'employee_insurance_records')) ?? 0;
  const attendance = (await count(client, 'attendance_records')) ?? 0;
  const payrollPeriods = (await count(client, 'payroll_periods')) ?? 0;
  const requisitions = (await count(client, 'job_requisitions')) ?? 0;
  const candidates = (await count(client, 'recruitment_candidates')) ?? 0;
  const leave = (await count(client, 'leave_requests')) ?? 0;

  const checks = [
    {
      id: 'employees',
      ok: employees >= 1000,
      msg: `employees=${employees} (need >=1000)`,
    },
    {
      id: 'contracts-ratio',
      ok: active === 0 || contracts / active >= MIN_CONTRACT_RATIO,
      msg: `contracts=${contracts} active=${active} ratio=${active ? (contracts / active).toFixed(3) : 'n/a'} need>=${MIN_CONTRACT_RATIO}`,
    },
    {
      id: 'insurance-ratio',
      ok: active === 0 || insurance / active >= MIN_INSURANCE_RATIO,
      msg: `insurance=${insurance} ratio need>=${MIN_INSURANCE_RATIO}`,
    },
    {
      id: 'attendance-scale',
      ok: attendance >= Math.floor(active * MIN_ATTENDANCE_PER_ACTIVE),
      msg: `attendance=${attendance} need>=${Math.floor(active * MIN_ATTENDANCE_PER_ACTIVE)}`,
    },
    {
      id: 'payroll-periods',
      ok: payrollPeriods >= MIN_PAYROLL_PERIODS,
      msg: `payroll_periods=${payrollPeriods} need>=${MIN_PAYROLL_PERIODS}`,
    },
    {
      id: 'recruitment-pipeline',
      ok: requisitions >= MIN_REQUISITIONS && candidates >= MIN_REQUISITIONS,
      msg: `requisitions=${requisitions} candidates=${candidates} need>=${MIN_REQUISITIONS}`,
    },
    {
      id: 'leave-requests',
      ok: leave >= MIN_REQUISITIONS,
      msg: `leave_requests=${leave} need>=${MIN_REQUISITIONS}`,
    },
  ];

  let fails = 0;
  console.log('verify-hrm-menu-data-density — xevn_hrm\n');
  for (const c of checks) {
    const mark = c.ok ? 'PASS' : 'FAIL';
    if (!c.ok) fails += 1;
    console.log(`${mark}  ${c.id}  ${c.msg}`);
  }
  console.log(`\n=== Summary: ${checks.length - fails}/${checks.length} PASS ===`);
  await client.end();
  process.exit(fails > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
