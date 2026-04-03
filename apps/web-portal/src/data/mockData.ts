// ============================================
// MOCK DATA - HỆ THỐNG X-BOS HOLDING CORE
// Hệ sinh thái Vận tải & Logistics XeVN
// Master Data Management (MDM) - Phiên bản PM v2.0
// ============================================

// ============================================
// 1. DANH SÁCH CÔNG TY THÀNH VIÊN (Satellites)
// ============================================

export interface Company {
  id: string;
  code: string;
  name: string;
  shortName: string;
  industry: string;
  status: 'active' | 'inactive';
  employeeCount: number;
  color: string;
}

export const mockCompanies: Company[] = [
  {
    id: 'all',
    code: 'ALL',
    name: 'Toàn Tập đoàn',
    shortName: 'Toàn Tập đoàn',
    industry: 'Holding',
    status: 'active',
    employeeCount: 1580,
    color: '#3b82f6'
  },
  {
    id: 'trsport',
    code: 'TRSPORT',
    name: 'Công ty TNHH Vận tải TRSPORT',
    shortName: 'TRSPORT',
    industry: 'Vận tải hành khách & hàng hóa',
    status: 'active',
    employeeCount: 520,
    color: '#10b981'
  },
  {
    id: 'lgts',
    code: 'LGTS',
    name: 'Công ty Cổ phần XeVN Logistics',
    shortName: 'LGTS',
    industry: 'Kho bãi & Chuỗi cung ứng',
    status: 'active',
    employeeCount: 380,
    color: '#f59e0b'
  },
  {
    id: 'x-maintenance',
    code: 'XMAINT',
    name: 'Công ty TNHH X-Maintenance',
    shortName: 'X-Maintenance',
    industry: 'Bảo trì & Sửa chữa phương tiện',
    status: 'active',
    employeeCount: 280,
    color: '#8b5cf6'
  },
  {
    id: 'x-express',
    code: 'XEXPRESS',
    name: 'Công ty Cổ phần X-Express',
    shortName: 'X-Express',
    industry: 'Chuyển phát nhanh Last-mile',
    status: 'active',
    employeeCount: 400,
    color: '#ec4899'
  }
];

// ============================================
// 2. DANH MỤC CHỨC VỤ (MDM - Positions)
// Thiết kế theo chuẩn ngành Vận tải & Logistics
// ============================================

export interface Position {
  id: string;
  code: string;
  name: string;
  level: number;
  category: 'management' | 'driver' | 'operations' | 'technical' | 'warehouse' | 'support';
  description: string;
  requirements?: string;
  salaryGrade?: string;
  applicableCompanies: string[];
  parentDepartmentCodes?: string[]; // Liên kết với phòng ban
}

export const mockPositions: Position[] = [
  // ===== NHÓM QUẢN LÝ (Management) =====
  { 
    id: 'pos-1', 
    code: 'CEO', 
    name: 'Tổng Giám đốc', 
    level: 1, 
    category: 'management',
    description: 'Lãnh đạo cao nhất, chịu trách nhiệm toàn bộ hoạt động công ty',
    salaryGrade: 'M1',
    applicableCompanies: ['all'],
    parentDepartmentCodes: ['BDH']
  },
  { 
    id: 'pos-2', 
    code: 'COO', 
    name: 'Giám đốc Vận hành', 
    level: 2, 
    category: 'management',
    description: 'Phụ trách toàn bộ hoạt động vận hành, điều phối đội xe',
    salaryGrade: 'M2',
    applicableCompanies: ['trsport', 'lgts', 'x-express'],
    parentDepartmentCodes: ['BDH', 'DHVT']
  },
  { 
    id: 'pos-3', 
    code: 'CFO', 
    name: 'Giám đốc Tài chính', 
    level: 2, 
    category: 'management',
    description: 'Phụ trách tài chính, ngân sách, kiểm soát chi phí vận hành',
    salaryGrade: 'M2',
    applicableCompanies: ['all'],
    parentDepartmentCodes: ['BDH', 'PTC']
  },
  { 
    id: 'pos-4', 
    code: 'FLEET_MGR', 
    name: 'Trưởng phòng Quản lý đội xe', 
    level: 3, 
    category: 'management',
    description: 'Quản lý toàn bộ đội xe, phân bổ tài xế, lập kế hoạch chuyến',
    salaryGrade: 'M3',
    applicableCompanies: ['trsport', 'lgts', 'x-express'],
    parentDepartmentCodes: ['DHVT', 'PQLDX']
  },
  { 
    id: 'pos-5', 
    code: 'WH_MGR', 
    name: 'Trưởng kho', 
    level: 3, 
    category: 'management',
    description: 'Quản lý kho hàng, kiểm soát tồn kho, xuất nhập',
    salaryGrade: 'M3',
    applicableCompanies: ['lgts', 'x-express'],
    parentDepartmentCodes: ['PKB', 'TQLK']
  },
  { 
    id: 'pos-6', 
    code: 'MAINT_MGR', 
    name: 'Trưởng xưởng Bảo trì', 
    level: 3, 
    category: 'management',
    description: 'Quản lý xưởng sửa chữa, lập kế hoạch bảo dưỡng định kỳ',
    salaryGrade: 'M3',
    applicableCompanies: ['x-maintenance', 'trsport'],
    parentDepartmentCodes: ['PKTVT', 'XSCTW']
  },

  // ===== NHÓM LÁI XE (Drivers) - Phân theo hạng bằng =====
  { 
    id: 'pos-7', 
    code: 'DRIVER_FC', 
    name: 'Lái xe hạng FC (Xe đầu kéo)', 
    level: 6, 
    category: 'driver',
    description: 'Lái xe đầu kéo container, sơ-mi rơ-moóc trên 20 tấn',
    requirements: 'GPLX hạng FC, kinh nghiệm 3+ năm, lý lịch sạch',
    salaryGrade: 'D1',
    applicableCompanies: ['trsport', 'lgts'],
    parentDepartmentCodes: ['DX01', 'DX02', 'DX03']
  },
  { 
    id: 'pos-8', 
    code: 'DRIVER_E', 
    name: 'Lái xe hạng E (Xe tải nặng)', 
    level: 6, 
    category: 'driver',
    description: 'Lái xe tải từ 10-20 tấn, xe khách trên 30 chỗ',
    requirements: 'GPLX hạng E, kinh nghiệm 2+ năm',
    salaryGrade: 'D2',
    applicableCompanies: ['trsport', 'lgts'],
    parentDepartmentCodes: ['DX01', 'DX02', 'DX03', 'DX04']
  },
  { 
    id: 'pos-9', 
    code: 'DRIVER_C', 
    name: 'Lái xe hạng C (Xe tải nhẹ)', 
    level: 6, 
    category: 'driver',
    description: 'Lái xe tải dưới 10 tấn, xe khách 10-30 chỗ',
    requirements: 'GPLX hạng C, kinh nghiệm 1+ năm',
    salaryGrade: 'D3',
    applicableCompanies: ['trsport', 'lgts', 'x-express'],
    parentDepartmentCodes: ['DX03', 'DX04', 'DX05', 'DGHLM']
  },
  { 
    id: 'pos-10', 
    code: 'DRIVER_B2', 
    name: 'Lái xe hạng B2 (Shipper)', 
    level: 7, 
    category: 'driver',
    description: 'Lái xe giao hàng chặng cuối, xe máy/xe tải nhỏ',
    requirements: 'GPLX hạng B2, biết khu vực giao hàng',
    salaryGrade: 'D4',
    applicableCompanies: ['x-express'],
    parentDepartmentCodes: ['DGHLM']
  },

  // ===== NHÓM ĐIỀU HÀNH VẬN TẢI (Operations) =====
  { 
    id: 'pos-11', 
    code: 'DISPATCHER', 
    name: 'Điều phối viên Vận tải', 
    level: 5, 
    category: 'operations',
    description: 'Lập lịch chuyến, điều xe, theo dõi GPS, xử lý sự cố',
    requirements: 'Hiểu biết tuyến đường, kỹ năng Excel/TMS',
    salaryGrade: 'O1',
    applicableCompanies: ['trsport', 'lgts', 'x-express'],
    parentDepartmentCodes: ['DHVT', 'PDPVH']
  },
  { 
    id: 'pos-12', 
    code: 'FORWARDER', 
    name: 'Nhân viên Forwarding', 
    level: 5, 
    category: 'operations',
    description: 'Làm thủ tục hải quan, chứng từ XNK, liên hệ cửa khẩu',
    requirements: 'Kinh nghiệm XNK, biết tiếng Anh/Trung',
    salaryGrade: 'O1',
    applicableCompanies: ['lgts'],
    parentDepartmentCodes: ['PGNPH', 'BQTCCƯ']
  },
  { 
    id: 'pos-13', 
    code: 'ROUTE_PLANNER', 
    name: 'Chuyên viên Kế hoạch tuyến', 
    level: 4, 
    category: 'operations',
    description: 'Tối ưu hóa tuyến đường, tính toán chi phí chuyến, báo giá',
    requirements: 'Phân tích dữ liệu, hiểu biết địa lý vận tải',
    salaryGrade: 'O2',
    applicableCompanies: ['trsport', 'lgts'],
    parentDepartmentCodes: ['DHVT', 'PKHCH']
  },
  { 
    id: 'pos-14', 
    code: 'SAFETY_OFFICER', 
    name: 'Giám sát An toàn', 
    level: 4, 
    category: 'operations',
    description: 'Kiểm tra an toàn, huấn luyện tài xế, xử lý tai nạn',
    requirements: 'Chứng chỉ ATVSLĐ, kinh nghiệm ngành vận tải',
    salaryGrade: 'O2',
    applicableCompanies: ['trsport', 'lgts', 'x-express'],
    parentDepartmentCodes: ['PATGS']
  },

  // ===== NHÓM KỸ THUẬT (Technical) =====
  { 
    id: 'pos-15', 
    code: 'TECH_MECH', 
    name: 'Kỹ thuật viên Cơ khí', 
    level: 5, 
    category: 'technical',
    description: 'Sửa chữa động cơ, hệ thống truyền động, khung gầm',
    requirements: 'Bằng nghề cơ khí ô tô, 2+ năm kinh nghiệm',
    salaryGrade: 'T1',
    applicableCompanies: ['x-maintenance'],
    parentDepartmentCodes: ['XSCTW', 'PKTVT']
  },
  { 
    id: 'pos-16', 
    code: 'TECH_ELEC', 
    name: 'Kỹ thuật viên Điện - Điện tử', 
    level: 5, 
    category: 'technical',
    description: 'Sửa chữa hệ thống điện, GPS, camera hành trình',
    requirements: 'Bằng nghề điện ô tô, hiểu biết IoT',
    salaryGrade: 'T1',
    applicableCompanies: ['x-maintenance'],
    parentDepartmentCodes: ['XSCTW', 'PKTVT']
  },
  { 
    id: 'pos-17', 
    code: 'TECH_RESCUE', 
    name: 'Kỹ thuật viên Cứu hộ', 
    level: 5, 
    category: 'technical',
    description: 'Cứu hộ xe hư hỏng trên đường, sửa chữa tại chỗ',
    requirements: 'Lái xe hạng C+, kỹ năng sửa chữa nhanh',
    salaryGrade: 'T2',
    applicableCompanies: ['x-maintenance'],
    parentDepartmentCodes: ['DCHLĐ']
  },
  { 
    id: 'pos-18', 
    code: 'PARTS_STAFF', 
    name: 'Nhân viên Quản lý Vật tư', 
    level: 5, 
    category: 'technical',
    description: 'Quản lý kho phụ tùng, đặt hàng, xuất cấp linh kiện',
    requirements: 'Hiểu biết phụ tùng ô tô, kỹ năng WMS',
    salaryGrade: 'T2',
    applicableCompanies: ['x-maintenance'],
    parentDepartmentCodes: ['PQLVTPT']
  },

  // ===== NHÓM KHO BÃI (Warehouse) =====
  { 
    id: 'pos-19', 
    code: 'WH_CLERK', 
    name: 'Thủ kho', 
    level: 6, 
    category: 'warehouse',
    description: 'Nhập xuất hàng hóa, kiểm đếm, lập phiếu kho',
    requirements: 'Cẩn thận, biết WMS cơ bản',
    salaryGrade: 'W1',
    applicableCompanies: ['lgts', 'x-express'],
    parentDepartmentCodes: ['TQLK', 'PKB']
  },
  { 
    id: 'pos-20', 
    code: 'FORKLIFT_OP', 
    name: 'Nhân viên Xe nâng', 
    level: 6, 
    category: 'warehouse',
    description: 'Vận hành xe nâng, xếp dỡ hàng container',
    requirements: 'Chứng chỉ lái xe nâng, sức khỏe tốt',
    salaryGrade: 'W1',
    applicableCompanies: ['lgts'],
    parentDepartmentCodes: ['TQLK', 'PKB']
  },
  { 
    id: 'pos-21', 
    code: 'SORTER', 
    name: 'Nhân viên Phân loại', 
    level: 7, 
    category: 'warehouse',
    description: 'Phân loại hàng hóa theo tuyến, đóng gói, dán nhãn',
    requirements: 'Nhanh nhẹn, chịu áp lực cao điểm',
    salaryGrade: 'W2',
    applicableCompanies: ['x-express', 'lgts'],
    parentDepartmentCodes: ['TTPL', 'DGHLM']
  },

  // ===== NHÓM HỖ TRỢ (Support) =====
  { 
    id: 'pos-22', 
    code: 'CS_AGENT', 
    name: 'Nhân viên CSKH', 
    level: 5, 
    category: 'support',
    description: 'Tiếp nhận đơn hàng, giải đáp thắc mắc, xử lý khiếu nại',
    requirements: 'Giao tiếp tốt, chịu áp lực, biết CRM',
    salaryGrade: 'S1',
    applicableCompanies: ['all'],
    parentDepartmentCodes: ['PCSXLKN']
  },
  { 
    id: 'pos-23', 
    code: 'HR_SPEC', 
    name: 'Chuyên viên Nhân sự', 
    level: 4, 
    category: 'support',
    description: 'Tuyển dụng, đào tạo, quản lý hồ sơ tài xế',
    requirements: 'Kinh nghiệm HR ngành vận tải ưu tiên',
    salaryGrade: 'S2',
    applicableCompanies: ['all'],
    parentDepartmentCodes: ['PNSHC']
  },
  { 
    id: 'pos-24', 
    code: 'ACCOUNTANT', 
    name: 'Kế toán Vận tải', 
    level: 4, 
    category: 'support',
    description: 'Hạch toán chi phí chuyến, cầu đường, nhiên liệu, lương tài',
    requirements: 'Bằng kế toán, hiểu nghiệp vụ vận tải',
    salaryGrade: 'S2',
    applicableCompanies: ['all'],
    parentDepartmentCodes: ['PTC', 'PKTKT']
  }
];

