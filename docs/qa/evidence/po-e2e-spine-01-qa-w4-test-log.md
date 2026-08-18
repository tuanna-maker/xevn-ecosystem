# Test Execution Log — PO-E2E-SPINE-01-QA-W4

| Field | Value |
|-------|--------|
| **log_id** | `TEL-PO-E2E-SPINE-01-QA-W4-20260803` |
| **work_item_id** | `PO-E2E-SPINE-01-QA-W4` |
| **schema** | `xevn-test-log/v1` |
| **tester** | qa · agent `po-e2e-spine-01-qa-w4-browser` |
| **started_at** | `2026-08-03T15:36:58.067Z` |
| **ended_at** | `2026-08-03T15:37:25.113Z` |
| **environment** | portal `http://127.0.0.1:5173` · hrm-api `:28001` · xbos-api `:28002` |
| **persona** | `ceo@xe.vn` · `company_id=main` |
| **spec_ref** | E2E-SPINE-01 · HP-04 · J-REC-WF-04 · UF-HRM-12 · HP-05 gated |
| **hdsd_sot** | `docs/qa/HDSD_REC_MENU_FUNCTION_INVENTORY.md` CH07 §6 · §13 |
| **hdsd_align** | true |
| **u65_zero_seed** | true |
| **verdict** | fail |
| **ack_status** | `FAIL_TO_PM` |
| **evidence_narrative** | `docs/qa/evidence/po-e2e-spine-01-qa-w4.md` |
| **raw_harness** | `docs/qa/evidence/_tmp-po-e2e-spine-01-qa-w4-browser.json` |
| **screens_dir** | `docs/qa/evidence/screens/po-e2e-spine-01-qa-w4-20260803` |
| **cand_stamp** | `SP4SDE70SZ` |
| **yctd_stamp** | `SP2SDD8FM8` (W3 approved context) |

## Case matrix (U76)

| Case | Result | Notes |
|------|--------|-------|
| A fail_deep | 🟢 | Observed — POST 400 forbidNonWhitelisted with actionable message; FE toast Lỗi |
| B success HDSD | 🔴 | Thêm ứng viên → Lưu does **not** create row / 2xx |
| C logic/BR | 🟡 | Hire/link G-DB-01 not reached; contract mismatch blocks BR path |

## Chronological steps

| seq | at (UTC) | action | expected | actual | network | result | attachment |
|-----|----------|--------|----------|--------|---------|--------|------------|
| 1 | 15:36:58 | L0_PROBES | hrm+xbos+portal 200 | all **200** | GET /api/hrm · /api/xbos | pass | — |
| 2 | 15:36:58 | OPEN_PORTAL | shell loads | navigated :5173 | — | pass | `00-shell.png` |
| 3 | 15:37:01 | HP04_CTX_REQUISITIONS | YCTD SP2SDD8FM8 / 34a421e7 visible after W3 approve | **hit** reqId=`34a421e7-33df-4c8b-b96c-559082b78086` | GET requisitions **200** | pass | `00-requisitions-context.png` |
| 4 | 15:37:04 | HP04_CANDIDATES_TAB | Ứng viên mount | chrome OK · empty honest | GET candidates-pool **200** | pass | `01-candidates.png` |
| 5 | 15:37:10 | HP04_ADD_OPEN | Thêm ứng viên dialog | dialog «Thêm ứng viên mới» | — | pass | — |
| 6 | 15:37:11 | HP04_FILL | name+email+position filled | nameOk=true emailOk=true stamp in position | — | pass | `02-create-dialog-filled.png` |
| 7 | 15:37:12 | HP04_SAVE | POST create 2xx | POST **400** `HRM-VAL-001` whitelist props | POST `/api/hrm/recruitment/candidates` **400** | fail | `03-after-create.png` |
| 8 | 15:37:16 | HP04_F5 | stamp on list | empty · no stamp | GET candidates-pool **200** | fail | `04-f5-list.png` |
| 9 | — | HP04_HIRE | stage Đã tuyển + HireEmployeeLinkDialog 2xx | **skipped** create fail | — | blocked | — |
| 10 | — | HP05_EMP_CONTRACT | emp/contract after hire | **skipped** | — | blocked | — |

## Incidents

| severity | id | expected | actual | residual_wi |
|----------|-----|----------|--------|-------------|
| P1 | R-PO-SPINE01-CAND-HIRE | FE Thêm UV → 2xx → hire link | POST 400 `HRM-VAL-001` on position/rating/nationality/hometown/marital_status/expected_start_date | `PO-E2E-SPINE-01-BE-CAND-DTO-01` |
| — | LV-03/04 | must_keep closed | **not** reopened | — |

## Summary

| Metric | Value |
|--------|--------|
| clicks | 12 |
| idle_guard | PASS |
| seed | none |
| steps pass / warn / fail / skip | 2 / 0 / 1 / 2 (harness step groups) |
| create status | 400 `HRM-VAL-001` |
| hire | not reached |
| ack_status | FAIL_TO_PM |
| UAT DONE claim | **forbidden / not claimed** |
