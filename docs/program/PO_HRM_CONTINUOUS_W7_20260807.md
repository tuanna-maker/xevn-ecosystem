# PO HRM — Continuous Wave W7 (2026-08-07T19:59+07)

**Trigger:** Sponsor «mở liên tục · tự check · tự mở việc mới»  
**Prior:** Resume plan K1–K6 **CLOSED** (slice GWC) — **không** = product DONE  
**Honesty LOCKED:** `payroll_e2e_ready=false` · `attendance_uat_ready=false` · `recruitment_uat_ready=false` · `contracts_printable_ready=false` · `C-SLICE-≠-MODULE`

## DENY
AMIS DONE · Phase1 · module UAT · formula LIVE · invent ready=true · seed · reopen K1–K6 sealed seats

## Stale noise (ignore — superseded)
`pm:idle:check` ALLOWANCE/SETTINGS-QA-01/PROCESS-POST-01/REC-BE intake · `PM-RECOVER-stale_in_flight` weeks-old — **cấm** spawn generic recover Tasks.

## W7 seats (DISPATCHED)

| ID | Owner | Mission | Why |
|----|-------|---------|-----|
| `PO-HRM-PAYROLL-J-HRM-07-FULL-QA-01` | qa | Full browser U65 spine ATT→period→enroll→process→cards/payslip | **PASS** stamp PAYJ07FULL-MSIYSHHY → `…-QC-01` |
| `PO-HRM-PAYROLL-J-HRM-07-FULL-QC-01` | qc | Gate full-spine QA · honesty false LOCKED | **GWC** stamp PAYJ07FULL-MSIYSHHY · `payroll_e2e_ready=false` · C-SLICE retained |

## W7.5 (after J07 FULL GWC — continuous)

