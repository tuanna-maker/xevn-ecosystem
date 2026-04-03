import type {
  CalculationRun,
  CategoryDefinition,
  CategoryItem,
  KpiCascadeAllocationHeader,
  KpiCascadeAllocationLine,
  KpiAssignment,
  KpiActualValue,
  KpiDefinition,
  MetadataAttribute,
  Period,
  PolicyDefinition,
  PolicyGroup,
  PolicyTariffRange,
  PositionQuotaPolicy,
  OrgUnit,
  RewardPenaltyResult,
  Staff,
  Tenant,
} from '@/types';

const TENANT_ROOT = 'tenant-xevn-holding';

export const seedTenants: Tenant[] = [
  { id: TENANT_ROOT, code: 'XEVN-HQ', name: 'Tập đoàn XeVN' },
];

/** Cây: Holding → 2 công ty con → phòng ban mẫu */
export const seedOrgUnits: OrgUnit[] = [
  {
    id: 'org-holding',
    tenantId: TENANT_ROOT,
    parentId: null,
    orgTypeCode: 'holding',
    code: 'XEVN-HQ',
    name: 'Tập đoàn XeVN',
    taxCode: '0123456789',
    legalRep: 'Nguyễn Văn A',
    customAttributes: { region_code: 'VN-HCM' },
    status: 'active',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'org-logistics',
    tenantId: TENANT_ROOT,
    parentId: 'org-holding',
    orgTypeCode: 'subsidiary',
    code: 'XEVN-LG',
    name: 'XeVN Logistics',
    customAttributes: {},
    status: 'active',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'org-express',
    tenantId: TENANT_ROOT,
    parentId: 'org-holding',
    orgTypeCode: 'subsidiary',
    code: 'XEVN-EX',
    name: 'XeVN Express',
    customAttributes: {},
    status: 'active',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'org-lg-kd',
    tenantId: TENANT_ROOT,
    parentId: 'org-logistics',
    orgTypeCode: 'department',
    code: 'LG-KD',
    name: 'Phòng Kinh doanh',
    customAttributes: {},
    status: 'active',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'org-lg-vh',
    tenantId: TENANT_ROOT,
    parentId: 'org-logistics',
    orgTypeCode: 'department',
    code: 'LG-VH',
    name: 'Phòng Vận hành',
    customAttributes: {},
    status: 'active',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'org-ex-bc',
    tenantId: TENANT_ROOT,
    parentId: 'org-express',
    orgTypeCode: 'department',
    code: 'EX-BC',
    name: 'Phòng Bưu cục',
    customAttributes: {},
    status: 'active',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'org-ex-cskh',
    tenantId: TENANT_ROOT,
    parentId: 'org-express',
    orgTypeCode: 'department',
    code: 'EX-CSKH',
    name: 'Phòng CSKH',
    customAttributes: {},
    status: 'active',
    updatedAt: new Date().toISOString(),
  },
];

/** Trường bổ sung mẫu cho org_unit (metadata) */
export const seedMetadataAttributes: MetadataAttribute[] = [
  {
    id: 'meta-1',
    entityType: 'org_unit',
    key: 'headcount_plan',
    label: 'Định biên nhân sự (kế hoạch)',
    dataType: 'number',
    validationJson: { required: false, min: 0 },
    sortOrder: 1,
  },
  {
    id: 'meta-2',
    entityType: 'org_unit',
    key: 'priority_label',
    label: 'Mức ưu tiên',
    dataType: 'select',
    validationJson: { required: false },
    optionsJson: [
      { value: 'P0', label: 'P0 — Khẩn' },
      { value: 'P1', label: 'P1 — Cao' },
      { value: 'P2', label: 'P2 — Bình thường' },
    ],
    sortOrder: 2,
  },
  {
    id: 'meta-3',
    entityType: 'org_unit',
    key: 'cost_center',
    label: 'Trung tâm chi phí (DNA)',
    dataType: 'select',
    validationJson: { required: false },
    refCategoryCode: 'COST_CENTER',
    sortOrder: 3,
  },
];

