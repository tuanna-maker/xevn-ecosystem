#!/usr/bin/env node
/**
 * Phase 2b — add tenant_id column + backfill OU-partitioned HRM tables.
 * Usage: node scripts/migrate/tenant-only-scope/backfill-scoped-tables.mjs [--dry-run]
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

const TABLES = [
  'payroll_periods',
  'payroll_payslips',
  'departments',
  'hr_decisions',
  'job_requisitions',
  'recruitment_candidates',
  'recruitment_interviews',
  'rec_candidate_stage_history',
  'rec_mail_outbox',
  'rec_mail_log',
  'job_postings',
  'candidates',
  'candidate_applications',
  'recruitment_plans',
  'headcount_proposals',
  'candidate_evaluations',
  'evaluation_criteria_templates',
  'recruitment_plan_departments',
  'recruitment_plan_positions',
  'job_description_templates',
  'interviews',
  'rec_pipeline_stage',
];

async function tableExists(client, table) {
  const { rows } = await client.query(
    `SELECT 1 FROM information_schema.tables
     WHERE table_schema = 'public' AND table_name = $1 LIMIT 1`,
    [table],
  );
  return rows.length > 0;
}

async function ensureTenantColumn(client, table) {
  await client.query(
    `ALTER TABLE public.${table} ADD COLUMN IF NOT EXISTS tenant_id TEXT`,
  );
  const indexName = `idx_${table.slice(0, 40)}_tenant_co`;
  await client.query(
    `CREATE INDEX IF NOT EXISTS ${indexName} ON public.${table} (tenant_id, company_id)`,
  );
}

async function backfillTableRows(client, table, m, dryRun) {
  if (table === 'payroll_periods') {
    if (!dryRun) {
      await client.query(
        `DELETE FROM public.payroll_periods ou
         WHERE ou.company_id = $1
           AND EXISTS (
             SELECT 1 FROM public.payroll_periods main
             WHERE main.company_id = $2
               AND main.start_date = ou.start_date
               AND main.end_date = ou.end_date
           )`,
        [m.legacy_ou_slug, map.post_migrate_company_id],
      );
    }
  }

  const countSql = dryRun
    ? `SELECT COUNT(*)::int AS cnt FROM public.${table} WHERE company_id = $1`
    : `SELECT COUNT(*)::int AS cnt FROM public.${table}
        WHERE company_id = $1
          AND COALESCE(NULLIF(TRIM(tenant_id), ''), 'xevn') = 'xevn'`;
  const updateSql = `UPDATE public.${table}
    SET tenant_id = $1, company_id = $2
    WHERE company_id = $3
      AND COALESCE(NULLIF(TRIM(tenant_id), ''), 'xevn') = 'xevn'`;

  if (dryRun) {
    const { rows } = await client.query(countSql, [m.legacy_ou_slug]);
    return rows[0]?.cnt ?? 0;
  }

  const res = await client.query(updateSql, [
    m.target_tenant_id,
    map.post_migrate_company_id,
    m.legacy_ou_slug,
  ]);
  return res.rowCount ?? 0;
}

async function main() {
  const pool = createPgPool(pg.Pool);
  const client = await pool.connect();
  let total = 0;
  try {
    for (const table of TABLES) {
      if (!(await tableExists(client, table))) {
        console.log(`[skip] ${table} — table not found`);
        continue;
      }
      await client.query('BEGIN');
      try {
        if (!dryRun) {
          await ensureTenantColumn(client, table);
        }
        let tableTotal = 0;
        for (const m of map.mappings) {
          const cnt = await backfillTableRows(client, table, m, dryRun);
          if (cnt > 0) {
            console.log(
              `${dryRun ? '[dry-run] ' : ''}${table} ${m.legacy_ou_slug} → ${m.target_tenant_id}/main: ${cnt}`,
            );
            tableTotal += cnt;
          }
        }
        if (dryRun) {
          await client.query('ROLLBACK');
        } else {
          await client.query('COMMIT');
        }
        total += tableTotal;
      } catch (err) {
        await client.query('ROLLBACK');
        console.error(`[error] ${table}: ${err.message}`);
      }
    }
    if (dryRun) {
      console.log(`\n[dry-run] Would update ${total} scoped-table rows.`);
    } else {
      console.log(`\nCommitted ${total} scoped-table row updates.`);
    }
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
