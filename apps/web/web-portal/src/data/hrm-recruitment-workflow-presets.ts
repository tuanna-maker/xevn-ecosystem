/**
 * @CODE-MEMORY
 * Screen:     Command Center → Cấu hình → Hệ thống quy trình (recruitment presets)
 * UC:         UC-HRM-REC-WF-01 · J-REC-WF-01 · AC-REC-WF-01
 * BR:         BR-REC-WF-01 · BR-REC-WF-14 (U65 FE-only, no seed)
 * SRS:        docs/hrm/SRS.md §16.5 (delta) · docs/program/deltas/XBOS_HRM_REC_WF_BRIDGE_BA_DELTA.md §6
 * TechSpec:   docs/decisions/ADR-XBOS-HRM-RECRUITMENT-WORKFLOW-BRIDGE.md §3 Q1 · §8
 * DataContract: docs/program/deltas/XBOS_HRM_REC_WF_BRIDGE_DATA_CONTRACT.md §1–§2
 * Purpose:    Canvas-ready WorkflowDefinition templates for the three normative
 *             recruitment workflow_code values. Admin creates/activates via FE
 *             (U65) so HRM submit-workflow can spawn instances instead of SPAWN-MISSING.
 * WorkItem:   XHRM-REC-WF-FE-CANVAS-01
 * Coded:      2026-07-19
 *
 * Callers:
 *   - CommandCenterPage.openRecruitmentWorkflowPreset
 *   - workflowMapper.businessTypeForWorkflowCode / category helpers
 *
 * Callees:
 *   - workflow-graph createDefaultTransitions / WF_NODE_*
 *   - workflow-resolver defaultResolverConfig
 *
 * FE-Actions:
 *   | Click preset chip | openRecruitmentWorkflowPreset | form prefill → Lưu → PUT/POST definitions |
 *   | Re-open existing code | openEditWorkflow | same definition id |
 *
 * Impact:     Wrong code → HRM bridge SPAWN-MISSING forever; wrong taskType → STAGE-UNMAPPED
 * must_keep:  UF-HRM-12 · AC-CD-F6-* (rec_* map only) · LeaveWorkflowBridge · no seed inbox
 * change_mode: UPGRADE
 * SOLID:      SRP — recruitment bridge codes only; leave/catalog presets stay elsewhere
 * LastVerified: hrm-recruitment-workflow-presets.test.ts
 */

import {
  WF_NODE_BOD,
  WF_NODE_END_OK,
  WF_NODE_END_REJECT,
  WF_NODE_START,
  createDefaultTransitions,
  type WorkflowDefinition,
  type WorkflowGraphStep,
} from './workflow-graph';
import { defaultResolverConfig } from './workflow-resolver';

/** Normative ADR §3 Q1 / BA §6 */
export const WF_HRM_RECRUITMENT_PLAN_APPROVAL_CODE = 'hrm_recruitment_plan_approval';
export const WF_HRM_REQUISITION_APPROVAL_CODE = 'hrm_requisition_approval';
export const WF_HRM_CANDIDATE_PIPELINE_CODE = 'hrm_candidate_pipeline';

export const WF_BUSINESS_TYPE_HRM_RECRUITMENT_PLAN = 'hrm_recruitment_plan';
export const WF_BUSINESS_TYPE_HRM_REQUISITION = 'hrm_requisition';
export const WF_BUSINESS_TYPE_HRM_CANDIDATE = 'hrm_candidate';

export type HrmRecruitmentWfPresetKind = 'plan' | 'requisition' | 'candidate';

export const HRM_RECRUITMENT_WF_PRESET_META: ReadonlyArray<{
  kind: HrmRecruitmentWfPresetKind;
  workflowCode: string;
  businessType: string;
  nameVi: string;
  triggerEvent: string;
  shortHintVi: string;
}> = [
  {
    kind: 'plan',
    workflowCode: WF_HRM_RECRUITMENT_PLAN_APPROVAL_CODE,
    businessType: WF_BUSINESS_TYPE_HRM_RECRUITMENT_PLAN,
    nameVi: 'Phê duyệt kế hoạch tuyển dụng HRM',
    triggerEvent: 'hr.recruitment.plan_submitted',
    shortHintVi: 'Kế hoạch → Gửi duyệt QT',
  },
  {
    kind: 'requisition',
    workflowCode: WF_HRM_REQUISITION_APPROVAL_CODE,
    businessType: WF_BUSINESS_TYPE_HRM_REQUISITION,
    nameVi: 'Phê duyệt yêu cầu tuyển dụng HRM',
    triggerEvent: 'hr.recruitment.request_submitted',
    shortHintVi: 'Yêu cầu tuyển → Gửi duyệt QT',
  },
  {
    kind: 'candidate',
    workflowCode: WF_HRM_CANDIDATE_PIPELINE_CODE,
    businessType: WF_BUSINESS_TYPE_HRM_CANDIDATE,
    nameVi: 'Roadmap ứng viên HRM',
    triggerEvent: 'hr.recruitment.candidate_pipeline_started',
    shortHintVi: 'Ứng viên → Bắt đầu QT',
  },
];

const RECRUITMENT_WF_CODE_TO_BUSINESS_TYPE: Record<string, string> = {
  [WF_HRM_RECRUITMENT_PLAN_APPROVAL_CODE]: WF_BUSINESS_TYPE_HRM_RECRUITMENT_PLAN,
  [WF_HRM_REQUISITION_APPROVAL_CODE]: WF_BUSINESS_TYPE_HRM_REQUISITION,
  [WF_HRM_CANDIDATE_PIPELINE_CODE]: WF_BUSINESS_TYPE_HRM_CANDIDATE,
  hrm_leave_approval: 'hrm_leave',
};

