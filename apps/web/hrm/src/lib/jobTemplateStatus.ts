/**
 * @CODE-MEMORY
 * Screen:     /hr/recruitment — Thư viện JD status chips
 * UC:         UC-BP-REC-00 · AC-REC-JD-00-01 · VAL-REC-JD-05/08/20
 * BR:         BR-REC-JD-STATUS · O2 bridge
 * SRS:        SRS_HRM_ENTERPRISE.md FR-UC-BP-REC-00 Diễn biến #1–#3
 * TechSpec:   docs/program/specs/PO-HRM-MVP-GD1-REC-00-CLUSTER-API-01.md §4
 * Purpose:    Resolve display-ready JD status from DTO (status canonical + is_active bridge).
 * WorkItem:   PO-HRM-MVP-GD1-REC-00-CLUSTER-FE-01
 * Coded:      2026-08-09
 * must_keep:  Prefer DTO status; no Nest /rec; no boolean-only Nháp=Ngừng invent as SoT
 * SOLID:      Pure helpers — UI chips consume labels only
 * LastVerified: docs/qa/evidence/po-hrm-mvp-gd1-rec-00-cluster-fe-01.md
 */

export type JdTemplateLifecycleStatus = 'draft' | 'active' | 'retired';

export type JdTemplateStatusLike = {
  status?: string | null;
  is_active?: boolean | null;
};

const VI_LABEL: Record<JdTemplateLifecycleStatus, string> = {
  draft: 'Nháp',
  active: 'Hiệu lực',
  retired: 'Ngừng',
};

/**
 * Canonical status from DTO — prefer `status`; bridge from `is_active` only when status absent (migrate dual-assert).
 * DENY inventing Nháp vs Ngừng when both map to is_active=false without status (EX-12) — use draft conservatively.
 */
export function resolveJdTemplateStatus(
  row: JdTemplateStatusLike | null | undefined,
): JdTemplateLifecycleStatus {
  const raw = typeof row?.status === 'string' ? row.status.trim().toLowerCase() : '';
  if (raw === 'draft' || raw === 'active' || raw === 'retired') return raw;
  if (raw === 'hieu_luc' || raw === 'hiệu lực' || raw === 'published') return 'active';
  if (raw === 'ngung' || raw === 'ngừng' || raw === 'inactive') return 'retired';
  if (raw === 'nhap' || raw === 'nháp') return 'draft';
  // Dual-assert migrate: status null → is_active bridge (API-01 §6.5)
  if (row?.is_active === true) return 'active';
  return 'draft';
}

export function jdTemplateStatusLabelVi(status: JdTemplateLifecycleStatus): string {
  return VI_LABEL[status];
}

export function jdTemplateStatusChipClass(status: JdTemplateLifecycleStatus): string {
  switch (status) {
    case 'active':
      return 'border-transparent bg-success/15 text-success';
    case 'retired':
      return 'border-transparent bg-muted text-muted-foreground';
    case 'draft':
    default:
      return 'border-transparent bg-warning/15 text-warning';
  }
}

export function isJdTemplateDraft(row: JdTemplateStatusLike | null | undefined): boolean {
  return resolveJdTemplateStatus(row) === 'draft';
}

export function isJdTemplateActive(row: JdTemplateStatusLike | null | undefined): boolean {
  return resolveJdTemplateStatus(row) === 'active';
}

export function isJdTemplateRetired(row: JdTemplateStatusLike | null | undefined): boolean {
  return resolveJdTemplateStatus(row) === 'retired';
}

/** Client list filter — prefers DTO status; all = no filter. */
export function filterJdTemplatesByStatus<T extends JdTemplateStatusLike>(
  rows: readonly T[],
  statusFilter: 'all' | JdTemplateLifecycleStatus,
): T[] {
  if (statusFilter === 'all') return [...rows];
  return rows.filter((row) => resolveJdTemplateStatus(row) === statusFilter);
}