// ============================================
// 3. DANH MỤC PHÒNG BAN (MDM - Departments)
// Mô hình Hub-and-Spoke: Holding → Công ty → Đội/Tổ
// ============================================

export interface Department {
  id: string;
  code: string;
  name: string;
  type: 'holding' | 'company' | 'division' | 'team';
  level: number;
  companyId: string;
  parentCode: string | null;
  headCount: number;
  manager?: string;
  location?: string;
  description: string;
}

export const mockDepartments: Department[] = [
  // ===== CẤP TẬP ĐOÀN (Holding) =====
  { 
    id: 'dept-1', 
    code: 'BDH', 
    name: 'Ban Điều hành Tập đoàn', 
    type: 'holding', 
    level: 1,
    companyId: 'all',
    parentCode: null,
    headCount: 8,
    manager: 'Nguyễn Văn Hùng',
    location: 'HUB TP.HCM',
    description: 'Lãnh đạo cấp cao, hoạch định chiến lược toàn tập đoàn'
  },
  { 
    id: 'dept-2', 
    code: 'DHVT', 
    name: 'Ban Điều hành Vận tải', 
    type: 'holding', 
    level: 2,
    companyId: 'all',
    parentCode: 'BDH',
    headCount: 12,
    manager: 'Trần Minh Đức',
    location: 'HUB TP.HCM',
    description: 'Điều phối chiến lược vận tải toàn quốc, xuyên biên giới'
  },
  { 
    id: 'dept-3', 
    code: 'PTC', 
    name: 'Phòng Tài chính Tập đoàn', 
    type: 'holding', 
    level: 2,
    companyId: 'all',
    parentCode: 'BDH',
    headCount: 15,
    manager: 'Lê Thị Kim Ngân',
    location: 'HUB TP.HCM',
    description: 'Kiểm soát ngân sách, tài chính, hợp nhất báo cáo'
  },
  { 
    id: 'dept-4', 
    code: 'PNSHC', 
    name: 'Phòng Nhân sự & Hành chính', 
    type: 'holding', 
    level: 2,
    companyId: 'all',
    parentCode: 'BDH',
    headCount: 10,
    manager: 'Phạm Thị Minh Anh',
    location: 'HUB TP.HCM',
    description: 'Quản lý nhân sự, đào tạo tài xế, hành chính tập đoàn'
  },

  // ===== TRSPORT - CÔNG TY VẬN TẢI =====
  { 
    id: 'dept-5', 
    code: 'PQLDX', 
    name: 'Phòng Quản lý Đội xe', 
    type: 'division', 
    level: 3,
    companyId: 'trsport',
    parentCode: 'DHVT',
    headCount: 25,
    manager: 'Nguyễn Đức Thắng',
    location: 'HUB TP.HCM',
    description: 'Quản lý toàn bộ đội xe TRSPORT, phân công tài xế'
  },
  { 
    id: 'dept-6', 
    code: 'DX01', 
    name: 'Đội xe số 1 - Bắc Nam', 
    type: 'team', 
    level: 4,
    companyId: 'trsport',
    parentCode: 'PQLDX',
    headCount: 85,
    manager: 'Hoàng Văn Long',
    location: 'HUB Hà Nội',
    description: 'Đội xe tải nặng chuyên tuyến Hà Nội - TP.HCM'
  },
  { 
    id: 'dept-7', 
    code: 'DX02', 
    name: 'Đội xe số 2 - Miền Trung', 
    type: 'team', 
    level: 4,
    companyId: 'trsport',
    parentCode: 'PQLDX',
    headCount: 60,
    manager: 'Trần Văn Hải',
    location: 'HUB Đà Nẵng',
    description: 'Đội xe phục vụ tuyến Đà Nẵng và các tỉnh miền Trung'
  },
  { 
    id: 'dept-8', 
    code: 'DX03', 
    name: 'Đội xe số 3 - Container', 
    type: 'team', 
    level: 4,
    companyId: 'trsport',
    parentCode: 'PQLDX',
    headCount: 95,
    manager: 'Lê Văn Cường',
    location: 'Cảng Cát Lái',
    description: 'Đội xe đầu kéo container, phục vụ cảng biển'
  },
  { 
    id: 'dept-9', 
    code: 'DX04', 
    name: 'Đội xe số 4 - Xuyên biên giới', 
    type: 'team', 
    level: 4,
    companyId: 'trsport',
    parentCode: 'PQLDX',
    headCount: 45,
    manager: 'Nguyễn Văn Hùng',
    location: 'Cửa khẩu Mộc Bài',
    description: 'Đội xe vận tải quốc tế tuyến Việt-Lào-Cam'
  },
  { 
    id: 'dept-10', 
    code: 'DX05', 
    name: 'Đội xe số 5 - Nội thành', 
    type: 'team', 
    level: 4,
    companyId: 'trsport',
    parentCode: 'PQLDX',
    headCount: 70,
    manager: 'Phạm Quang Vinh',
    location: 'HUB TP.HCM',
    description: 'Đội xe tải nhẹ giao hàng nội thành các thành phố lớn'
  },
  { 
    id: 'dept-11', 
    code: 'PATGS', 
    name: 'Phòng An toàn & Giám sát', 
    type: 'division', 
    level: 3,
    companyId: 'trsport',
    parentCode: 'DHVT',
    headCount: 18,
    manager: 'Lê Văn Toàn',
    location: 'HUB TP.HCM',
    description: 'Giám sát GPS, đào tạo ATGT, xử lý sự cố tai nạn'
  },
  { 
    id: 'dept-12', 
    code: 'PKHCH', 
    name: 'Phòng Kế hoạch chuyến', 
    type: 'division', 
    level: 3,
    companyId: 'trsport',
    parentCode: 'DHVT',
    headCount: 22,
    manager: 'Hoàng Thị Mai',
    location: 'HUB TP.HCM',
    description: 'Lập lịch chuyến, tối ưu tuyến đường, báo giá'
  },

  // ===== LGTS - LOGISTICS & KHO BÃI =====
  { 
    id: 'dept-13', 
    code: 'PKB', 
    name: 'Phòng Kho bãi', 
    type: 'division', 
    level: 3,
    companyId: 'lgts',
    parentCode: null,
    headCount: 85,
    manager: 'Đặng Văn Hải',
    location: 'HUB TP.HCM',
    description: 'Quản lý hệ thống kho hàng toàn quốc'
  },
  { 
    id: 'dept-14', 
    code: 'TQLK-HN', 
    name: 'Tổ Quản lý Kho Hà Nội', 
    type: 'team', 
    level: 4,
    companyId: 'lgts',
    parentCode: 'PKB',
    headCount: 35,
    manager: 'Ngô Văn Minh',
    location: 'HUB Hà Nội',
    description: 'Kho trung chuyển miền Bắc, 5.000m²'
  },
  { 
    id: 'dept-15', 
    code: 'TQLK-DN', 
    name: 'Tổ Quản lý Kho Đà Nẵng', 
    type: 'team', 
    level: 4,
    companyId: 'lgts',
    parentCode: 'PKB',
    headCount: 20,
    manager: 'Trần Thị Hà',
    location: 'HUB Đà Nẵng',
    description: 'Kho trung chuyển miền Trung, 2.500m²'
  },
  { 
    id: 'dept-16', 
    code: 'TQLK-HCM', 
    name: 'Tổ Quản lý Kho TP.HCM', 
    type: 'team', 
    level: 4,
    companyId: 'lgts',
    parentCode: 'PKB',
    headCount: 55,
    manager: 'Lê Hoàng Nam',
    location: 'HUB TP.HCM',
    description: 'Kho trung tâm miền Nam, 8.000m²'
  },
  { 
    id: 'dept-17', 
    code: 'PGNPH', 
    name: 'Phòng Giao nhận & Phối hợp', 
    type: 'division', 
    level: 3,
    companyId: 'lgts',
    parentCode: null,
    headCount: 40,
    manager: 'Ngô Thị Yến',
    location: 'HUB TP.HCM',
    description: 'Điều phối giao nhận, liên hệ khách hàng, đối tác'
  },
  { 
    id: 'dept-18', 
    code: 'BQTCCƯ', 
    name: 'Ban Quản trị Chuỗi cung ứng', 
    type: 'division', 
    level: 3,
    companyId: 'lgts',
    parentCode: null,
    headCount: 25,
    manager: 'Nguyễn Thị Lan',
    location: 'HUB TP.HCM',
    description: 'Tối ưu chuỗi cung ứng, thủ tục XNK, Forwarding'
  },

  // ===== X-MAINTENANCE =====
  { 
    id: 'dept-19', 
    code: 'XSCTW', 
    name: 'Xưởng Sửa chữa Trung tâm', 
    type: 'division', 
    level: 3,
    companyId: 'x-maintenance',
    parentCode: null,
    headCount: 80,
    manager: 'Đinh Công Minh',
    location: 'HUB TP.HCM',
    description: 'Xưởng chính sửa chữa lớn, đại tu động cơ'
  },
  { 
    id: 'dept-20', 
    code: 'PKTVT', 
    name: 'Phòng Kỹ thuật Vật tư', 
    type: 'division', 
    level: 3,
    companyId: 'x-maintenance',
    parentCode: null,
    headCount: 35,
    manager: 'Trịnh Văn Khánh',
    location: 'HUB TP.HCM',
    description: 'Quản lý phụ tùng, bảo dưỡng định kỳ'
  },
  { 
    id: 'dept-21', 
    code: 'PQLVTPT', 
    name: 'Phòng Quản lý Vật tư & Phụ tùng', 
    type: 'division', 
    level: 3,
    companyId: 'x-maintenance',
    parentCode: 'PKTVT',
    headCount: 25,
    manager: 'Vũ Thị Hương',
    location: 'HUB TP.HCM',
    description: 'Kho phụ tùng, mua hàng, quản lý tồn'
  },
  { 
    id: 'dept-22', 
    code: 'DCHLĐ', 
    name: 'Đội Cứu hộ Lưu động', 
    type: 'team', 
    level: 4,
    companyId: 'x-maintenance',
    parentCode: 'XSCTW',
    headCount: 30,
    manager: 'Nguyễn Văn Dũng',
    location: 'Toàn quốc',
    description: 'Cứu hộ xe hư hỏng 24/7 trên toàn tuyến'
  },
  { 
    id: 'dept-23', 
    code: 'PKDCL', 
    name: 'Phòng Kiểm định Chất lượng', 
    type: 'division', 
    level: 3,
    companyId: 'x-maintenance',
    parentCode: null,
    headCount: 15,
    manager: 'Lương Thị Hà',
    location: 'HUB TP.HCM',
    description: 'Kiểm định, đăng kiểm, cấp phép lưu hành'
  },

  // ===== X-EXPRESS =====
  { 
    id: 'dept-24', 
    code: 'TTPL', 
    name: 'Trung tâm Phân loại (Sorting Hub)', 
    type: 'division', 
    level: 3,
    companyId: 'x-express',
    parentCode: null,
    headCount: 120,
    manager: 'Lê Hoàng Nam',
    location: 'HUB TP.HCM',
    description: 'Hub phân loại hàng tự động, công suất 50.000 đơn/ngày'
  },
  { 
    id: 'dept-25', 
    code: 'DGHLM', 
    name: 'Đội Giao hàng Last-mile', 
    type: 'team', 
    level: 4,
    companyId: 'x-express',
    parentCode: 'TTPL',
    headCount: 180,
    manager: 'Trương Văn Hiếu',
    location: 'TP.HCM & HN',
    description: 'Đội shipper giao hàng chặng cuối nội thành'
  },
  { 
    id: 'dept-26', 
    code: 'PDPVH', 
    name: 'Phòng Điều phối Vận hành', 
    type: 'division', 
    level: 3,
    companyId: 'x-express',
    parentCode: null,
    headCount: 35,
    manager: 'Nguyễn Thị Hồng',
    location: 'HUB TP.HCM',
    description: 'Điều phối đơn hàng, theo dõi trạng thái real-time'
  },
  { 
    id: 'dept-27', 
    code: 'PCSXLKN', 
    name: 'Phòng CSKH & Xử lý Khiếu nại', 
    type: 'division', 
    level: 3,
    companyId: 'x-express',
    parentCode: null,
    headCount: 28,
    manager: 'Đỗ Minh Tuấn',
    location: 'HUB TP.HCM',
    description: 'Tiếp nhận khiếu nại, bồi thường, hotline 24/7'
  },

  // ===== PHÒNG CHỨC NĂNG CHUNG =====
  { 
    id: 'dept-28', 
    code: 'PKTKT', 
    name: 'Phòng Kế toán - Kiểm toán', 
    type: 'holding', 
    level: 2,
    companyId: 'all',
    parentCode: 'PTC',
    headCount: 20,
    manager: 'Vũ Thanh Mai',
    location: 'HUB TP.HCM',
    description: 'Kế toán chi phí vận tải, đối soát, kiểm toán nội bộ'
  }
];

// ============================================
// 4. VÙNG ĐỊA LÝ & HUB VẬN TẢI (Geography)
// Cấu trúc: Hub → Cửa khẩu → Tuyến đường
// ============================================

export interface GeographicZone {
  id: string;
  code: string;
  name: string;
  type: 'hub' | 'border' | 'route' | 'province' | 'port';
  country: 'VN' | 'LA' | 'KH' | 'REGION';
  parentCode: string | null;
  coordinates?: { lat: number; lng: number };
  address?: string;
  capacity?: string;
  description: string;
  relatedCompanies: string[];
}

