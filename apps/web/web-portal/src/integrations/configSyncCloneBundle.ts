/**
 * @CODE-MEMORY
 * Screen:     Command Center → Cài đặt → Sao chép bộ danh mục LOG
 * UC:         XBOS-DM-LOG-09
 * BR:         BR-XBOS-COPY-01 · ADR-GROUP-CEO-MAIN-HOLDING-SCOPE
 * SRS:        docs/logistics/BANG_TONG_HOP_USECASE_LOGISTIC.md STT local 9 · PHASE1 STT 106
 * TechSpec:   docs/logistics/TECHSPEC_M03_DM_LOG_P1.md §2 · by-uc XBOS-DM-LOG-09
 * API:        POST /api/xbos/config-sync/catalogs/clone-bundle → XBOS-CFG-205 / CFG-009
 * Purpose:    FE client + payload builders cho sao chép bộ DM Logistics CT→CT
 *             (domains=['logistics']). Không đụng apply-to-members (DM-HRM-07)
 *             hay single-key POST …/catalog/{key}/clone (DM-09).
 * WorkItem:   PO-UC-TC-W3-FE-LOG09
 * Coded:      2026-08-04
 * Callers:    CloneCatalogBundlePanel
 * Callees:    POST /api/xbos/config-sync/catalogs/clone-bundle · GET catalogs
 * must_keep:  apply-to-members · DM-09 single-key clone · Leave L2 · U65 no seed
 * LastVerified: apps/web/web-portal/src/integrations/configSyncCloneBundle.test.ts
 *
 * @CODE-MEMORY-CHANGE 2026-08-04 PO-UC-TC-W3-FE-LOG09
 * change_mode: ADD
 * What: Client clone-bundle logistics + dest company resolve + F5 list helper
 * Why: QA W3 LOG-09 API PASS · FE wizard GAP
 * must_keep: domains=['logistics'] for LOG spoke; ≠ apply-to-members; ≠ single-key clone
 */
import type { Company } from '../data/mock-data';
import {
  GROUP_HOLDING_COMPANY_ID,
  MASTER_TENANT_ID,
  MEMBER_DEFAULT_COMPANY_ID,
} from '../constants/tenant';
import { GROUP_HOLDING_ROOT_ID } from './tenantScopeApi';
import { xbosFetch, xbosGetData } from './xbosHttp';

/** LOG-09 domain filter — fixed for logistics spoke (product HOLD: no workflow_definition). */
export const CLONE_BUNDLE_LOGISTICS_DOMAINS = ['logistics'] as const;

export type CloneBundleConflictPolicy = 'fail' | 'skip' | 'overwrite';

export type CloneCatalogBundleBody = {
  sourceTenantId: string;
  sourceCompanyId: string;
  destTenantId: string;
  destCompanyId: string;
  domains: string[];
  keyPrefix?: string;
  onConflict?: CloneBundleConflictPolicy;
  actor?: string;
};

export type CloneCatalogBundleResult = {
  source: { tenantId: string; companyId: string };
  dest: { tenantId: string; companyId: string };
  domains: string[];
  keyPrefix: string | null;
  onConflict: CloneBundleConflictPolicy;
  matchedCount: number;
  copied: Array<{
    catalogKey: string;
    version: number;
    checksum: string;
    domain: string;
  }>;
  skipped: Array<{ catalogKey: string; reason: string }>;
  copiedCount: number;
  skippedCount: number;
};

export type CloneCatalogBundleResponse = {
  code: string;
  message?: string;
  data: CloneCatalogBundleResult;
};

export type ConfigCatalogListRow = {
  catalogKey: string;
  tenantId?: string;
  companyId?: string;
  name?: string;
  domain?: string;
  version?: number;
  checksum?: string;
};

/** Catalog partition aliases for Logistics legal entity (QA: destCompanyId=logistics). */
const LOGISTICS_DEST_ALIASES = new Set(['logistics', 'lgts']);

export function listCloneBundleDestCandidates(companies: Company[]): Company[] {
  return companies.filter((row) => {
    if (!row?.id?.trim()) return false;
    if (row.id === GROUP_HOLDING_ROOT_ID) return false;
    if (row.entityLevel === 'parent') return false;
    return true;
  });
}

/**
 * Resolve wire dest scope for clone-bundle.
 * LGTS / logistics codes → companyId `logistics` (catalog partition SoT).
 * Other master-tenant members → companyId = member.id (same as apply-to-members).
 */
export function resolveCloneBundleDestScope(member: Company): {
  tenantId: string;
  companyId: string;
} {
  const tenantId = (member.tenantId?.trim() || MASTER_TENANT_ID).toLowerCase();
  const rawId = member.id.trim().toLowerCase();
  const code = member.code?.trim().toLowerCase() ?? '';
  const short = member.shortName?.trim().toLowerCase() ?? '';
  if (
    LOGISTICS_DEST_ALIASES.has(rawId) ||
    LOGISTICS_DEST_ALIASES.has(code) ||
    LOGISTICS_DEST_ALIASES.has(short)
  ) {
    return { tenantId: MASTER_TENANT_ID, companyId: 'logistics' };
  }
  if (tenantId === MASTER_TENANT_ID) {
    return { tenantId, companyId: rawId };
  }
  return { tenantId, companyId: MEMBER_DEFAULT_COMPANY_ID };
}