export function businessTypeForWorkflowCode(code: string): string | undefined {
  const key = code.trim().toLowerCase();
  return RECRUITMENT_WF_CODE_TO_BUSINESS_TYPE[key];
}

export function isHrmRecruitmentWorkflowCode(code: string): boolean {
  const key = code.trim().toLowerCase();
  return (
    key === WF_HRM_RECRUITMENT_PLAN_APPROVAL_CODE ||
    key === WF_HRM_REQUISITION_APPROVAL_CODE ||
    key === WF_HRM_CANDIDATE_PIPELINE_CODE
  );
}

export function categoryForWorkflowCode(code: string): string {
  const bt = businessTypeForWorkflowCode(code);
  if (bt === 'hrm_leave') return 'hrm_leave';
  if (bt === WF_BUSINESS_TYPE_HRM_RECRUITMENT_PLAN || bt === WF_BUSINESS_TYPE_HRM_REQUISITION || bt === WF_BUSINESS_TYPE_HRM_CANDIDATE) {
    return 'hrm_recruitment';
  }
  return 'general';
}

function approvalStep(patch: {
  id: string;
  order: number;
  taskName: string;
  taskType: string;
  approveTo: string;
  rejectTo: string;
}): WorkflowGraphStep {
  return {
    id: patch.id,
    order: patch.order,
    taskName: patch.taskName,
    handlerRoleId: 'hr_bp',
    stepAction: 'approve',
    slaHours: 48,
    relatedModuleId: 'hr',
    taskType: patch.taskType,
    resolverType: 'direct_manager',
    resolverConfig: defaultResolverConfig('direct_manager'),
    transitions: createDefaultTransitions({
      approveTo: patch.approveTo,
      rejectTo: patch.rejectTo,
      exceptionTo: WF_NODE_BOD,
    }),
  };
}

/** Build a new (unsaved) canvas definition for one of the three bridge codes. */
export function buildHrmRecruitmentWorkflowPreset(
  kind: HrmRecruitmentWfPresetKind,
  tempId?: string,
): WorkflowDefinition {
  const meta = HRM_RECRUITMENT_WF_PRESET_META.find((m) => m.kind === kind)!;
  const id = tempId ?? `wf-rec-preset-${kind}-${Date.now()}`;

  if (kind === 'plan') {
    return {
      id,
      code: meta.workflowCode,
      name: meta.nameVi,
      applyingEntityId: '',
      triggerEvent: meta.triggerEvent,
      totalSlaHours: 48,
      steps: [
        approvalStep({
          id: 'plan_approval',
          order: 1,
          taskName: 'Phê duyệt kế hoạch tuyển dụng',
          taskType: 'rec_plan_approve',
          approveTo: WF_NODE_END_OK,
          rejectTo: WF_NODE_END_REJECT,
        }),
      ],
    };
  }

  if (kind === 'requisition') {
    return {
      id,
      code: meta.workflowCode,
      name: meta.nameVi,
      applyingEntityId: '',
      triggerEvent: meta.triggerEvent,
      totalSlaHours: 48,
      steps: [
        approvalStep({
          id: 'requisition_approval',
          order: 1,
          taskName: 'Phê duyệt yêu cầu tuyển dụng',
          taskType: 'rec_req_approve',
          approveTo: WF_NODE_END_OK,
          rejectTo: WF_NODE_END_REJECT,
        }),
      ],
    };
  }

  // candidate pipeline — F6 stage map via taskType (data contract §2.2)
  const intake = 'intake';
  const screening = 'screening';
  const interview = 'interview';
  const offer = 'offer';
  return {
    id,
    code: meta.workflowCode,
    name: meta.nameVi,
    applyingEntityId: '',
    triggerEvent: meta.triggerEvent,
    totalSlaHours: 240,
    steps: [
      {
        ...approvalStep({
          id: intake,
          order: 1,
          taskName: 'Tiếp nhận hồ sơ',
          taskType: 'rec_intake',
          approveTo: screening,
          rejectTo: WF_NODE_START,
        }),
        slaHours: 24,
      },
      {
        ...approvalStep({
          id: screening,
          order: 2,
          taskName: 'Sàng lọc',
          taskType: 'rec_screening',
          approveTo: interview,
          rejectTo: intake,
        }),
        slaHours: 48,
      },
      {
        ...approvalStep({
          id: interview,
          order: 3,
          taskName: 'Phỏng vấn',
          taskType: 'rec_interview',
          approveTo: offer,
          rejectTo: screening,
        }),
        slaHours: 72,
      },
      {
        ...approvalStep({
          id: offer,
          order: 4,
          taskName: 'Đề nghị tuyển dụng',
          taskType: 'rec_offer',
          approveTo: WF_NODE_END_OK,
          rejectTo: interview,
        }),
        slaHours: 48,
      },
    ],
  };
}

export function findWorkflowByRecruitmentCode(
  workflows: ReadonlyArray<{ id: string; code: string }>,
  kind: HrmRecruitmentWfPresetKind,
): { id: string; code: string } | undefined {
  const code = HRM_RECRUITMENT_WF_PRESET_META.find((m) => m.kind === kind)?.workflowCode;
  if (!code) return undefined;
  return workflows.find((w) => w.code.trim().toLowerCase() === code);
}

/** Portal path hint for SPAWN-MISSING CTA (U65). */
export const HRM_REC_WF_CANVAS_PATH_HINT_VI =
  'Command Center → Cấu hình → Hệ thống quy trình → Mẫu QT tuyển dụng HRM → Lưu (active).';
