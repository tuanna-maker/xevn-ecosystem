/**
 * @CODE-MEMORY
 * Screen:     Command Center → Cài đặt → Áp dụng danh mục HRM
 * UC:         XBOS-DM-HRM-07 · FR-XBOS-CTRL-01
 * BR:         G-BM-REC-01 Option B fan-out · BR-HRM-XBOS-CTRL-ALIAS-02
 * SRS:        docs/hrm/DANH_MUC_XBOS_CHO_HRM.md §14 XBOS-DM-HRM-07
 *             docs/program/deltas/BA_ERP_XBOS_CTRL_SPEC_01_20260728.md §2.1–2.4
 * TechSpec:   docs/xbos/TECHSPEC_XBOS_APPLY_TO_MEMBERS_EXPAND.md
 * API:        docs/xbos/API_DESIGN_XBOS_APPLY_TO_MEMBERS_EXPAND.md · OpenAPI configSyncApplyCatalogToMembers
 * Purpose:    FE client POST apply-to-members + payload builders for holding → ĐVTV.
 * WorkItem:   BM-FE-CFG-APPLY-MEMBERS-01
 * Coded:      2026-07-22
 * Callers:    ApplyCatalogToMembersPanel
 * Callees:    POST /api/xbos/config-sync/catalog/{key}/apply-to-members · GET catalog
 * must_keep:  source holding · no seed · U72 VI labels (no paren slug) · allow-list mirrors BE only
 * LastVerified: apps/web/web-portal/src/integrations/configSyncApplyMembers.test.ts
 *
 * @CODE-MEMORY-CHANGE 2026-07-29 D-FE-XBOS-CTRL-G1-ALLOWLIST-01
 * change_mode: ADD
 * What: Mirror BE APPLY_TO_MEMBERS P0∪P1 (10 keys); alias map + DEC dual-read GET;
 *       apply path writeKey = source L0 catalogKey (SA-DEC-WRITE-01 / hr_decision_types)
 * Why:  BE G1 READY — portal dropdown still AS-IS 3 keys blocked departments/leave_types/P1
 * SRS:  BA_ERP_XBOS_CTRL_SPEC §2.1–2.2 · HRM_ERP_XBOS_CTRL_SPEC_SYNTH
 * API:  docs/xbos/API_DESIGN_XBOS_APPLY_TO_MEMBERS_EXPAND.md §1
 * must_keep: BM-FE-CFG-APPLY-MEMBERS-01 builders · U72 labels · U65 no seed · P2 HOLD (salary_components…)
 */
import type { Company } from '../data/mock-data';
import {
  GROUP_HOLDING_COMPANY_ID,
  MASTER_TENANT_ID,
  MEMBER_DEFAULT_COMPANY_ID,
} from '../constants/tenant';
import { GROUP_HOLDING_ROOT_ID } from './tenantScopeApi';
import { xbosFetch, xbosGetData } from './xbosHttp';

/**
 * Allow-list — mirrors BE APPLY_TO_MEMBERS_CATALOG_ALLOWLIST (E-XBOS-CTRL-G1 P0∪P1).
 * P2 HOLD: salary_components, insurers, insurance_types, kpi_library, …
 */
export const APPLY_TO_MEMBERS_CATALOG_KEYS = [
  // P0
  'job_titles',
  'recruitment_channels',
  'job_grades',
  'departments',
  'leave_types',
  // P1
  'contract_types',
  'employment_types',
  'pay_types',
  'shifts',
  'decision_types',
] as const;

export type ApplyToMembersCatalogKey = (typeof APPLY_TO_MEMBERS_CATALOG_KEYS)[number];

export const APPLY_TO_MEMBERS_CATALOG_LABELS: Record<ApplyToMembersCatalogKey, string> = {
  job_titles: 'Chức danh',
  recruitment_channels: 'Nguồn ứng viên',
  job_grades: 'Ngạch bậc chức danh',
  departments: 'Phòng ban',
  leave_types: 'Loại nghỉ phép',
  contract_types: 'Loại hợp đồng',
  employment_types: 'Loại hình lao động',
  pay_types: 'Bản chất / loại TP lương',
  shifts: 'Ca làm việc',
  decision_types: 'Loại quyết định',
};

