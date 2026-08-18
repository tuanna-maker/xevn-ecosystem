# HDSD UAT — W2b HRM Embed (Command Center)

**work_item_id:** `QA-HDSD-FULL-W0-W4-01`  
**Program:** `HDSD-P2-FULL-01`  
**Date:** 2026-07-30  
**Persona:** `ceo@xe.vn` / `Xevn@2026`  
**Entry:** `http://127.0.0.1:5173/hr/*` (portal proxy embed)

## L2.5 J-* spot

| Journey | Verdict | Detail |
|---------|---------|--------|
| J-HRM-01 employees list→detail | 🟢 | clickRow=true; GET detail **200** |
| J-HRM-02 contracts list | 🟢 | GET **200** |
| J-CC-HRM cross-nav | 🟢 | CC → `/hr/employees` → back CC (prior ch02-11 pattern) |

## Results

| TC ID | UF | Verdict | Route | Network |
|-------|-----|---------|-------|---------|
| TC-HRM-HDSD-01-01 | UF-HRM-01 | 🟢 | `/hr/employees` | GET **200** |
| TC-HRM-HDSD-01-02 | — | 🟢 | list→detail | detailGET **200** |
| TC-HRM-HDSD-02-01 | UF-HRM-04 | 🟢 | `/hr/contracts` | GET **200** |
| TC-HRM-HDSD-03-01 | UF-HRM-07 | 🟢 | `/hr/recruitment` | GET **200** |
| TC-HRM-HDSD-04-01 | UF-HRM-08 | 🟢 | `/hr/attendance` | GET **200** |
| TC-HRM-HDSD-05-01 | UF-HRM-10 | 🟢 | `/hr/payroll` | GET **200** |
| TC-HRM-HDSD-06-01 | Headcount | 🟢 | `/hr/company` | headcountAPI **200** |
| TC-HRM-HDSD-07-01 | UF-HRM-12 | 🟢 | `/hr/settings` | catalogSync **200** |
| TC-HRM-HDSD-07-02 | UF-HRM-13 | 🟢 | `/hr/reports` | GET **200** |

## Console

No `ERR_CONNECTION_REFUSED :54321`, no `409 companyId mismatches` on load paths.

## Screenshots

`docs/qa/evidence/screens/hdsd-uat-20260730/w2b-*.png` (+ shared ch02 shots)

## ack_status

**PASS_TO_PM** (W2b **9/9 🟢**)
