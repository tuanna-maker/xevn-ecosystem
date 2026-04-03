export interface ExecutiveDashboardStats {
  totalRevenue: number;  // in VND
  revenueTrend: number;  // percentage
  grossProfit: number;    // in VND
  grossMargin: number;    // percentage
  fleetHealth: number;    // percentage
  policyCompliance: number; // percentage
  totalEmployees: number;
  employeeChange: number; // percentage
  availableVehicles: number;
}

export interface ModuleCardData {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  gradientStart?: string;
  gradientEnd?: string;
  status: 'success' | 'warning' | 'danger';
  stats: {
    label: string;
    value: string | number;
  }[];
}

export interface AlertItem {
  id: string;
  message: string;
  priority: 'high' | 'medium' | 'low';
  time: string;
}

export const mockExecutiveDashboardStats: ExecutiveDashboardStats = {
  totalRevenue: 1300000000000,  // 1.3 Tỷ VND
  revenueTrend: 8.5,
  grossProfit: 440000000000,    // 0.44 Tỷ VND
  grossMargin: 33.6,
  fleetHealth: 87.4,
  policyCompliance: 92.1,
  totalEmployees: 4850,
  employeeChange: 12,
  availableVehicles: 2850,
};

export const mockModuleCards: ModuleCardData[] = [
  {
    id: 'x-bos',
    title: 'X-BOS',
    subtitle: 'Holding Core - Quản trị tập đoàn',
    icon: 'x-bos',
    gradientStart: '#1e293b',
    gradientEnd: '#0f172a',
    status: 'success',
    stats: [
      { label: 'Đơn vị thành viên', value: '4 công ty' },
      { label: 'Tổng nhân sự', value: '4,850' },
      { label: 'Phòng ban', value: '28' },
      { label: 'KPI đang theo dõi', value: '142' },
    ],
  },
  {
    id: 'trsport',
    title: 'TRSPORT',
    subtitle: 'Vận tải hành khách & hàng hóa',
    icon: 'trsport',
    gradientStart: '#1e3a8a',
    gradientEnd: '#1e40af',
    status: 'success',
    stats: [
      { label: 'Tài xế', value: '380' },
      { label: 'Xe đang chạy', value: '145 chuyến/ngày' },
      { label: 'Tuyến hoạt động', value: '12' },
      { label: 'Tỷ lệ lấp đầy', value: '82%' },
    ],
  },
  {
    id: 'lgs',
    title: 'LGTS',
    subtitle: 'Kho bãi & Chuỗi cung ứng',
    icon: 'lgs',
    gradientStart: '#0891b2',
    gradientEnd: '#0e7490',
    status: 'success',
    stats: [
      { label: 'Tỷ lệ lấp đầy kho', value: '78%' },
      { label: 'Đơn hàng xử lý', value: '1,240/tháng' },
      { label: 'HUB hoạt động', value: '3' },
      { label: 'Nhân sự kho', value: '85' },
    ],
  },
  {
    id: 'express',
    title: 'EXPRESS',
    subtitle: 'Chuyển phát nhanh',
    icon: 'express',
    gradientStart: '#7c2d12',
    gradientEnd: '#991b1b',
    status: 'warning',
    stats: [
      { label: 'Đơn hàng/ngày', value: '28,500' },
      { label: 'Tỷ lệ giao đúng hạn', value: '98.2%' },
      { label: 'Khu vực phục vụ', value: '63 tỉnh' },
      { label: 'Tỷ lệ khiếu nại', value: '1.2%' },
    ],
  },
  {
    id: 'x-scm',
    title: 'X-SCM',
    subtitle: 'Chuỗi cung ứng & Logistics',
    icon: 'x-scm',
    gradientStart: '#3730a3',
    gradientEnd: '#312e81',
    status: 'warning',
    stats: [
      { label: 'Nhà cung cấp', value: '127 đối tác' },
      { label: 'Tỷ lệ giao đúng hạn', value: '94.7%' },
      { label: 'Chi phí logistics', value: '8.2%' },
      { label: 'Số lượng SKU', value: '4,210' },
    ],
  },
  {
    id: 'x-office',
    title: 'X-OFFICE',
    subtitle: 'Văn phòng - Trình ký điện tử',
    icon: 'x-office',
    gradientStart: '#1f2937',
    gradientEnd: '#111827',
    status: 'success',
    stats: [
      { label: 'Hồ sơ xử lý', value: '18,500/tháng' },
      { label: 'Người dùng hoạt động', value: '3,200' },
      { label: 'Tỷ lệ ký điện tử', value: '96.8%' },
    ],
  },
  {
    id: 'x-finance',
    title: 'X-FINANCE',
    subtitle: 'Tài chính & Kế toán',
    icon: 'x-finance',
    gradientStart: '#14532d',
    gradientEnd: '#166534',
    status: 'danger',
    stats: [
      { label: 'Doanh thu thuần', value: '1,250 tỷ' },
      { label: 'Tỷ lệ thanh toán', value: '92.3%' },
      { label: 'Số hóa đơn', value: '28,500/tháng' },
    ],
  },
  {
    id: 'hrm',
    title: 'HRM',
    subtitle: 'Nhân sự & Đào tạo',
    icon: 'hrm',
    gradientStart: '#831843',
    gradientEnd: '#9d174d',
    status: 'warning',
    stats: [
      { label: 'Đang tuyển', value: '15 vị trí' },
      { label: 'Tài xế mới', value: '8/tháng' },
      { label: 'Đào tạo tháng', value: '45 lượt' },
      { label: 'Tỷ lệ nghỉ việc', value: '3.5%' },
    ],
  },
  {
    id: 'crm',
    title: 'CRM',
    subtitle: 'Quản trị Khách hàng',
    icon: 'crm',
    gradientStart: '#7c2d92',
    gradientEnd: '#581c87',
    status: 'success',
    stats: [
      { label: 'Hợp đồng mới', value: '15' },
      { label: 'Khách hàng VIP', value: '28' },
      { label: 'Tỷ lệ giữ chân', value: '94%' },
    ],
  },
  {
    id: 'x-maintenance',
    title: 'X-Maintenance',
    subtitle: 'Bảo trì & Sửa chữa phương tiện',
    icon: 'x-maintenance',
    gradientStart: '#92400e',
    gradientEnd: '#78350f',
    status: 'danger',
    stats: [
      { label: 'Xe đang sửa', value: '18' },
      { label: 'Xe quá hạn', value: '5' },
      { label: 'Kỹ thuật viên', value: '35' },
      { label: 'Thời gian sửa TB', value: '4.2 giờ' },
    ],
  },
];

