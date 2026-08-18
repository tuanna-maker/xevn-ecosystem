# Test execution log — `R-SPINE-MGR-HIER-01-QA-DEVICE-JMOB05-R2`

| Field | Value |
|-------|--------|
| **log_id** | `TEL-R-SPINE-MGR-HIER-01-QA-DEVICE-JMOB05-R2-20260803` |
| **work_item_id** | `R-SPINE-MGR-HIER-01-QA-DEVICE-JMOB05-R2` |
| **tester** | qa-device |
| **started_at** | 2026-08-03T16:03:46.269Z |
| **ended_at** | 2026-08-03T16:10:58.802Z |
| **environment** | emulator-5554 · `vn.xevn.hrm.mobile` 1.0.0 · host API `:28001` · emu `10.0.2.2:28001` · APK SHA256 `AB93DA36…F5AB` |
| **hdsd_sot** | Mobile ManagerApprovals Nghỉ phép · Duyệt · confirm Duyệt đơn |
| **spec_ref** | FR-UC-H03 · J-MOB-05 · BR-MOB-MGR-REPORTS-01 · Option A |
| **machine_log** | `docs/qa/evidence/r-spine-mgr-hier-01-qa-device-jmob05-r2-test-log.json` |
| **hdsd_align** | true |
| **u65_zero_seed** | true |
| **verdict** | pass |
| **evidence_narrative** | `docs/qa/evidence/r-spine-mgr-hier-01-qa-device-jmob05-r2.md` |

## Chronological steps

| seq | time | action (HDSD) | expected | actual | network | result | attachment |
|-----|------|---------------|----------|--------|---------|--------|------------|
| 1 | 16:03:46Z | L0 + preflight manager unlock + leave | is_manager=true · pending≥1 · hierarchy_ok | roles=employee,manager · home_is_manager=true · leave total=2 · ac9db485 alive | POST mobile/login · GET leave-requests · GET home/summary | pass | `_preflight.json` |
| 2 | 16:03:xxZ | adb install -r qa-device APK | Success | Success | — | pass | APK hash in narrative |
| 3 | 16:06:47Z | Deep-link login `uat.nv0001` → Trang chủ | manager path available | hit Trang chủ · tile «Duyệt» | POST mobile/login 200 | pass | `home-uat.nv0001.png` |
| 4 | 16:07:00Z | Tap `home-action-tile-approve` | ManagerApprovals Nghỉ phép ≥1 | Phê duyệt · Nghỉ phép (2) · not Thông báo-only | — | pass | `30-approvals.png` / `f20-approvals.png` |
| 5 | 16:07:54Z | Wave1 Duyệt tap (incomplete confirm) | Confirm dialog | Dialog «Duyệt đơn?» shown; substring tap missed button | — | fail | `41-after-duyet.png` |
| 6 | 16:10:17Z | Finish: reopen Approvals → Duyệt UAT NV 0003 | Confirm dialog | Dialog + button Duyệt | — | pass | `f40-confirm.png` |
| 7 | 16:10:44Z | Confirm Duyệt button | FE success · leave cleared | «Đã duyệt đơn nghỉ phép» · Nghỉ phép (1) | approve API 2xx (UI) | pass | `f50-after-confirm.png` |
| 8 | 16:10:51Z | F5 pull refresh | Submitter row gone | UAT NV 0003 gone · leaveAfter=1 | GET leave pending total=1 · ac9db485 cleared | pass | `f60-f5.png` · `_finish.json` |
| 9 | — | ceo as L1 / seed / Option C | not used | not used | — | pass | — |

## Case matrix results

| Case | id | status | notes |
|------|-----|--------|-------|
| A fail deep | prior emp lock → Thông báo | pass (closed) | PERSONA-LOCK unlock verified live |
| B success HDSD | ManagerApprovals Duyệt → F5 | pass | ac9db485 API+UI cleared |
| C logic BR | FR-UC-H03 + BR-MOB-MGR-REPORTS-01 + U65 | pass | direct_manager L1; not ceo |

## Incidents

| id | severity | expected | actual | residual_wi |
|----|----------|----------|--------|-------------|
| INC-JMOB05-R2-CONFIRM-MISS | P3 harness | Confirm tap hits Duyệt button | Wave1 matched non-clickable «Xác nhận…» text | none — finished in `_finish.json` |

## Summary

| passed | failed | blocked | skipped |
|--------|--------|---------|---------|
| 8 | 1 (harness mid-step, recovered) | 0 | 0 |

**ack_status:** PASS_TO_PM  
**SoT:** `_vibe-team-os/31-WORLD-STANDARD-TEST-LOG.md`