export const mockGeographicZones: GeographicZone[] = [
  // ===== HUBs CHÍNH =====
  {
    id: 'geo-1',
    code: 'HUB-HN',
    name: 'HUB Hà Nội',
    type: 'hub',
    country: 'VN',
    parentCode: null,
    coordinates: { lat: 21.0285, lng: 105.8542 },
    address: 'KCN Gia Lâm, Hà Nội',
    capacity: 'Kho 5.000m² | Bãi xe 150 xe',
    description: 'Trung tâm trung chuyển khu vực miền Bắc, kết nối cửa khẩu Hữu Nghị',
    relatedCompanies: ['trsport', 'lgts', 'x-express']
  },
  {
    id: 'geo-2',
    code: 'HUB-DN',
    name: 'HUB Đà Nẵng',
    type: 'hub',
    country: 'VN',
    parentCode: null,
    coordinates: { lat: 16.0544, lng: 108.2022 },
    address: 'KCN Hòa Khánh, Đà Nẵng',
    capacity: 'Kho 2.500m² | Bãi xe 80 xe',
    description: 'Trung tâm trung chuyển miền Trung, kết nối tuyến Lào-Việt',
    relatedCompanies: ['trsport', 'lgts']
  },
  {
    id: 'geo-3',
    code: 'HUB-HCM',
    name: 'HUB TP. Hồ Chí Minh',
    type: 'hub',
    country: 'VN',
    parentCode: null,
    coordinates: { lat: 10.8231, lng: 106.6297 },
    address: 'KCN Tân Bình, TP.HCM',
    capacity: 'Kho 8.000m² | Bãi xe 300 xe',
    description: 'Tổng hành dinh XeVN, HUB chính miền Nam, kết nối cảng biển',
    relatedCompanies: ['all']
  },
  {
    id: 'geo-4',
    code: 'HUB-CL',
    name: 'HUB Cảng Cát Lái',
    type: 'port',
    country: 'VN',
    parentCode: 'HUB-HCM',
    coordinates: { lat: 10.7628, lng: 106.7570 },
    address: 'Cảng Cát Lái, Quận 2, TP.HCM',
    capacity: 'Bãi container 500 TEU',
    description: 'Điểm tập kết container, kết nối đường biển quốc tế',
    relatedCompanies: ['trsport', 'lgts']
  },

  // ===== CỬA KHẨU =====
  {
    id: 'geo-5',
    code: 'CK-MB',
    name: 'Cửa khẩu Mộc Bài',
    type: 'border',
    country: 'VN',
    parentCode: 'HUB-HCM',
    coordinates: { lat: 11.0500, lng: 106.2667 },
    address: 'Mộc Bài, Tây Ninh',
    capacity: 'Thông quan 200 xe/ngày',
    description: 'Cửa khẩu quốc tế Việt Nam - Campuchia, tuyến TP.HCM - Phnom Penh',
    relatedCompanies: ['trsport', 'lgts']
  },
  {
    id: 'geo-6',
    code: 'CK-HN',
    name: 'Cửa khẩu Hữu Nghị',
    type: 'border',
    country: 'VN',
    parentCode: 'HUB-HN',
    coordinates: { lat: 21.9667, lng: 106.6500 },
    address: 'Hữu Nghị Quan, Lạng Sơn',
    capacity: 'Thông quan 300 xe/ngày',
    description: 'Cửa khẩu quốc tế Việt Nam - Trung Quốc, tuyến hàng xuất khẩu',
    relatedCompanies: ['trsport', 'lgts']
  },
  {
    id: 'geo-7',
    code: 'CK-LB',
    name: 'Cửa khẩu Lao Bảo',
    type: 'border',
    country: 'VN',
    parentCode: 'HUB-DN',
    coordinates: { lat: 16.6333, lng: 106.6000 },
    address: 'Lao Bảo, Quảng Trị',
    capacity: 'Thông quan 150 xe/ngày',
    description: 'Cửa khẩu quốc tế Việt Nam - Lào, hành lang kinh tế Đông-Tây',
    relatedCompanies: ['trsport', 'lgts']
  },
  {
    id: 'geo-8',
    code: 'CK-XM',
    name: 'Cửa khẩu Xa Mát',
    type: 'border',
    country: 'VN',
    parentCode: 'HUB-HCM',
    coordinates: { lat: 11.3500, lng: 106.0000 },
    address: 'Xa Mát, Tây Ninh',
    capacity: 'Thông quan 100 xe/ngày',
    description: 'Cửa khẩu phụ Việt Nam - Campuchia, tuyến hàng nông sản',
    relatedCompanies: ['trsport', 'lgts']
  },

  // ===== TUYẾN ĐƯỜNG VẬN TẢI =====
  {
    id: 'geo-9',
    code: 'RT-BN',
    name: 'Tuyến Bắc - Nam (QL1A)',
    type: 'route',
    country: 'VN',
    parentCode: null,
    description: 'Tuyến trục chính Hà Nội - TP.HCM, dài 1.800km, 36-48h xe tải',
    relatedCompanies: ['trsport', 'lgts']
  },
  {
    id: 'geo-10',
    code: 'RT-VL',
    name: 'Tuyến Việt - Lào (QL8/QL12)',
    type: 'route',
    country: 'REGION',
    parentCode: null,
    description: 'Tuyến quốc tế Đà Nẵng - Viêng Chăn qua Lao Bảo, dài 850km',
    relatedCompanies: ['trsport', 'lgts']
  },
  {
    id: 'geo-11',
    code: 'RT-VC',
    name: 'Tuyến Việt - Cam (QL22)',
    type: 'route',
    country: 'REGION',
    parentCode: null,
    description: 'Tuyến quốc tế TP.HCM - Phnom Penh qua Mộc Bài, dài 280km',
    relatedCompanies: ['trsport', 'lgts']
  },
  {
    id: 'geo-12',
    code: 'RT-CT',
    name: 'Tuyến Cao tốc HCM-Long Thành',
    type: 'route',
    country: 'VN',
    parentCode: 'HUB-HCM',
    description: 'Tuyến cao tốc kết nối Cảng Cát Lái, sân bay Long Thành',
    relatedCompanies: ['trsport', 'lgts', 'x-express']
  },

  // ===== ĐIỂM NỘI ĐỊA =====
  {
    id: 'geo-13',
    code: 'HUB-BD',
    name: 'Trạm trung chuyển Bình Dương',
    type: 'hub',
    country: 'VN',
    parentCode: 'HUB-HCM',
    address: 'KCN VSIP, Bình Dương',
    capacity: 'Kho 3.000m² | Bãi xe 100 xe',
    description: 'Trạm vệ tinh phục vụ KCN Bình Dương, Đồng Nai',
    relatedCompanies: ['trsport', 'lgts', 'x-express']
  },
  {
    id: 'geo-14',
    code: 'HUB-HP',
    name: 'Trạm trung chuyển Hải Phòng',
    type: 'port',
    country: 'VN',
    parentCode: 'HUB-HN',
    address: 'Cảng Đình Vũ, Hải Phòng',
    capacity: 'Bãi container 300 TEU',
    description: 'Trạm kết nối cảng Hải Phòng, hàng XNK miền Bắc',
    relatedCompanies: ['trsport', 'lgts']
  },

  // ===== ĐIỂM QUỐC TẾ (Partner Hubs) =====
  {
    id: 'geo-15',
    code: 'HUB-PP',
    name: 'Partner Hub Phnom Penh',
    type: 'hub',
    country: 'KH',
    parentCode: 'CK-MB',
    description: 'Đối tác kho bãi tại Campuchia, tiếp nhận hàng quá cảnh',
    relatedCompanies: ['lgts']
  },
  {
    id: 'geo-16',
    code: 'HUB-VC',
    name: 'Partner Hub Viêng Chăn',
    type: 'hub',
    country: 'LA',
    parentCode: 'CK-LB',
    description: 'Đối tác kho bãi tại Lào, dịch vụ Cross-border',
    relatedCompanies: ['lgts']
  }
];

// ============================================
// 5. CƠ CẤU TỔ CHỨC (Organization Structure)
// Dùng cho TreeView Organization Chart
// ============================================

export interface OrgUnit {
  id: string;
  name: string;
  type: 'holding' | 'company' | 'department' | 'team';
  companyId: string;
  parentId: string | null;
  children?: OrgUnit[];
  headCount: number;
  manager?: string;
}

export const mockOrgStructure: OrgUnit[] = [
  {
    id: 'xevn-holding',
    name: 'Tập đoàn XeVN Holding',
    type: 'holding',
    companyId: 'all',
    parentId: null,
    headCount: 1580,
    manager: 'Nguyễn Văn Hùng',
    children: [
      {
        id: 'trsport-company',
        name: 'Công ty TRSPORT',
        type: 'company',
        companyId: 'trsport',
        parentId: 'xevn-holding',
        headCount: 520,
        manager: 'Trần Minh Đức',
        children: [
          { id: 'trsport-fleet', name: 'Phòng Quản lý Đội xe', type: 'department', companyId: 'trsport', parentId: 'trsport-company', headCount: 25, manager: 'Nguyễn Đức Thắng' },
          { id: 'trsport-dx01', name: 'Đội xe số 1 - Bắc Nam', type: 'team', companyId: 'trsport', parentId: 'trsport-fleet', headCount: 85, manager: 'Hoàng Văn Long' },
          { id: 'trsport-dx02', name: 'Đội xe số 2 - Miền Trung', type: 'team', companyId: 'trsport', parentId: 'trsport-fleet', headCount: 60, manager: 'Trần Văn Hải' },
          { id: 'trsport-dx03', name: 'Đội xe số 3 - Container', type: 'team', companyId: 'trsport', parentId: 'trsport-fleet', headCount: 95, manager: 'Lê Văn Cường' },
          { id: 'trsport-dx04', name: 'Đội xe số 4 - Xuyên biên giới', type: 'team', companyId: 'trsport', parentId: 'trsport-fleet', headCount: 45, manager: 'Nguyễn Văn Hùng' },
          { id: 'trsport-dx05', name: 'Đội xe số 5 - Nội thành', type: 'team', companyId: 'trsport', parentId: 'trsport-fleet', headCount: 70, manager: 'Phạm Quang Vinh' },
          { id: 'trsport-safety', name: 'Phòng An toàn & Giám sát', type: 'department', companyId: 'trsport', parentId: 'trsport-company', headCount: 18, manager: 'Lê Văn Toàn' },
          { id: 'trsport-planning', name: 'Phòng Kế hoạch chuyến', type: 'department', companyId: 'trsport', parentId: 'trsport-company', headCount: 22, manager: 'Hoàng Thị Mai' }
        ]
      },
      {
        id: 'lgts-company',
        name: 'Công ty LGTS',
        type: 'company',
        companyId: 'lgts',
        parentId: 'xevn-holding',
        headCount: 380,
        manager: 'Lý Minh Châu',
        children: [
          { id: 'lgts-warehouse', name: 'Phòng Kho bãi', type: 'department', companyId: 'lgts', parentId: 'lgts-company', headCount: 85, manager: 'Đặng Văn Hải' },
          { id: 'lgts-wh-hn', name: 'Tổ Kho Hà Nội', type: 'team', companyId: 'lgts', parentId: 'lgts-warehouse', headCount: 35, manager: 'Ngô Văn Minh' },
          { id: 'lgts-wh-dn', name: 'Tổ Kho Đà Nẵng', type: 'team', companyId: 'lgts', parentId: 'lgts-warehouse', headCount: 20, manager: 'Trần Thị Hà' },
          { id: 'lgts-wh-hcm', name: 'Tổ Kho TP.HCM', type: 'team', companyId: 'lgts', parentId: 'lgts-warehouse', headCount: 55, manager: 'Lê Hoàng Nam' },
          { id: 'lgts-delivery', name: 'Phòng Giao nhận & Phối hợp', type: 'department', companyId: 'lgts', parentId: 'lgts-company', headCount: 40, manager: 'Ngô Thị Yến' },
          { id: 'lgts-scm', name: 'Ban Quản trị Chuỗi cung ứng', type: 'department', companyId: 'lgts', parentId: 'lgts-company', headCount: 25, manager: 'Nguyễn Thị Lan' }
        ]
      },
      {
        id: 'xmaint-company',
        name: 'Công ty X-Maintenance',
        type: 'company',
        companyId: 'x-maintenance',
        parentId: 'xevn-holding',
        headCount: 280,
        manager: 'Võ Xuân Phong',
        children: [
          { id: 'xmaint-workshop', name: 'Xưởng Sửa chữa Trung tâm', type: 'department', companyId: 'x-maintenance', parentId: 'xmaint-company', headCount: 80, manager: 'Đinh Công Minh' },
          { id: 'xmaint-parts', name: 'Phòng Kỹ thuật Vật tư', type: 'department', companyId: 'x-maintenance', parentId: 'xmaint-company', headCount: 35, manager: 'Trịnh Văn Khánh' },
          { id: 'xmaint-rescue', name: 'Đội Cứu hộ Lưu động', type: 'team', companyId: 'x-maintenance', parentId: 'xmaint-workshop', headCount: 30, manager: 'Nguyễn Văn Dũng' },
          { id: 'xmaint-qc', name: 'Phòng Kiểm định Chất lượng', type: 'department', companyId: 'x-maintenance', parentId: 'xmaint-company', headCount: 15, manager: 'Lương Thị Hà' }
        ]
      },
      {
        id: 'xexpress-company',
        name: 'Công ty X-Express',
        type: 'company',
        companyId: 'x-express',
        parentId: 'xevn-holding',
        headCount: 400,
        manager: 'Phan Thanh Tùng',
        children: [
          { id: 'xexpress-hub', name: 'Trung tâm Phân loại (Hub)', type: 'department', companyId: 'x-express', parentId: 'xexpress-company', headCount: 120, manager: 'Lê Hoàng Nam' },
          { id: 'xexpress-lastmile', name: 'Đội Giao hàng Last-mile', type: 'team', companyId: 'x-express', parentId: 'xexpress-hub', headCount: 180, manager: 'Trương Văn Hiếu' },
          { id: 'xexpress-ops', name: 'Phòng Điều phối Vận hành', type: 'department', companyId: 'x-express', parentId: 'xexpress-company', headCount: 35, manager: 'Nguyễn Thị Hồng' },
          { id: 'xexpress-cs', name: 'Phòng CSKH & Xử lý Khiếu nại', type: 'department', companyId: 'x-express', parentId: 'xexpress-company', headCount: 28, manager: 'Đỗ Minh Tuấn' }
        ]
      }
    ]
  }
];