export const seedCategoryDefinitions: CategoryDefinition[] = [
  { id: 'cat-def-1', code: 'COST_CENTER', name: 'Trung tâm chi phí', tenantScope: 'GROUP' },
  { id: 'cat-def-2', code: 'POSITION', name: 'Chức danh', tenantScope: 'GROUP' },
  { id: 'cat-def-3', code: 'KPI_VALUE_TYPE', name: 'Loại giá trị KPI', tenantScope: 'GROUP' },
];

export const seedCategoryItems: CategoryItem[] = [
  {
    id: 'ci-1',
    categoryCode: 'COST_CENTER',
    tenantId: TENANT_ROOT,
    code: 'CC-HQ',
    label: 'CC Trụ sở',
    payloadJson: {},
  },
  {
    id: 'ci-2',
    categoryCode: 'COST_CENTER',
    tenantId: TENANT_ROOT,
    code: 'CC-LG',
    label: 'CC Logistics',
    payloadJson: {},
  },
  {
    id: 'ci-3',
    categoryCode: 'POSITION',
    tenantId: TENANT_ROOT,
    code: 'DIR',
    label: 'Giám đốc',
    payloadJson: {},
  },
  {
    id: 'ci-4',
    categoryCode: 'POSITION',
    tenantId: TENANT_ROOT,
    code: 'MGR',
    label: 'Trưởng phòng',
    payloadJson: {},
  },
  {
    id: 'ci-kpi-1',
    categoryCode: 'KPI_VALUE_TYPE',
    tenantId: TENANT_ROOT,
    code: 'POINT',
    label: 'Điểm',
    payloadJson: { unit: 'điểm' },
  },
  {
    id: 'ci-kpi-2',
    categoryCode: 'KPI_VALUE_TYPE',
    tenantId: TENANT_ROOT,
    code: 'COUNT',
    label: 'Số lượng',
    payloadJson: { unit: 'cái' },
  },
  {
    id: 'ci-kpi-3',
    categoryCode: 'KPI_VALUE_TYPE',
    tenantId: TENANT_ROOT,
    code: 'PERCENT',
    label: 'Tỷ lệ (%)',
    payloadJson: { unit: '%' },
  },
  {
    id: 'ci-kpi-4',
    categoryCode: 'KPI_VALUE_TYPE',
    tenantId: TENANT_ROOT,
    code: 'MASS_KG',
    label: 'Khối lượng (kg)',
    payloadJson: { unit: 'kg' },
  },
  {
    id: 'ci-kpi-5',
    categoryCode: 'KPI_VALUE_TYPE',
    tenantId: TENANT_ROOT,
    code: 'MASS_TON',
    label: 'Khối lượng (tấn)',
    payloadJson: { unit: 'tấn' },
  },
];

// =========================
// KPI & Chính sách (mock)
// =========================

export const seedPeriods: Period[] = [
  {
    id: 'period-2026-01',
    tenantId: TENANT_ROOT,
    periodCode: '2026-01',
    name: 'Tháng 01/2026',
    startDate: '2026-01-01',
    endDate: '2026-01-31',
  },
  {
    id: 'period-2026-02',
    tenantId: TENANT_ROOT,
    periodCode: '2026-02',
    name: 'Tháng 02/2026',
    startDate: '2026-02-01',
    endDate: '2026-02-28',
  },
];

export const seedStaffs: Staff[] = [
  { id: 'stf-001', tenantId: TENANT_ROOT, code: 'NV-KD-001', name: 'Trần Minh Khang', levelCode: 'KINH_DOANH', orgUnitId: 'org-lg-kd' },
  { id: 'stf-002', tenantId: TENANT_ROOT, code: 'NV-KD-002', name: 'Lê Thị Thu Hà', levelCode: 'KINH_DOANH', orgUnitId: 'org-lg-kd' },
  { id: 'stf-003', tenantId: TENANT_ROOT, code: 'NV-KD-003', name: 'Phạm Đức Anh', levelCode: 'KINH_DOANH', orgUnitId: 'org-ex-bc' },
  { id: 'stf-004', tenantId: TENANT_ROOT, code: 'NV-KD-004', name: 'Nguyễn Văn Bảo', levelCode: 'KINH_DOANH', orgUnitId: 'org-ex-cskh' },
  { id: 'stf-005', tenantId: TENANT_ROOT, code: 'NV-LX-001', name: 'Võ Văn Trường', levelCode: 'LAI_XE', orgUnitId: 'org-lg-vh' },
  { id: 'stf-006', tenantId: TENANT_ROOT, code: 'NV-LX-002', name: 'Đặng Hoàng Nam', levelCode: 'LAI_XE', orgUnitId: 'org-lg-vh' },
  { id: 'stf-007', tenantId: TENANT_ROOT, code: 'NV-LX-003', name: 'Đỗ Ngọc Linh', levelCode: 'LAI_XE', orgUnitId: 'org-ex-bc' },
  { id: 'stf-008', tenantId: TENANT_ROOT, code: 'NV-LX-004', name: 'Bùi Thị Ngọc Hân', levelCode: 'LAI_XE', orgUnitId: 'org-ex-cskh' },
];

