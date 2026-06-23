#!/usr/bin/env node
/**
 * Supplement employee_insurance_records until per-company AC-FID-04 (CARD-INS-01)
 * insurance_ratio ≥ 0.95 vs employees with active contracts (same-slug join).
 * work_item_id: P1-HRM-H14-AC-FID-04-INS
 * Idempotent — stable UUID per employee; safe to re-run.
 */
import pg from 'pg';
import { createHash } from 'node:crypto';
import { loadDeployEnv } from './seed-env-loader.mjs';
import { stableUuid } from './lib/stable-uuid.mjs';
import { PER_COMPANY_CONTRACT_RATIO } from './lib/hrm-contract-cohort.mjs';
import { UAT_COMPANIES } from './lib/uat-workforce.mjs';
import { pickInsuranceProvider } from './lib/vietnamese-workforce-data.mjs';

loadDeployEnv();

const { Client } = pg;

export const INSURANCE_DENSITY_SEED_TAG =
  process.env.HRM_INSURANCE_DENSITY_SEED_TAG ?? 'p1-hrm-h14-insurance-density';
const MIN_RATIO = Number(process.env.HRM_FIDELITY_MIN_INSURANCE_RATIO ?? 0.85);
const PER_COMPANY_MIN_RATIO = Number(
  process.env.HRM_FIDELITY_PER_COMPANY_INSURANCE_RATIO ?? PER_COMPANY_CONTRACT_RATIO,
);
const PER_COMPANY_TARGETS = (
  process.env.HRM_INSURANCE_DENSITY_COMPANIES ?? UAT_COMPANIES.join(',')
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

function insuranceIdForEmployee(employeeId) {
  return stableUuid(`${INSURANCE_DENSITY_SEED_TAG}:insurance:${employeeId}`);
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

async function trackMeta(client, entityId) {
  await client.query(
    `INSERT INTO public.hrm_seed_metadata (seed_tag, entity_table, entity_id)
     VALUES ($1, 'employee_insurance_records', $2::uuid)
     ON CONFLICT DO NOTHING`,
    [INSURANCE_DENSITY_SEED_TAG, entityId],
  );
}

async function countActive(client) {
  const r = await client.query(
    `SELECT COUNT(*)::int AS c FROM public.employees WHERE status = 'active' OR status IS NULL`,
  );
  return r.rows[0].c;
}

async function countInsurance(client) {
  const r = await client.query(`SELECT COUNT(*)::int AS c FROM public.employee_insurance_records`);
  return r.rows[0].c;
}

/**
 * AC-FID-04: ratio = with_insurance / with_active_contract (same company_id join).
 */
async function companyInsuranceStats(client, companySlug) {
  const r = await client.query(
    `
    SELECT COUNT(DISTINCT e.id)::int AS with_contract,
           COUNT(DISTINCT ir.employee_id)::int AS with_insurance
    FROM public.employees e
    INNER JOIN public.employee_contracts ec
      ON ec.employee_id = e.id
     AND ec.company_id = e.company_id
     AND ec.status = 'active'
    LEFT JOIN public.employee_insurance_records ir
      ON ir.employee_id = e.id
     AND ir.company_id = e.company_id
    WHERE (e.status = 'active' OR e.status IS NULL)
      AND e.company_id = $1
    `,
    [companySlug],
  );
  const { with_contract, with_insurance } = r.rows[0];
  const ratio = with_contract ? with_insurance / with_contract : 0;
  return { with_contract, with_insurance, ratio };
}

async function loadEmployeesWithContractWithoutInsurance(client, companySlug, limit) {
  const r = await client.query(
    `
    SELECT e.id, e.company_id, e.employee_code, ec.end_date
    FROM public.employees e
    INNER JOIN public.employee_contracts ec
      ON ec.employee_id = e.id
     AND ec.company_id = e.company_id
     AND ec.status = 'active'
    WHERE (e.status = 'active' OR e.status IS NULL)
      AND e.company_id = $1
      AND NOT EXISTS (
        SELECT 1 FROM public.employee_insurance_records ir
        WHERE ir.employee_id = e.id AND ir.company_id = e.company_id
      )
    ORDER BY e.employee_code
    LIMIT $2
    `,
    [companySlug, limit],
  );
  return r.rows;
}

async function loadEmployeesWithContractWithoutInsuranceGlobal(client, limit) {
  const scopeSlugs = [...UAT_COMPANIES, 'main'];
  const r = await client.query(
    `
    SELECT e.id, e.company_id, e.employee_code, ec.end_date
    FROM public.employees e
    INNER JOIN public.employee_contracts ec
      ON ec.employee_id = e.id
     AND ec.company_id = e.company_id
     AND ec.status = 'active'
    WHERE (e.status = 'active' OR e.status IS NULL)
      AND e.company_id = ANY($1::text[])
      AND NOT EXISTS (
        SELECT 1 FROM public.employee_insurance_records ir
        WHERE ir.employee_id = e.id AND ir.company_id = e.company_id
      )
    ORDER BY e.employee_code
    LIMIT $2
    `,
    [scopeSlugs, limit],
  );
  return r.rows;
}

async function realignMismatchedInsurance(client, companySlug) {
  const r = await client.query(
    `
    UPDATE public.employee_insurance_records ir
    SET company_id = e.company_id, updated_at = NOW()
    FROM public.employees e
    WHERE e.id = ir.employee_id
      AND e.company_id = $1
      AND ir.company_id IS DISTINCT FROM e.company_id
    RETURNING ir.id
    `,
    [companySlug],
  );
  return r.rowCount ?? 0;
}

function formatDate(value) {
  if (!value) return '2027-12-31';
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }
  const s = String(value);
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  const parsed = new Date(s);
  if (!Number.isNaN(parsed.getTime())) return parsed.toISOString().slice(0, 10);
  return '2027-12-31';
}

async function insertInsurance(client, emp, insCompanyKind) {
  const insId = insuranceIdForEmployee(emp.id);
  const slug = String(emp.company_id);
  const insCompany =
    insCompanyKind === 'uuid' ? cidForSlug(slug, 'uuid') : emp.company_id;
  const seqNum =
    Number(String(emp.employee_code ?? '').replace(/\D/g, '')) || hashByte(String(emp.employee_code));
  const provider = pickInsuranceProvider(seqNum);
  const contractEnd = formatDate(emp.end_date);
  const expiry = contractEnd > '2026-01-01' ? contractEnd : '2027-12-31';

  await client.query(
    `INSERT INTO public.employee_insurance_records
       (id, company_id, employee_id, provider, policy_number, expiry_date, status)
     VALUES ($1::uuid, $2, $3::uuid, $4, $5, $6::date, 'active')
     ON CONFLICT (id) DO UPDATE SET
       company_id = EXCLUDED.company_id,
       employee_id = EXCLUDED.employee_id,
       provider = EXCLUDED.provider,
       policy_number = EXCLUDED.policy_number,
       expiry_date = EXCLUDED.expiry_date,
       status = EXCLUDED.status,
       updated_at = NOW()`,
    [
      insId,
      insCompany,
      emp.id,
      provider,
      `BH-${emp.employee_code ?? emp.id.slice(0, 8)}-ACFID04`,
      expiry,
    ],
  );
  await trackMeta(client, insId);
}

async function seedPerCompanyInsuranceDensity(client, companies, minRatio, insCompanyKind) {
  let inserted = 0;
  const perCompany = [];

  for (const slug of companies) {
    let coInserted = 0;
    let realigned = 0;
    let iterations = 0;

    while (iterations < 10) {
      iterations += 1;
      realigned += await realignMismatchedInsurance(client, slug);
      const { with_contract, with_insurance, ratio } = await companyInsuranceStats(client, slug);
      const target = Math.ceil(with_contract * minRatio);
      const need = Math.max(0, target - with_insurance);

      if (need === 0 || ratio >= minRatio - 1e-6) {
        perCompany.push({
          company: slug,
          with_contract,
          with_insurance,
          ratio,
          target_ratio: minRatio,
          inserted: coInserted,
          realigned,
        });
        break;
      }

      const candidates = await loadEmployeesWithContractWithoutInsurance(client, slug, need);
      if (candidates.length === 0) {
        perCompany.push({
          company: slug,
          with_contract,
          with_insurance,
          ratio,
          target_ratio: minRatio,
          inserted: coInserted,
          realigned,
          exhausted: true,
        });
        break;
      }

      for (const emp of candidates) {
        await insertInsurance(client, emp, insCompanyKind);
        coInserted += 1;
        inserted += 1;
      }
    }
  }

  return { inserted, per_company: perCompany };
}

export async function seedInsuranceDensity(client) {
  await ensureMetadataSchema(client);
  const insCompanyKind = await companyIdKind(client, 'employee_insurance_records');

  const active = await countActive(client);
  let insurance = await countInsurance(client);
  const target = Math.ceil(active * MIN_RATIO);

  if (insurance >= target) {
    const globalResult = {
      skipped: true,
      active,
      insurance,
      target,
      ratio: active ? insurance / active : 0,
      inserted: 0,
    };
    const perCompany = await seedPerCompanyInsuranceDensity(
      client,
      PER_COMPANY_TARGETS,
      PER_COMPANY_MIN_RATIO,
      insCompanyKind,
    );
    insurance = await countInsurance(client);
    return {
      ...globalResult,
      insurance,
      ratio: active ? insurance / active : 0,
      per_company_inserted: perCompany.inserted,
      per_company: perCompany.per_company,
    };
  }

  const need = target - insurance;
  const candidates = await loadEmployeesWithContractWithoutInsuranceGlobal(client, need);
  let inserted = 0;

  for (const emp of candidates) {
    if (insurance >= target) break;
    await insertInsurance(client, emp, insCompanyKind);
    inserted += 1;
    insurance += 1;
  }

  const perCompany = await seedPerCompanyInsuranceDensity(
    client,
    PER_COMPANY_TARGETS,
    PER_COMPANY_MIN_RATIO,
    insCompanyKind,
  );
  inserted += perCompany.inserted;
  insurance = await countInsurance(client);

  return {
    skipped: false,
    active,
    insurance,
    target,
    ratio: active ? insurance / active : 0,
    inserted,
    candidates_available: candidates.length,
    per_company_inserted: perCompany.inserted,
    per_company: perCompany.per_company,
  };
}

async function main() {
  const client = new Client(baseConfig);
  await client.connect();

  try {
    await client.query('BEGIN');
    const result = await seedInsuranceDensity(client);

    await client.query(
      `INSERT INTO public.hrm_seed_runs (seed_tag, ran_at, metadata)
       VALUES ($1, NOW(), $2::jsonb)
       ON CONFLICT (seed_tag) DO UPDATE SET ran_at = NOW(), metadata = EXCLUDED.metadata`,
      [
        INSURANCE_DENSITY_SEED_TAG,
        JSON.stringify({
          seed_tag: INSURANCE_DENSITY_SEED_TAG,
          min_ratio: MIN_RATIO,
          per_company_min_ratio: PER_COMPANY_MIN_RATIO,
          per_company_targets: PER_COMPANY_TARGETS,
          ...result,
          work_item_id: 'P1-HRM-H14-AC-FID-04-INS',
        }),
      ],
    );

    await client.query('COMMIT');
    console.log(JSON.stringify({ success: true, ...result }, null, 2));

    if (result.ratio < MIN_RATIO) {
      console.error(
        `insurance-ratio still below target: ${result.ratio.toFixed(3)} < ${MIN_RATIO}`,
      );
      process.exit(1);
    }

    for (const row of result.per_company ?? []) {
      if (row.ratio < PER_COMPANY_MIN_RATIO - 1e-6) {
        console.error(
          `per-company insurance_ratio ${row.company}=${row.ratio.toFixed(3)} < ${PER_COMPANY_MIN_RATIO}`,
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
