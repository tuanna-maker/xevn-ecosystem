/**
 * @CODE-MEMORY
 * Screen:     Settings master-data + form consumer pickers (NV / YCTD / quyết định / nghỉ)
 * UC:         FR-HRM-SC-POS/JT/LEAVE/DEC/PAY · AC-HRM-PICKER-01 · BR-HRM-MD-01
 * BR:         BR-HRM-MD-01 — cấm free-text SoT; AC-HRM-PICKER-01 search ≥1 ký tự
 * SRS:        docs/client-delivery/hrm/SRS_HRM_KHACH_DELTA_CAI_DAT_20260723.md §0.1
 * TechSpec:   docs/hrm/TECHSPEC.md §18.1 Settings CRUD + filter/search
 * Purpose:    Pure resolve/filter cho combo catalog — lưu code/id, lọc mã+tên; reject Khối trên path công ty.
 * WorkItem:   D-HRM-SETTINGS-MD-CRUD-FE-01
 * Coded:      2026-07-23
 * Callers:    CatalogSearchPicker · MasterDataSettingsPanel · EmployeeForm · LeaveTab · Decisions · JobRequisitions
 * Callees:    asLegalCompanyDisplayName (Plane A)
 * Impact:     Free-text SoT / không search khi >10 item → FAIL AC-HRM-PICKER-01
 * must_keep:  value = catalog code/id; filter by code+label; Khối fail-closed trên company options
 * SOLID:      Pure lib — no React
 * LastVerified: catalogSearchPicker.test.ts (leaveType + departmentOptionsFromCatalog + recruitmentChannel)
 *
 * @CODE-MEMORY-CHANGE 2026-08-11 PO-HRM-REC-CHANNELS-CONSUMER-FE-01
 * change_mode: ADD
 * What: recruitmentChannelOptionsFromCatalog + resolveRecruitmentChannelLabel
 * Why: FR-HRM-SC-CH-01 · AC-SC-CH-03 · AC-SET-CONSUMER-CH-REC-01..03 — Candidate source code SoT
 * must_keep: DEPTCONREG1 sealed · empty → []; value=code; U65 no seed
 *
 * @CODE-MEMORY-CHANGE 2026-07-25 D-HRM-SETTINGS-MD-LEAVE-FE-01
 * change_mode: UPGRADE
 * What: leaveTypeOptionsFromCatalog / resolveLeaveTypeLabel — empty → []; no hardcode SoT
 * Why: AC-SET-FS-05 · BR-SET-MD-03
 *
 * @CODE-MEMORY-CHANGE 2026-07-25 D-HRM-SETTINGS-MD-DEPT-FE-01
 * change_mode: UPGRADE
 * What: departmentOptionsFromCatalog — keys departments|department_catalog|org_departments; empty → []
 * Why: AC-SET-FS-01/03/05 · FR-HRM-SC-MD-02 — cấm invent code từ nhãn / prop departments
 *
 * @CODE-MEMORY-CHANGE 2026-07-25 D-HRM-SETTINGS-MD-JT-FE-01
 * change_mode: UPGRADE
 * What: jobTitleOptionsFromCatalog + buildJobTemplatePositionFields — value=code SoT for JD templates
 * Why: AC-SET-FS-03 · FR-HRM-RC-JD-01 — BE rejects invent-only free text (HRM-REC-JD-POS)
 *
 * @CODE-MEMORY-CHANGE 2026-07-27 D-HRM-U72-LABEL-FE-02
 * change_mode: FIX
 * What: resolveLeaveTypeLabel / resolveJobTitleLabel unknown → «—» (parity resolveLeaveTypeDisplayLabel)
 * Why: QA soft residual R-U72-LEAVE-FALLBACK · AC-FD-U02 / BR-U72-NULL-01
 * must_keep: catalog empty → []; value=code SoT; U65 no seed
 *
 * @CODE-MEMORY-CHANGE 2026-07-27 D-FE-U72-SOFT-P2-01
 * change_mode: FIX
 * What: Keep unknown leave → «—»; covered by catalogSearchPicker + labelMaps vitest (C-U72-LEAVE-P3)
 * Why: QC soft residual positive path without seed
 * must_keep: LeaveTab resolveLeaveTypeLabel; empty catalog → []; U65 no seed
 *
 * @CODE-MEMORY-CHANGE 2026-07-28 D-FE-ERP-E1B-MD-PANEL-01
 * change_mode: ADD
 * What: E1-B key registry ≥10 families; DEC dual-read hr_decision_types+decision_types;
 *       findCatalogRowByKeys ưu tiên row có effectiveItems; merge + resolveWriteCatalogKey
 * Why: AC-SET-UI-01/05 · BR-HRM-SC-ALIAS-01/02 · SA storageKey prefer live DEC
 * SRS: BA_ERP_E1B_SRS_01 · DB/API_DESIGN_HRM_SETTINGS_E1B · sa-erp-e1b-design-review-01
 * must_keep: empty → []; value=code SoT; U65 no seed; không dual-write work_shifts
 *
 * @CODE-MEMORY-CHANGE 2026-07-28 D-FE-ERP-E1A-PICKER-01
 * change_mode: ADD
 * What: buildPositionKeyFields / buildDepartmentKeyFields / resolvePositionDisplayLabel
 * Why: FR-HRM-MD-BIND-E1A-01 — Network gửi *_key + snapshot; U72 không raw key
 * SRS: BA_ERP_E1A_SRS_01 · DB/API_DESIGN_HRM_MD_BIND_E1A · sa-erp-e1a-ack-01
 * must_keep: EmployeeForm JT/dept; LeaveTab; JobTemplates; cấm invent free-text SoT
 *
 * @CODE-MEMORY-CHANGE 2026-07-28 D-FE-ERP-E2-01
 * change_mode: ADD
 * What: payTypeOptionsFromCatalog / contractTypeOptionsFromCatalog + resolve labels
 * Why: FR-HRM-PAY-CLEAN-E2-01 · FR-HRM-CI-TYPE-E2-01 — nature=pay_types; A8 contract_types
 * SRS: BA_ERP_E2_SRS · DB/API_DESIGN_HRM_ERP_E2 · sa-erp-e2-ack-01
 * must_keep: E1-A position_key helpers; empty → []; cấm HARDCODE SoT khi items>0
 *
 * @CODE-MEMORY-CHANGE 2026-07-28 D-FE-ERP-E3-01
 * change_mode: ADD
 * What: insurers / insurance_types / kpi_library (+ jobGrades helper) options + resolve labels
 * Why: FR-HRM-INS-DEPTH-E3-01 · FR-HRM-PERF-SM-E3-01 — persist codes; empty→[] + CTA
 * SRS: BA_ERP_E3_SRS · DB/API_DESIGN_HRM_ERP_E3 · sa-erp-e3-ack-01
 * must_keep: E1 position_key · E2 pay_types/contract_types; cấm HARDCODE khi items>0
 *
 * @CODE-MEMORY-CHANGE 2026-08-01 D-HDSD-MUTATE-FE-DEPS-02
 * change_mode: ADD
 * What: Reconstruct lib (transitive of CatalogSearchPicker / AddInsuranceDialog) after Vite 500
 * Why: QA SMOKE-02 missing module on disk; restore from Cursor local history + call sites
 * must_keep: SoftDel · BH insurer/type helpers · TC-041 · U65 no seed
 *
 * @CODE-MEMORY-CHANGE 2026-08-08 PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-FE-01
 * change_mode: FIX
 * What: insuranceTypeOptionsFromCatalog marked REF-only / deprecated as sole picker SoT
 * Why: VAL-SI-CNS-04 · AC-PLT-SI-INS-01 — Nest F-SI-CAT-EFF is consumer SoT; insurers MD retain
 * must_keep: insurerOptionsFromCatalog · E1/E2 helpers · U65
 *
 * @CODE-MEMORY-CHANGE 2026-08-08 PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INSURER-CATALOG-FE-01
 * change_mode: FIX
 * What: insurerOptionsFromCatalog marked REF-only / deprecated as sole picker SoT
 * Why: VAL-SI-INR-CNS-01 · AC-PLT-SI-INSURER-01 — Nest F-SI-CAT-INS-EFF is consumer SoT
 * must_keep: SI type EFF helpers · E1/E2 helpers · U65
 *
 * @CODE-MEMORY-CHANGE 2026-08-11 D-FE-HRM-WH-POSITION-PICKER-01
 * change_mode: ADD
 * What: resolveWorkTimelinePositionFromCatalog — QTCT Vị trí payload alias (job_titles)
 * Why: AC-SET-CONSUMER-JT-WH-01 · UF-HRM-10 — trace WH consumer separate from generic E1-A
 * must_keep: buildPositionKeyFields semantics; settings_catalog_e2e_ready=false honesty; U65
 */

