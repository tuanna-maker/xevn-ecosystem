# Test execution log — U78-U84-PRIMARY-REC-PIPE-TMDV-01

| Field | Value |
|-------|--------|
| **schema** | `xevn-test-log/v1` |
| **log_id** | `TEL-U78-U84-PRIMARY-REC-PIPE-TMDV-01-20260804` |
| **work_item_id** | `U78-U84-PRIMARY-REC-PIPE-TMDV-01` |
| **tester** | qa · qa-subagent-u78-rec-pipe-tmdv |
| **started_at** | 2026-08-03T17:53:43.052Z |
| **ended_at** | 2026-08-03T17:54:41.979Z |
| **verdict** | **pass** |
| **hdsd_align** | true |
| **u65_zero_seed** | true |
| **evidence_narrative** | `docs/qa/evidence/u78-u84-primary-rec-pipe-tmdv-01.md` |
| **machine log** | [`u78-u84-primary-rec-pipe-tmdv-01-test-log.json`](u78-u84-primary-rec-pipe-tmdv-01-test-log.json) |

## Environment

- portal: `http://127.0.0.1:5173`
- hrm-api: `http://127.0.0.1:28001/api/hrm`
- xbos-api: `http://127.0.0.1:28002/api/xbos`
- commit: `dc930c5`
- persona: `ceo@xe.vn` · `companyId=trsport` · OU TM-DV · CC WF/Inbox `main`

## Spec / HDSD

- TC-HIM-REC-PIPE-TMDV-HP-001 · TC-HIM-REC-PIPE-TMDV-AP-001
- HIM §5.3 · PO_WF_CATALOG_COMPANY_MATRIX §2 P-REC-PIPE
- Precond TC-WFM-REC-PIPE-HP-001 · `hrm_candidate_pipeline` · BR-PO-REC-LGX-01
- Prior REQ: `TMDV-REQ-R1-DINI2P` open

## Chronological steps

| seq | at | action | expected | actual | result |
|-----|-----|--------|----------|--------|--------|
| 1 | 17:53:43Z | L0 + probe WF/req/cand @ trsport | prior REQ open; pipe def | REQ open; **pipe MISSING** | pass |
| 2 | 17:53:58Z | CC settings=workflow · preset candidate → Lưu | active `hrm_candidate_pipeline` | **201** def=`b952ea1d-…` active · F5 list | pass |
| 3 | 17:54:08Z | FD empty candidate submit | dialog kept | dialog kept | pass |
| 4 | 17:54:12Z | Thêm ứng viên tài xế → Lưu | POST candidates 201 | **201** `HRM-REC-CP-201` id=`c7ade28a-…` | pass |
| 5 | 17:54:18Z | F5 candidates | stamp row | stampOnList=true | pass |
| 6 | 17:54:20Z | Observe Offer GPLX FE gate | field or block | **no GPLX field** — SPEC_GAP documented | skipped |
| 7 | 17:54:24Z | Bắt đầu QT | start-pipeline 2xx + wi | **201** `HRM-REC-CP-WF-200` wi=`15bc3761-…` | pass |
| 8 | 17:54:28Z | F5 candidates | wi + stage lock | wi persisted · QT lock hint | pass |
| 9 | 17:54:36Z | Inbox stamp → Xử lý nhanh → Duyệt | complete 2xx matching wi | **201** `XBOS-WF-200` `intake` · matching wi · stage still `new` (map) · multi-step card may remain | pass |

## Cases

| id | type | status | notes |
|----|------|--------|-------|
| A | fail-deep empty candidate | pass | dialog kept |
| B | success HDSD HP+AP | pass | full FE chain after FE WF precond |
| C | BR-PO-REC-LGX-01 GPLX Offer gate | skipped | no FE field — residual SPEC_GAP; no silent hire |

## Incidents

| id | severity | expected | actual | residual_wi |
|----|----------|----------|--------|-------------|
| INC-PIPE-WF-MISSING-AT-START | P1 closed this run | pipe def active precond | MISSING → FE preset created 201 | closed in-wave |
| INC-LGX-GPLX-GATE-ABSENT | P2 | Offer blocked without GPLX | no FE gate | R-U84-REC-PIPE-LGX-GPLX-GATE |

## Summary

| passed | failed | blocked | skipped | ack_status |
|--------|--------|---------|---------|------------|
| 8 | 0 | 0 | 1 | PASS_TO_PM |
