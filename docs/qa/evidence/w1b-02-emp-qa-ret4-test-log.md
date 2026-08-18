# Test execution log — W1-B-02-EMP-QA-RET4

| Field | Value |
|-------|--------|
| **log_id** | `TEL-W1B-02-EMP-QA-RET4-20260803` |
| **work_item_id** | `W1-B-02-EMP-QA-RET4` |
| **tester** | qa · agent RET4 browser harness |
| **started_at** | `2026-08-03T14:02:12.314Z` |
| **ended_at** | `2026-08-03T14:02:48.708Z` |
| **environment** | portal `http://127.0.0.1:5173` · HRM Vite `:8080` · hrm-api `:28001` · xbos-api `:28002` · persona `ceo@xe.vn` · `company_id=main` |
| **hdsd_sot** | HDSD Nhân viên · menu/list/detail/Lưu/Cập nhật |
| **spec_ref** | FR-UC-H01 · FR-UC-HRM-21 · J-HRM-02 |
| **hdsd_align** | true |
| **u65_zero_seed** | true |
| **machine_log** | `docs/qa/evidence/w1b-02-emp-qa-ret4-test-log.json` |
| **evidence_narrative** | `docs/qa/evidence/w1b-02-emp-qa-ret4.md` |

## Chronological steps

| seq | time | action (HDSD) | expected | actual | network | result | attachment |
|-----|------|---------------|----------|--------|---------|--------|------------|
| 1 | 2026-08-03T14:02:12.412Z | API login Group CEO | 2xx + token | HTTP **201** | POST `/api/xbos/auth/login` 201 | pass | — |
| 2 | 2026-08-03T14:02:12.880Z | Open portal shell | shell loads | navigated `:5173/` | GET `/api/xbos/auth/me` 200 | pass | `screens/w1b-02-emp-qa-ret4-20260803/00-shell.png` |
| 3 | 2026-08-03T14:02:15.679Z | Nav Nhân viên (fallback URL) | `/hr/employees` list | landed employees URL | — | pass | — |
| 4 | 2026-08-03T14:02:20.124Z | Assert list render (AC1) | `#root` + rows | rootChild=**4** · rows=**43** | GET `/api/hrm/employees?company_id=main…` **200** | pass | `…/01-employees-list.png` |
| 5 | 2026-08-03T14:02:20.137Z | Case A — Thêm nhân viên | create dialog | `hdsd-employees-create-btn` opened | — | pass | `…/02-create-dialog.png` |
| 6 | 2026-08-03T14:02:22.155Z | Case A — clear name + Lưu | validation · no success mutate | validationUi · no POST/PATCH 2xx | none mutate | pass | `…/03-case-a-fail.png` |
| 7 | 2026-08-03T14:02:25.775Z | Case B — click SoftDel/holding row (J-HRM-02) | profile FE + GET by id `company_id=main` 2xx | URL `/employees/4315dade-…` · tabs · textLen 1273 | GET `…/employees/{id}?company_id=main` **200** | pass | `…/04-case-b-detail.png` |
| 8 | 2026-08-03T14:02:29.892Z | Case B — Chỉnh sửa → edit `full_name` | dialog + field mutate | dialog · `#full_name` → `… ·RET4` | — | pass | `…/04b-case-b-edit-dialog.png` |
| 9 | 2026-08-03T14:02:32.293Z | Case B — Cập nhật (PATCH via FE) | PATCH 2xx + display-ready | PATCH **200** `HRM-EMP-202` · `display_name` updated | PATCH `/api/hrm/employees/{id}` **200** | pass | `…/05-case-b-after-patch.png` |
| 10 | 2026-08-03T14:02:36.914Z | Case B — F5 after mutate | profile still OK · GET 2xx | F5 URL same · GET by id **200** · name persists | GET `…?company_id=main` **200** | pass | `…/06-case-b-f5.png` |
| 11 | 2026-08-03T14:02:44.487Z | Case C — back list → re-open row | detail under main · no snake label | reopen GET **200** · `company_id=holding` · snakeUi=[] | GET by id **200** | pass | `…/07-case-c-reopen.png` |

## Case matrix results

| Case | id | status | notes |
|------|-----|--------|-------|
| A fail deep | `A_fail` | **pass** | Create dialog + empty name blocked; no silent success |
| B success HDSD | `B_success` | **pass** | J-HRM-02 + UI PATCH + F5 all PASS |
| C logic BR | `C_logic` | **pass** | main query resolves holding detail; no snake `job_title_label` on profile |

## Incidents

| id | severity | expected | actual | residual WI |
|----|----------|----------|--------|-------------|
| D-HRM-EMP-PROFILE-PERM-FALLBACK-01 | P0 | Profile mounts | **CLOSED** — RET4 browser PASS | — |
| R-EMP-UI-STAFF-RAW | P2 | List display-ready job title | List sample API still `job_title_label: "STAFF"` | defer display wave |

## Summary

| passed | failed | blocked | skipped |
|--------|--------|---------|---------|
| 11 | 0 | 0 | 0 |

**verdict:** pass  
**ack_status:** PASS_TO_PM  
**SoT:** `_vibe-team-os/31-WORLD-STANDARD-TEST-LOG.md`