// ============================================
// 6. DANH SÁCH NHÂN SỰ (Employees)
// ============================================

export interface Employee {
  id: string;
  employeeCode: string;
  fullName: string;
  positionCode: string;
  position: string;
  departmentCode: string;
  department: string;
  companyId: string;
  companyName: string;
  email: string;
  phone: string;
  hireDate: string;
  driverLicense?: string; // Hạng bằng lái (nếu là tài xế)
  status: 'active' | 'probation' | 'resigned';
  level: 'C-Level' | 'Director' | 'Manager' | 'Senior' | 'Junior' | 'Staff';
}

export const mockEmployees: Employee[] = [
  // ===== HOLDING =====
  { id: '1', employeeCode: 'XEVN001', fullName: 'Nguyễn Văn Hùng', positionCode: 'CEO', position: 'Tổng Giám đốc', departmentCode: 'BDH', department: 'Ban Điều hành', companyId: 'all', companyName: 'Tập đoàn XeVN', email: 'hung.nv@xevn.vn', phone: '0901234567', hireDate: '2015-01-15', status: 'active', level: 'C-Level' },
  { id: '2', employeeCode: 'XEVN002', fullName: 'Lê Thị Kim Ngân', positionCode: 'CFO', position: 'Giám đốc Tài chính', departmentCode: 'PTC', department: 'Phòng Tài chính Tập đoàn', companyId: 'all', companyName: 'Tập đoàn XeVN', email: 'ngan.ltk@xevn.vn', phone: '0902345678', hireDate: '2016-03-20', status: 'active', level: 'C-Level' },
  
  // ===== TRSPORT =====
  { id: '3', employeeCode: 'TRS001', fullName: 'Trần Minh Đức', positionCode: 'COO', position: 'Giám đốc Vận hành', departmentCode: 'DHVT', department: 'Ban Điều hành Vận tải', companyId: 'trsport', companyName: 'TRSPORT', email: 'duc.tm@trsport.vn', phone: '0912345678', hireDate: '2016-05-10', status: 'active', level: 'C-Level' },
  { id: '4', employeeCode: 'TRS002', fullName: 'Nguyễn Đức Thắng', positionCode: 'FLEET_MGR', position: 'Trưởng phòng Quản lý đội xe', departmentCode: 'PQLDX', department: 'Phòng Quản lý Đội xe', companyId: 'trsport', companyName: 'TRSPORT', email: 'thang.nd@trsport.vn', phone: '0918765432', hireDate: '2017-05-10', status: 'active', level: 'Manager' },
  { id: '5', employeeCode: 'TRS003', fullName: 'Hoàng Văn Long', positionCode: 'FLEET_MGR', position: 'Đội trưởng Đội xe số 1', departmentCode: 'DX01', department: 'Đội xe số 1 - Bắc Nam', companyId: 'trsport', companyName: 'TRSPORT', email: 'long.hv@trsport.vn', phone: '0923456789', hireDate: '2018-01-15', status: 'active', level: 'Manager' },
  { id: '6', employeeCode: 'TRS004', fullName: 'Lê Văn Cường', positionCode: 'DRIVER_FC', position: 'Lái xe hạng FC', departmentCode: 'DX03', department: 'Đội xe số 3 - Container', companyId: 'trsport', companyName: 'TRSPORT', email: 'cuong.lv@trsport.vn', phone: '0934567890', hireDate: '2019-03-20', driverLicense: 'FC', status: 'active', level: 'Staff' },
  { id: '7', employeeCode: 'TRS005', fullName: 'Phạm Văn Anh', positionCode: 'DRIVER_E', position: 'Lái xe hạng E', departmentCode: 'DX01', department: 'Đội xe số 1 - Bắc Nam', companyId: 'trsport', companyName: 'TRSPORT', email: 'anh.pv@trsport.vn', phone: '0945678901', hireDate: '2020-06-15', driverLicense: 'E', status: 'active', level: 'Staff' },
  { id: '8', employeeCode: 'TRS006', fullName: 'Nguyễn Văn Hùng', positionCode: 'DRIVER_E', position: 'Lái xe hạng E - Xuyên biên giới', departmentCode: 'DX04', department: 'Đội xe số 4 - Xuyên biên giới', companyId: 'trsport', companyName: 'TRSPORT', email: 'hung.nv2@trsport.vn', phone: '0956789012', hireDate: '2019-08-01', driverLicense: 'E', status: 'active', level: 'Staff' },
  { id: '9', employeeCode: 'TRS007', fullName: 'Trần Văn Bình', positionCode: 'DRIVER_C', position: 'Lái xe hạng C - Nội thành', departmentCode: 'DX05', department: 'Đội xe số 5 - Nội thành', companyId: 'trsport', companyName: 'TRSPORT', email: 'binh.tv@trsport.vn', phone: '0967890123', hireDate: '2021-02-10', driverLicense: 'C', status: 'active', level: 'Staff' },
  { id: '10', employeeCode: 'TRS008', fullName: 'Hoàng Thị Mai', positionCode: 'ROUTE_PLANNER', position: 'Chuyên viên Kế hoạch tuyến', departmentCode: 'PKHCH', department: 'Phòng Kế hoạch chuyến', companyId: 'trsport', companyName: 'TRSPORT', email: 'mai.ht@trsport.vn', phone: '0978901234', hireDate: '2018-09-01', status: 'active', level: 'Senior' },
  { id: '11', employeeCode: 'TRS009', fullName: 'Lê Văn Toàn', positionCode: 'SAFETY_OFFICER', position: 'Giám sát An toàn', departmentCode: 'PATGS', department: 'Phòng An toàn & Giám sát', companyId: 'trsport', companyName: 'TRSPORT', email: 'toan.lv@trsport.vn', phone: '0989012345', hireDate: '2017-11-20', status: 'active', level: 'Senior' },
  { id: '12', employeeCode: 'TRS010', fullName: 'Phạm Quang Vinh', positionCode: 'DISPATCHER', position: 'Điều phối viên Vận tải', departmentCode: 'PKHCH', department: 'Phòng Kế hoạch chuyến', companyId: 'trsport', companyName: 'TRSPORT', email: 'vinh.pq@trsport.vn', phone: '0990123456', hireDate: '2019-04-15', status: 'active', level: 'Junior' },
  
  // ===== LGTS =====
  { id: '13', employeeCode: 'LGTS001', fullName: 'Lý Minh Châu', positionCode: 'COO', position: 'Tổng Giám đốc', departmentCode: 'BDH', department: 'Ban Điều hành', companyId: 'lgts', companyName: 'LGTS', email: 'chau.lm@lgts.vn', phone: '0901111222', hireDate: '2018-02-14', status: 'active', level: 'C-Level' },
  { id: '14', employeeCode: 'LGTS002', fullName: 'Đặng Văn Hải', positionCode: 'WH_MGR', position: 'Trưởng Kho', departmentCode: 'PKB', department: 'Phòng Kho bãi', companyId: 'lgts', companyName: 'LGTS', email: 'hai.dv@lgts.vn', phone: '0902222333', hireDate: '2018-06-20', status: 'active', level: 'Manager' },
  { id: '15', employeeCode: 'LGTS003', fullName: 'Ngô Thị Yến', positionCode: 'DISPATCHER', position: 'Trưởng phòng Giao nhận', departmentCode: 'PGNPH', department: 'Phòng Giao nhận & Phối hợp', companyId: 'lgts', companyName: 'LGTS', email: 'yen.nt@lgts.vn', phone: '0903333444', hireDate: '2019-01-10', status: 'active', level: 'Manager' },
  { id: '16', employeeCode: 'LGTS004', fullName: 'Nguyễn Thị Lan', positionCode: 'FORWARDER', position: 'Nhân viên Forwarding', departmentCode: 'BQTCCƯ', department: 'Ban Quản trị CCƯ', companyId: 'lgts', companyName: 'LGTS', email: 'lan.nt@lgts.vn', phone: '0904444555', hireDate: '2019-05-15', status: 'active', level: 'Senior' },
  { id: '17', employeeCode: 'LGTS005', fullName: 'Phạm Văn Đông', positionCode: 'WH_CLERK', position: 'Thủ kho', departmentCode: 'TQLK-HCM', department: 'Tổ Kho TP.HCM', companyId: 'lgts', companyName: 'LGTS', email: 'dong.pv@lgts.vn', phone: '0905555666', hireDate: '2020-03-10', status: 'active', level: 'Staff' },
  { id: '18', employeeCode: 'LGTS006', fullName: 'Trần Văn Quân', positionCode: 'FORKLIFT_OP', position: 'Nhân viên Xe nâng', departmentCode: 'TQLK-HCM', department: 'Tổ Kho TP.HCM', companyId: 'lgts', companyName: 'LGTS', email: 'quan.tv@lgts.vn', phone: '0906666777', hireDate: '2020-07-20', status: 'active', level: 'Staff' },
  
  // ===== X-MAINTENANCE =====
  { id: '19', employeeCode: 'XMAINT001', fullName: 'Võ Xuân Phong', positionCode: 'COO', position: 'Tổng Giám đốc', departmentCode: 'BDH', department: 'Ban Điều hành', companyId: 'x-maintenance', companyName: 'X-Maintenance', email: 'phong.vx@xmaint.vn', phone: '0911111000', hireDate: '2019-01-05', status: 'active', level: 'C-Level' },
  { id: '20', employeeCode: 'XMAINT002', fullName: 'Đinh Công Minh', positionCode: 'MAINT_MGR', position: 'Trưởng Xưởng Bảo trì', departmentCode: 'XSCTW', department: 'Xưởng Sửa chữa Trung tâm', companyId: 'x-maintenance', companyName: 'X-Maintenance', email: 'minh.dc@xmaint.vn', phone: '0912222000', hireDate: '2019-03-15', status: 'active', level: 'Manager' },
  { id: '21', employeeCode: 'XMAINT003', fullName: 'Trịnh Văn Khánh', positionCode: 'PARTS_STAFF', position: 'Trưởng phòng Vật tư', departmentCode: 'PQLVTPT', department: 'Phòng QL Vật tư & Phụ tùng', companyId: 'x-maintenance', companyName: 'X-Maintenance', email: 'khanh.tv@xmaint.vn', phone: '0913333000', hireDate: '2019-06-01', status: 'active', level: 'Manager' },
  { id: '22', employeeCode: 'XMAINT004', fullName: 'Nguyễn Văn Dũng', positionCode: 'TECH_RESCUE', position: 'Đội trưởng Cứu hộ', departmentCode: 'DCHLĐ', department: 'Đội Cứu hộ Lưu động', companyId: 'x-maintenance', companyName: 'X-Maintenance', email: 'dung.nv@xmaint.vn', phone: '0914444000', hireDate: '2019-08-20', driverLicense: 'C', status: 'active', level: 'Manager' },
  { id: '23', employeeCode: 'XMAINT005', fullName: 'Lê Văn Tùng', positionCode: 'TECH_MECH', position: 'Kỹ thuật viên Cơ khí', departmentCode: 'XSCTW', department: 'Xưởng Sửa chữa Trung tâm', companyId: 'x-maintenance', companyName: 'X-Maintenance', email: 'tung.lv@xmaint.vn', phone: '0915555000', hireDate: '2020-02-10', status: 'active', level: 'Senior' },
  { id: '24', employeeCode: 'XMAINT006', fullName: 'Bùi Minh Quang', positionCode: 'TECH_ELEC', position: 'Kỹ thuật viên Điện - Điện tử', departmentCode: 'XSCTW', department: 'Xưởng Sửa chữa Trung tâm', companyId: 'x-maintenance', companyName: 'X-Maintenance', email: 'quang.bm@xmaint.vn', phone: '0916666000', hireDate: '2020-05-15', status: 'active', level: 'Staff' },
  
  // ===== X-EXPRESS =====
  { id: '25', employeeCode: 'XEXP001', fullName: 'Phan Thanh Tùng', positionCode: 'COO', position: 'Tổng Giám đốc', departmentCode: 'BDH', department: 'Ban Điều hành', companyId: 'x-express', companyName: 'X-Express', email: 'tung.pt@xexpress.vn', phone: '0921111000', hireDate: '2020-01-15', status: 'active', level: 'C-Level' },
  { id: '26', employeeCode: 'XEXP002', fullName: 'Lê Hoàng Nam', positionCode: 'WH_MGR', position: 'Giám đốc Hub', departmentCode: 'TTPL', department: 'Trung tâm Phân loại', companyId: 'x-express', companyName: 'X-Express', email: 'nam.lh@xexpress.vn', phone: '0922222000', hireDate: '2020-03-20', status: 'active', level: 'Manager' },
  { id: '27', employeeCode: 'XEXP003', fullName: 'Trương Văn Hiếu', positionCode: 'FLEET_MGR', position: 'Quản lý Đội Shipper', departmentCode: 'DGHLM', department: 'Đội Giao hàng Last-mile', companyId: 'x-express', companyName: 'X-Express', email: 'hieu.tv@xexpress.vn', phone: '0923333000', hireDate: '2020-06-01', status: 'active', level: 'Manager' },
  { id: '28', employeeCode: 'XEXP004', fullName: 'Nguyễn Thị Hồng', positionCode: 'DISPATCHER', position: 'Trưởng phòng Điều phối', departmentCode: 'PDPVH', department: 'Phòng Điều phối Vận hành', companyId: 'x-express', companyName: 'X-Express', email: 'hong.nt@xexpress.vn', phone: '0924444000', hireDate: '2020-08-15', status: 'active', level: 'Manager' },
  { id: '29', employeeCode: 'XEXP005', fullName: 'Hoàng Văn Minh', positionCode: 'DRIVER_B2', position: 'Shipper', departmentCode: 'DGHLM', department: 'Đội Giao hàng Last-mile', companyId: 'x-express', companyName: 'X-Express', email: 'minh.hv@xexpress.vn', phone: '0925555000', hireDate: '2021-01-10', driverLicense: 'B2', status: 'active', level: 'Staff' },
  { id: '30', employeeCode: 'XEXP006', fullName: 'Trần Thị Linh', positionCode: 'SORTER', position: 'Nhân viên Phân loại', departmentCode: 'TTPL', department: 'Trung tâm Phân loại', companyId: 'x-express', companyName: 'X-Express', email: 'linh.tt@xexpress.vn', phone: '0926666000', hireDate: '2021-04-20', status: 'probation', level: 'Junior' },
  { id: '31', employeeCode: 'XEXP007', fullName: 'Đỗ Minh Tuấn', positionCode: 'CS_AGENT', position: 'Trưởng phòng CSKH', departmentCode: 'PCSXLKN', department: 'Phòng CSKH & Xử lý Khiếu nại', companyId: 'x-express', companyName: 'X-Express', email: 'tuan.dm@xexpress.vn', phone: '0927777000', hireDate: '2020-10-01', status: 'active', level: 'Manager' }
];

