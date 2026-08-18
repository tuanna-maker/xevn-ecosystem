# Evidence — W1-B-04-AUTH-MOB-QA-R2

| Field | Value |
| --- | --- |
| **work_item_id** | W1-B-04-AUTH-MOB-QA-R2 |
| **role** | qa-device |
| **date** | 2026-08-03 |
| **window** | 20:21:50 → 20:35:39 +07:00 |
| **J-*** | **J-MOB-01** / FR-UC-M01 |
| **hdsd_align** | true — Login → Hồ sơ → Cài đặt → Phạm vi công ty |
| **U65** | **PASS** — no `pnpm seed:*`, no DB/API fake mutate |
| **persona** | `uat.nv0001@xe.vn` / `xevn-uat-2026` |
| **device** | `emulator-5554` · AVD `xevn_api34` · `boot_completed=1` |
| **API** | `http://10.0.2.2:28001` (adb reverse → host `:28001`) · metrics/root **200** |
| **artifact under test** | installed package `vn.xevn.hrm.mobile` **v1.0.0** · `lastUpdateTime=2026-07-31 10:35:31` |
| **ack_status** | **FAIL_TO_PM** |

## entry_criteria

| Criterion | Result |
| --- | --- |
| adb `emulator-5554` device | ✅ |
| hrm `:28001` metrics/root 200 | ✅ |
| prior R1 BLOCKED-DEVICE | ✅ cleared for adb |
| Expo/Metro for latest W1-B-04 JS | ❌ Metro via Expo Go **404** — see blocker |
| W1-B-04 sources on device APK | ❌ APK dated **2026-07-31** (pre AUTH-MOB 2026-08-03) |

## Click path (device — not idle splash)

1. **20:22:16** — `am start` `vn.xevn.hrm.mobile/.MainActivity` → splash XeVN + ProgressBar (`00-launch`, UI dump ImageView `XeVN`).
2. **20:23:35** — cached session landed Home (not Login) → `01-login-ready` mislabeled; UI texts Home.
3. **20:24:17** — `pm clear vn.xevn.hrm.mobile` → Login screen (`03-after-clear-data`, `04-login-screen`).
4. **20:28:44** — set URL `http://10.0.2.2:28001` · Case A fill `bad.user@xe.vn` (`16-case-a-ready`).
5. **20:28:50** — Case A submit → Alert **`HRM-AUTH-401: Email hoặc mật khẩu không đúng`** (`17-case-a-fail`).
6. **20:29:18** — Case B fill `uat.nv0001@xe.vn` / `xevn-uat-2026` (`19-case-b-filled`).
7. **20:29:58** — Case B submit → Home **Nguyễn Văn An** · header **Tập đoàn X.E** (not slug `holding`) (`23-case-b-submit`).
8. **20:31:57** — Hồ sơ (`28-tap-profile-coords`) → **20:33:17** Cài đặt (`33-settings`).
9. **20:33:58** — Phạm vi công ty Scope (`38-scope-full`, `39-scope-labels-closeup`).
10. **20:35:04** — Expo Go attempt for W1-B-04 bundle → redbox 404 (`40-expo-attempt`).

Screenshots dir: `docs/qa/evidence/screenshots/w1b-04-auth-mob-qa-r2/`

## AC matrix

| # | AC | Device result | Notes |
| --- | --- | --- | --- |
| 1 | Login toast multi-membership = `company_label` VI | ⬜ **N/A device** | Live login `memberships.length=1` for `uat.nv0001` — toast branch not entered. U65 forbids seed multi-membership. |
| 2 | Scope «Đang dùng»: company/tenant/role/job_title **labels** | ❌ **FAIL** | UI shows **old** card: `Công ty: Tập đoàn X.E` + **`Tenant: xevn`** + **`Query company_id: holding`** + **`Header x-company-id: holding`**. Missing W1-B-04 lines `Pháp nhân` / `Vai trò` / `Chức danh`. Matches pre-2026-08-03 ScopeScreen, not current `ScopeScreen.tsx` (labels + `__DEV__` keys only). |
| 3 | List titles = company_label; save alert labels | ⬜ **PARTIAL** | Settings summary shows `Công ty (phạm vi): Tập đoàn X.E` · `Vai trò: Nhân viên`. Scope OU list titles are VI company names. Save-alert path not exercised (single membership / no select). |
| 4 | select-membership switches JWT scope | ❌ **FAIL / BLOCKED-PERSONA** | `n=1` membership from BE; Scope shows **operating-unit filter**, not membership picker. Cannot prove JWT switch on device. |
| 5 | U65 zero-seed + screenshots | ✅ | Evidence screenshots after each major action. |
| 6 | Expo/Metro if required | ❌ **BLOCKED** | Expo Go loads Metro but **404** `index.ts.bundle` — `Unable to resolve module ./index.ts from C:\xevn-ecosystem\apps\mobile\hrm-mobile/.` (subst/path Metro root broken). |

