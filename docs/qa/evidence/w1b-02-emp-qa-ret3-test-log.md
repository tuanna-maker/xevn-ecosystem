# Test execution log — W1-B-02-EMP-QA-RET3

| Field | Value |
|-------|--------|
| **log_id** | `TEL-W1B-02-EMP-QA-RET3-20260803` |
| **work_item_id** | `W1-B-02-EMP-QA-RET3` |
| **tester** | qa · agent RET3 browser harness |
| **started_at** | `2026-08-03T13:47:32.769Z` |
| **ended_at** | `2026-08-03T13:48:00.862Z` |
| **environment** | portal `http://127.0.0.1:5173` · HRM Vite `:8080` · hrm-api `:28001` · xbos-api `:28002` · persona `ceo@xe.vn` · `company_id=main` |
| **hdsd_sot** | HDSD Nhân viên · menu/list/detail/Lưu |
| **spec_ref** | FR-UC-H01 · FR-UC-HRM-21 · J-HRM-02 |
| **hdsd_align** | true |
| **u65_zero_seed** | true |
| **machine_log** | `docs/qa/evidence/w1b-02-emp-qa-ret3-test-log.json` |
| **evidence_narrative** | `docs/qa/evidence/w1b-02-emp-qa-ret3.md` |

## Chronological steps

| seq | time | action (HDSD) | expected | actual | network | result | attachment |
|-----|------|---------------|----------|--------|---------|--------|------------|
| 1 | 2026-08-03T13:47:32.846Z | API login Group CEO | 2xx + token | HTTP **201** | POST `/api/xbos/auth/login` 201 | pass | — |
| 2 | 2026-08-03T13:47:33.267Z | Open portal shell | shell loads | navigated `:5173/` | GET `/api/xbos/auth/me` 200 | pass | `screens/…/00-shell.png` |
| 3 | 2026-08-03T13:47:36.026Z | Nav Nhân viên (fallback URL after menu miss) | `/hr/employees` list | landed employees URL | — | pass | — |
| 4 | 2026-08-03T13:47:40.404Z | Assert list render (AC1) | `#root` not empty · table rows | rootChild=**4** · rows=**43** | GET `/api/hrm/employees?company_id=main…` **200** | pass | `screens/…/01-employees-list.png` |
| 5 | 2026-08-03T13:47:40.405Z | Case A — open create/edit form | dialog/form visible | create CTA not activated; row click → profile fail | EmployeeProfile **500** | fail | `screens/…/03-case-a-fail.png` |
| 6 | 2026-08-03T13:47:43.xxxZ | Case A — bad/empty + Lưu | validation UI · no success mutate | submit miss · no dialog | none | fail | — |
| 7 | 2026-08-03T13:47:47.xxxZ | Case B — click holding/SoftDel row (J-HRM-02) | profile FE + GET by id `company_id=main` 2xx | URL `/employees/4315dade-…` · white screen · no detail GET | GET by id **not fired** | fail | `screens/…/04-case-b-detail.png` |
| 8 | 2026-08-03T13:47:50.xxxZ | Case B — UI PATCH + Lưu | PATCH 2xx via FE | UI PATCH miss (U65 no API invent) | none | fail | — |
| 9 | 2026-08-03T13:47:54.xxxZ | Case B — F5 after mutate | profile still OK | F5 on whitescreen URL · no GET by id | none | fail | `screens/…/06-case-b-f5.png` |
| 10 | 2026-08-03T13:47:54–13:48:00Z | Case C — re-open row · logic BR | detail 2xx under main · no snake label | reopen still whitescreen; list shows raw **STAFF** | list GET 200 only | fail | `screens/…/07-case-c-reopen.png` |

## Case matrix results

| Case | id | status | notes |
|------|-----|--------|-------|
| A fail deep | `A_fail` | **fail** | Form path unreachable; no validation UI observed |
| B success HDSD | `B_success` | **fail** | List PASS; detail/PATCH/F5 FAIL (`PermissionFallback` missing) |
| C logic BR | `C_logic` | **fail** | Scope detail not proven; list CHỨC VỤ=`STAFF` raw code |

## Incidents

| id | severity | expected | actual | residual WI |
|----|----------|----------|--------|-------------|
| D-HRM-EMP-PROFILE-PERM-FALLBACK-01 | P0 | EmployeeProfile module loads | Vite resolve fail `@/components/auth/PermissionFallback` | `W1-B-02-EMP-FE-PROFILE-01` (dev-fe) |
| D-HRM-EMP-PROFILE-TABGROUPS-01 | P1 | `employeeProfileTabGroups` present | file absent on disk (latent after fallback restore) | same FE wave |
| D-HRM-LIB-MISSING-01 | — | list boot | **CLOSED** — libs 200 · list renders | — |

## Summary

| passed | failed | blocked | skipped |
|--------|--------|---------|---------|
| 4 | 6 | 0 | 0 |

**verdict:** fail  
**ack_status:** FAIL  
**SoT:** `_vibe-team-os/31-WORLD-STANDARD-TEST-LOG.md`