// ============================================
// 7. THỐNG KÊ NHÂN SỰ (HR Stats)
// ============================================

export interface HRStats {
  companyId: string;
  totalEmployees: number;
  newHires: number;
  resignations: number;
  turnoverRate: number;
  avgTenure: number;
  driverCount?: number;
}

export const mockHRStats: HRStats[] = [
  { companyId: 'all', totalEmployees: 1580, newHires: 65, resignations: 18, turnoverRate: 3.5, avgTenure: 2.6, driverCount: 680 },
  { companyId: 'trsport', totalEmployees: 520, newHires: 22, resignations: 8, turnoverRate: 4.2, avgTenure: 2.8, driverCount: 380 },
  { companyId: 'lgts', totalEmployees: 380, newHires: 15, resignations: 4, turnoverRate: 2.8, avgTenure: 2.4, driverCount: 45 },
  { companyId: 'x-maintenance', totalEmployees: 280, newHires: 12, resignations: 3, turnoverRate: 2.5, avgTenure: 2.2, driverCount: 35 },
  { companyId: 'x-express', totalEmployees: 400, newHires: 16, resignations: 3, turnoverRate: 3.8, avgTenure: 1.8, driverCount: 220 }
];

// ============================================
// 8. KPI & METRICS - VẬN TẢI & LOGISTICS
// (Sẽ mở rộng ở Chunk 2)
// ============================================

export interface KPIMetric {
  id: string;
  code: string;
  name: string;
  description: string;
  unit: string;
  formula?: string;
  category: string;
  targetValue: number;
  warningThreshold: number;
  criticalThreshold: number;
  applicableCompanies: string[];
}

export const mockKPIMetrics: KPIMetric[] = [
  // ===== NHÓM TÀI CHÍNH (Financial Metrics) =====
  {
    id: 'kpi-fin-1',
    code: 'FIN001',
    name: 'Doanh thu',
    description: 'Tổng doanh thu trong kỳ',
    unit: 'VNĐ',
    formula: 'Σ(Diện tích thuê × Giá thuê) + Σ(Dịch vụ phát sinh)',
    category: 'Tài chính',
    targetValue: 10000000000,
    warningThreshold: 8000000000,
    criticalThreshold: 6000000000,
    applicableCompanies: ['all', 'trsport', 'lgts', 'x-express']
  },
  {
    id: 'kpi-fin-2',
    code: 'FIN002',
    name: 'Lợi nhuận ròng mỗi xe',
    description: 'Lợi nhuận thực tế sau khi trừ tất cả chi phí cho mỗi phương tiện',
    unit: 'VNĐ',
    formula: 'Doanh thu - (Dầu + Lương tài xế + BOT + Khấu hao + Bảo trì)',
    category: 'Tài chính',
    targetValue: 15000000,
    warningThreshold: 10000000,
    criticalThreshold: 5000000,
    applicableCompanies: ['trsport', 'lgts', 'x-express']
  },
  {
    id: 'kpi-fin-3',
    code: 'FIN003',
    name: 'Chi phí nhiên liệu trên doanh thu',
    description: 'Tỷ lệ chi phí dầu so với doanh thu',
    unit: '%',
    formula: '(Tổng chi phí nhiên liệu / Tổng doanh thu) × 100',
    category: 'Tài chính',
    targetValue: 25,
    warningThreshold: 30,
    criticalThreshold: 35,
    applicableCompanies: ['trsport', 'lgts', 'x-express']
  },

  // ===== NHÓM VẬN HÀNH (Operational Metrics) =====
  {
    id: 'kpi-ops-1',
    code: 'OPS001',
    name: 'Tỷ lệ lấp đầy xe (Load Factor)',
    description: 'Tỷ lệ trọng tải thực tế so với tối đa',
    unit: '%',
    formula: '(Tải trọng thực tế / Tải trọng tối đa) × 100',
    category: 'Vận hành',
    targetValue: 85,
    warningThreshold: 70,
    criticalThreshold: 55,
    applicableCompanies: ['trsport', 'lgts']
  },
  {
    id: 'kpi-ops-2',
    code: 'OPS002',
    name: 'Tỷ lệ trống chuyến (Empty Miles)',
    description: 'Tỷ lệ km chạy không hàng',
    unit: '%',
    formula: '(Số km trống / Tổng số km) × 100',
    category: 'Vận hành',
    targetValue: 10,
    warningThreshold: 15,
    criticalThreshold: 20,
    applicableCompanies: ['trsport', 'lgts', 'x-express']
  },
  {
    id: 'kpi-ops-3',
    code: 'OPS003',
    name: 'Tỷ lệ giao hàng đúng hạn (DOT)',
    description: 'On-Time Delivery Rate',
    unit: '%',
    formula: '(Số đơn giao đúng hạn / Tổng số đơn) × 100',
    category: 'Vận hành',
    targetValue: 95,
    warningThreshold: 90,
    criticalThreshold: 85,
    applicableCompanies: ['trsport', 'lgts', 'x-express']
  },
  {
    id: 'kpi-ops-4',
    code: 'OPS004',
    name: 'Hiệu suất nhiên liệu',
    description: 'So sánh mức tiêu thụ thực tế với định mức',
    unit: '%',
    formula: '(Tiêu thụ thực tế / Định mức) × 100',
    category: 'Vận hành',
    targetValue: 100,
    warningThreshold: 110,
    criticalThreshold: 120,
    applicableCompanies: ['trsport', 'lgts', 'x-express']
  },
  {
    id: 'kpi-ops-5',
    code: 'OPS005',
    name: 'Tỷ lệ sử dụng phương tiện',
    description: 'Phần trăm thời gian xe đang hoạt động',
    unit: '%',
    formula: '(Số ngày xe chạy / Số ngày trong kỳ) × 100',
    category: 'Vận hành',
    targetValue: 85,
    warningThreshold: 75,
    criticalThreshold: 65,
    applicableCompanies: ['trsport', 'lgts', 'x-express']
  },

  // ===== NHÓM BẢO TRÌ (Maintenance Metrics) =====
  {
    id: 'kpi-maint-1',
    code: 'MAINT001',
    name: 'Thời gian sửa chữa trung bình',
    description: 'MTTR - Mean Time To Repair',
    unit: 'Giờ',
    formula: 'Tổng thời gian sửa / Số lần sửa',
    category: 'Bảo trì',
    targetValue: 4,
    warningThreshold: 6,
    criticalThreshold: 8,
    applicableCompanies: ['x-maintenance', 'trsport', 'lgts']
  },
  {
    id: 'kpi-maint-2',
    code: 'MAINT002',
    name: 'Tỷ lệ xe sẵn sàng',
    description: 'Availability Rate',
    unit: '%',
    formula: '(Số xe hoạt động / Tổng số xe) × 100',
    category: 'Bảo trì',
    targetValue: 95,
    warningThreshold: 90,
    criticalThreshold: 85,
    applicableCompanies: ['x-maintenance', 'trsport', 'lgts']
  },
  {
    id: 'kpi-maint-3',
    code: 'MAINT003',
    name: 'Chi phí bảo trì trên mỗi km',
    description: 'Bảo trì trung bình cho mỗi km chạy',
    unit: 'VNĐ/km',
    formula: 'Tổng chi phí bảo trì / Tổng số km',
    category: 'Bảo trì',
    targetValue: 500,
    warningThreshold: 700,
    criticalThreshold: 1000,
    applicableCompanies: ['x-maintenance', 'trsport', 'lgts']
  },

  // ===== NHÓM NHÂN SỰ (HR Metrics) =====
  {
    id: 'kpi-hr-1',
    code: 'HR001',
    name: 'Tỷ lệ nghỉ việc',
    description: 'Employee Turnover Rate',
    unit: '%',
    formula: '(Số nhân viên nghỉ / Tổng nhân viên) × 100',
    category: 'Nhân sự',
    targetValue: 5,
    warningThreshold: 8,
    criticalThreshold: 12,
    applicableCompanies: ['all']
  },
  {
    id: 'kpi-hr-2',
    code: 'HR002',
    name: 'Tỷ lệ hoàn thành KPI tài xế',
    description: 'Percentage of drivers meeting KPI targets',
    unit: '%',
    formula: '(Số tài xế đạt KPI / Tổng số tài xế) × 100',
    category: 'Nhân sự',
    targetValue: 90,
    warningThreshold: 80,
    criticalThreshold: 70,
    applicableCompanies: ['trsport', 'lgts', 'x-express']
  },

  // ===== NHÓM LOGISTICS (Warehouse Metrics) =====
  {
    id: 'kpi-log-1',
    code: 'LOG001',
    name: 'Tỷ lệ lấp đầy kho',
    description: 'Warehouse Utilization Rate',
    unit: '%',
    formula: '(Diện tích đang sử dụng / Tổng diện tích) × 100',
    category: 'Logistics',
    targetValue: 80,
    warningThreshold: 90,
    criticalThreshold: 95,
    applicableCompanies: ['lgts']
  },
  {
    id: 'kpi-log-2',
    code: 'LOG002',
    name: 'Thời gian xử lý đơn hàng trung bình',
    description: 'Average Order Processing Time',
    unit: 'Giờ',
    formula: 'Tổng thời gian xử lý / Số đơn hàng',
    category: 'Logistics',
    targetValue: 2,
    warningThreshold: 4,
    criticalThreshold: 6,
    applicableCompanies: ['lgts', 'x-express']
  }
];

// ============================================
// 9. KPI DASHBOARD DATA
// ============================================

export interface KPIDashboardData {
  companyId: string;
  kpiCode: string;
  kpiName: string;
  currentValue: number;
  targetValue: number;
  unit: string;
  status: 'good' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
  changePercent: number;
}

export const mockKPIDashboardData: KPIDashboardData[] = [
  // ===== TOÀN TẬP ĐOÀN (All Companies) =====
  { companyId: 'all', kpiCode: 'FIN001', kpiName: 'Doanh thu', currentValue: 52000000000, targetValue: 55000000000, unit: 'VNĐ', status: 'warning', trend: 'up', changePercent: 8.5 },
  { companyId: 'all', kpiCode: 'HR001', kpiName: 'Tỷ lệ nghỉ việc', currentValue: 3.5, targetValue: 5, unit: '%', status: 'good', trend: 'down', changePercent: -1.2 },

  // ===== TRSPORT =====
  { companyId: 'trsport', kpiCode: 'OPS001', kpiName: 'Tỷ lệ lấp đầy xe', currentValue: 82, targetValue: 85, unit: '%', status: 'warning', trend: 'up', changePercent: 3.5 },
  { companyId: 'trsport', kpiCode: 'OPS002', kpiName: 'Tỷ lệ trống chuyến', currentValue: 12, targetValue: 10, unit: '%', status: 'warning', trend: 'down', changePercent: -2.0 },
  { companyId: 'trsport', kpiCode: 'OPS003', kpiName: 'Tỷ lệ giao hàng đúng hạn', currentValue: 94, targetValue: 95, unit: '%', status: 'warning', trend: 'up', changePercent: 1.5 },
  { companyId: 'trsport', kpiCode: 'OPS004', kpiName: 'Hiệu suất nhiên liệu', currentValue: 105, targetValue: 100, unit: '%', status: 'warning', trend: 'stable', changePercent: 0.5 },
  { companyId: 'trsport', kpiCode: 'FIN002', kpiName: 'Lợi nhuận ròng mỗi xe', currentValue: 14500000, targetValue: 15000000, unit: 'VNĐ', status: 'warning', trend: 'up', changePercent: 5.2 },
  { companyId: 'trsport', kpiCode: 'FIN003', kpiName: 'Chi phí nhiên liệu/Doanh thu', currentValue: 27, targetValue: 25, unit: '%', status: 'warning', trend: 'up', changePercent: 2.1 },
  { companyId: 'trsport', kpiCode: 'OPS005', kpiName: 'Tỷ lệ sử dụng phương tiện', currentValue: 88, targetValue: 85, unit: '%', status: 'good', trend: 'up', changePercent: 4.0 },
  { companyId: 'trsport', kpiCode: 'HR002', kpiName: 'Tỷ lệ hoàn thành KPI tài xế', currentValue: 92, targetValue: 90, unit: '%', status: 'good', trend: 'up', changePercent: 3.0 },

  // ===== LGTS =====
  { companyId: 'lgts', kpiCode: 'OPS001', kpiName: 'Tỷ lệ lấp đầy xe', currentValue: 78, targetValue: 85, unit: '%', status: 'warning', trend: 'stable', changePercent: 0.5 },
  { companyId: 'lgts', kpiCode: 'LOG001', kpiName: 'Tỷ lệ lấp đầy kho', currentValue: 78, targetValue: 80, unit: '%', status: 'warning', trend: 'up', changePercent: 2.5 },
  { companyId: 'lgts', kpiCode: 'LOG002', kpiName: 'Thời gian xử lý đơn hàng', currentValue: 2.5, targetValue: 2, unit: 'Giờ', status: 'warning', trend: 'down', changePercent: -5.0 },
  { companyId: 'lgts', kpiCode: 'OPS003', kpiName: 'Tỷ lệ giao hàng đúng hạn', currentValue: 96, targetValue: 95, unit: '%', status: 'good', trend: 'up', changePercent: 2.0 },
  { companyId: 'lgts', kpiCode: 'MAINT001', kpiName: 'Thời gian sửa chữa TB', currentValue: 4.2, targetValue: 4, unit: 'Giờ', status: 'warning', trend: 'stable', changePercent: 1.0 },

  // ===== X-MAINTENANCE =====
  { companyId: 'x-maintenance', kpiCode: 'MAINT001', kpiName: 'Thời gian sửa chữa TB', currentValue: 3.8, targetValue: 4, unit: 'Giờ', status: 'good', trend: 'up', changePercent: 5.0 },
  { companyId: 'x-maintenance', kpiCode: 'MAINT002', kpiName: 'Tỷ lệ xe sẵn sàng', currentValue: 96, targetValue: 95, unit: '%', status: 'good', trend: 'up', changePercent: 2.5 },
  { companyId: 'x-maintenance', kpiCode: 'MAINT003', kpiName: 'Chi phí bảo trì/km', currentValue: 480, targetValue: 500, unit: 'VNĐ/km', status: 'good', trend: 'up', changePercent: 3.0 },

  // ===== X-EXPRESS =====
  { companyId: 'x-express', kpiCode: 'OPS003', kpiName: 'Tỷ lệ giao hàng đúng hạn', currentValue: 97, targetValue: 95, unit: '%', status: 'good', trend: 'up', changePercent: 3.5 },
  { companyId: 'x-express', kpiCode: 'OPS002', kpiName: 'Tỷ lệ trống chuyến', currentValue: 8, targetValue: 10, unit: '%', status: 'good', trend: 'up', changePercent: 15.0 },
  { companyId: 'x-express', kpiCode: 'LOG002', kpiName: 'Thời gian xử lý đơn hàng', currentValue: 1.8, targetValue: 2, unit: 'Giờ', status: 'good', trend: 'up', changePercent: 8.0 }
];

