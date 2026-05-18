#!/usr/bin/env node
/** Seed xevn_ecosystem_capabilities from apps/api/xbos-api/data/ecosystem-capability-registry.seed.json */
import fs from 'node:fs';
import path from 'node:path';
import pg from 'pg';
import { fileURLToPath } from 'node:url';
import { loadDeployEnv } from './seed-env-loader.mjs';

loadDeployEnv();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const seedPath = path.join(__dirname, '../apps/api/xbos-api/data/ecosystem-capability-registry.seed.json');
const rows = JSON.parse(fs.readFileSync(seedPath, 'utf8'));

const client = new pg.Client({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME_XBOS ?? 'xevn_xbos',
  ssl: false,
});

await client.connect();
await client.query(`
  CREATE TABLE IF NOT EXISTS public.xevn_ecosystem_capabilities (
    capability_code TEXT PRIMARY KEY,
    module_code TEXT NOT NULL,
    feature_name_vi TEXT NOT NULL,
    route_or_entry TEXT NULL,
    srs_ref TEXT NULL,
    fe_status TEXT NOT NULL DEFAULT 'none',
    be_status TEXT NOT NULL DEFAULT 'none',
    db_status TEXT NOT NULL DEFAULT 'none',
    e2e_pass BOOLEAN NOT NULL DEFAULT FALSE,
    last_verified_at TIMESTAMPTZ NULL,
    last_verified_by TEXT NULL,
    evidence_path TEXT NULL,
    qa_notes TEXT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
`);

for (const row of rows) {
  await client.query(
    `
    INSERT INTO public.xevn_ecosystem_capabilities (
      capability_code, module_code, feature_name_vi, route_or_entry, srs_ref,
      fe_status, be_status, db_status, e2e_pass, qa_notes
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
    ON CONFLICT (capability_code) DO UPDATE SET
      module_code = EXCLUDED.module_code,
      feature_name_vi = EXCLUDED.feature_name_vi,
      route_or_entry = EXCLUDED.route_or_entry,
      srs_ref = EXCLUDED.srs_ref,
      fe_status = EXCLUDED.fe_status,
      be_status = EXCLUDED.be_status,
      db_status = EXCLUDED.db_status,
      updated_at = NOW()
    `,
    [
      row.capability_code,
      row.module_code,
      row.feature_name_vi,
      row.route_or_entry ?? null,
      row.srs_ref ?? null,
      row.fe_status ?? 'none',
      row.be_status ?? 'none',
      row.db_status ?? 'none',
      Boolean(row.e2e_pass),
      row.qa_notes ?? null,
    ],
  );
}

const { rows: counts } = await client.query(
  `SELECT COUNT(*)::int AS total, COUNT(*) FILTER (WHERE e2e_pass)::int AS passed FROM public.xevn_ecosystem_capabilities`,
);
await client.end();
console.log(`✓ Capability registry: ${counts[0].total} rows (${counts[0].passed} e2e_pass=true)`);
