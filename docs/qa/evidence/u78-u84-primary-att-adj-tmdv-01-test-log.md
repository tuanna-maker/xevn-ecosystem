# Test execution log — U78-U84-PRIMARY-ATT-ADJ-TMDV-01

| Field | Value |
|-------|--------|
| **log_id** | `TEL-U78-U84-PRIMARY-ATT-ADJ-TMDV-01-20260804` |
| **work_item_id** | `U78-U84-PRIMARY-ATT-ADJ-TMDV-01` |
| **tester** | qa · browser Playwright |
| **started_at** | `2026-08-03T17:40:13.000Z` |
| **ended_at** | `2026-08-03T17:40:35.325Z` |
| **environment** | portal `http://127.0.0.1:5173` · hrm `:28001` · xbos `:28002` · commit `dc930c5` |
| **hdsd_sot** | HRM Chấm công → **Quản lý đơn** → **Đề nghị cập nhật công** → Thêm đề nghị → Thêm mới · (AP) Eye → Duyệt · XBOS inbox N/A |
| **spec_ref** | TC-HIM-ATT-TMDV-HP-001 / AP-001 · HIM §5.5 · FN-REQ-UPD-CRUD · UC-HRM-09 · MOB-ATTENDANCE XREF |
| **machine_log** | `docs/qa/evidence/u78-u84-primary-att-adj-tmdv-01-test-log.json` |
| **narrative** | `docs/qa/evidence/u78-u84-primary-att-adj-tmdv-01.md` |
| **hdsd_align** | true |
| **u65_zero_seed** | true |

## Chronological steps

| seq | time | action (HDSD) | expected | actual | network | result | attachment |
|-----|------|---------------|----------|--------|---------|--------|------------|
| 1 | 17:40:13Z | L0 + probe employees/update-requests @ trsport | staff ≥1; list 200 | emp total=4; mgr VTH-0002; list total=0 | GET employees/update-requests **200** | pass | raw api_probes |
| 2 | 17:40:16Z | Login `ceo@xe.vn` → `/hr/attendance?companyId=trsport` + OU TM-DV | Attendance mount · OU member | OU «Thương mại và Dịch vụ X.E» | — | pass | `01-attendance-mount.png` |
| 3 | 17:40:20Z | **Quản lý đơn** → **Đề nghị cập nhật công** | SCR-REQ-UPDATE · Thêm đề nghị | mountOk · addVisible | GET update-requests **200** | pass | `02-update-request-tab.png` |
| 4 | 17:40:22Z | Fail-deep: Thêm đề nghị empty required | no POST / dialog kept | fdBlocked=true | no POST | pass | `03-create-dialog.png` |
| 5 | 17:40:25Z | Fill VTH-0007 · date · Quên chấm · reason STAMP → **Thêm mới** | POST create **201** pending | POST **500** `HRM-SYS-001` timestamptz `"08:00"` · body `requested_check_in=08:00` | POST update-requests **500** | fail | `04-form-filled` · `05-after-create` |
| 6 | 17:40:30Z | F5 pending row STAMP | pending row visible | skipped — create failed | — | blocked | — |
| 7 | 17:40:32Z | AP HRM web Eye → Duyệt | approve 2xx · F5 approved | skipped — no pending from FE | — | blocked | — |
| 8 | 17:40:33Z | XBOS inbox AP observe | N/A until bridge | not asserted (honest) | — | skipped | — |

## Case matrix results

| Case | id | status | notes |
|------|-----|--------|-------|
| A fail deep | empty required | pass | |
| B success HDSD | create→F5 | fail | HH:mm wire 500 |
| C logic BR | approve | blocked | depends on B |

## Incidents

| id | severity | expected | actual | residual WI |
|----|----------|----------|--------|-------------|
| R-U84-ATT-ADJ-TMDV-TIME-WIRE-01 | P0 | FE Thêm mới → 201 pending | 500 invalid timestamptz `"08:00"` | U78-U84-ATT-ADJ-TMDV-TIME-WIRE-01 |

## Summary

| passed | failed | blocked | skipped |
|--------|--------|---------|---------|
| 4 | 1 | 2 | 1 |

**verdict:** fail  
**ack_status:** PASS_TO_PM  
**SoT:** `_vibe-team-os/31-WORLD-STANDARD-TEST-LOG.md`
