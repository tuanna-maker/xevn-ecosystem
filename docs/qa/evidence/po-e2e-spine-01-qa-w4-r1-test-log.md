# Test Execution Log — PO-E2E-SPINE-01-QA-W4-R1

| Field | Value |
|-------|--------|
| **log_id** | `TEL-PO-E2E-SPINE-01-QA-W4-R1-20260803` |
| **work_item_id** | `PO-E2E-SPINE-01-QA-W4-R1` |
| **schema** | `xevn-test-log/v1` |
| **tester** | qa · agent `po-e2e-spine-01-qa-w4-r1-browser` |
| **started_at** | `2026-08-03T15:47:45.177Z` |
| **ended_at** | `2026-08-03T15:48:53.044Z` |
| **environment** | portal `http://127.0.0.1:5173` · hrm-api `:28001` · xbos-api `:28002` |
| **persona** | `ceo@xe.vn` · `company_id=main` |
| **spec_ref** | E2E-SPINE-01 · HP-04 · J-REC-WF-04 · UF-HRM-12 · HP-05 soft |
| **hdsd_sot** | `docs/qa/HDSD_REC_MENU_FUNCTION_INVENTORY.md` CH07 §6 · §13 |
| **hdsd_align** | true |
| **u65_zero_seed** | true |
| **verdict** | pass |
| **ack_status** | `PASS_TO_PM` |
| **evidence_narrative** | `docs/qa/evidence/po-e2e-spine-01-qa-w4-r1.md` |
| **raw_harness** | `docs/qa/evidence/_tmp-po-e2e-spine-01-qa-w4-r1-browser.json` |
| **screens_dir** | `docs/qa/evidence/screens/po-e2e-spine-01-qa-w4-r1-20260803` |
| **cand_stamp** | `SP4SDEKW49` |
| **yctd_stamp** | `SP2SDD8FM8` (W3 approved context) |
| **note** | Attempt 1 (15:45Z) stale hrm-api VAL-001 — restart then attempt 2 logged here |

## Case matrix (U76)

| Case | Result | Notes |
|------|--------|-------|
| A fail_deep | 🟢 | Prior W4 + attempt-1 stale runtime documented; not used as UF PASS |
| B success HDSD | 🟢 | Thêm UV → Lưu **201** · F5 stamp · Đã tuyển → HireEmployeeLinkDialog → **200** · F5 |
| C logic/BR | 🟢 | G-DB-01 satisfied via dialog employee_id; hire not blocked |

## Chronological steps

| seq | at (UTC) | action | expected | actual | network | result | attachment |
|-----|----------|--------|----------|--------|---------|--------|------------|
| 1 | 15:47:45 | L0_PROBES | hrm+xbos+portal 200 | all **200** | GET /api/hrm · /api/xbos | pass | — |
| 2 | 15:47:46 | OPEN_PORTAL | shell loads | navigated :5173 | — | pass | `00-shell.png` |
| 3 | 15:47:50 | HP04_CTX_REQUISITIONS | YCTD SP2SDD8FM8 / 34a421e7 | **hit** reqId=`34a421e7-33df-4c8b-b96c-559082b78086` | GET requisitions **200** | pass | `00-requisitions-context.png` |
| 4 | 15:47:55 | HP04_CANDIDATES_TAB | Ứng viên mount | chrome OK | GET candidates-pool **200** | pass | `01-candidates.png` |
| 5 | 15:48:00 | HP04_ADD_OPEN | Thêm ứng viên dialog | dialog open | — | pass | — |
| 6 | 15:48:02 | HP04_FILL | name+email+position | nameOk=true emailOk=true stamp in position | — | pass | `02-create-dialog-filled.png` |
| 7 | 15:48:02 | HP04_SAVE | POST create 2xx | POST **201** `HRM-REC-CP-201` candId=`6f6d2250-…` | POST `/api/hrm/recruitment/candidates` **201** | pass | `03-after-create.png` |
| 8 | 15:48:07 | HP04_F5 | stamp on list | stamp `SP4SDEKW49` visible | GET candidates-pool **200** | pass | `04-f5-list.png` |
| 9 | 15:48:24 | HP04_STAGE_HIRED | Chuyển Đã tuyển | option picked | — | pass | `05-hire-stage.png` |
| 10 | 15:48:26 | HP04_HIRE_DIALOG | HireEmployeeLinkDialog | dialog · pick UAT-0020 · confirm | PATCH stage **200** `HRM-REC-CP-200` empId=`5c3ea407-…` | pass | `06-after-hire-confirm.png` |
| 11 | 15:48:33 | HP04_F5_HIRED | F5 hired filter | stamp + Đã tuyển | — | pass | `07-f5-hired.png` |
| 12 | 15:48:43 | HP05_EMP_CONTRACT | emp/contract after hire | detailOk · no banner · stamp absent (soft link) · contracts weak | GET employees/contracts | warn | `08-employees.png` · `09-emp-detail.png` · `10-contracts.png` |

## Incidents

| severity | id | expected | actual | residual_wi |
|----------|-----|----------|--------|-------------|
| — | R-PO-SPINE01-CAND-HIRE | FE Thêm UV → 2xx → hire link | **CLOSED** — 201 + 200 + F5 | — |
| P2 | R-PO-SPINE01-HP05-SOFT | emp stamp / contracts after hire | soft-link stamp absent · contracts weak | `PO-E2E-SPINE-01-QA-W5` |
| P2 | R-PO-SPINE01-RUNTIME-STALE | READY_FOR_QA = live Nest loads new DTO | attempt-1 still VAL-001 until restart | devops / BE handoff hygiene |
| — | LV-03/04 · HP-03 | must_keep closed | **not** reopened | — |

## Summary

| Metric | Value |
|--------|--------|
| clicks | 27 |
| idle_guard | PASS |
| seed | none |
| steps pass / warn / fail / skip | 4 / 1 / 0 / 0 (harness step groups) |
| create status | 201 `HRM-REC-CP-201` |
| hire | 200 `HRM-REC-CP-200` · employee_id set |
| ack_status | PASS_TO_PM |
| UAT DONE claim | **forbidden / not claimed** |
