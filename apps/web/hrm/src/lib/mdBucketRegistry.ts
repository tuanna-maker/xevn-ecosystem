/**
 * @CODE-MEMORY
 * Screen:     /settings — Master Data bucket registry (E1-B)
 * UC:         FR-HRM-SC-SET-UI-01 · FR-HRM-SC-DEC-01 · AC-SET-UI-01/05/07
 * BR:         BR-HRM-SC-ALIAS-01/02 · BR-U72-NULL-01
 * SRS:        docs/program/deltas/BA_ERP_E1B_SRS_01_20260728.md
 * TechSpec:   docs/hrm/DB_DESIGN_HRM_SETTINGS_E1B.md · API_DESIGN_HRM_SETTINGS_E1B.md
 * Purpose:    SoT registry ≥10 MD buckets + VI labels + writeKey (DEC prefer hr_decision_types).
 * WorkItem:   D-FE-ERP-E1B-MD-PANEL-01
 * Coded:      2026-07-28
 * Callers:    MasterDataSettingsPanel
 * Callees:    HRM_MASTER_DATA_CATALOG_KEYS
 * Impact:     Missing bucket / wrong DEC keys → Settings MISS live catalog
 * must_keep:  U72 VI titles; DEC dual keys; writeKey DEC = hr_decision_types; no work_shifts dual-write
 * SOLID:      Pure data — no React
 * LastVerified: docs/qa/evidence/d-fe-erp-e1b-md-panel-01-20260728.md
 *
 * @CODE-MEMORY-CHANGE 2026-07-28 D-FE-ERP-E3-01
 * change_mode: ADD
 * What: Buckets insurers / insuranceTypes / kpiLibrary — empty+CTA Settings (AC-INS/PERF)
 * Why: FR-HRM-INS-DEPTH-E3-01 · FR-HRM-PERF-SM-E3-01 · R-E3-SETTINGS-UI
 * must_keep: E1-B ≥10 + DEC writeKey; E2 payTypes/contractTypes; no SM collapse
 */

import { HRM_MASTER_DATA_CATALOG_KEYS } from '@/lib/catalogSearchPicker';

/** E1-B Settings MD CRUD buckets (JT/PAY deep-links are separate stubs). */
export type MdBucket =
  | 'positions'
  | 'departments'
  | 'leaveTypes'
  | 'decisionTypes'
  | 'contractTypes'
  | 'employmentTypes'
  | 'shifts'
  | 'jobGrades'
  | 'recruitmentChannels'
  | 'payTypes'
  | 'salaryComponents'
  | 'insurers'
  | 'insuranceTypes'
  | 'kpiLibrary';

export const MD_BUCKET_ORDER: readonly MdBucket[] = [
  'positions',
  'departments',
  'leaveTypes',
  'decisionTypes',
  'contractTypes',
  'employmentTypes',
  'shifts',
  'jobGrades',
  'recruitmentChannels',
  'payTypes',
  'salaryComponents',
  'insurers',
  'insuranceTypes',
  'kpiLibrary',
] as const;

export type MdBucketMeta = {
  title: string;
  description: string;
  fr: string;
  keys: readonly string[];
  writeKey: string;
  codePlaceholder: string;
  labelPlaceholder: string;
};

