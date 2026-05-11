/**
 * Mạng lưới quy trình (Graph-driven workflow) — định nghĩa nút + ba cạnh bắt buộc / bước.
 * Dữ liệu mẫu thực tế; không dùng placeholder kiểu "Bước 1".
 */

import {
  RACI_ORG_COLUMNS,
  workflowRoleIdForRaciColumn,
  type RaciOrgColumnId,
} from './xevn-raci-catalog';

export type { RaciOrgColumnId } from './xevn-raci-catalog';

export const WF_NODE_START = 'wf-start';
export const WF_NODE_END_OK = 'wf-end-success';
export const WF_NODE_END_REJECT = 'wf-end-reject';
export const WF_NODE_BOD = 'wf-bod-special';

export const WORKFLOW_TERMINAL_IDS = [
  WF_NODE_START,
  WF_NODE_END_OK,
  WF_NODE_END_REJECT,
  WF_NODE_BOD,
] as const;

export type WorkflowTransitionKind = 'approve' | 'reject' | 'exception';

/** Thứ tự cố định khi serialize / form: Đồng ý → Từ chối → Ngoại lệ BOD */
export const WORKFLOW_TRANSITION_KINDS: readonly WorkflowTransitionKind[] = [
  'approve',
  'reject',
  'exception',
] as const;

/** Nhãn đầy đủ trên cạnh (SRS / cấu hình) */
export const WORKFLOW_EDGE_FULL_LABELS: Record<WorkflowTransitionKind, string> = {
  approve: 'Đồng ý',
  reject: 'Từ chối',
  exception: 'Chuyển cấp BOD xử lý',
};

/** Nhãn cô đọng trên canvas (If / Else / Loop) */
export const WORKFLOW_EDGE_CANVAS_TAGS: Record<WorkflowTransitionKind, string> = {
  approve: 'If',
  reject: 'Else',
  exception: 'Loop',
};

export type WorkflowGraphTransition = {
  kind: WorkflowTransitionKind;
  destinationId: string;
};

export type WorkflowStepAction = 'approve' | 'sign' | 'input';

/** Vai trò xử lý bước — `allowsRejectOutcome: false` = không cấu hình / không hiển thị nhánh Từ chối (vd. nhân viên đệ trình). */
export type WorkflowHandlerRoleDef = {
  id: string;
  label: string;
  allowsRejectOutcome?: boolean;
  /** Khớp cột ma trận RACI Option 1 (nếu có). */
  raciOrgColumnId?: RaciOrgColumnId;
};

/** Vai trò tổng quát (không gắn cột RACI cụ thể) — giữ tương thích quy trình mẫu cũ. */
const LEGACY_WORKFLOW_HANDLER_ROLES: ReadonlyArray<WorkflowHandlerRoleDef> = [
  { id: 'dept_head', label: 'Trưởng phòng / BP' },
  { id: 'division_director', label: 'Giám đốc khối' },
  { id: 'bod', label: 'BOD / HĐQT' },
  { id: 'hr_bp', label: 'HR BP' },
  { id: 'admin', label: 'Admin hệ thống' },
  { id: 'staff', label: 'Nhân viên / Người đệ trình', allowsRejectOutcome: false },
];

const RACI_WORKFLOW_HANDLER_ROLES: ReadonlyArray<WorkflowHandlerRoleDef> = RACI_ORG_COLUMNS.map(
  (col) => ({
    id: workflowRoleIdForRaciColumn(col.id),
    label: col.workflowRoleLabel,
    allowsRejectOutcome: col.workflowAllowsReject,
    raciOrgColumnId: col.id,
  }),
);

/** Legacy trước, sau đó 18 cột RACI (`raci_*`) để dropdown gọn nhóm khái niệm cũ → chi tiết khách hàng. */
export const WORKFLOW_HANDLER_ROLES: ReadonlyArray<WorkflowHandlerRoleDef> = [
  ...LEGACY_WORKFLOW_HANDLER_ROLES,
  ...RACI_WORKFLOW_HANDLER_ROLES,
];

/** Vai trò có được cấu hình và (theo thiết kế) có thể có kết quả Từ chối khi vận hành. */
export function workflowHandlerRoleAllowsRejectOutcome(handlerRoleId: string): boolean {
  const r = WORKFLOW_HANDLER_ROLES.find((x) => x.id === handlerRoleId);
  return r?.allowsRejectOutcome !== false;
}

export type WorkflowGraphStep = {
  id: string;
  order: number;
  taskName: string;
  handlerRoleId: string;
  stepAction: WorkflowStepAction;
  slaHours: number;
  relatedModuleId: string;
  /** Luôn đúng 3 phần tử theo WORKFLOW_TRANSITION_KINDS */
  transitions: WorkflowGraphTransition[];
};

