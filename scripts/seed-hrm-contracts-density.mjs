#!/usr/bin/env node
/**
 * Supplement employee_contracts until verify:hrm:menu-density contracts-ratio passes
 * and per-company AC-FID-03 (R_distinct ≥ 0.95) for pilot slugs.
 * work_item_id: P1-P100-W12-BE-SEED-01 / P1-HRM-R-H10-01-SEED / P1-HRM-H13-AC-FID-SLUGS
 * Idempotent — stable UUID per employee; safe to re-run.
 */
import pg from 'pg';
import { createHash } from 'node:crypto';
import { loadDeployEnv } from './seed-env-loader.mjs';
import { stableUuid } from './lib/stable-uuid.mjs';
import { PER_COMPANY_CONTRACT_RATIO } from './lib/hrm-contract-cohort.mjs';
import { UAT_COMPANIES } from './lib/uat-workforce.mjs';
import { contractDatesForType, pickContractType } from './lib/vietnamese-workforce-data.mjs';

loadDeployEnv();

const { Client } = pg;

export const CONTRACT_DENSITY_SEED_TAG =
  process.env.HRM_CONTRACT_DENSITY_SEED_TAG ?? 'p1-p100-w12-contracts-density';
const MIN_RATIO = Number(process.env.HRM_FIDELITY_MIN_CONTRACT_RATIO ?? 0.85);
const PER_COMPANY_MIN_RATIO = Number(
  process.env.HRM_FIDELITY_PER_COMPANY_CONTRACT_RATIO ?? PER_COMPANY_CONTRACT_RATIO,
);
const PER_COMPANY_TARGETS = (
  process.env.HRM_CONTRACT_DENSITY_COMPANIES ?? UAT_COMPANIES.join(',')
)
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

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