import { asLegalCompanyDisplayName } from '@/lib/employeeCompanyDisplayName';

export type CatalogPickerOption = {
  /** Persisted SoT key (code / id). */
  value: string;
  /** User-facing label. */
  label: string;
  /** Optional secondary search token (often same as value). */
  code?: string;
};

export type CatalogItemLike = {
  code: string;
  label: string;
  status?: string;
};

const SEARCH_REQUIRED_WHEN_COUNT_GT = 10;

export function catalogPickerRequiresSearch(optionCount: number): boolean {
  return optionCount > SEARCH_REQUIRED_WHEN_COUNT_GT;
}

/** Normalize query for case-insensitive substring match. */
export function normalizeCatalogSearchQuery(query: string): string {
  return query.trim().toLowerCase();
}

/**
 * Filter options by code OR label (AC-HRM-PICKER-01).
 * Empty query → return all active options (caller may still show search input).
 */
export function filterCatalogPickerOptions(
  options: readonly CatalogPickerOption[],
  query: string,
): CatalogPickerOption[] {
  const q = normalizeCatalogSearchQuery(query);
  if (!q) return [...options];
  return options.filter((opt) => {
    const code = (opt.code ?? opt.value).toLowerCase();
    const label = opt.label.toLowerCase();
    const value = opt.value.toLowerCase();
    return code.includes(q) || label.includes(q) || value.includes(q);
  });
}

