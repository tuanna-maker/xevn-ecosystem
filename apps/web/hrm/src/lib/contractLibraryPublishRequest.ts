/**
 * @CODE-MEMORY
 * Screen:     /settings — Thư viện HĐ · Phát hành / Kéo / Áp dụng gói tập đoàn
 * UC:         FR-UC-BP-CORE-09a · F-CORE-CTR-PUB/PULL/APPLY
 * BR:         BR-CTR-CL-01 · VAL-PUB-01..04 · pull ≠ apply · no synced_catalogs
 * SRS:        docs/program/specs/PO-HRM-CONTRACT-LEGAL-PRINT-DATA-02.md §7
 * TechSpec:   ADR-HRM-CONTRACT-LIBRARY-GROUP-PUBLISH Option A
 * Purpose:    Build POST body + ?company_id= cho publish/pull/apply — cấm company_id trong JSON.
 * WorkItem:   PO-HRM-CONTRACT-LEGAL-PRINT-FE-03 (PM W7.5; code baseline FE-05)
 * Coded:      2026-08-07
 * Callers:    hrmApi publish/pull/apply · ContractLegalPrintSettingsPanel
 * Callees:    normalizeHrmApiListCompanyId
 * Impact:     Body company_id → 400 HRM-VAL-001 (forbidNonWhitelisted)
 * must_keep:  print-spine GWC · UF-HRM-02 · FE-01 DnD · FE-02 preview · work_location FE-03-A
 * SOLID:      Pure builders tách hrmApi / panel
 * solid_convention_ack: FE binds display-ready origin* from BE — no invent lineage/formula
 * LastVerified: docs/qa/evidence/po-hrm-contract-legal-print-fe-03.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-07 PO-HRM-CONTRACT-LEGAL-PRINT-FE-03
 * What: Origin detail helper — origin · origin_publish_version · origin_company_id · lineage_code
 * Why: PM FE-03 exit — overlay đủ 4 field display-ready (DATA-02 §7.2)
 * must_keep: query-only company_id builders · honesty printable=false · no synced_catalogs
 * LastVerified: docs/qa/evidence/po-hrm-contract-legal-print-fe-03.md
 */

import { normalizeHrmApiListCompanyId } from '@/lib/hrmListScope';

export type ContractLibraryOrigin = 'member' | 'group' | 'member_override' | string;

/** Holding SoT partition (Group CEO main rollup or holding slug). */
export function isContractLibraryHoldingPartition(companyId: string | null | undefined): boolean {
  const cid = String(companyId ?? '')
    .trim()
    .toLowerCase();
  return cid === 'main' || cid === 'holding' || cid === '';
}

export type PublishLibraryInput = {
  company_id: string;
  label_vi?: string;
};

export type PublishLibraryBody = {
  label_vi?: string;
};

export type PullLibraryInput = {
  company_id: string;
  publish_version?: number;
  force?: boolean;
};

export type PullLibraryBody = {
  publish_version?: number;
  force?: boolean;
};

export type ApplyLibraryInput = {
  company_id: string;
  publish_version?: number;
};

export type ApplyLibraryBody = {
  publish_version?: number;
};

export type LibraryMutateRequest<TBody> = {
  companyIdQuery: string;
  body: TBody;
};

/** F-CORE-CTR-PUB-01 — company_id query only. */
export function buildContractLibraryPublishRequest(
  input: PublishLibraryInput,
): LibraryMutateRequest<PublishLibraryBody> {
  const companyIdQuery = normalizeHrmApiListCompanyId(input.company_id);
  const body: PublishLibraryBody = {};
  const label = input.label_vi?.trim();
  if (label) body.label_vi = label;
  return { companyIdQuery, body };
}

/** F-CORE-CTR-PULL-01 — company_id query only. */
export function buildContractLibraryPullRequest(
  input: PullLibraryInput,
): LibraryMutateRequest<PullLibraryBody> {
  const companyIdQuery = normalizeHrmApiListCompanyId(input.company_id);
  const body: PullLibraryBody = {};
  if (input.publish_version != null && Number.isFinite(input.publish_version) && input.publish_version >= 1) {
    body.publish_version = Math.trunc(input.publish_version);
  }
  if (input.force === true) body.force = true;
  return { companyIdQuery, body };
}

/** F-CORE-CTR-APPLY-01 — company_id query only. */
export function buildContractLibraryApplyRequest(
  input: ApplyLibraryInput,
): LibraryMutateRequest<ApplyLibraryBody> {
  const companyIdQuery = normalizeHrmApiListCompanyId(input.company_id);
  const body: ApplyLibraryBody = {};
  if (input.publish_version != null && Number.isFinite(input.publish_version) && input.publish_version >= 1) {
    body.publish_version = Math.trunc(input.publish_version);
  }
  return { companyIdQuery, body };
}

/** Display-ready origin badge label (VI). */
export function contractLibraryOriginLabel(origin?: string | null): string {
  const o = String(origin ?? 'member')
    .trim()
    .toLowerCase();
  if (o === 'group') return 'Tập đoàn';
  if (o === 'member_override') return 'Ghi đè TV';
  return 'Nội bộ';
}

/** Compact badge text including publish version when group lineage. */
export function contractLibraryOriginBadgeText(params: {
  origin?: string | null;
  origin_publish_version?: number | null;
}): string {
  const label = contractLibraryOriginLabel(params.origin);
  const ver = params.origin_publish_version;
  if (ver != null && Number.isFinite(ver) && ver >= 1) {
    return `${label} · v${Math.trunc(ver)}`;
  }
  return label;
}

/**
 * Full overlay line for TPL/CL list — display-ready fields only (DATA-02 §7.2).
 * Order: origin · origin_publish_version · origin_company_id · lineage_code.
 */
export function contractLibraryOriginDetailText(params: {
  origin?: string | null;
  origin_publish_version?: number | null;
  origin_company_id?: string | null;
  lineage_code?: string | null;
}): string {
  const parts: string[] = [contractLibraryOriginBadgeText(params)];
  const ou = String(params.origin_company_id ?? '').trim();
  if (ou) parts.push(ou);
  const lineage = String(params.lineage_code ?? '').trim();
  if (lineage) parts.push(lineage);
  return parts.join(' · ');
}
