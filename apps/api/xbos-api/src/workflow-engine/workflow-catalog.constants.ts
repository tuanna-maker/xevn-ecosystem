/** Quy trình phê duyệt bổ sung danh mục HRM — CT Du lịch X.E */
export const WF_HRM_CATALOG_XE_DU_LICH_CODE = 'wf_hrm_catalog_extension_xe_du_lich';
export const WF_BUSINESS_TYPE_HRM_CATALOG = 'hrm_catalog_extension';
export const MEMBER_TENANT_XE_DU_LICH = 'xe-du-lich';
export const MEMBER_COMPANY_MAIN = 'main';
export const MASTER_TENANT_XEVN = 'xevn';
export const MASTER_COMPANY_HOLDING = 'holding';
export const GROUP_APPROVER_USER = 'ceo@xe.vn';

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
