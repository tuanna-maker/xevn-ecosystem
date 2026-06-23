#!/usr/bin/env node
/**
 * Supplement performance_cycles + performance_evaluations until AC-FID-13 passes:
 *   group cycles >= 5; evaluations >= 300 (linked to real employees + cycles).
 * work_item_id: P1-HRM-H23-AC-FID-13-PERF
 * Idempotent — stable UUID per cycle/eval slot; safe to re-run.
 */
import pg from 'pg';
import { createHash } from 'node:crypto';
import { loadDeployEnv } from './seed-env-loader.mjs';
import { stableUuid } from './lib/stable-uuid.mjs';
import { UAT_COMPANIES } from './lib/uat-workforce.mjs';

loadDeployEnv();

const { Client } = pg;

export const PERFORMANCE_DENSITY_SEED_TAG =
  process.env.HRM_PERFORMANCE_DENSITY_SEED_TAG ?? 'p1-hrm-h23-performance-density';
const GROUP_MIN_CYCLES = Number(process.env.HRM_FIDELITY_GROUP_PERF_CYCLES_MIN ?? 5);
const GROUP_MIN_EVALUATIONS = Number(process.env.HRM_FIDELITY_GROUP_PERF_EVALS_MIN ?? 300);
const MIN_CYCLES_PER_SLUG = Number(process.env.HRM_FIDELITY_MIN_CYCLES_PER_SLUG ?? 1);
const BATCH_SIZE = Number(process.env.HRM_PERFORMANCE_DENSITY_BATCH ?? 200);
const PER_COMPANY_TARGETS = (
  process.env.HRM_PERFORMANCE_DENSITY_COMPANIES ?? UAT_COMPANIES.join(',')
)
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

const CYCLE_STATUSES = ['draft', 'active', 'closed'];
const REVIEWERS = ['Trưởng bộ phận', 'Quản lý trực tiếp', 'HRBP', 'Ban điều hành'];

const COMPANY_UUID_MAP = {
  holding: '10000000-0000-4000-8000-000000000001',
  trsport: '10000000-0000-4000-8000-000000000002',
  logistics: '10000000-0000-4000-8000-000000000003',
  finance: '10000000-0000-4000-8000-000000000004',
  services: '10000000-0000-4000-8000-000000000005',
};

function slugFromCompanyId(companyId) {
  const s = String(companyId ?? '');
  if (UAT_COMPANIES.includes(s)) return s;
  const hit = Object.entries(COMPANY_UUID_MAP).find(([, u]) => u === s);
  return hit?.[0] ?? null;
}

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

function cycleId(slug, slot) {
  return stableUuid(`${PERFORMANCE_DENSITY_SEED_TAG}:cycle:${slug}:${slot}`);
}

function evaluationId(cycleIdValue, employeeId, slot) {
  return stableUuid(`${PERFORMANCE_DENSITY_SEED_TAG}:eval:${cycleIdValue}:${employeeId}:${slot}`);
}

