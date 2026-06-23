#!/usr/bin/env node
/**
 * Supplement leave_requests until AC-FID-06 passes:
 *   group total >= 100 AND per-company max(5, ceil(N × 0.05)) linked to active employees.
 * work_item_id: P1-HRM-H16-AC-FID-06-LEAVE
 * Idempotent — stable UUID per employee+slot; safe to re-run.
 */
import pg from 'pg';
import { createHash } from 'node:crypto';
import { loadDeployEnv } from './seed-env-loader.mjs';
import { stableUuid } from './lib/stable-uuid.mjs';
import { UAT_COMPANIES, attendanceCompanyUuid, resolveMasterTenant } from './lib/uat-workforce.mjs';
import { HRM_LEAVE_TYPE_CODES } from './lib/hrm-catalog-lineage.mjs';

loadDeployEnv();

const { Client } = pg;

export const LEAVE_DENSITY_SEED_TAG =
  process.env.HRM_LEAVE_DENSITY_SEED_TAG ?? 'p1-hrm-h16-leave-density';
const GROUP_MIN_LEAVE = Number(process.env.HRM_FIDELITY_GROUP_LEAVE_MIN ?? 100);
const PER_COMPANY_LEAVE_RATIO = Number(process.env.HRM_FIDELITY_PER_COMPANY_LEAVE_RATIO ?? 0.05);
const PER_COMPANY_MIN_COUNT = Number(process.env.HRM_FIDELITY_PER_COMPANY_LEAVE_MIN ?? 5);
const BATCH_SIZE = Number(process.env.HRM_LEAVE_DENSITY_BATCH ?? 200);
const PER_COMPANY_TARGETS = (
  process.env.HRM_LEAVE_DENSITY_COMPANIES ?? UAT_COMPANIES.join(',')
)
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

const LEAVE_TYPES = HRM_LEAVE_TYPE_CODES.slice(0, 3);
const STATUSES = ['pending', 'approved', 'rejected'];

const required = ['DB_HOST', 'DB_PORT', 'DB_USER', 'DB_PASSWORD'];
for (const key of required) {
  if (!process.env[key]) throw new Error(`Missing required env: ${key}`);
}

const baseConfig = {
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.HRM_DB_NAME || 'xevn_hrm',
  ssl: false,
};

function hashByte(seed) {
  return createHash('sha256').update(seed).digest()[0];
}

function leaveRequestId(employeeId, slot) {
  return stableUuid(`${LEAVE_DENSITY_SEED_TAG}:leave:${employeeId}:${slot}`);
}

function perCompanyTarget(activeEmp) {
  return Math.max(PER_COMPANY_MIN_COUNT, Math.ceil(activeEmp * PER_COMPANY_LEAVE_RATIO));
}

function futureDateStr(offsetDays) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

