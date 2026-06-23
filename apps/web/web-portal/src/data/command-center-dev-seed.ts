/**

 * Dev-only Command Center seed rows — import only from strict-mode resolvers (M-CC-13).

 * Never import from page components.

 */

import { allowMockFallback } from '../utils/mockPolicy';

import type {

  KpiSparkPoint,

  PersonaRole,

  PortalAlert,

  UnifiedTask,

} from './command-center-types';



const MANAGER_SCOPE_ROOT = 'div-001';

const EMPLOYEE_ID = 'emp-van-an';



/** @internal dev seed — never import outside strict-mode resolver */

const DEV_MOCK_UNIFIED_TASKS: UnifiedTask[] = [

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



/** @internal dev seed — never import outside strict-mode resolver */

const DEV_MOCK_PORTAL_ALERTS: PortalAlert[] = [

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



const DEV_KPI_SPARKLINE_BOD: KpiSparkPoint[] = [

  { label: 'T1', value: 82 },

  { label: 'T2', value: 85 },

  { label: 'T3', value: 88 },

  { label: 'T4', value: 87 },

  { label: 'T5', value: 90 },

  { label: 'T6', value: 91 },

  { label: 'T7', value: 92 },

  { label: 'T8', value: 93 },

];



const DEV_KPI_SPARKLINE_EMPLOYEE: KpiSparkPoint[] = [

  { label: 'T1', value: 76 },

  { label: 'T2', value: 78 },

  { label: 'T3', value: 81 },

  { label: 'T4', value: 84 },

  { label: 'T5', value: 86 },

  { label: 'T6', value: 88 },

  { label: 'T7', value: 89 },

  { label: 'T8', value: 91 },

];



function resolveDevKpiSeriesForPersona(persona: PersonaRole): KpiSparkPoint[] {

  if (persona === 'employee') return DEV_KPI_SPARKLINE_EMPLOYEE;

  return DEV_KPI_SPARKLINE_BOD;

}



/** M-CC-13 — inbox mock rows only when dev mock flag is on. */

export function getCommandCenterMockUnifiedTasks(): UnifiedTask[] {

  return allowMockFallback() ? DEV_MOCK_UNIFIED_TASKS : [];

}



/** M-CC-13 — portal alerts mock rows only when dev mock flag is on. */

export function getCommandCenterMockPortalAlerts(): PortalAlert[] {

  return allowMockFallback() ? DEV_MOCK_PORTAL_ALERTS : [];

}



/** M-CC-06/13 — KPI persona sparkline only when dev mock flag is on. */

export function getCommandCenterMockKpiSeries(persona: PersonaRole): KpiSparkPoint[] {

  if (!allowMockFallback()) return [];

  return resolveDevKpiSeriesForPersona(persona);

}



export { MANAGER_SCOPE_ROOT, EMPLOYEE_ID };

