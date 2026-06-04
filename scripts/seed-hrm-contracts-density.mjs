#!/usr/bin/env node
/**
 * Supplement employee_contracts until verify:hrm:menu-density contracts-ratio passes.
 * work_item_id: P1-P100-W12-BE-SEED-01
 * Idempotent — stable UUID per employee; safe to re-run.
 */
import pg from 'pg';
import { createHash } from 'node:crypto';
import { loadDeployEnv } from './seed-env-loader.mjs';
import { stableUuid } from './lib/stable-uuid.mjs';
import { UAT_COMPANIES } from './lib/uat-workforce.mjs';
import { contractDatesForType, pickContractType } from './lib/vietnamese-workforce-data.mjs';

loadDeployEnv();

const { Client } = pg;

export const CONTRACT_DENSITY_SEED_TAG =
  process.env.HRM_CONTRACT_DENSITY_SEED_TAG ?? 'p1-p100-w12-contracts-density';
const MIN_RATIO = Number(process.env.HRM_FIDELITY_MIN_CONTRACT_RATIO ?? 0.85);

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
        SELECT 1 FROM public.employee_contracts ec WHERE ec.employee_id = e.id
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
    [contractId, emp.company_id, emp.id, contractDef.label, dates.start, dates.end],
  );
  await trackMeta(client, contractId);
}

export async function seedContractsDensity(client) {
  await ensureMetadataSchema(client);

  const active = await countActive(client);
  let contracts = await countContracts(client);
  const target = Math.ceil(active * MIN_RATIO);

  if (contracts >= target) {
    return {
      skipped: true,
      active,
      contracts,
      target,
      ratio: active ? contracts / active : 0,
      inserted: 0,
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

  return {
    skipped: false,
    active,
    contracts,
    target,
    ratio: active ? contracts / active : 0,
    inserted,
    candidates_available: candidates.length,
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
          ...result,
          work_item_id: 'P1-P100-W12-BE-SEED-01',
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
