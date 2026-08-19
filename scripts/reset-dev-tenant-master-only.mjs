#!/usr/bin/env node
/**
 * Dev DB reset — keep XBOS org-foundation + tenant master; wipe HRM transactional / test data.
 * work_item_id: D-DEV-RESET-TENANT-MASTER-01
 * Sponsor lock: bootstrap dev — FE-first re-test (U65).
 *
 * Usage:
 *   ALLOW_DEV_TENANT_MASTER_RESET=true node scripts/reset-dev-tenant-master-only.mjs
 *   node scripts/reset-dev-tenant-master-only.mjs --dry-run
 */
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import pg from 'pg';
import { loadDeployEnv, repoRoot } from './seed-env-loader.mjs';

loadDeployEnv();

const { Client } = pg;
const dryRun = process.argv.includes('--dry-run');
const skipBootstrap = process.argv.includes('--skip-bootstrap');

const required = ['DB_HOST', 'DB_PORT', 'DB_USER', 'DB_PASSWORD'];
for (const key of required) {
  if (!process.env[key]) throw new Error(`Missing required env: ${key}`);
}

if (!dryRun && process.env.ALLOW_DEV_TENANT_MASTER_RESET !== 'true') {
  throw new Error(
    'Destructive dev reset blocked. Set ALLOW_DEV_TENANT_MASTER_RESET=true (bootstrap dev sponsor lock).',
  );
}

const hrmDb = process.env.HRM_DB_NAME || process.env.DB_NAME_HRM || 'xevn_hrm';
const xbosDb = process.env.XBOS_DB_NAME || process.env.DB_NAME_XBOS || 'xevn_xbos';
const masterTenant = process.env.MASTER_TENANT_ID?.trim() || 'xevn';
const ceoEmail = 'ceo@xe.vn';
const portalPassword = 'Xevn@2026';

const baseConfig = {
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: false,
};

/** HRM tables preserved (org scope map — not transactional workforce). */
const HRM_KEEP = new Set(['company_slug_map', 'schema_migrations']);

/** XBOS org-foundation + RACI baseline + catalog shell from org bootstrap. */
const XBOS_KEEP = new Set([
  'schema_migrations',
  'config_catalogs',
  'config_catalog_items',
  'xbos_legal_entity',
  'xbos_org_unit',
  'xbos_tenant_registry',
  'xbos_user_tenant_membership',
  'xbos_position_template',
  'xbos_business_master_entries',
  'raci_catalog_version',
  'raci_activity_catalog',
  'raci_ecosystem_capability',
  'xbos_cc_permission_matrix_cell',
]);

function quoteIdent(name) {
  return `"${name.replace(/"/g, '""')}"`;
}

function hashMobilePassword(email, password) {
  return createHash('sha256').update(`${email.trim().toLowerCase()}:${password}`).digest('hex');
}

async function connectDb(database) {
  const client = new Client({ ...baseConfig, database });
  await client.connect();
  return client;
}

