/**
 * @CODE-MEMORY
 * Screen:     Command Center → Cài đặt → Sao chép bộ danh mục
 * UC:         XBOS-DM-09 · STT 85
 * BR:         BR-DM09-CLONE · onConflict reject → XBOS-CFG-409
 * SRS:        docs/xbos/BANG_TONG_HOP_USECASE_XBOS.md STT 85 · by-uc XBOS-DM-09.md
 * TechSpec:   docs/ecosystem/TECHSPEC_HE_SINH_THAI_XEVN.md §8.1 · OpenAPI configSyncCloneCatalog
 * API:        POST /api/xbos/config-sync/catalog/{catalogKey}/clone · XBOS-CFG-206
 * Purpose:    FE client POST clone single catalog_key partition→partition (holding → ĐVTV).
 *             Distinct from apply-to-members (DM-HRM-07) and catalogs/clone-bundle (LOG-09).
 * WorkItem:   PO-UC-TC-W3-FE-DM09
 * Coded:      2026-08-04
 * Callers:    CloneCatalogPanel
 * Callees:    POST …/catalog/{key}/clone · GET catalog (source/dest verify)
 * must_keep:  ApplyCatalogToMembersPanel = DM-HRM-07 only · no seed · U72 VI labels
 * LastVerified: apps/web/web-portal/src/integrations/configSyncCloneCatalog.test.ts
 *
 * @CODE-MEMORY-CHANGE 2026-08-04 PO-UC-TC-W3-FE-DM09
 * change_mode: ADD
 * What: Wire POST …/catalog/{key}/clone + body builders + dest resolve from member row
 * Why: QA R-DM09-FE-WIRE — API CFG-206 PASS; portal grep 0 clone client
 * SRS: XBOS-DM-09 · TC-DM09-CPY-HP/FD/AU
 * must_keep: apply-to-members · clone-bundle · leave L2 · U65 no seed
 */
import type { Company } from '../data/mock-data';
import {
  GROUP_HOLDING_COMPANY_ID,
  MASTER_TENANT_ID,
  MEMBER_DEFAULT_COMPANY_ID,
} from '../constants/tenant';
import {
  APPLY_TO_MEMBERS_CATALOG_KEYS,
  APPLY_TO_MEMBERS_CATALOG_LABELS,
  buildApplyCatalogTargets,
  fetchConfigCatalogForHrm,
  listApplyMemberCandidates,
  type ApplyToMembersCatalogKey,
  type ConfigCatalogSnapshot,
} from './configSyncApplyMembers';
import { xbosFetch } from './xbosHttp';

/** Practical UI key set — same P0∪P1 HRM catalogs; DM-09 is not apply-to-members fan-out. */
export const CLONE_CATALOG_KEYS = APPLY_TO_MEMBERS_CATALOG_KEYS;
export type CloneCatalogKey = ApplyToMembersCatalogKey;
export const CLONE_CATALOG_LABELS = APPLY_TO_MEMBERS_CATALOG_LABELS;

export type CloneCatalogOnConflict = 'reject' | 'overwrite';

export type CloneCatalogBody = {
  tenantId: string;
  companyId: string;
  destTenantId: string;
  destCompanyId: string;
  onConflict?: CloneCatalogOnConflict;
  actor?: string;
};

export type CloneCatalogResult = {
  catalogKey: string;
  onConflict?: CloneCatalogOnConflict;
  source: {
    tenantId: string;
    companyId: string;
    itemCount: number;
    version?: number;
    checksum?: string;
  };
  dest: {
    tenantId: string;
    companyId: string;
    version: number;
    itemCount: number;
    checksum?: string;
  };
};

export type CloneCatalogEnvelope = {
  success?: boolean;
  code?: string;
  message?: string;
  data?: CloneCatalogResult;
};

/** Extract XBOS-* business code from xbosFetch error text when present. */
export function extractXbosErrorCode(message: string): string | null {
  const m = message.match(/\b(XBOS-[A-Z]+-\d+)\b/);
  return m?.[1] ?? null;
}

/**
 * User-facing clone error — ensure conflict/auth codes stay visible for QA FD/AU.
 */
