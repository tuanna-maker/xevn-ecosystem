#!/usr/bin/env node
/**
 * One-off: list Phase1 UC by impl_status + srs-api-map hint.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolveApiHint } from '../lib/srs-api-map.mjs';
import { loadPhase1StatusOverrides, resolveImplStatus, inferImplStatus } from '../lib/phase1-impl-status.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const matrix = fs.readFileSync(path.join(root, 'docs/ecosystem/PHASE1_UC_SRS_TECHSPEC_MATRIX.md'), 'utf8');
const rowRe = /\| (\d+) \| `([^`]+)` \| ([^|]+) \| (M\d\d) \|[^|]+\|[^|]+\|[^|]+\| ([^|]+) \| ([^|]+) \|/g;
const rows = [];
let m;
while ((m = rowRe.exec(matrix)) !== null) {
  rows.push({ stt: m[1], code: m[2], name: m[3].trim(), mod: m[4], impl_status: m[5].trim(), owner: m[6].trim() });
}

const { overrides } = loadPhase1StatusOverrides();
const byStatus = {};
const planned = [];
const be = [];
const e2e = [];
const wildcardPlanned = [];

for (const r of rows) {
  const impl_status = r.impl_status;
  const owner = r.owner;
  byStatus[impl_status] = (byStatus[impl_status] || 0) + 1;
  const hint = resolveApiHint(r.code);
  const entry = { ...r, api: hint };
  const hasConcreteMap = hint && !hint.planned && !String(hint.path).includes('*');
  entry.mapGap = impl_status === 'planned' && hasConcreteMap ? 'impl_missing_vs_map' : impl_status === 'be' && hint.path?.includes('*') ? 'map_wildcard' : '';
  if (impl_status === 'planned') planned.push(entry);
  if (impl_status === 'be') be.push(entry);
  if (impl_status === 'e2e_pass') e2e.push(entry);
  if (impl_status === 'planned' && (hint.planned || hint.path?.includes('*'))) {
    wildcardPlanned.push(entry);
  }
}

const concretePlanned = planned.filter((p) => !p.api.planned && !p.api.path?.includes('*'));

console.log(JSON.stringify({ total: rows.length, byStatus, planned: planned.length, be: be.length, e2e: e2e.length }, null, 2));
console.log('---PLANNED_CODES---');
for (const p of planned) console.log(`${p.code}\t${p.mod}\t${p.api.method}\t${p.api.path}`);
console.log('---BE_CODES---');
for (const p of be) console.log(`${p.code}\t${p.mod}\t${p.api.method}\t${p.api.path}`);
