/**
 * Ensures dist emit is complete before nest start --watch / start:prod.
 * When spine files are missing, incremental nest build will NOT restore them.
 * Prefer start:node (tsc → node) on OneDrive/Unicode paths (OBS-XBOS-DIST).
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DIST_SPINE } from './verify-dist.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const missing = DIST_SPINE.filter((rel) => !fs.existsSync(path.join(root, rel)));
if (missing.length === 0) {
  process.exit(0);
}

console.log(
  `[xbos-api] incomplete dist (${missing.join(', ')}) — running build:clean (watch wipe / incremental cannot restore)`,
);
execSync('pnpm run build:clean', { cwd: root, stdio: 'inherit' });

const stillMissing = DIST_SPINE.filter((rel) => !fs.existsSync(path.join(root, rel)));
if (stillMissing.length > 0) {
  console.error(`[xbos-api] build:clean did not emit: ${stillMissing.join(', ')}`);
  process.exit(1);
}
