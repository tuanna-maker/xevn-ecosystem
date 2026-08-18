# Test execution log — R-SPINE-AT-NAV-01-QA

| Field | Value |
|-------|--------|
| **log_id** | `TEL-R-SPINE-AT-NAV-01-QA` |
| **work_item_id** | `R-SPINE-AT-NAV-01-QA` |
| **tester** | qa-device · composer subagent |
| **started_at** | 2026-08-03T22:11:00+07:00 |
| **ended_at** | 2026-08-03T22:33:30+07:00 |
| **environment** | emulator-5554 · hrm `127.0.0.1:28001` / emu `10.0.2.2:28001` · pkg `vn.xevn.hrm.mobile` · APK SHA256 `ab93da36…33f5ab` |
| **hdsd_sot** | Mobile ESS FAB / home stats / Settings quick nav · AT-01 |
| **spec_ref** | `r-spine-at-nav-01.md` · prior AT-01 BLOCKED `po-e2e-spine-02-03-mob-qa-w1.md` · CreateUpdateRequest |
| **U65_zero_seed** | true |
| **machine_log** | `docs/qa/evidence/r-spine-at-nav-01-qa-test-log.json` |
| **narrative** | `docs/qa/evidence/r-spine-at-nav-01-qa.md` |

## Chronological steps

| seq | time (UTC) | action (HDSD) | expected | actual | network | result | attachment |
|-----|------------|---------------|----------|--------|---------|--------|------------|
| 1 | 15:11 | Build qa-device APK (`android:apk:qa-device`) | bundle has AT-NAV testIDs | BUILD SUCCESSFUL · 71602307 B · testIDs present | — | pass | dist/hrm-mobile-qa-device.apk |
| 2 | 15:18 | `adb install -r` emulator-5554 | Success | Success · lastUpdate 22:18:23 | — | pass | — |
| 3 | 15:20 | Deep-link login NV holding | home Trang chủ · UUID | home_marker Trang chủ · UUID `10000000-…0001` | POST `/auth/mobile/login` **201** | pass | login script stdout |
| 4 | 15:22 / 15:30 | FAB → sheet | leave + đơn công rows | «Tạo đơn nghỉ» + «Tạo đơn công» | — | pass | `r2-fab-sheet.png` · `fab-sheet.xml` |
| 5 | 15:22 / 15:31 | Tap «Tạo đơn công» | CreateUpdateRequest | Đơn công · Loại điều chỉnh · Gửi đơn · HLD-0001 | — | pass | `r2-p1-form.png` · `p1-create-form.png` |
| 6 | 15:27 | Hồ sơ → Cài đặt → «Đơn công» | same create form | form opened | — | pass | `p3-settings.png` · `p3-create-form.png` |
| 7 | 15:31 | Hub «Đi muộn» tap while under FAB | create form | opened FAB sheet (z-order) | — | fail→mitigated | `r2-p2-form.png` (incident) |
| 8 | 15:33 | Scroll late above FAB → tap `attendance-stat-late` | create form | Đơn công form | — | pass | `p2b-seek-1.png` · `p2b-after.png` |
| 9 | — | Optional submit đơn công | API 2xx | not executed (nav-only exit) | — | skipped | — |

## Case matrix results

| Case | id | status | notes |
|------|-----|--------|-------|
| A fail deep | (nav) FAB must_keep leave | pass | «Tạo đơn nghỉ» still listed with đơn công |
| B success HDSD | AT-01 FAB create | pass | CreateUpdateRequest |
| B success HDSD | AT-01 hub Đi muộn | pass | after clear FAB overlap |
| B success HDSD | AT-01 Settings Đơn công | pass | quick nav |
| C logic BR | submit/approve chain | skipped | out of scope this WI |

## Incidents

| id | severity | expected | actual | residual WI |
|----|----------|----------|--------|-------------|
| INC-AT-FAB-OVERLAP | P2 | Tap Đi muộn opens create | When cell under FAB, tap opens Thao tác nhanh | R-SPINE-AT-NAV-FAB-OVERLAP |

## Summary

| passed | failed | blocked | skipped |
|--------|--------|---------|---------|
| 7 | 1 (mitigated by seq8) | 0 | 1 |

**ack_status:** PASS_TO_PM  
**SoT:** `_vibe-team-os/31-WORLD-STANDARD-TEST-LOG.md`
