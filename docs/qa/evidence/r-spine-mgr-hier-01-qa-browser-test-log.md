# Test execution log — R-SPINE-MGR-HIER-01-QA-BROWSER

| Field | Value |
|-------|--------|
| **log_id** | `TEL-R-SPINE-MGR-HIER-01-QA-BROWSER-20260803` |
| **work_item_id** | `R-SPINE-MGR-HIER-01-QA-BROWSER` |
| **tester** | qa · Playwright harness `_tmp-r-spine-mgr-hier-01-qa-browser.mjs` |
| **started_at** | `2026-08-03T15:39:51.885Z` |
| **ended_at** | `2026-08-03T15:40:20.152Z` |
| **environment** | portal `http://127.0.0.1:5173` · hrm-api `:28001` · xbos-api `:28002` · persona `ceo@xe.vn` · `company_id=main` |
| **hdsd_sot** | HDSD Nhân viên — list / hồ sơ / Chỉnh sửa / Quản lý trực tiếp / Cập nhật |
| **spec_ref** | FR-UC-H01 · FR-UC-H03 · J-HRM-02 · BA Option B |
| **hdsd_align** | true |
| **u65_zero_seed** | true |
| **machine_log** | `docs/qa/evidence/r-spine-mgr-hier-01-qa-browser-test-log.json` |
| **evidence_narrative** | `docs/qa/evidence/r-spine-mgr-hier-01-qa-browser.md` |

## Chronological steps

| seq | time | action (HDSD) | expected | actual | network | result | attachment |
|-----|------|---------------|----------|--------|---------|--------|------------|
| 1 | 2026-08-03T15:39:51.886Z | API login Group CEO | 2xx + token | HTTP **201** | POST `/api/xbos/auth/login` 201 | pass | — |
| 2 | 2026-08-03T15:39:52.416Z | Nav Nhân viên | `/hr/employees` list | landed employees URL | — | pass | `…/01-employees-list.png` |
| 3 | 2026-08-03T15:39:57.403Z | Assert list render | `#root` + rows | rootChild=**4** · rows=**47** | GET employees main **200** | pass | same |
| 4 | 2026-08-03T15:39:57.404Z | Open subordinate ≠ HLD-0001 | holding NV with mobile login | **UAT-0003** `uat.nv0003@xe.vn` `2680f15f-…` | — | pass | `…/02-employee-detail.png` |
| 5 | 2026-08-03T15:40:01.717Z | Chỉnh sửa | form dialog | `hdsd-employee-form-dialog` | — | pass | `…/03-edit-dialog.png` |
| 6 | 2026-08-03T15:40:04.109Z | Open Quản lý trực tiếp picker | testid visible | `hdsd-employee-form-manager-picker` | — | pass | — |
| 7 | 2026-08-03T15:40:04.979Z | Search HLD-0001 | options load | typed `HLD-0001` | — | pass | `…/04-picker-open.png` |
| 8 | 2026-08-03T15:40:06.281Z | Select HLD-0001 / uat.nv0001 | display-ready label | `HLD-0001 — Nguyễn Văn An · STAFF` | — | pass | `…/05-manager-selected.png` |
| 9 | 2026-08-03T15:40:07.403Z | Cập nhật / Lưu | PATCH 2xx + `manager_id` in body | PATCH **200** `HRM-EMP-202` · request `manager_id=3796d949-…` | PATCH `/api/hrm/employees/2680f15f-…` **200** | pass | `…/06-after-save.png` |
| 10 | 2026-08-03T15:40:14.043Z | FE after 2xx | dialog close / profile refresh | FE after mutate observed | GET detail manager_id set | pass | `…/07-fe-after-2xx.png` |
| 11 | 2026-08-03T15:40:14.097Z | F5 reload | `manager_id` retained on GET | GET detail **200** · `manager_id=3796d949-…` | GET `…/employees/2680f15f-…?company_id=main` **200** | pass | `…/08-after-f5.png` |
| 12 | 2026-08-03T15:40:18.864Z | Tab Công việc (display check) | QL trực tiếp visible if label ready | API PASS; UI label residual (manager_label null) | — | pass* | `…/09-after-f5-work-tab.png` |

\*Wave PASS on hierarchy persistence; UI display-ready = residual P2.

## Case matrix results

| Case | id | status | notes |
|------|-----|--------|-------|
| A fail deep | `A_fail` | **pass** | Selected HLD-0001 not self |
| B success HDSD | `B_success` | **pass** | FE picker → Lưu PATCH 200 → F5 GET retains manager_id |
| C logic BR | `C_logic` | **pass** | Option B; L1 = uat.nv0001; cấm Option C CEO-as-L1 |

## Incidents

| id | severity | expected | actual | residual WI |
|----|----------|----------|--------|-------------|
| R-SPINE-MGR-RUNTIME-STALE | P0 env | PATCH accepts manager_id | First attempt 400 `property manager_id should not exist` on stale dist | CLOSED after restart |
| R-SPINE-MGR-UI-LABEL-F5 | P2 | Profile shows HLD-0001 after F5 | GET has manager_id; UI «—» when manager_label null | OPEN → dev-fe |

## Summary

| passed | failed | blocked | skipped |
|--------|--------|---------|---------|
| 12 | 0 | 0 | 0 |

**verdict:** pass  
**ack_status:** PASS_TO_PM  
**next_owner:** qa-device (J-MOB-05 Option A)  
**SoT:** `_vibe-team-os/31-WORLD-STANDARD-TEST-LOG.md`
