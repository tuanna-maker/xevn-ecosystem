# Test Execution Log — PO-E2E-SPINE-01-QA-W1

| Field | Value |
|-------|--------|
| **log_id** | `TEL-PO-E2E-SPINE-01-QA-W1-20260803` |
| **work_item_id** | `PO-E2E-SPINE-01-QA-W1` |
| **schema** | `xevn-test-log/v1` |
| **tester** | qa · agent `po-e2e-spine-01-qa-w1-browser` |
| **started_at** | `2026-08-03T14:48:34.415Z` |
| **ended_at** | `2026-08-03T14:50:20.763Z` |
| **environment** | portal `http://127.0.0.1:5173` · hrm-api `:28001` · xbos-api `:28002` · hrm Vite `:8080` |
| **persona** | `ceo@xe.vn` · `company_id=main` (+ member `du-lich.ceo@xe.vn`) |
| **spec_ref** | E2E-SPINE-01 · HP-01..06 · J-REC-WF-01..04 · J-HRM-01/02/03/05/07 · UF-HRM-12 · UF-XBOS-08 |
| **hdsd_align** | true · HDSD CH07 / CC Workflow · Inbox · Tuyển dụng · NV · Lương |
| **u65_zero_seed** | true |
| **verdict** | fail |
| **ack_status** | `FAIL_TO_PM` |
| **evidence_narrative** | `docs/qa/evidence/po-e2e-spine-01-qa-w1.md` |
| **raw_harness** | `docs/qa/evidence/_tmp-po-e2e-spine-01-qa-w1-browser.json` |

## Case matrix (U76)

| Case | Result | Notes |
|------|--------|-------|
| A fail_deep | 🟡 N/A deep | Mount fail before form validation |
| B success HDSD | 🔴 | HP-02 create blocked; hire-to-pay chain incomplete |
| C logic/BR | 🟡 | Inbox complete 201 on prior task; not this-wave stamp |

## Chronological steps

| seq | at (UTC) | action | expected | actual | network | result | attachment |
|-----|----------|--------|----------|--------|---------|--------|------------|
| 1 | 14:48:34 | L0_PROBES | hrm+xbos+portal 200 | all 200 | GET /api/hrm 200 · /api/xbos 200 | pass | — |
| 2 | 14:48:35 | OPEN_PORTAL | shell loads | navigated :5173 | — | pass | `screens/…/00-shell.png` |
| 3 | 14:48:38 | HP01_WF_OPEN | recruitment WF visible | opened + PUT def 200 | GET definitions 200 · PUT …/definitions/befaec7a… **200** | pass | `01-wf-list.png` · `01-wf-detail.png` |
| 4 | 14:48:47 | HP01_F5 | definition persists | stillHasRec=true | GET workflow-engine 200 | pass | `01-wf-f5.png` |
| 5 | 14:48:52 | HP02_NAV_JD | JD library loads | whitescreen (Recruitment chunk) | Vite Recruitment.tsx **500** | fail | `02-jd-lib.png` |
| 6 | 14:48:57 | HP02_NAV_REQ | requisitions + create CTA | whitescreen · no Thêm yêu cầu workable | no POST requisitions | fail | `02-req-list.png` · `02-req-dialog.png` |
| 7 | 14:49:14 | HP02_F5 | stamp row after create | create=false · f5=false | POST=none | fail | `02-f5-create.png` |
| 8 | 14:49:22 | HP03_INBOX | task from FE chain or empty BLOCKED | pre-existing tuyển dụng tasks present | GET tasks 200 | pass* | `03-inbox.png` |
| 9 | 14:49:27 | HP03_APPROVE | complete 2xx | POST complete **201** | POST `/api/xbos/workflow-engine/tasks/2179537e-…/complete` **201** | pass* | `03-inbox-after.png` |
| 10 | 14:49:36 | HP04_CANDIDATES | create/hire UV | whitescreen · open=false | Recruitment.tsx dynamic import fail | fail | `04-candidates.png` |
| 11 | 14:49:52 | HP05_EMP_LIST | list employees | 43 rows · GET 200 | GET `/api/hrm/employees?company_id=main` **200** | pass | `05-employees.png` |
| 12 | 14:49:56 | HP05_EMP_DETAIL | profile not 404 | GET by id **200** · url `…/employees/84df5edb-…` | GET `/api/hrm/employees/84df5edb-…?company_id=main` **200** | pass | `05-employee-detail.png` |
| 13 | 14:50:00 | HP05_CONTRACTS | contracts surface | hasContracts=false this run | — | warn | `05-contracts.png` |
| 14 | 14:50:04 | HP06_PAYROLL | payslip/period or honest empty | CC payroll blank pane · stamp absent | — | warn | `06-payroll.png` · `06-payroll-f5.png` |
| 15 | 14:50:17 | MEM_SCOPE | member recruitment loads | same mount fail | — | warn | `07-member-rec.png` |
| 16 | 14:50:20 | VITE_PROBE_ROOT | Recruitment.tsx resolve | **500** `JobTemplatesTab` missing import | GET Recruitment.tsx 500 | fail | — |

\*Inbox approve is **not** promoted as full HP-03 spine-chain PASS (YCTD not created this wave).

## Incidents

| severity | id | expected | actual | residual_wi |
|----------|-----|----------|--------|-------------|
| P0 | R-PO-SPINE01-REC-MOUNT | Recruitment.tsx resolves | Failed to resolve `@/components/recruitment/JobTemplatesTab` | `PO-E2E-SPINE-01-FE-REC-MOUNT-01` |
| P1 | R-PO-SPINE01-PAYROLL-BLANK | payroll content or honest empty | blank main pane on CC hrm/payroll | defer after mount fix |
| P2 | R-PO-XBOS-DIST-MAIN | `dev:xbos-api` clean start | `Cannot find module …/dist/main` on watch restart | devops |

## Summary

| Metric | Value |
|--------|--------|
| clicks | 24 |
| idle_guard | PASS |
| seed | none |
| steps pass / warn / fail | 5 / 4 / 5 (table above) |
| ack_status | FAIL_TO_PM |
