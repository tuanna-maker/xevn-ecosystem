export interface Customer {
  id: string;
  code: string;
  name: string;
  type: 'corporate' | 'individual';
  industry: string;
  contactPerson: string;
  phone: string;
  totalOrders: number;
  totalRevenue: number;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface Partner {
  id: string;
  code: string;
  name: string;
  type: 'supplier' | 'distributor' | 'service';
  industry: string;
  contactPerson: string;
  phone: string;
  totalContracts: number;
  totalValue: number;
  status: 'active' | 'inactive' | 'pending';
  createdAt: string;
}

export interface Employee {
  id: string;
  code: string;
  fullName: string;
  position: string;
  department: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive' | 'on-leave' | 'terminated';
  employmentType: 'full-time' | 'part-time' | 'contract';
  joinDate: string;
  salary: number;
}

export interface OrganizationNode {
  id: string;
  name: string;
  type: 'company' | 'division' | 'department' | 'team';
  manager?: string;
  employees: number;
  children?: OrganizationNode[];
}

export interface KPI {
  id: string;
  name: string;
  description: string;
  category: string;
  target: number;
  unit: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  status: 'active' | 'inactive';
  owner: string;
}

export interface Module {
  id: string;
  name: string;
  description: string;
  icon: string;
  status: 'active' | 'inactive' | 'maintenance';
  version: string;
  lastUpdated: string;
}

/** Cấp bậc pháp nhân — 3 lựa chọn; chỉ công ty mẹ không có đơn vị trực thuộc */
export type EntityLevelCode = 'parent' | 'subsidiary' | 'affiliate';

export const ENTITY_LEVEL_LABELS: Record<EntityLevelCode, string> = {
  parent: 'Công ty mẹ',
  subsidiary: 'Công ty con',
  affiliate: 'Công ty liên kết',
};

/** Thứ tự cố định trong select (không dùng Object.keys) */
export const ENTITY_LEVEL_SELECT_ORDER: readonly EntityLevelCode[] = [
  'parent',
  'subsidiary',
  'affiliate',
] as const;

export interface Company {
  id: string;
  code: string;
  name: string;
  employeeCount: number;
  revenue: number;
  status: 'active' | 'inactive';
  address: string;
  establishedDate: string;
  /** Phân cấp pháp nhân (Command Center / Thiết lập công ty) */
  entityLevel?: EntityLevelCode;
  /** id pháp nhân cha trong danh sách (null/undefined nếu gốc) */
  parentEntityId?: string | null;
}

export const mockCompanies: Company[] = [
  {
    id: 'comp-001',
    code: 'XEVN-HQ',
    name: 'Tập đoàn XEVN',
    employeeCount: 1200,
    revenue: 5000000000000,
    status: 'active',
    address: '123 Đường ABC, Quận 1, TP.HCM',
    establishedDate: '2010-01-15',
    entityLevel: 'parent',
    parentEntityId: null,
  },
  {
    id: 'comp-002',
    code: 'XEVN-HN',
    name: 'Công ty XEVN Hà Nội',
    employeeCount: 350,
    revenue: 1500000000000,
    status: 'active',
    address: '456 Đường XYZ, Quận Cầu Giấy, Hà Nội',
    establishedDate: '2015-03-20',
    entityLevel: 'subsidiary',
    parentEntityId: 'comp-001',
  },
  {
    id: 'comp-003',
    code: 'XEVN-DA',
    name: 'Công ty XEVN Đà Nẵng',
    employeeCount: 180,
    revenue: 800000000000,
    status: 'active',
    address: '789 Đường DEF, Quận Hải Châu, Đà Nẵng',
    establishedDate: '2018-06-10',
    entityLevel: 'subsidiary',
    parentEntityId: 'comp-001',
  },
  {
    id: 'comp-004',
    code: 'XEVN-CT',
    name: 'Công ty XEVN Cần Thơ',
    employeeCount: 120,
    revenue: 500000000000,
    status: 'active',
    address: '321 Đường GHI, Quận Ninh Kiều, Cần Thơ',
    establishedDate: '2020-09-05',
    entityLevel: 'subsidiary',
    parentEntityId: 'comp-002',
  },
];

export const mockCustomers: Customer[] = [
  {
    id: 'cust-001',
    code: 'CUST-001',
    name: 'Công ty TNHH Vận Tải Việt Nam',
    type: 'corporate',
    industry: 'Vận tải',
    contactPerson: 'Nguyễn Văn A',
    phone: '0909123456',
    totalOrders: 47,
    totalRevenue: 1250000000,
    status: 'active',
    createdAt: '2024-01-15',
  },
  {
    id: 'cust-002',
    code: 'CUST-002',
    name: 'Công ty CP Logistics Hà Nội',
    type: 'corporate',
    industry: 'Logistics',
    contactPerson: 'Trần Thị B',
    phone: '0912345678',
    totalOrders: 32,
    totalRevenue: 890000000,
    status: 'active',
    createdAt: '2024-02-20',
  },
  {
    id: 'cust-003',
    code: 'CUST-003',
    name: 'Cá nhân Lê Văn C',
    type: 'individual',
    industry: 'Bán lẻ',
    contactPerson: 'Lê Văn C',
    phone: '0987654321',
    totalOrders: 15,
    totalRevenue: 450000000,
    status: 'active',
    createdAt: '2024-03-10',
  },
  // Add more mock customers as needed
];

export const mockPartners: Partner[] = [
  {
    id: 'part-001',
    code: 'PART-001',
    name: 'Công ty TNHH Nhà cung cấp ABC',
    type: 'supplier',
    industry: 'Nguyên vật liệu',
    contactPerson: 'Phạm Văn D',
    phone: '0911111111',
    totalContracts: 12,
    totalValue: 2500000000,
    status: 'active',
    createdAt: '2023-12-01',
  },
  {
    id: 'part-002',
    code: 'PART-002',
    name: 'Công ty CP Phân phối XYZ',
    type: 'distributor',
    industry: 'Thiết bị',
    contactPerson: 'Ngô Thị E',
    phone: '0922222222',
    totalContracts: 8,
    totalValue: 1800000000,
    status: 'active',
    createdAt: '2024-01-15',
  },
  // Add more mock partners as needed
];

export const mockEmployees: Employee[] = [
  {
    id: 'emp-001',
    code: 'EMP-001',
    fullName: 'Nguyễn Văn Quản lý',
    position: 'Giám đốc',
    department: 'Ban Giám đốc',
    email: 'quanly@xevn.vn',
    phone: '0901111111',
    status: 'active',
    employmentType: 'full-time',
    joinDate: '2020-01-15',
    salary: 50000000,
  },
  {
    id: 'emp-002',
    code: 'EMP-002',
    fullName: 'Trần Thị Nhân viên',
    position: 'Chuyên viên',
    department: 'Phòng Kinh doanh',
    email: 'nhanvien@xevn.vn',
    phone: '0902222222',
    status: 'active',
    employmentType: 'full-time',
    joinDate: '2023-03-20',
    salary: 15000000,
  },
  // Add more mock employees as needed
];

export const mockOrgStructure: OrganizationNode[] = [
  {
    id: 'comp-001',
    name: 'Tập đoàn XEVN',
    type: 'company',
    manager: 'Nguyễn Văn Giám đốc',
    employees: 1200,
    children: [
      {
        id: 'div-001',
        name: 'Khối Vận tải',
        type: 'division',
        manager: 'Trần Văn Phó giám đốc',
        employees: 450,
        children: [
          {
            id: 'dept-001',
            name: 'Phòng Điều phối',
            type: 'department',
            manager: 'Lê Thị Trưởng phòng',
            employees: 150,
          },
          {
            id: 'dept-002',
            name: 'Phòng Kinh doanh',
            type: 'department',
            manager: 'Phạm Văn Trưởng phòng',
            employees: 120,
          },
        ],
      },
      {
        id: 'div-002',
        name: 'Khối Dịch vụ',
        type: 'division',
        manager: 'Ngô Văn Phó giám đốc',
        employees: 300,
        children: [
          {
            id: 'dept-003',
            name: 'Phòng Bảo trì',
            type: 'department',
            manager: 'Vũ Thị Trưởng phòng',
            employees: 100,
          },
        ],
      },
    ],
  },
];

export const mockKPIs: KPI[] = [
  {
    id: 'kpi-001',
    name: 'Doanh thu tháng',
    description: 'Tổng doanh thu hàng tháng của tập đoàn',
    category: 'Kinh doanh',
    target: 5000000000,
    unit: 'VNĐ',
    frequency: 'monthly',
    status: 'active',
    owner: 'Phòng Kinh doanh',
  },
  {
    id: 'kpi-002',
    name: 'Số lượng đơn hàng',
    description: 'Tổng số đơn hàng hoàn thành trong tháng',
    category: 'Kinh doanh',
    target: 500,
    unit: 'đơn',
    frequency: 'monthly',
    status: 'active',
    owner: 'Phòng Kinh doanh',
  },
  // Add more mock KPIs as needed
];

export const mockModules: Module[] = [
  {
    id: 'mod-001',
    name: 'HRM',
    description: 'Hệ thống quản lý nhân sự',
    icon: 'User',
    status: 'active',
    version: '2.1.0',
    lastUpdated: '2024-03-15',
  },
  {
    id: 'mod-002',
    name: 'TRSPORT',
    description: 'Hệ thống vận tải',
    icon: 'Truck',
    status: 'active',
    version: '1.5.2',
    lastUpdated: '2024-03-10',
  },
  // Add more mock modules as needed
];

export * from './command-center-mock';