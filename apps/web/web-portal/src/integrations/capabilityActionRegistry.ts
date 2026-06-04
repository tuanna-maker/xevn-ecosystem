/**
 * Track A — Command Center action buttons (ACTION_BUTTON_INVENTORY.md).
 * Each control maps to API wiring or an explicit disabled reason for QA.
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

/** Registry for Command Center P0 + A1–A9 (web-portal). */
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
    apiRoute: 'POST /api/xbos/workflow-engine/tasks/:id/complete',
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
