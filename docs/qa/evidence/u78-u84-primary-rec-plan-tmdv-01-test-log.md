# Test execution log — U78-U84-PRIMARY-REC-PLAN-TMDV-01

| Field | Value |
|-------|--------|
| **log_id** | `TEL-U78-U84-PRIMARY-REC-PLAN-TMDV-01-20260803` |
| **work_item_id** | `U78-U84-PRIMARY-REC-PLAN-TMDV-01` |
| **tester** | qa · browser Playwright |
| **started_at** | `2026-08-03T17:01:40.000Z` (approx HP start) / AP-retarget `2026-08-03T17:16:36.486Z` |
| **ended_at** | `2026-08-03T17:16:50.000Z` |
| **environment** | portal `http://127.0.0.1:5173` · hrm `:28001` · xbos `:28002` · commit `dc930c5` |
| **hdsd_sot** | HRM Tuyển dụng → **Kế hoạch** → Tạo kế hoạch → Gửi duyệt QT · CC Hộp thư → Xử lý nhanh |
| **spec_ref** | TC-HIM-REC-PLAN-TMDV-HP-001 / AP-001 · HIM §5.1 · PO_WF_CATALOG_COMPANY_MATRIX §2 P-REC-PLAN · TC-WFM-REC-PLAN-HP-001 precond |
| **machine_log** | `docs/qa/evidence/u78-u84-primary-rec-plan-tmdv-01-test-log.json` |
| **narrative** | `docs/qa/evidence/u78-u84-primary-rec-plan-tmdv-01.md` |
| **hdsd_align** | true |
| **u65_zero_seed** | true |

## Chronological steps

| seq | time | action (HDSD) | expected | actual | network | result | attachment |
|-----|------|---------------|----------|--------|---------|--------|------------|
| 1 | 17:01:40Z | L0 + probe employees/plans/WF def | trsport staff; plan def active | emp total=4; def `hrm_recruitment_plan_approval` active | GET employees/plans/defs **200** | pass | raw api_probes |
| 2 | 17:01:45Z | Login `ceo@xe.vn` → `/hr/recruitment?tab=plans&companyId=trsport` | Plans mount · Tạo CTA | mountOk · createVisible | — | pass | `01-plans-tab.png` |
| 3 | 17:01:50Z | OU filter → TM-DV X.E | Đang xem member OU | «Công ty Cổ phần Thương mại và Dịch vụ X.E» | — | pass | `01-plans-tab.png` |
| 4 | 17:01:55Z | Fail-deep: Tạo kế hoạch empty title | validation / no create | dialog kept / required hint | no POST | pass | `02-create-dialog.png` |
| 5 | 17:02:00Z | Fill logistics KH · Tạo kế hoạch | POST create 2xx · row | plan `69d5888d-…` title STAMP | POST **201** `HRM-REC-PLAN-201` | pass | `03`–`04-after-create.png` |
| 6 | 17:02:05Z | Eye → Chi tiết | Detail + Gửi duyệt QT | CTA visible · dept Lái xe | — | pass | `05-plan-detail.png` |
| 7 | 17:02:08Z | **Gửi duyệt QT** | submit-workflow 2xx · wi · toast | wi `1c7b5a7d-…` · toast Inbox | POST **201** `HRM-REC-PLAN-WF-200` | pass | `06-after-submit.png` |
| 8 | 17:02:12Z | F5 list/detail | stamp + pending / wi | stampOnList · wi set | GET plans **200** hasStamp | pass | `07-f5-list` · `08-f5-detail` |
| 9 | 17:02:15Z | Inbox observe card STAMP | card recruitment plan | card visible | GET tasks **200** | pass | `09-inbox.png` |
| 10 | 17:02:15Z | *(false AP)* unscoped Duyệt/complete | plan card gone | **wrong** tasks completed; plan card **remained** | POST complete **201**×2 non-plan | fail | `10`–`11` — not promoted |
| 11 | 17:16:37Z | AP-retarget: **Xử lý nhanh** on STAMP card | complete plan task | task `e5c3b2d9-…` `plan_approval` | POST **201** `XBOS-WF-200` | pass | `12`–`13` |
| 12 | 17:16:45Z | Inbox F5 + API plan | card gone · plan approved | stamp absent · `status=approved` | GET tasks/plans **200** | pass | `14-ap-inbox-f5.png` |

## Case matrix results

| Case | id | status | notes |
|------|-----|--------|-------|
| A fail deep | empty title | pass | |
| B success HDSD | HP+AP | pass | CO-TMDV Primary |
| C logic BR | wi + inbox + approved | pass | |

## Incidents

| id | severity | expected | actual | residual WI |
|----|----------|----------|--------|-------------|
| R-U84-REC-PLAN-AP-CLICK-SCOPE-01 | P2 | Only plan task completed | First AP burst + one collateral complete on other instance during retarget | R-U84-REC-PLAN-AP-CLICK-SCOPE-01 |

## Summary

| passed | failed | blocked | skipped |
|--------|--------|---------|---------|
| 11 | 1 (false AP superseded) | 0 | 0 |

**verdict:** pass  
**ack_status:** PASS_TO_PM  
**SoT:** `_vibe-team-os/31-WORLD-STANDARD-TEST-LOG.md`
