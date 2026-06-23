#!/usr/bin/env node
/**
 * AC-FID-16 / BR-LINK-03 — align transactional catalog fields with synced_catalogs codes.
 * work_item_id: P1-HRM-H26-AC-FID-16-LINEAGE-FIX
 * Idempotent — safe to re-run on five UAT slugs.
 */
import pg from 'pg';
import { loadDeployEnv } from './seed-env-loader.mjs';
import { UAT_COMPANIES, resolveMasterTenant } from './lib/uat-workforce.mjs';
import {
  buildUatJobTitleCatalogItems,
  patchJobTitlesPayload,
  resolveCandidateSourceCode,
  resolveContractTypeCode,
  resolveLeaveTypeCode,
} from './lib/hrm-catalog-lineage.mjs';

loadDeployEnv();

const { Client } = pg;

export const CATALOG_LINEAGE_SEED_TAG =
  process.env.HRM_CATALOG_LINEAGE_SEED_TAG ?? 'p1-hrm-h26-ac-fid-16-lineage-fix';

const PER_COMPANY_TARGETS = (
  process.env.HRM_CATALOG_LINEAGE_COMPANIES ?? UAT_COMPANIES.join(',')
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

async function ensureMetadataSchema(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS public.hrm_seed_runs (
      seed_tag TEXT PRIMARY KEY,
      ran_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      metadata JSONB NOT NULL DEFAULT '{}'::jsonb
    );
  `);
}

async function expandJobTitlesSnapshot(client, tenantId, companySlug) {
  const r = await client.query(
    `SELECT payload, source_system, version, checksum
     FROM public.synced_catalogs
     WHERE tenant_id = $1 AND company_id = $2 AND catalog_key = 'job_titles'
     LIMIT 1`,
    [tenantId, companySlug],
  );

  const existing = r.rows[0];
  const payload = patchJobTitlesPayload(existing?.payload, companySlug, tenantId);
  const checksum =
    existing?.checksum ??
    Buffer.from(JSON.stringify(payload)).toString('base64').slice(0, 64);

  await client.query(
    `INSERT INTO public.synced_catalogs
       (tenant_id, company_id, catalog_key, source_system, payload, version, checksum, synced_at)
     VALUES ($1, $2, 'job_titles', $3, $4::jsonb, $5, $6, NOW())
     ON CONFLICT (tenant_id, company_id, catalog_key) DO UPDATE SET
       payload = EXCLUDED.payload,
       version = EXCLUDED.version,
       checksum = EXCLUDED.checksum,
       synced_at = NOW()`,
    [
      tenantId,
      companySlug,
      existing?.source_system ?? 'xbos',
      JSON.stringify(payload),
      existing?.version ?? 1,
      checksum,
    ],
  );

  return {
    company_id: companySlug,
    item_count: payload.items.length,
    required_count: buildUatJobTitleCatalogItems().length,
  };
}

async function migrateDistinctColumn(client, table, column, companyFilterSql, companyParams, resolver) {
  const distinctR = await client.query(
    `SELECT DISTINCT ${column} AS raw FROM public.${table} ${companyFilterSql}`,
    companyParams,
  );
  let updated = 0;
  for (const row of distinctR.rows) {
    const raw = row.raw;
    const mapped = resolver(raw);
    if (!mapped || mapped === raw) continue;

    const params = [mapped, raw, ...companyParams];
    const scopeParamIndex = params.length;
    const companyClause = companyFilterSql
      ? ` ${companyFilterSql.replace(/^WHERE /i, 'AND ').replace(/\$1/g, `$${scopeParamIndex}`)}`
      : '';
    const setClause =
      table === 'leave_requests' || table === 'recruitment_candidates'
        ? `${column} = $1`
        : `${column} = $1, updated_at = NOW()`;

    const u = await client.query(
      `UPDATE public.${table}
       SET ${setClause}
       WHERE ${column} = $2${companyClause}`,
      params,
    );
    updated += u.rowCount ?? 0;
  }
  return updated;
}

async function migrateContractTypes(client, companySlug) {
  return migrateDistinctColumn(
    client,
    'employee_contracts',
    'contract_type',
    'WHERE company_id = $1',
    [companySlug],
    resolveContractTypeCode,
  );
}

async function migrateLeaveTypes(client) {
  return migrateDistinctColumn(
    client,
    'leave_requests',
    'leave_type',
    '',
    [],
    resolveLeaveTypeCode,
  );
}

async function migrateCandidateSources(client, companySlug) {
  const kindR = await client.query(
    `SELECT data_type FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = 'recruitment_candidates' AND column_name = 'company_id'`,
  );
  const isUuid = kindR.rows[0]?.data_type === 'uuid';
  if (isUuid) {
    const COMPANY_UUID_MAP = {
      holding: '10000000-0000-4000-8000-000000000001',
      trsport: '10000000-0000-4000-8000-000000000002',
      logistics: '10000000-0000-4000-8000-000000000003',
      finance: '10000000-0000-4000-8000-000000000004',
      services: '10000000-0000-4000-8000-000000000005',
    };
    const cid = COMPANY_UUID_MAP[companySlug] ?? companySlug;
    return migrateDistinctColumn(
      client,
      'recruitment_candidates',
      'source',
      'WHERE company_id::text = $1::text',
      [cid],
      resolveCandidateSourceCode,
    );
  }
  return migrateDistinctColumn(
    client,
    'recruitment_candidates',
    'source',
    'WHERE company_id = $1',
    [companySlug],
    resolveCandidateSourceCode,
  );
}

export async function seedCatalogLineageFix(client) {
  await ensureMetadataSchema(client);
  const tenantId = resolveMasterTenant();
  const perCompany = [];
  let jobTitlesExpanded = 0;
  let contractsUpdated = 0;
  let leaveUpdated = 0;
  let candidatesUpdated = 0;

  for (const slug of PER_COMPANY_TARGETS) {
    const job = await expandJobTitlesSnapshot(client, tenantId, slug);
    jobTitlesExpanded += 1;
    const contracts = await migrateContractTypes(client, slug);
    const candidates = await migrateCandidateSources(client, slug);
    contractsUpdated += contracts;
    candidatesUpdated += candidates;
    perCompany.push({
      company_id: slug,
      job_titles_items: job.item_count,
      contracts_updated: contracts,
      candidates_updated: candidates,
    });
  }

  leaveUpdated = await migrateLeaveTypes(client);

  return {
    seed_tag: CATALOG_LINEAGE_SEED_TAG,
    tenant_id: tenantId,
    companies: PER_COMPANY_TARGETS,
    job_titles_snapshots_expanded: jobTitlesExpanded,
    contracts_updated: contractsUpdated,
    leave_updated: leaveUpdated,
    candidates_updated: candidatesUpdated,
    per_company: perCompany,
  };
}

async function main() {
  const client = new Client(baseConfig);
  await client.connect();

  try {
    await client.query('BEGIN');
    const result = await seedCatalogLineageFix(client);

    await client.query(
      `INSERT INTO public.hrm_seed_runs (seed_tag, ran_at, metadata)
       VALUES ($1, NOW(), $2::jsonb)
       ON CONFLICT (seed_tag) DO UPDATE SET ran_at = NOW(), metadata = EXCLUDED.metadata`,
      [
        CATALOG_LINEAGE_SEED_TAG,
        JSON.stringify({
          ...result,
          work_item_id: 'P1-HRM-H26-AC-FID-16-LINEAGE-FIX',
        }),
      ],
    );

    await client.query('COMMIT');
    console.log(JSON.stringify({ success: true, ...result }, null, 2));
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
