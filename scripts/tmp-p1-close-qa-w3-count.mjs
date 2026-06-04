import fs from 'node:fs';
import { loadPhase1StatusOverrides, resolveImplStatus } from './lib/phase1-impl-status.mjs';

const md = fs.readFileSync('docs/ecosystem/PHASE1_UC_SRS_TECHSPEC_MATRIX.md', 'utf8');
const { overrides } = loadPhase1StatusOverrides();
const g2Codes = new Set();
for (const line of md.split('\n')) {
  if (!/^\| \d+ \|/.test(line)) continue;
  const cols = line.split('|').map((c) => c.trim());
  const stt = Number(cols[1]);
  const code = cols[2]?.replace(/`/g, '') ?? '';
  if (stt >= 1 && stt <= 97) g2Codes.add(code);
  if (stt >= 367 && stt <= 373) g2Codes.add(code);
}
const counts = {};
let closed = 0;
let total = 0;
let g2pass = 0;
let g2total = 0;
for (const line of md.split('\n')) {
  if (!/^\| \d+ \|/.test(line)) continue;
  total += 1;
  const cols = line.split('|').map((c) => c.trim());
  const code = cols[2]?.replace(/`/g, '') ?? '';
  const mod = cols[6] ?? '';
  const td = cols[8] ?? '';
  const st = resolveImplStatus(code, mod, td, overrides).impl_status;
  counts[st] = (counts[st] ?? 0) + 1;
  if (st === 'e2e_pass' || st === 'waived') closed += 1;
  if (g2Codes.has(code)) {
    g2total += 1;
    if (st === 'e2e_pass') g2pass += 1;
  }
}
const gap = ['UC-CC-03', 'UC-CC-04', 'UC-ECO-FE-01'].map((c) => ({
  code: c,
  status: resolveImplStatus(c, 'Portal', '', overrides).impl_status,
}));
console.log(JSON.stringify({ counts, closed, total, g2pass, g2total, gap }, null, 2));