async function ensurePerformanceSchema(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS public.performance_cycles (
      id UUID PRIMARY KEY,
      company_id TEXT NOT NULL,
      cycle_name TEXT NOT NULL,
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      status TEXT NOT NULL DEFAULT 'draft',
      created_by TEXT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      CONSTRAINT chk_performance_cycle_status CHECK (status IN ('draft', 'active', 'closed')),
      CONSTRAINT chk_performance_cycle_dates CHECK (start_date <= end_date)
    );
  `);
  await client.query(`
    CREATE TABLE IF NOT EXISTS public.performance_evaluations (
      id UUID PRIMARY KEY,
      company_id TEXT NOT NULL,
      employee_id UUID NOT NULL,
      cycle_id UUID NOT NULL REFERENCES public.performance_cycles(id) ON DELETE CASCADE,
      score NUMERIC(5,2) NOT NULL,
      summary TEXT NOT NULL,
      reviewer TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      CONSTRAINT chk_performance_score CHECK (score >= 0 AND score <= 100)
    );
  `);
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

async function trackMetaBatch(client, table, entityIds) {
  if (entityIds.length === 0) return;
  await client.query(
    `INSERT INTO public.hrm_seed_metadata (seed_tag, entity_table, entity_id)
     SELECT $1, $2, unnest($3::uuid[])
     ON CONFLICT DO NOTHING`,
    [PERFORMANCE_DENSITY_SEED_TAG, table, entityIds],
  );
}

/**
 * AC-FID-13 group performance fidelity stats.
 */
export async function performanceFidelityStats(client) {
  const cyclesR = await client.query(`SELECT COUNT(*)::int AS c FROM public.performance_cycles`);
  const evalsR = await client.query(`SELECT COUNT(*)::int AS c FROM public.performance_evaluations`);
  const cycles = cyclesR.rows[0]?.c ?? 0;
  const evaluations = evalsR.rows[0]?.c ?? 0;
  const pass = cycles >= GROUP_MIN_CYCLES && evaluations >= GROUP_MIN_EVALUATIONS;
  return {
    cycles,
    evaluations,
    min_cycles: GROUP_MIN_CYCLES,
    min_evaluations: GROUP_MIN_EVALUATIONS,
    pass,
  };
}

async function countCyclesForSlug(client, slug) {
  const r = await client.query(
    `SELECT COUNT(*)::int AS c FROM public.performance_cycles WHERE company_id = $1`,
    [slug],
  );
  return r.rows[0].c;
}

function buildCycleRow(slug, slot) {
  const year = 2024 + (slot % 3);
  const quarter = (slot % 4) + 1;
  const startMonth = (quarter - 1) * 3;
  const startDate = `${year}-${String(startMonth + 1).padStart(2, '0')}-01`;
  const endMonth = startMonth + 3;
  const endD = new Date(Date.UTC(year, endMonth, 0));
  const endDate = endD.toISOString().slice(0, 10);
  const status = CYCLE_STATUSES[hashByte(`${slug}:cycle-status:${slot}`) % CYCLE_STATUSES.length];

  return {
    id: cycleId(slug, slot),
    company_id: slug,
    cycle_name: `${slug.toUpperCase()} Q${quarter} ${year}`,
    start_date: startDate,
    end_date: endDate,
    status,
    created_by: 'seed-system',
  };
}

async function insertCycleBatch(client, rows) {
  if (rows.length === 0) return 0;
  const ids = rows.map((r) => r.id);
  const companyIds = rows.map((r) => r.company_id);
  const names = rows.map((r) => r.cycle_name);
  const startDates = rows.map((r) => r.start_date);
  const endDates = rows.map((r) => r.end_date);
  const statuses = rows.map((r) => r.status);
  const createdBy = rows.map((r) => r.created_by);

  await client.query(
    `
    INSERT INTO public.performance_cycles
      (id, company_id, cycle_name, start_date, end_date, status, created_by)
    SELECT u.id, u.company_id, u.cycle_name, u.start_date::date, u.end_date::date, u.status, u.created_by
    FROM unnest(
      $1::uuid[], $2::text[], $3::text[], $4::text[], $5::text[], $6::text[], $7::text[]
    ) AS u(id, company_id, cycle_name, start_date, end_date, status, created_by)
    ON CONFLICT (id) DO UPDATE SET
      cycle_name = EXCLUDED.cycle_name,
      start_date = EXCLUDED.start_date,
      end_date = EXCLUDED.end_date,
      status = EXCLUDED.status,
      updated_at = NOW()
    `,
    [ids, companyIds, names, startDates, endDates, statuses, createdBy],
  );
  await trackMetaBatch(client, 'performance_cycles', ids);
  return rows.length;
}

async function seedCyclesPerCompany(client, companies) {
  let inserted = 0;
  const perCompany = [];

  for (const slug of companies) {
    const existing = await countCyclesForSlug(client, slug);
    const need = Math.max(0, MIN_CYCLES_PER_SLUG - existing);
    const rows = [];
    for (let slot = 0; slot < need; slot += 1) {
      rows.push(buildCycleRow(slug, existing + slot));
    }
    const coInserted = await insertCycleBatch(client, rows);
    inserted += coInserted;
    perCompany.push({
      company: slug,
      cycles_before: existing,
      cycles_after: existing + coInserted,
      inserted: coInserted,
    });
  }

  return { inserted, per_company: perCompany };
}

async function seedGroupCycleTopUp(client, companies, groupMin) {
  const stats = await performanceFidelityStats(client);
  if (stats.cycles >= groupMin) return { inserted: 0, group_cycles: stats.cycles };

  let inserted = 0;
  let round = 0;
  let cycles = stats.cycles;

  while (cycles < groupMin && round < groupMin * 3) {
    const slug = companies[round % companies.length];
    const existing = await countCyclesForSlug(client, slug);
    const row = buildCycleRow(slug, existing + 100 + round);
    const coInserted = await insertCycleBatch(client, [row]);
    inserted += coInserted;
    cycles += coInserted;
    round += 1;
  }

  return { inserted, group_cycles: cycles };
}

async function loadActiveEmployees(client, companySlug) {
  const r = await client.query(
    `
    SELECT e.id, e.company_id, e.employee_code, e.full_name
    FROM public.employees e
    WHERE (e.status = 'active' OR e.status IS NULL)
      AND e.company_id = $1
    ORDER BY e.employee_code
    `,
    [companySlug],
  );
  return r.rows;
}

async function loadCycles(client) {
  const r = await client.query(
    `SELECT id, company_id FROM public.performance_cycles ORDER BY company_id, start_date`,
  );
  return r.rows;
}

function buildEvaluationRow(cycle, emp, slot) {
  const score = 55 + (hashByte(`${emp.employee_code}:score:${slot}`) % 46);
  const reviewer = REVIEWERS[hashByte(`${emp.employee_code}:reviewer:${slot}`) % REVIEWERS.length];
  return {
    id: evaluationId(cycle.id, emp.id, slot),
    company_id: cycle.company_id,
    employee_id: emp.id,
    cycle_id: cycle.id,
    score,
    summary: `seed:${PERFORMANCE_DENSITY_SEED_TAG} — đánh giá KPI kỳ`,
    reviewer,
  };
}

async function insertEvaluationBatch(client, rows) {
  if (rows.length === 0) return 0;
  let inserted = 0;

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const chunk = rows.slice(i, i + BATCH_SIZE);
    const ids = chunk.map((r) => r.id);
    const companyIds = chunk.map((r) => r.company_id);
    const employeeIds = chunk.map((r) => r.employee_id);
    const cycleIds = chunk.map((r) => r.cycle_id);
    const scores = chunk.map((r) => r.score);
    const summaries = chunk.map((r) => r.summary);
    const reviewers = chunk.map((r) => r.reviewer);

    await client.query(
      `
      INSERT INTO public.performance_evaluations
        (id, company_id, employee_id, cycle_id, score, summary, reviewer)
      SELECT u.id, u.company_id, u.employee_id, u.cycle_id, u.score, u.summary, u.reviewer
      FROM unnest(
        $1::uuid[], $2::text[], $3::uuid[], $4::uuid[], $5::numeric[], $6::text[], $7::text[]
      ) AS u(id, company_id, employee_id, cycle_id, score, summary, reviewer)
      ON CONFLICT (id) DO UPDATE SET
        score = EXCLUDED.score,
        summary = EXCLUDED.summary,
        reviewer = EXCLUDED.reviewer,
        updated_at = NOW()
      `,
      [ids, companyIds, employeeIds, cycleIds, scores, summaries, reviewers],
    );
    await trackMetaBatch(client, 'performance_evaluations', ids);
    inserted += chunk.length;
  }

  return inserted;
}

async function seedEvaluationsToTarget(client, companies, groupMin) {
  const stats = await performanceFidelityStats(client);
  const need = Math.max(0, groupMin - stats.evaluations);
  if (need === 0) return { inserted: 0, evaluations: stats.evaluations };

  const cycles = await loadCycles(client);
  if (cycles.length === 0) return { inserted: 0, evaluations: stats.evaluations };

  const employeesBySlug = new Map();
  for (const slug of companies) {
    employeesBySlug.set(slug, await loadActiveEmployees(client, slug));
  }

  const rows = [];
  let slot = 0;
  while (rows.length < need) {
    const cycle = cycles[slot % cycles.length];
    const slug = slugFromCompanyId(cycle.company_id) ?? companies[slot % companies.length];
    const employees = employeesBySlug.get(slug) ?? [];
    if (employees.length === 0) {
      slot += 1;
      if (slot > need * 2) break;
      continue;
    }
    const emp = employees[Math.floor(slot / cycles.length) % employees.length];
    const evalSlot = Math.floor(slot / (employees.length * cycles.length));
    rows.push(buildEvaluationRow(cycle, emp, evalSlot + slot));
    slot += 1;
  }

  const inserted = await insertEvaluationBatch(client, rows);
  const after = await performanceFidelityStats(client);
  return { inserted, evaluations: after.evaluations };
}

export async function seedPerformanceDensity(client) {
  await ensurePerformanceSchema(client);
  await ensureMetadataSchema(client);

  const perCompany = await seedCyclesPerCompany(client, PER_COMPANY_TARGETS);
  const cycleTopUp = await seedGroupCycleTopUp(client, PER_COMPANY_TARGETS, GROUP_MIN_CYCLES);
  const evalTopUp = await seedEvaluationsToTarget(client, PER_COMPANY_TARGETS, GROUP_MIN_EVALUATIONS);
  const stats = await performanceFidelityStats(client);

  return {
    cycles: stats.cycles,
    evaluations: stats.evaluations,
    group_min_cycles: GROUP_MIN_CYCLES,
    group_min_evaluations: GROUP_MIN_EVALUATIONS,
    ac_fid_13_pass: stats.pass,
    inserted_cycles: perCompany.inserted + cycleTopUp.inserted,
    inserted_evaluations: evalTopUp.inserted,
    per_company_cycles: perCompany.per_company,
    cycle_group_topup_inserted: cycleTopUp.inserted,
  };
}

async function main() {
  const client = new Client(baseConfig);
  await client.connect();

  try {
    await client.query('BEGIN');
    const result = await seedPerformanceDensity(client);

    await client.query(
      `INSERT INTO public.hrm_seed_runs (seed_tag, ran_at, metadata)
       VALUES ($1, NOW(), $2::jsonb)
       ON CONFLICT (seed_tag) DO UPDATE SET ran_at = NOW(), metadata = EXCLUDED.metadata`,
      [
        PERFORMANCE_DENSITY_SEED_TAG,
        JSON.stringify({
          seed_tag: PERFORMANCE_DENSITY_SEED_TAG,
          ...result,
          work_item_id: 'P1-HRM-H23-AC-FID-13-PERF',
        }),
      ],
    );

    await client.query('COMMIT');
    console.log(JSON.stringify({ success: true, ...result }, null, 2));

    if (!result.ac_fid_13_pass) {
      console.error(
        `AC-FID-13 FAIL: cycles=${result.cycles} need>=${GROUP_MIN_CYCLES}; evaluations=${result.evaluations} need>=${GROUP_MIN_EVALUATIONS}`,
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
