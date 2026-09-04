# PM Dispatch — 2026-07-30 (S7)

| Field | Value |
|-------|-------|
| from_role | qc |
| to_role | pm |
| date | 2026-07-30 |
| unlock_wave | UNLOCK-WAVE-B-20260729 |
| governance | HOLD_DEPLOY · U65 · must_keep C1/D5/P0-c/Profile |

## Summary

QC gates issued for all 6 UNLOCK-WAVE-B items plus 2 legacy HOOK queues.
**7 PASS · 1 FAIL · suppressed=25 probes**

## Per-item verdict

| ID | Verdict | Evidence file | Note |
|---|---|---|---|
| HOOK-qa-276034_5 | PASS_TO_PM | docs/qa/evidence/qc-hook-qa-276034-20260729.md | ERP fidelity recovered |
| HOOK-qa-309fd5_5 | PASS_TO_PM | docs/qa/evidence/qc-hook-qa-276034-20260729.md | MD picker recovered |
| P1-EX-QA-HTTPS-RESIDUAL-03-R3 | PASS_TO_PM | docs/qa/evidence/qc-p1-ex-qa-https-residual-03-r3-20260730.md | reconcile-complete |
| HRM-EMP-COMPANY-COL-01 | PASS_TO_PM | docs/qa/evidence/qc-hrm-emp-company-col-01-20260730.md | 75+ tests 0 fail |
| MOB-XEVN-BRAND-PRIMITIVES-L2-01 | PASS_TO_PM | docs/qa/evidence/qc-mob-xevn-brand-primitives-l2-01-20260730.md | L2 DNA confirmed |
| MOB-XEVN-BRAND-TOKENS-L1-01 | PASS_TO_PM | docs/qa/evidence/qc-mob-xevn-brand-tokens-l1-01-20260730.md | L1 token set clean |
| HRM-SETTINGS-MASTER-DATA-01 | PASS_TO_PM | docs/qa/evidence/qc-hrm-settings-master-data-01-20260730.md | CRUD flow ok |
| MOB-SPEC-ORPHAN-CODE-SAMPLE-01 | FAIL_TO_PM | docs/qa/evidence/qc-mob-spec-orphan-code-sample-01-20260730.md | Khối hardcode still present |

## Blocking item

MOB-SPEC-ORPHAN-CODE-SAMPLE-01 (FAIL) — requires fix:
Replace PILOT_HRM_OPERATING_UNITS "Khối" hardcodes with binding
to legal DB company_display_name via resolveHrmCompanyUuidForSlug.

## Suppressed probes

25 items suppressed under existing-route-first rule.
No new probes launched.
