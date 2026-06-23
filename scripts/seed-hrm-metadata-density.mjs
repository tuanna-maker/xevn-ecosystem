#!/usr/bin/env node
/**
 * Supplement employee_metadata_change_requests until AC-FID-11 passes:
 *   group total >= 20 linked to real employees (pending + historical).
 * work_item_id: P1-HRM-H21-AC-FID-11-META
 * Idempotent — stable UUID per employee+slot; safe to re-run.
 */
import pg from 'pg';
import { loadDeployEnv } from './seed-env-loader.mjs';
import { stableUuid } from './lib/stable-uuid.mjs';
import { UAT_COMPANIES } from './lib/uat-workforce.mjs';

loadDeployEnv();

const { Client } = pg;

export const METADATA_DENSITY_SEED_TAG =
  process.env.HRM_METADATA_DENSITY_SEED_TAG ?? 'p1-hrm-h21-metadata-density';
const GROUP_MIN_CHANGE_REQUESTS = Number(
  process.env.HRM_FIDELITY_GROUP_METADATA_MIN ?? 20,
);
const MIN_PENDING = Number(process.env.HRM_FIDELITY_METADATA_PENDING_MIN ?? 8);
const PER_COMPANY_TARGETS = (
  process.env.HRM_METADATA_DENSITY_COMPANIES ?? UAT_COMPANIES.join(',')
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

const FIELD_KEYS = [
  'contact_phone',
  'personal_email',
  'emergency_contact',
  'address',
  'job_title',
  'bank_account',
];
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

function changeRequestId(employeeId, slot) {
  return stableUuid(`${METADATA_DENSITY_SEED_TAG}:meta-cr:${employeeId}:${slot}`);
}

function companyUuidForSlug(slug) {
  return COMPANY_UUID_MAP[slug] ?? COMPANY_UUID_MAP.holding;
}

async function ensureMetadataSchema(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS public.employee_metadata_change_requests (
      id UUID PRIMARY KEY,
      company_id UUID NOT NULL,
      employee_id UUID NOT NULL,
      legal_entity_id UUID NULL,
      field_key TEXT NOT NULL,
      current_value JSONB NULL,
      requested_value JSONB NOT NULL,
      reason TEXT NULL,
      actor_user_id TEXT NULL,
      actor_name TEXT NULL,
      workflow_code TEXT NULL,
      source_catalog_key TEXT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      decided_by TEXT NULL,
      decided_note TEXT NULL,
      decided_at TIMESTAMPTZ NULL,
      submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      CONSTRAINT chk_employee_metadata_change_requests_status
        CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled'))
    );
  `);
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
     SELECT $1, 'employee_metadata_change_requests', unnest($2::uuid[])
     ON CONFLICT DO NOTHING`,
    [METADATA_DENSITY_SEED_TAG, entityIds],
  );
}

/**
 * AC-FID-11 group stats — linked to real employees only.
 */
export async function metadataFidelityStats(client) {
  const r = await client.query(`
    SELECT
      COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE cr.status = 'pending')::int AS pending,
      COUNT(*) FILTER (WHERE cr.status IN ('approved', 'rejected', 'cancelled'))::int AS historical
    FROM public.employee_metadata_change_requests cr
    INNER JOIN public.employees e ON e.id = cr.employee_id
  `);
  const { total, pending, historical } = r.rows[0];
  return {
    total,
    pending,
    historical,
    pass:
      total >= GROUP_MIN_CHANGE_REQUESTS &&
      pending >= MIN_PENDING,
    group_min: GROUP_MIN_CHANGE_REQUESTS,
    pending_min: MIN_PENDING,
  };
}

async function loadEmployeesForSeed(client, limit) {
  const r = await client.query(
    `
    SELECT e.id, e.company_id AS slug, e.full_name
    FROM public.employees e
    WHERE (e.status = 'active' OR e.status IS NULL)
      AND e.company_id = ANY($1::text[])
    ORDER BY e.company_id, e.employee_code
    LIMIT $2
    `,
    [PER_COMPANY_TARGETS, limit],
  );
  return r.rows;
}

function buildRow(employee, slot) {
  const status = slot < MIN_PENDING ? 'pending' : STATUSES[slot % STATUSES.length];
  const fieldKey = FIELD_KEYS[slot % FIELD_KEYS.length];
  const id = changeRequestId(employee.id, slot);
  const companyUuid = companyUuidForSlug(employee.slug);
  const submittedAt = new Date(Date.now() - slot * 86_400_000);
  const decidedAt =
    status === 'pending' ? null : new Date(submittedAt.getTime() + 3_600_000);

  return {
    id,
    company_id: companyUuid,
    employee_id: employee.id,
    field_key: fieldKey,
    current_value: JSON.stringify({ value: `old-${slot}` }),
    requested_value: JSON.stringify({ value: `new-${slot}` }),
    reason: `Density seed ${employee.slug} #${slot + 1}`,
    actor_user_id: 'seed-hrm-metadata-density',
    actor_name: 'HRM Seed',
    workflow_code: 'xbos.employee_metadata.default',
    source_catalog_key: 'employee_profile',
    status,
    decided_by: status === 'pending' ? null : 'hrbp@xe.vn',
    decided_note: status === 'pending' ? null : `Auto ${status}`,
    decided_at: decidedAt,
    submitted_at: submittedAt,
  };
}

