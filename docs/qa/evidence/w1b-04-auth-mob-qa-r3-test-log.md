# Test execution log — W1-B-04-AUTH-MOB-QA-R3

| Field | Value |
|-------|--------|
| **log_id** | `TEL-W1B-04-AUTH-MOB-QA-R3-20260803` |
| **work_item_id** | `W1-B-04-AUTH-MOB-QA-R3` |
| **tester** | qa-device · emulator-5554 drive `_drive-r3.js` + manual Scope tap |
| **started_at** | `2026-08-03T14:09:24+07:00` |
| **ended_at** | `2026-08-03T14:13:18+07:00` |
| **environment** | device `emulator-5554` · APK `vn.xevn.hrm.mobile` lastUpdate `2026-08-03 20:56:48` · SHA256 `E71EC1AB2AD4F0740949CC33014D95F9DEB251CA9C81FF5734FF0BB3230A0758` · HRM `http://10.0.2.2:28001` (adb reverse) · host metrics **200** |
| **hdsd_sot** | Login password → Hồ sơ → Cài đặt → Phạm vi công ty → «Đang dùng» |
| **spec_ref** | J-MOB-01 · FR-UC-M01 · W1-B-04-AUTH-MOB AC2 |
| **hdsd_align** | true |
| **u65_zero_seed** | true |
| **anti_idle** | true — real taps (submit×2, OK, Hồ sơ, Cài đặt, Phạm vi công ty); not idle home |
| **machine_log** | `docs/qa/evidence/w1b-04-auth-mob-qa-r3-test-log.json` |
| **evidence_narrative** | `docs/qa/evidence/w1b-04-auth-mob-qa-r3.md` |
| **verdict** | **pass** |

**SoT:** `_vibe-team-os/31-WORLD-STANDARD-TEST-LOG.md` · project `docs/qa/WORLD_STANDARD_TEST_LOG.md`

## Chronological steps

| seq | time (+07) | action (HDSD) | expected | actual | network | result | attachment |
|-----|------------|---------------|----------|--------|---------|--------|------------|
| 1 | 21:09:24 | L0 — adb devices + APK lastUpdate + metrics | emulator online; APK 2026-08-03; HRM 200 | emulator-5554; lastUpdate 20:56:48; metrics 200; SHA match | GET metrics 200 | pass | — |
| 2 | 21:09:32 | `pm clear` + launch MainActivity | Login screen | XeVN HRM login visible | — | pass | `screenshots/w1b-04-auth-mob-qa-r3/00-launch.png` |
| 3 | 21:10:22 | Login ready dump | Email/password/Đăng nhập | fields `login-email` / `login-password` / `login-submit` | — | pass | `01-login-ready.png` |
| 4 | 21:10:35 | Set URL máy chủ | `http://10.0.2.2:28001` | URL field updated | — | pass | `02-url-set.png` |
| 5 | 21:10:57 | Case A fill bad creds | email+password filled | `bad.user@xe.vn` / wrong-password-999 | — | pass | `10-case-a-filled.png` |
| 6 | 21:11:04 | Case A tap Đăng nhập | Auth fail alert VI | Alert `HRM-AUTH-401: Email hoặc mật khẩu không đúng` | POST mobile login → 401 (device) | pass | `11-case-a-fail.png` |
| 7 | 21:11:05 | Tap OK dismiss | Return login | Alert dismissed | — | pass | — |
| 8 | 21:11:30 | Case B fill good creds | persona UAT filled | `uat.nv0001@xe.vn` / `xevn-uat-2026` | — | pass | `20-case-b-filled.png` |
| 9 | 21:11:41 | Case B tap Đăng nhập | Home + VI company label | Home Nguyễn Văn An · Tập đoàn X.E | POST login 2xx (device) | pass | `21-case-b-home.png` |
| 10 | 21:11:48 | Tap tab Hồ sơ | Profile screen | Hồ sơ + Cài đặt row | — | pass | `30-profile.png` |
| 11 | 21:11:54 | Tap Cài đặt | Settings | Phạm vi đang dùng + Điều hướng nhanh | — | pass | `31-settings.png` |
| 12 | 21:12:48 | Scroll + tap Phạm vi công ty | Scope screen | Navigated to Phạm vi công ty | — | pass | — |
| 13 | 21:13:02 | Assert AC2 «Đang dùng» labels | company/tenant/role/job_title labels; NOT `Tenant: xevn` | Công ty Tập đoàn X.E · Pháp nhân Tập đoàn XeVN · Vai trò Nhân viên · Chức danh Nhân viên; stale colon absent (`Tenant key` DEV only) | — | pass | `40-scope.png` · `40-scope-labels.txt` |

**Click count:** ≥8 distinct taps (anti-idle PASS).

## Case matrix results

| Case | id | status | notes |
|------|-----|--------|-------|
| A fail deep | CASE-A | pass | 401 alert VI · `11-case-a-fail.png` |
| B success HDSD | CASE-B | pass | Home labels VI · password UF |
| C logic BR / AC2 Scope | CASE-C-AC2 | pass | Four labels on «Đang dùng»; closes R2 FAIL |
| AC1 multi-membership toast | AC1 | skipped | n=1 persona · U65 |
| AC4 select-membership JWT | AC4 | skipped | n=1 · OU filter only |

## Incidents

| id | severity | expected | actual | residual WI |
|----|----------|----------|--------|-------------|
| — | — | — | none blocking AC2 | — |
| R-M01-MULTI-PERSONA | P2 | AC1/AC4 device proof | skipped single membership | pm / BA account prep |
| R-M01-DEV-META | P3 | optional hide DEV wire lines | `Tenant key` / Query / Header still under labels | dev-mobile optional |

## Summary

| passed | failed | blocked | skipped |
|--------|--------|---------|---------|
| 13 | 0 | 0 | 2 |

**ack_status (source wave):** PASS_TO_PM
