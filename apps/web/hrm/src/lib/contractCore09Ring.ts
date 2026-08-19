/**
 * @CODE-MEMORY
 * Screen:     /contracts — sổ đăng ký + PREV fill keyword (UC-BP-CORE-09 parent)
 * UC:         UC-BP-CORE-09 · AC-CORE-09-01..08 · AC-CTR-TPL-01..05 · AC-CTR-XEVN-08
 * BR:         BR-CORE-09-PATH/TOKEN/DOCX-OUT/REG≠DONE/ADD≠DONE/ZERO/FILL/MAND/CB/PRINTABLE
 * SRS:        SRS_HRM_ENTERPRISE.md FR-UC-BP-CORE-09 Diễn biến #1–#4 · Luồng #1–#5
 * TechSpec:   docs/program/specs/PO-HRM-MVP-GD1-CORE-09-CLUSTER-API-01.md
 *             F-CORE-CTR-01 · F-CORE-CTR-PREV-01 RETAIN · R-CORE-09-DISP-01 FE-derive
 * Purpose:    Path lock + statusLabelVi FE-derive + ZERO-TPL/mandatory/honesty footers —
 *             DENY Nest /core dual · Word/DOCX invent · claim registry/09a–d = CORE-09 DONE ·
 *             invent PAY/ATT/printable DONE · wipe CORE-07 · soft=CORE-06 DONE.
 * WorkItem:   PO-HRM-MVP-GD1-CORE-09-CLUSTER-FE-01
 * Coded:      2026-08-09
 * Callers:    ContractPrintSpinePanel · Contracts.tsx · useContracts · source tests
 * Callees:    contractLegalPrintConstants · labelMaps (peer U72)
 * must_keep:  CONTRACTS_PRINTABLE_READY=false · 09a–d ADD ≠ CORE-09 DONE · CORE-07 GATE/ACT
 *             · soft≠CORE-06 DONE · physical /contracts-insurance/* only · U65 zero-seed
 * SOLID:      Pure helpers tách panel / hooks — no schema invent
 * LastVerified: contractCore09Ring.test.ts
 */

import { CONTRACTS_PRINTABLE_READY } from '@/lib/contractLegalPrintConstants';

/** Physical SoT paths (O1) — Network MUST contain; Nest /core CTR = FAIL. */
export const CORE_CTR_09_PATH_ASSERT = {
  listContracts: '/api/hrm/contracts-insurance/contracts',
  createContract: '/api/hrm/contracts-insurance/contracts',
  getContract: '/api/hrm/contracts-insurance/contracts/:contractId',
  preview: '/api/hrm/contracts-insurance/contracts/:contractId/preview',
  packResolve: '/api/hrm/contracts-insurance/contracts/pack-resolve',
  printVersions: '/api/hrm/contracts-insurance/contracts/:contractId/print-versions',
  pdf: '/api/hrm/contracts-insurance/print-versions/:versionId/pdf',
  templates: '/api/hrm/contracts-insurance/contract-templates',
  clauses: '/api/hrm/contracts-insurance/contract-clauses',
  nestCoreDenied: '/api/hrm/core/',
} as const;

/** Registry status enum HOLD RETAIN (API-01 §4.5). */
export const CORE_CTR_REGISTRY_STATUSES = ['active', 'expired', 'terminated'] as const;
export type CoreCtrRegistryStatus = (typeof CORE_CTR_REGISTRY_STATUSES)[number];

/**
 * API-01 R-CORE-09-DISP-01 FE-derive — align BA/locale when BE omits statusLabelVi.
 * Prefer BE display-ready; DENY invent typed col / Nest /core.
 */
export const CORE_CTR_STATUS_LABEL_VI: Record<CoreCtrRegistryStatus, string> = {
  active: 'Hiệu lực',
  expired: 'Hết hạn',
  terminated: 'Chấm dứt',
};

export function contractStatusLabelFallback(status: string | null | undefined): string {
  const s = String(status ?? '')
    .trim()
    .toLowerCase();
  if ((CORE_CTR_REGISTRY_STATUSES as readonly string[]).includes(s)) {
    return CORE_CTR_STATUS_LABEL_VI[s as CoreCtrRegistryStatus];
  }
  if (s === 'pending') return 'Chờ hiệu lực';
  if (s === 'draft') return 'Nháp';
  if (s === 'cancelled') return 'Đã hủy';
  return s || '—';
}

/** Prefer BE statusLabelVi / status_label_vi; else FE-derive from status (R-CORE-09-DISP-01). */
export function resolveContractStatusLabelVi(
  status: string | null | undefined,
  statusLabelVi?: string | null,
): string {
  const fromBe = String(statusLabelVi ?? '').trim();
  if (fromBe) return fromBe;
  return contractStatusLabelFallback(status);
}