export function formatCloneCatalogUserError(err: unknown): string {
  const raw = err instanceof Error ? err.message : String(err ?? 'Sao chép danh mục thất bại');
  const code = extractXbosErrorCode(raw);
  if (code) return raw;
  if (/\bHTTP 409\b/i.test(raw) || /overlapping item codes/i.test(raw)) {
    return `${raw} · XBOS-CFG-409`;
  }
  if (/\bHTTP 403\b/i.test(raw)) {
    return `${raw} · XBOS-AUTH-003`;
  }
  return raw;
}

export function listCloneMemberCandidates(companies: Company[]): Company[] {
  return listApplyMemberCandidates(companies);
}

/** Map one ĐVTV row → clone dest partition (member tenant → companyId main). */
export function resolveCloneDestFromMember(member: Company): {
  destTenantId: string;
  destCompanyId: string;
} {
  const [target] = buildApplyCatalogTargets([member]);
  if (!target) {
    throw new Error('Không xác định được phạm vi đích từ đơn vị thành viên đã chọn');
  }
  return { destTenantId: target.tenantId, destCompanyId: target.companyId };
}

export function buildCloneCatalogBody(options: {
  destMember: Company;
  actor?: string;
  sourceTenantId?: string;
  sourceCompanyId?: string;
  onConflict?: CloneCatalogOnConflict;
}): CloneCatalogBody {
  const dest = resolveCloneDestFromMember(options.destMember);
  const sourceTenantId = (options.sourceTenantId ?? MASTER_TENANT_ID).toLowerCase();
  const sourceCompanyId = (options.sourceCompanyId ?? GROUP_HOLDING_COMPANY_ID).toLowerCase();
  if (
    dest.destTenantId === sourceTenantId &&
    dest.destCompanyId === sourceCompanyId
  ) {
    throw new Error('Đích phải khác nguồn (XBOS-VAL-013)');
  }
  return {
    tenantId: sourceTenantId,
    companyId: sourceCompanyId,
    destTenantId: dest.destTenantId,
    destCompanyId: dest.destCompanyId,
    onConflict: options.onConflict ?? 'reject',
    ...(options.actor?.trim() ? { actor: options.actor.trim() } : {}),
  };
}

export async function fetchCloneSourceCatalog(
  catalogKey: CloneCatalogKey,
): Promise<ConfigCatalogSnapshot> {
  return fetchConfigCatalogForHrm(catalogKey, MASTER_TENANT_ID, GROUP_HOLDING_COMPANY_ID);
}

/** Best-effort dest verify after clone (Group CEO may hit 409 member scope). */
export async function fetchCloneDestCatalog(
  catalogKey: CloneCatalogKey,
  destTenantId: string,
  destCompanyId: string,
): Promise<ConfigCatalogSnapshot> {
  return fetchConfigCatalogForHrm(
    catalogKey,
    destTenantId || MASTER_TENANT_ID,
    destCompanyId || MEMBER_DEFAULT_COMPANY_ID,
  );
}

export async function cloneCatalog(
  catalogKey: CloneCatalogKey,
  body: CloneCatalogBody,
): Promise<CloneCatalogResult> {
  if (!(CLONE_CATALOG_KEYS as readonly string[]).includes(catalogKey)) {
    throw new Error(`Catalog '${catalogKey}' không hỗ trợ sao chép trên UI`);
  }
  if (!body.destTenantId?.trim() || !body.destCompanyId?.trim()) {
    throw new Error('Thiếu phạm vi đích (destTenantId / destCompanyId)');
  }
  const envelope = await xbosFetch<CloneCatalogEnvelope>(
    `/config-sync/catalog/${encodeURIComponent(catalogKey)}/clone`,
    {
      method: 'POST',
      scope: 'config-sync.clone-catalog',
      tenantId: body.tenantId,
      companyId: body.companyId,
      body: JSON.stringify(body),
    },
  );
  const data = envelope?.data;
  if (!data?.dest || typeof data.dest.itemCount !== 'number') {
    throw new Error(envelope?.message || 'Phản hồi clone thiếu dest.itemCount');
  }
  if (envelope?.code && envelope.code !== 'XBOS-CFG-206' && envelope.success === false) {
    throw new Error(`${envelope.message || 'Clone thất bại'} · ${envelope.code}`);
  }
  return {
    catalogKey: data.catalogKey ?? catalogKey,
    onConflict: data.onConflict ?? body.onConflict,
    source: data.source,
    dest: data.dest,
  };
}
