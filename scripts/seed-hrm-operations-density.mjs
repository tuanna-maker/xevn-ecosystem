#!/usr/bin/env node
/**
 * Supplement hrm_tasks + service_requests until AC-FID-12 passes:
 *   group tasks >= 25; group service_requests >= 50.
 * work_item_id: P1-HRM-H22-AC-FID-12-OPS
 * Idempotent — stable UUID per slot; safe to re-run.
 */
import pg from 'pg';
import { createHash } from 'node:crypto';
import { loadDeployEnv } from './seed-env-loader.mjs';
import { stableUuid } from './lib/stable-uuid.mjs';
import { UAT_COMPANIES } from './lib/uat-workforce.mjs';

loadDeployEnv();

const { Client } = pg;

export const OPERATIONS_DENSITY_SEED_TAG =
  process.env.HRM_OPERATIONS_DENSITY_SEED_TAG ?? 'p1-hrm-h22-operations-density';
const GROUP_MIN_TASKS = Number(process.env.HRM_FIDELITY_GROUP_TASKS_MIN ?? 25);
const GROUP_MIN_SERVICE_REQUESTS = Number(
  process.env.HRM_FIDELITY_GROUP_SERVICE_REQUESTS_MIN ?? 50,
);
const BATCH_SIZE = Number(process.env.HRM_OPERATIONS_DENSITY_BATCH ?? 100);
const PER_COMPANY_TARGETS = (
  process.env.HRM_OPERATIONS_DENSITY_COMPANIES ?? UAT_COMPANIES.join(',')
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

const TASK_PRIORITIES = ['low', 'medium', 'high'];
const TASK_STATUSES = ['todo', 'in_progress', 'done', 'blocked'];
const SERVICE_TYPES = ['meal', 'vehicle', 'supply'];
const REQUEST_STATUSES = ['pending', 'approved', 'rejected'];

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

function taskId(slug, slot) {
  return stableUuid(`${OPERATIONS_DENSITY_SEED_TAG}:task:${slug}:${slot}`);
}

function serviceRequestId(slug, slot) {
  return stableUuid(`${OPERATIONS_DENSITY_SEED_TAG}:service:${slug}:${slot}`);
}

function dueDateStr(offsetDays) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

function requestDateStr(offsetDays) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - offsetDays);
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

async function trackMetaBatch(client, table, entityIds) {
  if (entityIds.length === 0) return;
  await client.query(
    `INSERT INTO public.hrm_seed_metadata (seed_tag, entity_table, entity_id)
     SELECT $1, $2, unnest($3::uuid[])
     ON CONFLICT DO NOTHING`,
    [OPERATIONS_DENSITY_SEED_TAG, table, entityIds],
  );
}

async function countTable(client, table) {
  const r = await client.query(`SELECT COUNT(*)::int AS c FROM public.${table}`);
  return r.rows[0].c;
}

export async function operationsFidelityStats(client) {
  const tasks = await countTable(client, 'hrm_tasks');
  const serviceRequests = await countTable(client, 'service_requests');
  const pass =
    tasks >= GROUP_MIN_TASKS && serviceRequests >= GROUP_MIN_SERVICE_REQUESTS;
  return {
    tasks,
    service_requests: serviceRequests,
    min_tasks: GROUP_MIN_TASKS,
    min_service_requests: GROUP_MIN_SERVICE_REQUESTS,
    pass,
  };
}

async function loadActiveEmployees(client, companySlug) {
  const r = await client.query(
    `
    SELECT e.id, e.employee_code, e.full_name,
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

function buildTaskRow(slug, slot) {
  const companyUuid = COMPANY_UUID_MAP[slug] ?? COMPANY_UUID_MAP.holding;
  const priority = TASK_PRIORITIES[hashByte(`${slug}:task-pri:${slot}`) % TASK_PRIORITIES.length];
  const status = TASK_STATUSES[hashByte(`${slug}:task-st:${slot}`) % TASK_STATUSES.length];
  const dueOffset = 1 + (hashByte(`${slug}:task-due:${slot}`) % 30);
  return {
    id: taskId(slug, slot),
    company_id: companyUuid,
    title: `seed:${OPERATIONS_DENSITY_SEED_TAG}:${slug}:${slot}`,
    description: `AC-FID-12 density task ${slug} #${slot}`,
    priority,
    status,
    due_date: dueDateStr(dueOffset),
  };
}

