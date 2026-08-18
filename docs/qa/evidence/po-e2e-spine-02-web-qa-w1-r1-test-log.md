# Test execution log — PO-E2E-SPINE-02-WEB-QA-W1-R1

| Field | Value |
|-------|--------|
| **log_id** | `TEL-PO-E2E-SPINE-02-WEB-QA-W1-R1-20260803` |
| **work_item_id** | `PO-E2E-SPINE-02-WEB-QA-W1-R1` |
| **tester** | qa · agent spine-02-web-qa-w1-r1 browser harness |
| **started_at** | `2026-08-03T15:30:12.957Z` |
| **ended_at** | `2026-08-03T15:31:00.502Z` |
| **environment** | portal `http://127.0.0.1:5173` · HRM Vite `:8080` · hrm-api `:28001` · xbos `:28002` · persona `ceo@xe.vn` · `company_id=main` |
| **hdsd_sot** | HDSD Chấm công → Nghỉ phép · Tạo yêu cầu nghỉ · Đính kèm giấy bác sĩ |
| **spec_ref** | FR-UC-H03 · BR-LEAVE-ATT-01 · LV-03 · LV-04 · J-HRM-06 (mount/list F5) |
| **hdsd_align** | true |
| **u65_zero_seed** | true |
| **machine_log** | `docs/qa/evidence/po-e2e-spine-02-web-qa-w1-r1-test-log.json` |
| **evidence_narrative** | `docs/qa/evidence/po-e2e-spine-02-web-qa-w1-r1.md` |
| **raw_harness** | `docs/qa/evidence/_tmp-po-e2e-spine-02-web-qa-w1-r1-browser.json` |

## Chronological steps

| seq | time (UTC) | action (HDSD) | expected | actual | network | result | attachment |
|-----|------------|---------------|----------|--------|---------|--------|------------|
| 1 | 15:30:12 | API login Group CEO | 2xx + token | HTTP **201** | POST `/api/xbos/auth/login` 201 | pass | — |
| 2 | 15:30:13 | Open `/hr/attendance` | mount | URL OK | — | pass | `01-attendance.png` |
| 3 | 15:30:18 | Tab **Nghỉ phép** | leave surface | `#root=4` · title Nghỉ phép | — | pass | `02-leave-tab.png` |
| 4 | 15:30:21 | Mount must_keep | LeaveOverviewRecentPanel GWC | rootChild=4 · no Vite resolve fail | — | pass | — |
| 5 | 15:30:21 | LV-03 open Tạo yêu cầu nghỉ | dialog | open | — | pass | `03-create-dialog.png` |
| 6 | 15:30:24–30 | Pick NV + LVT_02Ốm + dates ≥3d + reason | form filled | emp + sick + 2 dates | — | pass | `04-lv03-filled.png` |
| 7 | 15:30:30 | Probe attach UI | doctor label + testid | fileInput=1 · testId · **Đính kèm giấy bác sĩ*** | — | pass | — |
| 8 | 15:30:30 | LV-03 Gửi (no attach) | FE block and/or VAL-ATT · no 201 | toast · **postAfter=[]** · no silent 201 | (no POST leave-requests) | **pass** | `05-lv03-after-submit.png` |
| 9 | 15:30:35 | LV-04 open create | dialog | open | — | pass | — |
| 10 | 15:30:37–43 | Fill LVT_02 ≥3d | form | sick + dates + reason | — | pass | — |
| 11 | 15:30:44 | Attach via `hdsd-leave-attachment-input` | upload 2xx | fixture PNG · UI filename | POST `/api/hrm/files/upload?feature=leave-attachment` **2xx** | pass | `06-lv04-after-upload.png` |
| 12 | 15:30:48 | LV-04 Gửi | POST **201** + `attachment_url` | **201** `HRM-LEAVE-201` id `639e8033-…` · attachment under `/api/hrm/files/` | POST leave-requests **201** | **pass** | `07-lv04-after-submit.png` |
| 13 | 15:30:5x | F5 + Nghỉ phép | row persists | GET leave-requests 200 · same id · attachment_url · Chờ duyệt | GET leave-requests **200** | pass | `08-lv04-f5.png` |
| 14 | 15:31:00 | idle_guard | ≥8 clicks | **36** | — | pass | — |

## Case matrix results

| Case | id | status | notes |
|------|-----|--------|-------|
| A fail deep | `LV_03` | **pass** | FE block · no POST · no silent 201 (prior W1 201 CLOSED) |
| B success HDSD | `LV_04` | **pass** | Upload + 201 + attachment_url + F5 |
| C logic BR | attach required UI | **pass** | Required hint + testid when ốm ≥3d |
| Mount must_keep | `mount` | **pass** | GWC kept |

## Incidents

| id | severity | expected | actual | residual WI |
|----|----------|----------|--------|-------------|
| — | — | — | none P0/P1 on LV-03/04 | — |
| R-QA-LEAVE-DATE-FILL-DEPTH | P2 | exact 5d window | end_date drifted → total_days=113 (≥3d OK) | optional later |
| R-SPINE-WEB-APPROVE-UX-01 | P1 carry | — | out of R1 scope | prior W1 |
| R-SPINE-LV02-BA-01 | P1 carry | — | SPEC_GAP no invent | ba-process |

## Summary

| passed | failed | blocked | skipped |
|--------|--------|---------|---------|
| 4 (mount+LV03+LV04+idle) | 0 | 0 (in-scope) | approve/LV-02 OOS |

**ack_status:** PASS_TO_PM  
**SoT:** `_vibe-team-os/31-WORLD-STANDARD-TEST-LOG.md`