async function ensureMetadataSchema(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS public.hrm_seed_metadata (
      seed_tag TEXT NOT NULL,
      entity_table TEXT NOT NULL,
      entity_id UUID NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (seed_tag, entity_table, entity_id)
    );
  `);
  await client.query(`
    CREATE TABLE IF NOT EXISTS public.hrm_seed_runs (
      seed_tag TEXT PRIMARY KEY,
      ran_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      metadata JSONB NOT NULL DEFAULT '{}'::jsonb
    );
  `);
}

async function trackMetaBatch(client, entityIds) {
  if (entityIds.length === 0) return;
  await client.query(
    `INSERT INTO public.hrm_seed_metadata (seed_tag, entity_table, entity_id)
     SELECT $1, 'leave_requests', unnest($2::uuid[])
     ON CONFLICT DO NOTHING`,
    [LEAVE_DENSITY_SEED_TAG, entityIds],
  );
}

async function countLeave(client) {
  const r = await client.query(`SELECT COUNT(*)::int AS c FROM public.leave_requests`);
  return r.rows[0].c;
}

/**
 * AC-FID-06 per company: leave rows linked to employees in slug.
 */
export async function companyLeaveStats(client, companySlug) {
  const activeR = await client.query(
    `
    SELECT COUNT(*)::int AS c
    FROM public.employees e
    WHERE (e.status = 'active' OR e.status IS NULL)
      AND e.company_id = $1
    `,
    [companySlug],
  );
  const leaveR = await client.query(
    `
    SELECT COUNT(*)::int AS c
    FROM public.leave_requests lr
    INNER JOIN public.employees e ON e.id = lr.employee_id
    WHERE e.company_id = $1
    `,
    [companySlug],
  );
  const active_emp = activeR.rows[0].c;
  const leave_count = leaveR.rows[0].c;
  const target = perCompanyTarget(active_emp);
  return { active_emp, leave_count, target };
}

async function loadActiveEmployees(client, companySlug) {
  const r = await client.query(
    `
    SELECT e.id, e.company_id, e.employee_code, e.full_name,
           e.custom_fields->>'department' AS department
    FROM public.employees e
    WHERE (e.status = 'active' OR e.status IS NULL)
      AND e.company_id = $1
    ORDER BY e.employee_code
    `,
    [companySlug],
  );
  return r.rows;
}

function buildLeaveRow(emp, companyUuid, slot) {
  const startOffset = 7 + (hashByte(`${emp.employee_code}:leave-start:${slot}`) % 60);
  const duration = 1 + (hashByte(`${emp.employee_code}:leave-dur:${slot}`) % 4);
  const startDate = futureDateStr(startOffset);
  const endD = new Date(`${startDate}T00:00:00.000Z`);
  endD.setUTCDate(endD.getUTCDate() + duration);
  const endDate = endD.toISOString().slice(0, 10);
  const status = STATUSES[hashByte(`${emp.employee_code}:leave-status:${slot}`) % STATUSES.length];
  const leaveType = LEAVE_TYPES[hashByte(`${emp.employee_code}:leave-type:${slot}`) % LEAVE_TYPES.length];

  return {
    id: leaveRequestId(emp.id, slot),
    company_id: companyUuid,
    employee_id: emp.id,
    leave_type: leaveType,
    start_date: startDate,
    end_date: endDate,
    reason: `seed:${LEAVE_DENSITY_SEED_TAG}`,
    status,
    employee_code: emp.employee_code,
    employee_name: emp.full_name,
    department: emp.department ?? null,
    total_days: duration + 1,
  };
}

function buildRowsForCompany(employees, companyUuid, need) {
  if (need <= 0 || employees.length === 0) return [];
  const rows = [];
  for (let i = 0; i < need; i += 1) {
    const emp = employees[i % employees.length];
    const slot = Math.floor(i / employees.length);
    rows.push(buildLeaveRow(emp, companyUuid, slot));
  }
  return rows;
}

async function insertLeaveBatch(client, rows) {
  if (rows.length === 0) return 0;
  let inserted = 0;

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const chunk = rows.slice(i, i + BATCH_SIZE);
    const ids = chunk.map((r) => r.id);
    const companyIds = chunk.map((r) => r.company_id);
    const employeeIds = chunk.map((r) => r.employee_id);
    const leaveTypes = chunk.map((r) => r.leave_type);
    const startDates = chunk.map((r) => r.start_date);
    const endDates = chunk.map((r) => r.end_date);
    const reasons = chunk.map((r) => r.reason);
    const statuses = chunk.map((r) => r.status);
    const employeeCodes = chunk.map((r) => r.employee_code);
    const employeeNames = chunk.map((r) => r.employee_name);
    const departments = chunk.map((r) => r.department);
    const totalDays = chunk.map((r) => r.total_days);

    await client.query(
      `
      INSERT INTO public.leave_requests (
        id, company_id, employee_id, leave_type, start_date, end_date, reason, status,
        employee_code, employee_name, department, total_days, requested_at
      )
      SELECT
        u.id,
        u.company_id::uuid,
        u.employee_id,
        u.leave_type,
        u.start_date::date,
        u.end_date::date,
        u.reason,
        u.status,
        u.employee_code,
        u.employee_name,
        u.department,
        u.total_days::numeric,
        NOW()
      FROM unnest(
        $1::uuid[],
        $2::text[],
        $3::uuid[],
        $4::text[],
        $5::text[],
        $6::text[],
        $7::text[],
        $8::text[],
        $9::text[],
        $10::text[],
        $11::text[],
        $12::numeric[]
      ) AS u(
        id, company_id, employee_id, leave_type, start_date, end_date, reason, status,
        employee_code, employee_name, department, total_days
      )
      ON CONFLICT (id) DO UPDATE SET
        status = EXCLUDED.status,
        reason = EXCLUDED.reason,
        start_date = EXCLUDED.start_date,
        end_date = EXCLUDED.end_date,
        leave_type = EXCLUDED.leave_type,
        employee_code = EXCLUDED.employee_code,
        employee_name = EXCLUDED.employee_name,
        department = EXCLUDED.department,
        total_days = EXCLUDED.total_days
      `,
      [
        ids,
        companyIds,
        employeeIds,
        leaveTypes,
        startDates,
        endDates,
        reasons,
        statuses,
        employeeCodes,
        employeeNames,
        departments,
        totalDays,
      ],
    );
    await trackMetaBatch(client, ids);
    inserted += chunk.length;
  }

  return inserted;
}

async function seedPerCompanyLeaveDensity(client, companies, tenantId) {
  let inserted = 0;
  const perCompany = [];

  for (const slug of companies) {
    const stats = await companyLeaveStats(client, slug);
    const employees = await loadActiveEmployees(client, slug);
    const companyUuid = attendanceCompanyUuid(tenantId, slug);
    const need = Math.max(0, stats.target - stats.leave_count);
    const rows = buildRowsForCompany(employees, companyUuid, need);
    const coInserted = await insertLeaveBatch(client, rows);
    inserted += coInserted;

    const after = await companyLeaveStats(client, slug);
    perCompany.push({
      company: slug,
      active_emp: after.active_emp,
      leave_count: after.leave_count,
      target: after.target,
      inserted: coInserted,
    });
  }

  return { inserted, per_company: perCompany };
}

async function seedGroupTopUp(client, companies, tenantId, groupMin) {
  let inserted = 0;
  let total = await countLeave(client);
  if (total >= groupMin) return { inserted, group_total: total };

  const employeesBySlug = new Map();
  for (const slug of companies) {
    employeesBySlug.set(slug, await loadActiveEmployees(client, slug));
  }

  let round = 0;
  while (total < groupMin && round < groupMin * 2) {
    const slug = companies[round % companies.length];
    const employees = employeesBySlug.get(slug) ?? [];
    if (employees.length === 0) {
      round += 1;
      continue;
    }
    const emp = employees[round % employees.length];
    const companyUuid = attendanceCompanyUuid(tenantId, slug);
    const slot = 100 + Math.floor(round / companies.length);
    const row = buildLeaveRow(emp, companyUuid, slot);
    const coInserted = await insertLeaveBatch(client, [row]);
    inserted += coInserted;
    total = await countLeave(client);
    round += 1;
  }

  return { inserted, group_total: total };
}

export async function seedLeaveDensity(client) {
  await ensureMetadataSchema(client);
  const tenantId = resolveMasterTenant();

  const perCompany = await seedPerCompanyLeaveDensity(client, PER_COMPANY_TARGETS, tenantId);
  const topUp = await seedGroupTopUp(client, PER_COMPANY_TARGETS, tenantId, GROUP_MIN_LEAVE);
  const leave = await countLeave(client);

  const perCompanyPass = (perCompany.per_company ?? []).every(
    (row) => row.leave_count >= row.target,
  );
  const groupPass = leave >= GROUP_MIN_LEAVE;

  return {
    leave,
    group_min_leave: GROUP_MIN_LEAVE,
    group_pass: groupPass,
    per_company_pass: perCompanyPass,
    ac_fid_06_pass: groupPass && perCompanyPass,
    per_company_leave_ratio: PER_COMPANY_LEAVE_RATIO,
    per_company_min_count: PER_COMPANY_MIN_COUNT,
    inserted: perCompany.inserted + topUp.inserted,
    per_company_inserted: perCompany.inserted,
    group_topup_inserted: topUp.inserted,
    per_company: perCompany.per_company,
  };
}

async function main() {
  const client = new Client(baseConfig);
  await client.connect();

  try {
    await client.query('BEGIN');
    const result = await seedLeaveDensity(client);

    await client.query(
      `INSERT INTO public.hrm_seed_runs (seed_tag, ran_at, metadata)
       VALUES ($1, NOW(), $2::jsonb)
       ON CONFLICT (seed_tag) DO UPDATE SET ran_at = NOW(), metadata = EXCLUDED.metadata`,
      [
        LEAVE_DENSITY_SEED_TAG,
        JSON.stringify({
          seed_tag: LEAVE_DENSITY_SEED_TAG,
          ...result,
          work_item_id: 'P1-HRM-H16-AC-FID-06-LEAVE',
        }),
      ],
    );

    await client.query('COMMIT');
    console.log(JSON.stringify({ success: true, ...result }, null, 2));

    if (!result.ac_fid_06_pass) {
      console.error(
        `AC-FID-06 FAIL: group=${result.leave} need>=${GROUP_MIN_LEAVE} or per-company CARD-LVE-01 not met`,
      );
      process.exit(1);
    }
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(JSON.stringify({ success: false, error: error.message }, null, 2));
  process.exit(1);
});
