/**
 * AC-FID-16 / BR-LINK-03 — transactional fields must store synced_catalogs item codes.
 * work_item_id: P1-HRM-H26-AC-FID-16-LINEAGE-FIX
 */
import { UAT_ROLES } from './uat-workforce.mjs';
import { HRM_CONTRACT_TYPES, ROLE_LABELS_VI } from './vietnamese-workforce-data.mjs';

/** Leave type codes in synced `leave_types` snapshot (LVT_01..LVT_04). */
export const HRM_LEAVE_TYPE_CODES = ['LVT_01', 'LVT_02', 'LVT_03', 'LVT_04'];

/** Candidate source codes in synced `candidate_sources` snapshot (CSO_01..CSO_04). */
export const HRM_CANDIDATE_SOURCE_CODES = ['CSO_01', 'CSO_02', 'CSO_03', 'CSO_04'];

/** English / legacy seed enums → catalog codes. */
export const LEAVE_TYPE_TO_CATALOG_CODE = {
  annual: 'LVT_01',
  sick: 'LVT_02',
  personal: 'LVT_03',
  maternity: 'LVT_03',
  unpaid: 'LVT_04',
  LVT_01: 'LVT_01',
  LVT_02: 'LVT_02',
  LVT_03: 'LVT_03',
  LVT_04: 'LVT_04',
};

export const CANDIDATE_SOURCE_TO_CATALOG_CODE = {
  website: 'CSO_01',
  referral: 'CSO_02',
  headhunt: 'CSO_03',
  job_board: 'CSO_04',
  CSO_01: 'CSO_01',
  CSO_02: 'CSO_02',
  CSO_03: 'CSO_03',
  CSO_04: 'CSO_04',
};

const CONTRACT_CODE_SET = new Set(HRM_CONTRACT_TYPES.map((t) => t.key));

/** Vietnamese labels + shorthand → HDLD_* keys. */
export const CONTRACT_TYPE_TO_CATALOG_CODE = (() => {
  const map = {};
  for (const t of HRM_CONTRACT_TYPES) {
    map[t.key] = t.key;
    map[t.label] = t.key;
  }
  Object.assign(map, {
    'HĐ không thời hạn': 'HDLD_KTH',
    'HĐ 1 năm': 'HDLD_XDHN_12',
    'HĐ 3 năm': 'HDLD_XDHN_36',
    'HDLD 12 thang': 'HDLD_XDHN_12',
    'HDLD 12 tháng': 'HDLD_XDHN_12',
    'HDLD 36 thang': 'HDLD_XDHN_36',
    'HDLD 36 tháng': 'HDLD_XDHN_36',
    'Thử việc': 'HDTV_60',
    'Học việc': 'HDHV',
    labor_contract: 'HDLD_XDHN_12',
  });
  return map;
})();

export function buildUatJobTitleCatalogItems() {
  return UAT_ROLES.map((code) => ({
    code,
    label: ROLE_LABELS_VI[code] ?? code,
    status: 'active',
  }));
}

export function resolveContractTypeCode(raw) {
  const value = String(raw ?? '').trim();
  if (!value) return value;
  if (CONTRACT_CODE_SET.has(value)) return value;
  return CONTRACT_TYPE_TO_CATALOG_CODE[value] ?? value;
}

export function resolveLeaveTypeCode(raw) {
  const value = String(raw ?? '').trim();
  if (!value) return value;
  const key = value.toLowerCase();
  return LEAVE_TYPE_TO_CATALOG_CODE[key] ?? LEAVE_TYPE_TO_CATALOG_CODE[value] ?? value;
}

export function resolveCandidateSourceCode(raw) {
  const value = String(raw ?? '').trim();
  if (!value) return value;
  const key = value.toLowerCase();
  return CANDIDATE_SOURCE_TO_CATALOG_CODE[key] ?? CANDIDATE_SOURCE_TO_CATALOG_CODE[value] ?? value;
}

export function mergeCatalogItems(existingItems, requiredItems) {
  const byCode = new Map();
  for (const item of existingItems ?? []) {
    if (item?.code) byCode.set(String(item.code), { ...item, code: String(item.code) });
  }
  for (const item of requiredItems) {
    byCode.set(item.code, { ...byCode.get(item.code), ...item });
  }
  return [...byCode.values()].sort((a, b) => a.code.localeCompare(b.code));
}

export function patchJobTitlesPayload(payload, companySlug, tenantId) {
  const items = mergeCatalogItems(payload?.items, buildUatJobTitleCatalogItems());
  return {
    ...(payload && typeof payload === 'object' ? payload : {}),
    contractVersion: payload?.contractVersion ?? 'xbos-config-v1',
    checksumAlgorithm: payload?.checksumAlgorithm ?? 'sha256:items-canonical-v1',
    tenantId: tenantId ?? payload?.tenantId ?? 'xevn',
    companyId: companySlug,
    key: 'job_titles',
    name: payload?.name ?? 'Thư viện mẫu chức danh',
    domain: payload?.domain ?? 'human_resources',
    assignedTo: payload?.assignedTo ?? ['hrm', 'xbos', 'web-portal'],
    version: (payload?.version ?? 1) + 0,
    checksum: payload?.checksum ?? `seed:job_titles:${companySlug}`,
    updatedAt: new Date().toISOString(),
    items,
  };
}
