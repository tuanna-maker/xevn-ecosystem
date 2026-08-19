#!/usr/bin/env node
/**
 * QA-HDSD-BF-01-BULK-01 — promote BF-01 55 TC bucket → HDSD_SRS_TESTCASE_MATRIX
 * cấm: regression 🟢→⬜ · downgrade 🟢
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const MATRIX = path.join(ROOT, 'docs/qa/HDSD_SRS_TESTCASE_MATRIX.md');
const RUNTIME = path.join(ROOT, 'docs/qa/evidence/_tmp-qa-hdsd-bf-01-bulk-01-runtime.json');
const OUT = path.join(ROOT, 'docs/qa/evidence/_tmp-qa-hdsd-matrix-promote-bf-01-bulk-01-result.json');

const MUST_KEEP_GREEN = new Set(['TC-XBOS-HDSD-117', 'TC-XBOS-HDSD-123', 'TC-XBOS-HDSD-132', 'TC-HRM-HDSD-055', 'TC-HRM-HDSD-059']);

function countVerdicts(t) {
  const rows = [...t.matchAll(/\| (TC-[A-Z0-9-]+) .*? \| (🟢|🟡|⬜|🔴) \|/g)];
  const c = {};
  for (const m of rows) c[m[2]] = (c[m[2]] || 0) + 1;
  return { c, total: rows.length };
}

const runtime = JSON.parse(fs.readFileSync(RUNTIME, 'utf8'));
const promotions = runtime.tc.filter((t) => /^TC-(XBOS|HRM)-HDSD-/.test(t.id));

let text = fs.readFileSync(MATRIX, 'utf8');
const before = countVerdicts(text);
const applied = [];
const skipped = [];
const regressions = [];

for (const t of promotions) {
  let target = t.verdict;
  if (MUST_KEEP_GREEN.has(t.id) && target !== '🟢') {
    skipped.push({ id: t.id, reason: 'must_keep 🟢 — skip downgrade attempt', target });
    continue;
  }

  const re = new RegExp(`(\\| ${t.id.replace(/[-]/g, '\\-')} \\|[^\\n]*\\| )([^|]+)( \\|)`, 'm');
  const m = text.match(re);
  if (!m) {
    skipped.push({ id: t.id, reason: 'row not found' });
    continue;
  }
  const cur = m[2].trim();
  if (cur === target) {
    skipped.push({ id: t.id, reason: 'unchanged', cur });
    continue;
  }
  if (cur === '🟢' && target !== '🟢') {
    regressions.push({ id: t.id, cur, target });
    continue;
  }
  if (cur === '🔴') {
    skipped.push({ id: t.id, reason: 'keep 🔴', cur });
    continue;
  }
  text = text.replace(re, `$1${target}$3`);
  applied.push({ id: t.id, from: cur, to: target, detail: t.detail?.slice(0, 100) });
}

const after = countVerdicts(text);
const greenApplied = applied.filter((a) => a.to === '🟢').length;
const yellowApplied = applied.filter((a) => a.to === '🟡').length;

text = text.replace(
  /\*\*BF sweep promote:\*\* `QA-HDSD-MATRIX-PROMOTE-SWEEP-02` \(2026-08-01\) — \*\*\+[\d]+🟢 · \+[\d]+🟡\*\* · evidence `qa-hdsd-matrix-promote-sweep-02-20260801.md`/,
  `**BF sweep promote:** \`QA-HDSD-MATRIX-PROMOTE-SWEEP-02\` (2026-08-01) · evidence \`qa-hdsd-matrix-promote-sweep-02-20260801.md\`\n**BF-01 bulk promote:** \`QA-HDSD-BF-01-BULK-01\` (2026-08-01) — **+${greenApplied}🟢 · +${yellowApplied}🟡** · evidence \`qa-hdsd-bf-01-bulk-01-20260801.md\``,
);

fs.writeFileSync(MATRIX, text);

const result = {
  work_item_id: 'QA-HDSD-BF-01-BULK-01',
  before,
  after,
  appliedCount: applied.length,
  greenApplied,
  yellowApplied,
  regressions,
  applied,
  skippedCount: skipped.length,
  runtimeSummary: runtime.summary,
};
fs.writeFileSync(OUT, JSON.stringify(result, null, 2));
console.log(JSON.stringify({ applied: applied.length, greenApplied, yellowApplied, regressions: regressions.length, before, after }, null, 2));
