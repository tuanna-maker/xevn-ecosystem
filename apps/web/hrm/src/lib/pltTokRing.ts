/**
 * @CODE-MEMORY
 * Screen:     /settings — MergeToken admin · UC-BP-PLT-01 platform L3
 * UC:         UC-BP-PLT-01 · FR-UC-BP-PLT-01 · AC-PLT-01-TOK-* · AC-PLT-01-PATH · J-HRM-PLT-01-01..06
 * BR:         BR-PLT-01 register · BR-PLT-04 soft-retire · BR-PLT-05 open catalog · BR-PLT-03 freeze cite ≠ printable
 * SRS:        SRS_HRM_ENTERPRISE.md FR-UC-BP-PLT-01 Diễn biến #1–#5 · Thành công
 * TechSpec:   docs/program/specs/PO-HRM-MVP-GD1-PLT-01-CLUSTER-API-01.md
 *             F-PLT-TOK-01/02/03 RETAIN · R-PLT-01-DISP FE-derive · Nest /core DENY
 * Purpose:    Path lock + display-ready labelVi helpers + honesty footers —
 *             DENY Nest /core TOK/PLT dual · claim peer catalog = PLT DONE ·
 *             claim merge LIVE = platform UAT · catalog/CRUD/LIVE = CORE-10 DONE ·
 *             claim CORE-10/09/07 DONE · invent PAY/ATT/printable/Word DONE · mega-EAV · hard-delete.
 * WorkItem:   PO-HRM-MVP-GD1-PLT-01-CLUSTER-FE-01
 * Coded:      2026-08-09
 * Callers:    MergeTokenSettingsPanel · mergeTokenCatalog · source tests
 * Callees:    contractLegalPrintConstants (printable false RETAIN)
 * must_keep:  CORE10QC1-MSLP0EJB · CORE09QC1-MSLNBA89 printable false · CORE07QC1-KZJTSHNT ·
 *             soft≠CORE-06 DONE · Nest /core DENY · physical /merge-tokens* only · U65 · C-SLICE
 * SOLID:      Pure helpers tách panel — no schema invent · no VER/print SoT invent
 * LastVerified: pltTokRing.test.ts · poHrmMvpGd1Plt01ClusterFe01.source.test.ts
 */

import { CONTRACTS_PRINTABLE_READY } from '@/lib/contractLegalPrintConstants';

/** Physical SoT paths (O3/O4) — Network MUST contain; Nest /core TOK/PLT = FAIL. */
export const PLT_TOK_01_PATH_ASSERT = {
  list: '/api/hrm/merge-tokens',
  getById: '/api/hrm/merge-tokens/:tokenId',
  upsert: '/api/hrm/merge-tokens',
  patch: '/api/hrm/merge-tokens/:tokenId',
  retire: '/api/hrm/merge-tokens/:tokenId/retire',
  resolvePreview: '/api/hrm/merge-tokens/resolve-preview',
  nestCoreDenied: '/api/hrm/core/',
} as const;

/** TRUE when path is Nest dual `/api/hrm/core/*` merge/platform SoT (FAIL O4). */
export function isForbiddenPltTokSotPath(path: string | null | undefined): boolean {
  const p = String(path ?? '').toLowerCase();
  if (!p.includes('/api/hrm/core/')) return false;
  return (
    p.includes('merge') ||
    p.includes('token') ||
    p.includes('platform') ||
    p.includes('/plt/') ||
    p.includes('catalog') ||
    p.includes('schema')
  );
}

/** Physical merge-tokens family (PASS O3/O4). */
export function isPhysicalMergeTokensPath(path: string | null | undefined): boolean {
  return String(path ?? '').includes('/merge-tokens');
}

/**
 * R-PLT-01-DISP — primary UI label = labelVi; brace-render {{tokenKey}} secondary.
 * DENY raw tokenKey as sole UI label when labelVi present.
 */
export function resolveMergeTokenPrimaryLabel(
  tokenKey: string | null | undefined,
  labelVi?: string | null,
): string {
  const label = String(labelVi ?? '').trim();
  const key = String(tokenKey ?? '')
    .trim()
    .toLowerCase()
    .replace(/^\{\{\s*/, '')
    .replace(/\s*\}\}$/, '');
  if (label) return label;
  return key ? `{{${key}}}` : '—';
}