/** Resolve selected value → option; unknown / empty → null (reject free-text SoT). */
export function resolveCatalogPickerSelection(
  options: readonly CatalogPickerOption[],
  value: string | null | undefined,
): CatalogPickerOption | null {
  const trimmed = value?.trim() ?? '';
  if (!trimmed) return null;
  return options.find((o) => o.value === trimmed) ?? null;
}

/** True when value is either empty or belongs to catalog (BR-HRM-MD-01). */
export function isCatalogPickerValueAllowed(
  options: readonly CatalogPickerOption[],
  value: string | null | undefined,
  opts?: { allowEmpty?: boolean },
): boolean {
  const trimmed = value?.trim() ?? '';
  if (!trimmed) return opts?.allowEmpty !== false;
  return resolveCatalogPickerSelection(options, trimmed) != null;
}

/** Map settings-catalog effective items → picker options (active only by default). */
export function toCatalogPickerOptions(
  items: readonly CatalogItemLike[],
  opts?: { includeInactive?: boolean },
): CatalogPickerOption[] {
  const out: CatalogPickerOption[] = [];
  const seen = new Set<string>();
  for (const item of items) {
    const code = item.code?.trim() ?? '';
    const label = item.label?.trim() || code;
    if (!code) continue;
    if (!opts?.includeInactive && item.status && item.status !== 'active') continue;
    if (seen.has(code)) continue;
    seen.add(code);
    out.push({ value: code, label, code });
  }
  return out;
}

/**
 * Company / ĐVTV picker options — reject Khối Plane B labels (FR-HRM-EMP-COL-01 path).
 * Returns null label rows dropped; empty name → skip.
 */
export function toCompanyCatalogPickerOptions(
  rows: readonly { id: string; name: string | null | undefined }[],
): CatalogPickerOption[] {
  const out: CatalogPickerOption[] = [];
  for (const row of rows) {
    const id = row.id?.trim() ?? '';
    if (!id) continue;
    const legal = asLegalCompanyDisplayName(row.name);
    if (!legal) continue;
    out.push({ value: id, label: legal, code: id });
  }
  return out;
}

type CatalogRowWithItems = {
  catalogKey: string;
  effectiveItems?: readonly CatalogItemLike[];
};

function normalizeCatalogLookupKey(key: string): string {
  return key.trim().toLowerCase();
}

/**
 * Find catalog row by preferred keys.
 * Prefer first alias that exists AND has effectiveItems.length > 0 (BR-HRM-SC-ALIAS-02);
 * else first existing row (may be empty — honest empty).
 */
