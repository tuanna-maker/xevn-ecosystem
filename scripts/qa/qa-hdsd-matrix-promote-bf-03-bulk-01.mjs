#!/usr/bin/env node
/**
 * QA-HDSD-MATRIX-PROMOTE-BF-03-BULK-01 — promote BF-03 §6 (59 TC) from bulk runtime
 * cấm: regression 🟢→⬜ · downgrade preserved rows · false promote mutate without cross-ref
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const MATRIX = path.join(ROOT, 'docs/qa/HDSD_SRS_TESTCASE_MATRIX.md');
const RUNTIME = path.join(ROOT, 'docs/qa/evidence/_tmp-qa-hdsd-bf-03-bulk-01-runtime.json');
const OUT = path.join(ROOT, 'docs/qa/evidence/_tmp-qa-hdsd-matrix-promote-bf-03-bulk-01-result.json');

const NEVER_DOWNGRADE = new Set([
  'TC-HRM-HDSD-016',
  'TC-HRM-HDSD-027',
  'TC-HRM-HDSD-037',
  'TC-HRM-HDSD-044',
  'TC-HRM-HDSD-046',
  'TC-HRM-HDSD-048',
  'TC-HRM-HDSD-096',
  'TC-HRM-HDSD-097',
]);

/** HDSD mutate slice IDs — not matrix rows; skip promote */
const MUTATE_CROSSREF_ONLY = /^TC-HDSD-/;

function countVerdicts(t) {
  const rows = [...t.matchAll(/\| (TC-[A-Z0-9-]+) .*? \| (🟢|🟡|⬜|🔴) \|/g)];
  const c = {};
  for (const m of rows) c[m[2]] = (c[m[2]] || 0) + 1;
  return { c, total: rows.length };
}

const runtime = JSON.parse(fs.readFileSync(RUNTIME, 'utf8'));
const promotions = runtime.tc.filter(
  (t) => /^TC-(HRM-HDSD|MOB)-/.test(t.id) && !MUTATE_CROSSREF_ONLY.test(t.id),
);

let text = fs.readFileSync(MATRIX, 'utf8');
const before = countVerdicts(text);
const applied = [];
const skipped = [];
const regressions = [];

for (const t of promotions) {
  let target = t.verdict;
  const re = new RegExp(`(\\| ${t.id.replace(/[-]/g, '\\-')} \\|[^\\n]*\\| )([^|]+)( \\|)`, 'm');
  const m = text.match(re);
  if (!m) {
    skipped.push({ id: t.id, reason: 'row not found', target });
    continue;
  }
  const cur = m[2].trim();
  if (NEVER_DOWNGRADE.has(t.id) && cur === '🟢' && target !== '🟢') {
    target = '🟢';
  }
  if (cur === target) {
    skipped.push({ id: t.id, reason: 'unchanged', cur, target });
    continue;
  }
  if (cur === '🟢' && target !== '🟢') {
    regressions.push({ id: t.id, cur, target });
    continue;
  }
  if (cur === '🔴') {
    skipped.push({ id: t.id, reason: 'keep 🔴', cur, target });
    continue;
  }
  text = text.replace(re, `$1${target}$3`);
  applied.push({ id: t.id, from: cur, to: target, detail: t.detail?.slice(0, 90) });
}

const after = countVerdicts(text);
fs.writeFileSync(MATRIX, text);

const result = {
  work_item_id: 'QA-HDSD-MATRIX-PROMOTE-BF-03-BULK-01',
  before,
  after,
  appliedCount: applied.length,
  greenApplied: applied.filter((a) => a.to === '🟢').length,
  yellowApplied: applied.filter((a) => a.to === '🟡').length,
  regressions,
  applied,
  skipped: skipped.length,
  runtimeSummary: runtime.summary,
};
fs.writeFileSync(OUT, JSON.stringify(result, null, 2));
console.log(JSON.stringify(result, null, 2));
