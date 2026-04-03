/** Kiểu thuộc tính động — khớp metadata_attribute.dataType */
export type MetadataDataType = 'text' | 'number' | 'date' | 'boolean' | 'select';

export interface MetadataAttribute {
  id: string;
  entityType: string;
  key: string;
  label: string;
  dataType: MetadataDataType;
  /** Rule: required, min, max, regex... */
  validationJson: Record<string, unknown>;
  /** select: [{ value, label }] */
  optionsJson?: { value: string; label: string }[];
  /** Select lấy giá trị từ danh mục DNA (mã category) — ưu tiên hơn optionsJson tĩnh */
  refCategoryCode?: string;
  sortOrder: number;
}

export interface OrgUnit {
  id: string;
  tenantId: string;
  parentId: string | null;
  orgTypeCode: 'holding' | 'subsidiary' | 'division' | 'department';
  code: string;
  name: string;
  taxCode?: string;
  legalRep?: string;
  customAttributes: Record<string, unknown>;
  status: 'active' | 'inactive';
  updatedAt: string;
}

export interface CategoryDefinition {
  id: string;
  code: string;
  name: string;
  tenantScope: 'GROUP' | 'TENANT';
}

export interface CategoryItem {
  id: string;
  categoryCode: string;
  tenantId: string;
  code: string;
  label: string;
  payloadJson: Record<string, unknown>;
}

export interface Tenant {
  id: string;
  name: string;
  code: string;
}

// =========================
// KPI & Chính sách (mock FE)
// =========================

export type KpiFrequency = 'daily' | 'weekly' | 'monthly';

export type StaffLevelCode = 'KINH_DOANH' | 'LAI_XE';

export type RecordStatus = 'draft' | 'active' | 'inactive';

export type PenaltyFormCode = 'TRU_TIEN' | 'TRU_DIEM' | 'CANH_BAO';

export interface PenaltyFormItem {
  formCode: PenaltyFormCode;
  value: number;
  // Đơn vị hiển thị (ví dụ: VND, điểm, lần...). Prototype dùng để hiển thị.
  unit?: string;
}

export interface Period {
  id: string;
  tenantId: string;
  periodCode: string; // VD: 2026-01
  name: string; // VD: Tháng 01 năm 2026
  startDate: string; // ISO date
  endDate: string; // ISO date
}

export interface Staff {
  id: string;
  tenantId: string;
  code: string;
  name: string;
  levelCode: StaffLevelCode;
  orgUnitId: string;
}

export interface KpiDefinition {
  id: string;
  tenantId: string;
  kpiCode: string;
  kpiName: string;
  unit: string;
  /**
   * Loại giá trị KPI lấy từ Danh mục tập trung.
   * Ví dụ: POINT / PERCENT / MASS_KG / MASS_TON...
   */
  valueTypeCategoryCode?: string; // ví dụ: 'KPI_VALUE_TYPE'
  valueTypeItemCode?: string; // ví dụ: 'POINT'
  frequency: KpiFrequency;
  formulaSpec: Record<string, unknown>;
  effectiveFrom: string | null; // ISO datetime
  effectiveTo: string | null; // ISO datetime
  status: RecordStatus;
  version: number;
  updatedAt: string; // ISO datetime
}

export interface PolicyGroup {
  id: string;
  tenantId: string;
  policyGroupCode: string;
  policyGroupName: string;
  description?: string;
  defaultTargetStaffLevelCodes?: StaffLevelCode[];
  defaultCurrencyCode?: string;
  effectiveFrom?: string | null;
  effectiveTo?: string | null;
  status: RecordStatus;
}

export interface PolicyOrgScope {
  scopeType: 'TENANT' | 'ORG_UNIT';
  orgUnitId?: string; // dùng khi scopeType = ORG_UNIT
}

export interface PolicyDefinition {
  id: string;
  tenantId: string;
  policyGroupCode: string;
  policyCode: string;
  policyName: string;
  kpiCode: string;
  targetStaffLevelCodes: StaffLevelCode[];
  orgScope: PolicyOrgScope;
  conditionJson?: Record<string, unknown>;
  effectiveFrom: string | null;
  effectiveTo: string | null;
  status: RecordStatus;
  version: number;
  updatedAt: string; // ISO datetime
}

export interface PolicyTariffRange {
  id: string;
  tenantId: string;
  policyCode: string;
  policyVersion: number;
  currencyCode: string;
  // Khoảng theo dạng [fromValue, toValue)
  // fromValue/toValue có thể null để biểu diễn (-inf/+inf)
  fromValue: number | null;
  toValue: number | null;
  rewardAmount: number; // thưởng
  // penaltyAmount: phần trừ tiền (gợi ý dùng form TRU_TIEN)
  penaltyAmount: number;
  // penaltyForms: nhiều hình thức phạt trong cùng 1 khoảng
  penaltyForms: PenaltyFormItem[];
  note?: string;
  updatedAt: string; // ISO datetime
}

export interface KpiActualValue {
  id: string;
  tenantId: string;
  periodCode: string;
  staffId: string;
  kpiCode: string;
  value: number;
  updatedAt: string; // ISO datetime
}

export interface CalculationRun {
  id: string;
  tenantId: string;
  periodCode: string;
  createdAt: string; // ISO datetime
  status: 'draft' | 'final';
  totalReward: number;
  totalPenalty: number;
  successCount: number;
  failureCount: number;
}

export interface RewardPenaltyResult {
  id: string;
  tenantId: string;
  runId: string;
  periodCode: string;
  staffId: string;
  policyCode: string;
  policyVersion: number;
  kpiCode: string;
  kpiActualValue: number;
  rewardAmount: number;
  penaltyAmount: number;
  penaltyForms: PenaltyFormItem[];
  createdAt: string; // ISO datetime
}

export interface KpiAssignment {
  id: string;
  tenantId: string;
  periodCode: string;
  kpiCode: string;
  staffLevelCode: StaffLevelCode;
  /**
   * Phạm vi áp dụng theo cây tổ chức.
   * - TENANT: áp dụng cho toàn bộ
   * - ORG_UNIT: áp dụng cho toàn bộ nhân sự thuộc nhánh bắt đầu từ `orgUnitId`
   */
  orgScope: PolicyOrgScope;
  updatedAt: string;
}

export type CascadePeriodType = 'Q1' | 'Q2' | 'YEAR';
export type CascadeAllocationStatus = 'draft' | 'pending_approval' | 'approved' | 'frozen';

export interface KpiCascadeAllocationHeader {
  id: string;
  tenantId: string;
  periodCode: string;
  periodType: CascadePeriodType;
  parentOrgUnitId: string;
  kpiCode: string;
  parentKpiValue: number;
  effectiveDate: string; // ISO date
  status: CascadeAllocationStatus;
  updatedAt: string;
}

export interface KpiCascadeAllocationLine {
  id: string;
  tenantId: string;
  headerId: string;
  assigneeType: 'ORG_UNIT' | 'STAFF';
  assigneeId: string;
  positionCode: StaffLevelCode;
  allocationWeight: number | null;
  targetValue: number;
  workloadPercent: number | null;
  updatedAt: string;
}

export interface PositionQuotaPolicy {
  id: string;
  tenantId: string;
  positionCode: StaffLevelCode;
  kpiCode: string;
  periodType: CascadePeriodType;
  quotaCeiling: number;
}