export function findCatalogRowByKeys<T extends CatalogRowWithItems>(
  catalogs: readonly T[],
  keys: readonly string[],
): T | undefined {
  const normalizedKeys = keys.map(normalizeCatalogLookupKey);
  let emptyHit: T | undefined;
  for (const key of normalizedKeys) {
    const hit = catalogs.find((c) => normalizeCatalogLookupKey(c.catalogKey) === key);
    if (!hit) continue;
    if ((hit.effectiveItems?.length ?? 0) > 0) return hit;
    if (!emptyHit) emptyHit = hit;
  }
  return emptyHit;
}

/**
 * Merge effectiveItems across alias family; dedupe by code (first alias wins).
 * Settings list + Decisions picker must not MISS when only hr_decision_types has items.
 */
export function mergeEffectiveItemsByKeys(
  catalogs: readonly CatalogRowWithItems[],
  keys: readonly string[],
): CatalogItemLike[] {
  const seen = new Set<string>();
  const out: CatalogItemLike[] = [];
  for (const key of keys) {
    const nk = normalizeCatalogLookupKey(key);
    const hit = catalogs.find((c) => normalizeCatalogLookupKey(c.catalogKey) === nk);
    for (const item of hit?.effectiveItems ?? []) {
      const code = item.code?.trim() ?? '';
      if (!code || seen.has(code)) continue;
      seen.add(code);
      out.push(item);
    }
  }
  return out;
}

/**
 * Resolve write/storage catalog_key for Settings upsert.
 * Prefer live L1 key with items (DEC → hr_decision_types); else first existing alias; else fallback.
 */
export function resolveCatalogWriteKey(
  catalogs: readonly CatalogRowWithItems[],
  keys: readonly string[],
  fallbackWriteKey: string,
): string {
  let emptyHit: string | undefined;
  for (const key of keys) {
    const nk = normalizeCatalogLookupKey(key);
    const hit = catalogs.find((c) => normalizeCatalogLookupKey(c.catalogKey) === nk);
    if (!hit) continue;
    if ((hit.effectiveItems?.length ?? 0) > 0) return hit.catalogKey;
    if (!emptyHit) emptyHit = hit.catalogKey;
  }
  return emptyHit ?? fallbackWriteKey;
}

/**
 * Master-data catalog keys — E1-B Settings surface (≥10 buckets).
 * DEC: dual-read hr_decision_types + decision_types; write prefer hr_decision_types (SA).
 */
export const HRM_MASTER_DATA_CATALOG_KEYS = {
  positions: ['job_titles', 'positions', 'employee_positions'] as const,
  departments: ['departments', 'department_catalog', 'org_departments'] as const,
  leaveTypes: ['leave_types'] as const,
  decisionTypes: ['hr_decision_types', 'decision_types'] as const,
  contractTypes: ['contract_types'] as const,
  employmentTypes: ['employment_types', 'employment_type'] as const,
  shifts: ['shifts'] as const,
  jobGrades: ['job_grades', 'grades'] as const,
  recruitmentChannels: ['recruitment_channels', 'candidate_sources', 'channels'] as const,
  payTypes: ['pay_types', 'component_types', 'pay_natures', 'salary_component_types'] as const,
  salaryComponents: ['salary_components', 'payroll_components'] as const,
  /** E3 — insurer catalog (+ legacy aliases). */
  insurers: ['insurers', 'insurance_providers', 'bhxh_providers'] as const,
  insuranceTypes: ['insurance_types'] as const,
  kpiLibrary: ['kpi_library', 'kpi_metrics'] as const,
} as const;

/**
 * Leave type picker options — catalog SoT only (AC-SET-FS-05 / BR-SET-MD-03).
 * Empty / missing key → [] (honest empty + CTA); never hardcode bootstrap types.
 */
export function leaveTypeOptionsFromCatalog(
  catalogs: readonly { catalogKey: string; effectiveItems?: readonly CatalogItemLike[] }[],
): CatalogPickerOption[] {
  return toCatalogPickerOptions(
    mergeEffectiveItemsByKeys(catalogs, HRM_MASTER_DATA_CATALOG_KEYS.leaveTypes),
  );
}

