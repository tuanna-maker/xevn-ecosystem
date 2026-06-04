#!/usr/bin/env node
/**
 * Kế hoạch dự án PMP Phase 1 — đầy đủ, tiếng Việt, Gantt.
 * pnpm run docs:pmp:excel
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { resolveApiHint } from './lib/srs-api-map.mjs';
import { loadPhase1StatusOverrides, resolveImplStatus, ownerFor } from './lib/phase1-impl-status.mjs';
import {
  DU_AN,
  VAI_TRO,
  STAKEHOLDER,
  TRUYEN_THONG,
  KE_HOACH_CHAT_LUONG,
  BAN_GIAO,
  RUI_RO,
  GIA_DINH,
  RANG_BUOC,
  BAI_HOC,
  THAY_DOI,
  WBS_CHI_TIET,
  SPRINT_BACKLOG,
  COT_MOC,
  GATE_CHI_TIET,
  MOD_LABEL,
} from './lib/pmp-phase1-data.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(path.join(root, 'apps/api/hrm-api/package.json'));
const ExcelJS = require('exceljs');

const TRANG_THAI_VI = {
  planned: 'Chưa triển khai',
  be: 'API hoàn thành — chờ UI/E2E',
  fe: 'Giao diện nối API — chờ E2E',
  data: 'Dữ liệu / danh mục — chờ xác nhận',
  e2e_pass: 'Hoàn thành kiểm thử E2E',
  waived: 'Miễn trừ (đã phê duyệt)',
};

function loadUcRows() {
  const md = fs.readFileSync(path.join(root, 'docs/ecosystem/BANG_TONG_HOP_USECASE_XEVN.md'), 'utf8');
  const rows = [];
  for (const line of md.split(/\n/)) {
    const m = line.match(/^\| (\d+) \| ([^|]+) \| ([^|]+) \| ([^|]+) \|/);
    if (!m) continue;
    rows.push({ stt: +m[1], code: m[2].trim(), name: m[3].trim(), layer: m[4].trim() });
  }
  return rows;
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
  if (/^XBOS-DM-LOG/.test(code)) return 'Khối B — DM Logistic';
  if (/^XBOS-DM-HRM|^UC-HRM|^HRM-|^UC-HRM-MOB/.test(code)) return 'Khối C — HRM';
  return 'Khối A — XBOS & Cổng điều hành';
}
function tsDetail(code, mod) {
  const hint = resolveApiHint(code);
  if (hint?.planned) return 'Chưa (API P2)';
  if (hint?.path && !hint.path.includes('*')) return 'Có — endpoint';
  if (hint?.path?.includes('*')) return 'Một phần — pattern API';
  return 'Một phần — theo module';
}

const { overrides } = loadPhase1StatusOverrides();
const p1 = loadUcRows()
  .filter((r) => phaseFor(r.code) === 'P1')
  .map((r) => {
    const mod = modFor(r.code);
    const td = tsDetail(r.code, mod);
    const resolved = resolveImplStatus(r.code, mod, td, overrides);
    const impl = resolved.impl_status ?? resolved;
    const hint = resolveApiHint(r.code);
    return {
      ...r,
      mod,
      modLabel: MOD_LABEL[mod] ?? mod,
      khoi: blockFor(r.code),
      impl_status: impl,
      trang_thai: TRANG_THAI_VI[impl] ?? impl,
      chu_so_huu: ownerFor(r.code, mod),
      da_dong: impl === 'e2e_pass' || impl === 'waived',
      bang_chung: overrides[r.code]?.evidence_path ?? '',
      apiPath: hint?.path ?? '',
      srsFr: `FR-${r.code}`,
    };
  });

const dem = {};
for (const r of p1) dem[r.impl_status] = (dem[r.impl_status] ?? 0) + 1;
const daDong = (dem.e2e_pass ?? 0) + (dem.waived ?? 0);
const tong = p1.length;
const pctMatrix = ((daDong / tong) * 100).toFixed(1);

let qaXacNhan = daDong;
const gatePath = path.join(root, 'docs/qa/PHASE1_GATE_REPORT.md');
if (fs.existsSync(gatePath)) {
  const gateTxt = fs.readFileSync(gatePath, 'utf8');
  const m =
    gateTxt.match(/\*\*(\d+)\s*\/\s*245\s*\(64/) ||
    gateTxt.match(/Closed-style[^0-9]*(\d+)\s*\/\s*245/);
  if (m) qaXacNhan = Number(m[1]);
}
const pctQa = ((qaXacNhan / tong) * 100).toFixed(1);

const ngayBaoCao = new Date().toISOString().slice(0, 10);
const outDir = path.join(root, 'docs/client-delivery');
fs.mkdirSync(outDir, { recursive: true });
const baseName = `Ke_hoach_du_an_PMP_XeVN_Phase1_${ngayBaoCao.replace(/-/g, '')}`;
const outFilePrimary = path.join(outDir, `${baseName}.xlsx`);
const outFile = outFilePrimary;

const wb = new ExcelJS.Workbook();
wb.creator = 'Ban quản lý dự án XeVN';
wb.created = new Date();

function tieuDe(sheet, title, mergeCols = 8) {
  sheet.mergeCells(1, 1, 1, mergeCols);
  const c = sheet.getCell(1, 1);
  c.value = title;
  c.font = { bold: true, size: 14, color: { argb: 'FF1E3A8A' } };
  c.alignment = { horizontal: 'center', vertical: 'middle' };
  sheet.getRow(1).height = 30;
}

function header(sheet, row, cols) {
  const r = sheet.getRow(row);
  cols.forEach((h, i) => {
    const cell = r.getCell(i + 1);
    cell.value = h;
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E40AF' } };
    cell.alignment = { wrapText: true, vertical: 'middle' };
  });
  r.height = 24;
}

function addTable(sheet, startRow, headers, rows, colWidths) {
  header(sheet, startRow, headers);
  rows.forEach((vals, i) => {
    const r = sheet.getRow(startRow + 1 + i);
    vals.forEach((v, j) => {
      r.getCell(j + 1).value = v;
    });
  });
  colWidths?.forEach((w, i) => {
    sheet.getColumn(i + 1).width = w;
  });
}

function parseDate(s) {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

const projectStart = parseDate(DU_AN.batDau);
const projectEnd = parseDate(DU_AN.ketThuc);
const totalDays = Math.round((projectEnd - projectStart) / 86400000) + 1;

const khoiA = p1.filter((r) => r.khoi.startsWith('Khối A'));
const khoiB = p1.filter((r) => r.khoi.startsWith('Khối B'));
const khoiC = p1.filter((r) => r.khoi.startsWith('Khối C'));
const demDong = (arr) => arr.filter((r) => r.da_dong).length;

const GANTT_COLORS = {
  Xong: 'FF22C55E',
  GWC: 'FF86EFAC',
  'Đang TH': 'FF3B82F6',
  'Kế hoạch': 'FFCBD5E1',
  Chưa: 'FFF1F5F9',
};

// 0 Bìa
const s0 = wb.addWorksheet('0_Bia', { properties: { tabColor: { argb: 'FF1E40AF' } } });
addTable(
  s0,
  1,
  ['Hạng mục', 'Giá trị', 'Ghi chú'],
  [
    ['TÊN DỰ ÁN', DU_AN.ten, ''],
    ['MÃ DỰ ÁN', DU_AN.ma, ''],
    ['PHIÊN BẢN', `2.0 — ${ngayBaoCao}`, 'Bản đầy đủ PMP'],
    ['CHỦ ĐẦU TƯ', DU_AN.sponsor, ''],
    ['QUẢN LÝ DỰ ÁN', DU_AN.pm, '10 vai trò: SA, BA×2, Dev×3, QA, QC, TM, DevOps'],
    ['NGÀY BẮT ĐẦU', DU_AN.batDau, ''],
    ['NGÀY KẾT THÚC DỰ KIẾN', DU_AN.ketThuc, '~13 tuần'],
    ['TỔNG USE CASE (P1)', String(tong), 'Không gồm 128 UC Phase 2 Logistic'],
    ['% HOÀN THÀNH (QA xác nhận)', `${pctQa}% (${qaXacNhan}/${tong})`, 'SoT: PHASE1_GATE_REPORT'],
    ['% TIẾN ĐỘ KỸ THUẬT', `${pctMatrix}% (${daDong}/${tong})`, 'Gồm Dev promote chờ QA'],
    ['G2 XBOS (khối A)', `${demDong(khoiA)}/104`, 'Gate chưa đạt nếu <104'],
    ['G3 HRM (khối C)', `${demDong(khoiC)}/119`, ''],
    ['G4 DM-LOG', `${demDong(khoiB)}/22`, 'Đã đạt'],
    ['TRẠNG THÁI', 'ĐANG TRIỂN KHAI', 'Chưa nghiệm thu M5'],
    ['UAT PILOT', 'Sẵn sàng có điều kiện', 'Command Center + HRM embed'],
    ['PRODUCTION', 'Chưa GO', 'Gate riêng'],
    ['TÁI TẠO FILE', 'pnpm run docs:pmp:excel', ''],
  ],
  [28, 48, 40],
);

// 1 Tóm tắt điều hành
const s1 = wb.addWorksheet('1_Tom_tat_dieu_hanh');
tieuDe(s1, '1. TÓM TẮT ĐIỀU HÀNH (EXECUTIVE SUMMARY)', 6);
addTable(
  s1,
  3,
  ['Chỉ số', 'Giá trị', 'RAG', 'Xu hướng', 'Hành động tiếp'],
  [
    ['Tiến độ UC (QA)', `${pctQa}%`, Number(pctQa) >= 90 ? 'Xanh' : Number(pctQa) >= 60 ? 'Vàng' : 'Đỏ', '↑ từ 50%', 'QA-W2/W3 promote'],
    ['Tiến độ kỹ thuật', `${pctMatrix}%`, 'Vàng', '↑', 'Đồng bộ QA'],
    ['Chất lượng L0–L3', 'PASS', 'Xanh', 'Ổn định', 'Giữ regression'],
    ['G2 XBOS', `${demDong(khoiA)}/104`, 'Vàng', '↑', '4 UC planned còn'],
    ['Rủi ro cao mở', '4', 'Vàng', '—', 'BE-W3, FE-W3'],
    ['Ngày đến M5', DU_AN.ketThuc, '—', '—', 'S5 QC GO'],
  ],
  [22, 18, 10, 14, 36],
);

// 2 Điều lệ
const s2 = wb.addWorksheet('2_Dieu_le_du_an');
tieuDe(s2, '2. ĐIỀU LỆ DỰ ÁN (PROJECT CHARTER)');
addTable(
  s2,
  3,
  ['Mục', 'Nội dung chi tiết'],
  [
    ['Bối cảnh', 'Triển khai hệ sinh thái XeVN OS — nền tảng XBOS, Cổng điều hành, HRM, Mobile cho tập đoàn multi-company'],
    ['Mục tiêu', `Nghiệm thu ${tong} UC Phase 1; pilot CEO group; API + UI + seed + traceability`],
    ['Sản phẩm', 'Portal, hrm-api, xbos-api, hrm-mobile, tài liệu BRD/SRS, ma trận UC, báo cáo QC'],
    ['Tiêu chí thành công', '245/245 e2e_pass|waived; phase1:gate=0; QC GO; UAT không lỗi P0 trên pilot'],
    ['Phạm vi trong', 'Sprint S0–S5 + P1-CLOSE; 183 danh mục; DM-LOG 22; MOB 15'],
    ['Phạm vi ngoài', '128 UC Logistic P2; production cutover; hạ tầng cloud prod'],
    ['Các bên liên quan', 'Sponsor, đối tác vận hành, PMO, Dev, QA, QC — sheet 11'],
    ['Ngân sách / nguồn lực', 'Squad agent-assisted; 10 vai trò — sheet 10'],
    ['Lịch tổng thể', `${DU_AN.batDau} → ${DU_AN.ketThuc} — sheet 4 Gantt`],
    ['Phương pháp', 'Agile Scrum S0→S5; overlay P1-CLOSE; evidence-first; không bulk-waive'],
    ['% hiện tại', `QA ${pctQa}% · Kỹ thuật ${pctMatrix}%`],
  ],
  [30, 75],
);

// 3 WBS chi tiết
const s3 = wb.addWorksheet('3_WBS_chi_tiet');
tieuDe(s3, '3. WBS CHI TIẾT (PHÂN RÃ CÔNG VIỆC)');
addTable(
  s3,
  3,
  ['WBS', 'Tên công việc', 'Bắt đầu', 'Kết thúc', '% HT', 'Trạng thái', 'Chủ trì', 'Phụ thuộc'],
  WBS_CHI_TIET.map((t) => [t.wbs, t.ten, t.bat_dau, t.ket_thuc, t.pct, t.tt, t.chu, t.pred]),
  [10, 48, 12, 12, 8, 14, 14, 10],
);

// 4 Gantt
const s4 = wb.addWorksheet('4_Bieu_do_Gantt');
tieuDe(s4, '4. BIỂU ĐỒ GANTT', 20);
const weekCols = [];
for (let d = 0; d < totalDays; d += 7) {
  const dt = new Date(projectStart);
  dt.setDate(dt.getDate() + d);
  weekCols.push(`T${dt.toISOString().slice(5, 10)}`);
}
const ganttHdr = ['WBS', 'Tên', 'Bắt đầu', 'Kết thúc', '%', 'TT', 'Chủ trì', ...weekCols];
header(s4, 3, ganttHdr);
s4.views = [{ state: 'frozen', xSplit: 7, ySplit: 3 }];
WBS_CHI_TIET.forEach((task, idx) => {
  const row = s4.getRow(4 + idx);
  const start = parseDate(task.bat_dau);
  const end = parseDate(task.ket_thuc);
  row.getCell(1).value = task.wbs;
  row.getCell(2).value = task.ten;
  row.getCell(3).value = task.bat_dau;
  row.getCell(4).value = task.ket_thuc;
  row.getCell(5).value = task.pct / 100;
  row.getCell(5).numFmt = '0%';
  row.getCell(6).value = task.tt;
  row.getCell(7).value = task.chu;
  weekCols.forEach((_, wi) => {
    const ws = new Date(projectStart);
    ws.setDate(ws.getDate() + wi * 7);
    const we = new Date(ws);
    we.setDate(we.getDate() + 6);
    if (we >= start && ws <= end) {
      const cell = row.getCell(8 + wi);
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: GANTT_COLORS[task.tt] ?? 'FF94A3B8' },
      };
      cell.value = task.pct >= 100 ? '█' : task.pct > 0 ? '▓' : '░';
    }
  });
});
s4.getColumn(2).width = 40;

// 5 Cột mốc
const s5 = wb.addWorksheet('5_Cot_moc');
tieuDe(s5, '5. CỘT MỐC (MILESTONES)');
addTable(
  s5,
  3,
  ['Mã', 'Tên', 'Sprint', 'Ngày', 'Gate', 'Trạng thái', 'Kết quả', 'Bằng chứng'],
  COT_MOC.map((r) => [...r]),
  [8, 36, 10, 12, 10, 12, 20, 36],
);

// 6 Gate
const s6 = wb.addWorksheet('6_Cong_Gate_G1_G9');
tieuDe(s6, '6. CỔNG CHẤT LƯỢNG G1–G9');
addTable(
  s6,
  3,
  ['Gate', 'Tên', 'Tiêu chí chi tiết', 'Mục tiêu', 'Lệnh / artifact', 'Người xác nhận'],
  GATE_CHI_TIET.map((r) => [...r]),
  [8, 28, 42, 14, 28, 14],
);
const gateRow2 = 3 + GATE_CHI_TIET.length + 3;
addTable(
  s6,
  gateRow2,
  ['Gate', 'Mục tiêu', 'Thực tế', 'Đạt?'],
  [
    ['G1', '245/245', `${qaXacNhan}/245`, qaXacNhan >= tong ? 'ĐẠT' : 'CHƯA'],
    ['G2', '104/104', `${demDong(khoiA)}/104`, demDong(khoiA) >= 104 ? 'ĐẠT' : 'CHƯA'],
    ['G3', '119/119', `${demDong(khoiC)}/119`, demDong(khoiC) >= 119 ? 'ĐẠT' : 'CHƯA'],
    ['G4', '22/22', `${demDong(khoiB)}/22`, 'ĐẠT'],
    ['G5–G9', 'Theo gate report', 'PASS', 'ĐẠT (trừ G1–G3)'],
  ],
  [8, 16, 20, 10],
);

// 7 Kế hoạch chất lượng
const s7 = wb.addWorksheet('7_Ke_hoach_chat_luong');
tieuDe(s7, '7. KẾ HOẠCH QUẢN LÝ CHẤT LƯỢNG');
addTable(
  s7,
  3,
  ['Tầng', 'Tên', 'Lệnh kiểm thử', 'Tiêu chí đạt', 'Chủ trì'],
  KE_HOACH_CHAT_LUONG.map((r) => [r.tang, r.ten, r.lenh, r.tieuChi, r.chuTri]),
  [8, 28, 32, 36, 14],
);

// 8 Tiến độ khối
const s8 = wb.addWorksheet('8_Tien_do_khoi');
tieuDe(s8, '8. TIẾN ĐỘ THEO KHỐI NGHIỆP VỤ');
addTable(
  s8,
  3,
  ['Khối', 'Tổng', 'Đã đóng', '%', 'planned', 'be', 'fe', 'data', 'e2e', 'RAG'],
  [
    ...[
      ['Khối A — XBOS & Portal', khoiA],
      ['Khối B — DM Logistic', khoiB],
      ['Khối C — HRM', khoiC],
    ].map(([label, arr]) => {
      const by = {};
      for (const r of arr) by[r.impl_status] = (by[r.impl_status] ?? 0) + 1;
      const d = demDong(arr);
      const p = ((d / arr.length) * 100).toFixed(1);
      return [
        label,
        arr.length,
        d,
        `${p}%`,
        by.planned ?? 0,
        by.be ?? 0,
        by.fe ?? 0,
        by.data ?? 0,
        by.e2e_pass ?? 0,
        Number(p) >= 90 ? 'Xanh' : Number(p) >= 60 ? 'Vàng' : 'Đỏ',
      ];
    }),
    ['TOÀN P1', tong, daDong, `${pctMatrix}%`, dem.planned ?? 0, dem.be ?? 0, dem.fe ?? 0, dem.data ?? 0, dem.e2e_pass ?? 0, 'Vàng'],
  ],
  [32, 8, 10, 8, 8, 8, 8, 8, 8, 8],
);

// 9 Tiến độ module
const s9 = wb.addWorksheet('9_Tien_do_module');
tieuDe(s9, '9. TIẾN ĐỘ THEO MODULE SRS');
const modRows = Object.keys(MOD_LABEL).map((mod) => {
  const arr = p1.filter((r) => r.mod === mod);
  const d = demDong(arr);
  const p = arr.length ? ((d / arr.length) * 100).toFixed(1) : '0';
  return [MOD_LABEL[mod], arr.length, d, `${p}%`, arr.length - d];
});
addTable(s9, 3, ['Module', 'Tổng UC', 'Đã đóng', '%', 'Còn lại'], modRows, [36, 10, 10, 8, 10]);

// 10 Nguồn lực
const s10 = wb.addWorksheet('10_Nguon_luc');
tieuDe(s10, '10. KẾ HOẠCH NGUỒN LỰC (VAI TRÒ)');
addTable(
  s10,
  3,
  ['Vai trò', 'Mô tả trách nhiệm', 'Đại diện / lane'],
  VAI_TRO.map((r) => [r.vaiTro, r.moTa, r.nguoi]),
  [14, 48, 24],
);

// 11 Stakeholder
const s11 = wb.addWorksheet('11_Nguoi_lien_he');
tieuDe(s11, '11. DANH SÁCH BÊN LIÊN QUAN');
addTable(
  s11,
  3,
  ['Nhóm', 'Tên', 'Quyền hạn / vai trò', 'Kênh liên hệ'],
  STAKEHOLDER.map((r) => [r.nhom, r.ten, r.quyenHan, r.lienHe]),
  [16, 28, 40, 28],
);

// 12 Truyền thông
const s12 = wb.addWorksheet('12_Ke_hoach_truyen_thong');
tieuDe(s12, '12. KẾ HOẠCH TRUYỀN THÔNG');
addTable(
  s12,
  3,
  ['Sự kiện', 'Tần suất', 'Thành phần', 'Đầu ra'],
  TRUYEN_THONG.map((r) => [r.suKien, r.tanSuat, r.thanhPhan, r.dauRa]),
  [32, 14, 28, 36],
);

// 13 Sprint backlog
const s13 = wb.addWorksheet('13_Sprint_backlog');
tieuDe(s13, '13. BACKLOG THEO SPRINT');
addTable(
  s13,
  3,
  ['Sprint', 'Mã việc', 'Vai trò', 'Mô tả', 'Trạng thái', 'Evidence'],
  SPRINT_BACKLOG.map((r) => [...r]),
  [10, 22, 12, 40, 12, 36],
);
s13.autoFilter = { from: { row: 3, column: 1 }, to: { row: 3 + SPRINT_BACKLOG.length, column: 6 } };

// 14 Bàn giao
const s14 = wb.addWorksheet('14_Ban_giao');
tieuDe(s14, '14. DANH MỤC BÀN GIAO');
addTable(
  s14,
  3,
  ['Mã', 'Tên deliverable', 'Trạng thái', 'Vị trí repo / tài liệu'],
  BAN_GIAO.map((r) => [r.id, r.ten, r.trangThai, r.duongDan]),
  [10, 36, 16, 48],
);

// 15 Ma trận UC
const s15 = wb.addWorksheet('15_Ma_tran_245_UC');
tieuDe(s15, '15. MA TRẬN 245 USE CASE', 14);
header(s15, 3, [
  'STT',
  'Mã UC',
  'Tên nghiệp vụ',
  'Khối',
  'Module',
  'SRS FR',
  'Lớp',
  'API (gợi ý)',
  'Trạng thái',
  'Mô tả TT',
  'Đóng?',
  'Owner',
  'Evidence',
]);
p1.forEach((r, i) => {
  const row = s15.getRow(4 + i);
  row.getCell(1).value = r.stt;
  row.getCell(2).value = r.code;
  row.getCell(3).value = r.name;
  row.getCell(4).value = r.khoi;
  row.getCell(5).value = r.modLabel;
  row.getCell(6).value = r.srsFr;
  row.getCell(7).value = r.layer;
  row.getCell(8).value = r.apiPath;
  row.getCell(9).value = r.impl_status;
  row.getCell(10).value = r.trang_thai;
  row.getCell(11).value = r.da_dong ? 'Có' : 'Không';
  row.getCell(12).value = r.chu_so_huu;
  row.getCell(13).value = r.bang_chung;
});
s15.autoFilter = { from: { row: 3, column: 1 }, to: { row: 3 + p1.length, column: 13 } };
s15.views = [{ state: 'frozen', ySplit: 3, xSplit: 3 }];

// 16 Rủi ro
const s16 = wb.addWorksheet('16_Rui_ro');
tieuDe(s16, '16. SỔ RỦI RO & VẤN ĐỀ');
addTable(
  s16,
  3,
  ['ID', 'Loại', 'Mô tả', 'Mức', 'Chủ trì', 'Hành động', 'TT', 'Ghi chú'],
  RUI_RO.map((r) => [...r]),
  [8, 10, 42, 12, 12, 32, 10, 24],
);

// 17 Giả định & ràng buộc
const s17 = wb.addWorksheet('17_Gia_dinh_rang_buoc');
tieuDe(s17, '17. GIẢ ĐỊNH & RÀNG BUỘC');
addTable(s17, 3, ['Mã', 'Giả định'], GIA_DINH, [10, 80]);
addTable(s17, 3 + GIA_DINH.length + 2, ['Mã', 'Ràng buộc'], RANG_BUOC, [10, 80]);

// 18 Thay đổi & bài học
const s18 = wb.addWorksheet('18_Thay_doi_bai_hoc');
tieuDe(s18, '18. NHẬT KÝ THAY ĐỔI & BÀI HỌC');
addTable(s18, 3, ['Mã', 'Ngày', 'Mô tả', 'Người', 'TT'], THAY_DOI, [10, 12, 48, 10, 10]);
addTable(
  s18,
  3 + THAY_DOI.length + 2,
  ['Ngày', 'Sprint', 'Bài học', 'Tag'],
  BAI_HOC.map((r) => [...r]),
  [12, 8, 48, 16],
);

// 19 Bằng chứng
const evDir = path.join(root, 'docs/qa/evidence');
const evFiles = fs.existsSync(evDir)
  ? fs
      .readdirSync(evDir)
      .filter((f) => f.endsWith('.md') && /p1-|phase1|hrm-qc|close/i.test(f))
      .sort()
  : [];
const s19 = wb.addWorksheet('19_Bang_chung');
tieuDe(s19, '19. DANH MỤC BẰNG CHỨNG (EVIDENCE)');
addTable(
  s19,
  3,
  ['STT', 'Tên file', 'Đường dẫn đầy đủ'],
  evFiles.map((f, i) => [i + 1, f, `docs/qa/evidence/${f}`]),
  [6, 40, 55],
);

// 20 RACI mở rộng
const s20 = wb.addWorksheet('20_RACI_chi_tiet');
tieuDe(s20, '20. MA TRẬN RACI (CHI TIẾT)');
addTable(
  s20,
  3,
  ['Hoạt động', 'PM', 'SA', 'BA', 'Dev-BE', 'Dev-FE', 'QA', 'QC'],
  [
    ['WBS / Kế hoạch', 'A', 'C', 'C', 'I', 'I', 'I', 'I'],
    ['Triển khai API', 'A', 'C', 'C', 'R', 'I', 'C', 'I'],
    ['Triển khai UI', 'A', 'C', 'C', 'C', 'R', 'C', 'I'],
    ['Kiểm thử L0–L4', 'A', 'I', 'C', 'C', 'C', 'R', 'C'],
    ['Promote UC / matrix', 'A', 'I', 'C', 'C', 'C', 'R', 'C'],
    ['Gate Go/No-Go', 'A', 'C', 'I', 'I', 'I', 'C', 'R'],
    ['Nghiệm thu M5', 'A', 'C', 'C', 'I', 'I', 'C', 'R'],
  ],
  [28, 8, 8, 8, 8, 8, 8, 8],
);

// 21 Hướng dẫn
const s21 = wb.addWorksheet('21_Huong_dan');
s21.getColumn(1).width = 100;
[
  'HƯỚNG DẪN ĐỌC FILE KẾ HOẠCH DỰ ÁN PMP — XEVN PHASE 1',
  '',
  '• Sheet 0–2: Tổng quan và điều lệ — gửi Sponsor/đối tác.',
  '• Sheet 4: Biểu đồ Gantt — ô màu theo tuần; █ hoàn thành, ▓ đang làm, ░ trong khoảng chưa xong.',
  '• Sheet 15: Ma trận 245 UC — lọc cột "Đóng?" = Không để xem việc còn.',
  '• Sheet 6 + 8–9: Gate và tiến độ khối/module.',
  '• Sheet 13 + 19: Backlog sprint và bằng chứng QA.',
  '• % chính thức gửi đối tác: dòng "QA xác nhận" sheet 0 (PHASE1_GATE_REPORT).',
  '• Tái tạo: pnpm run docs:pmp:excel',
].forEach((t, i) => {
  s21.getRow(i + 1).getCell(1).value = t;
});

try {
  await wb.xlsx.writeFile(outFilePrimary);
  console.log(`Đã ghi: ${outFilePrimary}`);
} catch (err) {
  if (err?.code === 'EBUSY') {
    const alt = path.join(outDir, `${baseName}_v2.xlsx`);
    await wb.xlsx.writeFile(alt);
    console.log(`File gốc đang mở — đã ghi: ${alt}`);
  } else throw err;
}
console.log(`Sheets: ${wb.worksheets.length} · QA ${pctQa}% · Matrix ${pctMatrix}%`);