export const seedKpiDefinitions: KpiDefinition[] = [
  {
    id: 'kpi-v1-sales',
    tenantId: TENANT_ROOT,
    kpiCode: 'KPI_SALES',
    kpiName: 'Điểm doanh số',
    unit: 'điểm',
    valueTypeCategoryCode: 'KPI_VALUE_TYPE',
    valueTypeItemCode: 'POINT',
    frequency: 'monthly',
    formulaSpec: { type: 'direct', note: 'Lấy từ KPI thực tế' },
    effectiveFrom: null,
    effectiveTo: null,
    status: 'active',
    version: 1,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'kpi-v1-on-time',
    tenantId: TENANT_ROOT,
    kpiCode: 'KPI_ON_TIME',
    kpiName: 'Điểm đúng tiến độ',
    unit: 'điểm',
    valueTypeCategoryCode: 'KPI_VALUE_TYPE',
    valueTypeItemCode: 'POINT',
    frequency: 'monthly',
    formulaSpec: { type: 'direct', note: 'Lấy từ KPI thực tế' },
    effectiveFrom: null,
    effectiveTo: null,
    status: 'active',
    version: 1,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'kpi-v1-safety',
    tenantId: TENANT_ROOT,
    kpiCode: 'KPI_SAFETY',
    kpiName: 'Điểm an toàn',
    unit: 'điểm',
    valueTypeCategoryCode: 'KPI_VALUE_TYPE',
    valueTypeItemCode: 'POINT',
    frequency: 'monthly',
    formulaSpec: { type: 'direct', note: 'Lấy từ KPI thực tế' },
    effectiveFrom: null,
    effectiveTo: null,
    status: 'active',
    version: 1,
    updatedAt: new Date().toISOString(),
  },
];

export const seedPolicyGroups: PolicyGroup[] = [
  {
    id: 'pg-1',
    tenantId: TENANT_ROOT,
    policyGroupCode: 'PG_KINH_DOANH',
    policyGroupName: 'Chính sách cho khối kinh doanh',
    description: 'Thưởng/phạt theo KPI của bộ phận kinh doanh',
    defaultTargetStaffLevelCodes: ['KINH_DOANH'],
    defaultCurrencyCode: 'VND',
    status: 'active',
  },
  {
    id: 'pg-2',
    tenantId: TENANT_ROOT,
    policyGroupCode: 'PG_LAI_XE',
    policyGroupName: 'Chính sách cho khối lái xe',
    description: 'Thưởng/phạt theo KPI của đội lái xe',
    defaultTargetStaffLevelCodes: ['LAI_XE'],
    defaultCurrencyCode: 'VND',
    status: 'active',
  },
];

