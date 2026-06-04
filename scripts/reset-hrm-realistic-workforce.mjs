#!/usr/bin/env node
/**
 * Full HRM realistic data reset — XBOS catalog → workforce → satellites → quality gate.
 * work_item_id: HRM-REALISTIC-DATA-RESET
 * See: docs/program/HRM_REALISTIC_DATA_RESET.md
 */
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import pg from 'pg';
import { loadDeployEnv, repoRoot } from './seed-env-loader.mjs';

loadDeployEnv();

const { Client } = pg;
const root = repoRoot;
const skipCatalog = process.argv.includes('--skip-catalog');
const skipBootstrap = process.argv.includes('--skip-bootstrap');

function run(title, cmd, args) {
  console.log(`\n▶ ${title}`);
  const r = spawnSync(cmd, args, {
    cwd: root,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });
  if (r.status !== 0) {
    console.error(`\n✗ ${title} (exit ${r.status ?? 'signal'})`);
    process.exit(r.status ?? 1);
  }
}

async function purgeLegacyHrmData() {
  const client = new Client({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.HRM_DB_NAME || 'xevn_hrm',
    ssl: false,
  });
  await client.connect();
  try {
    await client.query('BEGIN');
    const tags = ['1000-v1', 'realistic-v2'];
    const seedTags = ['hrm-fidelity-v1', 'hrm-realistic-v2'];
    for (const st of seedTags) {
      await client.query(
        `DELETE FROM public.employee_contracts t
         USING public.hrm_seed_metadata m
         WHERE m.seed_tag = $1 AND m.entity_table = 'employee_contracts' AND m.entity_id = t.id`,
        [st],
      );
      await client.query(`DELETE FROM public.hrm_seed_metadata WHERE seed_tag = $1`, [st]);
    }
    await client.query(
      `DELETE FROM public.employee_contracts ec
       USING public.employees e
       WHERE ec.employee_id = e.id AND e.custom_fields->>'uat_seed' = ANY($1::text[])`,
      [tags],
    );
    for (const tag of tags) {
      await client.query(
        `DELETE FROM public.employees WHERE custom_fields->>'uat_seed' = $1`,
        [tag],
      );
    }
    await client.query(
      `DELETE FROM public.employee_contracts WHERE contract_type ILIKE '%fidelity%'`,
    );
    await client.query('COMMIT');
    console.log('Purged legacy UAT/fidelity employee rows and placeholder contracts.');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    await client.end();
  }
}

async function main() {
  console.log('=== HRM Realistic Data Reset ===\n');

  if (!skipBootstrap) {
    run('XBOS org bootstrap (catalog source)', 'pnpm', ['run', 'bootstrap:xbos:no-health']);
  }

  await purgeLegacyHrmData();

  if (!skipCatalog) {
    const catalogScript = resolve(root, 'scripts/seed-hrm-group-employee-catalog.mjs');
    if (existsSync(catalogScript)) {
      run('HRM catalogs from XBOS templates (group-employee-import)', 'pnpm', [
        'run',
        'seed:hrm:group-employee-catalog',
      ]);
    } else {
      console.warn('⚠ skip catalog — script missing');
    }
  }

  run('Workforce ~1000 (Vietnamese names, admin fields)', 'pnpm', ['run', 'seed:hrm:1000-uat']);

  run('Satellite linkage (contracts, insurance, …)', 'pnpm', ['run', 'seed:hrm:fidelity']);

  run('Menu density gate', 'pnpm', ['run', 'verify:hrm:menu-density']);
  run('Realistic data quality gate', 'pnpm', ['run', 'verify:hrm:realistic-quality']);

  console.log('\n=== HRM Realistic Data Reset COMPLETE ===');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
