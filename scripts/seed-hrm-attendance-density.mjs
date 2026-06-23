#!/usr/bin/env node
/**
 * Supplement attendance_records until AC-FID-05 passes:
 *   group total >= 12_000 OR per-company 80% active NV >= 15 record-days / rolling 30d.
 * work_item_id: P1-HRM-H15-AC-FID-05-ATT
 * Idempotent — stable UUID per employee+date; safe to re-run.
 */
import pg from 'pg';
import { createHash } from 'node:crypto';
import { loadDeployEnv } from './seed-env-loader.mjs';
import { stableUuid } from './lib/stable-uuid.mjs';
import { UAT_COMPANIES, attendanceCompanyUuid, resolveMasterTenant } from './lib/uat-workforce.mjs';

loadDeployEnv();

const { Client } = pg;

export const ATTENDANCE_DENSITY_SEED_TAG =
  process.env.HRM_ATTENDANCE_DENSITY_SEED_TAG ?? 'p1-hrm-h15-attendance-density';
const MIN_DAYS_ROLLING = Number(process.env.HRM_FIDELITY_ATTENDANCE_MIN_DAYS_MONTH ?? 15);
const PER_COMPANY_MIN_EMPLOYEE_RATIO = Number(
  process.env.HRM_FIDELITY_PER_COMPANY_ATTENDANCE_RATIO ?? 0.8,
);
const GROUP_MIN_RECORDS = Number(process.env.HRM_FIDELITY_GROUP_ATTENDANCE_MIN ?? 12000);
const ROLLING_DAYS = Number(process.env.HRM_FIDELITY_ATTENDANCE_ROLLING_DAYS ?? 30);
const BATCH_SIZE = Number(process.env.HRM_ATTENDANCE_DENSITY_BATCH ?? 400);
const PER_COMPANY_TARGETS = (
  process.env.HRM_ATTENDANCE_DENSITY_COMPANIES ?? UAT_COMPANIES.join(',')
)
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

const COMPANY_UUID_MAP = {
  holding: '10000000-0000-4000-8000-000000000001',
  trsport: '10000000-0000-4000-8000-000000000002',
  logistics: '10000000-0000-4000-8000-000000000003',
  finance: '10000000-0000-4000-8000-000000000004',
  services: '10000000-0000-4000-8000-000000000005',
};

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

function attendanceRecordId(employeeId, dateStr) {
  return stableUuid(`${ATTENDANCE_DENSITY_SEED_TAG}:attendance:${employeeId}:${dateStr}`);
}

function recentDateStr(offsetDays) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - offsetDays);
  return d.toISOString().slice(0, 10);
}

async function companyIdKind(client, table) {
  const r = await client.query(
    `SELECT data_type FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = $1 AND column_name = 'company_id'`,
    [table],
  );
  return r.rows[0]?.data_type === 'uuid' ? 'uuid' : 'text';
}

function slugFromCompanyId(companyId) {
  if (!companyId) return 'holding';
  const s = String(companyId);
  if (COMPANY_UUID_MAP[s]) return s;
  const hit = Object.entries(COMPANY_UUID_MAP).find(([, u]) => u === s);
  return hit?.[0] ?? (UAT_COMPANIES.includes(s) ? s : 'holding');
}

