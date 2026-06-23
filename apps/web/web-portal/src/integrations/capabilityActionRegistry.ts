/**
 * Screen Action Catalog — Portal + HRM embed (ACTION_BUTTON_INVENTORY.md §1–§16).
 * Metadata-only registry for QA traceability; does not wire UI controls.
 */
export type CapabilityWireMode = 'api' | 'navigation' | 'client' | 'disabled';

export type CapabilityActionDefinition = {
  capabilityCode: string;
  labelVi: string;
  wireMode: CapabilityWireMode;
  apiRoute?: string;
  /** Shown when wireMode=disabled or runtime guard blocks action. */
  disabledReasonVi?: string;
};

/** Registry for Command Center P0 + A1–A9 + HRM embed B1–B7 (web-portal catalog §1–§16). */
export const COMMAND_CENTER_CAPABILITY_ACTIONS: Record<string, CapabilityActionDefinition> = {
  'BTN-A1-INBOX-DETAIL': {
    capabilityCode: 'BTN-A1-INBOX-DETAIL',
    labelVi: 'Mở chi tiết',
    wireMode: 'api',
    apiRoute: 'GET /api/xbos/workflow-engine/instances/:id/detail',
  },
  'BTN-A1-INBOX-QUICK': {
    capabilityCode: 'BTN-A1-INBOX-QUICK',
    labelVi: 'Xử lý nhanh',
    wireMode: 'api',
    apiRoute:
      'POST /api/xbos/workflow-engine/tasks/:id/complete | POST …/tasks/:id/reject (outcome=rejected)',
  },
  'BTN-CC-P0-LEGAL-ENTITY-SAVE': {
    capabilityCode: 'BTN-CC-P0-LEGAL-ENTITY-SAVE',
    labelVi: 'Lưu thay đổi pháp nhân',
    wireMode: 'api',
    apiRoute: 'POST|PUT /api/xbos/org-foundation/legal-entities',
  },
  'BTN-CC-P0-SHAREHOLDER-SAVE': {
    capabilityCode: 'BTN-CC-P0-SHAREHOLDER-SAVE',
    labelVi: 'Lưu cổ đông',
    wireMode: 'api',
    apiRoute: 'PUT /api/xbos/org-foundation/legal-entities/:id/shareholders',
  },
  'BTN-CC-P0-LEGAL-DOC-UPLOAD': {
    capabilityCode: 'BTN-CC-P0-LEGAL-DOC-UPLOAD',
    labelVi: 'Upload tài liệu pháp lý',
    wireMode: 'api',
    apiRoute: 'POST /api/xbos/org-foundation/legal-documents',
  },
  'BTN-CC-P0-LEGAL-DOC-VIEW': {
    capabilityCode: 'BTN-CC-P0-LEGAL-DOC-VIEW',
    labelVi: 'Xem tài liệu pháp lý',
    wireMode: 'api',
    apiRoute: 'GET /api/xbos/org-foundation/legal-documents/:id/file',
  },
  'BTN-CC-P0-DEPT-SAVE': {
    capabilityCode: 'BTN-CC-P0-DEPT-SAVE',
    labelVi: 'Lưu phòng ban',
    wireMode: 'api',
    apiRoute: 'POST|PUT /api/xbos/org-foundation/org-units',
  },
  'BTN-CC-P0-PERM-MATRIX': {
    capabilityCode: 'BTN-CC-P0-PERM-MATRIX',
    labelVi: 'Ma trận quyền',
    wireMode: 'api',
    apiRoute: 'PUT /api/xbos/position-rbac/matrix',
  },
  'BTN-CC-P0-METADATA-PREVIEW': {
    capabilityCode: 'BTN-CC-P0-METADATA-PREVIEW',
    labelVi: 'Xem trước biểu mẫu',
    wireMode: 'client',
    disabledReasonVi: undefined,
  },
  'CC-WORKSPACE-META': {
    capabilityCode: 'CC-WORKSPACE-META',
    labelVi: 'Dashboard asOf',
    wireMode: 'api',
    apiRoute: 'GET /api/xbos/command-center/workspace-meta',
  },
  'BTN-A2-CATALOG-GOV-APPROVE': {
    capabilityCode: 'BTN-A2-CATALOG-GOV-APPROVE',
    labelVi: 'Phê duyệt danh mục',
    wireMode: 'api',
    apiRoute: 'POST /api/xbos/catalog-governance/approval-inbox/:id/approve',
  },
  'BTN-A2-CATALOG-GOV-REJECT': {
    capabilityCode: 'BTN-A2-CATALOG-GOV-REJECT',
    labelVi: 'Từ chối danh mục',
    wireMode: 'api',
    apiRoute: 'POST /api/xbos/catalog-governance/approval-inbox/:id/reject',
  },
  'BTN-A3-GROUP-HR-SAVE-BLOCK': {
    capabilityCode: 'BTN-A3-GROUP-HR-SAVE-BLOCK',
    labelVi: 'Lưu tên khối',
    wireMode: 'client',
  },
  'BTN-A3-GROUP-HR-DELETE-PRESET': {
    capabilityCode: 'BTN-A3-GROUP-HR-DELETE-PRESET',
    labelVi: 'Xóa khối preset',
    wireMode: 'client',
    disabledReasonVi:
      'Khối preset hệ thống — dùng «Xóa» trên khối tùy chỉnh hoặc ẩn khối bằng nút Xóa bên khối nền.',
  },
  'CC-GROUP-HR-CATALOG-SYNC': {
    capabilityCode: 'CC-GROUP-HR-CATALOG-SYNC',
    labelVi: 'Xác nhận đồng bộ HRM',
    wireMode: 'api',
    apiRoute: 'POST /api/hrm/settings-catalogs/.../extension-items',
  },
  'BTN-A5-EXEC-MODULE-ACCESS': {
    capabilityCode: 'BTN-A5-EXEC-MODULE-ACCESS',
    labelVi: 'TRUY CẬP phân hệ',
    wireMode: 'navigation',
    apiRoute: '/command-center, /command-center/hrm/*, /customers',
  },
  'BTN-A6-AUTH-LOGOUT': {
    capabilityCode: 'BTN-A6-AUTH-LOGOUT',
    labelVi: 'Đăng xuất',
    wireMode: 'navigation',
    apiRoute: 'POST /api/xbos/auth/logout → /login',
  },
  'BTN-A7-HR-ADD-EMPLOYEE': {
    capabilityCode: 'BTN-A7-HR-ADD-EMPLOYEE',
    labelVi: 'Thêm nhân viên',
    wireMode: 'navigation',
    apiRoute: '/command-center/hrm/employees',
  },
  'BTN-A8-BUSINESS-MASTER-CRUD': {
    capabilityCode: 'BTN-A8-BUSINESS-MASTER-CRUD',
    labelVi: 'Settings CRUD',
    wireMode: 'api',
    apiRoute: 'GET|PUT /api/xbos/business-master/*',
  },
  'BTN-A9-HRM-EMBED-DEEP-LINK': {
    capabilityCode: 'BTN-A9-HRM-EMBED-DEEP-LINK',
    labelVi: 'HRM embed deep link',
    wireMode: 'navigation',
    apiRoute: '/command-center/hrm/*',
  },
  // §1 Command Center — legal entity / shareholders / documents (ACTION_BUTTON_INVENTORY.md)
  'ACT-CC-SHR-DELETE': {
    capabilityCode: 'ACT-CC-SHR-DELETE',
    labelVi: 'Xóa cổ đông',
    wireMode: 'api',
    apiRoute:
      'DELETE /api/xbos/org-foundation/legal-entities/:entityId/shareholders/:shareholderId',
  },
  'ACT-CC-LEGAL-DOC-ADD': {
    capabilityCode: 'ACT-CC-LEGAL-DOC-ADD',
    labelVi: 'Thêm tài liệu pháp lý',
    wireMode: 'api',
    apiRoute: 'POST /api/xbos/org-foundation/legal-entities/:entityId/documents',
  },
  'ACT-CC-LEGAL-DOC-DELETE': {
    capabilityCode: 'ACT-CC-LEGAL-DOC-DELETE',
    labelVi: 'Xóa tài liệu pháp lý',
    wireMode: 'api',
    apiRoute: 'DELETE /api/xbos/org-foundation/legal-entities/:entityId/documents/:id',
  },
  'CC-GROUP-MEMBER-UNITS': {
    capabilityCode: 'CC-GROUP-MEMBER-UNITS',
    labelVi: 'Danh sách đơn vị thành viên',
    wireMode: 'api',
    apiRoute: 'GET /api/xbos/tenant-scope/group-member-units',
  },
  // §2 Workflow inbox
  'ACT-CC-WF-REJECT': {
    capabilityCode: 'ACT-CC-WF-REJECT',
    labelVi: 'Từ chối nhiệm vụ',
    wireMode: 'api',
    apiRoute:
      'POST /api/xbos/workflow-engine/tasks/:id/reject | POST …/tasks/:id/complete (outcome=rejected)',
  },
  'CC-WORKFLOW-INBOX': {
    capabilityCode: 'CC-WORKFLOW-INBOX',
    labelVi: 'Hộp thư việc cần xử lý',
    wireMode: 'api',
    apiRoute: 'GET /api/xbos/workflow-engine/tasks?status=pending',
  },
  // §3 Catalog governance
  'G19-CATALOG-GOVERNANCE-API': {
    capabilityCode: 'G19-CATALOG-GOVERNANCE-API',
    labelVi: 'Inbox quản trị danh mục',
    wireMode: 'api',
    apiRoute: 'GET /api/xbos/catalog-governance/inbox',
  },
  // §4 Org-units / department catalog
  'ACT-CC-DEPT-DELETE': {
    capabilityCode: 'ACT-CC-DEPT-DELETE',
    labelVi: 'Xóa phòng ban',
    wireMode: 'api',
    apiRoute: 'DELETE /api/xbos/org-foundation/org-units/:unitId',
  },
  'SETTINGS-DEPT-CATALOG': {
    capabilityCode: 'SETTINGS-DEPT-CATALOG',
    labelVi: 'Danh mục phòng ban (business-master)',
    wireMode: 'api',
    apiRoute:
      'GET|PUT|DELETE /api/xbos/business-master/department_catalog/items',
  },
  // §5 Vendors / KPI / dashboard rollup
  'CC-KPI-SPARKLINE': {
    capabilityCode: 'CC-KPI-SPARKLINE',
    labelVi: 'KPI sparkline dashboard',
    wireMode: 'api',
    apiRoute: 'GET /api/xbos/kpi-engine/rollup?companyId=holding',
  },
  'G24-KPI-ROLLUP': {
    capabilityCode: 'G24-KPI-ROLLUP',
    labelVi: 'KPI rollup tập đoàn',
    wireMode: 'api',
    apiRoute: 'GET /api/xbos/kpi-engine/rollup?companyId=holding',
  },
  // §6 Permission matrix / RACI
  'G11-RACI-GOVERNANCE': {
    capabilityCode: 'G11-RACI-GOVERNANCE',
    labelVi: 'Ma trận RACI đơn vị thành viên',
    wireMode: 'api',
    apiRoute:
      'GET|PUT /api/xbos/raci-governance/companies/:memberUuid/matrix | PUT …/matrix/cells',
  },
  // §8 HRM Employees
  'BTN-B1-EMPLOYEES-CREATE': {
    capabilityCode: 'BTN-B1-EMPLOYEES-CREATE',
    labelVi: 'Thêm / lưu nhân viên',
    wireMode: 'api',
    apiRoute:
      'POST /api/hrm/employees | PATCH /api/hrm/employees/:id',
  },
  'ACT-HRM-EMP-ARCHIVE': {
    capabilityCode: 'ACT-HRM-EMP-ARCHIVE',
    labelVi: 'Lưu trữ nhân viên',
    wireMode: 'api',
    apiRoute: 'POST /api/hrm/employees/:id/archive',
  },
  // §9 HRM Contracts
  'BTN-B5-CONTRACTS-EDIT': {
    capabilityCode: 'BTN-B5-CONTRACTS-EDIT',
    labelVi: 'Tạo / lưu hợp đồng',
    wireMode: 'api',
    apiRoute:
      'POST /api/hrm/contracts-insurance/contracts | PATCH /api/hrm/contracts-insurance/contracts/:id',
  },
  // §10 HRM Insurance
  'ACT-HRM-INS-LINK': {
    capabilityCode: 'ACT-HRM-INS-LINK',
    labelVi: 'Liên kết / lưu BHXH',
    wireMode: 'api',
    apiRoute:
      'POST /api/hrm/insurance-policy-participants | PATCH /api/hrm/insurance-policy-participants/:id',
  },
  'HRM-EMBED-OPERATIONS': {
    capabilityCode: 'HRM-EMBED-OPERATIONS',
    labelVi: 'Danh sách tham gia BHXH',
    wireMode: 'api',
    apiRoute: 'GET /api/hrm/insurance-policy-participants?company_id=',
  },
  // §11 HRM Attendance
  'BTN-B3-ATTENDANCE-SAVE': {
    capabilityCode: 'BTN-B3-ATTENDANCE-SAVE',
    labelVi: 'Lưu chấm công',
    wireMode: 'api',
    apiRoute: 'PATCH /api/hrm/attendance/records/:id/status',
  },
  'ACT-HRM-ATT-CREATE': {
    capabilityCode: 'ACT-HRM-ATT-CREATE',
    labelVi: 'Tạo bản ghi chấm công',
    wireMode: 'api',
    apiRoute: 'POST /api/hrm/attendance/records',
  },
  'BTN-B7-LEAVE-UNIFY': {
    capabilityCode: 'BTN-B7-LEAVE-UNIFY',
    labelVi: 'Đơn nghỉ — tạo / duyệt',
    wireMode: 'api',
    apiRoute:
      'POST /api/hrm/attendance/leave-requests | POST …/leave-requests/:id/approve | POST …/reject',
  },
  // §12 HRM Payroll
  'BTN-B2-PAYROLL-PERIODS': {
    capabilityCode: 'BTN-B2-PAYROLL-PERIODS',
    labelVi: 'Kỳ lương / phiếu lương',
    wireMode: 'api',
    apiRoute: 'GET /api/hrm/payroll/payslips?company_id=',
  },
  'BTN-B2-PAYROLL-COMPONENTS': {
    capabilityCode: 'BTN-B2-PAYROLL-COMPONENTS',
    labelVi: 'Thành phần lương',
    wireMode: 'navigation',
    apiRoute: '/command-center/hrm/payroll (Calculate tab)',
  },
  // §13 HRM Recruitment
  'ACT-HRM-REC-CREATE': {
    capabilityCode: 'ACT-HRM-REC-CREATE',
    labelVi: 'Tạo đề xuất tuyển dụng',
    wireMode: 'api',
    apiRoute: 'POST /api/hrm/recruitment/requisitions',
  },
  'BTN-B4-RECRUITMENT-PLAN-APPROVE': {
    capabilityCode: 'BTN-B4-RECRUITMENT-PLAN-APPROVE',
    labelVi: 'Phê duyệt kế hoạch tuyển dụng',
    wireMode: 'api',
    apiRoute: 'PATCH /api/hrm/recruitment/headcount-proposals/:id/status',
  },
  'BTN-B4-RECRUITMENT-PLAN-REJECT': {
    capabilityCode: 'BTN-B4-RECRUITMENT-PLAN-REJECT',
    labelVi: 'Từ chối kế hoạch tuyển dụng',
    wireMode: 'api',
    apiRoute: 'PATCH /api/hrm/recruitment/headcount-proposals/:id/status',
  },
  // §14 HRM Decisions (read-only mock)
  'ACT-HRM-DEC-READ': {
    capabilityCode: 'ACT-HRM-DEC-READ',
    labelVi: 'Xem danh sách quyết định',
    wireMode: 'client',
    disabledReasonVi: 'Dữ liệu mock — API quyết định chưa có trong Phase 1.',
  },
  // §15 HRM Settings catalogs / metadata queue
  'BTN-B6-HRM-SETTINGS-SAVE': {
    capabilityCode: 'BTN-B6-HRM-SETTINGS-SAVE',
    labelVi: 'Thêm / lưu danh mục HRM',
    wireMode: 'api',
    apiRoute:
      'POST /api/hrm/settings-catalogs/items | PATCH /api/hrm/settings-catalogs/items/:id',
  },
  'ACT-HRM-META-APPROVE': {
    capabilityCode: 'ACT-HRM-META-APPROVE',
    labelVi: 'Duyệt thay đổi metadata',
    wireMode: 'api',
    apiRoute:
      'POST /api/hrm/employee-metadata/change-requests/:id/approve',
  },
  'ACT-HRM-META-REJECT': {
    capabilityCode: 'ACT-HRM-META-REJECT',
    labelVi: 'Từ chối thay đổi metadata',
    wireMode: 'api',
    apiRoute: 'POST /api/hrm/employee-metadata/change-requests/:id/reject',
  },
};

