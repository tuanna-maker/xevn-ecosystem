#!/usr/bin/env node
/**
 * Backfill synced_catalogs until AC-FID-10 passes:
 *   COUNT(DISTINCT catalog_key) >= 8 per pilot company (5 UAT slugs).
 * work_item_id: P1-HRM-H20-AC-FID-10-CAT
 * Idempotent — copies canonical rows from holding (or XBOS defs fallback); safe to re-run.
 */
import pg from 'pg';
import { loadDeployEnv } from './seed-env-loader.mjs';
import { HRM_XBOS_CATALOG_DEFS } from './lib/hrm-xbos-catalog-defs.mjs';
import { UAT_COMPANIES } from './lib/uat-workforce.mjs';

loadDeployEnv();

const { Client } = pg;

export const CATALOG_DENSITY_SEED_TAG =
  process.env.HRM_CATALOG_DENSITY_SEED_TAG ?? 'p1-hrm-h20-catalog-density';
const MIN_KEYS = Number(process.env.HRM_FIDELITY_MIN_CATALOG_KEYS ?? 8);
const SOURCE_COMPANY = process.env.HRM_CATALOG_DENSITY_SOURCE ?? 'holding';
const PER_COMPANY_TARGETS = (
  process.env.HRM_CATALOG_DENSITY_COMPANIES ?? UAT_COMPANIES.join(',')
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

const tenantId = process.env.MASTER_TENANT_ID ?? 'xevn';

function patchPayloadCompanyId(payload, companySlug) {
  if (!payload || typeof payload !== 'object') return payload;
  return { ...payload, companyId: companySlug };
}

function fallbackTemplateRows(companySlug) {
  const keys = HRM_XBOS_CATALOG_DEFS.slice(0, Math.max(MIN_KEYS, 8));
  return keys.map((def) => {
    const payload = {
      contractVersion: 'xbos-config-v1',
      checksumAlgorithm: 'sha256:items-canonical-v1',
      tenantId,
      companyId: companySlug,
      key: def.key,
      name: def.name,
      domain: def.domain,
      assignedTo: ['hrm', 'xbos', 'web-portal'],
      version: 1,
      checksum: `seed:${def.key}`,
      updatedAt: new Date().toISOString(),
      items: def.items,
    };
    return {
      catalog_key: def.key,
      source_system: 'xbos',
      payload,
      version: 1,
      checksum: Buffer.from(JSON.stringify(payload)).toString('base64'),
    };
  });
}

async function ensureMetadataSchema(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS public.hrm_seed_runs (
      seed_tag TEXT PRIMARY KEY,
      ran_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      metadata JSONB NOT NULL DEFAULT '{}'::jsonb
    );
  `);
}

export async function companyCatalogStats(client, companySlug) {
  const r = await client.query(
    `SELECT COUNT(DISTINCT catalog_key)::int AS c
     FROM public.synced_catalogs
     WHERE tenant_id = $1 AND company_id = $2`,
    [tenantId, companySlug],
  );
  const distinct_keys = r.rows[0].c;
  return {
    company_id: companySlug,
    distinct_keys,
    target: MIN_KEYS,
    ok: distinct_keys >= MIN_KEYS,
  };
}

async function loadTemplateRows(client) {
  const r = await client.query(
    `SELECT catalog_key, source_system, payload, version, checksum
     FROM public.synced_catalogs
     WHERE tenant_id = $1 AND company_id = $2
     ORDER BY catalog_key`,
    [tenantId, SOURCE_COMPANY],
  );
  if (r.rows.length >= MIN_KEYS) return r.rows;
  return fallbackTemplateRows(SOURCE_COMPANY);
}

async function upsertCatalogBatch(client, companySlug, rows) {
  if (rows.length === 0) return 0;
  const keys = rows.map((r) => r.catalog_key);
  const sources = rows.map((r) => r.source_system ?? 'xbos');
  const payloads = rows.map((r) =>
    JSON.stringify(patchPayloadCompanyId(r.payload, companySlug)),
  );
  const versions = rows.map((r) => r.version ?? 1);
  const checksums = rows.map((r) => r.checksum ?? '');

  const result = await client.query(
    `INSERT INTO public.synced_catalogs
       (tenant_id, company_id, catalog_key, source_system, payload, version, checksum, synced_at)
     SELECT $1, $2, k, s, p::jsonb, v, c, NOW()
     FROM unnest($3::text[], $4::text[], $5::text[], $6::int[], $7::text[])
       AS t(k, s, p, v, c)
     ON CONFLICT (tenant_id, company_id, catalog_key) DO UPDATE SET
       source_system = EXCLUDED.source_system,
       payload = EXCLUDED.payload,
       version = EXCLUDED.version,
       checksum = EXCLUDED.checksum,
       synced_at = NOW()
     RETURNING catalog_key`,
    [tenantId, companySlug, keys, sources, payloads, versions, checksums],
  );
  return result.rowCount ?? 0;
}

async function backfillCompany(client, companySlug, templateRows) {
  const before = await companyCatalogStats(client, companySlug);
  if (before.ok) {
    return {
      company_id: companySlug,
      before: before.distinct_keys,
      inserted: 0,
      after: before.distinct_keys,
      ok: true,
    };
  }

  const existing = await client.query(
    `SELECT catalog_key FROM public.synced_catalogs
     WHERE tenant_id = $1 AND company_id = $2`,
    [tenantId, companySlug],
  );
  const have = new Set(existing.rows.map((r) => r.catalog_key));
  const missing = templateRows.filter((r) => !have.has(r.catalog_key));

  let rowsToUpsert;
  if (have.size === 0) {
    rowsToUpsert = templateRows;
  } else {
    const need = MIN_KEYS - have.size;
    rowsToUpsert = missing.slice(0, Math.max(need, 0));
  }

  const upserted = await upsertCatalogBatch(client, companySlug, rowsToUpsert);
  const after = await companyCatalogStats(client, companySlug);
  return {
    company_id: companySlug,
    before: before.distinct_keys,
    inserted: upserted,
    after: after.distinct_keys,
    ok: after.ok,
  };
}

async function main() {
  const client = new Client(baseConfig);
  await client.connect();
  await ensureMetadataSchema(client);

  const templateRows = await loadTemplateRows(client);
  if (templateRows.length < MIN_KEYS) {
    throw new Error(
      `Template company "${SOURCE_COMPANY}" has ${templateRows.length} keys; need >= ${MIN_KEYS}. Run sync-hrm-catalogs-from-xbos-db.mjs first.`,
    );
  }

  const results = [];
  try {
    await client.query('BEGIN');
    for (const slug of PER_COMPANY_TARGETS) {
      results.push(await backfillCompany(client, slug, templateRows));
    }
    await client.query(
      `INSERT INTO public.hrm_seed_runs (seed_tag, metadata)
       VALUES ($1, $2::jsonb)
       ON CONFLICT (seed_tag) DO UPDATE SET ran_at = NOW(), metadata = EXCLUDED.metadata`,
      [
        CATALOG_DENSITY_SEED_TAG,
        JSON.stringify({
          work_item_id: 'P1-HRM-H20-AC-FID-10-CAT',
          min_keys: MIN_KEYS,
          source_company: SOURCE_COMPANY,
          template_keys: templateRows.length,
          companies: results,
        }),
      ],
    );
    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    await client.end();
  }

  const allOk = results.every((r) => r.ok !== false && r.after >= MIN_KEYS);
  console.log(
    JSON.stringify(
      {
        success: allOk,
        work_item_id: 'P1-HRM-H20-AC-FID-10-CAT',
        seed_tag: CATALOG_DENSITY_SEED_TAG,
        min_keys: MIN_KEYS,
        source_company: SOURCE_COMPANY,
        template_keys: templateRows.length,
        companies: results,
      },
      null,
      2,
    ),
  );
  if (!allOk) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