export type WorkflowDefinition = {
  id: string;
  code: string;
  name: string;
  applyingEntityId: string;
  triggerEvent: string;
  totalSlaHours: number;
  steps: WorkflowGraphStep[];
};

export function createDefaultTransitions(patch: {
  approveTo: string;
  rejectTo: string;
  exceptionTo: string;
}): WorkflowGraphTransition[] {
  return WORKFLOW_TRANSITION_KINDS.map((kind) => ({
    kind,
    destinationId:
      kind === 'approve'
        ? patch.approveTo
        : kind === 'reject'
          ? patch.rejectTo
          : patch.exceptionTo,
  }));
}

export function ensureTransitions(arr: WorkflowGraphTransition[]): WorkflowGraphTransition[] {
  const byKind = new Map<WorkflowTransitionKind, string>();
  for (const t of arr) {
    byKind.set(t.kind, t.destinationId);
  }
  return WORKFLOW_TRANSITION_KINDS.map((kind) => ({
    kind,
    destinationId: byKind.get(kind) ?? WF_NODE_END_REJECT,
  }));
}

/** Hai quy trình mẫu: tuyển dụng + CAPEX — cạnh chỉ rõ đích, không suy luận từ thứ tự danh sách */
export function getInitialWorkflowGraphDefinitions(): WorkflowDefinition[] {
  return [
    {
      id: 'wf-rec-1',
      code: 'WF-TD-01',
      name: 'Phê duyệt tuyển dụng nhân sự',
      applyingEntityId: '',
      triggerEvent: 'hr.recruitment.request_submitted',
      totalSlaHours: 144,
      steps: [
        {
          id: 'ws-rec-1',
          order: 1,
          taskName:
            'Trưởng phòng kiểm tra nhu cầu, JD và ngân sách tuyển dụng bộ phận',
          handlerRoleId: 'dept_head',
          stepAction: 'approve',
          slaHours: 24,
          relatedModuleId: 'hr',
          transitions: createDefaultTransitions({
            approveTo: 'ws-rec-2',
            rejectTo: WF_NODE_START,
            exceptionTo: WF_NODE_BOD,
          }),
        },
        {
          id: 'ws-rec-2',
          order: 2,
          taskName: 'Giám đốc khối duyệt biên chế và thẩm quyền tuyển',
          handlerRoleId: 'division_director',
          stepAction: 'approve',
          slaHours: 48,
          relatedModuleId: 'hr',
          transitions: createDefaultTransitions({
            approveTo: 'ws-rec-3',
            rejectTo: 'ws-rec-1',
            exceptionTo: WF_NODE_BOD,
          }),
        },
        {
          id: 'ws-rec-3',
          order: 3,
          taskName: 'BOD ký xác nhận phê duyệt tuyển dụng cấp tập đoàn',
          handlerRoleId: 'bod',
          stepAction: 'sign',
          slaHours: 72,
          relatedModuleId: 'hr',
          transitions: createDefaultTransitions({
            approveTo: WF_NODE_END_OK,
            rejectTo: WF_NODE_END_REJECT,
            exceptionTo: WF_NODE_BOD,
          }),
        },
      ],
    },
    {
      id: 'wf-inv-1',
      code: 'WF-ĐT-01',
      name: 'Phê duyệt đầu tư',
      applyingEntityId: '',
      triggerEvent: 'finance.capex.workflow_started',
      totalSlaHours: 120,
      steps: [
        {
          id: 'ws-inv-1',
          order: 1,
          taskName: 'Trưởng phòng Tài chính thẩm định và nhập số liệu dự án',
          handlerRoleId: 'dept_head',
          stepAction: 'input',
          slaHours: 24,
          relatedModuleId: 'finance',
          transitions: createDefaultTransitions({
            approveTo: 'ws-inv-2',
            rejectTo: WF_NODE_START,
            exceptionTo: WF_NODE_BOD,
          }),
        },
        {
          id: 'ws-inv-2',
          order: 2,
          taskName: 'Giám đốc khối Tài chính / CFO duyệt phương án',
          handlerRoleId: 'division_director',
          stepAction: 'approve',
          slaHours: 48,
          relatedModuleId: 'finance',
          transitions: createDefaultTransitions({
            approveTo: 'ws-inv-3',
            rejectTo: 'ws-inv-1',
            exceptionTo: WF_NODE_BOD,
          }),
        },
        {
          id: 'ws-inv-3',
          order: 3,
          taskName: 'BOD phê duyệt chủ trương đầu tư',
          handlerRoleId: 'bod',
          stepAction: 'sign',
          slaHours: 48,
          relatedModuleId: 'finance',
          transitions: createDefaultTransitions({
            approveTo: WF_NODE_END_OK,
            rejectTo: 'ws-inv-2',
            exceptionTo: WF_NODE_BOD,
          }),
        },
      ],
    },
  ];
}

