/**
 * @CODE-MEMORY
 * Screen:     /settings — Thư viện điều khoản HĐ (tab Điều khoản)
 * UC:         UC-BP-CORE-09a · FR-UC-BP-CORE-09a
 * BR:         BR-CTR-CL-01..04 · BR-CORE-CL-PATH · BR-CORE-CL-PLACEHOLDER · AC-CORE-09A-*
 * SRS:        SRS_HRM_ENTERPRISE.md FR-UC-BP-CORE-09a Diễn biến #1–#5
 * TechSpec:   docs/program/specs/PO-HRM-MVP-GD1-CORE-09A-CLUSTER-API-01.md F-CORE-CTR-CL-01..04
 * Purpose:    FE residual helpers — physical contract-clauses* SoT; VI status/group/pack labels;
 *             draft in-place vs issued CONFLICT→activate bump; {{field}} only; soft retire path.
 *             DENY Nest /core dual · Settings/XBOS body SoT · PREV/VER/PDF/TPL invent DONE ·
 *             claim CORE-08=pillar · note=FR-08 · contracts_printable_ready flip.
 * WorkItem:   PO-HRM-MVP-GD1-CORE-09A-CLUSTER-FE-01
 * Coded:      2026-08-09
 * Callers:    ContractLegalPrintSettingsPanel · source tests
 * Callees:    (pure) · contractLegalPrintConstants labels
 * must_keep:  Physical /contracts-insurance/contract-clauses* · publish/pull RETAIN ≠ body SoT ·
 *             CORE-08/02/01 seals · U65 · honesty printable=false · C-SLICE
 * LastVerified: contractClauseLibraryUx.test.ts
 */

import {
  CONTRACT_CLAUSE_GROUP_LABELS,
  CONTRACT_CLAUSE_STATUS_LABELS,
  CONTRACT_PACK_LABELS,
  type ContractPackCode,
} from '@/lib/contractLegalPrintConstants';
import { ApiClientError } from '@/lib/apiError';

/** Toast / Network codes — space before slash in comments (CODE-MEMORY safe). */
export const HRM_CTR_CL_REQUIRED_CODE = 'HRM-CTR-CL-REQUIRED';
export const HRM_CTR_CL_CODE_CONFLICT_CODE = 'HRM-CTR-CL-CODE-CONFLICT';
export const HRM_CTR_CL_404_CODE = 'HRM-CTR-CL-404';
export const HRM_CTR_CL_200_CODE = 'HRM-CTR-CL-200';
export const HRM_CTR_CL_201_CODE = 'HRM-CTR-CL-201';

/** Physical Network SoT (O1). */
export const CORE_CL_PHYSICAL_PATH_FRAGMENT = '/contracts-insurance/contract-clauses';

/** Paper alias — DENY as Nest SoT. */
export const CORE_CL_PAPER_CORE_PATH = '/api/hrm/core/';

export { CONTRACT_CLAUSE_STATUS_LABELS };

export function clauseStatusLabelVi(status: string | null | undefined): string {
  const key = (status ?? '').trim().toLowerCase();
  if (!key) return '—';
  return (
    CONTRACT_CLAUSE_STATUS_LABELS[key as keyof typeof CONTRACT_CLAUSE_STATUS_LABELS] ??
    status ??
    '—'
  );
}

export function clauseGroupLabelVi(
  group: string | null | undefined,
  customMap?: Record<string, string>,
): string {
  const key = normalizeClauseGroupKey(group);
  if (!key) return '—';
  if (customMap && customMap[key]) return customMap[key];
  return CONTRACT_CLAUSE_GROUP_LABELS[key] ?? ((group ?? '').trim() || key);
}

/** Chuẩn hóa mã nhóm để lọc/so khớp (BE/legacy có thể lệch hoa thường). */
export function normalizeClauseGroupKey(group: string | null | undefined): string {
  return (group ?? '').trim().toUpperCase();
}

export function clauseMatchesGroupFilter(
  clauseGroup: string | null | undefined,
  filter: string,
): boolean {
  if (filter === '__all__') return true;
  return normalizeClauseGroupKey(clauseGroup) === normalizeClauseGroupKey(filter);
}

export function clausePackLabelsVi(packs: string[] | null | undefined): string {
  if (!packs?.length) return '—';
  return packs
    .map((p) => {
      const code = p.trim();
      if (code === '*') return 'Tất cả (*)';
      const known = CONTRACT_PACK_LABELS[code as ContractPackCode];
      return known ?? code;
    })
    .join(', ');
}

export function isCoreClPhysicalPath(path: string): boolean {
  return path.includes('/contracts-insurance/contract-clauses');
}

export function isForbiddenCoreClSotPath(path: string): boolean {
  return path.includes('/api/hrm/core/') && path.includes('clause');
}

/** Extract Nest/ApiClient code from thrown error. */
export function extractApiErrorCode(error: unknown): string | null {
  if (error instanceof ApiClientError && error.code) return error.code;
  if (typeof error === 'object' && error !== null) {
    const c = (error as { code?: unknown }).code;
    if (typeof c === 'string' && c.trim()) return c.trim();
  }
  return null;
}

export function isCtrClCodeConflict(error: unknown): boolean {
  return extractApiErrorCode(error) === HRM_CTR_CL_CODE_CONFLICT_CODE;
}

export function isCtrClRequired(error: unknown): boolean {
  return extractApiErrorCode(error) === HRM_CTR_CL_REQUIRED_CODE;
}

/**
 * O4 — allow {{token}} / {{tên_trường}}; DENY dual merge syntax in one body
 * (e.g. {{x}} together with ${x} or #x#).
 * Returns null when OK; otherwise VI message for toast.
 */
export function validateClausePlaceholderSyntax(bodyVi: string): string | null {
  const body = bodyVi ?? '';
  const hasMustache = /\{\{[^{}]+\}\}/.test(body);
  const hasDollar = /\$\{[^}]+\}/.test(body);
  const hasHashPair = /#[a-zA-Z_][\w.]*#/.test(body);
  const dualCount = [hasMustache, hasDollar, hasHashPair].filter(Boolean).length;
  if (dualCount > 1) {
    return 'Chỉ dùng một cú pháp chỗ điền {{tên_trường}} — không kết hợp với ${…} hoặc #…# trong cùng nội dung.';
  }
  if (!hasMustache && (hasDollar || hasHashPair)) {
    return 'GĐ1 chỉ hỗ trợ chỗ điền dạng {{tên_trường}} / {{token}}. Đổi sang {{…}} rồi lưu.';
  }
  return null;
}

/** Snapshot freeze assert path (QA J-HRM-CORE-09A-03) — document-only helper. */
export const CORE_CL_SNAPSHOT_FREEZE_ASSERT = {
  libraryMutatePath: '/api/hrm/contracts-insurance/contract-clauses',
  issuedPrintVersionsPath: '/api/hrm/contracts-insurance/contracts/:contractId/print-versions',
  immutableField: 'clauses_snapshot_json',
  rule: 'After library PATCH CONFLICT→activate bump, reopen issued print version — body in clauses_snapshot_json unchanged',
} as const;
