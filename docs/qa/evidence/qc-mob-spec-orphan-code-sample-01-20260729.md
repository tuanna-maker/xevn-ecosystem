# QC MOB-SPEC-ORPHAN-CODE-SAMPLE-01

| Field | Value |
|-------|-------|
| work_item_id | MOB-SPEC-ORPHAN-CODE-SAMPLE-01 |
| Date | 2026-07-29 |
| Role | QC |
| Deploy | HOLD_DEPLOY |

---

## Verdict

FAIL.

Pending mobile diff is a brand-shell/theme-token cleanup (LoginScreen/ScopeScreen/SettingsScreen/PayslipList Screen colors + borderWidth.thin). companyDisplayVi.ts only got Plane B prime UUID-slug pre-step plus @CODE-MEMORY thickening -- not replacing PILOT_HRM_OPERATING_UNITS "Khối" hardcode or binding tolegal DB company_display_name. The orphan behavior G-ORPH-MOB-01..03 remains present in the working tree. Register still cites G-ORPH-MOB-01..03 as OPEN (HOLD_DEPLOY/U65 retained). No APK built, no U65 run.

Evidence baseline: docs/qa/evidence/mob-spec-orphan-code-sample-01-20260722.md

Files checked:
- apps/mobile/hrm-mobile/src/utils/companyDisplayVi.ts (UUID-slug pre-step added; hardcode "Khối" labels still present)
- apps/mobile/hrm-mobile/src/integrations/hrmOperatingUnits.ts (unchanged)
- apps/mobile/hrm-mobile/src/utils/scopeScreenCopy.ts (unchanged)
- apps/mobile/hrm-mobile/src/utils/dashboardHome.ts (unchanged)
- apps/mobile/hrm-mobile/src/utils/payslipDisplayVi.ts (unchanged)
- apps/mobile/hrm-mobile/src/features/auth/LoginScreen.tsx (brand token cleanup only)
- apps/mobile/hrm-mobile/src/features/auth/ScopeScreen.tsx (brand token cleanup only)
- apps/mobile/hrm-mobile/src/features/settings/SettingsScreen.tsx (brand token cleanup only)
- apps/mobile/hrm-mobile/src/features/dashboard/DashboardScreen.tsx (not in diff)
- apps/mobile/hrm-mobile/src/features/payroll/PayslipListScreen.tsx (brand token cleanup only)