/** Soft-retire visibility — archivedAt set ⇒ hide from default picker (BR-PLT-04). */
export function isMergeTokenArchived(archivedAt: string | null | undefined): boolean {
  return Boolean(String(archivedAt ?? '').trim());
}

/**
 * Resolve-preview honesty — registry > keyword_map smoke only.
 * DENY invent VER write / printable SoT from this surface (BR-PLT-03 cite · printable false).
 */
export const PLT_TOK_RESOLVE_PREVIEW_HONESTY = {
  noVerWrite: 'resolve-preview ≠ VER write / print SoT',
  registryWins: 'registry > keyword_map',
  printableFalse: 'contracts_printable_ready=false',
} as const;

/** Honesty footer lines — every PLT-01 evidence / UI smoke (O1/O3/O7/O8/O9). */
export const PLT_01_HONESTY_FOOTER = {
  printableFalse: 'contracts_printable_ready=false',
  catalogNePltDone: 'peer catalog ≠ PLT-01 DONE',
  mergeNePlatformUat: 'merge LIVE ≠ platform / PLT module UAT',
  catalogNeCore10Done: 'catalog/CRUD/LIVE ≠ CORE-10 DONE',
  neCore10Done: '≠ CORE-10 DONE · CORE10QC1-MSLP0EJB',
  neCore09Done: '≠ CORE-09 DONE · printable false · CORE09QC1-MSLNBA89',
  neCore07Done:
    '≠ CORE-07 DONE · GATE 409 · ACT-400 · Nest DENY · checklist≠DONE · free PATCH≠DONE · CORE07QC1-KZJTSHNT',
  softNeCore06: 'soft ≠ CORE-06 DONE',
  nestCoreDeny: 'Nest /core TOK/PLT = 0',
  payAttOut: 'PAY/ATT OUT invent DONE',
  noEav: 'DENY mega-EAV',
  noSeed: 'U65 zero-seed',
  cSlice: 'C-SLICE · PLT/personnel/CTR module UAT false',
} as const;

export function plt01HonestyFooterLines(): string[] {
  return [
    PLT_01_HONESTY_FOOTER.printableFalse,
    PLT_01_HONESTY_FOOTER.catalogNePltDone,
    PLT_01_HONESTY_FOOTER.mergeNePlatformUat,
    PLT_01_HONESTY_FOOTER.catalogNeCore10Done,
    PLT_01_HONESTY_FOOTER.neCore10Done,
    PLT_01_HONESTY_FOOTER.neCore09Done,
    PLT_01_HONESTY_FOOTER.neCore07Done,
    PLT_01_HONESTY_FOOTER.softNeCore06,
    PLT_01_HONESTY_FOOTER.nestCoreDeny,
    PLT_01_HONESTY_FOOTER.payAttOut,
    PLT_01_HONESTY_FOOTER.noEav,
    PLT_01_HONESTY_FOOTER.noSeed,
    PLT_01_HONESTY_FOOTER.cSlice,
  ];
}

/** Short UI banner — ≠DONE locks for Settings MergeToken panel. */
export function plt01HonestyBannerText(): string {
  return [
    `Honesty: ${PLT_01_HONESTY_FOOTER.printableFalse}`,
    PLT_01_HONESTY_FOOTER.catalogNePltDone,
    PLT_01_HONESTY_FOOTER.mergeNePlatformUat,
    PLT_01_HONESTY_FOOTER.catalogNeCore10Done,
    'CORE-10/09/07 RETAIN (≠ DONE)',
    PLT_01_HONESTY_FOOTER.softNeCore06,
    PLT_01_HONESTY_FOOTER.payAttOut,
    PLT_TOK_RESOLVE_PREVIEW_HONESTY.noVerWrite,
  ].join(' · ');
}

/** Guard — never flip printable from FE alone. */
export function assertPlt01PrintableHonesty(): boolean {
  return CONTRACTS_PRINTABLE_READY === false;
}