// ============================================
// 10. KHÁCH HÀNG & ĐỐI TÁC
// ============================================

export interface Customer {
  id: string;
  code: string;
  name: string;
  type: 'individual' | 'corporate';
  industry?: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  fromCompanyId: string;
  status: 'active' | 'inactive';
  totalOrders: number;
  totalRevenue: number;
}

export const mockCustomers: Customer[] = [
  { id: 'cust-1', code: 'KH001', name: 'Công ty TNHH Thương mại ABC', type: 'corporate', industry: 'Bán lẻ', contactPerson: 'Nguyễn Văn A', email: 'contact@abc.vn', phone: '0281234567', address: 'Quận 1, TP.HCM', fromCompanyId: 'trsport', status: 'active', totalOrders: 150, totalRevenue: 2500000000 },
  { id: 'cust-2', code: 'KH002', name: 'Công ty CP Sản xuất XYZ', type: 'corporate', industry: 'Sản xuất', contactPerson: 'Trần Thị B', email: 'sales@xyz.vn', phone: '0282234567', address: 'Quận 7, TP.HCM', fromCompanyId: 'lgts', status: 'active', totalOrders: 85, totalRevenue: 1800000000 },
  { id: 'cust-3', code: 'KH003', name: 'Siêu thị Mega Mart', type: 'corporate', industry: 'Bán lẻ', contactPerson: 'Lê Văn C', email: 'logistics@megamart.vn', phone: '0283345678', address: 'Quận Bình Thạnh, TP.HCM', fromCompanyId: 'lgts', status: 'active', totalOrders: 320, totalRevenue: 4500000000 },
  { id: 'cust-4', code: 'KH004', name: 'Công ty Du lịch Việt Travel', type: 'corporate', industry: 'Du lịch', contactPerson: 'Phạm Thị D', email: 'info@viettravel.vn', phone: '0284456789', address: 'Quận 3, TP.HCM', fromCompanyId: 'trsport', status: 'active', totalOrders: 45, totalRevenue: 1200000000 },
  { id: 'cust-5', code: 'KH005', name: 'Shop Online TikiMart', type: 'corporate', industry: 'Thương mại điện tử', contactPerson: 'Hoàng Văn E', email: 'partner@tikimart.vn', phone: '0285567890', address: 'Quận 2, TP.HCM', fromCompanyId: 'x-express', status: 'active', totalOrders: 12500, totalRevenue: 3800000000 },
  { id: 'cust-6', code: 'KH006', name: 'Công ty Vận tải Bắc Nam', type: 'corporate', industry: 'Vận tải', contactPerson: 'Ngô Văn F', email: 'dichvu@bacnam.vn', phone: '0286678901', address: 'Quận 9, TP.HCM', fromCompanyId: 'x-maintenance', status: 'active', totalOrders: 78, totalRevenue: 980000000 }
];

export interface Partner {
  id: string;
  code: string;
  name: string;
  type: string;
  contactPerson: string;
  email: string;
  phone: string;
  relatedCompanies: string[];
  status: 'active' | 'inactive';
}

export const mockPartners: Partner[] = [
  { id: 'ptr-1', code: 'DT001', name: 'Công ty Xăng dầu Petrolimex', type: 'Nhà cung cấp nhiên liệu', contactPerson: 'Phạm Văn E', email: 'sales@petrolimex.vn', phone: '0284123456', relatedCompanies: ['trsport', 'lgts', 'x-express'], status: 'active' },
  { id: 'ptr-2', code: 'DT002', name: 'Công ty Bảo hiểm Bảo Việt', type: 'Bảo hiểm phương tiện', contactPerson: 'Hoàng Thị F', email: 'corporate@baoviet.vn', phone: '0285234567', relatedCompanies: ['all'], status: 'active' },
  { id: 'ptr-3', code: 'DT003', name: 'Công ty Lốp xe Bridgestone', type: 'Nhà cung cấp phụ tùng', contactPerson: 'Ngô Văn G', email: 'partner@bridgestone.vn', phone: '0286345678', relatedCompanies: ['x-maintenance', 'trsport'], status: 'active' },
  { id: 'ptr-4', code: 'DT004', name: 'Công ty Phụ tùng Toyota VN', type: 'Nhà cung cấp phụ tùng', contactPerson: 'Trần Văn H', email: 'parts@toyota.vn', phone: '0287456789', relatedCompanies: ['x-maintenance'], status: 'active' },
  { id: 'ptr-5', code: 'DT005', name: 'Viettel GPS Tracking', type: 'Đối tác công nghệ', contactPerson: 'Lê Minh I', email: 'gps@viettel.vn', phone: '0288567890', relatedCompanies: ['trsport', 'lgts', 'x-express'], status: 'active' },
  { id: 'ptr-6', code: 'DT006', name: 'Cảng Cát Lái', type: 'Đối tác logistics', contactPerson: 'Võ Văn K', email: 'service@catlai.vn', phone: '0289678901', relatedCompanies: ['trsport', 'lgts'], status: 'active' }
];

// ============================================
// 11. LOẠI PHƯƠNG TIỆN (Vehicle Types)
// Thiết kế theo tiêu chuẩn ngành Vận tải VN
// ============================================

export interface VehicleType {
  id: string;
  code: string;
  name: string;
  category: 'truck' | 'container' | 'bus' | 'van' | 'pickup' | 'refrigerated' | 'special';
  payloadCapacity: number; // Tải trọng (tấn)
  passengerCapacity?: number; // Số chỗ ngồi (nếu là xe khách)
  boxType?: string; // Loại thùng
  dimensions?: {
    length: number; // Dài (m)
    width: number;  // Rộng (m)
    height: number; // Cao (m)
    volume: number; // Dung tích thùng (m³)
  };
  fuelType: 'diesel' | 'gasoline' | 'electric' | 'hybrid';
  fuelConsumptionNorm: number; // Định mức dầu (lít/100km)
  requiredLicense: 'B2' | 'C' | 'D' | 'E' | 'FC';
  applicableCompanies: string[];
  maintenanceIntervalKm: number; // Chu kỳ bảo dưỡng (km)
  status: 'active' | 'inactive';
  description: string;
}

export const mockVehicleTypes: VehicleType[] = [
  // ===== XE ĐẦU KÉO CONTAINER =====
  {
    id: 'vt-1',
    code: 'CONT-40',
    name: 'Xe đầu kéo Container 40 feet',
    category: 'container',
    payloadCapacity: 30,
    boxType: 'Sơ-mi rơ-moóc 40ft',
    dimensions: { length: 12.2, width: 2.44, height: 2.59, volume: 67.7 },
    fuelType: 'diesel',
    fuelConsumptionNorm: 38,
    requiredLicense: 'FC',
    applicableCompanies: ['trsport', 'lgts'],
    maintenanceIntervalKm: 15000,
    status: 'active',
    description: 'Xe đầu kéo chuyên chở container 40ft, tuyến cảng biển - KCN'
  },
  {
    id: 'vt-2',
    code: 'CONT-20',
    name: 'Xe đầu kéo Container 20 feet',
    category: 'container',
    payloadCapacity: 22,
    boxType: 'Sơ-mi rơ-moóc 20ft',
    dimensions: { length: 6.1, width: 2.44, height: 2.59, volume: 33.2 },
    fuelType: 'diesel',
    fuelConsumptionNorm: 32,
    requiredLicense: 'FC',
    applicableCompanies: ['trsport', 'lgts'],
    maintenanceIntervalKm: 15000,
    status: 'active',
    description: 'Xe đầu kéo container 20ft, linh hoạt cho hàng lẻ'
  },

  // ===== XE TẢI THÙNG KÍN =====
  {
    id: 'vt-3',
    code: 'TRUCK-15T',
    name: 'Xe tải thùng kín 15 tấn',
    category: 'truck',
    payloadCapacity: 15,
    boxType: 'Thùng kín',
    dimensions: { length: 9.5, width: 2.4, height: 2.5, volume: 57 },
    fuelType: 'diesel',
    fuelConsumptionNorm: 28,
    requiredLicense: 'E',
    applicableCompanies: ['trsport', 'lgts'],
    maintenanceIntervalKm: 12000,
    status: 'active',
    description: 'Xe tải nặng chuyên tuyến Bắc-Nam, hàng khô'
  },
  {
    id: 'vt-4',
    code: 'TRUCK-10T',
    name: 'Xe tải thùng kín 10 tấn',
    category: 'truck',
    payloadCapacity: 10,
    boxType: 'Thùng kín',
    dimensions: { length: 7.5, width: 2.3, height: 2.4, volume: 41.4 },
    fuelType: 'diesel',
    fuelConsumptionNorm: 22,
    requiredLicense: 'E',
    applicableCompanies: ['trsport', 'lgts'],
    maintenanceIntervalKm: 10000,
    status: 'active',
    description: 'Xe tải trung bình, linh hoạt nội vùng'
  },
  {
    id: 'vt-5',
    code: 'TRUCK-5T',
    name: 'Xe tải thùng kín 5 tấn',
    category: 'truck',
    payloadCapacity: 5,
    boxType: 'Thùng kín',
    dimensions: { length: 5.2, width: 2.1, height: 2.2, volume: 24 },
    fuelType: 'diesel',
    fuelConsumptionNorm: 15,
    requiredLicense: 'C',
    applicableCompanies: ['trsport', 'lgts', 'x-express'],
    maintenanceIntervalKm: 8000,
    status: 'active',
    description: 'Xe tải nhẹ giao hàng nội thành, KCN'
  },
  {
    id: 'vt-6',
    code: 'TRUCK-2.5T',
    name: 'Xe tải thùng kín 2.5 tấn',
    category: 'truck',
    payloadCapacity: 2.5,
    boxType: 'Thùng kín',
    dimensions: { length: 4.2, width: 1.9, height: 2.0, volume: 16 },
    fuelType: 'diesel',
    fuelConsumptionNorm: 12,
    requiredLicense: 'C',
    applicableCompanies: ['trsport', 'x-express'],
    maintenanceIntervalKm: 6000,
    status: 'active',
    description: 'Xe tải nhỏ giao hàng siêu thị, cửa hàng'
  },

  // ===== XE TẢI LẠNH =====
  {
    id: 'vt-7',
    code: 'REFRIG-10T',
    name: 'Xe tải lạnh 10 tấn',
    category: 'refrigerated',
    payloadCapacity: 10,
    boxType: 'Thùng lạnh (-18°C đến +8°C)',
    dimensions: { length: 7.0, width: 2.3, height: 2.2, volume: 35.4 },
    fuelType: 'diesel',
    fuelConsumptionNorm: 28,
    requiredLicense: 'E',
    applicableCompanies: ['trsport', 'lgts'],
    maintenanceIntervalKm: 8000,
    status: 'active',
    description: 'Xe đông lạnh vận chuyển thực phẩm, nông sản'
  },
  {
    id: 'vt-8',
    code: 'REFRIG-5T',
    name: 'Xe tải lạnh 5 tấn',
    category: 'refrigerated',
    payloadCapacity: 5,
    boxType: 'Thùng lạnh (-18°C đến +8°C)',
    dimensions: { length: 5.0, width: 2.1, height: 2.0, volume: 21 },
    fuelType: 'diesel',
    fuelConsumptionNorm: 18,
    requiredLicense: 'C',
    applicableCompanies: ['trsport', 'lgts'],
    maintenanceIntervalKm: 6000,
    status: 'active',
    description: 'Xe lạnh nhỏ giao hàng siêu thị, nhà hàng'
  },

  // ===== XE KHÁCH =====
  {
    id: 'vt-9',
    code: 'BUS-45',
    name: 'Xe khách giường nằm 44 chỗ',
    category: 'bus',
    payloadCapacity: 0,
    passengerCapacity: 44,
    boxType: 'Giường nằm 2 tầng',
    dimensions: { length: 12.0, width: 2.5, height: 3.6, volume: 0 },
    fuelType: 'diesel',
    fuelConsumptionNorm: 32,
    requiredLicense: 'E',
    applicableCompanies: ['trsport'],
    maintenanceIntervalKm: 10000,
    status: 'active',
    description: 'Xe giường nằm tuyến Bắc-Nam, liên tỉnh đêm'
  },
  {
    id: 'vt-10',
    code: 'BUS-34',
    name: 'Xe khách giường nằm 34 chỗ',
    category: 'bus',
    payloadCapacity: 0,
    passengerCapacity: 34,
    boxType: 'Giường nằm 2 tầng',
    dimensions: { length: 10.5, width: 2.5, height: 3.5, volume: 0 },
    fuelType: 'diesel',
    fuelConsumptionNorm: 28,
    requiredLicense: 'E',
    applicableCompanies: ['trsport'],
    maintenanceIntervalKm: 10000,
    status: 'active',
    description: 'Xe giường nằm tuyến trung bình, nội vùng'
  },
  {
    id: 'vt-11',
    code: 'MINIBUS-16',
    name: 'Xe khách 16 chỗ',
    category: 'bus',
    payloadCapacity: 0,
    passengerCapacity: 16,
    boxType: 'Ghế ngồi',
    dimensions: { length: 5.8, width: 2.0, height: 2.5, volume: 0 },
    fuelType: 'diesel',
    fuelConsumptionNorm: 14,
    requiredLicense: 'D',
    applicableCompanies: ['trsport'],
    maintenanceIntervalKm: 8000,
    status: 'active',
    description: 'Xe trung chuyển sân bay, du lịch ngắn ngày'
  },

  // ===== XE VAN / BÁN TẢI =====
  {
    id: 'vt-12',
    code: 'VAN-1T',
    name: 'Xe Van 1 tấn',
    category: 'van',
    payloadCapacity: 1,
    boxType: 'Thùng kín',
    dimensions: { length: 3.2, width: 1.6, height: 1.7, volume: 8.7 },
    fuelType: 'diesel',
    fuelConsumptionNorm: 9,
    requiredLicense: 'B2',
    applicableCompanies: ['x-express'],
    maintenanceIntervalKm: 5000,
    status: 'active',
    description: 'Xe van giao hàng nội thành, Last-mile'
  },
  {
    id: 'vt-13',
    code: 'PICKUP',
    name: 'Xe bán tải trung chuyển',
    category: 'pickup',
    payloadCapacity: 0.8,
    boxType: 'Thùng hở',
    dimensions: { length: 1.8, width: 1.5, height: 0.5, volume: 1.35 },
    fuelType: 'diesel',
    fuelConsumptionNorm: 10,
    requiredLicense: 'B2',
    applicableCompanies: ['x-express', 'x-maintenance'],
    maintenanceIntervalKm: 5000,
    status: 'active',
    description: 'Xe bán tải linh hoạt, gom hàng/cứu hộ'
  },

  // ===== XE ĐẶC BIỆT =====
  {
    id: 'vt-14',
    code: 'RESCUE',
    name: 'Xe cứu hộ kéo xe',
    category: 'special',
    payloadCapacity: 8,
    boxType: 'Sàn kéo xe',
    dimensions: { length: 8.0, width: 2.5, height: 1.0, volume: 0 },
    fuelType: 'diesel',
    fuelConsumptionNorm: 20,
    requiredLicense: 'C',
    applicableCompanies: ['x-maintenance'],
    maintenanceIntervalKm: 8000,
    status: 'active',
    description: 'Xe cứu hộ chuyên dụng, kéo xe hư hỏng'
  },
  {
    id: 'vt-15',
    code: 'FORKLIFT-3T',
    name: 'Xe nâng Forklift 3 tấn',
    category: 'special',
    payloadCapacity: 3,
    boxType: 'Xe nâng',
    dimensions: { length: 3.5, width: 1.2, height: 2.1, volume: 0 },
    fuelType: 'diesel',
    fuelConsumptionNorm: 6,
    requiredLicense: 'B2',
    applicableCompanies: ['lgts'],
    maintenanceIntervalKm: 3000,
    status: 'active',
    description: 'Xe nâng xếp dỡ hàng trong kho'
  }
];

