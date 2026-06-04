#!/usr/bin/env node
/**
 * P0 — migrate + org seed + RACI + HRM catalog (cần hrm-api) + tenant CEOs + employees (DB).
 * Fidelity chain (see docs/ops/HRM_FIDELITY_SEED_RUNBOOK.md):
 *   seed:stack:p0 → seed:hrm:1000-uat → seed:hrm:fidelity → verify:hrm:menu-density
 *
 * Usage: node scripts/seed-dev-stack-p0.mjs [--skip-migrate] [--skip-hrm-catalog]
 *        [--with-1000-uat] [--with-fidelity] [--verify-density]
 */
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { repoRoot } from './seed-env-loader.mjs';

const skipMigrate = process.argv.includes('--skip-migrate');
const skipHrmCatalog = process.argv.includes('--skip-hrm-catalog');
const with1000Uat = process.argv.includes('--with-1000-uat');
const withFidelity = process.argv.includes('--with-fidelity');
const verifyDensity = process.argv.includes('--verify-density');

function run(title, cmd, args, opts = {}) {
  console.log(`\n▶ ${title}`);
  const r = spawnSync(cmd, args, { stdio: 'inherit', shell: process.platform === 'win32', ...opts });
  if (r.status !== 0) {
    console.error(`\n✗ ${title} (exit ${r.status ?? 'signal'})`);
    process.exit(r.status ?? 1);
  }
}

if (!skipMigrate) {
  run('migrate xbos', 'node', [`${repoRoot}/scripts/migrate-apply.mjs`, 'xbos', '--repair-checksums'], {
    cwd: repoRoot,
  });
  run('migrate hrm', 'node', [`${repoRoot}/scripts/migrate-apply.mjs`, 'hrm'], { cwd: repoRoot });
}

run('bootstrap org foundation', 'node', [`${repoRoot}/scripts/bootstrap-xevn-xbos.mjs`, '--no-health'], {
  cwd: repoRoot,
});

run('seed RACI catalog', 'node', [`${repoRoot}/scripts/seed-raci-activity-catalog.mjs`], { cwd: repoRoot });
run('seed RACI capabilities', 'node', [`${repoRoot}/scripts/seed-raci-capabilities.mjs`], { cwd: repoRoot });

if (!skipHrmCatalog) {
  console.log('\n▶ seed HRM group employee catalog (requires hrm-api on HRM_BE_PORT)');
  const r = spawnSync('node', [`${repoRoot}/scripts/seed-hrm-group-employee-catalog.mjs`], {
    cwd: repoRoot,
    stdio: 'inherit',
  });
  if (r.status !== 0) {
    console.warn('⚠ HRM catalog seed skipped/failed — start `pnpm dev:hrm-api` then: pnpm seed:hrm:group-employee-catalog');
  }
}

run('seed tenant CEO users', 'pnpm', ['seed:tenant-ceos'], { cwd: repoRoot });
run('seed 100 employees (HRM DB)', 'node', [`${repoRoot}/scripts/seed-hrm-100-employees.mjs`], { cwd: repoRoot });

if (with1000Uat) {
  run('seed HRM 1000 UAT workforce', 'node', [`${repoRoot}/scripts/seed-hrm-1000-uat-workforce.mjs`], {
    cwd: repoRoot,
  });
}

if (withFidelity) {
  const fidelityScript = resolve(repoRoot, 'scripts/seed-hrm-satellite-from-workforce.mjs');
  if (!existsSync(fidelityScript)) {
    console.warn(
      '⚠ seed:hrm:fidelity not available — add scripts/seed-hrm-satellite-from-workforce.mjs (Dev-BE) then re-run with --with-fidelity',
    );
  } else {
    run('seed HRM satellite fidelity', 'node', [fidelityScript], { cwd: repoRoot });
  }
}

if (verifyDensity) {
  console.log('\n▶ verify HRM menu data density (G-FID-07)');
  const r = spawnSync('node', [`${repoRoot}/scripts/verify-hrm-menu-data-density.mjs`], {
    cwd: repoRoot,
    stdio: 'inherit',
  });
  if (r.status !== 0) {
    console.warn('⚠ verify:hrm:menu-density FAIL — expected until seed:hrm:fidelity completes');
    process.exit(r.status ?? 1);
  }
}

console.log('\n✓ P0 seed stack completed.');
console.log('  Fidelity chain: docs/ops/HRM_FIDELITY_SEED_RUNBOOK.md');
console.log('  Next (baseline): pnpm run seed:hrm:1000-uat → pnpm run seed:hrm:fidelity → pnpm run verify:hrm:menu-density');
console.log('  Or: pnpm run seed:stack:p0 -- --with-1000-uat [--with-fidelity] [--verify-density]');
console.log('  Dev APIs: pnpm dev:xbos-api & pnpm dev:hrm-api → pnpm seed:workflow:inbox → pnpm qc:dev-stack');
