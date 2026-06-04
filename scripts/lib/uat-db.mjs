import pg from 'pg';
import {
  UAT_COMPANIES,
  UAT_EMPLOYEE_COUNT,
  UAT_ROLES,
  UAT_SEED_TAG,
} from './uat-workforce.mjs';

const { Client, Pool } = pg;

export function hrmDbConfig() {
  if (!process.env.DB_HOST || !process.env.DB_PASSWORD) {
    throw new Error('Missing DB_HOST / DB_PASSWORD — load deploy env first');
  }
  return {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT ?? 5432),
    user: process.env.DB_USER ?? 'postgres',
    password: process.env.DB_PASSWORD,
    database: process.env.HRM_DB_NAME ?? 'xevn_hrm',
    ssl: false,
  };
}

export function createHrmClient() {
  return new Client(hrmDbConfig());
}

export function createHrmPool() {
  return new Pool(hrmDbConfig());
}

export async function verifyUatWorkforceInDb(client) {
  const countRes = await client.query(
    `SELECT COUNT(*)::int AS c FROM public.employees WHERE custom_fields->>'uat_seed' = $1`,
    [UAT_SEED_TAG],
  );
  const activeRes = await client.query(
    `SELECT COUNT(*)::int AS c FROM public.employees
     WHERE custom_fields->>'uat_seed' = $1 AND status = 'active' AND archived_at IS NULL`,
    [UAT_SEED_TAG],
  );
  const roleRes = await client.query(
    `SELECT COUNT(DISTINCT job_title_key)::int AS role_count
     FROM public.employees WHERE custom_fields->>'uat_seed' = $1 AND status = 'active'`,
    [UAT_SEED_TAG],
  );
  const tenantRes = await client.query(
    `SELECT COUNT(*)::int AS c FROM public.employees
     WHERE custom_fields->>'uat_seed' = $1
       AND COALESCE(custom_fields->>'tenant_id', '') <> ''
       AND COALESCE(custom_fields->>'mobile_password_hash', '') <> ''`,
    [UAT_SEED_TAG],
  );
  const byCompany = await client.query(
    `SELECT company_id, COUNT(*)::int AS total
     FROM public.employees WHERE custom_fields->>'uat_seed' = $1
     GROUP BY company_id ORDER BY company_id`,
    [UAT_SEED_TAG],
  );

  return {
    total: countRes.rows[0]?.c ?? 0,
    active: activeRes.rows[0]?.c ?? 0,
    distinct_roles: roleRes.rows[0]?.role_count ?? 0,
    with_tenant_and_password: tenantRes.rows[0]?.c ?? 0,
    by_company: byCompany.rows,
    expected_total: UAT_EMPLOYEE_COUNT,
    expected_roles: UAT_ROLES.length,
    expected_companies: UAT_COMPANIES.length,
  };
}

export async function findUatEmployeeBySeq(client, seq) {
  const { buildUatEmployee } = await import('./uat-workforce.mjs');
  const code = buildUatEmployee(seq - 1, 'unused').employee_code;
  const res = await client.query(
    `SELECT id, email, employee_code, company_id, job_title_key, status, custom_fields
     FROM public.employees WHERE employee_code = $1 LIMIT 1`,
    [code],
  );
  return res.rows[0] ?? null;
}

export async function countLeaveRequestsForEmployee(client, employeeId) {
  const res = await client.query(
    `SELECT COUNT(*)::int AS c FROM public.leave_requests WHERE employee_id = $1::uuid`,
    [employeeId],
  );
  return res.rows[0]?.c ?? 0;
}

export async function countAttendanceRecordsForEmployee(client, employeeId, date) {
  const res = await client.query(
    `SELECT COUNT(*)::int AS c FROM public.attendance_records
     WHERE employee_id = $1::uuid AND attendance_date = $2::date`,
    [employeeId, date],
  );
  return res.rows[0]?.c ?? 0;
}