export const seedPolicies: PolicyDefinition[] = [
  {
    id: 'pol-v1-sales',
    tenantId: TENANT_ROOT,
    policyGroupCode: 'PG_KINH_DOANH',
    policyCode: 'POL_SALES',
    policyName: 'Thưởng/phạt theo điểm doanh số',
    kpiCode: 'KPI_SALES',
    targetStaffLevelCodes: ['KINH_DOANH'],
    orgScope: { scopeType: 'TENANT' },
    conditionJson: {
      triggerSource: 'KPI',
      conditionLogic: { operator: '>', metricKey: 'kpiValue', value: 0 },
      incentiveValue: 0,
      penaltyValue: 0,
      evidenceRequired: false,
      progressiveConfig: { enabled: true, step: 0.2, cap: 3 },
      exclusionRule: { enabled: true },
      limitZone: {},
    },
    effectiveFrom: null,
    effectiveTo: null,
    status: 'active',
    version: 1,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'pol-v1-on-time',
    tenantId: TENANT_ROOT,
    policyGroupCode: 'PG_KINH_DOANH',
    policyCode: 'POL_ON_TIME',
    policyName: 'Thưởng/phạt theo điểm đúng tiến độ',
    kpiCode: 'KPI_ON_TIME',
    targetStaffLevelCodes: ['KINH_DOANH'],
    orgScope: { scopeType: 'TENANT' },
    conditionJson: {
      triggerSource: 'KPI',
      conditionLogic: { operator: '>', metricKey: 'kpiValue', value: 0 },
      incentiveValue: 0,
      penaltyValue: 0,
      evidenceRequired: false,
      progressiveConfig: { enabled: true, step: 0.15, cap: 3 },
      exclusionRule: { enabled: true },
      limitZone: {},
    },
    effectiveFrom: null,
    effectiveTo: null,
    status: 'active',
    version: 1,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'pol-v1-safety',
    tenantId: TENANT_ROOT,
    policyGroupCode: 'PG_LAI_XE',
    policyCode: 'POL_SAFETY',
    policyName: 'Thưởng/phạt theo điểm an toàn',
    kpiCode: 'KPI_SAFETY',
    targetStaffLevelCodes: ['LAI_XE'],
    orgScope: { scopeType: 'TENANT' },
    conditionJson: {
      triggerSource: 'KPI',
      conditionLogic: { operator: '>', metricKey: 'kpiValue', value: 0 },
      incentiveValue: 0,
      penaltyValue: 0,
      evidenceRequired: true,
      progressiveConfig: { enabled: true, step: 0.25, cap: 3 },
      exclusionRule: { enabled: true },
      limitZone: { maxPenaltyMultiplier: 3 },
    },
    effectiveFrom: null,
    effectiveTo: null,
    status: 'active',
    version: 1,
    updatedAt: new Date().toISOString(),
  },
];