/** TRUE when path is Nest dual `/api/hrm/core/*` CTR SoT (FAIL O1). */
export function isNestCoreCtrPath(path: string | null | undefined): boolean {
  const p = String(path ?? '').toLowerCase();
  if (!p.includes('/api/hrm/core/')) return false;
  return (
    p.includes('/contract') ||
    p.includes('/preview') ||
    p.includes('/print-version') ||
    p.includes('/clause')
  );
}

/** Physical contracts-insurance family (PASS O1). */
export function isPhysicalContractsInsurancePath(path: string | null | undefined): boolean {
  return String(path ?? '').includes('/contracts-insurance/');
}

/** ZERO-TPL CTA copy (AC-CTR-TPL-01 / R-CORE-09-ZERO-TPL). */
export const CORE_09_ZERO_TPL_CTA = {
  title: 'Chưa có mẫu HĐ hiệu lực',
  body: '0 mẫu active (HRM-CTR-TPL-NONE) — cấu hình mẫu trước khi xem trước / lưu phiên bản từ mẫu. Không lưu phiên bản giả.',
  settingsHref: '/hr/settings',
  settingsLabel: 'Cài đặt → Điều khoản HĐ / Mẫu theo loại',
  code: 'HRM-CTR-TPL-NONE',
} as const;

/** Honesty footer lines — every CORE-09 evidence / UI smoke (O4/O5/O10). */
export const CORE_09_HONESTY_FOOTER = {
  printableFalse: 'contracts_printable_ready=false',
  peersAddNeDone: '09a–d ADD ≠ CORE-09 DONE',
  registryNeDone: 'registry CRUD ≠ CORE-09 DONE',
  wordOut: 'Word/DOCX primary OUT',
  nestCoreDeny: 'Nest /core CTR = 0',
  core07Retain:
    'CORE-07 RETAIN · GATE 409 · ACT-400 · Nest DENY · checklist≠DONE · free PATCH≠DONE · ≠ CORE-07 DONE',
  softNeCore06: 'soft ≠ CORE-06 DONE',
  payAttOut: 'PAY/ATT invent DONE OUT',
  cSlice: 'C-SLICE · personnel/CORE/CTR module UAT false',
} as const;

export function core09HonestyFooterLines(): string[] {
  return [
    CORE_09_HONESTY_FOOTER.printableFalse,
    CORE_09_HONESTY_FOOTER.peersAddNeDone,
    CORE_09_HONESTY_FOOTER.registryNeDone,
    CORE_09_HONESTY_FOOTER.wordOut,
    CORE_09_HONESTY_FOOTER.nestCoreDeny,
    CORE_09_HONESTY_FOOTER.core07Retain,
    CORE_09_HONESTY_FOOTER.softNeCore06,
    CORE_09_HONESTY_FOOTER.payAttOut,
    CORE_09_HONESTY_FOOTER.cSlice,
  ];
}

/** Short UI banner — printable + peers ≠ DONE + CORE-07 retain smoke. */
export function core09HonestyBannerText(): string {
  return [
    `Honesty: ${CORE_09_HONESTY_FOOTER.printableFalse}`,
    CORE_09_HONESTY_FOOTER.peersAddNeDone,
    CORE_09_HONESTY_FOOTER.registryNeDone,
    'CORE-07 GATE/ACT RETAIN (≠ DONE)',
    CORE_09_HONESTY_FOOTER.softNeCore06,
  ].join(' · ');
}

/** Guard — never flip printable from FE alone. */
export function assertCore09PrintableHonesty(): boolean {
  return CONTRACTS_PRINTABLE_READY === false;
}

/**
 * Registry create/update — omit blank template keys (AC-CTR-XEVN-08 / AC-CORE-09-08).
 * Empty template_id MUST NOT block registry CRUD.
 */
export function omitBlankContractTemplateFields(input: {
  template_id?: string | null;
  template_code?: string | null;
  pack_code?: string | null;
}): {
  template_id?: string;
  template_code?: string;
  pack_code?: string;
} {
  const out: {
    template_id?: string;
    template_code?: string;
    pack_code?: string;
  } = {};
  const tid = String(input.template_id ?? '').trim();
  const tcode = String(input.template_code ?? '').trim();
  const pack = String(input.pack_code ?? '').trim();
  if (tid) out.template_id = tid;
  if (tcode) out.template_code = tcode.toUpperCase();
  if (pack) out.pack_code = pack;
  return out;
}

/** Mandatory gate UX — can_issue false or missing lists non-empty (R-CORE-09-MANDATORY). */
export function isPreviewMandatoryBlocked(preview: {
  can_issue?: boolean | null;
  missing_fields?: unknown[] | null;
  missing_clauses?: unknown[] | null;
} | null | undefined): boolean {
  if (!preview) return false;
  if (preview.can_issue === false) return true;
  const mf = Array.isArray(preview.missing_fields) ? preview.missing_fields.length : 0;
  const mc = Array.isArray(preview.missing_clauses) ? preview.missing_clauses.length : 0;
  return mf > 0 || mc > 0;
}