/**
 * Department picker options — settings catalog SoT only (FR-HRM-SC-MD-02 / AC-SET-FS-01..05).
 * Empty / missing key → [] (honest empty + CTA); never invent code from display name.
 */
export function departmentOptionsFromCatalog(
  catalogs: readonly { catalogKey: string; effectiveItems?: readonly CatalogItemLike[] }[],
): CatalogPickerOption[] {
  return toCatalogPickerOptions(
    mergeEffectiveItemsByKeys(catalogs, HRM_MASTER_DATA_CATALOG_KEYS.departments),
  );
}

/** Resolve display label for a leave_type code from catalog options; unknown → «—». */
export function resolveLeaveTypeLabel(
  options: readonly CatalogPickerOption[],
  leaveTypeCode: string | null | undefined,
): string {
  const code = leaveTypeCode?.trim() ?? '';
  if (!code) return '—';
  return resolveCatalogPickerSelection(options, code)?.label ?? '—';
}

/**
 * Job title / position picker options — settings catalog SoT only (FR-HRM-RC-JD-01 / AC-SET-FS-03).
 * Keys: job_titles | positions | employee_positions. Empty / missing → [] (honest empty + CTA).
 */
export function jobTitleOptionsFromCatalog(
  catalogs: readonly { catalogKey: string; effectiveItems?: readonly CatalogItemLike[] }[],
): CatalogPickerOption[] {
  return toCatalogPickerOptions(
    mergeEffectiveItemsByKeys(catalogs, HRM_MASTER_DATA_CATALOG_KEYS.positions),
  );
}

/** Resolve display label for a job_titles code; unknown → «—». */
export function resolveJobTitleLabel(
  options: readonly CatalogPickerOption[],
  positionCode: string | null | undefined,
): string {
  const code = positionCode?.trim() ?? '';
  if (!code) return '—';
  return resolveCatalogPickerSelection(options, code)?.label ?? '—';
}

/**
 * Build JD template position payload: catalog code required; label optional denormalized.
 * Returns null when code missing / not in catalog (never invent).
 */
export function buildJobTemplatePositionFields(
  positionCode: string | null | undefined,
  options: readonly CatalogPickerOption[],
): { position_code: string; position_name: string } | null {
  const hit = resolveCatalogPickerSelection(options, positionCode);
  if (!hit) return null;
  return { position_code: hit.value, position_name: hit.label };
}

/**
 * E1-A MD-BIND — persist position_key (catalog code) + label snapshot for Network body.
 * Returns null when code missing / not in catalog (never invent free-text SoT).
 */
export function buildPositionKeyFields(
  positionKey: string | null | undefined,
  options: readonly CatalogPickerOption[],
): { position_key: string; position: string } | null {
  const hit = resolveCatalogPickerSelection(options, positionKey);
  if (!hit) return null;
  return { position_key: hit.value, position: hit.label };
}

/**
 * QTCT (work timeline) — Vị trí từ catalog `job_titles` (AC-SET-CONSUMER-JT-WH-01).
 * POST/PATCH body: position_key + position snapshot; cấm label-only / free-text SoT.
 */
export function resolveWorkTimelinePositionFromCatalog(
  positionKey: string | null | undefined,
  options: readonly CatalogPickerOption[],
): { position_key: string; position: string } | null {
  return buildPositionKeyFields(positionKey, options);
}

/**
 * E1-A MD-BIND — persist department_key (catalog code) + label snapshot.
 * Returns null when code missing / not in catalog (cấm name-as-value).
 */
export function buildDepartmentKeyFields(
  departmentKey: string | null | undefined,
  options: readonly CatalogPickerOption[],
): { department_key: string; department: string } | null {
  const hit = resolveCatalogPickerSelection(options, departmentKey);
  if (!hit) return null;
  return { department_key: hit.value, department: hit.label };
}

/** Resolve display label for a departments code; unknown → «—». */
export function resolveDepartmentLabel(
  options: readonly CatalogPickerOption[],
  departmentCode: string | null | undefined,
): string {
  const code = departmentCode?.trim() ?? '';
  if (!code) return '—';
  return resolveCatalogPickerSelection(options, code)?.label ?? '—';
}

/**
 * Pay nature picker — Settings `pay_types` (+ aliases). Persist value=code.
 * Empty → [] (honest empty + CTA); never HARDCODE VI list as SoT (AC-E2-PAY-NATURE-01).
 */