export const seedPolicyTariffRanges: PolicyTariffRange[] = [
  // POL_SALES (version 1)
  {
    id: 'tar-pol-sales-1',
    tenantId: TENANT_ROOT,
    policyCode: 'POL_SALES',
    policyVersion: 1,
    currencyCode: 'VND',
    fromValue: null,
    toValue: 60,
    rewardAmount: 0,
    penaltyAmount: 2000000,
    penaltyForms: [
      { formCode: 'TRU_TIEN', value: 2000000, unit: 'VND' },
      { formCode: 'CANH_BAO', value: 1, unit: 'lần' },
      { formCode: 'TRU_DIEM', value: 0, unit: 'điểm' },
    ],
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'tar-pol-sales-2',
    tenantId: TENANT_ROOT,
    policyCode: 'POL_SALES',
    policyVersion: 1,
    currencyCode: 'VND',
    fromValue: 60,
    toValue: 80,
    rewardAmount: 1000000,
    penaltyAmount: 0,
    penaltyForms: [
      { formCode: 'TRU_TIEN', value: 0, unit: 'VND' },
      { formCode: 'CANH_BAO', value: 0, unit: 'lần' },
      { formCode: 'TRU_DIEM', value: 0, unit: 'điểm' },
    ],
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'tar-pol-sales-3',
    tenantId: TENANT_ROOT,
    policyCode: 'POL_SALES',
    policyVersion: 1,
    currencyCode: 'VND',
    fromValue: 80,
    toValue: null,
    rewardAmount: 3000000,
    penaltyAmount: 0,
    penaltyForms: [
      { formCode: 'TRU_TIEN', value: 0, unit: 'VND' },
      { formCode: 'CANH_BAO', value: 0, unit: 'lần' },
      { formCode: 'TRU_DIEM', value: 0, unit: 'điểm' },
    ],
    updatedAt: new Date().toISOString(),
  },

  // POL_ON_TIME (version 1)
  {
    id: 'tar-pol-on-1',
    tenantId: TENANT_ROOT,
    policyCode: 'POL_ON_TIME',
    policyVersion: 1,
    currencyCode: 'VND',
    fromValue: null,
    toValue: 90,
    rewardAmount: 0,
    penaltyAmount: 1500000,
    penaltyForms: [
      { formCode: 'TRU_TIEN', value: 1500000, unit: 'VND' },
      { formCode: 'CANH_BAO', value: 1, unit: 'lần' },
      { formCode: 'TRU_DIEM', value: 10, unit: 'điểm' },
    ],
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'tar-pol-on-2',
    tenantId: TENANT_ROOT,
    policyCode: 'POL_ON_TIME',
    policyVersion: 1,
    currencyCode: 'VND',
    fromValue: 90,
    toValue: null,
    rewardAmount: 2000000,
    penaltyAmount: 0,
    penaltyForms: [
      { formCode: 'TRU_TIEN', value: 0, unit: 'VND' },
      { formCode: 'CANH_BAO', value: 0, unit: 'lần' },
      { formCode: 'TRU_DIEM', value: 0, unit: 'điểm' },
    ],
    updatedAt: new Date().toISOString(),
  },

  // POL_SAFETY (version 1)
  {
    id: 'tar-pol-safety-1',
    tenantId: TENANT_ROOT,
    policyCode: 'POL_SAFETY',
    policyVersion: 1,
    currencyCode: 'VND',
    fromValue: null,
    toValue: 70,
    rewardAmount: 0,
    penaltyAmount: 2500000,
    penaltyForms: [
      { formCode: 'TRU_TIEN', value: 2500000, unit: 'VND' },
      { formCode: 'CANH_BAO', value: 2, unit: 'lần' },
      { formCode: 'TRU_DIEM', value: 15, unit: 'điểm' },
    ],
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'tar-pol-safety-2',
    tenantId: TENANT_ROOT,
    policyCode: 'POL_SAFETY',
    policyVersion: 1,
    currencyCode: 'VND',
    fromValue: 70,
    toValue: 85,
    rewardAmount: 1200000,
    penaltyAmount: 0,
    penaltyForms: [
      { formCode: 'TRU_TIEN', value: 0, unit: 'VND' },
      { formCode: 'CANH_BAO', value: 0, unit: 'lần' },
      { formCode: 'TRU_DIEM', value: 0, unit: 'điểm' },
    ],
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'tar-pol-safety-3',
    tenantId: TENANT_ROOT,
    policyCode: 'POL_SAFETY',
    policyVersion: 1,
    currencyCode: 'VND',
    fromValue: 85,
    toValue: null,
    rewardAmount: 2800000,
    penaltyAmount: 0,
    penaltyForms: [
      { formCode: 'TRU_TIEN', value: 0, unit: 'VND' },
      { formCode: 'CANH_BAO', value: 0, unit: 'lần' },
      { formCode: 'TRU_DIEM', value: 0, unit: 'điểm' },
    ],
    updatedAt: new Date().toISOString(),
  },
];

