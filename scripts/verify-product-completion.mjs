#!/usr/bin/env node
/**
 * Product completion gate — aggregates sub-verifiers for P1-PRODUCT-COMPLETE program.
 * work_item_id: PCOMP-W5-DO-01
 *
 * Exit 0 when W1–W3 required gates PASS.
 * Exit 2 when any required W1–W3 gate FAIL.
 * Optional gates (pm:scan backlog, qc:dev-stack) are reported but do not affect exit code.
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/** @typedef {{ name: string, wave: string, passed: boolean, exit: number, optional?: boolean, detail?: string }} GateResult */

/** @type {GateResult[]} */
const results = [];

function runPnpm(script, { name, wave, optional = false }) {
  const r = spawnSync('pnpm', ['run', script], { cwd: root, shell: true, encoding: 'utf8' });
  const exit = r.status ?? 1;
  const passed = exit === 0;
  results.push({ name, wave, exit, passed, optional });
  const tag = passed ? 'PASS' : optional ? 'SKIP' : 'FAIL';
  console.log(`${tag}  [${wave}] ${name} (exit ${exit})`);
  if (!passed && r.stderr?.trim()) {
    console.log(r.stderr.trim().split('\n').slice(-5).join('\n'));
  }
  return passed || optional;
}

/**
 * Ripgrep gate — PASS when 0 hits (rg exit 1).
 * @param {object} opts
 * @param {string} opts.name
 * @param {string} opts.wave
 * @param {string} opts.pattern
 * @param {string[]} opts.paths
 * @param {string[]} [opts.globs]
 * @param {boolean} [opts.optional]
 */
function runGrepGate({ name, wave, pattern, paths, globs = [], optional = false }) {
  const args = ['--line-number', pattern, ...paths];
  for (const g of globs) args.push('--glob', g);
  const r = spawnSync('rg', args, { cwd: root, encoding: 'utf8' });
  const exit = r.status ?? 1;
  const hits = (r.stdout ?? '').trim();
  const passed = exit === 1 && !hits;
  const detail = hits ? hits.split('\n').slice(0, 8).join('\n') : undefined;
  results.push({
    name,
    wave,
    exit: passed ? 0 : exit === 0 ? 0 : 2,
    passed,
    optional,
    detail,
  });
  const tag = passed ? 'PASS' : optional ? 'SKIP' : 'FAIL';
  console.log(`${tag}  [${wave}] ${name} (${passed ? '0 hits' : `${hits ? hits.split('\n').length : '?'} hit(s)`})`);
  if (!passed && hits) {
    console.log(hits.split('\n').slice(0, 5).join('\n'));
  }
  return passed || optional;
}

console.log('verify:product:completion — W1–W3 gates\n');

// --- W1: HRM embed zero-mock (grep hygiene — REC-EXEC-GREP-W1 subset) ---
runGrepGate({
  name: 'w1-hrm-p0-mock-symbols',
  wave: 'W1',
  pattern: 'payrollFeedbackData|initialMockJobs|mockSalaryData|mockMonthlyPayroll|attendanceSheetsData|const monthlyLeaveData = \\[',
  paths: ['apps/web/hrm/src'],
  globs: ['!**/*.test.*', '!**/__tests__/**'],
});

runGrepGate({
  name: 'w1-hrm-profile-performance-mock',
  wave: 'W1',
  pattern:
    'initialWorkHistory|initialTasks|const monthlyPerformanceData = \\[|const quarterlyPerformanceData = \\[|const priorityDistribution = \\[',
  paths: ['apps/web/hrm/src/components/employee/EmployeeWorkHistory.tsx'],
});

runGrepGate({
  name: 'w1-hrm-candidate-radar-mock',
  wave: 'W1',
  pattern: 'radarChartData = \\[|Mock evaluation',
  paths: [
    'apps/web/hrm/src/components/recruitment/CandidateDetailView.tsx',
    'apps/web/hrm/src/components/recruitment/CandidateEvaluationDialog.tsx',
  ],
});

// --- W2: Portal modules/hrm — no HRM_MOCK display path ---
runGrepGate({
  name: 'w2-modules-hrm-no-hrm-mock',
  wave: 'W2',
  pattern: 'HRM_MOCK_|previewMockRows',
  paths: ['apps/web/web-portal/src/modules/hrm'],
  globs: ['!**/*.test.*', '!**/__tests__/**'],
});

// --- W3: BE integrity ---
runPnpm('verify:hrm:xbos-integrity', { name: 'w3-hrm-xbos-integrity', wave: 'W3' });

// --- Optional (informational) ---
runPnpm('pm:scan:backlog', { name: 'pm-scan-backlog', wave: 'PM', optional: true });
runPnpm('qc:dev-stack', { name: 'qc-dev-stack', wave: 'L0', optional: true });

const required = results.filter((x) => !x.optional);
const requiredFail = required.filter((x) => !x.passed);
const byWave = ['W1', 'W2', 'W3'].map((wave) => {
  const waveGates = required.filter((r) => r.wave === wave);
  return { wave, pass: waveGates.every((g) => g.passed), total: waveGates.length };
});

console.log('\n--- summary ---');
for (const { wave, pass, total } of byWave) {
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${wave} (${total} gate(s))`);
}
console.log(`required FAIL: ${requiredFail.length}`);

const evidenceDir = path.join(root, 'docs/qa/evidence');
fs.mkdirSync(evidenceDir, { recursive: true });
const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
const evidenceFile =
  process.env.PCOMP_EVIDENCE_FILE ??
  path.join(evidenceDir, `pcomp-w5-do-01-${date}.md`);

const md = [
  '# PCOMP-W5-DO-01 — verify:product:completion',
  '',
  '| Field | Value |',
  '|-------|-------|',
  `| work_item_id | PCOMP-W5-DO-01 |`,
  `| date | ${new Date().toISOString().slice(0, 10)} |`,
  `| verdict | ${requiredFail.length === 0 ? 'PASS' : 'FAIL'} |`,
  `| ack_status | READY_FOR_QA |`,
  '',
  '## Gate results',
  '',
  '| Wave | Gate | Result | Detail |',
  '|------|------|--------|--------|',
  ...results.map((r) => {
    const res = r.passed ? 'PASS' : r.optional ? 'SKIP' : 'FAIL';
    const detail = r.detail ? r.detail.replace(/\|/g, '\\|').replace(/\n/g, ' ') : '';
    return `| ${r.wave} | ${r.name} | ${res}${r.optional ? ' (optional)' : ''} | ${detail.slice(0, 120)} |`;
  }),
  '',
  '## Command',
  '',
  '```bash',
  'pnpm run verify:product:completion',
  '```',
  '',
].join('\n');

fs.writeFileSync(evidenceFile, `${md}\n`, 'utf8');
console.log(`\nevidence: ${path.relative(root, evidenceFile)}`);

process.exit(requiredFail.length > 0 ? 2 : 0);
