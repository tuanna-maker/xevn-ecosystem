/**
 * @CODE-MEMORY
 * Screen:     HRM embed compact ĐVTV + role context (portal iframe)
 * UC:         BM-AC-02-01 · AC-CD-F3-01
 * BR:         BR-CD-F3-01 — human names, never UUID-only
 * SRS:        docs/program/deltas/BMINUTES_AC_MATRIX.md BM-AC-02-01
 * TechSpec:   docs/decisions/ADR-HRM-RBAC-SCOPE-LADDER.md §3 / §5
 * Purpose:    Pure helpers for compact embed chip: OU/tenant VI label + role VI.
 *             Does NOT restore JWT/AC annotation strip (CD-FB-06-REMOVE-SCOPE-ANNOTATIONS).
 * WorkItem:   BM-FE-ROLE-SWITCH-01
 * Coded:      2026-07-22
 * Callers:    HrmOperatingUnitFilter
 * Callees:    formatRoleCodeVi
 * must_keep:  no «Ngữ cảnh» / JWT companyId / AC-CD-F3 hint strings; OU filter ≠ JWT mutate
 * SOLID:      Label resolution only — Select/OU state stays in filter context
 * LastVerified: embedWorkingContext.test.ts
 */
import { formatRoleCodeVi } from '@/lib/scopeRoleLabels';
import { HRM_MASTER_TENANT_ID } from '@/lib/hrmListScope';

/** Pilot / known tenant → VI display (not UUID). Unknown slugs humanize; UUID → safe fallback. */
const TENANT_LABEL_VI: Record<string, string> = {
  [HRM_MASTER_TENANT_ID]: 'Tập đoàn XeVN',
  xevn: 'Tập đoàn XeVN',
  'xe-du-lich': 'Công ty Du lịch XeVN',
  'xe-vietnam': 'X.E Việt Nam',
  'xe-tmdv': 'TM-DV XeVN',
  visun: 'Visun',
};

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function looksLikeUuid(value: string | null | undefined): boolean {
  return Boolean(value?.trim() && UUID_RE.test(value.trim()));
}

export function resolveTenantDisplayLabelVi(tenantId: string | null | undefined): string {
  const key = tenantId?.trim();
  if (!key) return 'Công ty thành viên';
  if (looksLikeUuid(key)) return 'Công ty thành viên';
  const mapped = TENANT_LABEL_VI[key.toLowerCase()];
  if (mapped) return mapped;
  return key
    .split(/[-_]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}

export type EmbedDvtvLabelInput = {
  /** Group CEO OU filter visible */
  showOuFilter: boolean;
  selectedSlug: 'all' | string;
  selectedUnitDisplayNameVi: string | null;
  jwtTenantId: string | null | undefined;
};

/** ĐVTV / viewing context — human name, never UUID-only. */
export function resolveEmbedDvtvLabel(input: EmbedDvtvLabelInput): string {
  if (input.showOuFilter) {
    if (input.selectedSlug !== 'all' && input.selectedUnitDisplayNameVi?.trim()) {
      return input.selectedUnitDisplayNameVi.trim();
    }
    return 'Tất cả đơn vị (rollup)';
  }
  return resolveTenantDisplayLabelVi(input.jwtTenantId);
}

export type EmbedWorkingContextInput = EmbedDvtvLabelInput & {
  roleCode: string | null | undefined;
};

export type EmbedWorkingContext = {
  dvtvLabel: string;
  roleLabel: string;
};

export function resolveEmbedWorkingContext(input: EmbedWorkingContextInput): EmbedWorkingContext {
  return {
    dvtvLabel: resolveEmbedDvtvLabel(input),
    roleLabel: formatRoleCodeVi(input.roleCode),
  };
}

/** Forbidden annotation-strip tokens (CD-FB-06 sponsor lock). */
export const EMBED_ANNOTATION_FORBIDDEN_SNIPPETS = [
  'Ngữ cảnh',
  'JWT',
  'companyId=main',
  'AC-CD-F3',
] as const;
