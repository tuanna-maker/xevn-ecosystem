# Test execution log — U78-U84-PRIMARY-REC-REQ-TMDV-01-R1

| Field | Value |
|-------|--------|
| **schema** | `xevn-test-log/v1` |
| **log_id** | `TEL-U78-U84-PRIMARY-REC-REQ-TMDV-01-R1-20260804` |
| **work_item_id** | `U78-U84-PRIMARY-REC-REQ-TMDV-01-R1` |
| **tester** | qa · qa-subagent-u78-rec-req-tmdv-r1 |
| **started_at** | 2026-08-03T17:41:45.409Z |
| **ended_at** | 2026-08-03T17:46:40.000Z |
| **verdict** | **pass** |
| **hdsd_align** | true |
| **u65_zero_seed** | true |
| **evidence_narrative** | `docs/qa/evidence/u78-u84-primary-rec-req-tmdv-01-r1.md` |
| **machine log** | [`u78-u84-primary-rec-req-tmdv-01-r1-test-log.json`](u78-u84-primary-rec-req-tmdv-01-r1-test-log.json) |

## Environment

- portal: `http://127.0.0.1:5173`
- hrm-api: `http://127.0.0.1:28001/api/hrm`
- xbos-api: `http://127.0.0.1:28002/api/xbos`
- commit: `dc930c5` (+ D-U84 JD catalog assert live)
- persona: `ceo@xe.vn` · `companyId=trsport` · OU TM-DV X.E

## Spec / HDSD

- TC-HIM-REC-REQ-TMDV-HP-001 · TC-HIM-REC-REQ-TMDV-AP-001
- HIM §5.2 · PO_WF_CATALOG_COMPANY_MATRIX §2 P-REC-REQ
- Precond TC-WFM-REC-REQ-HP-001 · `hdsd-requisition-submit-wf` · BR-PO-REC-LGX-01
- BE fix: `D-U84-REC-REQ-TMDV-JD-CATALOG-ASSERT-01`

## Chronological steps

| seq | at | action | expected | actual | result |
|-----|-----|--------|----------|--------|--------|
| 1 | 17:41:45Z | L0 + API probe WF/JD/req @ trsport | WF active | WF active `6f17062a-…`; emp=4 | pass |
| 2 | 17:41:46Z | Login → jd-library `companyId=trsport` · OU TM-DV | mount + Thêm JD | mount OK | pass |
| 3 | 17:41:55Z | FD empty JD submit | dialog kept | dialog kept | pass |
| 4 | 17:42:57Z | Thêm JD Lái xe / DRIVER_LEAD → Lưu | POST 201 (not 400 JD-POS) | **201** `HRM-REC-JD-201` id=`9aceb7c4-…` | pass |
| 5 | 17:43:01Z | F5 JD library | stamp row | stampOnList=true | pass |
| 6 | 17:43:17Z | Thêm YCTD → Lưu | POST requisitions 201 | **201** `HRM-REC-201` id=`46c0fff1-…` | pass |
| 7 | 17:46:14Z | Gửi duyệt QT | submit-workflow 2xx + wi | **201** `HRM-REC-WF-200` wi=`36292db7-…` | pass |
| 8 | 17:46:19Z | F5 requisitions | stamp + wi | pending_approval + wi | pass |
| 9 | 17:46:30Z | Inbox stamp → Xử lý nhanh → Duyệt | complete 2xx matching wi | **201** `XBOS-WF-200` `requisition_approval` · card gone · status `open` | pass |

## Cases

| id | type | status | notes |
|----|------|--------|-------|
| A | fail-deep empty JD | pass | dialog kept |
| B | success HDSD HP+AP | pass | full FE chain after BE fix |
| C | BR-PO-REC-LGX-01 DRIVER_LEAD | pass | picker+assert holding · persist trsport |

## Incidents

| id | severity | expected | actual | residual_wi |
|----|----------|----------|--------|-------------|
| INC-HARNESS-CREATE-FALSE-BLOCK | P3 | detect POST 201 create | first harness exit 2 after Lưu disabled check on closed dialog | fixed via cont script; not product defect |

## Summary

| passed | failed | blocked | skipped | ack_status |
|--------|--------|---------|---------|------------|
| 9 | 0 | 0 | 0 | PASS_TO_PM |
