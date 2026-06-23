#!/usr/bin/env node
/**
 * Supplement job_requisitions + recruitment_candidates until AC-FID-09 passes:
 *   group requisitions >= 5; candidates >= 15; avg >= 3 candidates / requisition.
 * work_item_id: P1-HRM-H19-AC-FID-09-REC
 * Idempotent — stable UUID per requisition+slot; safe to re-run.
 */
import pg from 'pg';
import { loadDeployEnv } from './seed-env-loader.mjs';
import { stableUuid } from './lib/stable-uuid.mjs';
import { UAT_COMPANIES } from './lib/uat-workforce.mjs';
import { HRM_CANDIDATE_SOURCE_CODES } from './lib/hrm-catalog-lineage.mjs';

loadDeployEnv();

const { Client } = pg;

export const RECRUITMENT_DENSITY_SEED_TAG =
  process.env.HRM_RECRUITMENT_DENSITY_SEED_TAG ?? 'p1-hrm-h19-recruitment-density';
const GROUP_MIN_REQUISITIONS = Number(process.env.HRM_FIDELITY_GROUP_REQUISITIONS_MIN ?? 5);
const GROUP_MIN_CANDIDATES = Number(process.env.HRM_FIDELITY_GROUP_CANDIDATES_MIN ?? 15);
const MIN_CANDIDATES_PER_REQUISITION = Number(
  process.env.HRM_FIDELITY_MIN_CANDIDATES_PER_REQUISITION ?? 3,
);
const MIN_REQUISITIONS_PER_SLUG = Number(process.env.HRM_FIDELITY_MIN_REQUISITIONS_PER_SLUG ?? 1);
const PER_COMPANY_TARGETS = (
  process.env.HRM_RECRUITMENT_DENSITY_COMPANIES ?? UAT_COMPANIES.join(',')
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

const CANDIDATE_STATUSES = ['new', 'screening', 'interview', 'offer'];
const CANDIDATE_SOURCES = HRM_CANDIDATE_SOURCE_CODES;
const DEPARTMENTS = ['Vận hành', 'Nhân sự', 'Kinh doanh', 'Tài chính', 'CNTT'];

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

function requisitionId(slug, slot) {
  return stableUuid(`${RECRUITMENT_DENSITY_SEED_TAG}:requisition:${slug}:${slot}`);
}

function candidateId(requisitionIdValue, slot) {
  return stableUuid(`${RECRUITMENT_DENSITY_SEED_TAG}:candidate:${requisitionIdValue}:${slot}`);
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

function slugFromCompanyId(companyId) {
  const s = String(companyId ?? '');
  if (UAT_COMPANIES.includes(s)) return s;
  const hit = Object.entries(COMPANY_UUID_MAP).find(([, u]) => u === s);
  return hit?.[0] ?? 'holding';
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
    [RECRUITMENT_DENSITY_SEED_TAG, table, entityIds],
  );
}

/**
 * AC-FID-09 group + per-requisition pipeline stats.
 */
export async function recruitmentFidelityStats(client) {
  const groupR = await client.query(`
    SELECT
      (SELECT COUNT(*)::int FROM public.job_requisitions) AS requisitions,
      (SELECT COUNT(*)::int FROM public.recruitment_candidates) AS candidates
  `);
  const { requisitions, candidates } = groupR.rows[0];
  const avg = requisitions > 0 ? candidates / requisitions : 0;
  const underMinR = await client.query(`
    SELECT COUNT(*)::int AS c
    FROM (
      SELECT jr.id, COUNT(rc.id)::int AS cand
      FROM public.job_requisitions jr
      LEFT JOIN public.recruitment_candidates rc ON rc.requisition_id = jr.id
      GROUP BY jr.id
      HAVING COUNT(rc.id) < $1
    ) sub
  `, [MIN_CANDIDATES_PER_REQUISITION]);
  return {
    requisitions,
    candidates,
    avg,
    requisitions_under_min_cand: underMinR.rows[0].c,
    pass:
      requisitions >= GROUP_MIN_REQUISITIONS &&
      candidates >= GROUP_MIN_CANDIDATES &&
      avg >= MIN_CANDIDATES_PER_REQUISITION - 1e-6 &&
      underMinR.rows[0].c === 0,
  };
}

async function loadRequisitionCandCounts(client) {
  const r = await client.query(`
    SELECT
      jr.id,
      jr.company_id::text AS company_id,
      jr.title,
      COUNT(rc.id)::int AS cand_count
    FROM public.job_requisitions jr
    LEFT JOIN public.recruitment_candidates rc ON rc.requisition_id = jr.id
    GROUP BY jr.id, jr.company_id, jr.title
    ORDER BY cand_count ASC, jr.id
  `);
  return r.rows;
}

async function countRequisitionsBySlug(client, slug, kind) {
  const companyId = cidForSlug(slug, kind);
  const r = await client.query(
    `SELECT COUNT(*)::int AS c FROM public.job_requisitions WHERE company_id::text = $1::text`,
    [companyId],
  );
  return r.rows[0].c;
}

async function insertRequisitionsBatch(client, rows, kind) {
  if (rows.length === 0) return 0;
  const ids = [];
  const companyIds = [];
  const titles = [];
  const departments = [];
  for (const row of rows) {
    ids.push(row.id);
    companyIds.push(cidForSlug(row.slug, kind));
    titles.push(row.title);
    departments.push(row.department);
  }
  await client.query(
    `INSERT INTO public.job_requisitions
       (id, company_id, title, department, employment_type, status)
     SELECT
       unnest($1::uuid[]),
       unnest($2::text[]),
       unnest($3::text[]),
       unnest($4::text[]),
       'full-time',
       'open'
     ON CONFLICT (id) DO UPDATE SET
       title = EXCLUDED.title,
       department = EXCLUDED.department,
       status = EXCLUDED.status,
       updated_at = NOW()`,
    [ids, companyIds, titles, departments],
  );
  await trackMetaBatch(client, 'job_requisitions', ids);
  return rows.length;
}

async function insertCandidatesBatch(client, rows, kind) {
  if (rows.length === 0) return 0;
  const ids = [];
  const companyIds = [];
  const requisitionIds = [];
  const fullNames = [];
  const emails = [];
  const sources = [];
  const statuses = [];
  for (const row of rows) {
    ids.push(row.id);
    companyIds.push(row.company_id);
    requisitionIds.push(row.requisition_id);
    fullNames.push(row.full_name);
    emails.push(row.email);
    sources.push(row.source);
    statuses.push(row.status);
  }
  const companyCast = kind === 'uuid' ? 'uuid[]' : 'text[]';
  await client.query(
    `INSERT INTO public.recruitment_candidates
       (id, company_id, requisition_id, full_name, email, source, status)
     SELECT
       unnest($1::uuid[]),
       unnest($2::${companyCast}),
       unnest($3::uuid[]),
       unnest($4::text[]),
       unnest($5::text[]),
       unnest($6::text[]),
       unnest($7::text[])
     ON CONFLICT (id) DO UPDATE SET
       source = EXCLUDED.source,
       status = EXCLUDED.status,
       updated_at = NOW()`,
    [ids, companyIds, requisitionIds, fullNames, emails, sources, statuses],
  );
  await trackMetaBatch(client, 'recruitment_candidates', ids);
  return rows.length;
}

function buildCandidateRows(requisition, kind, startSlot, count) {
  const rows = [];
  const slug = slugFromCompanyId(requisition.company_id);
  const companyId = cidForSlug(slug, kind);
  for (let i = 0; i < count; i += 1) {
    const slot = startSlot + i;
    const id = candidateId(requisition.id, slot);
    rows.push({
      id,
      company_id: companyId,
      requisition_id: requisition.id,
      full_name: `UV Density ${slug} ${String(slot).padStart(2, '0')}`,
      email: `rec.density.${slug}.${requisition.id.slice(0, 8)}.${slot}@mail.xe.vn`,
      source: CANDIDATE_SOURCES[slot % CANDIDATE_SOURCES.length],
      status: CANDIDATE_STATUSES[slot % CANDIDATE_STATUSES.length],
    });
  }
  return rows;
}

async function seedPerSlugRequisitions(client, companies, kind) {
  let inserted = 0;
  const perSlug = [];
  for (const slug of companies) {
    const existing = await countRequisitionsBySlug(client, slug, kind);
    const need = Math.max(0, MIN_REQUISITIONS_PER_SLUG - existing);
    const rows = [];
    for (let i = 0; i < need; i += 1) {
      const slot = existing + i;
      rows.push({
        id: requisitionId(slug, slot),
        slug,
        title: `Tuyển dụng ${slug} #${slot + 1}`,
        department: DEPARTMENTS[slot % DEPARTMENTS.length],
      });
    }
    const coInserted = await insertRequisitionsBatch(client, rows, kind);
    inserted += coInserted;
    perSlug.push({ company: slug, requisitions: existing + coInserted, inserted: coInserted });
  }
  return { inserted, per_slug: perSlug };
}

async function seedCandidatesPerRequisition(client, kind) {
  const requisitions = await loadRequisitionCandCounts(client);
  const candidateRows = [];
  let reqsTopped = 0;

  for (const req of requisitions) {
    const need = Math.max(0, MIN_CANDIDATES_PER_REQUISITION - req.cand_count);
    if (need === 0) continue;
    reqsTopped += 1;
    const startSlot = req.cand_count;
    candidateRows.push(...buildCandidateRows(req, kind, startSlot, need));
  }

  let inserted = 0;
  const batchSize = 100;
  for (let i = 0; i < candidateRows.length; i += batchSize) {
    inserted += await insertCandidatesBatch(client, candidateRows.slice(i, i + batchSize), kind);
  }

  return { inserted, requisitions_topped: reqsTopped };
}

export async function seedRecruitmentDensity(client) {
  await ensureMetadataSchema(client);
  const kind = await companyIdKind(client, 'job_requisitions');

  const slugReqs = await seedPerSlugRequisitions(client, PER_COMPANY_TARGETS, kind);
  const candidates = await seedCandidatesPerRequisition(client, kind);
  const stats = await recruitmentFidelityStats(client);

  return {
    ...stats,
    group_min_requisitions: GROUP_MIN_REQUISITIONS,
    group_min_candidates: GROUP_MIN_CANDIDATES,
    min_candidates_per_requisition: MIN_CANDIDATES_PER_REQUISITION,
    ac_fid_09_pass: stats.pass,
    inserted_requisitions: slugReqs.inserted,
    inserted_candidates: candidates.inserted,
    per_slug: slugReqs.per_slug,
    requisitions_topped: candidates.requisitions_topped,
  };
}

async function main() {
  const client = new Client(baseConfig);
  await client.connect();

  try {
    await client.query('BEGIN');
    const result = await seedRecruitmentDensity(client);

    await client.query(
      `INSERT INTO public.hrm_seed_runs (seed_tag, ran_at, metadata)
       VALUES ($1, NOW(), $2::jsonb)
       ON CONFLICT (seed_tag) DO UPDATE SET ran_at = NOW(), metadata = EXCLUDED.metadata`,
      [
        RECRUITMENT_DENSITY_SEED_TAG,
        JSON.stringify({
          seed_tag: RECRUITMENT_DENSITY_SEED_TAG,
          ...result,
          work_item_id: 'P1-HRM-H19-AC-FID-09-REC',
        }),
      ],
    );

    await client.query('COMMIT');
    console.log(JSON.stringify({ success: true, ...result }, null, 2));

    if (!result.ac_fid_09_pass) {
      console.error(
        `AC-FID-09 FAIL: requisitions=${result.requisitions} candidates=${result.candidates} avg=${result.avg.toFixed(3)}`,
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
