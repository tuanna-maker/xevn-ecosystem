/**
 * @CODE-MEMORY
 * Screen:     HRM embed working-context chip (portal iframe)
 * UC:         UC-HRM-SCOPE-05 · BM-AC-02-01 · AC-CD-F3-01
 * BR:         BR-CD-F3-01
 * SRS:        docs/program/deltas/BMINUTES_AC_MATRIX.md BM-AC-02-01
 * TechSpec:   docs/decisions/ADR-HRM-RBAC-SCOPE-LADDER.md §5.3
 * Purpose:    Map JWT roleCode → Vietnamese chip text inside HRM embed (parity with portal TopHeader).
 * WorkItem:   BM-FE-ROLE-SWITCH-01
 * Coded:      2026-07-22
 * Callers:    HrmOperatingUnitFilter → formatRoleCodeVi
 * Callees:    none (pure map)
 * FEActions:  JWT roleCode → VI label on embed surface
 * Impact:     Missing subsidiary_ceo alias → English underscore chip (R-CD-FB-06-01 class)
 * must_keep:  group_ceo / ceo / hrbp_manager / member_ceo / subsidiary_ceo VI; empty → em dash
 * SOLID:      Shared label map only — layout stays in HrmOperatingUnitFilter
 * LastVerified: scopeRoleLabels.test.ts
 *
 * @CODE-MEMORY-CHANGE 2026-08-03 W1-B-02-EMP-FE-LIBS-01
 * change_mode: ADD (restore)
 * What: Restore scopeRoleLabels (+ test) transitive dep of embedWorkingContext from stash 43c479a
 * Why: Unblock HRM SPA boot after D-HRM-LIB-MISSING-01
 * must_keep: subsidiary_ceo / group_ceo / member_ceo VI maps · empty → em dash
 */
/** Vietnamese labels for portal/HRM scope chips (AC-CD-F3-01 / BM-AC-02-01). */
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
