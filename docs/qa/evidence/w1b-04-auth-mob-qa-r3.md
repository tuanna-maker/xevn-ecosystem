# Evidence — W1-B-04-AUTH-MOB-QA-R3

| Field | Value |
| --- | --- |
| **work_item_id** | W1-B-04-AUTH-MOB-QA-R3 |
| **role** | qa-device |
| **date** | 2026-08-03 |
| **window** | 21:09:24 → 21:13:18 +07:00 |
| **J-*** | **J-MOB-01** / FR-UC-M01 |
| **hdsd_align** | true — Login → Hồ sơ → Cài đặt → Phạm vi công ty |
| **U65** | **PASS** — no `pnpm seed:*`, no DB/API fake mutate |
| **persona** | `uat.nv0001@xe.vn` / `xevn-uat-2026` |
| **device** | `emulator-5554` · AVD online · `boot_completed` |
| **API** | `http://10.0.2.2:28001` (adb reverse → host `:28001`) · metrics **200** |
| **artifact under test** | `vn.xevn.hrm.mobile` v1.0.0 · `lastUpdateTime=2026-08-03 20:56:48` · SHA256 `E71EC1AB2AD4F0740949CC33014D95F9DEB251CA9C81FF5734FF0BB3230A0758` |
| **supersedes** | QA-R2 stale APK `lastUpdateTime=2026-07-31 10:35:31` |
| **test_log** | `docs/qa/evidence/w1b-04-auth-mob-qa-r3-test-log.md` + `.json` |
| **ack_status** | **PASS_TO_PM** |

## entry_criteria

| Criterion | Result |
| --- | --- |
| APK path `apps/mobile/hrm-mobile/dist/hrm-mobile-qa-device.apk` | ✅ |
| SHA256 `E71EC1AB…0758` | ✅ match host APK |
| `lastUpdateTime` 2026-08-03 20:56:48 (not 2026-07-31) | ✅ |
| `emulator-5554` device | ✅ |
| hrm `:28001` metrics 200 | ✅ |
| build-01 READY_FOR_QA | ✅ `docs/qa/evidence/w1b-04-auth-mob-build-01.md` |
| U65 zero-seed | ✅ password UF only |

## Click path (device — anti-idle)

1. **21:09:32** — `pm clear` + `am start` MainActivity → Login (`00-launch`, `01-login-ready`).
2. **21:10:22** — set URL `http://10.0.2.2:28001` (`02-url-set`).
3. **21:10:57** — Case A fill `bad.user@xe.vn` / wrong password (`10-case-a-filled`).
4. **21:11:04** — Case A submit → Alert **`HRM-AUTH-401: Email hoặc mật khẩu không đúng`** (`11-case-a-fail`) → tap OK.
5. **21:11:30** — Case B fill `uat.nv0001@xe.vn` / `xevn-uat-2026` (`20-case-b-filled`).
6. **21:11:41** — Case B submit → Home **Nguyễn Văn An** · header **Tập đoàn X.E** (`21-case-b-home`).
7. **21:11:48** — tap tab **Hồ sơ** (`30-profile`).
8. **21:11:54** — tap **Cài đặt** (`31-settings`).
9. **21:12:48** — scroll «Điều hướng nhanh» → **Phạm vi công ty** clear of tab bar → tap (540,1337).
10. **21:13:02** — Scope «Đang dùng» four labels (`40-scope`, `41-scope-dang-dung`).

Screenshots dir: `docs/qa/evidence/screenshots/w1b-04-auth-mob-qa-r3/`

## HDSD inventory (U76)

| Screen / control | Used |
| --- | --- |
| Login — Email (`login-email`) | ✅ |
| Login — Mật khẩu (`login-password`) | ✅ |
| Login — Đăng nhập (`login-submit`) | ✅ Case A + B |
| Login — URL máy chủ | ✅ set `:28001` |
| Alert Lỗi / OK | ✅ Case A dismiss |
| Home header company label | ✅ observed |
| Tab Hồ sơ | ✅ |
| Hồ sơ → Cài đặt | ✅ |
| Cài đặt → Phạm vi công ty | ✅ |
| Scope «Đang dùng» card | ✅ AC2 |

## AC matrix

