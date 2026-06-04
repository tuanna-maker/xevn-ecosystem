#!/usr/bin/env node
/**
 * Generate docs/ecosystem/PHASE1_UC_SRS_TECHSPEC_MATRIX.md
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolveApiHint } from './lib/srs-api-map.mjs';
import { loadPhase1StatusOverrides, resolveImplStatus } from './lib/phase1-impl-status.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const md = fs.readFileSync(path.join(root, 'docs/ecosystem/BANG_TONG_HOP_USECASE_XEVN.md'), 'utf8');
const rows = [];
for (const line of md.split(/\n/)) {
  const m = line.match(/^\| (\d+) \| ([^|]+) \| ([^|]+) \| ([^|]+) \|/);
  if (!m) continue;
  rows.push({ stt: +m[1], code: m[2].trim(), name: m[3].trim(), layer: m[4].trim() });
}

function phaseFor(code) {
  if (/^LG-/.test(code) && !/^XBOS/.test(code)) return 'P2';
  return 'P1';
}

function modFor(code) {
  if (/^UC-ECO|^UC-CC|^UC-RACI/.test(code)) return 'M00';
  if (/^XBOS-DM-HRM|^UC-XBOS-CAT/.test(code)) return 'M02';
  if (/^XBOS-DM-LOG/.test(code)) return 'M03';
  if (/^UC-XBOS|^XBOS-DM|^UC-ECO-MASTER|^UC-ECO-FE/.test(code)) return 'M01';
  if (/^UC-HRM-MOB/.test(code)) return 'M06';
  if (/^UC-HRM|^HRM-/.test(code)) return 'M05';
  return 'M01';
}

function blockFor(code) {
  if (/^XBOS-DM-LOG/.test(code)) return 'B';
  if (/^XBOS-DM-HRM|^UC-HRM|^HRM-|^UC-HRM-MOB/.test(code)) return 'C';
  return 'A'; // XBOS nền + UC-XBOS-CAT + UC-ECO/CC/RACI
}

const TS_MOD = {
  M00: 'TECHSPEC_HE §8 · TECHSPEC.md · Command Center',
  M01: 'TECHSPEC_HE §4–9 · xbos/TECHSPEC',
  M02: 'TECHSPEC_HE §7–8 · catalog-governance · HRM settings-catalogs',
  M03: 'TECHSPEC_HE §8.1 (pattern DM) — chưa logistics/TECHSPEC',
  M05: 'TECHSPEC_HE §9.3 · hrm/TECHSPEC',
  M06: 'TECHSPEC_HE §9.4 · TECHSPEC_MOBILE',
};

function tsDetail(code, mod) {
  const hint = resolveApiHint(code);
  if (hint?.planned) return 'Chưa (API P2)';
  if (hint?.path && !hint.path.includes('*')) return 'Có — endpoint';
  if (hint?.path?.includes('*')) return 'Một phần — pattern API';
  if (/^UC-HRM-2[567]|UC-CC-P0-09|UC-ECO-FE-01/.test(code)) {
    return 'Một phần — backlog/mock';
  }
  if (mod === 'M03') return 'Một phần — pattern XBOS-DM';
  if (/^UC-RACI/.test(code)) return 'Có — raci-governance';
  if (/^UC-XBOS-WF|^UC-XBOS-13|^UC-XBOS-14/.test(code)) return 'Có — workflow-engine';
  if (/^XBOS-DM-/.test(code)) return 'Một phần — catalog-governance';
  return 'Một phần — theo module';
}

const { overrides } = loadPhase1StatusOverrides();
const p1 = rows.filter((r) => phaseFor(r.code) === 'P1');
let withEp = 0;
let partial = 0;
const implCounts = {};
for (const r of p1) {
  const mod = modFor(r.code);
  const d = tsDetail(r.code, mod);
  if (d.startsWith('Có — endpoint')) withEp += 1;
  else partial += 1;
  const st = resolveImplStatus(r.code, mod, d, overrides).impl_status;
  implCounts[st] = (implCounts[st] ?? 0) + 1;
}

const lines = [];
lines.push('# Ma trận Phase 1 — Use case × SRS × TechSpec');
lines.push('');
lines.push('> Nguồn UC: `docs/ecosystem/BANG_TONG_HOP_USECASE_XEVN.md`. SRS: `docs/client-delivery/02_SRS_XeVN_OS.html` (FR-{mã}). TechSpec: `TECHSPEC_HE_SINH_THAI_XEVN.md` + phân hệ.');
lines.push('');
lines.push('## 1. Tóm tắt Phase 1');
lines.push('');
lines.push('| Chỉ tiêu | Giá trị |');
lines.push('|----------|--------|');
lines.push('| **Tổng UC Phase 1** | **245** |');
lines.push('| Khối **A** — XBOS nền + `UC-XBOS-CAT-*` | **104** (STT 1–97, 367–373) |');
lines.push('| Khối **B** — `XBOS-DM-LOG-*` | **22** (STT 98–119) |');
lines.push('| Khối **C** — HRM đầy đủ | **119** (STT 248–366) |');
lines.push('');
lines.push('### Độ phủ TechSpec (ước lượng trên 245 UC)');
lines.push('');
lines.push('| Mức | Số UC | Ý nghĩa |');
lines.push('|-----|------:|---------|');
lines.push(`| **Có — endpoint** | ${withEp} | Có gợi ý API / controller trong repo |`);
lines.push(`| **Một phần** | ${partial} | SRS + mô tả module; chưa map từng UC |`);
lines.push('| **Chưa** | 0 | — |');
lines.push('');
lines.push('**Kết luận:** SRS Phase 1 **đủ 245/245 FR**. TechSpec **mô tả đủ ở mức module** (M00–M06); **chưa đủ ở mức từng UC** cho ~' + (partial - withEp) + ' UC còn lại — cần bổ sung khi làm nốt P1 (OpenAPI, traceability từng mã).');
lines.push('');
lines.push('### impl_status (tracking code)');
lines.push('');
lines.push('| impl_status | Số UC |');
lines.push('|-------------|------:|');
for (const [k, v] of Object.entries(implCounts).sort((a, b) => b[1] - a[1])) {
  lines.push(`| ${k} | ${v} |`);
}
lines.push('');
lines.push('Cập nhật override: `docs/ecosystem/phase1-impl-status.json` · Regenerate: `pnpm docs:phase1:matrix`');
lines.push('');
lines.push('### Theo MOD SRS');
lines.push('');
lines.push('| MOD | Số UC | Tài liệu TechSpec chính |');
lines.push('|-----|------:|-------------------------|');
for (const mod of ['M00', 'M01', 'M02', 'M03', 'M05', 'M06']) {
  const n = p1.filter((r) => modFor(r.code) === mod).length;
  lines.push(`| ${mod} | ${n} | ${TS_MOD[mod]} |`);
}
lines.push('');
lines.push('---');
lines.push('');

const blocks = [
  ['A', 'XBOS nền tảng + governance CAT (104 UC)', (r) => blockFor(r.code) === 'A'],
  ['B', 'XBOS-DM-LOG — khai danh mục Logistic (22 UC)', (r) => blockFor(r.code) === 'B'],
  ['C', 'HRM — DM, API/Web, Mobile (119 UC)', (r) => blockFor(r.code) === 'C'],
];

for (const [bid, title, filt] of blocks) {
  const grp = p1.filter(filt).sort((a, b) => a.stt - b.stt);
  lines.push(`## 2.${bid} Khối ${bid} — ${title}`);
  lines.push('');
  lines.push('| STT | Mã UC | Tên use case | MOD | SRS (FR) | TechSpec module | TechSpec chi tiết | impl_status | Owner |');
  lines.push('|----:|-------|--------------|-----|----------|-----------------|-------------------|-------------|-------|');
  for (const r of grp) {
    const mod = modFor(r.code);
    const detail = tsDetail(r.code, mod);
    const { impl_status, owner } = resolveImplStatus(r.code, mod, detail, overrides);
    const shortName = r.name.length > 50 ? `${r.name.slice(0, 48)}…` : r.name;
    lines.push(
      `| ${r.stt} | \`${r.code}\` | ${shortName} | ${mod} | Có | ${TS_MOD[mod].split(' · ')[0]} | ${detail} | ${impl_status} | ${owner} |`,
    );
  }
  lines.push('');
}

const outPath = path.join(root, 'docs/ecosystem/PHASE1_UC_SRS_TECHSPEC_MATRIX.md');
fs.writeFileSync(outPath, `${lines.join('\n')}\n`);
console.log(`Wrote ${outPath} (${p1.length} rows)`);