export function payTypeOptionsFromCatalog(
  catalogs: readonly { catalogKey: string; effectiveItems?: readonly CatalogItemLike[] }[],
): CatalogPickerOption[] {
  return toCatalogPickerOptions(
    mergeEffectiveItemsByKeys(catalogs, HRM_MASTER_DATA_CATALOG_KEYS.payTypes),
  );
}

/** Resolve pay_types code → VI label; unknown → «—» (U72). */
export function resolvePayTypeLabel(
  options: readonly CatalogPickerOption[],
  payTypeCode: string | null | undefined,
): string {
  const code = payTypeCode?.trim() ?? '';
  if (!code) return '—';
  return resolveCatalogPickerSelection(options, code)?.label ?? '—';
}

/**
 * Salary component catalog picker — Settings `salary_components` (+ payroll_components).
 * @deprecated Option B (PAY-CATALOG-CNS-FE-01): consumer SoT = Nest
 * `GET /api/hrm/payroll/salary-components` via `nestSalaryComponentsToPickerOptions` /
 * `useSalaryComponentsEffective`. Settings extension = REF/alias only (L-PAY-AC-02) —
 * **FORBIDDEN** as sole consumer picker SoT. Kept for unit tests / legacy REF reads.
 */
export function salaryComponentOptionsFromCatalog(
  catalogs: readonly { catalogKey: string; effectiveItems?: readonly CatalogItemLike[] }[],
): CatalogPickerOption[] {
  return toCatalogPickerOptions(
    mergeEffectiveItemsByKeys(catalogs, HRM_MASTER_DATA_CATALOG_KEYS.salaryComponents),
  );
}

/** Resolve salary_components code → VI label; unknown → «—» (U72). */
export function resolveSalaryComponentLabel(
  options: readonly CatalogPickerOption[],
  componentCode: string | null | undefined,
): string {
  const code = componentCode?.trim() ?? '';
  if (!code) return '—';
  return resolveCatalogPickerSelection(options, code)?.label ?? '—';
}

/**
 * Build payroll instance fields from catalog selection — code SoT + name snapshot.
 * Returns null when code missing / not in catalog (never invent free-text SoT).
 */
export function buildSalaryComponentCatalogFields(
  componentCode: string | null | undefined,
  options: readonly CatalogPickerOption[],
): { code: string; name: string } | null {
  const hit = resolveCatalogPickerSelection(options, componentCode);
  if (!hit) return null;
  return { code: hit.value, name: hit.label };
}

/**
 * Contract type picker — Settings `contract_types`. Persist value=code (closes R-E1A-A8).
 * Empty → []; cấm HARDCODE fallback khi product locks required (AC-E2-CI-TYPE-01).
 */
export function contractTypeOptionsFromCatalog(
  catalogs: readonly { catalogKey: string; effectiveItems?: readonly CatalogItemLike[] }[],
): CatalogPickerOption[] {
  return toCatalogPickerOptions(
    mergeEffectiveItemsByKeys(catalogs, HRM_MASTER_DATA_CATALOG_KEYS.contractTypes),
  );
}

/** Resolve contract_types code → VI label; unknown → «—» (U72). */
export function resolveContractTypeCatalogLabel(
  options: readonly CatalogPickerOption[],
  contractTypeCode: string | null | undefined,
): string {
  const code = contractTypeCode?.trim() ?? '';
  if (!code) return '—';
  return resolveCatalogPickerSelection(options, code)?.label ?? '—';
}

function foldContractTypeLegacyKey(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/đ/g, 'd')
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/\s+/g, ' ');
}