export const mockAlerts: AlertItem[] = [
  {
    id: '1',
    message: 'Xe tuyến Lào vượt định mức tiêu hao nhiên liệu 18%',
    priority: 'high',
    time: '2 phút trước'
  },
  {
    id: '2',
    message: 'Chi phí logistics tại LGTS vượt ngưỡng 8.5% doanh thu',
    priority: 'high',
    time: '15 phút trước'
  },
  {
    id: '3',
    message: 'Tỷ lệ tuân thủ quy trình tại X-BOS giảm còn 89.2%',
    priority: 'medium',
    time: '30 phút trước'
  },
  {
    id: '4',
    message: 'Tỷ lệ nghỉ việc tại HRM tăng lên 4.8% trong Q1/2026',
    priority: 'high',
    time: '1 giờ trước'
  },
  {
    id: '5',
    message: 'Hệ thống trình ký điện tử X-OFFICE gặp sự cố tại 3 chi nhánh miền Trung',
    priority: 'high',
    time: '2 giờ trước'
  },
  {
    id: '6',
    message: 'Đơn hàng giao chậm tuyến TP.HCM - Vũng Tàu tăng 12%',
    priority: 'medium',
    time: '3 giờ trước'
  },
  {
    id: '7',
    message: 'Xe container tuyến Bắc Nam gặp sự cố kỹ thuật',
    priority: 'high',
    time: '5 giờ trước'
  },
];