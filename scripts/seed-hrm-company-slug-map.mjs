#!/usr/bin/env node
/**
 * Seed company_slug_map display_name bridge for 5 GROUP_MEMBER_SLUGS (G-INT-03).
 * work_item_id: PCOMP-W3-BE-04
 * spec_ref: docs/program/governance/p1-prod-int-ba-d-01-20260607.md §3.3, §5
 * Idempotent — safe to re-run; preserves non-empty display_name on conflict.
 */
import pg from 'pg';
import { loadDeployEnv } from './seed-env-loader.mjs';
import {
  buildCompanySlugMapSeedRows,
  GROUP_MEMBER_SLUGS,
  MASTER_TENANT_ID,
} from './lib/hrm-company-slug-map.mjs';

loadDeployEnv();

const { Client } = pg;

const required = ['DB_HOST', 'DB_PORT', 'DB_USER', 'DB_PASSWORD'];
for (const key of required) {
  if (!process.env[key]) throw new Error(`Missing required env: ${key}`);
}

const client = new Client({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.HRM_DB_NAME || process.env.DB_NAME_HRM || 'xevn_hrm',
  ssl: false,
});

async function ensureSchema() {
  await client.query(`
    CREATE TABLE IF NOT EXISTS public.company_slug_map (
      tenant_id TEXT NOT NULL,
      company_slug TEXT NOT NULL,
      company_uuid UUID NOT NULL,
      is_default BOOLEAN NOT NULL DEFAULT FALSE,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (tenant_id, company_slug)
    );
  `);
  await client.query(`
    ALTER TABLE public.company_slug_map
    ADD COLUMN IF NOT EXISTS display_name TEXT;
  `);
}

async function upsertSlugMapRows() {
  let inserted = 0;
  let updated = 0;
  for (const row of buildCompanySlugMapSeedRows()) {
    const before = await client.query(
      `SELECT company_slug, display_name, company_uuid::text
       FROM public.company_slug_map
       WHERE tenant_id = $1 AND company_slug = $2`,
      [row.tenant_id, row.company_slug],
    );
    await client.query(
      `INSERT INTO public.company_slug_map (tenant_id, company_slug, company_uuid, display_name, updated_at)
       VALUES ($1, $2, $3::uuid, $4, NOW())
       ON CONFLICT (tenant_id, company_slug) DO UPDATE SET
         display_name = CASE
           WHEN NULLIF(TRIM(company_slug_map.display_name), '') IS NULL THEN EXCLUDED.display_name
           WHEN company_slug_map.display_name ~ '^Khối[[:space:]]' THEN EXCLUDED.display_name
           ELSE company_slug_map.display_name
         END,
         company_uuid = EXCLUDED.company_uuid,
         updated_at = NOW()`,
      [row.tenant_id, row.company_slug, row.company_uuid, row.display_name],
    );
    if (before.rows.length === 0) inserted += 1;
    else updated += 1;
  }
  return { inserted, updated };
}

async function verifySlugMap() {
  const res = await client.query(
    `SELECT company_slug, company_uuid::text, display_name
     FROM public.company_slug_map
     WHERE tenant_id = $1
     ORDER BY company_slug`,
    [MASTER_TENANT_ID],
  );
  const bySlug = Object.fromEntries(res.rows.map((r) => [r.company_slug, r]));
  const missing = GROUP_MEMBER_SLUGS.filter((s) => !bySlug[s]);
  const blank = GROUP_MEMBER_SLUGS.filter((s) => !bySlug[s]?.display_name?.trim());
  return {
    count: res.rows.length,
    missing,
    blank,
    rows: res.rows,
  };
}

async function main() {
  console.log('seed-hrm-company-slug-map  PCOMP-W3-BE-04  G-INT-03\n');
  await client.connect();
  try {
    await ensureSchema();
    const { inserted, updated } = await upsertSlugMapRows();
    const check = await verifySlugMap();
    console.log(`Upserted ${GROUP_MEMBER_SLUGS.length} slugs (new=${inserted} touched=${updated})`);
    console.log(`company_slug_map rows for tenant_id=${MASTER_TENANT_ID}: ${check.count}`);
    for (const row of check.rows) {
      console.log(`  ${row.company_slug}  uuid=${row.company_uuid}  display_name=${row.display_name}`);
    }
    if (check.missing.length || check.blank.length || check.count !== GROUP_MEMBER_SLUGS.length) {
      console.error('\nFAIL — expected 5 slugs with non-empty display_name');
      if (check.missing.length) console.error(`  missing: ${check.missing.join(', ')}`);
      if (check.blank.length) console.error(`  blank display_name: ${check.blank.join(', ')}`);
      process.exit(1);
    }
    console.log('\n=== SEED PASS ===');
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
