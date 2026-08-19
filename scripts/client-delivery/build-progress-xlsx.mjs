#!/usr/bin/node
/**
 * Client progress Excel — XBOS + HRM (ba-docs / PO-CLIENT-PROGRESS-XBOS-HRM-XLSX-01)
 *
 * SoT (read, do not invent):
 *  - docs/ecosystem/PHASE1_UC_SRS_TECHSPEC_MATRIX.md
 *  - docs/qa/USER_FLOW_OPERABILITY_MATRIX.md (UF mapping)
 *  - docs/client-delivery/hrm-enterprise-blueprint/UC_INVENTORY.md
 *  - QC locks: remaster_program_done=false · face_live=false · Attendance not CLOSED · Phase 1 not DONE
 *
 * Usage: node scripts/client-delivery/build-progress-xlsx.mjs
 * Output:
 *  - docs/client-delivery/progress/BAO_CAO_TIEN_DO_XBOS_2026-08-05.xlsx
 *  - docs/client-delivery/progress/BAO_CAO_TIEN_DO_HRM_2026-08-05.xlsx
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const require = createRequire(path.join(root, 'apps/api/hrm-api/package.json'));
const ExcelJS = require('exceljs');

const REPORT_DATE = '2026-08-05';
const OUT_DIR = path.join(root, 'docs/client-delivery/progress');

/** @typedef {'Hoàn thành'|'Đang làm'|'Chưa làm'|'Chấp nhận tạm (P1)'|'Chờ quyết định'} ProgressStatus */

const STATUS = {
  DONE: 'Hoàn thành',
  WIP: 'Đang làm',
  TODO: 'Chưa làm',
  P1: 'Chấp nhận tạm (P1)',
  HOLD: 'Chờ quyết định',
};

const PCT = {
  [STATUS.DONE]: 100,
  [STATUS.WIP]: 50,
  [STATUS.TODO]: 0,
  [STATUS.P1]: 75,
  [STATUS.HOLD]: 0,
};

const HEADER_FILL = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E40AF' } };
const HEADER_FONT = { bold: true, color: { argb: 'FFFFFFFF' }, name: 'Calibri', size: 11 };
const THIN = { style: 'thin', color: { argb: 'FFCBD5E1' } };

// ─── Parse Phase 1 matrix ───────────────────────────────────────────────────

