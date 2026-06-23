#!/usr/bin/env node
/**
 * Supplement payroll_payslips until AC-FID-08 passes:
 *   latest closed period per pilot company: R_distinct(c) >= 0.90 vs active employees.
 * work_item_id: P1-HRM-H18-AC-FID-08-PAYSLIP
 * Idempotent — stable UUID per employee+period; safe to re-run.
 */
import pg from 'pg';
import { createHash } from 'node:crypto';
import { loadDeployEnv } from './seed-env-loader.mjs';
import { stableUuid } from './lib/stable-uuid.mjs';
import { UAT_COMPANIES } from './lib/uat-workforce.mjs';

loadDeployEnv();

const { Client } = pg;

export const PAYSLIP_DENSITY_SEED_TAG =
  process.env.HRM_PAYSLIP_DENSITY_SEED_TAG ?? 'p1-hrm-h18-payslip-density';
const MIN_RATIO = Number(process.env.HRM_FIDELITY_MIN_PAYSLIP_RATIO ?? 0.85);
const PER_COMPANY_MIN_RATIO = Number(
  process.env.HRM_FIDELITY_PER_COMPANY_PAYSLIP_RATIO ?? 0.9,
);
const BATCH_SIZE = Number(process.env.HRM_PAYSLIP_DENSITY_BATCH ?? 250);
const PER_COMPANY_TARGETS = (
  process.env.HRM_PAYSLIP_DENSITY_COMPANIES ?? UAT_COMPANIES.join(',')
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

function payslipIdForEmployeePeriod(employeeId, periodId) {
  return stableUuid(`${PAYSLIP_DENSITY_SEED_TAG}:payslip:${employeeId}:${periodId}`);
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
     SELECT $1, 'payroll_payslips', unnest($2::uuid[])
     ON CONFLICT DO NOTHING`,
    [PAYSLIP_DENSITY_SEED_TAG, entityIds],
  );
}

async function countPayslips(client) {
  const r = await client.query(`SELECT COUNT(*)::int AS c FROM public.payroll_payslips`);
  return r.rows[0].c;
}

/**
 * Latest closed payroll period for slug (AC-FID-08 denominator period).
 */
export async function latestClosedPeriod(client, companySlug) {
  const r = await client.query(
    `
    SELECT pp.id, pp.period_label, pp.end_date::text AS end_date, pp.status
    FROM public.payroll_periods pp
    WHERE pp.status = 'closed'
      AND (pp.company_id::text = $1 OR pp.company_id::text = $2)
    ORDER BY pp.end_date DESC, pp.start_date DESC
    LIMIT 1
    `,
    [companySlug, COMPANY_UUID_MAP[companySlug] ?? ''],
  );
  return r.rows[0] ?? null;
}

/**
 * AC-FID-08: ratio = distinct payslip employees / active employees for latest closed period.
 */
export async function companyPayslipStats(client, companySlug) {
  const period = await latestClosedPeriod(client, companySlug);
  if (!period) {
    return {
      active_emp: 0,
      with_payslip: 0,
      ratio: 0,
      target_ratio: PER_COMPANY_MIN_RATIO,
      period_id: null,
      period_label: null,
      no_closed_period: true,
    };
  }

  const activeR = await client.query(
    `
    SELECT COUNT(*)::int AS c
    FROM public.employees e
    WHERE (e.status = 'active' OR e.status IS NULL)
      AND e.company_id = $1
    `,
    [companySlug],
  );
  const payslipR = await client.query(
    `
    SELECT COUNT(DISTINCT p.employee_id)::int AS c
    FROM public.payroll_payslips p
    INNER JOIN public.employees e
      ON e.id = p.employee_id
     AND e.company_id = $2
    WHERE p.period_id = $1::uuid
      AND (p.company_id::text = $2 OR p.company_id::text = $3)
    `,
    [period.id, companySlug, COMPANY_UUID_MAP[companySlug] ?? ''],
  );

  const active_emp = activeR.rows[0].c;
  const with_payslip = payslipR.rows[0].c;
  const ratio = active_emp ? with_payslip / active_emp : 0;

  return {
    active_emp,
    with_payslip,
    ratio,
    target_ratio: PER_COMPANY_MIN_RATIO,
    period_id: period.id,
    period_label: period.period_label,
    period_end: period.end_date?.slice(0, 10) ?? null,
  };
}

async function realignMismatchedPayslips(client, companySlug, periodId) {
  const r = await client.query(
    `
    UPDATE public.payroll_payslips p
    SET company_id = e.company_id, updated_at = NOW()
    FROM public.employees e
    WHERE e.id = p.employee_id
      AND e.company_id = $1
      AND p.period_id = $2::uuid
      AND p.company_id IS DISTINCT FROM e.company_id
    RETURNING p.id
    `,
    [companySlug, periodId],
  );
  return r.rowCount ?? 0;
}

async function loadEmployeesWithoutPayslip(client, companySlug, periodId, limit) {
  const r = await client.query(
    `
    SELECT e.id, e.company_id, e.employee_code, e.full_name
    FROM public.employees e
    WHERE (e.status = 'active' OR e.status IS NULL)
      AND e.company_id = $1
      AND NOT EXISTS (
        SELECT 1 FROM public.payroll_payslips p
        WHERE p.period_id = $2::uuid
          AND p.employee_id = e.id
      )
    ORDER BY e.employee_code
    LIMIT $3
    `,
    [companySlug, periodId, limit],
  );
  return r.rows;
}

function buildPayslipRow(emp, periodId, payslipCompany) {
  const gross = 15000000 + (hashByte(String(emp.employee_code)) % 50) * 100000;
  const deduction = Math.floor(gross * 0.1);
  return {
    id: payslipIdForEmployeePeriod(emp.id, periodId),
    company_id: payslipCompany,
    period_id: periodId,
    employee_id: emp.id,
    employee_code: emp.employee_code,
    employee_name: emp.full_name,
    gross_amount: gross,
    deduction_amount: deduction,
    net_amount: gross - deduction,
  };
}

async function insertPayslipBatch(client, rows) {
  if (rows.length === 0) return 0;
  let inserted = 0;

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const chunk = rows.slice(i, i + BATCH_SIZE);
    const ids = chunk.map((r) => r.id);
    const companyIds = chunk.map((r) => r.company_id);
    const periodIds = chunk.map((r) => r.period_id);
    const employeeIds = chunk.map((r) => r.employee_id);
    const codes = chunk.map((r) => r.employee_code);
    const names = chunk.map((r) => r.employee_name);
    const gross = chunk.map((r) => r.gross_amount);
    const deductions = chunk.map((r) => r.deduction_amount);
    const nets = chunk.map((r) => r.net_amount);

    await client.query(
      `
      INSERT INTO public.payroll_payslips
        (id, company_id, period_id, employee_id, employee_code, employee_name,
         gross_amount, deduction_amount, net_amount, currency, status)
      SELECT
        u.id,
        u.company_id,
        u.period_id,
        u.employee_id,
        u.employee_code,
        u.employee_name,
        u.gross_amount,
        u.deduction_amount,
        u.net_amount,
        'VND',
        'processed'
      FROM unnest(
        $1::uuid[],
        $2::text[],
        $3::uuid[],
        $4::uuid[],
        $5::text[],
        $6::text[],
        $7::numeric[],
        $8::numeric[],
        $9::numeric[]
      ) AS u(
        id, company_id, period_id, employee_id, employee_code, employee_name,
        gross_amount, deduction_amount, net_amount
      )
      ON CONFLICT (period_id, employee_id) DO UPDATE SET
        company_id = EXCLUDED.company_id,
        gross_amount = EXCLUDED.gross_amount,
        deduction_amount = EXCLUDED.deduction_amount,
        net_amount = EXCLUDED.net_amount,
        status = EXCLUDED.status,
        updated_at = NOW()
      `,
      [ids, companyIds, periodIds, employeeIds, codes, names, gross, deductions, nets],
    );
    await trackMetaBatch(client, ids);
    inserted += chunk.length;
  }

  return inserted;
}

async function seedPerCompanyPayslipDensity(client, companies, payslipCompanyKind, minRatio) {
  let inserted = 0;
  const perCompany = [];

  for (const slug of companies) {
    let coInserted = 0;
    let realigned = 0;
    let iterations = 0;

    while (iterations < 10) {
      iterations += 1;
      const period = await latestClosedPeriod(client, slug);
      if (!period) {
        perCompany.push({
          company: slug,
          active_emp: 0,
          with_payslip: 0,
          ratio: 0,
          target_ratio: minRatio,
          inserted: 0,
          no_closed_period: true,
        });
        break;
      }

      realigned += await realignMismatchedPayslips(client, slug, period.id);
      const stats = await companyPayslipStats(client, slug);
      const target = Math.ceil(stats.active_emp * minRatio);
      const need = Math.max(0, target - stats.with_payslip);

      if (need === 0 || stats.ratio >= minRatio - 1e-6) {
        perCompany.push({
          company: slug,
          ...stats,
          inserted: coInserted,
          realigned,
        });
        break;
      }

      const payslipCompany = cidForSlug(slug, payslipCompanyKind);
      const candidates = await loadEmployeesWithoutPayslip(client, slug, period.id, need);
      if (candidates.length === 0) {
        perCompany.push({
          company: slug,
          ...stats,
          inserted: coInserted,
          realigned,
          exhausted: true,
        });
        break;
      }

      const rows = candidates.map((emp) => buildPayslipRow(emp, period.id, payslipCompany));
      const batchInserted = await insertPayslipBatch(client, rows);
      coInserted += batchInserted;
      inserted += batchInserted;
    }
  }

  return { inserted, per_company: perCompany };
}

export async function seedPayslipDensity(client) {
  await ensureMetadataSchema(client);
  const payslipCompanyKind = await companyIdKind(client, 'payroll_payslips');

  const perCompany = await seedPerCompanyPayslipDensity(
    client,
    PER_COMPANY_TARGETS,
    payslipCompanyKind,
    PER_COMPANY_MIN_RATIO,
  );
  const payslips = await countPayslips(client);

  const perCompanyPass = (perCompany.per_company ?? []).every(
    (row) => !row.no_closed_period && row.ratio >= PER_COMPANY_MIN_RATIO - 1e-6,
  );

  return {
    payroll_payslips: payslips,
    per_company_min_ratio: PER_COMPANY_MIN_RATIO,
    global_min_ratio: MIN_RATIO,
    per_company_pass: perCompanyPass,
    ac_fid_08_pass: perCompanyPass,
    inserted: perCompany.inserted,
    per_company: perCompany.per_company,
  };
}

async function main() {
  const client = new Client(baseConfig);
  await client.connect();

  try {
    await client.query('BEGIN');
    const result = await seedPayslipDensity(client);

    await client.query(
      `INSERT INTO public.hrm_seed_runs (seed_tag, ran_at, metadata)
       VALUES ($1, NOW(), $2::jsonb)
       ON CONFLICT (seed_tag) DO UPDATE SET ran_at = NOW(), metadata = EXCLUDED.metadata`,
      [
        PAYSLIP_DENSITY_SEED_TAG,
        JSON.stringify({
          seed_tag: PAYSLIP_DENSITY_SEED_TAG,
          ...result,
          work_item_id: 'P1-HRM-H18-AC-FID-08-PAYSLIP',
        }),
      ],
    );

    await client.query('COMMIT');
    console.log(JSON.stringify({ success: true, ...result }, null, 2));

    if (!result.ac_fid_08_pass) {
      console.error(
        `AC-FID-08 FAIL: latest closed period payslip ratio < ${PER_COMPANY_MIN_RATIO} for one or more pilot companies`,
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
