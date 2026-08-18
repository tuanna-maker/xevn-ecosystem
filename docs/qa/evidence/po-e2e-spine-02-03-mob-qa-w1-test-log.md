# Test execution log — PO-E2E-SPINE-02-03-MOB-QA-W1

| Field | Value |
|-------|--------|
| **log_id** | `TEL-PO-E2E-SPINE-02-03-MOB-QA-W1` |
| **work_item_id** | `PO-E2E-SPINE-02-03-MOB-QA-W1` |
| **tester** | qa-device · composer subagent |
| **started_at** | 2026-08-03T14:41:50+07:00 |
| **ended_at** | 2026-08-03T22:04:00+07:00 |
| **environment** | emulator-5554 · hrm `127.0.0.1:28001` / emu `10.0.2.2:28001` · pkg `vn.xevn.hrm.mobile` |
| **hdsd_sot** | Mobile ESS leave/FAB · ManagerApprovals · SPINE program §2–3 |
| **spec_ref** | FR-UC-H03 · J-MOB-03/05/07/23..29 · J-MOB-02 · PO SPINE-02 LV-01 · SPINE-03 AT-01 |
| **U65_zero_seed** | true |
| **machine_log** | `docs/qa/evidence/po-e2e-spine-02-03-mob-qa-w1-test-log.json` |
| **narrative** | `docs/qa/evidence/po-e2e-spine-02-03-mob-qa-w1.md` |

## Chronological steps

| seq | time (UTC) | action (HDSD) | expected | actual | network | result | attachment |
|-----|------------|---------------|----------|--------|---------|--------|------------|
| 1 | 14:41:50 | Deep-link login NV dual API base | home markers | `Trang chủ` · UUID holding | POST `/auth/mobile/login` 201 | pass | `screens/.../01-home.xml` |
| 2 | 14:45:20 | Home → Nghỉ phép tile | leave list | list opened; row → detail Chờ duyệt | GET leave-requests | pass | `12-leave-list.xml` · `22-leave-list-after.xml` |
| 3 | 14:51:31 | FAB Thao tác nhanh → Tạo đơn nghỉ | wizard Bước 1 | on create; Tiếp tục disabled | — | pass | `62-fab-sheet.png` · `63-create-step0.xml` |
| 4 | 14:51:44 | Fail-deep: next without ready date | next disabled / blocked | `leave-create-next` enabled=false | — | pass | `_lv-create-log.json` LV-FAIL |
| 5 | 14:52:01 | Date → Tiếp tục → loại phép năm → Gửi | submit confirm | wizard through Bước 4 | — | pass | `66-step1.xml` · `69-step3.xml` |
| 6 | 14:53:xx | Confirm «Gửi đơn» despite 0 balance warn | toast success | «Đã gửi đơn» / thành công | POST leave-requests 2xx (device) | pass | `76-post-confirm.xml` · `.png` |
| 7 | 14:54:xx | API assert pending row | status pending | id `403a68d3-…` pending · reason Xin nghỉ từ mobile | GET leave-requests 200 | pass | (probe during run) |
| 8 | 14:55–15:03 | AT-01 find Đơn công / late create | CreateUpdateRequest | no entry Home/Profile/Settings/FAB | — | blocked | `_at-mgr-finish.json` · `_at-hub-log.json` · `145-settings.xml` |
| 9 | 14:56:41 | Login ceo@xe.vn | manager home | home_reached | POST login 201 | pass | `100-mgr-home.xml` |
| 10 | 14:56:56 | Open Phê duyệt | pending ≥1 leave | Nghỉ phép (0) empty | GET leave-requests?manager_employee_id → 0 | blocked | `103-approvals.xml` · `_late-mgr-log.json` |
| 11 | — | LV-02 L2 ladder | days→level AC | BA matrix missing | — | blocked | SPEC_GAP |

## Case matrix results

| Case | id | status | notes |
|------|-----|--------|-------|
| A fail deep | LV step0 / balance warn | pass | next disabled; confirm warns 0 balance |
| B success HDSD | LV-01 submit | pass | FE toast + pending API |
| B success HDSD | LV-01 approve | blocked | manager hierarchy filter |
| B success HDSD | AT-01 late | blocked | no nav to create update |
| C logic BR | LV-02 L2 | blocked | SPEC_GAP — no day ladder |

## Incidents

| id | severity | expected | actual | residual WI |
|----|----------|----------|--------|-------------|
| INC-MGR-HIER-0 | P0 | QL sees NV leave in Phê duyệt | total=0 with manager_employee_id | R-SPINE-MGR-HIER-01 |
| INC-AT-NAV-0 | P1 | Employee can open Đơn công | surface missing from IA | R-SPINE-AT-NAV-01 |
| INC-API-FLAP | P2 | hrm :28001 stable | EADDRINUSE / brief DOWN mid-wave | devops observe |

## Summary

| passed | failed | blocked | skipped |
|--------|--------|---------|---------|
| 6 | 0 | 3 | 0 |

**ack_status:** PASS_TO_PM  
**SoT:** `_vibe-team-os/31-WORLD-STANDARD-TEST-LOG.md`
