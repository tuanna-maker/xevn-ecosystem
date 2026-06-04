#!/usr/bin/env node
/**
 * Phase 1 gate — matrix impl_status counts + optional capability smoke.
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const matrixPath = path.join(root, 'docs/ecosystem/PHASE1_UC_SRS_TECHSPEC_MATRIX.md');
const statusPath = path.join(root, 'docs/ecosystem/phase1-impl-status.json');

const skipCapabilities = process.argv.includes('--skip-capabilities');
const strict = process.argv.includes('--strict');

function countMatrixStatuses() {
  const md = fs.readFileSync(matrixPath, 'utf8');
  const counts = {};
  for (const line of md.split(/\n/)) {
    if (!/^\| \d+ \| `/.test(line)) continue;
    const cols = line.split('|').map((c) => c.trim());
    if (cols.length < 11) continue;
    const st = cols[cols.length - 3];
    if (!st || st === 'impl_status') continue;
    counts[st] = (counts[st] ?? 0) + 1;
  }
  return counts;
}

function countOverrides() {
  const raw = JSON.parse(fs.readFileSync(statusPath, 'utf8'));
  const o = raw.overrides ?? {};
  const by = {};
  for (const v of Object.values(o)) {
    const st = v.impl_status ?? 'unknown';
    by[st] = (by[st] ?? 0) + 1;
  }
  return { overrides: o, by };
}

console.log('Phase 1 gate check\n');
console.log('Matrix file:', matrixPath);
const counts = countMatrixStatuses();
const total = Object.values(counts).reduce((a, b) => a + b, 0);
console.log('\nimpl_status (from matrix):');
for (const [k, v] of Object.entries(counts).sort()) {
  console.log(`  ${k}: ${v}`);
}
console.log(`  TOTAL rows: ${total}`);

const { by: overrideBy } = countOverrides();
console.log('\nManual overrides:', overrideBy);

const targets = {
  e2e_pass_min: 15,
  matrix_rows: 245,
};

let failed = false;
if (total !== targets.matrix_rows) {
  console.warn(`\n⚠ Expected ${targets.matrix_rows} matrix rows, got ${total}`);
  if (strict) failed = true;
}

const e2e = counts.e2e_pass ?? 0;
if (e2e < targets.e2e_pass_min) {
  console.warn(`\n⚠ e2e_pass=${e2e} (mobile baseline ${targets.e2e_pass_min})`);
}

if (!skipCapabilities) {
  console.log('\n▶ verify:capabilities');
  const capScript = path.join(root, 'scripts', 'verify-capability-e2e.mjs');
  // shell:true on Windows splits paths at spaces (e.g. OneDrive "Tài liệu")
  const r = spawnSync(process.execPath, [capScript], {
    cwd: root,
    stdio: 'inherit',
  });
  if (r.status !== 0) {
    console.warn('⚠ Capability smoke failed (APIs down?)');
    if (strict) failed = true;
  }
}

const reportPath = path.join(root, 'docs/qa/PHASE1_GATE_REPORT.md');
const lines = [
  '# Phase 1 gate report',
  '',
  `Generated: ${new Date().toISOString()}`,
  '',
  '## Matrix impl_status',
  '',
  '| Status | Count |',
  '|--------|------:|',
  ...Object.entries(counts)
    .sort()
    .map(([k, v]) => `| ${k} | ${v} |`),
  '',
  '## Commands',
  '',
  '```bash',
  'pnpm phase1:bootstrap',
  'pnpm phase1:gate',
  'pnpm verify:dev-stack',
  'node scripts/mobile-hrm-smoke.mjs',
  '```',
  '',
];
fs.mkdirSync(path.dirname(reportPath), { recursive: true });
fs.writeFileSync(reportPath, `${lines.join('\n')}\n`);
console.log(`\nWrote ${reportPath}`);

if (failed) process.exit(1);
console.log('\n✓ Phase 1 gate check finished (non-strict unless --strict)');