/** Legacy list labels / slugs → catalog code (QACONPAYSTQC1 · NV001-HD «Hợp đồng 3 năm»). */
export function inferContractTypeCatalogCodeFromLegacy(
  raw: string,
  options: readonly CatalogPickerOption[],
): CatalogPickerOption | null {
  const key = foldContractTypeLegacyKey(raw);
  if (!key) return null;

  const pick = (pred: (o: CatalogPickerOption) => boolean) => options.find(pred) ?? null;

  if (key.includes('3 nam') || key.includes('3y') || key.includes('3_year') || key.includes('36 thang')) {
    return (
      pick((o) => o.value.includes('36') || foldContractTypeLegacyKey(o.label).includes('36 thang')) ??
      pick((o) => foldContractTypeLegacyKey(o.label).includes('3 nam'))
    );
  }
  if (key.includes('2 nam') || key.includes('2y') || key.includes('2_year') || key.includes('24 thang')) {
    return pick((o) => o.value.includes('24') || foldContractTypeLegacyKey(o.label).includes('24 thang'));
  }
  if (key.includes('1 nam') || key.includes('1y') || key.includes('1_year') || key.includes('12 thang')) {
    return (
      pick((o) => o.value.includes('12') || foldContractTypeLegacyKey(o.label).includes('12 thang')) ??
      pick((o) => foldContractTypeLegacyKey(o.label).includes('1 nam'))
    );
  }
  if (key.includes('thu viec') || key === 'probation' || key === 'hdtv_60') {
    return pick((o) => o.value.startsWith('HDTV') || foldContractTypeLegacyKey(o.label).includes('thu viec'));
  }
  if (key.includes('hoc viec') || key === 'apprentice' || key === 'hdhv') {
    return pick((o) => o.value === 'HDHV' || foldContractTypeLegacyKey(o.label).includes('hoc viec'));
  }
  if (
    key.includes('khong thoi han') ||
    key.includes('khong xac dinh') ||
    key === 'indefinite' ||
    key === 'permanent' ||
    key === 'hdld_kth'
  ) {
    return pick(
      (o) =>
        o.value === 'HDLD_KTH' ||
        foldContractTypeLegacyKey(o.label).includes('khong xac dinh') ||
        foldContractTypeLegacyKey(o.label).includes('khong thoi han'),
    );
  }
  if (key === 'fixed_term' || key.includes('co thoi han')) {
    return pick((o) => o.value === 'HDLD_XDHN_12') ?? pick((o) => o.value.startsWith('HDLD_XDHN'));
  }

  if (key.length >= 4) {
    const byOverlap = options.find((o) => {
      const ol = foldContractTypeLegacyKey(o.label);
      return ol.includes(key) || key.includes(ol);
    });
    if (byOverlap) return byOverlap;
  }

  return null;
}

/**
 * Map stored contract_type (code or legacy VI label) → catalog code for picker + PATCH.
 * EFF>0: match value/code (case-insensitive), exact label, or legacy phrase; unknown → ''.
 * EFF=0: keep raw when no catalog hit (empty CTA path).
 */
export function resolveContractTypeEditValue(
  options: readonly CatalogPickerOption[],
  storedContractType: string | null | undefined,
  catalogBound: boolean,
): string {
  const raw = (storedContractType ?? '').trim();
  if (!raw) return '';
  const byCode = options.find(
    (o) =>
      o.value === raw ||
      o.code === raw ||
      o.value.toLowerCase() === raw.toLowerCase() ||
      (o.code ?? '').toLowerCase() === raw.toLowerCase(),
  );
  if (byCode) return byCode.value;
  const byLabel = options.find((o) => o.label.trim() === raw);
  if (byLabel) return byLabel.value;
  const legacy = inferContractTypeCatalogCodeFromLegacy(raw, options);
  if (legacy) return legacy.value;
  if (!catalogBound) return raw;
  return '';
}

/**
 * Insurer picker — Settings MD `insurers` REF helper only.
 * @deprecated Consumer SoT = Nest GET …/insurers/effective (F-SI-CAT-INS-EFF-01).
 * Do not use as sole picker SoT when Nest EFF is live (VAL-SI-INR-CNS-01 · AC-PLT-SI-INSURER-01).
 * Persist value=code (AC-INS-02 deepen).
 */
export function insurerOptionsFromCatalog(
  catalogs: readonly { catalogKey: string; effectiveItems?: readonly CatalogItemLike[] }[],
): CatalogPickerOption[] {
  return toCatalogPickerOptions(
    mergeEffectiveItemsByKeys(catalogs, HRM_MASTER_DATA_CATALOG_KEYS.insurers),
  );
}

export function resolveInsurerLabel(
  options: readonly CatalogPickerOption[],
  insurerCode: string | null | undefined,
): string {
  const code = insurerCode?.trim() ?? '';
  if (!code) return '—';
  return resolveCatalogPickerSelection(options, code)?.label ?? '—';
}

