# Test execution log — U78-U84-PRIMARY-REC-REQ-VISUN-01

| Field | Value |
|-------|--------|
| **schema** | `xevn-test-log/v1` |
| **log_id** | `TEL-U78-U84-PRIMARY-REC-REQ-VISUN-01-20260804` |
| **work_item_id** | `U78-U84-PRIMARY-REC-REQ-VISUN-01` |
| **tester** | qa · qa-subagent-u78-rec-req-visun-01 |
| **started_at** | 2026-08-03T18:16:56.436Z |
| **ended_at** | 2026-08-03T18:19:34.066Z |
| **verdict** | **pass** |
| **hdsd_align** | true |
| **u65_zero_seed** | true |
| **evidence_narrative** | `docs/qa/evidence/u78-u84-primary-rec-req-visun-01.md` |
| **machine log** | [`u78-u84-primary-rec-req-visun-01-test-log.json`](u78-u84-primary-rec-req-visun-01-test-log.json) |

## Environment

- portal: `http://127.0.0.1:5173`
- hrm-api: `http://127.0.0.1:28001/api/hrm`
- xbos-api: `http://127.0.0.1:28002/api/xbos`
- commit: `dc930c5`
- persona: `ceo@xe.vn` · `companyId=logistics` · OU Du lịch Visun

## Spec / HDSD

- TC-HIM-REC-REQ-VISUN-HP-001 · TC-HIM-REC-REQ-VISUN-AP-001
- HIM §5.2 · PO_WF_CATALOG_COMPANY_MATRIX §1 CO-VISUN / §2 P-REC-REQ
- Precond TC-WFM-REC-REQ-HP-001 · HDV / điều hành tour (OPS_MANAGER proxy)
- D-U84 holding catalog assert pattern reused for logistics

## Chronological steps

| seq | at | action | expected | actual | result |
|-----|-----|--------|----------|--------|--------|
| 1 | 18:16:56Z | L0 + API probe WF/JD/req @ logistics | WF active; catalog usable | WF active `6f17062a-…`; emp=0; job_titles n=8 OPS_MANAGER | pass |
| 2 | 18:17:00Z | Login → jd-library `companyId=logistics` · OU Visun | mount + Thêm JD | mount + OU Visun | pass |
| 3 | 18:17:10Z | FD empty JD submit | dialog kept | dialog kept | pass |
| 4 | 18:17:40Z | Thêm JD HDV stamp / OPS_MANAGER → Lưu | POST 201 (not JD-POS) | **201** `HRM-REC-JD-201` id=`acecf190-…` | pass |
| 5 | 18:17:50Z | F5 JD library | stamp row | stampOnList=true | pass |
| 6 | 18:18:20Z | Thêm YCTD → Lưu | POST requisitions 201 | **201** `HRM-REC-201` id=`6d2d71ad-…` | pass |
| 7 | 18:18:40Z | Gửi duyệt QT | submit-workflow 2xx + wi | **201** `HRM-REC-WF-200` wi=`2b4f0d9c-…` | pass |
| 8 | 18:18:50Z | F5 requisitions | stamp + wi | pending_approval + wi | pass |
| 9 | 18:19:28Z | Inbox stamp → Xử lý nhanh → F5 | complete 2xx; ≠ tài xế; card gone | **201** `XBOS-WF-200` · card gone · status `open` · notTaiXe | pass |

## Cases

| id | type | status | notes |
|----|------|--------|-------|
| A | fail-deep empty JD | pass | dialog kept |
| B | success HDSD HP+AP | pass | full FE chain @ CO-VISUN |
| C | BR HDV ≠ tài xế | pass | OPS_MANAGER + HDV stamp; AP notTaiXe=true |

## Incidents

| id | severity | expected | actual | residual_wi |
|----|----------|----------|--------|-------------|
| INC-HDV-TITLE-PROXY | P2 | optional dedicated HDV_* catalog code | AS-IS uses OPS_MANAGER; stamp carries HDV context | R-U84-REC-REQ-VISUN-HDV-TITLE-PROXY |

## Summary

| passed | failed | blocked | skipped | ack_status |
|--------|--------|---------|---------|------------|
| 9 | 0 | 0 | 1 (fd_req empty SKIP) | PASS_TO_PM |