/**
 * Path aliases → canonical allow-list key (mirrors BE APPLY_TO_MEMBERS_CATALOG_ALIASES).
 * Dropdown uses canonical; GET/POST may use alias sibling (DEC writeKey).
 */
export const APPLY_TO_MEMBERS_CATALOG_ALIASES: Readonly<Record<string, ApplyToMembersCatalogKey>> = {
  positions: 'job_titles',
  employee_positions: 'job_titles',
  candidate_sources: 'recruitment_channels',
  grades: 'job_grades',
  department_catalog: 'departments',
  org_departments: 'departments',
  employment_type: 'employment_types',
  component_types: 'pay_types',
  pay_natures: 'pay_types',
  hr_decision_types: 'decision_types',
  work_shifts: 'shifts',
};

/** Source L0 storage try order — DEC prefer live E1-B key first (SA-DEC-WRITE-01). */
const APPLY_SOURCE_STORAGE_TRY_LIST: Readonly<
  Partial<Record<ApplyToMembersCatalogKey, readonly string[]>>
> = {
  decision_types: ['hr_decision_types', 'decision_types'],
};

export function resolveApplyToMembersCanonicalKey(key: string): string {
  const normalized = key.trim().toLowerCase();
  return APPLY_TO_MEMBERS_CATALOG_ALIASES[normalized] ?? normalized;
}

export function isApplyToMembersCatalogKey(key: string): key is ApplyToMembersCatalogKey {
  const canonical = resolveApplyToMembersCanonicalKey(key);
  return (APPLY_TO_MEMBERS_CATALOG_KEYS as readonly string[]).includes(canonical);
}

/**
 * Bind apply path key to source L0 header when it is an alias sibling of the
 * selected canonical (e.g. decision_types UI → POST hr_decision_types).
 */
export function resolveApplyWriteKey(
  catalogKey: ApplyToMembersCatalogKey,
  sourceCatalogKey?: string | null,
): string {
  const source = sourceCatalogKey?.trim().toLowerCase();
  if (source && resolveApplyToMembersCanonicalKey(source) === catalogKey) {
    return source;
  }
  return catalogKey;
}

function storageTryListFor(catalogKey: ApplyToMembersCatalogKey): readonly string[] {
  return APPLY_SOURCE_STORAGE_TRY_LIST[catalogKey] ?? [catalogKey];
}

export type ApplyCatalogMemberTarget = {
  tenantId: string;
  companyId: string;
};

export type ApplyCatalogToMembersBody = {
  tenantId: string;
  companyId: string;
  targets: ApplyCatalogMemberTarget[];
  actor?: string;
};

export type ConfigCatalogSnapshot = {
  catalogKey: string;
  tenantId: string;
  companyId: string;
  name?: string;
  version: number;
  checksum: string;
  items: Array<{ code: string; label: string; status?: string }>;
};

export type ApplyCatalogToMembersResult = {
  catalogKey: string;
  writeKey?: string;
  source: {
    tenantId: string;
    companyId: string;
    version: number;
    checksum: string;
    itemCount: number;
    catalogKey?: string;
  };
  applied: Array<{
    tenantId: string;
    companyId: string;
    version: number;
    checksum: string;
  }>;
  appliedCount: number;
};

/** Subsidiary rows only — exclude holding synthetic root. */
export function listApplyMemberCandidates(companies: Company[]): Company[] {
  return companies.filter((row) => {
    if (!row?.id?.trim()) return false;
    if (row.id === GROUP_HOLDING_ROOT_ID) return false;
    if (row.entityLevel === 'parent') return false;
    return true;
  });
}

/**
 * Map Command Center member rows → apply-to-members targets.
 * - Distinct member tenant → `{ tenantId, companyId: main }` (BE jest / xe-du-lich pattern).
 * - Same master tenant legal UUID partition → `{ tenantId: xevn, companyId: uuid }` (QA VISUN).
 */
