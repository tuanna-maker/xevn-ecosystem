# Test Execution Log — PO-E2E-SPINE-01-QA-W2

| Field | Value |
|-------|--------|
| **log_id** | `TEL-PO-E2E-SPINE-01-QA-W2-20260803` |
| **work_item_id** | `PO-E2E-SPINE-01-QA-W2` |
| **schema** | `xevn-test-log/v1` |
| **tester** | qa · agent `po-e2e-spine-01-qa-w2-browser` |
| **started_at** | `2026-08-03T15:10:04.304Z` |
| **ended_at** | `2026-08-03T15:12:29.816Z` |
| **environment** | portal `http://127.0.0.1:5173` · hrm-api `:28001` · xbos-api `:28002` · hrm Vite `:8080` |
| **persona** | `ceo@xe.vn` · `company_id=main` (+ member `du-lich.ceo@xe.vn`) |
| **spec_ref** | E2E-SPINE-01 · HP-01..06 · J-REC-WF-01..04 · J-HRM-01/02/03/05/07 · UF-HRM-12 · UF-XBOS-08 |
| **hdsd_align** | true · HDSD CH07 / CC Workflow · Inbox · Tuyển dụng · NV · Lương |
| **u65_zero_seed** | true |
| **verdict** | pass |
| **ack_status** | `PASS_TO_PM` |
| **evidence_narrative** | `docs/qa/evidence/po-e2e-spine-01-qa-w2.md` |
| **raw_harness** | `docs/qa/evidence/_tmp-po-e2e-spine-01-qa-w2-browser.json` |
| **stamp** | `SP2SDD8FM8` |

## Case matrix (U76)

| Case | Result | Notes |
|------|--------|-------|
| A fail_deep | 🟡 | Scope/assignee: submit 201 but inbox this-wave empty (not exercised as intentional 4xx) |
| B success HDSD | 🟢 | Mount + HP-02 create/submit/F5 HDSD path PASS |
| C logic/BR | 🟡 | HP-03 this-wave only — prior tasks not approved (U65); full hire-to-pay chain incomplete |

## Chronological steps

| seq | at (UTC) | action | expected | actual | network | result | attachment |
|-----|----------|--------|----------|--------|---------|--------|------------|
| 1 | 15:10:04 | L0_PROBES | hrm+xbos+portal+vite 200 | all 200 | GET /api/hrm · /api/xbos | pass | — |
| 2 | 15:10:04 | VITE_RESOLVE | Recruitment + JobTemplatesTab 200 | all four probes **200** | GET Recruitment.tsx · JobTemplatesTab.tsx | pass | — |
| 3 | 15:10:05 | OPEN_PORTAL | shell loads | navigated :5173 | — | pass | `screens/…/00-shell.png` |
| 4 | 15:10:08 | HP01_WF_OPEN | recruitment WF visible | opened + Lưu | GET definitions **200** | pass | `01-wf-list.png` · `01-wf-detail.png` |
| 5 | 15:10:16 | HP01_F5 | definition persists | stillHasRec=true | GET workflow-engine 200 | pass | `01-wf-f5.png` |
| 6 | 15:10:21 | HP02_MOUNT | /hr/recruitment chrome · no Vite 500 | mounted · rootKids=4 · viteFail=false | Vite modules 200 | pass | `02-mount.png` |
| 7 | 15:10:26 | HP02_JD | Thư viện JD usable | create JD dialog filled | — | pass | `02-jd-lib.png` |
| 8 | 15:10:35 | HP02_CREATE | POST requisition 2xx + FE row | POST **201** `HRM-REC-201` id=`34a421e7-…` | POST `/api/hrm/recruitment/requisitions` **201** | pass | `02-req-dialog.png` · `02-after-create.png` |
| 9 | 15:10:54 | HP02_F5 | stamp row after create | f5=true stamp persist | GET requisitions | pass | `02-f5-create.png` |
| 10 | 15:10:58 | HP02_SUBMIT | Gửi duyệt QT 2xx | POST **201** `HRM-REC-WF-200` · instance `5590cbb1-…` | POST `…/submit-workflow` **201** | pass | `02-after-submit.png` |
| 11 | 15:11:02 | HP03_INBOX | this-wave task or empty BLOCKED | priorRec=true · **thisWave=false** · no Duyệt | GET tasks 200 | warn | `03-inbox.png` · `03-inbox-after.png` |
| 12 | 15:11:07 | HP04_CANDIDATES | tab mounts · hire path | mount OK · createOk=false | GET candidates-pool **200** | warn | `04-candidates.png` · `04-f5.png` |
| 13 | 15:12:02 | HP05_EMP_LIST | list employees | list OK · detailOk=true | — | pass | `05-employees.png` · `05-employee-detail.png` |
| 14 | 15:12:08 | HP05_CONTRACTS | contracts surface | hasContracts=false · stamp absent | — | warn | `05-contracts.png` |
| 15 | 15:12:13 | HP06_PAYROLL | payslip/period or honest empty | CC payroll loaded · stamp absent · blank honesty residual | — | warn | `06-payroll.png` · `06-payroll-f5.png` |
| 16 | 15:12:26 | MEM_SCOPE | member recruitment mounts | ok=true banner=false | — | pass | `07-member-rec.png` |

## Incidents

| severity | id | expected | actual | residual_wi |
|----------|-----|----------|--------|-------------|
| — | R-PO-SPINE01-REC-MOUNT | Recruitment mounts | **CLOSED** — Vite 200 + browser chrome | — |
| P1 | R-PO-SPINE01-INBOX-THISWAVE | Inbox shows this-wave task after submit 201 | stamp absent for ceo · no seed/approve | `PO-E2E-SPINE-01-BE-INBOX-01` |
| P1 | R-PO-SPINE01-CAND-HIRE | candidate create/hire 2xx | CTA incomplete after mount | defer after inbox assignee |
| P1 | R-PO-SPINE01-PAYROLL-BLANK | honest empty / rows | pane loads; new-hire stamp absent | defer P1 (not mount block) |

## Summary

| Metric | Value |
|--------|--------|
| clicks | 46 |
| idle_guard | PASS |
| seed | none |
| steps pass / warn / fail | 11 / 5 / 0 |
| requisitionId | `34a421e7-33df-4c8b-b96c-559082b78086` |
| workflowInstanceId | `5590cbb1-80ff-4c1b-af72-4a78ce3a3782` |
| ack_status | PASS_TO_PM |
| UAT DONE claim | **forbidden / not claimed** |
