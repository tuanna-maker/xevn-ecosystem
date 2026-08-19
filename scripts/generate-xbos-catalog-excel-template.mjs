/**
 * Partner Excel template v2 — chỉ trường danh mục, liệt kê đủ mọi danh mục XBOS.
 * Run: node scripts/generate-xbos-catalog-excel-template.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { HRM_XBOS_CATALOG_DEFS } from './lib/hrm-xbos-catalog-defs.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const require = createRequire(import.meta.url);

function loadXlsx() {
  for (const p of [
    path.join(root, 'apps/web/hrm/node_modules/xlsx'),
    path.join(root, 'node_modules/xlsx'),
  ]) {
    try {
      return require(p);
    } catch {
      /* next */
    }
  }
  throw new Error('xlsx not found — run pnpm install');
}

const XLSX = loadXlsx();
const OUT = path.join(root, 'docs/client-delivery/templates/XBOS_Catalog_Import_Template_v2.xlsx');

/** Command Center + Master — bổ sung ngoài 72 key HRM */
const PLATFORM_CATALOGS = [
  { name: 'Pháp nhân / Đơn vị thành viên', group: 'Tổ chức & pháp nhân', key: 'legal_entities', import: 'Có (API)' },
  { name: 'Danh mục nền — Hạ tầng cơ sở', group: 'Hạ tầng', key: 'foundation_categories', import: 'Có (API)' },
  { name: 'Điểm hạ tầng (kho / bãi / ICD…)', group: 'Hạ tầng', key: 'infrastructure_sites', import: 'Có (API)' },
  { name: 'Khung mẫu hệ thống Phòng/Ban', group: 'Tổ chức', key: 'dept_system_templates', import: 'Có (API)' },
  { name: 'Cây Phòng/Ban theo pháp nhân', group: 'Tổ chức', key: 'org_units', import: 'Có (API)' },
  { name: 'Chức danh (Cài đặt Dashboard)', group: 'Master data', key: 'positions', import: 'Có (API)' },
  { name: 'Đối tác / Nhà cung cấp', group: 'Master data', key: 'vendors', import: 'Có (API)' },
  { name: 'Loại chi phí', group: 'Master data', key: 'expense_categories', import: 'Có (API)' },
  { name: 'Chỉ số KPI (master)', group: 'Master data', key: 'kpi_metrics', import: 'Có (API)' },
  { name: 'Công thức KPI', group: 'Master data', key: 'kpi_formulas', import: 'Có (API)' },
  { name: 'Danh mục phòng ban (catalog)', group: 'Master data', key: 'department_catalog', import: 'Có (API)' },
  { name: 'Vùng / khu vực địa lý', group: 'Master data', key: 'geographic_regions', import: 'Có (API)' },
  { name: 'Khách hàng', group: 'Master data', key: 'customers', import: 'Có (API)' },
  { name: 'Đối tác kinh doanh', group: 'Master data', key: 'partners', import: 'Có (API)' },
  { name: 'Loại phương tiện / tài sản', group: 'Master data', key: 'vehicle_type', import: 'Có (API)' },
  { name: 'Văn bản / Quy định nội bộ', group: 'Command Center', key: 'cc_regulations', import: 'Có (API)' },
  { name: 'Danh mục đo lường / tiền tệ', group: 'Command Center', key: 'cc_measurements', import: 'Có (API)' },
  { name: 'Thiết lập hệ thống giá', group: 'Command Center', key: 'cc_pricing', import: 'Có (API)' },
  { name: 'Mẫu chức danh phân quyền', group: 'Phân quyền', key: 'position_rbac_templates', import: 'Có (API)' },
  { name: 'Ma trận phân quyền theo chức danh', group: 'Phân quyền', key: 'position_rbac_matrix', import: 'Chưa (UI thủ công)' },
  { name: 'Định nghĩa quy trình phê duyệt', group: 'Quy trình', key: 'workflow_definitions', import: 'Chưa (UI thủ công)' },
  { name: 'Danh mục loại yêu cầu tài sản', group: 'Tài sản', key: 'asset_request_types', import: 'Chưa (UI thủ công)' },
  { name: 'Hộp thư duyệt mở rộng danh mục HRM', group: 'Quản trị danh mục', key: 'catalog_governance_inbox', import: 'Chưa (quy trình)' },
  { name: 'Chính sách KPI (rollup)', group: 'Master data', key: 'kpi_policies', import: 'Chưa (API nội bộ)' },
  { name: 'Bộ lọc công ty (GlobalFilter)', group: 'Hệ thống', key: 'companies', import: 'Tự sinh / thủ công' },
];