async function insertChangeRequestsBatch(client, rows) {
  if (rows.length === 0) return 0;
  const ids = rows.map((r) => r.id);
  const companyIds = rows.map((r) => r.company_id);
  const employeeIds = rows.map((r) => r.employee_id);
  const fieldKeys = rows.map((r) => r.field_key);
  const currentValues = rows.map((r) => r.current_value);
  const requestedValues = rows.map((r) => r.requested_value);
  const reasons = rows.map((r) => r.reason);
  const actorUserIds = rows.map((r) => r.actor_user_id);
  const actorNames = rows.map((r) => r.actor_name);
  const workflowCodes = rows.map((r) => r.workflow_code);
  const sourceCatalogKeys = rows.map((r) => r.source_catalog_key);
  const statuses = rows.map((r) => r.status);
  const decidedBys = rows.map((r) => r.decided_by);
  const decidedNotes = rows.map((r) => r.decided_note);
  const decidedAts = rows.map((r) => r.decided_at);
  const submittedAts = rows.map((r) => r.submitted_at);

  const r = await client.query(
    `
    INSERT INTO public.employee_metadata_change_requests (
      id, company_id, employee_id, field_key, current_value, requested_value,
      reason, actor_user_id, actor_name, workflow_code, source_catalog_key,
      status, decided_by, decided_note, decided_at, submitted_at, updated_at
    )
    SELECT
      unnest($1::uuid[]),
      unnest($2::uuid[]),
      unnest($3::uuid[]),
      unnest($4::text[]),
      unnest($5::jsonb[]),
      unnest($6::jsonb[]),
      unnest($7::text[]),
      unnest($8::text[]),
      unnest($9::text[]),
      unnest($10::text[]),
      unnest($11::text[]),
      unnest($12::text[]),
      unnest($13::text[]),
      unnest($14::text[]),
      unnest($15::timestamptz[]),
      unnest($16::timestamptz[]),
      NOW()
    ON CONFLICT (id) DO NOTHING
    RETURNING id
    `,
    [
      ids,
      companyIds,
      employeeIds,
      fieldKeys,
      currentValues,
      requestedValues,
      reasons,
      actorUserIds,
      actorNames,
      workflowCodes,
      sourceCatalogKeys,
      statuses,
      decidedBys,
      decidedNotes,
      decidedAts,
      submittedAts,
    ],
  );
  await trackMetaBatch(client, r.rows.map((row) => row.id));
  return r.rowCount ?? 0;
}

export async function seedMetadataDensity(client) {
  await ensureMetadataSchema(client);
  const before = await metadataFidelityStats(client);
  const need = Math.max(0, GROUP_MIN_CHANGE_REQUESTS - before.total);
  const pendingNeed = Math.max(0, MIN_PENDING - before.pending);

  const employees = await loadEmployeesForSeed(
    client,
    Math.max(need, GROUP_MIN_CHANGE_REQUESTS, pendingNeed * 2),
  );
  if (employees.length === 0) {
    throw new Error('No active employees found for metadata density seed');
  }

  const rows = [];
  let slot = 0;
  while (rows.length < need || rows.filter((r) => r.status === 'pending').length < pendingNeed) {
    const employee = employees[slot % employees.length];
    const row = buildRow(employee, slot);
    rows.push(row);
    slot += 1;
    if (slot > GROUP_MIN_CHANGE_REQUESTS * 3) break;
  }

  let inserted = 0;
  const batchSize = 50;
  for (let i = 0; i < rows.length; i += batchSize) {
    inserted += await insertChangeRequestsBatch(client, rows.slice(i, i + batchSize));
  }

  const after = await metadataFidelityStats(client);
  return {
    ...after,
    ac_fid_11_pass: after.pass,
    inserted,
    before_total: before.total,
    before_pending: before.pending,
    target_total: GROUP_MIN_CHANGE_REQUESTS,
    employees_used: employees.length,
  };
}

async function main() {
  const client = new Client(baseConfig);
  await client.connect();

  try {
    await client.query('BEGIN');
    const result = await seedMetadataDensity(client);

    await client.query(
      `INSERT INTO public.hrm_seed_runs (seed_tag, ran_at, metadata)
       VALUES ($1, NOW(), $2::jsonb)
       ON CONFLICT (seed_tag) DO UPDATE SET ran_at = NOW(), metadata = EXCLUDED.metadata`,
      [
        METADATA_DENSITY_SEED_TAG,
        JSON.stringify({
          seed_tag: METADATA_DENSITY_SEED_TAG,
          ...result,
          work_item_id: 'P1-HRM-H21-AC-FID-11-META',
        }),
      ],
    );

    await client.query('COMMIT');
    console.log(JSON.stringify({ success: true, ...result }, null, 2));

    if (!result.ac_fid_11_pass) {
      console.error(
        `AC-FID-11 FAIL: total=${result.total} pending=${result.pending} need total>=${GROUP_MIN_CHANGE_REQUESTS} pending>=${MIN_PENDING}`,
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

const isDirectRun =
  process.argv[1] &&
  (process.argv[1].endsWith('seed-hrm-metadata-density.mjs') ||
    process.argv[1].includes('seed-hrm-metadata-density'));

if (isDirectRun) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
