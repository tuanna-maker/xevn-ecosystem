#!/usr/bin/env node
/**
 * P0 — migrate + org seed + RACI + HRM catalog (cần hrm-api) + tenant CEOs + employees (DB).
 * Usage: node scripts/seed-dev-stack-p0.mjs [--skip-migrate] [--skip-hrm-catalog]
 */
import { spawnSync } from 'node:child_process';
import { repoRoot } from './seed-env-loader.mjs';

const skipMigrate = process.argv.includes('--skip-migrate');
const skipHrmCatalog = process.argv.includes('--skip-hrm-catalog');

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

console.log('\n✓ P0 seed stack completed.');
console.log('  Next: pnpm dev:xbos-api & pnpm dev:hrm-api → pnpm seed:workflow:inbox → node scripts/qc-dev-stack.mjs');
