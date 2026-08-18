# HDSD UAT — W2a HRM Standalone

**work_item_id:** `QA-HDSD-FULL-W0-W4-01`  
**Program:** `HDSD-P2-FULL-01`  
**Date:** 2026-07-30  
**Persona:** `ceo@xe.vn` / `Xevn@2026`  
**Entry:** `http://127.0.0.1:8080/hr/` (canonical Vite HRM app — `:5175` không listen; `:8080/hr/` per `apps/web/hrm/vite.config.ts`)

## L0 note

Initial run blocked on `/hr` (404 without trailing slash). Supplement run with `/hr/` → **200**.

## Results

| TC ID | UF | Verdict | URL | Network |
|-------|-----|---------|-----|---------|
| TC-ECO-03-standalone | HRM Ch.0 | 🟢 | `/hr/login` → post-login | UI login OK |
| TC-HRM-HDSD-01-01 | UF-HRM-01 | 🟢 | `/hr/employees` | GET employees **200** |
| TC-HRM-HDSD-01-02 | J-HRM-EMP | 🟢 | `/hr/employees` | list load **200** |
| TC-HRM-HDSD-02-01 | UF-HRM-04 | 🟢 | `/hr/contracts` | GET **200** |
| TC-HRM-HDSD-04-01 | UF-HRM-08 | 🟢 | `/hr/attendance` | GET **200** |
| TC-HRM-HDSD-05-01 | UF-HRM-10 | 🟢 | `/hr/payroll` | GET **200** |
| TC-HRM-HDSD-06-01 | Headcount | 🟢 | `/hr/company` | GET **200** |
| TC-HRM-HDSD-07-01 | UF-HRM-12 | 🟢 | `/hr/settings` | GET **200** |

## Mutate (U65)

Post-reset empty DB — **load + list→detail only**; không seed. Tạo NV/HĐ mutate → 🟡 BLOCKED nếu empty (expected U65).

## Screenshots

Supplement run — reuse W2b screen naming pattern; runtime JSON `_tmp-qa-hdsd-full-w0-w4-runtime.json` §w2a.

## ack_status

**PASS_TO_PM** (W2a representative menus **8/8 🟢**)
