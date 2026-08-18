# QC Gate — HRM-EMP-COMPANY-COL-01 (2026-07-30)
| Field | Value |
|-------|-------|
| work_item_id | HRM-EMP-COMPANY-COL-01 |
| from_role | qc |
| to_role | pm |
| date | 2026-07-30 |
| governance | HOLD_DEPLOY · U65 · must_keep C1/D5/P0-c/Profile |
| source | qc-hrm-emp-company-col-01-20260729.md |
| ack_status | PASS_TO_PM |
## Verdict
PASS. Company-col sync verified: mapEmployee adds company_id/company_uuid/company_display_name on list/create/get/update/archive endpoints (75+ tests passing, zero failures). No regressions on pagination or scope.
## Source evidence
docs/qa/evidence/qc-hrm-emp-company-col-01-20260729.md
