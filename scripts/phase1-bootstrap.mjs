#!/usr/bin/env node
/**
 * Phase 1 W0 bootstrap — migrate, P0 seed, ecosystem full, capabilities, logistic DM, matrix.
 */
import { spawnSync } from 'node:child_process';
import { repoRoot } from './seed-env-loader.mjs';

const skipMigrate = process.argv.includes('--skip-migrate');
const skipFull = process.argv.includes('--skip-full');
const skipLogistic = process.argv.includes('--skip-logistic');

function run(title, cmd, args) {
  console.log(`\n▶ ${title}`);
  const r = spawnSync(cmd, args, {
    stdio: 'inherit',
    shell: process.platform === 'win32',
    cwd: repoRoot,
  });
  if (r.status !== 0) {
    console.error(`\n✗ ${title} (exit ${r.status ?? 'signal'})`);
    process.exit(r.status ?? 1);
  }
}

if (!skipMigrate) {
  run('migrate xbos', 'node', [`${repoRoot}/scripts/migrate-apply.mjs`, 'xbos', '--repair-checksums']);
  run('migrate hrm', 'node', [`${repoRoot}/scripts/migrate-apply.mjs`, 'hrm']);
}

run('seed stack P0', 'node', [`${repoRoot}/scripts/seed-dev-stack-p0.mjs`, '--skip-migrate']);

if (!skipFull) {
  run('seed ecosystem full', 'node', [`${repoRoot}/scripts/seed-full-ecosystem.mjs`]);
}

run('seed capability registry', 'node', [`${repoRoot}/scripts/seed-ecosystem-capability-registry.mjs`]);
run('seed tenant position catalog', 'pnpm', ['seed:hrm:tenant-position-catalog']);

if (!skipLogistic) {
  const r = spawnSync('node', [`${repoRoot}/scripts/seed-logistic-catalog-phase1-db.mjs`], {
    cwd: repoRoot,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });
  if (r.status !== 0) {
    console.warn('⚠ Logistic catalog seed skipped — start xbos-api then: pnpm seed:phase1:logistic-catalog');
  }
}

run('regenerate Phase 1 matrix', 'node', [`${repoRoot}/scripts/generate-phase1-techspec-matrix.mjs`]);

console.log('\n✓ Phase 1 bootstrap completed.');
console.log('  Next: pnpm dev:xbos-api & pnpm dev:hrm-api → pnpm phase1:gate');
