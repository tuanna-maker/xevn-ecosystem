# Test execution log — U78-U84-PRIMARY-ATT-ADJ-TMDV-01-R2

| Field | Value |
|-------|--------|
| **log_id** | `TEL-U78-U84-PRIMARY-ATT-ADJ-TMDV-01-R2-20260804` |
| **work_item_id** | `U78-U84-PRIMARY-ATT-ADJ-TMDV-01-R2` |
| **tester** | qa · browser Playwright |
| **started_at** | `2026-08-03T18:10:30.474Z` |
| **ended_at** | `2026-08-03T18:11:27.722Z` |
| **environment** | portal `http://127.0.0.1:5173` · hrm `:28001` · xbos `:28002` · commit `dc930c5` |
| **hdsd_sot** | HRM Chấm công → **Quản lý đơn** → **Đề nghị cập nhật công** → Thêm đề nghị → Thêm mới · (AP) mgr Eye → Duyệt · XBOS inbox N/A · HIM §5.5 |
| **spec_ref** | TC-HIM-ATT-TMDV-HP-001 / AP-001 · HIM §5.5 · FN-REQ-UPD-CRUD · UC-HRM-09 · BR-PO-ATT-LGX-01 |
| **machine_log** | `docs/qa/evidence/u78-u84-primary-att-adj-tmdv-01-r2-test-log.json` |
| **narrative** | `docs/qa/evidence/u78-u84-primary-att-adj-tmdv-01-r2.md` |
| **hdsd_align** | true |
| **u65_zero_seed** | true |

## Chronological steps

| seq | time | action (HDSD) | expected | actual | network | result | attachment |
|-----|------|---------------|----------|--------|---------|--------|------------|
| 1 | 18:10:30Z | L0 + probe employees/update-requests @ trsport | staff ≥1; list 200 | emp total=4; mgr VTH-0002; list total=8 | GET employees/update-requests **200** | pass | raw api_probes |
| 2 | 18:10:30Z | Login `ceo@xe.vn` → `/hr/attendance?companyId=trsport` + OU TM-DV | Attendance mount · OU member | OU «Thương mại và Dịch vụ X.E» | — | pass | `01-attendance-mount.png` |
| 3 | 18:10:40Z | **Quản lý đơn** → **Đề nghị cập nhật công** | SCR-REQ-UPDATE · Thêm đề nghị | mountOk · addVisible | GET update-requests **200** | pass | `02-update-request-tab.png` |
| 4 | 18:10:43Z | Fail-deep: Thêm đề nghị empty required | no POST / dialog kept | fdBlocked=true | no POST | pass | `03-create-dialog.png` |
| 5 | 18:10:48Z | Fill VTH-0007 · date · Quên chấm · reason STAMP → **Thêm mới** | POST create **201** + ISO times | POST **201** `HRM-ATT-REQ-201` id=`6511d5d2-…` · ISO `T` · bareHhmm=false · STAMP=`TMDV-ATT-DJOH56` | POST update-requests **201** | pass | `04-form-filled` · `05-after-create` |
| 6 | 18:10:59Z | F5 pending row STAMP (CEO @ trsport) | pending row visible | stampOnUi=true · ceoSlugSees=true · status=pending · rowCompany=UUID | GET update-requests?company_id=trsport **200** | pass | `06-f5-list.png` |
| 7 | 18:11:07Z | AP mgr `uat.nv0002` → list pending | see STAMP · Eye | seesStamp=true · GET trsport hasStamp=true hitStatus=pending | GET update-requests **200** | pass | `07-mgr-list.png` |
| 8 | 18:11:14Z | Eye → **Duyệt** | approve 2xx · `x-company-id=trsport` · approved | POST **201** `HRM-ATT-REQ-203` · header `x-company-id=trsport` · status=approved | POST …/6511d5d2-…/approve **201** | pass | `08-detail` · `09-after-approve` |
| 9 | 18:11:23Z | F5 after approve | approved | hitStatus=approved · f5UiApproved=true | GET **200** hitStatus=approved | pass | `10-f5-after-approve` |
| 10 | 18:11:27Z | XBOS inbox AP observe | N/A until bridge | not asserted | — | skipped | — |

## Case matrix results

| Case | id | status | notes |
|------|-----|--------|-------|
| A fail deep | empty required | pass | |
| B success HDSD | create→F5 | pass | CEO F5 pending @ trsport |
| C logic BR | approve | pass | mgr Duyệt 201 + OU header |

## Incidents

*(none — R1 P0 residuals closed)*

## Summary

| passed | failed | blocked | skipped |
|--------|--------|---------|---------|
| 9 | 0 | 0 | 1 |

**verdict:** pass  
**ack_status:** PASS_TO_PM  
**promoted:** TC-HIM-ATT-TMDV-HP-001 · TC-HIM-ATT-TMDV-AP-001  
**SoT:** `_vibe-team-os/31-WORLD-STANDARD-TEST-LOG.md`