| # | AC | Device result | Notes |
| --- | --- | --- | --- |
| 1 | Login toast multi-membership = `company_label` VI | ⬜ **N/A device** | Live login `memberships.length=1` for `uat.nv0001` — toast branch not entered. U65 forbids seed multi-membership. |
| 2 | Scope «Đang dùng»: company/tenant/role/job_title **labels** | ✅ **PASS** | **Công ty: Tập đoàn X.E** · **Pháp nhân: Tập đoàn XeVN** · **Vai trò: Nhân viên** · **Chức danh: Nhân viên**. Stale R2 primary `Tenant: xevn` **absent**. `__DEV__` lines `Tenant key` / Query / Header remain (build-01 accepted). |
| 3 | List titles = company_label; save alert labels | ✅ **PASS (observed)** | Settings summary VI company; Scope OU list titles VI (`Tập đoàn XeVN`, …). Save-alert / select path not exercised (single membership). |
| 4 | select-membership switches JWT scope | ⬜ **N/A / BLOCKED-PERSONA** | `n=1`; Scope = operating-unit filter, not membership picker. |
| 5 | U65 zero-seed + screenshots | ✅ | Real taps; chronological test-log. |

## Case detail

### Case A — bad creds (PASS)

- URL: `http://10.0.2.2:28001`
- Email: `bad.user@xe.vn` · password `wrong-password-999`
- Result UI: `Lỗi | HRM-AUTH-401: Email hoặc mật khẩu không đúng | OK`
- Screenshot: `11-case-a-fail.png` · **21:11:04 +07**

### Case B — success + Scope labels (PASS)

- Email: `uat.nv0001@xe.vn` · `xevn-uat-2026`
- Home: **Nguyễn Văn An** · **Tập đoàn X.E** (not slug `holding`)
- Scope «Đang dùng»: four `*_label` lines present — closes R2 AC2 FAIL
- Screenshots: `21-case-b-home.png` · `40-scope.png` · labels `40-scope-labels.txt`

## Diff vs QA-R2

| Layer | QA-R2 (stale APK 2026-07-31) | QA-R3 (APK E71EC1AB · 2026-08-03 20:56:48) |
| --- | --- | --- |
| Scope «Đang dùng» | `Tenant: xevn` + wire holding as primary | **Pháp nhân / Vai trò / Chức danh** from BE labels |
| APK age | FAIL entry | ✅ fresh build-01 artifact |

## Residual

| id | Note | Owner |
| --- | --- | --- |
| R-M01-MULTI-PERSONA | AC1 toast + AC4 JWT switch need multi-membership persona (U65 no seed) | pm / BA / account prep |
| R-M01-DEV-META | Scope card still shows `__DEV__` Tenant key / Query / Header under labels — not AC2 fail; optional hide for release UX | dev-mobile (P3) |
| R-M01-LOCKOUT-COL | unchanged OPEN if still tracked | BA/SA |

## completion_report

Closed W1-B-04-AUTH-MOB-QA-R3 on `emulator-5554` with APK SHA **E71EC1AB…** (`lastUpdateTime=2026-08-03 20:56:48`). Password UF executed (not idle): Case A **PASS** (401 alert); Case B login **PASS**; Scope «Đang dùng» shows **Công ty / Pháp nhân / Vai trò / Chức danh** — **AC2 PASS** vs R2 `Tenant: xevn`. U65 + hdsd_align + anti_idle + U78 test-log md/json. AC1/AC4 N/A (single membership). **Not** claiming Phase 1 / product UAT DONE.

## next_owner

**pm** — intake PASS; optional QC if wave gate needs device AC2 closure; residual multi-persona separate.

## next_dispatch_prompt

```text
work_item_id: W1-B-04-AUTH-MOB-QA-R3
role: pm
priority: P0
mission: Intake qa-device PASS_TO_PM — AC2 Scope four-label closed on APK E71EC1AB. Decide QC promote for J-MOB-01 AC2 slice OR open R-M01-MULTI-PERSONA account prep (no seed) for AC1/AC4.
entry_criteria:
  - docs/qa/evidence/w1b-04-auth-mob-qa-r3.md PASS_TO_PM
  - test_log md+json present
exit_criteria:
  - bus INTAKE + next Task (qc or residual persona)
cấm: seed · claim Phase 1 DONE from this device slice alone
evidence_path: docs/qa/evidence/w1b-04-auth-mob-qa-r3.md
```

## ack_status

**PASS_TO_PM**
