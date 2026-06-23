#!/usr/bin/env node
/**
 * HRM menu data density gate — fails if satellite tables are far below employee count.
 * work_item_id: HRM-FIDELITY-QA / G-FID-07
 */
import pg from 'pg';
import { loadDeployEnv } from './seed-env-loader.mjs';
import { companyPayslipStats } from './seed-hrm-payslip-density.mjs';
import { companyCatalogStats } from './seed-hrm-catalog-density.mjs';
import { recruitmentFidelityStats } from './seed-hrm-recruitment-density.mjs';
import { metadataFidelityStats } from './seed-hrm-metadata-density.mjs';
import { performanceFidelityStats } from './seed-hrm-performance-density.mjs';
import { operationsFidelityStats } from './seed-hrm-operations-density.mjs';
import { UAT_COMPANIES } from './lib/uat-workforce.mjs';

loadDeployEnv();

const { Client } = pg;

const MIN_CONTRACT_RATIO = Number(process.env.HRM_FIDELITY_MIN_CONTRACT_RATIO ?? 0.85);
const MIN_INSURANCE_RATIO = Number(process.env.HRM_FIDELITY_MIN_INSURANCE_RATIO ?? 0.85);
const MIN_ATTENDANCE_PER_ACTIVE = Number(process.env.HRM_FIDELITY_MIN_ATTENDANCE_PER_ACTIVE ?? 0.02);
const MIN_PAYROLL_PERIODS = Number(process.env.HRM_FIDELITY_MIN_PAYROLL_PERIODS ?? 10);
const MIN_PAYSLIP_CLOSED_RATIO = Number(
  process.env.HRM_FIDELITY_PER_COMPANY_PAYSLIP_RATIO ?? 0.9,
);
const MIN_REQUISITIONS = Number(process.env.HRM_FIDELITY_MIN_REQUISITIONS ?? 5);
const MIN_CANDIDATES = Number(process.env.HRM_FIDELITY_GROUP_CANDIDATES_MIN ?? 15);
const MIN_CANDIDATES_PER_REQUISITION = Number(
  process.env.HRM_FIDELITY_MIN_CANDIDATES_PER_REQUISITION ?? 3,
);
const MIN_CATALOG_KEYS = Number(process.env.HRM_FIDELITY_MIN_CATALOG_KEYS ?? 8);
const MIN_METADATA_CHANGE_REQUESTS = Number(process.env.HRM_FIDELITY_GROUP_METADATA_MIN ?? 20);
const MIN_GROUP_TASKS = Number(process.env.HRM_FIDELITY_GROUP_TASKS_MIN ?? 25);
const MIN_GROUP_SERVICE_REQUESTS = Number(
  process.env.HRM_FIDELITY_GROUP_SERVICE_REQUESTS_MIN ?? 50,
);
const MIN_PERF_CYCLES = Number(process.env.HRM_FIDELITY_GROUP_PERF_CYCLES_MIN ?? 5);
const MIN_PERF_EVALUATIONS = Number(process.env.HRM_FIDELITY_GROUP_PERF_EVALS_MIN ?? 300);

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
  const recruitment = await recruitmentFidelityStats(client);
  const operations = await operationsFidelityStats(client);
  const leave = (await count(client, 'leave_requests')) ?? 0;
  const metadata = await metadataFidelityStats(client);
  const performance = await performanceFidelityStats(client);

  const payslipRatios = [];
  let payslipRatioPass = true;
  for (const slug of UAT_COMPANIES) {
    const stats = await companyPayslipStats(client, slug);
    const ok =
      !stats.no_closed_period && stats.ratio >= MIN_PAYSLIP_CLOSED_RATIO - 1e-6;
    if (!ok) payslipRatioPass = false;
    payslipRatios.push(
      `${slug}=${stats.ratio.toFixed(3)}@${stats.period_end ?? 'none'}`,
    );
  }

  const catalogKeyCounts = [];
  let catalogFidelityPass = true;
  for (const slug of UAT_COMPANIES) {
    const stats = await companyCatalogStats(client, slug);
    if (!stats.ok) catalogFidelityPass = false;
    catalogKeyCounts.push(`${slug}=${stats.distinct_keys}`);
  }

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
      id: 'payroll-fidelity',
      ok: payrollPeriods >= MIN_PAYROLL_PERIODS && payslipRatioPass,
      msg: `payroll_periods=${payrollPeriods} need>=${MIN_PAYROLL_PERIODS}; payslip_closed_ratio need>=${MIN_PAYSLIP_CLOSED_RATIO} (${payslipRatios.join(', ')})`,
    },
    {
      id: 'recruitment-pipeline',
      ok: recruitment.pass,
      msg: `requisitions=${recruitment.requisitions} candidates=${recruitment.candidates} avg=${recruitment.avg.toFixed(3)} under_min_cand_req=${recruitment.requisitions_under_min_cand} need req>=${MIN_REQUISITIONS} cand>=${MIN_CANDIDATES} avg>=${MIN_CANDIDATES_PER_REQUISITION}`,
    },
    {
      id: 'leave-requests',
      ok: leave >= MIN_REQUISITIONS,
      msg: `leave_requests=${leave} need>=${MIN_REQUISITIONS}`,
    },
    {
      id: 'catalog-fidelity',
      ok: catalogFidelityPass,
      msg: `synced_catalog_keys need>=${MIN_CATALOG_KEYS}/company (${catalogKeyCounts.join(', ')})`,
    },
    {
      id: 'metadata-fidelity',
      ok: metadata.pass,
      msg: `metadata_change_requests linked=${metadata.total} pending=${metadata.pending} historical=${metadata.historical} need total>=${MIN_METADATA_CHANGE_REQUESTS}`,
    },
    {
      id: 'operations-fidelity',
      ok: operations.pass,
      msg: `hrm_tasks=${operations.tasks} service_requests=${operations.service_requests} need tasks>=${MIN_GROUP_TASKS} service_requests>=${MIN_GROUP_SERVICE_REQUESTS}`,
    },
    {
      id: 'performance-fidelity',
      ok: performance.pass,
      msg: `performance_cycles=${performance.cycles} evaluations=${performance.evaluations} need cycles>=${MIN_PERF_CYCLES} evals>=${MIN_PERF_EVALUATIONS}`,
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
