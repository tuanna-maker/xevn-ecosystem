#!/usr/bin/env node
/**
 * Runs strict CRUD mini-gate commands and writes ONE consolidated QA evidence file.
 * Prevents QC NO-GO due to "artifact referenced on bus but file missing".
 *
 * Usage:
 *   node scripts/qa-strict-minigate-crud.mjs --work-item P1-HRM-CRUD-QA-STRICT --out docs/qa/evidence/p1-hrm-crud-qa-strict-YYYYMMDD.md
 */
import { spawnSync } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { resolvePortalBase } from './lib/portal-base-resolver.mjs';

const args = process.argv.slice(2);
function getArg(name, fallback) {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : fallback;
}

const workItem = getArg('--work-item', 'P1-HRM-CRUD-QA-STRICT-MINIGATE');
const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
const defaultOut = `docs/qa/evidence/p1-hrm-crud-qa-strict-minigate-${date}.md`;
const outRel = getArg('--out', defaultOut);
const outPath = resolve(process.cwd(), outRel);

const portalBase = await resolvePortalBase();
process.env.PORTAL_DEV_URL = portalBase;

const commands = [
  { cmd: 'pnpm', args: ['--filter', 'hrm-api', 'test'], label: 'hrm-api test' },
  { cmd: 'pnpm', args: ['--filter', 'web-portal', 'test'], label: 'web-portal test' },
  { cmd: 'pnpm', args: ['--filter', 'web-portal', 'build'], label: 'web-portal build' },
  { cmd: 'pnpm', args: ['run', 'qc:dev-stack'], label: 'qc:dev-stack' },
  { cmd: 'pnpm', args: ['run', 'verify:capabilities', '--', '--group', 'A1'], label: 'verify:capabilities A1' },
  { cmd: 'pnpm', args: ['run', 'test:pilot:flows'], label: 'test:pilot:flows' },
];

function runOne({ cmd, args: cargs, label }) {
  const started = Date.now();
  const result = spawnSync(cmd, cargs, {
    cwd: process.cwd(),
    env: { ...process.env, PORTAL_DEV_URL: portalBase },
    encoding: 'utf8',
    shell: process.platform === 'win32',
    maxBuffer: 20 * 1024 * 1024,
  });
  const ms = Date.now() - started;
  const exit = result.status ?? 1;
  const verdict = exit === 0 ? 'PASS' : 'FAIL';
  const tail = (result.stderr || result.stdout || '').split('\n').slice(-8).join('\n').trim();
  return { label, cmd: `${cmd} ${cargs.join(' ')}`, exit, verdict, ms, tail };
}

const rows = commands.map(runOne);
const productFails = rows.filter((r) => r.verdict === 'FAIL' && !/pilot:flows|5173|5175|ECONNREFUSED/i.test(r.tail));
const envFails = rows.filter((r) => r.verdict === 'FAIL' && /pilot:flows|5173|5175|ECONNREFUSED/i.test(r.tail));
const overall = rows.every((r) => r.verdict === 'PASS') ? 'PASS' : 'FAIL';

mkdirSync(dirname(outPath), { recursive: true });

const md = `# QA Strict CRUD Mini-gate — ${workItem}

- work_item_id: \`${workItem}\`
- date: \`${new Date().toISOString().slice(0, 10)}\`
- ack_status: **READY_FOR_QC**
- evidence_path: \`${outRel.replace(/\\/g, '/')}\`
- portal_url: \`${portalBase}\`
- generated_by: \`scripts/qa-strict-minigate-crud.mjs\`

## Command table

| Command | Exit | Verdict | Duration ms |
|---------|------|---------|-------------|
${rows.map((r) => `| \`${r.cmd}\` | ${r.exit} | **${r.verdict}** | ${r.ms} |`).join('\n')}

## L2.5 / J-* (manual supplement required)

QA must append J-* rows from \`docs/program/PROGRAM_JOURNEY_MAP.md\` before QC gate.
Minimum: J-CC-HRM-embed-load, J-HRM-list-detail for in-scope modules.

| Journey | Route / click path | Verdict | Notes |
|---------|-------------------|---------|-------|
| _pending_ | _QA fill_ | _pending_ | Run after commands PASS |

## CRUD matrix (manual supplement required)

| Module | C | R | U | D | Negative | Verdict |
|--------|---|---|---|---|----------|---------|
| _pending_ | | | | | | _QA fill touched modules_ |

## Classification

- **PRODUCT fails:** ${productFails.length ? productFails.map((r) => r.label).join(', ') : 'none'}
- **ENV fails (port/stack):** ${envFails.length ? envFails.map((r) => r.label).join(', ') : 'none'}

## Residual

${overall === 'PASS' ? 'No residual on automated command gate. UI/J-* and CRUD matrix rows must be completed by QA before QC.' : `Open: fix PRODUCT fails first; ENV fails retry with PORTAL_DEV_URL=${portalBase} and stack up (pnpm run qc:dev-stack).`}

## Tail logs (last lines per FAIL)

${rows
  .filter((r) => r.verdict === 'FAIL')
  .map((r) => `### ${r.label}\n\`\`\`\n${r.tail}\n\`\`\``)
  .join('\n\n') || '_none_'}

## Overall automated gate

**${overall}** (${rows.filter((r) => r.verdict === 'PASS').length}/${rows.length} commands PASS)
`;

writeFileSync(outPath, md, 'utf8');
console.log(`Wrote ${outRel}`);
console.log(`Overall: ${overall}`);
console.log(`Portal: ${portalBase}`);
process.exit(overall === 'PASS' ? 0 : 1);