/**
 * Prototype quy trình gắn trực tiếp cột RACI (handlerRoleId dạng `raci_*`).
 * Bổ sung vào danh sách mẫu trên cổng — không thay thế WF-TD / WF-ĐT.
 */
export function getRaciWorkflowPrototypeDefinitions(): WorkflowDefinition[] {
  return [
    {
      id: 'wf-raci-log-kho-01',
      code: 'WF-RACI-LG-01',
      name: 'Điều chỉnh tồn kho / phân bổ — RACI Logistics',
      applyingEntityId: '',
      triggerEvent: 'logistics.inventory.adjustment_requested',
      totalSlaHours: 96,
      steps: [
        {
          id: 'ws-rk-1',
          order: 1,
          taskName:
            'Nhân viên kho / điều phối ghi nhận đề xuất điều chỉnh tồn, SKU và lý do nghiệp vụ',
          handlerRoleId: 'staff',
          stepAction: 'input',
          slaHours: 8,
          relatedModuleId: 'logistics',
          transitions: createDefaultTransitions({
            approveTo: 'ws-rk-2',
            rejectTo: WF_NODE_START,
            exceptionTo: WF_NODE_BOD,
          }),
        },
        {
          id: 'ws-rk-2',
          order: 2,
          taskName: 'Trưởng phòng Kho phân phối thẩm định số liệu, khả năng đáp ứng và rủi ro vận hành',
          handlerRoleId: 'raci_kho_phan_phoi',
          stepAction: 'approve',
          slaHours: 24,
          relatedModuleId: 'logistics',
          transitions: createDefaultTransitions({
            approveTo: 'ws-rk-3',
            rejectTo: 'ws-rk-1',
            exceptionTo: WF_NODE_BOD,
          }),
        },
        {
          id: 'ws-rk-3',
          order: 3,
          taskName:
            'PTGĐ Phụ trách kinh doanh xác nhận tác động hợp đồng / cam kết giao hàng với khách hàng',
          handlerRoleId: 'raci_ptgd_kinh_doanh',
          stepAction: 'approve',
          slaHours: 24,
          relatedModuleId: 'logistics',
          transitions: createDefaultTransitions({
            approveTo: 'ws-rk-4',
            rejectTo: 'ws-rk-2',
            exceptionTo: WF_NODE_BOD,
          }),
        },
        {
          id: 'ws-rk-4',
          order: 4,
          taskName: 'COO phê duyệt áp dụng thay đổi vận hành và đồng bộ các khối liên quan',
          handlerRoleId: 'raci_coo',
          stepAction: 'approve',
          slaHours: 40,
          relatedModuleId: 'logistics',
          transitions: createDefaultTransitions({
            approveTo: WF_NODE_END_OK,
            rejectTo: 'ws-rk-3',
            exceptionTo: WF_NODE_BOD,
          }),
        },
      ],
    },
    {
      id: 'wf-raci-hr-01',
      code: 'WF-RACI-HR-01',
      name: 'Thay đổi cơ cấu / JD khối HCNS — RACI',
      applyingEntityId: '',
      triggerEvent: 'hr.org_change.request_submitted',
      totalSlaHours: 168,
      steps: [
        {
          id: 'ws-rh-1',
          order: 1,
          taskName: 'CHRO / HCNS soạn thảo đề xuất thay đổi JD, biên chế hoặc sơ đồ báo cáo',
          handlerRoleId: 'raci_hcns',
          stepAction: 'input',
          slaHours: 48,
          relatedModuleId: 'hr',
          transitions: createDefaultTransitions({
            approveTo: 'ws-rh-2',
            rejectTo: WF_NODE_START,
            exceptionTo: WF_NODE_BOD,
          }),
        },
        {
          id: 'ws-rh-2',
          order: 2,
          taskName: 'PTGĐ Nội chính thẩm định tuân thủ, chi phí nhân sự và phối hợp khối',
          handlerRoleId: 'raci_ptgd_noi_chinh',
          stepAction: 'approve',
          slaHours: 48,
          relatedModuleId: 'hr',
          transitions: createDefaultTransitions({
            approveTo: 'ws-rh-3',
            rejectTo: 'ws-rh-1',
            exceptionTo: WF_NODE_BOD,
          }),
        },
        {
          id: 'ws-rh-3',
          order: 3,
          taskName: 'CEO phê duyệt cuối trước khi trình HĐQT (nếu vượt thẩm quyền)',
          handlerRoleId: 'raci_ceo',
          stepAction: 'sign',
          slaHours: 72,
          relatedModuleId: 'hr',
          transitions: createDefaultTransitions({
            approveTo: WF_NODE_END_OK,
            rejectTo: 'ws-rh-2',
            exceptionTo: WF_NODE_BOD,
          }),
        },
      ],
    },
  ];
}