/** Synthetic logistics dest when group-member-units list omits the plane slug. */
export function ensureLogisticsCloneDestOption(candidates: Company[]): Company[] {
  const hasLogistics = candidates.some((row) => {
    const scope = resolveCloneBundleDestScope(row);
    return scope.companyId === 'logistics';
  });
  if (hasLogistics) return candidates;
  const synthetic: Company = {
    id: 'logistics',
    code: 'LGTS',
    name: 'Logistics',
    shortName: 'LGTS',
    employeeCount: 0,
    revenue: 0,
    status: 'active',
    address: '',
    establishedDate: '2020-01-01',
    entityLevel: 'subsidiary',
    tenantId: MASTER_TENANT_ID,
  };
  return [synthetic, ...candidates];
}

export function buildCloneCatalogBundleBody(options: {
  destMember: Company;
  actor?: string;
  onConflict?: CloneBundleConflictPolicy;
  keyPrefix?: string;
  /** LOG-09 default — do not invent other domains on this panel. */
  domains?: readonly string[];
  sourceTenantId?: string;
  sourceCompanyId?: string;
}): CloneCatalogBundleBody {
  const dest = resolveCloneBundleDestScope(options.destMember);
  const sourceTenantId = (options.sourceTenantId ?? MASTER_TENANT_ID).toLowerCase();
  const sourceCompanyId = (options.sourceCompanyId ?? GROUP_HOLDING_COMPANY_ID).toLowerCase();
  if (sourceTenantId === dest.tenantId && sourceCompanyId === dest.companyId) {
    throw new Error('Công ty đích phải khác nguồn tập đoàn (XBOS-VAL-013)');
  }
  const domains = [...(options.domains ?? CLONE_BUNDLE_LOGISTICS_DOMAINS)];
  if (domains.length === 0) {
    throw new Error('Cần ít nhất một domain (domains)');
  }
  const body: CloneCatalogBundleBody = {
    sourceTenantId,
    sourceCompanyId,
    destTenantId: dest.tenantId,
    destCompanyId: dest.companyId,
    domains,
    onConflict: options.onConflict ?? 'fail',
  };
  const prefix = options.keyPrefix?.trim().toLowerCase();
  if (prefix) body.keyPrefix = prefix;
  const actor = options.actor?.trim();
  if (actor) body.actor = actor;
  return body;
}

export async function cloneCatalogBundle(
  body: CloneCatalogBundleBody,
): Promise<CloneCatalogBundleResponse> {
  if (!Array.isArray(body.domains) || body.domains.length === 0) {
    throw new Error('domains phải có ít nhất một phần tử');
  }
  const envelope = await xbosFetch<{
    success?: boolean;
    code?: string;
    message?: string;
    data?: CloneCatalogBundleResult;
  }>('/config-sync/catalogs/clone-bundle', {
    method: 'POST',
    scope: 'config-sync.clone-bundle',
    tenantId: body.sourceTenantId,
    companyId: body.sourceCompanyId,
    body: JSON.stringify(body),
  });
  const data = envelope?.data;
  const code = envelope?.code?.trim() || '';
  if (!data || typeof data.copiedCount !== 'number') {
    throw new Error(envelope?.message || 'Phản hồi clone-bundle thiếu copiedCount');
  }
  return {
    code: code || 'XBOS-CFG-205',
    message: envelope?.message,
    data,
  };
}

/** F5 / verify dest keys after CFG-205 (list catalogs for dest partition). */
export async function fetchConfigCatalogsForCompany(
  tenantId: string,
  companyId: string,
  target: 'hrm' | 'xbos' | 'web-portal' = 'xbos',
): Promise<ConfigCatalogListRow[]> {
  const q = new URLSearchParams({
    target,
    tenantId,
    companyId,
  });
  const data = await xbosGetData<ConfigCatalogListRow[] | { items?: ConfigCatalogListRow[] }>(
    `/config-sync/catalogs?${q.toString()}`,
    {
      scope: 'config-sync.catalogs.list',
      tenantId,
      companyId,
    },
  );
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object' && Array.isArray(data.items)) return data.items;
  return [];
}

type CatalogSnapshotLite = {
  catalogKey?: string;
  /** BE ConfigCatalogView uses `key` (not catalogKey). */
  key?: string;
  tenantId?: string;
  companyId?: string;
  name?: string;
  domain?: string;
  version?: number;
  checksum?: string;
};

/** Spot-check dest keys from clone result (QA: GET …/catalog/log_dm_1?companyId=logistics). */
export async function fetchCloneBundleDestKeySnapshots(
  tenantId: string,
  companyId: string,
  catalogKeys: string[],
  target: 'hrm' | 'xbos' | 'web-portal' = 'xbos',
): Promise<ConfigCatalogListRow[]> {
  const out: ConfigCatalogListRow[] = [];
  for (const key of catalogKeys) {
    const trimmed = key.trim();
    if (!trimmed) continue;
    const q = new URLSearchParams({ target, tenantId, companyId });
    try {
      const data = await xbosGetData<CatalogSnapshotLite>(
        `/config-sync/catalog/${encodeURIComponent(trimmed)}?${q.toString()}`,
        {
          scope: 'config-sync.catalog.get-dest',
          tenantId,
          companyId,
        },
      );
      out.push({
        catalogKey: data.catalogKey ?? data.key ?? trimmed,
        tenantId: data.tenantId,
        companyId: data.companyId,
        name: data.name,
        domain: data.domain,
        version: data.version,
        checksum: data.checksum,
      });
    } catch {
      // Continue — surface keys that loaded; UI shows partial list + count.
    }
  }
  return out;
}

export function formatCloneBundleSuccessMessage(response: CloneCatalogBundleResponse): string {
  const { code, data } = response;
  const sample = data.copied
    .slice(0, 3)
    .map((row) => row.catalogKey)
    .join(', ');
  const samplePart = sample ? ` · mẫu: ${sample}` : '';
  return `${code}: đã sao chép ${data.copiedCount}/${data.matchedCount} danh mục → ${data.dest.companyId}${samplePart}`;
}