function buildServiceRequestRow(slug, slot, emp) {
  const companyUuid = COMPANY_UUID_MAP[slug] ?? COMPANY_UUID_MAP.holding;
  const serviceType =
    SERVICE_TYPES[hashByte(`${slug}:svc-type:${slot}`) % SERVICE_TYPES.length];
  const status =
    REQUEST_STATUSES[hashByte(`${slug}:svc-st:${slot}`) % REQUEST_STATUSES.length];
  const dateOffset = hashByte(`${slug}:svc-date:${slot}`) % 14;
  return {
    id: serviceRequestId(slug, slot),
    company_id: companyUuid,
    service_type: serviceType,
    employee_id: emp?.id ?? null,
    employee_name: emp?.full_name ?? `Seed NV ${slug} ${slot}`,
    employee_code: emp?.employee_code ?? `NV-${slug}-${slot}`,
    department: emp?.department ?? 'Vận hành',
    request_date: requestDateStr(dateOffset),
    status,
    notes: `seed:${OPERATIONS_DENSITY_SEED_TAG}`,
  };
}

async function insertTaskBatch(client, rows) {
  if (rows.length === 0) return 0;
  let inserted = 0;

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const chunk = rows.slice(i, i + BATCH_SIZE);
    const ids = chunk.map((r) => r.id);
    const companyIds = chunk.map((r) => r.company_id);
    const titles = chunk.map((r) => r.title);
    const descriptions = chunk.map((r) => r.description);
    const priorities = chunk.map((r) => r.priority);
    const statuses = chunk.map((r) => r.status);
    const dueDates = chunk.map((r) => r.due_date);

    await client.query(
      `
      INSERT INTO public.hrm_tasks (
        id, company_id, title, description, priority, status, due_date
      )
      SELECT
        u.id,
        u.company_id::uuid,
        u.title,
        u.description,
        u.priority,
        u.status,
        u.due_date::date
      FROM unnest(
        $1::uuid[],
        $2::text[],
        $3::text[],
        $4::text[],
        $5::text[],
        $6::text[],
        $7::text[]
      ) AS u(id, company_id, title, description, priority, status, due_date)
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        description = EXCLUDED.description,
        priority = EXCLUDED.priority,
        status = EXCLUDED.status,
        due_date = EXCLUDED.due_date
      `,
      [ids, companyIds, titles, descriptions, priorities, statuses, dueDates],
    );
    await trackMetaBatch(client, 'hrm_tasks', ids);
    inserted += chunk.length;
  }

  return inserted;
}

async function insertServiceRequestBatch(client, rows) {
  if (rows.length === 0) return 0;
  let inserted = 0;

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const chunk = rows.slice(i, i + BATCH_SIZE);
    const ids = chunk.map((r) => r.id);
    const companyIds = chunk.map((r) => r.company_id);
    const serviceTypes = chunk.map((r) => r.service_type);
    const employeeIds = chunk.map((r) => r.employee_id);
    const employeeNames = chunk.map((r) => r.employee_name);
    const employeeCodes = chunk.map((r) => r.employee_code);
    const departments = chunk.map((r) => r.department);
    const requestDates = chunk.map((r) => r.request_date);
    const statuses = chunk.map((r) => r.status);
    const notes = chunk.map((r) => r.notes);

    await client.query(
      `
      INSERT INTO public.service_requests (
        id, company_id, service_type, employee_id, employee_name, employee_code,
        department, request_date, status, notes
      )
      SELECT
        u.id,
        u.company_id::uuid,
        u.service_type,
        u.employee_id,
        u.employee_name,
        u.employee_code,
        u.department,
        u.request_date::date,
        u.status,
        u.notes
      FROM unnest(
        $1::uuid[],
        $2::text[],
        $3::text[],
        $4::uuid[],
        $5::text[],
        $6::text[],
        $7::text[],
        $8::text[],
        $9::text[],
        $10::text[]
      ) AS u(
        id, company_id, service_type, employee_id, employee_name, employee_code,
        department, request_date, status, notes
      )
      ON CONFLICT (id) DO UPDATE SET
        service_type = EXCLUDED.service_type,
        employee_id = EXCLUDED.employee_id,
        employee_name = EXCLUDED.employee_name,
        employee_code = EXCLUDED.employee_code,
        department = EXCLUDED.department,
        request_date = EXCLUDED.request_date,
        status = EXCLUDED.status,
        notes = EXCLUDED.notes
      `,
      [
        ids,
        companyIds,
        serviceTypes,
        employeeIds,
        employeeNames,
        employeeCodes,
        departments,
        requestDates,
        statuses,
        notes,
      ],
    );
    await trackMetaBatch(client, 'service_requests', ids);
    inserted += chunk.length;
  }

  return inserted;
}

