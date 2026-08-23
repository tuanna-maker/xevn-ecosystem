#!/usr/bin/env node
/**
 * Phase 2 — backfill employees from legacy OU partition to tenant_id + company_id=main.
 * Usage: node scripts/migrate/tenant-only-scope/backfill-employees.mjs [--dry-run]
 */
import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createPgPool } from './load-env.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dryRun = process.argv.includes('--dry-run');
const map = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'ou-to-tenant-map.json'), 'utf8'),
);

async function main() {
  const pool = createPgPool(pg.Pool);
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    let total = 0;
    for (const m of map.mappings) {
      const sql = `
        UPDATE public.employees
        SET
          custom_fields = jsonb_set(
            COALESCE(custom_fields, '{}'::jsonb),
            '{tenant_id}',
            to_jsonb($1::text),
            true
          ),
          company_id = $2,
          updated_at = NOW()
        WHERE company_id = $3
          AND COALESCE(NULLIF(TRIM(custom_fields->>'tenant_id'), ''), 'xevn') = 'xevn'
      `;
      if (dryRun) {
        const { rows } = await client.query(
          `SELECT COUNT(*)::int AS cnt FROM public.employees
           WHERE company_id = $1
             AND COALESCE(NULLIF(TRIM(custom_fields->>'tenant_id'), ''), 'xevn') = 'xevn'`,
          [m.legacy_ou_slug],
        );
        console.log(`[dry-run] ${m.legacy_ou_slug} → ${m.target_tenant_id}/main: ${rows[0].cnt} rows`);
        total += rows[0].cnt;
      } else {
        const res = await client.query(sql, [
          m.target_tenant_id,
          map.post_migrate_company_id,
          m.legacy_ou_slug,
        ]);
        console.log(`${m.legacy_ou_slug} → ${m.target_tenant_id}/main: ${res.rowCount} rows`);
        total += res.rowCount ?? 0;
      }
    }
    if (dryRun) {
      await client.query('ROLLBACK');
      console.log(`\n[dry-run] Would update ${total} employees. No changes committed.`);
    } else {
      await client.query('COMMIT');
      console.log(`\nCommitted ${total} employee row updates.`);
    }
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
