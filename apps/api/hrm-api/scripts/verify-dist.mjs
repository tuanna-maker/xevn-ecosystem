/**
 * Post-build gate: dist must contain runtime spine modules.
 * Incremental nest/tsc emit can leave a partial dist/ after OneDrive/Unicode wipe —
 * fail fast so local L0 never serves a half-empty outDir.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/** Modules that caused MODULE_NOT_FOUND / ECONNREFUSED when dist was wiped mid-watch. */
export const DIST_SPINE = [
  'dist/main.js',
  'dist/app.module.js',
  'dist/common/http-exception.filter.js',
  'dist/platform/platform-runtime.js',
  'dist/auth/mobile-auth.controller.js',
];

const missing = DIST_SPINE.filter((rel) => !fs.existsSync(path.join(root, rel)));
if (missing.length === 0) {
  process.exit(0);
}

console.error(`[hrm-api] verify-dist FAIL — missing: ${missing.join(', ')}`);
console.error('[hrm-api] run: pnpm run build:clean   OR   pnpm exec nest start --watch');
process.exit(1);
