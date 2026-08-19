#!/usr/bin/env node
/**
 * Promote TC-HRM-HDSD-025 from soft-delete retest runtime.
 * Allow green only when runtime 🟢 + archive 2xx. must_keep TC-041 / TC-06/07/08.
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const MATRIX = path.join(ROOT, 'docs/qa/HDSD_SRS_TESTCASE_MATRIX.md');
const RUNTIME = path.join(ROOT, 'docs/qa/evidence/_tmp-qa-hdsd-bf-03-softdel-ret-01-runtime.json');
const OUT = path.join(ROOT, 'docs/qa/evidence/_tmp-qa-hdsd-matrix-promote-bf-03-softdel-ret-01-result.json');

const ALLOW = new Set(['TC-HRM-HDSD-025']);

const NEVER_TOUCH = new Set([
  'TC-HRM-HDSD-041',
  'TC-HRM-HDSD-049',
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

const runtime = JSON.parse(fs.readFileSync(RUNTIME, 'utf8'));
const promotions = runtime.tc.filter((t) => ALLOW.has(t.id));

// Guard: refuse green without archive http 2xx in detail/http
for (const t of promotions) {
  if (t.verdict === '🟢') {
    const httpOk = t.http >= 200 && t.http < 300;
    const detailArchive = /archive=POST\s+2\d\d|archive=DELETE\s+2\d\d/i.test(t.detail || '');
    if (!httpOk && !detailArchive) {
      console.error('REFUSE green without archive 2xx', t);
      process.exit(2);
    }
  }
}

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

text = text.replace(
  /(\*\*)(\d+)🟢\s*[·•]\s*(\d+)🟡\s*[·•]\s*(\d+)⬜(\*\*)/g,
  `**${after.c['🟢'] || 0}🟢 · ${after.c['🟡'] || 0}🟡 · ${after.c['⬜'] || 0}⬜**`,
);

fs.writeFileSync(MATRIX, text);

const result = {
  work_item_id: 'QA-HDSD-BF-03-SOFTDEL-RET-01',
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