// KPI thực tế (mock) cho 2 kỳ
export const seedKpiActualValues: KpiActualValue[] = [
  // Tháng 01
  { id: 'av-jan-001-sales', tenantId: TENANT_ROOT, periodCode: '2026-01', staffId: 'stf-001', kpiCode: 'KPI_SALES', value: 72, updatedAt: new Date().toISOString() },
  { id: 'av-jan-002-sales', tenantId: TENANT_ROOT, periodCode: '2026-01', staffId: 'stf-002', kpiCode: 'KPI_SALES', value: 54, updatedAt: new Date().toISOString() },
  { id: 'av-jan-003-sales', tenantId: TENANT_ROOT, periodCode: '2026-01', staffId: 'stf-003', kpiCode: 'KPI_SALES', value: 81, updatedAt: new Date().toISOString() },
  { id: 'av-jan-004-sales', tenantId: TENANT_ROOT, periodCode: '2026-01', staffId: 'stf-004', kpiCode: 'KPI_SALES', value: 66, updatedAt: new Date().toISOString() },

  { id: 'av-jan-001-on', tenantId: TENANT_ROOT, periodCode: '2026-01', staffId: 'stf-001', kpiCode: 'KPI_ON_TIME', value: 88, updatedAt: new Date().toISOString() },
  { id: 'av-jan-002-on', tenantId: TENANT_ROOT, periodCode: '2026-01', staffId: 'stf-002', kpiCode: 'KPI_ON_TIME', value: 93, updatedAt: new Date().toISOString() },
  { id: 'av-jan-003-on', tenantId: TENANT_ROOT, periodCode: '2026-01', staffId: 'stf-003', kpiCode: 'KPI_ON_TIME', value: 79, updatedAt: new Date().toISOString() },
  { id: 'av-jan-004-on', tenantId: TENANT_ROOT, periodCode: '2026-01', staffId: 'stf-004', kpiCode: 'KPI_ON_TIME', value: 96, updatedAt: new Date().toISOString() },

  { id: 'av-jan-005-safety', tenantId: TENANT_ROOT, periodCode: '2026-01', staffId: 'stf-005', kpiCode: 'KPI_SAFETY', value: 64, updatedAt: new Date().toISOString() },
  { id: 'av-jan-006-safety', tenantId: TENANT_ROOT, periodCode: '2026-01', staffId: 'stf-006', kpiCode: 'KPI_SAFETY', value: 78, updatedAt: new Date().toISOString() },
  { id: 'av-jan-007-safety', tenantId: TENANT_ROOT, periodCode: '2026-01', staffId: 'stf-007', kpiCode: 'KPI_SAFETY', value: 88, updatedAt: new Date().toISOString() },
  { id: 'av-jan-008-safety', tenantId: TENANT_ROOT, periodCode: '2026-01', staffId: 'stf-008', kpiCode: 'KPI_SAFETY', value: 72, updatedAt: new Date().toISOString() },

  // Tháng 02
  { id: 'av-feb-001-sales', tenantId: TENANT_ROOT, periodCode: '2026-02', staffId: 'stf-001', kpiCode: 'KPI_SALES', value: 60, updatedAt: new Date().toISOString() },
  { id: 'av-feb-002-sales', tenantId: TENANT_ROOT, periodCode: '2026-02', staffId: 'stf-002', kpiCode: 'KPI_SALES', value: 49, updatedAt: new Date().toISOString() },
  { id: 'av-feb-003-sales', tenantId: TENANT_ROOT, periodCode: '2026-02', staffId: 'stf-003', kpiCode: 'KPI_SALES', value: 84, updatedAt: new Date().toISOString() },
  { id: 'av-feb-004-sales', tenantId: TENANT_ROOT, periodCode: '2026-02', staffId: 'stf-004', kpiCode: 'KPI_SALES', value: 73, updatedAt: new Date().toISOString() },

  { id: 'av-feb-001-on', tenantId: TENANT_ROOT, periodCode: '2026-02', staffId: 'stf-001', kpiCode: 'KPI_ON_TIME', value: 91, updatedAt: new Date().toISOString() },
  { id: 'av-feb-002-on', tenantId: TENANT_ROOT, periodCode: '2026-02', staffId: 'stf-002', kpiCode: 'KPI_ON_TIME', value: 87, updatedAt: new Date().toISOString() },
  { id: 'av-feb-003-on', tenantId: TENANT_ROOT, periodCode: '2026-02', staffId: 'stf-003', kpiCode: 'KPI_ON_TIME', value: 95, updatedAt: new Date().toISOString() },
  { id: 'av-feb-004-on', tenantId: TENANT_ROOT, periodCode: '2026-02', staffId: 'stf-004', kpiCode: 'KPI_ON_TIME', value: 76, updatedAt: new Date().toISOString() },

  { id: 'av-feb-005-safety', tenantId: TENANT_ROOT, periodCode: '2026-02', staffId: 'stf-005', kpiCode: 'KPI_SAFETY', value: 68, updatedAt: new Date().toISOString() },
  { id: 'av-feb-006-safety', tenantId: TENANT_ROOT, periodCode: '2026-02', staffId: 'stf-006', kpiCode: 'KPI_SAFETY', value: 80, updatedAt: new Date().toISOString() },
  { id: 'av-feb-007-safety', tenantId: TENANT_ROOT, periodCode: '2026-02', staffId: 'stf-007', kpiCode: 'KPI_SAFETY', value: 86, updatedAt: new Date().toISOString() },
  { id: 'av-feb-008-safety', tenantId: TENANT_ROOT, periodCode: '2026-02', staffId: 'stf-008', kpiCode: 'KPI_SAFETY', value: 60, updatedAt: new Date().toISOString() },
];