function parsePhase1Matrix() {
  const md = fs.readFileSync(
    path.join(root, 'docs/ecosystem/PHASE1_UC_SRS_TECHSPEC_MATRIX.md'),
    'utf8',
  );
  /** @type {Array<{stt:string,code:string,name:string,mod:string,impl:string,owner:string}>} */
  const rows = [];
  for (const line of md.split(/\n/)) {
    const m = line.match(
      /^\|\s*([\d]+a?)\s*\|\s*`([^`]+)`\s*\|\s*([^|]+)\|\s*([^|]+)\|\s*([^|]+)\|\s*([^|]+)\|\s*([^|]+)\|\s*([^|]+)\|/,
    );
    if (!m) continue;
    rows.push({
      stt: m[1].trim(),
      code: m[2].trim(),
      name: m[3].trim().replace(/…$/, '…'),
      mod: m[4].trim(),
      impl: m[7].trim(),
      owner: m[8].trim(),
    });
  }
  return rows;
}

function parseBlueprintInventory() {
  const md = fs.readFileSync(
    path.join(root, 'docs/client-delivery/hrm-enterprise-blueprint/UC_INVENTORY.md'),
    'utf8',
  );
  /** @type {Array<{code:string,name:string,fr:string,module:string}>} */
  const rows = [];
  let module = 'Khác';
  for (const line of md.split(/\n/)) {
    if (line.startsWith('## Module REC')) module = 'Tuyển dụng';
    else if (line.startsWith('## Module CORE')) module = 'Nhân sự';
    else if (line.startsWith('## Module ATT')) {
      // leave vs attendance split later by code
      module = 'Chấm công';
    } else if (line.startsWith('## Module PAY')) module = 'Lương';

    // Module tables only (5+ columns: code | name | WBS|— | FR | …)
    const m = line.match(
      /^\|\s*(UC-BP-[A-Za-z0-9-]+)\s*\|\s*([^|]+)\|\s*((?:WBS-[^|]+)|—)\|\s*([^|]+)\|/,
    );
    if (!m) continue;
    const code = m[1].trim();
    if (rows.some((r) => r.code === code)) continue;
    const name = m[2]
      .trim()
      .replace(/\s*—\s*\*\*[^*]+\*\*/g, '')
      .replace(/\*\*/g, '')
      .trim();
    const fr = m[4].trim().replace(/\*\*/g, '');
    let mod = module;
    if (
      /^UC-BP-ATT-0[4-9]|^UC-BP-ATT-05b|^UC-BP-ATT-08|^UC-BP-ATT-09/.test(code)
    ) {
      mod = 'Nghỉ phép';
    } else if (/^UC-BP-ATT/.test(code)) {
      mod = 'Chấm công';
    }
    rows.push({ code, name, fr, module: mod });
  }
  return rows;
}

// ─── Module grouping ────────────────────────────────────────────────────────

function xbosModule(code) {
  if (/AUTH|TENANT|ECO-SCOPE|ECO-FE-01|XBOS-01$/.test(code)) return 'Auth / Cổng Portal';
  if (
    /ORG-|CC-P0-0[123]|UC-CC-0[134]|CC-P0-08|XBOS-10|XBOS-11|AST-|AR-|XBOS-16|ECO-MASTER/.test(
      code,
    )
  ) {
    return 'Tổ chức / Pháp nhân';
  }
  if (/RACI|XBOS-12|CC-P0-04/.test(code)) return 'RACI / Phân quyền';
  if (/WF-|XBOS-1[345]|CC-P0-06|CC-06/.test(code)) return 'Quy trình (Workflow)';
  if (/KPI|DASH|CC-05|MET-|XBOS-07/.test(code)) return 'KPI / Command Center';
  if (/DM-LOG/.test(code)) return 'Danh mục Logistic';
  if (
    /CAT-|XBOS-DM|INF-|SYNC|XBOS-0[2-6]|XBOS-08|MD-|CC-P0-05|CC-07|CC-08/.test(code)
  ) {
    return 'Danh mục (Catalog)';
  }
  return 'Cấu hình / Hệ thống';
}

function hrmPhase1Module(code) {
  if (/MOB-/.test(code)) return 'Mobile';
  if (/DM-HRM|HRM-SC-|UC-HRM-0[6-8]|UC-HRM-06/.test(code)) return 'Metadata / Đồng bộ danh mục';
  if (/HRM-MD-|UC-HRM-26/.test(code)) return 'Metadata / Đồng bộ danh mục';
  if (/HRM-AT-1[0-3]|LEAVE|NP-/.test(code)) return 'Nghỉ phép';
  if (/HRM-AT-|UC-HRM-23|ATT/.test(code)) return 'Chấm công';
  if (/HRM-PR-|UC-HRM-24/.test(code)) return 'Lương';
  if (/HRM-RC-|UC-HRM-22/.test(code)) return 'Tuyển dụng';
  if (
    /HRM-EM-|HRM-CI-|HRM-IM-|UC-HRM-2[015]|UC-HRM-04|UC-HRM-0[2-5]|UC-HRM-CO/.test(code)
  ) {
    return 'Nhân sự';
  }
  if (/UC-HRM-27|HRM-OP-|HRM-PF-|HRM-SV-|HRM-NT-|HRM-FL-|UC-HRM-12|UC-HRM-01/.test(code)) {
    return 'Quyết định / Khác';
  }
  return 'Quyết định / Khác';
}

// ─── Progress resolution (UF / QC — not impl_status alone) ──────────────────

/**
 * XBOS: UF-XBOS-01..15 all 🟢 on Dev8088 (QC R3 GO / wave close).
 * Unmapped e2e UC → Đang làm (đã có kỹ thuật, chưa UF trình duyệt khách).
 */
function resolveXbosProgress(code, impl) {
  /** @type {{status: ProgressStatus, pct: number, note: string, priority: string, srs: string}} */
  const base = {
    status: STATUS.WIP,
    pct: PCT[STATUS.WIP],
    note: '',
    priority: 'Phase 1',
    srs: `FR-${code} · SRS XeVN OS §3`,
  };

  const done = (note) => ({
    ...base,
    status: STATUS.DONE,
    pct: 100,
    note,
  });
  const p1 = (note) => ({
    ...base,
    status: STATUS.P1,
    pct: 75,
    note,
  });
  const wip = (note) => ({
    ...base,
    status: STATUS.WIP,
    pct: 50,
    note,
  });
  const hold = (note) => ({
    ...base,
    status: STATUS.HOLD,
    pct: 0,
    note,
  });

  // Auth / portal login & scope
  if (/UC-XBOS-AUTH-|UC-XBOS-TENANT-|UC-ECO-SCOPE-/.test(code)) {
    return done('Nghiệm thu trình duyệt UF-XBOS-01 / phạm vi đăng nhập');
  }
  // Org / legal entity / shareholders / docs / departments
  if (
    /UC-XBOS-ORG-|UC-CC-P0-01|UC-CC-P0-02|UC-CC-P0-03|UC-CC-01|UC-CC-03|UC-CC-04|UC-CC-P0-08/.test(
      code,
    )
  ) {
    return done('Nghiệm thu UF-XBOS-02..06 / UF-XBOS-12 (pháp nhân, cổ đông, tài liệu, phòng ban)');
  }
  // RACI
  if (/UC-RACI-/.test(code)) {
    return done('Nghiệm thu UF-XBOS-07 (ma trận RACI)');
  }
  // Workflow
  if (/UC-XBOS-WF-|UC-XBOS-13|UC-XBOS-14|UC-CC-P0-06|UC-XBOS-CC-06/.test(code)) {
    return done('Nghiệm thu UF-XBOS-08 (hộp thư duyệt / canvas quy trình)');
  }
  // Catalog governance
  if (/UC-XBOS-CAT-/.test(code)) {
    return done('Nghiệm thu UF-XBOS-09 / UF-XBOS-15 (duyệt danh mục)');
  }
  // KPI / CC widgets
  if (/UC-XBOS-KPI-|UC-XBOS-DASH-|UC-XBOS-CC-05/.test(code)) {
    return done('Nghiệm thu UF-XBOS-10 (bảng điều hành KPI)');
  }
  // RBAC matrix
  if (/UC-XBOS-12|UC-CC-P0-04|UC-XBOS-11/.test(code)) {
    return done('Nghiệm thu UF-XBOS-13 (ma trận phân quyền / chức danh)');
  }
  // CC catalogs
  if (/UC-CC-P0-05/.test(code)) {
    return done('Nghiệm thu UF-XBOS-14 (danh mục văn bản / đo lường / giá)');
  }
  // Member negative — covered by UF-11
  if (code === 'UC-XBOS-CC-07' || code === 'UC-XBOS-CC-08') {
    return done('Luồng cổng điều hành / phòng ban mẫu — phủ nghiệm thu Command Center');
  }
  // Mock/fallback policy
  if (code === 'UC-CC-P0-09') {
    return p1('Chính sách hiển thị tạm khi thiếu API — chấp nhận tạm Phase 1');
  }
  if (code === 'UC-ECO-FE-01') {
    return p1('Thay mock bằng API — đã tiến hành trên các màn pilot; còn mở rộng');
  }
  // Logistics catalog — pattern only
  if (/XBOS-DM-LOG-/.test(code)) {
    return wip('Khai danh mục Logistic theo mẫu — chưa đợt UF trình duyệt riêng');
  }
  // Master / catalog / asset / infra — technical e2e, not UF lane
  if (impl === 'e2e_pass') {
    return wip('Đã có kiểm thử kỹ thuật; chưa thuộc bộ UF trình duyệt nghiệm thu khách');
  }
  if (impl === 'planned') return { ...base, status: STATUS.TODO, pct: 0, note: 'Chưa triển khai' };
  if (impl === 'waived') return p1('Miễn trừ đã ghi nhận trên ma trận Phase 1');
  return wip('Đang triển khai / chờ nghiệm thu');
}

/**
 * HRM Phase 1 codes — UF-HRM web 🟢 + ATT-SIGN QC R2 GO + M2/M3 honesty + mobile GWC slice.
 */
function resolveHrmPhase1Progress(code, impl) {
  const base = {
    status: STATUS.WIP,
    pct: 50,
    note: '',
    priority: 'Phase 1',
    srs: `FR-${code} · docs/hrm/SRS.md / SRS XeVN OS §3`,
  };
  const done = (note) => ({ ...base, status: STATUS.DONE, pct: 100, note });
  const p1 = (note) => ({ ...base, status: STATUS.P1, pct: 75, note });
  const wip = (note) => ({ ...base, status: STATUS.WIP, pct: 50, note });
  const todo = (note) => ({ ...base, status: STATUS.TODO, pct: 0, note });
  const hold = (note) => ({ ...base, status: STATUS.HOLD, pct: 0, note });

  if (code === 'UC-HRM-CO-01' || impl === 'planned') {
    return todo('Chưa wire đủ (headcount / ngành nghề công ty) — còn mở trên ma trận');
  }
  if (code === 'UC-HRM-27' || impl === 'waived') {
    return p1('Quyết định / báo cáo — miễn trừ backlog; menu load OK, chưa DONE sản phẩm đầy đủ');
  }

  // Employees
  if (/HRM-EM-|UC-HRM-21|UC-HRM-03|UC-HRM-04|UC-HRM-05/.test(code)) {
    return done('Nghiệm thu UF-HRM-01 / UF-HRM-03 (danh sách & hồ sơ nhân viên)');
  }
  // Contracts / insurance
  if (/HRM-CI-01|HRM-CI-03|HRM-CI-04|HRM-CI-05|HRM-CI-06|UC-HRM-25/.test(code)) {
    return done('Nghiệm thu UF-HRM-02 (hợp đồng)');
  }
  if (/HRM-CI-02|HRM-CI-07/.test(code)) {
    return done('Nghiệm thu UF-HRM-04 (bảo hiểm liên kết nhân viên)');
  }
  // Import
  if (/HRM-IM-/.test(code)) {
    return p1('Import/export nhân sự — M3 kiểm tra runtime PASS; module Nhân sự chưa đóng toàn phần');
  }
  // Attendance records / sheets
  if (/HRM-AT-01|HRM-AT-02|UC-HRM-23/.test(code)) {
    return done('Nghiệm thu UF-HRM-05 / UF-HRM-16 (bản ghi & bảng chấm công kỳ)');
  }
  if (/HRM-AT-0[3-9]/.test(code)) {
    return p1('Đơn chỉnh sửa chấm công — sóng M2 GWC; module Chấm công chưa đóng toàn phần');
  }
  // Leave
  if (/HRM-AT-1[0-3]/.test(code)) {
    return p1('Nghỉ phép web — nghiệm thu có điều kiện (GWC); còn tinh chỉnh UX duyệt');
  }
  // Payroll
  if (/HRM-PR-05|UC-HRM-24/.test(code)) {
    return done('Nghiệm thu UF-HRM-06 (xem phiếu / vỏ lương)');
  }
  if (/HRM-PR-/.test(code)) {
    return wip('Tính / chốt kỳ lương — còn gắn công thức & bảng công đã chốt');
  }
  // Recruitment
  if (/HRM-RC-0[1-4]|UC-HRM-22/.test(code)) {
    return done('Nghiệm thu UF-HRM-12 (yêu cầu tuyển / đề xuất cơ bản)');
  }
  if (/HRM-RC-0[56]/.test(code)) {
    return wip('Lịch & kết quả phỏng vấn — chưa phủ UF đầy đủ');
  }
  // Settings catalogs / metadata
  if (/HRM-SC-0[1-3]|UC-HRM-06|UC-HRM-07|UC-HRM-08/.test(code)) {
    return done('Nghiệm thu UF-HRM-10 (đồng bộ / sửa danh mục)');
  }
  if (/HRM-SC-0[4-9]|XBOS-DM-HRM-/.test(code)) {
    return p1('Mở rộng danh mục / preset — một phần qua UF-XBOS-15 & catalog; còn mở rộng');
  }
  if (/HRM-MD-|UC-HRM-26/.test(code)) {
    return done('Nghiệm thu UF-HRM-11 (duyệt thay đổi metadata)');
  }
  // Admin / health
  if (/UC-HRM-01|UC-HRM-02/.test(code)) {
    return p1('Kiểm tra dịch vụ / quản trị nền — kỹ thuật ổn định UAT cục bộ');
  }
  // Embed dashboard
  if (code === 'UC-HRM-20') {
    return done('Menu Tổng quan HRM — quét sidebar load OK');
  }
  // Ops / perf / services / fleet — menu load only
  if (/HRM-OP-|HRM-PF-|HRM-SV-|HRM-NT-|HRM-FL-|UC-HRM-12/.test(code)) {
    return p1('Màn hình phụ — load menu OK; độ sâu nghiệp vụ còn mở / stub cho phép');
  }
  // Mobile
  if (/UC-HRM-MOB-01|UC-HRM-MOB-02|UC-HRM-MOB-15/.test(code)) {
    return p1('Mobile đăng nhập / phiên — GWC chrome+login (W4); khuôn mặt chưa golive');
  }
  if (/UC-HRM-MOB-04/.test(code)) {
    return p1('Mobile chấm công GPS — đã chứng minh trên thiết bị; khuôn mặt chưa golive');
  }
  if (/UC-HRM-MOB-0[3]|UC-HRM-MOB-05|UC-HRM-MOB-0[6-9]|UC-HRM-MOB-1[0-4]/.test(code)) {
    return wip('Mobile — đang hoàn thiện hành trình; chương trình remaster giao diện chưa DONE');
  }

  if (impl === 'e2e_pass') {
    return wip('Đã có kiểm thử kỹ thuật; chờ nghiệm thu trình duyệt theo luồng khách');
  }
  return wip('Đang triển khai');
}

/**
 * Enterprise blueprint UC-BP-* — paper SRS v0.8 + selective runtime evidence.
 */
function resolveBlueprintProgress(code, fr) {
  const base = {
    status: STATUS.TODO,
    pct: 0,
    note: '',
    priority: fr.includes('Ưu tiên') || fr === 'Ưu tiên' ? 'Blueprint MVP' : 'Blueprint',
    srs: `SRS_HRM_ENTERPRISE.md · FR-${code}`,
  };
  const done = (note) => ({ ...base, status: STATUS.DONE, pct: 100, note });
  const p1 = (note) => ({ ...base, status: STATUS.P1, pct: 75, note });
  const wip = (note) => ({ ...base, status: STATUS.WIP, pct: 50, note });
  const todo = (note) => ({ ...base, status: STATUS.TODO, pct: 0, note });
  const hold = (note) => ({ ...base, status: STATUS.HOLD, pct: 0, note });

  if (/\bOUT\b/.test(fr) || code.endsWith('-03e') || code === 'UC-BP-REC-03' || code === 'UC-BP-CORE-04') {
    return hold('Ngoài phạm vi MVP giấy / giai đoạn sau — chờ quyết định đưa vào lộ trình');
  }
  if (/\bGĐ2\b/.test(fr) || code === 'UC-BP-ATT-03') {
    return hold('Giai đoạn 2 — chưa triển khai trong đợt hiện tại');
  }

  // Evidenced runtime
  if (code === 'UC-BP-ATT-11') {
    return done('Ký chốt bảng công — nghiệm thu trình duyệt UF (GO làn UF, không đóng module Chấm công)');
  }
  if (code === 'UC-BP-ATT-10') {
    return done('Tổng hợp bảng công kỳ — nghiệm thu UF-HRM-16');
  }
  if (code === 'UC-BP-ATT-09' || code === 'UC-BP-ATT-08' || code === 'UC-BP-ATT-05b') {
    return p1('Nộp / duyệt phép & quỹ — GWC web; còn tinh chỉnh');
  }
  if (code === 'UC-BP-ATT-01' || code === 'UC-BP-ATT-02' || code === 'UC-BP-ATT-03b' || code === 'UC-BP-ATT-03d') {
    return p1('Cấu hình ca / phạt / lịch / GPS — sóng M2 GWC; module chưa đóng');
  }
  if (code === 'UC-BP-ATT-04' || code === 'UC-BP-ATT-04b' || code === 'UC-BP-ATT-05' || code === 'UC-BP-ATT-06' || code === 'UC-BP-ATT-07' || code === 'UC-BP-ATT-12') {
    return wip('Quỹ phép / loại phép / mở quỹ — đặc tả đã chốt; triển khai còn dở');
  }

  if (code === 'UC-BP-CORE-01' || code === 'UC-BP-CORE-02') {
    return p1('Hồ sơ nhân sự vòng công khai / C&B — phủ một phần UF nhân sự; M3 chưa đóng module');
  }
  if (code === 'UC-BP-CORE-02b') {
    return done('Nhóm field metadata — gắn UF-HRM-10/11');
  }
  if (code === 'UC-BP-CORE-09' || code === 'UC-BP-CORE-10') {
    return p1('Hợp đồng / BHXH — phủ một phần UF hợp đồng & bảo hiểm');
  }
  if (/UC-BP-CORE-0[3-8]/.test(code)) {
    return todo('Checklist / tài sản / KT-KL — đặc tả blueprint; chờ triển khai đủ');
  }

  if (code === 'UC-BP-REC-02' || code === 'UC-BP-REC-02b') {
    return p1('Yêu cầu tuyển cơ bản — phủ một phần UF-HRM-12; định biên đầy đủ còn mở');
  }
  if (/UC-BP-REC-/.test(code)) {
    return todo('Tuyển dụng doanh nghiệp (định biên / JD / pipeline) — SRS đã chốt; chờ làm sản phẩm');
  }

  if (code === 'UC-BP-PAY-01' || code === 'UC-BP-PAY-08') {
    return wip('Ranh giới bảng công → lương / phiếu lương — một phần vỏ UF lương');
  }
  if (/UC-BP-PAY-/.test(code)) {
    return todo('Công thức & tách kỳ lương — chờ chốt engine / triển khai');
  }

  return todo('Đã có đặc tả blueprint; chưa nghiệm thu sản phẩm');
}

// ─── Excel helpers ──────────────────────────────────────────────────────────

function styleHeader(row) {
  row.eachCell((cell) => {
    cell.fill = HEADER_FILL;
    cell.font = HEADER_FONT;
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.border = { top: THIN, left: THIN, bottom: THIN, right: THIN };
  });
  row.height = 28;
}

function styleDataRow(row) {
  row.eachCell((cell) => {
    cell.font = { name: 'Calibri', size: 10 };
    cell.border = { top: THIN, left: THIN, bottom: THIN, right: THIN };
    cell.alignment = { vertical: 'middle', wrapText: true };
  });
}

function statusFill(status) {
  const map = {
    [STATUS.DONE]: 'FFDCFCE7',
    [STATUS.WIP]: 'FFFEF3C7',
    [STATUS.TODO]: 'FFF1F5F9',
    [STATUS.P1]: 'FFE0E7FF',
    [STATUS.HOLD]: 'FFFCE7F3',
  };
  return map[status] || 'FFFFFFFF';
}

/**
 * @param {string} product
 * @param {Array<{module:string,code:string,name:string,srs:string,priority:string,status:ProgressStatus,pct:number,note:string}>} detailRows
 * @param {string[]} chuThichLines
 */
async function writeWorkbook(product, detailRows, chuThichLines, outFile) {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'XeVN Client Delivery';
  wb.created = new Date(`${REPORT_DATE}T00:00:00`);

  // Module order
  const moduleOrder =
    product === 'XBOS'
      ? [
          'Auth / Cổng Portal',
          'Tổ chức / Pháp nhân',
          'Danh mục (Catalog)',
          'Danh mục Logistic',
          'Quy trình (Workflow)',
          'KPI / Command Center',
          'RACI / Phân quyền',
          'Cấu hình / Hệ thống',
        ]
      : [
          'Nhân sự',
          'Chấm công',
          'Nghỉ phép',
          'Lương',
          'Tuyển dụng',
          'Mobile',
          'Metadata / Đồng bộ danh mục',
          'Quyết định / Khác',
        ];

  const byMod = new Map();
  for (const r of detailRows) {
    if (!byMod.has(r.module)) byMod.set(r.module, []);
    byMod.get(r.module).push(r);
  }
  const modules = [
    ...moduleOrder.filter((m) => byMod.has(m)),
    ...[...byMod.keys()].filter((m) => !moduleOrder.includes(m)),
  ];

  // Sheet 1 — Tong_quan
  const ws1 = wb.addWorksheet('Tong_quan', {
    views: [{ state: 'frozen', ySplit: 1 }],
  });
  ws1.columns = [
    { header: 'Module', key: 'module', width: 28 },
    { header: 'Số UC', key: 'total', width: 10 },
    { header: 'Hoàn thành', key: 'done', width: 12 },
    { header: 'Đang làm', key: 'wip', width: 12 },
    { header: 'Chưa làm / Chờ', key: 'todoHold', width: 14 },
    { header: '% hoàn thành', key: 'pct', width: 14 },
    { header: 'Ghi chú ngắn (tiếng Việt khách)', key: 'note', width: 56 },
  ];
  styleHeader(ws1.getRow(1));

  let sumTotal = 0;
  let sumDone = 0;
  let sumWip = 0;
  let sumTodoHold = 0;
  let sumP1 = 0;

  for (const mod of modules) {
    const list = byMod.get(mod) || [];
    const done = list.filter((x) => x.status === STATUS.DONE).length;
    const wipOnly = list.filter((x) => x.status === STATUS.WIP).length;
    const p1 = list.filter((x) => x.status === STATUS.P1).length;
    // Sheet schema: 3 count buckets must sum to Số UC — P1 folds into «Đang làm»
    const wip = wipOnly + p1;
    const todoHold = list.filter(
      (x) => x.status === STATUS.TODO || x.status === STATUS.HOLD,
    ).length;
    const total = list.length;
    const pctDone = total ? Math.round((done / total) * 1000) / 10 : 0;
    sumTotal += total;
    sumDone += done;
    sumWip += wip;
    sumTodoHold += todoHold;
    sumP1 += p1;

    const noteBits = [];
    if (p1) {
      noteBits.push(
        `Trong «Đang làm» có ${p1} UC chấp nhận tạm (P1); ${wipOnly} UC đang triển khai`,
      );
    }
    if (todoHold) noteBits.push(`${todoHold} UC chưa làm hoặc chờ quyết định`);
    if (done && done === total) noteBits.push('Luồng chính đã nghiệm thu');
    const row = ws1.addRow({
      module: mod,
      total,
      done,
      wip,
      todoHold,
      pct: pctDone,
      note: noteBits.join('; ') || '—',
    });
    styleDataRow(row);
    row.getCell(6).numFmt = '0.0';
  }

  const overallPct = sumTotal ? Math.round((sumDone / sumTotal) * 1000) / 10 : 0;
  const totalRow = ws1.addRow({
    module: 'TỔNG',
    total: sumTotal,
    done: sumDone,
    wip: sumWip,
    todoHold: sumTodoHold,
    pct: overallPct,
    note: `Chấp nhận tạm (P1): ${sumP1} UC (gộp vào cột Đang làm; không tính vào % hoàn thành). Báo cáo ${REPORT_DATE}.`,
  });
  styleDataRow(totalRow);
  totalRow.font = { bold: true, name: 'Calibri', size: 10 };
  totalRow.getCell(6).numFmt = '0.0';

  // Sheet 2 — Chi_tiet_UC
  const ws2 = wb.addWorksheet('Chi_tiet_UC', {
    views: [{ state: 'frozen', ySplit: 1 }],
  });
  ws2.columns = [
    { header: 'STT', key: 'stt', width: 6 },
    { header: 'Module', key: 'module', width: 26 },
    { header: 'Mã UC', key: 'code', width: 20 },
    { header: 'Tên UC (tiếng Việt)', key: 'name', width: 48 },
    { header: 'SRS ref (file § / FR)', key: 'srs', width: 42 },
    { header: 'Ưu tiên Phase', key: 'priority', width: 14 },
    { header: 'Trạng thái tiến độ', key: 'status', width: 18 },
    { header: '% UC', key: 'pct', width: 8 },
    { header: 'Bằng chứng / ghi chú khách', key: 'note', width: 58 },
  ];
  styleHeader(ws2.getRow(1));

  let stt = 0;
  for (const mod of modules) {
    const list = (byMod.get(mod) || []).slice().sort((a, b) => a.code.localeCompare(b.code));
    for (const r of list) {
      stt += 1;
      const row = ws2.addRow({
        stt,
        module: r.module,
        code: r.code,
        name: r.name,
        srs: r.srs,
        priority: r.priority,
        status: r.status,
        pct: r.pct,
        note: r.note,
      });
      styleDataRow(row);
      row.getCell(7).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: statusFill(r.status) },
      };
    }
  }

  // Sheet 3 — Chu_thich
  const ws3 = wb.addWorksheet('Chu_thich');
  ws3.columns = [{ header: 'Nội dung', key: 'line', width: 110 }];
  styleHeader(ws3.getRow(1));
  for (const line of chuThichLines) {
    const row = ws3.addRow({ line });
    styleDataRow(row);
    row.height = 18;
  }

  await wb.xlsx.writeFile(outFile);
  return {
    path: outFile,
    total: sumTotal,
    done: sumDone,
    wip: sumWip,
    p1: sumP1,
    todoHold: sumTodoHold,
    overallPct,
    modules: modules.map((m) => {
      const list = byMod.get(m) || [];
      return {
        module: m,
        total: list.length,
        done: list.filter((x) => x.status === STATUS.DONE).length,
        pct: list.length
          ? Math.round((list.filter((x) => x.status === STATUS.DONE).length / list.length) * 1000) /
            10
          : 0,
      };
    }),
  };
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const phase1 = parsePhase1Matrix();
  if (phase1.length < 200) {
    throw new Error(`PHASE1 matrix parse too few rows: ${phase1.length}`);
  }

  // Blocks A+B: exclude HRM block C (XBOS-DM-HRM + UC-HRM* + HRM-* + MOB)
  const xbosRows = phase1.filter((r) => {
    if (/^XBOS-DM-HRM-/.test(r.code)) return false;
    if (/^UC-HRM/.test(r.code)) return false;
    if (/^HRM-/.test(r.code)) return false;
    return true;
  });

  const hrmPhase1Rows = phase1.filter((r) => {
    if (/^XBOS-DM-HRM-/.test(r.code)) return true;
    if (/^UC-HRM/.test(r.code)) return true;
    if (/^HRM-/.test(r.code)) return true;
    return false;
  });

  const blueprint = parseBlueprintInventory();

  const xbosDetail = xbosRows.map((r) => {
    const prog = resolveXbosProgress(r.code, r.impl);
    return {
      module: xbosModule(r.code),
      code: r.code,
      name: r.name,
      srs: prog.srs,
      priority: prog.priority,
      status: prog.status,
      pct: prog.pct,
      note: prog.note,
    };
  });

  const hrmDetail = [
    ...hrmPhase1Rows.map((r) => {
      const prog = resolveHrmPhase1Progress(r.code, r.impl);
      return {
        module: hrmPhase1Module(r.code),
        code: r.code,
        name: r.name,
        srs: prog.srs,
        priority: prog.priority,
        status: prog.status,
        pct: prog.pct,
        note: prog.note,
      };
    }),
    ...blueprint.map((r) => {
      const prog = resolveBlueprintProgress(r.code, r.fr);
      return {
        module: r.module,
        code: r.code,
        name: r.name,
        srs: prog.srs,
        priority: prog.priority,
        status: prog.status,
        pct: prog.pct,
        note: prog.note,
      };
    }),
  ];

  const commonDisclaimer = [
    `Ngày báo cáo: ${REPORT_DATE}`,
    '',
    'Quy ước trạng thái tiến độ (chỉ dùng các giá trị sau):',
    '• Hoàn thành — đã nghiệm thu luồng chính trên giao diện (UF / QC GO làn liên quan).',
    '• Đang làm — đã có triển khai hoặc kiểm thử kỹ thuật; chưa nghiệm thu UF trình duyệt đủ.',
    '• Chưa làm — còn trong kế hoạch / chưa nối giao diện nghiệp vụ.',
    '• Chấp nhận tạm (P1) — chấp nhận tạm thời giai Phase 1 với điều kiện còn mở (ghi chú từng dòng).',
    '• Chờ quyết định — ngoài phạm vi đợt này, giai đoạn 2, hoặc chờ quyết định nghiệp vụ.',
    '',
    'Cột «% hoàn thành» trên sheet Tổng quan = số UC «Hoàn thành» / tổng UC của module (không cộng chấp nhận tạm).',
    'Trên sheet Tổng quan: cột «Đang làm» gồm cả UC «Đang làm» và «Chấp nhận tạm (P1)» để tổng 3 cột đếm = Số UC; chi tiết trạng thái xem sheet Chi_tiet_UC.',
    'Cột «% UC» trên sheet Chi tiết = mức hoàn thiện ước lượng theo trạng thái (100 / 75 / 50 / 0).',
    '',
    'Tuyên bố giới hạn (bắt buộc):',
    '• Báo cáo này KHÔNG khẳng định toàn bộ Phase 1 đã hoàn tất.',
    '• KHÔNG khẳng định chương trình làm mới giao diện (remaster) đã DONE.',
    '• KHÔNG khẳng định chấm công khuôn mặt đã golive sản phẩm.',
    '• KHÔNG khẳng định module Chấm công đã đóng toàn phần.',
    '• Sẵn sàng production toàn hệ cần cổng riêng — không suy ra từ báo cáo này.',
  ];

  const xbosChu = [
    `Sản phẩm: XBOS / Command Center (hệ sinh thái điều hành).`,
    `Phạm vi: các use case Phase 1 khối nền tảng XBOS + danh mục Logistic (theo ma trận Phase 1).`,
    `Nguồn đối chiếu: ma trận Phase 1 UC×SRS; bộ luồng nghiệm thu UF-XBOS-01…15 (đều đã xanh trên môi trường UAT cục bộ).`,
    `Ghi chú: nhiều UC danh mục / tài sản có kiểm thử kỹ thuật nhưng chưa thuộc bộ UF trình duyệt — xếp «Đang làm».`,
    ...commonDisclaimer,
  ];

  const hrmChu = [
    `Sản phẩm: HRM (nhân sự — web nhúng cổng + mobile).`,
    `Phạm vi: (1) use case Phase 1 khối HRM trên ma trận hệ sinh thái; (2) inventory doanh nghiệp UC-BP-* theo blueprint SRS v0.8.`,
    `Hai hệ mã UC song song: mã Phase 1 (UC-HRM-*, HRM-*) phục vụ nghiệm thu pilot; mã UC-BP-* phục vụ đặc tả doanh nghiệp đã chốt giấy.`,
    `Bằng chứng gần: UF web HRM xanh; ký chốt bảng công (UC-BP-ATT-11) GO làn trình duyệt; sóng Chấm công M2 và Nhân sự M3 là GWC — module chưa đóng; Mobile W4 GWC đăng nhập/chấm GPS; khuôn mặt chưa golive; remaster chưa DONE.`,
    ...commonDisclaimer,
  ];

  const xbosOut = path.join(OUT_DIR, `BAO_CAO_TIEN_DO_XBOS_${REPORT_DATE}.xlsx`);
  const hrmOut = path.join(OUT_DIR, `BAO_CAO_TIEN_DO_HRM_${REPORT_DATE}.xlsx`);

  const xbosStats = await writeWorkbook('XBOS', xbosDetail, xbosChu, xbosOut);
  const hrmStats = await writeWorkbook('HRM', hrmDetail, hrmChu, hrmOut);

  const summary = {
    reportDate: REPORT_DATE,
    xbos: xbosStats,
    hrm: hrmStats,
    parseCounts: {
      phase1Total: phase1.length,
      xbosUc: xbosDetail.length,
      hrmPhase1Uc: hrmPhase1Rows.length,
      hrmBlueprintUc: blueprint.length,
      hrmDetailTotal: hrmDetail.length,
    },
  };

  const summaryPath = path.join(OUT_DIR, `README_PROGRESS_${REPORT_DATE}.md`);
  const md = `# Báo cáo tiến độ khách — ${REPORT_DATE} (nội bộ team)

> File Excel khách: không chứa work_item / seed / sponsor lock. File này được phép meta.

## Đầu ra

| File | UC | Hoàn thành | Đang làm | P1 tạm | Chưa/Chờ | % HT |
|------|---:|----------:|---------:|-------:|---------:|-----:|
| \`BAO_CAO_TIEN_DO_XBOS_${REPORT_DATE}.xlsx\` | ${xbosStats.total} | ${xbosStats.done} | ${xbosStats.wip} | ${xbosStats.p1} | ${xbosStats.todoHold} | ${xbosStats.overallPct}% |
| \`BAO_CAO_TIEN_DO_HRM_${REPORT_DATE}.xlsx\` | ${hrmStats.total} | ${hrmStats.done} | ${hrmStats.wip} | ${hrmStats.p1} | ${hrmStats.todoHold} | ${hrmStats.overallPct}% |

Parse: Phase1=${phase1.length} · XBOS=${xbosDetail.length} · HRM Phase1=${hrmPhase1Rows.length} · Blueprint=${blueprint.length}

## Module XBOS

${xbosStats.modules.map((m) => `- **${m.module}**: ${m.done}/${m.total} (${m.pct}%)`).join('\n')}

## Module HRM

${hrmStats.modules.map((m) => `- **${m.module}**: ${m.done}/${m.total} (${m.pct}%)`).join('\n')}

## Locks (không claim)

- Phase 1 DONE = false
- remaster_program_done = false
- face_live = false
- Attendance module CLOSED = false

## Rebuild

\`\`\`bash
node scripts/client-delivery/build-progress-xlsx.mjs
\`\`\`

## work_item

\`PO-CLIENT-PROGRESS-XBOS-HRM-XLSX-01\`
`;

  fs.writeFileSync(summaryPath, md, 'utf8');
  fs.writeFileSync(
    path.join(OUT_DIR, `_progress_stats_${REPORT_DATE}.json`),
    JSON.stringify(summary, null, 2),
    'utf8',
  );

  console.log(JSON.stringify(summary, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