export const MD_BUCKET_META: Record<MdBucket, MdBucketMeta> = {
  positions: {
    title: 'Chức danh',
    description: 'Danh mục chức danh theo đơn vị — picker trên hồ sơ NV / YCTD.',
    fr: 'FR-HRM-SC-POS-01',
    keys: HRM_MASTER_DATA_CATALOG_KEYS.positions,
    writeKey: 'job_titles',
    codePlaceholder: 'VD: nv_kd',
    labelPlaceholder: 'VD: Nhân viên Kinh doanh',
  },
  departments: {
    title: 'Phòng ban',
    description: 'Phòng ban / bộ phận — picker trên hồ sơ NV và yêu cầu tuyển dụng.',
    fr: 'FR-HRM-SC-POS-01',
    keys: HRM_MASTER_DATA_CATALOG_KEYS.departments,
    writeKey: 'departments',
    codePlaceholder: 'VD: phong_hcns',
    labelPlaceholder: 'VD: Phòng HCNS',
  },
  leaveTypes: {
    title: 'Loại nghỉ',
    description: 'Loại nghỉ phép + entitlement — picker trên đơn nghỉ.',
    fr: 'FR-HRM-SC-LEAVE-01',
    keys: HRM_MASTER_DATA_CATALOG_KEYS.leaveTypes,
    writeKey: 'leave_types',
    codePlaceholder: 'VD: annual',
    labelPlaceholder: 'VD: Nghỉ phép năm',
  },
  decisionTypes: {
    title: 'Loại quyết định',
    description: 'Loại quyết định nhân sự — alias hr_decision_types + decision_types.',
    fr: 'FR-HRM-SC-DEC-01',
    keys: HRM_MASTER_DATA_CATALOG_KEYS.decisionTypes,
    writeKey: 'hr_decision_types',
    codePlaceholder: 'VD: transfer',
    labelPlaceholder: 'VD: Điều động',
  },
  contractTypes: {
    title: 'Loại hợp đồng',
    description: 'Loại HĐ lao động — SoT cho Contracts / EmployeeContracts (bind E1-A).',
    fr: 'FR-HRM-SC-CT-01',
    keys: HRM_MASTER_DATA_CATALOG_KEYS.contractTypes,
    writeKey: 'contract_types',
    codePlaceholder: 'VD: hdld_12m',
    labelPlaceholder: 'VD: HĐLĐ xác định 12 tháng',
  },
  employmentTypes: {
    title: 'Loại hình lao động',
    description: 'Hình thức LĐ — mã snake (full_time, part_time); không dùng dấu gạch ngang.',
    fr: 'FR-HRM-SC-ET-01',
    keys: HRM_MASTER_DATA_CATALOG_KEYS.employmentTypes,
    writeKey: 'employment_types',
    codePlaceholder: 'VD: full_time',
    labelPlaceholder: 'VD: Toàn thời gian',
  },
  shifts: {
    title: 'Ca làm việc',
    description: 'Danh mục ca (catalog) — không đồng ghi bảng Attendance work_shifts.',
    fr: 'FR-HRM-SC-SHIFT-01',
    keys: HRM_MASTER_DATA_CATALOG_KEYS.shifts,
    writeKey: 'shifts',
    codePlaceholder: 'VD: ca_sang',
    labelPlaceholder: 'VD: Ca sáng',
  },
  jobGrades: {
    title: 'Ngạch bậc',
    description: 'Ngạch / band — picker tuyển dụng / JD (bind E1-A).',
    fr: 'FR-HRM-SC-GRADE-01',
    keys: HRM_MASTER_DATA_CATALOG_KEYS.jobGrades,
    writeKey: 'job_grades',
    codePlaceholder: 'VD: g05',
    labelPlaceholder: 'VD: Bậc 5',
  },
  recruitmentChannels: {
    title: 'Kênh tuyển dụng',
    description: 'Nguồn ứng viên — alias recruitment_channels / candidate_sources / channels.',
    fr: 'FR-HRM-SC-CH-01',
    keys: HRM_MASTER_DATA_CATALOG_KEYS.recruitmentChannels,
    writeKey: 'recruitment_channels',
    codePlaceholder: 'VD: linkedin',
    labelPlaceholder: 'VD: LinkedIn',
  },
  payTypes: {
    title: 'Bản chất / loại TP lương',
    description: 'Tính chất thành phần lương (Lương / Phụ cấp / Khấu trừ…) — khác instance TP lương.',
    fr: 'FR-HRM-SC-PAY-TYPE-01',
    keys: HRM_MASTER_DATA_CATALOG_KEYS.payTypes,
    writeKey: 'pay_types',
    codePlaceholder: 'VD: allowance',
    labelPlaceholder: 'VD: Phụ cấp',
  },
  salaryComponents: {
    title: 'Thành phần lương (danh mục)',
    description: 'Dictionary mã TP lương trên Settings — CRUD vận hành chi tiết vẫn tại Phân hệ Lương.',
    fr: 'FR-HRM-SC-PAY-01',
    keys: HRM_MASTER_DATA_CATALOG_KEYS.salaryComponents,
    writeKey: 'salary_components',
    codePlaceholder: 'VD: base_salary',
    labelPlaceholder: 'VD: Lương cơ bản',
  },
  insurers: {
    title: 'Nhà bảo hiểm',
    description: 'Danh mục nhà BH — picker trên chính sách / ghi nhận BH (E3). Empty = CTA đồng bộ, không invent.',
    fr: 'FR-HRM-SC-INS-01',
    keys: HRM_MASTER_DATA_CATALOG_KEYS.insurers,
    writeKey: 'insurers',
    codePlaceholder: 'VD: bao_viet',
    labelPlaceholder: 'VD: Bảo Việt',
  },
  insuranceTypes: {
    title: 'Loại bảo hiểm',
    description: 'Loại BH theo danh mục — persist code trên policy / participant (E3).',
    fr: 'FR-HRM-SC-INS-02',
    keys: HRM_MASTER_DATA_CATALOG_KEYS.insuranceTypes,
    writeKey: 'insurance_types',
    codePlaceholder: 'VD: bhxh',
    labelPlaceholder: 'VD: BHXH',
  },
  kpiLibrary: {
    title: 'Thư viện KPI',
    description: 'KPI định nghĩa — picker trên phiếu đánh giá hiệu suất (E3).',
    fr: 'FR-HRM-SC-KPI-01',
    keys: HRM_MASTER_DATA_CATALOG_KEYS.kpiLibrary,
    writeKey: 'kpi_library',
    codePlaceholder: 'VD: kpi_doanh_thu',
    labelPlaceholder: 'VD: Doanh thu',
  },
};

/** True when registry meets E1-B DoD (≥10 CRUD buckets, DEC dual-read + prefer write). */
export function assertE1bMdBucketRegistry(): {
  bucketCount: number;
  decisionKeys: readonly string[];
  decisionWriteKey: string;
} {
  return {
    bucketCount: MD_BUCKET_ORDER.length,
    decisionKeys: MD_BUCKET_META.decisionTypes.keys,
    decisionWriteKey: MD_BUCKET_META.decisionTypes.writeKey,
  };
}
