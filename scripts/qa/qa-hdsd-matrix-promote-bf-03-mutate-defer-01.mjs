#!/usr/bin/env node
/**
 * Promote TC-HRM-HDSD-025/041/049 from mutate-defer runtime.
 * Allow green only when runtime 🟢. Yellow updates allowed. must_keep mutate TC-06/07/08 / Ch09.
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const MATRIX = path.join(ROOT, 'docs/qa/HDSD_SRS_TESTCASE_MATRIX.md');
const RUNTIME = path.join(ROOT, 'docs/qa/evidence/_tmp-qa-hdsd-bf-03-mutate-defer-01-runtime.json');
const OUT = path.join(ROOT, 'docs/qa/evidence/_tmp-qa-hdsd-matrix-promote-bf-03-mutate-defer-01-result.json');

const ALLOW = new Set(['TC-HRM-HDSD-025', 'TC-HRM-HDSD-041', 'TC-HRM-HDSD-049']);

const NEVER_TOUCH = new Set([
  'TC-HRM-HDSD-096',
  'TC-HRM-HDSD-097',
  'TC-HDSD-06-02-01',
  'TC-HDSD-07-02-01',
  'TC-HDSD-08-02-01',
]);

function countVerdicts(t) {
  const rows = [...t.matchAll(/\| (TC-[A-Z0-9-]+) .*? \| (🟢|🟡|⬜|🔴) \|/g)];
  const c = {};
  for (const m of rows) c[m[2]] = (c[m[2]] || 0) + 1;
  return { c, total: rows.length };
}

function syncSummary(text, after) {
  const g = after.c['🟢'] || 0;
  const y = after.c['🟡'] || 0;
  const w = after.c['⬜'] || 0;
  return text
    .replace(/\*\*\d+🟢\s*[·•]\s*\d+🟡\s*[·•]\s*\d+⬜\*\*/g, `**${g}🟢 · ${y}🟡 · ${w}⬜**`)
    .replace(/\|\s*\d+\s*\|\s*\d+\s*\|\s*\d+\s*\|/g, (m, offset, s) => {
      // only touch Coverage summary-looking rows near top — leave body alone
      return m;
    });
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
  const target = t.verdict;
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
  applied.push({ id: t.id, from: cur, to: target, detail: t.detail?.slice(0, 160) });
}

const after = countVerdicts(text);

// Update header summary lines that look like N🟢 · M🟡 · K⬜
text = text.replace(
  /(\*\*)(\d+)🟢\s*[·•]\s*(\d+)🟡\s*[·•]\s*(\d+)⬜(\*\*)/g,
  `**${after.c['🟢'] || 0}🟢 · ${after.c['🟡'] || 0}🟡 · ${after.c['⬜'] || 0}⬜**`,
);

fs.writeFileSync(MATRIX, text);

const result = {
  work_item_id: 'QA-HDSD-BF-03-MUTATE-DEFER-01',
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
