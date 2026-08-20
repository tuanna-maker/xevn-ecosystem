#!/usr/bin/env node
/**
 * QA-HDSD-MATRIX-PROMOTE-02 — map W0–W4 🟢 UAT evidence → matrix Verdict
 * U65 zero-seed · evidence-only · no regression of existing 🟢
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const MATRIX = path.join(ROOT, 'docs/qa/HDSD_SRS_TESTCASE_MATRIX.md');

/** legacy UAT TC → matrix v2.0 row + evidence ref */
const PROMOTIONS = [
  // W0 — hdsd-uat-eco-20260730.md
  { id: 'TC-ECO-006', verdict: '🟢', was: '🟡', legacy: 'TC-ECO-03', wave: 'W0', evidence: 'hdsd-uat-eco-20260730.md', note: 'Rail phân hệ labels + navigation smoke 🟢' },
  { id: 'TC-HRM-HDSD-001', verdict: '🟢', was: '🟡', legacy: 'TC-HRM-HDSD-001', wave: 'W0', evidence: 'hdsd-uat-eco-20260730.md', note: 'Embed + standalone load OK' },

  // W1 — hdsd-uat-ch02-04-20260730.md + hdsd-uat-xbos-20260730.md
  { id: 'TC-XBOS-HDSD-028', verdict: '🟢', was: '⬜', legacy: 'TC-HDSD-02-01-01', wave: 'W1', evidence: 'hdsd-uat-ch02-04-20260730.md', note: 'Login POST 201 → /command-center' },
  { id: 'TC-XBOS-HDSD-029', verdict: '🟢', was: '⬜', legacy: 'TC-HDSD-02-01-01', wave: 'W1', evidence: 'hdsd-uat-ch02-04-20260730.md', note: 'Login form buttons Network 2xx' },
  { id: 'TC-XBOS-HDSD-033', verdict: '🟢', was: '⬜', legacy: 'TC-HDSD-02-01-02', wave: 'W1', evidence: 'hdsd-uat-ch02-04-20260730.md', note: 'Wrong password POST 401 + banner' },
  { id: 'TC-XBOS-HDSD-050', verdict: '🟢', was: '⬜', legacy: 'TC-HDSD-02-03-01', wave: 'W1', evidence: 'hdsd-uat-ch02-04-20260730.md', note: 'CC → HRM embed /hr GET 200' },
  { id: 'TC-XBOS-HDSD-117', verdict: '🟢', was: '⬜', legacy: 'TC-HDSD-04-02-01', wave: 'W1', evidence: 'hdsd-uat-ch02-04-20260730.md · qa-hdsd-mutate-ret-01-20260730.md', note: 'WF designer deep link load 🟢' },

  // W2 — hdsd-uat-ch05-09-20260730.md + driven embed
  { id: 'TC-HRM-HDSD-027', verdict: '🟢', was: '⬜', legacy: 'TC-HDSD-05-02-01', wave: 'W2', evidence: 'hdsd-uat-ch05-09-20260730.md', note: 'J-HRM list→detail GET 200' },
  { id: 'TC-HRM-HDSD-016', verdict: '🟢', was: '⬜', legacy: 'TC-HDSD-05-03-01', wave: 'W2', evidence: 'qa-hdsd-mutate-ret-01-20260730.md', note: 'POST employees 201 U65 FE mutate' },
  { id: 'TC-HRM-HDSD-044', verdict: '🟢', was: '⬜', legacy: 'TC-HDSD-06-03-01', wave: 'W2', evidence: 'hdsd-uat-ch05-09-20260730.md', note: 'BHXH tab load GET 200' },
  { id: 'TC-HRM-HDSD-048', verdict: '🟢', was: '⬜', legacy: 'TC-HDSD-06-03-01', wave: 'W2', evidence: 'qa-hdsd-mutate-ret-01-20260730.md', note: 'P0 insurance list 3×200 L1 probe' },
  { id: 'TC-HRM-HDSD-046', verdict: '🟢', was: '⬜', legacy: 'TC-HDSD-06-04-01', wave: 'W2', evidence: 'hdsd-uat-ch05-09-20260730.md', note: 'BHXH sắp hết hạn tab load' },
  { id: 'TC-HRM-HDSD-059', verdict: '🟢', was: '⬜', legacy: 'TC-HDSD-07-03-01', wave: 'W2', evidence: 'hdsd-uat-ch05-09-20260730.md', note: 'Pipeline ứng viên load' },
  { id: 'TC-HRM-HDSD-075', verdict: '🟢', was: '⬜', legacy: 'TC-HDSD-08-01-01', wave: 'W2', evidence: 'hdsd-uat-ch05-09-20260730.md', note: 'Attendance overview GET 200 no reload storm' },
  { id: 'TC-HRM-HDSD-083', verdict: '🟢', was: '⬜', legacy: 'TC-HDSD-08-02-01', wave: 'W2', evidence: 'qa-hdsd-mutate-ret-01-20260730.md', note: 'P0 leave POST 201 LVT_01 UF-HRM-09' },
  { id: 'TC-HRM-HDSD-079', verdict: '🟢', was: '⬜', legacy: 'TC-HDSD-08-03-01', wave: 'W2', evidence: 'hdsd-uat-ch05-09-20260730.md', note: 'Ca làm việc tab load' },
  { id: 'TC-HRM-HDSD-097', verdict: '🟢', was: '⬜', legacy: 'TC-HDSD-09-02-01', wave: 'W2', evidence: 'hdsd-uat-ch05-09-20260730.md', note: 'Phiếu lương drill list' },

  // W2/W3 menus — hdsd-uat-ch10-11-20260730.md
  { id: 'TC-HRM-HDSD-114', verdict: '🟢', was: '⬜', legacy: 'TC-HDSD-10-02-01', wave: 'W2', evidence: 'hdsd-uat-ch10-11-20260730.md', note: 'Quyết định NS GET 200 empty-ok' },
  { id: 'TC-HRM-HDSD-122', verdict: '🟢', was: '⬜', legacy: 'TC-HDSD-10-03-01', wave: 'W2', evidence: 'hdsd-uat-ch10-11-20260730.md', note: 'Công việc operations/tasks 200' },
  { id: 'TC-HRM-HDSD-129', verdict: '🟢', was: '⬜', legacy: 'TC-HDSD-10-04-01', wave: 'W2', evidence: 'hdsd-uat-ch10-11-20260730.md · qa-hdsd-mutate-ret-01-20260730.md', note: 'DVC nội bộ route load' },
  { id: 'TC-HRM-HDSD-130', verdict: '🟢', was: '⬜', legacy: 'TC-HDSD-10-04-01', wave: 'W2', evidence: 'hdsd-uat-ch10-11-20260730.md', note: 'DVC tab dịch vụ' },
  { id: 'TC-HRM-HDSD-136', verdict: '🟢', was: '⬜', legacy: 'TC-HDSD-10-05-01', wave: 'W2', evidence: 'hdsd-uat-ch10-11-20260730.md', note: 'Quy trình read-only load' },
  { id: 'TC-HRM-HDSD-142', verdict: '🟢', was: '⬜', legacy: 'TC-HDSD-10-06-01', wave: 'W2', evidence: 'hdsd-uat-ch10-11-20260730.md', note: 'Fleet vehicles GET 200' },
  { id: 'TC-HRM-HDSD-145', verdict: '🟢', was: '⬜', legacy: 'TC-HDSD-10-06-01', wave: 'W2', evidence: 'hdsd-uat-ch10-11-20260730.md', note: 'Fleet empty state hợp lệ' },
  { id: 'TC-HRM-HDSD-147', verdict: '🟢', was: '⬜', legacy: 'TC-HDSD-11-01-01', wave: 'W2', evidence: 'hdsd-uat-ch10-11-20260730.md', note: 'Settings catalog-sync 200' },
  { id: 'TC-HRM-HDSD-170', verdict: '🟢', was: '⬜', legacy: 'TC-HDSD-11-02-01', wave: 'W2', evidence: 'hdsd-uat-ch10-11-20260730.md', note: 'Reports summary + reconciliation 200' },
];