function resolveAttendanceCompanyId(emp, kind, tenantId) {
  const slug = slugFromCompanyId(emp.company_id);
  if (kind === 'uuid') {
    const cf = emp.custom_fields ?? {};
    if (cf.attendance_company_uuid) return cf.attendance_company_uuid;
    return attendanceCompanyUuid(tenantId, slug);
  }
  return slug;
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
     SELECT $1, 'attendance_records', unnest($2::uuid[])
     ON CONFLICT DO NOTHING`,
    [ATTENDANCE_DENSITY_SEED_TAG, entityIds],
  );
}

async function countAttendance(client) {
  const r = await client.query(`SELECT COUNT(*)::int AS c FROM public.attendance_records`);
  return r.rows[0].c;
}

/**
 * AC-FID-05 per company: share of active employees with >= MIN_DAYS in rolling window.
 */
export async function companyAttendanceStats(client, companySlug) {
  const r = await client.query(
    `
    WITH active AS (
      SELECT e.id
      FROM public.employees e
      WHERE (e.status = 'active' OR e.status IS NULL)
        AND e.company_id = $1
    ),
    per_emp AS (
      SELECT a.id AS employee_id,
             COUNT(DISTINCT ar.attendance_date)::int AS day_count
      FROM active a
      LEFT JOIN public.attendance_records ar
        ON ar.employee_id = a.id
       AND ar.attendance_date >= (CURRENT_DATE - $2::int)
       AND ar.attendance_date <= CURRENT_DATE
      GROUP BY a.id
    )
    SELECT COUNT(*)::int AS active_emp,
           COUNT(*) FILTER (WHERE day_count >= $3)::int AS emp_with_min_days,
           COALESCE(SUM(day_count), 0)::int AS record_days_in_window
    FROM per_emp
    `,
    [companySlug, ROLLING_DAYS, MIN_DAYS_ROLLING],
  );
  const { active_emp, emp_with_min_days, record_days_in_window } = r.rows[0];
  const ratio = active_emp ? emp_with_min_days / active_emp : 0;
  return { active_emp, emp_with_min_days, ratio, record_days_in_window };
}

async function loadActiveEmployees(client, companySlug) {
  const r = await client.query(
    `
    SELECT e.id, e.company_id, e.employee_code, e.custom_fields
    FROM public.employees e
    WHERE (e.status = 'active' OR e.status IS NULL)
      AND e.company_id = $1
    ORDER BY e.employee_code
    `,
    [companySlug],
  );
  return r.rows;
}

async function existingDayCounts(client, employeeIds) {
  if (employeeIds.length === 0) return new Map();
  const r = await client.query(
    `
    SELECT ar.employee_id::text AS employee_id,
           array_agg(DISTINCT ar.attendance_date::text) AS dates
    FROM public.attendance_records ar
    WHERE ar.employee_id = ANY($1::uuid[])
      AND ar.attendance_date >= (CURRENT_DATE - $2::int)
      AND ar.attendance_date <= CURRENT_DATE
    GROUP BY ar.employee_id
    `,
    [employeeIds, ROLLING_DAYS],
  );
  const map = new Map();
  for (const row of r.rows) {
    map.set(
      row.employee_id,
      new Set(row.dates.map((d) => String(d).slice(0, 10))),
    );
  }
  return map;
}

function dayOffsetsForEmployee(emp, need, existingDates) {
  const offsets = [];
  for (let i = 0; i < ROLLING_DAYS && offsets.length < need; i += 1) {
    const rank = (hashByte(`${emp.employee_code}:att:${i}`) % ROLLING_DAYS) + 1;
    const dateStr = recentDateStr(rank);
    if (existingDates.has(dateStr)) continue;
    if (offsets.some((o) => recentDateStr(o) === dateStr)) continue;
    offsets.push(rank);
  }
  for (let d = 1; offsets.length < need && d <= ROLLING_DAYS; d += 1) {
    const dateStr = recentDateStr(d);
    if (existingDates.has(dateStr)) continue;
    if (offsets.some((o) => recentDateStr(o) === dateStr)) continue;
    offsets.push(d);
  }
  return offsets;
}

function buildRowsForCompany(employees, attCompanyKind, tenantId, existingDayMap) {
  const targetCount = Math.ceil(employees.length * PER_COMPANY_MIN_EMPLOYEE_RATIO);
  const cohort = employees.slice(0, targetCount);
  const rows = [];

  for (const emp of cohort) {
    const existing = existingDayMap.get(emp.id) ?? new Set();
    const need = Math.max(0, MIN_DAYS_ROLLING - existing.size);
    if (need === 0) continue;

    const offsets = dayOffsetsForEmployee(emp, need, existing);
    const companyId = resolveAttendanceCompanyId(emp, attCompanyKind, tenantId);
    for (const offset of offsets) {
      const dateStr = recentDateStr(offset);
      if (existing.has(dateStr)) continue;
      existing.add(dateStr);
      rows.push({
        id: attendanceRecordId(emp.id, dateStr),
        company_id: companyId,
        employee_id: emp.id,
        attendance_date: dateStr,
        check_in_at: `${dateStr}T01:00:00.000Z`,
        check_out_at: `${dateStr}T10:00:00.000Z`,
      });
    }
  }

  return rows;
}

async function insertAttendanceBatch(client, rows) {
  if (rows.length === 0) return 0;
  let inserted = 0;
  const note = `seed:${ATTENDANCE_DENSITY_SEED_TAG}`;

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const chunk = rows.slice(i, i + BATCH_SIZE);
    const ids = chunk.map((r) => r.id);
    const companyIds = chunk.map((r) => r.company_id);
    const employeeIds = chunk.map((r) => r.employee_id);
    const dates = chunk.map((r) => r.attendance_date);
    const checkIns = chunk.map((r) => r.check_in_at);
    const checkOuts = chunk.map((r) => r.check_out_at);

    await client.query(
      `
      INSERT INTO public.attendance_records
        (id, company_id, employee_id, attendance_date, check_in_at, check_out_at, status, note, created_by)
      SELECT
        u.id,
        u.company_id,
        u.employee_id,
        u.attendance_date::date,
        u.check_in_at::timestamptz,
        u.check_out_at::timestamptz,
        'present',
        $7,
        $8
      FROM unnest(
        $1::uuid[],
        $2::text[],
        $3::uuid[],
        $4::text[],
        $5::text[],
        $6::text[]
      ) AS u(id, company_id, employee_id, attendance_date, check_in_at, check_out_at)
      ON CONFLICT (company_id, employee_id, attendance_date) DO UPDATE SET
        status = EXCLUDED.status,
        note = EXCLUDED.note,
        check_in_at = EXCLUDED.check_in_at,
        check_out_at = EXCLUDED.check_out_at,
        updated_at = NOW()
      `,
      [ids, companyIds, employeeIds, dates, checkIns, checkOuts, note, ATTENDANCE_DENSITY_SEED_TAG],
    );
    await trackMetaBatch(client, ids);
    inserted += chunk.length;
  }

  return inserted;
}

async function seedPerCompanyAttendanceDensity(client, companies, attCompanyKind, tenantId) {
  let inserted = 0;
  const perCompany = [];

  for (const slug of companies) {
    const employees = await loadActiveEmployees(client, slug);
    const existingDayMap = await existingDayCounts(
      client,
      employees.map((e) => e.id),
    );
    const rows = buildRowsForCompany(employees, attCompanyKind, tenantId, existingDayMap);
    const coInserted = await insertAttendanceBatch(client, rows);
    inserted += coInserted;

    const stats = await companyAttendanceStats(client, slug);
    perCompany.push({
      company: slug,
      active_emp: stats.active_emp,
      emp_with_min_days: stats.emp_with_min_days,
      employee_ratio: stats.ratio,
      target_employee_ratio: PER_COMPANY_MIN_EMPLOYEE_RATIO,
      record_days_in_window: stats.record_days_in_window,
      inserted: coInserted,
    });
  }

  return { inserted, per_company: perCompany };
}

export async function seedAttendanceDensity(client) {
  await ensureMetadataSchema(client);
  const attCompanyKind = await companyIdKind(client, 'attendance_records');
  const tenantId = resolveMasterTenant();

  const perCompany = await seedPerCompanyAttendanceDensity(
    client,
    PER_COMPANY_TARGETS,
    attCompanyKind,
    tenantId,
  );
  const attendance = await countAttendance(client);

  const groupPass = attendance >= GROUP_MIN_RECORDS;
  const perCompanyPass = (perCompany.per_company ?? []).every(
    (row) => row.employee_ratio >= PER_COMPANY_MIN_EMPLOYEE_RATIO - 1e-6,
  );

  return {
    attendance,
    group_min_records: GROUP_MIN_RECORDS,
    group_pass: groupPass,
    per_company_pass: perCompanyPass,
    ac_fid_05_pass: groupPass || perCompanyPass,
    min_days_rolling: MIN_DAYS_ROLLING,
    rolling_days: ROLLING_DAYS,
    per_company_min_employee_ratio: PER_COMPANY_MIN_EMPLOYEE_RATIO,
    inserted: perCompany.inserted,
    per_company: perCompany.per_company,
  };
}

async function main() {
  const client = new Client(baseConfig);
  await client.connect();

  try {
    await client.query('BEGIN');
    const result = await seedAttendanceDensity(client);

    await client.query(
      `INSERT INTO public.hrm_seed_runs (seed_tag, ran_at, metadata)
       VALUES ($1, NOW(), $2::jsonb)
       ON CONFLICT (seed_tag) DO UPDATE SET ran_at = NOW(), metadata = EXCLUDED.metadata`,
      [
        ATTENDANCE_DENSITY_SEED_TAG,
        JSON.stringify({
          seed_tag: ATTENDANCE_DENSITY_SEED_TAG,
          ...result,
          work_item_id: 'P1-HRM-H15-AC-FID-05-ATT',
        }),
      ],
    );

    await client.query('COMMIT');
    console.log(JSON.stringify({ success: true, ...result }, null, 2));

    if (!result.ac_fid_05_pass) {
      console.error(
        `AC-FID-05 FAIL: group=${result.attendance} need>=${GROUP_MIN_RECORDS} and per-company 80% x ${MIN_DAYS_ROLLING}d not met`,
      );
      process.exit(1);
    }

    for (const row of result.per_company ?? []) {
      if (row.employee_ratio < PER_COMPANY_MIN_EMPLOYEE_RATIO - 1e-6) {
        console.error(
          `per-company attendance_ratio ${row.company}=${row.employee_ratio.toFixed(3)} < ${PER_COMPANY_MIN_EMPLOYEE_RATIO}`,
        );
        process.exit(1);
      }
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