function contractIdForEmployee(employeeId) {
  return stableUuid(`${CONTRACT_DENSITY_SEED_TAG}:contract:${employeeId}`);
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
     VALUES ($1, 'employee_contracts', $2::uuid)
     ON CONFLICT DO NOTHING`,
    [CONTRACT_DENSITY_SEED_TAG, entityId],
  );
}

async function countActive(client) {
  const r = await client.query(
    `SELECT COUNT(*)::int AS c FROM public.employees WHERE status = 'active' OR status IS NULL`,
  );
  return r.rows[0].c;
}

async function countContracts(client) {
  const r = await client.query(`SELECT COUNT(*)::int AS c FROM public.employee_contracts`);
  return r.rows[0].c;
}

async function loadEmployeesWithoutContract(client, limit) {
  const scopeSlugs = [...UAT_COMPANIES, 'main'];
  const r = await client.query(
    `
    SELECT e.id, e.company_id, e.employee_code, e.hired_at
    FROM public.employees e
    WHERE (e.status = 'active' OR e.status IS NULL)
      AND e.company_id = ANY($1::text[])
      AND NOT EXISTS (
        SELECT 1 FROM public.employee_contracts ec
        WHERE ec.employee_id = e.id AND ec.company_id = e.company_id
      )
    ORDER BY e.employee_code
    LIMIT $2
    `,
    [scopeSlugs, limit],
  );
  return r.rows;
}

async function insertContract(client, emp) {
  const contractId = contractIdForEmployee(emp.id);
  const seqNum =
    Number(String(emp.employee_code ?? '').replace(/\D/g, '')) || hashByte(String(emp.employee_code));
  const contractDef = pickContractType(seqNum);
  const dates = contractDatesForType(contractDef.key, emp.hired_at ?? null);

  await client.query(
    `INSERT INTO public.employee_contracts
       (id, company_id, employee_id, contract_type, start_date, end_date, status)
     VALUES ($1::uuid, $2, $3::uuid, $4, $5::date, $6::date, 'active')
     ON CONFLICT (id) DO UPDATE SET
       company_id = EXCLUDED.company_id,
       employee_id = EXCLUDED.employee_id,
       contract_type = EXCLUDED.contract_type,
       start_date = EXCLUDED.start_date,
       end_date = EXCLUDED.end_date,
       status = EXCLUDED.status,
       updated_at = NOW()`,
    [contractId, emp.company_id, emp.id, contractDef.key, dates.start, dates.end],
  );
  await trackMeta(client, contractId);
}

async function loadEmployeesWithoutContractForCompany(client, companySlug, limit) {
  const r = await client.query(
    `
    SELECT e.id, e.company_id, e.employee_code, e.hired_at
    FROM public.employees e
    WHERE (e.status = 'active' OR e.status IS NULL)
      AND e.company_id = $1
      AND NOT EXISTS (
        SELECT 1 FROM public.employee_contracts ec
        WHERE ec.employee_id = e.id AND ec.company_id = e.company_id
      )
    ORDER BY e.employee_code
    LIMIT $2
    `,
    [companySlug, limit],
  );
  return r.rows;
}

async function companyContractStats(client, companySlug) {
  const r = await client.query(
    `
    SELECT COUNT(DISTINCT e.id)::int AS active_emp,
           COUNT(DISTINCT ec.employee_id)::int AS with_contract
    FROM public.employees e
    LEFT JOIN public.employee_contracts ec
      ON ec.employee_id = e.id AND ec.company_id = e.company_id
    WHERE (e.status = 'active' OR e.status IS NULL)
      AND e.company_id = $1
    `,
    [companySlug],
  );
  const { active_emp, with_contract } = r.rows[0];
  const ratio = active_emp ? with_contract / active_emp : 0;
  return { active_emp, with_contract, ratio };
}

async function realignMismatchedContracts(client, companySlug) {
  const r = await client.query(
    `
    UPDATE public.employee_contracts ec
    SET company_id = e.company_id, updated_at = NOW()
    FROM public.employees e
    WHERE e.id = ec.employee_id
      AND e.company_id = $1
      AND ec.company_id IS DISTINCT FROM e.company_id
    RETURNING ec.id
    `,
    [companySlug],
  );
  return r.rowCount ?? 0;
}

async function seedPerCompanyContractDensity(client, companies, minRatio) {
  let inserted = 0;
  const perCompany = [];

  for (const slug of companies) {
    let coInserted = 0;
    let realigned = 0;
    let iterations = 0;

    while (iterations < 10) {
      iterations += 1;
      realigned += await realignMismatchedContracts(client, slug);
      const { active_emp, with_contract, ratio } = await companyContractStats(client, slug);
      const target = Math.ceil(active_emp * minRatio);
      const need = Math.max(0, target - with_contract);

      if (need === 0 || ratio >= minRatio - 1e-6) {
        perCompany.push({
          company: slug,
          active_emp,
          with_contract,
          ratio,
          target_ratio: minRatio,
          inserted: coInserted,
          realigned,
        });
        break;
      }

      const candidates = await loadEmployeesWithoutContractForCompany(client, slug, need);
      if (candidates.length === 0) {
        perCompany.push({
          company: slug,
          active_emp,
          with_contract,
          ratio,
          target_ratio: minRatio,
          inserted: coInserted,
          realigned,
          exhausted: true,
        });
        break;
      }

      for (const emp of candidates) {
        await insertContract(client, emp);
        coInserted += 1;
        inserted += 1;
      }
    }
  }

  return { inserted, per_company: perCompany };
}

export async function seedContractsDensity(client) {
  await ensureMetadataSchema(client);

  const active = await countActive(client);
  let contracts = await countContracts(client);
  const target = Math.ceil(active * MIN_RATIO);

  if (contracts >= target) {
    const globalResult = {
      skipped: true,
      active,
      contracts,
      target,
      ratio: active ? contracts / active : 0,
      inserted: 0,
    };
    const perCompany = await seedPerCompanyContractDensity(
      client,
      PER_COMPANY_TARGETS,
      PER_COMPANY_MIN_RATIO,
    );
    contracts = await countContracts(client);
    return {
      ...globalResult,
      contracts,
      ratio: active ? contracts / active : 0,
      per_company_inserted: perCompany.inserted,
      per_company: perCompany.per_company,
    };
  }

  const need = target - contracts;
  const candidates = await loadEmployeesWithoutContract(client, need);
  let inserted = 0;

  for (const emp of candidates) {
    if (contracts >= target) break;
    await insertContract(client, emp);
    inserted += 1;
    contracts += 1;
  }

  const perCompany = await seedPerCompanyContractDensity(
    client,
    PER_COMPANY_TARGETS,
    PER_COMPANY_MIN_RATIO,
  );
  inserted += perCompany.inserted;
  contracts = await countContracts(client);

  return {
    skipped: false,
    active,
    contracts,
    target,
    ratio: active ? contracts / active : 0,
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
    const result = await seedContractsDensity(client);

    await client.query(
      `INSERT INTO public.hrm_seed_runs (seed_tag, ran_at, metadata)
       VALUES ($1, NOW(), $2::jsonb)
       ON CONFLICT (seed_tag) DO UPDATE SET ran_at = NOW(), metadata = EXCLUDED.metadata`,
      [
        CONTRACT_DENSITY_SEED_TAG,
        JSON.stringify({
          seed_tag: CONTRACT_DENSITY_SEED_TAG,
          min_ratio: MIN_RATIO,
          per_company_min_ratio: PER_COMPANY_MIN_RATIO,
          per_company_targets: PER_COMPANY_TARGETS,
          ...result,
          work_item_id: 'P1-HRM-H13-AC-FID-SLUGS',
        }),
      ],
    );

    await client.query('COMMIT');
    console.log(JSON.stringify({ success: true, ...result }, null, 2));

    if (result.ratio < MIN_RATIO) {
      console.error(
        `contracts-ratio still below target: ${result.ratio.toFixed(3)} < ${MIN_RATIO}`,
      );
      process.exit(1);
    }

    for (const row of result.per_company ?? []) {
      if (row.ratio < PER_COMPANY_MIN_RATIO - 1e-6) {
        console.error(
          `per-company contract_ratio ${row.company}=${row.ratio.toFixed(3)} < ${PER_COMPANY_MIN_RATIO}`,
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