function countVerdicts(t) {
  const rows = [...t.matchAll(/\| (TC-[A-Z0-9-]+) .*? \| (🟢|🟡|⬜|🔴) \|/g)];
  const c = {};
  for (const m of rows) c[m[2]] = (c[m[2]] || 0) + 1;
  return { c, total: rows.length };
}

let text = fs.readFileSync(MATRIX, 'utf8');
const before = countVerdicts(text);
const applied = [];
const skipped = [];
const regressions = [];

for (const p of PROMOTIONS) {
  const re = new RegExp(`(\\| ${p.id.replace(/[-]/g, '\\-')} \\|[^\\n]*\\| )([^|]+)( \\|)`, 'm');
  const m = text.match(re);
  if (!m) {
    skipped.push({ ...p, reason: 'row not found' });
    continue;
  }
  const cur = m[2].trim();
  if (cur === '🟢' && p.verdict === '🟢') {
    skipped.push({ ...p, reason: 'already 🟢', cur });
    continue;
  }
  if (cur === '🟢' && p.verdict !== '🟢') {
    regressions.push({ ...p, cur });
    continue;
  }
  text = text.replace(re, `$1${p.verdict}$3`);
  applied.push({ ...p, from: cur });
}

const after = countVerdicts(text);

text = text.replace(
  /\*\*Body promoted:\*\* `QA-HDSD-MATRIX-PROMOTE-01` \(2026-07-30\) — \*\*26 rows\*\* · \*\*23🟢 · 3🟡\*\* · evidence `hdsd-matrix-promote-20260730.md`/,
  `**Body promoted:** \`QA-HDSD-MATRIX-PROMOTE-01\` (2026-07-30) — **26 rows** · **23🟢 · 3🟡** · evidence \`hdsd-matrix-promote-20260730.md\`\n**Wave 02:** \`QA-HDSD-MATRIX-PROMOTE-02\` (2026-07-30) — **+${applied.length} rows** · evidence \`qa-hdsd-matrix-promote-02-20260730.md\``,
);
text = text.replace(
  /\*\*Summary:\*\* 30 🟢 · 4 🟡 · 0 🔴 \(34 spot checks\) → \*\*38 matrix rows promoted\*\* \(35🟢 · 5🟡\) · 322 TC ⬜ \(mutate\/dialog\/W3\/W5\) · U65 mutate \*\*BLOCKED\*\* not faked\./,
  `**Summary:** W0–W4 UAT 🟢 mapped to body · **${after.c['🟢'] || 0}🟢 · ${after.c['🟡'] || 0}🟡** promoted · ${after.c['⬜'] || 0} TC ⬜ (dialog depth / W5) · U65 mutate only where FE POST evidence exists`,
);
text = text.replace(
  /\| \*\*Tổng\*\* \| \*\*360\*\* \| 16 content MD \| 37\+ main \+ tab\/dialog children \| \*\*36🟢 · 5🟡\*\* \(39 rows\) \|/,
  `| **Tổng** | **360** | 16 content MD | 37+ main + tab/dialog children | **${after.c['🟢'] || 0}🟢 · ${after.c['🟡'] || 0}🟡** (${(after.c['🟢'] || 0) + (after.c['🟡'] || 0)} rows) |`,
);

fs.writeFileSync(MATRIX, text);

console.log(JSON.stringify({ applied: applied.length, skipped: skipped.length, regressions: regressions.length, before, after }, null, 2));
fs.writeFileSync(
  path.join(ROOT, 'docs/qa/evidence/_tmp-hdsd-matrix-promote-02-result.json'),
  JSON.stringify({ work_item_id: 'QA-HDSD-MATRIX-PROMOTE-02', before, after, applied, skipped, regressions }, null, 2),
);
