"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GROUP_APPROVER_USER = exports.MASTER_COMPANY_HOLDING = exports.MASTER_TENANT_XEVN = exports.MEMBER_COMPANY_MAIN = exports.MEMBER_TENANT_XE_DU_LICH = exports.WF_BUSINESS_TYPE_DEFINITION_REVIEW = exports.WF_BUSINESS_TYPE_HRM_CANDIDATE = exports.WF_BUSINESS_TYPE_HRM_REQUISITION = exports.WF_BUSINESS_TYPE_HRM_RECRUITMENT_PLAN = exports.WF_HRM_CANDIDATE_PIPELINE_CODE = exports.WF_HRM_REQUISITION_APPROVAL_CODE = exports.WF_HRM_RECRUITMENT_PLAN_APPROVAL_CODE = exports.WF_BUSINESS_TYPE_HRM_LEAVE = exports.WF_HRM_LEAVE_APPROVAL_CODE = exports.WF_BUSINESS_TYPE_HRM_CATALOG = exports.WF_HRM_CATALOG_XE_DU_LICH_CODE = void 0;
exports.buildHrmLeaveApprovalWorkflowDefinition = buildHrmLeaveApprovalWorkflowDefinition;
exports.buildXeDuLichCatalogWorkflowDefinition = buildXeDuLichCatalogWorkflowDefinition;
exports.buildHrmRecruitmentPlanApprovalDefinition = buildHrmRecruitmentPlanApprovalDefinition;
exports.buildHrmRequisitionApprovalDefinition = buildHrmRequisitionApprovalDefinition;
exports.buildHrmCandidatePipelineDefinition = buildHrmCandidatePipelineDefinition;
/** Quy trình phê duyệt bổ sung danh mục HRM — CT Du lịch X.E */
exports.WF_HRM_CATALOG_XE_DU_LICH_CODE = 'wf_hrm_catalog_extension_xe_du_lich';
exports.WF_BUSINESS_TYPE_HRM_CATALOG = 'hrm_catalog_extension';
/** CD-FB-07 — HRM leave approval pilot (ADR-WORKFLOW-RESOLVER-DYNAMIC §9) */
exports.WF_HRM_LEAVE_APPROVAL_CODE = 'hrm_leave_approval';
exports.WF_BUSINESS_TYPE_HRM_LEAVE = 'hrm_leave';
/** XHRM-REC-WF-BE-01 — recruitment bridges (ADR-XBOS-HRM-RECRUITMENT-WORKFLOW-BRIDGE §3 Q1) */
exports.WF_HRM_RECRUITMENT_PLAN_APPROVAL_CODE = 'hrm_recruitment_plan_approval';
exports.WF_HRM_REQUISITION_APPROVAL_CODE = 'hrm_requisition_approval';
exports.WF_HRM_CANDIDATE_PIPELINE_CODE = 'hrm_candidate_pipeline';
exports.WF_BUSINESS_TYPE_HRM_RECRUITMENT_PLAN = 'hrm_recruitment_plan';
exports.WF_BUSINESS_TYPE_HRM_REQUISITION = 'hrm_requisition';
exports.WF_BUSINESS_TYPE_HRM_CANDIDATE = 'hrm_candidate';
/** UF-XBOS-08 — pending inbox after canvas definition save (U64 no seed). */
exports.WF_BUSINESS_TYPE_DEFINITION_REVIEW = 'workflow_definition_review';
exports.MEMBER_TENANT_XE_DU_LICH = 'xe-du-lich';
exports.MEMBER_COMPANY_MAIN = 'main';
exports.MASTER_TENANT_XEVN = 'xevn';
exports.MASTER_COMPANY_HOLDING = 'holding';
exports.GROUP_APPROVER_USER = 'ceo@xe.vn';
function buildHrmLeaveApprovalWorkflowDefinition() {
    return {
        workflowCode: exports.WF_HRM_LEAVE_APPROVAL_CODE,
        name: 'Phê duyệt đơn nghỉ phép HRM',
        category: 'hrm_leave',
        scopeLevel: 'group',
        status: 'active',
        conditions: {
            businessType: exports.WF_BUSINESS_TYPE_HRM_LEAVE,
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
function buildXeDuLichCatalogWorkflowDefinition() {
    return {
        workflowCode: exports.WF_HRM_CATALOG_XE_DU_LICH_CODE,
        name: 'Phê duyệt bổ sung danh mục HRM — X.E Du lịch VN',
        category: 'hrm_catalog',
        scopeLevel: 'group',
        status: 'active',
        conditions: {
            memberTenantId: exports.MEMBER_TENANT_XE_DU_LICH,
            memberCompanyId: exports.MEMBER_COMPANY_MAIN,
            businessType: exports.WF_BUSINESS_TYPE_HRM_CATALOG,
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
                    assigneeUserId: exports.GROUP_APPROVER_USER,
                    allowsReject: true,
                },
            ],
        },
    };
}
/** Canvas-ready templates for recruitment (U65 — no seed; FE/canvas activates). */
function buildHrmRecruitmentPlanApprovalDefinition() {
    return {
        workflowCode: exports.WF_HRM_RECRUITMENT_PLAN_APPROVAL_CODE,
        name: 'Phê duyệt kế hoạch tuyển dụng HRM',
        category: 'hrm_recruitment',
        scopeLevel: 'group',
        status: 'active',
        conditions: { businessType: exports.WF_BUSINESS_TYPE_HRM_RECRUITMENT_PLAN },
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
function buildHrmRequisitionApprovalDefinition() {
    return {
        workflowCode: exports.WF_HRM_REQUISITION_APPROVAL_CODE,
        name: 'Phê duyệt yêu cầu tuyển dụng HRM',
        category: 'hrm_recruitment',
        scopeLevel: 'group',
        status: 'active',
        conditions: { businessType: exports.WF_BUSINESS_TYPE_HRM_REQUISITION },
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
function buildHrmCandidatePipelineDefinition() {
    return {
        workflowCode: exports.WF_HRM_CANDIDATE_PIPELINE_CODE,
        name: 'Roadmap ứng viên HRM',
        category: 'hrm_recruitment',
        scopeLevel: 'group',
        status: 'active',
        conditions: { businessType: exports.WF_BUSINESS_TYPE_HRM_CANDIDATE },
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
