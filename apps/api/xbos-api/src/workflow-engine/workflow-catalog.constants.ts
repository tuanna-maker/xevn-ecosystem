/** Quy trình phê duyệt bổ sung danh mục HRM — CT Du lịch X.E */
export const WF_HRM_CATALOG_XE_DU_LICH_CODE = 'wf_hrm_catalog_extension_xe_du_lich';
export const WF_BUSINESS_TYPE_HRM_CATALOG = 'hrm_catalog_extension';
/** CD-FB-07 — HRM leave approval pilot (ADR-WORKFLOW-RESOLVER-DYNAMIC §9) */
export const WF_HRM_LEAVE_APPROVAL_CODE = 'hrm_leave_approval';
export const WF_BUSINESS_TYPE_HRM_LEAVE = 'hrm_leave';
/** XHRM-REC-WF-BE-01 — recruitment bridges (ADR-XBOS-HRM-RECRUITMENT-WORKFLOW-BRIDGE §3 Q1) */
export const WF_HRM_RECRUITMENT_PLAN_APPROVAL_CODE = 'hrm_recruitment_plan_approval';
export const WF_HRM_REQUISITION_APPROVAL_CODE = 'hrm_requisition_approval';
export const WF_HRM_CANDIDATE_PIPELINE_CODE = 'hrm_candidate_pipeline';
export const WF_BUSINESS_TYPE_HRM_RECRUITMENT_PLAN = 'hrm_recruitment_plan';
export const WF_BUSINESS_TYPE_HRM_REQUISITION = 'hrm_requisition';
export const WF_BUSINESS_TYPE_HRM_CANDIDATE = 'hrm_candidate';
/** UF-XBOS-08 — pending inbox after canvas definition save (U64 no seed). */
export const WF_BUSINESS_TYPE_DEFINITION_REVIEW = 'workflow_definition_review';
export const MEMBER_TENANT_XE_DU_LICH = 'xe-du-lich';
export const MEMBER_COMPANY_MAIN = 'main';
export const MASTER_TENANT_XEVN = 'xevn';
export const MASTER_COMPANY_HOLDING = 'holding';
export const GROUP_APPROVER_USER = 'ceo@xe.vn';

export function buildHrmLeaveApprovalWorkflowDefinition() {
  return {
    workflowCode: WF_HRM_LEAVE_APPROVAL_CODE,
    name: 'Phê duyệt đơn nghỉ phép HRM',
    category: 'hrm_leave',
    scopeLevel: 'group',
    status: 'active',
    conditions: {
      businessType: WF_BUSINESS_TYPE_HRM_LEAVE,
    },
    graph: {
      steps: [
        {
          stepKey: 'manager_approval',
          name: 'Quản lý trực tiếp phê duyệt',
          order: 1,
          resolver_type: 'direct_manager',
          resolver_config: { fallback_role_code: 'hrbp' },
          allowsReject: true,
        },
      ],
    },
  };
}

export function buildXeDuLichCatalogWorkflowDefinition() {
  return {
    workflowCode: WF_HRM_CATALOG_XE_DU_LICH_CODE,
    name: 'Phê duyệt bổ sung danh mục HRM — X.E Du lịch VN',
    category: 'hrm_catalog',
    scopeLevel: 'group',
    status: 'active',
    conditions: {
      memberTenantId: MEMBER_TENANT_XE_DU_LICH,
      memberCompanyId: MEMBER_COMPANY_MAIN,
      businessType: WF_BUSINESS_TYPE_HRM_CATALOG,
    },
    graph: {
      steps: [
        {
          stepKey: 'subsidiary_submit',
          name: 'Công ty Du lịch gửi yêu cầu',
          order: 1,
          autoComplete: true,
        },
        {
          stepKey: 'group_catalog_approval',
          name: 'Tập đoàn phê duyệt danh mục',
          order: 2,
          hatKey: 'group_ceo',
          assigneeUserId: GROUP_APPROVER_USER,
          allowsReject: true,
        },
      ],
    },
  };
}

/** Canvas-ready templates for recruitment (U65 — no seed; FE/canvas activates). */
export function buildHrmRecruitmentPlanApprovalDefinition() {
  return {
    workflowCode: WF_HRM_RECRUITMENT_PLAN_APPROVAL_CODE,
    name: 'Phê duyệt kế hoạch tuyển dụng HRM',
    category: 'hrm_recruitment',
    scopeLevel: 'group',
    status: 'active',
    conditions: { businessType: WF_BUSINESS_TYPE_HRM_RECRUITMENT_PLAN },
    graph: {
      steps: [
        {
          stepKey: 'plan_approval',
          name: 'Phê duyệt kế hoạch',
          order: 1,
          taskType: 'rec_plan_approve',
          resolver_type: 'direct_manager',
          allowsReject: true,
        },
      ],
    },
  };
}

export function buildHrmRequisitionApprovalDefinition() {
  return {
    workflowCode: WF_HRM_REQUISITION_APPROVAL_CODE,
    name: 'Phê duyệt yêu cầu tuyển dụng HRM',
    category: 'hrm_recruitment',
    scopeLevel: 'group',
    status: 'active',
    conditions: { businessType: WF_BUSINESS_TYPE_HRM_REQUISITION },
    graph: {
      steps: [
        {
          stepKey: 'requisition_approval',
          name: 'Phê duyệt yêu cầu tuyển',
          order: 1,
          taskType: 'rec_req_approve',
          resolver_type: 'direct_manager',
          allowsReject: true,
        },
      ],
    },
  };
}

export function buildHrmCandidatePipelineDefinition() {
  return {
    workflowCode: WF_HRM_CANDIDATE_PIPELINE_CODE,
    name: 'Roadmap ứng viên HRM',
    category: 'hrm_recruitment',
    scopeLevel: 'group',
    status: 'active',
    conditions: { businessType: WF_BUSINESS_TYPE_HRM_CANDIDATE },
    graph: {
      steps: [
        { stepKey: 'intake', name: 'Tiếp nhận', order: 1, taskType: 'rec_intake', allowsReject: true },
        { stepKey: 'screening', name: 'Sàng lọc', order: 2, taskType: 'rec_screening', allowsReject: true },
        { stepKey: 'interview', name: 'Phỏng vấn', order: 3, taskType: 'rec_interview', allowsReject: true },
        { stepKey: 'offer', name: 'Đề nghị', order: 4, taskType: 'rec_offer', allowsReject: true },
      ],
    },
  };
}
