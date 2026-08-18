# Test execution log — `R-SPINE-MGR-HIER-01-QA`

| Field | Value |
|-------|--------|
| **log_id** | `TEL-R-SPINE-MGR-HIER-01-QA` |
| **work_item_id** | `R-SPINE-MGR-HIER-01-QA` |
| **tester** | qa-device |
| **started_at** | 2026-08-03T22:11:00+07:00 |
| **ended_at** | 2026-08-03T22:26:00+07:00 |
| **environment** | emulator-5554 · `vn.xevn.hrm.mobile` 1.0.0 · host API `:28001` · emu `10.0.2.2:28001` · company UUID holding |
| **hdsd_sot** | Mobile HDSD tiles · FAB · Đội nhóm · Phê duyệt/Thông báo |
| **spec_ref** | FR-UC-H03 · J-MOB-05 · PO SPINE-02 LV-01 · `r-spine-mgr-hier-01.md` Option A |
| **machine_log** | `docs/qa/evidence/r-spine-mgr-hier-01-qa-test-log.json` |
| **u65_zero_seed** | true |

## Chronological steps

| seq | time | action (HDSD) | expected | actual | network | result | attachment |
|-----|------|---------------|----------|--------|---------|--------|------------|
| 1 | 22:11:42Z | L0 API login `uat.nv0001@xe.vn` | 2xx + emp HLD-0001 | emp `3796d949-…` · UUID holding | POST `/api/hrm/auth/mobile/login` 200 | pass | `_session-uat.nv0001.json` |
| 2 | 22:12:24Z | Probe leave `manager_employee_id`=HLD-0001 | total≥0 if reports have pending | **total=0** | GET leave-requests + `company_id=holding` 200 | pass | `_leave-probe-final.json` |
| 3 | 22:12:50Z | Page all holding employees · filter `manager_id` | ≥1 report of HLD-0001 | scanned **43** · with_manager_id **0** · reports **0** | GET `/api/hrm/employees?company_id=holding` 200 | **blocked** | `_discovery.json` · `_reports-probe.json` |
| 4 | 22:13:57Z | Device deep-link login → Trang chủ | home markers | hit `Trang chủ` · tiles include approve+team | deep-link + login | pass | `home-uat.nv0001.png` |
| 5 | 22:14:04Z | Tap Đội nhóm / `home-action-tile-team` | directory loads | team markers + rows (~55KB xml) | — | pass | `10-team.png` |
| 6 | 22:14:30Z | First nav to approve (from team) | ManagerApprovals | nav miss (null hit) | — | blocked | `21-approvals.xml` |
| 7 | 22:20:40Z | Relogin · tap `home-action-tile-approve` | ManagerApprovals Nghỉ phép | **Thông báo** · «Đơn nghỉ phép mới» unread list (inbox ≠ L1 list) | — | blocked | `72-approvals.png` · `_approve-finish.json` |
| 8 | 22:25:00Z | Reconfirm leave probe | mgr filter still 0 | mgr **0** / unfiltered **28** | GET leave-requests 200 | pass | `_leave-probe-final.json` |
| 9 | 22:25:30Z | Stop Option A (BA §2.3) | handoff Option B if 0 reports | **BLOCKED** · no seed · no ceo L1 | — | blocked | `r-spine-mgr-hier-01-qa.md` |

## Case matrix results

| Case | id | status | notes |
|------|-----|--------|-------|
| A fail deep | LV-01 wrong persona (ceo) | skipped | Prior wave; this run cấm ceo |
| B success HDSD | J-MOB-05 Duyệt Option A | **blocked** | 0 reports under HLD-0001 |
| C logic BR | BR-LEAVE-MGR-01 / BR-U65-01 | pass | Filter total=0 with 0 edges; U65 honored |

## Incidents

| id | severity | expected | actual | residual WI |
|----|----------|----------|--------|-------------|
| INC-MGR-HIER-0-REPORTS | P0 | ≥1 holding NV with manager_id=HLD-0001 | 0/43 | `R-SPINE-MGR-HIER-01-BE-FE` |
| INC-APPROVE-TILE-INBOX | P2 | tile opens ManagerApprovals | opens Thông báo inbox | optional FE/IA after Option B |
| INC-HRM-WATCH-TS2345 | P1 | `dev:hrm-api` watch compiles | TS2345 line 750 — used `start:prod` dist | `dev-be` |

## Summary

| passed | failed | blocked | skipped |
|--------|--------|---------|---------|
| 5 | 0 | 3 | 1 |

**ack_status:** BLOCKED  
**SoT:** `_vibe-team-os/31-WORLD-STANDARD-TEST-LOG.md`
