#!/usr/bin/env node
/**
 * Supplement payroll_periods until AC-FID-07 passes:
 *   group total >= 60 AND each pilot company has >= 12 monthly periods (12 × 5).
 * work_item_id: P1-HRM-H17-AC-FID-07-PAY
 * Idempotent — stable UUID per company+year+month; safe to re-run.
 */
import pg from 'pg';
import { loadDeployEnv } from './seed-env-loader.mjs';
import { stableUuid } from './lib/stable-uuid.mjs';
import { UAT_COMPANIES } from './lib/uat-workforce.mjs';

loadDeployEnv();

const { Client } = pg;

export const PAYROLL_DENSITY_SEED_TAG =
  process.env.HRM_PAYROLL_DENSITY_SEED_TAG ?? 'p1-hrm-h17-payroll-density';
const GROUP_MIN_PERIODS = Number(process.env.HRM_FIDELITY_GROUP_PAYROLL_PERIODS_MIN ?? 60);
const PER_COMPANY_MIN_PERIODS = Number(process.env.HRM_FIDELITY_PER_COMPANY_PAYROLL_MIN ?? 12);
const CALENDAR_YEAR = Number(process.env.HRM_PAYROLL_DENSITY_YEAR ?? 2025);
const BATCH_SIZE = Number(process.env.HRM_PAYROLL_DENSITY_BATCH ?? 60);
const PER_COMPANY_TARGETS = (
  process.env.HRM_PAYROLL_DENSITY_COMPANIES ?? UAT_COMPANIES.join(',')
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

function pad2(n) {
  return String(n).padStart(2, '0');
}

function lastDayOfMonth(year, month) {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

function payrollPeriodId(slug, year, month) {
  return stableUuid(`${PAYROLL_DENSITY_SEED_TAG}:payroll-period:${slug}:${year}-${pad2(month)}`);
}

function slugFromCompanyId(companyId) {
  if (!companyId) return 'holding';
  const s = String(companyId);
  if (COMPANY_UUID_MAP[s]) return s;
  const hit = Object.entries(COMPANY_UUID_MAP).find(([, u]) => u === s);
  return hit?.[0] ?? (UAT_COMPANIES.includes(s) ? s : 'holding');
}

async function companyIdKind(client, table) {
  const r = await client.query(
    `SELECT data_type FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = $1 AND column_name = 'company_id'`,
    [table],
  );
  return r.rows[0]?.data_type === 'uuid' ? 'uuid' : 'text';
}

function cidForSlug(slug, kind) {
  if (kind === 'uuid') return COMPANY_UUID_MAP[slug] ?? COMPANY_UUID_MAP.holding;
  return slug;
}

function periodStatus(year, month) {
  const now = new Date();
  const y = now.getUTCFullYear();
  const m = now.getUTCMonth() + 1;
  if (year < y || (year === y && month < m)) return 'closed';
  if (year === y && month === m) return 'processed';
  return 'draft';
}

function buildMonthlyPeriod(slug, year, month, payrollCompanyKind) {
  const startDate = `${year}-${pad2(month)}-01`;
  const endDay = lastDayOfMonth(year, month);
  const endDate = `${year}-${pad2(month)}-${pad2(endDay)}`;
  const status = periodStatus(year, month);
  return {
    id: payrollPeriodId(slug, year, month),
    company_id: cidForSlug(slug, payrollCompanyKind),
    period_label: `Kỳ lương ${pad2(month)}/${year} — ${slug}`,
    start_date: startDate,
    end_date: endDate,
    status,
  };
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
     SELECT $1, 'payroll_periods', unnest($2::uuid[])
     ON CONFLICT DO NOTHING`,
    [PAYROLL_DENSITY_SEED_TAG, entityIds],
  );
}

async function countPayrollPeriods(client) {
  const r = await client.query(`SELECT COUNT(*)::int AS c FROM public.payroll_periods`);
  return r.rows[0].c;
}

/**
 * AC-FID-07 / CARD-PAY-01 per company: payroll_period rows for slug.
 */
export async function companyPayrollStats(client, companySlug) {
  const r = await client.query(
    `
    SELECT COUNT(*)::int AS c
    FROM public.payroll_periods pp
    WHERE pp.company_id::text = $1
       OR pp.company_id::text = $2
    `,
    [companySlug, COMPANY_UUID_MAP[companySlug] ?? ''],
  );
  return { period_count: r.rows[0].c, target: PER_COMPANY_MIN_PERIODS };
}

async function existingPeriodKeys(client, companySlug) {
  const r = await client.query(
    `
    SELECT start_date::text AS start_date, end_date::text AS end_date
    FROM public.payroll_periods pp
    WHERE pp.company_id::text = $1
       OR pp.company_id::text = $2
    `,
    [companySlug, COMPANY_UUID_MAP[companySlug] ?? ''],
  );
  const keys = new Set();
  for (const row of r.rows) {
    keys.add(String(row.start_date).slice(0, 10));
  }
  return keys;
}

function buildRowsForCompany(slug, payrollCompanyKind, existingStarts, year) {
  const rows = [];
  for (let month = 1; month <= PER_COMPANY_MIN_PERIODS; month += 1) {
    const row = buildMonthlyPeriod(slug, year, month, payrollCompanyKind);
    if (existingStarts.has(row.start_date)) continue;
    rows.push(row);
  }
  return rows;
}

async function insertPayrollBatch(client, rows) {
  if (rows.length === 0) return 0;
  let inserted = 0;

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const chunk = rows.slice(i, i + BATCH_SIZE);
    const ids = chunk.map((r) => r.id);
    const companyIds = chunk.map((r) => r.company_id);
    const labels = chunk.map((r) => r.period_label);
    const startDates = chunk.map((r) => r.start_date);
    const endDates = chunk.map((r) => r.end_date);
    const statuses = chunk.map((r) => r.status);

    await client.query(
      `
      INSERT INTO public.payroll_periods
        (id, company_id, period_label, start_date, end_date, status, created_by, processed_at, closed_at)
      SELECT
        u.id,
        u.company_id,
        u.period_label,
        u.start_date::date,
        u.end_date::date,
        u.status,
        $6,
        CASE WHEN u.status IN ('processed', 'closed') THEN NOW() ELSE NULL END,
        CASE WHEN u.status = 'closed' THEN NOW() ELSE NULL END
      FROM unnest(
        $1::uuid[],
        $2::text[],
        $3::text[],
        $4::text[],
        $5::text[],
        $7::text[]
      ) AS u(id, company_id, period_label, start_date, end_date, status)
      ON CONFLICT (company_id, start_date, end_date) DO UPDATE SET
        period_label = EXCLUDED.period_label,
        status = EXCLUDED.status,
        processed_at = COALESCE(public.payroll_periods.processed_at, EXCLUDED.processed_at),
        closed_at = COALESCE(public.payroll_periods.closed_at, EXCLUDED.closed_at),
        updated_at = NOW()
      `,
      [ids, companyIds, labels, startDates, endDates, PAYROLL_DENSITY_SEED_TAG, statuses],
    );
    await trackMetaBatch(client, ids);
    inserted += chunk.length;
  }

  return inserted;
}

async function seedPerCompanyPayrollDensity(client, companies, payrollCompanyKind, year) {
  let inserted = 0;
  const perCompany = [];

  for (const slug of companies) {
    const before = await companyPayrollStats(client, slug);
    const existingStarts = await existingPeriodKeys(client, slug);
    const rows = buildRowsForCompany(slug, payrollCompanyKind, existingStarts, year);
    const coInserted = await insertPayrollBatch(client, rows);
    inserted += coInserted;

    const after = await companyPayrollStats(client, slug);
    perCompany.push({
      company: slug,
      period_count: after.period_count,
      target: after.target,
      inserted: coInserted,
      before_count: before.period_count,
    });
  }

  return { inserted, per_company: perCompany };
}

export async function seedPayrollDensity(client) {
  await ensureMetadataSchema(client);
  const payrollCompanyKind = await companyIdKind(client, 'payroll_periods');

  const perCompany = await seedPerCompanyPayrollDensity(
    client,
    PER_COMPANY_TARGETS,
    payrollCompanyKind,
    CALENDAR_YEAR,
  );
  const payrollPeriods = await countPayrollPeriods(client);

  const perCompanyPass = (perCompany.per_company ?? []).every(
    (row) => row.period_count >= PER_COMPANY_MIN_PERIODS,
  );
  const groupPass = payrollPeriods >= GROUP_MIN_PERIODS;

  return {
    payroll_periods: payrollPeriods,
    group_min_periods: GROUP_MIN_PERIODS,
    group_pass: groupPass,
    per_company_pass: perCompanyPass,
    ac_fid_07_pass: groupPass && perCompanyPass,
    per_company_min_periods: PER_COMPANY_MIN_PERIODS,
    calendar_year: CALENDAR_YEAR,
    inserted: perCompany.inserted,
    per_company: perCompany.per_company,
  };
}

async function main() {
  const client = new Client(baseConfig);
  await client.connect();

  try {
    await client.query('BEGIN');
    const result = await seedPayrollDensity(client);

    await client.query(
      `INSERT INTO public.hrm_seed_runs (seed_tag, ran_at, metadata)
       VALUES ($1, NOW(), $2::jsonb)
       ON CONFLICT (seed_tag) DO UPDATE SET ran_at = NOW(), metadata = EXCLUDED.metadata`,
      [
        PAYROLL_DENSITY_SEED_TAG,
        JSON.stringify({
          seed_tag: PAYROLL_DENSITY_SEED_TAG,
          ...result,
          work_item_id: 'P1-HRM-H17-AC-FID-07-PAY',
        }),
      ],
    );

    await client.query('COMMIT');
    console.log(JSON.stringify({ success: true, ...result }, null, 2));

    if (!result.ac_fid_07_pass) {
      console.error(
        `AC-FID-07 FAIL: group=${result.payroll_periods} need>=${GROUP_MIN_PERIODS} or per-company CARD-PAY-01 (${PER_COMPANY_MIN_PERIODS}/slug) not met`,
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