export const seedCalculationRuns: CalculationRun[] = [];
export const seedRewardPenaltyResults: RewardPenaltyResult[] = [];

const defaultCascadeStatus: 'draft' = 'draft';
const defaultCascadePeriodType: 'Q1' = 'Q1';

export const seedKpiCascadeHeaders: KpiCascadeAllocationHeader[] = [
  {
    id: 'kh-q1-sales-lg-kd',
    tenantId: TENANT_ROOT,
    periodCode: '2026-01',
    periodType: defaultCascadePeriodType,
    parentOrgUnitId: 'org-lg-kd',
    kpiCode: 'KPI_SALES',
    parentKpiValue: 120,
    effectiveDate: '2026-01-01',
    status: defaultCascadeStatus,
    updatedAt: new Date().toISOString(),
  },
];

export const seedKpiCascadeLines: KpiCascadeAllocationLine[] = [
  {
    id: 'kl-q1-sales-stf-001',
    tenantId: TENANT_ROOT,
    headerId: 'kh-q1-sales-lg-kd',
    assigneeType: 'STAFF',
    assigneeId: 'stf-001',
    positionCode: 'KINH_DOANH',
    allocationWeight: 0.6,
    targetValue: 72,
    workloadPercent: 100,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'kl-q1-sales-stf-002',
    tenantId: TENANT_ROOT,
    headerId: 'kh-q1-sales-lg-kd',
    assigneeType: 'STAFF',
    assigneeId: 'stf-002',
    positionCode: 'KINH_DOANH',
    allocationWeight: 0.4,
    targetValue: 48,
    workloadPercent: 100,
    updatedAt: new Date().toISOString(),
  },
];

export const seedPositionQuotaPolicies: PositionQuotaPolicy[] = [
  {
    id: 'quota-q1-sales-kd',
    tenantId: TENANT_ROOT,
    positionCode: 'KINH_DOANH',
    kpiCode: 'KPI_SALES',
    periodType: 'Q1',
    quotaCeiling: 160,
  },
  {
    id: 'quota-q1-safety-lx',
    tenantId: TENANT_ROOT,
    positionCode: 'LAI_XE',
    kpiCode: 'KPI_SAFETY',
    periodType: 'Q1',
    quotaCeiling: 140,
  },
];

export const seedKpiAssignments: KpiAssignment[] = [
  // Tháng 01/2026
  { id: 'ka-2026-01-kd-sales', tenantId: TENANT_ROOT, periodCode: '2026-01', kpiCode: 'KPI_SALES', staffLevelCode: 'KINH_DOANH', orgScope: { scopeType: 'TENANT' }, updatedAt: new Date().toISOString() },
  { id: 'ka-2026-01-kd-on', tenantId: TENANT_ROOT, periodCode: '2026-01', kpiCode: 'KPI_ON_TIME', staffLevelCode: 'KINH_DOANH', orgScope: { scopeType: 'TENANT' }, updatedAt: new Date().toISOString() },
  { id: 'ka-2026-01-lx-safety', tenantId: TENANT_ROOT, periodCode: '2026-01', kpiCode: 'KPI_SAFETY', staffLevelCode: 'LAI_XE', orgScope: { scopeType: 'TENANT' }, updatedAt: new Date().toISOString() },

  // Tháng 02/2026
  { id: 'ka-2026-02-kd-sales', tenantId: TENANT_ROOT, periodCode: '2026-02', kpiCode: 'KPI_SALES', staffLevelCode: 'KINH_DOANH', orgScope: { scopeType: 'TENANT' }, updatedAt: new Date().toISOString() },
  { id: 'ka-2026-02-kd-on', tenantId: TENANT_ROOT, periodCode: '2026-02', kpiCode: 'KPI_ON_TIME', staffLevelCode: 'KINH_DOANH', orgScope: { scopeType: 'TENANT' }, updatedAt: new Date().toISOString() },
  { id: 'ka-2026-02-lx-safety', tenantId: TENANT_ROOT, periodCode: '2026-02', kpiCode: 'KPI_SAFETY', staffLevelCode: 'LAI_XE', orgScope: { scopeType: 'TENANT' }, updatedAt: new Date().toISOString() },
];
