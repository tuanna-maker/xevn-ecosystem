/**
 * X-BOS Unified Portal — mock dữ liệu Command Center (SRS_X_BOS_UNIFIED_PORTAL_COMMAND_CENTER).
 * Dùng tên thật giả định; không dùng "Test 1", "Name 1".
 */

export type PersonaRole = 'bod' | 'manager' | 'employee';

export type PortalStatusNormalized =
  | 'OPEN'
  | 'IN_PROGRESS'
  | 'PENDING_APPROVAL'
  | 'DONE'
  | 'CANCELLED';

export interface RailModuleItem {
  moduleCode: string;
  label: string;
  /** Đường dẫn nội bộ portal (mock) */
  href: string;
  allowedRoles: PersonaRole[];
  disabled?: boolean;
  disabledReason?: string;
}

export interface UnifiedTask {
  cardId: string;
  sourceSystem: string;
  sourceId: string;
  dedupeKey: string;
  statusNormalized: PortalStatusNormalized;
  orgUnitId: string;
  moduleCode: string;
  title: string;
  subtitle?: string;
  assigneeUserId: string;
  assigneeName: string;
  dueAt?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface PortalAlert {
  id: string;
  moduleCode: string;
  orgUnitId: string;
  level: 'info' | 'warn' | 'critical';
  title: string;
  detail: string;
  sourceSystem: string;
}

export interface KpiSparkPoint {
  label: string;
  value: number;
}

export interface CommandCenterWorkspaceMeta {
  asOf: string;
  dataSyncNote?: string;
}

/** Org scope theo persona mock */
const MANAGER_SCOPE_ROOT = 'div-001';
const EMPLOYEE_ID = 'emp-van-an';

export const mockCommandCenterMeta: CommandCenterWorkspaceMeta = {
  asOf: '2025-03-27T14:32:00+07:00',
  dataSyncNote: 'Dữ liệu hội tụ theo lô — làm mới gần nhất',
};

/**
 * Thanh rail trái Command Center — thứ tự & nhãn khớp sơ đồ phân tầng (GROUP → … → Cài đặt).
 * moduleCode nội bộ: `business` lọc task theo `x-bos`; `system` mở workspace Cài đặt hệ thống.
 */
export const mockRailModules: RailModuleItem[] = [
  {
    moduleCode: 'group',
    label: 'GROUP',
    href: '/command-center',
    allowedRoles: ['bod', 'manager', 'employee'],
  },
  {
    moduleCode: 'finance',
    label: 'TÀI CHÍNH',
    href: '/dashboard/customers',
    allowedRoles: ['bod', 'manager'],
  },
  {
    moduleCode: 'accounting',
    label: 'KẾ TOÁN',
    href: '/dashboard/kpi-dashboard',
    allowedRoles: ['bod', 'manager'],
  },
  {
    moduleCode: 'hrm',
    label: 'NHÂN SỰ',
    href: '/dashboard/hr',
    allowedRoles: ['bod', 'manager'],
  },
  {
    moduleCode: 'business',
    label: 'KINH DOANH',
    href: '/dashboard/kpi-dashboard',
    allowedRoles: ['bod', 'manager', 'employee'],
  },
  {
    moduleCode: 'fleet',
    label: 'VẬN HÀNH',
    href: '/dashboard/organization',
    allowedRoles: ['bod', 'manager', 'employee'],
  },
  {
    moduleCode: 'system',
    label: 'CÀI ĐẶT HỆ THỐNG',
    href: '/command-center',
    allowedRoles: ['bod', 'manager', 'employee'],
  },
];

export const mockUnifiedTasks: UnifiedTask[] = [
  {
    cardId: 'cc-001',
    sourceSystem: 'X-BOS',
    sourceId: 'kpi-alloc-2409',
    dedupeKey: 'X-BOS:kpi-alloc-2409',
    statusNormalized: 'PENDING_APPROVAL',
    orgUnitId: 'dept-001',
    moduleCode: 'x-bos',
    title: 'Phê duyệt phân bổ KPI Q2 — Phòng Điều phối',
    subtitle: 'Gói phân bổ từ khối Vận tải',
    assigneeUserId: 'emp-truong-phong-dp',
    assigneeName: 'Lê Thị Trưởng phòng',
    dueAt: '2025-03-28T17:00:00+07:00',
    priority: 'high',
  },
  {
    cardId: 'cc-002',
    sourceSystem: 'HRM',
    sourceId: 'leave-8841',
    dedupeKey: 'HRM:leave-8841',
    statusNormalized: 'IN_PROGRESS',
    orgUnitId: 'dept-001',
    moduleCode: 'hrm',
    title: 'Hoàn tất xác nhận nghỉ phép — Nguyễn Minh Tuấn',
    subtitle: 'Đơn nghỉ có chồng lịch ca trực',
    assigneeUserId: 'emp-truong-phong-dp',
    assigneeName: 'Lê Thị Trưởng phòng',
    dueAt: '2025-03-27T18:00:00+07:00',
    priority: 'medium',
  },
  {
    cardId: 'cc-003',
    sourceSystem: 'FleetOps',
    sourceId: 'maint-552',
    dedupeKey: 'FleetOps:maint-552',
    statusNormalized: 'OPEN',
    orgUnitId: 'dept-003',
    moduleCode: 'fleet',
    title: 'Lên lịch bảo dưỡng định kỳ — đội xe Miền Trung',
    subtitle: 'Xe tải biển số 51H-902xx vượt ngưỡng km',
    assigneeUserId: 'emp-van-hanh',
    assigneeName: 'Phạm Quốc Vận hành',
    dueAt: '2025-03-29T12:00:00+07:00',
    priority: 'high',
  },
  {
    cardId: 'cc-004',
    sourceSystem: 'X-BOS',
    sourceId: 'policy-scan-112',
    dedupeKey: 'X-BOS:policy-scan-112',
    statusNormalized: 'IN_PROGRESS',
    orgUnitId: 'dept-002',
    moduleCode: 'x-bos',
    title: 'Rà soát đề xuất thưởng/phạt — tháng 3',
    subtitle: 'Có 4 nhân sự chờ phê duyệt cuối',
    assigneeUserId: 'emp-kd',
    assigneeName: 'Trần Thị Kinh doanh',
    dueAt: '2025-03-30T09:00:00+07:00',
    priority: 'medium',
  },
  {
    cardId: 'cc-005',
    sourceSystem: 'FleetOps',
    sourceId: 'trip-approve-991',
    dedupeKey: 'FleetOps:trip-approve-991',
    statusNormalized: 'PENDING_APPROVAL',
    orgUnitId: 'dept-001',
    moduleCode: 'fleet',
    title: 'Duyệt lệnh chạy xe — chuyến HCM — Đà Nẵng',
    subtitle: 'Tài xế: Đỗ Văn Long',
    assigneeUserId: EMPLOYEE_ID,
    assigneeName: 'Vũ Thị Vân An',
    dueAt: '2025-03-27T16:00:00+07:00',
    priority: 'critical',
  },
  {
    cardId: 'cc-006',
    sourceSystem: 'HRM',
    sourceId: 'contract-extend-220',
    dedupeKey: 'HRM:contract-extend-220',
    statusNormalized: 'OPEN',
    orgUnitId: 'dept-002',
    moduleCode: 'hrm',
    title: 'Gia hạn hợp đồng — nhóm kinh doanh khu vực',
    subtitle: 'Hết hạn 15/04/2025',
    assigneeUserId: 'emp-hr-bp',
    assigneeName: 'Hoàng Nhân sự',
    dueAt: '2025-04-10T00:00:00+07:00',
    priority: 'low',
  },
  {
    cardId: 'cc-007',
    sourceSystem: 'FinanceCore',
    sourceId: 'cf-approve-441',
    dedupeKey: 'FinanceCore:cf-approve-441',
    statusNormalized: 'PENDING_APPROVAL',
    orgUnitId: 'dept-001',
    moduleCode: 'finance',
    title: 'Phê duyệt giải ngân quý — ngân sách vận hành Miền Nam',
    subtitle: 'Gói chi phí nhiên liệu Q1',
    assigneeUserId: 'emp-truong-phong-dp',
    assigneeName: 'Lê Thị Trưởng phòng',
    dueAt: '2025-03-29T10:00:00+07:00',
    priority: 'medium',
  },
  {
    cardId: 'cc-008',
    sourceSystem: 'GL',
    sourceId: 'close-0325',
    dedupeKey: 'GL:close-0325',
    statusNormalized: 'IN_PROGRESS',
    orgUnitId: 'dept-002',
    moduleCode: 'accounting',
    title: 'Đối soát bút toán cuối kỳ — chi nhánh Hà Nội',
    subtitle: 'Chênh lệch tạm tính 12,4 triệu đồng',
    assigneeUserId: 'emp-kd',
    assigneeName: 'Trần Thị Kinh doanh',
    dueAt: '2025-03-31T18:00:00+07:00',
    priority: 'high',
  },
];

export const mockPortalAlerts: PortalAlert[] = [
  {
    id: 'al-01',
    moduleCode: 'fleet',
    orgUnitId: 'dept-003',
    level: 'critical',
    title: 'SLA xử lý sự cố vượt 4 giờ',
    detail: 'Ticket #OPS-883 — kho Đà Nẵng',
    sourceSystem: 'FleetOps',
  },
  {
    id: 'al-02',
    moduleCode: 'x-bos',
    orgUnitId: 'dept-002',
    level: 'warn',
    title: 'KPI doanh thu nhóm KD dưới ngưỡng 92%',
    detail: 'Kỳ hiện tại — cần hành động khắc phục',
    sourceSystem: 'X-BOS',
  },
  {
    id: 'al-03',
    moduleCode: 'hrm',
    orgUnitId: 'dept-001',
    level: 'info',
    title: 'Nhắc lịch họp an toàn lao động tuần tới',
    detail: 'Phòng Điều phối — 08:30 thứ Hai',
    sourceSystem: 'HRM',
  },
];

/** Điểm KPI tổng hợp tập đoàn (% hoàn thành mục tiêu) — 8 kỳ */
export const mockKpiSparklineBod: KpiSparkPoint[] = [
  { label: 'T1', value: 82 },
  { label: 'T2', value: 85 },
  { label: 'T3', value: 88 },
  { label: 'T4', value: 87 },
  { label: 'T5', value: 90 },
  { label: 'T6', value: 91 },
  { label: 'T7', value: 92 },
  { label: 'T8', value: 93 },
];

/** Chuỗi KPI cá nhân nhân viên Vân An */
export const mockKpiSparklineEmployee: KpiSparkPoint[] = [
  { label: 'T1', value: 76 },
  { label: 'T2', value: 78 },
  { label: 'T3', value: 81 },
  { label: 'T4', value: 84 },
  { label: 'T5', value: 86 },
  { label: 'T6', value: 88 },
  { label: 'T7', value: 89 },
  { label: 'T8', value: 91 },
];

const IN_PROGRESS: PortalStatusNormalized[] = ['OPEN', 'IN_PROGRESS', 'PENDING_APPROVAL'];

function orgInManagerScope(orgUnitId: string): boolean {
  const underDispatch = ['dept-001', 'div-001'];
  return underDispatch.includes(orgUnitId);
}

export function filterTasksByPersona(tasks: UnifiedTask[], persona: PersonaRole): UnifiedTask[] {
  if (persona === 'bod') return tasks;
  if (persona === 'manager') {
    return tasks.filter((t) => orgInManagerScope(t.orgUnitId));
  }
  return tasks.filter((t) => t.assigneeUserId === EMPLOYEE_ID);
}

export function filterAlertsByPersona(alerts: PortalAlert[], persona: PersonaRole): PortalAlert[] {
  if (persona === 'bod') return alerts;
  if (persona === 'manager') {
    return alerts.filter((a) => orgInManagerScope(a.orgUnitId));
  }
  return alerts.filter((a) => a.orgUnitId === 'dept-001' && a.level !== 'info');
}

export function filterRailByRole(modules: RailModuleItem[], persona: PersonaRole): RailModuleItem[] {
  return modules.map((m) => {
    const allowed = m.allowedRoles.includes(persona);
    if (!allowed) {
      return {
        ...m,
        disabled: true,
        disabledReason: 'Bạn không có quyền truy cập phân hệ này',
      };
    }
    return { ...m };
  });
}

export function countInProgressByModule(
  tasks: UnifiedTask[],
  moduleCode: string | 'all',
): number {
  const list =
    moduleCode === 'all'
      ? tasks
      : tasks.filter((t) => t.moduleCode === moduleCode);
  return list.filter((t) => IN_PROGRESS.includes(t.statusNormalized)).length;
}

export function getKpiSeriesForPersona(persona: PersonaRole): KpiSparkPoint[] {
  if (persona === 'employee') return mockKpiSparklineEmployee;
  return mockKpiSparklineBod;
}

export { MANAGER_SCOPE_ROOT, EMPLOYEE_ID };
