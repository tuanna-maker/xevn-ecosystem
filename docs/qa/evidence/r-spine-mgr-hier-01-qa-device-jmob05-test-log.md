# Test execution log — `R-SPINE-MGR-HIER-01-QA-DEVICE-JMOB05`

| Field | Value |
|-------|--------|
| **log_id** | `TEL-R-SPINE-MGR-HIER-01-QA-DEVICE-JMOB05-20260803` |
| **work_item_id** | `R-SPINE-MGR-HIER-01-QA-DEVICE-JMOB05` |
| **tester** | qa-device |
| **started_at** | 2026-08-03T15:46:04.184Z |
| **ended_at** | 2026-08-03T15:53:48.577Z |
| **environment** | emulator-5554 · `vn.xevn.hrm.mobile` 1.0.0 · host API `:28001` · emu `10.0.2.2:28001` · APK SHA256 `AB93DA36…F5AB` |
| **hdsd_sot** | Mobile FAB Tạo đơn nghỉ · ManagerApprovals Nghỉ phép · Duyệt |
| **spec_ref** | FR-UC-H03 · J-MOB-05 · `r-spine-mgr-hier-01.md` Option A |
| **machine_log** | `docs/qa/evidence/r-spine-mgr-hier-01-qa-device-jmob05-test-log.json` |
| **hdsd_align** | true |
| **u65_zero_seed** | true |
| **verdict** | fail |
| **evidence_narrative** | `docs/qa/evidence/r-spine-mgr-hier-01-qa-device-jmob05.md` |

## Chronological steps

| seq | time | action (HDSD) | expected | actual | network | result | attachment |
|-----|------|---------------|----------|--------|---------|--------|------------|
| 1 | 15:46:04Z | L0 + preflight hierarchy / persona | manager_id set · holding UUID · leave probe | hierarchy_ok · UUID holding · leave_pending_mgr≥1 · nv0001 roles=employee is_manager=false · mobile_persona=emp | GET employees + leave-requests + home/summary 200 | pass | `_preflight.json` |
| 2 | 15:48:15Z | adb install -r qa-device APK | Success | Success · pkg vn.xevn.hrm.mobile | — | pass | APK hash in narrative |
| 3 | 15:48:44Z | Deep-link login `uat.nv0003` → Trang chủ | home markers | hit Trang chủ | POST mobile/login 200 | pass | `home-uat.nv0003.png` · `r-home-uat.nv0003.png` |
| 4 | 15:52:44Z | FAB → Tạo đơn nghỉ | create wizard | on create 4 bước | — | pass | `r11-fab.png` · `r12-step0.png` |
| 5 | 15:52:54Z | Chọn Nghỉ không lương → Gửi đơn | FE success + pending under mgr | «Đã được gửi thành công» · leave `ac9db485-…` unpaid pending · mgr filter fromSub=1 | GET leave-requests mgr filter 200 · total=2 | pass | `r18-after.png` · `_retry.json` |
| 6 | 15:53:41Z | Deep-link login `uat.nv0001` → Trang chủ | manager persona / Duyệt tile | roles=employee · tile label «Việc» | POST mobile/login 200 | fail | `r-home-uat.nv0001.png` |
| 7 | 15:53:48Z | Tap `home-action-tile-approve` | ManagerApprovals Nghỉ phép ≥1 | **Thông báo** inbox · no manager-approvals-screen | — | fail | `r30-pathA.png` |
| 8 | 15:50:42Z | FAB / Profile approvals entry (wave1) | manager approvals CTA | fabHasApprovals=false · no profile-approvals-entry | — | fail | `33-fab.png` · `35-profile.png` |
| 9 | — | Duyệt 2xx → F5 queue clear | Thành công · queue clear | not reached | — | blocked | — |
| 10 | — | ceo as L1 / seed / Option C | not used | not used | — | pass | — |

## Case matrix results

| Case | id | status | notes |
|------|-----|--------|-------|
| A fail deep | J-MOB-05 tile without manager JWT | fail (expected fail path) | Thông báo instead of ManagerApprovals |
| B success HDSD | submit → Duyệt → F5 | fail | submit pass; Duyệt blocked |
| C logic BR | FR-UC-H03 direct_manager + U65 | pass | filter lists UAT-0003; persona lock is product defect |

## Incidents

| id | severity | expected | actual | residual WI |
|----|----------|----------|--------|-------------|
| INC-JMOB05-PERSONA-LOCK | P0 | uat.nv0001 with reports opens ManagerApprovals | JWT emp lock · tile→Thông báo | `R-SPINE-MGR-HIER-01-PERSONA-LOCK` |
| INC-LEAVE-BALANCE-0 | P2 | annual balance usable | UI 0/0 — used unpaid | optional data |

## Summary

| passed | failed | blocked | skipped |
|--------|--------|---------|---------|
| 5 | 3 | 1 | 0 |

**ack_status:** FAIL_TO_PM  
**SoT:** `_vibe-team-os/31-WORLD-STANDARD-TEST-LOG.md`