// ============================================
// 12. DANH MỤC ĐỐI TÁC MỞ RỘNG (Vendors)
// Nhà cung cấp, dịch vụ hỗ trợ vận hành
// ============================================

export interface Vendor {
  id: string;
  code: string;
  name: string;
  shortName: string;
  category: 'fuel' | 'insurance' | 'repair' | 'rest_stop' | 'rescue' | 'toll' | 'parts' | 'technology' | 'port' | 'other';
  taxCode: string;
  address: string;
  contactPerson: string;
  phone: string;
  email: string;
  bankAccount?: string;
  bankName?: string;
  paymentTerms: string; // Điều khoản thanh toán
  creditLimit?: number; // Hạn mức công nợ
  contractExpiry?: string; // Ngày hết hạn HĐ
  discountRate?: number; // Chiết khấu %
  relatedCompanies: string[];
  status: 'active' | 'inactive' | 'pending';
  notes?: string;
}

export const mockVendors: Vendor[] = [
  // ===== NHÀ CUNG CẤP NHIÊN LIỆU =====
  {
    id: 'vnd-1',
    code: 'NCC-001',
    name: 'Tổng Công ty Xăng dầu Việt Nam (Petrolimex)',
    shortName: 'Petrolimex',
    category: 'fuel',
    taxCode: '0100100079',
    address: 'Số 1 Khâm Thiên, Đống Đa, Hà Nội',
    contactPerson: 'Nguyễn Văn Minh',
    phone: '024 3851 2603',
    email: 'doitac@petrolimex.com.vn',
    bankAccount: '1021000000789',
    bankName: 'Vietcombank HN',
    paymentTerms: 'Công nợ 30 ngày',
    creditLimit: 5000000000,
    contractExpiry: '2027-12-31',
    discountRate: 2.5,
    relatedCompanies: ['trsport', 'lgts', 'x-maintenance'],
    status: 'active',
    notes: 'Đối tác chiến lược, ưu tiên giá'
  },
  {
    id: 'vnd-2',
    code: 'NCC-002',
    name: 'Tổng Công ty Dầu Việt Nam (PVOil)',
    shortName: 'PVOil',
    category: 'fuel',
    taxCode: '0101243150',
    address: 'Tầng 14, PetroVietnam Tower, Quận 1, TP.HCM',
    contactPerson: 'Trần Thị Hương',
    phone: '028 3910 2828',
    email: 'kinhdoanh@pvoil.com.vn',
    bankAccount: '0071000899456',
    bankName: 'Vietcombank HCM',
    paymentTerms: 'Công nợ 15 ngày',
    creditLimit: 3000000000,
    contractExpiry: '2026-06-30',
    discountRate: 2.0,
    relatedCompanies: ['trsport', 'x-express'],
    status: 'active',
    notes: 'Đối tác phụ, bổ sung vùng miền Nam'
  },
  {
    id: 'vnd-3',
    code: 'NCC-003',
    name: 'Công ty TNHH Một Thành viên Dầu khí TP.HCM (Saigon Petro)',
    shortName: 'Saigon Petro',
    category: 'fuel',
    taxCode: '0300455377',
    address: 'Số 9 Đinh Bộ Lĩnh, Bình Thạnh, TP.HCM',
    contactPerson: 'Lê Văn Hùng',
    phone: '028 3898 9898',
    email: 'sales@saigonpetro.com.vn',
    paymentTerms: 'Thanh toán ngay',
    relatedCompanies: ['x-express'],
    status: 'active',
    notes: 'Cung cấp cho đội shipper nội thành'
  },

  // ===== BẢO HIỂM =====
  {
    id: 'vnd-4',
    code: 'BH-001',
    name: 'Tổng Công ty Bảo hiểm Bảo Việt',
    shortName: 'Bảo Việt',
    category: 'insurance',
    taxCode: '0100773882',
    address: 'Số 8 Lê Thái Tổ, Hoàn Kiếm, Hà Nội',
    contactPerson: 'Hoàng Thị Lan',
    phone: '024 3928 9898',
    email: 'corporate@baoviet.com.vn',
    paymentTerms: 'Hàng năm',
    contractExpiry: '2026-12-31',
    discountRate: 15,
    relatedCompanies: ['all'],
    status: 'active',
    notes: 'BH trách nhiệm dân sự, BH hàng hóa, BH tài xế'
  },
  {
    id: 'vnd-5',
    code: 'BH-002',
    name: 'Công ty Cổ phần Bảo hiểm Petrolimex (PJICO)',
    shortName: 'PJICO',
    category: 'insurance',
    taxCode: '0100111122',
    address: 'Số 10 Trần Nguyên Hãn, Hoàn Kiếm, Hà Nội',
    contactPerson: 'Nguyễn Văn Nam',
    phone: '024 3933 6677',
    email: 'doanhnghiep@pjico.com.vn',
    paymentTerms: 'Hàng quý',
    contractExpiry: '2026-06-30',
    discountRate: 12,
    relatedCompanies: ['trsport', 'lgts'],
    status: 'active',
    notes: 'BH xe ô tô vật chất thân xe'
  },
  {
    id: 'vnd-6',
    code: 'BH-003',
    name: 'Bảo hiểm PVI',
    shortName: 'PVI',
    category: 'insurance',
    taxCode: '0100686765',
    address: 'Tầng 22, PetroVietnam Tower, Hà Nội',
    contactPerson: 'Phạm Minh Tuấn',
    phone: '024 3573 9999',
    email: 'enterprise@pvi.com.vn',
    paymentTerms: 'Hàng năm',
    discountRate: 10,
    relatedCompanies: ['x-maintenance'],
    status: 'active',
    notes: 'BH trách nhiệm nghề nghiệp sửa chữa'
  },

  // ===== GARA SỬA CHỮA BÊN NGOÀI =====
  {
    id: 'vnd-7',
    code: 'SC-001',
    name: 'Gara Ô tô Hùng Cường',
    shortName: 'Hùng Cường',
    category: 'repair',
    taxCode: '0301234567',
    address: 'Số 123 Quốc lộ 1A, Bình Chánh, TP.HCM',
    contactPerson: 'Lê Văn Cường',
    phone: '028 3765 4321',
    email: 'hungcuong.garage@gmail.com',
    paymentTerms: 'Công nợ 7 ngày',
    creditLimit: 200000000,
    relatedCompanies: ['trsport'],
    status: 'active',
    notes: 'Đối tác sửa chữa nhanh tuyến miền Nam'
  },
  {
    id: 'vnd-8',
    code: 'SC-002',
    name: 'Trung tâm Dịch vụ Ô tô Đại Nam',
    shortName: 'Đại Nam Auto',
    category: 'repair',
    taxCode: '0101987654',
    address: 'Km 18 QL5, Gia Lâm, Hà Nội',
    contactPerson: 'Trần Văn Đại',
    phone: '024 3827 1234',
    email: 'dichvu@dainamauto.vn',
    paymentTerms: 'Công nợ 15 ngày',
    creditLimit: 300000000,
    relatedCompanies: ['trsport', 'lgts'],
    status: 'active',
    notes: 'Đối tác sửa chữa lớn khu vực Bắc'
  },
  {
    id: 'vnd-9',
    code: 'SC-003',
    name: 'Toyota Bến Thành - Xưởng dịch vụ',
    shortName: 'Toyota BT',
    category: 'repair',
    taxCode: '0300123456',
    address: 'Số 90 Nguyễn Văn Linh, Quận 7, TP.HCM',
    contactPerson: 'Nguyễn Văn Tùng',
    phone: '028 5411 1234',
    email: 'service@toyotabenthanh.com.vn',
    paymentTerms: 'Thanh toán ngay',
    relatedCompanies: ['trsport', 'x-maintenance'],
    status: 'active',
    notes: 'Sửa chữa chính hãng Toyota/Hino'
  },

  // ===== TRẠM DỪNG NGHỈ =====
  {
    id: 'vnd-10',
    code: 'TDN-001',
    name: 'Trạm dừng nghỉ Phú Bài',
    shortName: 'TDN Phú Bài',
    category: 'rest_stop',
    taxCode: '3301234567',
    address: 'Km 820 QL1A, Phú Bài, TT Huế',
    contactPerson: 'Lê Thị Hoa',
    phone: '0234 3861 234',
    email: 'tdnphubai@gmail.com',
    paymentTerms: 'Thanh toán ngay',
    relatedCompanies: ['trsport'],
    status: 'active',
    notes: 'Điểm nghỉ ngơi tài xế tuyến Bắc Nam'
  },
  {
    id: 'vnd-11',
    code: 'TDN-002',
    name: 'Trạm dừng nghỉ Ninh Bình',
    shortName: 'TDN Ninh Bình',
    category: 'rest_stop',
    taxCode: '2701234567',
    address: 'Km 95 QL1A, Ninh Bình',
    contactPerson: 'Hoàng Văn Sơn',
    phone: '0229 3889 567',
    email: 'tdnninhbinh@gmail.com',
    paymentTerms: 'Thanh toán ngay',
    relatedCompanies: ['trsport'],
    status: 'active',
    notes: 'Điểm nghỉ đêm tuyến Bắc'
  },

  // ===== ĐƠN VỊ CỨU HỘ =====
  {
    id: 'vnd-12',
    code: 'CH-001',
    name: 'Cứu hộ giao thông 24/7 Sài Gòn',
    shortName: 'Cứu hộ SG',
    category: 'rescue',
    taxCode: '0309876543',
    address: 'Số 45 Hòa Bình, Tân Phú, TP.HCM',
    contactPerson: 'Nguyễn Văn Hùng',
    phone: '1900 636 911',
    email: 'cuuho247saigon@gmail.com',
    paymentTerms: 'Thanh toán ngay',
    relatedCompanies: ['trsport', 'lgts'],
    status: 'active',
    notes: 'Cứu hộ khẩn cấp khu vực HCM'
  },
  {
    id: 'vnd-13',
    code: 'CH-002',
    name: 'Cứu hộ Đường dài Bắc Nam',
    shortName: 'CHDN Bắc Nam',
    category: 'rescue',
    taxCode: '0101234999',
    address: 'Số 10 Giảng Võ, Đống Đa, Hà Nội',
    contactPerson: 'Trần Văn Long',
    phone: '1900 545 456',
    email: 'cuuhobacnam@gmail.com',
    paymentTerms: 'Công nợ 7 ngày',
    creditLimit: 100000000,
    relatedCompanies: ['trsport'],
    status: 'active',
    notes: 'Cứu hộ tuyến đường dài Bắc Nam'
  },

  // ===== PHỤ TÙNG & VẬT TƯ =====
  {
    id: 'vnd-14',
    code: 'PT-001',
    name: 'Công ty TNHH Phụ tùng Ô tô Hòa Phát',
    shortName: 'Hòa Phát Auto',
    category: 'parts',
    taxCode: '0300987654',
    address: 'Số 567 Hồng Bàng, Quận 6, TP.HCM',
    contactPerson: 'Võ Văn Hòa',
    phone: '028 3751 2345',
    email: 'sales@hoaphat-auto.vn',
    paymentTerms: 'Công nợ 30 ngày',
    creditLimit: 500000000,
    discountRate: 8,
    relatedCompanies: ['x-maintenance'],
    status: 'active',
    notes: 'Nhà phân phối phụ tùng chính hãng'
  },
  {
    id: 'vnd-15',
    code: 'PT-002',
    name: 'Công ty Lốp xe Bridgestone Việt Nam',
    shortName: 'Bridgestone VN',
    category: 'parts',
    taxCode: '3600123456',
    address: 'KCN Đình Vũ, Hải Phòng',
    contactPerson: 'Ngô Văn Giang',
    phone: '0225 3828 888',
    email: 'sales@bridgestone.vn',
    paymentTerms: 'Công nợ 45 ngày',
    creditLimit: 800000000,
    discountRate: 12,
    relatedCompanies: ['x-maintenance', 'trsport'],
    status: 'active',
    notes: 'Lốp xe tải, bảo hành 3 năm'
  },

  // ===== CÔNG NGHỆ =====
  {
    id: 'vnd-16',
    code: 'CN-001',
    name: 'Viettel Business Solutions',
    shortName: 'Viettel BS',
    category: 'technology',
    taxCode: '0100109106',
    address: 'Số 1 Giang Văn Minh, Ba Đình, Hà Nội',
    contactPerson: 'Lê Minh Trí',
    phone: '024 6255 6789',
    email: 'gps@viettel.com.vn',
    paymentTerms: 'Hàng tháng',
    relatedCompanies: ['all'],
    status: 'active',
    notes: 'Dịch vụ GPS, giám sát hành trình'
  },

  // ===== CẢNG & LOGISTICS =====
  {
    id: 'vnd-17',
    code: 'CG-001',
    name: 'Công ty Cổ phần Cảng Cát Lái',
    shortName: 'Cảng Cát Lái',
    category: 'port',
    taxCode: '0301234000',
    address: 'Phường Cát Lái, Quận 2, TP.HCM',
    contactPerson: 'Võ Văn Khanh',
    phone: '028 3742 3456',
    email: 'contact@catlaport.vn',
    paymentTerms: 'Thanh toán ngay',
    relatedCompanies: ['trsport', 'lgts'],
    status: 'active',
    notes: 'Đối tác làm hàng container'
  },
  {
    id: 'vnd-18',
    code: 'CG-002',
    name: 'Cảng Hải Phòng - Chi nhánh Đình Vũ',
    shortName: 'Cảng Đình Vũ',
    category: 'port',
    taxCode: '0200123456',
    address: 'KCN Đình Vũ, Hải Phòng',
    contactPerson: 'Nguyễn Văn Hải',
    phone: '0225 3796 789',
    email: 'dinhvu@haiphongport.vn',
    paymentTerms: 'Thanh toán ngay',
    relatedCompanies: ['trsport', 'lgts'],
    status: 'active',
    notes: 'Cảng hàng XNK miền Bắc'
  }
];

