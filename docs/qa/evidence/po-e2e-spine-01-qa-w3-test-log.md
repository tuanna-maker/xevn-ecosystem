# Test Execution Log — PO-E2E-SPINE-01-QA-W3

| Field | Value |
|-------|--------|
| **log_id** | `TEL-PO-E2E-SPINE-01-QA-W3-20260803` |
| **work_item_id** | `PO-E2E-SPINE-01-QA-W3` |
| **schema** | `xevn-test-log/v1` |
| **tester** | qa · agent `po-e2e-spine-01-qa-w3-browser` |
| **started_at** | `2026-08-03T15:29:28.901Z` |
| **ended_at** | `2026-08-03T15:29:45.516Z` |
| **environment** | portal `http://127.0.0.1:5173` · hrm-api `:28001` · xbos-api `:28002` |
| **persona** | `ceo@xe.vn` · `company_id=main` |
| **spec_ref** | E2E-SPINE-01 · HP-03 · J-REC-WF-03 · UF-XBOS-08 |
| **hdsd_align** | true · HDSD CC Inbox → Duyệt |
| **u65_zero_seed** | true |
| **verdict** | pass |
| **ack_status** | `PASS_TO_PM` |
| **evidence_narrative** | `docs/qa/evidence/po-e2e-spine-01-qa-w3.md` |
| **raw_harness** | `docs/qa/evidence/_tmp-po-e2e-spine-01-qa-w3-browser.json` |
| **stamp** | `SP2SDD8FM8` (legacy this-wave) |

## Case matrix (U76)

| Case | Result | Notes |
|------|--------|-------|
| A fail_deep | 🟢 | Not triggered — stamp present after BE display fix |
| B success HDSD | 🟢 | Inbox → open SP2SDD8FM8 → Duyệt → F5 |
| C logic/BR | 🟢 | this-wave only approved; no prior-task cheat; U65 held |

## Chronological steps

| seq | at (UTC) | action | expected | actual | network | result | attachment |
|-----|----------|--------|----------|--------|---------|--------|------------|
| 1 | 15:29:28 | L0_PROBES | hrm+xbos+portal 200 | all **200** | GET /api/hrm · /api/xbos | pass | — |
| 2 | 15:29:29 | OPEN_PORTAL | shell loads | navigated :5173 | — | pass | `screens/…/00-shell.png` |
| 3 | 15:29:32 | HP03_INBOX_SCAN | this-wave stamp SP2SDD8FM8 or YCTD HireToPay | **hit=true** source=legacy · GET tasks 200 · title enriched | GET `…/workflow-engine/tasks?…assigneeUserId=ceo@xe.vn` **200** | pass | `03-inbox-pass1.png` |
| 4 | 15:29:35 | HP03_OPEN_TASK | open this-wave card | clicked stamp/HireToPay | — | pass | `03-inbox-detail.png` |
| 5 | 15:29:37 | HP03_DUYET | approve 2xx | POST complete **201** `XBOS-WF-200` task `f01d0f12-…` | POST `…/tasks/f01d0f12-…/complete` **201** | pass | — |
| 6 | 15:29:42 | HP03_F5 | stamp not pending | stillPending=false | GET tasks after reload | pass | `03-inbox-f5.png` |

## Incidents

| severity | id | expected | actual | residual_wi |
|----------|-----|----------|--------|-------------|
| — | R-PO-SPINE01-INBOX-THISWAVE | Inbox shows this-wave stamp + Duyệt 2xx | **CLOSED** — SP2SDD8FM8 visible · POST 201 | — |
| P1 | R-PO-SPINE01-CAND-HIRE | hire after approve | deferred (out of W3 exit) | HP-04 wave |

## Summary

| Metric | Value |
|--------|--------|
| clicks | 6 |
| idle_guard | PASS |
| seed | none |
| steps pass / warn / fail | 6 / 0 / 0 |
| taskId | `f01d0f12-ab70-4967-90c3-4fa8746312d9` |
| workflowInstanceId | `5590cbb1-80ff-4c1b-af72-4a78ce3a3782` |
| ack_status | PASS_TO_PM |
| UAT DONE claim | **forbidden / not claimed** |
