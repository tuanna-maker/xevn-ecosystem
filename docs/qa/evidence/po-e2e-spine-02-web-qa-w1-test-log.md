# Test execution log — PO-E2E-SPINE-02-WEB-QA-W1

| Field | Value |
|-------|--------|
| **log_id** | `TEL-PO-E2E-SPINE-02-WEB-QA-W1-20260803` |
| **work_item_id** | `PO-E2E-SPINE-02-WEB-QA-W1` |
| **tester** | qa · agent spine-02-web browser harness |
| **started_at** | `2026-08-03T15:08:48.759Z` (run1) / `2026-08-03T15:10:25.238Z` (run2) |
| **ended_at** | `2026-08-03T15:11:06.260Z` (run2) |
| **environment** | portal `http://127.0.0.1:5173` · HRM Vite `:8080` · hrm-api `:28001` · xbos `:28002` · persona `ceo@xe.vn` · `company_id=main` |
| **hdsd_sot** | HDSD Chấm công → Nghỉ phép · Tạo yêu cầu nghỉ · Danh sách · CC Việc cần xử lý |
| **spec_ref** | FR-UC-H03 · BR-LEAVE-ATT-01 · J-HRM-06 · PO SPINE-02 LV-03/04 · ba-case-matrix-01 |
| **hdsd_align** | true |
| **u65_zero_seed** | true |
| **machine_log** | `docs/qa/evidence/po-e2e-spine-02-web-qa-w1-test-log.json` |
| **evidence_narrative** | `docs/qa/evidence/po-e2e-spine-02-web-qa-w1.md` |

## Chronological steps

| seq | time | action (HDSD) | expected | actual | network | result | attachment |
|-----|------|---------------|----------|--------|---------|--------|------------|
| 1 | 15:08:4x | L0 qc:dev-stack | HRM+XBOS+portal 200 | hrm/xbos/portal **200** | GET `/api/hrm` 200 | pass | — |
| 2 | 15:08:48 | API login Group CEO | 2xx + token | HTTP **201** | POST `/api/xbos/auth/login` 201 | pass | — |
| 3 | 15:08:49 | Open portal / attendance | `/hr/attendance` mounts | URL OK · **#root=4** | — | pass | `screens/…/00-shell.png` · `01-attendance.png` |
| 4 | 15:08:57 | Tab Nghỉ phép | Leave surface | text Nghỉ phép · mount keep | GET leave-requests 200 | pass | `02-leave-tab.png` |
| 5 | 15:09:01 | LV-03 open Tạo yêu cầu nghỉ | dialog | Dialog open | — | pass | `03-create-dialog.png` |
| 6 | 15:09:05–11 | LV-03 pick Ốm ≥3d no attach | form filled | emp UAT-0020 · **LVT_02Ốm** · 5d · reason | — | pass | — |
| 7 | 15:09:11 | LV-03 Gửi (run1) | **4xx VAL-ATT** | **POST 201** `HRM-LEAVE-201` id `70461e4d-…` | POST leave-requests **201** | **fail** | `04-lv03-fail.png` |
| 8 | 15:10:47 | LV-03 Gửi (run2 retest) | VAL-ATT or block | **409** `HRM-LEAVE-VAL-OVERLAP` (not VAL-ATT) | POST leave-requests **409** | fail | — |
| 9 | 15:10:51 | LV-04 attach probe | upload control or BLOCKED | **no file input / attach label** | — | blocked | `05-lv04-attach-probe.png` |
| 10 | 15:10:54 | WEB_LIST Danh sách | labels VI bind | 30 rows · `status_label=Chờ duyệt` · UI Chờ duyệt | GET leave-requests **200** | pass | `06-web-list.png` |
| 11 | 15:10:57 | J-HRM-06 row click | list→row | row clicked | — | pass | `07-web-list-detail.png` |
| 12 | 15:10:59 | CC Việc cần xử lý | leave tasks FE-origin | leave cards + WF GET pending `hrm_leave` | GET workflow tasks **200** | pass | `08-cc-shell.png` · `09-inbox.png` |
| 13 | 15:11:03 | Approve honesty Duyệt | 2xx if actionable | leave task open; **Duyệt not actionable** | no approve 2xx | blocked | `10a-leave-task-open.png` · `10-approve-no-duyet.png` |
| 14 | 15:11:06 | LV-02 cap | SPEC_GAP max | capped 🟡 | — | blocked | — |
| 15 | 15:11:06 | idle_guard | ≥8 clicks | **34** click_log | — | pass | — |

## Case matrix results

| Case | id | status | notes |
|------|-----|--------|-------|
| A fail deep | `LV_03` | **fail** | Run1 silent 201 on LVT_02 ≥3d no attach; VAL-ATT not enforced |
| B success HDSD | `WEB_LIST` / J-HRM-06 | **pass** | List 200 · labels · row click |
| C logic / BR | `LV_04` + `WEB_APPROVE` + `LV_02` | **blocked** | No attach FE; approve UX; ladder SPEC_GAP |
| Mount must_keep | `mount` | **pass** | W1-B-01 GWC kept |

## Incidents

| id | severity | expected | actual | residual WI |
|----|----------|----------|--------|-------------|
| R-SPINE-LV03-VAL-ATT-CATALOG | P0 | HRM-LEAVE-VAL-ATT | POST 201 for LVT_02 | PO-E2E-SPINE-02-BE-LV03-VAL-ATT-01 |
| R-SPINE-LV04-ATTACH-FE-01 | P1 | FE upload path | no attach UI | dev-fe |
| R-SPINE-WEB-APPROVE-UX-01 | P1 | Duyệt 2xx FE-origin | tasks visible, Duyệt not actionable | dev-fe |
| R-LEAVE-TYPE-LABEL-DEPTH | P2 | catalog VI label | LVT_02 echo | defer |
| GAP-LEAVE-LADDER-01 | P1 process | L2 ladder | SPEC_GAP | ba-process |

## Summary

| passed | failed | blocked | skipped |
|--------|--------|---------|---------|
| 8 | 2 | 4 | 0 |

**verdict:** fail  
**ack_status:** FAIL_TO_PM  
**SoT:** `_vibe-team-os/31-WORLD-STANDARD-TEST-LOG.md`