export type CapabilityRuntimeContext = {
  /** e.g. no task selected, wrong tenant */
  blocked?: boolean;
  blockedReasonVi?: string;
  busy?: boolean;
};

export type CapabilityActionState = {
  definition: CapabilityActionDefinition;
  enabled: boolean;
  disabledReasonVi: string | null;
  titleAttr: string;
};

export function getCapabilityDefinition(code: string): CapabilityActionDefinition | undefined {
  return COMMAND_CENTER_CAPABILITY_ACTIONS[code];
}

export function resolveCapabilityActionState(
  code: string,
  runtime: CapabilityRuntimeContext = {},
): CapabilityActionState | null {
  const definition = getCapabilityDefinition(code);
  if (!definition) return null;

  if (runtime.blocked) {
    const reason =
      runtime.blockedReasonVi ??
      definition.disabledReasonVi ??
      'Thao tác chưa khả dụng trong ngữ cảnh hiện tại.';
    return {
      definition,
      enabled: false,
      disabledReasonVi: reason,
      titleAttr: reason,
    };
  }

  if (definition.wireMode === 'disabled') {
    const reason = definition.disabledReasonVi ?? 'Chức năng chưa được kích hoạt.';
    return {
      definition,
      enabled: false,
      disabledReasonVi: reason,
      titleAttr: reason,
    };
  }

  if (runtime.busy) {
    return {
      definition,
      enabled: false,
      disabledReasonVi: 'Đang xử lý…',
      titleAttr: 'Đang xử lý…',
    };
  }

  const apiHint = definition.apiRoute ? ` · ${definition.apiRoute}` : '';
  return {
    definition,
    enabled: true,
    disabledReasonVi: null,
    titleAttr: `${definition.labelVi}${apiHint}`,
  };
}

/** Executive dashboard module id → route (BTN-A5). */
export const EXEC_MODULE_ACCESS_ROUTES: Record<string, string> = {
  'x-bos': '/command-center',
  hrm: '/command-center/hrm/dashboard',
  trsport: '/command-center',
  lgs: '/command-center',
  express: '/command-center',
  'x-scm': '/command-center',
  'x-office': '/command-center',
  'x-finance': '/command-center',
  crm: '/customers',
  'x-maintenance': '/command-center',
};

export function resolveExecModuleAccessRoute(moduleId: string): string {
  return EXEC_MODULE_ACCESS_ROUTES[moduleId] ?? '/command-center';
}