export function buildApplyCatalogTargets(members: Company[]): ApplyCatalogMemberTarget[] {
  const seen = new Set<string>();
  const out: ApplyCatalogMemberTarget[] = [];
  for (const member of listApplyMemberCandidates(members)) {
    const tenantId = (member.tenantId?.trim() || MASTER_TENANT_ID).toLowerCase();
    const companyId =
      tenantId === MASTER_TENANT_ID
        ? member.id.trim().toLowerCase()
        : MEMBER_DEFAULT_COMPANY_ID;
    const key = `${tenantId}::${companyId}`;
    if (seen.has(key)) continue;
    if (tenantId === MASTER_TENANT_ID && companyId === GROUP_HOLDING_COMPANY_ID) continue;
    seen.add(key);
    out.push({ tenantId, companyId });
  }
  return out;
}

export function buildApplyCatalogToMembersBody(options: {
  selectedMembers: Company[];
  actor?: string;
  sourceTenantId?: string;
  sourceCompanyId?: string;
}): ApplyCatalogToMembersBody {
  const targets = buildApplyCatalogTargets(options.selectedMembers);
  return {
    tenantId: (options.sourceTenantId ?? MASTER_TENANT_ID).toLowerCase(),
    companyId: (options.sourceCompanyId ?? GROUP_HOLDING_COMPANY_ID).toLowerCase(),
    targets,
    ...(options.actor?.trim() ? { actor: options.actor.trim() } : {}),
  };
}

async function fetchConfigCatalogSnapshot(
  storageKey: string,
  tenantId: string,
  companyId: string,
): Promise<ConfigCatalogSnapshot> {
  const q = new URLSearchParams({
    target: 'hrm',
    tenantId,
    companyId,
  });
  const data = await xbosGetData<ConfigCatalogSnapshot>(
    `/config-sync/catalog/${encodeURIComponent(storageKey)}?${q.toString()}`,
    {
      scope: 'config-sync.catalog.get',
      tenantId,
      companyId,
    },
  );
  return {
    ...data,
    catalogKey: data.catalogKey ?? storageKey,
    items: Array.isArray(data.items) ? data.items : [],
  };
}

export async function fetchConfigCatalogForHrm(
  catalogKey: ApplyToMembersCatalogKey,
  tenantId = MASTER_TENANT_ID,
  companyId = GROUP_HOLDING_COMPANY_ID,
): Promise<ConfigCatalogSnapshot> {
  const tryList = storageTryListFor(catalogKey);
  let lastError: unknown;
  for (const storageKey of tryList) {
    try {
      return await fetchConfigCatalogSnapshot(storageKey, tenantId, companyId);
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError instanceof Error
    ? lastError
    : new Error('Không tải được danh mục nguồn tập đoàn');
}

export async function applyCatalogToMembers(
  catalogKey: ApplyToMembersCatalogKey,
  body: ApplyCatalogToMembersBody,
  options?: { writeKey?: string | null },
): Promise<ApplyCatalogToMembersResult> {
  if (!isApplyToMembersCatalogKey(catalogKey)) {
    throw new Error(`Catalog '${catalogKey}' không nằm trong allow-list áp dụng ĐVTV`);
  }
  if (!body.targets?.length) {
    throw new Error('Chọn ít nhất một đơn vị thành viên để áp dụng');
  }
  const pathKey = resolveApplyWriteKey(catalogKey, options?.writeKey);
  if (!isApplyToMembersCatalogKey(pathKey)) {
    throw new Error(`Catalog '${pathKey}' không nằm trong allow-list áp dụng ĐVTV`);
  }
  const envelope = await xbosFetch<{
    success?: boolean;
    code?: string;
    message?: string;
    data?: ApplyCatalogToMembersResult;
  }>(`/config-sync/catalog/${encodeURIComponent(pathKey)}/apply-to-members`, {
    method: 'POST',
    scope: 'config-sync.apply-to-members',
    tenantId: body.tenantId,
    companyId: body.companyId,
    body: JSON.stringify(body),
  });
  const data = envelope?.data;
  if (!data || typeof data.appliedCount !== 'number') {
    throw new Error(envelope?.message || 'Phản hồi apply-to-members thiếu appliedCount');
  }
  return data;
}

/** User-facing note when Group CEO cannot GET member-scoped catalog (409). */
export const MEMBER_SCOPE_409_NOTE =
  'CEO tập đoàn không xem được danh mục theo companyId đơn vị thành viên (HTTP 409 SCOPE_CONTEXT_MISMATCH). Sau khi áp dụng, xác nhận bằng persona CEO công ty thành viên hoặc chuyển membership — không dùng seed.';