// ============================================
// 13. DANH MỤC LOẠI CHI PHÍ (Expense Categories)
// Kiểm soát OPEX - Chi phí vận hành
// ============================================

export interface ExpenseCategory {
  id: string;
  code: string;
  name: string;
  category: 'direct' | 'indirect' | 'fixed' | 'variable';
  type: 'fuel' | 'toll' | 'maintenance' | 'labor' | 'parking' | 'insurance' | 'depreciation' | 'other';
  description: string;
  accountCode: string; // Mã tài khoản kế toán
  taxDeductible: boolean; // Được khấu trừ thuế
  requiresReceipt: boolean; // Yêu cầu chứng từ
  approvalRequired: boolean; // Cần phê duyệt
  maxAmountNoApproval?: number; // Mức tối đa không cần duyệt
  applicableCompanies: string[];
  status: 'active' | 'inactive';
}

export const mockExpenseCategories: ExpenseCategory[] = [
  // ===== CHI PHÍ NHIÊN LIỆU =====
  {
    id: 'exp-1',
    code: 'CP-NL-001',
    name: 'Chi phí Nhiên liệu (Dầu Diesel)',
    category: 'variable',
    type: 'fuel',
    description: 'Chi phí dầu diesel cho xe tải, xe đầu kéo, xe khách',
    accountCode: '6277',
    taxDeductible: true,
    requiresReceipt: true,
    approvalRequired: false,
    maxAmountNoApproval: 10000000,
    applicableCompanies: ['trsport', 'lgts', 'x-maintenance'],
    status: 'active'
  },
  {
    id: 'exp-2',
    code: 'CP-NL-002',
    name: 'Chi phí Nhiên liệu (Xăng)',
    category: 'variable',
    type: 'fuel',
    description: 'Chi phí xăng cho xe van, xe máy shipper',
    accountCode: '6277',
    taxDeductible: true,
    requiresReceipt: true,
    approvalRequired: false,
    maxAmountNoApproval: 5000000,
    applicableCompanies: ['x-express'],
    status: 'active'
  },

  // ===== CHI PHÍ CẦU ĐƯỜNG =====
  {
    id: 'exp-3',
    code: 'CP-CD-001',
    name: 'Phí Cầu đường BOT',
    category: 'variable',
    type: 'toll',
    description: 'Phí qua trạm BOT trên các tuyến quốc lộ, cao tốc',
    accountCode: '6278',
    taxDeductible: true,
    requiresReceipt: true,
    approvalRequired: false,
    maxAmountNoApproval: 5000000,
    applicableCompanies: ['trsport', 'lgts'],
    status: 'active'
  },
  {
    id: 'exp-4',
    code: 'CP-CD-002',
    name: 'Phí Cao tốc (ETC)',
    category: 'variable',
    type: 'toll',
    description: 'Phí cao tốc thanh toán qua thẻ ETC tự động',
    accountCode: '6278',
    taxDeductible: true,
    requiresReceipt: false,
    approvalRequired: false,
    applicableCompanies: ['trsport', 'lgts', 'x-express'],
    status: 'active'
  },
  {
    id: 'exp-5',
    code: 'CP-CD-003',
    name: 'Phí Phà, Cầu phao',
    category: 'variable',
    type: 'toll',
    description: 'Phí qua phà, cầu phao các tuyến sông',
    accountCode: '6278',
    taxDeductible: true,
    requiresReceipt: true,
    approvalRequired: false,
    applicableCompanies: ['trsport'],
    status: 'active'
  },

  // ===== CHI PHÍ SỬA CHỮA =====
  {
    id: 'exp-6',
    code: 'CP-SC-001',
    name: 'Chi phí Sửa chữa định kỳ',
    category: 'variable',
    type: 'maintenance',
    description: 'Bảo dưỡng định kỳ theo km: thay dầu, lọc, má phanh',
    accountCode: '6273',
    taxDeductible: true,
    requiresReceipt: true,
    approvalRequired: true,
    maxAmountNoApproval: 20000000,
    applicableCompanies: ['all'],
    status: 'active'
  },
  {
    id: 'exp-7',
    code: 'CP-SC-002',
    name: 'Chi phí Sửa chữa đột xuất',
    category: 'variable',
    type: 'maintenance',
    description: 'Sửa chữa hư hỏng phát sinh, tai nạn',
    accountCode: '6273',
    taxDeductible: true,
    requiresReceipt: true,
    approvalRequired: true,
    maxAmountNoApproval: 10000000,
    applicableCompanies: ['all'],
    status: 'active'
  },
  {
    id: 'exp-8',
    code: 'CP-SC-003',
    name: 'Chi phí Thay lốp xe',
    category: 'variable',
    type: 'maintenance',
    description: 'Thay lốp xe định kỳ hoặc hư hỏng',
    accountCode: '6273',
    taxDeductible: true,
    requiresReceipt: true,
    approvalRequired: true,
    applicableCompanies: ['trsport', 'lgts'],
    status: 'active'
  },

  // ===== CHI PHÍ TÀI XẾ =====
  {
    id: 'exp-9',
    code: 'CP-TX-001',
    name: 'Chi phí Ăn ca tài xế',
    category: 'variable',
    type: 'labor',
    description: 'Phụ cấp ăn ca cho tài xế theo chuyến',
    accountCode: '6274',
    taxDeductible: true,
    requiresReceipt: false,
    approvalRequired: false,
    maxAmountNoApproval: 500000,
    applicableCompanies: ['trsport', 'lgts'],
    status: 'active'
  },
  {
    id: 'exp-10',
    code: 'CP-TX-002',
    name: 'Chi phí Lưu trú tài xế',
    category: 'variable',
    type: 'labor',
    description: 'Phụ cấp ngủ đêm, nghỉ trạm cho tài xế đường dài',
    accountCode: '6274',
    taxDeductible: true,
    requiresReceipt: true,
    approvalRequired: false,
    maxAmountNoApproval: 300000,
    applicableCompanies: ['trsport'],
    status: 'active'
  },
  {
    id: 'exp-11',
    code: 'CP-TX-003',
    name: 'Chi phí Bốc xếp',
    category: 'variable',
    type: 'labor',
    description: 'Chi phí thuê bốc xếp hàng hóa tại điểm giao nhận',
    accountCode: '6275',
    taxDeductible: true,
    requiresReceipt: true,
    approvalRequired: false,
    maxAmountNoApproval: 1000000,
    applicableCompanies: ['trsport', 'lgts'],
    status: 'active'
  },

  // ===== CHI PHÍ BẾN BÃI =====
  {
    id: 'exp-12',
    code: 'CP-BB-001',
    name: 'Phí Bến bãi đỗ xe',
    category: 'variable',
    type: 'parking',
    description: 'Phí đỗ xe tại bến xe, bãi xe công cộng',
    accountCode: '6278',
    taxDeductible: true,
    requiresReceipt: true,
    approvalRequired: false,
    maxAmountNoApproval: 500000,
    applicableCompanies: ['trsport'],
    status: 'active'
  },
  {
    id: 'exp-13',
    code: 'CP-BB-002',
    name: 'Phí Lưu kho, lưu bãi',
    category: 'variable',
    type: 'parking',
    description: 'Phí lưu container, lưu hàng tại cảng/kho',
    accountCode: '6278',
    taxDeductible: true,
    requiresReceipt: true,
    approvalRequired: true,
    applicableCompanies: ['trsport', 'lgts'],
    status: 'active'
  },
  {
    id: 'exp-14',
    code: 'CP-BB-003',
    name: 'Phí Nâng hạ Container',
    category: 'variable',
    type: 'parking',
    description: 'Phí nâng hạ container tại cảng, ICD',
    accountCode: '6278',
    taxDeductible: true,
    requiresReceipt: true,
    approvalRequired: false,
    applicableCompanies: ['trsport', 'lgts'],
    status: 'active'
  },

  // ===== CHI PHÍ CỐ ĐỊNH =====
  {
    id: 'exp-15',
    code: 'CP-BH-001',
    name: 'Chi phí Bảo hiểm xe',
    category: 'fixed',
    type: 'insurance',
    description: 'Bảo hiểm trách nhiệm dân sự, bảo hiểm vật chất xe',
    accountCode: '6276',
    taxDeductible: true,
    requiresReceipt: true,
    approvalRequired: true,
    applicableCompanies: ['all'],
    status: 'active'
  },
  {
    id: 'exp-16',
    code: 'CP-KH-001',
    name: 'Chi phí Khấu hao xe',
    category: 'fixed',
    type: 'depreciation',
    description: 'Khấu hao tài sản cố định - phương tiện vận tải',
    accountCode: '6274',
    taxDeductible: true,
    requiresReceipt: false,
    approvalRequired: false,
    applicableCompanies: ['all'],
    status: 'active'
  },
  {
    id: 'exp-17',
    code: 'CP-DK-001',
    name: 'Phí Đăng kiểm xe',
    category: 'fixed',
    type: 'other',
    description: 'Phí đăng kiểm định kỳ hàng năm',
    accountCode: '6278',
    taxDeductible: true,
    requiresReceipt: true,
    approvalRequired: false,
    applicableCompanies: ['all'],
    status: 'active'
  },

  // ===== CHI PHÍ KHÁC =====
  {
    id: 'exp-18',
    code: 'CP-CK-001',
    name: 'Chi phí Cứu hộ xe',
    category: 'variable',
    type: 'other',
    description: 'Chi phí kéo xe, cứu hộ khi xe hư hỏng trên đường',
    accountCode: '6278',
    taxDeductible: true,
    requiresReceipt: true,
    approvalRequired: true,
    applicableCompanies: ['trsport', 'lgts'],
    status: 'active'
  },
  {
    id: 'exp-19',
    code: 'CP-TTHQ-001',
    name: 'Phí Thủ tục Hải quan',
    category: 'variable',
    type: 'other',
    description: 'Phí làm thủ tục XNK, khai báo hải quan',
    accountCode: '6278',
    taxDeductible: true,
    requiresReceipt: true,
    approvalRequired: true,
    applicableCompanies: ['lgts'],
    status: 'active'
  },
  {
    id: 'exp-20',
    code: 'CP-GPS-001',
    name: 'Phí Dịch vụ GPS/Giám sát',
    category: 'fixed',
    type: 'other',
    description: 'Phí thuê bao dịch vụ giám sát hành trình GPS',
    accountCode: '6278',
    taxDeductible: true,
    requiresReceipt: true,
    approvalRequired: false,
    applicableCompanies: ['trsport', 'lgts', 'x-express'],
    status: 'active'
  }
];
