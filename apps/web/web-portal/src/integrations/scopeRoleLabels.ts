/**
 * @CODE-MEMORY
 * Screen:     Portal TopHeader — membership switcher role chip labels
 * UC:         UC-HRM-SCOPE-05 · AC-CD-F3-01
 * BR:         BR-CD-F3-01
 * SRS:        docs/program/deltas/CUSTOMER_DEMO_HRM_DELTA_20260620.md §3 F3
 * TechSpec:   docs/decisions/ADR-HRM-RBAC-SCOPE-LADDER.md §5.3
 * Purpose:    Map JWT/membership roleCode → Vietnamese chip text (never raw English underscore fallback for known pilot roles).
 * WorkItem:   CD-FB-06-ROLE-SWITCH
 * Coded:      2026-07-19
 * Callers:    TopHeader → formatRoleCodeVi
 * Callees:    none (pure map)
 * must_keep:  group_ceo / ceo / hrbp_manager / member_ceo / subsidiary_ceo VI; empty → em dash
 * LastVerified: scopeRoleLabels.test.ts
 *
 * @CODE-MEMORY-CHANGE 2026-07-19 CD-FB-06-ROLE-LABEL-P2
 * Why: QA residual R-CD-FB-06-01 — pilot JWT uses subsidiary_ceo; map was member_ceo only → chip showed "subsidiary ceo".
 * What: Alias subsidiary_ceo → same VI as member_ceo; vitest coverage.
 *
 * @CODE-MEMORY-CHANGE 2026-07-20 CD-FB-06-REMOVE-SCOPE-ANNOTATIONS
 * Why: Sponsor removed HrmEmbedScopeBar annotation strip; TopHeader membership chips remain SoT for role VI.
 * What: Callers list drops HrmEmbedScopeBar; formatRoleCodeVi / membershipTenantMatchesJwt kept.
 */
/** Vietnamese labels for portal/HRM scope chips (AC-CD-F3-01). */
const ROLE_LABEL_VI: Record<string, string> = {
  group_ceo: 'Tổng giám đốc tập đoàn',
  ceo_group: 'Tổng giám đốc tập đoàn',
  ceo: 'Tổng giám đốc',
  hrbp_manager: 'HRBP',
  hr_manager: 'Trưởng phòng HCNS',
  member_ceo: 'TGĐ công ty thành viên',
  /** Pilot JWT SoT for member CEOs (xbos auth / PILOT_PORTAL_USERS). */
  subsidiary_ceo: 'TGĐ công ty thành viên',
};

export function formatRoleCodeVi(roleCode: string | null | undefined): string {
  if (!roleCode?.trim()) return '—';
  const key = roleCode.trim().toLowerCase();
  if (ROLE_LABEL_VI[key]) return ROLE_LABEL_VI[key];
  return roleCode.replace(/_/g, ' ');
}

export function membershipTenantMatchesJwt(
  selectedTenantId: string | null | undefined,
  jwtTenantId: string | null | undefined,
): boolean {
  if (!selectedTenantId || !jwtTenantId) return true;
  return selectedTenantId.trim().toLowerCase() === jwtTenantId.trim().toLowerCase();
}
