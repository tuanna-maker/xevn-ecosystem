#!/usr/bin/env node
/**
 * Phase 0 — baseline employee counts by OU slug and tenant_id partition.
 * Usage: node scripts/migrate/tenant-only-scope/verify-counts.mjs
 */
import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createPgPool } from './load-env.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const mapPath = path.join(__dirname, 'ou-to-tenant-map.json');
const map = JSON.parse(fs.readFileSync(mapPath, 'utf8'));

async function main() {
  const pool = createPgPool(pg.Pool);
  try {
    console.log('=== By legacy OU (company_id) ===');
    const byOu = await pool.query(`
      SELECT company_id, COUNT(*)::int AS cnt
      FROM public.employees
      WHERE archived_at IS NULL
      GROUP BY company_id
      ORDER BY cnt DESC
    `);
    for (const row of byOu.rows) {
      console.log(`  ${row.company_id}: ${row.cnt}`);
    }

    console.log('\n=== By custom_fields.tenant_id ===');
    const byTenant = await pool.query(`
      SELECT COALESCE(NULLIF(TRIM(custom_fields->>'tenant_id'), ''), '(empty→xevn)') AS tenant_id,
             COUNT(*)::int AS cnt
      FROM public.employees
      WHERE archived_at IS NULL
      GROUP BY 1
      ORDER BY cnt DESC
    `);
    for (const row of byTenant.rows) {
      console.log(`  ${row.tenant_id}: ${row.cnt}`);
    }

    console.log('\n=== Mapping check (OU → expected tenant after migrate) ===');
    for (const m of map.mappings) {
      const { rows } = await pool.query(
        `SELECT COUNT(*)::int AS cnt FROM public.employees
         WHERE archived_at IS NULL AND company_id = $1`,
        [m.legacy_ou_slug],
      );
      console.log(`  ${m.legacy_ou_slug} → ${m.target_tenant_id}: ${rows[0].cnt} rows`);
    }
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