async function listPublicTables(client) {
  const r = await client.query(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    ORDER BY table_name;
  `);
  return r.rows.map((row) => row.table_name);
}

async function countTable(client, table) {
  try {
    const r = await client.query(`SELECT COUNT(*)::int AS c FROM public.${quoteIdent(table)}`);
    return r.rows[0]?.c ?? 0;
  } catch {
    return null;
  }
}

async function snapshotCounts(client, tables) {
  const out = {};
  for (const t of tables) {
    out[t] = await countTable(client, t);
  }
  return out;
}

async function truncateExcept(client, keepSet, label) {
  const all = await listPublicTables(client);
  const targets = all.filter((t) => !keepSet.has(t));
  if (targets.length === 0) {
    console.log(`  [${label}] nothing to truncate`);
    return { truncated: [], skipped: all };
  }
  const sql = `TRUNCATE ${targets.map((t) => `public.${quoteIdent(t)}`).join(', ')} RESTART IDENTITY CASCADE`;
  if (dryRun) {
    console.log(`  [${label}] DRY-RUN would truncate ${targets.length} tables`);
    return { truncated: targets, skipped: all.filter((t) => keepSet.has(t)) };
  }
  await client.query(sql);
  console.log(`  [${label}] truncated ${targets.length} tables (kept ${all.length - targets.length})`);
  return { truncated: targets, skipped: all.filter((t) => keepSet.has(t)) };
}

async function fixCeoMobileAuth(client) {
  const emp = await client.query(
    `SELECT id, email, custom_fields FROM public.employees WHERE lower(email) = lower($1) LIMIT 1`,
    [ceoEmail],
  );
  if (!emp.rows[0]) {
    console.log(`  CEO mobile auth: no HRM employee row for ${ceoEmail} (portal-only — OK)`);
    return { action: 'absent', employee_id: null };
  }
  const id = emp.rows[0].id;
  if (dryRun) {
    console.log(`  CEO mobile auth: DRY-RUN would remove employee ${id} (portal-only)`);
    return { action: 'dry-run-delete', employee_id: id };
  }
  await client.query(`DELETE FROM public.employees WHERE id = $1::uuid`, [id]);
  console.log(`  CEO mobile auth: removed HRM employee row ${ceoEmail} (portal-only; mobile uses uat.nv* from FE)`);
  return { action: 'deleted_employee', employee_id: id };
}

function runStep(title, cmd, args, opts = {}) {
  if (dryRun) {
    console.log(`\n▶ DRY-RUN skip: ${title}`);
    return 0;
  }
  console.log(`\n▶ ${title}`);
  const r = spawnSync(cmd, args, {
    cwd: repoRoot,
    stdio: 'inherit',
    shell: process.platform === 'win32',
    ...opts,
  });
  if (r.status !== 0) {
    throw new Error(`${title} failed (exit ${r.status ?? 'signal'})`);
  }
  return r.status;
}

async function main() {
  const report = {
    work_item_id: 'D-DEV-RESET-TENANT-MASTER-01',
    dry_run: dryRun,
    hrm_db: hrmDb,
    xbos_db: xbosDb,
    master_tenant: masterTenant,
    before: {},
    after: {},
    ceo_mobile_auth: null,
    bootstrap: [],
    exit_codes: {},
  };

  const hrmWatch = ['employees', 'employee_contracts', 'hrm_seed_metadata', 'attendance_records', 'payroll_periods'];
  const xbosWatch = [
    'xbos_legal_entity',
    'xbos_org_unit',
    'xbos_tenant_registry',
    'xbos_user_tenant_membership',
    'asset_registry',
    'xbos_legal_entity_shareholder',
  ];

  const hrm = await connectDb(hrmDb);
  const xbos = await connectDb(xbosDb);

  try {
    report.before.hrm = await snapshotCounts(hrm, hrmWatch);
    report.before.xbos = await snapshotCounts(xbos, xbosWatch);

    console.log('\n=== Phase 1: HRM wipe (keep company_slug_map) ===');
    await hrm.query('BEGIN');
    report.hrm_truncate = await truncateExcept(hrm, HRM_KEEP, 'hrm');
    report.ceo_mobile_auth = await fixCeoMobileAuth(hrm);
    if (dryRun) await hrm.query('ROLLBACK');
    else await hrm.query('COMMIT');

    console.log('\n=== Phase 2: XBOS wipe non-foundation ===');
    await xbos.query('BEGIN');
    report.xbos_truncate = await truncateExcept(xbos, XBOS_KEEP, 'xbos');
    if (dryRun) await xbos.query('ROLLBACK');
    else await xbos.query('COMMIT');

    report.after.hrm = dryRun ? report.before.hrm : await snapshotCounts(hrm, hrmWatch);
    report.after.xbos = dryRun ? report.before.xbos : await snapshotCounts(xbos, xbosWatch);
  } finally {
    await hrm.end();
    await xbos.end();
  }

  if (!dryRun && !skipBootstrap) {
    console.log('\n=== Phase 3: migrate + org bootstrap + tenant CEOs ===');
    runStep('migrate hrm', 'node', ['./scripts/migrate-apply.mjs', 'hrm', '--repair-checksums']);
    report.exit_codes['migrate:hrm'] = 0;
    runStep('migrate xbos', 'node', ['./scripts/migrate-apply.mjs', 'xbos', '--repair-checksums']);
    report.exit_codes['migrate:xbos'] = 0;
    runStep('seed org foundation', 'npm', ['run', 'seed:org'], {
      cwd: `${repoRoot}/apps/api/xbos-api`,
    });
    report.exit_codes['seed:org'] = 0;
    runStep('seed tenant CEO memberships', 'pnpm', ['run', 'seed:tenant-ceos']);
    report.exit_codes['seed:tenant-ceos'] = 0;
  }

  if (!dryRun) {
    console.log('\n=== Phase 4: stack health ===');
    const qc = spawnSync('pnpm', ['run', 'qc:dev-stack'], {
      cwd: repoRoot,
      stdio: 'inherit',
      shell: process.platform === 'win32',
    });
    report.exit_codes['qc:dev-stack'] = qc.status ?? 1;
  }

  report.mobile_hash_reference = {
    algorithm: 'sha256(email:password)',
    example: hashMobilePassword(ceoEmail, portalPassword),
    note: 'Not applied — ceo@xe.vn has no HRM employee row after reset (portal-only)',
  };

  console.log('\n=== SUMMARY ===');
  console.log(JSON.stringify(report, null, 2));

  if (!dryRun && report.exit_codes['qc:dev-stack'] !== 0) {
    console.warn('\n⚠ qc:dev-stack did not exit 0 — APIs may be down; start dev stack and re-run qc.');
    process.exit(report.exit_codes['qc:dev-stack']);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