const DOMAIN_GROUP = {
  organization: 'Tổ chức & pháp nhân',
  strategy: 'Tổ chức & pháp nhân',
  human_resources: 'Nhân sự',
  hrm_employee: 'Hồ sơ nhân viên',
  hr_policy: 'Hợp đồng & chính sách HR',
  attendance: 'Chấm công & nghỉ phép',
  payroll: 'Lương & phúc lợi',
  operations: 'Vận hành',
  recruitment: 'Tuyển dụng',
  documents: 'Hồ sơ & tài liệu',
  hrm_fleet: 'Hồ sơ xe (du lịch)',
  workflow_definition: 'Quy trình',
  finance_control: 'Tài chính',
  performance_management: 'KPI & hiệu suất',
  governance: 'RACI & quản trị',
  command_center: 'Command Center',
};

function hrmImportStatus(key) {
  if (key.startsWith('hrm_employee_') && key.endsWith('_fields')) return 'UI metadata (nhóm trường)';
  if (key.startsWith('wf_')) return 'Tham chiếu quy trình';
  if (['role_permission_matrix', 'user_role_assignments', 'raci_title_assignments', 'activity_capability_map'].includes(key)) {
    return 'Chưa (ma trận — UI)';
  }
  return 'Có (config-sync)';
}

function buildCatalogInventory() {
  const rows = [];
  let stt = 1;

  for (const p of PLATFORM_CATALOGS) {
    rows.push({ stt: stt++, ...p });
  }

  for (const def of HRM_XBOS_CATALOG_DEFS.filter((d) => d.stt > 0).sort((a, b) => a.stt - b.stt)) {
    rows.push({
      stt: stt++,
      name: def.name,
      group: DOMAIN_GROUP[def.domain] ?? def.domain,
      key: def.key,
      import: hrmImportStatus(def.key),
      hrmStt: def.stt,
    });
  }

  for (const def of HRM_XBOS_CATALOG_DEFS.filter((d) => d.stt === 0)) {
    rows.push({
      stt: stt++,
      name: def.name,
      group: DOMAIN_GROUP[def.domain] ?? def.domain,
      key: def.key,
      import: 'Có (config-sync)',
      hrmStt: '—',
    });
  }

  return rows;
}

const DATA_HEADERS = ['Tên danh mục', 'Mã giá trị', 'Tên hiển thị', 'Mô tả', 'Trạng thái', 'Ghi chú'];
const EMPTY_ROWS_PER_CATALOG = 6;

function sheetFromAoA(name, rows, colWidths) {
  const ws = XLSX.utils.aoa_to_sheet(rows);
  if (colWidths) ws['!cols'] = colWidths.map((w) => ({ wch: w }));
  return { name: name.slice(0, 31), ws };
}

const inventory = buildCatalogInventory();

const guide = [
  ['HƯỚNG DẪN — Template danh mục XBOS (gửi đối tác)'],
  [''],
  ['1.', 'Mở sheet «02_DU_LIEU_DANH_MUC» để điền — chỉ 5 cột nghiệp vụ, không cần mã kỹ thuật tenant/API.'],
  ['2.', 'Cột «Tên danh mục» đã điền sẵn — đối tác chỉ điền Mã, Tên hiển thị, Mô tả, Trạng thái (Hoạt động/Ngừng).'],
  ['3.', 'Sheet «01_DANH_SACH_DANH_MUC» liệt kê TOÀN BỘ danh mục hệ thống — kể cả chưa có import file.'],
  ['4.', 'Cột «Import hệ thống»: Có = team XeVN import được; Chưa/UI = nhập thủ công hoặc chờ tính năng.'],
  ['5.', 'Không đổi tên sheet và dòng header. Có thể thêm dòng trống dưới mỗi nhóm.'],
  [''],
  ['Phiên bản', 'v2.0', '2026-06-20'],
];

const listHeader = ['STT', 'Tên danh mục', 'Nhóm module', 'Mã kỹ thuật (tham khảo)', 'STT HRM gốc', 'Import hệ thống'];
const listRows = inventory.map((c) => [c.stt, c.name, c.group, c.key, c.hrmStt ?? '—', c.import]);

const dataRows = [DATA_HEADERS];
for (const c of inventory) {
  for (let i = 0; i < EMPTY_ROWS_PER_CATALOG; i++) {
    dataRows.push([c.name, '', '', '', i === 0 ? 'Hoạt động' : '', '']);
  }
}

const wb = XLSX.utils.book_new();
for (const { name, ws } of [
  sheetFromAoA('00_HUONG_DAN', guide, [8, 72]),
  sheetFromAoA('01_DANH_SACH_DANH_MUC', [listHeader, ...listRows], [6, 40, 22, 28, 12, 22]),
  sheetFromAoA('02_DU_LIEU_DANH_MUC', dataRows, [40, 16, 32, 36, 14, 24]),
]) {
  XLSX.utils.book_append_sheet(wb, ws, name);
}

fs.mkdirSync(path.dirname(OUT), { recursive: true });
XLSX.writeFile(wb, OUT);

console.log(`Wrote ${OUT}`);
console.log(`Catalogs listed: ${inventory.length}`);
console.log(`Data rows (prefilled names): ${dataRows.length - 1}`);
