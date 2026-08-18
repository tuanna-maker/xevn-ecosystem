# QC Gate — MOB-SPEC-ORPHAN-CODE-SAMPLE-01 (2026-07-30)
| Field | Value |
|-------|-------|
| work_item_id | MOB-SPEC-ORPHAN-CODE-SAMPLE-01 |
| from_role | qc |
| to_role | pm |
| date | 2026-07-30 |
| governance | HOLD_DEPLOY · U65 · must_keep C1/D5/P0-c/Profile |
| source | qc-mob-spec-orphan-code-sample-01-20260729.md |
| ack_status | FAIL_TO_PM |
## Verdict
FAIL. Orphan behavior G-ORPH-MOB-01..03 still present: companyDisplayVi.ts UUID-slug pre-step added but "Khối" hardcode labels remain; hrmOperatingUnits.ts / scopeScreenCopy.ts / dashboardHome.ts / payslipDisplayVi.ts unchanged. Register shows G-ORPH-MOB-01..03 OPEN.
## Required fix
Replace PILOT_HRM_OPERATING_UNITS "Khối" hardcodes with binding to legal DB company_display_name via resolveHrmCompanyUuidForSlug.
## Source evidence
docs/qa/evidence/qc-mob-spec-orphan-code-sample-01-20260729.md
