#!/usr/bin/env node
/**
 * Promote TC-HRM-HDSD-028..034 only from profile-depth runtime.
 * must_keep: never touch TC-096/097 · mutate TC-06/07/08 · no false 🟢
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const MATRIX = path.join(ROOT, 'docs/qa/HDSD_SRS_TESTCASE_MATRIX.md');
const RUNTIME = path.join(ROOT, 'docs/qa/evidence/_tmp-qa-hdsd-bf-03-profile-depth-01-runtime.json');
const OUT = path.join(ROOT, 'docs/qa/evidence/_tmp-qa-hdsd-matrix-promote-bf-03-profile-depth-01-result.json');

const ALLOW = new Set([
  'TC-HRM-HDSD-028',
  'TC-HRM-HDSD-029',
  'TC-HRM-HDSD-030',
  'TC-HRM-HDSD-031',
  'TC-HRM-HDSD-032',
  'TC-HRM-HDSD-033',
  'TC-HRM-HDSD-034',
]);

const NEVER_TOUCH = new Set([
  'TC-HRM-HDSD-096',
  'TC-HRM-HDSD-097',
  'TC-HRM-HDSD-016',
  'TC-HRM-HDSD-027',
]);

function countVerdicts(t) {
  const rows = [...t.matchAll(/\| (TC-[A-Z0-9-]+) .*? \| (🟢|🟡|⬜|🔴) \|/g)];
  const c = {};
  for (const m of rows) c[m[2]] = (c[m[2]] || 0) + 1;
  return { c, total: rows.length };
}

const runtime = JSON.parse(fs.readFileSync(RUNTIME, 'utf8'));
const promotions = runtime.tc.filter((t) => ALLOW.has(t.id));

let text = fs.readFileSync(MATRIX, 'utf8');
const before = countVerdicts(text);
const applied = [];
const skipped = [];
const regressions = [];

for (const t of promotions) {
  if (NEVER_TOUCH.has(t.id)) {
    skipped.push({ id: t.id, reason: 'never_touch' });
    continue;
  }
  let target = t.verdict;
  const re = new RegExp(`(\\| ${t.id.replace(/[-]/g, '\\-')} \\|[^\\n]*\\| )([^|]+)( \\|)`, 'm');
  const m = text.match(re);
  if (!m) {
    skipped.push({ id: t.id, reason: 'row not found', target });
    continue;
  }
  const cur = m[2].trim();
  if (cur === target) {
    skipped.push({ id: t.id, reason: 'unchanged', cur, target });
    continue;
  }
  if (cur === '🟢' && target !== '🟢') {
    regressions.push({ id: t.id, cur, target });
    continue;
  }
  text = text.replace(re, `$1${target}$3`);
  applied.push({ id: t.id, from: cur, to: target, detail: t.detail?.slice(0, 120) });
}

const after = countVerdicts(text);
fs.writeFileSync(MATRIX, text);

const result = {
  work_item_id: 'QA-HDSD-BF-03-PROFILE-DEPTH-01',
  before,
  after,
  applied,
  skipped,
  regressions,
  must_keep_untouched: [...NEVER_TOUCH],
  at: new Date().toISOString(),
};
fs.writeFileSync(OUT, JSON.stringify(result, null, 2));
console.log(JSON.stringify(result, null, 2));
if (regressions.length) process.exit(1);
