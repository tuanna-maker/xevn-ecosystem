#!/usr/bin/node
/**
 * Export báo cáo tiến độ Phase 1 cho đối tác (Excel).
 * Usage: node scripts/export-partner-phase1-report.mjs
 * Output: docs/client-delivery/Bao_cao_tien_do_XeVN_Phase1_YYYYMMDD.xlsx
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { resolveApiHint } from './lib/srs-api-map.mjs';
import { loadPhase1StatusOverrides, resolveImplStatus, ownerFor } from './lib/phase1-impl-status.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(path.join(root, 'apps/api/hrm-api/package.json'));
const ExcelJS = require('exceljs');

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
  if (/^XBOS-DM-LOG/.test(code)) return 'B — DM Logistic';
  if (/^XBOS-DM-HRM|^UC-HRM|^HRM-|^UC-HRM-MOB/.test(code)) return 'C — HRM';
  return 'A — XBOS & Portal';
}

function tsDetail(code, mod) {
  const hint = resolveApiHint(code);
  if (hint?.planned) return 'Chưa (API P2)';
  if (hint?.path && !hint.path.includes('*')) return 'Có — endpoint';
  if (hint?.path?.includes('*')) return 'Một phần — pattern API';
  if (/^UC-HRM-2[567]|UC-CC-P0-09|UC-ECO-FE-01/.test(code)) return 'Một phần — backlog/mock';
  if (mod === 'M03') return 'Một phần — pattern XBOS-DM';
  if (/^UC-RACI/.test(code)) return 'Có — raci-governance';
  if (/^UC-XBOS-WF|^UC-XBOS-13|^UC-XBOS-14/.test(code)) return 'Có — workflow-engine';
  if (/^XBOS-DM-/.test(code)) return 'Một phần — catalog-governance';
  return 'Một phần — theo module';
}

const STATUS_VI = {
  planned: 'Chưa triển khai',
  be: 'API xong — chờ UI/E2E',
  fe: 'UI nối API — chờ E2E',
  data: 'Dữ liệu/seed — chờ verify',
  e2e_pass: 'Hoàn thành (E2E)',
  waived: 'Miễn trừ (đã duyệt)',
};

const { overrides } = loadPhase1StatusOverrides();
const p1Rows = rows.filter((r) => phaseFor(r.code) === 'P1').map((r) => {
  const mod = modFor(r.code);
  const td = tsDetail(r.code, mod);
  const resolved = resolveImplStatus(r.code, mod, td, overrides);
  const st = resolved.impl_status ?? resolved;
  const impl = typeof st === 'string' ? st : st.impl_status;
  const evidence = overrides[r.code]?.evidence_path ?? resolved.evidence_path ?? '';
  return {
    ...r,
    mod,
    block: blockFor(r.code),
    impl_status: impl,
    status_vi: STATUS_VI[impl] ?? impl,
    owner: ownerFor(r.code, mod),
    evidence_path: evidence,
    closed: impl === 'e2e_pass' || impl === 'waived',
  };
});

const counts = {};
for (const r of p1Rows) counts[r.impl_status] = (counts[r.impl_status] ?? 0) + 1;
const closed = (counts.e2e_pass ?? 0) + (counts.waived ?? 0);
const total = p1Rows.length;
const pct = ((closed / total) * 100).toFixed(1);

const blockA = p1Rows.filter((r) => r.block.startsWith('A'));
const blockB = p1Rows.filter((r) => r.block.startsWith('B'));
const blockC = p1Rows.filter((r) => r.block.startsWith('C'));
const closedIn = (arr) => arr.filter((r) => r.closed).length;

const gateReport = fs.existsSync(path.join(root, 'docs/qa/PHASE1_GATE_REPORT.md'))
  ? fs.readFileSync(path.join(root, 'docs/qa/PHASE1_GATE_REPORT.md'), 'utf8')
  : '';

const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
const outDir = path.join(root, 'docs/client-delivery');
fs.mkdirSync(outDir, { recursive: true });
const outFile = path.join(outDir, `Bao_cao_tien_do_XeVN_Phase1_${date}.xlsx`);

const wb = new ExcelJS.Workbook();
wb.creator = 'XeVN PM';
wb.created = new Date();

function styleHeader(row) {
  row.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E40AF' } };
  row.alignment = { vertical: 'middle', wrapText: true };
}

// Sheet 1 — Tổng quan
const s1 = wb.addWorksheet('1_Tong_quan', { views: [{ state: 'frozen', ySplit: 1 }] });
s1.columns = [
  { header: 'Hạng mục', key: 'k', width: 42 },
  { header: 'Giá trị', key: 'v', width: 55 },
  { header: 'Ghi chú', key: 'n', width: 50 },
];
styleHeader(s1.getRow(1));
const qaW1bClosed = 157;
const qaW1bPct = ((qaW1bClosed / total) * 100).toFixed(1);

const summaryRows = [
  ['Dự án', 'XeVN OS — Phase 1 (245 use case)', 'Không gồm 128 UC Logistic Phase 2'],
  ['Ngày báo cáo', new Date().toISOString().slice(0, 10), 'Tự động từ repo'],
  ['% hoàn thành (QA xác nhận P1-CLOSE-W1B)', `${qaW1bPct}%`, `${qaW1bClosed}/${total} — SoT gate QA`],
  ['% hoàn thành (ma trận kỹ thuật + override)', `${pct}%`, `${closed}/${total} — gồm BE/FE chờ QA ack`],
  ['Trạng thái chương trình', 'ĐANG TRIỂN KHAI — chưa ký DONE', 'Cần 245/245 + QC GO'],
  ['Khối A XBOS+Portal (G2)', `${closedIn(blockA)}/${blockA.length} E2E`, 'Mục tiêu 104/104'],
  ['Khối B DM Logistic (G4)', `${closedIn(blockB)}/${blockB.length} E2E`, 'G4 đã MET (22/22 DM-LOG)'],
  ['Khối C HRM (G3)', `${closedIn(blockC)}/${blockC.length} E2E`, 'Mục tiêu 119/119 sign-off'],
  ['UAT pilot Command Center+HRM', 'Sẵn sàng có điều kiện (GWC)', 'ceo@xe.vn · embed 8 tab'],
  ['Production', 'Chưa GO', 'Ngoài phạm vi báo cáo này'],
  ['Stack kiểm thử L0', 'PASS', 'qc:dev-stack'],
  ['UAT tích hợp L1', '37/37 PASS', 'test:system:uat'],
  ['Pilot flows L2', '13/13 PASS', 'test:pilot:flows'],
  ['impl_status planned', String(counts.planned ?? 0), 'Chưa code'],
  ['impl_status be', String(counts.be ?? 0), 'API có, chờ promote'],
  ['impl_status fe', String(counts.fe ?? 0), 'UI chờ E2E'],
  ['impl_status data', String(counts.data ?? 0), 'Seed/catalog'],
  ['impl_status e2e_pass', String(counts.e2e_pass ?? 0), 'Đã đóng'],
  ['impl_status waived', String(counts.waived ?? 0), '1 UC (UC-HRM-27)'],
  ['Nguồn số liệu', 'docs/qa/PHASE1_GATE_REPORT.md', 'P1-CLOSE-QA-W1B'],
];
for (const [k, v, n] of summaryRows) s1.addRow({ k, v, n });

// Sheet 2 — Gate G1-G9
const s2 = wb.addWorksheet('2_Gate_G1_G9');
s2.columns = [
  { header: 'Gate', key: 'g', width: 8 },
  { header: 'Tiêu chí', key: 'c', width: 38 },
  { header: 'Mục tiêu', key: 't', width: 18 },
  { header: 'Thực tế', key: 'a', width: 22 },
  { header: 'Đạt?', key: 'ok', width: 12 },
];
styleHeader(s2.getRow(1));
const gates = [
  ['G1', '245 UC e2e_pass hoặc waived', '245/245', `${qaW1bClosed}/${total} (QA) · ${closed}/${total} (matrix)`, closed === total ? 'ĐẠT' : 'CHƯA'],
  ['G2', 'XBOS khối A e2e_pass', '104/104', `${closedIn(blockA)}/104*`, 'CHƯA'],
  ['G3', 'HRM khối C sign-off', '119/119', `${closedIn(blockC)}/119`, 'CHƯA'],
  ['G4', 'DM-LOG 22 UC', '22/22', `${closedIn(blockB)}/22`, closedIn(blockB) >= 22 ? 'ĐẠT' : 'CHƯA'],
  ['G5', '183 danh mục + menu density', '7/7', '7/7', 'ĐẠT'],
  ['G6', 'Mobile HRM 15 UC', '15/15', '15/15', 'ĐẠT'],
  ['G7', 'phase1:gate exit 0', '0', '0', 'ĐẠT'],
  ['G8', 'L0-L3 pilot P-CC', 'PASS', 'PASS', 'ĐẠT'],
  ['G9', 'Traceability test ≥ partial', '245/245', '245/245', 'ĐẠT'],
];
for (const row of gates) s2.addRow({ g: row[0], c: row[1], t: row[2], a: row[3], ok: row[4] });
s2.getCell('A12').value = '* G2 đếm UC khối A theo ma trận STT 1–97, 367–373';

// Sheet 3 — Ma trận 245 UC
const s3 = wb.addWorksheet('3_Ma_tran_245_UC');
s3.columns = [
  { header: 'STT', key: 'stt', width: 6 },
  { header: 'Mã UC', key: 'code', width: 22 },
  { header: 'Tên nghiệp vụ', key: 'name', width: 42 },
  { header: 'Khối', key: 'block', width: 16 },
  { header: 'Module', key: 'mod', width: 8 },
  { header: 'Lớp', key: 'layer', width: 14 },
  { header: 'Trạng thái', key: 'impl_status', width: 14 },
  { header: 'Mô tả trạng thái', key: 'status_vi', width: 28 },
  { header: 'Đóng?', key: 'closed', width: 8 },
  { header: 'Owner', key: 'owner', width: 12 },
  { header: 'Evidence', key: 'evidence_path', width: 48 },
];
styleHeader(s3.getRow(1));
for (const r of p1Rows) {
  s3.addRow({
    stt: r.stt,
    code: r.code,
    name: r.name,
    block: r.block,
    mod: r.mod,
    layer: r.layer,
    impl_status: r.impl_status,
    status_vi: r.status_vi,
    closed: r.closed ? 'Có' : 'Không',
    owner: r.owner,
    evidence_path: r.evidence_path,
  });
}
s3.autoFilter = { from: 'A1', to: 'K1' };

// Sheet 4 — Theo khối
const s4 = wb.addWorksheet('4_Tien_do_khoi');
s4.columns = [
  { header: 'Khối', key: 'block', width: 20 },
  { header: 'Tổng UC', key: 'total', width: 10 },
  { header: 'Đã đóng (E2E+waived)', key: 'done', width: 18 },
  { header: '%', key: 'pct', width: 10 },
  { header: 'planned', key: 'planned', width: 10 },
  { header: 'be', key: 'be', width: 8 },
  { header: 'fe', key: 'fe', width: 8 },
  { header: 'data', key: 'data', width: 8 },
];
styleHeader(s4.getRow(1));
for (const [label, arr] of [
  ['A — XBOS & Portal', blockA],
  ['B — DM Logistic', blockB],
  ['C — HRM', blockC],
]) {
  const by = {};
  for (const r of arr) by[r.impl_status] = (by[r.impl_status] ?? 0) + 1;
  const d = arr.filter((r) => r.closed).length;
  s4.addRow({
    block: label,
    total: arr.length,
    done: d,
    pct: `${((d / arr.length) * 100).toFixed(1)}%`,
    planned: by.planned ?? 0,
    be: by.be ?? 0,
    fe: by.fe ?? 0,
    data: by.data ?? 0,
  });
}
s4.addRow({});
s4.addRow({ block: 'TOÀN PHASE 1', total, done: closed, pct: `${pct}%` });

// Sheet 5 — Hướng dẫn đối tác
const s5 = wb.addWorksheet('5_Huong_dan');
s5.getColumn(1).width = 90;
s5.addRow(['Báo cáo tiến độ XeVN OS — Phase 1 (dành cho đối tác)']);
s5.addRow([]);
s5.addRow(['1. % hoàn thành trên sheet Tổng quan = UC đã qua kiểm thử E2E hoặc được PM miễn trừ có evidence.']);
s5.addRow(['2. Chưa đủ 100% nghĩa là chương trình Phase 1 chưa ký nghiệm thu — vẫn đang sprint P1-CLOSE.']);
s5.addRow(['3. UAT pilot: đăng nhập Portal → Command Center → HRM (tài khoản pilot trong tài liệu nội bộ).']);
s5.addRow(['4. Chi tiết kỹ thuật: docs/client-delivery/ (BRD/SRS) và docs/qa/PHASE1_GATE_REPORT.md.']);

await wb.xlsx.writeFile(outFile);
console.log(`Wrote ${outFile}`);
console.log(`Phase 1 closed-style: ${closed}/${total} (${pct}%)`);
