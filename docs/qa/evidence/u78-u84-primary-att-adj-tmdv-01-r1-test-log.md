# Test execution log — U78-U84-PRIMARY-ATT-ADJ-TMDV-01-R1

| Field | Value |
|-------|--------|
| **log_id** | `TEL-U78-U84-PRIMARY-ATT-ADJ-TMDV-01-R1-20260804` |
| **work_item_id** | `U78-U84-PRIMARY-ATT-ADJ-TMDV-01-R1` |
| **tester** | qa · browser Playwright |
| **started_at** | `2026-08-03T17:58:28.233Z` |
| **ended_at** | `2026-08-03T17:59:25.717Z` |
| **environment** | portal `http://127.0.0.1:5173` · hrm `:28001` · xbos `:28002` · commit `dc930c5` |
| **hdsd_sot** | HRM Chấm công → **Quản lý đơn** → **Đề nghị cập nhật công** → Thêm đề nghị → Thêm mới · (AP) mgr Eye → Duyệt · XBOS inbox N/A · HIM §5.5 |
| **spec_ref** | TC-HIM-ATT-TMDV-HP-001 / AP-001 · HIM §5.5 · FN-REQ-UPD-CRUD · UC-HRM-09 · MOB-ATTENDANCE XREF |
| **machine_log** | `docs/qa/evidence/u78-u84-primary-att-adj-tmdv-01-r1-test-log.json` |
| **narrative** | `docs/qa/evidence/u78-u84-primary-att-adj-tmdv-01-r1.md` |
| **hdsd_align** | true |
| **u65_zero_seed** | true |

## Chronological steps

| seq | time | action (HDSD) | expected | actual | network | result | attachment |
|-----|------|---------------|----------|--------|---------|--------|------------|
| 1 | 17:58:28Z | L0 + probe employees/update-requests @ trsport | staff ≥1; list 200 | emp total=4; mgr VTH-0002; list total=0 | GET employees/update-requests **200** | pass | raw api_probes |
| 2 | 17:58:29Z | Login `ceo@xe.vn` → `/hr/attendance?companyId=trsport` + OU TM-DV | Attendance mount · OU member | OU «Thương mại và Dịch vụ X.E» | — | pass | `01-attendance-mount.png` |
| 3 | 17:58:35Z | **Quản lý đơn** → **Đề nghị cập nhật công** | SCR-REQ-UPDATE · Thêm đề nghị | mountOk · addVisible | GET update-requests **200** | pass | `02-update-request-tab.png` |
| 4 | 17:58:40Z | Fail-deep: Thêm đề nghị empty required | no POST / dialog kept | fdBlocked=true | no POST | pass | `03-create-dialog.png` |
| 5 | 17:58:46Z | Fill VTH-0007 · date · Quên chấm · reason STAMP → **Thêm mới** | POST create **201** + ISO times | POST **201** `HRM-ATT-REQ-201` id=`41387eda-…` · `requested_*=…T…Z` · bareHhmm=false · STAMP=`TMDV-ATT-DJ8ZUX` | POST update-requests **201** | pass | `04-form-filled` · `05-after-create` |
| 6 | 17:58:57Z | F5 pending row STAMP (CEO @ trsport) | pending row visible | stampOnUi=false · ceo+trsport list 0 · row pending via ceo+main / mgr | GET update-requests?company_id=trsport **200** rowCount=0 | fail | `06-f5-list.png` |
| 7 | 17:59:05Z | AP mgr `uat.nv0002` → list pending | see STAMP · Eye | seesStamp=true · GET trsport hasStamp=true | GET update-requests **200** | pass | `07-mgr-list.png` |
| 8 | 17:59:11Z | Eye → **Duyệt** | approve 2xx · status approved | POST **409** `SCOPE_CONTEXT_MISMATCH` | POST …/41387eda-…/approve **409** | fail | `08-detail` · `09-after-approve` |
| 9 | 17:59:20Z | F5 after approve | approved | still pending | GET **200** hitStatus=pending | fail | `10-f5-after-approve` |
| 10 | 17:59:25Z | XBOS inbox AP observe | N/A until bridge | not asserted | — | skipped | — |

## Case matrix results

| Case | id | status | notes |
|------|-----|--------|-------|
| A fail deep | empty required | pass | |
| B success HDSD | create→F5 | fail | create+ISO pass; CEO F5 empty (scope) |
| C logic BR | approve | fail | mgr FE Duyệt 409 |

## Incidents

| id | severity | expected | actual | residual WI |
|----|----------|----------|--------|-------------|
| R-U84-ATT-ADJ-TMDV-LIST-SCOPE-SLUG | P0 | CEO F5 pending @ trsport | list 0 / UUID row hidden | U78-U84-ATT-ADJ-TMDV-SCOPE-PARITY-01 |
| R-U84-ATT-ADJ-TMDV-AP-SCOPE-HEADER | P0 | mgr Duyệt 2xx | FE 409 SCOPE_CONTEXT_MISMATCH; L1 needs `x-company-id` | U78-U84-ATT-ADJ-TMDV-SCOPE-PARITY-01 |

## Summary

| passed | failed | blocked | skipped |
|--------|--------|---------|---------|
| 6 | 3 | 0 | 1 |

**verdict:** fail  
**ack_status:** PASS_TO_PM  
**SoT:** `_vibe-team-os/31-WORLD-STANDARD-TEST-LOG.md`