## Case detail

### Case A — bad creds (PASS)

- URL: `http://10.0.2.2:28001`
- Email: `bad.user@xe.vn` · bad password
- Result UI: `Lỗi | HRM-AUTH-401: Email hoặc mật khẩu không đúng | OK`
- Screenshot: `17-case-a-fail.png` · **20:28:50 +07**

### Case B — success labels (PARTIAL)

- Email: `uat.nv0001@xe.vn` · `xevn-uat-2026`
- Home header company display: **Tập đoàn X.E** (VI; not raw `holding`)
- Multi-membership toast: **not shown** (API `n=1`)
- BE probe (read-only, same persona): `company_label=Tập đoàn X.E`, `tenant_label=Tập đoàn XeVN`, `role_label=Nhân viên`, `job_title_label=Nhân viên`
- Screenshot: `23-case-b-submit.png` · **20:29:58 +07**

### Case C — Scope / select-membership (FAIL)

- Path: Hồ sơ → Cài đặt → Phạm vi công ty
- «Đang dùng» on **installed APK** exposes raw `xevn` / `holding` — **not** W1-B-04 four-label bind
- Screenshot: `38-scope-full.png` · **20:33:58 +07**
- select-membership JWT switch: **not executable** (single membership)

## Expo / Metro blocker (concrete)

| Item | Value |
| --- | --- |
| Metro | listening `:8081` (pid observed) · started from `Z:\apps\mobile\hrm-mobile` |
| Expo Go | installed `host.exp.exponent` |
| Error | development server **404** · `Unable to resolve module ./index.ts` · path `C:\xevn-ecosystem\apps\mobile\hrm-mobile` (broken subst/junction vs canonical NFD repo) |
| Screenshot | `40-expo-attempt.png` |
| Impact | Cannot load **2026-08-03** AUTH-MOB JS on device within session |

## Diff vs source (spec says / code on device)

| Layer | Spec / current source | Device APK (2026-07-31) |
| --- | --- | --- |
| Scope «Đang dùng» | `Công ty` / `Pháp nhân` / `Vai trò` / `Chức danh` from BE `*_label` | `Tenant: xevn` + wire `holding` debug lines always visible |
| APK age | W1-B-04-AUTH-MOB 2026-08-03 | lastUpdate **2026-07-31** |

## Residual

| id | Note | Owner |
| --- | --- | --- |
| **W1-B-04-AUTH-MOB-QA-R3** | Ship **debug/release APK** (or fixed Expo entry on ASCII path) built **after** W1-B-04-AUTH-MOB; retest AC2–4 on device | **dev-mobile** → qa-device |
| **R-M01-MULTI-PERSONA** | No live multi-membership mobile account (`n=1` for UAT NV + probed CEOs) — AC1 toast + AC4 JWT switch blocked without seed (U65) | pm / BA / devops account prep **without** seed-for-QA cheat |
| R-M01-LOCKOUT-COL | unchanged OPEN | BA/SA |

## completion_report

Device UF executed on `emulator-5554` (not idle splash): Case A **PASS** (401 alert); Case B login **PASS** with home VI company **Tập đoàn X.E**; Scope opened with screenshots. **AC2 FAIL** — installed APK **2026-07-31** still shows raw `Tenant: xevn` / `holding` on «Đang dùng», not W1-B-04 four-label UI. Expo Go path **BLOCKED** (Metro 404 `index.ts`). AC1/AC4 blocked by single-membership persona + stale APK. U65 honored. **Not** READY_FOR_QC.

## next_owner

**dev-mobile** (APK/Expo entry fix) → **qa-device** R3

## next_dispatch_prompt

```text
work_item_id: W1-B-04-AUTH-MOB-BUILD-01
role: dev-mobile
priority: P0
mission: Unblock device UF for W1-B-04 — deliver installable artifact with AUTH-MOB sources (2026-08-03+).
entry_criteria:
  - docs/qa/evidence/w1b-04-auth-mob-qa-r2.md FAIL_TO_PM
  - emulator-5554 available
exit_criteria:
  - release or debug APK path documented OR Expo start from ASCII path resolves index bundle 200
  - install on emulator-5554; Scope «Đang dùng» shows Pháp nhân/Vai trò/Chức danh (not Tenant:xevn / holding wire as primary)
  - evidence docs/qa/evidence/w1b-04-auth-mob-build-01.md
  - READY_FOR_QA → qa-device W1-B-04-AUTH-MOB-QA-R3
cấm: seed · claim UF PASS without device labels
```

## ack_status

**FAIL_TO_PM**
