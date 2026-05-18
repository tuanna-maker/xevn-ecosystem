/**
 * Danh mục chức danh theo từng tenant — nguồn sự thật từ:
 *   docs/danh sách công ty và vai trò.md
 *   apps/api/xbos-api/data/org-seed-member-companies.json
 *
 * Cấu trúc:
 *   - departments: danh sách phòng ban → dùng cho `select` field "Phòng ban"
 *   - positionsByDept: map phòng → danh sách chức danh → cascading select FE
 *   - toCatalogItems(): trả CatalogExtensionItemDto[] để ghi vào hrm_employee_basic_fields
 */

import type { CatalogExtensionItemDto } from './dto/append-extension-items.dto';

export type DepartmentPositionMap = Record<string, string[]>;

export type TenantPositionCatalog = {
  tenantId: string;
  departments: string[];
  positionsByDept: DepartmentPositionMap;
};

/** Trích toàn bộ chức danh từ map thành mảng phẳng, loại trùng, sắp xếp. */
function allPositions(map: DepartmentPositionMap): string[] {
  return [...new Set(Object.values(map).flat())].sort((a, b) =>
    a.localeCompare(b, 'vi', { sensitivity: 'base' }),
  );
}

/** Xây CatalogExtensionItemDto[] cho 2 field department + position của catalog `hrm_employee_basic_fields`. */
export function buildPositionCatalogItems(catalog: TenantPositionCatalog): CatalogExtensionItemDto[] {
  const deptSelect = catalog.departments.join('|');
  const posSelect = allPositions(catalog.positionsByDept).join('|');
  return [
    {
      code: 'department',
      label: 'Phòng ban',
      unit: `select:${deptSelect}`,
      status: 'active',
    },
    {
      code: 'position',
      label: 'Chức danh',
      unit: `select:${posSelect}`,
      status: 'active',
    },
  ];
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. Công ty Cổ phần Thương mại và Dịch vụ X.E  (tenant: xe-tmdv)
// ─────────────────────────────────────────────────────────────────────────────
const XE_TMDV: TenantPositionCatalog = {
  tenantId: 'xe-tmdv',
  departments: ['Ban Giám đốc', 'Xưởng dịch vụ'],
  positionsByDept: {
    'Ban Giám đốc': ['Phó giám đốc'],
    'Xưởng dịch vụ': [
      'Bảo vệ - Rửa xe',
      'Cố vấn dịch vụ',
      'Học việc',
      'Kế toán tổng hợp',
      'Nhân viên tạp vụ',
      'Quản đốc Xưởng',
      'Thợ học việc',
      'Thợ kỹ thuật',
      'Thủ kho',
      'Tổ phó',
      'Tổ trưởng',
    ],
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// 2. Công ty TNHH Du lịch Visun  (tenant: visun)
// ─────────────────────────────────────────────────────────────────────────────
const VISUN: TenantPositionCatalog = {
  tenantId: 'visun',
  departments: ['Ban Giám đốc', 'Phòng TCKT', 'Phòng VTHK'],
  positionsByDept: {
    'Ban Giám đốc': ['Giám đốc Visun + Trợ lý GĐ X.E'],
    'Phòng TCKT': ['Phó phòng TCKT'],
    'Phòng VTHK': ['Trưởng nhóm điều hành'],
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// 3. Công ty TNHH Du lịch X.E Việt Nam  (tenant: xe-du-lich)
// ─────────────────────────────────────────────────────────────────────────────
const XE_DU_LICH: TenantPositionCatalog = {
  tenantId: 'xe-du-lich',
  departments: [
    'Ban Giám đốc',
    'Ban Giám sát',
    'Phòng HCNS',
    'Phòng Marketing',
    'Phòng TCKT',
    'Phòng VTHK',
  ],
  positionsByDept: {
    'Ban Giám đốc': [
      'GĐ Du lịch + Thư ký Chủ tịch',
      'Trợ lý Chủ tịch',
      'Trợ lý Giám đốc X.E',
    ],
    'Ban Giám sát': ['Giám sát dịch vụ'],
    'Phòng HCNS': ['Hành chính', 'Trưởng nhóm tuyển dụng'],
    'Phòng Marketing': [
      'Chuyên viên quay dựng',
      'Chuyên viên sáng tạo nội dung',
      'Chuyên viên thiết kế',
      'Trưởng phòng MKT',
    ],
    'Phòng TCKT': ['Kế toán công nợ', 'Kế toán tỉnh', 'Kế toán tổng hợp'],
    'Phòng VTHK': [
      'Chăm sóc khách hàng',
      'Điều phối',
      'Kinh doanh',
      'Lái xe tuyến',
      'Lễ tân',
      'Nhân viên tổng đài',
      'Trưởng bộ phận tổng đài',
      'Trưởng ca tổng đài',
    ],
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// 4. Công ty TNHH X.E Việt Nam  (tenant: xe-vietnam)
// ─────────────────────────────────────────────────────────────────────────────
const XE_VIETNAM: TenantPositionCatalog = {
  tenantId: 'xe-vietnam',
  departments: [
    'Ban Giám đốc',
    'Ban Giám sát',
    'Phòng Dự Án',
    'Phòng HCNS',
    'Phòng QLPT',
    'Phòng TCKT',
    'Phòng VTHH',
    'Phòng VTHK',
  ],
  positionsByDept: {
    'Ban Giám đốc': [
      'Chủ tịch HĐTV',
      'Giám đốc',
      'Thư ký Chủ tịch',
      'Trợ lý chủ tịch HĐTV',
    ],
    'Ban Giám sát': ['Giám sát dịch vụ', 'Giám sát tuân thủ', 'Trưởng nhóm giám sát'],
    'Phòng Dự Án': ['Lập trình viên'],
    'Phòng HCNS': [
      'Bảo vệ',
      'Chuyên viên CNTT',
      'Chuyên viên pháp chế',
      'Nhân viên cận vệ Chủ tịch Hội đồng thành viên',
      'Nhân viên tạp vụ',
      'Nhân viên Tiền lương và Phúc lợi',
      'Trưởng nhóm tuyển dụng',
      'Trưởng phòng HCNS',
      'Tuyển dụng',
    ],
    'Phòng QLPT': ['Chuyên viên quản lý phương tiện', 'Trưởng phòng QLPT'],
    'Phòng TCKT': [
      'Kế toán chuyên quản',
      'Kế toán công nợ',
      'Kế toán hàng hoá',
      'Kế toán thanh toán',
      'Kế toán thuế',
      'Thủ quỹ',
      'Trưởng nhóm thanh toán',
    ],
    'Phòng VTHH': [
      'Admin',
      'Bảo vệ - Rửa xe',
      'Bốc xếp',
      'Điều hành điều phối hàng hoá',
      'Điều hành Lái Cont',
      'Điều hành trung tâm',
      'Điều hành tuyến chính',
      'Điều hành tuyến nhánh',
      'Điều phối',
      'Điều phối hàng hoá',
      'Kinh doanh',
      'Lái tải dự phòng',
      'Lái tải tuyến chính',
      'Lái tải tuyến nhánh',
      'Lái xe Container',
      'Lái xe tải tuyến nhánh',
      'Lái xe trung chuyển',
      'Nhân viên Giám Sát dự án',
      'Nhân viên Kinh doanh',
      'Nhân viên lái xe trung chuyển hàng hoá',
      'Nhân viên tổng đài',
      'TBP Kinh doanh',
      'Trưởng bưu cục',
      'Trưởng nhóm điều hành',
      'Trưởng nhóm tổng đài',
    ],
    'Phòng VTHK': [
      'Admin',
      'Bảo vệ',
      'Điều hành tỉnh',
      'Điều hành Trung tâm',
      'Điều phối',
      'Lái xe trung chuyển',
      'Lái xe tuyến',
      'Nhân viên rửa xe',
      'Nhân viên tạp vụ',
      'Nhân viên tổng đài',
      'Phó phòng VTHK',
      'Thực tập sinh Điều hành trung tâm',
      'Trưởng chi nhánh',
    ],
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Bảng tra cứu theo tenantId
// ─────────────────────────────────────────────────────────────────────────────

export const TENANT_POSITION_CATALOGS: Record<string, TenantPositionCatalog> = {
  'xe-tmdv': XE_TMDV,
  visun: VISUN,
  'xe-du-lich': XE_DU_LICH,
  'xe-vietnam': XE_VIETNAM,
};

/**
 * Trả catalog cho tenantId. Nếu không có → trả về catalog trống để tránh crash.
 * Service layer nên log warning khi tenantId không tìm thấy.
 */
export function getTenantPositionCatalog(tenantId: string): TenantPositionCatalog | undefined {
  return TENANT_POSITION_CATALOGS[tenantId.toLowerCase().trim()];
}
