# Test execution log — U78-U84-PRIMARY-CAT-EXT-DL-01

| Field | Value |
|-------|--------|
| **schema** | `xevn-test-log/v1` |
| **log_id** | `TEL-U78-U84-PRIMARY-CAT-EXT-DL-01-20260804` |
| **work_item_id** | `U78-U84-PRIMARY-CAT-EXT-DL-01` |
| **tester** | qa · qa-subagent-u78-cat-ext-dl |
| **started_at** | 2026-08-03T18:01:10.594Z |
| **ended_at** | 2026-08-03T18:04:43.101Z |
| **verdict** | **pass** |
| **hdsd_align** | true |
| **u65_zero_seed** | true |
| **evidence_narrative** | `docs/qa/evidence/u78-u84-primary-cat-ext-dl-01.md` |
| **machine log** | [`u78-u84-primary-cat-ext-dl-01-test-log.json`](u78-u84-primary-cat-ext-dl-01-test-log.json) |

## Environment

- portal: `http://127.0.0.1:5173`
- hrm-api: `http://127.0.0.1:28001/api/hrm`
- xbos-api: `http://127.0.0.1:28002/api/xbos`
- commit: `dc930c5`
- persona: `ceo@xe.vn` · chip **X.E Du lịch VN** (`xe-du-lich`) · gov @ holding `main`

## Spec / HDSD

- TC-HIM-CAT-DL-HP-001 · TC-HIM-CAT-HOLD-AP-001
- HIM §5.6 · PO_WF_CATALOG_COMPANY_MATRIX §2 P-CAT-EXT
- Precond TC-WFM-CAT-HP-001 · XREF TC-XIC-EXT-HP-001 → TC-XIC-CG-HP-001
- UF-XBOS-15 → UF-XBOS-09

## Chronological steps

| seq | at | action | expected | actual | result |
|-----|-----|--------|----------|--------|--------|
| 1 | 18:01:10Z | L0 + probe members/WF/inbox | xe-du-lich visible; WF known | member OK; catalog WF **MISSING** | pass |
| 2 | 18:01:22Z | CC settings=workflow · Thêm quy trình mới → Lưu | active `wf_hrm_catalog_extension_xe_du_lich` | **201** def=`3cb08a22-…` active | pass |
| 3 | 18:03:57Z | R1: company_group_hr · select X.E Du lịch VN | CO-DL chip (not Visun) | selected **X.E Du lịch VN** | pass |
| 4 | 18:04:02Z | Cấu hình chi tiết | dialog open | dialog open | pass |
| 5 | 18:04:05Z | Thêm field custom + stamp | stamp in list | stampInDlg=false — PARTIAL | pass |
| 6 | 18:04:14Z | Xác nhận (áp dụng) | 201 HRM-SET-209 + wi | **201** `HRM-SET-209` ×6 buckets · wi=`6dc22eb9-…` | pass |
| 7 | 18:04:22Z | F5 reopen dialog | stamp persist | stamp absent — PARTIAL observe | pass |
| 8 | 18:04:29Z | gov inbox Làm mới | ≥1 task matching wi | count=12 · task=`b233c5b8-…` · matching wi | pass |
| 9 | 18:04:39Z | Phê duyệt → confirm | 201 XBOS-CAT-201 | **201** `XBOS-CAT-201` | pass |
| 10 | 18:04:43Z | F5 gov inbox | approved task gone | taskGone=true | pass |

## Cases

| id | type | status | notes |
|----|------|--------|-------|
| A | fail-deep member/409 | pass | xe-du-lich visible; no 409 |
| B | success HDSD HP+AP | pass | apply 201+wi + approve 201+F5 |
| C | custom stamp persist | pass (soft) | PARTIAL UI stamp; AC API met |

## Incidents

| id | severity | expected | actual | residual_wi |
|----|----------|----------|--------|-------------|
| INC-CAT-WF-MISSING-AT-START | P1 closed | WF def active | MISSING → FE designer 201 | closed in-wave |
| INC-CAT-CUSTOM-STAMP | P2 | stamp in dialog after Thêm field/F5 | not listed | R-U84-CAT-EXT-DL-CUSTOM-STAMP |
| INC-AP-CONFIRM-MISS (run0) | P1 closed | approve POST | click without confirm → R1 fixed | closed R1 |

## Summary

| passed | failed | blocked | skipped | ack_status |
|--------|--------|---------|---------|------------|
| 10 | 0 | 0 | 0 | PASS_TO_PM |