| ID | Owner | Mission | Why |
|----|-------|---------|-----|
| `PO-HRM-CONTRACT-LEGAL-PRINT-DATA-02` | ba-data | Physicalize group publish + lineage | **CONFIRMED** → `…-BE-02` |
| `PO-HRM-CONTRACT-LEGAL-PRINT-BE-02` | dev-be | PUB/PULL/APPLY Nest + schema | **READY** (BE-03 SoT / be-02-pub) → `…-FE-03` |
| `PO-HRM-CONTRACT-LEGAL-PRINT-FE-03` | dev-fe | Settings Publish/Pull/Apply + origin badge | **READY** → `…-QA-03` |
| `PO-HRM-AMIS-PARITY-PAY-ESS-FE-01` | dev-fe | ESS payslip confirm UI after L1 GWC | **READY_FOR_QA** → `…-QA-02` |
| `PO-HRM-AMIS-PARITY-PAY-ESS-QA-02` | qa | U65 browser ESS confirm (nv0001 + ceo 403) | **FAIL** scope coerce → `…-FE-02` |
| `PO-HRM-AMIS-PARITY-PAY-ESS-FE-02` | dev-fe | Fix holding→main coerce on me/payslips* | **READY** → QA-02 retest |
| `PO-HRM-AMIS-PARITY-PAY-ESS-QA-02` | qa | U65 retest AC1–AC5 after FE-02 | **PASS** stamp PAYESSQA2-IZE9S5 → `…-QC-02` |
| `PO-HRM-AMIS-PARITY-PAY-ESS-QC-02` | qc | QC gate ESS browser slice | **GWC** D-PAY-ESS-FE-SCOPE-COERCE CLOSED · seat IDLE-OK · ready=false |
| `PO-HRM-CONTRACT-LEGAL-PRINT-QA-03` | qa | U65 holding publish → member pull/apply | **FAIL** D-CTR-FE-HRMAPI-COMMENT-SWC → `…-FE-04` |
| `PO-HRM-CONTRACT-LEGAL-PRINT-FE-04` | dev-fe | FIX CODE-MEMORY `*/` breaks SWC | **READY** → QA-03 retest |
| `PO-HRM-CONTRACT-LEGAL-PRINT-QA-03` | qa | U65 retest Publish/Pull/Apply after SWC fix | **PASS** stamp CTR3-J0T6L2 → `…-QC-03` |
| `PO-HRM-CONTRACT-LEGAL-PRINT-QC-03` | qc | QC gate library publish slice | **GWC** CTR3-J0T6L2 · printable ready=false → DEC-DOCS |
| `PO-HRM-PAYROLL-PERIOD-LIST-TOTALS-BE-01` | dev-be | Display-ready `total_*` on GET periods list | **READY_FOR_QA** → `…-QA-01` |
| `PO-HRM-PAYROLL-PERIOD-LIST-TOTALS-QA-01` | qa | Assert list totals = payslip SUM / PROCESS | **FAIL** runtime stale → `…-DEVOPS-01` |
| `PO-HRM-PAYROLL-PERIOD-LIST-TOTALS-DEVOPS-01` | devops | Rebuild+restart hrm-api dist totals | **READY** stamp PAYLISTTOTDEVOPS-MSIZRBLD → QA retest |
| `PO-HRM-PAYROLL-PERIOD-LIST-TOTALS-QA-01` | qa | Retest list totals after live rebuild | **PASS** stamp PAYLISTTOTQA-MSIZ6H4F → `…-QC-01` |
| `PO-HRM-PAYROLL-PERIOD-LIST-TOTALS-QC-01` | qc | Narrow GWC list totals seat | **GWC** R-PAY-PERIOD-LIST-TOTALS API CLOSED · FE bind OBS idle-ok |
| `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-VERTICAL-SA-01` | sa | Platform Option B EMP vertical F.1 | **PASS** → `…-EMP-DATA-01` |
| `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-DATA-01` | ba-data | Physicalize emp_document_type + emp_employment_type | **CONFIRMED** → `…-EMP-BE-01` |
| `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-BE-01` | dev-be | ensureSchema + Nest F-EMP-CAT-DOC/ET/EFF | **READY** → `…-EMP-QA-01` |
| `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-QA-01` | qa | L1 API verify DOC/ET/EFF (FE HOLD) | **FAIL** stale dist → `…-EMP-DEVOPS-01` |
| `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-DEVOPS-01` | devops | Rebuild+restart hrm-api EMP catalog routes | **READY** stamp EMPPLATDEVOPS-MSIZICMH → QA retest |
| `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-QA-01` | qa | Retest L1 AC 1–7 after rebuild | **PASS** stamp EMPPLATQA-MSIZXHIM → `…-EMP-QC-01` |
| `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-QC-01` | qc | L1-SEAL EMP catalogs · residual FE | **GWC** L1 SEAL → `…-EMP-FE-01` |
| `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-FE-01` | dev-fe | Settings DOC/ET open catalog pickers | **READY** → `…-EMP-QA-02` |
| `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-QA-02` | qa | U65 browser Settings DOC/ET | **PASS** stamp EMPPLATQA2-MSJ0OAL9 → `…-EMP-QC-02` |
| `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-QC-02` | qc | Narrow QC browser AC-PLT-EMP | **GWC** EMPPLATQA2-MSJ0OAL9 · R-PLT-EMP-FE CLOSED → MergeToken SA |
| `PO-HRM-DYNAMIC-CONFIG-PLATFORM-MERGE-TOKEN-EMP-SA-01` | sa | MergeToken hook `custom.emp` F.1 | U88 after EMP-QC-02 |
| `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-DOCS-01` | ba-docs | Client DOC-DELTA EMP catalog F.1 | **SEALED** R-PLT-EMP-03 · FE-01 HOLD until L1 PASS |

## Chain after READY
Each READY_FOR_QA → QA → QC same session · then open W7.5+ from residuals / contracts printable path / formula author GĐ1 form if still HOLD.
