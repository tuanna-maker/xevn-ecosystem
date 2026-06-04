import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Outlet, matchPath, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ChevronRight,
  AlertTriangle,
  Info,
  RefreshCw,
  CircleUser,
  Building2,
  User,
  ShieldCheck,
  GitBranch,
  FileText,
  Coins,
  Tag,
  Search,
  UserCheck,
  FileArchive,
  Check,
  X,
  Trash2,
  Upload,
  Eye,
  Calendar,
  ChevronDown,
  Plus,
  ArrowLeft,
  Network,
  Warehouse,
  LayoutGrid,
  Package,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import {
  type PersonaRole,
  type UnifiedTask,
  mockRailModules,
  mockUnifiedTasks,
  mockPortalAlerts,
  type PortalAlert,
  filterTasksByPersona,
  filterAlertsByPersona,
  filterRailByRole,
  countInProgressByModule,
  getKpiSeriesForPersona,
} from '../../data/command-center-mock';
import {
  ENTITY_LEVEL_LABELS,
  ENTITY_LEVEL_SELECT_ORDER,
  type Company,
  type EntityLevelCode,
} from '../../data/mock-data';
import {
  getMockEffectiveEmployeeMetadataDefaults,
  type MockEmployeeMetadataFieldRow,
} from '../../data/mock-effective-config';
import {
  type InfrastructureFoundationCategory,
  INITIAL_INFRASTRUCTURE_FOUNDATION_CATEGORIES,
} from '../../data/infrastructure-foundation-catalog';
import { ORG_GRADE_LEVELS, type OrgGradeBand } from '../../data/org-grade-reference';
import {
  type DeptSystemFoundationTemplate,
} from '../../data/dept-system-foundation-catalog';
import {
  WF_NODE_BOD,
  WF_NODE_END_OK,
  WF_NODE_END_REJECT,
  WF_NODE_START,
  createDefaultTransitions,
  ensureTransitions,
  getInitialWorkflowGraphDefinitions,
  getRaciWorkflowPrototypeDefinitions,
  WORKFLOW_EDGE_FULL_LABELS,
  WORKFLOW_HANDLER_ROLES,
  WORKFLOW_TRANSITION_KINDS,
  workflowHandlerRoleAllowsRejectOutcome,
  type WorkflowDefinition,
  type WorkflowGraphStep,
  type WorkflowStepAction,
  type WorkflowTransitionKind,
} from '../../data/workflow-graph';
import { RACI_PERMISSION_BOOTSTRAP } from '../../data/raci-permission-seeds';
import { RACI_LETTER_MEANINGS, RACI_ORG_COLUMNS, RACI_SOURCE_FILE } from '../../data/xevn-raci-catalog';
import { OrgGradeOrgChart } from '../../components/org/OrgGradeOrgChart';
import {
  AutoResizeTextarea,
  NAV_SUBSIDEBAR_HELPER_CLASS,
  NAV_SUBSIDEBAR_ITEM_ACTIVE_CLASS,
  NAV_SUBSIDEBAR_ITEM_IDLE_CLASS,
  NAV_SUBSIDEBAR_ITEM_ROW_GAP,
  NAV_SUBSIDEBAR_TITLE_CLASS,
  NAV_SUBSIDEBAR_WIDTH_CLASS,
  SETTINGS_COL,
  SETTINGS_CONTROL_TEXT,
  SETTINGS_FIELD_COMPACT,
  SETTINGS_FIELD_SHELL,
  SETTINGS_LABEL_CLASS,
  SETTINGS_PAGE_SUBTITLE_CLASS,
  SETTINGS_PAGE_TITLE_CLASS,
  SETTINGS_RADIUS_CARD,
  SETTINGS_RADIUS_INPUT,
  SETTINGS_SECTION_GRID,
  SETTINGS_SECTION_STACK,
  SETTINGS_SECTION_TITLE_CLASS,
  WORKSPACE_STICKY_HEADER_ROW,
  WORKSPACE_STICKY_HEADER_AXIS_H,
  WORKSPACE_STICKY_SEARCH_SHELL_CLASS,
  XEVN_VIEWPORT_PADDING,
} from './settings-form-pattern';
import { WorkspaceLayout } from './WorkspaceLayout';
import { CommandCenterModuleRail } from './CommandCenterModuleRail';
import { WorkflowCanvas, formatWorkflowDrawerDetails } from './WorkflowCanvas';
import { HrmCollapsibleSidebar } from '../../modules/hrm/HrmCollapsibleSidebar';
import {
  readHrmModuleRailCollapsed,
  writeHrmModuleRailCollapsed,
} from '../../modules/hrm/hrmEmbedNavStorage';
import { HrmApiHealthBanner } from '../../components/common/HrmApiHealthBanner';
import { hrmPortalPath } from '../../modules/hrm/paths';
import { parseCommandCenterSettingsDeepLink } from '../../modules/hrm/commandCenterUrl';
import { TenantConfigScopeBar } from './TenantConfigScopeBar';
import { CompanyRaciPanel } from './CompanyRaciPanel';
import {
  GROUP_HOLDING_COMPANY_ID,
  MASTER_TENANT_ID,
  MEMBER_DEFAULT_COMPANY_ID,
} from '../../constants/tenant';
import { ApiHealthBanner } from '../../components/common/ApiHealthBanner';
import { ApiLoadBanner } from '../../components/common/ApiLoadBanner';
import {
  fetchInfrastructureSettings,
  fetchInfrastructureSummary,
  resolveInfrastructureFoundationLoad,
  saveInfrastructureSettings,
  type InfrastructureSettingsPayload,
  INFRASTRUCTURE_MOCK_SEED,
} from '../../integrations/infrastructureApi';
import {
  deptTemplatesLoadErrorMessage,
  upsertDeptSystemTemplate,
} from '../../integrations/deptSystemTemplatesApi';
import { loadCcCatalogRows, saveCcCatalogRows } from '../../integrations/commandCenterCatalogApi';
import { fetchCommandCenterInboxTasks } from '../../integrations/commandCenterInboxApi';
import { fetchPortalAlerts } from '../../integrations/portalAlertsApi';
import { useCommandCenterKpiRail } from '../../hooks/useCommandCenterKpiRail';
import { useDeptSystemTemplates } from '../../hooks/useDeptSystemTemplates';
import { useTenantScope } from '../../contexts/GlobalFilterContext';
import { describeScopePlaneForUi } from '../../integrations/commandCenterScope';
import {
  completeWorkflowTask,
  fetchWorkflowInstanceDetail,
  listWorkflowDefinitions,
  saveWorkflowDefinition,
} from '../../integrations/workflowEngineApi';
import {
  normalizeWorkflowInstanceDetail,
  type WorkflowInstanceDetailPayload,
} from '../../integrations/workflowInstanceMapper';
import {
  deleteLegalDocumentApi,
  deleteShareholderApi,
  legalDocumentViewUrl,
  listLegalDocuments,
  listShareholders,
  saveLegalDocument,
  saveShareholder,
  uploadLegalDocumentFile,
} from '../../integrations/legalEntityProfileApi';
import { fetchCommandCenterWorkspaceMeta } from '../../integrations/commandCenterWorkspaceApi';
import {
  fetchPermissionMatrix,
  savePermissionMatrix,
} from '../../integrations/positionRbacApi';
import {
  deleteOrgUnit,
  saveOrgUnit,
} from '../../integrations/orgFoundationApi';
import { WorkflowTaskDetailDrawer } from './WorkflowTaskDetailDrawer';
import { CatalogGovernancePanel } from './CatalogGovernancePanel';
import { AssetRequestPanel } from './AssetRequestPanel';
import {
  apiRowToWorkflowDefinition,
  workflowDefinitionToApiPayload,
} from '../../integrations/workflowMapper';
import { allowMockFallback } from '../../utils/mockPolicy';
import {
  ALERTS_STRICT_EMPTY_HINT,
  INBOX_STRICT_EMPTY_HINT,
  INBOX_STRICT_LOAD_FAILED,
  resolveAlertsStrictBanner,
  resolveCommandCenterInboxTasks,
  resolveInboxStrictBanner,
  resolveWorkflowDefinitionsStrictBanner,
  WORKFLOW_DEFINITIONS_STRICT_EMPTY_HINT,
  WORKFLOW_DEFINITIONS_STRICT_LOAD_FAILED,
} from '../../utils/commandCenterStrictMode';
import {
  buildGroupHrCatalogLayout,
  getGroupHrCatalogFields,
  getGroupHrCatalogGroups,
} from '../../data/group-hr-catalog-presets';
import { companyFullName, companyPrimaryLabel } from '../../utils/company-display';
import {
  fetchGroupHrCatalogFieldDefs,
  resolveHrmCatalogKey,
  syncGroupHrFieldDefsToHrm,
  type GroupHrCatalogFieldDto,
} from '../../integrations/groupHrCatalogApi';
import {
  fetchGroupMemberUnitsForCommandCenter,
  GROUP_HOLDING_ROOT_ID,
} from '../../integrations/tenantScopeApi';
import {
  createLegalEntity,
  fetchHoldingLegalEntities,
  fetchLegalEntityForEdit,
  fetchLegalEntities,
  loadLegalEntityDepartmentTree,
  resolveLegalEntityApiIdForCompany,
  resolveLegalEntityApiIdFromList,
  updateLegalEntity,
  type LegalEntityApiRow,
  type OrgTreeNode,
} from '../../integrations/orgFoundationApi';
import { mapLegalEntityRowToCompany } from '../../integrations/legalEntityMapper';
import {
  isLegalEntityValidationHttpError,
  mapLegalEntityRowToCompanyForm,
  parseLegalEntitySaveFieldErrors,
} from '../../integrations/legalEntityFormMapper';

const RAIL_STROKE = 1.5;
const SYSTEM_SETTINGS = 'SYSTEM_SETTINGS';

/** Nhóm Thiết lập công ty — 4 mục theo phân cấp nghiệp vụ */
type CompanySetupMenuKey =
  | 'company_member_units'
  | 'company_infrastructure'
  | 'company_dept_system';

type SettingsMenuKey =
  | CompanySetupMenuKey
  | 'tenant_departments'
  | 'company_group_hr'
  | 'permission'
  | 'workflow'
  | 'document'
  | 'measurement'
  | 'pricing'
  | 'hrm_catalog_governance'
  | 'asset_requests';

const COMPANY_SETUP_MENU_KEYS: CompanySetupMenuKey[] = [
  'company_member_units',
  'company_infrastructure',
  'company_dept_system',
];

function isCompanySetupMenuKey(k: SettingsMenuKey): k is CompanySetupMenuKey {
  return (COMPANY_SETUP_MENU_KEYS as readonly string[]).includes(k);
}

/** Ma trận phân quyền X-BOS — theo module + vai trò */
type PermissionModuleKey = 'org' | 'logistics' | 'hr' | 'system';

type PermissionDataScope = 'personal' | 'department' | 'legal_entity' | 'group';

type PermissionMatrixRow = {
  id: string;
  moduleKey: PermissionModuleKey;
  featureLabel: string;
  view: boolean;
  write: boolean;
  delete: boolean;
  approve: boolean;
  dataScope: PermissionDataScope;
};

type PermissionRoleDef = { id: string; label: string };

const PERMISSION_MODULE_META: ReadonlyArray<{
  key: PermissionModuleKey;
  title: string;
}> = [
  { key: 'org', title: 'Quản trị tổ chức' },
  { key: 'logistics', title: 'Hạ tầng Logistics' },
  { key: 'hr', title: 'Hồ sơ Nhân sự' },
  { key: 'system', title: 'Cấu hình hệ thống' },
];

const PERMISSION_DATA_SCOPE_LABELS: Record<PermissionDataScope, string> = {
  personal: 'Cá nhân',
  department: 'Phòng ban',
  legal_entity: 'Pháp nhân',
  group: 'Tập đoàn',
};

const PERMISSION_ROW_DEFS: ReadonlyArray<{
  id: string;
  moduleKey: PermissionModuleKey;
  featureLabel: string;
}> = [
  {
    id: 'pm-org-1',
    moduleKey: 'org',
    featureLabel: 'Danh sách và hồ sơ đơn vị thành viên',
  },
  {
    id: 'pm-org-2',
    moduleKey: 'org',
    featureLabel: 'Tạo mới / chỉnh sửa pháp nhân, cổ đông và tài liệu pháp lý',
  },
  {
    id: 'pm-org-3',
    moduleKey: 'org',
    featureLabel: 'Phê duyệt thay đổi cấu trúc tập đoàn & đăng ký kinh doanh',
  },
  {
    id: 'pm-log-1',
    moduleKey: 'logistics',
    featureLabel: 'Danh mục hạ tầng cơ sở (kho, bãi, ICD, trạm hub)',
  },
  {
    id: 'pm-log-2',
    moduleKey: 'logistics',
    featureLabel: 'Thêm / sửa / ngưng điểm logistics và năng lực pallet–xe',
  },
  {
    id: 'pm-log-3',
    moduleKey: 'logistics',
    featureLabel: 'Đồng bộ tọa độ GPS, địa chỉ và phạm vi pháp nhân sở hữu',
  },
  {
    id: 'pm-hr-1',
    moduleKey: 'hr',
    featureLabel: 'Xem hồ sơ nhân sự xuyên pháp nhân (theo phạm vi)',
  },
  {
    id: 'pm-hr-2',
    moduleKey: 'hr',
    featureLabel: 'Cấu hình trường thông tin nhân sự dùng chung tập đoàn & xem trước biểu mẫu',
  },
  {
    id: 'pm-sys-1',
    moduleKey: 'system',
    featureLabel: 'Ma trận phân quyền, vai trò và chính sách truy cập',
  },
  {
    id: 'pm-sys-2',
    moduleKey: 'system',
    featureLabel: 'Đơn vị đo lường, tiền tệ và tham số giá nội bộ',
  },
  {
    id: 'pm-sys-3',
    moduleKey: 'system',
    featureLabel: 'Quy trình nghiệp vụ và thư viện văn bản / quy định',
  },
];

type PermissionRowSeed = Partial<
  Pick<PermissionMatrixRow, 'view' | 'write' | 'delete' | 'approve' | 'dataScope'>
>;

function buildPermissionMatrix(seeds: Record<string, PermissionRowSeed>): PermissionMatrixRow[] {
  return PERMISSION_ROW_DEFS.map((def) => {
    const s = seeds[def.id] ?? {};
    return {
      ...def,
      view: s.view ?? false,
      write: s.write ?? false,
      delete: s.delete ?? false,
      approve: s.approve ?? false,
      dataScope: s.dataScope ?? 'personal',
    };
  });
}

function buildRaciPermissionMatrixMap(): Record<string, PermissionMatrixRow[]> {
  const o: Record<string, PermissionMatrixRow[]> = {};
  for (const [roleId, seeds] of Object.entries(RACI_PERMISSION_BOOTSTRAP.seedsByRoleId)) {
    o[roleId] = buildPermissionMatrix(seeds as Record<string, PermissionRowSeed>);
  }
  return o;
}

function permissionScopeSelectVisual(scope: PermissionDataScope): string {
  switch (scope) {
    case 'personal':
      return 'border-slate-300 bg-slate-50 text-slate-800';
    case 'department':
      return 'border-cyan-300/90 bg-cyan-50 text-cyan-950';
    case 'legal_entity':
      return 'border-amber-300/90 bg-amber-50 text-amber-950';
    case 'group':
      return 'border-xevn-primary/45 bg-xevn-primary/10 text-xevn-primary';
    default:
      return 'border-xevn-border bg-white text-xevn-text';
  }
}

type ShareholderRow = {
  id: string;
  holderName: string;
  identityCode: string;
  ratioPercent: number;
  contributedValue: number;
  submitted: boolean;
};

type LegalDocRow = {
  id: string;
  documentName: string;
  documentCode: string;
  issuedDate: string;
  expiredDate: string;
  fileName: string;
  fileUrl?: string;
  submitted: boolean;
};

function isPersistedApiId(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
}

/** Phòng/Ban thuộc một pháp nhân (tab Chi tiết) */
type LegalDepartmentRow = {
  id: string;
  code: string;
  name: string;
  parentDeptId: string;
  headId: string;
  functionText: string;
};

/** Định nghĩa trường thông tin bổ sung trên hồ sơ nhân sự theo pháp nhân */
type EmployeeMetadataDataType = 'text' | 'number' | 'date' | 'select' | 'phone' | 'email';

type EmployeeMetadataFieldRow = {
  id: string;
  fieldName: string;
  dataType: EmployeeMetadataDataType;
  /** Khi kiểu Select: các giá trị cách nhau bởi dấu phẩy */
  selectConfig: string;
};

/** Hạ tầng cơ sở — prototype Logistics (Kho / Bãi / VP…) */
type InfrastructureFacilityType =
  | 'warehouse'
  | 'parking'
  | 'office'
  | 'icd'
  | 'hub'
  | 'workshop';

type InfrastructureSiteStatus = 'active' | 'maintenance' | 'inactive';

type InfrastructureSiteRow = {
  id: string;
  siteCode: string;
  name: string;
  facilityType: InfrastructureFacilityType;
  /** Đơn vị vận hành / trực thuộc (id pháp nhân) */
  operatingEntityId: string;
  capacitySummary: string;
  status: InfrastructureSiteStatus;
  gpsCoords: string;
  addressDetail: string;
  hotline: string;
  directManager: string;
  leaseLegalEndDate: string;
  areaSqm: string;
  palletOrVehicleMax: string;
  ownerLegalEntityId: string;
  /** Custom fields theo config Origin/Variant (prototype) */
  customFields: Record<string, string>;
};

type InfrastructureFormState = Omit<InfrastructureSiteRow, 'id'>;

type InfrastructureBaseBlockCode = 'general' | 'location' | 'capacity';
type InfrastructureCustomBlockCode = string;

type InfrastructureCustomFieldDef = {
  id: string;
  fieldCode: string; // fieldCode custom (prototype) - dùng làm key trong customFields
  labelVi: string;
  dataType: EmployeeMetadataDataType; // reuse same data types as HR metadata
  blockCode: InfrastructureCustomBlockCode;
  visible: boolean;
  selectConfig?: string; // CSV options when dataType=select
  hrmCatalogKey?: GroupHrCatalogFieldDto['hrmCatalogKey'];
};

type InfrastructureCustomBlockDef = {
  id: string;
  blockCode: InfrastructureCustomBlockCode;
  labelVi: string;
  visible: boolean;
  order: number;
};

const INFRA_FACILITY_LABELS: Record<InfrastructureFacilityType, string> = {
  warehouse: 'Kho',
  parking: 'Bãi xe',
  office: 'Văn phòng',
  icd: 'Cảng / ICD',
  hub: 'Trạm trung chuyển',
  workshop: 'Xưởng sửa chữa',
};

const INFRA_STATUS_LABELS: Record<InfrastructureSiteStatus, string> = {
  active: 'Hoạt động',
  maintenance: 'Bảo trì',
  inactive: 'Ngừng',
};

const INFRA_CUSTOM_FIELD_FORM_CODE = 'company_infrastructure';
const GROUP_HR_CUSTOM_FIELD_FORM_CODE = 'company_group_hr_profile';
const INFRASTRUCTURE_FACILITY_TYPES: InfrastructureFacilityType[] = [
  'warehouse',
  'parking',
  'office',
  'icd',
  'hub',
  'workshop',
];
const INFRASTRUCTURE_STATUSES: InfrastructureSiteStatus[] = ['active', 'maintenance', 'inactive'];

function slugifyKeyPart(input: string): string {
  const noDiacritics = input.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return noDiacritics
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function makeInfraCustomFieldCode(
  formCode: string,
  blockCode: string,
  labelVi: string,
): string {
  const formPart = slugifyKeyPart(formCode);
  const blockPart = slugifyKeyPart(blockCode);
  const labelPart = slugifyKeyPart(labelVi);
  return `${formPart}__${blockPart}__${labelPart || 'field'}`;
}

function makeInfraCustomBlockCodeFromLabel(labelVi: string): string {
  const slug = slugifyKeyPart(labelVi);
  if (!slug) return 'infra_custom';
  const base = `infra_${slug}`;
  // Avoid accidental collision với hệ thống base blocks.
  if (['general', 'location', 'capacity'].includes(base)) return `${base}_custom`;
  return base || 'infra_custom';
}

function normalizeInfrastructureFormForEntity(
  form: InfrastructureFormState,
): InfrastructureFormState {
  const facilityType = INFRASTRUCTURE_FACILITY_TYPES.includes(form.facilityType)
    ? form.facilityType
    : INFRASTRUCTURE_FACILITY_TYPES[0];
  const status = INFRASTRUCTURE_STATUSES.includes(form.status) ? form.status : INFRASTRUCTURE_STATUSES[0];
  return {
    ...form,
    facilityType: facilityType as InfrastructureFacilityType,
    status: status as InfrastructureSiteStatus,
  };
}

function createEmptyInfrastructureForm(): InfrastructureFormState {
  return normalizeInfrastructureFormForEntity({
    siteCode: '',
    name: '',
    facilityType: INFRASTRUCTURE_FACILITY_TYPES[0] as InfrastructureFacilityType,
    operatingEntityId: '',
    capacitySummary: '',
    status: INFRASTRUCTURE_STATUSES[0] as InfrastructureSiteStatus,
    gpsCoords: '',
    addressDetail: '',
    hotline: '',
    directManager: '',
    leaseLegalEndDate: '',
    areaSqm: '',
    palletOrVehicleMax: '',
    ownerLegalEntityId: '',
    customFields: {},
  });
}

function infrastructureRowToForm(r: InfrastructureSiteRow): InfrastructureFormState {
  const { id, ...rest } = r;
  void id;
  return normalizeInfrastructureFormForEntity(rest);
}

function getInitialInfrastructureSites(): InfrastructureSiteRow[] {
  return [
    {
      id: 'inf-001',
      siteCode: 'KHO-SGN-01',
      name: 'Kho logistics Tân Bình',
      facilityType: 'warehouse',
      operatingEntityId: 'comp-001',
      capacitySummary: '2.400 pallet EU',
      status: 'active',
      gpsCoords: '10.8019, 106.6527',
      addressDetail:
        'Lô A12–A14, KCN Tân Bình mở rộng, Phường Tân Bình, TP.Hồ Chí Minh — cổng container 24/7.',
      hotline: '028 3845 8899',
      directManager: 'Nguyễn Văn Kho',
      leaseLegalEndDate: '2032-12-31',
      areaSqm: '18500',
      palletOrVehicleMax: '2400',
      ownerLegalEntityId: 'comp-001',
      customFields: {},
    },
    {
      id: 'inf-002',
      siteCode: 'BAI-HN-02',
      name: 'Bãi xe tải Cầu Giấy',
      facilityType: 'parking',
      operatingEntityId: 'comp-002',
      capacitySummary: '120 xe tải 10–15T',
      status: 'active',
      gpsCoords: '21.0285, 105.8041',
      addressDetail: 'Ngõ 12 đường Phạm Hùng, Cầu Giấy, Hà Nội',
      hotline: '024 3789 0011',
      directManager: 'Trần Thị Bãi',
      leaseLegalEndDate: '2028-06-30',
      areaSqm: '8200',
      palletOrVehicleMax: '120',
      ownerLegalEntityId: 'comp-002',
      customFields: {},
    },
    {
      id: 'inf-003',
      siteCode: 'ICD-HN-03',
      name: 'ICD trung chuyển Hà Nội',
      facilityType: 'icd',
      operatingEntityId: 'comp-002',
      capacitySummary: '15.000 TEU/năm',
      status: 'maintenance',
      gpsCoords: '20.9970, 105.8412',
      addressDetail: 'Khu công nghiệp ICD Bắc Thăng Long — Hà Nội',
      hotline: '024 7777 0123',
      directManager: 'Nguyễn Văn ICD',
      leaseLegalEndDate: '2029-12-31',
      areaSqm: '32000',
      palletOrVehicleMax: '—',
      ownerLegalEntityId: 'comp-002',
      customFields: {},
    },
    {
      id: 'inf-004',
      siteCode: 'VP-DN-01',
      name: 'Văn phòng điều hành Đà Nẵng',
      facilityType: 'office',
      operatingEntityId: 'comp-003',
      capacitySummary: '180 chỗ làm việc',
      status: 'active',
      gpsCoords: '16.0544, 108.2022',
      addressDetail: 'Tầng 8–9, tòa nhà XEVN Tower, Hải Châu, Đà Nẵng',
      hotline: '0236 3999 012',
      directManager: 'Lê Văn VP',
      leaseLegalEndDate: '2030-01-15',
      areaSqm: '2400',
      palletOrVehicleMax: '—',
      ownerLegalEntityId: 'comp-003',
      customFields: {},
    },
    {
      id: 'inf-005',
      siteCode: 'HUB-CT-01',
      name: 'Hub trung chuyển Cần Thơ',
      facilityType: 'hub',
      operatingEntityId: 'comp-004',
      capacitySummary: '1.200 chuyến/tháng',
      status: 'inactive',
      gpsCoords: '10.0452, 105.7469',
      addressDetail: 'Khu logistics Cần Thơ — Ninh Kiều',
      hotline: '0292 8888 321',
      directManager: 'Trần Văn Hub',
      leaseLegalEndDate: '2027-08-20',
      areaSqm: '9500',
      palletOrVehicleMax: '—',
      ownerLegalEntityId: 'comp-004',
      customFields: {},
    },
  ];
}

const WORKFLOW_STEP_ACTION_LABELS: Record<WorkflowStepAction, string> = {
  approve: 'Phê duyệt',
  sign: 'Ký duyệt',
  input: 'Nhập liệu',
};

const WORKFLOW_TRIGGER_EVENTS: ReadonlyArray<{ id: string; label: string }> = [
  { id: 'hr.recruitment.request_submitted', label: 'Hồ sơ tuyển dụng được gửi duyệt' },
  { id: 'hr.org_change.request_submitted', label: 'Đề xuất thay đổi cơ cấu / JD (HCNS)' },
  { id: 'finance.capex.workflow_started', label: 'Đề xuất đầu tư / CAPEX khởi tạo' },
  { id: 'logistics.inventory.adjustment_requested', label: 'Yêu cầu điều chỉnh tồn kho / phân bổ' },
  { id: 'contract.sign_requested', label: 'Yêu cầu ký hợp đồng' },
  { id: 'procurement.po_approval', label: 'Phê duyệt đơn đặt hàng' },
];

const WORKFLOW_RELATED_MODULES: ReadonlyArray<{ id: string; label: string }> = [
  { id: 'hr', label: 'Nhân sự (HRM)' },
  { id: 'finance', label: 'Tài chính & Kế toán' },
  { id: 'logistics', label: 'Vận hành / Logistics' },
  { id: 'xbos', label: 'X-BOS Core' },
  { id: 'legal', label: 'Pháp chế' },
];

function createWorkflowStepId(): string {
  return `ws-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function createWorkflowGraphStep(
  order: number,
  patch: Partial<WorkflowGraphStep> = {},
): WorkflowGraphStep {
  const id = patch.id ?? createWorkflowStepId();
  const defaults: WorkflowGraphStep = {
    id,
    order,
    taskName: '',
    handlerRoleId: 'dept_head',
    stepAction: 'approve',
    slaHours: 24,
    relatedModuleId: 'hr',
    transitions: createDefaultTransitions({
      approveTo: WF_NODE_END_OK,
      rejectTo: WF_NODE_START,
      exceptionTo: WF_NODE_BOD,
    }),
  };
  return {
    ...defaults,
    ...patch,
    id: patch.id ?? id,
    order: patch.order ?? order,
    transitions: ensureTransitions(patch.transitions ?? defaults.transitions),
  };
}

function createEmptyWorkflowDefinition(tempId: string): WorkflowDefinition {
  return {
    id: tempId,
    code: '',
    name: '',
    applyingEntityId: '',
    triggerEvent: 'hr.recruitment.request_submitted',
    totalSlaHours: 72,
    steps: [createWorkflowGraphStep(1)],
  };
}

function workflowDestinationLabel(form: WorkflowDefinition, nodeId: string): string {
  switch (nodeId) {
    case WF_NODE_START:
      return 'Bắt đầu';
    case WF_NODE_END_OK:
      return 'Hoàn thành';
    case WF_NODE_END_REJECT:
      return 'Kết thúc từ chối';
    case WF_NODE_BOD:
      return 'BOD / Ngoại lệ';
    default: {
      const s = form.steps.find((x) => x.id === nodeId);
      if (!s) return nodeId;
      const title = s.taskName?.trim() || 'Chưa đặt tên';
      return `Bước ${s.order} · ${title}`;
    }
  }
}

function buildWorkflowDestinationOptions(
  form: WorkflowDefinition,
): { value: string; label: string }[] {
  const o: { value: string; label: string }[] = [
    { value: WF_NODE_START, label: 'Bắt đầu' },
    { value: WF_NODE_END_OK, label: 'Hoàn thành' },
    { value: WF_NODE_END_REJECT, label: 'Kết thúc từ chối' },
    { value: WF_NODE_BOD, label: 'BOD / Ngoại lệ' },
  ];
  for (const s of [...form.steps].sort((a, b) => a.order - b.order)) {
    o.push({
      value: s.id,
      label: `Bước ${s.order}: ${s.taskName?.trim() || 'Chưa đặt tên'}`,
    });
  }
  return o;
}

type CompanyDetailTab = 'legal' | 'raci';

type CompanyFormState = {
  nameVi: string;
  nameEn: string;
  shortName: string;
  enterpriseCode: string;
  enterpriseType: string;
  taxCode: string;
  headOfficeAddress: string;
  headOfficeCountry: string;
  charterCapital: number;
  firstIssueDate: string;
  issuePlace: string;
  legalRepName: string;
  legalRepTitle: string;
  legalRepIdNo: string;
  legalRepPhone: string;
  legalRepAddress: string;
  hotline: string;
  companyEmail: string;
  website: string;
  entityLevel: EntityLevelCode;
  parentEntityId: string;
};

function createEmptyCompanyForm(): CompanyFormState {
  return {
    nameVi: '',
    nameEn: '',
    shortName: '',
    enterpriseCode: '',
    enterpriseType: 'joint-stock',
    taxCode: '',
    headOfficeAddress: '',
    headOfficeCountry: 'Việt Nam',
    charterCapital: 0,
    firstIssueDate: '',
    issuePlace: '',
    legalRepName: '',
    legalRepTitle: 'Chủ tịch Hội đồng quản trị',
    legalRepIdNo: '',
    legalRepPhone: '',
    legalRepAddress: '',
    hotline: '',
    companyEmail: '',
    website: '',
    entityLevel: 'subsidiary',
    parentEntityId: '',
  };
}

function buildFormFromCompany(c: Company): CompanyFormState {
  return {
    ...createEmptyCompanyForm(),
    nameVi: c.name,
    nameEn: '',
    shortName: c.code,
    headOfficeAddress: c.address,
    entityLevel: c.entityLevel ?? 'subsidiary',
    parentEntityId: c.parentEntityId ?? '',
  };
}

function getParentEntityLabel(parentId: string | null | undefined, list: Company[]): string {
  if (!parentId) return '';
  const p = list.find((x) => x.id === parentId);
  return p ? `${p.code} — ${p.name}` : '';
}

const DEPT_HEAD_OPTIONS: Array<{ id: string; label: string }> = [
  { id: '', label: '— Chọn trưởng bộ phận —' },
  { id: 'head-1', label: 'Nguyễn Văn An — TGĐ' },
  { id: 'head-2', label: 'Trần Thị Bích — Phó TGĐ' },
  { id: 'head-3', label: 'Lê Văn Cường — GĐ HCNS' },
  { id: 'head-4', label: 'Phạm Minh Duy — GĐ CN Hà Nội' },
  { id: 'head-5', label: 'Hoàng Thu E — GĐ CN Đà Nẵng' },
  { id: 'head-6', label: 'Đỗ Quân F — Trưởng phòng NS' },
];

const EMPLOYEE_METADATA_DATA_TYPES: Array<{ value: EmployeeMetadataDataType; label: string }> = [
  { value: 'text', label: 'Text' },
  { value: 'number', label: 'Number' },
  { value: 'date', label: 'Date' },
  { value: 'select', label: 'Select' },
  { value: 'phone', label: 'Phone' },
  { value: 'email', label: 'Email' },
];

function createDefaultEmployeeMetadataRows(
  legalEntityId: string | null | undefined,
  tenantId?: string | null,
): EmployeeMetadataFieldRow[] {
  const preset = getGroupHrCatalogFields(tenantId);
  if (preset) {
    return preset.map((x) => ({
      id: x.id,
      fieldName: x.fieldName,
      dataType: x.dataType,
      selectConfig: x.selectConfig,
    }));
  }
  const defaults: MockEmployeeMetadataFieldRow[] = getMockEffectiveEmployeeMetadataDefaults(legalEntityId);
  return defaults.map((x) => ({
    id: x.id,
    fieldName: x.fieldName,
    dataType: x.dataType,
    selectConfig: x.selectConfig,
  }));
}

function toGroupHrFieldDefs(rows: EmployeeMetadataFieldRow[]): InfrastructureCustomFieldDef[] {
  return rows.map((r) => ({
    id: `ghr-${r.id}`,
    fieldCode: r.id,
    labelVi: r.fieldName,
    dataType: r.dataType,
    blockCode: 'general',
    visible: true,
    selectConfig: r.selectConfig,
  }));
}

function toEmployeeMetadataRows(defs: InfrastructureCustomFieldDef[]): EmployeeMetadataFieldRow[] {
  return defs
    .filter((x) => x.visible)
    .map((d) => ({
      id: d.fieldCode,
      fieldName: d.labelVi,
      dataType: d.dataType,
      selectConfig: d.selectConfig ?? '',
    }));
}

function parseMetadataSelectOptions(csv: string): string[] {
  return csv
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function flattenOrgTreeToDeptRows(
  nodes: OrgTreeNode[],
  parentDeptId = '',
): LegalDepartmentRow[] {
  const rows: LegalDepartmentRow[] = [];
  for (const node of nodes) {
    const isDept = node.org_type === 'department' || node.org_type === 'org_unit';
    if (isDept) {
      rows.push({
        id: node.id,
        code: node.code ?? '',
        name: node.name ?? '',
        parentDeptId,
        headId: String(node.payload?.headId ?? node.payload?.managerId ?? ''),
        functionText: String(node.payload?.functionText ?? node.payload?.function ?? ''),
      });
    }
    if (node.children?.length) {
      rows.push(...flattenOrgTreeToDeptRows(node.children, isDept ? node.id : parentDeptId));
    }
  }
  return rows;
}

function createBlankDeptRow(): LegalDepartmentRow {
  return {
    id: `dept-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    code: '',
    name: '',
    parentDeptId: '',
    headId: '',
    functionText: '',
  };
}

function seedDepartmentsForCompany(companyId: string): LegalDepartmentRow[] {
  const seeds: Record<string, LegalDepartmentRow[]> = {
    'comp-001': [
      {
        id: 'd-hq-bod',
        code: 'BOD',
        name: 'Hội đồng quản trị',
        parentDeptId: '',
        headId: 'head-1',
        functionText: 'Chiến lược & giám sát',
      },
      {
        id: 'd-hq-exco',
        code: 'EXCO',
        name: 'Khối điều hành',
        parentDeptId: '',
        headId: 'head-2',
        functionText: 'Điều hành hàng ngày',
      },
      {
        id: 'd-hq-hr',
        code: 'HR',
        name: 'Phòng Nhân sự',
        parentDeptId: 'd-hq-exco',
        headId: 'head-3',
        functionText: 'Tuyển dụng, C&B',
      },
    ],
    'comp-002': [
      {
        id: 'd-hn-gd',
        code: 'CN-HN-GD',
        name: 'Ban Giám đốc',
        parentDeptId: '',
        headId: 'head-4',
        functionText: 'Điều hành chi nhánh Hà Nội',
      },
    ],
    'comp-003': [
      {
        id: 'd-dn-gd',
        code: 'CN-DN-GD',
        name: 'Ban Giám đốc',
        parentDeptId: '',
        headId: 'head-5',
        functionText: 'Điều hành chi nhánh Đà Nẵng',
      },
    ],
    'comp-004': [
      {
        id: 'd-ct-ns',
        code: 'CN-CT-NS',
        name: 'Phòng Nhân sự',
        parentDeptId: '',
        headId: 'head-6',
        functionText: 'Nhân sự CN Cần Thơ',
      },
    ],
  };
  return seeds[companyId] ?? [];
}

const companySetupSubMenus: Array<{ key: CompanySetupMenuKey; label: string; Icon: LucideIcon }> = [
  {
    key: 'company_member_units',
    label: 'Đơn vị thành viên',
    Icon: Network,
  },
  {
    key: 'company_infrastructure',
    label: 'Hạ tầng cơ sở',
    Icon: Warehouse,
  },
  {
    key: 'company_dept_system',
    label: 'Hệ thống Phòng/Ban',
    Icon: LayoutGrid,
  },
];

const settingsMenusAfterCompany: Array<{ key: SettingsMenuKey; label: string; Icon: LucideIcon }> = [
  { key: 'tenant_departments', label: 'Phòng/Ban pháp nhân', Icon: LayoutGrid },
  { key: 'company_group_hr', label: 'Danh mục hồ sơ nhân sự', Icon: UserCheck },
  { key: 'hrm_catalog_governance', label: 'Duyệt danh mục HRM', Icon: FileArchive },
  { key: 'permission', label: 'Hệ thống phân quyền', Icon: ShieldCheck },
  { key: 'workflow', label: 'Hệ thống quy trình', Icon: GitBranch },
  { key: 'asset_requests', label: 'Yêu cầu tài sản', Icon: Package },
  { key: 'document', label: 'Hệ thống văn bản/Quy định', Icon: FileText },
  { key: 'measurement', label: 'Hệ thống đo lường/Tiền tệ', Icon: Coins },
  { key: 'pricing', label: 'Thiết lập hệ thống giá', Icon: Tag },
];

function settingsWorkspaceTitle(
  menu: SettingsMenuKey,
  ctx: {
    companySettingsView: 'list' | 'form';
    companyEntityId: string | null;
    entityShortName: string;
    workflowView?: 'list' | 'detail';
    workflowDetailTitle?: string;
    deptSystemDetailOpen?: boolean;
    deptSystemDetailName?: string;
  },
): string {
  const labels: Record<SettingsMenuKey, string> = {
    company_member_units: 'Đơn vị thành viên',
    company_infrastructure: 'Hạ tầng cơ sở',
    company_dept_system: 'Hệ thống Phòng/Ban',
    tenant_departments: 'Phòng/Ban pháp nhân',
    company_group_hr: 'Danh mục hồ sơ nhân sự',
    hrm_catalog_governance: 'Duyệt danh mục HRM',
    permission: 'Hệ thống phân quyền',
    workflow: 'Hệ thống quy trình',
    asset_requests: 'Yêu cầu tài sản',
    document: 'Hệ thống văn bản/Quy định',
    measurement: 'Hệ thống đo lường/Tiền tệ',
    pricing: 'Thiết lập hệ thống giá',
  };
  if (menu === 'company_member_units' && ctx.companySettingsView === 'form') {
    if (ctx.companyEntityId === 'new') return '';
    if (ctx.entityShortName.trim())
      return `Đơn vị thành viên - ${ctx.entityShortName.trim()}`;
    return 'Đơn vị thành viên - Chi tiết pháp nhân';
  }
  if (menu === 'workflow' && ctx.workflowView === 'detail') {
    const t = ctx.workflowDetailTitle?.trim();
    if (t) return `Hệ thống quy trình — ${t}`;
    return 'Hệ thống quy trình — Chi tiết';
  }
  if (menu === 'company_dept_system' && ctx.deptSystemDetailOpen) {
    const t = ctx.deptSystemDetailName?.trim();
    if (t) return `Hệ thống Phòng/Ban — ${t}`;
    return 'Hệ thống Phòng/Ban — Khung mới';
  }
  return labels[menu];
}

function formatAsOf(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

function priorityLabel(p: UnifiedTask['priority']): string {
  const map: Record<UnifiedTask['priority'], string> = {
    low: 'Thấp',
    medium: 'Trung bình',
    high: 'Cao',
    critical: 'Khẩn cấp',
  };
  return map[p];
}

function priorityClass(p: UnifiedTask['priority']): string {
  const map: Record<UnifiedTask['priority'], string> = {
    low: 'bg-xevn-neutral/10 text-xevn-textSecondary',
    medium: 'bg-amber-100 text-amber-800',
    high: 'bg-orange-100 text-orange-800',
    critical: 'bg-rose-100 text-rose-800',
  };
  return map[p];
}

const Sparkline: React.FC<{ points: { label: string; value: number }[] }> = ({ points }) => {
  const vals = points.map((p) => p.value);
  const max = Math.max(...vals);
  const min = Math.min(...vals);
  const range = max - min || 1;
  const w = 120;
  const h = 40;
  const poly = points
    .map((p, i) => {
      const x = (i / Math.max(points.length - 1, 1)) * w;
      const y = h - ((p.value - min) / range) * h;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-10 w-[7.5rem]" aria-hidden>
      <polyline
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        className="text-xevn-primary"
        points={poly}
      />
    </svg>
  );
};

const SkeletonBlock: React.FC<{ className?: string }> = ({ className }) => (
  <div
    className={`animate-pulse rounded-xl bg-slate-200/80 ${className ?? ''}`}
    aria-hidden
  />
);

const SettingSectionHeader: React.FC<{ title: string; subtitle?: React.ReactNode }> = ({
  title,
  subtitle,
}) => (
  <div
    className={`border border-xevn-border bg-white/70 px-4 py-3 shadow-soft backdrop-blur-md ${SETTINGS_RADIUS_CARD}`}
  >
    <h3 className={SETTINGS_PAGE_TITLE_CLASS}>{title}</h3>
    {subtitle != null && subtitle !== '' ? (
      <div className={SETTINGS_PAGE_SUBTITLE_CLASS}>{subtitle}</div>
    ) : null}
  </div>
);


const CommandCenterPage: React.FC = () => {
  const { tenantId, companyId } = useTenantScope();
  const [persona, setPersona] = useState<PersonaRole>('bod');
  const [selectedModule, setSelectedModule] = useState<string | 'all' | typeof SYSTEM_SETTINGS>('all');
  const [hrmModuleRailCollapsed, setHrmModuleRailCollapsed] = useState(readHrmModuleRailCollapsed);
  const [loading, setLoading] = useState(true);
  const [activeSettingsMenu, setActiveSettingsMenu] =
    useState<SettingsMenuKey>('company_member_units');
  const [companySetupGroupOpen, setCompanySetupGroupOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  /** Đồng bộ rail với URL HRM — nghiệp vụ HRM mount qua `/command-center/hrm/:view`, không nhúng trong state một chỗ. */
  useEffect(() => {
    if (matchPath({ path: '/command-center/hrm/*', end: false }, location.pathname)) {
      setSelectedModule('hrm');
    }
  }, [location.pathname]);

  const ccDeepLinkKeyRef = useRef('');
  const ccWorkflowDefinitionDeepLinkRef = useRef<string | null>(null);
  const ccWorkflowInstanceDeepLinkRef = useRef<string | null>(null);

  useEffect(() => {
    const parsed = parseCommandCenterSettingsDeepLink(location.search);
    if (!parsed.settingsMenu) return;

    const linkKey = `${parsed.settingsMenu}|${parsed.workflowDefinitionId ?? ''}|${parsed.workflowInstanceId ?? ''}`;
    if (ccDeepLinkKeyRef.current === linkKey) return;
    ccDeepLinkKeyRef.current = linkKey;

    setSelectedModule(SYSTEM_SETTINGS);
    setActiveSettingsMenu(parsed.settingsMenu as SettingsMenuKey);
    if (parsed.workflowDefinitionId) {
      ccWorkflowDefinitionDeepLinkRef.current = parsed.workflowDefinitionId;
    }
    if (parsed.workflowInstanceId) {
      ccWorkflowInstanceDeepLinkRef.current = parsed.workflowInstanceId;
    }
  }, [location.search]);

  const [publishMessage, setPublishMessage] = useState('');
  const [companySaving, setCompanySaving] = useState(false);
  const [companySaveFeedback, setCompanySaveFeedback] = useState<{
    kind: 'error' | 'success';
    text: string;
  } | null>(null);
  const [menuNotice, setMenuNotice] = useState<string | null>(null);
  const docCatalogHydratedRef = useRef(false);
  const measureCatalogHydratedRef = useRef(false);
  const pricingCatalogHydratedRef = useRef(false);
  const [legalEntityList, setLegalEntityList] = useState<Company[]>([]);
  const [groupMemberUnitsRows, setGroupMemberUnitsRows] = useState<Company[] | null>(null);
  const [groupMemberUnitsLoading, setGroupMemberUnitsLoading] = useState(false);
  const [groupMemberUnitsNotice, setGroupMemberUnitsNotice] = useState<string | null>(null);
  const [settingsScopeEntityId, setSettingsScopeEntityId] = useState<string | null>(null);
  const settingsLegalEntities = useMemo(
    () => (groupMemberUnitsRows?.length ? groupMemberUnitsRows : legalEntityList),
    [groupMemberUnitsRows, legalEntityList],
  );
  const settingsScopeEntity = useMemo(
    () => settingsLegalEntities.find((e) => e.id === settingsScopeEntityId) ?? null,
    [settingsLegalEntities, settingsScopeEntityId],
  );

  async function reloadMemberAndLegalEntities(): Promise<void> {
    setGroupMemberUnitsLoading(true);
    setGroupMemberUnitsNotice(null);
    try {
      const rows = await fetchGroupMemberUnitsForCommandCenter();
      setGroupMemberUnitsRows(rows);
      if (rows.length > 0) {
        setLegalEntityList(rows);
      } else {
        const legalRows = await fetchLegalEntities(MASTER_TENANT_ID, MEMBER_DEFAULT_COMPANY_ID);
        const mapped = legalRows.map((row) => mapLegalEntityRowToCompany(row));
        if (mapped.length) setLegalEntityList(mapped);
        setGroupMemberUnitsNotice(
          mapped.length
            ? null
            : 'XBOS trả về danh sách pháp nhân rỗng. Chạy seed org nếu môi trường dev.',
        );
      }
    } catch (e) {
      setGroupMemberUnitsRows(null);
      const msg = e instanceof Error ? e.message : 'Lỗi không xác định';
      setGroupMemberUnitsNotice(`Không tải được đơn vị thành viên (${msg}).`);
    } finally {
      setGroupMemberUnitsLoading(false);
    }
  }

  useEffect(() => {
    void reloadMemberAndLegalEntities();
  }, []);

  useEffect(() => {
    if (settingsLegalEntities.length === 0) return;
    setSettingsScopeEntityId((prev) => {
      if (prev && settingsLegalEntities.some((e) => e.id === prev)) return prev;
      return settingsLegalEntities[0]?.id ?? null;
    });
  }, [settingsLegalEntities]);

  useEffect(() => {
    if (activeSettingsMenu !== 'company_group_hr' || !settingsScopeEntity) return;
    const id = settingsScopeEntity.id;
    setEmployeeMetadataByEntity((prev) => {
      if (prev[id]?.length) return prev;
      return {
        ...prev,
        [id]: createDefaultEmployeeMetadataRows(id, settingsScopeEntity.tenantId),
      };
    });
  }, [activeSettingsMenu, settingsScopeEntity]);

  useEffect(() => {
    if (activeSettingsMenu !== 'tenant_departments' || !settingsScopeEntity?.tenantId) return;
    const entityId = settingsScopeEntity.id;
    const tenantId = settingsScopeEntity.tenantId;
    if (!tenantId) return;
    let cancelled = false;
    void (async () => {
      try {
        const tree = await loadLegalEntityDepartmentTree(tenantId, entityId);
        if (cancelled) return;
        const flat = flattenOrgTreeToDeptRows(tree);
        setDepartmentRowsByEntity((prev) => {
          if (prev[entityId]?.length) return prev;
          return {
            ...prev,
            [entityId]: flat.length > 0 ? flat : [createBlankDeptRow()],
          };
        });
      } catch {
        if (!cancelled) {
          setDepartmentRowsByEntity((prev) => ({
            ...prev,
            [entityId]: prev[entityId]?.length ? prev[entityId]! : [createBlankDeptRow()],
          }));
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [activeSettingsMenu, settingsScopeEntity]);

  const [companySettingsView, setCompanySettingsView] = useState<'list' | 'form'>('list');
  const [companyDetailTab, setCompanyDetailTab] = useState<CompanyDetailTab>('legal');
  const [companyEntityId, setCompanyEntityId] = useState<string | null>(null);
  const [legalEntityApiCache, setLegalEntityApiCache] = useState<LegalEntityApiRow[]>([]);
  const [resolvedLegalEntityApiId, setResolvedLegalEntityApiId] = useState<string | null>(null);
  const [parentUnitQuery, setParentUnitQuery] = useState('');
  const [parentUnitMenuOpen, setParentUnitMenuOpen] = useState(false);
  const [companyForm, setCompanyForm] = useState<CompanyFormState>({
    nameVi: 'CÔNG TY CỔ PHẦN XEVIET NAM HOLDINGS',
    nameEn: 'XEVIETNAM HOLDINGS JOINT STOCK COMPANY',
    shortName: 'XEVN HOLDINGS',
    enterpriseCode: '0312345678',
    enterpriseType: 'joint-stock',
    taxCode: '0312345678',
    headOfficeAddress: '123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP.HCM',
    headOfficeCountry: 'Việt Nam',
    charterCapital: 500000000000,
    firstIssueDate: '2018-05-18',
    issuePlace: 'Sở Kế hoạch và Đầu tư TP.HCM',
    legalRepName: 'Nguyễn Văn Trường',
    legalRepTitle: 'Chủ tịch Hội đồng quản trị',
    legalRepIdNo: '079188001234',
    legalRepPhone: '0901234567',
    legalRepAddress: '45 Lê Lợi, Phường Bến Thành, Quận 1, TP.HCM',
    hotline: '1900 6868',
    companyEmail: 'contact@xevn.vn',
    website: 'https://xevn.vn',
    entityLevel: 'parent',
    parentEntityId: '',
  });
  const [companyErrors, setCompanyErrors] = useState<{
    enterpriseCode?: string;
    charterCapital?: string;
    taxCode?: string;
    nameVi?: string;
  }>({});
  const [shareholderRows, setShareholderRows] = useState<ShareholderRow[]>([
    {
      id: 'sh-1',
      holderName: 'Nguyễn Văn A',
      identityCode: '079188001235',
      ratioPercent: 40,
      contributedValue: 200000000000,
      submitted: true,
    },
  ]);
  const [legalDocRows, setLegalDocRows] = useState<LegalDocRow[]>([
    {
      id: 'doc-1',
      documentName: 'Giấy chứng nhận Đăng ký doanh nghiệp',
      documentCode: 'GPKD-2026-001',
      issuedDate: '2026-01-01',
      expiredDate: '2030-12-31',
      fileName: 'gpkd-2026-001.pdf',
      submitted: true,
    },
  ]);
  const [departmentRowsByEntity, setDepartmentRowsByEntity] = useState<
    Record<string, LegalDepartmentRow[]>
  >({});
  const [employeeMetadataByEntity, setEmployeeMetadataByEntity] = useState<
    Record<string, EmployeeMetadataFieldRow[]>
  >({});
  const [employeeMetadataPreviewOpen, setEmployeeMetadataPreviewOpen] = useState(false);
  const [employeeMetadataPreviewValues, setEmployeeMetadataPreviewValues] = useState<
    Record<string, string>
  >({});
  const [, setWorkspaceMeta] = useState<{ asOf: string; dataSyncNote?: string | null } | null>(null);
  const [workspaceMetaFailed, setWorkspaceMetaFailed] = useState(false);
  const [inboxDetailOpen, setInboxDetailOpen] = useState(false);
  const [inboxDetailTask, setInboxDetailTask] = useState<UnifiedTask | null>(null);
  const [inboxDetailPayload, setInboxDetailPayload] = useState<WorkflowInstanceDetailPayload | null>(
    null,
  );
  const [inboxDetailLoading, setInboxDetailLoading] = useState(false);
  const [inboxDetailLoadFailed, setInboxDetailLoadFailed] = useState(false);
  const [inboxDrawerBusy, setInboxDrawerBusy] = useState(false);
  const [legalDocUploadTargetId, setLegalDocUploadTargetId] = useState<string | null>(null);
  const legalDocFileInputRef = useRef<HTMLInputElement>(null);
  const permissionMatrixSaveTimerRef = useRef<number | null>(null);
  const [groupHrDetailEntityId, setGroupHrDetailEntityId] = useState<string | null>(null);
  const [groupHrFieldsConfigOpen, setGroupHrFieldsConfigOpen] = useState(false);
  const [groupHrSyncBusy, setGroupHrSyncBusy] = useState(false);
  const [groupHrSelectedCustomBlockCode, setGroupHrSelectedCustomBlockCode] = useState<string | null>(
    null,
  );
  const [groupHrLeftAddBlockOpen, setGroupHrLeftAddBlockOpen] = useState(false);
  const [groupHrBlockTitleDraft, setGroupHrBlockTitleDraft] = useState<{
    general: string;
    location: string;
    capacity: string;
  }>({
    general: 'Khối Thông tin chung',
    location: 'Khối Thông tin cá nhân',
    capacity: 'Khối Thông tin công việc',
  });
  const [groupHrBlockTitleOverridesByEntity, setGroupHrBlockTitleOverridesByEntity] = useState<
    Record<string, Partial<Record<'general' | 'location' | 'capacity', string>>>
  >({});
  const [groupHrHiddenPresetBlocksByEntity, setGroupHrHiddenPresetBlocksByEntity] = useState<
    Record<string, string[]>
  >({});
  const [groupHrCustomBlocksByEntity, setGroupHrCustomBlocksByEntity] = useState<
    Record<string, InfrastructureCustomBlockDef[]>
  >(() => ({}));
  const [groupHrCustomFieldDefsByEntity, setGroupHrCustomFieldDefsByEntity] = useState<
    Record<string, InfrastructureCustomFieldDef[]>
  >(() => ({}));
  const [groupHrCustomBlockDraft, setGroupHrCustomBlockDraft] = useState<{
    blockCode: string;
    labelVi: string;
    visible: boolean;
    order: number;
  }>({ blockCode: '', labelVi: '', visible: true, order: 10 });
  const [groupHrCustomFieldDraft, setGroupHrCustomFieldDraft] = useState<{
    fieldCode: string;
    labelVi: string;
    dataType: EmployeeMetadataDataType;
    blockCode: InfrastructureCustomBlockCode;
    visible: boolean;
    selectConfig: string;
  }>({
    fieldCode: '',
    labelVi: '',
    dataType: 'text',
    blockCode: 'general',
    visible: true,
    selectConfig: '',
  });
  const [infrastructureSites, setInfrastructureSites] = useState<InfrastructureSiteRow[]>(() =>
    getInitialInfrastructureSites(),
  );
  const [infrastructureView, setInfrastructureView] = useState<'list' | 'detail'>('list');
  /** Tab cấp 1: danh mục nền (có mã + phạm vi) vs điểm hạ tầng (nhập giá trị). */
  const [infrastructureBrowseTab, setInfrastructureBrowseTab] = useState<'foundation' | 'sites'>(
    'foundation',
  );
  const [foundationCategories, setFoundationCategories] = useState<InfrastructureFoundationCategory[]>(
    () => (allowMockFallback() ? [...INITIAL_INFRASTRUCTURE_FOUNDATION_CATEGORIES] : []),
  );
  const [foundationCategoryDetailId, setFoundationCategoryDetailId] = useState<string | null>(null);
  const [foundationForm, setFoundationForm] = useState<InfrastructureFoundationCategory | null>(null);
  const [deptSystemTab, setDeptSystemTab] = useState<'reference' | 'templates'>('reference');
  const [deptSystemDetailId, setDeptSystemDetailId] = useState<string | null>(null);
  const [deptSystemForm, setDeptSystemForm] = useState<DeptSystemFoundationTemplate | null>(null);
  const [infrastructureEditId, setInfrastructureEditId] = useState<string | null>(null);
  const [infraForm, setInfraForm] = useState<InfrastructureFormState>(() =>
    createEmptyInfrastructureForm(),
  );
  const [infrastructureFieldsConfigOpen, setInfrastructureFieldsConfigOpen] = useState(false);
  const [infrastructureFieldsConfigEntityId, setInfrastructureFieldsConfigEntityId] = useState<
    string | null
  >(null);
  const [infrastructureCustomFieldDefsByEntity, setInfrastructureCustomFieldDefsByEntity] =
    useState<Record<string, InfrastructureCustomFieldDef[]>>(() => ({}));
  const [infrastructureBlockTitleOverridesByEntity, setInfrastructureBlockTitleOverridesByEntity] =
    useState<Record<string, Partial<Record<InfrastructureBaseBlockCode, string>>>>(() => ({}));
  const [infrastructureCustomBlocksByEntity, setInfrastructureCustomBlocksByEntity] =
    useState<Record<string, InfrastructureCustomBlockDef[]>>(() => ({}));
  const [infraSelectedCustomBlockCode, setInfraSelectedCustomBlockCode] = useState<
    string | null
  >(null);
  const [infraLeftAddBlockOpen, setInfraLeftAddBlockOpen] = useState(false);
  const [infraBlockNavigatorDraggingId, setInfraBlockNavigatorDraggingId] = useState<
    string | null
  >(null);
  const [infraCustomFieldDraft, setInfraCustomFieldDraft] = useState<{
    fieldCode: string;
    labelVi: string;
    dataType: EmployeeMetadataDataType;
    blockCode: InfrastructureCustomBlockCode;
    visible: boolean;
    selectConfig: string;
  }>({
    fieldCode: '',
    labelVi: '',
    dataType: 'text',
    blockCode: 'capacity',
    visible: true,
    selectConfig: '',
  });

  // Khi đổi khối đang chọn, tự cập nhật field_code từ (formCode + blockCode + label).
  // Label được user nhập ở UI; field_code chỉ sinh key để DB không bị lẫn giữa nhiều khối/nhóm/menu.
  useEffect(() => {
    const nextBlockCode = (infraSelectedCustomBlockCode ?? 'general') as InfrastructureCustomBlockCode;
    setInfraCustomFieldDraft((prev) => {
      const trimmedLabel = prev.labelVi.trim();
      if (!trimmedLabel) {
        if (prev.blockCode === nextBlockCode && prev.fieldCode === '') return prev;
        return { ...prev, blockCode: nextBlockCode, fieldCode: '' };
      }

      const nextFieldCode = makeInfraCustomFieldCode(
        INFRA_CUSTOM_FIELD_FORM_CODE,
        nextBlockCode,
        trimmedLabel,
      );
      if (prev.blockCode === nextBlockCode && prev.fieldCode === nextFieldCode) return prev;
      return { ...prev, blockCode: nextBlockCode, fieldCode: nextFieldCode };
    });
  }, [infraSelectedCustomBlockCode]);
  useEffect(() => {
    const nextBlockCode = (groupHrSelectedCustomBlockCode ?? 'general') as InfrastructureCustomBlockCode;
    setGroupHrCustomFieldDraft((prev) => {
      const trimmedLabel = prev.labelVi.trim();
      if (!trimmedLabel) {
        if (prev.blockCode === nextBlockCode && prev.fieldCode === '') return prev;
        return { ...prev, blockCode: nextBlockCode, fieldCode: '' };
      }
      const nextFieldCode = makeInfraCustomFieldCode(
        GROUP_HR_CUSTOM_FIELD_FORM_CODE,
        nextBlockCode,
        trimmedLabel,
      );
      if (prev.blockCode === nextBlockCode && prev.fieldCode === nextFieldCode) return prev;
      return { ...prev, blockCode: nextBlockCode, fieldCode: nextFieldCode };
    });
  }, [groupHrSelectedCustomBlockCode]);
  const [infraBlockTitleDraft, setInfraBlockTitleDraft] = useState<{
    general: string;
    location: string;
    capacity: string;
  }>({ general: '', location: '', capacity: '' });
  const [infraCustomBlockDraft, setInfraCustomBlockDraft] = useState<{
    blockCode: string;
    labelVi: string;
    visible: boolean;
    order: number;
  }>({ blockCode: '', labelVi: '', visible: true, order: 10 });
  const [infrastructureDbHydrated, setInfrastructureDbHydrated] = useState(false);
  const [infrastructureCatalogSource, setInfrastructureCatalogSource] = useState<
    'idle' | 'loading' | 'api' | 'mock' | 'empty'
  >('idle');
  const [infrastructureCatalogFailed, setInfrastructureCatalogFailed] = useState(false);
  const [workflows, setWorkflows] = useState<WorkflowDefinition[]>([]);
  const [workflowDefinitionsSource, setWorkflowDefinitionsSource] = useState<
    'idle' | 'loading' | 'api' | 'mock' | 'empty'
  >('idle');
  const [workflowDefinitionsLoadFailed, setWorkflowDefinitionsLoadFailed] = useState(false);
  const workflowCatalogHydratedRef = useRef(false);
  const [inboxTasks, setInboxTasks] = useState<UnifiedTask[]>([]);
  const [inboxTasksSource, setInboxTasksSource] = useState<'loading' | 'api' | 'mock'>('loading');
  const [inboxTasksLoadFailed, setInboxTasksLoadFailed] = useState(false);
  const [inboxActionBusyId, setInboxActionBusyId] = useState<string | null>(null);
  const [portalAlerts, setPortalAlerts] = useState<PortalAlert[]>([]);
  const [portalAlertsSource, setPortalAlertsSource] = useState<'loading' | 'api' | 'mock'>('loading');
  const [portalAlertsLoadFailed, setPortalAlertsLoadFailed] = useState(false);
  const kpiRail = useCommandCenterKpiRail(persona, tenantId, companyId);
  const deptTemplatesHook = useDeptSystemTemplates(
    activeSettingsMenu === 'company_dept_system',
    tenantId,
    companyId,
  );
  const deptSystemTemplates = deptTemplatesHook.templates;
  const setDeptSystemTemplates = deptTemplatesHook.setTemplates;

  const workflowDefinitionsStrict = useMemo(
    () =>
      resolveWorkflowDefinitionsStrictBanner(
        workflowDefinitionsSource === 'loading'
          ? 'loading'
          : workflowDefinitionsSource === 'mock'
            ? 'mock'
            : 'api',
        workflowDefinitionsLoadFailed,
        workflows.length,
      ),
    [workflowDefinitionsSource, workflowDefinitionsLoadFailed, workflows.length],
  );

  const portalAlertsStrict = useMemo(
    () =>
      resolveAlertsStrictBanner(
        portalAlertsSource === 'loading' ? 'loading' : portalAlertsSource === 'mock' ? 'mock' : 'api',
        portalAlertsLoadFailed,
        portalAlerts.length,
      ),
    [portalAlertsSource, portalAlertsLoadFailed, portalAlerts.length],
  );
  const [workflowView, setWorkflowView] = useState<'list' | 'detail'>('list');
  const [workflowEditId, setWorkflowEditId] = useState<string | null>(null);
  const [workflowForm, setWorkflowForm] = useState<WorkflowDefinition | null>(null);
  const [workflowDetailTab, setWorkflowDetailTab] = useState<'graph' | 'canvas'>('graph');
  const [workflowCanvasSelectedStepId, setWorkflowCanvasSelectedStepId] = useState<string | null>(
    null,
  );
  const [documentRows, setDocumentRows] = useState([
    { code: 'QĐ-ATLD', title: 'Quy định An toàn lao động', version: 'v3.2', active: true },
    { code: 'QĐ-DL', title: 'Quy định Điều lệnh vận hành', version: 'v1.9', active: true },
  ]);
  const [measurementRows, setMeasurementRows] = useState([
    { key: 'DISTANCE', unit: 'Km', currency: 'VND', precision: 2 },
    { key: 'FUEL', unit: 'Lít', currency: 'VND', precision: 3 },
  ]);
  const [pricingRows, setPricingRows] = useState([
    { priceCode: 'PRC-FLEET-A', label: 'Giá chuẩn xe tải hạng A', amount: 14500 },
    { priceCode: 'PRC-FLEET-B', label: 'Giá chuẩn xe tải hạng B', amount: 13200 },
  ]);
  const [permissionRoles, setPermissionRoles] = useState<PermissionRoleDef[]>(() => [
    ...RACI_PERMISSION_BOOTSTRAP.roles,
  ]);
  const [activePermissionRoleId, setActivePermissionRoleId] = useState(
    RACI_PERMISSION_BOOTSTRAP.defaultRoleId,
  );
  const [permissionMatrixByRole, setPermissionMatrixByRole] = useState<
    Record<string, PermissionMatrixRow[]>
  >(() => buildRaciPermissionMatrixMap());
  const [permissionAccordionOpen, setPermissionAccordionOpen] = useState<
    Record<PermissionModuleKey, boolean>
  >({
    org: true,
    logistics: true,
    hr: true,
    system: true,
  });

  const searchRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const t = window.setTimeout(() => setLoading(false), 520);
    return () => window.clearTimeout(t);
  }, [persona]);

  useEffect(() => {
    if (selectedModule === SYSTEM_SETTINGS && searchRef.current) {
      searchRef.current.focus();
    }
  }, [selectedModule, activeSettingsMenu]);

  useEffect(() => {
    if (isCompanySetupMenuKey(activeSettingsMenu)) {
      setCompanySetupGroupOpen(true);
    }
  }, [activeSettingsMenu]);

  useEffect(() => {
    if (activeSettingsMenu !== 'company_member_units') {
      setCompanySettingsView('list');
      setCompanyEntityId(null);
    }
  }, [activeSettingsMenu]);

  useEffect(() => {
    if (activeSettingsMenu !== 'company_infrastructure') {
      setInfrastructureView('list');
      setInfrastructureEditId(null);
    }
  }, [activeSettingsMenu]);

  useEffect(() => {
    setMenuNotice(null);
    setPublishMessage('');
  }, [activeSettingsMenu]);

  useEffect(() => {
    if (activeSettingsMenu !== 'company_infrastructure') return;
    if (infrastructureDbHydrated) return;
    void loadInfrastructureSettingsFromDb().catch(() => {
      setMenuNotice('Không tải được hạ tầng từ DB — đang hiển thị dữ liệu mẫu cục bộ.');
    });
  }, [activeSettingsMenu, infrastructureDbHydrated]);

  useEffect(() => {
    if (activeSettingsMenu !== 'company_dept_system') return;
    const msg = deptTemplatesLoadErrorMessage(deptTemplatesHook.loadNotFound, deptTemplatesHook.loadFailed);
    if (msg) setMenuNotice(msg);
  }, [
    activeSettingsMenu,
    deptTemplatesHook.loadFailed,
    deptTemplatesHook.loadNotFound,
  ]);

  useEffect(() => {
    if (activeSettingsMenu !== 'document') {
      docCatalogHydratedRef.current = false;
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        const rows = await loadCcCatalogRows<{ code: string; title: string; version: string; active: boolean }>(
          'regulations',
        );
        if (cancelled) return;
        if (rows.length) setDocumentRows(rows);
        docCatalogHydratedRef.current = true;
      } catch (error) {
        if (!cancelled) {
          setMenuNotice(
            `Không tải danh mục văn bản (${error instanceof Error ? error.message : 'lỗi'}).`,
          );
          docCatalogHydratedRef.current = true;
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [activeSettingsMenu]);

  useEffect(() => {
    if (activeSettingsMenu !== 'measurement') {
      measureCatalogHydratedRef.current = false;
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        const rows = await loadCcCatalogRows<{ key: string; unit: string; currency: string; precision: number }>(
          'measurements',
        );
        if (cancelled) return;
        if (rows.length) setMeasurementRows(rows);
        measureCatalogHydratedRef.current = true;
      } catch (error) {
        if (!cancelled) {
          setMenuNotice(
            `Không tải danh mục đo lường (${error instanceof Error ? error.message : 'lỗi'}).`,
          );
          measureCatalogHydratedRef.current = true;
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [activeSettingsMenu]);

  useEffect(() => {
    if (activeSettingsMenu !== 'pricing') {
      pricingCatalogHydratedRef.current = false;
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        const rows = await loadCcCatalogRows<{ priceCode: string; label: string; amount: number }>('pricing');
        if (cancelled) return;
        if (rows.length) setPricingRows(rows);
        pricingCatalogHydratedRef.current = true;
      } catch (error) {
        if (!cancelled) {
          setMenuNotice(
            `Không tải danh mục giá (${error instanceof Error ? error.message : 'lỗi'}).`,
          );
          pricingCatalogHydratedRef.current = true;
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [activeSettingsMenu]);

  useEffect(() => {
    if (!docCatalogHydratedRef.current || activeSettingsMenu !== 'document') return;
    const timer = window.setTimeout(() => {
      void saveCcCatalogRows('regulations', documentRows).catch((error) => {
        setMenuNotice(
          `Không lưu danh mục văn bản (${error instanceof Error ? error.message : 'lỗi'}).`,
        );
      });
    }, 800);
    return () => window.clearTimeout(timer);
  }, [documentRows, activeSettingsMenu]);

  useEffect(() => {
    if (!measureCatalogHydratedRef.current || activeSettingsMenu !== 'measurement') return;
    const timer = window.setTimeout(() => {
      void saveCcCatalogRows('measurements', measurementRows).catch((error) => {
        setMenuNotice(
          `Không lưu danh mục đo lường (${error instanceof Error ? error.message : 'lỗi'}).`,
        );
      });
    }, 800);
    return () => window.clearTimeout(timer);
  }, [measurementRows, activeSettingsMenu]);

  useEffect(() => {
    if (!pricingCatalogHydratedRef.current || activeSettingsMenu !== 'pricing') return;
    const timer = window.setTimeout(() => {
      void saveCcCatalogRows('pricing', pricingRows).catch((error) => {
        setMenuNotice(
          `Không lưu danh mục giá (${error instanceof Error ? error.message : 'lỗi'}).`,
        );
      });
    }, 800);
    return () => window.clearTimeout(timer);
  }, [pricingRows, activeSettingsMenu]);

  useEffect(() => {
    let cancelled = false;
    void fetchCommandCenterWorkspaceMeta(MASTER_TENANT_ID, MEMBER_DEFAULT_COMPANY_ID)
      .then((meta) => {
        if (cancelled) return;
        if (meta?.asOf) {
          setWorkspaceMeta(meta);
          setWorkspaceMetaFailed(false);
        } else {
          setWorkspaceMeta(null);
          setWorkspaceMetaFailed(!allowMockFallback());
        }
      })
      .catch(() => {
        if (!cancelled) {
          setWorkspaceMeta(null);
          setWorkspaceMetaFailed(!allowMockFallback());
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!companyEntityId || companyEntityId === 'new') {
      setResolvedLegalEntityApiId(null);
      return;
    }
    const scopeRow =
      settingsLegalEntities.find((e) => e.id === companyEntityId) ??
      legalEntityList.find((e) => e.id === companyEntityId);
    const tenantId = scopeRow?.tenantId ?? MASTER_TENANT_ID;
    const hints = { id: companyEntityId, tenantId, code: scopeRow?.code };
    const fromCache = resolveLegalEntityApiIdFromList(hints, legalEntityApiCache);
    if (fromCache) {
      setResolvedLegalEntityApiId(fromCache);
      return;
    }
    let cancelled = false;
    void resolveLegalEntityApiIdForCompany(tenantId, hints).then((resolved) => {
      if (!cancelled) setResolvedLegalEntityApiId(resolved);
    });
    return () => {
      cancelled = true;
    };
  }, [companyEntityId, settingsLegalEntities, legalEntityList, legalEntityApiCache]);

  useEffect(() => {
    const { entityId, tenantId: profileTenantId } = resolveLegalProfileScope();
    if (!entityId || !isPersistedApiId(entityId)) return;
    let cancelled = false;
    void (async () => {
      try {
        const [shareholders, documents] = await Promise.all([
          listShareholders(entityId, profileTenantId),
          listLegalDocuments(entityId, profileTenantId),
        ]);
        if (cancelled) return;
        if (shareholders.length) {
          setShareholderRows(
            shareholders.map((s) => ({
              id: String(s.id),
              holderName: String(s.holder_name ?? ''),
              identityCode: String(s.identity_code ?? ''),
              ratioPercent: Number(s.ratio_percent ?? 0),
              contributedValue: Number(s.contributed_value ?? 0),
              submitted: true,
            })),
          );
        }
        if (documents.length) {
          setLegalDocRows(
            documents.map((d) => ({
              id: String(d.id),
              documentName: String(d.document_name ?? ''),
              documentCode: String(d.document_code ?? ''),
              issuedDate: d.issued_date ? String(d.issued_date).slice(0, 10) : '',
              expiredDate: d.expired_date ? String(d.expired_date).slice(0, 10) : '',
              fileName: d.file_url ? 'Đã tải lên' : '',
              fileUrl: d.file_url ?? undefined,
              submitted: true,
            })),
          );
        }
      } catch {
        /* keep local rows when API unavailable */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [companyEntityId, settingsLegalEntities, resolvedLegalEntityApiId, legalEntityApiCache]);

  useEffect(() => {
    if (!activePermissionRoleId) return;
    let cancelled = false;
    void fetchPermissionMatrix(activePermissionRoleId, MASTER_TENANT_ID)
      .then((cells) => {
        if (cancelled || !cells.length) return;
        setPermissionMatrixByRole((prev) => {
          const base = prev[activePermissionRoleId] ?? buildPermissionMatrix({});
          const merged = base.map((row) => {
            const cell = cells.find((c) => c.rowId === row.id);
            if (!cell) return row;
            return {
              ...row,
              view: cell.view,
              write: cell.write,
              delete: cell.delete,
              approve: cell.approve,
              dataScope: cell.dataScope as PermissionMatrixRow['dataScope'],
            };
          });
          return { ...prev, [activePermissionRoleId]: merged };
        });
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [activePermissionRoleId]);

  useEffect(() => {
    let cancelled = false;
    setInboxTasksLoadFailed(false);
    void fetchCommandCenterInboxTasks(MASTER_TENANT_ID)
      .then((tasks) => {
        if (cancelled) return;
        setInboxTasksLoadFailed(false);
        if (tasks.length) {
          setInboxTasks(tasks);
          setInboxTasksSource('api');
        } else {
          setInboxTasks([]);
          setInboxTasksSource(allowMockFallback() ? 'mock' : 'api');
        }
      })
      .catch(() => {
        if (!cancelled) {
          setInboxTasks([]);
          setInboxTasksLoadFailed(!allowMockFallback());
          setInboxTasksSource(allowMockFallback() ? 'mock' : 'api');
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setPortalAlertsLoadFailed(false);
    void fetchPortalAlerts(MASTER_TENANT_ID)
      .then((rows) => {
        if (cancelled) return;
        setPortalAlertsLoadFailed(false);
        if (rows.length) {
          setPortalAlerts(rows);
          setPortalAlertsSource('api');
        } else {
          setPortalAlerts([]);
          setPortalAlertsSource(allowMockFallback() ? 'mock' : 'api');
        }
      })
      .catch(() => {
        if (!cancelled) {
          setPortalAlerts([]);
          setPortalAlertsLoadFailed(!allowMockFallback());
          setPortalAlertsSource(allowMockFallback() ? 'mock' : 'api');
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (activeSettingsMenu !== 'workflow') {
      workflowCatalogHydratedRef.current = false;
      return;
    }
    if (workflowCatalogHydratedRef.current) return;
    let cancelled = false;
    const seedLocal = () => {
      if (!allowMockFallback()) {
        setWorkflows([]);
        setWorkflowDefinitionsSource('empty');
        setWorkflowDefinitionsLoadFailed(false);
        return;
      }
      setWorkflows([
        ...getInitialWorkflowGraphDefinitions(),
        ...getRaciWorkflowPrototypeDefinitions(),
      ]);
      setWorkflowDefinitionsSource('mock');
      setWorkflowDefinitionsLoadFailed(false);
    };
    setWorkflowDefinitionsSource('loading');
    void (async () => {
      try {
        const rows = await listWorkflowDefinitions(tenantId, companyId);
        if (cancelled) return;
        const mapped = rows.map(apiRowToWorkflowDefinition).filter((w) => w.steps.length > 0);
        if (mapped.length) {
          setWorkflows(mapped);
          setWorkflowDefinitionsSource('api');
          setWorkflowDefinitionsLoadFailed(false);
        } else {
          seedLocal();
          if (allowMockFallback()) {
            setMenuNotice('Chưa có quy trình trên DB — hiển thị mẫu graph/RACI cục bộ.');
          }
        }
        workflowCatalogHydratedRef.current = true;
      } catch (error) {
        if (!cancelled) {
          seedLocal();
          setWorkflowDefinitionsLoadFailed(!allowMockFallback());
          if (allowMockFallback()) {
            setMenuNotice(
              `Không tải workflow-engine (${error instanceof Error ? error.message : 'lỗi'}). Dùng mẫu cục bộ.`,
            );
          }
          workflowCatalogHydratedRef.current = true;
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [activeSettingsMenu, tenantId, companyId]);

  useEffect(() => {
    const wfId = ccWorkflowDefinitionDeepLinkRef.current;
    if (!wfId || activeSettingsMenu !== 'workflow' || workflowDefinitionsSource === 'loading') return;
    const found = workflows.find((w) => w.id === wfId);
    if (found) {
      openEditWorkflow(wfId);
      ccWorkflowDefinitionDeepLinkRef.current = null;
    }
  }, [workflows, activeSettingsMenu, workflowDefinitionsSource]);

  useEffect(() => {
    const instanceId = ccWorkflowInstanceDeepLinkRef.current;
    if (!instanceId || activeSettingsMenu !== 'workflow') return;
    ccWorkflowInstanceDeepLinkRef.current = null;
    openInboxTaskDetail({
      cardId: instanceId,
      sourceId: instanceId,
      sourceSystem: 'xbos-workflow',
      dedupeKey: `wf-inst-${instanceId}`,
      statusNormalized: 'PENDING_APPROVAL',
      orgUnitId: MASTER_TENANT_ID,
      moduleCode: 'business',
      title: 'Chi tiết quy trình',
      assigneeUserId: '',
      assigneeName: '',
      priority: 'medium',
    });
  }, [activeSettingsMenu]);

  useEffect(() => {
    if (activeSettingsMenu !== 'workflow') {
      setWorkflowView('list');
      setWorkflowEditId(null);
      setWorkflowForm(null);
      setWorkflowDetailTab('graph');
      setWorkflowCanvasSelectedStepId(null);
    }
  }, [activeSettingsMenu]);

  const parentUnitCandidates = useMemo(() => {
    const q = parentUnitQuery.trim().toLowerCase();
    const source = settingsLegalEntities.length ? settingsLegalEntities : legalEntityList;
    return source.filter((c) => {
      if (companyEntityId && c.id === companyEntityId) return false;
      if (c.id === GROUP_HOLDING_ROOT_ID && companyForm.entityLevel !== 'parent') return true;
      if (!q) return true;
      return c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q);
    });
  }, [settingsLegalEntities, legalEntityList, parentUnitQuery, companyEntityId, companyForm.entityLevel]);

  const infraEffectiveOptions = useMemo(
    () => ({
      facilityTypes: INFRASTRUCTURE_FACILITY_TYPES,
      statuses: INFRASTRUCTURE_STATUSES,
    }),
    [],
  );

  const infraUi = useMemo(
    () => ({
      blocks: {
        general: { blockCode: 'general', titleVi: 'Khối Thông tin chung' },
        location: { blockCode: 'location', titleVi: 'Khối Vị trí và liên hệ' },
        capacity: { blockCode: 'capacity', titleVi: 'Khối Năng lực (Capacity)' },
      },
      fields: {
        name: { labelVi: 'Tên hạ tầng', ariaLabel: 'Tên hạ tầng' },
        siteCode: { labelVi: 'Mã định danh', ariaLabel: 'Mã định danh', placeholder: 'VD: KHO-SGN-01' },
        facilityType: { labelVi: 'Loại hạ tầng', ariaLabel: 'Loại hạ tầng' },
        operatingEntityId: { labelVi: 'Đơn vị trực thuộc', ariaLabel: 'Đơn vị trực thuộc' },
        status: { labelVi: 'Trạng thái vận hành', ariaLabel: 'Trạng thái vận hành' },
        gpsCoords: { labelVi: 'Tọa độ GPS', ariaLabel: 'Tọa độ GPS', placeholder: 'lat, lng' },
        addressDetail: { labelVi: 'Địa chỉ chi tiết', ariaLabel: 'Địa chỉ chi tiết' },
        hotline: { labelVi: 'Hotline điểm', ariaLabel: 'Hotline điểm' },
        directManager: { labelVi: 'Quản lý trực tiếp', ariaLabel: 'Quản lý trực tiếp' },
        leaseLegalEndDate: { labelVi: 'Thời hạn thuê / pháp lý', ariaLabel: 'Thời hạn thuê / pháp lý' },
        areaSqm: { labelVi: 'Diện tích (m²)', ariaLabel: 'Diện tích m2' },
        palletOrVehicleMax: { labelVi: 'Số lượng Pallet / Xe tối đa', ariaLabel: 'Pallet hoặc xe tối đa' },
        ownerLegalEntityId: { labelVi: 'Pháp nhân sở hữu', ariaLabel: 'Pháp nhân sở hữu' },
        capacitySummary: { labelVi: 'Tóm tắt sức chứa (cột danh sách)', ariaLabel: 'Tóm tắt sức chứa' },
      },
    }),
    [],
  );

  const infraCustomFieldDefsForEntity = useMemo(() => {
    const entityId = infraForm.operatingEntityId;
    if (!entityId) return [];
    return infrastructureCustomFieldDefsByEntity[entityId] ?? [];
  }, [infraForm.operatingEntityId, infrastructureCustomFieldDefsByEntity]);

  const infraCustomBlocksForEntity = useMemo(() => {
    const entityId = infraForm.operatingEntityId;
    if (!entityId) return [];
    return (infrastructureCustomBlocksByEntity[entityId] ?? []).slice().sort((a, b) => a.order - b.order);
  }, [infraForm.operatingEntityId, infrastructureCustomBlocksByEntity]);

  const infraBlockTitleOverridesForEntity = useMemo(() => {
    const entityId = infraForm.operatingEntityId;
    if (!entityId) return {};
    return infrastructureBlockTitleOverridesByEntity[entityId] ?? {};
  }, [infraForm.operatingEntityId, infrastructureBlockTitleOverridesByEntity]);

  const infraUiMerged = useMemo(() => {
    return {
      ...infraUi,
      blocks: {
        ...infraUi.blocks,
        general: {
          ...infraUi.blocks.general,
          titleVi:
            infraBlockTitleOverridesForEntity.general ?? infraUi.blocks.general.titleVi,
        },
        location: {
          ...infraUi.blocks.location,
          titleVi:
            infraBlockTitleOverridesForEntity.location ?? infraUi.blocks.location.titleVi,
        },
        capacity: {
          ...infraUi.blocks.capacity,
          titleVi:
            infraBlockTitleOverridesForEntity.capacity ?? infraUi.blocks.capacity.titleVi,
        },
      },
    };
  }, [infraUi, infraBlockTitleOverridesForEntity]);

  /** Pháp nhân đang chọn có nằm trong ít nhất một danh mục nền đã gán không (để cảnh báo khi nhập điểm). */
  const operatingEntityInFoundationScope = useMemo(() => {
    if (!infraForm.operatingEntityId) return true;
    return foundationCategories.some((c) =>
      c.appliesToCompanyIds.includes(infraForm.operatingEntityId),
    );
  }, [foundationCategories, infraForm.operatingEntityId]);

  const infraCustomBlocksForModalEntity = useMemo(() => {
    const entityId = infrastructureFieldsConfigEntityId;
    if (!entityId) return [];
    return (infrastructureCustomBlocksByEntity[entityId] ?? []).slice().sort((a, b) => a.order - b.order);
  }, [infrastructureFieldsConfigEntityId, infrastructureCustomBlocksByEntity]);

  function openNewCompanyEntity() {
    setCompanyEntityId('new');
    setCompanySettingsView('form');
    setCompanyDetailTab('legal');
    setCompanyForm(createEmptyCompanyForm());
    setParentUnitQuery('');
    setParentUnitMenuOpen(false);
    setShareholderRows([
      {
        id: `sh-${Date.now()}`,
        holderName: '',
        identityCode: '',
        ratioPercent: 0,
        contributedValue: 0,
        submitted: false,
      },
    ]);
    setLegalDocRows([
      {
        id: `doc-${Date.now()}`,
        documentName: '',
        documentCode: '',
        issuedDate: '',
        expiredDate: '',
        fileName: '',
        submitted: false,
      },
    ]);
    setDepartmentRowsByEntity((prev) => ({
      ...prev,
      new: prev.new ?? [createBlankDeptRow()],
    }));
    setEmployeeMetadataByEntity((prev) => ({
      ...prev,
      new: prev.new ?? createDefaultEmployeeMetadataRows(null),
    }));
  }

  function openEditCompanyEntity(id: string) {
    const row =
      settingsLegalEntities.find((c) => c.id === id) ?? legalEntityList.find((c) => c.id === id);
    if (!row) return;
    setCompanyEntityId(id);
    setCompanySettingsView('form');
    setCompanyDetailTab('legal');
    setCompanyErrors({});
    setCompanySaveFeedback(null);
    setCompanyForm(buildFormFromCompany(row));
    setParentUnitQuery(
      getParentEntityLabel(row.parentEntityId, settingsLegalEntities.length ? settingsLegalEntities : legalEntityList),
    );
    setParentUnitMenuOpen(false);
    if (id === GROUP_HOLDING_ROOT_ID) {
      setShareholderRows([]);
      setLegalDocRows([]);
      const tenantId = row.tenantId ?? MASTER_TENANT_ID;
      void fetchHoldingLegalEntities(tenantId)
        .then((items) => {
          setLegalEntityApiCache((prev) => {
            const byId = new Map(prev.map((r) => [String(r.id), r]));
            for (const r of items) byId.set(String(r.id), r);
            return [...byId.values()];
          });
          const apiRow = items[0];
          if (!apiRow) return;
          setResolvedLegalEntityApiId(String(apiRow.id));
          setCompanyForm(mapLegalEntityRowToCompanyForm(apiRow) as CompanyFormState);
        })
        .catch(() => {
          setPublishMessage('Không tải được hồ sơ tập đoàn từ API — có thể lưu để tạo mới trên org-foundation.');
        });
      return;
    }
    if (isPersistedApiId(id)) {
      setShareholderRows([]);
      setLegalDocRows([]);
      const tenantId = row.tenantId ?? MASTER_TENANT_ID;
      void fetchLegalEntities(tenantId, MEMBER_DEFAULT_COMPANY_ID)
        .then((items) => {
          setLegalEntityApiCache((prev) => {
            const byId = new Map(prev.map((r) => [String(r.id), r]));
            for (const r of items) byId.set(String(r.id), r);
            return [...byId.values()];
          });
          return fetchLegalEntityForEdit(tenantId, id, MEMBER_DEFAULT_COMPANY_ID, { code: row.code });
        })
        .then((apiRow) => {
          if (!apiRow) return;
          setResolvedLegalEntityApiId(String(apiRow.id));
          setCompanyForm(mapLegalEntityRowToCompanyForm(apiRow) as CompanyFormState);
          setParentUnitQuery(
            getParentEntityLabel(
              (mapLegalEntityRowToCompanyForm(apiRow).parentEntityId || row.parentEntityId) as string,
              settingsLegalEntities.length ? settingsLegalEntities : legalEntityList,
            ),
          );
        })
        .catch(() => {
          setPublishMessage('Không tải được hồ sơ pháp nhân từ API — hiển thị dữ liệu danh sách.');
        });
    } else {
      setShareholderRows([
        {
          id: 'sh-1',
          holderName: 'Nguyễn Văn A',
          identityCode: '079188001235',
          ratioPercent: 40,
          contributedValue: Math.round((500000000000 * 40) / 100),
          submitted: true,
        },
      ]);
      setLegalDocRows([
        {
          id: 'doc-1',
          documentName: 'Giấy chứng nhận Đăng ký doanh nghiệp',
          documentCode: 'GPKD-2026-001',
          issuedDate: '2026-01-01',
          expiredDate: '2030-12-31',
          fileName: 'gpkd-2026-001.pdf',
          submitted: true,
        },
      ]);
    }
    setDepartmentRowsByEntity((prev) => {
      if (prev[id]?.length) return prev;
      const seed = seedDepartmentsForCompany(id);
      return { ...prev, [id]: seed.length > 0 ? seed : [createBlankDeptRow()] };
    });
    setEmployeeMetadataByEntity((prev) => {
      if (prev[id]?.length) return prev;
      return { ...prev, [id]: createDefaultEmployeeMetadataRows(id) };
    });
  }

  function groupHrBlocksFromFieldDefs(
    defs: GroupHrCatalogFieldDto[],
    tenantId?: string | null,
  ): InfrastructureCustomBlockDef[] {
    const groups = getGroupHrCatalogGroups(tenantId);
    const codes = [...new Set(defs.map((d) => d.blockCode))];
    return codes.map((code, index) => ({
      id: `ghr-bl-${code}`,
      blockCode: code,
      labelVi: groups?.find((g) => g.groupCode === code)?.groupLabel ?? code,
      visible: true,
      order: (index + 1) * 10,
    }));
  }

  function applyGroupHrCatalogLayout(entityId: string, tenantId?: string | null) {
    const layout = buildGroupHrCatalogLayout(tenantId);
    if (layout) {
      setGroupHrCustomBlocksByEntity((prev) => ({ ...prev, [entityId]: layout.blocks }));
      setGroupHrCustomFieldDefsByEntity((prev) => ({
        ...prev,
        [entityId]: layout.fieldDefs as InfrastructureCustomFieldDef[],
      }));
      setGroupHrSelectedCustomBlockCode(layout.blocks[0]?.blockCode ?? null);
      return;
    }
    const rows =
      employeeMetadataByEntity[entityId] ?? createDefaultEmployeeMetadataRows(entityId, tenantId);
    setGroupHrCustomBlocksByEntity((prev) => ({ ...prev, [entityId]: prev[entityId] ?? [] }));
    setGroupHrCustomFieldDefsByEntity((prev) => ({
      ...prev,
      [entityId]: prev[entityId] ?? toGroupHrFieldDefs(rows),
    }));
    setGroupHrSelectedCustomBlockCode('general');
  }

  async function openGroupHrDetailConfig(entityId: string) {
    const entity = settingsLegalEntities.find((x) => x.id === entityId);
    const effectiveEntityId = entity?.id ?? entityId;
    const tenantId = entity?.tenantId;
    setGroupHrDetailEntityId(effectiveEntityId);
    setGroupHrLeftAddBlockOpen(false);

    try {
      const defs = await fetchGroupHrCatalogFieldDefs(tenantId, null);
      if (defs.length > 0) {
        setGroupHrCustomFieldDefsByEntity((prev) => ({ ...prev, [effectiveEntityId]: defs }));
        setGroupHrCustomBlocksByEntity((prev) => ({
          ...prev,
          [effectiveEntityId]: groupHrBlocksFromFieldDefs(defs, tenantId),
        }));
        setGroupHrSelectedCustomBlockCode(defs[0]?.blockCode ?? null);
        setEmployeeMetadataByEntity((prev) => ({
          ...prev,
          [effectiveEntityId]: toEmployeeMetadataRows(defs),
        }));
      } else if (getGroupHrCatalogGroups(tenantId)) {
        applyGroupHrCatalogLayout(effectiveEntityId, tenantId);
      } else {
        applyGroupHrCatalogLayout(effectiveEntityId, tenantId);
      }
    } catch {
      if (getGroupHrCatalogGroups(tenantId)) {
        applyGroupHrCatalogLayout(effectiveEntityId, tenantId);
      } else {
        applyGroupHrCatalogLayout(effectiveEntityId, tenantId);
      }
      setPublishMessage('Chưa đọc được catalog từ HRM — đang dùng cấu hình mặc định.');
    }
    setGroupHrFieldsConfigOpen(true);
  }

  function updateGroupHrFieldDef(
    entityId: string,
    fieldId: string,
    patch: Partial<Pick<InfrastructureCustomFieldDef, 'labelVi' | 'dataType' | 'selectConfig' | 'visible'>>,
  ) {
    setGroupHrCustomFieldDefsByEntity((prev) => ({
      ...prev,
      [entityId]: (prev[entityId] ?? []).map((row) => {
        if (row.id !== fieldId) return row;
        const next = { ...row, ...patch };
        if (patch.dataType !== undefined && patch.dataType !== 'select') {
          next.selectConfig = '';
        }
        return next;
      }),
    }));
  }

  function deleteGroupHrFieldDef(entityId: string, fieldId: string) {
    setGroupHrCustomFieldDefsByEntity((prev) => ({
      ...prev,
      [entityId]: (prev[entityId] ?? []).filter((row) => row.id !== fieldId),
    }));
  }

  function closeGroupHrFieldsConfig() {
    setGroupHrFieldsConfigOpen(false);
    setGroupHrDetailEntityId(null);
    setGroupHrLeftAddBlockOpen(false);
  }

  function resolveGroupHrBlockLabel(
    blockCode: string,
    entityId: string,
    usePresetBlocks: boolean,
  ): string {
    const presetBlock = (groupHrCustomBlocksByEntity[entityId] ?? []).find(
      (b) => b.blockCode === blockCode,
    );
    if (presetBlock?.labelVi.trim()) return presetBlock.labelVi;
    if (!usePresetBlocks) {
      const ov = groupHrBlockTitleOverridesByEntity[entityId];
      if (blockCode === 'general') return ov?.general ?? groupHrBlockTitleDraft.general;
      if (blockCode === 'location') return ov?.location ?? groupHrBlockTitleDraft.location;
      if (blockCode === 'capacity') return ov?.capacity ?? groupHrBlockTitleDraft.capacity;
    }
    const fromGroups = getGroupHrCatalogGroups(
      settingsLegalEntities.find((e) => e.id === entityId)?.tenantId,
    )?.find((g) => g.groupCode === blockCode);
    return fromGroups?.groupLabel ?? blockCode;
  }

  async function publishVersionChange(scope: string, payload: unknown) {
    try {
      const res = await fetch('/version/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          artifactType: 'system-settings',
          artifactKey: scope,
          changedAt: new Date().toISOString(),
          payload,
        }),
      });
      if (!res.ok) throw new Error('Phản hồi máy chủ không thành công');
      setPublishMessage(`Đã ghi version mới cho ${scope} lúc ${new Date().toLocaleTimeString('vi-VN')}`);
    } catch {
      setPublishMessage(
        `Không kết nối được /version/publish. Đã lưu tạm trên giao diện (${scope}) lúc ${new Date().toLocaleTimeString('vi-VN')}`,
      );
    }
  }

  function getCommandCenterStorageScope() {
    return { tenantId, companyId };
  }

  async function saveInfrastructureSettingsToDb(next?: {
    foundationCategories?: unknown;
    sites?: unknown;
    blockTitleOverridesByEntity?: unknown;
    customBlocksByEntity?: unknown;
    customFieldDefsByEntity?: unknown;
  }) {
    const scope = getCommandCenterStorageScope();
    const payload = {
      foundationCategories: next?.foundationCategories ?? foundationCategories,
      sites: next?.sites ?? infrastructureSites,
      blockTitleOverridesByEntity:
        next?.blockTitleOverridesByEntity ?? infrastructureBlockTitleOverridesByEntity,
      customBlocksByEntity: next?.customBlocksByEntity ?? infrastructureCustomBlocksByEntity,
      customFieldDefsByEntity: next?.customFieldDefsByEntity ?? infrastructureCustomFieldDefsByEntity,
    };
    await saveInfrastructureSettings(
      payload as InfrastructureSettingsPayload,
      scope.tenantId,
      scope.companyId,
    );
  }

  async function loadInfrastructureSettingsFromDb() {
    const scope = getCommandCenterStorageScope();
    setInfrastructureCatalogSource('loading');
    setInfrastructureCatalogFailed(false);
    try {
      const data = await fetchInfrastructureSettings(scope.tenantId, scope.companyId);
      await fetchInfrastructureSummary(scope.tenantId, scope.companyId);
      const apiCategories = Array.isArray(data.foundationCategories)
        ? (data.foundationCategories as InfrastructureFoundationCategory[])
        : [];
      const resolved = resolveInfrastructureFoundationLoad(
        apiCategories,
        allowMockFallback(),
        INFRASTRUCTURE_MOCK_SEED,
        false,
      );
      setFoundationCategories(resolved.categories);
      setInfrastructureCatalogSource(resolved.source);
      setInfrastructureCatalogFailed(resolved.loadFailed);
      if (Array.isArray(data.sites)) {
        setInfrastructureSites(data.sites as typeof infrastructureSites);
      }
      if (data.blockTitleOverridesByEntity) {
        setInfrastructureBlockTitleOverridesByEntity(
          data.blockTitleOverridesByEntity as typeof infrastructureBlockTitleOverridesByEntity,
        );
      }
      if (data.customBlocksByEntity) {
        setInfrastructureCustomBlocksByEntity(
          data.customBlocksByEntity as typeof infrastructureCustomBlocksByEntity,
        );
      }
      if (data.customFieldDefsByEntity) {
        setInfrastructureCustomFieldDefsByEntity(
          data.customFieldDefsByEntity as typeof infrastructureCustomFieldDefsByEntity,
        );
      }
      setInfrastructureDbHydrated(true);
      setMenuNotice(null);
    } catch {
      const resolved = resolveInfrastructureFoundationLoad(
        [],
        allowMockFallback(),
        INFRASTRUCTURE_MOCK_SEED,
        true,
      );
      setFoundationCategories(resolved.categories);
      setInfrastructureCatalogSource(resolved.source);
      setInfrastructureCatalogFailed(true);
      setInfrastructureDbHydrated(true);
      throw new Error('infrastructure settings load failed');
    }
  }

  async function syncGroupHrFieldsToHrmCatalogs(
    entityId: string,
    defs: InfrastructureCustomFieldDef[],
  ): Promise<void> {
    const entity = settingsLegalEntities.find((x) => x.id === entityId);
    const payload: GroupHrCatalogFieldDto[] = defs
      .filter((x) => x.visible)
      .map((d) => ({
        id: d.id,
        fieldCode: d.fieldCode,
        labelVi: d.labelVi,
        dataType: d.dataType,
        blockCode: d.blockCode,
        visible: d.visible,
        selectConfig: d.selectConfig ?? '',
        hrmCatalogKey:
          (d.hrmCatalogKey as GroupHrCatalogFieldDto['hrmCatalogKey']) ??
          resolveHrmCatalogKey(d.blockCode, d.fieldCode),
      }));
    await syncGroupHrFieldDefsToHrm(payload, entity?.tenantId, null);
  }

  async function saveCompanySettings() {
    const isHoldingRoot = companyEntityId === GROUP_HOLDING_ROOT_ID;
    const nextErrors: {
      enterpriseCode?: string;
      charterCapital?: string;
      taxCode?: string;
      nameVi?: string;
    } = {};
    if (!/^\d+$/.test(String(companyForm.enterpriseCode || ''))) {
      nextErrors.enterpriseCode = 'Mã số doanh nghiệp phải là số.';
    }
    if (Number(companyForm.charterCapital) <= 0) {
      nextErrors.charterCapital = 'Vốn điều lệ phải lớn hơn 0.';
    }
    if (!String(companyForm.nameVi || '').trim()) {
      nextErrors.nameVi = 'Tên pháp nhân (tiếng Việt) là bắt buộc.';
    }
    const taxDigits = String(companyForm.taxCode || '').trim();
    if (taxDigits && !/^\d{10,13}$/.test(taxDigits)) {
      nextErrors.taxCode = 'Mã số thuế phải có 10–13 chữ số.';
    }
    setCompanyErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      const msg = 'Chưa thể lưu. Vui lòng kiểm tra lại các trường đang báo lỗi.';
      setPublishMessage(msg);
      setCompanySaveFeedback({ kind: 'error', text: msg });
      return;
    }

    setCompanySaving(true);
    setCompanySaveFeedback(null);

    try {
    const parentId =
      companyForm.entityLevel === 'parent' ? null : companyForm.parentEntityId || null;
    const existing = companyEntityId ? legalEntityList.find((e) => e.id === companyEntityId) : undefined;
    const scopeRow =
      companyEntityId && companyEntityId !== 'new'
        ? settingsLegalEntities.find((e) => e.id === companyEntityId) ??
          legalEntityList.find((e) => e.id === companyEntityId)
        : settingsLegalEntities[0] ?? legalEntityList[0];
    const tenantId =
      scopeRow?.tenantId ??
      import.meta.env.VITE_DEFAULT_TENANT_ID ??
      'xevn';
    const xbosCompanyId =
      isHoldingRoot || companyForm.entityLevel === 'parent'
        ? GROUP_HOLDING_COMPANY_ID
        : MEMBER_DEFAULT_COMPANY_ID;
    const legalPayload = {
      code: (companyForm.shortName || companyForm.enterpriseCode || 'LE').trim(),
      name: (companyForm.nameVi || 'Pháp nhân mới').trim(),
      entityType: isHoldingRoot || companyForm.entityLevel === 'parent' ? 'holding' : 'subsidiary',
      taxCode: companyForm.taxCode || undefined,
      establishedAt: companyForm.firstIssueDate || undefined,
      address: companyForm.headOfficeAddress || undefined,
      charterCapital: Number(companyForm.charterCapital) || undefined,
      legalRepresentative: companyForm.legalRepName || undefined,
      payload: { companyForm },
    };

    const uiEntityId =
      companyEntityId && companyEntityId !== 'new' ? companyEntityId : null;
    let saveEntityId: string | null = null;
    if (uiEntityId) {
      saveEntityId =
        resolvedLegalEntityApiId ??
        resolveLegalEntityApiIdFromList(
          {
            id: uiEntityId,
            tenantId,
            code: scopeRow?.code ?? companyForm.shortName,
          },
          legalEntityApiCache,
        );
      if (isHoldingRoot && !saveEntityId) {
        try {
          const holdingRows = await fetchHoldingLegalEntities(tenantId);
          setLegalEntityApiCache((prev) => {
            const byId = new Map(prev.map((r) => [String(r.id), r]));
            for (const r of holdingRows) byId.set(String(r.id), r);
            return [...byId.values()];
          });
          saveEntityId = resolveLegalEntityApiIdFromList(
            { id: uiEntityId, tenantId, code: scopeRow?.code ?? companyForm.shortName },
            holdingRows,
          );
        } catch {
          /* create path below */
        }
      }
      if (!saveEntityId && !isHoldingRoot && isPersistedApiId(uiEntityId)) {
        saveEntityId = uiEntityId;
      }
    }

      let persistedId = companyEntityId === 'new' ? null : saveEntityId;
      if (companyEntityId === 'new') {
        const saved = await createLegalEntity(tenantId, xbosCompanyId, legalPayload);
        persistedId = String(saved.id);
      } else if (companyEntityId) {
        if (!saveEntityId || !isPersistedApiId(saveEntityId)) {
          if (isHoldingRoot) {
            const saved = await createLegalEntity(tenantId, GROUP_HOLDING_COMPANY_ID, legalPayload);
            persistedId = String(saved.id);
            setResolvedLegalEntityApiId(persistedId);
          } else {
            const msg =
              'Chưa có hồ sơ pháp nhân trên XBOS cho đơn vị này — chạy seed org-foundation hoặc chọn đơn vị có UUID.';
            setPublishMessage(msg);
            setCompanySaveFeedback({ kind: 'error', text: msg });
            return;
          }
        } else {
          await updateLegalEntity(tenantId, xbosCompanyId, saveEntityId, legalPayload);
          persistedId = saveEntityId;
        }
      }

      const nextRow: Company = {
      id: persistedId ?? `comp-${Date.now()}`,
      code: companyForm.shortName || 'NEW',
      name: companyForm.nameVi || 'Pháp nhân mới',
      employeeCount: companyEntityId === 'new' ? 0 : existing?.employeeCount ?? 0,
      revenue: companyEntityId === 'new' ? 0 : existing?.revenue ?? 0,
      status: 'active',
      address: companyForm.headOfficeAddress,
      establishedDate:
        companyEntityId === 'new'
          ? new Date().toISOString().slice(0, 10)
          : existing?.establishedDate ?? '2020-01-01',
      entityLevel: companyForm.entityLevel,
      parentEntityId: parentId,
    };

    if (companyEntityId === 'new') {
      setLegalEntityList((prev) => [...prev, nextRow]);
      setDepartmentRowsByEntity((prev) => {
        const nextMap = { ...prev };
        const list = nextMap.new ?? [];
        delete nextMap.new;
        nextMap[nextRow.id] = list;
        return nextMap;
      });
      setEmployeeMetadataByEntity((prev) => {
        const nextMap = { ...prev };
        const list = nextMap.new ?? createDefaultEmployeeMetadataRows(nextRow.id);
        delete nextMap.new;
        nextMap[nextRow.id] = list;
        return nextMap;
      });
    } else if (companyEntityId) {
      setLegalEntityList((prev) =>
        prev.map((e) => (e.id === companyEntityId ? { ...e, ...nextRow, id: e.id } : e)),
      );
    }

    const successMsg = isHoldingRoot
      ? 'Đã lưu hồ sơ tập đoàn (holding) lên org-foundation.'
      : 'Đã lưu và làm mới danh sách pháp nhân.';
    setCompanySaveFeedback({ kind: 'success', text: successMsg });
    setPublishMessage(successMsg);
    setCompanySettingsView('list');
    setCompanyEntityId(null);
    await reloadMemberAndLegalEntities();
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Không lưu được pháp nhân lên XBOS org-foundation.';
      if (isLegalEntityValidationHttpError(msg)) {
        const fieldErrors = parseLegalEntitySaveFieldErrors(msg);
        setCompanyErrors((prev) => ({ ...prev, ...fieldErrors }));
      }
      setPublishMessage(msg);
      setCompanySaveFeedback({ kind: 'error', text: msg });
    } finally {
      setCompanySaving(false);
    }
  }

  function resolveDeptConfigEntityKey(): string | null {
    if (activeSettingsMenu === 'tenant_departments') return settingsScopeEntityId;
    return companyEntityId;
  }

  function resolveLegalProfileScope(): { entityId: string | null; tenantId: string } {
    const uiId = companyEntityId && companyEntityId !== 'new' ? companyEntityId : null;
    const scopeRow =
      (uiId ? settingsLegalEntities.find((e) => e.id === uiId) : undefined) ??
      (uiId ? legalEntityList.find((e) => e.id === uiId) : undefined) ??
      settingsLegalEntities[0];
    const tenantId =
      (scopeRow && 'tenantId' in scopeRow ? scopeRow.tenantId : undefined) ??
      MASTER_TENANT_ID;
    if (!uiId || uiId === GROUP_HOLDING_ROOT_ID) {
      return { entityId: null, tenantId };
    }
    const entityId =
      resolvedLegalEntityApiId ??
      resolveLegalEntityApiIdFromList(
        { id: uiId, tenantId, code: scopeRow?.code },
        legalEntityApiCache,
      ) ??
      (isPersistedApiId(uiId) ? uiId : null);
    return { entityId, tenantId };
  }

  function openEmployeeMetadataPreview(entityId: string) {
    const tenantId =
      settingsLegalEntities.find((e) => e.id === entityId)?.tenantId ??
      import.meta.env.VITE_DEFAULT_TENANT_ID ??
      'xevn';
    const fields =
      employeeMetadataByEntity[entityId] ?? createDefaultEmployeeMetadataRows(entityId, tenantId);
    const initial: Record<string, string> = {};
    for (const f of fields) initial[f.id] = '';
    setEmployeeMetadataPreviewValues(initial);
    setEmployeeMetadataPreviewOpen(true);
  }

  function schedulePermissionMatrixSave(roleId: string, rows: PermissionMatrixRow[]) {
    if (permissionMatrixSaveTimerRef.current) {
      window.clearTimeout(permissionMatrixSaveTimerRef.current);
    }
    permissionMatrixSaveTimerRef.current = window.setTimeout(() => {
      void savePermissionMatrix(
        roleId,
        rows.map((r) => ({
          rowId: r.id,
          view: r.view,
          write: r.write,
          delete: r.delete,
          approve: r.approve,
          dataScope: r.dataScope,
        })),
        MASTER_TENANT_ID,
      ).catch((error) => {
        setPublishMessage(
          error instanceof Error ? error.message : 'Không lưu được ma trận phân quyền.',
        );
      });
    }, 600);
  }

  function mergeDepartmentRows(updater: (prev: LegalDepartmentRow[]) => LegalDepartmentRow[]) {
    const key = resolveDeptConfigEntityKey();
    if (!key) return;
    setDepartmentRowsByEntity((map) => {
      const prev = map[key] ?? [];
      return { ...map, [key]: updater(prev) };
    });
  }

  function addDepartmentRow() {
    mergeDepartmentRows((prev) => [...prev, createBlankDeptRow()]);
  }

  function updateDepartmentRow(
    id: string,
    patch: Partial<
      Pick<LegalDepartmentRow, 'code' | 'name' | 'parentDeptId' | 'headId' | 'functionText'>
    >,
  ) {
    mergeDepartmentRows((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        if (patch.parentDeptId !== undefined && patch.parentDeptId === id) return r;
        return { ...r, ...patch };
      }),
    );
  }

  function deleteDepartmentRow(id: string) {
    void (async () => {
      if (isPersistedApiId(id)) {
        const key = resolveDeptConfigEntityKey();
        const tenantId =
          settingsLegalEntities.find((e) => e.id === key)?.tenantId ??
          import.meta.env.VITE_DEFAULT_TENANT_ID ??
          'xevn';
        try {
          await deleteOrgUnit(tenantId, MEMBER_DEFAULT_COMPANY_ID, id);
        } catch (error) {
          setPublishMessage(error instanceof Error ? error.message : 'Không xóa được phòng ban.');
          return;
        }
      }
      mergeDepartmentRows((prev) =>
        prev
          .filter((r) => r.id !== id)
          .map((r) => (r.parentDeptId === id ? { ...r, parentDeptId: '' } : r)),
      );
    })();
  }

  async function submitDepartmentRow(row: LegalDepartmentRow) {
    const key = resolveDeptConfigEntityKey();
    if (!key || key === 'new') {
      setPublishMessage('Lưu pháp nhân trước khi ghi phòng ban lên org-foundation.');
      return;
    }
    const tenantId =
      settingsLegalEntities.find((e) => e.id === key)?.tenantId ??
      import.meta.env.VITE_DEFAULT_TENANT_ID ??
      'xevn';
    try {
      const saved = await saveOrgUnit(
        tenantId,
        MEMBER_DEFAULT_COMPANY_ID,
        {
          code: row.code.trim() || `PB-${Date.now()}`,
          name: row.name.trim() || 'Phòng ban',
          orgType: 'department',
          parentId: row.parentDeptId && isPersistedApiId(row.parentDeptId) ? row.parentDeptId : null,
          legalEntityId: isPersistedApiId(key) ? key : null,
          payload: { functionText: row.functionText, headId: row.headId },
        },
        isPersistedApiId(row.id) ? row.id : undefined,
      );
      const savedId = String(saved.id ?? row.id);
      mergeDepartmentRows((prev) =>
        prev.map((r) => (r.id === row.id ? { ...r, id: savedId } : r)),
      );
      setPublishMessage('Đã lưu phòng ban lên org-foundation.');
    } catch (error) {
      setPublishMessage(error instanceof Error ? error.message : 'Không lưu được phòng ban.');
    }
  }

  function openInfrastructureMaster() {
    setInfrastructureView('list');
    setInfrastructureEditId(null);
    setFoundationCategoryDetailId(null);
    setFoundationForm(null);
  }

  function closeFoundationCategoryDetail() {
    setFoundationCategoryDetailId(null);
    setFoundationForm(null);
  }

  function openNewFoundationCategory() {
    const id = `fcat-${Date.now()}`;
    const row: InfrastructureFoundationCategory = {
      id,
      code: '',
      nameVi: '',
      description: '',
      appliesToCompanyIds: [],
    };
    setFoundationCategories((prev) => [...prev, row]);
    setFoundationCategoryDetailId(id);
    setFoundationForm(row);
  }

  function openFoundationCategoryDetail(id: string) {
    const cat = foundationCategories.find((c) => c.id === id);
    if (!cat) return;
    setFoundationCategoryDetailId(id);
    setFoundationForm({ ...cat });
  }

  async function saveFoundationCategory() {
    if (!foundationForm) return;
    if (!foundationForm.code.trim()) {
      setPublishMessage('Vui lòng nhập mã danh mục nền (Origin).');
      return;
    }
    if (!foundationForm.nameVi.trim()) {
      setPublishMessage('Vui lòng nhập tên danh mục nền.');
      return;
    }
    setFoundationCategories((prev) => {
      const idx = prev.findIndex((c) => c.id === foundationForm.id);
      if (idx < 0) return [...prev, foundationForm];
      const next = prev.slice();
      next[idx] = foundationForm;
      return next;
    });
    void publishVersionChange('infrastructure-foundation-category', foundationForm);
    const nextFoundationCategories = (() => {
      const idx = foundationCategories.findIndex((c) => c.id === foundationForm.id);
      if (idx < 0) return [...foundationCategories, foundationForm];
      const next = foundationCategories.slice();
      next[idx] = foundationForm;
      return next;
    })();
    void saveInfrastructureSettingsToDb({ foundationCategories: nextFoundationCategories }).catch(() => {
      setPublishMessage('Lưu danh mục nền cục bộ thành công nhưng chưa ghi được DB.');
    });
    setPublishMessage('Đã lưu danh mục nền và phạm vi áp dụng.');
  }

  function toggleFoundationCompany(companyId: string) {
    setFoundationForm((prev) => {
      if (!prev) return prev;
      const set = new Set(prev.appliesToCompanyIds);
      if (set.has(companyId)) set.delete(companyId);
      else set.add(companyId);
      return { ...prev, appliesToCompanyIds: Array.from(set) };
    });
  }

  function closeDeptSystemDetail() {
    setDeptSystemDetailId(null);
    setDeptSystemForm(null);
  }

  function openNewDeptSystemTemplate() {
    setDeptSystemTab('templates');
    const id = `dtpl-${Date.now()}`;
    const row: DeptSystemFoundationTemplate = {
      id,
      code: '',
      nameVi: '',
      description: '',
      appliesToCompanyIds: [],
      enabledOrgGradeLevels: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    };
    setDeptSystemTemplates((prev) => [...prev, row]);
    setDeptSystemDetailId(id);
    setDeptSystemForm(row);
  }

  function openDeptSystemDetail(id: string) {
    const t = deptSystemTemplates.find((x) => x.id === id);
    if (!t) return;
    setDeptSystemTab('templates');
    setDeptSystemDetailId(id);
    setDeptSystemForm({ ...t });
  }

  async function saveDeptSystemTemplate() {
    if (!deptSystemForm) return;
    if (!deptSystemForm.code.trim()) {
      setPublishMessage('Vui lòng nhập mã khung phòng/ban.');
      return;
    }
    if (!deptSystemForm.nameVi.trim()) {
      setPublishMessage('Vui lòng nhập tên khung tổ chức.');
      return;
    }
    if (!deptSystemForm.appliesToCompanyIds.length) {
      setPublishMessage('Chọn ít nhất một pháp nhân thành viên áp dụng khung này.');
      return;
    }
    if (!deptSystemForm.enabledOrgGradeLevels.length) {
      setPublishMessage('Chọn ít nhất một cấp ORG GRADE kích hoạt.');
      return;
    }
    setDeptSystemTemplates((prev) => {
      const idx = prev.findIndex((x) => x.id === deptSystemForm.id);
      if (idx < 0) return [...prev, deptSystemForm];
      const next = prev.slice();
      next[idx] = deptSystemForm;
      return next;
    });
    try {
      await upsertDeptSystemTemplate(deptSystemForm, tenantId, companyId);
      void deptTemplatesHook.reload();
      void publishVersionChange('dept-system-foundation-template', deptSystemForm);
      setPublishMessage('Đã lưu khung phòng ban và phạm vi ORG GRADE (DB).');
    } catch (error) {
      setPublishMessage(
        error instanceof Error ? error.message : 'Không lưu được khung phòng/ban lên DB.',
      );
    }
  }

  function toggleDeptSystemCompany(companyId: string) {
    setDeptSystemForm((prev) => {
      if (!prev) return prev;
      const set = new Set(prev.appliesToCompanyIds);
      if (set.has(companyId)) set.delete(companyId);
      else set.add(companyId);
      return { ...prev, appliesToCompanyIds: Array.from(set) };
    });
  }

  function toggleDeptSystemGrade(level: number) {
    setDeptSystemForm((prev) => {
      if (!prev) return prev;
      const set = new Set(prev.enabledOrgGradeLevels);
      if (set.has(level)) set.delete(level);
      else set.add(level);
      return {
        ...prev,
        enabledOrgGradeLevels: Array.from(set).sort((a, b) => a - b),
      };
    });
  }

  /** Mở modal cấu hình khối/trường — gọi từ chi tiết danh mục nền (sau phạm vi) hoặc khi sửa điểm. */
  function openInfrastructureFieldsConfigModal(entityId?: string) {
    const resolved =
      entityId ||
      (infraForm.operatingEntityId?.trim() ? infraForm.operatingEntityId : '') ||
      legalEntityList[0]?.id ||
      'comp-002';
    setInfrastructureFieldsConfigEntityId(resolved);
    setInfraSelectedCustomBlockCode('general');
    setInfraLeftAddBlockOpen(false);
    const baseUi = {
      blocks: {
        general: { titleVi: 'Khối Thông tin chung' },
        location: { titleVi: 'Khối Vị trí và liên hệ' },
        capacity: { titleVi: 'Khối Năng lực (Capacity)' },
      },
    };
    const ov = infrastructureBlockTitleOverridesByEntity[resolved] ?? {};
    setInfraBlockTitleDraft({
      general: ov.general ?? baseUi.blocks.general.titleVi,
      location: ov.location ?? baseUi.blocks.location.titleVi,
      capacity: ov.capacity ?? baseUi.blocks.capacity.titleVi,
    });
    setInfrastructureFieldsConfigOpen(true);
  }

  function setInfraCustomFieldValue(fieldCode: string, value: string) {
    setInfraForm((prev) => ({
      ...prev,
      customFields: {
        ...(prev.customFields ?? {}),
        [fieldCode]: value,
      },
    }));
  }

  function openNewInfrastructureSite() {
    setInfrastructureBrowseTab('sites');
    closeFoundationCategoryDetail();
    setInfrastructureEditId('new');
    setInfraForm(createEmptyInfrastructureForm());
    setInfrastructureView('detail');
  }

  function openEditInfrastructureSite(id: string) {
    const row = infrastructureSites.find((s) => s.id === id);
    if (!row) return;
    setInfrastructureBrowseTab('sites');
    closeFoundationCategoryDetail();
    setInfrastructureEditId(id);
    setInfraForm(infrastructureRowToForm(row));
    setInfrastructureView('detail');
  }

  async function saveInfrastructureSite() {
    const nextRow: InfrastructureSiteRow = {
      id: infrastructureEditId === 'new' ? `inf-${Date.now()}` : infrastructureEditId!,
      ...infraForm,
    };
    await publishVersionChange('infrastructure-site', nextRow);
    if (infrastructureEditId === 'new') {
      const nextSites = [...infrastructureSites, nextRow];
      setInfrastructureSites(nextSites);
      void saveInfrastructureSettingsToDb({ sites: nextSites }).catch(() => {
        setPublishMessage('Đã lưu điểm hạ tầng cục bộ nhưng chưa ghi được DB.');
      });
    } else if (infrastructureEditId) {
      const nextSites = infrastructureSites.map((s) => (s.id === infrastructureEditId ? nextRow : s));
      setInfrastructureSites(nextSites);
      void saveInfrastructureSettingsToDb({ sites: nextSites }).catch(() => {
        setPublishMessage('Đã cập nhật điểm hạ tầng cục bộ nhưng chưa ghi được DB.');
      });
    }
    openInfrastructureMaster();
  }

  function addPermissionRole() {
    const name = window.prompt('Nhập tên vai trò mới', 'Vai trò tùy chỉnh');
    if (name === null || !name.trim()) return;
    const id = `role-${Date.now()}`;
    const label = name.trim();
    setPermissionRoles((prev) => [...prev, { id, label }]);
    setActivePermissionRoleId(id);
    setPermissionMatrixByRole((prev) => ({
      ...prev,
      [id]: buildPermissionMatrix({}),
    }));
  }

  function patchPermissionMatrixRow(
    roleId: string,
    rowId: string,
    patch: Partial<PermissionMatrixRow>,
  ) {
    setPermissionMatrixByRole((prev) => {
      const rows = prev[roleId];
      if (!rows) return prev;
      const nextRows = rows.map((r) => (r.id === rowId ? { ...r, ...patch } : r));
      schedulePermissionMatrixSave(roleId, nextRows);
      return { ...prev, [roleId]: nextRows };
    });
  }

  function openWorkflowList() {
    setWorkflowView('list');
    setWorkflowEditId(null);
    setWorkflowForm(null);
    setWorkflowDetailTab('graph');
    setWorkflowCanvasSelectedStepId(null);
  }

  function openNewWorkflow() {
    const tempId = `wf-new-${Date.now()}`;
    setWorkflowEditId('new');
    setWorkflowForm(createEmptyWorkflowDefinition(tempId));
    setWorkflowView('detail');
    setWorkflowDetailTab('graph');
    setWorkflowCanvasSelectedStepId(null);
  }

  function openEditWorkflow(id: string) {
    const w = workflows.find((x) => x.id === id);
    if (!w) return;
    setWorkflowEditId(id);
    setWorkflowForm(JSON.parse(JSON.stringify(w)) as WorkflowDefinition);
    setWorkflowView('detail');
    setWorkflowDetailTab('graph');
    setWorkflowCanvasSelectedStepId(null);
  }

  async function saveWorkflow() {
    if (!workflowForm) return;
    const sortedSteps = workflowForm.steps
      .slice()
      .sort((a, b) => a.order - b.order)
      .map((s, i) => ({
        ...s,
        order: i + 1,
        transitions: ensureTransitions(s.transitions).map((t) =>
          t.kind === 'reject' && !workflowHandlerRoleAllowsRejectOutcome(s.handlerRoleId)
            ? { ...t, destinationId: WF_NODE_END_REJECT }
            : t,
        ),
      }));
    let next: WorkflowDefinition = { ...workflowForm, steps: sortedSteps };
    const isNew =
      workflowEditId === 'new' || !workflowEditId || !isPersistedApiId(workflowEditId);
    const apiDefinitionId = isNew ? undefined : workflowEditId ?? undefined;
    try {
      const payload = workflowDefinitionToApiPayload(next);
      const saved = await saveWorkflowDefinition(
        payload,
        apiDefinitionId,
        tenantId,
        companyId,
      );
      next = apiRowToWorkflowDefinition(saved);
    } catch (error) {
      setPublishMessage(
        error instanceof Error ? error.message : 'Không lưu được quy trình lên workflow-engine.',
      );
      return;
    }
    await publishVersionChange('workflow-system', next);
    if (isNew) {
      setWorkflows((prev) => [...prev, next]);
    } else if (workflowEditId) {
      setWorkflows((prev) => prev.map((x) => (x.id === workflowEditId ? next : x)));
    }
    setPublishMessage('Đã lưu quy trình lên workflow-engine (DB).');
    openWorkflowList();
  }

  function addWorkflowStepRow() {
    setWorkflowForm((f) => {
      if (!f) return f;
      const sorted = [...f.steps].sort((a, b) => a.order - b.order);
      const last = sorted[sorted.length - 1];
      const newStep = createWorkflowGraphStep(sorted.length + 1, {});
      const updated = sorted.map((s) =>
        s.id === last?.id
          ? {
              ...s,
              transitions: s.transitions.map((t) =>
                t.kind === 'approve' ? { ...t, destinationId: newStep.id } : t,
              ),
            }
          : s,
      );
      const wiredNew: WorkflowGraphStep = {
        ...newStep,
        transitions: createDefaultTransitions({
          approveTo: WF_NODE_END_OK,
          rejectTo: last?.id ?? WF_NODE_START,
          exceptionTo: WF_NODE_BOD,
        }),
      };
      return { ...f, steps: [...updated, wiredNew] };
    });
  }

  function removeWorkflowStepRow(stepId: string) {
    setWorkflowForm((f) => {
      if (!f) return f;
      const rewire = (dest: string) =>
        dest === stepId ? WF_NODE_END_REJECT : dest;
      const steps = f.steps
        .filter((s) => s.id !== stepId)
        .map((s, i) => ({
          ...s,
          order: i + 1,
          transitions: s.transitions.map((t) => ({
            ...t,
            destinationId: rewire(t.destinationId),
          })),
        }));
      return { ...f, steps };
    });
  }

  function patchWorkflowStepRow(stepId: string, patch: Partial<WorkflowGraphStep>) {
    setWorkflowForm((f) => {
      if (!f) return f;
      return {
        ...f,
        steps: f.steps.map((s) => {
          if (s.id !== stepId) return s;
          const next = { ...s, ...patch };
          if (
            patch.handlerRoleId !== undefined &&
            !workflowHandlerRoleAllowsRejectOutcome(next.handlerRoleId)
          ) {
            return {
              ...next,
              transitions: next.transitions.map((t) =>
                t.kind === 'reject' ? { ...t, destinationId: WF_NODE_END_REJECT } : t,
              ),
            };
          }
          return next;
        }),
      };
    });
  }

  function patchWorkflowGraphTransition(
    stepId: string,
    kind: WorkflowTransitionKind,
    destinationId: string,
  ) {
    setWorkflowForm((f) => {
      if (!f) return f;
      return {
        ...f,
        steps: f.steps.map((s) => {
          if (s.id !== stepId) return s;
          if (kind === 'reject' && !workflowHandlerRoleAllowsRejectOutcome(s.handlerRoleId)) {
            return s;
          }
          return {
            ...s,
            transitions: s.transitions.map((t) =>
              t.kind === kind ? { ...t, destinationId } : t,
            ),
          };
        }),
      };
    });
  }

  function addShareholderRow() {
    setShareholderRows((prev) => [
      ...prev,
      {
        id: `sh-${Date.now()}`,
        holderName: '',
        identityCode: '',
        ratioPercent: 0,
        contributedValue: 0,
        submitted: false,
      },
    ]);
  }

  function updateShareholderRow(id: string, key: keyof ShareholderRow, value: string | number | boolean) {
    setShareholderRows((prev) =>
      prev.map((row) => {
        if (row.id !== id) return row;
        const next = { ...row, [key]: value } as ShareholderRow;
        if (key === 'ratioPercent' || key === 'contributedValue') {
          const ratio = Number(key === 'ratioPercent' ? value : row.ratioPercent);
          next.contributedValue = Math.round((Number(companyForm.charterCapital) * ratio) / 100);
        }
        return next;
      }),
    );
  }

  async function submitShareholderRow(id: string) {
    const target = shareholderRows.find((r) => r.id === id);
    if (!target) return;
    const { entityId, tenantId } = resolveLegalProfileScope();
    if (!entityId) {
      setPublishMessage('Chọn hoặc lưu pháp nhân trước khi ghi cổ đông.');
      return;
    }
    try {
      const saved = await saveShareholder(
        entityId,
        tenantId,
        {
          holderName: target.holderName,
          identityCode: target.identityCode,
          ratioPercent: target.ratioPercent,
          contributedValue: target.contributedValue,
        },
        isPersistedApiId(target.id) ? target.id : undefined,
      );
      setShareholderRows((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, id: String(saved.id), submitted: true } : r,
        ),
      );
      setPublishMessage('Đã lưu cổ đông lên hệ thống.');
    } catch (error) {
      setPublishMessage(error instanceof Error ? error.message : 'Không lưu được cổ đông.');
    }
  }

  function deleteShareholderRow(id: string) {
    void (async () => {
      const { entityId, tenantId } = resolveLegalProfileScope();
      if (entityId && isPersistedApiId(id)) {
        try {
          await deleteShareholderApi(entityId, tenantId, id);
        } catch (error) {
          setPublishMessage(error instanceof Error ? error.message : 'Không xóa được cổ đông.');
          return;
        }
      }
      setShareholderRows((prev) => prev.filter((r) => r.id !== id));
    })();
  }

  function addLegalDocRow() {
    setLegalDocRows((prev) => [
      ...prev,
      {
        id: `doc-${Date.now()}`,
        documentName: '',
        documentCode: '',
        issuedDate: '',
        expiredDate: '',
        fileName: '',
        submitted: false,
      },
    ]);
  }

  function updateLegalDocRow(id: string, key: keyof LegalDocRow, value: string | boolean) {
    setLegalDocRows((prev) =>
      prev.map((row) => (row.id === id ? ({ ...row, [key]: value } as LegalDocRow) : row)),
    );
  }

  async function submitLegalDocRow(id: string) {
    const target = legalDocRows.find((r) => r.id === id);
    if (!target) return;
    const { entityId, tenantId } = resolveLegalProfileScope();
    if (!entityId) {
      setPublishMessage('Chọn hoặc lưu pháp nhân trước khi ghi tài liệu pháp lý.');
      return;
    }
    try {
      const saved = await saveLegalDocument(
        entityId,
        tenantId,
        {
          documentName: target.documentName,
          documentCode: target.documentCode,
          issuedDate: target.issuedDate || undefined,
          expiredDate: target.expiredDate || undefined,
        },
        isPersistedApiId(target.id) ? target.id : undefined,
      );
      setLegalDocRows((prev) =>
        prev.map((r) =>
          r.id === id
            ? {
                ...r,
                id: String(saved.id),
                submitted: true,
                fileUrl: saved.file_url ?? r.fileUrl,
              }
            : r,
        ),
      );
      setPublishMessage('Đã lưu tài liệu pháp lý lên hệ thống.');
    } catch (error) {
      setPublishMessage(error instanceof Error ? error.message : 'Không lưu được tài liệu.');
    }
  }

  function deleteLegalDocRow(id: string) {
    void (async () => {
      const { entityId, tenantId } = resolveLegalProfileScope();
      if (entityId && isPersistedApiId(id)) {
        try {
          await deleteLegalDocumentApi(entityId, tenantId, id);
        } catch (error) {
          setPublishMessage(error instanceof Error ? error.message : 'Không xóa được tài liệu.');
          return;
        }
      }
      setLegalDocRows((prev) => prev.filter((r) => r.id !== id));
    })();
  }

  function triggerLegalDocUpload(rowId: string) {
    setLegalDocUploadTargetId(rowId);
    legalDocFileInputRef.current?.click();
  }

  async function onLegalDocFilePicked(file: File | undefined) {
    const rowId = legalDocUploadTargetId;
    if (!file || !rowId) return;
    const { entityId, tenantId } = resolveLegalProfileScope();
    if (!entityId) {
      setPublishMessage('Chọn pháp nhân trước khi upload file.');
      return;
    }
    let docId = rowId;
    const row = legalDocRows.find((r) => r.id === rowId);
    if (!row) return;
    try {
      if (!isPersistedApiId(docId)) {
        const created = await saveLegalDocument(entityId, tenantId, {
          documentName: row.documentName || file.name,
          documentCode: row.documentCode,
          issuedDate: row.issuedDate || undefined,
          expiredDate: row.expiredDate || undefined,
        });
        docId = String(created.id);
        setLegalDocRows((prev) => prev.map((r) => (r.id === rowId ? { ...r, id: docId } : r)));
      }
      const uploaded = await uploadLegalDocumentFile(entityId, tenantId, docId, file);
      setLegalDocRows((prev) =>
        prev.map((r) =>
          r.id === docId || r.id === rowId
            ? {
                ...r,
                id: docId,
                fileName: file.name,
                fileUrl: uploaded.file_url ?? legalDocumentViewUrl(docId),
                submitted: true,
              }
            : r,
        ),
      );
      setPublishMessage('Đã upload file tài liệu pháp lý.');
    } catch (error) {
      setPublishMessage(error instanceof Error ? error.message : 'Upload file thất bại.');
    } finally {
      setLegalDocUploadTargetId(null);
      if (legalDocFileInputRef.current) legalDocFileInputRef.current.value = '';
    }
  }

  function viewLegalDocument(row: LegalDocRow) {
    const url = row.fileUrl ?? (isPersistedApiId(row.id) ? legalDocumentViewUrl(row.id) : null);
    if (!url) {
      setPublishMessage('Chưa có file — hãy upload trước.');
      return;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  const railItems = useMemo(() => filterRailByRole(mockRailModules, persona), [persona]);

  const scopedTasks = useMemo(() => {
    const sourceKind =
      inboxTasksSource === 'loading' ? 'loading' : inboxTasksSource === 'mock' ? 'mock' : 'api';
    const base =
      sourceKind === 'loading'
        ? inboxTasks
        : resolveCommandCenterInboxTasks(sourceKind, inboxTasks, mockUnifiedTasks);
    return filterTasksByPersona(base, persona);
  }, [inboxTasks, inboxTasksSource, persona]);

  const inboxTasksStrict = useMemo(
    () =>
      resolveInboxStrictBanner(
        inboxTasksSource === 'loading' ? 'loading' : inboxTasksSource === 'mock' ? 'mock' : 'api',
        inboxTasksLoadFailed,
        scopedTasks.length,
      ),
    [inboxTasksSource, inboxTasksLoadFailed, scopedTasks.length],
  );

  const scopedAlerts = useMemo(() => {
    const base =
      portalAlertsSource === 'api' && portalAlerts.length
        ? portalAlerts
        : allowMockFallback()
          ? mockPortalAlerts
          : portalAlerts;
    return filterAlertsByPersona(base, persona);
  }, [portalAlerts, portalAlertsSource, persona]);

  const reloadInboxTasks = async () => {
    try {
      const tasks = await fetchCommandCenterInboxTasks(MASTER_TENANT_ID);
      setInboxTasksLoadFailed(false);
      if (tasks.length) {
        setInboxTasks(tasks);
        setInboxTasksSource('api');
      } else {
        setInboxTasks([]);
        setInboxTasksSource(allowMockFallback() ? 'mock' : 'api');
      }
    } catch {
      setInboxTasks([]);
      setInboxTasksLoadFailed(!allowMockFallback());
      setInboxTasksSource(allowMockFallback() ? 'mock' : 'api');
    }
  };

  const openInboxTaskDetail = (task: UnifiedTask) => {
    setInboxDetailTask(task);
    setInboxDetailOpen(true);
    setInboxDetailPayload(null);
    setInboxDetailLoadFailed(false);
    setInboxDetailLoading(true);
    void fetchWorkflowInstanceDetail(task.sourceId, MASTER_TENANT_ID, MEMBER_DEFAULT_COMPANY_ID)
      .then((detail) => {
        const normalized = normalizeWorkflowInstanceDetail(detail);
        setInboxDetailPayload(normalized);
        setInboxDetailLoadFailed(!normalized);
      })
      .catch(() => {
        setInboxDetailLoadFailed(true);
        setMenuNotice('Không tải được chi tiết workflow.');
      })
      .finally(() => setInboxDetailLoading(false));
  };

  const closeInboxTaskDetail = () => {
    setInboxDetailOpen(false);
    setInboxDetailTask(null);
    setInboxDetailPayload(null);
    setInboxDetailLoadFailed(false);
  };

  const completeInboxFromDrawer = async (outcome: 'approved' | 'rejected') => {
    if (!inboxDetailTask) return;
    setInboxDrawerBusy(true);
    try {
      await completeWorkflowTask(
        inboxDetailTask.cardId,
        { outcome },
        MASTER_TENANT_ID,
      );
      setMenuNotice(`Đã ${outcome === 'approved' ? 'hoàn thành' : 'từ chối'}: ${inboxDetailTask.title}`);
      closeInboxTaskDetail();
      await reloadInboxTasks();
    } catch (error) {
      setMenuNotice(error instanceof Error ? error.message : 'Không cập nhật được nhiệm vụ.');
    } finally {
      setInboxDrawerBusy(false);
    }
  };

  const quickCompleteInboxTask = async (task: UnifiedTask) => {
    setInboxActionBusyId(task.cardId);
    try {
      await completeWorkflowTask(task.cardId, { outcome: 'approved' }, MASTER_TENANT_ID);
      setMenuNotice(`Đã xử lý nhanh: ${task.title}`);
      await reloadInboxTasks();
    } catch (error: unknown) {
      setMenuNotice(error instanceof Error ? error.message : 'Không hoàn thành được nhiệm vụ workflow');
    } finally {
      setInboxActionBusyId(null);
    }
  };

  const filteredCards = useMemo(() => {
    if (selectedModule === 'all' || selectedModule === SYSTEM_SETTINGS) return scopedTasks;
    if (selectedModule === 'business') {
      return scopedTasks.filter((t) => t.moduleCode === 'x-bos');
    }
    return scopedTasks.filter((t) => t.moduleCode === selectedModule);
  }, [scopedTasks, selectedModule]);

  const taskCounts = useMemo(
    () => ({
      all: countInProgressByModule(scopedTasks, 'all'),
      finance: countInProgressByModule(scopedTasks, 'finance'),
      accounting: countInProgressByModule(scopedTasks, 'accounting'),
      xbos: countInProgressByModule(scopedTasks, 'x-bos'),
      hrm: countInProgressByModule(scopedTasks, 'hrm'),
      fleet: countInProgressByModule(scopedTasks, 'fleet'),
    }),
    [scopedTasks],
  );

  const kpiSeries = useMemo(() => {
    if (kpiRail.series.length) return kpiRail.series;
    return allowMockFallback() ? getKpiSeriesForPersona(persona) : [];
  }, [kpiRail.series, persona]);

  function renderSettingsSidebar() {
    const companyGroupActive = isCompanySetupMenuKey(activeSettingsMenu);

    return (
      <aside
        className={`flex min-h-0 w-full shrink-0 flex-col bg-xevn-surface/95 px-4 py-4 shadow-soft lg:h-full ${NAV_SUBSIDEBAR_WIDTH_CLASS} ${SETTINGS_RADIUS_CARD}`}
      >
        <div className="mb-4">
          <h2 className={NAV_SUBSIDEBAR_TITLE_CLASS}>Cài đặt hệ thống</h2>
          <p className={NAV_SUBSIDEBAR_HELPER_CLASS}>Chọn nhóm cấu hình</p>
        </div>
        <nav className="min-h-0 flex-1 space-y-2 overflow-y-auto">
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => setCompanySetupGroupOpen((o) => !o)}
              className={`flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-3 text-left transition active:scale-95 ${
                companyGroupActive ? 'bg-xevn-primary/10' : 'hover:bg-slate-100'
              }`}
              aria-expanded={companySetupGroupOpen}
            >
              <span className={`flex min-w-0 items-center ${NAV_SUBSIDEBAR_ITEM_ROW_GAP}`}>
                <Building2
                  className={`h-5 w-5 shrink-0 ${companyGroupActive ? 'text-xevn-primary' : 'text-slate-500'}`}
                  strokeWidth={RAIL_STROKE}
                />
                <span
                  className={
                    companyGroupActive
                      ? NAV_SUBSIDEBAR_ITEM_ACTIVE_CLASS
                      : NAV_SUBSIDEBAR_ITEM_IDLE_CLASS
                  }
                >
                  Thiết lập công ty
                </span>
              </span>
              {companySetupGroupOpen ? (
                <ChevronDown className="h-4 w-4 shrink-0 text-slate-500" strokeWidth={RAIL_STROKE} />
              ) : (
                <ChevronRight className="h-4 w-4 shrink-0 text-slate-500" strokeWidth={RAIL_STROKE} />
              )}
            </button>
            {companySetupGroupOpen ? (
              <div className="space-y-2 border-l border-xevn-border/80 pl-3 ml-2">
                {companySetupSubMenus.map(({ key, label, Icon }) => {
                  const active = activeSettingsMenu === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => {
                        if (activeSettingsMenu === 'company_dept_system' && key !== 'company_dept_system') {
                          closeDeptSystemDetail();
                        }
                        setActiveSettingsMenu(key);
                      }}
                      className={`flex w-full items-center ${NAV_SUBSIDEBAR_ITEM_ROW_GAP} rounded-lg px-2 py-2.5 text-left transition active:scale-95 ${
                        active ? 'bg-xevn-primary/10' : 'hover:bg-slate-100'
                      }`}
                    >
                      <Icon
                        className={`h-5 w-5 shrink-0 ${active ? 'text-xevn-primary' : 'text-slate-500'}`}
                        strokeWidth={RAIL_STROKE}
                      />
                      <span
                        className={
                          active ? NAV_SUBSIDEBAR_ITEM_ACTIVE_CLASS : NAV_SUBSIDEBAR_ITEM_IDLE_CLASS
                        }
                      >
                        {label}
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : null}
          </div>

          {settingsMenusAfterCompany.map(({ key, label, Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => {
                if (activeSettingsMenu === 'company_dept_system' && key !== 'company_dept_system') {
                  closeDeptSystemDetail();
                }
                setActiveSettingsMenu(key);
              }}
              className={`flex w-full items-center ${NAV_SUBSIDEBAR_ITEM_ROW_GAP} rounded-lg px-2.5 py-3 text-left transition active:scale-95 ${
                activeSettingsMenu === key ? 'bg-xevn-primary/10' : 'hover:bg-slate-100'
              }`}
            >
              <Icon
                className={`h-5 w-5 shrink-0 ${
                  activeSettingsMenu === key ? 'text-xevn-primary' : 'text-slate-500'
                }`}
                strokeWidth={RAIL_STROKE}
              />
              <span
                className={
                  activeSettingsMenu === key
                    ? NAV_SUBSIDEBAR_ITEM_ACTIVE_CLASS
                    : NAV_SUBSIDEBAR_ITEM_IDLE_CLASS
                }
              >
                {label}
              </span>
            </button>
          ))}
        </nav>
      </aside>
    );
  }


  function renderSettingsWorkspacePanel() {
    const inputClass = `min-w-0 max-w-full border border-xevn-border bg-white px-3 py-2 text-left outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-xevn-accent ${SETTINGS_CONTROL_TEXT} ${SETTINGS_RADIUS_INPUT}`;
    const selectClass = `${inputClass} appearance-none cursor-pointer bg-white pr-10`;
    const dateClass = `${inputClass} cursor-pointer pr-10 [color-scheme:light] [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:w-10 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0`;
    const deptInputClass = `min-w-0 w-full max-w-full border border-xevn-border bg-white px-3 py-2 text-left text-base text-xevn-text outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-xevn-accent ${SETTINGS_RADIUS_INPUT}`;
    const deptSelectClass = `${deptInputClass} appearance-none cursor-pointer bg-white pr-10`;
    const orgGradeBandSurface: Record<OrgGradeBand, string> = {
      yellow: 'bg-amber-50/90 border-amber-200',
      orange: 'bg-orange-50/90 border-orange-200',
      green: 'bg-emerald-50/90 border-emerald-200',
      grey: 'bg-slate-200/70 border-slate-300',
      white: 'bg-white border-xevn-border',
    };
    /** Bảng cấu hình bước quy trình: cột Hành động + Luồng đi tiếp đủ rộng, tránh cắt chữ; <lg xếp dọc */
    const WORKFLOW_STEPS_TABLE_GRID =
      'grid grid-cols-1 gap-6 lg:grid-cols-[minmax(2.75rem,3rem)_minmax(12rem,1.35fr)_minmax(11rem,1.05fr)_minmax(9.5rem,0.75fr)_minmax(3.75rem,4.25rem)_minmax(18rem,1.55fr)_minmax(11rem,0.95fr)] lg:items-start lg:gap-x-4 lg:gap-y-3';

    const settingsPageTitleText = settingsWorkspaceTitle(activeSettingsMenu, {
      companySettingsView,
      companyEntityId,
      entityShortName: companyForm.shortName,
      workflowView,
      workflowDetailTitle: workflowForm?.name ?? '',
      deptSystemDetailOpen: deptSystemDetailId !== null,
      deptSystemDetailName: deptSystemForm?.nameVi ?? '',
    });
    const showCompanyFormStickyNav =
      activeSettingsMenu === 'company_member_units' && companySettingsView === 'form';
    const showFoundationDetailStickyNav =
      activeSettingsMenu === 'company_infrastructure' &&
      infrastructureView === 'list' &&
      foundationCategoryDetailId !== null;
    const showDeptSystemDetailStickyNav =
      activeSettingsMenu === 'company_dept_system' && deptSystemDetailId !== null;
    const showInfrastructureDetailStickyNav =
      activeSettingsMenu === 'company_infrastructure' && infrastructureView === 'detail';
    const showWorkflowDetailStickyNav =
      activeSettingsMenu === 'workflow' && workflowView === 'detail';
    const showStickyPageTitle = settingsPageTitleText.trim().length > 0;
    const scopedDeptEntityKey =
      activeSettingsMenu === 'tenant_departments' ? settingsScopeEntityId : companyEntityId;
    const scopedDeptRows =
      scopedDeptEntityKey !== null ? departmentRowsByEntity[scopedDeptEntityKey] ?? [] : [];
    const legalEntityMetadataRows =
      companyEntityId !== null ? employeeMetadataByEntity[companyEntityId] ?? [] : [];
    const permissionMatrixCurrent =
      permissionMatrixByRole[activePermissionRoleId] ?? buildPermissionMatrix({});

    return (
      <>
      <div
        className={`flex min-h-0 flex-1 flex-col overflow-hidden border border-xevn-border bg-white/50 shadow-soft backdrop-blur-sm ${SETTINGS_RADIUS_CARD}`}
      >
        <div className={WORKSPACE_STICKY_HEADER_ROW}>
          <div className="flex w-full min-h-10 items-center gap-3">
            <div className="flex shrink-0 items-center gap-2">
              {showCompanyFormStickyNav ? (
                <button
                  type="button"
                  onClick={() => {
                    setCompanySettingsView('list');
                    setCompanyEntityId(null);
                  }}
                  className="inline-flex h-10 shrink-0 items-center gap-2 rounded-lg px-1 py-1.5 text-[15px] font-normal text-xevn-primary transition hover:bg-xevn-primary/5 hover:underline active:scale-95"
                  aria-label="Quay lại danh sách pháp nhân"
                >
                  <ArrowLeft className="h-5 w-5 shrink-0" strokeWidth={RAIL_STROKE} />
                  <span className="hidden sm:inline">Danh sách pháp nhân</span>
                </button>
              ) : null}
              {showFoundationDetailStickyNav ? (
                <button
                  type="button"
                  onClick={() => closeFoundationCategoryDetail()}
                  className="inline-flex h-10 shrink-0 items-center gap-2 rounded-lg px-1 py-1.5 text-[15px] font-normal text-xevn-primary transition hover:bg-xevn-primary/5 hover:underline active:scale-95"
                  aria-label="Quay lại danh sách danh mục nền"
                >
                  <ArrowLeft className="h-5 w-5 shrink-0" strokeWidth={RAIL_STROKE} />
                  <span className="hidden sm:inline">Danh mục nền</span>
                </button>
              ) : null}
              {showDeptSystemDetailStickyNav ? (
                <button
                  type="button"
                  onClick={() => closeDeptSystemDetail()}
                  className="inline-flex h-10 shrink-0 items-center gap-2 rounded-lg px-1 py-1.5 text-[15px] font-normal text-xevn-primary transition hover:bg-xevn-primary/5 hover:underline active:scale-95"
                  aria-label="Quay lại danh mục khung phòng ban"
                >
                  <ArrowLeft className="h-5 w-5 shrink-0" strokeWidth={RAIL_STROKE} />
                  <span className="hidden sm:inline">Danh mục khung</span>
                </button>
              ) : null}
              {showInfrastructureDetailStickyNav ? (
                <button
                  type="button"
                  onClick={() => openInfrastructureMaster()}
                  className="inline-flex h-10 shrink-0 items-center gap-2 rounded-lg px-1 py-1.5 text-[15px] font-normal text-xevn-primary transition hover:bg-xevn-primary/5 hover:underline active:scale-95"
                  aria-label="Quay lại danh sách hạ tầng"
                >
                  <ArrowLeft className="h-5 w-5 shrink-0" strokeWidth={RAIL_STROKE} />
                  <span className="hidden sm:inline">Danh sách hạ tầng</span>
                </button>
              ) : null}
              {showWorkflowDetailStickyNav ? (
                <button
                  type="button"
                  onClick={() => openWorkflowList()}
                  className="inline-flex h-10 shrink-0 items-center gap-2 rounded-lg px-1 py-1.5 text-[15px] font-normal text-xevn-primary transition hover:bg-xevn-primary/5 hover:underline active:scale-95"
                  aria-label="Quay lại danh sách quy trình"
                >
                  <ArrowLeft className="h-5 w-5 shrink-0" strokeWidth={RAIL_STROKE} />
                  <span className="hidden sm:inline">Danh sách quy trình</span>
                </button>
              ) : null}
            </div>
            {showStickyPageTitle ? (
              <h2
                className={`m-0 flex min-h-0 min-w-0 flex-1 items-center truncate ${WORKSPACE_STICKY_HEADER_AXIS_H} ${SETTINGS_PAGE_TITLE_CLASS}`}
                title={settingsPageTitleText}
              >
                <span className="min-w-0 truncate">{settingsPageTitleText}</span>
              </h2>
            ) : (
              <>
                {showCompanyFormStickyNav && companyEntityId === 'new' ? (
                  <h2 className="sr-only">Thêm pháp nhân mới</h2>
                ) : null}
                <div className="min-w-0 flex-1" aria-hidden />
              </>
            )}
            <div className="flex shrink-0 items-center gap-2">
              {activeSettingsMenu === 'permission' ? (
                <button
                  type="button"
                  onClick={() => addPermissionRole()}
                  className={`${WORKSPACE_STICKY_HEADER_AXIS_H} inline-flex shrink-0 items-center gap-1.5 rounded-input border border-xevn-border bg-white px-3 text-[15px] font-semibold text-xevn-primary shadow-sm transition hover:bg-xevn-primary/5 active:scale-[0.98]`}
                >
                  <Plus className="h-4 w-4 shrink-0" strokeWidth={RAIL_STROKE} />
                  <span className="hidden whitespace-nowrap sm:inline">Thêm vai trò mới</span>
                  <span className="sm:hidden">Vai trò</span>
                </button>
              ) : null}
              <div className={WORKSPACE_STICKY_SEARCH_SHELL_CLASS}>
                <Search className="h-4 w-4 shrink-0 text-xevn-textSecondary" strokeWidth={RAIL_STROKE} />
                <input
                  ref={searchRef}
                  className={`min-w-0 flex-1 bg-transparent outline-none placeholder:text-slate-400 ${SETTINGS_CONTROL_TEXT}`}
                  placeholder="Tìm nhanh trong bảng cấu hình..."
                />
              </div>
            </div>
          </div>
        </div>

        <div className="xevn-safe-inline flex-1 min-h-[min(520px,72vh)] overflow-y-auto overflow-x-hidden pb-24 pt-4">
          <ApiHealthBanner />
          {menuNotice ? (
            <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
              {menuNotice}
            </p>
          ) : null}
          {publishMessage ? (
            <p className="mb-4 rounded-lg bg-slate-100 px-3 py-2 text-xs text-xevn-textSecondary">{publishMessage}</p>
          ) : null}

          {activeSettingsMenu === 'company_member_units' ? (
            companySettingsView === 'list' ? (
              <div className={SETTINGS_SECTION_STACK}>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <SettingSectionHeader
                    title="Quản trị tập đoàn đa pháp nhân"
                    subtitle="Danh sách pháp nhân — chọn chỉnh sửa để mở hồ sơ chi tiết"
                  />
                  <div className="flex flex-wrap gap-2 sm:self-start">
                    <button
                      type="button"
                      onClick={() => void reloadMemberAndLegalEntities()}
                      className="inline-flex shrink-0 items-center gap-2 rounded-input border border-xevn-border bg-white px-4 py-2.5 text-[15px] font-medium text-xevn-text shadow-soft transition hover:bg-slate-50"
                    >
                      <RefreshCw className="h-5 w-5" strokeWidth={RAIL_STROKE} />
                      Tải lại
                    </button>
                    <button
                      type="button"
                      onClick={openNewCompanyEntity}
                      className="inline-flex shrink-0 items-center gap-2 rounded-input bg-xevn-primary px-4 py-2.5 text-[15px] font-semibold text-white shadow-soft transition hover:opacity-90 active:scale-95"
                    >
                      <Plus className="h-5 w-5" strokeWidth={RAIL_STROKE} />
                      Thêm mới đơn vị
                    </button>
                  </div>
                </div>
                <ApiLoadBanner
                  loadFailed={Boolean(groupMemberUnitsNotice)}
                  message={groupMemberUnitsNotice ?? undefined}
                />
                <div className={`overflow-x-auto border border-xevn-border ${SETTINGS_RADIUS_CARD}`}>
                  <table className={`min-w-[880px] w-full ${SETTINGS_CONTROL_TEXT}`}>
                    <thead className="bg-white/70 backdrop-blur-md">
                      <tr>
                        <th className="px-3 py-2 text-left text-sm font-medium text-slate-500">Mã</th>
                        <th className="px-3 py-2 text-left text-sm font-medium text-slate-500">Tên pháp nhân</th>
                        <th className="px-3 py-2 text-left text-sm font-medium text-slate-500">Cấp bậc</th>
                        <th className="px-3 py-2 text-left text-sm font-medium text-slate-500">Trực thuộc</th>
                        <th className="px-3 py-2 text-left text-sm font-medium text-slate-500">Trạng thái</th>
                        <th className="px-3 py-2 text-right text-sm font-medium text-slate-500">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {settingsLegalEntities.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-3 py-8 text-center text-slate-500">
                            {groupMemberUnitsLoading
                              ? 'Đang tải đơn vị thành viên…'
                              : 'Chưa có dữ liệu — kiểm tra XBOS API (cổng 28002) và seed org.'}
                          </td>
                        </tr>
                      ) : (
                        settingsLegalEntities.map((row) => (
                          <tr key={row.id} className="border-t border-xevn-border">
                            <td className="px-3 py-2 font-medium tabular-nums text-xevn-text">{row.code}</td>
                            <td className="px-3 py-2">{row.name}</td>
                            <td className="px-3 py-2">
                              {row.entityLevel ? ENTITY_LEVEL_LABELS[row.entityLevel] : '—'}
                            </td>
                            <td className="px-3 py-2 text-slate-600">
                              {getParentEntityLabel(row.parentEntityId, settingsLegalEntities) || '—'}
                            </td>
                            <td className="px-3 py-2">
                              <span
                                className={
                                  row.status === 'active' ? 'font-medium text-emerald-700' : 'text-slate-500'
                                }
                              >
                                {row.status === 'active' ? 'Hoạt động' : 'Ngừng'}
                              </span>
                            </td>
                            <td className="px-3 py-2 text-right">
                              <button
                                type="button"
                                onClick={() => openEditCompanyEntity(row.id)}
                                className="text-[15px] font-semibold text-xevn-primary hover:underline"
                              >
                                Chỉnh sửa
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
            <div className={SETTINGS_SECTION_STACK}>
              <div className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:justify-end">
                <button
                  type="button"
                  onClick={openNewCompanyEntity}
                  className="inline-flex shrink-0 items-center justify-center gap-2 self-end rounded-input border border-xevn-border bg-white px-3 py-2 text-[15px] font-medium text-xevn-text shadow-soft transition hover:bg-slate-50 active:scale-95 sm:self-auto"
                >
                  <Plus className="h-5 w-5" strokeWidth={RAIL_STROKE} />
                  Thêm mới đơn vị
                </button>
              </div>
              <SettingSectionHeader
                title={companyEntityId === 'new' ? 'Thêm pháp nhân mới' : 'Hồ sơ pháp nhân'}
                subtitle="Thông tin theo Giấy chứng nhận ĐKKD Việt Nam"
              />
              <div
                className="flex flex-wrap gap-1 border-b border-xevn-border pb-1"
                role="tablist"
                aria-label="Chi tiết pháp nhân"
              >
                {(
                  [
                    { id: 'legal' as const, label: 'Hồ sơ pháp nhân' },
                    { id: 'raci' as const, label: 'Nhiệm vụ & RACI' },
                  ] as const
                ).map(({ id, label }) => (
                  <button
                    key={id}
                    type="button"
                    role="tab"
                    aria-selected={companyDetailTab === id}
                    onClick={() => setCompanyDetailTab(id)}
                    className={`rounded-lg px-3 py-2 text-[15px] transition active:scale-95 ${
                      companyDetailTab === id
                        ? 'border-b-2 border-xevn-primary font-bold text-xevn-primary'
                        : 'font-normal text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {companyDetailTab === 'legal' ? (
              <>
              <div className={`border border-xevn-border p-4 shadow-soft ${SETTINGS_RADIUS_CARD}`}>
                <h4 className={`mb-3 ${SETTINGS_SECTION_TITLE_CLASS}`}>Khối Cấu trúc &amp; Phân cấp</h4>
                <div className={SETTINGS_SECTION_GRID}>
                  <label className={`${SETTINGS_FIELD_SHELL} w-full ${SETTINGS_COL.span6} ${SETTINGS_FIELD_COMPACT}`}>
                    <span className={SETTINGS_LABEL_CLASS}>Cấp bậc thực thể</span>
                    <div className="relative min-w-0 w-full">
                      <select
                        value={companyForm.entityLevel}
                        onChange={(e) => {
                          const v = e.target.value as EntityLevelCode;
                          setCompanyForm((s) => ({
                            ...s,
                            entityLevel: v,
                            parentEntityId: v === 'parent' ? '' : s.parentEntityId,
                          }));
                          if (v === 'parent') setParentUnitQuery('');
                        }}
                        className={selectClass}
                      >
                        {ENTITY_LEVEL_SELECT_ORDER.map((k) => (
                          <option key={k} value={k}>
                            {ENTITY_LEVEL_LABELS[k]}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
                        strokeWidth={RAIL_STROKE}
                        aria-hidden
                      />
                    </div>
                  </label>
                  <label className={`${SETTINGS_FIELD_SHELL} w-full ${SETTINGS_COL.span6}`}>
                    <span className={SETTINGS_LABEL_CLASS}>Đơn vị trực thuộc</span>
                    <div className="relative min-w-0 w-full max-w-full">
                      <input
                        type="text"
                        disabled={companyForm.entityLevel === 'parent'}
                        value={parentUnitQuery}
                        onChange={(e) => {
                          setParentUnitQuery(e.target.value);
                          setParentUnitMenuOpen(true);
                          setCompanyForm((s) => ({ ...s, parentEntityId: '' }));
                        }}
                        onFocus={() => setParentUnitMenuOpen(true)}
                        onBlur={() => {
                          window.setTimeout(() => setParentUnitMenuOpen(false), 180);
                        }}
                        placeholder="Tìm theo mã hoặc tên đơn vị..."
                        className={`w-full min-w-0 ${inputClass} ${companyForm.entityLevel === 'parent' ? 'cursor-not-allowed bg-slate-50 opacity-70' : ''}`}
                        aria-label="Đơn vị trực thuộc"
                      />
                      {parentUnitMenuOpen &&
                      companyForm.entityLevel !== 'parent' &&
                      parentUnitCandidates.length > 0 ? (
                        <ul
                          className="absolute z-30 mt-1 max-h-48 w-full overflow-auto rounded-input border border-xevn-border bg-white py-1 shadow-overlay"
                          role="listbox"
                        >
                          {parentUnitCandidates.map((c) => (
                            <li key={c.id}>
                              <button
                                type="button"
                                role="option"
                                className="w-full px-3 py-2 text-left text-base text-xevn-text hover:bg-slate-50"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => {
                                  setCompanyForm((s) => ({ ...s, parentEntityId: c.id }));
                                  setParentUnitQuery(`${c.code} — ${c.name}`);
                                  setParentUnitMenuOpen(false);
                                }}
                              >
                                <span className="font-medium tabular-nums">{c.code}</span>
                                <span className="text-slate-600"> — {c.name}</span>
                              </button>
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </div>
                  </label>
                </div>
              </div>

              <div className={`border border-xevn-border p-4 shadow-soft ${SETTINGS_RADIUS_CARD}`}>
                <h4 className={`mb-3 ${SETTINGS_SECTION_TITLE_CLASS}`}>Khối Định danh &amp; Trụ sở</h4>
                <div className={SETTINGS_SECTION_GRID}>
                  {/* Hàng 1: 4 + 4 + 4 — trục neo */}
                  <label className={`${SETTINGS_FIELD_SHELL} w-full ${SETTINGS_COL.span4}`}>
                    <span className={SETTINGS_LABEL_CLASS}>Tên tiếng Việt</span>
                    <AutoResizeTextarea
                      aria-label="Tên tiếng Việt"
                      placeholder="CÔNG TY CỔ PHẦN..."
                      value={companyForm.nameVi}
                      onChange={(v) => {
                        setCompanyForm((s) => ({ ...s, nameVi: v }));
                        if (companyErrors.nameVi) {
                          setCompanyErrors((e) => ({ ...e, nameVi: undefined }));
                        }
                      }}
                      className={companyErrors.nameVi ? 'border-rose-400' : undefined}
                    />
                    {companyErrors.nameVi ? (
                      <span className="text-xs text-rose-600">{companyErrors.nameVi}</span>
                    ) : null}
                  </label>
                  <label className={`${SETTINGS_FIELD_SHELL} w-full ${SETTINGS_COL.span4}`}>
                    <span className={SETTINGS_LABEL_CLASS}>Tên tiếng nước ngoài</span>
                    <AutoResizeTextarea
                      aria-label="Tên tiếng nước ngoài"
                      placeholder="XEVIETNAM HOLDINGS JOINT STOCK COMPANY"
                      value={companyForm.nameEn}
                      onChange={(v) => setCompanyForm((s) => ({ ...s, nameEn: v }))}
                    />
                  </label>
                  <label className={`${SETTINGS_FIELD_SHELL} w-full ${SETTINGS_COL.span4}`}>
                    <span className={SETTINGS_LABEL_CLASS}>Tên viết tắt</span>
                    <AutoResizeTextarea
                      aria-label="Tên viết tắt"
                      placeholder="VD: XEVN"
                      value={companyForm.shortName}
                      onChange={(v) => setCompanyForm((s) => ({ ...s, shortName: v }))}
                    />
                  </label>
                  {/* Hàng 2: 4 + 4 + 4 */}
                  <label className={`${SETTINGS_FIELD_SHELL} ${SETTINGS_COL.span4} ${SETTINGS_FIELD_COMPACT}`}>
                    <span className={SETTINGS_LABEL_CLASS}>Mã số doanh nghiệp</span>
                    <AutoResizeTextarea
                      aria-label="Mã số doanh nghiệp"
                      placeholder="0312345678"
                      className={`tabular-nums ${companyErrors.enterpriseCode ? 'border-rose-400' : ''}`}
                      value={companyForm.enterpriseCode}
                      onChange={(v) =>
                        setCompanyForm((s) => ({ ...s, enterpriseCode: v.replace(/\D/g, '') }))
                      }
                    />
                    {companyErrors.enterpriseCode ? (
                      <span className="text-xs text-rose-600">{companyErrors.enterpriseCode}</span>
                    ) : null}
                  </label>
                  <label className={`${SETTINGS_FIELD_SHELL} ${SETTINGS_COL.span4} ${SETTINGS_FIELD_COMPACT}`}>
                    <span className={SETTINGS_LABEL_CLASS}>Vốn điều lệ (VNĐ)</span>
                    <AutoResizeTextarea
                      aria-label="Vốn điều lệ"
                      placeholder="500000000000"
                      className={`tabular-nums ${companyErrors.charterCapital ? 'border-rose-400' : ''}`}
                      value={companyForm.charterCapital === 0 ? '' : String(companyForm.charterCapital)}
                      onChange={(v) => {
                        const d = v.replace(/\D/g, '');
                        setCompanyForm((s) => ({
                          ...s,
                          charterCapital: d === '' ? 0 : Number(d),
                        }));
                      }}
                    />
                    {companyErrors.charterCapital ? (
                      <span className="text-xs text-rose-600">{companyErrors.charterCapital}</span>
                    ) : null}
                  </label>
                  <label className={`${SETTINGS_FIELD_SHELL} w-full ${SETTINGS_COL.span4}`}>
                    <span className={SETTINGS_LABEL_CLASS}>Nơi cấp</span>
                    <AutoResizeTextarea
                      aria-label="Nơi cấp"
                      placeholder="Sở Kế hoạch và Đầu tư TP.HCM"
                      value={companyForm.issuePlace}
                      onChange={(v) => setCompanyForm((s) => ({ ...s, issuePlace: v }))}
                    />
                  </label>
                  {/* Hàng 3: Select + Date + MST (4+4+4) — thao tác chuột + mã chuẩn */}
                  <label className={`${SETTINGS_FIELD_SHELL} ${SETTINGS_COL.span4} ${SETTINGS_FIELD_COMPACT}`}>
                    <span className={SETTINGS_LABEL_CLASS}>Loại hình doanh nghiệp</span>
                    <div className="relative min-w-0">
                      <select
                        value={companyForm.enterpriseType}
                        onChange={(e) => setCompanyForm((s) => ({ ...s, enterpriseType: e.target.value }))}
                        className={selectClass}
                      >
                        <option value="joint-stock">Công ty cổ phần</option>
                        <option value="llc-2-members">Công ty TNHH 2 thành viên trở lên</option>
                        <option value="llc-1-member">Công ty TNHH 1 thành viên</option>
                        <option value="state-owned">Doanh nghiệp nhà nước</option>
                      </select>
                      <ChevronDown
                        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
                        strokeWidth={RAIL_STROKE}
                        aria-hidden
                      />
                    </div>
                  </label>
                  <label className={`${SETTINGS_FIELD_SHELL} ${SETTINGS_COL.span4} ${SETTINGS_FIELD_COMPACT}`}>
                    <span className={SETTINGS_LABEL_CLASS}>Ngày cấp lần đầu</span>
                    <div className="relative min-w-0">
                      <input
                        type="date"
                        value={companyForm.firstIssueDate}
                        onChange={(e) => setCompanyForm((s) => ({ ...s, firstIssueDate: e.target.value }))}
                        className={dateClass}
                      />
                      <Calendar
                        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                        strokeWidth={RAIL_STROKE}
                        aria-hidden
                      />
                    </div>
                  </label>
                  <label className={`${SETTINGS_FIELD_SHELL} ${SETTINGS_COL.span4} ${SETTINGS_FIELD_COMPACT}`}>
                    <span className={SETTINGS_LABEL_CLASS}>Mã số thuế (MST)</span>
                    <AutoResizeTextarea
                      aria-label="Mã số thuế"
                      placeholder="0312345678"
                      className={`tabular-nums ${companyErrors.taxCode ? 'border-rose-400' : ''}`}
                      value={companyForm.taxCode}
                      onChange={(v) => {
                        setCompanyForm((s) => ({ ...s, taxCode: v.replace(/\D/g, '') }));
                        if (companyErrors.taxCode) {
                          setCompanyErrors((e) => ({ ...e, taxCode: undefined }));
                        }
                      }}
                    />
                    {companyErrors.taxCode ? (
                      <span className="text-xs text-rose-600">{companyErrors.taxCode}</span>
                    ) : null}
                  </label>
                  {/* Hàng 4: 8 + 4 — địa chỉ dài + quốc gia */}
                  <label className={`${SETTINGS_FIELD_SHELL} w-full ${SETTINGS_COL.span8}`}>
                    <span className={SETTINGS_LABEL_CLASS}>Địa chỉ trụ sở</span>
                    <AutoResizeTextarea
                      aria-label="Địa chỉ trụ sở"
                      placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/TP..."
                      value={companyForm.headOfficeAddress}
                      onChange={(v) => setCompanyForm((s) => ({ ...s, headOfficeAddress: v }))}
                    />
                  </label>
                  <label className={`${SETTINGS_FIELD_SHELL} w-full ${SETTINGS_COL.span4}`}>
                    <span className={SETTINGS_LABEL_CLASS}>Quốc gia / Khu vực</span>
                    <AutoResizeTextarea
                      aria-label="Quốc gia"
                      placeholder="Việt Nam"
                      value={companyForm.headOfficeCountry}
                      onChange={(v) => setCompanyForm((s) => ({ ...s, headOfficeCountry: v }))}
                    />
                  </label>
                </div>
              </div>

              <div className={`border border-xevn-border p-4 shadow-soft ${SETTINGS_RADIUS_CARD}`}>
                <h4 className={`mb-3 ${SETTINGS_SECTION_TITLE_CLASS}`}>Khối Người đại diện</h4>
                <div className={SETTINGS_SECTION_GRID}>
                  {/* Hàng 1: 4+4+4 — text + text + select */}
                  <label className={`${SETTINGS_FIELD_SHELL} w-full ${SETTINGS_COL.span4}`}>
                    <span className={SETTINGS_LABEL_CLASS}>Họ tên người đại diện</span>
                    <AutoResizeTextarea
                      aria-label="Họ tên người đại diện"
                      placeholder="Nguyễn Văn A"
                      value={companyForm.legalRepName}
                      onChange={(v) => setCompanyForm((s) => ({ ...s, legalRepName: v }))}
                    />
                  </label>
                  <label className={`${SETTINGS_FIELD_SHELL} ${SETTINGS_COL.span4} ${SETTINGS_FIELD_COMPACT}`}>
                    <span className={SETTINGS_LABEL_CLASS}>Số định danh (CCCD)</span>
                    <AutoResizeTextarea
                      aria-label="Số CCCD"
                      placeholder="079188001234"
                      className="tabular-nums"
                      value={companyForm.legalRepIdNo}
                      onChange={(v) =>
                        setCompanyForm((s) => ({ ...s, legalRepIdNo: v.replace(/\D/g, '') }))
                      }
                    />
                  </label>
                  <label className={`${SETTINGS_FIELD_SHELL} ${SETTINGS_COL.span4} ${SETTINGS_FIELD_COMPACT}`}>
                    <span className={SETTINGS_LABEL_CLASS}>Chức danh</span>
                    <div className="relative min-w-0">
                      <select
                        value={companyForm.legalRepTitle}
                        onChange={(e) => setCompanyForm((s) => ({ ...s, legalRepTitle: e.target.value }))}
                        className={selectClass}
                      >
                        <option value="Chủ tịch Hội đồng quản trị">Chủ tịch Hội đồng quản trị</option>
                        <option value="Tổng Giám đốc">Tổng Giám đốc</option>
                        <option value="Giám đốc">Giám đốc</option>
                        <option value="Phó Tổng Giám đốc">Phó Tổng Giám đốc</option>
                        <option value="Người đại diện theo pháp luật">Người đại diện theo pháp luật</option>
                      </select>
                      <ChevronDown
                        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
                        strokeWidth={RAIL_STROKE}
                        aria-hidden
                      />
                    </div>
                  </label>
                  {/* Hàng 2: 8 + 4 — địa chỉ dài + SĐT */}
                  <label className={`${SETTINGS_FIELD_SHELL} w-full ${SETTINGS_COL.span8}`}>
                    <span className={SETTINGS_LABEL_CLASS}>Địa chỉ thường trú</span>
                    <AutoResizeTextarea
                      aria-label="Địa chỉ thường trú"
                      placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/TP..."
                      value={companyForm.legalRepAddress}
                      onChange={(v) => setCompanyForm((s) => ({ ...s, legalRepAddress: v }))}
                    />
                  </label>
                  <label className={`${SETTINGS_FIELD_SHELL} ${SETTINGS_COL.span4} ${SETTINGS_FIELD_COMPACT}`}>
                    <span className={SETTINGS_LABEL_CLASS}>Số điện thoại liên hệ</span>
                    <AutoResizeTextarea
                      aria-label="Số điện thoại người đại diện"
                      placeholder="0901234567"
                      className="tabular-nums"
                      value={companyForm.legalRepPhone}
                      onChange={(v) =>
                        setCompanyForm((s) => ({ ...s, legalRepPhone: v.replace(/\D/g, '') }))
                      }
                    />
                  </label>
                </div>
              </div>

              <div className={`border border-xevn-border p-4 shadow-soft ${SETTINGS_RADIUS_CARD}`}>
                <h4 className={`mb-3 ${SETTINGS_SECTION_TITLE_CLASS}`}>Khối Liên hệ</h4>
                <div className={SETTINGS_SECTION_GRID}>
                  <label className={`${SETTINGS_FIELD_SHELL} ${SETTINGS_COL.span4} ${SETTINGS_FIELD_COMPACT}`}>
                    <span className={SETTINGS_LABEL_CLASS}>Hotline</span>
                    <AutoResizeTextarea
                      aria-label="Hotline"
                      placeholder="1900 6868"
                      value={companyForm.hotline}
                      onChange={(v) => setCompanyForm((s) => ({ ...s, hotline: v }))}
                    />
                  </label>
                  <label className={`${SETTINGS_FIELD_SHELL} ${SETTINGS_COL.span4} ${SETTINGS_FIELD_COMPACT}`}>
                    <span className={SETTINGS_LABEL_CLASS}>Email công ty</span>
                    <AutoResizeTextarea
                      aria-label="Email công ty"
                      placeholder="contact@congty.vn"
                      value={companyForm.companyEmail}
                      onChange={(v) => setCompanyForm((s) => ({ ...s, companyEmail: v }))}
                    />
                  </label>
                  <label className={`${SETTINGS_FIELD_SHELL} ${SETTINGS_COL.span4} ${SETTINGS_FIELD_COMPACT}`}>
                    <span className={SETTINGS_LABEL_CLASS}>Website</span>
                    <AutoResizeTextarea
                      aria-label="Website"
                      placeholder="https://congty.vn"
                      value={companyForm.website}
                      onChange={(v) => setCompanyForm((s) => ({ ...s, website: v }))}
                    />
                  </label>
                </div>
              </div>

              <div className={`space-y-6 border border-xevn-border p-4 shadow-soft ${SETTINGS_RADIUS_CARD}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UserCheck className="h-5 w-5 text-xevn-primary" strokeWidth={RAIL_STROKE} />
                    <h4 className={SETTINGS_SECTION_TITLE_CLASS}>Danh sách Cổ đông</h4>
                  </div>
                  <button
                    type="button"
                    onClick={addShareholderRow}
                    className="rounded-lg border border-xevn-border px-3 py-2 text-sm font-medium transition hover:bg-slate-100 active:scale-95"
                  >
                    + Thêm cổ đông
                  </button>
                </div>
                <div className={`-mx-1 overflow-x-auto border border-xevn-border ${SETTINGS_RADIUS_CARD}`}>
                  <table className={`min-w-[760px] w-full ${SETTINGS_CONTROL_TEXT}`}>
                    <thead className="bg-white/70 backdrop-blur-md">
                      <tr>
                        <th className="px-3 py-2 text-left text-sm font-medium text-slate-500">
                          Họ tên/Tên tổ chức
                        </th>
                        <th className="px-3 py-2 text-left text-sm font-medium text-slate-500">Mã định danh</th>
                        <th className="px-3 py-2 text-left text-sm font-medium text-slate-500">Tỷ lệ (%)</th>
                        <th className="px-3 py-2 text-left text-sm font-medium text-slate-500">Giá trị góp vốn</th>
                        <th className="px-3 py-2 text-center text-sm font-medium text-slate-500">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {shareholderRows.map((row) => (
                        <tr key={row.id} className="border-t border-xevn-border">
                          <td className="px-3 py-2">
                            <input
                              value={row.holderName}
                              onChange={(e) => updateShareholderRow(row.id, 'holderName', e.target.value)}
                              className="w-full rounded-input border border-xevn-border bg-white px-2 py-1"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              value={row.identityCode}
                              onChange={(e) => updateShareholderRow(row.id, 'identityCode', e.target.value)}
                              className="w-full rounded-input border border-xevn-border bg-white px-2 py-1"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="number"
                              value={row.ratioPercent}
                              onChange={(e) =>
                                updateShareholderRow(row.id, 'ratioPercent', Number(e.target.value))
                              }
                              className="w-full rounded-input border border-xevn-border bg-white px-2 py-1"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              value={row.contributedValue.toLocaleString('vi-VN')}
                              readOnly
                              className="w-full rounded-input border border-xevn-border bg-slate-50 px-2 py-1"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  void submitShareholderRow(row.id);
                                }}
                                className="rounded-lg border border-emerald-300 bg-emerald-50 p-2 text-emerald-700 transition active:scale-95"
                                title="Submit"
                              >
                                <Check className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => deleteShareholderRow(row.id)}
                                className="rounded-lg border border-rose-300 bg-rose-50 p-2 text-rose-700 transition active:scale-95"
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className={`space-y-6 border border-xevn-border p-4 shadow-soft ${SETTINGS_RADIUS_CARD}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileArchive className="h-5 w-5 text-xevn-primary" strokeWidth={RAIL_STROKE} />
                    <h4 className={SETTINGS_SECTION_TITLE_CLASS}>Tài liệu đính kèm</h4>
                  </div>
                  <button
                    type="button"
                    onClick={addLegalDocRow}
                    className="rounded-lg border border-xevn-border px-3 py-2 text-sm font-medium transition hover:bg-slate-100 active:scale-95"
                  >
                    + Thêm tài liệu
                  </button>
                </div>
                <div className={`-mx-1 overflow-x-auto border border-xevn-border ${SETTINGS_RADIUS_CARD}`}>
                  <table className={`min-w-[880px] w-full ${SETTINGS_CONTROL_TEXT}`}>
                    <thead className="bg-white/70 backdrop-blur-md">
                      <tr>
                        <th className="px-3 py-2 text-left text-sm font-medium text-slate-500">Tên tài liệu</th>
                        <th className="px-3 py-2 text-left text-sm font-medium text-slate-500">Mã số</th>
                        <th className="px-3 py-2 text-left text-sm font-medium text-slate-500">Ngày cấp</th>
                        <th className="px-3 py-2 text-left text-sm font-medium text-slate-500">Ngày hết hạn</th>
                        <th className="px-3 py-2 text-left text-sm font-medium text-slate-500">File</th>
                        <th className="px-3 py-2 text-center text-sm font-medium text-slate-500">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {legalDocRows.map((row) => {
                        const isExpired =
                          Boolean(row.expiredDate) && new Date(row.expiredDate).getTime() < Date.now();
                        return (
                          <tr key={row.id} className="border-t border-xevn-border">
                            <td className="px-3 py-2">
                              <input
                                value={row.documentName}
                                onChange={(e) => updateLegalDocRow(row.id, 'documentName', e.target.value)}
                                className="w-full rounded-input border border-xevn-border bg-white px-2 py-1"
                              />
                            </td>
                            <td className="px-3 py-2">
                              <input
                                value={row.documentCode}
                                onChange={(e) => updateLegalDocRow(row.id, 'documentCode', e.target.value)}
                                className="w-full rounded-input border border-xevn-border bg-white px-2 py-1"
                              />
                            </td>
                            <td className="px-3 py-2">
                              <input
                                type="date"
                                value={row.issuedDate}
                                onChange={(e) => updateLegalDocRow(row.id, 'issuedDate', e.target.value)}
                                className="w-full rounded-input border border-xevn-border bg-white px-2 py-1"
                              />
                            </td>
                            <td className="px-3 py-2">
                              <input
                                type="date"
                                value={row.expiredDate}
                                onChange={(e) => updateLegalDocRow(row.id, 'expiredDate', e.target.value)}
                                className={`w-full rounded-input border bg-white px-2 py-1 ${
                                  isExpired ? 'border-rose-400 text-rose-600' : 'border-xevn-border'
                                }`}
                              />
                            </td>
                            <td className="px-3 py-2">
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => triggerLegalDocUpload(row.id)}
                                  className="rounded-lg border border-xevn-border p-1.5 transition active:scale-95"
                                  title="Upload"
                                >
                                  <Upload className="h-4 w-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => viewLegalDocument(row)}
                                  className="rounded-lg border border-xevn-border p-1.5 transition active:scale-95"
                                  title="View"
                                >
                                  <Eye className="h-4 w-4" />
                                </button>
                                <span className="truncate text-xs text-xevn-textSecondary">{row.fileName || '-'}</span>
                              </div>
                            </td>
                            <td className="px-3 py-2">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    void submitLegalDocRow(row.id);
                                  }}
                                  className="rounded-lg border border-emerald-300 bg-emerald-50 p-2 text-emerald-700 transition active:scale-95"
                                  title="Submit"
                                >
                                  <Check className="h-4 w-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => deleteLegalDocRow(row.id)}
                                  className="rounded-lg border border-rose-300 bg-rose-50 p-2 text-rose-700 transition active:scale-95"
                                  title="Delete"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
              </>
              ) : companyEntityId && companyEntityId !== 'new' ? (
                <CompanyRaciPanel
                  companyId={resolvedLegalEntityApiId ?? companyEntityId}
                  companyLabel={companyFullName(
                    settingsLegalEntities.find((e) => e.id === companyEntityId) ??
                      legalEntityList.find((e) => e.id === companyEntityId) ?? {
                        code: companyForm.shortName || '—',
                        name: companyForm.nameVi || 'Pháp nhân',
                        shortName: companyForm.shortName,
                      },
                  )}
                  tenantIdHint={
                    settingsLegalEntities.find((e) => e.id === companyEntityId)?.tenantId ??
                    legalEntityList.find((e) => e.id === companyEntityId)?.tenantId ??
                    null
                  }
                  companyIdHint={MEMBER_DEFAULT_COMPANY_ID}
                />
              ) : (
                <p className={`${SETTINGS_CONTROL_TEXT} text-slate-600`}>
                  Lưu pháp nhân (tab Hồ sơ pháp nhân) trước khi cấu hình RACI cho đơn vị này.
                </p>
              )}

            </div>
            )
          ) : null}

          {activeSettingsMenu === 'company_infrastructure' ? (
            infrastructureView === 'list' ? (
              foundationCategoryDetailId && foundationForm ? (
                <div className={`${SETTINGS_SECTION_STACK} min-h-[min(480px,65vh)]`}>
                  <SettingSectionHeader
                    title={foundationForm.nameVi.trim() || 'Danh mục nền mới'}
                    subtitle={
                      <>
                        Mã danh mục:{' '}
                        <span className="font-mono font-semibold text-xevn-text">
                          {foundationForm.code.trim() || '—'}
                        </span>
                        {' — '}
                        Gán pháp nhân, lưu phạm vi, rồi mới cấu hình khối/trường (theo pháp nhân xem trước).
                      </>
                    }
                  />
                  <div className={`space-y-6 border border-xevn-border p-4 shadow-soft ${SETTINGS_RADIUS_CARD}`}>
                    <div className={SETTINGS_SECTION_GRID}>
                      <label className={`${SETTINGS_FIELD_SHELL} ${SETTINGS_COL.span4}`}>
                        <span className={SETTINGS_LABEL_CLASS}>Mã danh mục nền *</span>
                        <input
                          value={foundationForm.code}
                          onChange={(e) =>
                            setFoundationForm((s) => (s ? { ...s, code: e.target.value } : s))
                          }
                          placeholder="VD: HT-LOG-CS"
                          className={`tabular-nums ${deptInputClass}`}
                          aria-label="Mã danh mục nền"
                        />
                      </label>
                      <label className={`${SETTINGS_FIELD_SHELL} ${SETTINGS_COL.span8}`}>
                        <span className={SETTINGS_LABEL_CLASS}>Tên danh mục *</span>
                        <input
                          value={foundationForm.nameVi}
                          onChange={(e) =>
                            setFoundationForm((s) => (s ? { ...s, nameVi: e.target.value } : s))
                          }
                          className={deptInputClass}
                          aria-label="Tên danh mục nền"
                        />
                      </label>
                      <label className={`${SETTINGS_FIELD_SHELL} w-full ${SETTINGS_COL.span12}`}>
                        <span className={SETTINGS_LABEL_CLASS}>Mô tả</span>
                        <AutoResizeTextarea
                          value={foundationForm.description ?? ''}
                          onChange={(v) =>
                            setFoundationForm((s) => (s ? { ...s, description: v } : s))
                          }
                          className={deptInputClass}
                          aria-label="Mô tả danh mục"
                        />
                      </label>
                    </div>
                    <div>
                      <h4 className={SETTINGS_SECTION_TITLE_CLASS}>Phạm vi áp dụng</h4>
                      <p className={`mt-1 ${SETTINGS_PAGE_SUBTITLE_CLASS}`}>
                        Chọn pháp nhân trong tập đoàn phải dùng danh mục này — chỉ các đơn vị được tick mới
                        vào màn riêng (hoặc do công ty mẹ nhập hộ) để điền giá trị điểm hạ tầng.
                      </p>
                      <div className="mt-4 flex flex-wrap gap-3">
                        {legalEntityList.map((c) => (
                          <label
                            key={c.id}
                            className="inline-flex cursor-pointer items-center gap-2 rounded-input border border-xevn-border bg-white px-3 py-2 shadow-sm transition hover:bg-slate-50"
                          >
                            <input
                              type="checkbox"
                              className="h-4 w-4 rounded border-xevn-border text-xevn-primary focus:ring-xevn-accent"
                              checked={foundationForm.appliesToCompanyIds.includes(c.id)}
                              onChange={() => toggleFoundationCompany(c.id)}
                            />
                            <span className="text-[15px] text-xevn-text">
                              {c.code} — {c.name}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col gap-3 border-t border-xevn-border pt-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex flex-wrap items-center gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            const first = foundationForm.appliesToCompanyIds[0];
                            if (!first) {
                              setPublishMessage(
                                'Chọn ít nhất một pháp nhân trong phạm vi áp dụng trước khi cấu hình khối/trường.',
                              );
                              return;
                            }
                            openInfrastructureFieldsConfigModal(first);
                          }}
                          className="inline-flex items-center justify-center gap-2 rounded-input border border-xevn-border bg-white px-4 py-2.5 text-[15px] font-semibold text-xevn-primary shadow-soft ring-1 ring-xevn-border transition hover:bg-slate-50 active:scale-95"
                        >
                          <FileArchive className="h-5 w-5 shrink-0" strokeWidth={RAIL_STROKE} />
                          Cấu hình khối &amp; trường
                        </button>
                        <p className="text-sm text-slate-500">
                          Mock: mở biểu mẫu theo pháp nhân đầu tiên đã tick.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
              <div className={`${SETTINGS_SECTION_STACK} min-h-[min(480px,65vh)]`}>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <SettingSectionHeader
                      title="Hạ tầng cơ sở"
                      subtitle="Hai lớp: (1) danh mục nền có mã + phạm vi pháp nhân + cấu hình khối; (2) điểm hạ tầng — nhập giá trị theo pháp nhân đã được gán."
                    />
                    <ApiLoadBanner
                      loadFailed={infrastructureCatalogFailed && !allowMockFallback()}
                      usingMockFallback={infrastructureCatalogSource === 'mock'}
                      title="Danh mục hạ tầng (UC-XBOS-CC-07)"
                      message={
                        infrastructureCatalogFailed
                          ? 'Không tải danh mục nền từ /api/xbos/infrastructure/settings — kiểm tra xbos-api và JWT scope main.'
                          : undefined
                      }
                    />
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 border-b border-xevn-border pb-3">
                  <button
                    type="button"
                    onClick={() => {
                      setInfrastructureBrowseTab('foundation');
                      closeFoundationCategoryDetail();
                    }}
                    className={`rounded-input px-4 py-2 text-[15px] font-semibold transition active:scale-95 ${
                      infrastructureBrowseTab === 'foundation'
                        ? 'bg-xevn-primary text-white shadow-soft'
                        : 'border border-xevn-border bg-white text-xevn-text hover:bg-slate-50'
                    }`}
                  >
                    1. Danh mục nền &amp; phạm vi
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setInfrastructureBrowseTab('sites');
                      closeFoundationCategoryDetail();
                    }}
                    className={`rounded-input px-4 py-2 text-[15px] font-semibold transition active:scale-95 ${
                      infrastructureBrowseTab === 'sites'
                        ? 'bg-xevn-primary text-white shadow-soft'
                        : 'border border-xevn-border bg-white text-xevn-text hover:bg-slate-50'
                    }`}
                  >
                    2. Điểm hạ tầng (nhập giá trị)
                  </button>
                </div>
                {infrastructureBrowseTab === 'foundation' ? (
                  <>
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <p className="max-w-3xl text-sm leading-relaxed text-slate-600">
                        Tạo <span className="font-semibold text-xevn-text">danh mục có mã</span>, tick pháp
                        nhân áp dụng, lưu phạm vi — sau đó trong chi tiết mới mở cấu hình khối/trường (popup
                        hiện tại). Điểm hạ tầng chỉ nhập giá trị khi pháp nhân đã nằm trong phạm vi.
                      </p>
                      <button
                        type="button"
                        onClick={() => openNewFoundationCategory()}
                        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-input bg-xevn-primary px-4 py-2.5 text-[15px] font-semibold text-white shadow-soft transition hover:opacity-90 active:scale-95"
                      >
                        <Plus className="h-5 w-5 shrink-0" strokeWidth={RAIL_STROKE} />
                        Thêm danh mục nền
                      </button>
                    </div>
                    <div className={`overflow-x-auto border border-xevn-border shadow-soft ${SETTINGS_RADIUS_CARD}`}>
                      <table className="min-w-[900px] w-full text-base text-xevn-text">
                        <thead className="bg-white/70 backdrop-blur-md">
                          <tr>
                            <th className="px-4 py-3 text-left text-base font-medium text-slate-500">
                              Mã danh mục
                            </th>
                            <th className="px-4 py-3 text-left text-base font-medium text-slate-500">
                              Tên danh mục
                            </th>
                            <th className="px-4 py-3 text-left text-base font-medium text-slate-500">
                              Phạm vi (pháp nhân)
                            </th>
                            <th className="px-4 py-3 text-right text-base font-medium text-slate-500">
                              Thao tác
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {foundationCategories.map((row) => (
                            <tr key={row.id} className="border-t border-xevn-border">
                              <td className="px-4 py-3 font-mono font-medium tabular-nums text-xevn-text">
                                {row.code || '—'}
                              </td>
                              <td className="px-4 py-3">{row.nameVi || '—'}</td>
                              <td className="px-4 py-3 text-slate-600">
                                {row.appliesToCompanyIds.length} pháp nhân
                              </td>
                              <td className="px-4 py-3 text-right">
                                <button
                                  type="button"
                                  onClick={() => openFoundationCategoryDetail(row.id)}
                                  className="text-[15px] font-semibold text-xevn-primary hover:underline"
                                >
                                  Chi tiết &amp; cấu hình
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <p className="max-w-3xl text-sm leading-relaxed text-slate-600">
                        Nhập <span className="font-semibold text-xevn-text">giá trị từng điểm</span> theo biểu
                        mẫu đã cấu hình ở tab danh mục nền (tập đoàn hoặc công ty mẹ có thể nhập hộ trên màn
                        này).
                      </p>
                      <button
                        type="button"
                        onClick={() => openNewInfrastructureSite()}
                        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-input bg-xevn-primary px-4 py-2.5 text-[15px] font-semibold text-white shadow-soft transition hover:opacity-90 active:scale-95"
                      >
                        <Plus className="h-5 w-5 shrink-0" strokeWidth={RAIL_STROKE} />
                        Thêm hạ tầng mới
                      </button>
                    </div>
                    <div className={`overflow-x-auto border border-xevn-border shadow-soft ${SETTINGS_RADIUS_CARD}`}>
                      <table className="min-w-[1100px] w-full text-base text-xevn-text">
                        <thead className="bg-white/70 backdrop-blur-md">
                          <tr>
                            <th className="px-4 py-3 text-left text-base font-medium text-slate-500">
                              Mã điểm
                            </th>
                            <th className="px-4 py-3 text-left text-base font-medium text-slate-500">
                              Tên hạ tầng
                            </th>
                            <th className="px-4 py-3 text-left text-base font-medium text-slate-500">
                              Loại hình
                            </th>
                            <th className="px-4 py-3 text-left text-base font-medium text-slate-500">
                              Đơn vị trực thuộc
                            </th>
                            <th className="px-4 py-3 text-left text-base font-medium text-slate-500">
                              Sức chứa
                            </th>
                            <th className="px-4 py-3 text-left text-base font-medium text-slate-500">
                              Trạng thái
                            </th>
                            <th className="px-4 py-3 text-right text-base font-medium text-slate-500">
                              Thao tác
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {infrastructureSites.map((site) => {
                            const op = legalEntityList.find((c) => c.id === site.operatingEntityId);
                            const opLabel = op ? `${op.code} — ${op.name}` : '—';
                            return (
                              <tr key={site.id} className="border-t border-xevn-border">
                                <td className="px-4 py-3 font-medium tabular-nums text-xevn-text">
                                  {site.siteCode}
                                </td>
                                <td className="px-4 py-3">{site.name}</td>
                                <td className="px-4 py-3">{INFRA_FACILITY_LABELS[site.facilityType]}</td>
                                <td className="px-4 py-3 text-slate-600">{opLabel}</td>
                                <td className="max-w-[14rem] px-4 py-3 break-words text-slate-700">
                                  {site.capacitySummary}
                                </td>
                                <td className="px-4 py-3">
                                  <span
                                    className={
                                      site.status === 'active'
                                        ? 'font-medium text-emerald-700'
                                        : site.status === 'maintenance'
                                          ? 'font-medium text-amber-700'
                                          : 'text-slate-500'
                                    }
                                  >
                                    {INFRA_STATUS_LABELS[site.status]}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-right">
                                  <button
                                    type="button"
                                    onClick={() => openEditInfrastructureSite(site.id)}
                                    className="text-[15px] font-semibold text-xevn-primary hover:underline"
                                  >
                                    Chỉnh sửa
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </div>
            )
            ) : (
              <div className={`${SETTINGS_SECTION_STACK} min-h-[min(480px,65vh)]`}>
                <SettingSectionHeader
                  title={infrastructureEditId === 'new' ? 'Thêm hạ tầng mới' : 'Chi tiết hạ tầng'}
                  subtitle={
                    <>
                      Nhập giá trị điểm hạ tầng theo biểu mẫu đã gắn với pháp nhân qua{' '}
                      <span className="font-medium text-xevn-text">Danh mục nền &amp; phạm vi</span>. Cần
                      chỉnh khối/trường theo pháp nhân đang chọn:{' '}
                      <button
                        type="button"
                        onClick={() => openInfrastructureFieldsConfigModal()}
                        className="font-semibold text-xevn-primary underline decoration-xevn-primary/50 underline-offset-2 transition hover:decoration-xevn-primary"
                      >
                        Mở cấu hình khối &amp; trường
                      </button>
                      .
                    </>
                  }
                />
                {infraForm.operatingEntityId && !operatingEntityInFoundationScope ? (
                  <div
                    className="mb-4 rounded-input border border-amber-200 bg-amber-50/90 px-4 py-3 text-sm text-amber-950"
                    role="status"
                  >
                    Pháp nhân đang chọn chưa nằm trong phạm vi bất kỳ danh mục nền nào — hãy gán pháp nhân
                    trong tab <strong className="font-semibold">1. Danh mục nền &amp; phạm vi</strong> trước
                    khi khai báo điểm.
                  </div>
                ) : null}
                <div className={`border border-xevn-border p-4 shadow-soft ${SETTINGS_RADIUS_CARD}`}>
                  <h4 className={`mb-4 ${SETTINGS_SECTION_TITLE_CLASS}`}>{infraUiMerged.blocks.general.titleVi}</h4>
                  <div className={SETTINGS_SECTION_GRID}>
                    <label className={`${SETTINGS_FIELD_SHELL} w-full ${SETTINGS_COL.span4}`}>
                      <span className={SETTINGS_LABEL_CLASS}>{infraUiMerged.fields.name?.labelVi ?? 'Tên hạ tầng'}</span>
                      <AutoResizeTextarea
                        aria-label={infraUiMerged.fields.name?.ariaLabel ?? 'Tên hạ tầng'}
                        value={infraForm.name}
                        onChange={(v) => setInfraForm((s) => ({ ...s, name: v }))}
                        className={deptInputClass}
                      />
                    </label>
                    <label className={`${SETTINGS_FIELD_SHELL} ${SETTINGS_COL.span4} ${SETTINGS_FIELD_COMPACT}`}>
                      <span className={SETTINGS_LABEL_CLASS}>{infraUiMerged.fields.siteCode?.labelVi ?? 'Mã định danh'}</span>
                      <AutoResizeTextarea
                        aria-label={infraUiMerged.fields.siteCode?.ariaLabel ?? 'Mã định danh'}
                        placeholder={infraUiMerged.fields.siteCode?.placeholder ?? 'VD: KHO-SGN-01'}
                        value={infraForm.siteCode}
                        onChange={(v) => setInfraForm((s) => ({ ...s, siteCode: v }))}
                        className={`tabular-nums ${deptInputClass}`}
                      />
                    </label>
                    <label className={`${SETTINGS_FIELD_SHELL} ${SETTINGS_COL.span4} ${SETTINGS_FIELD_COMPACT}`}>
                      <span className={SETTINGS_LABEL_CLASS}>
                        {infraUiMerged.fields.facilityType?.labelVi ?? 'Loại hạ tầng'}
                      </span>
                      <div className="relative min-w-0">
                        <select
                          value={infraForm.facilityType}
                          onChange={(e) =>
                            setInfraForm((s) => ({
                              ...s,
                              facilityType: e.target.value as InfrastructureFacilityType,
                            }))
                          }
                          className={deptSelectClass}
                        >
                          {infraEffectiveOptions.facilityTypes.map((k) => (
                            <option key={k} value={k}>
                              {INFRA_FACILITY_LABELS[k as InfrastructureFacilityType]}
                            </option>
                          ))}
                        </select>
                        <ChevronDown
                          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
                          strokeWidth={RAIL_STROKE}
                          aria-hidden
                        />
                      </div>
                    </label>
                    <label className={`${SETTINGS_FIELD_SHELL} ${SETTINGS_COL.span4} ${SETTINGS_FIELD_COMPACT}`}>
                      <span className={SETTINGS_LABEL_CLASS}>
                        {infraUiMerged.fields.operatingEntityId?.labelVi ?? 'Đơn vị trực thuộc'}
                      </span>
                      <div className="relative min-w-0">
                        <select
                          value={infraForm.operatingEntityId}
                          onChange={(e) =>
                                setInfraForm((s) =>
                                  normalizeInfrastructureFormForEntity({
                                    ...s,
                                    operatingEntityId: e.target.value,
                                  }),
                                )
                          }
                          className={deptSelectClass}
                          aria-label={infraUiMerged.fields.operatingEntityId?.ariaLabel ?? 'Đơn vị trực thuộc'}
                        >
                          <option value="">— Chọn đơn vị —</option>
                          {legalEntityList.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.code} — {c.name}
                            </option>
                          ))}
                        </select>
                        <ChevronDown
                          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
                          strokeWidth={RAIL_STROKE}
                          aria-hidden
                        />
                      </div>
                    </label>
                    <label className={`${SETTINGS_FIELD_SHELL} ${SETTINGS_COL.span4} ${SETTINGS_FIELD_COMPACT}`}>
                      <span className={SETTINGS_LABEL_CLASS}>
                        {infraUiMerged.fields.status?.labelVi ?? 'Trạng thái vận hành'}
                      </span>
                      <div className="relative min-w-0">
                        <select
                          value={infraForm.status}
                          onChange={(e) =>
                            setInfraForm((s) => ({
                              ...s,
                              status: e.target.value as InfrastructureSiteStatus,
                            }))
                          }
                          className={deptSelectClass}
                        >
                          {infraEffectiveOptions.statuses.map((k) => (
                            <option key={k} value={k}>
                              {INFRA_STATUS_LABELS[k as InfrastructureSiteStatus]}
                            </option>
                          ))}
                        </select>
                        <ChevronDown
                          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
                          strokeWidth={RAIL_STROKE}
                          aria-hidden
                        />
                      </div>
                    </label>
                    <div className={`${SETTINGS_FIELD_SHELL} ${SETTINGS_COL.span4} ${SETTINGS_FIELD_COMPACT}`}>
                      <span className={SETTINGS_LABEL_CLASS}>Mã bản ghi nội bộ</span>
                      <div
                        className={`flex min-h-[2.5rem] items-center rounded-input border border-xevn-border bg-slate-50 px-3 py-2 text-base tabular-nums text-slate-600`}
                      >
                        {infrastructureEditId === 'new' ? '—' : infrastructureEditId}
                      </div>
                    </div>
                    {infraCustomFieldDefsForEntity
                      .filter((f) => f.blockCode === 'general' && f.visible)
                      .map((f) => {
                        const value = infraForm.customFields?.[f.fieldCode] ?? '';
                        const setVal = (v: string) => setInfraCustomFieldValue(f.fieldCode, v);
                        return (
                          <label
                            key={f.id}
                            className={`${SETTINGS_FIELD_SHELL} w-full ${SETTINGS_COL.span12}`}
                          >
                            <span className={SETTINGS_LABEL_CLASS}>{f.labelVi}</span>
                            {f.dataType === 'text' ? (
                              <AutoResizeTextarea
                                aria-label={f.labelVi}
                                value={value}
                                onChange={(v) => setVal(v)}
                                className={deptInputClass}
                              />
                            ) : null}
                            {f.dataType === 'number' ? (
                              <input
                                type="number"
                                value={value}
                                onChange={(e) => setVal(e.target.value)}
                                className={deptInputClass}
                              />
                            ) : null}
                            {f.dataType === 'date' ? (
                              <input
                                type="date"
                                value={value}
                                onChange={(e) => setVal(e.target.value)}
                                className={deptInputClass}
                              />
                            ) : null}
                            {f.dataType === 'phone' ? (
                              <input
                                type="tel"
                                value={value}
                                onChange={(e) => setVal(e.target.value)}
                                className={deptInputClass}
                              />
                            ) : null}
                            {f.dataType === 'email' ? (
                              <input
                                type="email"
                                value={value}
                                onChange={(e) => setVal(e.target.value)}
                                className={deptInputClass}
                              />
                            ) : null}
                            {f.dataType === 'select' ? (
                              <div className="relative min-w-0">
                                <select
                                  value={value}
                                  onChange={(e) => setVal(e.target.value)}
                                  className={deptSelectClass}
                                >
                                  <option value="">— Chọn —</option>
                                  {parseMetadataSelectOptions(f.selectConfig ?? '').map((o) => (
                                    <option key={o} value={o}>
                                      {o}
                                    </option>
                                  ))}
                                </select>
                                <ChevronDown
                                  className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
                                  strokeWidth={RAIL_STROKE}
                                  aria-hidden
                                />
                              </div>
                            ) : null}
                          </label>
                        );
                      })}
                  </div>
                </div>
                <div className={`border border-xevn-border p-4 shadow-soft ${SETTINGS_RADIUS_CARD}`}>
                  <h4 className={`mb-4 ${SETTINGS_SECTION_TITLE_CLASS}`}>{infraUiMerged.blocks.location.titleVi}</h4>
                  <div className={SETTINGS_SECTION_GRID}>
                    <label className={`${SETTINGS_FIELD_SHELL} ${SETTINGS_COL.span4} ${SETTINGS_FIELD_COMPACT}`}>
                      <span className={SETTINGS_LABEL_CLASS}>{infraUiMerged.fields.gpsCoords?.labelVi ?? 'Tọa độ GPS'}</span>
                      <AutoResizeTextarea
                        aria-label={infraUiMerged.fields.gpsCoords?.ariaLabel ?? 'Tọa độ GPS'}
                        placeholder={infraUiMerged.fields.gpsCoords?.placeholder ?? 'lat, lng'}
                        value={infraForm.gpsCoords}
                        onChange={(v) => setInfraForm((s) => ({ ...s, gpsCoords: v }))}
                        className={`tabular-nums ${deptInputClass}`}
                      />
                    </label>
                    <label className={`${SETTINGS_FIELD_SHELL} w-full ${SETTINGS_COL.span8}`}>
                      <span className={SETTINGS_LABEL_CLASS}>
                        {infraUiMerged.fields.addressDetail?.labelVi ?? 'Địa chỉ chi tiết'}
                      </span>
                      <AutoResizeTextarea
                        aria-label={infraUiMerged.fields.addressDetail?.ariaLabel ?? 'Địa chỉ chi tiết'}
                        value={infraForm.addressDetail}
                        onChange={(v) => setInfraForm((s) => ({ ...s, addressDetail: v }))}
                        className={deptInputClass}
                      />
                    </label>
                    <label className={`${SETTINGS_FIELD_SHELL} ${SETTINGS_COL.span4} ${SETTINGS_FIELD_COMPACT}`}>
                      <span className={SETTINGS_LABEL_CLASS}>{infraUiMerged.fields.hotline?.labelVi ?? 'Hotline điểm'}</span>
                      <AutoResizeTextarea
                        aria-label={infraUiMerged.fields.hotline?.ariaLabel ?? 'Hotline điểm'}
                        value={infraForm.hotline}
                        onChange={(v) => setInfraForm((s) => ({ ...s, hotline: v }))}
                        className={`tabular-nums ${deptInputClass}`}
                      />
                    </label>
                    {(infraUiMerged.fields.directManager as { visible?: boolean } | undefined)
                      ?.visible === false ? null : (
                      <label className={`${SETTINGS_FIELD_SHELL} w-full ${SETTINGS_COL.span4}`}>
                        <span className={SETTINGS_LABEL_CLASS}>
                          {infraUiMerged.fields.directManager?.labelVi ?? 'Quản lý trực tiếp'}
                        </span>
                        <AutoResizeTextarea
                          aria-label={infraUiMerged.fields.directManager?.ariaLabel ?? 'Quản lý trực tiếp'}
                          value={infraForm.directManager}
                          onChange={(v) => setInfraForm((s) => ({ ...s, directManager: v }))}
                          className={deptInputClass}
                        />
                      </label>
                    )}
                    <label className={`${SETTINGS_FIELD_SHELL} ${SETTINGS_COL.span4} ${SETTINGS_FIELD_COMPACT}`}>
                      <span className={SETTINGS_LABEL_CLASS}>
                        {infraUiMerged.fields.leaseLegalEndDate?.labelVi ?? 'Thời hạn thuê / pháp lý'}
                      </span>
                      <div className="relative min-w-0">
                        <input
                          type="date"
                          value={infraForm.leaseLegalEndDate}
                          onChange={(e) =>
                            setInfraForm((s) => ({ ...s, leaseLegalEndDate: e.target.value }))
                          }
                          className={dateClass}
                        />
                        <Calendar
                          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                          strokeWidth={RAIL_STROKE}
                          aria-hidden
                        />
                      </div>
                    </label>
                    {infraCustomFieldDefsForEntity
                      .filter((f) => f.blockCode === 'location' && f.visible)
                      .map((f) => {
                        const value = infraForm.customFields?.[f.fieldCode] ?? '';
                        const setVal = (v: string) => setInfraCustomFieldValue(f.fieldCode, v);
                        return (
                          <label
                            key={f.id}
                            className={`${SETTINGS_FIELD_SHELL} w-full ${SETTINGS_COL.span12}`}
                          >
                            <span className={SETTINGS_LABEL_CLASS}>{f.labelVi}</span>
                            {f.dataType === 'text' ? (
                              <AutoResizeTextarea
                                aria-label={f.labelVi}
                                value={value}
                                onChange={(v) => setVal(v)}
                                className={deptInputClass}
                              />
                            ) : null}
                            {f.dataType === 'number' ? (
                              <input
                                type="number"
                                value={value}
                                onChange={(e) => setVal(e.target.value)}
                                className={deptInputClass}
                              />
                            ) : null}
                            {f.dataType === 'date' ? (
                              <input
                                type="date"
                                value={value}
                                onChange={(e) => setVal(e.target.value)}
                                className={deptInputClass}
                              />
                            ) : null}
                            {f.dataType === 'phone' ? (
                              <input
                                type="tel"
                                value={value}
                                onChange={(e) => setVal(e.target.value)}
                                className={deptInputClass}
                              />
                            ) : null}
                            {f.dataType === 'email' ? (
                              <input
                                type="email"
                                value={value}
                                onChange={(e) => setVal(e.target.value)}
                                className={deptInputClass}
                              />
                            ) : null}
                            {f.dataType === 'select' ? (
                              <div className="relative min-w-0">
                                <select
                                  value={value}
                                  onChange={(e) => setVal(e.target.value)}
                                  className={deptSelectClass}
                                >
                                  <option value="">— Chọn —</option>
                                  {parseMetadataSelectOptions(f.selectConfig ?? '').map((o) => (
                                    <option key={o} value={o}>
                                      {o}
                                    </option>
                                  ))}
                                </select>
                                <ChevronDown
                                  className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
                                  strokeWidth={RAIL_STROKE}
                                  aria-hidden
                                />
                              </div>
                            ) : null}
                          </label>
                        );
                      })}
                  </div>
                </div>
                <div className={`border border-xevn-border p-4 shadow-soft ${SETTINGS_RADIUS_CARD}`}>
                  <h4 className={`mb-4 ${SETTINGS_SECTION_TITLE_CLASS}`}>{infraUiMerged.blocks.capacity.titleVi}</h4>
                  <div className={SETTINGS_SECTION_GRID}>
                    <label className={`${SETTINGS_FIELD_SHELL} ${SETTINGS_COL.span4} ${SETTINGS_FIELD_COMPACT}`}>
                      <span className={SETTINGS_LABEL_CLASS}>
                        {infraUiMerged.fields.areaSqm?.labelVi ?? 'Diện tích (m²)'}
                      </span>
                      <AutoResizeTextarea
                        aria-label={infraUiMerged.fields.areaSqm?.ariaLabel ?? 'Diện tích m2'}
                        value={infraForm.areaSqm}
                        onChange={(v) => setInfraForm((s) => ({ ...s, areaSqm: v }))}
                        className={`tabular-nums ${deptInputClass}`}
                      />
                    </label>
                    {(infraUiMerged.fields.palletOrVehicleMax as { visible?: boolean } | undefined)
                      ?.visible === false ? null : (
                      <label className={`${SETTINGS_FIELD_SHELL} ${SETTINGS_COL.span4} ${SETTINGS_FIELD_COMPACT}`}>
                        <span className={SETTINGS_LABEL_CLASS}>
                          {infraUiMerged.fields.palletOrVehicleMax?.labelVi ?? 'Số lượng Pallet / Xe tối đa'}
                        </span>
                        <AutoResizeTextarea
                          aria-label={infraUiMerged.fields.palletOrVehicleMax?.ariaLabel ?? 'Pallet hoặc xe tối đa'}
                          value={infraForm.palletOrVehicleMax}
                          onChange={(v) => setInfraForm((s) => ({ ...s, palletOrVehicleMax: v }))}
                          className={deptInputClass}
                        />
                      </label>
                    )}
                    <label className={`${SETTINGS_FIELD_SHELL} ${SETTINGS_COL.span4} ${SETTINGS_FIELD_COMPACT}`}>
                      <span className={SETTINGS_LABEL_CLASS}>
                        {infraUiMerged.fields.ownerLegalEntityId?.labelVi ?? 'Pháp nhân sở hữu'}
                      </span>
                      <div className="relative min-w-0">
                        <select
                          value={infraForm.ownerLegalEntityId}
                          onChange={(e) =>
                            setInfraForm((s) => ({ ...s, ownerLegalEntityId: e.target.value }))
                          }
                          className={deptSelectClass}
                          aria-label={infraUiMerged.fields.ownerLegalEntityId?.ariaLabel ?? 'Pháp nhân sở hữu'}
                        >
                          <option value="">— Chọn pháp nhân —</option>
                          {legalEntityList.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.code} — {c.name}
                            </option>
                          ))}
                        </select>
                        <ChevronDown
                          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
                          strokeWidth={RAIL_STROKE}
                          aria-hidden
                        />
                      </div>
                    </label>
                    <label className={`${SETTINGS_FIELD_SHELL} w-full ${SETTINGS_COL.span12}`}>
                      <span className={SETTINGS_LABEL_CLASS}>
                        {infraUiMerged.fields.capacitySummary?.labelVi ?? 'Tóm tắt sức chứa (cột danh sách)'}
                      </span>
                      <AutoResizeTextarea
                        aria-label={infraUiMerged.fields.capacitySummary?.ariaLabel ?? 'Tóm tắt sức chứa'}
                        value={infraForm.capacitySummary}
                        onChange={(v) => setInfraForm((s) => ({ ...s, capacitySummary: v }))}
                        className={deptInputClass}
                      />
                    </label>
                    {infraCustomFieldDefsForEntity
                      .filter((f) => f.blockCode === 'capacity' && f.visible)
                      .map((f) => {
                        const value = infraForm.customFields?.[f.fieldCode] ?? '';
                        const setVal = (v: string) => setInfraCustomFieldValue(f.fieldCode, v);
                        return (
                          <label
                            key={f.id}
                            className={`${SETTINGS_FIELD_SHELL} w-full ${SETTINGS_COL.span12}`}
                          >
                            <span className={SETTINGS_LABEL_CLASS}>{f.labelVi}</span>
                            {f.dataType === 'text' ? (
                              <AutoResizeTextarea
                                aria-label={f.labelVi}
                                value={value}
                                onChange={(v) => setVal(v)}
                                className={deptInputClass}
                              />
                            ) : null}
                            {f.dataType === 'number' ? (
                              <input
                                type="number"
                                value={value}
                                onChange={(e) => setVal(e.target.value)}
                                className={deptInputClass}
                              />
                            ) : null}
                            {f.dataType === 'date' ? (
                              <input
                                type="date"
                                value={value}
                                onChange={(e) => setVal(e.target.value)}
                                className={deptInputClass}
                              />
                            ) : null}
                            {f.dataType === 'phone' ? (
                              <input
                                type="tel"
                                value={value}
                                onChange={(e) => setVal(e.target.value)}
                                className={deptInputClass}
                              />
                            ) : null}
                            {f.dataType === 'email' ? (
                              <input
                                type="email"
                                value={value}
                                onChange={(e) => setVal(e.target.value)}
                                className={deptInputClass}
                              />
                            ) : null}
                            {f.dataType === 'select' ? (
                              <div className="relative min-w-0">
                                <select
                                  value={value}
                                  onChange={(e) => setVal(e.target.value)}
                                  className={deptSelectClass}
                                >
                                  <option value="">— Chọn —</option>
                                  {parseMetadataSelectOptions(f.selectConfig ?? '').map((o) => (
                                    <option key={o} value={o}>
                                      {o}
                                    </option>
                                  ))}
                                </select>
                                <ChevronDown
                                  className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
                                  strokeWidth={RAIL_STROKE}
                                  aria-hidden
                                />
                              </div>
                            ) : null}
                          </label>
                        );
                      })}
                  </div>
                </div>
                {infraCustomBlocksForEntity
                  .filter((b) => b.visible)
                  .map((block) => {
                    const fields = infraCustomFieldDefsForEntity.filter(
                      (f) => f.blockCode === block.blockCode && f.visible,
                    );
                    if (!fields.length) return null;
                    return (
                      <div
                        key={block.id}
                        className={`border border-xevn-border p-4 shadow-soft ${SETTINGS_RADIUS_CARD}`}
                      >
                        <h4 className={`mb-4 ${SETTINGS_SECTION_TITLE_CLASS}`}>{block.labelVi}</h4>
                        <div className={SETTINGS_SECTION_GRID}>
                          {fields.map((f) => {
                            const value = infraForm.customFields?.[f.fieldCode] ?? '';
                            const setVal = (v: string) => setInfraCustomFieldValue(f.fieldCode, v);
                            return (
                              <label
                                key={f.id}
                                className={`${SETTINGS_FIELD_SHELL} w-full ${SETTINGS_COL.span12}`}
                              >
                                <span className={SETTINGS_LABEL_CLASS}>{f.labelVi}</span>
                                {f.dataType === 'text' ? (
                                  <AutoResizeTextarea
                                    aria-label={f.labelVi}
                                    value={value}
                                    onChange={(v) => setVal(v)}
                                    className={deptInputClass}
                                  />
                                ) : null}
                                {f.dataType === 'number' ? (
                                  <input
                                    type="number"
                                    value={value}
                                    onChange={(e) => setVal(e.target.value)}
                                    className={deptInputClass}
                                  />
                                ) : null}
                                {f.dataType === 'date' ? (
                                  <input
                                    type="date"
                                    value={value}
                                    onChange={(e) => setVal(e.target.value)}
                                    className={deptInputClass}
                                  />
                                ) : null}
                                {f.dataType === 'phone' ? (
                                  <input
                                    type="tel"
                                    value={value}
                                    onChange={(e) => setVal(e.target.value)}
                                    className={deptInputClass}
                                  />
                                ) : null}
                                {f.dataType === 'email' ? (
                                  <input
                                    type="email"
                                    value={value}
                                    onChange={(e) => setVal(e.target.value)}
                                    className={deptInputClass}
                                  />
                                ) : null}
                                {f.dataType === 'select' ? (
                                  <div className="relative min-w-0">
                                    <select
                                      value={value}
                                      onChange={(e) => setVal(e.target.value)}
                                      className={deptSelectClass}
                                    >
                                      <option value="">— Chọn —</option>
                                      {parseMetadataSelectOptions(f.selectConfig ?? '').map((o) => (
                                        <option key={o} value={o}>
                                          {o}
                                        </option>
                                      ))}
                                    </select>
                                    <ChevronDown
                                      className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
                                      strokeWidth={RAIL_STROKE}
                                      aria-hidden
                                    />
                                  </div>
                                ) : null}
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
              </div>
            )
          ) : null}

          {activeSettingsMenu === 'company_dept_system' ? (
            deptSystemDetailId && deptSystemForm ? (
              <div className={`${SETTINGS_SECTION_STACK} min-h-[min(480px,65vh)]`}>
                <SettingSectionHeader
                  title={deptSystemForm.nameVi.trim() || 'Khung phòng/ban mới'}
                  subtitle={
                    <>
                      Mã khung:{' '}
                      <span className="font-mono font-semibold text-xevn-text">
                        {deptSystemForm.code.trim() || '—'}
                      </span>
                      {' — '}
                      Gán pháp nhân thành viên và chọn cấp ORG GRADE được kích hoạt; cây phòng/ban chi tiết khai
                      báo tại từng đơn vị sau khi khung có hiệu lực.
                    </>
                  }
                />
                <div className={`space-y-6 border border-xevn-border p-4 shadow-soft ${SETTINGS_RADIUS_CARD}`}>
                  <div className={SETTINGS_SECTION_GRID}>
                    <label className={`${SETTINGS_FIELD_SHELL} ${SETTINGS_COL.span4}`}>
                      <span className={SETTINGS_LABEL_CLASS}>Mã khung *</span>
                      <input
                        value={deptSystemForm.code}
                        onChange={(e) =>
                          setDeptSystemForm((s) => (s ? { ...s, code: e.target.value } : s))
                        }
                        placeholder="VD: PB-ORG-XEVN-01"
                        className={`tabular-nums ${deptInputClass}`}
                        aria-label="Mã khung phòng ban"
                      />
                    </label>
                    <label className={`${SETTINGS_FIELD_SHELL} ${SETTINGS_COL.span8}`}>
                      <span className={SETTINGS_LABEL_CLASS}>Tên khung tổ chức *</span>
                      <input
                        value={deptSystemForm.nameVi}
                        onChange={(e) =>
                          setDeptSystemForm((s) => (s ? { ...s, nameVi: e.target.value } : s))
                        }
                        className={deptInputClass}
                        aria-label="Tên khung tổ chức"
                      />
                    </label>
                    <label className={`${SETTINGS_FIELD_SHELL} w-full ${SETTINGS_COL.span12}`}>
                      <span className={SETTINGS_LABEL_CLASS}>Mô tả</span>
                      <AutoResizeTextarea
                        value={deptSystemForm.description ?? ''}
                        onChange={(v) =>
                          setDeptSystemForm((s) => (s ? { ...s, description: v } : s))
                        }
                        className={deptInputClass}
                        aria-label="Mô tả khung"
                      />
                    </label>
                  </div>
                  <div>
                    <h4 className={SETTINGS_SECTION_TITLE_CLASS}>Phạm vi áp dụng</h4>
                    <p className={`mt-1 ${SETTINGS_PAGE_SUBTITLE_CLASS}`}>
                      Chọn công ty thành viên / pháp nhân phải dùng khung này — chỉ đơn vị được tick mới áp dụng
                      được ma trận chức danh theo ORG GRADE đã bật.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-3">
                      {legalEntityList.map((c) => (
                        <label
                          key={c.id}
                          className="inline-flex cursor-pointer items-center gap-2 rounded-input border border-xevn-border bg-white px-3 py-2 shadow-sm transition hover:bg-slate-50"
                        >
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-xevn-border text-xevn-primary focus:ring-xevn-accent"
                            checked={deptSystemForm.appliesToCompanyIds.includes(c.id)}
                            onChange={() => toggleDeptSystemCompany(c.id)}
                          />
                          <span className="text-[15px] text-xevn-text">
                            {c.code} — {c.name}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="border-t border-xevn-border pt-4">
                    <h4 className={SETTINGS_SECTION_TITLE_CLASS}>Cấp ORG GRADE kích hoạt</h4>
                    <p className={`mt-1 ${SETTINGS_PAGE_SUBTITLE_CLASS}`}>
                      Tick các cấp (1–9) dùng trong khung; có thể bỏ cấp 6 nếu chỉ cần ngăn cách trực quan trên
                      sơ đồ gốc.
                    </p>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {ORG_GRADE_LEVELS.map((row) => {
                        const on = deptSystemForm.enabledOrgGradeLevels.includes(row.level);
                        return (
                          <label
                            key={row.level}
                            className={`flex cursor-pointer items-start gap-3 rounded-input border px-3 py-3 shadow-sm transition hover:opacity-95 ${orgGradeBandSurface[row.band]}`}
                          >
                            <input
                              type="checkbox"
                              className="mt-0.5 h-4 w-4 shrink-0 rounded border-xevn-border text-xevn-primary focus:ring-xevn-accent"
                              checked={on}
                              onChange={() => toggleDeptSystemGrade(row.level)}
                            />
                            <span className="min-w-0">
                              <span className="block text-[15px] font-semibold text-xevn-text">
                                Cấp {row.level}
                                {row.level === 6 ? (
                                  <span className="font-normal text-slate-500"> (ngăn cách / trống)</span>
                                ) : null}
                              </span>
                              {row.titles.length ? (
                                <span className="mt-1 block text-sm leading-snug text-slate-600">
                                  {row.titles.join(' · ')}
                                </span>
                              ) : (
                                <span className="mt-1 block text-sm italic text-slate-500">
                                  Không gán chức danh — giữ chỗ trên sơ đồ
                                </span>
                              )}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className={`${SETTINGS_SECTION_STACK} min-h-[min(480px,65vh)]`}>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <SettingSectionHeader
                      title="Hệ thống Phòng/Ban"
                      subtitle="Khung phòng/ban & chức danh chuẩn hóa — tham chiếu ORG GRADE tập đoàn; gán pháp nhân và cấp bậc trước khi khai báo cây PB tại đơn vị."
                    />
                    <ApiLoadBanner
                      loadFailed={deptTemplatesHook.loadFailed && !allowMockFallback()}
                      usingMockFallback={deptTemplatesHook.usingMockFallback}
                      title="Khung phòng/ban mẫu (UC-XBOS-CC-08)"
                    />
                  </div>
                  {deptSystemTab === 'templates' ? (
                    <button
                      type="button"
                      onClick={() => openNewDeptSystemTemplate()}
                      className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-input bg-xevn-primary px-4 py-2.5 text-[15px] font-semibold text-white shadow-soft transition hover:opacity-90 active:scale-95"
                    >
                      <Plus className="h-5 w-5 shrink-0" strokeWidth={RAIL_STROKE} />
                      Thêm khung mới
                    </button>
                  ) : null}
                </div>
                <div className="flex flex-wrap gap-2 border-b border-xevn-border pb-3" role="tablist">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={deptSystemTab === 'reference'}
                    onClick={() => setDeptSystemTab('reference')}
                    className={`rounded-input px-4 py-2 text-[15px] font-semibold transition active:scale-95 ${
                      deptSystemTab === 'reference'
                        ? 'bg-xevn-primary text-white shadow-soft'
                        : 'border border-xevn-border bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    Tham chiếu ORG GRADE
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={deptSystemTab === 'templates'}
                    onClick={() => setDeptSystemTab('templates')}
                    className={`rounded-input px-4 py-2 text-[15px] font-semibold transition active:scale-95 ${
                      deptSystemTab === 'templates'
                        ? 'bg-xevn-primary text-white shadow-soft'
                        : 'border border-xevn-border bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    Danh mục khung
                  </button>
                </div>
                {deptSystemTab === 'reference' ? (
                  <div className={`space-y-4 border border-xevn-border p-4 shadow-soft ${SETTINGS_RADIUS_CARD}`}>
                    <p className={`${SETTINGS_CONTROL_TEXT} text-slate-600`}>
                      Bảng tham chiếu 9 cấp (ORG GRADE) — read-only; dùng làm chuẩn khi cấu hình khung phòng/ban
                      và chức danh.
                    </p>
                    <OrgGradeOrgChart />
                  </div>
                ) : (
                  <div className={`border border-xevn-border p-4 shadow-soft ${SETTINGS_RADIUS_CARD}`}>
                    <div className="overflow-x-auto">
                      <table className={`min-w-[640px] w-full border-collapse text-left ${SETTINGS_CONTROL_TEXT}`}>
                        <thead>
                          <tr className="border-b border-xevn-border bg-white/80 text-[15px] font-medium text-slate-500">
                            <th className="px-2 py-2">Mã khung</th>
                            <th className="px-2 py-2">Tên khung</th>
                            <th className="px-2 py-2 text-center">Số pháp nhân</th>
                            <th className="px-2 py-2 text-right">Thao tác</th>
                          </tr>
                        </thead>
                        <tbody>
                          {deptSystemTemplates.map((row) => (
                            <tr key={row.id} className="border-b border-xevn-border/80">
                              <td className="px-2 py-2 font-mono text-sm text-xevn-primary">
                                {row.code.trim() || '—'}
                              </td>
                              <td className="px-2 py-2 text-xevn-text">{row.nameVi.trim() || '—'}</td>
                              <td className="px-2 py-2 text-center tabular-nums text-slate-700">
                                {row.appliesToCompanyIds.length}
                              </td>
                              <td className="px-2 py-2 text-right">
                                <button
                                  type="button"
                                  onClick={() => openDeptSystemDetail(row.id)}
                                  className="rounded-input border border-xevn-border bg-white px-3 py-1.5 text-[15px] font-semibold text-xevn-primary shadow-sm transition hover:bg-slate-50 active:scale-95"
                                >
                                  Chi tiết
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {deptSystemTemplates.length === 0 ? (
                      <p className={`mt-4 text-center ${SETTINGS_CONTROL_TEXT} text-slate-500`}>
                        Chưa có khung nào — nhấn &quot;Thêm khung mới&quot; để tạo.
                      </p>
                    ) : null}
                  </div>
                )}
              </div>
            )
          ) : null}

          {activeSettingsMenu === 'hrm_catalog_governance' ? (
            <CatalogGovernancePanel onStatusMessage={setMenuNotice} />
          ) : null}

          {activeSettingsMenu === 'asset_requests' ? (
            <AssetRequestPanel onStatusMessage={setMenuNotice} />
          ) : null}

          {activeSettingsMenu === 'tenant_departments' ? (
            <div className={`${SETTINGS_SECTION_STACK} min-h-[min(480px,65vh)]`}>
              <SettingSectionHeader
                title="Phòng/Ban pháp nhân"
                subtitle="Chọn công ty để cấu hình cây phòng/ban; dữ liệu đồng bộ từ org-foundation khi có."
              />
              <TenantConfigScopeBar
                entities={settingsLegalEntities}
                selectedEntityId={settingsScopeEntityId}
                onSelectEntityId={setSettingsScopeEntityId}
                loading={groupMemberUnitsLoading}
                notice={groupMemberUnitsNotice}
              />
              {settingsScopeEntity ? (
                <div className={`space-y-4 border border-xevn-border p-4 shadow-soft ${SETTINGS_RADIUS_CARD}`}>
                  <p className={`${SETTINGS_CONTROL_TEXT} text-slate-600`}>
                    Pháp nhân: <strong>{companyFullName(settingsScopeEntity)}</strong>
                  </p>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h4 className={SETTINGS_SECTION_TITLE_CLASS}>Phòng/Ban trực thuộc pháp nhân</h4>
                    <button
                      type="button"
                      onClick={() => addDepartmentRow()}
                      className="inline-flex items-center gap-2 rounded-input border border-xevn-border bg-white px-3 py-2 text-[15px] font-medium text-xevn-text shadow-soft transition hover:bg-slate-50 active:scale-95"
                    >
                      <Plus className="h-5 w-5 shrink-0" strokeWidth={RAIL_STROKE} />
                      Thêm phòng ban mới
                    </button>
                  </div>
                  <div className={`overflow-x-auto border border-xevn-border ${SETTINGS_RADIUS_CARD}`}>
                    <div className="min-w-[960px] space-y-4 p-4">
                      {scopedDeptRows.map((row) => {
                        const parentCandidates = scopedDeptRows.filter((d) => d.id !== row.id);
                        const parentLabel = (d: LegalDepartmentRow) => {
                          const c = d.code.trim();
                          const n = d.name.trim();
                          if (c && n) return `${c} — ${n}`;
                          if (c) return c;
                          if (n) return n;
                          return `PB (${d.id.slice(-6)})`;
                        };
                        return (
                          <div key={row.id} className="flex gap-4">
                            <div className="grid min-w-0 flex-1 grid-cols-1 gap-4 md:grid-cols-12 md:items-start">
                              <div className={`min-w-0 ${SETTINGS_COL.span2}`}>
                                <input
                                  value={row.code}
                                  onChange={(e) =>
                                    updateDepartmentRow(row.id, { code: e.target.value })
                                  }
                                  className={deptInputClass}
                                  aria-label="Mã phòng ban"
                                />
                              </div>
                              <div
                                className={`min-w-0 ${SETTINGS_COL.span3} ${row.parentDeptId ? 'pl-6' : ''}`}
                              >
                                <input
                                  value={row.name}
                                  onChange={(e) =>
                                    updateDepartmentRow(row.id, { name: e.target.value })
                                  }
                                  className={deptInputClass}
                                  aria-label="Tên phòng ban"
                                />
                              </div>
                              <div className={`relative min-w-0 ${SETTINGS_COL.span3}`}>
                                <select
                                  value={row.parentDeptId}
                                  onChange={(e) =>
                                    updateDepartmentRow(row.id, {
                                      parentDeptId: e.target.value,
                                    })
                                  }
                                  className={deptSelectClass}
                                  aria-label="Phòng ban cấp trên"
                                >
                                  <option value="">— Gốc —</option>
                                  {parentCandidates.map((d) => (
                                    <option key={d.id} value={d.id}>
                                      {parentLabel(d)}
                                    </option>
                                  ))}
                                </select>
                                <ChevronDown
                                  className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
                                  strokeWidth={RAIL_STROKE}
                                  aria-hidden
                                />
                              </div>
                              <div className={`relative min-w-0 ${SETTINGS_COL.span2}`}>
                                <select
                                  value={row.headId}
                                  onChange={(e) =>
                                    updateDepartmentRow(row.id, { headId: e.target.value })
                                  }
                                  className={deptSelectClass}
                                  aria-label="Trưởng bộ phận"
                                >
                                  {DEPT_HEAD_OPTIONS.map((h) => (
                                    <option key={h.id || 'empty'} value={h.id}>
                                      {h.label}
                                    </option>
                                  ))}
                                </select>
                                <ChevronDown
                                  className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
                                  strokeWidth={RAIL_STROKE}
                                  aria-hidden
                                />
                              </div>
                              <div className={`min-w-0 ${SETTINGS_COL.span2}`}>
                                <input
                                  value={row.functionText}
                                  onChange={(e) =>
                                    updateDepartmentRow(row.id, {
                                      functionText: e.target.value,
                                    })
                                  }
                                  className={deptInputClass}
                                  aria-label="Chức năng phòng ban"
                                />
                              </div>
                            </div>
                            <div className="flex w-[5.5rem] shrink-0 items-center justify-center gap-1">
                              <button
                                type="button"
                                onClick={() => {
                                  void submitDepartmentRow(row);
                                }}
                                className="rounded-lg border border-emerald-300 bg-emerald-50 p-2 text-emerald-700 transition active:scale-95"
                                title="Lưu dòng"
                              >
                                <Check className="h-4 w-4" strokeWidth={RAIL_STROKE} />
                              </button>
                              <button
                                type="button"
                                onClick={() => deleteDepartmentRow(row.id)}
                                className="rounded-lg border border-rose-300 bg-rose-50 p-2 text-rose-700 transition active:scale-95"
                                title="Xóa dòng"
                              >
                                <X className="h-4 w-4" strokeWidth={RAIL_STROKE} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                      <button
                        type="button"
                        onClick={() => addDepartmentRow()}
                        className="w-full rounded-input border border-dashed border-xevn-border py-3 text-center text-[15px] font-medium text-slate-500 transition hover:border-xevn-primary hover:text-xevn-primary active:scale-[0.99]"
                      >
                        + Thêm dòng phòng ban
                      </button>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}

          {activeSettingsMenu === 'company_group_hr' ? (
            <div className={`${SETTINGS_SECTION_STACK} min-h-[min(480px,65vh)]`}>
              <SettingSectionHeader
                title="Danh mục hồ sơ nhân sự tập đoàn"
                subtitle="Chọn công ty để xem nhóm trường; bấm Cấu hình chi tiết để chỉnh khối danh mục trên popup."
              />
              <TenantConfigScopeBar
                entities={settingsLegalEntities}
                selectedEntityId={settingsScopeEntityId}
                onSelectEntityId={(id) => {
                  setSettingsScopeEntityId(id);
                  if (groupHrFieldsConfigOpen) closeGroupHrFieldsConfig();
                }}
                loading={groupMemberUnitsLoading}
                notice={groupMemberUnitsNotice}
              />
              {settingsScopeEntity ? (
                <div className={`space-y-4 border border-xevn-border p-4 shadow-soft ${SETTINGS_RADIUS_CARD}`}>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h4 className={SETTINGS_SECTION_TITLE_CLASS}>
                        Danh mục — {companyPrimaryLabel(settingsScopeEntity)}
                      </h4>
                      <p className={`mt-1 ${SETTINGS_PAGE_SUBTITLE_CLASS}`}>
                        {companyFullName(settingsScopeEntity)}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => openEmployeeMetadataPreview(settingsScopeEntity.id)}
                        className="rounded-input border border-xevn-border bg-white px-4 py-2 text-[15px] font-semibold text-xevn-primary shadow-soft"
                      >
                        Xem trước biểu mẫu
                      </button>
                      <button
                        type="button"
                        onClick={() => void openGroupHrDetailConfig(settingsScopeEntity.id)}
                        className="rounded-input bg-xevn-primary px-4 py-2 text-[15px] font-semibold text-white shadow-soft"
                      >
                        Cấu hình chi tiết
                      </button>
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    {(
                      getGroupHrCatalogGroups(settingsScopeEntity.tenantId) ?? [
                        {
                          groupCode: 'default',
                          groupLabel: 'Trường hồ sơ',
                          fields: (
                            employeeMetadataByEntity[settingsScopeEntity.id] ??
                            createDefaultEmployeeMetadataRows(
                              settingsScopeEntity.id,
                              settingsScopeEntity.tenantId,
                            )
                          ).map((f) => ({
                            id: f.id,
                            fieldName: f.fieldName,
                            dataType: f.dataType,
                            selectConfig: f.selectConfig,
                          })),
                        },
                      ]
                    ).map((group) => (
                      <div
                        key={group.groupCode}
                        className="rounded-input border border-xevn-border bg-white/90 p-4 shadow-sm"
                      >
                        <h5 className="text-[15px] font-semibold text-xevn-primary">{group.groupLabel}</h5>
                        <p className="mt-1 text-xs text-slate-500">{group.fields.length} trường</p>
                        <ul className="mt-3 max-h-48 space-y-1 overflow-y-auto text-[14px] text-slate-700">
                          {group.fields.map((f) => (
                            <li
                              key={f.id}
                              className="flex justify-between gap-2 border-b border-slate-100 py-1"
                            >
                              <span>{f.fieldName}</span>
                              <span className="shrink-0 text-xs text-slate-400">{f.dataType}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}

          {activeSettingsMenu === 'permission' ? (
            <div className={SETTINGS_SECTION_STACK}>
              <SettingSectionHeader
                title="Hệ thống phân quyền"
                subtitle="Ma trận theo module và vai trò: cấu hình quyền xem, ghi, xóa, duyệt và phạm vi dữ liệu."
              />
              <div className={`border border-xevn-border p-4 shadow-soft ${SETTINGS_RADIUS_CARD}`}>
                <h4 className={`mb-2 ${SETTINGS_SECTION_TITLE_CLASS}`}>Chuẩn RACI & cột chức danh</h4>
                <p className={`mb-4 text-sm leading-snug text-slate-600 ${SETTINGS_CONTROL_TEXT}`}>
                  Nguồn ma trận hoạt động × vai trò:{' '}
                  <span className="font-medium text-xevn-text">{RACI_SOURCE_FILE}</span>. Trên cổng, mỗi
                  cột được ánh xạ sang mã vai trò quy trình dạng{' '}
                  <code className="rounded bg-slate-100 px-1 text-sm">raci_&#123;id_cột&#125;</code> trong{' '}
                  <span className="font-medium">Hệ thống quy trình</span>.
                </p>
                <div className="mb-4 flex flex-wrap gap-3">
                  {RACI_LETTER_MEANINGS.map((x) => (
                    <div
                      key={x.letter}
                      className="min-w-[8rem] rounded-input border border-xevn-border bg-white px-3 py-2 shadow-sm"
                    >
                      <p className="text-lg font-bold text-xevn-primary">{x.letter}</p>
                      <p className="text-[15px] font-medium text-xevn-text">{x.labelVi}</p>
                      <p className="text-xs text-slate-500">{x.labelEn}</p>
                    </div>
                  ))}
                </div>
                <div className="overflow-x-auto">
                  <table className={`min-w-[720px] w-full border-collapse text-left ${SETTINGS_CONTROL_TEXT}`}>
                    <thead>
                      <tr className="border-b border-xevn-border bg-white/80 text-[15px] font-medium text-slate-500">
                        <th className="px-2 py-2">Mã cột</th>
                        <th className="px-2 py-2">Đơn vị / khối</th>
                        <th className="px-2 py-2">Chức danh (Excel)</th>
                        <th className="px-2 py-2">Nhãn quy trình</th>
                      </tr>
                    </thead>
                    <tbody>
                      {RACI_ORG_COLUMNS.map((c) => (
                        <tr key={c.id} className="border-b border-xevn-border/80">
                          <td className="px-2 py-2 font-mono text-sm text-xevn-primary">{`raci_${c.id}`}</td>
                          <td className="px-2 py-2">{c.orgUnit}</td>
                          <td className="px-2 py-2 text-slate-600">{c.positionTitle || '—'}</td>
                          <td className="px-2 py-2 text-slate-700">{c.workflowRoleLabel}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div
                className="flex flex-wrap gap-2 border-b border-xevn-border pb-4"
                role="tablist"
                aria-label="Vai trò áp dụng ma trận"
              >
                {permissionRoles.map((role) => {
                  const active = activePermissionRoleId === role.id;
                  return (
                    <button
                      key={role.id}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => setActivePermissionRoleId(role.id)}
                      className={`rounded-input px-4 py-2 text-[15px] font-medium transition active:scale-[0.98] ${
                        active
                          ? 'bg-xevn-primary text-white shadow-soft'
                          : 'border border-xevn-border bg-white text-xevn-textSecondary hover:bg-slate-50'
                      }`}
                    >
                      {role.label}
                    </button>
                  );
                })}
              </div>
              <div className={`flex flex-col gap-3 ${SETTINGS_RADIUS_CARD} border border-xevn-border shadow-soft`}>
                {PERMISSION_MODULE_META.map((mod) => {
                  const open = permissionAccordionOpen[mod.key];
                  const rowsInMod = permissionMatrixCurrent.filter((r) => r.moduleKey === mod.key);
                  return (
                    <div
                      key={mod.key}
                      className="border-b border-xevn-border last:border-b-0"
                    >
                      <button
                        type="button"
                        onClick={() =>
                          setPermissionAccordionOpen((prev) => ({
                            ...prev,
                            [mod.key]: !prev[mod.key],
                          }))
                        }
                        className="flex w-full items-center gap-2 bg-white/70 px-4 py-3 text-left backdrop-blur-md transition hover:bg-slate-50/90"
                        aria-expanded={open}
                      >
                        <ChevronDown
                          className={`h-5 w-5 shrink-0 text-slate-500 transition-transform duration-200 ${
                            open ? 'rotate-0' : '-rotate-90'
                          }`}
                          strokeWidth={RAIL_STROKE}
                          aria-hidden
                        />
                        <span className="text-base font-bold tracking-tight text-xevn-text">
                          {mod.title}
                        </span>
                        <span className="ml-auto text-[15px] font-medium tabular-nums text-slate-500">
                          {rowsInMod.length} chức năng
                        </span>
                      </button>
                      {open ? (
                        <div className="space-y-4 border-t border-xevn-border/80 bg-xevn-background/40 px-4 py-4">
                          {rowsInMod.map((row) => (
                            <div key={row.id} className={SETTINGS_SECTION_GRID}>
                              <div
                                className={`flex min-h-[2.75rem] items-center ${SETTINGS_COL.span4}`}
                              >
                                <p className="min-w-0 break-words text-base font-medium text-xevn-text">
                                  {row.featureLabel}
                                </p>
                              </div>
                              <div
                                className={`flex flex-wrap items-center gap-x-4 gap-y-2 ${SETTINGS_COL.span6}`}
                              >
                                {(
                                  [
                                    ['view', 'Xem'],
                                    ['write', 'Ghi'],
                                    ['delete', 'Xóa'],
                                    ['approve', 'Duyệt'],
                                  ] as const
                                ).map(([key, label]) => (
                                  <label
                                    key={key}
                                    className="inline-flex cursor-pointer items-center gap-2 rounded-md px-1 py-0.5 transition-all duration-200 hover:bg-white/80 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-xevn-accent"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={row[key]}
                                      onChange={(e) =>
                                        patchPermissionMatrixRow(activePermissionRoleId, row.id, {
                                          [key]: e.target.checked,
                                        })
                                      }
                                      className="h-4 w-4 shrink-0 cursor-pointer rounded border-slate-300 text-xevn-primary accent-xevn-primary transition-all duration-200 active:scale-[0.96] focus:ring-2 focus:ring-xevn-accent/40"
                                    />
                                    <span className="text-[15px] font-normal text-xevn-text">{label}</span>
                                  </label>
                                ))}
                              </div>
                              <label
                                className={`${SETTINGS_FIELD_SHELL} ${SETTINGS_COL.span2} ${SETTINGS_FIELD_COMPACT}`}
                              >
                                <span className={SETTINGS_LABEL_CLASS}>Phạm vi dữ liệu</span>
                                <div className="relative min-w-0">
                                  <select
                                    value={row.dataScope}
                                    onChange={(e) =>
                                      patchPermissionMatrixRow(activePermissionRoleId, row.id, {
                                        dataScope: e.target.value as PermissionDataScope,
                                      })
                                    }
                                    className={`${deptSelectClass} transition-colors duration-200 ${permissionScopeSelectVisual(row.dataScope)}`}
                                    aria-label={`Phạm vi — ${row.featureLabel}`}
                                  >
                                    {(Object.keys(PERMISSION_DATA_SCOPE_LABELS) as PermissionDataScope[]).map(
                                      (k) => (
                                        <option key={k} value={k}>
                                          {PERMISSION_DATA_SCOPE_LABELS[k]}
                                        </option>
                                      ),
                                    )}
                                  </select>
                                  <ChevronDown
                                    className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
                                    strokeWidth={RAIL_STROKE}
                                    aria-hidden
                                  />
                                </div>
                              </label>
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}

          {activeSettingsMenu === 'workflow' ? (
            workflowView === 'list' ? (
              <div className={SETTINGS_SECTION_STACK}>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <SettingSectionHeader
                    title="Hệ thống quy trình"
                    subtitle="Định nghĩa quy trình đa pháp nhân — kích hoạt, SLA và từng bước xử lý"
                  />
                  <ApiLoadBanner
                    loadFailed={workflowDefinitionsStrict.loadFailed}
                    usingMockFallback={workflowDefinitionsStrict.usingMockFallback}
                    title="Canvas quy trình (UC-XBOS-CC-06)"
                    message={
                      workflowDefinitionsStrict.emptyStrictHint
                        ? WORKFLOW_DEFINITIONS_STRICT_EMPTY_HINT
                        : workflowDefinitionsStrict.loadFailed
                          ? WORKFLOW_DEFINITIONS_STRICT_LOAD_FAILED
                          : undefined
                    }
                  />
                  <button
                    type="button"
                    onClick={() => openNewWorkflow()}
                    className="inline-flex shrink-0 items-center gap-2 rounded-input bg-xevn-primary px-4 py-2.5 text-[15px] font-semibold text-white shadow-soft transition hover:opacity-90 active:scale-95 sm:self-start"
                  >
                    <Plus className="h-5 w-5 shrink-0" strokeWidth={RAIL_STROKE} />
                    Thêm quy trình mới
                  </button>
                </div>
                <div className={`overflow-x-auto border border-xevn-border shadow-soft ${SETTINGS_RADIUS_CARD}`}>
                  <table className="min-w-[920px] w-full text-base font-normal text-xevn-text">
                    <thead className="bg-white/70 backdrop-blur-md">
                      <tr>
                        <th className="px-4 py-3 text-left text-base font-medium text-slate-500">
                          Mã quy trình
                        </th>
                        <th className="px-4 py-3 text-left text-base font-medium text-slate-500">
                          Tên quy trình
                        </th>
                        <th className="px-4 py-3 text-left text-base font-medium text-slate-500">
                          Đơn vị áp dụng
                        </th>
                        <th className="px-4 py-3 text-left text-base font-medium text-slate-500">
                          Số bước
                        </th>
                        <th className="px-4 py-3 text-left text-base font-medium text-slate-500">
                          SLA tổng (giờ)
                        </th>
                        <th className="px-4 py-3 text-right text-base font-medium text-slate-500">
                          Thao tác
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {workflows.map((w) => {
                        const ent = w.applyingEntityId
                          ? legalEntityList.find((c) => c.id === w.applyingEntityId)
                          : null;
                        const entLabel = ent ? `${ent.code} — ${ent.name}` : 'Toàn tập đoàn';
                        return (
                          <tr key={w.id} className="border-t border-xevn-border">
                            <td className="px-4 py-3 font-medium tabular-nums">{w.code}</td>
                            <td className="px-4 py-3">{w.name}</td>
                            <td className="px-4 py-3 text-slate-600">{entLabel}</td>
                            <td className="px-4 py-3 tabular-nums">{w.steps.length}</td>
                            <td className="px-4 py-3 tabular-nums">{w.totalSlaHours}</td>
                            <td className="px-4 py-3 text-right">
                              <button
                                type="button"
                                onClick={() => openEditWorkflow(w.id)}
                                className="text-[15px] font-semibold text-xevn-primary hover:underline"
                              >
                                Chỉnh sửa
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : workflowForm ? (
              <div className={SETTINGS_SECTION_STACK}>
                <SettingSectionHeader
                  title={workflowEditId === 'new' ? 'Thêm quy trình' : 'Chi tiết quy trình'}
                  subtitle="Mỗi bước có ba luồng: Đồng ý, Từ chối và chuyển cấp BOD; sơ đồ luồng phản ánh đúng cấu hình các bước bên dưới"
                />
                <div className={`border border-xevn-border p-4 shadow-soft ${SETTINGS_RADIUS_CARD}`}>
                  <h4 className={`mb-4 ${SETTINGS_SECTION_TITLE_CLASS}`}>Thông tin chung quy trình</h4>
                  <div className={SETTINGS_SECTION_GRID}>
                    <label className={`${SETTINGS_FIELD_SHELL} ${SETTINGS_COL.span4} ${SETTINGS_FIELD_COMPACT}`}>
                      <span className={SETTINGS_LABEL_CLASS}>Mã quy trình</span>
                      <AutoResizeTextarea
                        aria-label="Mã quy trình"
                        placeholder="VD: WF-TD-01"
                        value={workflowForm.code}
                        onChange={(v) => setWorkflowForm((f) => (f ? { ...f, code: v } : f))}
                        className={`tabular-nums ${deptInputClass}`}
                      />
                    </label>
                    <label className={`${SETTINGS_FIELD_SHELL} w-full ${SETTINGS_COL.span4}`}>
                      <span className={SETTINGS_LABEL_CLASS}>Tên quy trình</span>
                      <AutoResizeTextarea
                        aria-label="Tên quy trình"
                        value={workflowForm.name}
                        onChange={(v) => setWorkflowForm((f) => (f ? { ...f, name: v } : f))}
                        className={deptInputClass}
                      />
                    </label>
                    <label className={`${SETTINGS_FIELD_SHELL} ${SETTINGS_COL.span4} ${SETTINGS_FIELD_COMPACT}`}>
                      <span className={SETTINGS_LABEL_CLASS}>Đơn vị áp dụng</span>
                      <div className="relative min-w-0">
                        <select
                          value={workflowForm.applyingEntityId}
                          onChange={(e) =>
                            setWorkflowForm((f) =>
                              f ? { ...f, applyingEntityId: e.target.value } : f,
                            )
                          }
                          className={deptSelectClass}
                          aria-label="Đơn vị áp dụng"
                        >
                          <option value="">Toàn tập đoàn</option>
                          {legalEntityList.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.code} — {c.name}
                            </option>
                          ))}
                        </select>
                        <ChevronDown
                          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
                          strokeWidth={RAIL_STROKE}
                          aria-hidden
                        />
                      </div>
                    </label>
                  </div>
                </div>
                <div className={`border border-xevn-border p-4 shadow-soft ${SETTINGS_RADIUS_CARD}`}>
                  <h4 className={`mb-4 ${SETTINGS_SECTION_TITLE_CLASS}`}>Khối Kích hoạt</h4>
                  <div className={SETTINGS_SECTION_GRID}>
                    <label className={`${SETTINGS_FIELD_SHELL} w-full ${SETTINGS_COL.span4}`}>
                      <span className={SETTINGS_LABEL_CLASS}>Sự kiện kích hoạt</span>
                      <div className="relative min-w-0">
                        <select
                          value={workflowForm.triggerEvent}
                          onChange={(e) =>
                            setWorkflowForm((f) =>
                              f ? { ...f, triggerEvent: e.target.value } : f,
                            )
                          }
                          className={deptSelectClass}
                          aria-label="Sự kiện kích hoạt"
                        >
                          {WORKFLOW_TRIGGER_EVENTS.map((ev) => (
                            <option key={ev.id} value={ev.id}>
                              {ev.label}
                            </option>
                          ))}
                        </select>
                        <ChevronDown
                          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
                          strokeWidth={RAIL_STROKE}
                          aria-hidden
                        />
                      </div>
                    </label>
                    <label className={`${SETTINGS_FIELD_SHELL} ${SETTINGS_COL.span4} ${SETTINGS_FIELD_COMPACT}`}>
                      <span className={SETTINGS_LABEL_CLASS}>SLA tổng (giờ)</span>
                      <input
                        type="number"
                        min={0}
                        value={workflowForm.totalSlaHours}
                        onChange={(e) =>
                          setWorkflowForm((f) =>
                            f ? { ...f, totalSlaHours: Number(e.target.value) } : f,
                          )
                        }
                        className={`tabular-nums ${deptInputClass}`}
                        aria-label="SLA tổng giờ"
                      />
                    </label>
                    <div className={`${SETTINGS_FIELD_SHELL} ${SETTINGS_COL.span4} ${SETTINGS_FIELD_COMPACT}`}>
                      <span className={SETTINGS_LABEL_CLASS}>Số bước xử lý</span>
                      <p
                        className={`${WORKSPACE_STICKY_HEADER_AXIS_H} flex items-center tabular-nums text-xevn-text ${SETTINGS_CONTROL_TEXT}`}
                        aria-live="polite"
                      >
                        {workflowForm.steps.length}
                      </p>
                    </div>
                  </div>
                </div>
                <div
                  className="flex flex-wrap gap-2 border-b border-xevn-border pb-3"
                  role="tablist"
                  aria-label="Chế độ chỉnh sửa quy trình"
                >
                  <button
                    type="button"
                    role="tab"
                    aria-selected={workflowDetailTab === 'graph'}
                    onClick={() => {
                      setWorkflowDetailTab('graph');
                      setWorkflowCanvasSelectedStepId(null);
                    }}
                    className={`rounded-input px-4 py-2 text-base transition active:scale-[0.99] ${
                      workflowDetailTab === 'graph'
                        ? 'font-bold text-xevn-primary shadow-sm ring-2 ring-xevn-primary/20'
                        : 'border border-transparent font-normal text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Cấu hình bước & luồng
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={workflowDetailTab === 'canvas'}
                    onClick={() => setWorkflowDetailTab('canvas')}
                    className={`rounded-input px-4 py-2 text-base transition active:scale-[0.99] ${
                      workflowDetailTab === 'canvas'
                        ? 'font-bold text-xevn-primary shadow-sm ring-2 ring-xevn-primary/20'
                        : 'border border-transparent font-normal text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Sơ đồ luồng
                  </button>
                </div>
                {workflowDetailTab === 'graph' ? (
                <div className={`border border-xevn-border p-4 shadow-soft ${SETTINGS_RADIUS_CARD}`}>
                  <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <h4 className={SETTINGS_SECTION_TITLE_CLASS}>Nút và luồng kết nối</h4>
                    <button
                      type="button"
                      onClick={() => addWorkflowStepRow()}
                      className="inline-flex items-center gap-2 rounded-input border border-xevn-border bg-white px-3 py-2 text-[15px] font-medium text-xevn-text shadow-sm transition hover:bg-slate-50 active:scale-[0.99]"
                    >
                      <Plus className="h-4 w-4" strokeWidth={RAIL_STROKE} />
                      Thêm nút bước
                    </button>
                  </div>
                  <div className="-mx-1 overflow-x-auto px-1 pb-1">
                    <div className="w-full min-w-0 space-y-6 lg:min-w-[68rem]">
                  <div className="mb-3 hidden lg:block">
                    <div className={`${WORKFLOW_STEPS_TABLE_GRID} text-[15px] font-medium text-slate-500`}>
                      <div className="min-w-0">Stt</div>
                      <div className="min-w-0">Tên đầu việc</div>
                      <div className="min-w-0">Vai trò</div>
                      <div className="min-w-0">Hành động</div>
                      <div className="min-w-0">SLA</div>
                      <div className="min-w-0">
                        <span className="block">Luồng đi tiếp (Đồng ý / Từ chối* / BOD)</span>
                        <span className="mt-1 block text-sm font-normal leading-snug text-slate-500">
                          *Từ chối chỉ cấu hình được với vai trò có thẩm quyền phê duyệt — xanh / đỏ / cam trên sơ đồ
                        </span>
                      </div>
                      <div className="min-w-0">Module</div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-6">
                    {workflowForm.steps
                      .slice()
                      .sort((a, b) => a.order - b.order)
                      .map((step) => {
                        const destOpts = buildWorkflowDestinationOptions(workflowForm);
                        const destTitle = (id: string) =>
                          destOpts.find((o) => o.value === id)?.label ?? '';
                        const roleTitle =
                          WORKFLOW_HANDLER_ROLES.find((r) => r.id === step.handlerRoleId)?.label ?? '';
                        const actionTitle = WORKFLOW_STEP_ACTION_LABELS[step.stepAction];
                        const moduleTitle =
                          WORKFLOW_RELATED_MODULES.find((m) => m.id === step.relatedModuleId)?.label ?? '';
                        const canConfigReject = workflowHandlerRoleAllowsRejectOutcome(step.handlerRoleId);
                        return (
                        <div
                          key={step.id}
                          className={`${WORKFLOW_STEPS_TABLE_GRID} rounded-input border border-xevn-border/80 bg-white/60 p-4 shadow-sm`}
                        >
                          <div
                            className="flex min-w-0 items-start justify-between gap-2 pt-0.5"
                          >
                            <span className="text-base font-normal tabular-nums text-xevn-text">
                              <span className="lg:hidden">Bước </span>
                              {step.order}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeWorkflowStepRow(step.id)}
                              disabled={workflowForm.steps.length <= 1}
                              className="inline-flex shrink-0 rounded-md p-1.5 text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-40"
                              aria-label="Xóa bước"
                            >
                              <Trash2 className="h-4 w-4" strokeWidth={RAIL_STROKE} />
                            </button>
                          </div>
                          <label className={`${SETTINGS_FIELD_SHELL} w-full min-w-0`}>
                            <span className={`${SETTINGS_LABEL_CLASS} lg:sr-only`}>Tên đầu việc</span>
                            <AutoResizeTextarea
                              aria-label={`Tên đầu việc bước ${step.order}`}
                              value={step.taskName}
                              onChange={(v) => patchWorkflowStepRow(step.id, { taskName: v })}
                              className={deptInputClass}
                            />
                          </label>
                          <label
                            className={`${SETTINGS_FIELD_SHELL} min-w-0 ${SETTINGS_FIELD_COMPACT}`}
                          >
                            <span className={`${SETTINGS_LABEL_CLASS} lg:sr-only`}>Vai trò xử lý</span>
                            <div className="relative min-w-0">
                              <select
                                value={step.handlerRoleId}
                                onChange={(e) =>
                                  patchWorkflowStepRow(step.id, { handlerRoleId: e.target.value })
                                }
                                className={deptSelectClass}
                                aria-label="Vai trò xử lý"
                                title={roleTitle}
                              >
                                {WORKFLOW_HANDLER_ROLES.map((r) => (
                                  <option key={r.id} value={r.id}>
                                    {r.label}
                                  </option>
                                ))}
                              </select>
                              <ChevronDown
                                className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
                                strokeWidth={RAIL_STROKE}
                                aria-hidden
                              />
                            </div>
                          </label>
                          <label
                            className={`${SETTINGS_FIELD_SHELL} min-w-0 ${SETTINGS_FIELD_COMPACT}`}
                          >
                            <span className={`${SETTINGS_LABEL_CLASS} lg:sr-only`}>Hành động</span>
                            <div className="relative min-w-0">
                              <select
                                value={step.stepAction}
                                onChange={(e) =>
                                  patchWorkflowStepRow(step.id, {
                                    stepAction: e.target.value as WorkflowStepAction,
                                  })
                                }
                                className={deptSelectClass}
                                aria-label="Hành động"
                                title={actionTitle}
                              >
                                {(Object.keys(WORKFLOW_STEP_ACTION_LABELS) as WorkflowStepAction[]).map(
                                  (k) => (
                                    <option key={k} value={k}>
                                      {WORKFLOW_STEP_ACTION_LABELS[k]}
                                    </option>
                                  ),
                                )}
                              </select>
                              <ChevronDown
                                className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
                                strokeWidth={RAIL_STROKE}
                                aria-hidden
                              />
                            </div>
                          </label>
                          <label
                            className={`${SETTINGS_FIELD_SHELL} min-w-0 ${SETTINGS_FIELD_COMPACT}`}
                          >
                            <span className={`${SETTINGS_LABEL_CLASS} lg:sr-only`}>SLA (giờ)</span>
                            <input
                              type="number"
                              min={0}
                              value={step.slaHours}
                              onChange={(e) =>
                                patchWorkflowStepRow(step.id, {
                                  slaHours: Number(e.target.value),
                                })
                              }
                              className={`tabular-nums ${deptInputClass}`}
                              aria-label="SLA bước giờ"
                            />
                          </label>
                          <div className={`${SETTINGS_FIELD_SHELL} flex w-full min-w-0 flex-col gap-3`}>
                            {WORKFLOW_TRANSITION_KINDS.map((kind) => {
                              const tr = step.transitions.find((t) => t.kind === kind);
                              const destId = tr?.destinationId ?? '';
                              if (kind === 'reject' && !canConfigReject) {
                                return (
                                  <div
                                    key={kind}
                                    className={`min-w-0 rounded-input border border-dashed border-xevn-border/80 bg-slate-50/80 px-3 py-2`}
                                  >
                                    <span className="block min-w-0 break-words text-left text-[15px] font-medium leading-snug text-slate-500">
                                      → {WORKFLOW_EDGE_FULL_LABELS[kind]}
                                    </span>
                                    <p className="mt-1 text-sm font-normal leading-snug text-slate-500">
                                      Không áp dụng — vai trò này không có thẩm quyền từ chối trong quy trình; khi vận
                                      hành sẽ không có hành động Từ chối cho bước này.
                                    </p>
                                  </div>
                                );
                              }
                              return (
                                <label key={kind} className={`min-w-0 ${SETTINGS_FIELD_COMPACT}`}>
                                  <span className="block min-w-0 break-words text-left text-[15px] font-medium leading-snug text-slate-500 hyphens-auto">
                                    → {WORKFLOW_EDGE_FULL_LABELS[kind]}
                                  </span>
                                  <div className="relative min-w-0">
                                    <select
                                      value={destId}
                                      onChange={(e) =>
                                        patchWorkflowGraphTransition(step.id, kind, e.target.value)
                                      }
                                      className={deptSelectClass}
                                      aria-label={`Đích ${WORKFLOW_EDGE_FULL_LABELS[kind]}`}
                                      title={destTitle(destId)}
                                    >
                                      {destOpts.map((o) => (
                                        <option key={o.value} value={o.value}>
                                          {o.label}
                                        </option>
                                      ))}
                                    </select>
                                    <ChevronDown
                                      className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
                                      strokeWidth={RAIL_STROKE}
                                      aria-hidden
                                    />
                                  </div>
                                </label>
                              );
                            })}
                          </div>
                          <label
                            className={`${SETTINGS_FIELD_SHELL} min-w-0 ${SETTINGS_FIELD_COMPACT}`}
                          >
                            <span className={`${SETTINGS_LABEL_CLASS} lg:sr-only`}>Module liên quan</span>
                            <span className={`${SETTINGS_LABEL_CLASS} hidden lg:inline`}>
                              Dữ liệu liên quan
                            </span>
                            <div className="relative min-w-0">
                              <select
                                value={step.relatedModuleId}
                                onChange={(e) =>
                                  patchWorkflowStepRow(step.id, {
                                    relatedModuleId: e.target.value,
                                  })
                                }
                                className={deptSelectClass}
                                aria-label="Module liên quan"
                                title={moduleTitle}
                              >
                                {WORKFLOW_RELATED_MODULES.map((m) => (
                                  <option key={m.id} value={m.id}>
                                    {m.label}
                                  </option>
                                ))}
                              </select>
                              <ChevronDown
                                className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
                                strokeWidth={RAIL_STROKE}
                                aria-hidden
                              />
                            </div>
                          </label>
                        </div>
                        );
                      })}
                  </div>
                    </div>
                  </div>
                </div>
                ) : (
                <div className={`border border-xevn-border p-4 shadow-soft ${SETTINGS_RADIUS_CARD}`}>
                  <h4 className={`mb-4 ${SETTINGS_SECTION_TITLE_CLASS}`}>Sơ đồ luồng</h4>
                  <div className="w-full min-w-0">
                    <WorkflowCanvas
                      steps={workflowForm.steps}
                      selectedStepId={workflowCanvasSelectedStepId}
                      onSelectStep={setWorkflowCanvasSelectedStepId}
                      resolveRoleLabel={(id: string) =>
                        WORKFLOW_HANDLER_ROLES.find((r) => r.id === id)?.label ?? id
                      }
                      resolveModuleLabel={(id: string) =>
                        WORKFLOW_RELATED_MODULES.find((m) => m.id === id)?.label ?? id
                      }
                    />
                  </div>
                </div>
                )}
              </div>
            ) : null
          ) : null}

          {activeSettingsMenu === 'document' ? (
            <div className={SETTINGS_SECTION_STACK}>
              <SettingSectionHeader title="Hệ thống văn bản/Quy định" subtitle="Danh mục dạng bảng" />
              <div className={`overflow-x-auto border border-xevn-border ${SETTINGS_RADIUS_CARD}`}>
                <table className={`min-w-full ${SETTINGS_CONTROL_TEXT}`}>
                  <thead className="bg-white/70 backdrop-blur-md">
                    <tr>
                      <th className="px-3 py-2 text-left text-sm font-medium text-slate-500">Mã</th>
                      <th className="px-3 py-2 text-left text-sm font-medium text-slate-500">Tên văn bản</th>
                      <th className="px-3 py-2 text-left text-sm font-medium text-slate-500">Version</th>
                      <th className="px-3 py-2 text-center text-sm font-medium text-slate-500">Hiệu lực</th>
                    </tr>
                  </thead>
                  <tbody>
                    {documentRows.map((row, index) => (
                      <tr key={row.code} className="border-t border-xevn-border">
                        <td className="px-3 py-2">{row.code}</td>
                        <td className="px-3 py-2">
                          <input
                            value={row.title}
                            onChange={(e) => {
                              const next = documentRows.map((r, i) =>
                                i === index ? { ...r, title: e.target.value } : r,
                              );
                              setDocumentRows(next);
                            }}
                            className="w-full rounded-input border border-xevn-border px-2 py-1"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            value={row.version}
                            onChange={(e) => {
                              const next = documentRows.map((r, i) =>
                                i === index ? { ...r, version: e.target.value } : r,
                              );
                              setDocumentRows(next);
                            }}
                            className="w-full rounded-input border border-xevn-border px-2 py-1"
                          />
                        </td>
                        <td className="px-3 py-2 text-center">
                          <input
                            type="checkbox"
                            checked={row.active}
                            onChange={(e) => {
                              const next = documentRows.map((r, i) =>
                                i === index ? { ...r, active: e.target.checked } : r,
                              );
                              setDocumentRows(next);
                            }}
                            className="h-4 w-4 active:scale-95"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}

          {activeSettingsMenu === 'measurement' ? (
            <div className={SETTINGS_SECTION_STACK}>
              <SettingSectionHeader title="Hệ thống đo lường/Tiền tệ" subtitle="Biểu mẫu và bảng nhập liệu" />
              <div className={`overflow-x-auto border border-xevn-border ${SETTINGS_RADIUS_CARD}`}>
                <table className={`min-w-full ${SETTINGS_CONTROL_TEXT}`}>
                  <thead className="bg-white/70 backdrop-blur-md">
                    <tr>
                      <th className="px-3 py-2 text-left text-sm font-medium text-slate-500">Metric Key</th>
                      <th className="px-3 py-2 text-left text-sm font-medium text-slate-500">Đơn vị</th>
                      <th className="px-3 py-2 text-left text-sm font-medium text-slate-500">Tiền tệ</th>
                      <th className="px-3 py-2 text-left text-sm font-medium text-slate-500">Độ chính xác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {measurementRows.map((row, index) => (
                      <tr key={row.key} className="border-t border-xevn-border">
                        <td className="px-3 py-2">{row.key}</td>
                        <td className="px-3 py-2">
                          <input
                            value={row.unit}
                            onChange={(e) => {
                              const next = measurementRows.map((r, i) =>
                                i === index ? { ...r, unit: e.target.value } : r,
                              );
                              setMeasurementRows(next);
                            }}
                            className="w-full rounded-input border border-xevn-border px-2 py-1"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            value={row.currency}
                            onChange={(e) => {
                              const next = measurementRows.map((r, i) =>
                                i === index ? { ...r, currency: e.target.value } : r,
                              );
                              setMeasurementRows(next);
                            }}
                            className="w-full rounded-input border border-xevn-border px-2 py-1"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            value={row.precision}
                            onChange={(e) => {
                              const next = measurementRows.map((r, i) =>
                                i === index ? { ...r, precision: Number(e.target.value) } : r,
                              );
                              setMeasurementRows(next);
                            }}
                            className="w-full rounded-input border border-xevn-border px-2 py-1"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}

          {activeSettingsMenu === 'pricing' ? (
            <div className={SETTINGS_SECTION_STACK}>
              <SettingSectionHeader title="Thiết lập hệ thống giá" subtitle="Bảng giá chỉnh sửa theo dòng" />
              <div className={`overflow-x-auto border border-xevn-border ${SETTINGS_RADIUS_CARD}`}>
                <table className={`min-w-full ${SETTINGS_CONTROL_TEXT}`}>
                  <thead className="bg-white/70 backdrop-blur-md">
                    <tr>
                      <th className="px-3 py-2 text-left text-sm font-medium text-slate-500">Mã giá</th>
                      <th className="px-3 py-2 text-left text-sm font-medium text-slate-500">Diễn giải</th>
                      <th className="px-3 py-2 text-left text-sm font-medium text-slate-500">Đơn giá</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pricingRows.map((row, index) => (
                      <tr key={row.priceCode} className="border-t border-xevn-border">
                        <td className="px-3 py-2">{row.priceCode}</td>
                        <td className="px-3 py-2">
                          <input
                            value={row.label}
                            onChange={(e) => {
                              const next = pricingRows.map((r, i) =>
                                i === index ? { ...r, label: e.target.value } : r,
                              );
                              setPricingRows(next);
                            }}
                            className="w-full rounded-input border border-xevn-border px-2 py-1"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            value={row.amount}
                            onChange={(e) => {
                              const next = pricingRows.map((r, i) =>
                                i === index ? { ...r, amount: Number(e.target.value) } : r,
                              );
                              setPricingRows(next);
                            }}
                            className="w-full rounded-input border border-xevn-border px-2 py-1"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}
        </div>

        {activeSettingsMenu === 'company_member_units' && companySettingsView === 'form' ? (
          <div className="sticky bottom-0 z-20 flex shrink-0 flex-col gap-2 border-t border-xevn-border bg-white/95 xevn-safe-inline py-3 shadow-soft backdrop-blur-md">
            {companySaveFeedback ? (
              <p
                className={`rounded-lg px-3 py-2 text-sm ${
                  companySaveFeedback.kind === 'error'
                    ? 'border border-red-200 bg-red-50 text-red-900'
                    : 'border border-emerald-200 bg-emerald-50 text-emerald-900'
                }`}
                role="alert"
              >
                {companySaveFeedback.text}
              </p>
            ) : null}
            <div className="flex justify-end">
              <button
                type="button"
                disabled={companySaving}
                onClick={() => {
                  void saveCompanySettings();
                }}
                className={`rounded-input bg-xevn-primary px-4 py-2 font-semibold text-white shadow-soft transition hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 ${SETTINGS_CONTROL_TEXT}`}
              >
                {companySaving ? 'Đang lưu…' : 'Lưu thay đổi'}
              </button>
            </div>
          </div>
        ) : null}
        {activeSettingsMenu === 'company_infrastructure' &&
        infrastructureView === 'list' &&
        foundationCategoryDetailId ? (
          <div className="sticky bottom-0 z-30 flex shrink-0 flex-wrap items-center justify-end gap-3 border-t border-xevn-border bg-white/90 xevn-safe-inline py-2 shadow-soft backdrop-blur-md">
            <button
              type="button"
              onClick={() => closeFoundationCategoryDetail()}
              className={`rounded-input border border-xevn-border bg-white px-4 py-2 font-semibold text-xevn-text shadow-soft transition hover:bg-slate-50 active:scale-95 ${SETTINGS_CONTROL_TEXT}`}
            >
              Quay lại
            </button>
            <button
              type="button"
              onClick={() => {
                saveFoundationCategory();
              }}
              className={`rounded-input bg-xevn-primary px-4 py-2 font-semibold text-white shadow-soft transition hover:opacity-90 active:scale-95 ${SETTINGS_CONTROL_TEXT}`}
            >
              Lưu danh mục nền
            </button>
          </div>
        ) : null}
        {activeSettingsMenu === 'company_dept_system' && deptSystemDetailId ? (
          <div className="sticky bottom-0 z-30 flex shrink-0 flex-wrap items-center justify-end gap-3 border-t border-xevn-border bg-white/90 xevn-safe-inline py-2 shadow-soft backdrop-blur-md">
            <button
              type="button"
              onClick={() => closeDeptSystemDetail()}
              className={`rounded-input border border-xevn-border bg-white px-4 py-2 font-semibold text-xevn-text shadow-soft transition hover:bg-slate-50 active:scale-95 ${SETTINGS_CONTROL_TEXT}`}
            >
              Quay lại
            </button>
            <button
              type="button"
              onClick={() => saveDeptSystemTemplate()}
              className={`rounded-input bg-xevn-primary px-4 py-2 font-semibold text-white shadow-soft transition hover:opacity-90 active:scale-95 ${SETTINGS_CONTROL_TEXT}`}
            >
              Lưu khung phòng/ban
            </button>
          </div>
        ) : null}
        {activeSettingsMenu === 'company_infrastructure' && infrastructureView === 'detail' ? (
          <div className="sticky bottom-0 z-30 flex shrink-0 flex-wrap items-center justify-end gap-3 border-t border-xevn-border bg-white/90 xevn-safe-inline py-2 shadow-soft backdrop-blur-md">
            <button
              type="button"
              onClick={() => openInfrastructureMaster()}
              className={`rounded-input border border-xevn-border bg-white px-4 py-2 font-semibold text-xevn-text shadow-soft transition hover:bg-slate-50 active:scale-95 ${SETTINGS_CONTROL_TEXT}`}
            >
              Quay lại
            </button>
            <button
              type="button"
              onClick={() => {
                void saveInfrastructureSite();
              }}
              className={`rounded-input bg-xevn-primary px-4 py-2 font-semibold text-white shadow-soft transition hover:opacity-90 active:scale-95 ${SETTINGS_CONTROL_TEXT}`}
            >
              Lưu hạ tầng
            </button>
          </div>
        ) : null}
        {activeSettingsMenu === 'workflow' && workflowView === 'detail' ? (
          <div className="sticky bottom-0 z-20 flex shrink-0 flex-wrap items-center justify-end gap-3 border-t border-xevn-border bg-white/80 xevn-safe-inline py-3 shadow-soft backdrop-blur-md">
            <button
              type="button"
              onClick={() => openWorkflowList()}
              className={`rounded-input border border-xevn-border bg-white px-4 py-2 font-semibold text-xevn-text shadow-soft transition hover:bg-slate-50 active:scale-95 ${SETTINGS_CONTROL_TEXT}`}
            >
              Quay lại
            </button>
            <button
              type="button"
              onClick={() => {
                void saveWorkflow();
              }}
              className={`rounded-input bg-xevn-primary px-4 py-2 font-semibold text-white shadow-soft transition hover:opacity-90 active:scale-95 ${SETTINGS_CONTROL_TEXT}`}
            >
              Lưu quy trình
            </button>
          </div>
        ) : null}
      </div>
      {activeSettingsMenu === 'workflow' &&
      workflowView === 'detail' &&
      workflowForm &&
      workflowCanvasSelectedStepId
        ? (() => {
            const step = workflowForm.steps.find((s) => s.id === workflowCanvasSelectedStepId);
            if (!step) return null;
            const rows = formatWorkflowDrawerDetails(
              step,
              (id) => WORKFLOW_HANDLER_ROLES.find((r) => r.id === id)?.label ?? id,
              (k) => WORKFLOW_STEP_ACTION_LABELS[k as WorkflowStepAction] ?? k,
              (id) => WORKFLOW_RELATED_MODULES.find((m) => m.id === id)?.label ?? id,
              (id) => workflowDestinationLabel(workflowForm, id),
            );
            return (
              <>
                <div
                  className="fixed inset-0 z-[75] bg-black/25 backdrop-blur-[2px]"
                  aria-hidden
                  onClick={() => setWorkflowCanvasSelectedStepId(null)}
                />
                <aside
                  className="fixed bottom-0 right-0 top-0 z-[80] flex w-full max-w-md flex-col border-l border-xevn-border bg-xevn-surface shadow-overlay sm:rounded-l-xl"
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="workflow-step-drawer-title"
                >
                  <div className="flex items-center justify-between gap-3 border-b border-xevn-border px-4 py-3">
                    <h3 id="workflow-step-drawer-title" className="text-lg font-bold text-xevn-text">
                      Chi tiết bước {step.order}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setWorkflowCanvasSelectedStepId(null)}
                      className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100"
                      aria-label="Đóng"
                    >
                      <X className="h-5 w-5" strokeWidth={RAIL_STROKE} />
                    </button>
                  </div>
                  <div className="xevn-safe-inline flex-1 overflow-y-auto px-4 py-4">
                    <dl className="space-y-4">
                      {rows.map((row) => (
                        <div key={row.k}>
                          <dt className={SETTINGS_LABEL_CLASS}>{row.k}</dt>
                          <dd className="mt-1 text-base font-normal text-xevn-text">{row.v}</dd>
                        </div>
                      ))}
                    </dl>
                    <button
                      type="button"
                      onClick={() => {
                        setWorkflowDetailTab('graph');
                        setWorkflowCanvasSelectedStepId(null);
                      }}
                      className="mt-6 w-full rounded-input border border-xevn-border py-2.5 text-[15px] font-medium text-xevn-primary transition hover:bg-xevn-primary/5"
                    >
                      Chỉnh sửa tại Cấu hình đồ thị
                    </button>
                  </div>
                </aside>
              </>
            );
          })()
        : null}
      {infrastructureFieldsConfigOpen ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4 py-8 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="infra-fields-config-title"
          onClick={() => setInfrastructureFieldsConfigOpen(false)}
        >
          <div
            className={`flex h-[80vh] w-full max-w-[104rem] flex-col overflow-hidden border border-xevn-border bg-xevn-surface shadow-overlay ${SETTINGS_RADIUS_CARD}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3 border-b border-xevn-border px-4 py-3">
              <h3 id="infra-fields-config-title" className={SETTINGS_PAGE_TITLE_CLASS}>
                Cấu hình mục thông tin hạ tầng cơ sở
              </h3>
              <button
                type="button"
                onClick={() => setInfrastructureFieldsConfigOpen(false)}
                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100"
                aria-label="Đóng"
              >
                <X className="h-5 w-5" strokeWidth={RAIL_STROKE} />
              </button>
            </div>

            <div className="hidden xevn-safe-inline flex-1 overflow-y-auto px-4 py-4">
              <div className={`mb-5 rounded-input border border-xevn-border bg-white p-4`}>
                <h4 className="mb-3 text-base font-bold text-xevn-text">Tùy chỉnh tên các khối</h4>
                <div className={SETTINGS_SECTION_GRID}>
                  <label className={`${SETTINGS_FIELD_SHELL} ${SETTINGS_COL.span4}`}>
                    <span className={SETTINGS_LABEL_CLASS}>Khối Thông tin chung</span>
                    <input
                      value={infraBlockTitleDraft.general}
                      onChange={(e) =>
                        setInfraBlockTitleDraft((s) => ({ ...s, general: e.target.value }))
                      }
                      className="w-full rounded-input border border-xevn-border bg-white px-3 py-2 text-base outline-none"
                    />
                  </label>
                  <label className={`${SETTINGS_FIELD_SHELL} ${SETTINGS_COL.span4}`}>
                    <span className={SETTINGS_LABEL_CLASS}>Khối Vị trí & liên hệ</span>
                    <input
                      value={infraBlockTitleDraft.location}
                      onChange={(e) =>
                        setInfraBlockTitleDraft((s) => ({ ...s, location: e.target.value }))
                      }
                      className="w-full rounded-input border border-xevn-border bg-white px-3 py-2 text-base outline-none"
                    />
                  </label>
                  <label className={`${SETTINGS_FIELD_SHELL} ${SETTINGS_COL.span4}`}>
                    <span className={SETTINGS_LABEL_CLASS}>Khối Năng lực</span>
                    <input
                      value={infraBlockTitleDraft.capacity}
                      onChange={(e) =>
                        setInfraBlockTitleDraft((s) => ({ ...s, capacity: e.target.value }))
                      }
                      className="w-full rounded-input border border-xevn-border bg-white px-3 py-2 text-base outline-none"
                    />
                  </label>
                </div>

                <div className="mt-4 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setInfrastructureFieldsConfigOpen(false)}
                    className="rounded-input border border-xevn-border bg-white px-4 py-2.5 text-[15px] font-medium text-xevn-text transition hover:bg-slate-50 active:scale-[0.99]"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const entityId = infrastructureFieldsConfigEntityId;
                      if (!entityId) return;
                      setInfrastructureBlockTitleOverridesByEntity((prev) => ({
                        ...prev,
                        [entityId]: {
                          general: infraBlockTitleDraft.general,
                          location: infraBlockTitleDraft.location,
                          capacity: infraBlockTitleDraft.capacity,
                        },
                      }));
                      setPublishMessage(`Đã cập nhật tên khối cho ${entityId}`);
                    }}
                    className="rounded-input bg-xevn-primary px-4 py-2.5 text-[15px] font-semibold text-white shadow-soft transition hover:opacity-90 active:scale-[0.99]"
                  >
                    Lưu tên khối
                  </button>
                </div>
              </div>

              <div className={`hidden mb-5 rounded-input border border-xevn-border bg-white p-4`}>
                <h4 className="mb-3 text-base font-bold text-xevn-text">Thêm khối custom (block)</h4>
                <div className="mb-4 rounded-lg border border-xevn-border bg-white/70 p-3">
                  {infraCustomBlocksForModalEntity.length ? (
                    <div className="space-y-3">
                      {infraCustomBlocksForModalEntity.map((b) => (
                        <div
                          key={b.id}
                          className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-xevn-border bg-white px-3 py-2"
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer.setData('text/plain', b.id);
                          }}
                          onDragOver={(e) => {
                            e.preventDefault();
                          }}
                          onDrop={(e) => {
                            e.preventDefault();
                            const entityId = infrastructureFieldsConfigEntityId;
                            if (!entityId) return;
                            const draggedId = e.dataTransfer.getData('text/plain');
                            if (!draggedId || draggedId === b.id) return;
                            setInfrastructureCustomBlocksByEntity((prev) => {
                              const list = (prev[entityId] ?? [])
                                .slice()
                                .sort((x, y) => x.order - y.order);
                              const fromIdx = list.findIndex((x) => x.id === draggedId);
                              const toIdx = list.findIndex((x) => x.id === b.id);
                              if (fromIdx < 0 || toIdx < 0) return prev;
                              const next = list.slice();
                              const [moved] = next.splice(fromIdx, 1);
                              next.splice(toIdx, 0, moved);
                              return {
                                ...prev,
                                [entityId]: next.map((x, idx) => ({ ...x, order: idx + 1 })),
                              };
                            });
                          }}
                        >
                          <div>
                            <p className="text-[15px] font-semibold text-xevn-text">{b.labelVi}</p>
                            <p className="text-xs text-slate-500">{b.blockCode} · order {b.order}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setInfraSelectedCustomBlockCode(b.blockCode)}
                              className="rounded-input border border-xevn-border bg-white px-3 py-2 text-[15px] font-medium text-xevn-text transition hover:bg-slate-50 active:scale-[0.99]"
                            >
                              Chi tiết
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const entityId = infrastructureFieldsConfigEntityId;
                                if (!entityId) return;
                                setInfrastructureCustomBlocksByEntity((prev) => ({
                                  ...prev,
                                  [entityId]: (prev[entityId] ?? []).map((x) =>
                                    x.id === b.id ? { ...x, visible: !x.visible } : x,
                                  ),
                                }));
                              }}
                              className="rounded-input border border-xevn-border bg-white px-3 py-2 text-[15px] font-medium text-xevn-text transition hover:bg-slate-50 active:scale-[0.99]"
                            >
                              {b.visible ? 'Ẩn' : 'Hiển thị'}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const entityId = infrastructureFieldsConfigEntityId;
                                if (!entityId) return;
                                setInfrastructureCustomBlocksByEntity((prev) => ({
                                  ...prev,
                                  [entityId]: (prev[entityId] ?? []).filter((x) => x.id !== b.id),
                                }));
                                // Xóa field custom gắn với block này để runtime không render “mồ côi”
                                setInfrastructureCustomFieldDefsByEntity((prev) => ({
                                  ...prev,
                                  [entityId]: (prev[entityId] ?? []).filter((f) => f.blockCode !== b.blockCode),
                                }));
                                setPublishMessage(`Đã xóa block ${b.blockCode}`);
                      setInfraSelectedCustomBlockCode(null);
                              }}
                              className="rounded-input bg-rose-50 px-3 py-2 text-[15px] font-semibold text-rose-700 transition hover:bg-rose-100 active:scale-[0.99]"
                            >
                              Xóa
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-600">Chưa có khối custom.</p>
                  )}
                </div>

                <div className={SETTINGS_SECTION_GRID}>
                  <label className={`${SETTINGS_FIELD_SHELL} ${SETTINGS_COL.span4}`}>
                    <span className={SETTINGS_LABEL_CLASS}>blockCode</span>
                    <input
                      value={infraCustomBlockDraft.blockCode}
                      onChange={(e) =>
                        setInfraCustomBlockDraft((s) => ({ ...s, blockCode: e.target.value }))
                      }
                      placeholder="VD: infra_hn_block_extra"
                      className="w-full rounded-input border border-xevn-border bg-white px-3 py-2 text-base outline-none"
                    />
                  </label>
                  <label className={`${SETTINGS_FIELD_SHELL} ${SETTINGS_COL.span4}`}>
                    <span className={SETTINGS_LABEL_CLASS}>Label tiếng Việt</span>
                    <input
                      value={infraCustomBlockDraft.labelVi}
                      onChange={(e) =>
                        setInfraCustomBlockDraft((s) => ({ ...s, labelVi: e.target.value }))
                      }
                      placeholder="VD: Khối thông tin đặc thù HN"
                      className="w-full rounded-input border border-xevn-border bg-white px-3 py-2 text-base outline-none"
                    />
                  </label>
                  <label className={`${SETTINGS_FIELD_SHELL} ${SETTINGS_COL.span4}`}>
                    <span className={SETTINGS_LABEL_CLASS}>Order</span>
                    <input
                      type="number"
                      value={infraCustomBlockDraft.order}
                      onChange={(e) =>
                        setInfraCustomBlockDraft((s) => ({ ...s, order: Number(e.target.value) || 0 }))
                      }
                      className="w-full rounded-input border border-xevn-border bg-white px-3 py-2 text-base outline-none"
                    />
                  </label>
                  <label className={`${SETTINGS_FIELD_SHELL} ${SETTINGS_COL.span12}`}>
                    <span className={SETTINGS_LABEL_CLASS}>Trạng thái</span>
                    <div className="mt-1 flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={infraCustomBlockDraft.visible}
                        onChange={(e) =>
                          setInfraCustomBlockDraft((s) => ({ ...s, visible: e.target.checked }))
                        }
                        className="h-4 w-4 rounded border-slate-300 text-xevn-primary accent-xevn-primary"
                      />
                      <span className="text-base text-slate-600">
                        {infraCustomBlockDraft.visible ? 'Hiển thị' : 'Ẩn'}
                      </span>
                    </div>
                  </label>
                </div>

                <div className="mt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      const entityId = infrastructureFieldsConfigEntityId;
                      if (!entityId) return;
                      const blockCode = infraCustomBlockDraft.blockCode.trim();
                      const labelVi = infraCustomBlockDraft.labelVi.trim();
                      if (!blockCode || !labelVi) {
                        setPublishMessage('Thiếu `blockCode` hoặc `labelVi`.');
                        return;
                      }
                      const baseBlocks: InfrastructureBaseBlockCode[] = ['general', 'location', 'capacity'];
                      if (baseBlocks.includes(blockCode as InfrastructureBaseBlockCode)) {
                        setPublishMessage('Không được dùng blockCode trùng khối mặc định (general/location/capacity).');
                        return;
                      }
                      const list = infrastructureCustomBlocksByEntity[entityId] ?? [];
                      if (list.some((x) => x.blockCode === blockCode)) {
                        setPublishMessage('blockCode custom đã tồn tại trong pháp nhân này.');
                        return;
                      }
                      const newBlock: InfrastructureCustomBlockDef = {
                        id: `cbn-${Date.now()}`,
                        blockCode,
                        labelVi,
                        visible: infraCustomBlockDraft.visible,
                        order: infraCustomBlockDraft.order,
                      };
                      setInfrastructureCustomBlocksByEntity((prev) => ({
                        ...prev,
                        [entityId]: [...(prev[entityId] ?? []), newBlock],
                      }));
                      setInfraCustomBlockDraft({ blockCode: '', labelVi: '', visible: true, order: 10 });
                      setPublishMessage(`Đã thêm block ${blockCode} cho ${entityId}`);
                      setInfraSelectedCustomBlockCode(blockCode);
                    }}
                    className="rounded-input bg-xevn-primary px-4 py-2.5 text-[15px] font-semibold text-white shadow-soft transition hover:opacity-90 active:scale-[0.99]"
                  >
                    Thêm block
                  </button>
                </div>
              </div>

              <div className={`hidden mb-5 rounded-input border border-xevn-border bg-white p-4`}>
                <h4 className="mb-3 text-base font-bold text-xevn-text">Thêm field custom (inputType do bạn chọn)</h4>
                <div className={SETTINGS_SECTION_GRID}>
                  <label className={`${SETTINGS_FIELD_SHELL} ${SETTINGS_COL.span4}`}>
                    <span className={SETTINGS_LABEL_CLASS}>Field code</span>
                    <input
                      value={infraCustomFieldDraft.fieldCode}
                      onChange={(e) =>
                        setInfraCustomFieldDraft((s) => ({ ...s, fieldCode: e.target.value }))
                      }
                      placeholder="VD: infra_hn_special_note"
                      className="w-full rounded-input border border-xevn-border bg-white px-3 py-2 text-base outline-none"
                    />
                  </label>
                  <label className={`${SETTINGS_FIELD_SHELL} ${SETTINGS_COL.span4}`}>
                    <span className={SETTINGS_LABEL_CLASS}>Label tiếng Việt</span>
                    <input
                      value={infraCustomFieldDraft.labelVi}
                      onChange={(e) =>
                        setInfraCustomFieldDraft((s) => ({ ...s, labelVi: e.target.value }))
                      }
                      placeholder="VD: Ghi chú đặc thù"
                      className="w-full rounded-input border border-xevn-border bg-white px-3 py-2 text-base outline-none"
                    />
                  </label>
                  <label className={`${SETTINGS_FIELD_SHELL} ${SETTINGS_COL.span4}`}>
                    <span className={SETTINGS_LABEL_CLASS}>Data type</span>
                    <select
                      value={infraCustomFieldDraft.dataType}
                      onChange={(e) =>
                        setInfraCustomFieldDraft((s) => ({
                          ...s,
                          dataType: e.target.value as EmployeeMetadataDataType,
                        }))
                      }
                      className="w-full rounded-input border border-xevn-border bg-white px-3 py-2 text-base outline-none"
                    >
                      {EMPLOYEE_METADATA_DATA_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className={`${SETTINGS_FIELD_SHELL} ${SETTINGS_COL.span4}`}>
                    <span className={SETTINGS_LABEL_CLASS}>Thuộc khối</span>
                    <select
                      value={infraCustomFieldDraft.blockCode}
                      onChange={(e) =>
                        setInfraCustomFieldDraft((s) => ({
                          ...s,
                          blockCode: e.target.value as InfrastructureCustomBlockCode,
                        }))
                      }
                      className="w-full rounded-input border border-xevn-border bg-white px-3 py-2 text-base outline-none"
                    >
                      <option value="general">general - Khối Thông tin chung</option>
                      <option value="location">location - Khối Vị trí & liên hệ</option>
                      <option value="capacity">capacity - Khối Năng lực</option>
                      {infraCustomBlocksForModalEntity.map((b) => (
                        <option key={b.id} value={b.blockCode}>
                          {b.blockCode} — {b.labelVi}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className={`${SETTINGS_FIELD_SHELL} ${SETTINGS_COL.span4}`}>
                    <span className={SETTINGS_LABEL_CLASS}>Chế độ hiển thị</span>
                    <div className="mt-1 flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={infraCustomFieldDraft.visible}
                        onChange={(e) =>
                          setInfraCustomFieldDraft((s) => ({ ...s, visible: e.target.checked }))
                        }
                        className="h-4 w-4 rounded border-slate-300 text-xevn-primary accent-xevn-primary"
                      />
                      <span className="text-base text-slate-600">
                        {infraCustomFieldDraft.visible ? 'Hiển thị' : 'Ẩn'}
                      </span>
                    </div>
                  </label>

                  {infraCustomFieldDraft.dataType === 'select' ? (
                    <label className={`${SETTINGS_FIELD_SHELL} ${SETTINGS_COL.span12}`}>
                      <span className={SETTINGS_LABEL_CLASS}>Options select (CSV)</span>
                      <textarea
                        value={infraCustomFieldDraft.selectConfig}
                        onChange={(e) =>
                          setInfraCustomFieldDraft((s) => ({
                            ...s,
                            selectConfig: e.target.value,
                          }))
                        }
                        className="w-full resize-y rounded-input border border-xevn-border bg-white px-3 py-2 text-base outline-none"
                        rows={3}
                      />
                    </label>
                  ) : null}
                </div>

                <div className="mt-4 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setInfraCustomFieldDraft({
                        fieldCode: '',
                        labelVi: '',
                        dataType: 'text',
                        blockCode: 'capacity',
                        visible: true,
                        selectConfig: '',
                      });
                    }}
                    className="rounded-input border border-xevn-border bg-white px-4 py-2.5 text-[15px] font-medium text-xevn-text transition hover:bg-slate-50 active:scale-[0.99]"
                  >
                    Làm mới
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const entityId = infrastructureFieldsConfigEntityId;
                      if (!entityId) return;
                      const fieldCode = infraCustomFieldDraft.fieldCode.trim();
                      const labelVi = infraCustomFieldDraft.labelVi.trim();
                      if (!fieldCode || !labelVi) {
                        setPublishMessage('Thiếu `fieldCode` hoặc `labelVi`.');
                        return;
                      }
                      if (infraCustomFieldDraft.dataType === 'select' && !infraCustomFieldDraft.selectConfig.trim()) {
                        setPublishMessage('Select dataType yêu cầu `selectConfig` (CSV).');
                        return;
                      }

                      const baseCodes = [
                        'name',
                        'siteCode',
                        'facilityType',
                        'operatingEntityId',
                        'status',
                        'gpsCoords',
                        'addressDetail',
                        'hotline',
                        'directManager',
                        'leaseLegalEndDate',
                        'areaSqm',
                        'palletOrVehicleMax',
                        'ownerLegalEntityId',
                        'capacitySummary',
                      ];
                      if (baseCodes.includes(fieldCode)) {
                        setPublishMessage('fieldCode custom không được trùng fieldCode hệ thống.');
                        return;
                      }

                      const list = infrastructureCustomFieldDefsByEntity[entityId] ?? [];
                      if (list.some((x) => x.fieldCode === fieldCode)) {
                        setPublishMessage('fieldCode custom đã tồn tại trong pháp nhân này.');
                        return;
                      }

                      const newDef: InfrastructureCustomFieldDef = {
                        id: `cfn-${Date.now()}`,
                        fieldCode,
                        labelVi,
                        dataType: infraCustomFieldDraft.dataType,
                        blockCode: infraCustomFieldDraft.blockCode,
                        visible: infraCustomFieldDraft.visible,
                        selectConfig: infraCustomFieldDraft.selectConfig,
                      };

                      setInfrastructureCustomFieldDefsByEntity((prev) => ({
                        ...prev,
                        [entityId]: [...(prev[entityId] ?? []), newDef],
                      }));

                      setInfraCustomFieldDraft({
                        fieldCode: '',
                        labelVi: '',
                        dataType: 'text',
                        blockCode: 'capacity',
                        visible: true,
                        selectConfig: '',
                      });

                      setPublishMessage(`Đã thêm field custom ${fieldCode} cho ${entityId}`);
                    }}
                    className="rounded-input bg-xevn-primary px-4 py-2.5 text-[15px] font-semibold text-white shadow-soft transition hover:opacity-90 active:scale-[0.99]"
                  >
                    Thêm field
                  </button>
                </div>
              </div>

              <div className={`hidden rounded-input border border-xevn-border bg-white p-4`}>
                <h4 className="mb-3 text-base font-bold text-xevn-text">Danh sách field custom</h4>
                {(() => {
                  const entityId = infrastructureFieldsConfigEntityId;
                  if (!entityId) return <p className="text-slate-600">Chọn pháp nhân để xem.</p>;
                  const list = infrastructureCustomFieldDefsByEntity[entityId] ?? [];
                  if (!list.length) return <p className="text-slate-600">Chưa có field custom nào.</p>;
                  return (
                    <div className="space-y-3">
                      {list.map((f) => (
                        <div
                          key={f.id}
                          className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-xevn-border bg-white/70 px-3 py-2"
                        >
                          <div className="min-w-[14rem]">
                            <p className="text-[15px] font-semibold text-xevn-text">{f.labelVi}</p>
                            <p className="text-xs text-slate-500">
                              `{f.fieldCode}` · {f.dataType} · {f.blockCode} · {f.visible ? 'visible' : 'hidden'}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setInfrastructureCustomFieldDefsByEntity((prev) => ({
                                  ...prev,
                                  [entityId]: (prev[entityId] ?? []).map((x) =>
                                    x.id === f.id ? { ...x, visible: !x.visible } : x,
                                  ),
                                }));
                              }}
                              className="rounded-input border border-xevn-border bg-white px-3 py-2 text-[15px] font-medium text-xevn-text transition hover:bg-slate-50 active:scale-[0.99]"
                            >
                              {f.visible ? 'Ẩn' : 'Hiển thị'}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setInfrastructureCustomFieldDefsByEntity((prev) => ({
                                  ...prev,
                                  [entityId]: (prev[entityId] ?? []).filter((x) => x.id !== f.id),
                                }));
                                setPublishMessage(`Đã xóa field ${f.fieldCode}`);
                              }}
                              className="rounded-input bg-rose-50 px-3 py-2 text-[15px] font-semibold text-rose-700 transition hover:bg-rose-100 active:scale-[0.99]"
                            >
                              Xóa
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
              <div className="xevn-safe-inline w-1/4 min-w-[22rem] overflow-y-auto border-r border-xevn-border bg-white/40 px-4 py-4 backdrop-blur-md">
                <div>
                  <p className="mb-2 text-sm font-semibold text-xevn-text">Khối thông tin</p>
                  {(() => {
                    const selectedCode = infraSelectedCustomBlockCode ?? 'general';
                    const baseBlocks: Array<{
                      blockCode: InfrastructureBaseBlockCode;
                      label: string;
                    }> = [
                      {
                        blockCode: 'general',
                        label: infraBlockTitleDraft.general || 'Khối Thông tin chung',
                      },
                      {
                        blockCode: 'location',
                        label: infraBlockTitleDraft.location || 'Khối Vị trí & liên hệ',
                      },
                      {
                        blockCode: 'capacity',
                        label: infraBlockTitleDraft.capacity || 'Khối Năng lực',
                      },
                    ];

                    const entityId = infrastructureFieldsConfigEntityId;
                    const customBlocks = infraCustomBlocksForModalEntity;

                    return (
                      <div className="space-y-2">
                        {baseBlocks.map((b) => {
                          const active = selectedCode === b.blockCode;
                          return (
                            <div
                              key={b.blockCode}
                              className={`flex items-center justify-between gap-2 rounded-input border border-xevn-border bg-white px-3 py-2 shadow-soft transition ${
                                active ? 'ring-2 ring-xevn-accent/30' : ''
                              }`}
                            >
                              <button
                                type="button"
                                className="min-w-0 flex-1 text-left"
                                onClick={() => setInfraSelectedCustomBlockCode(b.blockCode)}
                              >
                                <p className="truncate text-[15px] font-semibold text-xevn-text">{b.label}</p>
                              </button>
                              <button
                                type="button"
                                disabled
                                className="rounded-input bg-white px-2 py-1 text-[13px] font-medium text-slate-400 opacity-60"
                              >
                                Xóa
                              </button>
                            </div>
                          );
                        })}

                        {customBlocks.length ? (
                          <div className="pt-1">
                            {customBlocks.map((b) => {
                              const active = selectedCode === b.blockCode;
                              const dragging = infraBlockNavigatorDraggingId === b.id;
                              return (
                                <div
                                  key={b.id}
                                  className={`flex items-center justify-between gap-2 rounded-input border border-xevn-border bg-white px-3 py-2 shadow-soft transition ${
                                    active ? 'ring-2 ring-xevn-accent/30' : ''
                                  } ${dragging ? 'opacity-80' : ''}`}
                                  draggable
                                  onDragStart={(e) => {
                                    setInfraBlockNavigatorDraggingId(b.id);
                                    e.dataTransfer.setData('text/plain', b.id);
                                  }}
                                  onDragOver={(e) => e.preventDefault()}
                                  onDrop={(e) => {
                                    e.preventDefault();
                                    if (!entityId) return;
                                    const draggedId = e.dataTransfer.getData('text/plain');
                                    if (!draggedId || draggedId === b.id) return;
                                    setInfrastructureCustomBlocksByEntity((prev) => {
                                      const list = (prev[entityId] ?? []).slice().sort((x, y) => x.order - y.order);
                                      const fromIdx = list.findIndex((x) => x.id === draggedId);
                                      const toIdx = list.findIndex((x) => x.id === b.id);
                                      if (fromIdx < 0 || toIdx < 0) return prev;
                                      const next = list.slice();
                                      const [moved] = next.splice(fromIdx, 1);
                                      const insertIdx = fromIdx < toIdx ? toIdx - 1 : toIdx;
                                      next.splice(insertIdx, 0, moved);
                                      return { ...prev, [entityId]: next.map((x, idx) => ({ ...x, order: idx + 1 })) };
                                    });
                                    setInfraBlockNavigatorDraggingId(null);
                                  }}
                                  onDragEnd={() => setInfraBlockNavigatorDraggingId(null)}
                                >
                                  <button
                                    type="button"
                                    className="min-w-0 flex-1 text-left"
                                    onClick={() => setInfraSelectedCustomBlockCode(b.blockCode)}
                                  >
                                    <p className="truncate text-[15px] font-semibold text-xevn-text">{b.labelVi}</p>
                                    <p className="mt-0.5 truncate text-xs text-slate-500">
                                      {b.blockCode} · order {b.order}
                                    </p>
                                  </button>
                                  <div className="flex items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() => setInfraSelectedCustomBlockCode(b.blockCode)}
                                      className="rounded-input bg-white px-2 py-1 text-[13px] font-medium text-xevn-primary transition hover:bg-slate-50 active:scale-[0.99]"
                                    >
                                      Chi tiết
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (!entityId) return;
                                        setInfrastructureCustomBlocksByEntity((prev) => ({
                                          ...prev,
                                          [entityId]: (prev[entityId] ?? []).filter((x) => x.id !== b.id),
                                        }));
                                        setInfrastructureCustomFieldDefsByEntity((prev) => ({
                                          ...prev,
                                          [entityId]: (prev[entityId] ?? []).filter((f) => f.blockCode !== b.blockCode),
                                        }));
                                        setInfraSelectedCustomBlockCode('general');
                                        setPublishMessage(`Đã xóa block ${b.blockCode}`);
                                      }}
                                      className="rounded-input bg-rose-50 px-2 py-1 text-[13px] font-semibold text-rose-700 transition hover:bg-rose-100 active:scale-[0.99]"
                                    >
                                      Xóa
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="text-sm text-slate-500 pt-1">Chưa có custom block.</p>
                        )}
                      </div>
                    );
                  })()}
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      const entityId = infrastructureFieldsConfigEntityId;
                      const list = entityId ? infrastructureCustomBlocksByEntity[entityId] ?? [] : [];
                      const nextOrder = list.length
                        ? Math.max(...list.map((x) => x.order || 0)) + 1
                        : 10;
                      setInfraCustomBlockDraft({
                        blockCode: '',
                        labelVi: '',
                        visible: true,
                        order: nextOrder,
                      });
                      setInfraLeftAddBlockOpen(true);
                    }}
                    className="w-full rounded-input bg-white px-3 py-2 text-left text-[15px] font-semibold text-xevn-primary shadow-soft transition hover:bg-slate-50 active:scale-[0.99]"
                  >
                    + Thêm khối
                  </button>

                  {infraLeftAddBlockOpen ? (
                    <div className="mt-3 rounded-input border border-xevn-border bg-white p-3 shadow-soft">
                      <h5 className="mb-3 text-sm font-bold text-xevn-text">Thêm khối custom</h5>
                      <div className={SETTINGS_SECTION_GRID}>
                        <label className={`${SETTINGS_FIELD_SHELL} ${SETTINGS_COL.span12}`}>
                          <span className={`${SETTINGS_LABEL_CLASS} whitespace-nowrap`}>Label tiếng Việt</span>
                          <input
                            value={infraCustomBlockDraft.labelVi}
                            onChange={(e) => {
                              const nextLabel = e.target.value;
                              const nextCode = makeInfraCustomBlockCodeFromLabel(nextLabel.trim());
                              setInfraCustomBlockDraft((s) => ({
                                ...s,
                                labelVi: nextLabel,
                                blockCode: nextCode,
                              }));
                            }}
                            placeholder="VD: Khối thông tin đặc thù HN"
                            className="w-full min-w-0 rounded-input border border-xevn-border bg-white px-3 py-2 text-base outline-none"
                          />
                        </label>
                        <label className={`${SETTINGS_FIELD_SHELL} ${SETTINGS_COL.span12}`}>
                          <span className={`${SETTINGS_LABEL_CLASS} whitespace-nowrap`}>Trạng thái</span>
                          <div className="mt-1 flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={infraCustomBlockDraft.visible}
                              onChange={(e) => setInfraCustomBlockDraft((s) => ({ ...s, visible: e.target.checked }))}
                              className="h-4 w-4 rounded border-slate-300 text-xevn-primary accent-xevn-primary"
                            />
                            <span className="text-base text-slate-600">{infraCustomBlockDraft.visible ? 'Hiển thị' : 'Ẩn'}</span>
                          </div>
                        </label>
                      </div>

                      <div className="mt-3 flex justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setInfraLeftAddBlockOpen(false);
                            setInfraCustomBlockDraft({ blockCode: '', labelVi: '', visible: true, order: 10 });
                          }}
                          className="rounded-input border border-xevn-border bg-white px-3 py-2 text-[14px] font-medium text-xevn-text transition hover:bg-slate-50 active:scale-[0.99]"
                        >
                          Hủy
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const entityId = infrastructureFieldsConfigEntityId;
                            if (!entityId) {
                              setPublishMessage('Chọn pháp nhân trước khi thêm khối.');
                              return;
                            }

                            const labelVi = infraCustomBlockDraft.labelVi.trim();
                            if (!labelVi) {
                              setPublishMessage('Thiếu `Label tiếng Việt`.');
                              return;
                            }

                            const list = infrastructureCustomBlocksByEntity[entityId] ?? [];

                            const baseBlocks: InfrastructureBaseBlockCode[] = ['general', 'location', 'capacity'];
                            let blockCode = makeInfraCustomBlockCodeFromLabel(labelVi);
                            const existingCodes = new Set(list.map((x) => x.blockCode));

                            // Ensure code uniqueness within the same legal entity.
                            if (existingCodes.has(blockCode) || baseBlocks.includes(blockCode as InfrastructureBaseBlockCode)) {
                              let i = 1;
                              const original = blockCode;
                              while (existingCodes.has(blockCode) || baseBlocks.includes(blockCode as InfrastructureBaseBlockCode)) {
                                blockCode = `${original}_${i++}`;
                              }
                            }

                            const newBlock: InfrastructureCustomBlockDef = {
                              id: `cbn-${Date.now()}`,
                              blockCode,
                              labelVi,
                              visible: infraCustomBlockDraft.visible,
                              order: infraCustomBlockDraft.order,
                            };

                            setInfrastructureCustomBlocksByEntity((prev) => ({
                              ...prev,
                              [entityId]: [...(prev[entityId] ?? []), newBlock],
                            }));

                            setInfraSelectedCustomBlockCode(blockCode);
                            setInfraLeftAddBlockOpen(false);
                            setInfraCustomBlockDraft({ blockCode: '', labelVi: '', visible: true, order: 10 });
                            setPublishMessage(`Đã thêm block ${blockCode} cho ${entityId}`);
                          }}
                          className="rounded-input bg-xevn-primary px-3 py-2 text-[14px] font-semibold text-white shadow-soft transition hover:opacity-90 active:scale-[0.99]"
                        >
                          Submit
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-4">
                <div className="mb-4 flex h-10 items-center justify-between gap-3 border-b border-xevn-border pb-3">
                  {(() => {
                    const selectedCode = infraSelectedCustomBlockCode ?? 'general';
                    const baseTitle =
                      selectedCode === 'general'
                        ? infraBlockTitleDraft.general || 'Khối Thông tin chung'
                        : selectedCode === 'location'
                          ? infraBlockTitleDraft.location || 'Khối Vị trí & liên hệ'
                          : selectedCode === 'capacity'
                            ? infraBlockTitleDraft.capacity || 'Khối Năng lực'
                            : '';
                    const customBlock = infraCustomBlocksForModalEntity.find((b) => b.blockCode === selectedCode);
                    const selectedTitle = customBlock?.labelVi ?? baseTitle ?? selectedCode;
                    return (
                      <>
                        <h4 className="text-base font-bold text-xevn-text">{selectedTitle}</h4>
                        <span className="text-sm text-slate-500">{selectedCode}</span>
                      </>
                    );
                  })()}
                </div>

                <div className="mb-5 rounded-input border border-xevn-border bg-white p-4">
                  {(() => {
                    const entityId = infrastructureFieldsConfigEntityId;
                    const selectedCode = infraSelectedCustomBlockCode ?? 'general';
                    const isBase =
                      selectedCode === 'general' ||
                      selectedCode === 'location' ||
                      selectedCode === 'capacity';

                    if (isBase) {
                      const titleValue =
                        selectedCode === 'general'
                          ? infraBlockTitleDraft.general
                          : selectedCode === 'location'
                            ? infraBlockTitleDraft.location
                            : infraBlockTitleDraft.capacity;
                      return (
                        <>
                          <h4 className="mb-3 text-base font-bold text-xevn-text">Cấu hình khối</h4>
                          <div className={SETTINGS_SECTION_GRID}>
                            <label className={`${SETTINGS_FIELD_SHELL} ${SETTINGS_COL.span12}`}>
                              <span className={SETTINGS_LABEL_CLASS}>Tên khối</span>
                              <input
                                value={titleValue}
                                onChange={(e) => {
                                  const v = e.target.value;
                                  setInfraBlockTitleDraft((s) => ({
                                    ...s,
                                    ...(selectedCode === 'general'
                                      ? { general: v }
                                      : selectedCode === 'location'
                                        ? { location: v }
                                        : { capacity: v }),
                                  }));
                                }}
                                className="w-full rounded-input border border-xevn-border bg-white px-3 py-2 text-base outline-none"
                              />
                            </label>
                          </div>
                          <div className="mt-4 flex justify-end gap-3">
                            <button
                              type="button"
                              onClick={() => {
                                if (!entityId) return;
                                setInfrastructureBlockTitleOverridesByEntity((prev) => ({
                                  ...prev,
                                  [entityId]: {
                                    general: infraBlockTitleDraft.general,
                                    location: infraBlockTitleDraft.location,
                                    capacity: infraBlockTitleDraft.capacity,
                                  },
                                }));
                                setPublishMessage(`Đã cập nhật tên khối cho ${entityId}`);
                              }}
                              disabled={!entityId}
                              className="rounded-input bg-xevn-primary px-4 py-2.5 text-[15px] font-semibold text-white shadow-soft transition hover:opacity-90 active:scale-[0.99] disabled:opacity-50"
                            >
                              Lưu
                            </button>
                          </div>
                        </>
                      );
                    }

                    const customBlock = infraCustomBlocksForModalEntity.find((b) => b.blockCode === selectedCode);
                    if (!customBlock) {
                      return (
                        <div className="text-sm text-slate-600">
                          Không tìm thấy khối custom: <span className="font-semibold">{selectedCode}</span>
                        </div>
                      );
                    }

                    return (
                      <>
                        <h4 className="mb-3 text-base font-bold text-xevn-text">Cấu hình khối custom</h4>
                        <div className={SETTINGS_SECTION_GRID}>
                          <label className={`${SETTINGS_FIELD_SHELL} ${SETTINGS_COL.span8}`}>
                            <span className={SETTINGS_LABEL_CLASS}>Label tiếng Việt</span>
                            <input
                              value={customBlock.labelVi}
                              onChange={(e) => {
                                if (!entityId) return;
                                const v = e.target.value;
                                setInfrastructureCustomBlocksByEntity((prev) => ({
                                  ...prev,
                                  [entityId]: (prev[entityId] ?? []).map((x) =>
                                    x.blockCode === selectedCode ? { ...x, labelVi: v } : x,
                                  ),
                                }));
                              }}
                              className="w-full rounded-input border border-xevn-border bg-white px-3 py-2 text-base outline-none"
                            />
                          </label>
                          <label className={`${SETTINGS_FIELD_SHELL} ${SETTINGS_COL.span4}`}>
                            <span className={SETTINGS_LABEL_CLASS}>Hiển thị</span>
                            <div className="mt-1 flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={customBlock.visible}
                                onChange={(e) => {
                                  if (!entityId) return;
                                  const checked = e.target.checked;
                                  setInfrastructureCustomBlocksByEntity((prev) => ({
                                    ...prev,
                                    [entityId]: (prev[entityId] ?? []).map((x) =>
                                      x.blockCode === selectedCode ? { ...x, visible: checked } : x,
                                    ),
                                  }));
                                }}
                                className="h-4 w-4 rounded border-slate-300 text-xevn-primary accent-xevn-primary"
                              />
                              <span className="text-base text-slate-600">{customBlock.visible ? 'Hiển thị' : 'Ẩn'}</span>
                            </div>
                          </label>
                        </div>
                        <div className="mt-4 flex justify-end">
                          <button
                            type="button"
                            onClick={() => {
                              if (!entityId) return;
                              setInfrastructureCustomBlocksByEntity((prev) => ({
                                ...prev,
                                [entityId]: (prev[entityId] ?? []).filter((x) => x.id !== customBlock.id),
                              }));
                              setInfrastructureCustomFieldDefsByEntity((prev) => ({
                                ...prev,
                                [entityId]: (prev[entityId] ?? []).filter((f) => f.blockCode !== selectedCode),
                              }));
                              setInfraSelectedCustomBlockCode('general');
                              setPublishMessage(`Đã xóa block ${selectedCode}`);
                            }}
                            className="rounded-input bg-rose-50 px-4 py-2.5 text-[15px] font-semibold text-rose-700 transition hover:bg-rose-100 active:scale-[0.99]"
                          >
                            Xóa khối
                          </button>
                        </div>
                      </>
                    );
                  })()}
                </div>

                <div className="rounded-input border border-xevn-border bg-white p-4">
                  <h4 className="mb-3 text-base font-bold text-xevn-text">Thêm field custom (inputType do bạn chọn)</h4>
                  <div className={SETTINGS_SECTION_GRID}>
                    <label className={`${SETTINGS_FIELD_SHELL} ${SETTINGS_COL.span4}`}>
                      <span className={SETTINGS_LABEL_CLASS}>Field code (tự động)</span>
                      <input
                        value={infraCustomFieldDraft.fieldCode}
                        readOnly
                        placeholder="(tự sinh từ label)"
                        className="w-full cursor-not-allowed rounded-input border border-xevn-border bg-slate-50 px-3 py-2 text-base outline-none"
                      />
                    </label>

                    <label className={`${SETTINGS_FIELD_SHELL} ${SETTINGS_COL.span4}`}>
                      <span className={SETTINGS_LABEL_CLASS}>Label tiếng Việt</span>
                      <input
                        value={infraCustomFieldDraft.labelVi}
                        onChange={(e) => {
                          const nextLabel = e.target.value;
                          const nextBlockCode = (infraSelectedCustomBlockCode ?? 'general') as InfrastructureCustomBlockCode;
                          const nextFieldCode = nextLabel.trim()
                            ? makeInfraCustomFieldCode(INFRA_CUSTOM_FIELD_FORM_CODE, nextBlockCode, nextLabel)
                            : '';
                          setInfraCustomFieldDraft((s) => ({
                            ...s,
                            labelVi: nextLabel,
                            blockCode: nextBlockCode,
                            fieldCode: nextFieldCode,
                          }));
                        }}
                        placeholder="VD: Ghi chú đặc thù"
                        className="w-full rounded-input border border-xevn-border bg-white px-3 py-2 text-base outline-none"
                      />
                    </label>

                    <label className={`${SETTINGS_FIELD_SHELL} ${SETTINGS_COL.span4}`}>
                      <span className={SETTINGS_LABEL_CLASS}>Data type</span>
                      <select
                        value={infraCustomFieldDraft.dataType}
                        onChange={(e) =>
                          setInfraCustomFieldDraft((s) => ({
                            ...s,
                            dataType: e.target.value as EmployeeMetadataDataType,
                          }))
                        }
                        className="w-full rounded-input border border-xevn-border bg-white px-3 py-2 text-base outline-none"
                      >
                        {EMPLOYEE_METADATA_DATA_TYPES.map((t) => (
                          <option key={t.value} value={t.value}>
                            {t.label}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className={`${SETTINGS_FIELD_SHELL} ${SETTINGS_COL.span4}`}>
                      <span className={SETTINGS_LABEL_CLASS}>Thuộc khối</span>
                      <div className="mt-1 text-base font-medium text-xevn-text">{infraCustomFieldDraft.blockCode}</div>
                    </label>

                    <label className={`${SETTINGS_FIELD_SHELL} ${SETTINGS_COL.span4}`}>
                      <span className={SETTINGS_LABEL_CLASS}>Chế độ hiển thị</span>
                      <div className="mt-1 flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={infraCustomFieldDraft.visible}
                          onChange={(e) =>
                            setInfraCustomFieldDraft((s) => ({ ...s, visible: e.target.checked }))
                          }
                          className="h-4 w-4 rounded border-slate-300 text-xevn-primary accent-xevn-primary"
                        />
                        <span className="text-base text-slate-600">
                          {infraCustomFieldDraft.visible ? 'Hiển thị' : 'Ẩn'}
                        </span>
                      </div>
                    </label>

                    {infraCustomFieldDraft.dataType === 'select' ? (
                      <label className={`${SETTINGS_FIELD_SHELL} ${SETTINGS_COL.span12}`}>
                        <span className={SETTINGS_LABEL_CLASS}>Options select (CSV)</span>
                        <textarea
                          value={infraCustomFieldDraft.selectConfig}
                          onChange={(e) =>
                            setInfraCustomFieldDraft((s) => ({
                              ...s,
                              selectConfig: e.target.value,
                            }))
                          }
                          placeholder="VD: Văn phòng, Kho bãi, Trạm dừng nghỉ, Cây xăng, Bãi xe liên kết"
                          className="w-full resize-y rounded-input border border-xevn-border bg-white px-3 py-2 text-base outline-none"
                          rows={3}
                        />
                      </label>
                    ) : null}
                  </div>

                  <div className="mt-4 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        const nextBlockCode = (infraSelectedCustomBlockCode ?? 'general') as InfrastructureCustomBlockCode;
                        setInfraCustomFieldDraft({
                          fieldCode: '',
                          labelVi: '',
                          dataType: 'text',
                          blockCode: nextBlockCode,
                          visible: true,
                          selectConfig: '',
                        });
                      }}
                      className="rounded-input border border-xevn-border bg-white px-4 py-2.5 text-[15px] font-medium text-xevn-text transition hover:bg-slate-50 active:scale-[0.99]"
                    >
                      Làm mới
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const entityId = infrastructureFieldsConfigEntityId;
                        if (!entityId) return;

                        const labelVi = infraCustomFieldDraft.labelVi.trim();
                        if (!labelVi) {
                          setPublishMessage('Thiếu `Label tiếng Việt`.');
                          return;
                        }

                        const blockCode = infraCustomFieldDraft.blockCode;
                        const fieldCode = makeInfraCustomFieldCode(INFRA_CUSTOM_FIELD_FORM_CODE, blockCode, labelVi);

                        if (infraCustomFieldDraft.dataType === 'select' && !infraCustomFieldDraft.selectConfig.trim()) {
                          setPublishMessage('Select dataType yêu cầu `selectConfig` (CSV).');
                          return;
                        }

                        const list = infrastructureCustomFieldDefsByEntity[entityId] ?? [];
                        if (list.some((x) => x.fieldCode === fieldCode)) {
                          setPublishMessage('fieldCode custom đã tồn tại trong pháp nhân này.');
                          return;
                        }

                        const newDef: InfrastructureCustomFieldDef = {
                          id: `cfn-${Date.now()}`,
                          fieldCode,
                          labelVi,
                          dataType: infraCustomFieldDraft.dataType,
                          blockCode,
                          visible: infraCustomFieldDraft.visible,
                          selectConfig: infraCustomFieldDraft.selectConfig,
                        };

                        setInfrastructureCustomFieldDefsByEntity((prev) => ({
                          ...prev,
                          [entityId]: [...(prev[entityId] ?? []), newDef],
                        }));

                        const nextBlockCode = (infraSelectedCustomBlockCode ?? 'general') as InfrastructureCustomBlockCode;
                        setInfraCustomFieldDraft({
                          fieldCode: '',
                          labelVi: '',
                          dataType: 'text',
                          blockCode: nextBlockCode,
                          visible: true,
                          selectConfig: '',
                        });

                        setPublishMessage(`Đã thêm field custom ${fieldCode} cho ${entityId}`);
                      }}
                      className="rounded-input bg-xevn-primary px-4 py-2.5 text-[15px] font-semibold text-white shadow-soft transition hover:opacity-90 active:scale-[0.99]"
                    >
                      Thêm field
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-xevn-border px-4 py-3">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setInfrastructureFieldsConfigOpen(false)}
                  className="w-full rounded-input border border-xevn-border bg-white py-2.5 text-[15px] font-medium text-xevn-text transition hover:bg-slate-50 active:scale-[0.99]"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    const entityId = infrastructureFieldsConfigEntityId;
                    if (!entityId) {
                      setPublishMessage('Chọn pháp nhân trước khi xác nhận.');
                      return;
                    }

                    const payload = {
                      legalEntityId: entityId,
                      blockTitleOverrides: infrastructureBlockTitleOverridesByEntity[entityId] ?? {},
                      customBlocks: infrastructureCustomBlocksByEntity[entityId] ?? [],
                      customFieldDefs: infrastructureCustomFieldDefsByEntity[entityId] ?? [],
                      // audit-ish: send current UI draft snapshot too
                      blockTitleDraft: infraBlockTitleDraft,
                    };

                    await publishVersionChange('company_infrastructure', payload);
                    await saveInfrastructureSettingsToDb({
                      blockTitleOverridesByEntity: infrastructureBlockTitleOverridesByEntity,
                      customBlocksByEntity: infrastructureCustomBlocksByEntity,
                      customFieldDefsByEntity: infrastructureCustomFieldDefsByEntity,
                    });
                    setInfrastructureFieldsConfigOpen(false);
                  }}
                  className="w-full rounded-input bg-xevn-primary py-2.5 text-[15px] font-semibold text-white shadow-soft transition hover:opacity-90 active:scale-[0.99]"
                >
                  Xác nhận (áp dụng)
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
      {groupHrFieldsConfigOpen && groupHrDetailEntityId ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4 py-8 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="group-hr-fields-config-title"
          onClick={() => closeGroupHrFieldsConfig()}
        >
          <div
            className={`flex h-[80vh] w-full max-w-[104rem] flex-col overflow-hidden border border-xevn-border bg-xevn-surface shadow-overlay ${SETTINGS_RADIUS_CARD}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3 border-b border-xevn-border px-4 py-3">
              <h3 id="group-hr-fields-config-title" className={SETTINGS_PAGE_TITLE_CLASS}>
                Cấu hình mục thông tin hồ sơ nhân sự
                {(() => {
                  const ent = settingsLegalEntities.find((e) => e.id === groupHrDetailEntityId);
                  return ent ? (
                    <span className="mt-1 block text-sm font-normal text-slate-600">
                      {companyFullName(ent)}
                    </span>
                  ) : null;
                })()}
              </h3>
              <button
                type="button"
                onClick={() => closeGroupHrFieldsConfig()}
                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100"
                aria-label="Đóng"
              >
                <X className="h-5 w-5" strokeWidth={RAIL_STROKE} />
              </button>
            </div>

            <div className="flex flex-1 overflow-hidden">
              <div className="xevn-safe-inline w-1/4 min-w-[22rem] overflow-y-auto border-r border-xevn-border bg-white/40 px-4 py-4 backdrop-blur-md">
                <p className="mb-2 text-sm font-semibold text-xevn-text">Khối thông tin</p>
                {(() => {
                  const selectedCode = groupHrSelectedCustomBlockCode ?? 'general';
                  const entityId = groupHrDetailEntityId;
                  const tenantId = settingsLegalEntities.find((e) => e.id === entityId)?.tenantId;
                  const usePresetBlocks = Boolean(getGroupHrCatalogGroups(tenantId));
                  const catalogBlocks = (groupHrCustomBlocksByEntity[entityId] ?? [])
                    .slice()
                    .sort((a, b) => a.order - b.order);
                  const titleOv = groupHrBlockTitleOverridesByEntity[entityId] ?? {};
                  const hiddenBase = groupHrHiddenPresetBlocksByEntity[entityId] ?? [];
                  const baseBlocks: Array<{ blockCode: InfrastructureBaseBlockCode; label: string }> =
                    usePresetBlocks
                      ? []
                      : (
                          [
                            { blockCode: 'general' as const, label: titleOv.general ?? groupHrBlockTitleDraft.general },
                            { blockCode: 'location' as const, label: titleOv.location ?? groupHrBlockTitleDraft.location },
                            { blockCode: 'capacity' as const, label: titleOv.capacity ?? groupHrBlockTitleDraft.capacity },
                          ] as Array<{ blockCode: InfrastructureBaseBlockCode; label: string }>
                        ).filter((b) => !hiddenBase.includes(b.blockCode));
                  const presetBlocks = usePresetBlocks ? catalogBlocks : [];
                  const extraBlocks = usePresetBlocks ? [] : catalogBlocks;
                  const allDefs = groupHrCustomFieldDefsByEntity[entityId ?? ''] ?? [];
                  return (
                    <div className="space-y-2">
                      {presetBlocks.map((b) => {
                        const fieldCount = allDefs.filter((f) => f.blockCode === b.blockCode).length;
                        return (
                        <div key={b.id} className={`flex items-center justify-between gap-2 rounded-input border border-xevn-border bg-white px-3 py-2 shadow-soft transition ${selectedCode === b.blockCode ? 'ring-2 ring-xevn-accent/30' : ''}`}>
                          <button type="button" className="min-w-0 flex-1 text-left" onClick={() => setGroupHrSelectedCustomBlockCode(b.blockCode)}>
                            <p className="truncate text-[15px] font-semibold text-xevn-text">{b.labelVi}</p>
                            <p className="text-xs text-slate-500">{fieldCount} trường</p>
                          </button>
                          <button type="button" disabled className="rounded-input bg-white px-2 py-1 text-[13px] font-medium text-slate-400 opacity-60">Xóa</button>
                        </div>
                      );})}
                      {baseBlocks.map((b) => (
                        <div key={b.blockCode} className={`flex items-center justify-between gap-2 rounded-input border border-xevn-border bg-white px-3 py-2 shadow-soft transition ${selectedCode === b.blockCode ? 'ring-2 ring-xevn-accent/30' : ''}`}>
                          <button type="button" className="min-w-0 flex-1 text-left" onClick={() => setGroupHrSelectedCustomBlockCode(b.blockCode)}>
                            <p className="truncate text-[15px] font-semibold text-xevn-text">{b.label}</p>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setGroupHrHiddenPresetBlocksByEntity((prev) => ({
                                ...prev,
                                [entityId]: [...(prev[entityId] ?? []), b.blockCode],
                              }));
                            }}
                            className="rounded-input bg-rose-50 px-2 py-1 text-[13px] font-semibold text-rose-700 transition hover:bg-rose-100 active:scale-[0.99]"
                          >
                            Xóa
                          </button>
                        </div>
                      ))}
                      {extraBlocks.map((b) => (
                        <div key={b.id} className={`flex items-center justify-between gap-2 rounded-input border border-xevn-border bg-white px-3 py-2 shadow-soft transition ${selectedCode === b.blockCode ? 'ring-2 ring-xevn-accent/30' : ''}`}>
                          <button type="button" className="min-w-0 flex-1 text-left" onClick={() => setGroupHrSelectedCustomBlockCode(b.blockCode)}>
                            <p className="truncate text-[15px] font-semibold text-xevn-text">{b.labelVi}</p>
                            <p className="mt-0.5 truncate text-xs text-slate-500">{b.blockCode}</p>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setGroupHrCustomBlocksByEntity((prev) => ({
                                ...prev,
                                [groupHrDetailEntityId]: (prev[groupHrDetailEntityId] ?? []).filter((x) => x.id !== b.id),
                              }));
                            }}
                            className="rounded-input bg-rose-50 px-2 py-1 text-[13px] font-semibold text-rose-700 transition hover:bg-rose-100 active:scale-[0.99]"
                          >
                            Xóa
                          </button>
                        </div>
                      ))}
                    </div>
                  );
                })()}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setGroupHrLeftAddBlockOpen(true)}
                    className="w-full rounded-input bg-white px-3 py-2 text-left text-[15px] font-semibold text-xevn-primary shadow-soft transition hover:bg-slate-50 active:scale-[0.99]"
                  >
                    + Thêm khối
                  </button>
                  {groupHrLeftAddBlockOpen ? (
                    <div className="mt-3 rounded-input border border-xevn-border bg-white p-3 shadow-soft">
                      <h5 className="mb-3 text-sm font-bold text-xevn-text">Thêm khối custom</h5>
                      <input
                        value={groupHrCustomBlockDraft.labelVi}
                        onChange={(e) =>
                          setGroupHrCustomBlockDraft((s) => ({
                            ...s,
                            labelVi: e.target.value,
                            blockCode: makeInfraCustomBlockCodeFromLabel(e.target.value),
                          }))
                        }
                        placeholder="VD: Khối hồ sơ chuyên môn"
                        className="w-full rounded-input border border-xevn-border bg-white px-3 py-2 text-base outline-none"
                      />
                      <div className="mt-3 flex justify-end gap-2">
                        <button type="button" onClick={() => setGroupHrLeftAddBlockOpen(false)} className="rounded-input border border-xevn-border bg-white px-3 py-2 text-[14px] font-medium text-xevn-text">Hủy</button>
                        <button
                          type="button"
                          onClick={() => {
                            const labelVi = groupHrCustomBlockDraft.labelVi.trim();
                            if (!labelVi) return;
                            setGroupHrCustomBlocksByEntity((prev) => ({
                              ...prev,
                              [groupHrDetailEntityId]: [
                                ...(prev[groupHrDetailEntityId] ?? []),
                                {
                                  id: `ghr-bl-${Date.now()}`,
                                  blockCode: groupHrCustomBlockDraft.blockCode || makeInfraCustomBlockCodeFromLabel(labelVi),
                                  labelVi,
                                  visible: true,
                                  order: (prev[groupHrDetailEntityId] ?? []).length + 10,
                                },
                              ],
                            }));
                            setGroupHrLeftAddBlockOpen(false);
                            setGroupHrCustomBlockDraft({ blockCode: '', labelVi: '', visible: true, order: 10 });
                          }}
                          className="rounded-input bg-xevn-primary px-3 py-2 text-[14px] font-semibold text-white"
                        >
                          Submit
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-4">
                <div className="mb-4 flex h-10 items-center justify-between gap-3 border-b border-xevn-border pb-3">
                  <h4 className="text-base font-bold text-xevn-text">
                    {groupHrDetailEntityId
                      ? resolveGroupHrBlockLabel(
                          groupHrSelectedCustomBlockCode ?? 'general',
                          groupHrDetailEntityId,
                          Boolean(
                            getGroupHrCatalogGroups(
                              settingsLegalEntities.find((e) => e.id === groupHrDetailEntityId)
                                ?.tenantId,
                            ),
                          ),
                        )
                      : 'Khối thông tin'}
                  </h4>
                  <button
                    type="button"
                    onClick={() => {
                      if (!groupHrDetailEntityId) return;
                      setGroupHrBlockTitleOverridesByEntity((prev) => ({
                        ...prev,
                        [groupHrDetailEntityId]: { ...groupHrBlockTitleDraft },
                      }));
                      setPublishMessage(
                        'Đã lưu tên khối (phiên hiện tại). Dùng Xác nhận (áp dụng) để đồng bộ HRM.',
                      );
                    }}
                    className="rounded-input bg-xevn-primary px-4 py-2 text-[15px] font-semibold text-white"
                  >
                    Lưu
                  </button>
                </div>
                <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
                  <input
                    value={groupHrBlockTitleDraft.general}
                    onChange={(e) =>
                      setGroupHrBlockTitleDraft((s) => ({ ...s, general: e.target.value }))
                    }
                    className="min-w-0 w-full border border-xevn-border bg-white px-3 py-2 text-base outline-none focus:ring-2 focus:ring-xevn-accent rounded-input"
                    aria-label="Tên khối thông tin chung"
                  />
                  <input
                    value={groupHrBlockTitleDraft.location}
                    onChange={(e) =>
                      setGroupHrBlockTitleDraft((s) => ({ ...s, location: e.target.value }))
                    }
                    className="min-w-0 w-full border border-xevn-border bg-white px-3 py-2 text-base outline-none focus:ring-2 focus:ring-xevn-accent rounded-input"
                    aria-label="Tên khối thông tin cá nhân"
                  />
                  <input
                    value={groupHrBlockTitleDraft.capacity}
                    onChange={(e) =>
                      setGroupHrBlockTitleDraft((s) => ({ ...s, capacity: e.target.value }))
                    }
                    className="min-w-0 w-full border border-xevn-border bg-white px-3 py-2 text-base outline-none focus:ring-2 focus:ring-xevn-accent rounded-input"
                    aria-label="Tên khối thông tin công việc"
                  />
                </div>

                {groupHrDetailEntityId ? (() => {
                  const entityId = groupHrDetailEntityId;
                  const blockCode = groupHrSelectedCustomBlockCode ?? 'personal';
                  const rows = (groupHrCustomFieldDefsByEntity[entityId] ?? [])
                    .filter((f) => f.blockCode === blockCode)
                    .sort((a, b) => a.labelVi.localeCompare(b.labelVi, 'vi'));
                  return (
                    <div className="mb-4 rounded-input border border-xevn-border bg-white/95 p-4 shadow-sm">
                      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                        <h4 className="text-base font-bold text-xevn-text">
                          Danh mục trường trong khối ({rows.length})
                        </h4>
                        <p className="text-xs text-slate-500">
                          Đồng bộ HRM qua nút Xác nhận (áp dụng) bên dưới
                        </p>
                      </div>
                      {rows.length === 0 ? (
                        <p className="text-sm text-slate-500">Chưa có trường trong khối này.</p>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className={`min-w-[720px] w-full border-collapse text-left ${SETTINGS_CONTROL_TEXT}`}>
                            <thead>
                              <tr className="border-b border-xevn-border bg-slate-50 text-[14px] font-medium text-slate-500">
                                <th className="px-2 py-2">Tên trường</th>
                                <th className="px-2 py-2">Kiểu dữ liệu</th>
                                <th className="px-2 py-2">Hiển thị</th>
                                <th className="px-2 py-2 text-right">Thao tác</th>
                              </tr>
                            </thead>
                            <tbody>
                              {rows.map((row) => (
                                <tr key={row.id} className="border-b border-xevn-border/70">
                                  <td className="px-2 py-2">
                                    <input
                                      value={row.labelVi}
                                      onChange={(e) =>
                                        updateGroupHrFieldDef(entityId, row.id, {
                                          labelVi: e.target.value,
                                        })
                                      }
                                      className={deptInputClass}
                                      aria-label="Tên trường"
                                    />
                                  </td>
                                  <td className="px-2 py-2">
                                    <select
                                      value={row.dataType}
                                      onChange={(e) =>
                                        updateGroupHrFieldDef(entityId, row.id, {
                                          dataType: e.target.value as EmployeeMetadataDataType,
                                        })
                                      }
                                      className={deptSelectClass}
                                    >
                                      {EMPLOYEE_METADATA_DATA_TYPES.map((opt) => (
                                        <option key={opt.value} value={opt.value}>
                                          {opt.label}
                                        </option>
                                      ))}
                                    </select>
                                  </td>
                                  <td className="px-2 py-2">
                                    <label className="inline-flex items-center gap-2">
                                      <input
                                        type="checkbox"
                                        checked={row.visible}
                                        onChange={(e) =>
                                          updateGroupHrFieldDef(entityId, row.id, {
                                            visible: e.target.checked,
                                          })
                                        }
                                        className="h-4 w-4 rounded border-slate-300 text-xevn-primary accent-xevn-primary"
                                      />
                                      <span className="text-sm text-slate-600">
                                        {row.visible ? 'Có' : 'Ẩn'}
                                      </span>
                                    </label>
                                  </td>
                                  <td className="px-2 py-2 text-right">
                                    <button
                                      type="button"
                                      onClick={() => deleteGroupHrFieldDef(entityId, row.id)}
                                      className="rounded-lg border border-rose-300 bg-rose-50 p-2 text-rose-700"
                                      title="Xóa trường"
                                    >
                                      <X className="h-4 w-4" strokeWidth={RAIL_STROKE} />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  );
                })() : null}
                <div className="rounded-input border border-xevn-border bg-white p-4">
                  <h4 className="mb-3 text-base font-bold text-xevn-text">Thêm field custom (inputType do bạn chọn)</h4>
                  <div className={SETTINGS_SECTION_GRID}>
                    <label className={`${SETTINGS_FIELD_SHELL} ${SETTINGS_COL.span4}`}>
                      <span className={SETTINGS_LABEL_CLASS}>Field code (tự động)</span>
                      <input value={groupHrCustomFieldDraft.fieldCode} readOnly className="w-full cursor-not-allowed rounded-input border border-xevn-border bg-slate-50 px-3 py-2 text-base outline-none" />
                    </label>
                    <label className={`${SETTINGS_FIELD_SHELL} ${SETTINGS_COL.span4}`}>
                      <span className={SETTINGS_LABEL_CLASS}>Label tiếng Việt</span>
                      <input
                        value={groupHrCustomFieldDraft.labelVi}
                        onChange={(e) =>
                          setGroupHrCustomFieldDraft((s) => ({
                            ...s,
                            labelVi: e.target.value,
                            blockCode: (groupHrSelectedCustomBlockCode ?? 'general') as InfrastructureCustomBlockCode,
                            fieldCode: e.target.value.trim()
                              ? makeInfraCustomFieldCode(
                                  GROUP_HR_CUSTOM_FIELD_FORM_CODE,
                                  (groupHrSelectedCustomBlockCode ?? 'general') as InfrastructureCustomBlockCode,
                                  e.target.value,
                                )
                              : '',
                          }))
                        }
                        placeholder="VD: Ghi chú đặc thù"
                        className="w-full rounded-input border border-xevn-border bg-white px-3 py-2 text-base outline-none"
                      />
                    </label>
                    <label className={`${SETTINGS_FIELD_SHELL} ${SETTINGS_COL.span4}`}>
                      <span className={SETTINGS_LABEL_CLASS}>Data type</span>
                      <select value={groupHrCustomFieldDraft.dataType} onChange={(e) => setGroupHrCustomFieldDraft((s) => ({ ...s, dataType: e.target.value as EmployeeMetadataDataType }))} className="w-full rounded-input border border-xevn-border bg-white px-3 py-2 text-base outline-none">
                        {EMPLOYEE_METADATA_DATA_TYPES.map((t) => (
                          <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                      </select>
                    </label>
                    <label className={`${SETTINGS_FIELD_SHELL} ${SETTINGS_COL.span4}`}>
                      <span className={SETTINGS_LABEL_CLASS}>Thuộc khối</span>
                      <div className="mt-1 text-base font-medium text-xevn-text">
                        {groupHrDetailEntityId
                          ? resolveGroupHrBlockLabel(
                              groupHrCustomFieldDraft.blockCode,
                              groupHrDetailEntityId,
                              Boolean(
                                getGroupHrCatalogGroups(
                                  settingsLegalEntities.find((e) => e.id === groupHrDetailEntityId)
                                    ?.tenantId,
                                ),
                              ),
                            )
                          : groupHrCustomFieldDraft.blockCode}
                      </div>
                    </label>
                    <label className={`${SETTINGS_FIELD_SHELL} ${SETTINGS_COL.span4}`}>
                      <span className={SETTINGS_LABEL_CLASS}>Chế độ hiển thị</span>
                      <div className="mt-1 flex items-center gap-2">
                        <input type="checkbox" checked={groupHrCustomFieldDraft.visible} onChange={(e) => setGroupHrCustomFieldDraft((s) => ({ ...s, visible: e.target.checked }))} className="h-4 w-4 rounded border-slate-300 text-xevn-primary accent-xevn-primary" />
                        <span className="text-base text-slate-600">{groupHrCustomFieldDraft.visible ? 'Hiển thị' : 'Ẩn'}</span>
                      </div>
                    </label>
                    {groupHrCustomFieldDraft.dataType === 'select' ? (
                      <label className={`${SETTINGS_FIELD_SHELL} ${SETTINGS_COL.span12}`}>
                        <span className={SETTINGS_LABEL_CLASS}>Options select (CSV)</span>
                        <textarea value={groupHrCustomFieldDraft.selectConfig} onChange={(e) => setGroupHrCustomFieldDraft((s) => ({ ...s, selectConfig: e.target.value }))} placeholder="VD: Chính thức, Thử việc, CTV" className="w-full resize-y rounded-input border border-xevn-border bg-white px-3 py-2 text-base outline-none" rows={3} />
                      </label>
                    ) : null}
                  </div>
                  <div className="mt-4 flex justify-end gap-3">
                    <button type="button" onClick={() => setGroupHrCustomFieldDraft({ fieldCode: '', labelVi: '', dataType: 'text', blockCode: (groupHrSelectedCustomBlockCode ?? 'general') as InfrastructureCustomBlockCode, visible: true, selectConfig: '' })} className="rounded-input border border-xevn-border bg-white px-4 py-2.5 text-[15px] font-medium text-xevn-text transition hover:bg-slate-50 active:scale-[0.99]">Làm mới</button>
                    <button
                      type="button"
                      onClick={() => {
                        const labelVi = groupHrCustomFieldDraft.labelVi.trim();
                        if (!labelVi) return;
                        const blockCode = (groupHrSelectedCustomBlockCode ?? 'general') as InfrastructureCustomBlockCode;
                        const fieldCode = makeInfraCustomFieldCode(GROUP_HR_CUSTOM_FIELD_FORM_CODE, blockCode, labelVi);
                        setGroupHrCustomFieldDefsByEntity((prev) => ({
                          ...prev,
                          [groupHrDetailEntityId]: [
                            ...(prev[groupHrDetailEntityId] ?? []),
                            {
                              id: `ghr-f-${Date.now()}`,
                              fieldCode,
                              labelVi,
                              dataType: groupHrCustomFieldDraft.dataType,
                              blockCode,
                              visible: groupHrCustomFieldDraft.visible,
                              selectConfig: groupHrCustomFieldDraft.selectConfig,
                              hrmCatalogKey: resolveHrmCatalogKey(
                                blockCode,
                                fieldCode,
                              ),
                            },
                          ],
                        }));
                      }}
                      className="rounded-input bg-xevn-primary px-4 py-2.5 text-[15px] font-semibold text-white shadow-soft transition hover:opacity-90 active:scale-[0.99]"
                    >
                      Thêm field
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="border-t border-xevn-border px-4 py-3">
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => setGroupHrFieldsConfigOpen(false)} className="w-full rounded-input border border-xevn-border bg-white py-2.5 text-[15px] font-medium text-xevn-text transition hover:bg-slate-50 active:scale-[0.99]">Hủy</button>
                <button
                  type="button"
                  disabled={groupHrSyncBusy}
                  onClick={() => {
                    void (async () => {
                      const defs = groupHrCustomFieldDefsByEntity[groupHrDetailEntityId] ?? [];
                      if (!defs.some((d) => d.visible)) {
                        setPublishMessage('Chưa có trường hiển thị để đồng bộ — thêm field hoặc bật Hiển thị.');
                        return;
                      }
                      setGroupHrSyncBusy(true);
                      setEmployeeMetadataByEntity((prev) => ({
                        ...prev,
                        [groupHrDetailEntityId]: toEmployeeMetadataRows(defs),
                      }));
                      try {
                        await syncGroupHrFieldsToHrmCatalogs(groupHrDetailEntityId, defs);
                        const entity = settingsLegalEntities.find((x) => x.id === groupHrDetailEntityId);
                        const refreshed = await fetchGroupHrCatalogFieldDefs(entity?.tenantId, null);
                        if (refreshed.length) {
                          setGroupHrCustomFieldDefsByEntity((prev) => ({
                            ...prev,
                            [groupHrDetailEntityId]: refreshed,
                          }));
                          setEmployeeMetadataByEntity((prev) => ({
                            ...prev,
                            [groupHrDetailEntityId]: toEmployeeMetadataRows(refreshed),
                          }));
                        }
                        closeGroupHrFieldsConfig();
                        setPublishMessage(
                          'Đã áp dụng và đồng bộ cấu hình khối & trường sang HRM DB (immediate). Form NV HRM sẽ đọc lại catalog khi mở.',
                        );
                      } catch (error) {
                        const detail =
                          error instanceof Error ? error.message : 'Lỗi không xác định';
                        setPublishMessage(
                          `Đồng bộ HRM thất bại: ${detail}. Kiểm tra \`pnpm dev:hrm-api\` (28001) và VITE_INTERNAL_API_KEY.`,
                        );
                      } finally {
                        setGroupHrSyncBusy(false);
                      }
                    })();
                  }}
                  className="w-full rounded-input bg-xevn-primary py-2.5 text-[15px] font-semibold text-white shadow-soft transition hover:opacity-90 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {groupHrSyncBusy ? 'Đang đồng bộ…' : 'Xác nhận (áp dụng)'}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
      <input
        ref={legalDocFileInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.xls,.xlsx"
        className="hidden"
        onChange={(e) => void onLegalDocFilePicked(e.target.files?.[0])}
      />
      <WorkflowTaskDetailDrawer
        open={inboxDetailOpen}
        task={inboxDetailTask}
        detail={inboxDetailPayload}
        loading={inboxDetailLoading}
        detailLoadFailed={inboxDetailLoadFailed}
        busy={inboxDrawerBusy}
        inboxFromApi={inboxTasksSource === 'api'}
        onClose={closeInboxTaskDetail}
        onComplete={(outcome) => void completeInboxFromDrawer(outcome)}
      />
      {employeeMetadataPreviewOpen ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4 py-8 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="employee-metadata-preview-title"
          onClick={() => setEmployeeMetadataPreviewOpen(false)}
        >
          <div
            className={`flex max-h-[min(90dvh,880px)] w-full max-w-lg flex-col border border-xevn-border bg-xevn-surface shadow-overlay ${SETTINGS_RADIUS_CARD}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3 border-b border-xevn-border px-4 py-3">
              <h3 id="employee-metadata-preview-title" className={SETTINGS_PAGE_TITLE_CLASS}>
                Xem trước biểu mẫu nhân sự
              </h3>
              <button
                type="button"
                onClick={() => setEmployeeMetadataPreviewOpen(false)}
                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100"
                aria-label="Đóng"
              >
                <X className="h-5 w-5" strokeWidth={RAIL_STROKE} />
              </button>
            </div>
            <div className="xevn-safe-inline flex-1 overflow-y-auto px-4 py-4">
              <p className="mb-4 text-sm text-slate-600">
                Giao diện nhập liệu mẫu theo các trường đã định nghĩa cho pháp nhân hiện tại.
              </p>
              <div className={SETTINGS_SECTION_GRID}>
                {legalEntityMetadataRows.map((field) => {
                  const value = employeeMetadataPreviewValues[field.id] ?? '';
                  const setVal = (v: string) =>
                    setEmployeeMetadataPreviewValues((prev) => ({ ...prev, [field.id]: v }));
                  const opts =
                    field.dataType === 'select'
                      ? parseMetadataSelectOptions(field.selectConfig)
                      : [];
                  return (
                    <label
                      key={field.id}
                      className={`${SETTINGS_FIELD_SHELL} w-full ${SETTINGS_COL.span12}`}
                    >
                      <span className={SETTINGS_LABEL_CLASS}>
                        {field.fieldName.trim() || '(Chưa đặt tên)'}
                      </span>
                      {field.dataType === 'text' ? (
                        <input
                          value={value}
                          onChange={(e) => setVal(e.target.value)}
                          className={deptInputClass}
                        />
                      ) : null}
                      {field.dataType === 'number' ? (
                        <input
                          type="number"
                          value={value}
                          onChange={(e) => setVal(e.target.value)}
                          className={deptInputClass}
                        />
                      ) : null}
                      {field.dataType === 'date' ? (
                        <input
                          type="date"
                          value={value}
                          onChange={(e) => setVal(e.target.value)}
                          className={deptInputClass}
                        />
                      ) : null}
                      {field.dataType === 'phone' ? (
                        <input
                          type="tel"
                          value={value}
                          onChange={(e) => setVal(e.target.value)}
                          className={deptInputClass}
                        />
                      ) : null}
                      {field.dataType === 'email' ? (
                        <input
                          type="email"
                          value={value}
                          onChange={(e) => setVal(e.target.value)}
                          className={deptInputClass}
                        />
                      ) : null}
                      {field.dataType === 'select' ? (
                        <div className="relative min-w-0">
                          <select
                            value={value}
                            onChange={(e) => setVal(e.target.value)}
                            className={deptSelectClass}
                          >
                            <option value="">— Chọn —</option>
                            {opts.map((o) => (
                              <option key={o} value={o}>
                                {o}
                              </option>
                            ))}
                          </select>
                          <ChevronDown
                            className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
                            strokeWidth={RAIL_STROKE}
                            aria-hidden
                          />
                        </div>
                      ) : null}
                    </label>
                  );
                })}
              </div>
            </div>
            <div className="border-t border-xevn-border px-4 py-3">
              <button
                type="button"
                onClick={() => setEmployeeMetadataPreviewOpen(false)}
                className="w-full rounded-input border border-xevn-border bg-white py-2.5 text-[15px] font-medium text-xevn-text transition hover:bg-slate-50 active:scale-[0.99]"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      ) : null}
      </>
    );
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-xevn-background text-xevn-text">
      <header className="shrink-0 z-20 border-b border-xevn-border bg-xevn-surface/80 shadow-soft backdrop-blur-md">
        <div className={`flex w-full flex-wrap items-center justify-between gap-4 ${XEVN_VIEWPORT_PADDING} py-4`}>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-xevn-primary text-white shadow-soft">
              <LayoutDashboard className="h-6 w-6" strokeWidth={2} />
            </div>
            <div>
              <h1 className="page-title text-xl font-semibold tracking-tight text-xevn-text">
                X-BOS Unified Portal
              </h1>
              <p className="body-text text-sm text-xevn-textSecondary">Command Center</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex rounded-xl border border-xevn-border bg-xevn-surface p-1 shadow-sm">
              {(
                [
                  { id: 'bod' as const, label: 'BOD', Icon: Building2 },
                  { id: 'manager' as const, label: 'Quản lý', Icon: CircleUser },
                  { id: 'employee' as const, label: 'Nhân viên', Icon: User },
                ] as const
              ).map(({ id, label, Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    setLoading(true);
                    setPersona(id);
                    setSelectedModule('all');
                    navigate('/command-center');
                  }}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition active:scale-95 ${
                    persona === id
                      ? 'bg-xevn-primary text-white shadow-sm'
                      : 'text-xevn-textSecondary hover:bg-slate-100'
                  }`}
                >
                  <Icon className="h-4 w-4" strokeWidth={RAIL_STROKE} />
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
        {workspaceMetaFailed && !allowMockFallback() ? (
          <ApiLoadBanner
            loadFailed
            message="Không tải được dữ liệu tổng quan. Vui lòng thử tải lại trang."
          />
        ) : null}
      </header>

      <WorkspaceLayout
        className="min-h-0 flex-1"
        layoutMode={selectedModule === 'hrm' ? 'hrm-embed' : 'default'}
        hrmModuleRailCollapsed={hrmModuleRailCollapsed}
        mainClassName={selectedModule === 'hrm' ? '!overflow-hidden' : undefined}
        secondarySidebar={
          selectedModule === SYSTEM_SETTINGS
            ? renderSettingsSidebar()
            : selectedModule === 'hrm'
              ? <HrmCollapsibleSidebar />
              : undefined
        }
        rail={
          <CommandCenterModuleRail
            railItems={railItems}
            selectedModule={selectedModule}
            setSelectedModule={setSelectedModule}
            hrmModuleRailExpanded={!hrmModuleRailCollapsed}
            onHrmModuleRailToggle={() => {
              setHrmModuleRailCollapsed((prev) => {
                const next = !prev;
                writeHrmModuleRailCollapsed(next);
                return next;
              });
            }}
          />
        }
      >
        {selectedModule === SYSTEM_SETTINGS ? (
          loading ? (
            <div className="flex min-h-[min(480px,70vh)] flex-1 flex-col gap-6 py-4">
              <SkeletonBlock className={`h-12 shrink-0 ${SETTINGS_RADIUS_INPUT}`} />
              <SkeletonBlock className={`min-h-0 flex-1 ${SETTINGS_RADIUS_CARD}`} />
            </div>
          ) : (
            renderSettingsWorkspacePanel()
          )
        ) : selectedModule === 'hrm' ? (
          loading ? (
            <div className="flex min-h-[min(480px,70vh)] flex-1 flex-col gap-6 py-4">
              <SkeletonBlock className={`h-12 shrink-0 ${SETTINGS_RADIUS_INPUT}`} />
              <SkeletonBlock className={`min-h-0 flex-1 ${SETTINGS_RADIUS_CARD}`} />
            </div>
          ) : (
            <div className="flex min-h-0 min-w-0 flex-1 flex-col">
              <HrmApiHealthBanner />
              <Outlet />
            </div>
          )
        ) : (
        <div className={`min-w-0 flex-1 ${SETTINGS_SECTION_STACK}`}>
          {loading ? (
            <div className={SETTINGS_SECTION_STACK}>
              <div className="grid gap-6 sm:grid-cols-3">
                <SkeletonBlock className="h-28" />
                <SkeletonBlock className="h-28" />
                <SkeletonBlock className="h-28" />
              </div>
              <SkeletonBlock className="h-48" />
            </div>
          ) : (
            <>
              {/* Widgets */}
              <section className="grid gap-6 sm:grid-cols-3">
                <div className={`border border-xevn-border bg-xevn-surface p-5 shadow-soft ${SETTINGS_RADIUS_CARD}`}>
                  <p className="text-base font-medium text-xevn-textSecondary">Task_Counter</p>
                  <p className="mt-2 text-3xl font-semibold text-xevn-text">
                    {taskCounts.all}
                  </p>
                  <p className="mt-1 text-sm text-xevn-textSecondary">
                    Việc đang xử lý (đã lọc phạm vi)
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2 text-sm">
                    <span className="rounded-lg bg-slate-100 px-2 py-1">
                      TÀI CHÍNH: {taskCounts.finance}
                    </span>
                    <span className="rounded-lg bg-slate-100 px-2 py-1">
                      KẾ TOÁN: {taskCounts.accounting}
                    </span>
                    <span className="rounded-lg bg-slate-100 px-2 py-1">
                      KINH DOANH: {taskCounts.xbos}
                    </span>
                    <span className="rounded-lg bg-slate-100 px-2 py-1">
                      NHÂN SỰ: {taskCounts.hrm}
                    </span>
                    <span className="rounded-lg bg-slate-100 px-2 py-1">
                      VẬN HÀNH: {taskCounts.fleet}
                    </span>
                  </div>
                </div>

                <div className={`border border-xevn-border bg-xevn-surface p-5 shadow-soft ${SETTINGS_RADIUS_CARD}`}>
                  <ApiLoadBanner
                    loadFailed={kpiRail.loadFailed && !allowMockFallback()}
                    usingMockFallback={kpiRail.usingMockFallback}
                    message={`Không tải KPI rollup (${describeScopePlaneForUi()}).`}
                  />
                  <p className="text-base font-medium text-xevn-textSecondary">KPI_Sparkline</p>
                  <div className="mt-2 flex items-end justify-between gap-2">
                    <div>
                      <p className="text-2xl font-semibold text-xevn-primary">
                        {kpiSeries.length ? `${kpiSeries[kpiSeries.length - 1]?.value}%` : '—'}
                      </p>
                      <p className="text-sm text-xevn-textSecondary">
                        {persona === 'employee' ? 'KPI cá nhân' : 'Tổng hợp tập đoàn'}
                      </p>
                    </div>
                    <Sparkline points={kpiSeries} />
                  </div>
                </div>

                <div className={`border border-xevn-border bg-xevn-surface p-5 shadow-soft ${SETTINGS_RADIUS_CARD}`}>
                  <ApiLoadBanner
                    loadFailed={portalAlertsStrict.loadFailed}
                    usingMockFallback={portalAlertsStrict.usingMockFallback}
                    title="Cảnh báo (UC-CC-P0-09)"
                    message={
                      portalAlertsStrict.loadFailed
                        ? ALERTS_STRICT_EMPTY_HINT
                        : undefined
                    }
                  />
                  <p className="text-base font-medium text-xevn-textSecondary">Alert_List</p>
                  <ul className="mt-3 max-h-28 space-y-2 overflow-auto text-base leading-snug">
                    {scopedAlerts.length === 0 ? (
                      <li className="text-xevn-textSecondary">Không có cảnh báo trong phạm vi.</li>
                    ) : (
                      scopedAlerts.map((a) => (
                        <li key={a.id} className="flex gap-2">
                          {a.level === 'critical' && (
                            <AlertTriangle
                              className="mt-0.5 h-4 w-4 shrink-0 text-rose-600"
                              strokeWidth={RAIL_STROKE}
                            />
                          )}
                          {a.level === 'warn' && (
                            <AlertTriangle
                              className="mt-0.5 h-4 w-4 shrink-0 text-amber-600"
                              strokeWidth={RAIL_STROKE}
                            />
                          )}
                          {a.level === 'info' && (
                            <Info
                              className="mt-0.5 h-4 w-4 shrink-0 text-xevn-info"
                              strokeWidth={RAIL_STROKE}
                            />
                          )}
                          <span className="line-clamp-2">{a.title}</span>
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              </section>

              {/* Action Cards */}
              <section className={`border border-xevn-border bg-xevn-surface/90 p-6 shadow-soft backdrop-blur-sm ${SETTINGS_RADIUS_CARD}`}>
                <ApiLoadBanner
                  loadFailed={inboxTasksStrict.loadFailed}
                  usingMockFallback={inboxTasksStrict.usingMockFallback}
                  title="Hộp thư (UC-CC-P0-09)"
                  message={
                    inboxTasksStrict.emptyStrictHint
                      ? INBOX_STRICT_EMPTY_HINT
                      : inboxTasksStrict.loadFailed
                        ? INBOX_STRICT_LOAD_FAILED
                        : undefined
                  }
                />
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className={SETTINGS_SECTION_TITLE_CLASS}>Action Cards</h2>
                    <p className="body-text text-base text-xevn-textSecondary">
                      Lọc theo phân hệ đang chọn trên thanh điều hướng
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(
                      [
                        { code: 'all' as const, label: 'Tất cả' },
                        { code: 'finance' as const, label: 'TÀI CHÍNH' },
                        { code: 'accounting' as const, label: 'KẾ TOÁN' },
                        { code: 'business' as const, label: 'KINH DOANH' },
                        { code: 'hrm' as const, label: 'NHÂN SỰ' },
                        { code: 'fleet' as const, label: 'VẬN HÀNH' },
                      ] as const
                    ).map(({ code, label }) => (
                      <button
                        key={code}
                        type="button"
                        onClick={() => {
                          if (code === 'hrm') {
                            setSelectedModule('hrm');
                            navigate(hrmPortalPath('dashboard'));
                          } else {
                            setSelectedModule(code);
                            navigate('/command-center');
                          }
                        }}
                        className={`rounded-lg px-3 py-2 text-base font-medium transition active:scale-95 ${
                          selectedModule === code
                            ? 'bg-xevn-primary text-white'
                            : 'bg-slate-100 text-xevn-textSecondary hover:bg-slate-200'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <ul className="space-y-3">
                  {filteredCards.length === 0 ? (
                    <li className="rounded-xl border border-dashed border-xevn-border py-12 text-center text-xevn-textSecondary">
                      {inboxTasksStrict.emptyStrictHint ? (
                        <span>{INBOX_STRICT_EMPTY_HINT}</span>
                      ) : inboxTasksStrict.loadFailed ? (
                        <span>{INBOX_STRICT_LOAD_FAILED}</span>
                      ) : (
                        'Không có việc cần xử lý trong phạm vi hiện tại.'
                      )}
                    </li>
                  ) : (
                    filteredCards.map((task) => (
                      <li
                        key={task.cardId}
                        className="flex flex-col gap-3 rounded-xl border border-xevn-border bg-white/90 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`rounded-md px-2 py-0.5 text-sm font-medium ${priorityClass(task.priority)}`}
                            >
                              {priorityLabel(task.priority)}
                            </span>
                            <span className="text-sm text-xevn-textSecondary">
                              {task.sourceSystem} · {task.moduleCode}
                            </span>
                          </div>
                          <p className="mt-1 font-medium text-xevn-text">{task.title}</p>
                          {task.subtitle && (
                            <p className="body-text mt-0.5 text-base text-xevn-textSecondary">
                              {task.subtitle}
                            </p>
                          )}
                          <p className="mt-2 text-sm text-xevn-textSecondary">
                            Người nhận: {task.assigneeName}
                            {task.dueAt && (
                              <>
                                {' '}
                                · Hạn: {formatAsOf(task.dueAt)}
                              </>
                            )}
                          </p>
                        </div>
                        <div className="flex shrink-0 gap-2">
                          <button
                            type="button"
                            onClick={() => openInboxTaskDetail(task)}
                            className="inline-flex items-center gap-1 rounded-lg border border-xevn-border bg-xevn-surface px-3 py-2 text-base font-medium text-xevn-text transition active:scale-95 hover:bg-slate-50"
                          >
                            Mở chi tiết
                            <ChevronRight className="h-4 w-4" strokeWidth={RAIL_STROKE} />
                          </button>
                          <button
                            type="button"
                            disabled={inboxActionBusyId === task.cardId}
                            onClick={() => void quickCompleteInboxTask(task)}
                            className="inline-flex items-center gap-1 rounded-lg bg-xevn-primary px-3 py-2 text-base font-medium text-white shadow-sm transition active:scale-95 hover:opacity-90 disabled:opacity-60"
                          >
                            {inboxActionBusyId === task.cardId ? 'Đang xử lý…' : 'Xử lý nhanh'}
                            <RefreshCw className="h-4 w-4" strokeWidth={RAIL_STROKE} />
                          </button>
                        </div>
                      </li>
                    ))
                  )}
                </ul>
              </section>
            </>
          )}
        </div>
        )}
      </WorkspaceLayout>
    </div>
  );
};

export default CommandCenterPage;