/**
 * Insurance type picker — Settings MD `insurance_types` REF helper only.
 * @deprecated Consumer SoT = Nest GET …/insurance-types/effective (F-SI-CAT-EFF-01).
 * Do not use as sole picker SoT when Nest EFF is live (VAL-SI-CNS-04 · AC-PLT-SI-INS-01).
 * Persist value=code (AC-INS-03 deepen).
 */
export function insuranceTypeOptionsFromCatalog(
  catalogs: readonly { catalogKey: string; effectiveItems?: readonly CatalogItemLike[] }[],
): CatalogPickerOption[] {
  return toCatalogPickerOptions(
    mergeEffectiveItemsByKeys(catalogs, HRM_MASTER_DATA_CATALOG_KEYS.insuranceTypes),
  );
}

export function resolveInsuranceTypeCatalogLabel(
  options: readonly CatalogPickerOption[],
  typeCode: string | null | undefined,
): string {
  const code = typeCode?.trim() ?? '';
  if (!code) return '—';
  return resolveCatalogPickerSelection(options, code)?.label ?? '—';
}

/**
 * KPI library picker — Settings `kpi_library` (+ kpi_metrics). Persist kpi_code (AC-PERF-04).
 */
export function kpiLibraryOptionsFromCatalog(
  catalogs: readonly { catalogKey: string; effectiveItems?: readonly CatalogItemLike[] }[],
): CatalogPickerOption[] {
  return toCatalogPickerOptions(
    mergeEffectiveItemsByKeys(catalogs, HRM_MASTER_DATA_CATALOG_KEYS.kpiLibrary),
  );
}

export function resolveKpiLibraryLabel(
  options: readonly CatalogPickerOption[],
  kpiCode: string | null | undefined,
): string {
  const code = kpiCode?.trim() ?? '';
  if (!code) return '—';
  return resolveCatalogPickerSelection(options, code)?.label ?? '—';
}

/**
 * Job grade picker — Settings `job_grades` (AC-PERF-05 optional bind).
 */
export function jobGradeOptionsFromCatalog(
  catalogs: readonly { catalogKey: string; effectiveItems?: readonly CatalogItemLike[] }[],
): CatalogPickerOption[] {
  return toCatalogPickerOptions(
    mergeEffectiveItemsByKeys(catalogs, HRM_MASTER_DATA_CATALOG_KEYS.jobGrades),
  );
}

export function resolveJobGradeLabel(
  options: readonly CatalogPickerOption[],
  gradeCode: string | null | undefined,
): string {
  const code = gradeCode?.trim() ?? '';
  if (!code) return '—';
  return resolveCatalogPickerSelection(options, code)?.label ?? '—';
}

/**
 * Recruitment channel / candidate source picker — Settings catalog SoT (FR-HRM-SC-CH-01).
 * Keys: recruitment_channels | candidate_sources | channels. Empty → [] (honest empty + CTA).
 */
export function recruitmentChannelOptionsFromCatalog(
  catalogs: readonly { catalogKey: string; effectiveItems?: readonly CatalogItemLike[] }[],
): CatalogPickerOption[] {
  return toCatalogPickerOptions(
    mergeEffectiveItemsByKeys(catalogs, HRM_MASTER_DATA_CATALOG_KEYS.recruitmentChannels),
  );
}

/** Resolve recruitment_channels code → VI label; unknown → «—» (U72). */
export function resolveRecruitmentChannelLabel(
  options: readonly CatalogPickerOption[],
  channelCode: string | null | undefined,
): string {
  const code = channelCode?.trim() ?? '';
  if (!code) return '—';
  return resolveCatalogPickerSelection(options, code)?.label ?? '—';
}

/**
 * U72 list/detail display for position: catalog label by key → legacy snapshot → «—».
 * Never returns raw catalog code.
 */
export function resolvePositionDisplayLabel(
  options: readonly CatalogPickerOption[],
  positionKey: string | null | undefined,
  snapshotLabel?: string | null,
): string {
  const fromCatalog = resolveJobTitleLabel(options, positionKey);
  if (fromCatalog !== '—') return fromCatalog;
  const snap = snapshotLabel?.trim() ?? '';
  if (snap && snap !== positionKey?.trim()) return snap;
  if (snap && !positionKey?.trim()) return snap;
  return '—';
}
