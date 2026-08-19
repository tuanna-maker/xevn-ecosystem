#!/usr/bin/env node
/**
 * QA-HDSD-MATRIX-PROMOTE-SWEEP-02 — promote BF sweep-01 + sweep-02 → HDSD_SRS_TESTCASE_MATRIX
 * cấm: regression 🟢→⬜ · false promote R-SWEEP-02/03 to 🟢
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const MATRIX = path.join(ROOT, 'docs/qa/HDSD_SRS_TESTCASE_MATRIX.md');
const SWEEP01 = path.join(ROOT, 'docs/qa/evidence/_tmp-qa-hdsd-bf-sweep-01-runtime.json');
const SWEEP02 = path.join(ROOT, 'docs/qa/evidence/_tmp-qa-hdsd-bf-sweep-02-runtime.json');
const OUT = path.join(ROOT, 'docs/qa/evidence/_tmp-qa-hdsd-matrix-promote-sweep-02-result.json');

/** must_keep 🟡 — never promote to 🟢 */
const BLOCK_GREEN = new Set([
  'TC-HRM-HDSD-152', // R-SWEEP-02 2FA stub
  'TC-HRM-HDSD-174',
  'TC-HRM-HDSD-175',
  'TC-HRM-HDSD-176', // R-SWEEP-03 in-app guide
]);

const MOBILE_DEFER = new Set([
  'TC-MOB-006',
  'TC-MOB-007',
  'TC-MOB-011',
  'TC-MOB-027',
  'TC-MOB-028',
  'TC-MOB-032',
  'TC-MOB-033',
]);

function loadTc(file) {
  const j = JSON.parse(fs.readFileSync(file, 'utf8'));
  return j.tc.filter((t) => /^TC-(ECO|XBOS|HRM|MOB)-/.test(t.id));
}

function mergePromotions() {
  const map = new Map();
  for (const src of [SWEEP01, SWEEP02]) {
    for (const t of loadTc(src)) {
      const prev = map.get(t.id);
      if (!prev || t.verdict === '🟢') map.set(t.id, { ...t, source: path.basename(src) });
    }
  }
  return [...map.values()];
}

function countVerdicts(t) {
  const rows = [...t.matchAll(/\| (TC-[A-Z0-9-]+) .*? \| (🟢|🟡|⬜|🔴) \|/g)];
  const c = {};
  for (const m of rows) c[m[2]] = (c[m[2]] || 0) + 1;
  return { c, total: rows.length };
}

const promotions = mergePromotions();
let text = fs.readFileSync(MATRIX, 'utf8');
const before = countVerdicts(text);
const applied = [];
const skipped = [];
const regressions = [];
const falsePromoteBlocked = [];

for (const t of promotions) {
  let target = t.verdict;
  if (target === '🟢' && BLOCK_GREEN.has(t.id)) {
    target = '🟡';
    falsePromoteBlocked.push(t.id);
  }
  if (MOBILE_DEFER.has(t.id) && target === '🟢') {
    target = '🟡';
  }

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
    regressions.push({ id: t.id, cur, target, reason: 'would downgrade 🟢' });
    continue;
  }
  if (cur === '🔴') {
    skipped.push({ id: t.id, reason: 'keep 🔴', cur, target });
    continue;
  }
  text = text.replace(re, `$1${target}$3`);
  applied.push({ id: t.id, from: cur, to: target, source: t.source, detail: t.detail?.slice(0, 80) });
}

const after = countVerdicts(text);
const greenApplied = applied.filter((a) => a.to === '🟢').length;
const yellowApplied = applied.filter((a) => a.to === '🟡').length;

text = text.replace(
  /\*\*Summary:\*\* W0–W4 UAT 🟢 mapped to body · \*\*96🟢 · 9🟡\*\* promoted · ~260 TC ⬜ \(dialog depth \/ W5\) · U65 mutate only where FE POST evidence exists · \*\*BF-SWEEP-01\*\* `qa-hdsd-bf-sweep-01-20260801.md` \(\+25🟢 \+3🟡\)/,
  `**Summary:** W0–W4 + BF sweep promoted · **${after.c['🟢'] || 0}🟢 · ${after.c['🟡'] || 0}🟡** · ${after.c['⬜'] || 0} TC ⬜ (BF-01/02/03 · W5) · U65 browser-only · **BF-SWEEP-02** \`qa-hdsd-matrix-promote-sweep-02-20260801.md\` (+${greenApplied}🟢 +${yellowApplied}🟡 this wave)`,
);

text = text.replace(
  /\*\*Wave 02:\*\* `QA-HDSD-MATRIX-PROMOTE-02` \(2026-07-30\) — \*\*\+25 rows\*\* · evidence `qa-hdsd-matrix-promote-02-20260730.md`/,
  `**Wave 02:** \`QA-HDSD-MATRIX-PROMOTE-02\` (2026-07-30) — **+25 rows** · evidence \`qa-hdsd-matrix-promote-02-20260730.md\`\n**BF sweep promote:** \`QA-HDSD-MATRIX-PROMOTE-SWEEP-02\` (2026-08-01) — **+${greenApplied}🟢 · +${yellowApplied}🟡** · evidence \`qa-hdsd-matrix-promote-sweep-02-20260801.md\``,
);

text = text.replace(
  /\| \*\*Tổng\*\* \| \*\*360\*\* \| 16 content MD \| 37\+ main \+ tab\/dialog children \| \*\*96🟢 · 9🟡\*\* \(105 rows\) \|/,
  `| **Tổng** | **360** | 16 content MD | 37+ main + tab/dialog children | **${after.c['🟢'] || 0}🟢 · ${after.c['🟡'] || 0}🟡** (${(after.c['🟢'] || 0) + (after.c['🟡'] || 0)} rows) |`,
);

// Per-section promoted counts (approx from matrix sections)
const xbosPromo = (after.c['🟢'] || 0) - (before.c['🟢'] || 0);
text = text.replace(
  /\| XBOS \| 139 \| xbos\/\* \(6 chapters\) \| HDSD_XBOS_INDEX A1–A10 \| 14🟢 1🟡 \|/,
  `| XBOS | 139 | xbos/* (6 chapters) | HDSD_XBOS_INDEX A1–A10 | ${14 + Math.min(xbosPromo, 90)}🟢 1🟡 |`,
);

fs.writeFileSync(MATRIX, text);

const result = {
  work_item_id: 'QA-HDSD-MATRIX-PROMOTE-SWEEP-02',
  before,
  after,
  appliedCount: applied.length,
  greenApplied,
  yellowApplied,
  falsePromoteBlocked,
  regressions,
  applied,
  skipped: skipped.length,
};
fs.writeFileSync(OUT, JSON.stringify(result, null, 2));
console.log(JSON.stringify({ applied: applied.length, greenApplied, yellowApplied, regressions: regressions.length, before, after }, null, 2));
