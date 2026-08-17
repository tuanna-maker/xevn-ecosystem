/**
 * Post-build gate: dist must contain runtime spine modules.
 * Incremental `nest build` does not re-emit deleted dist files when tsbuildinfo is stale —
 * this script fails fast so CI/devops never serve a partial dist/.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/** Modules that caused MODULE_NOT_FOUND in production/dev when dist was partial. */
export const DIST_SPINE = [
  'dist/main.js',
  'dist/app.module.js',
  'dist/common/http-exception.filter.js',
  'dist/platform/platform-runtime.js',
  'dist/spreadsheet/spreadsheet-template.service.js',
  'dist/spreadsheet/spreadsheet.module.js',
  // EMP platform catalog (D-EMP-PLT-STALE-DIST) — incremental nest build can omit new emits
  'dist/employees/emp-document-type.service.js',
  'dist/employees/emp-employment-type.service.js',
  // EMP MergeToken register (D-EMP-TOK-STALE-DIST) — DOC/ET same-TX origin=emp_catalog
  'dist/merge-tokens/emp-merge-token-register.js',
  'dist/merge-tokens/merge-token.constants.js',
  'dist/merge-tokens/merge-tokens.controller.js',
  // DEC platform catalog (D-DEC-PLT-STALE-DIST) — F-DEC-CAT decision-types + /effective
  'dist/decisions/hr-decision-type.service.js',
  'dist/decisions/hr-decision-type.constants.js',
  'dist/decisions/dto/hr-decision-type.dto.js',
];

const missing = DIST_SPINE.filter((rel) => !fs.existsSync(path.join(root, rel)));
if (missing.length === 0) {
  process.exit(0);
}

console.error(`[hrm-api] verify-dist FAIL — missing: ${missing.join(', ')}`);
console.error('[hrm-api] run: pnpm run build:clean');
process.exit(1);
