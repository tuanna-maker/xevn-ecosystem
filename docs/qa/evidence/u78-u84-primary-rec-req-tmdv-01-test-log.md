# Test execution log — U78-U84-PRIMARY-REC-REQ-TMDV-01

| Field | Value |
|-------|--------|
| **schema** | `xevn-test-log/v1` |
| **log_id** | `TEL-U78-U84-PRIMARY-REC-REQ-TMDV-01-20260804` |
| **work_item_id** | `U78-U84-PRIMARY-REC-REQ-TMDV-01` |
| **tester** | qa · qa-subagent-u78-rec-req-tmdv |
| **started_at** | 2026-08-03T17:27:50.362Z |
| **ended_at** | 2026-08-03T17:29:05.976Z |
| **verdict** | **blocked** |
| **hdsd_align** | true |
| **u65_zero_seed** | true |
| **evidence_narrative** | `docs/qa/evidence/u78-u84-primary-rec-req-tmdv-01.md` |
| **machine log** | [`u78-u84-primary-rec-req-tmdv-01-test-log.json`](u78-u84-primary-rec-req-tmdv-01-test-log.json) |

## Environment

- portal: `http://127.0.0.1:5173`
- hrm-api: `http://127.0.0.1:28001/api/hrm`
- xbos-api: `http://127.0.0.1:28002/api/xbos`
- commit: `dc930c5`
- persona: `ceo@xe.vn` · `companyId=trsport` · OU TM-DV X.E

## Spec / HDSD

- TC-HIM-REC-REQ-TMDV-HP-001 · TC-HIM-REC-REQ-TMDV-AP-001
- HIM §5.2 · PO_WF_CATALOG_COMPANY_MATRIX §2 P-REC-REQ
- Precond TC-WFM-REC-REQ-HP-001 · `hdsd-requisition-submit-wf` · BR-PO-REC-LGX-01

## Chronological steps

| seq | at | action | expected | actual | result |
|-----|-----|--------|----------|--------|--------|
| 1 | 17:27:50Z | L0 + API probe WF/JD/req @ trsport | WF active; honest empty OK | WF `hrm_requisition_approval` active; JD total=0; emp=4 | pass |
| 2 | 17:27:55Z | Login → `/hr/recruitment?tab=jd-library&companyId=trsport` | JD library mounts | mount + Thêm JD; OU TM-DV | pass |
| 3 | 17:28:10Z | FD: Thêm JD empty submit | dialog kept / required | dialog kept | pass |
| 4 | 17:28:40Z | Fill JD Lái xe (`DRIVER_LEAD`) + Lưu | POST job-templates 2xx | **400** `HRM-REC-JD-POS` | **blocked** |
| 5 | 17:29:00Z | YCTD create / Gửi duyệt QT / Inbox AP | HP+AP chain | **skipped** — library empty / no fake | blocked |

## Cases

| id | type | status | notes |
|----|------|--------|-------|
| A | fail-deep empty JD | pass | dialog kept |
| B | success HDSD HP+AP | blocked | JD create 400 |
| C | BR-PO-REC-LGX-01 DRIVER_LEAD | blocked | picker≠assert partition |

## Incidents

| id | severity | expected | actual | residual_wi |
|----|----------|----------|--------|-------------|
| INC-JD-POS-TMDV | P0 | Thêm JD @ trsport with picker code succeeds | 400 HRM-REC-JD-POS DRIVER_LEAD | R-U84-REC-REQ-TMDV-JD-CATALOG-ASSERT → dev-be |

## Summary

| passed | failed | blocked | skipped | ack_status |
|--------|--------|---------|---------|------------|
| 3 | 0 | 2 | 0 | PASS_TO_PM |
