#!/usr/bin/env node
/**
 * Sprint pulse — run L0/L1/L2/FE/BE tests, append one evidence MD.
 * Usage: node scripts/sprint-pulse-evidence.mjs S1
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const sprint = process.argv[2] ?? 'S1';
const root = process.cwd();
const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
const out = path.join(root, 'docs/qa/evidence', `sprint-pulse-${sprint.toLowerCase()}-${date}.md`);

const steps = [
  { id: 'L0', cmd: 'pnpm', args: ['run', 'qc:dev-stack'] },
  { id: 'L2-pilot', cmd: 'pnpm', args: ['run', 'test:pilot:flows'] },
  { id: 'FE-embed-audit', cmd: 'pnpm', args: ['run', 'test:hrm-embed:audit'] },
  { id: 'BE-hrm-api', cmd: 'pnpm', args: ['--filter', 'hrm-api', 'test'], cwd: root },
  { id: 'BE-xbos-api', cmd: 'pnpm', args: ['--filter', 'xbos-api', 'test'], cwd: root },
  { id: 'FE-hrm-vitest', cmd: 'pnpm', args: ['-C', 'apps/web/hrm', 'test'] },
  { id: 'OpenAPI-M01', cmd: 'pnpm', args: ['run', 'verify:openapi-m01'] },
];

function runStep(step) {
  const r = spawnSync(step.cmd, step.args, {
    cwd: step.cwd ?? root,
    encoding: 'utf8',
    shell: true,
    maxBuffer: 8 * 1024 * 1024,
  });
  const outTail = (r.stdout || '') + (r.stderr || '');
  const tail = outTail.split(/\r?\n/).slice(-25).join('\n');
  return { exit: r.status ?? 1, tail };
}

const lines = [
  `# Sprint pulse — ${sprint}`,
  ``,
  `**At:** ${new Date().toISOString()}`,
  `**Owner:** PM orchestration`,
  ``,
  `| Step | Exit |`,
  `|------|------|`,
];

let fails = 0;
for (const s of steps) {
  const { exit, tail } = runStep(s);
  const ok = exit === 0;
  if (!ok) fails++;
  lines.push(`| ${s.id} | ${ok ? '**0**' : `**${exit}**`} |`);
  lines.push(``, `### ${s.id}`, '```', tail.slice(-3500), '```', ``);
}

lines.push(`## Summary`, ``, `- Fail steps: **${fails}** / ${steps.length}`);
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, lines.join('\n'));
console.log(`Wrote ${out} (${fails} fails)`);
process.exit(fails > 0 ? 1 : 0);