function distributeNeed(totalNeed, companies) {
  const perSlug = Math.floor(totalNeed / companies.length);
  const remainder = totalNeed % companies.length;
  return companies.map((slug, idx) => ({
    slug,
    need: perSlug + (idx < remainder ? 1 : 0),
    startSlot: 0,
  }));
}

async function seedOperationsDensity(client) {
  await ensureMetadataSchema(client);

  const statsBefore = await operationsFidelityStats(client);
  const taskNeed = Math.max(0, GROUP_MIN_TASKS - statsBefore.tasks);
  const svcNeed = Math.max(0, GROUP_MIN_SERVICE_REQUESTS - statsBefore.service_requests);

  const employeesBySlug = new Map();
  for (const slug of PER_COMPANY_TARGETS) {
    employeesBySlug.set(slug, await loadActiveEmployees(client, slug));
  }

  const taskRows = [];
  const taskPlan = distributeNeed(taskNeed, PER_COMPANY_TARGETS);
  for (const { slug, need } of taskPlan) {
    for (let slot = 0; slot < need; slot += 1) {
      taskRows.push(buildTaskRow(slug, slot));
    }
  }

  const svcRows = [];
  const svcPlan = distributeNeed(svcNeed, PER_COMPANY_TARGETS);
  for (const { slug, need } of svcPlan) {
    const employees = employeesBySlug.get(slug) ?? [];
    for (let slot = 0; slot < need; slot += 1) {
      const emp = employees.length > 0 ? employees[slot % employees.length] : null;
      svcRows.push(buildServiceRequestRow(slug, slot, emp));
    }
  }

  const tasksInserted = await insertTaskBatch(client, taskRows);
  const svcInserted = await insertServiceRequestBatch(client, svcRows);
  const statsAfter = await operationsFidelityStats(client);

  return {
    ...statsAfter,
    ac_fid_12_pass: statsAfter.pass,
    inserted_tasks: tasksInserted,
    inserted_service_requests: svcInserted,
    inserted: tasksInserted + svcInserted,
    task_need: taskNeed,
    service_request_need: svcNeed,
    per_company_targets: PER_COMPANY_TARGETS,
  };
}

async function main() {
  const client = new Client(baseConfig);
  await client.connect();

  try {
    await client.query('BEGIN');
    const result = await seedOperationsDensity(client);

    await client.query(
      `INSERT INTO public.hrm_seed_runs (seed_tag, ran_at, metadata)
       VALUES ($1, NOW(), $2::jsonb)
       ON CONFLICT (seed_tag) DO UPDATE SET ran_at = NOW(), metadata = EXCLUDED.metadata`,
      [
        OPERATIONS_DENSITY_SEED_TAG,
        JSON.stringify({
          seed_tag: OPERATIONS_DENSITY_SEED_TAG,
          ...result,
          work_item_id: 'P1-HRM-H22-AC-FID-12-OPS',
        }),
      ],
    );

    await client.query('COMMIT');
    console.log(JSON.stringify({ success: true, ...result }, null, 2));

    if (!result.ac_fid_12_pass) {
      console.error(
        `AC-FID-12 FAIL: tasks=${result.tasks} need>=${GROUP_MIN_TASKS}; service_requests=${result.service_requests} need>=${GROUP_MIN_SERVICE_REQUESTS}`,
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
  (process.argv[1].endsWith('seed-hrm-operations-density.mjs') ||
    process.argv[1].replace(/\\/g, '/').includes('seed-hrm-operations-density.mjs'));

if (isDirectRun) {
  main().catch((error) => {
    console.error(JSON.stringify({ success: false, error: error.message }, null, 2));
    process.exit(1);
  });
}
